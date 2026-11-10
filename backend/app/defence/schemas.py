"""Pydantic schemas for Phase 6 Defence Engine."""
from __future__ import annotations

from datetime import datetime
from enum import Enum
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field, field_validator


class DefenceMode(str, Enum):
    OBSERVE = "OBSERVE"
    APPROVAL_REQUIRED = "APPROVAL_REQUIRED"
    CONTROLLED_AUTOMATION = "CONTROLLED_AUTOMATION"


class ActionType(str, Enum):
    BLOCK_IP = "BLOCK_IP"
    RATE_LIMIT = "RATE_LIMIT"
    DENYLIST = "DENYLIST"
    QUARANTINE_ENDPOINT = "QUARANTINE_ENDPOINT"
    DISABLE_ACCOUNT = "DISABLE_ACCOUNT"
    RESTRICT_ENDPOINT = "RESTRICT_ENDPOINT"
    INCIDENT_REPORT = "INCIDENT_REPORT"
    SECURITY_ALERT = "SECURITY_ALERT"


class ActionStatus(str, Enum):
    PROPOSED = "PROPOSED"
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"
    EXECUTED = "EXECUTED"
    ROLLED_BACK = "ROLLED_BACK"
    EXPIRED = "EXPIRED"


class DefenceActionBase(BaseModel):
    incident_id: str = Field(..., description="Correlated incident ID")
    action_type: ActionType
    target: str = Field(..., description="IP, hostname, username, or endpoint")
    evidence: Optional[Dict[str, Any]] = None
    risk_score: float = Field(0.0, ge=0.0, le=100.0)
    confidence: float = Field(0.0, ge=0.0, le=1.0)
    impact: str = Field("LOW", description="LOW | MEDIUM | HIGH")
    reversibility: bool = True
    approval_required: bool = True
    expires_at: Optional[datetime] = None

    @field_validator("expires_at")
    @classmethod
    def validate_expiry(cls, v: Optional[datetime]) -> Optional[datetime]:
        if v and v <= datetime.utcnow():
            raise ValueError("expires_at must be in the future")
        return v


class DefenceActionCreate(DefenceActionBase):
    pass


class DefenceActionResponse(DefenceActionBase):
    id: str
    status: ActionStatus
    approved_by: Optional[str] = None
    created_at: datetime
    executed_at: Optional[datetime] = None
    rollback_status: Optional[str] = None

    class Config:
        from_attributes = True


class DefencePolicy(BaseModel):
    mode: DefenceMode
    allowlist: List[str] = Field(default_factory=list)
    emergency_disabled: bool = False
    supported_actions: List[str] = Field(
        default_factory=lambda: [a.value for a in ActionType]
    )


class DefenceStatus(BaseModel):
    mode: DefenceMode
    emergency_disabled: bool
    pending_approvals_count: int
    executed_actions_count: int
    allowlist: List[str]
    system_healthy: bool

