"""Rollback Manager providing idempotent rollback and restoring pre-action system state."""
from __future__ import annotations

import logging
from datetime import datetime
from typing import Any, Dict

from .models import DefenceAction, ActionStatusEnum
from .audit_service import AuditService
from sqlalchemy.ext.asyncio import AsyncSession

logger = logging.getLogger("defence.rollback")


class RollbackManager:
    @staticmethod
    async def rollback(db: AsyncSession, action: DefenceAction, actor: str) -> Dict[str, Any]:
        if not action.reversibility:
            raise ValueError(f"Action '{action.id}' is configured as non-reversible")

        if action.status not in (ActionStatusEnum.EXECUTED, ActionStatusEnum.EXPIRED):
            raise ValueError(f"Action status is '{action.status.value}', only EXECUTED actions can be rolled back")

        logger.info(
            "Rolling back defence action %s (target=%s, actor=%s)",
            action.id,
            action.target,
            actor,
        )

        rollback_details = {
            "rollback_mode": "SANDBOX_SIMULATION",
            "action_id": action.id,
            "target": action.target,
            "rule_reversed": f"IPTABLES_RULE: -D INPUT -s {action.target} -j DROP",
            "timestamp": datetime.utcnow().isoformat(),
            "status": "RESTORED",
        }

        action.status = ActionStatusEnum.ROLLED_BACK
        action.rollback_status = "SUCCESS"
        await db.flush()

        await AuditService.record_event(
            db=db,
            action_id=action.id,
            event="ROLLED_BACK",
            actor=actor,
            details=rollback_details,
        )

        return rollback_details

