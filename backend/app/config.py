from __future__ import annotations

import os
from typing import List

from pydantic import Field, computed_field
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    APP_NAME: str = "NEXSHIELD"
    APP_VERSION: str = "2.0.0"
    DEBUG: bool = False
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    DATABASE_URL: str = "sqlite+aiosqlite:///./nexshield.db"
    FRONTEND_URL: str = "http://localhost:5173"
    LOG_LEVEL: str = "INFO"
    NETWORK_INTERFACE: str = "eth0"
    DEMO_MODE: bool = True
    MONITORED_DIRS: List[str] = ["/tmp/nexshield-monitor"]
    BRUTE_FORCE_THRESHOLD: int = 5
    PORT_SCAN_THRESHOLD: int = 15
    SCAN_WINDOW_SECONDS: int = 60
    OLLAMA_URL: str = "http://localhost:11434"
    OLLAMA_MODEL: str = "gemma4:latest"
    OLLAMA_ENABLED: bool = True
    AI_PROVIDER: str = "gemma"
    GEMMA_MODEL: str = "gemma4:latest"
    GEMMA_API_BASE: str = "http://localhost:11434"
    GEMMA_ENABLED: bool = True
    GEMMA_TEMPERATURE: float = 0.1
    OLLAMA_TIMEOUT: int = 60
    JWT_SECRET: str = "change-this-secret"
    PROTECTED_IPS: List[str] = ["127.0.0.1", "::1"]
    MAX_REQUEST_SIZE: int = 1_048_576  # 1 MiB
    RATE_LIMIT_MOBILE: int = 30  # requests per minute
    FIREWALL_DRY_RUN: bool = True
    EVIDENCE_DIR: str = "./evidence"

    @computed_field
    @property
    def protected_ip_set(self) -> set[str]:
        return set(self.PROTECTED_IPS)

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = False

# Cached settings instance
from functools import lru_cache

@lru_cache()
def get_settings() -> Settings:
    return Settings()

