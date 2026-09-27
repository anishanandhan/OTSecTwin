from sqlalchemy.orm import Session
from app.models.db_models import AssetModel, NetworkConnectionModel, AssetVulnerabilityModel, VulnerabilityModel, AlertModel

def get_asset_digital_twin(db: Session, asset_id: str):
    """
    Returns the complete Digital Twin JSON representation for an OT asset.
    """
    asset = db.query(AssetModel).filter((AssetModel.id == asset_id) | (AssetModel.ip == asset_id)).first()
    if not asset:
        return None

    # Ingoing and outgoing communication partners
    outgoing_conns = db.query(NetworkConnectionModel).filter(
        (NetworkConnectionModel.src_asset_id == asset.id) | (NetworkConnectionModel.src_ip == asset.ip)
    ).all()

    incoming_conns = db.query(NetworkConnectionModel).filter(
        (NetworkConnectionModel.dst_asset_id == asset.id) | (NetworkConnectionModel.dst_ip == asset.ip)
    ).all()

    outbound_targets = list(set([c.dst_asset_id or c.dst_ip for c in outgoing_conns]))
    inbound_sources = list(set([c.src_asset_id or c.src_ip for c in incoming_conns]))

    # Matched Vulnerabilities
    asset_vulns = db.query(AssetVulnerabilityModel, VulnerabilityModel).join(
        VulnerabilityModel, AssetVulnerabilityModel.cve_id == VulnerabilityModel.id
    ).filter(AssetVulnerabilityModel.asset_id == asset.id).all()

    vulnerabilities = []
    for av, v in asset_vulns:
        vulnerabilities.append({
            "cve_id": v.cve_id,
            "title": v.title,
            "cvss_score": v.cvss_score,
            "severity": v.severity,
            "contextual_risk_score": av.contextual_risk_score,
            "exploit_available": v.exploit_available,
            "remediation": v.remediation
        })

    # Recent Alerts
    alerts = db.query(AlertModel).filter(
        (AlertModel.asset_id == asset.id) | (AlertModel.src_ip == asset.ip) | (AlertModel.dst_ip == asset.ip)
    ).order_by(AlertModel.timestamp.desc()).limit(5).all()

    alert_summary = []
    for alt in alerts:
        alert_summary.append({
            "id": alt.id,
            "title": alt.title,
            "severity": alt.severity,
            "category": alt.category,
            "status": alt.status,
            "timestamp": alt.timestamp.isoformat()
        })

    twin_json = {
        "asset_id": asset.id,
        "ip": asset.ip,
        "mac": asset.mac,
        "hostname": asset.hostname,
        "type": asset.asset_type,
        "vendor": asset.vendor,
        "model": asset.model,
        "firmware": asset.firmware,
        "zone": asset.zone,
        "criticality": asset.criticality,
        "status": asset.status,
        "protocols": asset.protocols or [],
        "open_ports": asset.open_ports or [],
        "risk_score": asset.risk_score,
        "risk_level": asset.risk_level,
        "risk_breakdown": asset.risk_breakdown or {},
        "communications": {
            "outbound_connections": outbound_targets,
            "inbound_connections": inbound_sources,
            "total_peers": len(set(outbound_targets + inbound_sources))
        },
        "vulnerabilities": vulnerabilities,
        "recent_alerts": alert_summary,
        "first_seen": asset.first_seen.isoformat(),
        "last_seen": asset.last_seen.isoformat()
    }

    return twin_json
