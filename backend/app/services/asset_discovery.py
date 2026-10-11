from sqlalchemy.orm import Session
from app.models.db_models import AssetModel
from datetime import datetime
from app.services.asset_accuracy_engine import (
    calculate_asset_accuracy_fingerprint,
    compute_asset_configuration_hash,
    evaluate_configuration_drift
)

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
    "192.168.10.90": {
        "id": "DECOY-PLC-001",
        "hostname": "honey-siemens-s7-decoy",
        "asset_type": "Honeypot Decoy",
        "vendor": "Siemens (Conpot Emulated)",
        "model": "S7-300 / Conpot Tripwire",
        "firmware": "v3.3.12",
        "zone": "Deception (Purdue L1)",
        "criticality": "CRITICAL",
        "mac": "00:1E:68:DE:10:90"
    },
    "192.168.10.18": {
        "id": "PLC-CLICK-001",
        "hostname": "plc-automationdirect-click",
        "asset_type": "PLC",
        "vendor": "AutomationDirect",
        "model": "CLICK PLUS C0-10DD1E-D",
        "firmware": "v3.31",
        "zone": "Control (Purdue L1)",
        "criticality": "MEDIUM",
        "mac": "00:08:4F:A1:10:18"
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
        # Deep Fingerprint Accuracy Assessment
        accuracy = calculate_asset_accuracy_fingerprint(
            ip=ip,
            mac=mac,
            open_ports=[port] if port else [],
            protocols=[protocol] if protocol else [],
            fc_list=[function_code] if function_code else None
        )

        final_vendor = vendor if vendor != "Unknown OT Vendor" else accuracy["vendor"]
        final_model = model if model != "Unknown Model" else accuracy["model"]
        final_type = asset_type if asset_type != "Unknown" else accuracy["asset_type"]

        initial_hash = compute_asset_configuration_hash(
            ip=ip,
            mac=mac,
            vendor=final_vendor,
            model=final_model,
            firmware=firmware,
            open_ports=[port] if port else [],
            protocols=[protocol] if protocol else []
        )

        asset = AssetModel(
            id=asset_id,
            ip=ip,
            mac=mac,
            hostname=hostname,
            asset_type=final_type,
            vendor=final_vendor,
            model=final_model,
            firmware=firmware,
            zone=zone,
            criticality=criticality,
            status="ONLINE",
            protocols=[protocol],
            open_ports=[port] if port else [],
            risk_score=15.0 if final_type == "PLC" else 5.0,
            risk_level="LOW",
            fingerprint_method=accuracy["fingerprint_method"],
            confidence_score=accuracy["confidence_score"],
            os_signature=accuracy["os_signature"],
            hardware_modules=accuracy["hardware_modules"],
            config_hash=initial_hash,
            drift_detected=False,
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

        # Ensure existing assets have full accuracy fingerprints and baseline hashes populated
        if not asset.hardware_modules or not asset.config_hash:
            accuracy = calculate_asset_accuracy_fingerprint(
                ip=asset.ip,
                mac=asset.mac,
                open_ports=asset.open_ports or [],
                protocols=asset.protocols or []
            )
            if not asset.hardware_modules:
                asset.hardware_modules = accuracy.get("hardware_modules", [])
            if not asset.confidence_score:
                asset.confidence_score = accuracy.get("confidence_score", 95.0)
            if not asset.fingerprint_method or asset.fingerprint_method == "Passive Modbus Telemetry":
                asset.fingerprint_method = accuracy.get("fingerprint_method", "Passive Protocol Telemetry")
            if not asset.os_signature:
                asset.os_signature = accuracy.get("os_signature", "Embedded Controller OS")
            if not asset.config_hash:
                asset.config_hash = compute_asset_configuration_hash(
                    ip=asset.ip,
                    mac=asset.mac,
                    vendor=asset.vendor,
                    model=asset.model,
                    firmware=asset.firmware,
                    open_ports=asset.open_ports or [],
                    protocols=asset.protocols or []
                )

        # Check for Configuration Drift
        if asset.config_hash:
            drifted, summary = evaluate_configuration_drift(asset, asset.config_hash)
            if drifted and not asset.drift_detected:
                asset.drift_detected = True
                asset.last_drift_timestamp = datetime.utcnow()

    db.commit()
    db.refresh(asset)
    return asset
