"""Comprehensive automated tests for Phase 9 Mobile Security Gateway."""
import pytest
import pytest_asyncio
from httpx import AsyncClient, ASGITransport
from app.main import create_app
from app.database.database import init_db, close_db


@pytest_asyncio.fixture(scope="module")
async def client():
    app = create_app()
    await init_db()
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://testserver") as ac:
        yield ac
    await close_db()


@pytest.mark.asyncio
async def test_mobile_gateway_status(client: AsyncClient):
    resp = await client.get("/mobile/status")
    assert resp.status_code == 200
    data = resp.json()
    assert data["gateway_online"] is True
    assert "active_devices_count" in data


@pytest.mark.asyncio
async def test_mobile_device_registration_and_auth(client: AsyncClient):
    # 1. Register Device
    reg_payload = {
        "device_name": "Pixel 8 Pro Lab Agent",
        "platform": "Android",
        "app_version": "1.0.0",
    }
    reg_resp = await client.post("/mobile/register", json=reg_payload)
    assert reg_resp.status_code == 201
    device_data = reg_resp.json()
    device_id = device_data["device_id"]
    api_key = device_data["api_key"]
    assert device_id.startswith("mdev-")
    assert api_key.startswith("nxs_mob_")
    assert device_data["status"] == "ONLINE"

    # 2. Heartbeat with Credentials
    headers = {"X-Device-ID": device_id, "X-API-Key": api_key}
    hb_payload = {"app_version": "1.0.0", "connection_status": "ONLINE"}
    hb_resp = await client.post(f"/mobile/devices/{device_id}/heartbeat", json=hb_payload, headers=headers)
    assert hb_resp.status_code == 200
    hb_data = hb_resp.json()
    assert hb_data["device_id"] == device_id
    assert hb_data["status"] == "ONLINE"

    # 3. Heartbeat with Invalid Credentials must fail
    bad_headers = {"X-Device-ID": device_id, "X-API-Key": "invalid_key_xyz"}
    bad_resp = await client.post(f"/mobile/devices/{device_id}/heartbeat", json=hb_payload, headers=bad_headers)
    assert bad_resp.status_code == 401

    # 4. Submit Mobile Security Event
    event_payload = {
        "event_type": "SUSPICIOUS_URL",
        "severity": "HIGH",
        "description": "User received malicious SMS containing credential phishing link",
        "evidence_metadata": {"url": "http://192.168.1.100/secure-login", "source_app": "Messaging"},
    }
    ev_resp = await client.post("/mobile/events", json=event_payload, headers=headers)
    assert ev_resp.status_code == 201
    ev_data = ev_resp.json()
    assert ev_data["device_id"] == device_id
    assert ev_data["event_type"] == "SUSPICIOUS_URL"

    # 5. Submit SOS Emergency Alert
    sos_payload = {
        "alert_category": "COMPROMISE_CONCERN",
        "message": "Unsolicited remote administration session observed on mobile device",
        "latitude": 37.7749,
        "longitude": -122.4194,
        "location_description": "Sector 07 HQ Facility",
    }
    sos_resp = await client.post("/mobile/sos", json=sos_payload, headers=headers)
    assert sos_resp.status_code == 201
    sos_data = sos_resp.json()
    assert sos_data["device_id"] == device_id
    assert sos_data["status"] == "ACTIVE"

    # 6. Verify Device Details
    det_resp = await client.get(f"/mobile/devices/{device_id}")
    assert det_resp.status_code == 200
    det_data = det_resp.json()
    assert det_data["total_events_reported"] >= 1
    assert det_data["total_sos_reported"] >= 1

    # 7. Revoke Device Credentials
    revoke_resp = await client.delete(f"/mobile/devices/{device_id}?revoke_only=true")
    assert revoke_resp.status_code == 200

    # 8. Post-revocation report must be rejected (403 Forbidden)
    post_revoke_resp = await client.post("/mobile/events", json=event_payload, headers=headers)
    assert post_revoke_resp.status_code == 403


@pytest.mark.asyncio
async def test_url_inspector_heuristics(client: AsyncClient):
    # 1. Malicious raw-IP phishing link
    bad_url_resp = await client.post(
        "/mobile/inspect-url",
        json={"url": "http://192.168.1.50:8080/secure-login/update.php"},
    )
    assert bad_url_resp.status_code == 200
    bad_data = bad_url_resp.json()
    assert bad_data["is_suspicious"] is True
    assert bad_data["risk_score"] >= 70.0
    assert len(bad_data["indicators"]) >= 2

    # 2. Benign standard HTTPS link
    good_url_resp = await client.post(
        "/mobile/inspect-url",
        json={"url": "https://cybersecurity.example.org/documentation/report.pdf"},
    )
    assert good_url_resp.status_code == 200
    good_data = good_url_resp.json()
    assert good_data["is_suspicious"] is False
    assert good_data["verdict"] == "SAFE"

