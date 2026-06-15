import asyncpg

from schemas.application import ApplicationsIn


async def insert_applications(pool: asyncpg.Pool, data: ApplicationsIn) -> None:
    """Bulk-insert all apps in a single round-trip using executemany."""
    rows = [
        (data.hostname, data.username, app.name, app.cpu, app.memory)
        for app in data.apps
    ]
    await pool.executemany(
        """
        INSERT INTO applications
            (hostname, username, process_name, cpu_usage, memory_usage, capture_time)
        VALUES ($1, $2, $3, $4, $5, NOW())
        """,
        rows,
    )


async def get_recent_applications(
    pool: asyncpg.Pool,
    username: str | None = None,
    limit: int = 50,
) -> list[dict]:
    conditions: list[str] = []
    params:     list      = []

    if username:
        params.append(f"%{username}%")
        conditions.append(f"username ILIKE ${len(params)}")

    where   = f"WHERE {' AND '.join(conditions)}" if conditions else ""
    params.append(limit)
    limit_ph = f"${len(params)}"

    rows = await pool.fetch(
        f"""
        SELECT id, hostname, username, process_name, cpu_usage, memory_usage,
               capture_time::text AS capture_time
        FROM applications
        {where}
        ORDER BY capture_time DESC
        LIMIT {limit_ph}
        """,
        *params,
    )
    return [dict(r) for r in rows]
