# NEXSHIELD — AI-Assisted Intelligent Cyber Defence Platform
**DETECT. UNDERSTAND. DEFEND.**

[![MLH Hackathon Project](https://img.shields.io/badge/MLH-Hackathon%20Project-FF0055?style=for-the-badge&logo=majorleaguehacking&logoColor=white)](https://mlh.io)
[![Google Gemma 4 Powered](https://img.shields.io/badge/Powered%20By-Google%20Gemma%204-4285F4?style=for-the-badge&logo=google&logoColor=white)](https://ai.google.dev/gemma)
[![Team ExploitX](https://img.shields.io/badge/Team-ExploitX-00D4FF?style=for-the-badge)](https://github.com/sarthakbehera2007/nexshield)

NEXSHIELD is a distributed, multi-tier cyber defence architecture built for enterprise-grade SOC threat detection, attack correlation, **Google Gemma 4** explainable AI guidance, digital honeypot lures, and human-in-the-loop reversible containment.

Detailed MLH submission write-up: [`PROJECT_SUBMISSION.md`](PROJECT_SUBMISSION.md).

---

## 👥 Team ExploitX

- **Lead**: Sarthak Kumar Behera (Architecture, Central FastAPI Backend, Defence Engine & Integration)
- **Team Member**: Aditya Narayana Gajendra (Cyber Threat Intelligence, Digital Honeypots & Kali Linux Red Teaming)
- **Team Member**: Ompratik Mohanty (Frontend Engineering, Three.js 3D Hardware Visualization, Android Gateway PWA)

**GitHub Repository**: [https://github.com/sarthakbehera2007/nexshield](https://github.com/sarthakbehera2007/nexshield)

---

## Architecture Topology

```
+-----------------------------------------------------------------------------------+
|                            WINDOWS OPERATOR WORKSTATION                          |
|  - React 19 + Three.js / React Three Fiber + GSAP + Tailwind CSS                 |
|  - Real-Time WebSocket Telemetry Feed & 3D Threat Reactivity                      |
|  - Live SOC Dashboard (Analytical charts, threat progression)                    |
|  - Red Team Attack Simulation HUD & Audio Sirens                                  |
|  - Defence Center (Operator approvals, dry-run & reversible containment)         |
|  - Honeypot Center (Decoy interaction analytics & attacker sessions)             |
|  - Mobile Gateway Center (Device fleet telemetry & credential revocation)         |
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
|  - AI Security Copilot (Powered by Google Gemma 4 with zero-downtime fallback)    |
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

### 1. Google Gemma 4 AI Security Copilot (`app/ai/gemma_copilot.py`)
- **Model**: Powered by Google DeepMind's **Gemma 4** open-weights architecture.
- **Explainable Triage**: Translates raw security payloads into plain-language incident explanations.
- **MITRE ATT&CK Attribution**: Real-time automated mapping (`T1190`, `T1110`, `T1083`, `T1200`).
- **Zero-Downtime Fallback**: Features an embedded deterministic cybersecurity expert engine when offline.
- **Human-in-the-Loop Guardrails**: Gemma recommends containment actions with confidence scores, but never executes modifications without operator approval.

### 2. Intelligent Defence Engine (`app/defence/`)
- **Safety Modes**:
  - `OBSERVE`: Report and propose actions without automated host modification.
  - `APPROVAL_REQUIRED`: Human operator must inspect and explicitly confirm proposed containment.
  - `CONTROLLED_AUTOMATION`: Strictly scoped to pre-approved lab targets.
- **Reversible Containment Actions**: Temporary IP blocks, local denylists, endpoint quarantine, rate-limiting.
- **Fail-Safe Allowlist**: Protected targets (management workstation, DNS, backend gateway) can never be blocked.
- **Audit Log**: Immutable audit record for all state transitions (PROPOSED -> APPROVED -> EXECUTED -> ROLLED_BACK).

### 3. Digital Decoy Honeypot (`app/honeypot/`)
- **5 Decoy Services**:
  - `/decoys/portal`: Corporate intranet landing decoy.
  - `/decoys/admin/login`: Brute-force lure capturing credential stuffing.
  - `/decoys/api/v1/*`: REST API decoy capturing unauthenticated endpoint probing.
  - `/decoys/ssh/banner`: Simulated OpenSSH 8.9p1 handshake.
  - `/decoys/db/banner`: Simulated PostgreSQL 15.4 wire protocol probe.
- **Behavior Classifier**: Heuristic signature engine classifying SQLi, XSS, Path Traversal, and Scanners (nmap, nikto, sqlmap).
- **Attacker Session Tracking**: Tracks session lifecycle, service traversal, and telemetry feeds into the main security event pipeline.

### 4. Advanced SOC Dashboard & 3D Hardware Visualizer
- **3D Titanium-Graphite Shield**: Three.js hardware assembly reacting physically to breaches (crimson red alarm glow $\rightarrow$ emerald green containment).
- **Attack Simulator HUD**: Built-in browser control bar triggering live attacks with audio sirens and instant containment buttons.
- **Analytical Charts**: Recharts-powered threat timelines and severity distribution.

### 5. Android Mobile Security Gateway (`app/gateway/` & `src/mobile/`)
- **PWA Experience**: Android-first responsive interface with manifest, service worker support, and offline event caching.
- **Cryptographic Registration**: Random token generation with SHA-256 hashed backend verification.
- **Emergency SOS**: Immediate CRITICAL priority event generation with optional GPS telemetry.
- **Edge URL Inspector**: Client-side & backend heuristic analysis against phishing, abusive TLDs, and IP hosts.
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
- Gemma Copilot Status: `http://localhost:8000/copilot/status`
- Run Backend Tests:
  ```bash
  python -m pytest tests -v
  ```

### Frontend (Windows Dashboard)
```bash
npm install
npm run dev -- --host
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
| Mobile Key Rejection Enforcement | `tests/test_phase9.py::test_mobile_invalid_key_rejected` | PASS |
| Mobile Auth & Revocation Enforcement | `tests/test_phase9.py::test_mobile_device_revocation_enforced` | PASS |
| Gateway Heuristic URL Inspection | `tests/test_phase9.py::test_mobile_url_inspector_heuristics` | PASS |
| Google Gemma 4 Copilot Status | `tests/test_gemma.py::test_gemma_copilot_status` | PASS |
| Gemma 4 Interactive Threat Chat | `tests/test_gemma.py::test_gemma_copilot_chat` | PASS |
| Gemma Request Validation | `tests/test_gemma.py::test_gemma_copilot_chat_empty_validation` | PASS |
| Frontend Production Build | `npm run build` | PASS (1.12s) |
