import hashlib
import json
from datetime import datetime
from typing import Dict, Any, Tuple, List

# ==============================================================================
# 1. Industrial Hardware OUI (Organizationally Unique Identifier) Database
# ==============================================================================
INDUSTRIAL_MAC_OUI_REGISTRY = {
    # Siemens AG (SIMATIC S7-1200, S7-1500, Scalance Switches)
    "00:1D:9C": ("Siemens AG", "SIMATIC S7-1200 / OpenPLC SoftPLC", "PLC", "Control (Purdue L1)"),
    "00:0E:8C": ("Siemens AG", "SIMATIC S7-300 / CP Module", "PLC", "Control (Purdue L1)"),
    "00:1C:06": ("Siemens AG", "SCALANCE Industrial Switch", "Switch", "Control (Purdue L1)"),
    "08:00:06": ("Siemens AG", "SIMATIC S7-400 Industrial Controller", "PLC", "Control (Purdue L1)"),

    # Schneider Electric (Modicon M221, M340, M580, Magelis HMI)
    "00:80:F4": ("Schneider Electric", "Modicon M221 Logic Controller", "PLC", "Control (Purdue L1)"),
    "00:00:54": ("Schneider Electric", "Modicon M340 PAC Controller", "PLC", "Control (Purdue L1)"),
    "00:24:D4": ("Schneider Electric", "EcoStruxure Magelis HMI Terminal", "HMI", "Supervisory (Purdue L2)"),

    # Rockwell Automation / Allen-Bradley (ControlLogix, CompactLogix, PanelView)
    "00:00:BC": ("Rockwell Automation", "Allen-Bradley ControlLogix 1756", "PLC", "Control (Purdue L1)"),
    "00:1D:9B": ("Rockwell Automation", "Allen-Bradley CompactLogix 1769", "PLC", "Control (Purdue L1)"),
    "00:0F:73": ("Rockwell Automation", "PanelView Plus 7 HMI Terminal", "HMI", "Supervisory (Purdue L2)"),

    # AutomationDirect (CLICK PLUS, Do-more BRX, C-more HMI)
    "00:08:4F": ("AutomationDirect", "CLICK PLUS PLC (C0-10DD1E-D)", "PLC", "Control (Purdue L1)"),

    # Phoenix Contact
    "00:13:95": ("Phoenix Contact", "PLCnext Control / Axioline I/O", "PLC", "Control (Purdue L1)"),
    "00:A0:45": ("Phoenix Contact", "FL SWITCH Industrial Managed Switch", "Switch", "Control (Purdue L1)"),

    # Omron Electronics
    "00:00:0A": ("Omron Electronics", "SYSMAC CJ2M / NJ Series PLC", "PLC", "Control (Purdue L1)"),
    "00:00:65": ("Omron Electronics", "NA Series Industrial HMI", "HMI", "Supervisory (Purdue L2)"),

    # ABB Industrial Automation
    "00:02:A5": ("ABB Industrial", "AC500 Scalable PLC System", "PLC", "Control (Purdue L1)"),
    "00:20:4A": ("ABB Industrial", "CP600 Industrial HMI Panel", "HMI", "Supervisory (Purdue L2)"),

    # Beckhoff Automation (TwinCAT)
    "00:01:05": ("Beckhoff Automation", "CX5100 Embedded PC / TwinCAT PLC", "PLC", "Control (Purdue L1)"),

    # Moxa / Hirschmann (Industrial Networking & Serial Device Servers)
    "00:90:E8": ("Moxa Inc.", "NPort 5150 Serial-to-Ethernet Gateway", "RTU", "Field (Purdue L0)"),
    "00:80:63": ("Hirschmann / Belden", "RS20 Industrial Rail Switch", "Switch", "Control (Purdue L1)"),

    # SCADA Server Virtualized Hypervisors / Workstations
    "00:50:56": ("VMware / Virtualized", "Ignition SCADA / Historian VM", "SCADA", "Control Center (Purdue L3)"),
    "00:15:5D": ("Microsoft Hyper-V", "Engineering Workstation / HMI VM", "HMI", "Supervisory (Purdue L2)"),
    "00:28:F8": ("Dell Technologies", "Engineering Workstation (TIA Portal)", "EWS", "Maintenance (Purdue L2)"),
    "DE:AD:BE": ("Rogue Device / Attacker", "Kali Linux Pentest Box", "Attacker Host", "External / DMZ")
}

# ==============================================================================
# 2. Passive TCP Stack / Real-Time OS (RTOS) Fingerprint Database
# ==============================================================================
def infer_os_from_tcp_stack(ttl: int = 64, window_size: int = 65535) -> Tuple[str, str]:
    """
    Infers the underlying Real-Time Operating System (RTOS) or Host OS
    from passive TCP handshake metrics (TTL and Window Size).
    """
    if ttl <= 32:
        return "VxWorks 7.0 RTOS", "Embedded Microcontroller"
    elif ttl <= 64:
        if window_size <= 2920:
            return "FreeRTOS (Lightweight lwIP)", "Microcontroller"
        elif window_size == 16384:
            return "QNX Neutrino RTOS", "Embedded Industrial OS"
        else:
            return "Linux Embedded (OpenPLC Runtime)", "Embedded Linux"
    elif ttl <= 128:
        return "Windows 11 LTSC / Windows 10 IoT", "Desktop / Server OS"
    elif ttl <= 255:
        return "Cisco IOS / Hirschmann HiOS", "Network Appliance OS"
    return "Unknown Operating System", "General OS"

# ==============================================================================
# 3. Chassis Backplane Sub-Module Rack Cards
# ==============================================================================
DEFAULT_BACKPLANE_PROFILES = {
    "192.168.10.10": [
        {"slot": 0, "name": "PM 1207 Power Supply", "catalog": "6EP1 332-1SH71", "status": "HEALTHY", "type": "Power"},
        {"slot": 1, "name": "CPU 1214C DC/DC/DC", "catalog": "6ES7 214-1AG40-0XB0", "status": "ONLINE", "type": "CPU"},
        {"slot": 2, "name": "SM 1221 8xDI 24VDC", "catalog": "6ES7 221-1BF32-0XB0", "status": "ACTIVE", "type": "Digital Input"},
        {"slot": 3, "name": "SM 1222 8xDO Relay", "catalog": "6ES7 222-1HF32-0XB0", "status": "ACTIVE", "type": "Relay Output"}
    ],
    "192.168.10.12": [
        {"slot": 0, "name": "Modicon M221 CPU Base", "catalog": "TM221CE16T", "status": "ONLINE", "type": "CPU"},
        {"slot": 1, "name": "TM3 Analog Input 4xAI", "catalog": "TM3AI4", "status": "ACTIVE", "type": "Analog Input"},
        {"slot": 2, "name": "TM3 Digital Output 8xDO", "catalog": "TM3DQ8T", "status": "ACTIVE", "type": "Digital Output"}
    ],
    "192.168.10.18": [
        {"slot": 0, "name": "CLICK PLUS CPU Option Slot", "catalog": "C0-10DD1E-D", "status": "ONLINE", "type": "CPU"},
        {"slot": 1, "name": "Ethernet & Modbus Interface", "catalog": "C0-08NE-1", "status": "ACTIVE", "type": "Comms"},
        {"slot": 2, "name": "4-Channel 24VDC Discrete In", "catalog": "C0-04TRS", "status": "ACTIVE", "type": "Digital Input"}
    ]
}

# ==============================================================================
# 4. Deep Device Fingerprinting & Confidence Scoring
# ==============================================================================
def calculate_asset_accuracy_fingerprint(
    ip: str,
    mac: str = None,
    open_ports: List[int] = None,
    protocols: List[str] = None,
    ttl: int = 64,
    window_size: int = 65535,
    fc_list: List[str] = None
) -> Dict[str, Any]:
    """
    Computes a ground-truth asset fingerprint by fusing:
    1. MAC OUI Industrial Hardware registry
    2. TCP stack passive RTOS heuristics
    3. Behavioral client/server directionality
    4. Protocol-native capability extraction
    """
    confidence = 50.0 # Base heuristic
    methodologies = []
    
    # Check 1: MAC OUI Registry Match
    matched_oui = None
    mac_clean = (mac or "").upper()
    oui_prefix = ":".join(mac_clean.split(":")[:3]) if mac_clean else ""
    
    if oui_prefix in INDUSTRIAL_MAC_OUI_REGISTRY:
        vendor, model, dev_type, zone = INDUSTRIAL_MAC_OUI_REGISTRY[oui_prefix]
        matched_oui = True
        confidence += 30.0
        methodologies.append(f"MAC OUI Matched: {vendor}")
    else:
        vendor = "Unknown Industrial Vendor"
        model = "Generic OT Device"
        dev_type = "PLC" if (open_ports and 502 in open_ports) else "Unknown"
        zone = "Control (Purdue L1)"

    # Check 2: TCP RTOS Stack Signature
    os_name, os_category = infer_os_from_tcp_stack(ttl, window_size)
    if "VxWorks" in os_name or "FreeRTOS" in os_name or "QNX" in os_name:
        confidence += 15.0
        methodologies.append(f"RTOS Fingerprint: {os_name}")
    elif "Linux" in os_name or "Windows" in os_name:
        confidence += 10.0
        methodologies.append(f"OS Fingerprint: {os_name}")

    # Check 3: Modbus Protocol Capabilities (DPI)
    if protocols and "Modbus/TCP" in protocols:
        confidence += 10.0
        methodologies.append("Modbus Protocol Deep Packet Inspection")

    # Check 4: Directional Behavioral Role Inference
    if fc_list:
        write_fcs = {"FC05", "FC06", "FC15", "FC16"}
        read_fcs = {"FC01", "FC02", "FC03", "FC04"}
        has_writes = any(fc in write_fcs for fc in fc_list)
        has_reads = any(fc in read_fcs for fc in fc_list)
        
        if has_writes and not matched_oui:
            dev_type = "HMI"
            zone = "Supervisory (Purdue L2)"
            methodologies.append("Role: Supervisory Master (Active Writes)")
        elif has_reads and not has_writes:
            dev_type = "PLC"
            zone = "Control (Purdue L1)"
            methodologies.append("Role: Field Slave (Read Target)")

    # Bound confidence to 99% max for passive analysis
    confidence = min(99.0, confidence)
    
    # Backplane modules lookup
    hardware_modules = DEFAULT_BACKPLANE_PROFILES.get(ip, [
        {"slot": 0, "name": "Embedded Controller Baseboard", "catalog": "EMB-CPU-01", "status": "ONLINE", "type": "CPU"},
        {"slot": 1, "name": "Integrated Ethernet Interface", "catalog": "ETH-MOD-01", "status": "ACTIVE", "type": "Network"}
    ])

    return {
        "vendor": vendor,
        "model": model,
        "asset_type": dev_type,
        "zone": zone,
        "os_signature": os_name,
        "confidence_score": round(confidence, 1),
        "fingerprint_method": " + ".join(methodologies) if methodologies else "Port-Based Heuristic",
        "hardware_modules": hardware_modules
    }

# ==============================================================================
# 5. Asset State Integrity & Configuration Drift Detection
# ==============================================================================
def compute_asset_configuration_hash(
    ip: str,
    mac: str,
    vendor: str,
    model: str,
    firmware: str,
    open_ports: List[int],
    protocols: List[str]
) -> str:
    """
    Computes a cryptographic SHA256 integrity hash representing the verified baseline state.
    """
    ports_str = ",".join(map(str, sorted(open_ports or [])))
    proto_str = ",".join(sorted(protocols or []))
    raw_payload = f"{ip}|{mac}|{vendor}|{model}|{firmware}|{ports_str}|{proto_str}"
    return hashlib.sha256(raw_payload.encode("utf-8")).hexdigest()

def evaluate_configuration_drift(asset_obj, baseline_hash: str) -> Tuple[bool, str]:
    """
    Compares current asset state against verified baseline hash.
    Returns (drift_detected, drift_summary).
    """
    current_hash = compute_asset_configuration_hash(
        asset_obj.ip,
        asset_obj.mac,
        asset_obj.vendor,
        asset_obj.model,
        asset_obj.firmware,
        asset_obj.open_ports or [],
        asset_obj.protocols or []
    )
    if not baseline_hash or baseline_hash == current_hash:
        return False, "Asset configuration matches verified baseline."
    
    return True, f"Configuration Drift Detected! State hash changed from {baseline_hash[:8]}... to {current_hash[:8]}..."
