from __future__ import annotations

import os
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
import httpx

from ...database.database import get_db
from ...database.repository import IncidentRepository, EventRepository
from ...schemas.responses import APIResponse, CopilotRequest, CopilotResponse
from ...config import get_settings

router = APIRouter(prefix="/copilot", tags=["copilot"])

OLLAMA_HEADERS = {"Content-Type": "application/json"}

async def _ollama_generate(prompt: str) -> dict:
    url = f"{get_settings().OLLAMA_URL}/api/generate"
    payload = {"model": get_settings().OLLAMA_MODEL, "prompt": prompt}
    async with httpx.AsyncClient() as client:
        resp = await client.post(url, json=payload, headers=OLLAMA_HEADERS, timeout=30)
        resp.raise_for_status()
        return resp.json()

@router.post("/analyze", response_model=APIResponse, status_code=status.HTTP_200_OK)
async def analyze(request: CopilotRequest, db: AsyncSession = Depends(get_db)):
    # Gather data for analysis
    if request.incident_id:
        incident = await IncidentRepository.get_incident(db, request.incident_id)
        if not incident:
            raise HTTPException(status_code=404, detail="Incident not found")
        data = f"Incident: {incident.title}\nDescription: {incident.description}\nRisk: {incident.risk_score}\n"
    elif request.event_ids:
        events = []
        for eid in request.event_ids:
            ev = await EventRepository.get_event(db, eid)
            if ev:
                events.append(ev)
        if not events:
            raise HTTPException(status_code=404, detail="No events found")
        data = "\n".join([f"Event {e.id}: {e.description}" for e in events])
    else:
        raise HTTPException(status_code=400, detail="Provide incident_id or event_ids")

    # Build prompt based on analysis_type
    analysis_type = request.analysis_type.upper()
    if analysis_type == "SUMMARIZE":
        prompt = f"Summarize the following security information concisely:\n{data}"
    elif analysis_type == "EXPLAIN":
        prompt = f"Explain the significance of the following security information:\n{data}"
    elif analysis_type == "RECOMMEND":
        prompt = f"Based on the following security information, recommend defensive actions:\n{data}"
    elif analysis_type == "REPORT":
        prompt = f"Generate a short incident report for the following data:\n{data}"
    else:
        raise HTTPException(status_code=400, detail="Invalid analysis_type")

    # If Ollama disabled or unreachable, fallback to deterministic response
    if not get_settings().OLLAMA_ENABLED:
        fallback = f"[Fallback] {analysis_type} not available – static response based on data length {len(data)}."
        return APIResponse(data=CopilotResponse(analysis=fallback, confidence=1.0, sources_used=[]).model_dump())

    try:
        ollama_resp = await _ollama_generate(prompt)
        analysis_text = ollama_resp.get("response", "")
        return APIResponse(data=CopilotResponse(analysis=analysis_text, confidence=1.0, sources_used=["ollama"]).model_dump())
    except Exception as e:
        # fallback on error
        fallback = f"[Error fallback] Could not reach Ollama: {str(e)}"
        return APIResponse(data=CopilotResponse(analysis=fallback, confidence=0.0, sources_used=[]).model_dump())

