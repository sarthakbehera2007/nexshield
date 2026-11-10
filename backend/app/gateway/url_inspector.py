"""URL & Request Inspector for mobile traffic validation and phishing/threat heuristics."""
from __future__ import annotations

import re
from urllib.parse import urlparse
from typing import Any, Dict, List
from .schemas import URLInspectionRequest, URLInspectionResponse

SUSPICIOUS_TLDS = {".xyz", ".top", ".tk", ".ml", ".ga", ".cf", ".gq", ".buzz", ".fit", ".cn"}
IP_URL_PATTERN = re.compile(r"^https?://(?:\d{1,3}\.){3}\d{1,3}(?::\d+)?(?:/.*)?$", re.IGNORECASE)
EXCESSIVE_HEX_PATTERN = re.compile(r"(?:%[0-9a-fA-F]{2}){4,}")
KNOWN_PHISH_KEYWORDS = ["secure-login", "account-update", "bank-verification", "free-gift", "crypto-airdrop", "metamask-verify"]


class URLInspector:
    @staticmethod
    def inspect(req: URLInspectionRequest) -> URLInspectionResponse:
        url = req.url.strip()
        indicators: List[str] = []
        risk_score = 0.0

        try:
            parsed = urlparse(url)
        except Exception:
            return URLInspectionResponse(
                url=url,
                is_suspicious=True,
                risk_score=90.0,
                indicators=["Malformed or unparseable URL structure"],
                verdict="MALICIOUS",
                details={"error": "Malformed URL"},
            )

        # 1. Scheme checks
        if not parsed.scheme or parsed.scheme.lower() not in ("http", "https"):
            indicators.append(f"Non-standard or dangerous URI scheme: '{parsed.scheme}'")
            risk_score += 45.0

        if parsed.scheme.lower() == "http":
            indicators.append("Unencrypted HTTP connection")
            risk_score += 15.0

        # 2. IP address based URLs (common in malware/C2)
        if IP_URL_PATTERN.match(url):
            indicators.append("Raw IPv4 address used instead of reputable domain hostname")
            risk_score += 35.0

        # 3. Suspicious TLD check
        hostname = (parsed.hostname or "").lower()
        for tld in SUSPICIOUS_TLDS:
            if hostname.endswith(tld):
                indicators.append(f"High-abuse / risky Top-Level Domain detected ({tld})")
                risk_score += 30.0
                break

        # 4. Excessive encoding
        if EXCESSIVE_HEX_PATTERN.search(url):
            indicators.append("Excessive URL percent-encoding (potential obfuscation attempt)")
            risk_score += 25.0

        # 5. Phishing keywords in hostname or path
        lower_url = url.lower()
        for kw in KNOWN_PHISH_KEYWORDS:
            if kw in lower_url:
                indicators.append(f"Suspicious social-engineering keyword observed: '{kw}'")
                risk_score += 40.0

        # 6. Non-standard ports
        if parsed.port and parsed.port not in (80, 443, 8080, 8443):
            indicators.append(f"Uncommon network service port: {parsed.port}")
            risk_score += 20.0

        # Verdict assignment
        risk_score = min(100.0, risk_score)
        if risk_score >= 70.0:
            verdict = "MALICIOUS"
            is_suspicious = True
        elif risk_score >= 35.0:
            verdict = "SUSPICIOUS"
            is_suspicious = True
        else:
            verdict = "SAFE"
            is_suspicious = False
            if not indicators:
                indicators.append("Standard HTTPS format; no overt heuristics triggered.")

        return URLInspectionResponse(
            url=url,
            is_suspicious=is_suspicious,
            risk_score=risk_score,
            indicators=indicators,
            verdict=verdict,
            details={
                "hostname": parsed.hostname,
                "scheme": parsed.scheme,
                "path": parsed.path,
                "port": parsed.port,
            },
        )

