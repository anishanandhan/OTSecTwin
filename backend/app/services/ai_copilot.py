import requests
import json
import logging
from sqlalchemy.orm import Session
from datetime import datetime

from app.config import (
    ROUTERPLUS_API_KEY,
    ROUTERPLUS_ORG_ID,
    ROUTERPLUS_BASE_URL,
    ROUTERPLUS_MODEL
)
from app.models.db_models import AlertModel, AssetModel
from app.services.digital_twin import get_asset_digital_twin

logger = logging.getLogger("AICopilot")

SYSTEM_PROMPT = """You are the OTSecTwin AI Cybersecurity Copilot, an expert Industrial Control Systems (ICS) and Operational Technology (OT) Security Analyst.
You specialize in:
- The Purdue Enterprise Reference Architecture (Purdue Model, IEC 62443 Levels 0-4).
- Industrial protocols: Modbus/TCP, S7comm, DNP3, EtherNet/IP, OPC UA, BACnet.
- ICS threats and the MITRE ATT&CK for ICS framework (e.g. T0836 Modify Parameter, T0855 Unauthorized Command Message, T0846 Reconnaissance).
- Cyber-physical process safety: fluid dynamics, chemical dosing, valve trips, and PLC logic override consequences.

When advising, always provide:
1. Clear technical explanations of industrial anomalies.
2. Exact Purdue Model zone implications.
3. Actionable, safe OT mitigation recommendations (never recommend rebooting critical live PLCs indiscriminately).
Keep answers concise, direct, professional, and formatted in clean markdown.
"""

def call_routerplus(messages: list, temperature: float = 0.2) -> str:
    """
    Dispatches a chat completion request to RouterPlus API.
    """
    if not ROUTERPLUS_API_KEY:
        raise ValueError("ROUTERPLUS_API_KEY is not configured.")

    headers = {
        "Authorization": f"Bearer {ROUTERPLUS_API_KEY}",
        "Content-Type": "application/json"
    }

    payload = {
        "model": ROUTERPLUS_MODEL,
        "messages": messages,
        "temperature": temperature
    }

    try:
        url = f"{ROUTERPLUS_BASE_URL.rstrip('/')}/chat/completions"
        res = requests.post(url, headers=headers, json=payload, timeout=25)
        res.raise_for_status()
        data = res.json()
        return data["choices"][0]["message"]["content"]
    except requests.exceptions.RequestException as e:
        logger.error(f"RouterPlus API call failed: {e}")
        raise RuntimeError(f"RouterPlus API Error: {str(e)}")

def check_ai_status() -> dict:
    """
    Verifies connection to RouterPlus and returns health status.
    """
    if not ROUTERPLUS_API_KEY:
        return {
            "status": "NOT_CONFIGURED",
            "provider": "RouterPlus",
            "model": ROUTERPLUS_MODEL,
            "organization_id": ROUTERPLUS_ORG_ID or "NOT_SET",
            "message": "ROUTERPLUS_API_KEY is not set in environment or .env file."
        }

    start_time = datetime.utcnow()
    try:
        messages = [
            {"role": "system", "content": "You are a test ping agent."},
            {"role": "user", "content": "Respond with 'PONG'"}
        ]
        reply = call_routerplus(messages)
        latency_ms = int((datetime.utcnow() - start_time).total_seconds() * 1000)
        return {
            "status": "CONNECTED",
            "provider": "RouterPlus",
            "model": ROUTERPLUS_MODEL,
            "organization_id": ROUTERPLUS_ORG_ID,
            "latency_ms": latency_ms,
            "response_preview": reply.strip()
        }
    except Exception as ex:
        return {
            "status": "ERROR",
            "provider": "RouterPlus",
            "model": ROUTERPLUS_MODEL,
            "organization_id": ROUTERPLUS_ORG_ID,
            "error": str(ex)
        }

def chat_with_copilot(user_query: str, chat_history: list = None, context_data: dict = None) -> str:
    """
    Interacts with the AI Copilot with optional contextual OT data.
    """
    messages = [{"role": "system", "content": SYSTEM_PROMPT}]

    if context_data:
        ctx_summary = f"\n[CURRENT OT CONTEXT]:\n{json.dumps(context_data, indent=2, default=str)}\n"
        messages.append({"role": "system", "content": ctx_summary})

    if chat_history:
        for msg in chat_history[-6:]:  # Keep recent context
            messages.append({"role": msg.get("role", "user"), "content": msg.get("content", "")})

    messages.append({"role": "user", "content": user_query})
    return call_routerplus(messages, temperature=0.3)

def analyze_alert_with_ai(db: Session, alert_id: str) -> dict:
    """
    Performs an automated deep-dive root cause analysis on a behavioral alert.
    """
    alert = db.query(AlertModel).filter(AlertModel.id == alert_id).first()
    if not alert:
        return {"error": f"Alert {alert_id} not found."}

    # Fetch associated target asset twin
    twin = get_asset_digital_twin(db, alert.asset_id or alert.dst_ip)

    prompt = f"""
Perform a critical OT Threat Incident Analysis for the following alert:

Alert Title: {alert.title}
Severity: {alert.severity}
Category: {alert.category}
Source IP: {alert.src_ip}
Destination IP: {alert.dst_ip}
Target Asset: {alert.asset_id}
Description: {alert.description}
Raw Payload: {json.dumps(alert.raw_payload or {})}

Target Asset State:
{json.dumps(twin or {}, default=str)}

Provide a structured report including:
1. **Executive Summary & Risk Assessment**
2. **MITRE ATT&CK for ICS Mapping** (Technique ID and Name)
3. **Cyber-Physical Threat Vector** (Potential process consequences on valves, pumps, tanks, or safety systems)
4. **Immediate Containment Steps** (Firewall / Network isolation commands)
5. **Remediation & Hardening** (Baseline policy updates and patch advisory)
"""

    messages = [
        {"role": "system", "content": SYSTEM_PROMPT},
        {"role": "user", "content": prompt}
    ]

    analysis = call_routerplus(messages, temperature=0.1)
    return {
        "alert_id": alert.id,
        "alert_title": alert.title,
        "severity": alert.severity,
        "analysis_markdown": analysis,
        "model": ROUTERPLUS_MODEL,
        "timestamp": datetime.utcnow().isoformat()
    }

def analyze_asset_hardening_with_ai(db: Session, asset_id: str) -> dict:
    """
    Generates tailored OT security hardening guidelines for an asset twin.
    """
    twin = get_asset_digital_twin(db, asset_id)
    if not twin:
        return {"error": f"Asset {asset_id} not found."}

    prompt = f"""
Analyze the security posture of this OT asset and generate a hardening checklist:

Asset Details:
- Hostname: {twin.get('hostname')} ({twin.get('ip')})
- Device Type: {twin.get('type')} ({twin.get('vendor')} {twin.get('model')})
- Firmware: {twin.get('firmware')}
- Purdue Zone: {twin.get('zone')}
- Criticality: {twin.get('criticality')}
- Risk Score: {twin.get('risk_score')}/100 ({twin.get('risk_level')})
- Open Ports & Protocols: {twin.get('open_ports')} / {twin.get('protocols')}
- Correlated Vulnerabilities (CVEs): {len(twin.get('vulnerabilities', []))} CVEs identified
- Active Alerts: {len(twin.get('recent_alerts', []))}

Provide:
1. **Security Posture Critique**
2. **Key Attack Surface Exposures**
3. **Purdue Model Boundary Hardening**
4. **Vulnerability Prioritization & Compensating Controls** (if patching requires an operational outage)
"""

    messages = [
        {"role": "system", "content": SYSTEM_PROMPT},
        {"role": "user", "content": prompt}
    ]

    recommendations = call_routerplus(messages, temperature=0.2)
    return {
        "asset_id": asset_id,
        "recommendations_markdown": recommendations,
        "model": ROUTERPLUS_MODEL,
        "timestamp": datetime.utcnow().isoformat()
    }
