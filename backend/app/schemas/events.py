from __future__ import annotations

import enum
from datetime import datetime
from typing import List, Literal, Optional

from pydantic import BaseModel, Field, HttpUrl


class EventType(str, enum.Enum):
    PORT_SCAN = "PORT_SCAN"
    BRUTE_FORCE = "BRUTE_FORCE"
    SQL_INJECTION = "SQL_INJECTION"
    XSS_ATTEMPT = "XSS_ATTEMPT"
    SUSPICIOUS_TRAFFIC = "SUSPICIOUS_TRAFFIC"
    FILE_MODIFICATION = "FILE_MODIFICATION"
    FILE_DELETION = "FILE_DELETION"
    USB_DEVICE = "USB_DEVICE"
    HONEYPOT_INTERACTION = "HONEYPOT_INTERACTION"


class Severity(str, enum.Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"


class EventStatus(str, enum.Enum):
    NEW = "NEW"
    ACKNOWLEDGED = "ACKNOWLEDGED"
    INVESTIGATING = "INVESTIGATING"
    RESOLVED = "RESOLVED"
    FALSE_POSITIVE = "FALSE_POSITIVE"


class EventEvidence(BaseModel):
    evidence_type: str
    content: str
    file_path: Optional[str] = None
    hash_sha256: Optional[str] = None


class SecurityEventCreate(BaseModel):
    source_ip: str = Field(..., description="Source IP address")
    destination_ip: str = Field(..., description="Destination IP address")
    event_type: EventType
    severity: Severity
    description: str
    detection_source: str
    evidence: Optional[dict] = None
    confidence: float = Field(ge=0.0, le=1.0, default=1.0)
    raw_data: Optional[dict] = None

    class Config:
        json_schema_extra = {
            "example": {
                "source_ip": "192.168.1.10",
                "destination_ip": "192.168.1.1",
                "event_type": "PORT_SCAN",
                "severity": "MEDIUM",
                "description": "Multiple SYN packets detected",
                "detection_source": "network_detector",
                "evidence": {"packet_count": 120},
                "confidence": 0.95,
                "raw_data": {"raw": "..."},
            }
        }


class SecurityEventResponse(BaseModel):
    id: str
    timestamp: datetime
    source_ip: str
    destination_ip: str
    event_type: EventType
    severity: Severity
    description: str
    detection_source: str
    evidence: Optional[dict]
    status: EventStatus
    confidence: float
    risk_score: Optional[float] = None
    incident_id: Optional[str] = None
    raw_data: Optional[dict] = None

    class Config:
        orm_mode = True


class SecurityEventFilter(BaseModel):
    event_type: Optional[EventType] = None
    severity: Optional[Severity] = None
    status: Optional[EventStatus] = None
    source_ip: Optional[str] = None
    since: Optional[datetime] = None
    limit: int = Field(50, ge=1, le=500)
    offset: int = Field(0, ge=0)


class WebSocketMessage(BaseModel):
    message_type: Literal[
        "NEW_EVENT",
        "INCIDENT_UPDATE",
        "RISK_CHANGE",
        "SENSOR_STATUS",
        "DEFENCE_ACTION",
        "HEARTBEAT",
    ]
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    data: dict


class MobileInspectRequest(BaseModel):
    source_id: str
    method: str
    path: str
    query: Optional[str] = None
    body: Optional[str] = None
    headers: Optional[dict] = None


class MobileInspectResponse(BaseModel):
    decision: str = "ALLOWED"
    threat_type: Optional[str] = None
    severity: Optional[str] = None
    reason: Optional[str] = None
    inspection_id: Optional[str] = None


