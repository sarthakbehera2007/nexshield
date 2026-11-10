"""Audit Service for recording immutable defence action lifecycle events."""
from __future__ import annotations

import logging
from typing import Any, Dict, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from .models import DefenceAudit, DefenceAction

logger = logging.getLogger("defence.audit")


class AuditService:
    @staticmethod
    async def record_event(
        db: AsyncSession,
        action_id: str,
        event: str,
        actor: str,
        details: Optional[Dict[str, Any]] = None,
    ) -> DefenceAudit:
        audit = DefenceAudit(
            action_id=action_id,
            event=event,
            actor=actor,
            details=details or {},
        )
        db.add(audit)
        await db.flush()
        logger.info(
            "Defence audit logged: action_id=%s, event=%s, actor=%s",
            action_id,
            event,
            actor,
        )
        return audit

    @staticmethod
    async def get_history_for_action(db: AsyncSession, action_id: str):
        stmt = (
            select(DefenceAudit)
            .where(DefenceAudit.action_id == action_id)
            .order_by(DefenceAudit.timestamp.asc())
        )
        result = await db.execute(stmt)
        return result.scalars().all()

    @staticmethod
    async def get_recent_audits(db: AsyncSession, limit: int = 100):
        stmt = (
            select(DefenceAudit)
            .order_by(DefenceAudit.timestamp.desc())
            .limit(limit)
        )
        result = await db.execute(stmt)
        return result.scalars().all()

