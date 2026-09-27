import struct
from scapy.all import rdpcap, IP, TCP, Raw

MODBUS_FUNCTION_NAMES = {
    1: "Read Coils (FC01)",
    2: "Read Discrete Inputs (FC02)",
    3: "Read Holding Registers (FC03)",
    4: "Read Input Registers (FC04)",
    5: "Write Single Coil (FC05)",
    6: "Write Single Register (FC06)",
    15: "Write Multiple Coils (FC15)",
    16: "Write Multiple Registers (FC16)",
    43: "Read Device Identification (FC43)"
}

def parse_modbus_payload(raw_payload: bytes):
    """
    Parses Modbus/TCP MBAP header and PDU.
    MBAP Header:
      - Transaction ID (2 bytes)
      - Protocol ID (2 bytes, 0=Modbus)
      - Length (2 bytes)
      - Unit ID (1 byte)
    PDU:
      - Function Code (1 byte)
      - Data (N bytes)
    """
    if len(raw_payload) < 8:
        return None

    try:
        trans_id, proto_id, length, unit_id = struct.unpack(">HHHB", raw_payload[:7])
        if proto_id != 0:
            return None # Not standard Modbus/TCP

        func_code_raw = raw_payload[7]
        fc_code = f"FC{func_code_raw:02d}"
        func_name = MODBUS_FUNCTION_NAMES.get(func_code_raw, f"Function {func_code_raw}")

        reg_addr = None
        reg_val = None

        if len(raw_payload) >= 11 and func_code_raw in [3, 4, 5, 6, 15, 16]:
            reg_addr = struct.unpack(">H", raw_payload[8:10])[0]
            reg_val = struct.unpack(">H", raw_payload[10:12])[0] if len(raw_payload) >= 12 else None

        return {
            "transaction_id": trans_id,
            "unit_id": unit_id,
            "function_code": fc_code,
            "fc_num": func_code_raw,
            "func_name": func_name,
            "register_address": reg_addr,
            "register_value": reg_val,
            "payload_hex": raw_payload.hex()
        }
    except Exception as e:
        return None

def parse_pcap_file(filepath: str):
    """
    Parses a PCAP file using Scapy and extracts IP, port, and Modbus telemetry records.
    """
    packets = rdpcap(filepath)
    parsed_records = []

    for pkt in packets:
        if IP in pkt and TCP in pkt:
            src_ip = pkt[IP].src
            dst_ip = pkt[IP].dst
            src_port = pkt[TCP].sport
            dst_port = pkt[TCP].dport
            timestamp = float(pkt.time)

            modbus_info = None
            if Raw in pkt:
                payload = bytes(pkt[Raw].load)
                modbus_info = parse_modbus_payload(payload)

            record = {
                "timestamp": timestamp,
                "src_ip": src_ip,
                "dst_ip": dst_ip,
                "src_port": src_port,
                "dst_port": dst_port,
                "protocol": "Modbus/TCP" if (dst_port == 502 or src_port == 502 or modbus_info) else "TCP",
                "modbus": modbus_info
            }
            parsed_records.append(record)

    return parsed_records
