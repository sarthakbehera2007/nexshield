"""Mobile Event Reporting Service integrated with normalized pipeline and WebSocket."""
from __future__ import annotations

import logging
import uuid
from datetime import datetime
from typing import List, Optional
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from .models import MobileGatewayDevice, MobileSecurityReport
from .schemas import MobileEventReportRequest, MobileEventReportResponse
from ..database.models import SecurityEvent, EventType, Severity, EventStatus
from ..api.websocket import broadcast_event
from ..schemas.events import WebSocketMessage

logger = logging.getLogger("gateway.events")


class MobileEventService:
    @staticmethod
    async def submit_report(
        db: AsyncSession,
        device: MobileGatewayDevice,
        req: MobileEventReportRequest,
    ) -> MobileSecurityReport:
        # Check event_type mapping
        event_id = str(uuid.uuid4())
        report = MobileSecurityReport(
            id=event_id,
            device_id=device.device_id,
            event_type=req.event_type,
            severity=req.severity.upper(),
            description=req.description,
            evidence_metadata=req.evidence_metadata or {},
            source=req.source or "mobile_agent",
            status="NEW",
            is_demo=req.is_demo or False,
            timestamp=datetime.utcnow(),
        )
        db.add(report)
        device.total_events_reported += 1

        # Also normalize and feed into the main central SecurityEvent table
        # Map event type to EventType enum if possible, else SUSPICIOUS_TRAFFIC
        mapped_type = EventType.SUSPICIOUS_TRAFFIC
        if req.event_type in EventType._value2member_map_:
            mapped_type = EventType(req.event_type)
        elif "URL" in req.event_type or "LINK" in req.event_type:
            mapped_type = EventType.SUSPICIOUS_TRAFFIC
        elif "INJECTION" in req.event_type:
            mapped_type = EventType.SQL_INJECTION

        mapped_sev = Severity.MEDIUM
        if req.severity.upper() in Severity._value2member_map_:
            mapped_sev = Severity(req.severity.upper())

        sec_event = SecurityEvent(
            id=str(uuid.uuid4()),
            timestamp=datetime.utcnow(),
            source_ip="mobile-device",
            destination_ip="central-server",
            event_type=mapped_type,
            severity=mapped_sev,
            description=f"[Mobile: {device.device_name}] {req.description}",
            detection_source="mobile_gateway",
            evidence={
                "mobile_device_id": device.device_id,
                "device_name": device.device_name,
                "evidence_metadata": req.evidence_metadata,
            },
            status=EventStatus.NEW,
            confidence=0.9,
            risk_score=70.0 if mapped_sev in (Severity.HIGH, Severity.CRITICAL) else 40.0,
        )
        db.add(sec_event)
        await db.flush()

        # Broadcast over WebSocket to Windows SOC dashboard
        try:
            ws_msg = WebSocketMessage(
                message_type="NEW_EVENT",
                data={
                    "event_type": "mobile.security_event",
                    "event_id": report.id,
                    "device_id": device.device_id,
                    "device_name": device.device_name,
                    "report_type": req.event_type,
                    "severity": report.severity,
                    "description": report.description,
                    "timestamp": report.timestamp.isoformat(),
                },
            )
            await broadcast_event(ws_msg)
        except Exception as ws_err:
            logger.warning("WebSocket broadcast skipped: %s", ws_err)

        return report

    @staticmethod
    async def list_reports(
        db: AsyncSession,
        device_id: Optional[str] = None,
        limit: int = 50,
        offset: int = 0,
    ) -> List[MobileSecurityReport]:
        stmt = (
            select(MobileSecurityReport)
            .order_by(MobileSecurityReport.timestamp.desc())
            .limit(limit)
            .offset(offset)
        )
        if device_id:
            stmt = stmt.where(MobileSecurityReport.device_id == device_id)
        result = await db.execute(stmt)
        return list(result.scalars().all())

