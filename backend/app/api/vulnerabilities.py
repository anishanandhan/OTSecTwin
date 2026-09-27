from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models.db_models import VulnerabilityModel, AssetVulnerabilityModel, AssetModel
from app.schemas.schemas import VulnerabilitySchema

router = APIRouter(prefix="/api/vulnerabilities", tags=["Vulnerabilities"])

@router.get("", response_model=List[VulnerabilitySchema])
def list_vulnerabilities(db: Session = Depends(get_db)):
    """
    Returns curated ICS/OT CVE vulnerabilities database.
    """
    return db.query(VulnerabilityModel).all()

@router.get("/correlations")
def get_vulnerability_correlations(db: Session = Depends(get_db)):
    """
    Returns matrix of matched vulnerabilities bound to discovered OT assets.
    """
    matches = db.query(AssetVulnerabilityModel, VulnerabilityModel, AssetModel).join(
        VulnerabilityModel, AssetVulnerabilityModel.cve_id == VulnerabilityModel.id
    ).join(
        AssetModel, AssetVulnerabilityModel.asset_id == AssetModel.id
    ).all()

    result = []
    for av, v, a in matches:
        result.append({
            "asset_id": a.id,
            "asset_ip": a.ip,
            "asset_vendor": a.vendor,
            "cve_id": v.cve_id,
            "title": v.title,
            "cvss_score": v.cvss_score,
            "contextual_risk_score": av.contextual_risk_score,
            "severity": v.severity,
            "exploit_available": v.exploit_available,
            "remediation": v.remediation
        })
    return result
