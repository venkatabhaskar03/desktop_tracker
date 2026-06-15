import asyncpg

from schemas.usb import USBIn


async def insert_usb_event(pool: asyncpg.Pool, data: USBIn) -> None:
    await pool.execute(
        """
        INSERT INTO usb_events
            (hostname, username, device_name, serial_number, action, event_time)
        VALUES ($1, $2, $3, $4, $5, NOW())
        """,
        data.hostname,
        data.username,
        data.device_name,
        data.serial_number,
        data.action,
    )


async def get_recent_usb_events(pool: asyncpg.Pool, limit: int = 50) -> list[dict]:
    rows = await pool.fetch(
        """
        SELECT id, hostname, username, device_name, serial_number, action,
               event_time::text AS event_time
        FROM usb_events
        ORDER BY event_time DESC
        LIMIT $1
        """,
        limit,
    )
    return [dict(r) for r in rows]
