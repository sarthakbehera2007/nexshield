"""Pydantic schemas for Mobile Security Gateway (Phase 9)."""
from __future__ import annotations

from datetime import datetime
from enum import Enum
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field


class MobileDeviceStatus(str, Enum):
    ONLINE = "ONLINE"
    OFFLINE = "OFFLINE"
    REVOKED = "REVOKED"


class DeviceRegistrationRequest(BaseModel):
    device_name: str = Field(..., min_length=2, max_length=64, description="Name of the mobile device")
    platform: str = Field("Android", description="Operating system platform")
    app_version: str = Field("1.0.0", description="NEXSHIELD mobile application version")
    device_id: Optional[str] = Field(None, description="Optional persistent client device ID (UUID)")


class DeviceRegistrationResponse(BaseModel):
    device_id: str
    device_name: str
    api_key: str = Field(..., description="Secret device credential. Store securely on client.")
    platform: str
    app_version: str
    status: str
    registered_at: datetime


class DeviceHeartbeatRequest(BaseModel):
    app_version: Optional[str] = "1.0.0"
    connection_status: Optional[str] = "ONLINE"
    battery_level: Optional[float] = None


class DeviceHeartbeatResponse(BaseModel):
    device_id: str
    status: str
    last_seen: datetime
    server_time: datetime
    active_incidents_count: int = 0


class MobileEventReportRequest(BaseModel):
    event_type: str = Field(..., description="SUSPICIOUS_URL | SUSPICIOUS_SMS | UNKNOWN_DEVICE | APP_ANOMALY | ACCOUNT_COMPROMISE")
    severity: str = Field("MEDIUM", description="LOW | MEDIUM | HIGH | CRITICAL")
    description: str = Field(..., min_length=3, max_length=1000)
    evidence_metadata: Optional[Dict[str, Any]] = Field(default_factory=dict)
    source: Optional[str] = "mobile_agent"
    is_demo: Optional[bool] = False
    client_timestamp: Optional[datetime] = None


class MobileEventReportResponse(BaseModel):
    id: str = Field(..., alias="event_id")
    device_id: str
    event_type: str
    severity: str
    description: str
    timestamp: datetime
    status: str

    class Config:
        from_attributes = True
        populate_by_name = True


class SOSAlertRequest(BaseModel):
    alert_category: str = Field(..., description="PERSONAL_SAFETY | SUSPICIOUS_ACTIVITY | COMPROMISE_CONCERN | CYBER_INCIDENT | EMERGENCY")
    message: str = Field(..., min_length=3, max_length=1000)
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    location_description: Optional[str] = None


class SOSAlertResponse(BaseModel):
    id: str = Field(..., alias="alert_id")
    device_id: str
    alert_category: str
    message: str
    status: str
    timestamp: datetime
    latitude: Optional[float] = None
    longitude: Optional[float] = None

    class Config:
        from_attributes = True
        populate_by_name = True


class URLInspectionRequest(BaseModel):
    url: str = Field(..., min_length=4, max_length=2048)


class URLInspectionResponse(BaseModel):
    url: str
    is_suspicious: bool
    risk_score: float
    indicators: List[str]
    verdict: str  # SAFE | SUSPICIOUS | MALICIOUS
    details: Dict[str, Any]


class MobileGatewayStatus(BaseModel):
    active_devices_count: int
    online_devices_count: int
    total_events_reported: int
    total_sos_alerts: int
    system_version: str
    gateway_online: bool

