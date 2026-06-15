import sys
import os
from logging.config import fileConfig
from urllib.parse import quote_plus

from sqlalchemy import engine_from_config, pool
from alembic import context

# Make sure backend/ is on the path so we can import config.py
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
from config import settings

config = context.config

if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# Build URL directly — url_encode password to handle special chars like @
DB_URL = (
    f"postgresql+psycopg2://{settings.db_user}:{quote_plus(settings.db_password)}"
    f"@{settings.db_host}:{settings.db_port}/{settings.db_name}"
)


def run_migrations_offline() -> None:
    context.configure(
        url=DB_URL,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )
    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    from sqlalchemy import create_engine
    # Create engine directly to avoid configparser % interpolation issues
    connectable = create_engine(DB_URL, poolclass=pool.NullPool)
    with connectable.connect() as connection:
        context.configure(connection=connection)
        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
