from __future__ import annotations

import json
import logging
from typing import List, Dict, Any, Optional

import httpx
from pydantic import BaseModel, Field, ValidationError

# Import deterministic engines – they are cheap to call and do not cause side‑effects.
from ..engine.attack_story import AttackStoryEngine
from ..engine.risk_engine import RiskEngine
from ..engine.attack_graph import AttackGraphEngine
from ..engine.correlation_engine import CorrelationEngine

# Repository helpers to fetch incidents and events.
from ..database.repository import IncidentRepository, EventRepository

# Configuration helper.
from ..config import get_settings

# Prompt templates (Jinja‑style strings).
from .prompts import PROMPT_ANALYZE, PROMPT_EXPLAIN, PROMPT_RECOMMEND, PROMPT_SUMMARIZE, PROMPT_RISK, PROMPT_EVIDENCE

logger = logging.getLogger(__name__)


class CopilotResponse(BaseModel):
    """Strict schema for all Copilot JSON output.

    The model mirrors the JSON structure required by the frontend and the
    specification in the prompt templates.
    """

    incident_id: str = Field(..., description="ID of the incident the analysis pertains to")
    summary: str = Field(..., description="Short human‑readable summary of the incident")
    confirmed_evidence: List[Dict[str, Any]] = Field(
        default_factory=list,
        description="List of evidence items that are confirmed by detectors",
    )
    suspicious_indicators: List[Dict[str, Any]] = Field(
        default_factory=list,
        description="Evidence that looks suspicious but is not yet confirmed",
    )
    hypotheses: List[Dict[str, Any]] = Field(
        default_factory=list,
        description="Possible explanations that require operator validation",
    )
    risk_explanation: str = Field(..., description="Human‑readable explanation of the risk score")
    recommended_actions: List[Dict[str, Any]] = Field(
        default_factory=list,
        description="Actionable defence recommendations",
    )
    confidence: float = Field(..., ge=0.0, le=1.0, description="Model confidence (0‑1)")
    requires_operator_approval: bool = Field(..., description="If true the operator must explicitly approve the recommendations")
    provider_available: bool = Field(..., description="True when Ollama responded, false when fallback was used")

    class Config:
        json_schema_extra = {
            "example": {
                "incident_id": "inc-123",
                "summary": "Port scan followed by brute‑force login attempts",
                "confirmed_evidence": [{"type": "event", "id": "ev-1"}],
                "suspicious_indicators": [{"type": "event", "id": "ev-2"}],
                "hypotheses": [{"text": "Attacker may be probing for SSH"}],
                "risk_explanation": "High severity events and multiple indicators raise risk to 78",
                "recommended_actions": [{"action": "BLOCK_IP", "target": "192.0.2.10"}],
                "confidence": 0.92,
                "requires_operator_approval": True,
                "provider_available": True,
            }
        }


class Copilot:
    """Facade class used by the API layer.

    It isolates all AI‑related logic, keeping deterministic engines separate.
    The class is deliberately stateless – a new instance can be created per request.
    """

    def __init__(self):
        self.settings = get_settings()
        self.client = httpx.AsyncClient(timeout=self.settings.OLLAMA_TIMEOUT or 60)
        # Engines are lightweight; we instantiate them once.
        self.story_engine = AttackStoryEngine()
        self.risk_engine = RiskEngine()
        self.graph_engine = AttackGraphEngine()
        self.correlation_engine = CorrelationEngine()

    async def _fetch_incident_and_events(self, db, incident_id: str) -> tuple[Dict[str, Any], List[Dict[str, Any]]]:
        """Retrieve incident data and its linked events as plain dicts.
        The returned objects are JSON‑serialisable and safe for prompt insertion.
        """
        incident = await IncidentRepository.get_incident(db, incident_id)
        if not incident:
            raise ValueError(f"Incident {incident_id} not found")
        # Convert ORM objects to dicts (exclude private attributes).
        incident_dict = {
            "id": incident.id,
            "title": incident.title,
            "description": incident.description,
            "risk_score": incident.risk_score,
            "attack_stage": incident.attack_stage,
            "first_seen": incident.first_seen.isoformat() if incident.first_seen else None,
            "last_seen": incident.last_seen.isoformat() if incident.last_seen else None,
            "status": incident.status,
            "source_ips": incident.source_ips,
            "target_assets": incident.target_assets,
            "event_count": incident.event_count,
        }
        # Events linked to the incident.
        events = await EventRepository.list_events(db, limit=1000, offset=0, filters={"incident_id": incident_id})
        events_list = []
        for ev in events:
            events_list.append(
                {
                    "id": ev.id,
                    "timestamp": ev.timestamp.isoformat(),
                    "source_ip": ev.source_ip,
                    "destination_ip": ev.destination_ip,
                    "event_type": ev.event_type.value,
                    "severity": ev.severity.value,
                    "description": ev.description,
                    "detection_source": ev.detection_source,
                    "evidence": ev.evidence,
                    "status": ev.status.value,
                    "confidence": getattr(ev, "confidence", 1.0),
                }
            )
        return incident_dict, events_list

    async def _call_ollama(self, prompt: str) -> dict:
        """POST the prompt to Ollama and return the parsed JSON response.
        Raises ``RuntimeError`` for any transport or parsing issue.
        """
        url = f"{self.settings.OLLAMA_URL.rstrip('/')}/api/generate"
        payload = {
            "model": self.settings.OLLAMA_MODEL,
            "prompt": prompt,
            "stream": False,
            "temperature": 0.0,
        }
        try:
            resp = await self.client.post(url, json=payload)
            resp.raise_for_status()
            data = resp.json()
            # Ollama returns {"response": "..."}
            raw = data.get("response", "")
            # The model should output a JSON object – strip surrounding whitespace.
            raw = raw.strip()
            # Some models may include trailing newlines; try to parse.
            return json.loads(raw)
        except (httpx.RequestError, httpx.HTTPStatusError) as exc:
            logger.error("Ollama request failed: %s", exc)
            raise RuntimeError("Ollama request failed") from exc
        except json.JSONDecodeError as exc:
            logger.error("Ollama returned malformed JSON: %s", exc)
            raise RuntimeError("Malformed JSON from Ollama") from exc

    async def _fallback_response(self, incident: dict, events: List[dict]) -> CopilotResponse:
        """Create a deterministic fallback when Ollama is unavailable.
        The fallback summarises the incident and lists event types.
        """
        # Simple deterministic summary.
        event_types = sorted({e["event_type"] for e in events})
        summary = f"Incident {incident.get('id')} includes {len(events)} events of types: {', '.join(event_types)}."
        # No confirmed evidence beyond what the DB already stores.
        confirmed = []
        suspicious = []
        for ev in events:
            evidence_entry = {"event_id": ev["id"], "type": ev["event_type"], "severity": ev["severity"]}
            if ev["severity"] in {"HIGH", "CRITICAL"}:
                confirmed.append(evidence_entry)
            else:
                suspicious.append(evidence_entry)
        # Minimal risk explanation based on stored risk_score.
        risk_score = incident.get("risk_score", 0)
        level = "LOW"
        if risk_score >= 75:
            level = "CRITICAL"
        elif risk_score >= 50:
            level = "HIGH"
        elif risk_score >= 25:
            level = "MEDIUM"
        risk_explanation = f"Risk score {risk_score} maps to {level} level."
        return CopilotResponse(
            incident_id=incident.get("id"),
            summary=summary,
            confirmed_evidence=confirmed,
            suspicious_indicators=suspicious,
            hypotheses=[],
            risk_explanation=risk_explanation,
            recommended_actions=[],
            confidence=0.0,
            requires_operator_approval=False,
            provider_available=False,
        )

    async def _process(self, db, incident_id: str, operation: str) -> CopilotResponse:
        """Common workflow for analyse / explain / recommend.
        ``operation`` selects the appropriate prompt template.
        """
        incident, events = await self._fetch_incident_and_events(db, incident_id)
        # Prepare optional engine data based on operation.
        story = await self.story_engine.build_story(db, incident_id) if operation in {"explain", "summarize"} else {}
        risk = await self.risk_engine.calculate(db, incident_id) if operation in {"risk", "recommend", "summarize"} else {}
        graph = await self.graph_engine.build_graph(db, incident_id) if operation == "graph" else {}
        # Build the prompt – all data is JSON‑escaped to avoid injection.
        context = {
            "incident": incident,
            "events": events,
            "story": story,
            "risk": risk,
            "graph": graph,
        }
        # Choose template.
        if operation == "analyse":
            tmpl = PROMPT_ANALYZE
        elif operation == "explain":
            tmpl = PROMPT_EXPLAIN
        elif operation == "recommend":
            tmpl = PROMPT_RECOMMEND
        elif operation == "summarize":
            tmpl = PROMPT_SUMMARIZE
        elif operation == "risk":
            tmpl = PROMPT_RISK
        elif operation == "evidence":
            tmpl = PROMPT_EVIDENCE
        else:
            raise ValueError(f"Unsupported operation {operation}")
        # Render safe prompt.
        prompt = tmpl.replace("{{ incident_json }}", json.dumps(incident, ensure_ascii=False))
        prompt = prompt.replace("{{ events_json }}", json.dumps(events, ensure_ascii=False))
        prompt = prompt.replace("{{ story_json }}", json.dumps(story, ensure_ascii=False))
        prompt = prompt.replace("{{ risk_json }}", json.dumps(risk, ensure_ascii=False))
        prompt = prompt.replace("{{ graph_json }}", json.dumps(graph, ensure_ascii=False))
        # If Ollama is disabled, skip the request.
        if not self.settings.OLLAMA_ENABLED:
            logger.info("Ollama disabled – using deterministic fallback for %s", operation)
            return await self._fallback_response(incident, events)
        # Call Ollama and validate response.
        try:
            raw_resp = await self._call_ollama(prompt)
            # Validate against schema.
            response = CopilotResponse(**raw_resp)
            # Ensure incident_id matches request.
            if response.incident_id != incident_id:
                raise ValidationError(["incident_id mismatch"], CopilotResponse)
            response.provider_available = True
            return response
        except (RuntimeError, ValidationError) as exc:
            logger.warning("Ollama call failed or response invalid (%s); falling back", exc)
            return await self._fallback_response(incident, events)

    # Public API methods used by the FastAPI router.
    async def analyze(self, db, incident_id: str) -> CopilotResponse:
        return await self._process(db, incident_id, "analyse")

    async def explain(self, db, incident_id: str) -> CopilotResponse:
        return await self._process(db, incident_id, "explain")

    async def recommend(self, db, incident_id: str) -> CopilotResponse:
        return await self._process(db, incident_id, "recommend")

    async def summarize(self, db, incident_id: str) -> CopilotResponse:
        return await self._process(db, incident_id, "summarize")

    async def risk(self, db, incident_id: str) -> CopilotResponse:
        return await self._process(db, incident_id, "risk")

    async def evidence(self, db, incident_id: str) -> CopilotResponse:
        return await self._process(db, incident_id, "evidence")

    async def status(self) -> dict:
        """Return a simple health dict for the provider.
        ``available`` reflects the ``OLLAMA_ENABLED`` flag; ``reachable`` attempts a tiny
        health check if enabled.
        """
        if not self.settings.OLLAMA_ENABLED:
            return {"available": False, "reachable": False, "model": self.settings.OLLAMA_MODEL}
        try:
            # A cheap ping – Ollama returns model list at /api/tags, but we use generate with an empty prompt.
            url = f"{self.settings.OLLAMA_URL.rstrip('/')}/api/generate"
            payload = {"model": self.settings.OLLAMA_MODEL, "prompt": "ping", "stream": False, "temperature": 0.0}
            resp = await self.client.post(url, json=payload, timeout=5)
            resp.raise_for_status()
            reachable = True
        except Exception:
            reachable = False
        return {"available": True, "reachable": reachable, "model": self.settings.OLLAMA_MODEL}

