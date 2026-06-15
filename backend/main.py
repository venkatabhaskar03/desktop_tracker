from contextlib import asynccontextmanager

from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware

import database
from config import settings
from routers import activity, applications, dashboard, loginlogout, usb


@asynccontextmanager
async def lifespan(app: FastAPI):
    database.pool = await database.create_pool()
    yield
    await database.pool.close()


app = FastAPI(
    title="Laptop Tracker API",
    version="1.0.0",
    description="Monitoring backend — system health, login/logout events, running applications, USB activity.",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(dashboard.router,    prefix="/dashboard",    tags=["Dashboard"])
app.include_router(activity.router,     prefix="/activity",     tags=["Activity"])
app.include_router(loginlogout.router,  prefix="/loginlogout",  tags=["Login/Logout"])
app.include_router(applications.router, prefix="/applications",  tags=["Applications"])
app.include_router(usb.router,          prefix="/usb",           tags=["USB"])


# ── One-time migration endpoint (remove after running) ───────────────────────
@app.post("/admin/run-migration-001", tags=["Admin"], summary="Add extended columns to login_logout")
async def run_migration_001(pool=Depends(database.get_pool)):
    migration_sql = """
ALTER TABLE login_logout
    ADD COLUMN IF NOT EXISTS login_time            TIMESTAMP,
    ADD COLUMN IF NOT EXISTS logout_time           TIMESTAMP,
    ADD COLUMN IF NOT EXISTS session_duration      NUMERIC(10, 2),
    ADD COLUMN IF NOT EXISTS idle_time             NUMERIC(10, 2),
    ADD COLUMN IF NOT EXISTS screen_lock_time      NUMERIC(10, 2),
    ADD COLUMN IF NOT EXISTS ip_address            VARCHAR(45),
    ADD COLUMN IF NOT EXISTS failed_login_attempts INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS status                VARCHAR(50)
"""
    await pool.execute(migration_sql)
    await pool.execute("CREATE INDEX IF NOT EXISTS idx_login_logout_hostname ON login_logout (hostname)")
    await pool.execute("CREATE INDEX IF NOT EXISTS idx_login_logout_username ON login_logout (username)")
    await pool.execute("CREATE INDEX IF NOT EXISTS idx_login_logout_status   ON login_logout (status)")

    rows = await pool.fetch(
        "SELECT column_name FROM information_schema.columns "
        "WHERE table_name = 'login_logout' ORDER BY ordinal_position"
    )
    columns = [r["column_name"] for r in rows]
    return {"status": "migration applied", "columns": columns}
