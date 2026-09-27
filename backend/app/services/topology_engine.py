from sqlalchemy.orm import Session
from app.models.db_models import NetworkConnectionModel, AssetModel
from datetime import datetime
import networkx as nx

def record_connection(db: Session, src_ip: str, dst_ip: str, protocol: str = "Modbus/TCP", dst_port: int = 502, function_code: str = None, is_authorized: bool = True):
    """
    Records or updates a directional asset connection edge in the database.
    """
    src_asset = db.query(AssetModel).filter(AssetModel.ip == src_ip).first()
    dst_asset = db.query(AssetModel).filter(AssetModel.ip == dst_ip).first()

    src_id = src_asset.id if src_asset else src_ip
    dst_id = dst_asset.id if dst_asset else dst_ip

    conn = db.query(NetworkConnectionModel).filter(
        NetworkConnectionModel.src_ip == src_ip,
        NetworkConnectionModel.dst_ip == dst_ip,
        NetworkConnectionModel.protocol == protocol,
        NetworkConnectionModel.dst_port == dst_port
    ).first()

    if not conn:
        fcs = [function_code] if function_code else []
        conn = NetworkConnectionModel(
            src_ip=src_ip,
            dst_ip=dst_ip,
            src_asset_id=src_id,
            dst_asset_id=dst_id,
            protocol=protocol,
            dst_port=dst_port,
            function_codes_used=fcs,
            packet_count=1,
            byte_count=64,
            avg_frequency_hz=1.0,
            is_authorized=is_authorized,
            first_seen=datetime.utcnow(),
            last_seen=datetime.utcnow()
        )
        db.add(conn)
    else:
        conn.packet_count += 1
        conn.byte_count += 64
        conn.last_seen = datetime.utcnow()
        conn.is_authorized = is_authorized

        fcs = list(conn.function_codes_used or [])
        if function_code and function_code not in fcs:
            fcs.append(function_code)
            conn.function_codes_used = fcs

    db.commit()
    db.refresh(conn)
    return conn

def get_topology_graph_data(db: Session):
    """
    Generates node list and directional edge list for visual topology visualization.
    Uses NetworkX to compute centrality & degree stats.
    """
    assets = db.query(AssetModel).all()
    connections = db.query(NetworkConnectionModel).all()

    G = nx.DiGraph()
    nodes = []
    for a in assets:
        G.add_node(a.id, ip=a.ip, asset_type=a.asset_type, zone=a.zone)
        nodes.append({
            "id": a.id,
            "label": f"{a.id}\n({a.ip})",
            "ip": a.ip,
            "asset_type": a.asset_type,
            "vendor": a.vendor,
            "zone": a.zone,
            "criticality": a.criticality,
            "risk_score": a.risk_score,
            "risk_level": a.risk_level,
            "status": a.status
        })

    edges = []
    for c in connections:
        src = c.src_asset_id or c.src_ip
        dst = c.dst_asset_id or c.dst_ip
        G.add_edge(src, dst, protocol=c.protocol, packet_count=c.packet_count)

        edges.append({
            "id": f"e-{c.id}",
            "from": src,
            "to": dst,
            "label": f"{c.protocol} ({', '.join(c.function_codes_used or [])})",
            "protocol": c.protocol,
            "dst_port": c.dst_port,
            "function_codes": c.function_codes_used or [],
            "packet_count": c.packet_count,
            "is_authorized": c.is_authorized
        })

    centrality = {}
    if len(G.nodes) > 0:
        try:
            centrality = nx.degree_centrality(G)
        except Exception:
            pass

    for node in nodes:
        node["centrality"] = round(centrality.get(node["id"], 0.0), 3)

    return {
        "nodes": nodes,
        "edges": edges,
        "total_nodes": len(nodes),
        "total_edges": len(edges)
    }
