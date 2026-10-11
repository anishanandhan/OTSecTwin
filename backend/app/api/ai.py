from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional, List, Dict, Any

from app.database import get_db
from app.services.ai_copilot import (
    check_ai_status,
    chat_with_copilot,
    analyze_alert_with_ai,
    analyze_asset_hardening_with_ai
)

router = APIRouter(prefix="/api/ai", tags=["AI Copilot (RouterPlus)"])

class ChatRequest(BaseModel):
    message: str
    history: Optional[List[Dict[str, str]]] = None
    context: Optional[Dict[str, Any]] = None

@router.get("/status")
def get_status():
    """
    Checks RouterPlus connection health and model configuration.
    """
    return check_ai_status()

@router.post("/chat")
def chat_copilot(req: ChatRequest):
    """
    Chats with the OTSecTwin AI Cybersecurity Copilot.
    """
    try:
        reply = chat_with_copilot(
            user_query=req.message,
            chat_history=req.history,
            context_data=req.context
        )
        return {"reply": reply}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/analyze-alert/{alert_id}")
def analyze_alert(alert_id: str, db: Session = Depends(get_db)):
    """
    Runs automated Root Cause Analysis on an OT behavioral alert using RouterPlus.
    """
    try:
        res = analyze_alert_with_ai(db, alert_id)
        if "error" in res:
            raise HTTPException(status_code=404, detail=res["error"])
        return res
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/asset-hardening/{asset_id}")
def analyze_asset_hardening(asset_id: str, db: Session = Depends(get_db)):
    """
    Generates security hardening advice for a specific OT asset digital twin.
    """
    try:
        res = analyze_asset_hardening_with_ai(db, asset_id)
        if "error" in res:
            raise HTTPException(status_code=404, detail=res["error"])
        return res
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
