"""Device Authentication and Credential Management for Mobile Gateway."""
from __future__ import annotations

import hashlib
import hmac
import secrets
from typing import Optional, Tuple
from fastapi import Header, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from .models import MobileGatewayDevice


def generate_device_credentials() -> Tuple[str, str, str]:
    """
    Generates (device_id, api_key, api_key_hash).
    """
    device_id = f"mdev-{secrets.token_hex(12)}"
    api_key = f"nxs_mob_{secrets.token_urlsafe(32)}"
    api_key_hash = hashlib.sha256(api_key.encode("utf-8")).hexdigest()
    return device_id, api_key, api_key_hash


def hash_api_key(api_key: str) -> str:
    return hashlib.sha256(api_key.encode("utf-8")).hexdigest()


async def verify_device_credentials(
    db: AsyncSession,
    device_id: str,
    api_key: str,
) -> MobileGatewayDevice:
    """
    Verifies that the device exists, is not REVOKED, and the API key matches.
    """
    if not device_id or not api_key:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing device identification or credential headers",
        )

    stmt = select(MobileGatewayDevice).where(MobileGatewayDevice.device_id == device_id)
    result = await db.execute(stmt)
    device = result.scalars().first()

    if not device:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Unrecognized device ID. Device must register before reporting.",
        )

    if device.status == "REVOKED":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Device credentials have been revoked by SOC operator.",
        )

    expected_hash = device.api_key_hash
    provided_hash = hash_api_key(api_key)

    if not hmac.compare_digest(expected_hash, provided_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid device credentials",
        )

    return device

