from sqlalchemy.orm import Session
from app.models.db_models import BaselineRuleModel, AlertModel, AssetModel
from datetime import datetime
import uuid

# Preset default baseline rules for our simulated OT environment
DEFAULT_LAB_BASELINES = [
    # HMI-001 -> PLC-001 (Read Holding Regs)
    {"src_ip": "192.168.10.20", "dst_ip": "192.168.10.10", "allowed_function_codes": ["FC01", "FC02", "FC03", "FC04"], "max_freq": 2.0},
    # SCADA-001 -> PLC-001 (Read Holding Regs)
    {"src_ip": "192.168.10.5", "dst_ip": "192.168.10.10", "allowed_function_codes": ["FC01", "FC03", "FC04"], "max_freq": 1.0},
    # SCADA-001 -> PLC-002 (Read Input Regs)
    {"src_ip": "192.168.10.5", "dst_ip": "192.168.10.12", "allowed_function_codes": ["FC03", "FC04"], "max_freq": 1.0},
    # HMI-002 -> PLC-002 (Read/Write)
    {"src_ip": "192.168.10.21", "dst_ip": "192.168.10.12", "allowed_function_codes": ["FC03", "FC05", "FC06"], "max_freq": 2.0},
    # EWS-001 -> PLC-001 (Maintenance Write)
    {"src_ip": "192.168.10.50", "dst_ip": "192.168.10.10", "allowed_function_codes": ["FC03", "FC05", "FC06", "FC15", "FC16"], "max_freq": 5.0}
]

def seed_baseline_rules(db: Session):
    """
    Seeds baseline whitelist rules if table is empty.
    """
    if db.query(BaselineRuleModel).count() == 0:
        for b in DEFAULT_LAB_BASELINES:
            rule = BaselineRuleModel(
                src_ip=b["src_ip"],
                dst_ip=b["dst_ip"],
                protocol="Modbus/TCP",
                allowed_function_codes=b["allowed_function_codes"],
                max_frequency_hz=b["max_freq"],
                is_active=True
            )
            db.add(rule)
        db.commit()

def inspect_telemetry_against_baseline(db: Session, src_ip: str, dst_ip: str, function_code: str = None, register_address: int = None, register_value: int = None) -> bool:
    """
    Checks frame against baseline rules.
    Returns True if frame is ANOMALOUS, False if NORMAL.
    Generates AlertModel entry when anomalous.
    """
    is_anomalous = False

    # Rule 1: Check baseline whitelist rule for this IP pair
    rule = db.query(BaselineRuleModel).filter(
        BaselineRuleModel.src_ip == src_ip,
        BaselineRuleModel.dst_ip == dst_ip
    ).first()

    target_asset = db.query(AssetModel).filter(AssetModel.ip == dst_ip).first()
    asset_id = target_asset.id if target_asset else dst_ip

    # Scenario A: Unknown / New Source IP pair
    if not rule:
        is_anomalous = True
        # Check if write function code
        if function_code in ["FC05", "FC06", "FC15", "FC16"]:
            alert_id = f"ALT-{uuid.uuid4().hex[:8].upper()}"
            alert = AlertModel(
                id=alert_id,
                title="🚨 Critical: Unauthorized Modbus Write Operation",
                description=f"Source {src_ip} issued unauthorized write command {function_code} to {dst_ip} ({asset_id}). Address: {register_address}, Value: {register_value}. Source is not in behavioral whitelist.",
                severity="CRITICAL",
                category="Unauthorized Write",
                src_ip=src_ip,
                dst_ip=dst_ip,
                asset_id=asset_id,
                raw_payload={"function_code": function_code, "register_address": register_address, "register_value": register_value},
                status="NEW",
                timestamp=datetime.utcnow()
            )
            db.add(alert)
        else:
            alert_id = f"ALT-{uuid.uuid4().hex[:8].upper()}"
            alert = AlertModel(
                id=alert_id,
                title="⚠️ Warning: New OT Communication Pair Detected",
                description=f"First time Modbus communication observed from {src_ip} to {dst_ip} ({asset_id}) using {function_code or 'FC03'}.",
                severity="MEDIUM",
                category="New Communication",
                src_ip=src_ip,
                dst_ip=dst_ip,
                asset_id=asset_id,
                raw_payload={"function_code": function_code},
                status="NEW",
                timestamp=datetime.utcnow()
            )
            db.add(alert)

    # Scenario B: Known pair but disallowed Function Code (e.g. Write operation from Read-only HMI)
    elif function_code and function_code not in rule.allowed_function_codes:
        is_anomalous = True
        alert_id = f"ALT-{uuid.uuid4().hex[:8].upper()}"
        alert = AlertModel(
            id=alert_id,
            title="🚨 High: Modbus Function Code Policy Violation",
            description=f"Host {src_ip} attempted disallowed Modbus function {function_code} on {dst_ip} ({asset_id}). Allowed function codes for this pair: {', '.join(rule.allowed_function_codes)}.",
            severity="HIGH",
            category="Unauthorized Write" if function_code in ["FC05", "FC06", "FC15", "FC16"] else "Policy Violation",
            src_ip=src_ip,
            dst_ip=dst_ip,
            asset_id=asset_id,
            raw_payload={"function_code": function_code, "register_address": register_address, "register_value": register_value},
            status="NEW",
            timestamp=datetime.utcnow()
        )
        db.add(alert)

    if is_anomalous and target_asset:
        target_asset.status = "ANOMALOUS"

    db.commit()
    return is_anomalous
