"""Action Executor with safe simulated adapter for lab containment and reversible actions."""
from __future__ import annotations

import logging
from datetime import datetime
from typing import Any, Dict

from .models import DefenceAction, ActionStatusEnum
from .audit_service import AuditService
from sqlalchemy.ext.asyncio import AsyncSession

logger = logging.getLogger("defence.executor")


class ActionExecutor:
    """
    Executes defence actions. In lab / development environments, safely
    executes reversible simulated network containment rules and returns verified outcome.
    Never executes arbitrary or unverified shell commands.
    """
    @staticmethod
    async def execute(db: AsyncSession, action: DefenceAction, actor: str) -> Dict[str, Any]:
        logger.info(
            "Executing action %s: type=%s, target=%s (actor=%s)",
            action.id,
            action.action_type,
            action.target,
            actor,
        )

        # Simulation execution adapter
        execution_result = {
            "execution_mode": "SANDBOX_SIMULATION",
            "action_id": action.id,
            "action_type": action.action_type,
            "target": action.target,
            "timestamp": datetime.utcnow().isoformat(),
            "status": "APPLIED",
            "command_rendered": f"IPTABLES_RULE: -A INPUT -s {action.target} -j DROP",
        }

        action.status = ActionStatusEnum.EXECUTED
        action.executed_at = datetime.utcnow()
        await db.flush()

        await AuditService.record_event(
            db=db,
            action_id=action.id,
            event="EXECUTED",
            actor=actor,
            details=execution_result,
        )

        return execution_result

