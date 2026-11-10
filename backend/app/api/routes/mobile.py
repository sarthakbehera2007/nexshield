"""REST API Router for NEXSHIELD Mobile Security Gateway (Phase 9)."""
from __future__ import annotations

import logging
from typing import List, Optional
from fastapi import APIRouter, Depends, Header, HTTPException, Query, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from ...database.database import get_db
from ...gateway.models import MobileGatewayDevice, MobileSecurityReport, MobileSOSAlert
from ...gateway.schemas import (
    DeviceRegistrationRequest,
    DeviceRegistrationResponse,
    DeviceHeartbeatRequest,
    DeviceHeartbeatResponse,
    MobileEventReportRequest,
    MobileEventReportResponse,
    SOSAlertRequest,
    SOSAlertResponse,
    URLInspectionRequest,
    URLInspectionResponse,
    MobileGatewayStatus,
)
from ...gateway.device_manager import DeviceManager
from ...gateway.device_auth import verify_device_credentials
from ...gateway.heartbeat_service import HeartbeatService
from ...gateway.mobile_event_service import MobileEventService
from ...gateway.sos_service import SOSService
from ...gateway.url_inspector import URLInspector

router = APIRouter(prefix="/mobile", tags=["mobile"])
logger = logging.getLogger("api.mobile")


@router.get("/status", response_model=MobileGatewayStatus)
async def get_gateway_status(db: AsyncSession = Depends(get_db)):
    active_res = await db.execute(select(func.count(MobileGatewayDevice.id)))
    online_res = await db.execute(select(func.count(MobileGatewayDevice.id)).where(MobileGatewayDevice.status == "ONLINE"))
    events_res = await db.execute(select(func.count(MobileSecurityReport.id)))
    sos_res = await db.execute(select(func.count(MobileSOSAlert.id)))

    return MobileGatewayStatus(
        active_devices_count=active_res.scalar_one() or 0,
        online_devices_count=online_res.scalar_one() or 0,
        total_events_reported=events_res.scalar_one() or 0,
        total_sos_alerts=sos_res.scalar_one() or 0,
        system_version="1.0.0",
        gateway_online=True,
    )


@router.post("/register", response_model=DeviceRegistrationResponse, status_code=status.HTTP_201_CREATED)
async def register_device(
    payload: DeviceRegistrationRequest,
    db: AsyncSession = Depends(get_db),
):
    try:
        device_resp = await DeviceManager.register_device(db, payload)
        await db.commit()
        return device_resp
    except ValueError as ve:
        await db.rollback()
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        await db.rollback()
        logger.exception("Device registration error")
        raise HTTPException(status_code=500, detail=f"Registration failed: {e}")


@router.get("/devices", response_model=List[dict])
async def list_devices(
    status: Optional[str] = Query(None),
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    db: AsyncSession = Depends(get_db),
):
    devices = await DeviceManager.list_devices(db, status=status, limit=limit, offset=offset)
    return [
        {
            "device_id": d.device_id,
            "device_name": d.device_name,
            "platform": d.platform,
            "app_version": d.app_version,
            "status": d.status,
            "registered_at": d.registered_at.isoformat() if d.registered_at else None,
            "last_seen": d.last_seen.isoformat() if d.last_seen else None,
            "total_events_reported": d.total_events_reported,
            "total_sos_reported": d.total_sos_reported,
        }
        for d in devices
    ]


@router.get("/devices/{device_id}")
async def get_device_details(
    device_id: str,
    db: AsyncSession = Depends(get_db),
):
    device = await DeviceManager.get_device(db, device_id)
    if not device:
        raise HTTPException(status_code=404, detail="Device not found")
    return {
        "device_id": device.device_id,
        "device_name": device.device_name,
        "platform": device.platform,
        "app_version": device.app_version,
        "status": device.status,
        "registered_at": device.registered_at.isoformat() if device.registered_at else None,
        "last_seen": device.last_seen.isoformat() if device.last_seen else None,
        "total_events_reported": device.total_events_reported,
        "total_sos_reported": device.total_sos_reported,
    }


@router.post("/devices/{device_id}/heartbeat", response_model=DeviceHeartbeatResponse)
async def device_heartbeat(
    device_id: str,
    payload: DeviceHeartbeatRequest,
    x_device_id: Optional[str] = Header(None, alias="X-Device-ID"),
    x_api_key: Optional[str] = Header(None, alias="X-API-Key"),
    db: AsyncSession = Depends(get_db),
):
    target_id = x_device_id or device_id
    if x_api_key:
        device = await verify_device_credentials(db, target_id, x_api_key)
    else:
        device = await DeviceManager.get_device(db, target_id)
        if not device:
            raise HTTPException(status_code=404, detail="Device not found")

    resp = await HeartbeatService.record_heartbeat(db, device, payload)
    await db.commit()
    return resp


@router.delete("/devices/{device_id}")
async def deregister_device(
    device_id: str,
    revoke_only: bool = Query(False),
    db: AsyncSession = Depends(get_db),
):
    if revoke_only:
        success = await DeviceManager.revoke_device(db, device_id)
    else:
        success = await DeviceManager.delete_device(db, device_id)

    if not success:
        raise HTTPException(status_code=404, detail="Device not found")
    await db.commit()
    return {"status": "success", "message": f"Device {device_id} {'revoked' if revoke_only else 'deregistered'}"}


@router.post("/events", response_model=MobileEventReportResponse, status_code=status.HTTP_201_CREATED)
async def submit_mobile_event(
    payload: MobileEventReportRequest,
    x_device_id: Optional[str] = Header(None, alias="X-Device-ID"),
    x_api_key: Optional[str] = Header(None, alias="X-API-Key"),
    db: AsyncSession = Depends(get_db),
):
    # Verify device
    if not x_device_id or not x_api_key:
        raise HTTPException(status_code=401, detail="X-Device-ID and X-API-Key headers required")

    device = await verify_device_credentials(db, x_device_id, x_api_key)
    report = await MobileEventService.submit_report(db, device, payload)
    await db.commit()
    return MobileEventReportResponse.model_validate(report)


@router.get("/events", response_model=List[MobileEventReportResponse])
async def list_mobile_events(
    device_id: Optional[str] = Query(None),
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    db: AsyncSession = Depends(get_db),
):
    reports = await MobileEventService.list_reports(db, device_id=device_id, limit=limit, offset=offset)
    return [MobileEventReportResponse.model_validate(r) for r in reports]


@router.post("/sos", response_model=SOSAlertResponse, status_code=status.HTTP_201_CREATED)
async def submit_sos_alert(
    payload: SOSAlertRequest,
    x_device_id: Optional[str] = Header(None, alias="X-Device-ID"),
    x_api_key: Optional[str] = Header(None, alias="X-API-Key"),
    db: AsyncSession = Depends(get_db),
):
    if not x_device_id or not x_api_key:
        raise HTTPException(status_code=401, detail="X-Device-ID and X-API-Key headers required")

    device = await verify_device_credentials(db, x_device_id, x_api_key)
    alert = await SOSService.create_sos_alert(db, device, payload)
    await db.commit()
    return SOSAlertResponse.model_validate(alert)


@router.get("/sos", response_model=List[SOSAlertResponse])
async def list_sos_alerts(
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    db: AsyncSession = Depends(get_db),
):
    alerts = await SOSService.list_sos_alerts(db, limit=limit, offset=offset)
    return [SOSAlertResponse.model_validate(a) for a in alerts]


@router.post("/inspect-url", response_model=URLInspectionResponse)
async def inspect_url(payload: URLInspectionRequest):
    return URLInspector.inspect(payload)
