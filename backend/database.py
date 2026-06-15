import asyncpg
from config import settings

# Set during app startup in main.py lifespan
pool: asyncpg.Pool | None = None


async def create_pool() -> asyncpg.Pool:
    return await asyncpg.create_pool(
        host=settings.db_host,
        port=settings.db_port,
        database=settings.db_name,
        user=settings.db_user,
        password=settings.db_password,
        min_size=2,
        max_size=10,
    )


async def get_pool() -> asyncpg.Pool:
    """FastAPI dependency — injects the connection pool into route handlers."""
    if pool is None:
        raise RuntimeError("Database pool not initialized")
    return pool
