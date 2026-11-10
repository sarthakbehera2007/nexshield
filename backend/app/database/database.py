from __future__ import annotations

import asyncio
from typing import AsyncGenerator

from sqlalchemy.ext.asyncio import AsyncEngine, AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy.orm import declarative_base

from ..config import get_settings

# Create async engine using the DATABASE_URL from settings
engine: AsyncEngine = create_async_engine(
    get_settings().DATABASE_URL,
    echo=get_settings().DEBUG,
    future=True,
)

# Session factory
AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    expire_on_commit=False,
    class_=AsyncSession,
    autoflush=False,
    autocommit=False,
)

# Base declarative class for models
Base = declarative_base()

async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """FastAPI dependency that yields an async DB session."""
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()

async def init_db() -> None:
    """Create all tables. Should be called at startup."""
    # Ensure all models are imported so their tables exist in Base.metadata
    from . import models as _core_models  # noqa: F401
    try:
        from ..defence import models as _defence_models  # noqa: F401
        from ..honeypot import models as _honeypot_models  # noqa: F401
        from ..gateway import models as _gateway_models  # noqa: F401
    except Exception:
        pass
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

async def close_db() -> None:
    """Dispose the engine. Called at shutdown."""
    await engine.dispose()

