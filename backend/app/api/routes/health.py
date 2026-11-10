from __future__ import annotations

from datetime import datetime
from fastapi import APIRouter, Depends
from fastapi.responses import JSONResponse

from ...config import get_settings
from ...services.logging_service import get_logger

router = APIRouter()

logger = get_logger("health")

@router.get("/health", response_model=dict)
async def health_check():
    """Liveness probe returning basic status."""
    now = datetime.utcnow()
    logger.info("Health check requested", extra={"timestamp": now.isoformat()})
    return {
        "status": "healthy",
        "timestamp": now.isoformat(),
        "version": get_settings().APP_VERSION,
        "uptime_seconds": (now - datetime.fromtimestamp(0)).total_seconds(),
    }

@router.get("/system/status", response_model=dict)
async def system_status():
    """Aggregated system status for dashboard.

    For Phase 1 we provide a placeholder with static values; later phases will fill real data.
    """
    now = datetime.utcnow()
    # Placeholder data – sensors and counts would be queried from DB in a full implementation.
    status = {
        "timestamp": now.isoformat(),
        "sensors": [],
        "event_counts_last_24h": 0,
        "open_incident_count": 0,
        "current_risk_level": "LOW",
        "defence_action_counts": {"pending": 0, "executed": 0, "rejected": 0},
    }
    logger.info("System status requested", extra={"timestamp": now.isoformat()})
    return status

