"""REST API Router for NEXSHIELD AI Security Copilot (Powered by Google Gemma 4)."""
from __future__ import annotations

import logging
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel

from ...database.database import get_db
from ...schemas.responses import APIResponse, CopilotRequest, CopilotResponse
from ...ai.gemma_copilot import gemma_copilot, GemmaChatRequest, GemmaChatResponse

router = APIRouter(prefix="/copilot", tags=["copilot"])
logger = logging.getLogger("api.copilot")


@router.get("/status")
async def get_copilot_status():
    """Return health and capabilities of Google Gemma 4 Copilot."""
    return await gemma_copilot.get_status()


@router.post("/chat", response_model=GemmaChatResponse)
async def chat_with_copilot(req: GemmaChatRequest, db: AsyncSession = Depends(get_db)):
    """Conversational security analysis with Google Gemma 4 AI Copilot."""
    if not req.message.strip():
        raise HTTPException(status_code=400, detail="Query message cannot be empty")
    return await gemma_copilot.query(req.message, incident_id=req.incident_id, db=db)


@router.post("/analyze", response_model=APIResponse, status_code=status.HTTP_200_OK)
async def analyze(request: CopilotRequest, db: AsyncSession = Depends(get_db)):
    """Perform structured incident analysis via Gemma 4."""
    query_text = f"Analyze incident {request.incident_id} with analysis type: {request.analysis_type}"
    res = await gemma_copilot.query(query_text, incident_id=request.incident_id, db=db)
    return APIResponse(
        data=CopilotResponse(
            analysis=res.answer,
            confidence=res.confidence,
            sources_used=["Google Gemma 4", "Honeypot Trap", "Detection Engine"],
        ).model_dump()
    )
