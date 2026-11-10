"""Interaction Analyzer for detecting attack behavior, heuristics, and recon progression."""
from __future__ import annotations

import re
from typing import Any, Dict, List, Tuple
from .schemas import InteractionClassification, DecoyServiceType

SQLI_PATTERN = re.compile(r"(\bUNION\b|\bSELECT\b|\bINSERT\b|\bUPDATE\b|\bDELETE\b|--|/\*|;)", re.IGNORECASE)
XSS_PATTERN = re.compile(r"(<script>|javascript:|alert\(|onerror=)", re.IGNORECASE)
TRAVERSAL_PATTERN = re.compile(r"(\.\./|\.\.\\|/etc/passwd|/etc/shadow|cmd\.exe|powershell)", re.IGNORECASE)
SCANNER_UA_PATTERN = re.compile(r"(nikto|sqlmap|nmap|masscan|dirbuster|gobuster|wpscan|hydra|acunetix)", re.IGNORECASE)


class InteractionAnalyzer:
    @staticmethod
    def analyze(
        service_name: DecoyServiceType,
        method: str,
        path: str,
        user_agent: str | None,
        payload: Dict[str, Any] | None,
    ) -> Tuple[InteractionClassification, str, List[str]]:
        """
        Analyzes an incoming decoy interaction.
        Returns: (classification, severity, list_of_indicators)
        """
        indicators: List[str] = []
        severity = "LOW"
        classification = InteractionClassification.SERVICE_DISCOVERY

        combined_text = f"{method} {path} {str(payload or '')}"

        # 1. Scanner signature detection
        if user_agent and SCANNER_UA_PATTERN.search(user_agent):
            indicators.append(f"Known security scanner UA detected: '{user_agent}'")
            severity = "HIGH"
            classification = InteractionClassification.RECONNAISSANCE

        # 2. Path Traversal
        if TRAVERSAL_PATTERN.search(combined_text):
            indicators.append("Path traversal / system file probing pattern observed")
            severity = "HIGH"
            classification = InteractionClassification.PAYLOAD_INJECTION

        # 3. SQL Injection pattern
        if SQLI_PATTERN.search(combined_text):
            indicators.append("SQL injection SQL-clause keywords detected in request")
            severity = "CRITICAL"
            classification = InteractionClassification.PAYLOAD_INJECTION

        # 4. XSS pattern
        if XSS_PATTERN.search(combined_text):
            indicators.append("Cross-site scripting (XSS) payload signatures found")
            severity = "HIGH"
            classification = InteractionClassification.PAYLOAD_INJECTION

        # 5. Admin portal brute-force / enumeration
        if service_name == DecoyServiceType.ADMIN_LOGIN:
            indicators.append("Decoy Admin Login interaction")
            if method.upper() == "POST":
                classification = InteractionClassification.REPEATED_LOGIN
                severity = "HIGH"
            else:
                classification = InteractionClassification.ENDPOINT_ENUMERATION
                severity = "MEDIUM"

        # 6. Fake API probing
        elif service_name == DecoyServiceType.FAKE_API:
            indicators.append("Unauthenticated fake API probing")
            classification = InteractionClassification.API_PROBING
            severity = "MEDIUM" if severity == "LOW" else severity

        # 7. SSH banner capture
        elif service_name == DecoyServiceType.SSH_BANNER:
            indicators.append("Decoy SSH service banner capture / credential attempt")
            classification = InteractionClassification.RECONNAISSANCE
            severity = "HIGH"

        # 8. Database banner
        elif service_name == DecoyServiceType.DATABASE_BANNER:
            indicators.append("Decoy database handshake attempt")
            classification = InteractionClassification.RECONNAISSANCE
            severity = "HIGH"

        # Default fallback
        if not indicators:
            indicators.append("Decoy port probe")

        return classification, severity, indicators

