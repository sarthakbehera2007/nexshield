"""Device Manager handling mobile device registration, status, and lifecycle."""
from __future__ import annotations

import logging
from datetime import datetime
from typing import List, Optional
from sqlalchemy import select, func, and_
from sqlalchemy.ext.asyncio import AsyncSession

from .models import MobileGatewayDevice
from .schemas import DeviceRegistrationRequest, DeviceRegistrationResponse
from .device_auth import generate_device_credentials, hash_api_key

logger = logging.getLogger("gateway.devices")


class DeviceManager:
    @staticmethod
    async def register_device(
        db: AsyncSession,
        req: DeviceRegistrationRequest,
    ) -> DeviceRegistrationResponse:
        # Check if device_id was client-supplied and already exists
        if req.device_id:
            stmt = select(MobileGatewayDevice).where(MobileGatewayDevice.device_id == req.device_id)
            res = await db.execute(stmt)
            existing = res.scalars().first()
            if existing:
                if existing.status == "REVOKED":
                    raise ValueError(f"Device '{req.device_id}' is permanently revoked.")
                # Update device info and re-issue key
                _, new_api_key, new_hash = generate_device_credentials()
                existing.device_name = req.device_name
                existing.platform = req.platform
                existing.app_version = req.app_version
                existing.api_key_hash = new_hash
                existing.last_seen = datetime.utcnow()
                existing.status = "ONLINE"
                await db.flush()
                return DeviceRegistrationResponse(
                    device_id=existing.device_id,
                    device_name=existing.device_name,
                    api_key=new_api_key,
                    platform=existing.platform,
                    app_version=existing.app_version,
                    status=existing.status,
                    registered_at=existing.registered_at,
                )

        device_id, api_key, key_hash = generate_device_credentials()
        if req.device_id:
            device_id = req.device_id

        device = MobileGatewayDevice(
            device_id=device_id,
            device_name=req.device_name,
            platform=req.platform,
            app_version=req.app_version,
            api_key_hash=key_hash,
            status="ONLINE",
            registered_at=datetime.utcnow(),
            last_seen=datetime.utcnow(),
        )
        db.add(device)
        await db.flush()
        logger.info("Mobile device registered: %s (%s)", device.device_name, device.device_id)

        return DeviceRegistrationResponse(
            device_id=device.device_id,
            device_name=device.device_name,
            api_key=api_key,
            platform=device.platform,
            app_version=device.app_version,
            status=device.status,
            registered_at=device.registered_at,
        )

    @staticmethod
    async def list_devices(
        db: AsyncSession,
        status: Optional[str] = None,
        limit: int = 50,
        offset: int = 0,
    ) -> List[MobileGatewayDevice]:
        stmt = (
            select(MobileGatewayDevice)
            .order_by(MobileGatewayDevice.last_seen.desc())
            .limit(limit)
            .offset(offset)
        )
        if status:
            stmt = stmt.where(MobileGatewayDevice.status == status)
        result = await db.execute(stmt)
        return list(result.scalars().all())

    @staticmethod
    async def get_device(db: AsyncSession, device_id: str) -> Optional[MobileGatewayDevice]:
        stmt = select(MobileGatewayDevice).where(MobileGatewayDevice.device_id == device_id)
        result = await db.execute(stmt)
        return result.scalars().first()

    @staticmethod
    async def revoke_device(db: AsyncSession, device_id: str) -> bool:
        device = await DeviceManager.get_device(db, device_id)
        if not device:
            return False
        device.status = "REVOKED"
        await db.flush()
        logger.warning("Mobile device revoked by operator: %s", device_id)
        return True

    @staticmethod
    async def delete_device(db: AsyncSession, device_id: str) -> bool:
        device = await DeviceManager.get_device(db, device_id)
        if not device:
            return False
        await db.delete(device)
        await db.flush()
        logger.info("Mobile device deregistered/deleted: %s", device_id)
        return True

