"""SOS Security Alert Service for emergency distress broadcasting and persistence."""
from __future__ import annotations

import logging
import uuid
from datetime import datetime
from typing import List, Optional
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from .models import MobileGatewayDevice, MobileSOSAlert
from .schemas import SOSAlertRequest, SOSAlertResponse
from ..database.models import SecurityEvent, EventType, Severity, EventStatus
from ..api.websocket import broadcast_event
from ..schemas.events import WebSocketMessage

logger = logging.getLogger("gateway.sos")


class SOSService:
    @staticmethod
    async def create_sos_alert(
        db: AsyncSession,
        device: MobileGatewayDevice,
        req: SOSAlertRequest,
    ) -> MobileSOSAlert:
        alert_id = str(uuid.uuid4())
        alert = MobileSOSAlert(
            id=alert_id,
            device_id=device.device_id,
            alert_category=req.alert_category,
            message=req.message,
            latitude=req.latitude,
            longitude=req.longitude,
            location_description=req.location_description,
            status="ACTIVE",
            timestamp=datetime.utcnow(),
        )
        db.add(alert)
        device.total_sos_reported += 1

        # Escalate immediately to CRITICAL SecurityEvent in main database
        sec_event = SecurityEvent(
            id=str(uuid.uuid4()),
            timestamp=datetime.utcnow(),
            source_ip="mobile-sos",
            destination_ip="central-server",
            event_type=EventType.SUSPICIOUS_TRAFFIC,
            severity=Severity.CRITICAL,
            description=f"🚨 [MOBILE SOS: {device.device_name}] Category: {req.alert_category} - {req.message}",
            detection_source="mobile_sos_gateway",
            evidence={
                "alert_id": alert.id,
                "device_id": device.device_id,
                "device_name": device.device_name,
                "latitude": req.latitude,
                "longitude": req.longitude,
                "location_description": req.location_description,
            },
            status=EventStatus.NEW,
            confidence=1.0,
            risk_score=98.0,
        )
        db.add(sec_event)
        await db.flush()

        logger.critical(
            "SOS ALERT RECEIVED: device=%s, category=%s, msg=%s",
            device.device_id,
            req.alert_category,
            req.message,
        )

        # Broadcast high-priority WebSocket event to Windows SOC
        try:
            ws_msg = WebSocketMessage(
                message_type="NEW_EVENT",
                data={
                    "event_type": "mobile.sos_alert",
                    "alert_id": alert.id,
                    "device_id": device.device_id,
                    "device_name": device.device_name,
                    "category": req.alert_category,
                    "message": req.message,
                    "latitude": req.latitude,
                    "longitude": req.longitude,
                    "timestamp": alert.timestamp.isoformat(),
                    "severity": "CRITICAL",
                },
            )
            await broadcast_event(ws_msg)
        except Exception as ws_err:
            logger.warning("WebSocket broadcast skipped: %s", ws_err)

        return alert

    @staticmethod
    async def list_sos_alerts(
        db: AsyncSession,
        limit: int = 50,
        offset: int = 0,
    ) -> List[MobileSOSAlert]:
        stmt = (
            select(MobileSOSAlert)
            .order_by(MobileSOSAlert.timestamp.desc())
            .limit(limit)
            .offset(offset)
        )
        result = await db.execute(stmt)
        return list(result.scalars().all())

