"""Honeypot manager maintaining the status, services registry, and telemetry querying."""
from __future__ import annotations

import logging
from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_

from .models import HoneypotSession, HoneypotInteraction
from .schemas import DecoyServiceType, HoneypotStatus

logger = logging.getLogger("honeypot.manager")


class HoneypotManager:
    def __init__(self):
        self.enabled = True
        self.bind_interface = "127.0.0.1:8000/decoys"

    async def get_status(self, db: AsyncSession) -> HoneypotStatus:
        active_sess_stmt = select(func.count(HoneypotSession.id)).where(
            HoneypotSession.status == "ACTIVE"
        )
        total_inter_stmt = select(func.count(HoneypotInteraction.id))

        active_res = await db.execute(active_sess_stmt)
        total_res = await db.execute(total_inter_stmt)

        return HoneypotStatus(
            enabled=self.enabled,
            decoy_services=[s.value for s in DecoyServiceType],
            active_sessions_count=active_res.scalar_one() or 0,
            total_interactions_count=total_res.scalar_one() or 0,
            bind_interface=self.bind_interface,
            safe_simulation=True,
        )

    async def list_sessions(
        self,
        db: AsyncSession,
        status: Optional[str] = None,
        limit: int = 50,
        offset: int = 0,
    ) -> List[HoneypotSession]:
        stmt = (
            select(HoneypotSession)
            .order_by(HoneypotSession.last_seen.desc())
            .limit(limit)
            .offset(offset)
        )
        if status:
            stmt = stmt.where(HoneypotSession.status == status)
        result = await db.execute(stmt)
        return list(result.scalars().all())

    async def list_interactions(
        self,
        db: AsyncSession,
        session_id: Optional[str] = None,
        limit: int = 100,
        offset: int = 0,
    ) -> List[HoneypotInteraction]:
        stmt = (
            select(HoneypotInteraction)
            .order_by(HoneypotInteraction.timestamp.desc())
            .limit(limit)
            .offset(offset)
        )
        if session_id:
            stmt = stmt.where(HoneypotInteraction.session_id == session_id)
        result = await db.execute(stmt)
        return list(result.scalars().all())


honeypot_manager = HoneypotManager()

