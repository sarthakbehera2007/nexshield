"""Honeypot Decoy Service Simulator offering isolated, safe HTTP, admin, API, and banner decoys."""
from __future__ import annotations

import logging
from typing import Any, Dict
from fastapi import APIRouter, Depends, Request, Response, status
from sqlalchemy.ext.asyncio import AsyncSession

from ..database.database import get_db
from .schemas import DecoyServiceType, HoneypotInteractionCreate
from .event_collector import EventCollector

logger = logging.getLogger("honeypot.services")

decoy_router = APIRouter(prefix="/decoys", tags=["honeypot-decoys"])


@decoy_router.get("/portal", summary="Decoy Corporate Portal")
async def decoy_http_portal(request: Request, db: AsyncSession = Depends(get_db)):
    client_ip = request.client.host if request.client else "127.0.0.1"
    await EventCollector.record_interaction(
        db=db,
        payload=HoneypotInteractionCreate(
            service_name=DecoyServiceType.HTTP_PORTAL,
            source_ip=client_ip,
            method="GET",
            path="/decoys/portal",
            user_agent=request.headers.get("user-agent"),
        ),
    )
    await db.commit()
    return Response(
        content="""<!DOCTYPE html>
<html>
<head><title>Internal Employee Intranet</title></head>
<body style="font-family:sans-serif;background:#f4f4f4;padding:2rem;">
<h2>Internal Corporate Portal</h2>
<p>Notice: All activity is monitored and logged.</p>
<form action="/decoys/admin/login" method="POST">
<input type="text" name="user" placeholder="Corporate ID" /><br/>
<input type="password" name="pass" placeholder="Password" /><br/>
<button type="submit">Sign In</button>
</form>
</body>
</html>""",
        media_type="text/html",
    )


@decoy_router.post("/admin/login", summary="Decoy Admin Login")
async def decoy_admin_login(request: Request, db: AsyncSession = Depends(get_db)):
    client_ip = request.client.host if request.client else "127.0.0.1"
    try:
        body = await request.json()
    except Exception:
        body = {"raw_form": "submitted"}

    await EventCollector.record_interaction(
        db=db,
        payload=HoneypotInteractionCreate(
            service_name=DecoyServiceType.ADMIN_LOGIN,
            source_ip=client_ip,
            method="POST",
            path="/decoys/admin/login",
            user_agent=request.headers.get("user-agent"),
            payload=body,
        ),
    )
    await db.commit()
    return Response(
        content='{"error": "Authentication failed", "code": 401}',
        status_code=status.HTTP_401_UNAUTHORIZED,
        media_type="application/json",
    )


@decoy_router.api_route(
    "/api/v1/{path:path}",
    methods=["GET", "POST", "PUT", "DELETE"],
    summary="Decoy REST API",
)
async def decoy_fake_api(path: str, request: Request, db: AsyncSession = Depends(get_db)):
    client_ip = request.client.host if request.client else "127.0.0.1"
    try:
        payload = await request.json()
    except Exception:
        payload = None

    await EventCollector.record_interaction(
        db=db,
        payload=HoneypotInteractionCreate(
            service_name=DecoyServiceType.FAKE_API,
            source_ip=client_ip,
            method=request.method,
            path=f"/decoys/api/v1/{path}",
            user_agent=request.headers.get("user-agent"),
            payload=payload,
        ),
    )
    await db.commit()
    return {
        "status": "error",
        "message": f"Endpoint /api/v1/{path} requires bearer authentication",
        "mock_env": "production_gateway_v2",
    }


@decoy_router.get("/ssh/banner", summary="Decoy SSH Banner Decoy")
async def decoy_ssh_banner(request: Request, db: AsyncSession = Depends(get_db)):
    client_ip = request.client.host if request.client else "127.0.0.1"
    await EventCollector.record_interaction(
        db=db,
        payload=HoneypotInteractionCreate(
            service_name=DecoyServiceType.SSH_BANNER,
            source_ip=client_ip,
            method="GET",
            path="/decoys/ssh/banner",
            user_agent=request.headers.get("user-agent"),
        ),
    )
    await db.commit()
    return Response(
        content="SSH-2.0-OpenSSH_8.9p1 Ubuntu-3ubuntu0.6\r\n",
        media_type="text/plain",
    )


@decoy_router.get("/db/banner", summary="Decoy Database Banner Decoy")
async def decoy_db_banner(request: Request, db: AsyncSession = Depends(get_db)):
    client_ip = request.client.host if request.client else "127.0.0.1"
    await EventCollector.record_interaction(
        db=db,
        payload=HoneypotInteractionCreate(
            service_name=DecoyServiceType.DATABASE_BANNER,
            source_ip=client_ip,
            method="GET",
            path="/decoys/db/banner",
            user_agent=request.headers.get("user-agent"),
        ),
    )
    await db.commit()
    return {
        "engine": "PostgreSQL 15.4 (Ubuntu 15.4-2.pgdg22.04+1)",
        "protocol": "fe_sendauth: no password supplied",
    }

