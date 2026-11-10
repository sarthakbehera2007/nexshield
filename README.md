# NEXSHIELD — AI-Assisted Intelligent Cyber Defence Platform
**DETECT. UNDERSTAND. DEFEND.**

NEXSHIELD is a multi-tier cyber defence architecture built for enterprise-grade SOC threat detection, attack correlation, explainable AI guidance, digital honeypot lures, and operator-controlled containment.

---

## Architecture Topology

```
+-----------------------------------------------------------------------------------+
|                            WINDOWS OPERATOR WORKSTATION                          |
|  - React 19 + Three.js / React Three Fiber + Tailwind CSS                         |
|  - Real-Time WebSocket Telemetry Feed                                             |
|  - Live SOC Dashboard (Analytical charts, threat progression)                    |
|  - Defence Center (Operator approvals, dry-run & reversible containment)         |
|  - Honeypot Center (Decoy interaction analytics & attacker sessions)             |
+-----------------------------------------------------------------------------------+
                                         | REST & WebSocket
                                         v
+-----------------------------------------------------------------------------------+
|                        CENTRAL UBUNTU BACKEND (FastAPI Host)                     |
|  - Detection Engine (Signature, behavioral & threshold rules)                     |
|  - Correlation Engine (Time-window & entity clustering)                          |
|  - Attack Story & Risk Scoring Engine (Deterministic 0-100 risk calculation)      |
|  - Intelligent Defence Engine (Policy evaluation, human-in-the-loop approvals)    |
|  - Digital Honeypot Subsystem (5 decoy services, session & heuristic analysis)    |
|  - AI Security Copilot (Grounded incident explanations via Ollama)                |
|  - Persistent SQLite Database (Audit trail, incidents, sessions)                 |
+-----------------------------------------------------------------------------------+
        ^                                                    ^
        | Controlled Testing                                 | Mobile Gateway
+-------------------------+                       +-------------------------+
|     KALI LINUX RED      |                       |     ANDROID MOBILE      |
|  - Controlled probes    |                       |  - Remote inspections   |
|  - Authorized testing   |                       |  - Mobile gateway events|
+-------------------------+                       +-------------------------+
```

---

## Key Subsystems

### 1. Intelligent Defence Engine (`app/defence/`)
- **Safety Modes**:
  - `OBSERVE`: Report and propose actions without automated host modification.
  - `APPROVAL_REQUIRED`: Human operator must inspect and explicitly confirm proposed containment.
  - `CONTROLLED_AUTOMATION`: Strictly scoped to pre-approved lab targets.
- **Reversible Containment Actions**: Temporary IP blocks, local denylists, endpoint quarantine, rate-limiting.
- **Fail-Safe Allowlist**: Protected targets (management workstation, DNS, backend gateway) can never be blocked.
- **Audit Log**: Immutable audit record for all state transitions (PROPOSED -> APPROVED -> EXECUTED -> ROLLED_BACK).

### 2. Digital Decoy Honeypot (`app/honeypot/`)
- **5 Decoy Services**:
  - `/decoys/portal`: Corporate intranet landing decoy.
  - `/decoys/admin/login`: Brute-force lure capturing credential stuffing.
  - `/decoys/api/v1/*`: REST API decoy capturing unauthenticated endpoint probing.
  - `/decoys/ssh/banner`: Simulated OpenSSH 8.9p1 handshake.
  - `/decoys/db/banner`: Simulated PostgreSQL 15.4 wire protocol probe.
- **Behavior Classifier**: Heuristic signature engine classifying SQLi, XSS, Path Traversal, and Scanners (nmap, nikto, sqlmap).
- **Attacker Session Tracking**: Tracks session lifecycle, service traversal, and telemetry feeds into the main security event pipeline.

### 3. Advanced SOC Dashboard
- **Telemetry Ingestion**: WebSocket live feed with auto-reconnection and heartbeat.
- **Analytical Charts**: Recharts-powered threat timelines and severity distribution.
- **Operator Navigation**: Quick toggle between Brand Showcase, Live SOC, Defence Center, and Honeypot Center.

### 4. Android Mobile Security Gateway (`app/gateway/` & `src/mobile/`)
- **PWA Experience**: Android-first responsive interface with manifest, service worker support, and offline event caching.
- **Cryptographic Registration**: Random token generation with SHA-256 hashed backend verification.
- **Emergency SOS**: Immediate CRITICAL priority event generation with optional GPS telemetry.
- **Edge URL Inspector**: Client-side & backend heuristic analysis against phishing, abusive TLDs, and IP hosts.
- **Fleet Management**: SOC console view for tracking active heartbeats and one-click credential revocation.
- Detailed documentation: [`MOBILE_GATEWAY.md`](MOBILE_GATEWAY.md).

---

## Quickstart

### Backend (Ubuntu / Central Host)
```bash
cd backend
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000
```
- Swagger UI Documentation: `http://localhost:8000/docs`
- Health Check: `http://localhost:8000/health`
- Run Backend Tests:
  ```bash
  python -m pytest tests/test_phase6.py -v
  ```

### Frontend (Windows Dashboard)
```bash
npm install
npm run dev
```
Open `http://localhost:5173` to access the SOC interface.

---

## Acceptance Test Matrix

| Subsystem | Test Coverage | Status |
|-----------|---------------|--------|
| Health Probe & System Status | `tests/test_phase6.py::test_health_check` | PASS |
| Defence Policy & Status API | `tests/test_phase6.py::test_defence_status_and_policies` | PASS |
| Defence Action Full Lifecycle | `tests/test_phase6.py::test_defence_action_lifecycle` | PASS |
| Action Rejection Workflow | `tests/test_phase6.py::test_defence_reject_action` | PASS |
| Allowlist & Gateway Protection | `tests/test_phase6.py::test_defence_safety_protection` | PASS |
| Honeypot Status & Service Enumeration | `tests/test_phase6.py::test_honeypot_status_and_services` | PASS |
| Decoy Telemetry & Session Ingestion | `tests/test_phase6.py::test_honeypot_decoy_interactions_and_telemetry` | PASS |
| Mobile Gateway Status & Device Fleet | `tests/test_phase9.py::test_mobile_gateway_status` | PASS |
| Device Registration & Heartbeats | `tests/test_phase9.py::test_mobile_device_registration_and_auth` | PASS |
| Mobile Auth & Revocation Enforcement | `tests/test_phase9.py::test_mobile_device_revocation_enforced` | PASS |
| Gateway Heuristic URL Inspection | `tests/test_phase9.py::test_mobile_url_inspector_heuristics` | PASS |
| Frontend Production Build | `npm run build` | PASS |
