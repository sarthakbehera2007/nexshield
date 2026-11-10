"""SQLAlchemy models for Defence Engine and Audit Log."""
from __future__ import annotations

import enum
import uuid
from datetime import datetime
from typing import Any, Dict, Optional

from sqlalchemy import (
    Boolean,
    Column,
    DateTime,
    Enum as SqlEnum,
    Float,
    ForeignKey,
    JSON,
    String,
    Text,
)
from sqlalchemy.orm import relationship

from ..database.database import Base


class ActionStatusEnum(str, enum.Enum):
    PROPOSED = "PROPOSED"
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"
    EXECUTED = "EXECUTED"
    ROLLED_BACK = "ROLLED_BACK"
    EXPIRED = "EXPIRED"


class DefenceAction(Base):
    __tablename__ = "defence_engine_actions"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    incident_id = Column(String(64), nullable=False, index=True)
    action_type = Column(String(64), nullable=False, index=True)
    target = Column(String(255), nullable=False, index=True)
    evidence = Column(JSON, nullable=True)
    risk_score = Column(Float, default=0.0)
    confidence = Column(Float, default=0.0)
    impact = Column(String(32), default="LOW")
    reversibility = Column(Boolean, default=True)
    approval_required = Column(Boolean, default=True)
    approved_by = Column(String(64), nullable=True)
    status = Column(SqlEnum(ActionStatusEnum), default=ActionStatusEnum.PROPOSED, index=True)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    expires_at = Column(DateTime, nullable=True)
    executed_at = Column(DateTime, nullable=True)
    rollback_status = Column(String(32), nullable=True)

    audits = relationship("DefenceAudit", back_populates="action", cascade="all, delete-orphan")


class DefenceAudit(Base):
    """Immutable audit record for every action state change."""
    __tablename__ = "defence_engine_audits"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    action_id = Column(String(36), ForeignKey("defence_engine_actions.id"), nullable=False, index=True)
    event = Column(String(64), nullable=False)  # PROPOSED, APPROVED, REJECTED, EXECUTED, ROLLED_BACK
    actor = Column(String(64), nullable=False)  # operator username or 'system'
    details = Column(JSON, nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)

    action = relationship("app.defence.models.DefenceAction", back_populates="audits")
