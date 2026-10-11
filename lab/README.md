# 🏭 OTSecTwin Industrial Cyber Range (LabShock-Style)

This environment emulates a real-world containerized Operational Technology (OT) and Industrial Control Systems (ICS) testbed based on the **Purdue Model**, running live industrial protocols (Modbus/TCP), software PLCs, a physics engine, an HMI, and a pentest attacker container.

---

## 🏗 Network Architecture & Assets

| Asset Name | Role / Function | Purdue Level | Container IP | Exposed Host Port |
| :--- | :--- | :--- | :--- | :--- |
| **`plc1-water-tank`** | Water storage tank & intake pump | Level 1 / 2 | `192.168.10.10` | `5020` (Modbus TCP) |
| **`plc2-chemical-feed`** | Chemical dosing & pH balance | Level 1 / 2 | `192.168.10.12` | `5021` (Modbus TCP) |
| **`conpot-decoy`** | Honey-PLC Decoy Tripwire (Conpot) | Level 1 / 2 | `192.168.10.90` | `5029` (Modbus TCP) |
| **`process-sim`** | Physics loop (tank levels, pH, overflow) | Level 1 / 2 | `192.168.10.30` | — |
| **`fuxa-hmi`** | Industrial SCADA / HMI interface | Level 3 | `192.168.20.10` | `1881` (Web UI) |
| **`ot-attacker`** | Red Team Kali/Pentest container | IT / External | `192.168.10.99` | — |
| **`backend`** | OTSecTwin Core Analysis Engine | Level 3 / IT | `192.168.30.10` | `8000` (API & Docs) |
| **`frontend`** | OTSecTwin UI & Digital Twin Dashboard | IT / Management | `192.168.30.50` | `5173` (Web UI) |

---

## 🚀 Running the Lab

Launch all containers together with one command:

```bash
docker-compose -f docker-compose.lab.yml up --build
```

### Accessing the Web Services:
- **OTSecTwin Security Dashboard**: [http://localhost:5173](http://localhost:5173)
- **FUXA Industrial Web HMI**: [http://localhost:1881](http://localhost:1881)
- **OTSecTwin Swagger API Docs**: [http://localhost:8000/docs](http://localhost:8000/docs)

---

## 🎯 Launching Simulated Cyber Attacks

You can execute real attacks directly from the dedicated attacker container:

### 1. Unauthorized Coil Trip & Register Tamper (FC05 / FC06)
Forces the water intake pump to shut down and corrupts holding register `40001` (demonstrating GRFICS-style overpressure detection):
```bash
docker exec -it ot-attacker python attack_toolkit.py write
```

### 2. OT Subnet Reconnaissance Scan
Discovers open Modbus devices and dumps holding registers across the Purdue L1 subnet:
```bash
docker exec -it ot-attacker python attack_toolkit.py scan
```

### 3. Honeypot Tripwire Probe (Conpot-Style Deception)
Probes the decoy PLC (`192.168.10.90`), immediately triggering a Critical Lateral Movement alert in OTSecTwin:
```bash
docker exec -it ot-attacker python attack_toolkit.py tripwire
```

---

## 🔌 Hardware-in-the-Loop (AutomationDirect CLICK PLCs)
If you connect physical hardware (e.g., an AutomationDirect CLICK Ethernet PLC `C0-10DD1E-D` on `192.168.10.18`), OTSecTwin is pre-configured to passively recognize its MAC vendor, Purdue Level 1 role, and monitor live I/O registers alongside the virtual containers.
