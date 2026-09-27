from sqlalchemy.orm import Session
from app.models.db_models import AssetModel
from datetime import datetime

# Fingerprinting dictionaries
KNOWN_LAB_PROFILES = {
    "192.168.10.10": {
        "id": "PLC-001",
        "hostname": "plc-water-main",
        "asset_type": "PLC",
        "vendor": "Siemens / OpenPLC",
        "model": "S7-1200 / OpenPLC SoftPLC",
        "firmware": "v4.2.1",
        "zone": "Control (Purdue L1)",
        "criticality": "HIGH",
        "mac": "00:1D:9C:C4:10:10"
    },
    "192.168.10.12": {
        "id": "PLC-002",
        "hostname": "plc-chem-dosage",
        "asset_type": "PLC",
        "vendor": "Schneider Electric",
        "model": "Modicon M221",
        "firmware": "v1.8.0",
        "zone": "Control (Purdue L1)",
        "criticality": "HIGH",
        "mac": "00:80:F4:A2:10:12"
    },
    "192.168.10.15": {
        "id": "RTU-001",
        "hostname": "rtu-substation-flow",
        "asset_type": "RTU",
        "vendor": "Emerson / MicroLogix",
        "model": "ControlWave RTU",
        "firmware": "v2.1",
        "zone": "Field (Purdue L0)",
        "criticality": "MEDIUM",
        "mac": "00:0E:8C:3B:10:15"
    },
    "192.168.10.20": {
        "id": "HMI-001",
        "hostname": "hmi-operator-main",
        "asset_type": "HMI",
        "vendor": "Schneider Electric",
        "model": "EcoStruxure Operator Terminal",
        "firmware": "v3.1",
        "zone": "Supervisory (Purdue L2)",
        "criticality": "HIGH",
        "mac": "00:15:5D:01:10:20"
    },
    "192.168.10.21": {
        "id": "HMI-002",
        "hostname": "hmi-operator-backup",
        "asset_type": "HMI",
        "vendor": "Advantech",
        "model": "WebAccess HMI",
        "firmware": "v8.4",
        "zone": "Supervisory (Purdue L2)",
        "criticality": "MEDIUM",
        "mac": "00:15:5D:01:10:21"
    },
    "192.168.10.5": {
        "id": "SCADA-001",
        "hostname": "scada-ignition-server",
        "asset_type": "SCADA",
        "vendor": "Inductive Automation",
        "model": "Ignition Gateway v8.1",
        "firmware": "v8.1.0",
        "zone": "Control Center (Purdue L3)",
        "criticality": "CRITICAL",
        "mac": "00:50:56:AB:10:05"
    },
    "192.168.10.8": {
        "id": "HISTORIAN-001",
        "hostname": "historian-osisoft-pi",
        "asset_type": "Historian",
        "vendor": "AVEVA / OSIsoft",
        "model": "PI Server 2023",
        "firmware": "v2023.1",
        "zone": "Operations (Purdue L3)",
        "criticality": "MEDIUM",
        "mac": "00:50:56:AB:10:08"
    },
    "192.168.10.50": {
        "id": "EWS-001",
        "hostname": "ews-admin-laptop",
        "asset_type": "EWS",
        "vendor": "Dell / Siemens TIA Portal",
        "model": "Engineering Workstation",
        "firmware": "Windows 11 LTSC",
        "zone": "Maintenance (Purdue L2)",
        "criticality": "HIGH",
        "mac": "00:28:F8:77:10:50"
    },
    "10.10.10.55": {
        "id": "ATTACKER-001",
        "hostname": "unauthorized-rogue-host",
        "asset_type": "Attacker Host",
        "vendor": "Unknown Rogue Device",
        "model": "Kali Linux / Metasploit",
        "firmware": "Unknown",
        "zone": "External / DMZ",
        "criticality": "CRITICAL",
        "mac": "DE:AD:BE:EF:10:55"
    }
}

def discover_or_update_asset(db: Session, ip: str, port: int = 502, protocol: str = "Modbus/TCP", function_code: str = None) -> AssetModel:
    """
    Passively discovers asset from telemetry observation and updates its properties, open ports, and protocols.
    """
    asset = db.query(AssetModel).filter(AssetModel.ip == ip).first()

    if not asset:
        profile = KNOWN_LAB_PROFILES.get(ip, {})
        asset_id = profile.get("id", f"ASSET-{ip.replace('.', '')}")
        asset_type = profile.get("asset_type")

        # Heuristic inference if not in preset profiles
        if not asset_type:
            if port == 502 or protocol == "Modbus/TCP":
                if function_code in ["FC05", "FC06", "FC15", "FC16"]:
                    asset_type = "HMI" # Initiated write
                else:
                    asset_type = "PLC" # Target listener
            else:
                asset_type = "Unknown"

        zone = profile.get("zone", "Control (Purdue L1)")
        criticality = profile.get("criticality", "MEDIUM")
        vendor = profile.get("vendor", "Unknown OT Vendor")
        model = profile.get("model", "Unknown Model")
        firmware = profile.get("firmware", "v1.0")
        hostname = profile.get("hostname", f"host-{ip}")
        mac = profile.get("mac", f"02:00:00:{ip.replace('.', ':')[-8:]}")

        asset = AssetModel(
            id=asset_id,
            ip=ip,
            mac=mac,
            hostname=hostname,
            asset_type=asset_type,
            vendor=vendor,
            model=model,
            firmware=firmware,
            zone=zone,
            criticality=criticality,
            status="ONLINE",
            protocols=[protocol],
            open_ports=[port] if port else [],
            risk_score=15.0 if asset_type == "PLC" else 5.0,
            risk_level="LOW",
            first_seen=datetime.utcnow(),
            last_seen=datetime.utcnow()
        )
        db.add(asset)
    else:
        # Update existing asset telemetry observations
        asset.last_seen = datetime.utcnow()
        asset.status = "ONLINE"
        
        protocols = list(asset.protocols or [])
        if protocol and protocol not in protocols:
            protocols.append(protocol)
            asset.protocols = protocols

        ports = list(asset.open_ports or [])
        if port and port not in ports:
            ports.append(port)
            asset.open_ports = ports

    db.commit()
    db.refresh(asset)
    return asset
