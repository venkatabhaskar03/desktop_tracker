import asyncpg
from datetime import date

from schemas.activity import ActivityIn


async def insert_activity(pool: asyncpg.Pool, data: ActivityIn) -> None:
    await pool.execute(
        """
        INSERT INTO system_health
            (hostname, username, cpu_usage, ram_usage, disk_usage, idle_minutes)
        VALUES ($1, $2, $3, $4, $5, $6)
        """,
        data.hostname,
        data.username,
        data.cpu,
        data.ram,
        data.disk,
        data.idle,
    )


async def _timestamp_col(pool: asyncpg.Pool) -> str | None:
    """Return the first TIMESTAMP column in system_health, or None."""
    rows = await pool.fetch(
        """
        SELECT column_name FROM information_schema.columns
        WHERE table_name = 'system_health'
          AND data_type IN ('timestamp without time zone', 'timestamp with time zone')
        ORDER BY ordinal_position
        """
    )
    return rows[0]["column_name"] if rows else None


async def get_recent_activity(
    pool: asyncpg.Pool,
    date_from: date | None = None,
    date_to: date | None = None,
    limit: int = 50,
) -> list[dict]:
    ts_col = await _timestamp_col(pool)
    conditions: list[str] = []
    params: list = []

    if ts_col and date_from:
        params.append(date_from)
        conditions.append(f"{ts_col}::date >= ${len(params)}")
    if ts_col and date_to:
        params.append(date_to)
        conditions.append(f"{ts_col}::date <= ${len(params)}")

    where = f"WHERE {' AND '.join(conditions)}" if conditions else ""
    order = f"ORDER BY {ts_col} DESC" if ts_col else "ORDER BY id DESC"
    params.append(limit)

    rows = await pool.fetch(
        f"SELECT * FROM system_health {where} {order} LIMIT ${len(params)}",
        *params,
    )
    return [dict(r) for r in rows]
