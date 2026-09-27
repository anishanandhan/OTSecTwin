from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from sqlalchemy.orm import Session
from typing import List
import os
import shutil

from app.database import get_db
from app.models.db_models import TelemetryLogModel
from app.schemas.schemas import TelemetrySchema
from app.config import SAMPLE_PCAP_DIR
from app.services.pcap_parser import parse_pcap_file
from app.services.asset_discovery import discover_or_update_asset
from app.services.topology_engine import record_connection
from app.services.baseline_engine import inspect_telemetry_against_baseline

router = APIRouter(prefix="/api/telemetry", tags=["Telemetry Stream"])

@router.get("", response_model=List[TelemetrySchema])
def get_recent_telemetry(limit: int = 50, db: Session = Depends(get_db)):
    """
    Returns recent Modbus/TCP telemetry logs.
    """
    return db.query(TelemetryLogModel).order_by(TelemetryLogModel.timestamp.desc()).limit(limit).all()

@router.post("/upload_pcap")
def upload_and_process_pcap(file: UploadFile = File(...), db: Session = Depends(get_db)):
    """
    Passively ingests a user-uploaded PCAP network capture file, extracts Modbus frames, finger-prints assets, and runs anomaly checks.
    """
    if not file.filename.endswith(('.pcap', '.pcapng', '.cap')):
        raise HTTPException(status_code=400, detail="Invalid PCAP file format")

    dest_path = os.path.join(SAMPLE_PCAP_DIR, f"uploaded_{file.filename}")
    with open(dest_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    parsed_records = parse_pcap_file(dest_path)
    processed_count = 0

    for r in parsed_records:
        src = r["src_ip"]
        dst = r["dst_ip"]
        proto = r["protocol"]
        port = r["dst_port"]
        mb = r.get("modbus")

        fc = mb["function_code"] if mb else "FC03"
        fc_name = mb["func_name"] if mb else "Read Holding Registers"
        reg_addr = mb["register_address"] if mb else 40001
        reg_val = mb["register_value"] if mb else 0

        discover_or_update_asset(db, src, port, proto, fc)
        discover_or_update_asset(db, dst, port, proto, fc)

        is_anom = inspect_telemetry_against_baseline(db, src, dst, fc, reg_addr, reg_val)
        record_connection(db, src, dst, proto, port, fc, not is_anom)

        log = TelemetryLogModel(
            src_ip=src,
            dst_ip=dst,
            src_port=r["src_port"],
            dst_port=port,
            protocol=proto,
            function_code=fc,
            func_name=fc_name,
            unit_id=mb["unit_id"] if mb else 1,
            register_address=reg_addr,
            register_value=reg_val,
            is_anomalous=is_anom
        )
        db.add(log)
        processed_count += 1

    db.commit()
    return {
        "status": "SUCCESS",
        "filename": file.filename,
        "processed_packets": processed_count
    }

@router.post("/start_live_sniff")
def start_sniffing(iface: str = None):
    """
    Starts live packet sniffing on network interface (e.g. eth0, SPAN port) for Modbus traffic.
    """
    from app.services.live_sniffer import start_live_sniffing
    return start_live_sniffing(iface)

@router.post("/stop_live_sniff")
def stop_sniffing():
    """
    Stops live packet sniffing.
    """
    from app.services.live_sniffer import stop_live_sniffing
    return stop_live_sniffing()

