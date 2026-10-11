# Code Quality Standards & Architectural Governance

**Project:** OTSecTwin  
**Language Runtimes:** Python 3.11 (Async FastAPI) & JavaScript / React 19 (Vite)  
**Governance Objective:** Enforce modularity, strict typing, zero hardcoded values, and file size constraints under 300 lines.

---

## 1. File Size & Modularity Enforcement

### 300-Line Limit Rule
No component or service file exceeds 300 lines of functional code. Monolithic architectures degrade maintainability and impede localized regression testing.
- **Frontend Entrypoint (`App.jsx`):** Under 220 lines. Serves exclusively as a coordinator for routing, tab switching, and modal states.
- **Backend Entrypoint (`main.py`):** Under 80 lines. Configures lifecycle hooks, middleware pipelines, and delegates routing to dedicated sub-routers in `app/api/`.

```
Component Extraction Hierarchy:
frontend/src/
├── components/          # Single-responsibility feature views
│   ├── AlertFeed.jsx            # < 150 lines
│   ├── AssetInventory.jsx       # < 200 lines
│   ├── CyberPhysicalLab.jsx     # Plant simulation controls & P&ID
│   ├── DashboardOverview.jsx    # Hero, trust metrics, objection cards
│   ├── NetworkTopology.jsx      # vis-network rendering
│   └── VulnerabilityScanner.jsx # CVE metrics & correlations
├── lib/security/        # Pure security primitives (sanitize, headers)
└── services/api.js      # Unified network communication client
```

---

## 2. Zero Hardcoding Governance

Every parameter subject to variation across environments is externalized into typed configurations or constants:

1. **Credentials & Host Configuration:** Managed strictly via `.env` and `pydantic-settings`:
   - `BACKEND_URL`
   - `ROUTERPLUS_API_KEY`
   - `ROUTERPLUS_BASE_URL`
   - `SAMPLE_PCAP_DIR`
2. **Domain Constants:** Industrial physical limits (safe pH: `6.5 - 8.5`, pressure threshold: `5.0 bar`, overflow level: `90.0%`) are declared in dedicated configuration files with industrial engineering citations.
3. **No Magic Numbers:** All status codes, function codes (e.g., `FC05`, `FC06`, `FC03`), and port designations are defined as named constants.

---

## 3. Strict Schema Validation

Both backend and frontend layers validate data structures before execution:
- **Backend Validation:** 100% of request bodies and response payloads pass through Pydantic v2 schemas (`schemas.py`), verifying IP formatting, numerical bounds, and string sanitization.
- **Database ORM:** SQLAlchemy declarative models enforce column nullability, unique foreign key constraints, and cascade policies.
- **Frontend Hygiene:** Network payloads from `api.js` validate HTTP response codes (`res.ok`) and throw typed descriptive error instances.

---

## 4. Linting, Formatting, & Build Gates

- **JavaScript / React:** Validated via `oxlint` with zero warnings permitted.
- **Python:** Formatted with `black` and linted with `ruff`.
- **Git Commit Hygiene:** All commits follow Conventional Commits format (`feat:`, `fix:`, `docs:`, `refactor:`, `chore:`). Zero automated AI co-author stamps.
