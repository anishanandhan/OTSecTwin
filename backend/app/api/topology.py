from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.services.topology_engine import get_topology_graph_data

router = APIRouter(prefix="/api/topology", tags=["Topology Graph"])

@router.get("")
def get_topology(db: Session = Depends(get_db)):
    """
    Returns nodes and directional connection edges for the visual topology network map.
    """
    return get_topology_graph_data(db)
