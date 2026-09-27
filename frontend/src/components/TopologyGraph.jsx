import React, { useEffect, useRef } from "react";
import { Network as NetworkIcon, RefreshCw, ZoomIn, Info, ShieldAlert } from "lucide-react";
import { Network } from "vis-network";
import { DataSet } from "vis-data";

export default function TopologyGraph({ topologyData, onSelectAsset, onRefresh }) {
  const containerRef = useRef(null);
  const networkRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current || !topologyData) return;

    // Convert nodes to Vis format
    const nodes = new DataSet(
      topologyData.nodes.map((node) => {
        let color = "#10b981"; // Low risk Green
        if (node.risk_level === "CRITICAL" || node.asset_type === "Attacker Host") color = "#ef4444";
        else if (node.risk_level === "HIGH") color = "#f97316";
        else if (node.risk_level === "MEDIUM") color = "#f59e0b";

        let shape = "box";
        if (node.asset_type === "PLC") shape = "box";
        else if (node.asset_type === "HMI" || node.asset_type === "SCADA") shape = "ellipse";
        else if (node.asset_type === "Attacker Host") shape = "diamond";

        return {
          id: node.id,
          label: `${node.id}\n${node.ip}\n[${node.asset_type}]`,
          shape: shape,
          color: {
            background: "#131c31",
            border: color,
            highlight: { background: "#1a2642", border: "#06b6d4" },
          },
          font: { color: "#f8fafc", face: "monospace", size: 12 },
          borderWidth: 3,
          margin: 10,
        };
      })
    );

    // Convert edges to Vis format
    const edges = new DataSet(
      topologyData.edges.map((edge) => {
        return {
          id: edge.id,
          from: edge.from,
          to: edge.to,
          label: `${edge.protocol} (${(edge.function_codes || []).join(",")})`,
          font: { color: "#94a3b8", size: 10, align: "top" },
          arrows: "to",
          color: {
            color: edge.is_authorized ? "#06b6d4" : "#ef4444",
            highlight: "#06b6d4",
          },
          dashes: !edge.is_authorized,
          width: Math.min(5, Math.max(1, Math.log2(edge.packet_count || 1))),
          smooth: { type: "curvedCW", roundness: 0.2 },
        };
      })
    );

    const data = { nodes, edges };
    const options = {
      physics: {
        enabled: true,
        barnesHut: {
          gravitationalConstant: -3000,
          centralGravity: 0.3,
          springLength: 150,
          springConstant: 0.04,
        },
      },
      interaction: {
        hover: true,
        tooltipDelay: 200,
        zoomView: true,
        dragNodes: true,
      },
      height: "550px",
    };

    networkRef.current = new Network(containerRef.current, data, options);

    networkRef.current.on("selectNode", (params) => {
      if (params.nodes.length > 0) {
        onSelectAsset(params.nodes[0]);
      }
    });

    return () => {
      if (networkRef.current) networkRef.current.destroy();
    };
  }, [topologyData, onSelectAsset]);

  return (
    <div className="space-y-4">
      {/* Header Controls */}
      <div className="glass-card p-4 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <NetworkIcon className="w-5 h-5 text-cyan-400" /> Interactive OT Network Topology Map
          </h2>
          <p className="text-xs text-slate-400">
            Real-time passive communication graph (Purdue Level 0-3). Click any node to inspect Digital Twin object state.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-4 text-xs font-semibold text-slate-300 bg-[#0d1424] px-3 py-1.5 rounded-lg border border-[#1e2d4a]">
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Normal Link</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" /> Unauthorized / Anomaly</span>
          </div>

          <button
            onClick={onRefresh}
            className="px-3 py-1.5 bg-[#1a2642] hover:bg-[#25375d] text-slate-200 text-xs font-semibold rounded-lg border border-[#1e2d4a] flex items-center gap-1.5 transition-all"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Re-layout Graph
          </button>
        </div>
      </div>

      {/* Network Visual Canvas */}
      <div className="glass-card p-2 relative overflow-hidden">
        <div ref={containerRef} className="w-full rounded-xl bg-[#080c14]" />
        
        <div className="absolute bottom-4 left-4 bg-[#0d1424]/90 backdrop-blur-md p-3 rounded-xl border border-[#1e2d4a] text-xs text-slate-300 space-y-1">
          <p className="font-bold text-cyan-400 flex items-center gap-1">
            <Info className="w-3.5 h-3.5" /> Passive Discovery Summary:
          </p>
          <p>Total Discovered Nodes: <span className="text-white font-mono">{topologyData?.total_nodes || 0}</span></p>
          <p>Directional Telemetry Edges: <span className="text-white font-mono">{topologyData?.total_edges || 0}</span></p>
        </div>
      </div>
    </div>
  );
}
