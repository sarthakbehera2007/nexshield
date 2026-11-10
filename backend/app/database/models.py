from __future__ import annotations

import enum
import uuid
from datetime import datetime
from typing import List, Optional, Any

from sqlalchemy import Column, String, DateTime, Enum, Float, Text, Integer, JSON, ForeignKey, Boolean
from sqlalchemy.orm import relationship

from .database import Base

# Enumerations
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

class IncidentStatus(str, enum.Enum):
    OPEN = "OPEN"
    INVESTIGATING = "INVESTIGATING"
    CONTAINED = "CONTAINED"
    RESOLVED = "RESOLVED"
    FALSE_POSITIVE = "FALSE_POSITIVE"

class AttackStage(str, enum.Enum):
    RECONNAISSANCE = "RECONNAISSANCE"
    WEAPONIZATION = "WEAPONIZATION"
    DELIVERY = "DELIVERY"
    EXPLOITATION = "EXPLOITATION"
    INSTALLATION = "INSTALLATION"
    C2 = "C2"
    EXFILTRATION = "EXFILTRATION"
    UNKNOWN = "UNKNOWN"

class SensorType(str, enum.Enum):
    NETWORK = "NETWORK"
    AUTH_LOG = "AUTH_LOG"
    FILE_INTEGRITY = "FILE_INTEGRITY"
    USB = "USB"
    GATEWAY = "GATEWAY"
    DEMO = "DEMO"

class SensorStatus(str, enum.Enum):
    ACTIVE = "ACTIVE"
    INACTIVE = "INACTIVE"
    ERROR = "ERROR"
    DEMO = "DEMO"

class DefenceActionType(str, enum.Enum):
    BLOCK_IP = "BLOCK_IP"
    UNBLOCK_IP = "UNBLOCK_IP"
    REJECT_REQUEST = "REJECT_REQUEST"
    PRESERVE_EVIDENCE = "PRESERVE_EVIDENCE"
    CUSTOM = "CUSTOM"

class DefenceActionStatus(str, enum.Enum):
    PENDING = "PENDING"
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"
    EXECUTED = "EXECUTED"
    ROLLED_BACK = "ROLLED_BACK"
    FAILED = "FAILED"
    DRY_RUN = "DRY_RUN"

# Models
class SecurityEvent(Base):
    __tablename__ = "security_events"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    timestamp = Column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)
    source_ip = Column(String, nullable=False)
    destination_ip = Column(String, nullable=False)
    event_type = Column(Enum(EventType), nullable=False)
    severity = Column(Enum(Severity), nullable=False)
    description = Column(Text, nullable=False)
    detection_source = Column(String, nullable=False)
    evidence = Column(JSON, nullable=True)
    status = Column(Enum(EventStatus), default=EventStatus.NEW, nullable=False)
    confidence = Column(Float, nullable=False, default=1.0)
    risk_score = Column(Float, nullable=True)
    incident_id = Column(String, ForeignKey("incidents.id"), nullable=True)
    raw_data = Column(JSON, nullable=True)

    incident = relationship("Incident", back_populates="events")

class Incident(Base):
    __tablename__ = "incidents"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    title = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    risk_score = Column(Float, nullable=False)
    attack_stage = Column(Enum(AttackStage), nullable=False)
    first_seen = Column(DateTime(timezone=True), nullable=False)
    last_seen = Column(DateTime(timezone=True), nullable=False)
    status = Column(Enum(IncidentStatus), default=IncidentStatus.OPEN, nullable=False)
    recommended_action = Column(Text, nullable=True)
    source_ips = Column(JSON, nullable=True)  # list of strings
    target_assets = Column(JSON, nullable=True)  # list of identifiers
    event_count = Column(Integer, default=0)
    score_explanation = Column(Text, nullable=True)

    events = relationship("SecurityEvent", back_populates="incident", cascade="all, delete-orphan")

class Evidence(Base):
    __tablename__ = "evidences"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    incident_id = Column(String, ForeignKey("incidents.id"), nullable=True)
    event_id = Column(String, ForeignKey("security_events.id"), nullable=True)
    evidence_type = Column(String, nullable=False)
    content = Column(Text, nullable=False)
    file_path = Column(String, nullable=True)
    hash_sha256 = Column(String, nullable=True)
    collected_at = Column(DateTime(timezone=True), default=datetime.utcnow)

    incident = relationship("Incident", backref="evidences")
    event = relationship("SecurityEvent", backref="evidences")

class Sensor(Base):
    __tablename__ = "sensors"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String, nullable=False)
    sensor_type = Column(Enum(SensorType), nullable=False)
    status = Column(Enum(SensorStatus), default=SensorStatus.INACTIVE, nullable=False)
    last_seen = Column(DateTime(timezone=True), nullable=True)
    config = Column(JSON, nullable=True)
    events_generated = Column(Integer, default=0)
    error_message = Column(Text, nullable=True)

class DefenceAction(Base):
    __tablename__ = "defence_actions"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    action_type = Column(Enum(DefenceActionType), nullable=False)
    target = Column(String, nullable=False)
    status = Column(Enum(DefenceActionStatus), default=DefenceActionStatus.PENDING, nullable=False)
    requested_at = Column(DateTime(timezone=True), default=datetime.utcnow)
    approved_at = Column(DateTime(timezone=True), nullable=True)
    executed_at = Column(DateTime(timezone=True), nullable=True)
    approved_by = Column(String, nullable=True)
    rule_id = Column(String, nullable=True)
    expires_at = Column(DateTime(timezone=True), nullable=True)
    incident_id = Column(String, ForeignKey("incidents.id"), nullable=True)
    dry_run = Column(Boolean, default=True)
    rollback_data = Column(JSON, nullable=True)
    audit_log = Column(JSON, nullable=True)  # list of dicts

    incident = relationship("Incident", backref="defence_actions")

class MobileDevice(Base):
    __tablename__ = "mobile_devices"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    device_id = Column(String, unique=True, nullable=False)
    name = Column(String, nullable=False)
    last_seen = Column(DateTime(timezone=True), nullable=True)
    status = Column(String, default="ACTIVE")
    requests_total = Column(Integer, default=0)
    requests_blocked = Column(Integer, default=0)
    last_request_at = Column(DateTime(timezone=True), nullable=True)

class ReplaySession(Base):
    __tablename__ = "replay_sessions"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)
    status = Column(String, default="READY")
    speed = Column(Float, default=1.0)
    current_position = Column(Integer, default=0)
    event_sequence = Column(JSON, nullable=True)  # list of event dicts
    total_events = Column(Integer, default=0)
    started_at = Column(DateTime(timezone=True), nullable=True)
    completed_at = Column(DateTime(timezone=True), nullable=True)

