from __future__ import annotations

from datetime import datetime
from typing import Generic, List, Optional, TypeVar

from pydantic import BaseModel, Field

T = TypeVar("T")


class APIResponse(BaseModel, Generic[T]):
    success: bool = True
    message: Optional[str] = None
    data: Optional[T] = None
    timestamp: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        json_schema_extra = {"example": {"success": True, "message": None, "data": {}, "timestamp": "2023-01-01T00:00:00Z"}}


class HealthResponse(BaseModel):
    status: str
    timestamp: datetime
    version: str
    uptime_seconds: float


class SystemStatusResponse(BaseModel):
    timestamp: datetime
    sensors: List[dict]
    event_counts_last_24h: int
    open_incident_count: int
    current_risk_level: str
    defence_action_counts: dict


class DefenceActionCreate(BaseModel):
    action_id: str
    approved_by: str


class DefenceActionResponse(BaseModel):
    id: str
    action_type: str
    target: str
    status: str
    requested_at: datetime
    approved_at: Optional[datetime] = None
    executed_at: Optional[datetime] = None
    approved_by: Optional[str] = None
    rule_id: Optional[str] = None
    expires_at: Optional[datetime] = None
    incident_id: Optional[str] = None
    dry_run: bool
    audit_log: Optional[dict] = None


class MobileInspectRequest(BaseModel):
    method: str
    path: str
    query: Optional[str] = None
    headers: Optional[dict] = None
    body: Optional[str] = None
    source_id: str


class MobileInspectResponse(BaseModel):
    decision: str  # ALLOWED, BLOCKED, FLAGGED
    threat_type: Optional[str] = None
    severity: Optional[str] = None
    reason: Optional[str] = None


class CopilotRequest(BaseModel):
    incident_id: Optional[str] = None
    event_ids: Optional[List[str]] = None
    analysis_type: str  # SUMMARIZE, EXPLAIN, RECOMMEND, REPORT


class CopilotResponse(BaseModel):
    analysis: str
    confidence: float
    sources_used: List[str]


class ReplaySessionResponse(BaseModel):
    id: str
    name: str
    status: str
    created_at: datetime
    speed: float
    current_position: int
    total_events: int


class PaginatedResponse(BaseModel, Generic[T]):
    total: int
    limit: int
    offset: int
    items: List[T]


