from fastapi import APIRouter, Depends, HTTPException

from database import get_pool
from services import dashboard as svc

router = APIRouter()


@router.get("/stats")
async def dashboard_stats(pool=Depends(get_pool)):
    try:
        return await svc.get_stats(pool)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


@router.get("/debug", summary="List all tables and their columns in the monitoring database")
async def dashboard_debug(pool=Depends(get_pool)):
    try:
        tables = await pool.fetch(
            """
            SELECT table_name
            FROM information_schema.tables
            WHERE table_schema = 'public'
              AND table_type = 'BASE TABLE'
            ORDER BY table_name
            """
        )
        result = {}
        for t in tables:
            tname = t["table_name"]
            cols = await pool.fetch(
                "SELECT column_name, data_type FROM information_schema.columns "
                "WHERE table_name = $1 ORDER BY ordinal_position",
                tname,
            )
            row_count = await pool.fetchval(f"SELECT COUNT(*) FROM {tname}")
            result[tname] = {
                "row_count": row_count,
                "columns": [{"name": r["column_name"], "type": r["data_type"]} for r in cols],
            }
        return result
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))
