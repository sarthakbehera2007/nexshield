"""Comprehensive automated tests for Phase 6 Defence Engine and Digital Honeypot."""
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
async def test_health_check(client: AsyncClient):
    resp = await client.get("/health")
    assert resp.status_code == 200
    data = resp.json()
    assert data["status"] == "healthy"


@pytest.mark.asyncio
async def test_defence_status_and_policies(client: AsyncClient):
    status_resp = await client.get("/defence/status")
    assert status_resp.status_code == 200
    status_data = status_resp.json()
    assert "mode" in status_data
    assert status_data["emergency_disabled"] is False

    policies_resp = await client.get("/defence/policies")
    assert policies_resp.status_code == 200
    policies_data = policies_resp.json()
    assert "allowlist" in policies_data
    assert "supported_actions" in policies_data


@pytest.mark.asyncio
async def test_defence_action_lifecycle(client: AsyncClient):
    # 1. Propose action
    proposal = {
        "incident_id": "test-inc-001",
        "action_type": "BLOCK_IP",
        "target": "192.168.1.105",
        "risk_score": 85.0,
        "confidence": 0.95,
        "impact": "MEDIUM",
        "reversibility": True,
        "approval_required": True,
    }
    prop_resp = await client.post("/defence/propose", json=proposal)
    assert prop_resp.status_code == 201
    action = prop_resp.json()
    action_id = action["id"]
    assert action["status"] == "PROPOSED"
    assert action["target"] == "192.168.1.105"

    # 2. Approve action
    appr_resp = await client.post(f"/defence/{action_id}/approve")
    assert appr_resp.status_code == 200
    appr_data = appr_resp.json()
    assert appr_data["status"] == "EXECUTED"
    assert appr_data["approved_by"] == "operator_admin"

    # 3. Rollback action
    roll_resp = await client.post(f"/defence/{action_id}/rollback")
    assert roll_resp.status_code == 200
    roll_data = roll_resp.json()
    assert roll_data["status"] == "ROLLED_BACK"
    assert roll_data["rollback_status"] == "SUCCESS"


@pytest.mark.asyncio
async def test_defence_reject_action(client: AsyncClient):
    proposal = {
        "incident_id": "test-inc-002",
        "action_type": "RATE_LIMIT",
        "target": "10.0.0.50",
        "risk_score": 60.0,
        "confidence": 0.8,
        "impact": "LOW",
        "reversibility": True,
        "approval_required": True,
    }
    prop_resp = await client.post("/defence/propose", json=proposal)
    assert prop_resp.status_code == 201
    action_id = prop_resp.json()["id"]

    rej_resp = await client.post(f"/defence/{action_id}/reject?reason=False_positive")
    assert rej_resp.status_code == 200
    assert rej_resp.json()["status"] == "REJECTED"


@pytest.mark.asyncio
async def test_defence_safety_protection(client: AsyncClient):
    # Attempting to block protected management/gateway target must fail
    proposal = {
        "incident_id": "test-inc-003",
        "action_type": "BLOCK_IP",
        "target": "127.0.0.1",
        "risk_score": 90.0,
        "confidence": 0.99,
        "reversibility": True,
        "approval_required": True,
    }
    resp = await client.post("/defence/propose", json=proposal)
    assert resp.status_code == 400
    assert "protected" in resp.json()["detail"].lower()


@pytest.mark.asyncio
async def test_honeypot_status_and_services(client: AsyncClient):
    status_resp = await client.get("/honeypot/status")
    assert status_resp.status_code == 200
    status_data = status_resp.json()
    assert status_data["enabled"] is True
    assert len(status_data["decoy_services"]) >= 5

    services_resp = await client.get("/honeypot/services")
    assert services_resp.status_code == 200
    services = services_resp.json()
    assert len(services) >= 5


@pytest.mark.asyncio
async def test_honeypot_decoy_interactions_and_telemetry(client: AsyncClient):
    # 1. Access HTTP decoy portal
    portal_resp = await client.get("/decoys/portal")
    assert portal_resp.status_code == 200
    assert "Internal Corporate Portal" in portal_resp.text

    # 2. Access Decoy Admin with SQLi payload
    sqli_resp = await client.post(
        "/decoys/admin/login",
        json={"user": "admin' OR 1=1--", "pass": "secret"},
    )
    assert sqli_resp.status_code == 401

    # 3. Access Decoy Fake API
    api_resp = await client.get("/decoys/api/v1/users/financial-records")
    assert api_resp.status_code == 200

    # 4. Access Decoy SSH Banner
    ssh_resp = await client.get("/decoys/ssh/banner")
    assert ssh_resp.status_code == 200
    assert "SSH-2.0-OpenSSH" in ssh_resp.text

    # 5. Verify telemetry events collected
    events_resp = await client.get("/honeypot/events?limit=10")
    assert events_resp.status_code == 200
    events = events_resp.json()
    assert len(events) >= 4

    # 6. Verify sessions created
    sessions_resp = await client.get("/honeypot/sessions")
    assert sessions_resp.status_code == 200
    sessions = sessions_resp.json()
    assert len(sessions) >= 1
    session_id = sessions[0]["id"]

    # 7. Close session
    close_resp = await client.post(f"/honeypot/sessions/{session_id}/close")
    assert close_resp.status_code == 200
    assert close_resp.json()["status"] == "CLOSED"

