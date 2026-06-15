"""Add extended columns to login_logout table

Revision ID: 001
Revises:
Create Date: 2026-06-15
"""
from alembic import op

revision = "001"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Use IF NOT EXISTS so the migration is safe to run on any state of the table
    op.execute("""
        ALTER TABLE login_logout
            ADD COLUMN IF NOT EXISTS login_time            TIMESTAMP,
            ADD COLUMN IF NOT EXISTS logout_time           TIMESTAMP,
            ADD COLUMN IF NOT EXISTS session_duration      NUMERIC(10, 2),
            ADD COLUMN IF NOT EXISTS idle_time             NUMERIC(10, 2),
            ADD COLUMN IF NOT EXISTS screen_lock_time      NUMERIC(10, 2),
            ADD COLUMN IF NOT EXISTS failed_login_attempts INTEGER NOT NULL DEFAULT 0,
            ADD COLUMN IF NOT EXISTS status                VARCHAR(50)
    """)
    op.execute("CREATE INDEX IF NOT EXISTS idx_login_logout_hostname ON login_logout (hostname)")
    op.execute("CREATE INDEX IF NOT EXISTS idx_login_logout_username ON login_logout (username)")
    op.execute("CREATE INDEX IF NOT EXISTS idx_login_logout_status   ON login_logout (status)")


def downgrade() -> None:
    op.execute("DROP INDEX IF EXISTS idx_login_logout_status")
    op.execute("DROP INDEX IF EXISTS idx_login_logout_username")
    op.execute("DROP INDEX IF EXISTS idx_login_logout_hostname")
    op.execute("""
        ALTER TABLE login_logout
            DROP COLUMN IF EXISTS status,
            DROP COLUMN IF EXISTS failed_login_attempts,
            DROP COLUMN IF EXISTS screen_lock_time,
            DROP COLUMN IF EXISTS idle_time,
            DROP COLUMN IF EXISTS session_duration,
            DROP COLUMN IF EXISTS logout_time,
            DROP COLUMN IF EXISTS login_time
    """)
