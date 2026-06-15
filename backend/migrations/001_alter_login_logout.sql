-- Migration 001: Extend login_logout table with full session tracking fields
-- Run once against the monitoring database:
--   psql -h 157.151.171.221 -U ritemon -d monitoring -f migrations/001_alter_login_logout.sql

ALTER TABLE login_logout
    ADD COLUMN IF NOT EXISTS login_time            TIMESTAMP,
    ADD COLUMN IF NOT EXISTS logout_time           TIMESTAMP,
    ADD COLUMN IF NOT EXISTS session_duration      NUMERIC(10, 2),  -- total session minutes
    ADD COLUMN IF NOT EXISTS idle_time             NUMERIC(10, 2),  -- idle minutes in session
    ADD COLUMN IF NOT EXISTS screen_lock_time      NUMERIC(10, 2),  -- total minutes screen was locked
    ADD COLUMN IF NOT EXISTS ip_address            VARCHAR(45),     -- IPv4 or IPv6
    ADD COLUMN IF NOT EXISTS failed_login_attempts INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS status                VARCHAR(50);     -- active | locked | logged_out | failed

-- Optional index for fast filter queries on hostname and username
CREATE INDEX IF NOT EXISTS idx_login_logout_hostname ON login_logout (hostname);
CREATE INDEX IF NOT EXISTS idx_login_logout_username ON login_logout (username);
CREATE INDEX IF NOT EXISTS idx_login_logout_status   ON login_logout (status);
