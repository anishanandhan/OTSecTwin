from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base

class AssetModel(Base):
    __tablename__ = "assets"

    id = Column(String, primary_key=True, index=True) # e.g. PLC-001 or 192.168.10.10
    ip = Column(String, unique=True, index=True, nullable=False)
    mac = Column(String, nullable=True)
    hostname = Column(String, nullable=True)
    asset_type = Column(String, nullable=False, default="Unknown") # PLC, HMI, SCADA, Historian, EWS, RTU, Attacker
    vendor = Column(String, default="Unknown")
    model = Column(String, default="Unknown")
    firmware = Column(String, default="Unknown")
    zone = Column(String, default="Control (Purdue L1/L2)") # Purdue L0, L1, L2, L3, External
    criticality = Column(String, default="MEDIUM") # LOW, MEDIUM, HIGH, CRITICAL
    status = Column(String, default="ONLINE") # ONLINE, OFFLINE, ANOMALOUS
    protocols = Column(JSON, default=list) # ["Modbus/TCP", "S7comm"]
    open_ports = Column(JSON, default=list) # [502, 102]
    risk_score = Column(Float, default=0.0) # 0.0 - 100.0
    risk_level = Column(String, default="LOW") # LOW, MEDIUM, HIGH, CRITICAL
    risk_breakdown = Column(JSON, default=dict) # Human-readable breakdown of factors
    first_seen = Column(DateTime, default=datetime.utcnow)
    last_seen = Column(DateTime, default=datetime.utcnow)

class NetworkConnectionModel(Base):
    __tablename__ = "network_connections"

    id = Column(Integer, primary_key=True, autoincrement=True)
    src_ip = Column(String, index=True, nullable=False)
    dst_ip = Column(String, index=True, nullable=False)
    src_asset_id = Column(String, nullable=True)
    dst_asset_id = Column(String, nullable=True)
    protocol = Column(String, nullable=False, default="Modbus/TCP")
    dst_port = Column(Integer, nullable=False, default=502)
    function_codes_used = Column(JSON, default=list) # ["FC03", "FC06"]
    packet_count = Column(Integer, default=1)
    byte_count = Column(Integer, default=0)
    avg_frequency_hz = Column(Float, default=1.0)
    is_authorized = Column(Boolean, default=True)
    first_seen = Column(DateTime, default=datetime.utcnow)
    last_seen = Column(DateTime, default=datetime.utcnow)

class VulnerabilityModel(Base):
    __tablename__ = "vulnerabilities"

    id = Column(String, primary_key=True) # CVE ID e.g. CVE-2021-34588
    title = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    cve_id = Column(String, index=True, nullable=False)
    cvss_score = Column(Float, nullable=False) # 0.0 - 10.0
    severity = Column(String, nullable=False) # LOW, MEDIUM, HIGH, CRITICAL
    affected_vendors = Column(JSON, default=list)
    affected_models = Column(JSON, default=list)
    cpe_match = Column(String, nullable=True)
    exploit_available = Column(Boolean, default=False)
    remediation = Column(Text, nullable=True)

class AssetVulnerabilityModel(Base):
    __tablename__ = "asset_vulnerabilities"

    id = Column(Integer, primary_key=True, autoincrement=True)
    asset_id = Column(String, ForeignKey("assets.id", ondelete="CASCADE"), index=True)
    cve_id = Column(String, ForeignKey("vulnerabilities.id", ondelete="CASCADE"), index=True)
    contextual_risk_score = Column(Float, default=0.0)
    matched_at = Column(DateTime, default=datetime.utcnow)

class AlertModel(Base):
    __tablename__ = "alerts"

    id = Column(String, primary_key=True) # e.g. ALT-2026-001
    title = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    severity = Column(String, nullable=False) # CRITICAL, HIGH, MEDIUM, LOW
    category = Column(String, nullable=False) # Unauthorized Write, New Communication, Modbus Scan, Anomalous Rate
    src_ip = Column(String, nullable=True)
    dst_ip = Column(String, nullable=True)
    asset_id = Column(String, nullable=True)
    raw_payload = Column(JSON, default=dict)
    status = Column(String, default="NEW") # NEW, ACKNOWLEDGED, RESOLVED
    timestamp = Column(DateTime, default=datetime.utcnow)

class BaselineRuleModel(Base):
    __tablename__ = "baseline_rules"

    id = Column(Integer, primary_key=True, autoincrement=True)
    src_ip = Column(String, nullable=False)
    dst_ip = Column(String, nullable=False)
    protocol = Column(String, default="Modbus/TCP")
    allowed_function_codes = Column(JSON, default=list) # ["FC03", "FC04"]
    max_frequency_hz = Column(Float, default=5.0)
    is_active = Column(Boolean, default=True)

class TelemetryLogModel(Base):
    __tablename__ = "telemetry_logs"

    id = Column(Integer, primary_key=True, autoincrement=True)
    timestamp = Column(DateTime, default=datetime.utcnow)
    src_ip = Column(String, index=True)
    dst_ip = Column(String, index=True)
    src_port = Column(Integer)
    dst_port = Column(Integer)
    protocol = Column(String, default="Modbus/TCP")
    function_code = Column(String, nullable=True) # e.g. FC03, FC06
    func_name = Column(String, nullable=True) # Read Holding Registers, Write Single Register
    unit_id = Column(Integer, default=1)
    register_address = Column(Integer, nullable=True)
    register_value = Column(Integer, nullable=True)
    payload_hex = Column(String, nullable=True)
    is_anomalous = Column(Boolean, default=False)
