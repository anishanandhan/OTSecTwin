import threading
import time
from scapy.all import sniff, IP, TCP, Raw
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.services.pcap_parser import parse_modbus_payload
from app.services.asset_discovery import discover_or_update_asset
from app.services.topology_engine import record_connection
from app.services.baseline_engine import inspect_telemetry_against_baseline
from app.models.db_models import TelemetryLogModel

_sniffing_active = False
_sniffer_thread = None

def _packet_callback(pkt):
    if IP in pkt and TCP in pkt and Raw in pkt:
        src_ip = pkt[IP].src
        dst_ip = pkt[IP].dst
        src_port = pkt[TCP].sport
        dst_port = pkt[TCP].dport
        payload = bytes(pkt[Raw].load)

        mb_info = parse_modbus_payload(payload)
        if mb_info or dst_port == 502 or src_port == 502:
            fc = mb_info["function_code"] if mb_info else "FC03"
            func_name = mb_info["func_name"] if mb_info else "Read Holding Registers"
            reg_addr = mb_info["register_address"] if mb_info else 40001
            reg_val = mb_info["register_value"] if mb_info else 0

            db: Session = SessionLocal()
            try:
                discover_or_update_asset(db, src_ip, dst_port, "Modbus/TCP", fc)
                discover_or_update_asset(db, dst_ip, dst_port, "Modbus/TCP", fc)

                is_anom = inspect_telemetry_against_baseline(db, src_ip, dst_ip, fc, reg_addr, reg_val)
                record_connection(db, src_ip, dst_ip, "Modbus/TCP", dst_port, fc, not is_anom)

                log = TelemetryLogModel(
                    src_ip=src_ip,
                    dst_ip=dst_ip,
                    src_port=src_port,
                    dst_port=dst_port,
                    protocol="Modbus/TCP",
                    function_code=fc,
                    func_name=func_name,
                    unit_id=mb_info["unit_id"] if mb_info else 1,
                    register_address=reg_addr,
                    register_value=reg_val,
                    is_anomalous=is_anom
                )
                db.add(log)
                db.commit()
            except Exception as e:
                db.rollback()
            finally:
                db.close()

def start_live_sniffing(iface: str = None, filter_str: str = "tcp port 502"):
    global _sniffing_active, _sniffer_thread
    if _sniffing_active:
        return {"status": "ALREADY_RUNNING"}

    _sniffing_active = True

    def run_sniff():
        kwargs = {"filter": filter_str, "prn": _packet_callback, "store": False}
        if iface:
            kwargs["iface"] = iface
        sniff(**kwargs)

    _sniffer_thread = threading.Thread(target=run_sniff, daemon=True)
    _sniffer_thread.start()
    return {"status": "STARTED", "filter": filter_str}

def stop_live_sniffing():
    global _sniffing_active
    _sniffing_active = False
    return {"status": "STOPPED"}
