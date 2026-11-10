from __future__ import annotations

import logging
import os
import json
from datetime import datetime
from typing import Any, Dict

# Basic JSON formatter for structured logs
class JsonFormatter(logging.Formatter):
    def format(self, record: logging.LogRecord) -> str:
        log_record: Dict[str, Any] = {
            "timestamp": datetime.utcfromtimestamp(record.created).isoformat() + "Z",
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
        }
        # Include extra fields if provided
        if isinstance(record.args, dict):
            log_record.update(record.args)
        return json.dumps(log_record)


def setup_logging(level: str = "INFO") -> None:
    """Configure root logger with JSON output.

    Called from the FastAPI startup event.
    """
    logger = logging.getLogger()
    logger.setLevel(level.upper())
    handler = logging.StreamHandler()
    handler.setFormatter(JsonFormatter())
    logger.handlers = []
    logger.addHandler(handler)


def get_logger(name: str) -> logging.Logger:
    """Retrieve a named logger that uses the configured JSON formatter."""
    return logging.getLogger(name)

# Optional helper for logging security events directly to a file (append only)
def log_security_event(event: Dict[str, Any], filepath: str = "security_events.log") -> None:
    try:
        with open(filepath, "a", encoding="utf-8") as f:
            f.write(json.dumps(event) + "\n")
    except Exception as e:
        logging.getLogger("security_event_logger").error("Failed to write security event", exc_info=e)

