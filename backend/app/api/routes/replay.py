from __future__ import annotations

import datetime
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from ..database.database import get_db
from ..database.repository import ReplaySessionRepository
from ..schemas.responses import APIResponse, ReplaySessionResponse, PaginatedResponse

router = APIRouter(prefix="/replay", tags=["replay"])

@router.get("/incidents", response_model=PaginatedResponse[ReplaySessionResponse])
async def list_replay_sessions(limit: int = 50, offset: int = 0, db: AsyncSession = Depends(get_db)):
    sessions: List[ReplaySessionResponse] = await ReplaySessionRepository.list_sessions(db, limit, offset)
    total = await ReplaySessionRepository.count_sessions(db)
    return PaginatedResponse[ReplaySessionResponse](total=total, limit=limit, offset=offset, items=sessions)

@router.post("/create", response_model=APIResponse)
async def create_replay(incident_id: str, name: Optional[str] = None, db: AsyncSession = Depends(get_db)):
    incident = await ReplaySessionRepository.get_incident(db, incident_id)
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")
    session_data = {
        "name": name or f"Replay of {incident.title}",
        "description": f"Replay generated from incident {incident_id}",
        "status": "READY",
        "created_at": datetime.datetime.utcnow(),
        "event_sequence": [],  # will be filled later
    }
    replay = await ReplaySessionRepository.create_session(db, session_data)
    await db.commit()
    return APIResponse(data={"replay_id": replay.id}, message="Replay session created")

@router.post("/start", response_model=APIResponse)
async def start_replay(session_id: str, db: AsyncSession = Depends(get_db)):
    session = await ReplaySessionRepository.get_session(db, session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Replay session not found")
    if session.status != "READY":
        raise HTTPException(status_code=400, detail="Session not ready to start")
    await ReplaySessionRepository.update_session(db, session_id, {"status": "PLAYING", "started_at": datetime.datetime.utcnow()})
    await db.commit()
    return APIResponse(message="Replay started")

@router.post("/pause", response_model=APIResponse)
async def pause_replay(session_id: str, db: AsyncSession = Depends(get_db)):
    session = await ReplaySessionRepository.get_session(db, session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Replay session not found")
    if session.status != "PLAYING":
        raise HTTPException(status_code=400, detail="Session not playing")
    await ReplaySessionRepository.update_session(db, session_id, {"status": "PAUSED"})
    await db.commit()
    return APIResponse(message="Replay paused")

@router.post("/reset", response_model=APIResponse)
async def reset_replay(session_id: str, db: AsyncSession = Depends(get_db)):
    session = await ReplaySessionRepository.get_session(db, session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Replay session not found")
    await ReplaySessionRepository.update_session(db, session_id, {"status": "READY", "current_position": 0, "started_at": None, "completed_at": None})
    await db.commit()
    return APIResponse(message="Replay reset")

@router.post("/speed", response_model=APIResponse)
async def set_speed(session_id: str, speed: float = 1.0, db: AsyncSession = Depends(get_db)):
    if speed <= 0:
        raise HTTPException(status_code=400, detail="Speed must be positive")
    session = await ReplaySessionRepository.get_session(db, session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Replay session not found")
    await ReplaySessionRepository.update_session(db, session_id, {"speed": speed})
    await db.commit()
    return APIResponse(message=f"Replay speed set to {speed}")

