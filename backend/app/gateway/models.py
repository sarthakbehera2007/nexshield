"""SQLAlchemy models for Mobile Security Gateway (Phase 9)."""
from __future__ import annotations

import enum
import uuid
from datetime import datetime
from typing import Any, Dict, Optional

from sqlalchemy import (
    Boolean,
    Column,
    DateTime,
    Float,
    ForeignKey,
    Integer,
    JSON,
    String,
    Text,
)
from sqlalchemy.orm import relationship

from ..database.database import Base


class DeviceStatus(str, enum.Enum):
    ONLINE = "ONLINE"
    OFFLINE = "OFFLINE"
    REVOKED = "REVOKED"
    PENDING = "PENDING"


class MobileGatewayDevice(Base):
    __tablename__ = "gateway_mobile_devices"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    device_id = Column(String(64), unique=True, nullable=False, index=True)
    device_name = Column(String(128), nullable=False)
    platform = Column(String(32), default="Android")
    app_version = Column(String(32), default="1.0.0")
    api_key_hash = Column(String(128), nullable=False)  # Revocable device credential hash
    status = Column(String(32), default="ONLINE", index=True)  # ONLINE, OFFLINE, REVOKED
    registered_at = Column(DateTime, default=datetime.utcnow)
    last_seen = Column(DateTime, default=datetime.utcnow, index=True)
    total_events_reported = Column(Integer, default=0)
    total_sos_reported = Column(Integer, default=0)
    metadata_json = Column(JSON, default=dict)

    events = relationship("MobileSecurityReport", back_populates="device", cascade="all, delete-orphan")
    sos_alerts = relationship("MobileSOSAlert", back_populates="device", cascade="all, delete-orphan")


class MobileSecurityReport(Base):
    __tablename__ = "gateway_mobile_reports"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    device_id = Column(String(64), ForeignKey("gateway_mobile_devices.device_id"), nullable=False, index=True)
    event_type = Column(String(64), nullable=False, index=True)  # SUSPICIOUS_URL, SUSPICIOUS_SMS, APP_ANOMALY, etc.
    severity = Column(String(16), default="MEDIUM", index=True)  # LOW, MEDIUM, HIGH, CRITICAL
    description = Column(Text, nullable=False)
    evidence_metadata = Column(JSON, default=dict)
    source = Column(String(64), default="mobile_agent")
    status = Column(String(32), default="NEW")
    is_demo = Column(Boolean, default=False)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)

    device = relationship("MobileGatewayDevice", back_populates="events")


class MobileSOSAlert(Base):
    __tablename__ = "gateway_mobile_sos"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    device_id = Column(String(64), ForeignKey("gateway_mobile_devices.device_id"), nullable=False, index=True)
    alert_category = Column(String(64), nullable=False)  # PERSONAL_SAFETY, CYBER_BREACH, SUSPICIOUS_ACTIVITY, etc.
    message = Column(Text, nullable=False)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    location_description = Column(String(255), nullable=True)
    status = Column(String(32), default="ACTIVE", index=True)  # ACTIVE, ACKNOWLEDGED, RESOLVED
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)

    device = relationship("MobileGatewayDevice", back_populates="sos_alerts")

