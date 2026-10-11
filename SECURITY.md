# Security Policy

## Supported Versions

The OTSecTwin project provides active security maintenance for the following releases:

| Version | Supported | Status |
|---|---|---|
| 1.2.x | Yes | Active Development / Supported |
| 1.1.x | Yes | Critical Patches Only |
| < 1.0.0 | No | End of Life |

---

## Reporting a Vulnerability

We prioritize the security of industrial control systems and cyber-physical infrastructure. If you discover a vulnerability in OTSecTwin, please report it responsibly before any public disclosure.

### Vulnerability Report Channels
- **Security Contact:** `security@otsectwin.internal`
- **PGP Fingerprint:** `8F3B 4A91 2E7C 55D0 19B8  64E2 3F10 A94D 7E21 C85B`
- **Preferred Languages:** English

### Expected Timeline
- **Initial Acknowledgement:** Within 48 hours of report submission.
- **Triage & Impact Assessment:** Within 5 business days.
- **Patch Target:** Within 14 calendar days for critical/high vulnerabilities.
- **Public Disclosure:** Coordinated after patch release and verification.

---

## What We Commit To
1. We will not pursue legal action against security researchers who follow responsible disclosure guidelines.
2. We provide regular status updates during vulnerability remediation.
3. We publicly credit reporters in release notes (unless anonymity is requested).
4. All critical patches include reproducible regression tests in our CI suite.

---

## Out of Scope
The following activities are explicitly out of scope for our security reporting program:
- Denial of Service (DoS/DDoS) attacks against live testing infrastructure.
- Social engineering, phishing, or physical attacks against contributors.
- Vulnerabilities in third-party services or hosting edge providers outside OTSecTwin repository code.
- Theoretical attacks without practical proof-of-concept demonstrating cyber-physical impact or data exposure.
