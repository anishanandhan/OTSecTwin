# OTSecTwin — OT Asset Intelligence & Threat Detection Platform

**OTSecTwin** is a passive Operational Technology (OT) and Industrial Control Systems (ICS) security platform that continuously discovers, identifies, monitors, assesses, and visualizes OT/ICS assets and their security posture using passive network telemetry (Modbus/TCP).

---

## 🚀 Quick Start (Local Setup)

> **Note on folder paths**: If your directory path contains a colon (`:`), create the Python virtual environment in your home folder (e.g., `~/.otsectwin_venv`).

### 1. Backend Setup (FastAPI & Python Engine)

```bash
# Create & activate Python virtual environment in home directory
python3 -m venv ~/.otsectwin_venv
source ~/.otsectwin_venv/bin/activate

# Navigate to backend directory and install dependencies
cd backend
pip install -r requirements.txt

# Launch FastAPI server (Port 8000)
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

- **API Documentation (Swagger UI)**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **Health Check**: [http://localhost:8000/health](http://localhost:8000/health)

---

### 2. Frontend Setup (React + Vite + TailwindCSS)

```bash
# In a new terminal, navigate to frontend directory
cd frontend

# Install Node dependencies
npm install

# Start Vite Development Server (Port 5173)
npm run dev
```

- **OTSecTwin Web Dashboard**: [http://localhost:5173](http://localhost:5173)

---

## 🐳 Docker Compose Deployment (One Command)

To build and run both the Backend & Frontend containers together:

```bash
docker-compose up --build
```

Access the platform at `http://localhost:5173`.

---

## 🛠 Features & Capabilities

- **Passive Asset Discovery**: Automatically derives asset type (PLC, HMI, SCADA, RTU, EWS), vendor, model, firmware, open ports, and Purdue Level zone from Modbus telemetry.
- **Interactive Topology Map**: Visual 2D network graph showing directional communications and protocol edges (`vis-network`).
- **Living Digital Twin Inspector**: Complete state object per asset tracking parameters, zone overrides, CVE matches, and real-time logs.
- **Contextual Vulnerability Scoring**: Correlates standard NVD CVSS scores with operational criticality, Purdue zone exposure, and exploitability.
- **Behavioral Anomaly Engine**: Learns baseline function code policies and alerts on unauthorized PLC writes (FC05/FC06), reconnaissance scans, and rogue hosts.
- **OT Lab Simulator & PCAP Exporter**: Trigger normal traffic or simulated cyber attacks, upload external `.pcap` captures, or download live `.pcap` files for Wireshark inspection.
