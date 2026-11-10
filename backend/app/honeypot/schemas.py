"""Pydantic schemas for Digital Honeypot subsystem."""
from __future__ import annotations

from datetime import datetime
from enum import Enum
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field


class DecoyServiceType(str, Enum):
    HTTP_PORTAL = "HTTP_PORTAL"
    ADMIN_LOGIN = "ADMIN_LOGIN"
    FAKE_API = "FAKE_API"
    SSH_BANNER = "SSH_BANNER"
    DATABASE_BANNER = "DATABASE_BANNER"


class InteractionClassification(str, Enum):
    SERVICE_DISCOVERY = "SERVICE_DISCOVERY"
    ENDPOINT_ENUMERATION = "ENDPOINT_ENUMERATION"
    REPEATED_LOGIN = "REPEATED_LOGIN"
    API_PROBING = "API_PROBING"
    PAYLOAD_INJECTION = "PAYLOAD_INJECTION"
    RECONNAISSANCE = "RECONNAISSANCE"
    BENIGN = "BENIGN"


class HoneypotInteractionCreate(BaseModel):
    service_name: DecoyServiceType
    source_ip: str
    method: str = "GET"
    path: str = "/"
    user_agent: Optional[str] = None
    headers: Optional[Dict[str, str]] = None
    query_params: Optional[Dict[str, str]] = None
    payload: Optional[Dict[str, Any]] = None


class HoneypotInteractionResponse(BaseModel):
    id: str
    session_id: str
    source_ip: str
    service_name: str
    method: str
    path: str
    user_agent: Optional[str]
    classification: str
    severity: str
    indicators: List[str]
    timestamp: datetime

    class Config:
        from_attributes = True


class HoneypotSessionResponse(BaseModel):
    id: str
    source_ip: str
    started_at: datetime
    last_seen: datetime
    interaction_count: int
    services_touched: List[str]
    primary_classification: str
    status: str  # ACTIVE | CLOSED

    class Config:
        from_attributes = True


class HoneypotStatus(BaseModel):
    enabled: bool
    decoy_services: List[str]
    active_sessions_count: int
    total_interactions_count: int
    bind_interface: str
    safe_simulation: bool

