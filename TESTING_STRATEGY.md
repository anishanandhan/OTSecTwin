# Testing Strategy & Quality Assurance Architecture

**Project:** OTSecTwin  
**Test Coverage Target:** $\ge 60\%$ overall coverage, $100\%$ on security primitives  
**Test Frameworks:** Vitest, Testing Library, Playwright (Frontend) & Pytest, Pytest-Cov (Backend)  

---

## 1. Multi-Tier Testing Pyramid

```
                ┌──────────────────────────────┐
                │   E2E & Accessibility Tests  │  Playwright + axe-core
                │   (Main Flow & WCAG Scans)   │  Zero A/AA Violations
                └──────────────┬───────────────┘
                               │
                ┌──────────────▼───────────────┐
                │   Integration & API Tests    │  FastAPI TestClient
                │   (Simulations & PCAP I/O)   │  Modbus Register Checks
                └──────────────┬───────────────┘
                               │
                ┌──────────────▼───────────────┐
                │   Unit & Security Tests      │  Vitest + Pytest
                │   (Sanitize, Headers, Physics)│ 100% Security Coverage
                └──────────────────────────────┘
```

---

## 2. Testing Layers & Test Suites

### 2.1 Security Module Tests (Target: 100% Coverage)
Located at:
- `frontend/test/security/sanitize.test.js`
- `frontend/test/security/headers.test.js`
- `backend/tests/test_sanitize.py`
- `backend/tests/test_headers.py`

**Scenarios Validated:**
- Neutralization of malicious script tags (`<script>alert(1)</script>`), `onerror` vectors, and javascript URI schemes.
- Stripping of zero-width characters (`\u200B`, `\uFEFF`) and bidirectional text overrides.
- Redaction of sensitive credentials, API keys (`sk-12345...`), and email addresses from logs.
- Validation of strict CSP, HSTS, frame-ancestors, and X-Content-Type headers.

### 2.2 Domain & Physics Simulation Tests
Located at:
- `backend/tests/test_simulator.py`
- `frontend/test/domain/telemetry.test.js`

**Scenarios Validated:**
- Mass conservation in fluid dynamics simulation loop: $V(t+1) = V(t) + (Q_{\text{in}} - Q_{\text{out}})\Delta t$.
- Triggering critical alarm states when tank level exceeds $90\%$ or pressure exceeds $5.0 \text{ bar}$.
- Verification of Modbus register mapping: Register `40001` (Tank Level), Register `40002` (Inflow), Register `40005` (pH).
- Resetting plant state restores nominal equilibrium ($68.5\%$ level, $7.2 \text{ pH}$, $1450 \text{ RPM}$).

### 2.3 End-to-End User Journey & Accessibility
- **User Flow:** Landing view $\rightarrow$ Inspect plant telemetry $\rightarrow$ Trigger Stuxnet overfill attack $\rightarrow$ Observe visual tank level surge to $98\%$ and critical alert generation $\rightarrow$ Trigger reset.
- **Accessibility Gate:** Automated axe-core audits verify zero WCAG 2.1 A or AA violations on empty, populated, and modal overlay states.

---

## 3. Continuous Integration Gates

Every pull request and push to `main` must pass the following automated verification gates:
1. `npm run lint` / `oxlint` $\rightarrow$ 0 warnings, 0 errors.
2. `npm run test` $\rightarrow$ All unit and component tests green.
3. `pytest --cov=app --cov-fail-under=60` $\rightarrow$ Backend coverage meets threshold.
4. `npm run build` $\rightarrow$ Production bundle builds cleanly without TypeScript or bundler errors.
