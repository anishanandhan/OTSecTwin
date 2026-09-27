from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.services.digital_twin import get_asset_digital_twin

router = APIRouter(prefix="/api/twin", tags=["Digital Twin"])

@router.get("/{asset_id}")
def get_digital_twin(asset_id: str, db: Session = Depends(get_db)):
    """
    Returns full Digital Twin representation for an OT asset.
    """
    twin = get_asset_digital_twin(db, asset_id)
    if not twin:
        raise HTTPException(status_code=404, detail="Digital Twin object not found")
    return twin
