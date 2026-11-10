from __future__ import annotations

import asyncio
from datetime import datetime, timedelta
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from ..database.database import get_db
from ..database.repository import EventRepository, SensorRepository
from ..schemas.responses import APIResponse, PaginatedResponse
from ..schemas.events import SecurityEventResponse
from ..schemas.incidents import IncidentSummary

router = APIRouter(prefix="/monitoring", tags=["monitoring"])

@router.get("/network", response_model=APIResponse)
async def network_status(db: AsyncSession = Depends(get_db)):
    """Return a snapshot of network sensor status and recent events.

    For now we provide a simple placeholder: top attacking IPs and a summary of recent SYN‑scan events.
    """
    # Example: get top 5 source IPs in last hour
    since = datetime.utcnow() - timedelta(hours=1)
    top_ips_stmt = (
        await db.execute(
            "SELECT source_ip, COUNT(*) as cnt FROM security_events WHERE timestamp >= :since GROUP BY source_ip ORDER BY cnt DESC LIMIT 5",
            {"since": since},
        )
    )
    top_ips = [{"source_ip": row[0], "count": row[1]} for row in top_ips_stmt.fetchall()]

    # Recent network events (limit 20)
    recent_events = await EventRepository.list_events(
        db, limit=20, offset=0, filters={"event_type": "SUSPICIOUS_TRAFFIC"}
    )
    events_data = [SecurityEventResponse.from_orm(e).model_dump() for e in recent_events]

    return APIResponse(
        data={"top_attacking_ips": top_ips, "recent_network_events": events_data},
        message="Network monitoring snapshot",
    )

@router.get("/sensors", response_model=APIResponse)
async def list_sensors(db: AsyncSession = Depends(get_db)):
    sensors = await SensorRepository.list_sensors(db)
    sensor_list = [
        {
            "id": s.id,
            "name": s.name,
            "type": s.sensor_type.value,
            "status": s.status.value,
            "last_seen": s.last_seen.isoformat() if s.last_seen else None,
            "events_generated": s.events_generated,
            "error_message": s.error_message,
        }
        for s in sensors
    ]
    return APIResponse(data=sensor_list, message="Sensor list")

