"""Risk Scoring Engine

Provides a deterministic, explainable risk score (0‑100) for an incident based on
its associated events.  The calculation uses configurable weights and produces a
breakdown that can be presented to operators.
"""

from __future__ import annotations

import logging
from typing import List, Dict, Any

from sqlalchemy.ext.asyncio import AsyncSession

from ..config import get_settings
from ..database.models import SecurityEvent, Incident
from ..database.repository import EventRepository, IncidentRepository
from ..services.logging_service import get_logger

logger = get_logger(__name__)


class RiskEngine:
    """Deterministic risk scoring.

    The score is the weighted sum of several factors:
    * Event severity (major driver)
    * Event confidence (if present)
    * Number of distinct indicators (unique event types)
    * Asset criticality – a simple lookup based on a config list of critical assets
    * Frequency – number of events per minute in the correlation window

    All factors are normalized to a 0‑1 range before weighting, guaranteeing a
    reproducible result.
    """

    def __init__(self, weights: Dict[str, float] | None = None):
        default_weights = {
            "severity": 0.4,
            "confidence": 0.1,
            "indicator_count": 0.2,
            "asset_importance": 0.2,
            "frequency": 0.1,
        }
        self.weights = weights or default_weights
        # Map severity enum to numeric value (0‑1)
        self.severity_map = {
            "LOW": 0.2,
            "MEDIUM": 0.5,
            "HIGH": 0.8,
            "CRITICAL": 1.0,
        }
        # Critical assets list from settings (comma‑separated strings)
        self.critical_assets = set(get_settings().MONITORED_DIRS)  # placeholder for assets

    def _severity_factor(self, events: List[SecurityEvent]) -> float:
        if not events:
            return 0.0
        # Use the maximum severity of the group as the driving factor
        max_sev = max(self.severity_map.get(e.severity.value, 0.0) for e in events)
        return max_sev

    def _confidence_factor(self, events: List[SecurityEvent]) -> float:
        if not events:
            return 0.0
        avg_conf = sum(getattr(e, "confidence", 1.0) for e in events) / len(events)
        return avg_conf

    def _indicator_factor(self, events: List[SecurityEvent]) -> float:
        uniq = len({e.event_type.value for e in events})
        # Assume maximum of 10 distinct types for normalization
        return min(1.0, uniq / 10.0)

    def _asset_factor(self, incident: Incident) -> float:
        # If any target asset appears in critical_assets, boost factor
        if not incident.target_assets:
            return 0.0
        critical = any(asset in self.critical_assets for asset in incident.target_assets)
        return 1.0 if critical else 0.3

    def _frequency_factor(self, events: List[SecurityEvent]) -> float:
        if not events:
            return 0.0
        # Number of events per minute in the incident window
        times = [e.timestamp for e in events]
        span_seconds = (max(times) - min(times)).total_seconds() or 1
        per_min = len(events) / (span_seconds / 60)
        # Normalize assuming max 20 events/min is extreme
        return min(1.0, per_min / 20.0)

    async def calculate(self, db: AsyncSession, incident_id: str) -> Dict[str, Any]:
        """Calculate risk score for an incident.

        Returns a dict with ``score`` (0‑100), ``level`` (LOW/MEDIUM/HIGH/CRITICAL)
        and a human‑readable ``explanation`` that lists the contribution of each
        factor.
        """
        incident = await IncidentRepository.get_incident(db, incident_id)
        if not incident:
            raise ValueError(f"Incident {incident_id} not found")
        # Pull linked events
        events = await EventRepository.list_events(
            db, limit=1000, offset=0, filters={"incident_id": incident_id}
        )
        # Compute factors
        sev = self._severity_factor(events)
        conf = self._confidence_factor(events)
        ind = self._indicator_factor(events)
        asset = self._asset_factor(incident)
        freq = self._frequency_factor(events)
        # Weighted sum (0‑1)
        weighted = (
            sev * self.weights["severity"]
            + conf * self.weights["confidence"]
            + ind * self.weights["indicator_count"]
            + asset * self.weights["asset_importance"]
            + freq * self.weights["frequency"]
        )
        score = int(round(weighted * 100))
        # Determine risk level
        if score < 25:
            level = "LOW"
        elif score < 50:
            level = "MEDIUM"
        elif score < 75:
            level = "HIGH"
        else:
            level = "CRITICAL"
        explanation = (
            f"Severity factor={sev:.2f}, confidence={conf:.2f}, indicator diversity={ind:.2f}, "
            f"asset importance={asset:.2f}, frequency={freq:.2f}; weights={self.weights}."
        )
        result = {
            "incident_id": incident.id,
            "score": score,
            "level": level,
            "explanation": explanation,
        }
        logger.debug("Risk score for incident %s: %s", incident.id, result)
        return result

