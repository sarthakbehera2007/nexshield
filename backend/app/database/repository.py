from __future__ import annotations

from typing import Any, Dict, List, Optional
from sqlalchemy import select, update, func
from ..models import MobileDevice, ReplaySession
from datetime import datetime, timedelta

from sqlalchemy import select, update, and_, func
from sqlalchemy.exc import NoResultFound

from ..database.database import get_db
from ..database.models import SecurityEvent, Incident, DefenceAction, Sensor, EventStatus, IncidentStatus, DefenceActionStatus, SensorStatus, MobileDevice, ReplaySession

# -------------------- Event Repository --------------------
class EventRepository:
    @staticmethod
    ...
    @staticmethod
    async def create_event(session, event_data: Dict[str, Any]) -> SecurityEvent:
        event = SecurityEvent(**event_data)
        session.add(event)
        await session.flush()
        return event

    @staticmethod
    async def get_event(session, event_id: str) -> Optional[SecurityEvent]:
        stmt = select(SecurityEvent).where(SecurityEvent.id == event_id)
        result = await session.execute(stmt)
        return result.scalar_one_or_none()

    @staticmethod
    async def list_events(
        session,
        limit: int = 50,
        offset: int = 0,
        filters: Optional[Dict[str, Any]] = None,
    ) -> List[SecurityEvent]:
        stmt = select(SecurityEvent).order_by(SecurityEvent.timestamp.desc()).limit(limit).offset(offset)
        if filters:
            if "event_type" in filters:
                stmt = stmt.where(SecurityEvent.event_type == filters["event_type"])  # type: ignore[arg-type]
            if "severity" in filters:
                stmt = stmt.where(SecurityEvent.severity == filters["severity"])  # type: ignore[arg-type]
            if "status" in filters:
                stmt = stmt.where(SecurityEvent.status == filters["status"])  # type: ignore[arg-type]
            if "source_ip" in filters:
                stmt = stmt.where(SecurityEvent.source_ip == filters["source_ip"])
            if "since" in filters:
                stmt = stmt.where(SecurityEvent.timestamp >= filters["since"])
        result = await session.execute(stmt)
        return result.scalars().all()

    @staticmethod
    async def update_event_status(session, event_id: str, status: EventStatus) -> Optional[SecurityEvent]:
        stmt = (
            update(SecurityEvent)
            .where(SecurityEvent.id == event_id)
            .values(status=status)
            .execution_options(synchronize_session="fetch")
        )
        await session.execute(stmt)
        await session.commit()
        return await EventRepository.get_event(session, event_id)

    @staticmethod
    async def get_events_by_ip(session, ip: str, since: datetime) -> List[SecurityEvent]:
        stmt = select(SecurityEvent).where(
            and_(SecurityEvent.source_ip == ip, SecurityEvent.timestamp >= since)
        )
        result = await session.execute(stmt)
        return result.scalars().all()

    @staticmethod
    async def count_events_by_type(session, event_type: Any, since: datetime) -> int:
        stmt = select(func.count()).where(
            and_(SecurityEvent.event_type == event_type, SecurityEvent.timestamp >= since)
        )
        result = await session.execute(stmt)
        return result.scalar_one()

# -------------------- Incident Repository --------------------
class IncidentRepository:
    @staticmethod
    async def create_incident(session, data: Dict[str, Any]) -> Incident:
        incident = Incident(**data)
        session.add(incident)
        await session.flush()
        return incident

    @staticmethod
    async def get_incident(session, incident_id: str) -> Optional[Incident]:
        stmt = select(Incident).where(Incident.id == incident_id)
        result = await session.execute(stmt)
        return result.scalar_one_or_none()

    @staticmethod
    async def list_incidents(session, limit: int = 50, offset: int = 0) -> List[Incident]:
        stmt = select(Incident).order_by(Incident.first_seen.desc()).limit(limit).offset(offset)
        result = await session.execute(stmt)
        return result.scalars().all()

    @staticmethod
    async def update_incident(session, incident_id: str, data: Dict[str, Any]) -> Optional[Incident]:
        stmt = (
            update(Incident)
            .where(Incident.id == incident_id)
            .values(**data)
            .execution_options(synchronize_session="fetch")
        )
        await session.execute(stmt)
        await session.commit()
        return await IncidentRepository.get_incident(session, incident_id)

    @staticmethod
    async def find_similar_incident(
        session, source_ips: List[str], window_hours: int = 24
    ) -> Optional[Incident]:
        since = datetime.utcnow() - timedelta(hours=window_hours)
        stmt = select(Incident).where(
            and_(Incident.first_seen >= since, Incident.source_ips.contains(source_ips))
        )
        result = await session.execute(stmt)
        return result.scalar_one_or_none()

# -------------------- Replay Session Repository --------------------
class ReplaySessionRepository:
    @staticmethod
    async def create_session(session, data: Dict[str, Any]):
        replay = ReplaySession(**data)
        session.add(replay)
        await session.flush()
        return replay

    @staticmethod
    async def get_session(session, session_id: str):
        stmt = select(ReplaySession).where(ReplaySession.id == session_id)
        result = await session.execute(stmt)
        return result.scalar_one_or_none()

    @staticmethod
    async def list_sessions(session, limit: int = 50, offset: int = 0):
        stmt = select(ReplaySession).order_by(ReplaySession.created_at.desc()).limit(limit).offset(offset)
        result = await session.execute(stmt)
        return result.scalars().all()

    @staticmethod
    async def count_sessions(session):
        stmt = select(func.count()).select_from(ReplaySession)
        result = await session.execute(stmt)
        return result.scalar_one()

    @staticmethod
    async def update_session(session, session_id: str, data: Dict[str, Any]):
        stmt = (
            update(ReplaySession)
            .where(ReplaySession.id == session_id)
            .values(**data)
            .execution_options(synchronize_session="fetch")
        )
        await session.execute(stmt)
        await session.commit()
        return await ReplaySessionRepository.get_session(session, session_id)

    @staticmethod
    async def get_incident(session, incident_id: str):
        # Helper for replay creation – fetch incident for title
        stmt = select(Incident).where(Incident.id == incident_id)
        result = await session.execute(stmt)
        return result.scalar_one_or_none()

class DefenceRepository:
    @staticmethod
    async def create_action(session, data: Dict[str, Any]) -> DefenceAction:
        action = DefenceAction(**data)
        session.add(action)
        await session.flush()
        return action

    @staticmethod
    async def get_action(session, action_id: str) -> Optional[DefenceAction]:
        stmt = select(DefenceAction).where(DefenceAction.id == action_id)
        result = await session.execute(stmt)
        return result.scalar_one_or_none()

    @staticmethod
    async def list_actions(session, limit: int = 100) -> List[DefenceAction]:
        stmt = select(DefenceAction).order_by(DefenceAction.requested_at.desc()).limit(limit)
        result = await session.execute(stmt)
        return result.scalars().all()

    @staticmethod
    async def update_action(session, action_id: str, data: Dict[str, Any]) -> Optional[DefenceAction]:
        stmt = (
            update(DefenceAction)
            .where(DefenceAction.id == action_id)
            .values(**data)
            .execution_options(synchronize_session="fetch")
        )
        await session.execute(stmt)
        await session.commit()
        return await DefenceRepository.get_action(session, action_id)

    @staticmethod
    async def get_pending_actions(session) -> List[DefenceAction]:
        stmt = select(DefenceAction).where(
            DefenceAction.status == DefenceActionStatus.PENDING
        )
        result = await session.execute(stmt)
        return result.scalars().all()

class DefenceRepository:
    @staticmethod
    async def create_action(session, data: Dict[str, Any]) -> DefenceAction:
        action = DefenceAction(**data)
        session.add(action)
        await session.flush()
        return action

    @staticmethod
    async def get_action(session, action_id: str) -> Optional[DefenceAction]:
        stmt = select(DefenceAction).where(DefenceAction.id == action_id)
        result = await session.execute(stmt)
        return result.scalar_one_or_none()

    @staticmethod
    async def list_actions(session, limit: int = 100) -> List[DefenceAction]:
        stmt = select(DefenceAction).order_by(DefenceAction.requested_at.desc()).limit(limit)
        result = await session.execute(stmt)
        return result.scalars().all()

    @staticmethod
    async def update_action(session, action_id: str, data: Dict[str, Any]) -> Optional[DefenceAction]:
        stmt = (
            update(DefenceAction)
            .where(DefenceAction.id == action_id)
            .values(**data)
            .execution_options(synchronize_session="fetch")
        )
        await session.execute(stmt)
        await session.commit()
        return await DefenceRepository.get_action(session, action_id)

    @staticmethod
    async def get_pending_actions(session) -> List[DefenceAction]:
        stmt = select(DefenceAction).where(
            DefenceAction.status == DefenceActionStatus.PENDING
        )
        result = await session.execute(stmt)
        return result.scalars().all()

# -------------------- Sensor Repository --------------------
class SensorRepository:
    @staticmethod
    async def upsert_sensor(session, sensor_id: str, data: Dict[str, Any]) -> Sensor:
        stmt = select(Sensor).where(Sensor.id == sensor_id)
        result = await session.execute(stmt)
        sensor = result.scalar_one_or_none()
        if sensor:
            for key, value in data.items():
                setattr(sensor, key, value)
        else:
            sensor = Sensor(id=sensor_id, **data)
            session.add(sensor)
        await session.flush()
        return sensor

    @staticmethod
    async def list_sensors(session) -> List[Sensor]:
        stmt = select(Sensor)
        result = await session.execute(stmt)
        return result.scalars().all()

    @staticmethod
    async def update_sensor_status(
        session, sensor_id: str, status: SensorStatus, error: Optional[str] = None
    ) -> Optional[Sensor]:
        stmt = (
            update(Sensor)
            .where(Sensor.id == sensor_id)
            .values(status=status, error_message=error, last_seen=datetime.utcnow())
            .execution_options(synchronize_session="fetch")
        )
        await session.execute(stmt)
        await session.commit()
        stmt = select(Sensor).where(Sensor.id == sensor_id)
        result = await session.execute(stmt)
        return result.scalar_one_or_none()

# -------------------- Mobile Device Repository --------------------
class MobileDeviceRepository:
    @staticmethod
    async def upsert_device(session, device_id: str, name: str):
        stmt = select(MobileDevice).where(MobileDevice.device_id == device_id)
        result = await session.execute(stmt)
        device = result.scalar_one_or_none()
        now = datetime.utcnow()
        if device:
            device.last_seen = now
            device.name = name
            device.requests_total = (device.requests_total or 0) + 1
        else:
            device = MobileDevice(
                device_id=device_id,
                name=name,
                last_seen=now,
                requests_total=1,
                status="ACTIVE",
            )
            session.add(device)
        await session.flush()
        return device

    @staticmethod
    async def increment_blocked(session, device_id: str):
        stmt = (
            update(MobileDevice)
            .where(MobileDevice.device_id == device_id)
            .values(requests_blocked=MobileDevice.requests_blocked + 1)
        )
        await session.execute(stmt)
        await session.flush()

    @staticmethod
    async def list_devices(session, limit: int, offset: int):
        stmt = select(MobileDevice).order_by(MobileDevice.last_seen.desc()).limit(limit).offset(offset)
        result = await session.execute(stmt)
        devices = result.scalars().all()
        return [
            {
                "device_id": d.device_id,
                "name": d.name,
                "status": d.status,
                "last_seen": d.last_seen.isoformat() if d.last_seen else None,
                "requests_total": d.requests_total,
                "requests_blocked": d.requests_blocked,
            }
            for d in devices
        ]

    @staticmethod
    async def count_devices(session) -> int:
        stmt = select(func.count()).select_from(MobileDevice)
        result = await session.execute(stmt)
        return result.scalar_one()

class SensorRepository:
    @staticmethod
    async def upsert_sensor(session, sensor_id: str, data: Dict[str, Any]) -> Sensor:
        stmt = select(Sensor).where(Sensor.id == sensor_id)
        result = await session.execute(stmt)
        sensor = result.scalar_one_or_none()
        if sensor:
            for key, value in data.items():
                setattr(sensor, key, value)
        else:
            sensor = Sensor(id=sensor_id, **data)
            session.add(sensor)
        await session.flush()
        return sensor

    @staticmethod
    async def list_sensors(session) -> List[Sensor]:
        stmt = select(Sensor)
        result = await session.execute(stmt)
        return result.scalars().all()

    @staticmethod
    async def update_sensor_status(
        session, sensor_id: str, status: SensorStatus, error: Optional[str] = None
    ) -> Optional[Sensor]:
        stmt = (
            update(Sensor)
            .where(Sensor.id == sensor_id)
            .values(status=status, error_message=error, last_seen=datetime.utcnow())
            .execution_options(synchronize_session="fetch")
        )
        await session.execute(stmt)
        await session.commit()
        stmt = select(Sensor).where(Sensor.id == sensor_id)
        result = await session.execute(stmt)
        return result.scalar_one_or_none()

# -------------------- Mobile Device Repository --------------------
class MobileDeviceRepository:
    @staticmethod
    async def upsert_device(session, device_id: str, name: str) -> MobileDevice:
        stmt = select(MobileDevice).where(MobileDevice.device_id == device_id)
        result = await session.execute(stmt)
        device = result.scalar_one_or_none()
        now = datetime.utcnow()
        if device:
            device.last_seen = now
            device.name = name
            device.requests_total += 1
        else:
            device = MobileDevice(
                device_id=device_id,
                name=name,
                last_seen=now,
                requests_total=1,
                status="ACTIVE",
            )
            session.add(device)
        await session.flush()
        return device

    @staticmethod
    async def increment_blocked(session, device_id: str) -> None:
        stmt = (
            update(MobileDevice)
            .where(MobileDevice.device_id == device_id)
            .values(requests_blocked=MobileDevice.requests_blocked + 1)
        )
        await session.execute(stmt)
        await session.flush()

    @staticmethod
    async def list_devices(session, limit: int, offset: int) -> List[Dict[str, Any]]:
        stmt = select(MobileDevice).order_by(MobileDevice.last_seen.desc()).limit(limit).offset(offset)
        result = await session.execute(stmt)
        devices = result.scalars().all()
        return [
            {
                "device_id": d.device_id,
                "name": d.name,
                "status": d.status,
                "last_seen": d.last_seen.isoformat() if d.last_seen else None,
                "requests_total": d.requests_total,
                "requests_blocked": d.requests_blocked,
            }
            for d in devices
        ]

    @staticmethod
    async def count_devices(session) -> int:
        stmt = select(func.count()).select_from(MobileDevice)
        result = await session.execute(stmt)
        return result.scalar_one()

class SensorRepository:
    @staticmethod
    async def upsert_sensor(session, sensor_id: str, data: Dict[str, Any]) -> Sensor:
        # Try to fetch existing
        stmt = select(Sensor).where(Sensor.id == sensor_id)
        result = await session.execute(stmt)
        sensor = result.scalar_one_or_none()
        if sensor:
            for key, value in data.items():
                setattr(sensor, key, value)
        else:
            sensor = Sensor(id=sensor_id, **data)
            session.add(sensor)
        await session.flush()
        return sensor

    @staticmethod
    async def list_sensors(session) -> List[Sensor]:
        stmt = select(Sensor)
        result = await session.execute(stmt)
        return result.scalars().all()

    @staticmethod
    async def update_sensor_status(
        session, sensor_id: str, status: SensorStatus, error: Optional[str] = None
    ) -> Optional[Sensor]:
        stmt = (
            update(Sensor)
            .where(Sensor.id == sensor_id)
            .values(status=status, error_message=error, last_seen=datetime.utcnow())
            .execution_options(synchronize_session="fetch")
        )
        await session.execute(stmt)
        await session.commit()
        # Return updated sensor
        stmt = select(Sensor).where(Sensor.id == sensor_id)
        result = await session.execute(stmt)
        return result.scalar_one_or_none()

