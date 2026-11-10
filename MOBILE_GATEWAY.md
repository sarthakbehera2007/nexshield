# NEXSHIELD Phase 9 — Android Mobile Security Gateway & PWA Client
**DETECT. UNDERSTAND. DEFEND.**

The **NEXSHIELD Mobile Security Gateway** extends the NEXSHIELD enterprise defence fabric to Android and edge mobile devices. It provides cryptographic device authentication, edge threat event ingestion, emergency SOS distress alerting, heuristic URL inspection, and offline queueing with IndexedDB fallback.

---

## Architecture Overview

```
+------------------------------------------------------------------------------------+
|                         ANDROID / MOBILE PWA CLIENT                                |
|  - Progressive Web App (manifest.json, standalone display, responsive SOC UI)       |
|  - Cryptographic Device Storage (nxs_mobile_device: device_id + api_key)           |
|  - Offline Queue (IndexedDB with localStorage fallback + automatic background sync)|
|  - Emergency SOS Trigger (Dual-tap verification + GPS / network geo coordinates)   |
|  - Edge Heuristic URL Scanner (Instant triage of suspicious phishing URLs)         |
+------------------------------------------------------------------------------------+
                                      |
                         REST API & WebSocket Broadcast
                         Headers: X-Device-Key: <api_key>
                                      v
+------------------------------------------------------------------------------------+
|                   CENTRAL BACKEND GATEWAY (app/gateway/)                           |
|  - Device Authentication: SHA-256 hashed API key validation                        |
|  - Device Manager: Registration, credential revocation, lifecycle tracking         |
|  - Heartbeat Engine: Active/Inactive state tracking, dynamic incident sync         |
|  - Event Ingestion: Normalizes mobile reports -> Core SecurityEvent pipeline       |
|  - SOS Dispatcher: Immediate CRITICAL event escalation & WebSocket push            |
|  - Heuristic URL Inspector: Raw IP host, abusive TLD, hex & phishing detection     |
+------------------------------------------------------------------------------------+
                                      |
                                      v
+------------------------------------------------------------------------------------+
|                   WINDOWS SOC CONSOLE (MobileGatewayCenter)                        |
|  - Real-time fleet overview (Active heartbeats, device IDs, platforms)             |
|  - One-click device credential revocation                                          |
|  - Live SOS distress monitor and event inspection                                  |
|  - Standalone Gateway URL inspection playground                                    |
|  - In-browser mobile app simulator toggle                                          |
+------------------------------------------------------------------------------------+
```

---

## Backend Subsystem (`app/gateway/`)

| Module | Responsibility |
|---|---|
| `device_auth.py` | Cryptographically secure random device key generation (`secrets.token_urlsafe(32)`) and SHA-256 hash comparison. |
| `device_manager.py` | Registration of devices, uniqueness validation, device queries, credential revocation. |
| `heartbeat_service.py` | Device telemetry recording (`last_seen`, status, app version), retrieval of open incident counts for edge awareness. |
| `mobile_event_service.py` | Threat report persistence (`gateway_mobile_reports`) and conversion into core `SecurityEvent` models for correlation. |
| `sos_service.py` | Distress signal ingestion (`gateway_mobile_sos`) with GPS location, immediate CRITICAL event broadcast (`mobile.sos_alert`). |
| `url_inspector.py` | Heuristic engine evaluating raw IP hosts, suspicious TLDs (`.xyz`, `.top`, `.tk`), hex encoding, and credential lures. |
| `models.py` | SQLAlchemy tables: `MobileGatewayDevice`, `MobileSecurityReport`, `MobileSOSAlert`. |
| `schemas.py` | Pydantic v2 validation models for all gateway requests and responses. |

---

## API Endpoints (`/api/mobile`)

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/mobile/status` | Mobile gateway health, registered & active device counts, SOS statistics | No |
| `GET` | `/api/mobile/devices` | Fleet inventory for SOC operators | No |
| `POST` | `/api/mobile/register` | Register a new mobile agent & issue API credential | No |
| `POST` | `/api/mobile/devices/{id}/heartbeat` | 25-second telemetry heartbeat and status check | `X-Device-Key` |
| `POST` | `/api/mobile/events` | Ingest edge security report (Smishing, Rogue Wi-Fi, etc.) | `X-Device-Key` |
| `POST` | `/api/mobile/sos` | Trigger emergency distress alert with optional coordinates | `X-Device-Key` |
| `POST` | `/api/mobile/inspect-url` | Evaluate URL risk score and heuristics (0-100 score) | Optional |
| `POST` | `/api/mobile/devices/{id}/revoke` | Revoke a compromised device key (returns HTTP 403 on subsequent calls) | No (Admin/SOC) |

---

## Frontend Architecture (`src/mobile/`)

- **Pages**:
  - `DeviceRegistration.jsx`: Clean onboarding screen prompting for device name and platform (Android, iOS, Linux, Other). Saves cryptographic credential locally.
  - `MobileDashboard.jsx`: Edge device health card, quick URL scanner, quick SOS trigger, real-time connectivity badge, and offline queue status.
  - `SecurityCenter.jsx`: Threat reporting interface (Phishing URL, Rogue AP, Bluetooth, App Anomaly, Smishing) with offline fallback.
  - `SOSPage.jsx`: High-visibility emergency distress trigger with optional Geolocation API capture and safety confirmation gate.
  - `IncidentPage.jsx`: Lists device-submitted telemetry reports and synced enterprise incidents from the central SOC correlation engine.
  - `SettingsPage.jsx`: Offline queue inspector, manual sync trigger, local queue purge, and device deregistration.
- **Services**:
  - `offlineQueue.js`: Reliable IndexedDB queue with localStorage fallback. Automatically retries and pushes stored telemetry upon connectivity restoration.
  - `mobileApi.js`: Centralized mobile API client matching all `/api/mobile` routes.
- **SOC Integration**:
  - `src/components/ui/MobileGatewayCenter.jsx`: Full enterprise dashboard view for desktop operators to monitor fleet status, inspect devices, trigger revocations, and run URL heuristics.
  - `Navbar.jsx`: Dedicated navigation tabs for `MOBILE GATEWAY` (desktop view) and `MOBILE APP` (PWA simulator view).

---

## Testing & Verification

Run the comprehensive test suites:

```bash
cd backend
python -m pytest tests/test_phase6.py tests/test_phase9.py -v
```

All 10 test scenarios pass:
1. `test_health_check`
2. `test_defence_status_and_policies`
3. `test_defence_action_lifecycle`
4. `test_defence_reject_action`
5. `test_honeypot_decoy_interactions_and_telemetry`
6. `test_mobile_gateway_status`
7. `test_mobile_device_registration_and_auth`
8. `test_mobile_invalid_key_rejected`
9. `test_mobile_device_revocation_enforced`
10. `test_mobile_url_inspector_heuristics`

