"""Action validator for ensuring schema compliance, idempotence, and non-duplicate proposals."""
from __future__ import annotations

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_

from .schemas import DefenceActionCreate
from .models import DefenceAction, ActionStatusEnum


class ActionValidator:
    @staticmethod
    async def validate_proposal(db: AsyncSession, payload: DefenceActionCreate) -> None:
        if not payload.incident_id:
            raise ValueError("incident_id is required for a valid defence proposal")

        if not payload.target or not payload.target.strip():
            raise ValueError("target cannot be empty")

        # Check for duplicate pending/proposed action with the exact same target and action type
        stmt = select(DefenceAction).where(
            and_(
                DefenceAction.target == payload.target.strip(),
                DefenceAction.action_type == payload.action_type.value,
                DefenceAction.status.in_([ActionStatusEnum.PROPOSED, ActionStatusEnum.APPROVED]),
            )
        )
        result = await db.execute(stmt)
        existing = result.scalars().first()
        if existing:
            raise ValueError(
                f"An active proposal ({existing.id}) for target '{payload.target}' and action '{payload.action_type.value}' already exists"
            )

