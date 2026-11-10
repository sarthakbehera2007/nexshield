from __future__ import annotations

"""FastAPI entry point for NEXSHIELD backend.

* Creates a single FastAPI application instance.
* Registers all existing API routers.
* Adds CORS middleware using settings.
* Handles database lifecycle (init/close).
* Exposes the WebSocket endpoint at ``/ws/events``.
"""

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware

from .config import get_settings
from .database.database import init_db, close_db
from .api.routes.health import router as health_router
from .api.routes.events import router as events_router
from .api.routes.incidents import router as incidents_router
from .api.routes.defence import router as defence_router
from .api.routes.mobile import router as mobile_router
from .api.routes.monitoring import router as monitoring_router
from .api.routes.replay import router as replay_router
from .api.routes.copilot import router as copilot_router
from .api.websocket import manager as ws_manager

# ---------------------------------------------------------------------------
# Application factory
# ---------------------------------------------------------------------------

def create_app() -> FastAPI:
    settings = get_settings()
    app = FastAPI(
        title=settings.APP_NAME,
        version=settings.APP_VERSION,
        debug=settings.DEBUG,
        docs_url="/docs",
        redoc_url="/redoc",
    )

    # -----------------------------------------------------------------------
    # CORS – allow the configured frontend URL (or any if empty for dev)
    # -----------------------------------------------------------------------
    origins = [settings.FRONTEND_URL] if settings.FRONTEND_URL else ["*"]
    app.add_middleware(
        CORSMiddleware,
        allow_origins=origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # -----------------------------------------------------------------------
    # Register routers
    # -----------------------------------------------------------------------
    app.include_router(health_router)
    app.include_router(events_router)
    app.include_router(incidents_router)
    app.include_router(defence_router)
    app.include_router(mobile_router)
    app.include_router(monitoring_router)
    app.include_router(replay_router)
    app.include_router(copilot_router)

    # -----------------------------------------------------------------------
    # WebSocket endpoint – simple pass‑through to the ConnectionManager
    # -----------------------------------------------------------------------
    @app.websocket("/ws/events")
    async def websocket_endpoint(ws: WebSocket) -> None:
        await ws_manager.connect(ws)
        try:
            while True:
                # Keep the connection open; any received message is ignored.
                await ws.receive_text()
        except WebSocketDisconnect:
            ws_manager.disconnect(ws)
        except Exception:
            # Ensure cleanup on unexpected errors.
            ws_manager.disconnect(ws)

    # -----------------------------------------------------------------------
    # Lifespan events – initialise and dispose the async engine
    # -----------------------------------------------------------------------
    @app.on_event("startup")
    async def on_startup() -> None:
        await init_db()

    @app.on_event("shutdown")
    async def on_shutdown() -> None:
        await close_db()

    return app

# ---------------------------------------------------------------------------
# Export the singleton FastAPI app used by ``uvicorn``
# ---------------------------------------------------------------------------
app = create_app()

