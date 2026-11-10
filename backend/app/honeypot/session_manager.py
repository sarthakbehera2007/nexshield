"""Session manager for tracking multi-interaction attacker sessions and progression."""
from __future__ import annotations

import logging
from datetime import datetime
from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_

from .models import HoneypotSession

logger = logging.getLogger("honeypot.session")


class SessionManager:
    @staticmethod
    async def get_or_create_session(
        db: AsyncSession,
        source_ip: str,
        service_name: str,
    ) -> HoneypotSession:
        # Check for active session from this IP within the last 15 minutes
        stmt = (
            select(HoneypotSession)
            .where(
                and_(
                    HoneypotSession.source_ip == source_ip,
                    HoneypotSession.status == "ACTIVE",
                )
            )
            .order_by(HoneypotSession.last_seen.desc())
        )
        result = await db.execute(stmt)
        session = result.scalars().first()

        if session:
            session.interaction_count += 1
            session.last_seen = datetime.utcnow()
            services = list(session.services_touched or [])
            if service_name not in services:
                services.append(service_name)
                session.services_touched = services
            await db.flush()
            return session

        # Create new session
        new_session = HoneypotSession(
            source_ip=source_ip,
            started_at=datetime.utcnow(),
            last_seen=datetime.utcnow(),
            interaction_count=1,
            services_touched=[service_name],
            primary_classification="SERVICE_DISCOVERY",
            status="ACTIVE",
        )
        db.add(new_session)
        await db.flush()
        logger.info("New honeypot session opened: %s for IP %s", new_session.id, source_ip)
        return new_session

    @staticmethod
    async def close_session(db: AsyncSession, session_id: str) -> Optional[HoneypotSession]:
        stmt = select(HoneypotSession).where(HoneypotSession.id == session_id)
        result = await db.execute(stmt)
        session = result.scalars().first()
        if session:
            session.status = "CLOSED"
            await db.flush()
            logger.info("Honeypot session closed: %s", session_id)
        return session

