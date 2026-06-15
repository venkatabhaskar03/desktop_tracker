import asyncpg


async def get_stats(pool: asyncpg.Pool) -> dict:
    # ── Total users: all distinct usernames in devices ────────────────
    total_users = await pool.fetchval(
        "SELECT COUNT(DISTINCT username) FROM devices"
    )

    # ── Active users: online_status = true ────────────────────────────
    active_users = await pool.fetchval(
        "SELECT COUNT(DISTINCT username) FROM devices WHERE online_status = true"
    )

    # ── Total distinct devices ────────────────────────────────────────
    total_devices = await pool.fetchval(
        "SELECT COUNT(DISTINCT hostname) FROM devices"
    )

    # ── Devices synced in last 24 hours (last_sync) ───────────────────
    devices_synced_today = await pool.fetchval(
        "SELECT COUNT(DISTINCT hostname) FROM devices "
        "WHERE last_sync >= NOW() - INTERVAL '24 hours'"
    )

    # ── Non-compliant: devices not synced in last 24 hours ────────────
    non_compliant_devices = await pool.fetchval(
        "SELECT COUNT(DISTINCT hostname) FROM devices "
        "WHERE last_sync < NOW() - INTERVAL '24 hours' "
        "   OR last_sync IS NULL"
    )

    total_val    = int(total_users          or 0)
    active_val   = int(active_users         or 0)
    devices_val  = int(total_devices        or 0)
    synced_val   = int(devices_synced_today or 0)
    noncomp_val  = int(non_compliant_devices or 0)

    return {
        "total_users":           total_val,
        "active_users":          active_val,
        "inactive_users":        max(0, total_val - active_val),
        "total_devices":         devices_val,
        "devices_synced_today":  synced_val,
        "non_compliant_devices": noncomp_val,
    }
