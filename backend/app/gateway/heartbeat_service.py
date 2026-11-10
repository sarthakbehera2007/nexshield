"""Heartbeat Service for mobile presence and telemetry synchronization."""
from __future__ import annotations

import logging
from datetime import datetime
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from .models import MobileGatewayDevice
from .schemas import DeviceHeartbeatRequest, DeviceHeartbeatResponse
from ..database.models import Incident, IncidentStatus

logger = logging.getLogger("gateway.heartbeat")


class HeartbeatService:
    @staticmethod
    async def record_heartbeat(
        db: AsyncSession,
        device: MobileGatewayDevice,
        req: DeviceHeartbeatRequest,
    ) -> DeviceHeartbeatResponse:
        device.last_seen = datetime.utcnow()
        if device.status != "REVOKED":
            device.status = "ONLINE"
        if req.app_version:
            device.app_version = req.app_version

        # Count active open incidents on server to return context
        inc_stmt = select(func.count(Incident.id)).where(
            Incident.status.in_([IncidentStatus.OPEN, IncidentStatus.INVESTIGATING])
        )
        inc_res = await db.execute(inc_stmt)
        active_incidents = inc_res.scalar_one() or 0

        await db.flush()
        logger.debug("Heartbeat updated for device %s", device.device_id)

        return DeviceHeartbeatResponse(
            device_id=device.device_id,
            status=device.status,
            last_seen=device.last_seen,
            server_time=datetime.utcnow(),
            active_incidents_count=active_incidents,
        )

