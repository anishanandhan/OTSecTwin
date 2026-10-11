import time
import random
import os
from sqlalchemy.orm import Session
from datetime import datetime
from scapy.all import IP, TCP, Raw, wrpcap
import struct

from app.services.asset_discovery import discover_or_update_asset
from app.services.topology_engine import record_connection
from app.services.baseline_engine import inspect_telemetry_against_baseline
from app.services.vulnerability_engine import correlate_asset_vulnerabilities
from app.services.risk_engine import recalculate_asset_risk
from app.models.db_models import TelemetryLogModel, AssetModel
from app.config import SAMPLE_PCAP_DIR

MODBUS_FUNCTIONS = {
    "FC01": (1, "Read Coils"),
    "FC02": (2, "Read Discrete Inputs"),
    "FC03": (3, "Read Holding Registers"),
    "FC04": (4, "Read Input Registers"),
    "FC05": (5, "Write Single Coil"),
    "FC06": (6, "Write Single Register"),
    "FC15": (15, "Write Multiple Coils"),
    "FC16": (16, "Write Multiple Registers")
}

def create_modbus_tcp_frame(unit_id: int, fc_num: int, reg_addr: int, reg_val: int) -> bytes:
    """
    Constructs a raw Modbus/TCP MBAP + PDU packet payload.
    """
    trans_id = random.randint(1, 65535)
    proto_id = 0
    pdu = struct.pack(">BBHH", unit_id, fc_num, reg_addr, reg_val)
    length = len(pdu)
    mbap = struct.pack(">HHH", trans_id, proto_id, length)
    return mbap + pdu

def seed_simulated_ot_lab(db: Session):
    """
    Initializes standard OT assets, baseline connections, CVE correlations, and risk scores.
    """
    lab_ips = [
        ("192.168.10.10", 502, "Modbus/TCP", "FC03"),
        ("192.168.10.12", 502, "Modbus/TCP", "FC03"),
        ("192.168.10.15", 502, "Modbus/TCP", "FC04"),
        ("192.168.10.20", 502, "Modbus/TCP", "FC03"),
        ("192.168.10.21", 502, "Modbus/TCP", "FC03"),
        ("192.168.10.5", 502, "Modbus/TCP", "FC03"),
        ("192.168.10.8", 502, "Modbus/TCP", "FC03"),
        ("192.168.10.50", 502, "Modbus/TCP", "FC03"),
        ("192.168.10.90", 502, "Modbus/TCP", "FC03"),
        ("192.168.10.18", 502, "Modbus/TCP", "FC03")
    ]

    assets = []
    for ip, port, proto, fc in lab_ips:
        a = discover_or_update_asset(db, ip, port, proto, fc)
        correlate_asset_vulnerabilities(db, a)
        recalculate_asset_risk(db, a)
        assets.append(a)

    # Establish baseline connections
    connections = [
        ("192.168.10.20", "192.168.10.10", "FC03"), # HMI-001 -> PLC-001
        ("192.168.10.21", "192.168.10.12", "FC03"), # HMI-002 -> PLC-002
        ("192.168.10.5", "192.168.10.10", "FC03"),  # SCADA -> PLC-001
        ("192.168.10.5", "192.168.10.12", "FC03"),  # SCADA -> PLC-002
        ("192.168.10.5", "192.168.10.15", "FC04"),  # SCADA -> RTU-001
        ("192.168.10.8", "192.168.10.5", "FC03")   # Historian <- SCADA
    ]

    for src, dst, fc in connections:
        record_connection(db, src, dst, "Modbus/TCP", 502, fc, is_authorized=True)

    db.commit()

def generate_telemetry_batch(db: Session, traffic_type: str = "NORMAL", target_ip: str = "192.168.10.10", count: int = 10):
    """
    Generates telemetry records and updates baseline anomaly checks, topology graph, and risk engine.
    Also builds Scapy packets for export to PCAP file!
    """
    scapy_packets = []
    generated_logs = []

    if traffic_type == "NORMAL":
        pairs = [
            ("192.168.10.20", "192.168.10.10", "FC03", "Read Holding Registers", 1, 40001, 120),
            ("192.168.10.5", "192.168.10.10", "FC03", "Read Holding Registers", 1, 40002, 345),
            ("192.168.10.5", "192.168.10.12", "FC04", "Read Input Registers", 1, 30005, 12),
            ("192.168.10.21", "192.168.10.12", "FC03", "Read Holding Registers", 1, 40010, 50)
        ]
        for i in range(count):
            src, dst, fc, name, unit, addr, val = random.choice(pairs)
            is_anom = inspect_telemetry_against_baseline(db, src, dst, fc, addr, val)
            record_connection(db, src, dst, "Modbus/TCP", 502, fc, not is_anom)

            log = TelemetryLogModel(
                timestamp=datetime.utcnow(),
                src_ip=src,
                dst_ip=dst,
                src_port=random.randint(49152, 65535),
                dst_port=502,
                protocol="Modbus/TCP",
                function_code=fc,
                func_name=name,
                unit_id=unit,
                register_address=addr,
                register_value=val,
                is_anomalous=is_anom
            )
            db.add(log)
            generated_logs.append(log)

            # Build Scapy packet
            payload = create_modbus_tcp_frame(unit, 3, addr, val)
            pkt = IP(src=src, dst=dst)/TCP(sport=log.src_port, dport=502)/Raw(load=payload)
            scapy_packets.append(pkt)

        # Sync plant state to nominal
        PLANT_STATE["active_scenario"] = "NORMAL"
        PLANT_STATE["alarm_state"] = "NOMINAL"
        PLANT_STATE["tank_level"] = 68.5
        PLANT_STATE["pressure_bar"] = 2.8
        PLANT_STATE["chemical_ph"] = 7.2
        PLANT_STATE["pump_status"] = "RUNNING"
        PLANT_STATE["pump_rpm"] = 1450
        PLANT_STATE["relief_valve"] = "CLOSED"

    elif traffic_type in ["TANK_OVERFILL", "UNAUTHORIZED_WRITE"]:
        # Attacker host forcing PLC-001 (192.168.10.10) pump to 100% and relief valve closed
        attacker_ip = "10.10.10.55"
        discover_or_update_asset(db, attacker_ip, 502, "Modbus/TCP", "FC06")

        PLANT_STATE["active_scenario"] = "TANK_OVERFILL"
        PLANT_STATE["tank_level"] = 98.4
        PLANT_STATE["inlet_flow"] = 82.0
        PLANT_STATE["pump_rpm"] = 1800
        PLANT_STATE["pump_status"] = "RUNNING"
        PLANT_STATE["relief_valve"] = "CLOSED"
        PLANT_STATE["pressure_bar"] = 6.2
        PLANT_STATE["alarm_state"] = "CRITICAL_OVERFLOW"

        for i in range(count):
            addr = 40001 + i
            val = 9999 if traffic_type == "UNAUTHORIZED_WRITE" else (98 if addr == 40001 else 1)
            is_anom = inspect_telemetry_against_baseline(db, attacker_ip, target_ip, "FC06", addr, val)
            record_connection(db, attacker_ip, target_ip, "Modbus/TCP", 502, "FC06", is_authorized=False)

            log = TelemetryLogModel(
                timestamp=datetime.utcnow(),
                src_ip=attacker_ip,
                dst_ip=target_ip,
                src_port=random.randint(49152, 65535),
                dst_port=502,
                protocol="Modbus/TCP",
                function_code="FC06",
                func_name="Write Single Register (Attack Override)",
                unit_id=1,
                register_address=addr,
                register_value=val,
                is_anomalous=True
            )
            db.add(log)
            generated_logs.append(log)

            payload = create_modbus_tcp_frame(1, 6, addr, val)
            pkt = IP(src=attacker_ip, dst=target_ip)/TCP(sport=log.src_port, dport=502)/Raw(load=payload)
            scapy_packets.append(pkt)

    elif traffic_type == "CHEMICAL_DOSING":
        # Attacker targeting PLC-002 (192.168.10.12) to sabotage chemical treatment / pH
        attacker_ip = "10.10.10.55"
        chem_target = "192.168.10.12"
        discover_or_update_asset(db, attacker_ip, 502, "Modbus/TCP", "FC06")

        PLANT_STATE["active_scenario"] = "CHEMICAL_DOSING"
        PLANT_STATE["chemical_ph"] = 3.2
        PLANT_STATE["alarm_state"] = "CRITICAL_pH_ACID"

        for i in range(count):
            addr = 40005
            val = 32  # pH 3.2 (toxic acid overdose)
            is_anom = inspect_telemetry_against_baseline(db, attacker_ip, chem_target, "FC06", addr, val)
            record_connection(db, attacker_ip, chem_target, "Modbus/TCP", 502, "FC06", is_authorized=False)

            log = TelemetryLogModel(
                timestamp=datetime.utcnow(),
                src_ip=attacker_ip,
                dst_ip=chem_target,
                src_port=random.randint(49152, 65535),
                dst_port=502,
                protocol="Modbus/TCP",
                function_code="FC06",
                func_name="Write Single Register (pH Sabotage)",
                unit_id=1,
                register_address=addr,
                register_value=val,
                is_anomalous=True
            )
            db.add(log)
            generated_logs.append(log)

            payload = create_modbus_tcp_frame(1, 6, addr, val)
            pkt = IP(src=attacker_ip, dst=chem_target)/TCP(sport=log.src_port, dport=502)/Raw(load=payload)
            scapy_packets.append(pkt)

    elif traffic_type == "SENSOR_SPOOFING":
        # Attacker spoofing LIT-101 level sensor to read 20% while physical tank fills
        attacker_ip = "10.10.10.55"
        discover_or_update_asset(db, attacker_ip, 502, "Modbus/TCP", "FC06")

        PLANT_STATE["active_scenario"] = "SENSOR_SPOOFING"
        PLANT_STATE["tank_level"] = 92.0
        PLANT_STATE["alarm_state"] = "WARNING_SPOOFED_SENSOR"

        for i in range(count):
            addr = 40001
            val = 20  # Spoofed low level to force continuous pumping
            is_anom = inspect_telemetry_against_baseline(db, attacker_ip, target_ip, "FC06", addr, val)
            record_connection(db, attacker_ip, target_ip, "Modbus/TCP", 502, "FC06", is_authorized=False)

            log = TelemetryLogModel(
                timestamp=datetime.utcnow(),
                src_ip=attacker_ip,
                dst_ip=target_ip,
                src_port=random.randint(49152, 65535),
                dst_port=502,
                protocol="Modbus/TCP",
                function_code="FC06",
                func_name="Write Single Register (Sensor Spoof)",
                unit_id=1,
                register_address=addr,
                register_value=val,
                is_anomalous=True
            )
            db.add(log)
            generated_logs.append(log)

            payload = create_modbus_tcp_frame(1, 6, addr, val)
            pkt = IP(src=attacker_ip, dst=target_ip)/TCP(sport=log.src_port, dport=502)/Raw(load=payload)
            scapy_packets.append(pkt)

    elif traffic_type == "PORT_SCAN":
        attacker_ip = "10.10.10.55"
        discover_or_update_asset(db, attacker_ip, 502, "Modbus/TCP", "FC01")

        for port in [502, 102, 44818, 20000, 80, 443, 22, 23, 8080]:
            is_anom = inspect_telemetry_against_baseline(db, attacker_ip, target_ip, "FC01", 1, 0)
            record_connection(db, attacker_ip, target_ip, "TCP", port, "FC01", is_authorized=False)

            log = TelemetryLogModel(
                timestamp=datetime.utcnow(),
                src_ip=attacker_ip,
                dst_ip=target_ip,
                src_port=random.randint(49152, 65535),
                dst_port=port,
                protocol="TCP Scan",
                function_code="FC01",
                func_name="Read Coils / Port Probe",
                unit_id=1,
                register_address=0,
                register_value=0,
                is_anomalous=True
            )
            db.add(log)
            generated_logs.append(log)

            pkt = IP(src=attacker_ip, dst=target_ip)/TCP(sport=log.src_port, dport=port, flags="S")
            scapy_packets.append(pkt)

    db.commit()

    # Recalculate target asset risk
    target_asset = db.query(AssetModel).filter(AssetModel.ip == target_ip).first()
    if target_asset:
        recalculate_asset_risk(db, target_asset)

    # Save to PCAP file
    pcap_path = os.path.join(SAMPLE_PCAP_DIR, "ot_telemetry_capture.pcap")
    if scapy_packets:
        wrpcap(pcap_path, scapy_packets, append=os.path.exists(pcap_path))

    return {
        "status": "SUCCESS",
        "generated_count": len(generated_logs),
        "traffic_type": traffic_type,
        "pcap_saved": pcap_path,
        "plant_state": get_plant_state()
    }

# ==============================================================================
# Cyber-Physical Plant Process State (LabShock / GRFICS Digital Twin Model)
# ==============================================================================
PLANT_STATE = {
    "tank_level": 68.5,            # % (0 - 100)
    "target_level": 70.0,          # %
    "inlet_flow": 45.2,            # L/min
    "pump_rpm": 1450,              # RPM
    "pump_status": "RUNNING",      # RUNNING / STOPPED
    "inflow_valve": "OPEN",        # OPEN / CLOSED
    "relief_valve": "CLOSED",      # OPEN / CLOSED
    "chemical_ph": 7.2,            # pH (nominal 6.8 - 7.6)
    "pressure_bar": 2.8,           # bar (nominal 2.0 - 3.5)
    "alarm_state": "NOMINAL",      # NOMINAL / WARNING / CRITICAL_OVERFLOW / CRITICAL_pH_ACID
    "active_scenario": "NORMAL",
    "modbus_registers": {
        40001: 69,
        40002: 452,
        40003: 28,
        40004: 1,
        40005: 72,
        40006: 0
    },
    "last_updated": datetime.utcnow().isoformat()
}

def get_plant_state():
    """
    Returns live cyber-physical simulation state with real-time Modbus register map.
    """
    if PLANT_STATE["active_scenario"] == "NORMAL":
        PLANT_STATE["tank_level"] = round(max(10.0, min(95.0, PLANT_STATE["tank_level"] + random.uniform(-0.4, 0.4))), 1)
        PLANT_STATE["inlet_flow"] = round(max(0.0, min(80.0, PLANT_STATE["inlet_flow"] + random.uniform(-0.8, 0.8))), 1)
        PLANT_STATE["pressure_bar"] = round(max(1.5, min(4.0, 2.8 + (PLANT_STATE["tank_level"] - 50.0) * 0.02)), 2)
        PLANT_STATE["chemical_ph"] = round(max(6.8, min(7.6, 7.2 + random.uniform(-0.05, 0.05))), 2)

    PLANT_STATE["modbus_registers"] = {
        40001: int(PLANT_STATE["tank_level"]),
        40002: int(PLANT_STATE["inlet_flow"] * 10),
        40003: int(PLANT_STATE["pressure_bar"] * 10),
        40004: 1 if PLANT_STATE["pump_status"] == "RUNNING" else 0,
        40005: int(PLANT_STATE["chemical_ph"] * 10),
        40006: 1 if PLANT_STATE["relief_valve"] == "OPEN" else 0
    }
    PLANT_STATE["last_updated"] = datetime.utcnow().isoformat()
    return dict(PLANT_STATE)

def update_plant_control(controls: dict, db: Session = None):
    """
    Updates operator control setpoints on the physical plant.
    """
    if "inflow_valve" in controls and controls["inflow_valve"] is not None:
        PLANT_STATE["inflow_valve"] = controls["inflow_valve"]
        PLANT_STATE["inlet_flow"] = 48.0 if controls["inflow_valve"] == "OPEN" else 0.0
    if "pump_status" in controls and controls["pump_status"] is not None:
        PLANT_STATE["pump_status"] = controls["pump_status"]
        PLANT_STATE["pump_rpm"] = 1450 if controls["pump_status"] == "RUNNING" else 0
    if "target_level" in controls and controls["target_level"] is not None:
        PLANT_STATE["target_level"] = float(controls["target_level"])
    if "relief_valve" in controls and controls["relief_valve"] is not None:
        PLANT_STATE["relief_valve"] = controls["relief_valve"]

    if db:
        log = TelemetryLogModel(
            timestamp=datetime.utcnow(),
            src_ip="192.168.10.20",
            dst_ip="192.168.10.10",
            src_port=50200,
            dst_port=502,
            protocol="Modbus/TCP",
            function_code="FC06",
            func_name="Write Single Register (Operator HMI Command)",
            unit_id=1,
            register_address=40004,
            register_value=1 if PLANT_STATE["pump_status"] == "RUNNING" else 0,
            is_anomalous=False
        )
        db.add(log)
        db.commit()
    return get_plant_state()

