from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models.db_models import AlertModel
from app.schemas.schemas import AlertSchema

router = APIRouter(prefix="/api/alerts", tags=["Alerts & Anomalies"])

@router.get("", response_model=List[AlertSchema])
def get_alerts(db: Session = Depends(get_db)):
    """
    Returns list of behavioral security alerts and anomalies.
    """
    return db.query(AlertModel).order_by(AlertModel.timestamp.desc()).all()

@router.post("/{alert_id}/acknowledge", response_model=AlertSchema)
def acknowledge_alert(alert_id: str, db: Session = Depends(get_db)):
    """
    Acknowledges a behavioral security alert.
    """
    alert = db.query(AlertModel).filter(AlertModel.id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    alert.status = "ACKNOWLEDGED"
    db.commit()
    db.refresh(alert)
    return alert

@router.post("/{alert_id}/resolve", response_model=AlertSchema)
def resolve_alert(alert_id: str, db: Session = Depends(get_db)):
    """
    Resolves a security alert.
    """
    alert = db.query(AlertModel).filter(AlertModel.id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    alert.status = "RESOLVED"
    db.commit()
    db.refresh(alert)
    return alert
