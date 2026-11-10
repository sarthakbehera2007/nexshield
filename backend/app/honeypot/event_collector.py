"""Event Collector feeding normalized honeypot events into the main pipeline and SQLite."""
from __future__ import annotations

import logging
import uuid
from datetime import datetime
from typing import Any, Dict
from sqlalchemy.ext.asyncio import AsyncSession

from .models import HoneypotInteraction, HoneypotSession
from .schemas import HoneypotInteractionCreate, DecoyServiceType
from .interaction_analyzer import InteractionAnalyzer
from .session_manager import SessionManager
from ..database.models import SecurityEvent, EventType, Severity, EventStatus
from ..api.websocket import broadcast_event
from ..schemas.events import WebSocketMessage

logger = logging.getLogger("honeypot.collector")


class EventCollector:
    @staticmethod
    async def record_interaction(
        db: AsyncSession,
        payload: HoneypotInteractionCreate,
    ) -> HoneypotInteraction:
        # 1. Classify attacker behavior
        classification, severity_str, indicators = InteractionAnalyzer.analyze(
            service_name=payload.service_name,
            method=payload.method,
            path=payload.path,
            user_agent=payload.user_agent,
            payload=payload.payload,
        )

        # 2. Track or correlate session
        session = await SessionManager.get_or_create_session(
            db=db,
            source_ip=payload.source_ip,
            service_name=payload.service_name.value,
        )
        session.primary_classification = classification.value

        # 3. Store HoneypotInteraction record
        sanitized_meta = {
            "headers": {k: v for k, v in (payload.headers or {}).items() if "auth" not in k.lower()},
            "query_params": payload.query_params or {},
        }
        interaction = HoneypotInteraction(
            id=str(uuid.uuid4()),
            session_id=session.id,
            source_ip=payload.source_ip,
            service_name=payload.service_name.value,
            method=payload.method,
            path=payload.path,
            user_agent=payload.user_agent,
            classification=classification.value,
            severity=severity_str,
            indicators=indicators,
            sanitized_metadata=sanitized_meta,
            timestamp=datetime.utcnow(),
        )
        db.add(interaction)

        # 4. Feed into normalized SecurityEvent pipeline
        sec_event = SecurityEvent(
            id=str(uuid.uuid4()),
            timestamp=datetime.utcnow(),
            source_ip=payload.source_ip,
            destination_ip="127.0.0.1",
            event_type=EventType.HONEYPOT_INTERACTION,
            severity=Severity(severity_str),
            description=f"Honeypot Decoy [{payload.service_name.value}] accessed: {payload.method} {payload.path} ({classification.value})",
            detection_source="digital_honeypot",
            evidence={
                "session_id": session.id,
                "indicators": indicators,
                "service": payload.service_name.value,
            },
            status=EventStatus.NEW,
            confidence=1.0,
            risk_score=75.0 if severity_str in ("HIGH", "CRITICAL") else 40.0,
        )
        db.add(sec_event)
        await db.flush()

        # 5. Broadcast to WebSocket
        try:
            ws_msg = WebSocketMessage(
                message_type="NEW_EVENT",
                data={
                    "event_type": "honeypot.interaction",
                    "session_id": session.id,
                    "service_name": payload.service_name.value,
                    "source_ip": payload.source_ip,
                    "classification": classification.value,
                    "severity": severity_str,
                    "indicators": indicators,
                    "timestamp": datetime.utcnow().isoformat(),
                },
            )
            await broadcast_event(ws_msg)
        except Exception as ws_err:
            logger.warning("Honeypot event broadcast skipped: %s", ws_err)

        return interaction

