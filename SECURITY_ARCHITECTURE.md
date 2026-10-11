# Security Architecture & Threat Model

**Project:** OTSecTwin  
**Domain:** Operational Technology (OT) / Industrial Control Systems (ICS)  
**Security Framework Alignment:** ISA/IEC 62443, NIST SP 800-82r3, and MITRE ATT&CK for ICS v14  

---

## 1. Zero-Disruption Architecture (Passive First)

### The Industrial Scanning Dilemma
Traditional IT vulnerability scanners (e.g., Nmap, Nessus, Qualys) generate high-volume active SYN packets, randomized port sweeps, and banner grabs. In operational technology environments, legacy programmable logic controllers (PLCs) often employ fragile 10Mbps/100Mbps embedded TCP/IP stacks. Active scanning frequently triggers PLC CPU fault exceptions, forcing immediate emergency plant shutdowns.

### OTSecTwin Passive Demarcation
OTSecTwin enforces **100% passive telemetry extraction**:
- Ingests network mirror/SPAN traffic from managed industrial switches at Purdue Levels 1, 2, and 3.
- Reads standard Modbus/TCP frames (`TCP port 502`) without emitting probe packets onto the wire.
- Reconstructs device identities (vendor, firmware, model, open service ports) entirely from observed Application Data Unit (ADU) headers, Unit IDs, and register query exchanges.

```
Industrial Network SPAN Architecture:
┌──────────────────────────────┐
│  Purdue Level 2 Supervisory  │
│  SCADA Server & Operator HMI │
└──────────────┬───────────────┘
               │  Modbus/TCP Network Cable
               ▼
┌──────────────────────────────┐       SPAN Port
│   Managed Industrial Switch  │ ──────────────────────┐
└──────────────┬───────────────┘ (Mirrored Telemetry)  │
               │                                       ▼
┌──────────────▼───────────────┐        ┌──────────────────────────────┐
│   Purdue Level 1 PLCs & I/O  │        │   OTSecTwin Passive Engine   │
│   (Zero injected packets)    │        │   (In-memory Physical Twin)  │
└──────────────────────────────┘        └──────────────────────────────┘
```

---

## 2. Threat Modeling & Attack Detection Surface

### 2.1 Threat Vectors Mapped to MITRE ATT&CK for ICS
| MITRE ICS ID | Technique Name | Exploited Channel | OTSecTwin Detection Mechanism |
|---|---|---|---|
| **T0855** | Unauthorized Command Message | Modbus FC05 (Write Single Coil) | Function code policy check flags write commands from unauthorized IP addresses. |
| **T0836** | Modify Parameter | Modbus FC06 (Write Holding Reg) | Anomaly engine alerts on out-of-boundary setpoint modifications to chemical valves. |
| **T0831** | Manipulation of Control | Rogue Master Injection | Differential equation physical model identifies divergence between sensor reading and physics. |
| **T0846** | Remote System Discovery | TCP/IP Scanning | Connection tracking flags unknown source IPs probing Modbus/DNP3 ports. |

### 2.2 Physics-Coupled Telemetry Validation
Attackers can forge Modbus packets to report normal levels while secretly running pumps at maximum velocity (the classic Stuxnet methodology). OTSecTwin detects this through mathematical state correlation:

$$\frac{dV}{dt} = Q_{\text{in}} - Q_{\text{out}}$$

If incoming Modbus telemetry reports tank level $L(t) = 20\%$ while the observed pump status is `RUNNING` at 1800 RPM and inlet valve is `OPEN`, the ODE physical model computes expected volume $L_{\text{expected}}(t) \ge 90\%$. The divergence exceeds error threshold $\epsilon$, triggering immediate **Critical Sensor Spoofing** alarms.

---

## 3. Defense-in-Depth Implementation

### 3.1 HTTP Security Headers
Every API response and static asset served includes comprehensive defense headers:
- `Content-Security-Policy`: Disallows unauthorized external script injection; permits local fonts and vetted Cloudflare origins.
- `Strict-Transport-Security`: Enforces 1-year HTTPS transport with preload directives.
- `X-Frame-Options: DENY`: Defends against UI redress and clickjacking.
- `X-Content-Type-Options: nosniff`: Prevents MIME-type confusion attacks.
- `Permissions-Policy`: Hard-disables access to microphone, camera, and geolocation sensors.

### 3.2 Input Sanitization & Secret Masking
- All text strings undergo Unicode NFC normalization, zero-width character stripping, and HTML entity escaping before storage.
- Diagnostic logs pass through automated credential redaction, masking API keys (`sk-...`), tokens, and credentials.
