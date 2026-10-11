# Contributing to OTSecTwin

Thank you for contributing to OTSecTwin! We welcome contributions to enhance passive OT/ICS protocol dissectors, digital twin physics simulations, and threat correlation rules.

---

## Development Setup

1. **Fork and clone the repository:**
   ```bash
   git clone https://github.com/<your-username>/OTSecTwin.git
   cd OTSecTwin
   ```

2. **Backend Setup:**
   ```bash
   cd backend
   python3 -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   uvicorn app.main:app --reload
   ```

3. **Frontend Setup:**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

---

## Branching & Commit Guidelines

- **Branch Naming:**
  - `feat/protocol-dnp3-dissector`
  - `fix/modbus-register-overflow`
  - `docs/mitre-ics-mapping-update`
  - `test/physics-ode-coverage`

- **Commit Messages:** Follow Conventional Commits:
  - `feat: add passive S7comm protocol identification`
  - `fix: correct pressure relief valve differential equation decay`
  - `test: add unit coverage for holding register boundary conditions`
  - `docs: update architecture diagram with SPAN port demarcation`

---

## Pre-Pull Request Checklist

Before submitting a pull request, ensure:
- [ ] No file exceeds 300 lines of functional code.
- [ ] Backend tests pass (`pytest`).
- [ ] Frontend linter reports 0 errors (`npm run lint`).
- [ ] New endpoints or utilities have accompanying unit test coverage.
- [ ] No secrets or internal IP addresses are committed.
