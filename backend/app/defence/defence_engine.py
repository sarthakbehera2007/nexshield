"""High-level Defence Engine coordinating proposal, approval, execution, and rollback."""
from __future__ import annotations

import logging
import uuid
from datetime import datetime
from typing import List, Optional, Tuple

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, func

from .models import DefenceAction, ActionStatusEnum
from .schemas import (
    DefenceActionCreate,
    DefenceActionResponse,
    DefenceMode,
    DefencePolicy,
    DefenceStatus,
)
from .policy_engine import PolicyEngine
from .action_validator import ActionValidator
from .action_executor import ActionExecutor
from .rollback_manager import RollbackManager
from .audit_service import AuditService

logger = logging.getLogger("defence.engine")


class DefenceEngine:
    def __init__(self):
        self.policy_engine = PolicyEngine()
        self.validator = ActionValidator()
        self.executor = ActionExecutor()
        self.rollback_mgr = RollbackManager()

    async def get_status(self, db: AsyncSession) -> DefenceStatus:
        pending_stmt = select(func.count(DefenceAction.id)).where(
            DefenceAction.status == ActionStatusEnum.PROPOSED
        )
        executed_stmt = select(func.count(DefenceAction.id)).where(
            DefenceAction.status == ActionStatusEnum.EXECUTED
        )
        pending_res = await db.execute(pending_stmt)
        executed_res = await db.execute(executed_stmt)

        policy = self.policy_engine.get_policy()

        return DefenceStatus(
            mode=policy.mode,
            emergency_disabled=policy.emergency_disabled,
            pending_approvals_count=pending_res.scalar_one() or 0,
            executed_actions_count=executed_res.scalar_one() or 0,
            allowlist=policy.allowlist,
            system_healthy=True,
        )

    async def list_actions(
        self,
        db: AsyncSession,
        status: Optional[str] = None,
        limit: int = 50,
        offset: int = 0,
    ) -> List[DefenceAction]:
        stmt = (
            select(DefenceAction)
            .order_by(DefenceAction.created_at.desc())
            .limit(limit)
            .offset(offset)
        )
        if status:
            stmt = stmt.where(DefenceAction.status == status)
        result = await db.execute(stmt)
        return list(result.scalars().all())

    async def get_action(self, db: AsyncSession, action_id: str) -> Optional[DefenceAction]:
        stmt = select(DefenceAction).where(DefenceAction.id == action_id)
        result = await db.execute(stmt)
        return result.scalars().first()

    async def propose_action(
        self,
        db: AsyncSession,
        payload: DefenceActionCreate,
        actor: str = "copilot",
    ) -> DefenceAction:
        await self.validator.validate_proposal(db, payload)

        action = DefenceAction(
            id=str(uuid.uuid4()),
            incident_id=payload.incident_id,
            action_type=payload.action_type.value,
            target=payload.target,
            evidence=payload.evidence,
            risk_score=payload.risk_score,
            confidence=payload.confidence,
            impact=payload.impact,
            reversibility=payload.reversibility,
            approval_required=payload.approval_required,
            status=ActionStatusEnum.PROPOSED,
            created_at=datetime.utcnow(),
            expires_at=payload.expires_at,
        )

        allowed, reason = self.policy_engine.evaluate(action)
        if not allowed:
            action.status = ActionStatusEnum.REJECTED
            db.add(action)
            await db.flush()
            await AuditService.record_event(
                db=db,
                action_id=action.id,
                event="REJECTED_BY_POLICY",
                actor="policy_engine",
                details={"reason": reason},
            )
            raise ValueError(f"Defence policy violation: {reason}")

        db.add(action)
        await db.flush()

        await AuditService.record_event(
            db=db,
            action_id=action.id,
            event="PROPOSED",
            actor=actor,
            details={"policy_reason": reason},
        )

        # Check for CONTROLLED_AUTOMATION mode execution
        if (
            self.policy_engine.mode == DefenceMode.CONTROLLED_AUTOMATION
            and not action.approval_required
        ):
            await self.executor.execute(db, action, actor="controlled_automation")

        return action

    async def approve_action(
        self,
        db: AsyncSession,
        action_id: str,
        actor: str = "operator",
    ) -> DefenceAction:
        action = await self.get_action(db, action_id)
        if not action:
            raise KeyError(f"Action '{action_id}' not found")

        if action.status != ActionStatusEnum.PROPOSED:
            raise ValueError(
                f"Action '{action_id}' has status '{action.status.value}', cannot be approved"
            )

        action.status = ActionStatusEnum.APPROVED
        action.approved_by = actor
        await db.flush()

        await AuditService.record_event(
            db=db,
            action_id=action.id,
            event="APPROVED",
            actor=actor,
        )

        # Execute immediately upon operator approval
        await self.executor.execute(db, action, actor=actor)
        return action

    async def reject_action(
        self,
        db: AsyncSession,
        action_id: str,
        actor: str = "operator",
        reason: Optional[str] = None,
    ) -> DefenceAction:
        action = await self.get_action(db, action_id)
        if not action:
            raise KeyError(f"Action '{action_id}' not found")

        if action.status != ActionStatusEnum.PROPOSED:
            raise ValueError(
                f"Action '{action_id}' has status '{action.status.value}', cannot be rejected"
            )

        action.status = ActionStatusEnum.REJECTED
        await db.flush()

        await AuditService.record_event(
            db=db,
            action_id=action.id,
            event="REJECTED",
            actor=actor,
            details={"reason": reason or "Operator rejected"},
        )
        return action

    async def rollback_action(
        self,
        db: AsyncSession,
        action_id: str,
        actor: str = "operator",
    ) -> DefenceAction:
        action = await self.get_action(db, action_id)
        if not action:
            raise KeyError(f"Action '{action_id}' not found")

        await self.rollback_mgr.rollback(db, action, actor)
        return action


# Singleton engine instance
defence_engine = DefenceEngine()

