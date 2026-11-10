"""REST API Router for Intelligent Defence Engine."""
from __future__ import annotations

import logging
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from ...database.database import get_db
from ...defence.defence_engine import defence_engine
from ...defence.schemas import (
    DefenceActionCreate,
    DefenceActionResponse,
    DefencePolicy,
    DefenceStatus,
    ActionStatus,
)

router = APIRouter(prefix="/defence", tags=["defence"])
logger = logging.getLogger("api.defence")


@router.get("/status", response_model=DefenceStatus)
async def get_defence_status(db: AsyncSession = Depends(get_db)):
    return await defence_engine.get_status(db)


@router.get("/policies", response_model=DefencePolicy)
async def get_defence_policies():
    return defence_engine.policy_engine.get_policy()


@router.get("/actions", response_model=List[DefenceActionResponse])
async def list_defence_actions(
    status: Optional[str] = Query(None),
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    db: AsyncSession = Depends(get_db),
):
    actions = await defence_engine.list_actions(db, status=status, limit=limit, offset=offset)
    return [DefenceActionResponse.model_validate(a) for a in actions]


@router.post("/propose", response_model=DefenceActionResponse, status_code=status.HTTP_201_CREATED)
async def propose_defence_action(
    payload: DefenceActionCreate,
    db: AsyncSession = Depends(get_db),
):
    try:
        action = await defence_engine.propose_action(db, payload, actor="operator_api")
        await db.commit()
        return DefenceActionResponse.model_validate(action)
    except ValueError as ve:
        await db.rollback()
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        await db.rollback()
        logger.exception("Failed to propose action")
        raise HTTPException(status_code=500, detail=f"Internal error: {e}")


@router.post("/{action_id}/approve", response_model=DefenceActionResponse)
async def approve_defence_action(
    action_id: str,
    db: AsyncSession = Depends(get_db),
):
    try:
        action = await defence_engine.approve_action(db, action_id, actor="operator_admin")
        await db.commit()
        return DefenceActionResponse.model_validate(action)
    except KeyError:
        raise HTTPException(status_code=404, detail="Action not found")
    except ValueError as ve:
        await db.rollback()
        raise HTTPException(status_code=400, detail=str(ve))


@router.post("/{action_id}/reject", response_model=DefenceActionResponse)
async def reject_defence_action(
    action_id: str,
    reason: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db),
):
    try:
        action = await defence_engine.reject_action(db, action_id, actor="operator_admin", reason=reason)
        await db.commit()
        return DefenceActionResponse.model_validate(action)
    except KeyError:
        raise HTTPException(status_code=404, detail="Action not found")
    except ValueError as ve:
        await db.rollback()
        raise HTTPException(status_code=400, detail=str(ve))


@router.post("/{action_id}/rollback", response_model=DefenceActionResponse)
async def rollback_defence_action(
    action_id: str,
    db: AsyncSession = Depends(get_db),
):
    try:
        action = await defence_engine.rollback_action(db, action_id, actor="operator_admin")
        await db.commit()
        return DefenceActionResponse.model_validate(action)
    except KeyError:
        raise HTTPException(status_code=404, detail="Action not found")
    except ValueError as ve:
        await db.rollback()
        raise HTTPException(status_code=400, detail=str(ve))
