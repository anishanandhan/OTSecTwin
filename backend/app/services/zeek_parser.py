import json
import os

def parse_zeek_modbus_log(filepath: str):
    """
    Parses Zeek modbus.log file (JSON or tab-separated).
    Extracts src_ip, dst_ip, function_code, register_address, etc.
    """
    if not os.path.exists(filepath):
        return []

    records = []
    with open(filepath, 'r') as f:
        for line in f:
            line = line.strip()
            if not line or line.startswith("#"):
                continue
            try:
                data = json.loads(line)
                records.append({
                    "src_ip": data.get("id.orig_h"),
                    "dst_ip": data.get("id.resp_h"),
                    "src_port": data.get("id.orig_p"),
                    "dst_port": data.get("id.resp_p"),
                    "function_code": f"FC{int(data.get('func', 3)):02d}" if data.get('func') else "FC03",
                    "func_name": data.get("func_name", "Read Holding Registers"),
                    "unit_id": data.get("unit_id", 1)
                })
            except Exception:
                # Tab separated fallback
                parts = line.split("\t")
                if len(parts) >= 5:
                    records.append({
                        "src_ip": parts[2],
                        "dst_ip": parts[4],
                        "src_port": int(parts[3]) if parts[3].isdigit() else 502,
                        "dst_port": int(parts[5]) if len(parts) > 5 and parts[5].isdigit() else 502,
                        "function_code": "FC03",
                        "func_name": "Read Holding Registers",
                        "unit_id": 1
                    })
    return records
