from datetime import datetime

import asyncpg

from schemas.loginlogout import LoginLogoutIn


def _compute_session_duration(login_time: str | None, logout_time: str | None) -> float | None:
    if not login_time or not logout_time:
        return None
    try:
        login  = datetime.fromisoformat(login_time)
        logout = datetime.fromisoformat(logout_time)
        delta  = (logout - login).total_seconds()
        return round(delta / 60, 2) if delta >= 0 else None
    except ValueError:
        return None


async def _extended_columns_exist(pool: asyncpg.Pool) -> bool:
    """Check once whether the extended columns from migration 001 are present."""
    row = await pool.fetchrow(
        """
        SELECT COUNT(*) AS cnt
        FROM information_schema.columns
        WHERE table_name = 'login_logout'
          AND column_name = 'login_time'
        """
    )
    return (row["cnt"] or 0) > 0


async def insert_login_logout(pool: asyncpg.Pool, data: LoginLogoutIn) -> None:
    has_extended = await _extended_columns_exist(pool)

    if has_extended:
        session_duration = data.session_duration or _compute_session_duration(
            data.login_time, data.logout_time
        )
        login_time  = datetime.fromisoformat(data.login_time)  if data.login_time  else None
        logout_time = datetime.fromisoformat(data.logout_time) if data.logout_time else None

        await pool.execute(
            """
            INSERT INTO login_logout (
                hostname, username, event_type, event_time,
                login_time, logout_time, session_duration,
                idle_time, screen_lock_time, ip_address,
                failed_login_attempts, status
            )
            VALUES ($1, $2, $3, NOW(), $4, $5, $6, $7, $8, $9, $10, $11)
            """,
            data.hostname,
            data.username,
            data.event_type,
            login_time,
            logout_time,
            session_duration,
            data.idle_time,
            data.screen_lock_time,
            data.ip_address,
            data.failed_login_attempts if data.failed_login_attempts is not None else 0,
            data.status,
        )
    else:
        # Migration 001 not yet applied — insert only the base columns
        await pool.execute(
            """
            INSERT INTO login_logout (hostname, username, event_type, event_time)
            VALUES ($1, $2, $3, NOW())
            """,
            data.hostname,
            data.username,
            data.event_type,
        )


async def get_recent_events(
    pool: asyncpg.Pool,
    hostname: str | None = None,
    username: str | None = None,
    status:   str | None = None,
    limit: int = 50,
) -> list[dict]:
    has_extended = await _extended_columns_exist(pool)

    conditions: list[str] = []
    params:     list      = []

    if hostname:
        params.append(f"%{hostname}%")
        conditions.append(f"hostname ILIKE ${len(params)}")

    if username:
        params.append(f"%{username}%")
        conditions.append(f"username ILIKE ${len(params)}")

    if status and has_extended:
        params.append(status)
        conditions.append(f"status = ${len(params)}")

    where    = f"WHERE {' AND '.join(conditions)}" if conditions else ""
    params.append(limit)
    limit_ph = f"${len(params)}"

    if has_extended:
        rows = await pool.fetch(
            f"""
            SELECT id, hostname, username, event_type, status, ip_address,
                   login_time::text            AS login_time,
                   logout_time::text           AS logout_time,
                   ROUND(session_duration, 2)  AS session_duration_min,
                   ROUND(idle_time, 2)         AS idle_time_min,
                   ROUND(screen_lock_time, 2)  AS screen_lock_min,
                   failed_login_attempts,
                   event_time::text            AS recorded_at
            FROM login_logout
            {where}
            ORDER BY event_time DESC
            LIMIT {limit_ph}
            """,
            *params,
        )
    else:
        # No migration columns yet — derive what we can using window functions:
        #   login_time / logout_time  → from event_type + event_time
        #   session_duration_min      → LEAD() to find the next LOGOUT for same device/user
        #   idle_time_min             → NULL  (needs migration)
        #   screen_lock_min           → NULL  (needs migration)
        #   failed_login_attempts     → 0     (needs migration for accurate count)
        rows = await pool.fetch(
            f"""
            SELECT * FROM (
                SELECT
                    id, hostname, username, event_type,
                    CASE WHEN UPPER(event_type) = 'LOGIN'
                         THEN event_time::text END                           AS login_time,
                    CASE WHEN UPPER(event_type) = 'LOGOUT'
                         THEN event_time::text END                           AS logout_time,
                    CASE
                        WHEN UPPER(event_type) = 'LOGIN'
                         AND UPPER(LEAD(event_type) OVER w) = 'LOGOUT'
                        THEN ROUND(
                            EXTRACT(EPOCH FROM (
                                LEAD(event_time) OVER w - event_time
                            )) / 60, 2)
                    END                                                      AS session_duration_min,
                    NULL::numeric                                            AS idle_time_min,
                    NULL::numeric                                            AS screen_lock_min,
                    0                                                        AS failed_login_attempts,
                    event_time::text                                         AS recorded_at
                FROM login_logout
                WINDOW w AS (PARTITION BY hostname, username ORDER BY event_time)
            ) AS sub
            {where}
            ORDER BY recorded_at DESC
            LIMIT {limit_ph}
            """,
            *params,
        )

    return [dict(r) for r in rows]
