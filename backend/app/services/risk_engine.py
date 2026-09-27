from sqlalchemy.orm import Session
from app.models.db_models import AssetModel, AssetVulnerabilityModel, VulnerabilityModel, AlertModel

CRITICALITY_BASE = {
    "CRITICAL": 35.0,
    "HIGH": 25.0,
    "MEDIUM": 15.0,
    "LOW": 5.0
}

ZONE_EXPOSURE_POINTS = {
    "External / DMZ": 30.0,
    "Operations (Purdue L3)": 20.0,
    "Supervisory (Purdue L2)": 15.0,
    "Control (Purdue L1)": 10.0,
    "Field (Purdue L0)": 5.0
}

def recalculate_asset_risk(db: Session, asset: AssetModel):
    """
    Computes a transparent, multi-factor security risk score for an asset.
    Score ranges from 0.0 to 100.0.
    """
    crit_score = CRITICALITY_BASE.get(asset.criticality, 15.0)
    zone_score = ZONE_EXPOSURE_POINTS.get(asset.zone, 10.0)

    # 1. Vulnerability contribution
    asset_vulns = db.query(AssetVulnerabilityModel, VulnerabilityModel).join(
        VulnerabilityModel, AssetVulnerabilityModel.cve_id == VulnerabilityModel.id
    ).filter(AssetVulnerabilityModel.asset_id == asset.id).all()

    vuln_score = 0.0
    critical_cve_count = 0
    high_cve_count = 0
    for av, v in asset_vulns:
        if v.severity == "CRITICAL":
            critical_cve_count += 1
            vuln_score += 15.0
        elif v.severity == "HIGH":
            high_cve_count += 1
            vuln_score += 10.0
        else:
            vuln_score += 5.0

    vuln_score = min(40.0, vuln_score)

    # 2. Anomaly & Alert penalties
    active_alerts = db.query(AlertModel).filter(
        (AlertModel.asset_id == asset.id) | (AlertModel.dst_ip == asset.ip),
        AlertModel.status == "NEW"
    ).all()

    anomaly_score = 0.0
    unauthorized_writes = 0
    for alt in active_alerts:
        if alt.severity == "CRITICAL":
            anomaly_score += 25.0
            unauthorized_writes += 1
        elif alt.severity == "HIGH":
            anomaly_score += 15.0
        else:
            anomaly_score += 5.0

    anomaly_score = min(35.0, anomaly_score)

    # Total score calculation
    total_score = round(min(100.0, crit_score + zone_score + vuln_score + anomaly_score), 1)

    if total_score >= 75.0:
        risk_level = "CRITICAL"
    elif total_score >= 50.0:
        risk_level = "HIGH"
    elif total_score >= 25.0:
        risk_level = "MEDIUM"
    else:
        risk_level = "LOW"

    # Human-readable breakdown string
    breakdown_reasons = []
    if critical_cve_count > 0 or high_cve_count > 0:
        breakdown_reasons.append(f"{critical_cve_count + high_cve_count} active CVE(s) correlated ({critical_cve_count} Critical)")
    if unauthorized_writes > 0:
        breakdown_reasons.append(f"{unauthorized_writes} unauthorized Modbus write attempt(s) detected")
    if asset.criticality in ["HIGH", "CRITICAL"]:
        breakdown_reasons.append(f"High operational criticality designation ({asset.criticality})")
    if asset.zone in ["External / DMZ", "Operations (Purdue L3)"]:
        breakdown_reasons.append(f"High network exposure zone ({asset.zone})")
    if not breakdown_reasons:
        breakdown_reasons.append("Baseline normal operation without unmitigated critical vulnerabilities")

    asset.risk_score = total_score
    asset.risk_level = risk_level
    asset.risk_breakdown = {
        "criticality_points": crit_score,
        "zone_points": zone_score,
        "vulnerability_points": vuln_score,
        "anomaly_points": anomaly_score,
        "total_score": total_score,
        "summary": "; ".join(breakdown_reasons)
    }

    db.commit()
    db.refresh(asset)
    return asset
