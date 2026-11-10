"""Correlation Engine

Provides deterministic grouping of raw ``SecurityEvent`` records into ``Incident``
objects.  The algorithm is deliberately simple – it groups events that share a
source IP and occur within a configurable time window **and** have a relationship
score above a configurable threshold.  This prevents unrelated activity from
being merged simply because timestamps are close.

The engine is async and works with an ``AsyncSession`` supplied by the caller.
All database writes are performed inside the caller's transaction – the engine
only flushes objects so that IDs are generated.
"""

from __future__ import annotations

import logging
from collections import defaultdict
from datetime import datetime, timedelta
from typing import List, Dict, Any

from sqlalchemy.ext.asyncio import AsyncSession

from ..config import get_settings
from ..database.models import SecurityEvent, Incident
from ..database.repository import IncidentRepository, EventRepository
from ..services.logging_service import get_logger

logger = get_logger(__name__)


class CorrelationEngine:
    """Deterministic correlation engine.

    Parameters
    ----------
    window_seconds: int | None
        Maximum time difference between consecutive events for them to be
        considered part of the same group.  Defaults to ``SCAN_WINDOW_SECONDS``
        from the settings.
    min_score: int
        Minimum pairwise relationship score required to keep events in the same
        group.  The default (3) balances sensitivity and noise.
    """

    def __init__(self, window_seconds: int | None = None, min_score: int = 3):
        self.window = window_seconds or get_settings().SCAN_WINDOW_SECONDS
        self.min_score = min_score
        # Simple severity weighting used for scoring
        self.severity_weight = {
            "LOW": 1,
            "MEDIUM": 2,
            "HIGH": 3,
            "CRITICAL": 5,
        }
        # Event‑type adjacency map – which types are considered related
        self.type_adjacency = {
            "PORT_SCAN": {"BRUTE_FORCE", "SUSPICIOUS_TRAFFIC"},
            "BRUTE_FORCE": {"SQL_INJECTION", "XSS_ATTEMPT", "PORT_SCAN"},
            "SQL_INJECTION": {"XSS_ATTEMPT", "FILE_MODIFICATION"},
            "XSS_ATTEMPT": {"SQL_INJECTION", "FILE_MODIFICATION"},
            "SUSPICIOUS_TRAFFIC": {"PORT_SCAN", "BRUTE_FORCE"},
            "FILE_MODIFICATION": {"FILE_DELETION", "SQL_INJECTION", "XSS_ATTEMPT"},
            "FILE_DELETION": {"FILE_MODIFICATION"},
            "USB_DEVICE": {"FILE_MODIFICATION"},
            "HONEYPOT_INTERACTION": set(),
        }

    # ---------------------------------------------------------------------
    # Scoring helpers
    # ---------------------------------------------------------------------
    def _pair_score(self, a: SecurityEvent, b: SecurityEvent) -> int:
        """Return a deterministic integer score representing the relationship
        strength between two events.

        The score is the sum of:
        * +2 if the source IPs match
        * +1 if the timestamps are within the correlation window
        * +2 if the event types are adjacent according to ``type_adjacency``
        * severity weight of each event (higher severity adds more confidence)
        """
        score = 0
        if a.source_ip == b.source_ip:
            score += 2
        if abs((a.timestamp - b.timestamp).total_seconds()) <= self.window:
            score += 1
        if b.event_type.value in self.type_adjacency.get(a.event_type.value, set()):
            score += 2
        score += self.severity_weight.get(a.severity.value, 0)
        score += self.severity_weight.get(b.severity.value, 0)
        return score

    async def _group_events(self, events: List[SecurityEvent]) -> List[List[SecurityEvent]]:
        """Cluster events using a greedy algorithm based on ``_pair_score``.

        Events are processed in chronological order.  An event is added to the
        current group when its pairwise score with the *last* event of the group
        meets or exceeds ``self.min_score``; otherwise a new group is started.
        This approach is deterministic and fast for the prototype size.
        """
        if not events:
            return []
        events = sorted(events, key=lambda e: e.timestamp)
        groups: List[List[SecurityEvent]] = []
        current: List[SecurityEvent] = [events[0]]
        for ev in events[1:]:
            if self._pair_score(current[-1], ev) >= self.min_score:
                current.append(ev)
            else:
                groups.append(current)
                current = [ev]
        groups.append(current)
        return groups

    # ---------------------------------------------------------------------
    # Public API
    # ---------------------------------------------------------------------
    async def correlate(self, db: AsyncSession, raw_events: List[SecurityEvent]) -> List[Incident]:
        """Correlate *raw* events into new incidents.

        Parameters
        ----------
        db: AsyncSession
            Session used for all persistence operations.  The caller is
            responsible for committing/rolling‑back the transaction.
        raw_events: List[SecurityEvent]
            Events that have not yet been linked to an incident.

        Returns
        -------
        List[Incident]
            Newly created incidents.
        """
        # Filter out events already attached to an incident – they are ignored
        events = [e for e in raw_events if not e.incident_id]
        if not events:
            logger.debug("No unlinked events to correlate")
            return []

        groups = await self._group_events(events)
        created: List[Incident] = []

        for group in groups:
            source_ips = list({e.source_ip for e in group})
            target_assets = list({e.destination_ip for e in group})
            first_seen = min(e.timestamp for e in group)
            last_seen = max(e.timestamp for e in group)
            severity_sum = sum(self.severity_weight.get(e.severity.value, 0) for e in group)
            risk_score = min(100, severity_sum * 10)

            incident_payload = {
                "title": f"Correlated incident from {source_ips[0]}",
                "description": f"Automatically correlated {len(group)} events.",
                "risk_score": float(risk_score),
                "attack_stage": "RECONNAISSANCE",
                "first_seen": first_seen,
                "last_seen": last_seen,
                "status": "OPEN",
                "recommended_action": None,
                "source_ips": source_ips,
                "target_assets": target_assets,
                "event_count": len(group),
                "score_explanation": f"Severity sum {severity_sum} → risk {risk_score}",
            }

            incident = await IncidentRepository.create_incident(db, incident_payload)
            await db.flush()  # obtain incident.id

            # Link events to the incident and update their status
            for ev in group:
                ev.incident_id = incident.id
                ev.status = "INVESTIGATING"
                await db.flush()

            created.append(incident)
            logger.info(
                "Created incident %s from %d events", incident.id, len(group), extra={"incident_id": incident.id}
            )
        return created
