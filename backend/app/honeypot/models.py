"""SQLAlchemy models for Honeypot sessions, interactions, and telemetry."""
from __future__ import annotations

import uuid
from datetime import datetime
from sqlalchemy import (
    Column,
    DateTime,
    Integer,
    JSON,
    String,
    Text,
    ForeignKey,
)
from sqlalchemy.orm import relationship

from ..database.database import Base


class HoneypotSession(Base):
    __tablename__ = "honeypot_sessions"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    source_ip = Column(String(64), nullable=False, index=True)
    started_at = Column(DateTime, default=datetime.utcnow, index=True)
    last_seen = Column(DateTime, default=datetime.utcnow, index=True)
    interaction_count = Column(Integer, default=1)
    services_touched = Column(JSON, default=list)  # e.g. ["HTTP_PORTAL", "SSH_BANNER"]
    primary_classification = Column(String(64), default="SERVICE_DISCOVERY")
    status = Column(String(16), default="ACTIVE")  # ACTIVE | CLOSED

    interactions = relationship("HoneypotInteraction", back_populates="session", cascade="all, delete-orphan")


class HoneypotInteraction(Base):
    __tablename__ = "honeypot_interactions"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    session_id = Column(String(36), ForeignKey("honeypot_sessions.id"), nullable=False, index=True)
    source_ip = Column(String(64), nullable=False, index=True)
    service_name = Column(String(64), nullable=False, index=True)
    method = Column(String(16), default="GET")
    path = Column(String(255), default="/")
    user_agent = Column(String(255), nullable=True)
    classification = Column(String(64), default="SERVICE_DISCOVERY")
    severity = Column(String(16), default="LOW")
    indicators = Column(JSON, default=list)
    sanitized_metadata = Column(JSON, default=dict)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)

    session = relationship("HoneypotSession", back_populates="interactions")

