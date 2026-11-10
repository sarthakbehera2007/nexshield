"""Attack Story Engine

Transforms an ``Incident`` and its associated ``SecurityEvent`` records into a
chronological narrative that reflects the ATTACK STAGE progression.  The
engine never claims confirmation of an action that is not backed by evidence –
it distinguishes *observed* events from *hypothesised* stages.
"""

from __future__ import annotations

import logging
from datetime import datetime
from typing import List, Dict, Any

from sqlalchemy.ext.asyncio import AsyncSession

from ..config import get_settings
from ..database.models import SecurityEvent, Incident
from ..database.repository import EventRepository, IncidentRepository
from ..services.logging_service import get_logger

logger = get_logger(__name__)


class AttackStoryEngine:
    """Generate a detailed, ordered attack story for a given incident.

    The story consists of a list of stages with timestamps, descriptions, and
    evidence references.  Stages are mapped from event types using a deterministic
    lookup table – unrelated events are listed under a generic ``UNKNOWN`` stage.
    """

    # Mapping of event types to ATTACK STAGE values (ordered).
    _stage_map: Dict[str, str] = {
        "PORT_SCAN": "RECONNAISSANCE",
        "BRUTE_FORCE": "INITIAL_ACCESS",
        "SQL_INJECTION": "INITIAL_ACCESS",
        "XSS_ATTEMPT": "INITIAL_ACCESS",
        "SUSPICIOUS_TRAFFIC": "RECONNAISSANCE",
        "FILE_MODIFICATION": "EXPLOITATION",
        "FILE_DELETION": "C2",
        "USB_DEVICE": "DELIVERY",
        "HONEYPOT_INTERACTION": "RECONNAISSANCE",
    }

    async def build_story(self, db: AsyncSession, incident_id: str) -> Dict[str, Any]:
        """Return a dictionary describing the incident story.

        Parameters
        ----------
        db: AsyncSession
            Database session used for querying events.
        incident_id: str
            Identifier of the incident to build the story for.
        """
        incident = await IncidentRepository.get_incident(db, incident_id)
        if not incident:
            raise ValueError(f"Incident {incident_id} not found")

        # Fetch all events linked to this incident, ordered chronologically.
        events = await EventRepository.list_events(
            db, limit=1000, offset=0, filters={"incident_id": incident_id}
        )
        events = sorted(events, key=lambda e: e.timestamp)

        story: List[Dict[str, Any]] = []
        for ev in events:
            stage = self._stage_map.get(ev.event_type.value, "UNKNOWN")
            entry = {
                "timestamp": ev.timestamp.isoformat(),
                "stage": stage,
                "event_type": ev.event_type.value,
                "severity": ev.severity.value,
                "description": ev.description,
                "evidence": ev.evidence,
            }
            story.append(entry)

        result = {
            "incident_id": incident.id,
            "title": incident.title,
            "first_seen": incident.first_seen.isoformat() if incident.first_seen else None,
            "last_seen": incident.last_seen.isoformat() if incident.last_seen else None,
            "source_ips": incident.source_ips,
            "target_assets": incident.target_assets,
            "story": story,
        }
        logger.debug("Generated attack story for incident %s", incident.id)
        return result

