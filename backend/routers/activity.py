from datetime import date
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status

from database import get_pool
from schemas.activity import ActivityIn
from services import activity as svc

router = APIRouter()


@router.post("", status_code=status.HTTP_201_CREATED)
async def post_activity(payload: ActivityIn, pool=Depends(get_pool)):
    try:
        await svc.insert_activity(pool, payload)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))
    return {"status": "success"}


@router.get("")
async def list_activity(
    date_from: Optional[date] = None,
    date_to: Optional[date] = None,
    pool=Depends(get_pool),
):
    try:
        return await svc.get_recent_activity(pool, date_from=date_from, date_to=date_to)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))
