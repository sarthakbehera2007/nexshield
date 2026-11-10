from __future__ import annotations

import re
from datetime import datetime
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession

from ...database.database import get_db
from ...database.repository import EventRepository, SensorRepository, MobileDeviceRepository
from ...schemas.responses import APIResponse, PaginatedResponse
from ...schemas.events import MobileInspectRequest, MobileInspectResponse, SecurityEventCreate
from ...schemas.incidents import IncidentSummary
from ...services.logging_service import get_logger

router = APIRouter(prefix="/mobile", tags=["mobile"])

logger = get_logger("mobile")

# Simple regex patterns for detection (deterministic)
SQLI_PATTERN = re.compile(r"(SELECT|UNION|INSERT|UPDATE|DELETE).*FROM", re.IGNORECASE)
XSS_PATTERN = re.compile(r"<script>.*?</script>", re.IGNORECASE)

@router.post("/inspect", response_model=MobileInspectResponse, status_code=status.HTTP_200_OK)
async def inspect_request(payload: MobileInspectRequest, db: AsyncSession = Depends(get_db)):
    # Basic validation
    if not payload.method or not payload.path or not payload.source_id:
        raise HTTPException(status_code=400, detail="Missing required fields")

    # Record device (create or update)
    device_repo = MobileDeviceRepository()
    device = await device_repo.upsert_device(db, payload.source_id, payload.path)

    # Run detection rules
    threat_type: Optional[str] = None
    severity: Optional[str] = None
    reason: Optional[str] = None
    decision = "ALLOWED"

    combined = f"{payload.method} {payload.path} {payload.query or ''} {payload.body or ''}"
    if SQLI_PATTERN.search(combined):
        threat_type = "SQL_INJECTION"
        severity = "HIGH"
        reason = "Suspicious SQL injection pattern detected"
    elif XSS_PATTERN.search(combined):
        threat_type = "XSS_ATTEMPT"
        severity = "HIGH"
        reason = "Suspicious XSS pattern detected"
    # Add more deterministic checks here as needed

    if threat_type:
        decision = "BLOCKED"
        # Create a security event
        event_data = SecurityEventCreate(
            source_ip="0.0.0.0",  # placeholder for mobile source
            destination_ip="0.0.0.0",
            event_type=threat_type,
            severity=severity,
            description=reason,
            detection_source="mobile_inspector",
            confidence=1.0,
        ).model_dump()
        await EventRepository.create_event(db, event_data)
        await db.commit()
        # Increment blocked counter
        await device_repo.increment_blocked(db, payload.source_id)

    response = MobileInspectResponse(
        decision=decision,
        threat_type=threat_type,
        severity=severity,
        reason=reason,
    )
    logger.info("Mobile inspect processed", extra={"source_id": payload.source_id, "decision": decision})
    return response

@router.get("/devices", response_model=PaginatedResponse[dict])
async def list_devices(limit: int = 50, offset: int = 0, db: AsyncSession = Depends(get_db)):
    repo = MobileDeviceRepository()
    devices = await repo.list_devices(db, limit, offset)
    total = await repo.count_devices(db)
    return PaginatedResponse[dict](total=total, limit=limit, offset=offset, items=devices)

