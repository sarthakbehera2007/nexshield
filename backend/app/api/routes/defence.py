from __future__ import annotations

import datetime
from typing import Any, Dict

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from ...database.database import get_db
from ..database.repository import DefenceRepository
from ..schemas.responses import DefenceActionCreate, DefenceActionResponse, APIResponse
from ..services.firewall import block_ip, unblock_ip
from ..services.logging_service import get_logger

router = APIRouter(prefix="/defence", tags=["defence"])

logger = get_logger("defence")

@router.get("/actions", response_model=APIResponse)
async def list_actions(db: AsyncSession = Depends(get_db)):
    actions = await DefenceRepository.list_actions(db)
    data = [
        {
            "id": a.id,
            "action_type": a.action_type.value,
            "target": a.target,
            "status": a.status.value,
            "requested_at": a.requested_at.isoformat(),
            "dry_run": a.dry_run,
        }
        for a in actions
    ]
    return APIResponse(data=data, message="Defence actions list")

@router.post("/approve", response_model=DefenceActionResponse)
async def approve_action(payload: DefenceActionCreate, db: AsyncSession = Depends(get_db)):
    action = await DefenceRepository.get_action(db, payload.action_id)
    if not action:
        raise HTTPException(status_code=404, detail="Action not found")
    if action.status != "PENDING":
        raise HTTPException(status_code=400, detail="Action not pending")

    # Perform firewall operation if not dry run
    result: Dict[str, Any] = {}
    if action.action_type == "BLOCK_IP":
        result = block_ip(action.target, dry_run=action.dry_run)
    elif action.action_type == "UNBLOCK_IP":
        result = unblock_ip(action.target, dry_run=action.dry_run)
    else:
        # Other action types could be added here
        pass

    update_data = {
        "status": "APPROVED" if action.dry_run else "EXECUTED",
        "approved_at": datetime.datetime.utcnow(),
        "approved_by": payload.approved_by,
    }
    updated = await DefenceRepository.update_action(db, payload.action_id, update_data)
    await db.commit()
    logger.info("Defence action approved", extra={"action_id": payload.action_id, "result": result})
    return DefenceActionResponse.from_orm(updated)

@router.post("/reject", response_model=DefenceActionResponse)
async def reject_action(action_id: str, reason: str = "", db: AsyncSession = Depends(get_db)):
    action = await DefenceRepository.get_action(db, action_id)
    if not action:
        raise HTTPException(status_code=404, detail="Action not found")
    if action.status != "PENDING":
        raise HTTPException(status_code=400, detail="Action not pending")
    update_data = {"status": "REJECTED", "approved_at": datetime.datetime.utcnow()}
    updated = await DefenceRepository.update_action(db, action_id, update_data)
    await db.commit()
    logger.info("Defence action rejected", extra={"action_id": action_id, "reason": reason})
    return DefenceActionResponse.from_orm(updated)

@router.post("/rollback", response_model=DefenceActionResponse)
async def rollback_action(action_id: str, db: AsyncSession = Depends(get_db)):
    action = await DefenceRepository.get_action(db, action_id)
    if not action:
        raise HTTPException(status_code=404, detail="Action not found")
    if action.status != "EXECUTED":
        raise HTTPException(status_code=400, detail="Only executed actions can be rolled back")
    # Placeholder: actual rollback would undo firewall rule; here we just log
    logger.info("Rolling back defence action", extra={"action_id": action_id})
    update_data = {"status": "ROLLED_BACK", "executed_at": datetime.datetime.utcnow()}
    updated = await DefenceRepository.update_action(db, action_id, update_data)
    await db.commit()
    return DefenceActionResponse.from_orm(updated)

