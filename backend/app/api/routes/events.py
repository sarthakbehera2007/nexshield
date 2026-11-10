from __future__ import annotations

import json
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from ...database.database import get_db
from ...database.repository import EventRepository
from ...schemas.events import SecurityEventCreate, SecurityEventResponse, SecurityEventFilter, WebSocketMessage
from ...schemas.responses import APIResponse, PaginatedResponse
from ..websocket import manager, broadcast_event

router = APIRouter(prefix="/events", tags=["events"])

@router.get("/", response_model=PaginatedResponse[SecurityEventResponse])
async def list_events(
    limit: int = Query(50, ge=1, le=500),
    offset: int = Query(0, ge=0),
    event_type: Optional[str] = Query(None),
    severity: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    source_ip: Optional[str] = Query(None),
    since: Optional[datetime] = Query(None),
    db: AsyncSession = Depends(get_db),
):
    filters = {
        "event_type": event_type,
        "severity": severity,
        "status": status,
        "source_ip": source_ip,
        "since": since,
    }
    # Remove None values
    filters = {k: v for k, v in filters.items() if v is not None}
    events: List[SecurityEventResponse] = await EventRepository.list_events(
        db, limit=limit, offset=offset, filters=filters
    )
    total_stmt = await db.execute("SELECT COUNT(*) FROM security_events")
    total = total_stmt.scalar_one()
    return PaginatedResponse[SecurityEventResponse](total=total, limit=limit, offset=offset, items=events)

@router.get("/{event_id}", response_model=SecurityEventResponse)
async def get_event(event_id: str, db: AsyncSession = Depends(get_db)):
    event = await EventRepository.get_event(db, event_id)
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    return event

@router.post("/", response_model=SecurityEventResponse, status_code=status.HTTP_201_CREATED)
async def create_event(event: SecurityEventCreate, db: AsyncSession = Depends(get_db)):
    # Internal endpoint – no auth for now
    event_data = event.model_dump()
    db_event = await EventRepository.create_event(db, event_data)
    await db.commit()
    # Broadcast via WebSocket
    ws_msg = WebSocketMessage(message_type="NEW_EVENT", data=db_event.__dict__)
    await broadcast_event(ws_msg)
    return db_event

