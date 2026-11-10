from __future__ import annotations

import enum
from datetime import datetime
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from ..database.database import get_db
from ..database.repository import IncidentRepository
from ..schemas.incidents import IncidentCreate, IncidentResponse, IncidentSummary
from ..schemas.responses import APIResponse, PaginatedResponse
from ..api.websocket import manager, broadcast_incident_update

router = APIRouter(prefix="/incidents", tags=["incidents"])

@router.get("/", response_model=PaginatedResponse[IncidentSummary])
async def list_incidents(
    limit: int = Query(50, ge=1, le=500),
    offset: int = Query(0, ge=0),
    status: Optional[str] = Query(None),
    min_risk_score: Optional[float] = Query(None, ge=0, le=100),
    db: AsyncSession = Depends(get_db),
):
    incidents: List[IncidentSummary] = await IncidentRepository.list_incidents(db, limit=limit, offset=offset)
    # Simple filtering after fetch for demo purposes
    if status:
        incidents = [i for i in incidents if i.status == status]
    if min_risk_score is not None:
        incidents = [i for i in incidents if i.risk_score >= min_risk_score]
    total_stmt = await db.execute("SELECT COUNT(*) FROM incidents")
    total = total_stmt.scalar_one()
    return PaginatedResponse[IncidentSummary](total=total, limit=limit, offset=offset, items=incidents)

@router.get("/{incident_id}", response_model=IncidentResponse)
async def get_incident(incident_id: str, db: AsyncSession = Depends(get_db)):
    inc = await IncidentRepository.get_incident(db, incident_id)
    if not inc:
        raise HTTPException(status_code=404, detail="Incident not found")
    return inc

@router.patch("/{incident_id}/status", response_model=IncidentResponse)
async def update_incident_status(
    incident_id: str,
    status: str = Query(..., description="New status"),
    db: AsyncSession = Depends(get_db),
):
    inc = await IncidentRepository.update_incident(db, incident_id, {"status": status})
    if not inc:
        raise HTTPException(status_code=404, detail="Incident not found")
    await db.commit()
    # Broadcast update
    await broadcast_incident_update(inc)
    return inc

