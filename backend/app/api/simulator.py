from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
import os

from app.database import get_db
from app.schemas.schemas import SimulationTriggerRequest, PlantControlRequest
from app.services.simulator import generate_telemetry_batch, seed_simulated_ot_lab, get_plant_state, update_plant_control
from app.config import SAMPLE_PCAP_DIR

router = APIRouter(prefix="/api/simulator", tags=["OT Lab Simulator"])

@router.get("/plant_state")
def read_plant_state():
    """
    Returns live cyber-physical simulation telemetry (water tank, pump, chemical pH, valves, Modbus registers).
    """
    return get_plant_state()

@router.post("/plant_control")
def apply_plant_control(req: PlantControlRequest, db: Session = Depends(get_db)):
    """
    Simulates operator HMI setpoint adjustment (inflow valve, pump status, target level).
    """
    return update_plant_control(req.model_dump(), db=db)

@router.post("/trigger")
def trigger_simulation(req: SimulationTriggerRequest, db: Session = Depends(get_db)):
    """
    Triggers simulated OT lab network traffic generation (NORMAL, UNAUTHORIZED_WRITE, PORT_SCAN).
    """
    res = generate_telemetry_batch(
        db=db,
        traffic_type=req.traffic_type,
        target_ip=req.target_ip or "192.168.10.10",
        count=req.count or 10
    )
    return res

@router.post("/reset_lab")
def reset_lab_environment(db: Session = Depends(get_db)):
    """
    Resets OT Lab environment and re-seeds baseline assets.
    """
    seed_simulated_ot_lab(db)
    generate_telemetry_batch(db, "NORMAL", "192.168.10.10", 5)
    return {"status": "SUCCESS", "message": "OT Lab environment initialized.", "plant_state": get_plant_state()}

@router.get("/download_pcap")
def download_sample_pcap():
    """
    Downloads the generated PCAP network capture file for analysis in Wireshark.
    """
    pcap_path = os.path.join(SAMPLE_PCAP_DIR, "ot_telemetry_capture.pcap")
    if not os.path.exists(pcap_path):
        raise HTTPException(status_code=404, detail="PCAP capture file not generated yet. Trigger simulation first.")
    return FileResponse(pcap_path, media_type="application/vnd.tcpdump.pcap", filename="ot_telemetry_capture.pcap")
