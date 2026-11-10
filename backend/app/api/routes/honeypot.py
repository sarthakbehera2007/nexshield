"""REST API Router for Digital Honeypot administration, sessions, and events."""
from __future__ import annotations

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from ...database.database import get_db
from ...honeypot.honeypot_manager import honeypot_manager
from ...honeypot.session_manager import SessionManager
from ...honeypot.schemas import (
    HoneypotStatus,
    HoneypotSessionResponse,
    HoneypotInteractionResponse,
    DecoyServiceType,
)

router = APIRouter(prefix="/honeypot", tags=["honeypot"])


@router.get("/status", response_model=HoneypotStatus)
async def get_honeypot_status(db: AsyncSession = Depends(get_db)):
    return await honeypot_manager.get_status(db)


@router.get("/services")
async def list_services():
    return [
        {
            "service_name": s.value,
            "path": f"/decoys/{s.value.lower()}",
            "description": f"Simulated {s.value} decoy",
            "active": True,
        }
        for s in DecoyServiceType
    ]


@router.get("/sessions", response_model=List[HoneypotSessionResponse])
async def list_sessions(
    status: Optional[str] = Query(None, description="ACTIVE | CLOSED"),
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    db: AsyncSession = Depends(get_db),
):
    sessions = await honeypot_manager.list_sessions(db, status=status, limit=limit, offset=offset)
    return [HoneypotSessionResponse.model_validate(s) for s in sessions]


@router.get("/events", response_model=List[HoneypotInteractionResponse])
async def list_honeypot_events(
    session_id: Optional[str] = Query(None),
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    db: AsyncSession = Depends(get_db),
):
    interactions = await honeypot_manager.list_interactions(db, session_id=session_id, limit=limit, offset=offset)
    return [HoneypotInteractionResponse.model_validate(i) for i in interactions]


@router.post("/sessions/{session_id}/close", response_model=HoneypotSessionResponse)
async def close_session(session_id: str, db: AsyncSession = Depends(get_db)):
    session = await SessionManager.close_session(db, session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Honeypot session not found")
    await db.commit()
    return HoneypotSessionResponse.model_validate(session)

