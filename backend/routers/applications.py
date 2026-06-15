from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status

from database import get_pool
from schemas.application import ApplicationsIn
from services import applications as svc

router = APIRouter()


@router.post("", status_code=status.HTTP_201_CREATED)
async def post_applications(payload: ApplicationsIn, pool=Depends(get_pool)):
    try:
        await svc.insert_applications(pool, payload)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))
    return {"status": "success"}


@router.get("")
async def list_applications(
    username: Optional[str] = Query(None, description="Partial match on username"),
    pool=Depends(get_pool),
):
    try:
        return await svc.get_recent_applications(pool, username=username)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))
