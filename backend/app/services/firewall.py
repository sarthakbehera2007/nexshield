from __future__ import annotations

import logging
from typing import Optional
from ipaddress import ip_address

from fastapi import HTTPException

from ..config import get_settings
from ..services.logging_service import get_logger

logger = get_logger("firewall")


def _validate_ip(ip_str: str) -> None:
    try:
        ip = ip_address(ip_str)
        # Disallow protected IPs
        if ip_str in get_settings().protected_ip_set:
            raise ValueError("Attempt to block protected IP")
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid IP address: {e}")


def block_ip(ip: str, dry_run: Optional[bool] = None) -> dict:
    _validate_ip(ip)
    dr = dry_run if dry_run is not None else get_settings().FIREWALL_DRY_RUN
    if dr:
        logger.info("Dry‑run block_ip", extra={"ip": ip})
        return {"action": "block", "ip": ip, "dry_run": True}
    # Real implementation placeholder – in production integrate with ufw/iptables.
    logger.info("Blocking IP (real)", extra={"ip": ip})
    # Here you would run a system command, e.g., subprocess.run([...])
    return {"action": "block", "ip": ip, "dry_run": False}


def unblock_ip(ip: str, dry_run: Optional[bool] = None) -> dict:
    _validate_ip(ip)
    dr = dry_run if dry_run is not None else get_settings().FIREWALL_DRY_RUN
    if dr:
        logger.info("Dry‑run unblock_ip", extra={"ip": ip})
        return {"action": "unblock", "ip": ip, "dry_run": True}
    logger.info("Unblocking IP (real)", extra={"ip": ip})
    return {"action": "unblock", "ip": ip, "dry_run": False}

