"""Attack Graph Engine

Constructs a lightweight directed graph describing the relationships between
source IPs, target assets, events and the incident they belong to.  The graph is
returned as a JSON‑serialisable dict with ``nodes`` and ``edges`` collections.
Each node has an ``id``, ``type`` and optional ``label``; each edge contains a
``source`` node id, ``target`` node id and a ``relationship`` label.
"""

from __future__ import annotations

import logging
from typing import List, Dict, Any

from sqlalchemy.ext.asyncio import AsyncSession

from ..config import get_settings
from ..database.models import SecurityEvent, Incident
from ..database.repository import EventRepository, IncidentRepository
from ..services.logging_service import get_logger

logger = get_logger(__name__)


class AttackGraphEngine:
    """Build a relationship graph for a given incident.

    The graph includes:
    * Source IP nodes (type ``ip``)
    * Destination/asset nodes (type ``asset``)
    * Event nodes (type ``event``)
    * Incident node (type ``incident``)
    Edges are labelled to indicate the nature of the relationship, e.g.
    ``"originates_from"`` or ``"targets"``.
    """

    async def build_graph(self, db: AsyncSession, incident_id: str) -> Dict[str, Any]:
        incident = await IncidentRepository.get_incident(db, incident_id)
        if not incident:
            raise ValueError(f"Incident {incident_id} not found")
        # Fetch events linked to this incident
        events = await EventRepository.list_events(
            db, limit=1000, offset=0, filters={"incident_id": incident_id}
        )
        nodes: List[Dict[str, Any]] = []
        edges: List[Dict[str, Any]] = []
        # Incident node
        inc_node_id = f"inc-{incident.id}"
        nodes.append({"id": inc_node_id, "type": "incident", "label": incident.title})
        # Helper to ensure a node is added only once
        added: set[str] = set()
        for ev in events:
            src_id = f"ip-{ev.source_ip}"
            dst_id = f"asset-{ev.destination_ip}"
            ev_id = f"ev-{ev.id}"
            # Source IP node
            if src_id not in added:
                nodes.append({"id": src_id, "type": "ip", "label": ev.source_ip})
                added.add(src_id)
            # Destination asset node
            if dst_id not in added:
                nodes.append({"id": dst_id, "type": "asset", "label": ev.destination_ip})
                added.add(dst_id)
            # Event node
            nodes.append({"id": ev_id, "type": "event", "label": ev.event_type.value})
            # Edges
            edges.append({"source": src_id, "target": ev_id, "relationship": "originates_from"})
            edges.append({"source": ev_id, "target": dst_id, "relationship": "targets"})
            edges.append({"source": inc_node_id, "target": ev_id, "relationship": "contains"})
        graph = {"nodes": nodes, "edges": edges}
        logger.debug("Built attack graph for incident %s with %d nodes", incident.id, len(nodes))
        return graph

