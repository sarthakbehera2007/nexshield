from __future__ import annotations

import enum
from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, Field


class AttackStage(str, enum.Enum):
    RECONNAISSANCE = "RECONNAISSANCE"
    WEAPONIZATION = "WEAPONIZATION"
    DELIVERY = "DELIVERY"
    EXPLOITATION = "EXPLOITATION"
    INSTALLATION = "INSTALLATION"
    C2 = "C2"
    EXFILTRATION = "EXFILTRATION"
    UNKNOWN = "UNKNOWN"


class IncidentStatus(str, enum.Enum):
    OPEN = "OPEN"
    INVESTIGATING = "INVESTIGATING"
    CONTAINED = "CONTAINED"
    RESOLVED = "RESOLVED"
    FALSE_POSITIVE = "FALSE_POSITIVE"


class IncidentCreate(BaseModel):
    title: str
    description: str
    risk_score: float = Field(ge=0, le=100)
    attack_stage: AttackStage
    source_ips: List[str]
    target_assets: List[str]
    recommended_action: Optional[str] = None
    score_explanation: Optional[str] = None

    class Config:
        json_schema_extra = {
            "example": {
                "title": "Suspicious Brute Force + Port Scan",
                "description": "Multiple failed SSH attempts followed by a port scan from the same IP.",
                "risk_score": 78.5,
                "attack_stage": "RECONNAISSANCE",
                "source_ips": ["192.168.1.45"],
                "target_assets": ["ssh-server"],
                "recommended_action": "Block source IP for 1 hour",
                "score_explanation": "High severity events and multiple indicators raise the risk."
            }
        }


class IncidentResponse(BaseModel):
    id: str
    title: str
    description: str
    risk_score: float
    attack_stage: AttackStage
    first_seen: datetime
    last_seen: datetime
    status: IncidentStatus
    recommended_action: Optional[str]
    source_ips: List[str]
    target_assets: List[str]
    event_count: int
    score_explanation: Optional[str]

    class Config:
        orm_mode = True


class IncidentSummary(BaseModel):
    id: str
    title: str
    risk_score: float
    attack_stage: AttackStage
    status: IncidentStatus
    first_seen: datetime
    last_seen: datetime

    class Config:
        orm_mode = True

