"""Tests for Google Gemma 4 AI Copilot Integration."""
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
async def test_gemma_copilot_status(client: AsyncClient):
    resp = await client.get("/copilot/status")
    assert resp.status_code == 200
    data = resp.json()
    assert "Gemma 4" in data["engine"]
    assert "Google DeepMind" in data["provider"]
    assert "INCIDENT_EXPLANATION" in data["capabilities"]


@pytest.mark.asyncio
async def test_gemma_copilot_chat(client: AsyncClient):
    resp = await client.post("/copilot/chat", json={
        "message": "Explain what happened with the SQL injection attack.",
    })
    assert resp.status_code == 200
    data = resp.json()
    assert "Gemma 4" in data["model"]
    assert "SQL" in data["answer"]
    assert len(data["mitre_techniques"]) > 0
    assert data["confidence"] > 0.8


@pytest.mark.asyncio
async def test_gemma_copilot_chat_empty_validation(client: AsyncClient):
    resp = await client.post("/copilot/chat", json={
        "message": "   ",
    })
    assert resp.status_code == 400
