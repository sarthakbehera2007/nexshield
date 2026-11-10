# NEXSHIELD — AI-Assisted Intelligent Cyber Defence Platform
### Major League Hacking (MLH) Project Submission & Documentation
**DETECT. UNDERSTAND. DEFEND.**

[![MLH Hackathon Project](https://img.shields.io/badge/MLH-Hackathon%20Project-FF0055?style=for-the-badge&logo=majorleaguehacking&logoColor=white)](https://mlh.io)
[![Google Gemma 4 Powered](https://img.shields.io/badge/Powered%20By-Google%20Gemma%204-4285F4?style=for-the-badge&logo=google&logoColor=white)](https://ai.google.dev/gemma)
[![Team ExploitX](https://img.shields.io/badge/Team-ExploitX-00D4FF?style=for-the-badge)](https://github.com/sarthakbehera2007/nexshield)

---

## 👥 Team ExploitX

| Member Name | Role & Core Responsibilities |
| :--- | :--- |
| **Sarthak Kumar Behera** *(Lead)* | System Architecture, Central FastAPI Backend, Intelligent Defence Engine & Reversible Rollback, Integration Lead |
| **Aditya Narayana Gajendra** | Cyber Threat Intelligence, Digital Honeypot Subsystem, Attack Classification & Kali Linux Red Team Scenarios |
| **Ompratik Mohanty** | SOC Dashboard UI/UX, Three.js 3D Cyber Shield Visualizer, Android PWA Gateway & Real-Time Alert HUD |

- **Official Repository**: [https://github.com/sarthakbehera2007/nexshield](https://github.com/sarthakbehera2007/nexshield)

---

## 💡 Inspiration

Modern Security Operations Centers (SOCs) are overwhelmed. Analysts face thousands of alerts daily, 70% of which are false positives or lack actionable context. When genuine breaches occur, defenders face two extremes:
1. **Passive dashboards** that display alerts without safe containment mechanisms.
2. **Brittle autonomous black-boxes** that risk locking out legitimate users or taking down core business services.

We created **NEXSHIELD** to pioneer **Explainable, Human-in-the-Loop Autonomous Defence**. By pairing high-fidelity digital honeypot lures with **Google's Gemma 4** open-weights intelligence model and a cinematic 3D cyber shield visualizer, NEXSHIELD equips operators to immediately detect intrusions, understand attacker intent via MITRE ATT&CK mapping, and execute safe, reversible containment before data loss occurs.

---

## 🛡️ What NEXSHIELD Does

NEXSHIELD is a production-grade, distributed cyber defence platform comprising four interconnected tiers:

1. **Central Intelligence & Defence Engine (Ubuntu Host)**:
   - Evaluates incoming network traffic across rule-based, behavioral, and heuristic detectors.
   - Deploys **5 active honeypot decoy services** (`/decoys/portal`, `/decoys/admin/login`, `/decoys/api/v1/users`, `/decoys/ssh/banner`, `/decoys/db/banner`) to trap credential stuffing, SQL injection, path traversal, and automated vulnerability scanners.
   - Computes deterministic 0–100 threat risk scores and correlates multi-stage attacks into an Attack Story graph.
   - Implements **human-in-the-loop containment**: proposes temporary IP blocks and endpoint quarantine with an immutable audit trail and one-click rollback.

2. **Google Gemma 4 AI Security Copilot**:
   - Integrates Google's **Gemma 4** model architecture into the heart of the SOC.
   - Analyzes raw telemetry in real time, translating complex packet logs into clear, plain-language incident summaries.
   - Automatically maps indicators to standard MITRE ATT&CK techniques (`T1190`, `T1110`, `T1083`, `T1200`).
   - Features a **zero-downtime deterministic intelligence fallback** so the SOC never goes blind even during network isolation.

3. **3D Interactive SOC Dashboard (Windows Operator Console)**:
   - Built with React 19, Three.js, React Three Fiber, GSAP, and Tailwind CSS.
   - Displays a dynamic **Titanium-Graphite Cyber Shield** that reacts physically to threats: pulsing crimson red during active breaches and glowing emerald green upon containment.
   - Features a built-in **Red Team Attack Simulation & Alert HUD**, enabling one-click attack triggers and sirens directly in the browser.

4. **Android Mobile Security Gateway (PWA)**:
   - Extends defence to edge devices with an Android-first Progressive Web App (`manifest.json`, standalone mode).
   - Cryptographic device authentication (`X-Device-Key` with SHA-256 hashed backend verification).
   - Emergency **SOS Distress Beacon** with GPS coordinate capture and immediate high-priority escalation.
   - Heuristic edge URL scanner and IndexedDB offline event queue.

---

## 🧠 Google Gemma 4 AI Copilot Integration

```
+-----------------------------------------------------------------------------+
|                           NEXSHIELD TELEMETRY GRAPH                         |
|  - Honeypot Decoy Traps  - Incident Risk Scores  - Correlated SecurityEvents|
+-----------------------------------------------------------------------------+
                                       |
                                       v
+-----------------------------------------------------------------------------+
|                         GOOGLE GEMMA 4 COPILOT ENGINE                       |
|  - System Instruction: Principal SOC Analyst & Threat Attribution Architect|
|  - Grounded Context: Injects live incident ID, source IPs, and raw payloads|
|  - Output Schema: JSON explanations, MITRE ATT&CK mapping & action advice   |
|  - Resilience: Automatic high-accuracy embedded fallback when offline       |
+-----------------------------------------------------------------------------+
                                       |
                   +-------------------+-------------------+
                   |                                       |
                   v                                       v
    [ NATURAL LANGUAGE SOC CHAT ]             [ DEFENCE PROPOSAL ENGINE ]
    Interactive Q&A in Dashboard              Pre-vetted Containment (BLOCK_IP)
```

NEXSHIELD leverages Google's **Gemma 4** open-weights model to solve the "black-box" dilemma in cybersecurity. Gemma 4 provides:
- **Evidence-Backed Explanations**: Tells the analyst *why* an attack is malicious, citing raw strings like `' OR '1'='1` or failed passwords.
- **MITRE ATT&CK Technique Attribution**: Accurately maps behaviors to the MITRE framework.
- **Human Oversight Guardrails**: Gemma recommends actions with confidence scores, but never executes them autonomously without explicit operator confirmation.

---

## ⚙️ How We Built It

- **Backend**: Python 3.13, FastAPI, SQLAlchemy 2.0 (async), SQLite with `aiosqlite`, Pydantic v2, Uvicorn, WebSockets.
- **AI Intelligence**: Google Gemma 4 via Ollama / Gemma API with custom cybersecurity system instruction templates.
- **Frontend**: React 19, Vite, Three.js, `@react-three/fiber`, GSAP, Lucide React, Recharts, Tailwind CSS.
- **Edge Mobile**: Progressive Web App (PWA), Web App Manifest, Service Worker, Browser Geolocation API, IndexedDB offline sync.
- **Testing & Security**: Kali Linux 2024 (Red Team attack simulations), Pytest with `pytest-asyncio` (13 automated test suites, 100% pass rate).

---

## 🚧 Challenges We Ran Into

1. **Multi-Device Distributed Architecture**:
   Connecting Ubuntu (backend), Windows (SOC console), Kali (attacker), and Android (gateway) over a local Wi-Fi subnet required strict firewall rules, cross-origin resource sharing (CORS) wildcarding with credential support, and dynamic IP discovery.
2. **Safe, Reversible Defence Actions**:
   Ensuring defensive containment actions never disable host firewalls or lock out administrators. We implemented a dedicated `ProtectedIPAllowlist` guarding localhost, default gateways, and the operator workstation.
3. **Sub-second 3D Threat Synchronization**:
   Bridging WebSocket event bursts with Three.js shader materials and GSAP timeline animations without dropping frame rates below 60 FPS.
4. **Pydantic v2 Migration & Schema Aliasing**:
   Harmonizing ORM models with strict Pydantic v2 schemas across asynchronous SQLite queries and aliased database primary keys.

---

## 🏆 Accomplishments That We're Proud Of

- **13/13 Automated Tests Passing**: Flawless test suite covering Defence Policies, Action Lifecycles, Rollback Idempotency, Honeypot Traps, Mobile Gateway Key Revocation, and Gemma 4 Copilot endpoints.
- **Real-World Red Team Verification**: Successfully tested against genuine Kali Linux attacks (Nmap port scans, Nikto scanner probes, password stuffing loops, and SQL injection payloads).
- **Physical 3D Cyber Shield Interaction**: Created an immersive hardware visualization that makes cybersecurity visceral and intuitive.
- **Complete Human-in-the-Loop Governance**: Built an unshakeable audit log ensuring operators remain in total control of all defensive countermeasures.

---

## 📖 What We Learned

- How to ground small and medium open-weights language models (Google Gemma 4) with structured telemetry graphs to eliminate hallucinations in mission-critical environments.
- The psychology of decoy honeypot design: crafting synthetic banners and login forms that convince automated scanners and human adversaries to reveal their full attack playbook.
- Progressive Web App offline storage architecture using IndexedDB to ensure mobile field agents can report distress even in disconnected or jammed environments.

---

## 🔮 What's Next for NEXSHIELD

- **Adaptive Honeypot Mutation**: Using Gemma 4 to dynamically generate believable decoy applications on the fly based on the attacker's observed reconnaissance queries.
- **Autonomous Multi-Agent Red Teaming**: Simulating proactive threat hunting exercises inside synthetic honeypot sandboxes.
- **eBPF Kernel Probes**: Expanding Linux host telemetry with low-overhead extended Berkeley Packet Filters for zero-day privilege escalation detection.

---

### 🚀 Quickstart & Verification

```bash
# 1. Clone the repository
git clone https://github.com/sarthakbehera2007/nexshield.git
cd nexshield

# 2. Run Backend Tests (13/13 PASS)
cd backend
python -m pytest tests -v

# 3. Start Backend Host
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000

# 4. Start Windows Frontend
cd ..
npm install
npm run dev -- --host
```

Open `http://localhost:5173` to explore the NEXSHIELD SOC Console!
