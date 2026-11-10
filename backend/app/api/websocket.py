from __future__ import annotations

import asyncio
from datetime import datetime
from typing import List

from fastapi import WebSocket, WebSocketDisconnect
from ..schemas.events import WebSocketMessage


class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []
        self.heartbeat_interval = 30  # seconds
        self._heartbeat_task: asyncio.Task | None = None

    async def connect(self, websocket: WebSocket) -> None:
        await websocket.accept()
        self.active_connections.append(websocket)
        if not self._heartbeat_task:
            self._heartbeat_task = asyncio.create_task(self._heartbeat())

    def disconnect(self, websocket: WebSocket) -> None:
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
        if not self.active_connections and self._heartbeat_task:
            self._heartbeat_task.cancel()
            self._heartbeat_task = None

    async def send_personal(self, websocket: WebSocket, message: WebSocketMessage) -> None:
        await websocket.send_json(message.model_dump())

    async def broadcast(self, message: WebSocketMessage) -> None:
        data = message.model_dump()
        for connection in self.active_connections:
            try:
                await connection.send_json(data)
            except Exception:
                # ignore broken connections; cleanup will happen on disconnect
                pass

    async def _heartbeat(self) -> None:
        while True:
            await asyncio.sleep(self.heartbeat_interval)
            hb = WebSocketMessage(message_type="HEARTBEAT", data={})
            await self.broadcast(hb)

# Singleton manager
manager = ConnectionManager()

# Helper broadcast functions used by API routes
async def broadcast_event(event: dict) -> None:
    msg = WebSocketMessage(message_type="NEW_EVENT", data=event)
    await manager.broadcast(msg)

async def broadcast_incident_update(incident: dict) -> None:
    msg = WebSocketMessage(message_type="INCIDENT_UPDATE", data=incident)
    await manager.broadcast(msg)

async def broadcast_sensor_status(sensor_data: dict) -> None:
    msg = WebSocketMessage(message_type="SENSOR_STATUS", data=sensor_data)
    await manager.broadcast(msg)

async def broadcast_defence_action(action_data: dict) -> None:
    msg = WebSocketMessage(message_type="DEFENCE_ACTION", data=action_data)
    await manager.broadcast(msg)

