from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime

class AssetBase(BaseModel):
    id: str
    ip: str
    mac: Optional[str] = None
    hostname: Optional[str] = None
    asset_type: str
    vendor: str
    model: str
    firmware: str
    zone: str
    criticality: str
    status: str
    protocols: List[str] = []
    open_ports: List[int] = []
    risk_score: float
    risk_level: str
    risk_breakdown: Dict[str, Any] = {}
    fingerprint_method: Optional[str] = "Passive Modbus Telemetry"
    confidence_score: Optional[float] = 95.0
    os_signature: Optional[str] = "Embedded Controller OS"
    hardware_modules: Optional[List[Dict[str, Any]]] = []
    config_hash: Optional[str] = None
    drift_detected: Optional[bool] = False
    last_drift_timestamp: Optional[datetime] = None
    first_seen: datetime
    last_seen: datetime

    class Config:
        from_attributes = True

class AssetUpdate(BaseModel):
    zone: Optional[str] = None
    criticality: Optional[str] = None
    hostname: Optional[str] = None
    vendor: Optional[str] = None
    model: Optional[str] = None
    firmware: Optional[str] = None

class ConnectionSchema(BaseModel):
    id: int
    src_ip: str
    dst_ip: str
    src_asset_id: Optional[str] = None
    dst_asset_id: Optional[str] = None
    protocol: str
    dst_port: int
    function_codes_used: List[str] = []
    packet_count: int
    byte_count: int
    avg_frequency_hz: float
    is_authorized: bool
    first_seen: datetime
    last_seen: datetime

    class Config:
        from_attributes = True

class VulnerabilitySchema(BaseModel):
    id: str
    title: str
    description: str
    cve_id: str
    cvss_score: float
    severity: str
    affected_vendors: List[str] = []
    affected_models: List[str] = []
    exploit_available: bool
    remediation: Optional[str] = None

    class Config:
        from_attributes = True

class AssetVulnerabilityMatch(BaseModel):
    cve_id: str
    title: str
    cvss_score: float
    contextual_risk_score: float
    severity: str
    exploit_available: bool

class AlertSchema(BaseModel):
    id: str
    title: str
    description: str
    severity: str
    category: str
    src_ip: Optional[str] = None
    dst_ip: Optional[str] = None
    asset_id: Optional[str] = None
    raw_payload: Dict[str, Any] = {}
    status: str
    timestamp: datetime

    class Config:
        from_attributes = True

class TelemetrySchema(BaseModel):
    id: int
    timestamp: datetime
    src_ip: str
    dst_ip: str
    src_port: int
    dst_port: int
    protocol: str
    function_code: Optional[str] = None
    func_name: Optional[str] = None
    unit_id: Optional[int] = None
    register_address: Optional[int] = None
    register_value: Optional[int] = None
    is_anomalous: bool

    class Config:
        from_attributes = True

class SimulationTriggerRequest(BaseModel):
    traffic_type: str # "NORMAL", "UNAUTHORIZED_WRITE", "PORT_SCAN", "TANK_OVERFILL", "CHEMICAL_DOSING", "SENSOR_SPOOFING"
    target_ip: Optional[str] = "192.168.10.10"
    count: Optional[int] = 10

class PlantControlRequest(BaseModel):
    inflow_valve: Optional[str] = None
    pump_status: Optional[str] = None
    target_level: Optional[float] = None
    relief_valve: Optional[str] = None

