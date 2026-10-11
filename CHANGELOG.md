# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.2.0] - 2026-10-11

### Added
- LabShock Cyber-Physical Range: Water treatment and chemical neutralization testbed with real-time fluid dynamics ODE engine.
- Red Team Attack Launcher with 4 pre-configured scenarios (Stuxnet Tank Overfill, Oldsmar Chemical Acidification, False Sensor Spoofing, Reconnaissance Scanning).
- Dynamic Wireshark PCAP capture export on live simulation runs.
- Centralized HTTP security headers middleware (`SecurityHeadersMiddleware`) enforcing strict CSP, HSTS, and frame isolation.
- Comprehensive input sanitization and credential redaction modules (`sanitize.js` / `sanitize.py`).
- Universal 14-layer design tokens and WCAG 2.1 AA dual-signal telemetry indicators.

### Changed
- Refactored frontend-to-backend communication to proxy all `/api` requests through Vite reverse proxy to eliminate CORS and mixed-content issues in Docker and Cloudflare tunnels.
- Cleaned research dossier branding into enterprise industrial defense console aesthetics.
- Optimized vis-network topology rendering to stabilize physics iterations after node settlement.

### Fixed
- Fixed 404 simulation trigger failure over external Cloudflare tunnels by configuring Vite dev server proxy target.
- Resolved download link routing for simulated `.pcap` capture files.

## [1.1.0] - 2026-09-18
### Added
- Purdue Model (Levels 0-3) passive asset identification.
- RouterPlus AI Copilot integration (`gpt-4.1-mini`) for automated MITRE ATT&CK for ICS triage.
- Behavioral anomaly rule engine for unauthorized Modbus function code alerting.

## [1.0.0] - 2026-08-01
### Added
- Initial release of OTSecTwin core engine with FastAPI backend and React dashboard.
