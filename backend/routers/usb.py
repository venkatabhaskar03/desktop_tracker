from fastapi import APIRouter, Depends, HTTPException, status

from database import get_pool
from schemas.usb import USBIn
from services import usb as svc

router = APIRouter()


@router.post("", status_code=status.HTTP_201_CREATED)
async def post_usb(payload: USBIn, pool=Depends(get_pool)):
    try:
        await svc.insert_usb_event(pool, payload)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))
    return {"status": "success"}


@router.get("")
async def list_usb(pool=Depends(get_pool)):
    try:
        return await svc.get_recent_usb_events(pool)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))
