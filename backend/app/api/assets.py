from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.models.db_models import AssetModel
from app.schemas.schemas import AssetBase, AssetUpdate
from app.services.risk_engine import recalculate_asset_risk
from app.services.vulnerability_engine import correlate_asset_vulnerabilities

router = APIRouter(prefix="/api/assets", tags=["Assets"])

@router.get("", response_model=List[AssetBase])
def list_assets(db: Session = Depends(get_db)):
    """
    Returns list of all passively discovered OT assets.
    """
    assets = db.query(AssetModel).order_by(AssetModel.risk_score.desc()).all()
    for a in assets:
        correlate_asset_vulnerabilities(db, a)
        recalculate_asset_risk(db, a)
    return assets

@router.get("/{asset_id}", response_model=AssetBase)
def get_asset(asset_id: str, db: Session = Depends(get_db)):
    """
    Retrieves a single asset by ID or IP address.
    """
    asset = db.query(AssetModel).filter((AssetModel.id == asset_id) | (AssetModel.ip == asset_id)).first()
    if not asset:
        raise HTTPException(status_code=44, detail="Asset not found")
    correlate_asset_vulnerabilities(db, asset)
    recalculate_asset_risk(db, asset)
    return asset

@router.put("/{asset_id}", response_model=AssetBase)
def update_asset_metadata(asset_id: str, payload: AssetUpdate, db: Session = Depends(get_db)):
    """
    Manually overrides asset metadata (e.g. Purdue zone or criticality designation).
    """
    asset = db.query(AssetModel).filter((AssetModel.id == asset_id) | (AssetModel.ip == asset_id)).first()
    if not asset:
        raise HTTPException(status_code=404, detail="Asset not found")

    if payload.zone is not None:
        asset.zone = payload.zone
    if payload.criticality is not None:
        asset.criticality = payload.criticality
    if payload.hostname is not None:
        asset.hostname = payload.hostname
    if payload.vendor is not None:
        asset.vendor = payload.vendor

    recalculate_asset_risk(db, asset)
    db.commit()
    db.refresh(asset)
    return asset
