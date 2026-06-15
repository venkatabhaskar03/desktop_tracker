from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status

from database import get_pool
from schemas.loginlogout import LoginLogoutIn
from services import loginlogout as svc

router = APIRouter()


@router.post("", status_code=status.HTTP_201_CREATED)
async def post_login_logout(payload: LoginLogoutIn, pool=Depends(get_pool)):
    try:
        await svc.insert_login_logout(pool, payload)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))
    return {"status": "success"}


@router.get("")
async def list_login_logout(
    hostname: Optional[str] = Query(None, description="Partial match on hostname"),
    username: Optional[str] = Query(None, description="Partial match on username"),
    status:   Optional[str] = Query(None, description="Exact match on status (active | locked | logged_out | failed)"),
    pool=Depends(get_pool),
):
    try:
        return await svc.get_recent_events(pool, hostname=hostname, username=username, status=status)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))
