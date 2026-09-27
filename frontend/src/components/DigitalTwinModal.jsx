import React, { useState, useEffect } from "react";
import { X, Box, Shield, Activity, Network, Code, Save, CheckCircle2, AlertTriangle, Cpu } from "lucide-react";
import { fetchDigitalTwin, updateAsset } from "../services/api";

export default function DigitalTwinModal({ assetId, onClose, onAssetUpdated }) {
  const [twin, setTwin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [zone, setZone] = useState("");
  const [criticality, setCriticality] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!assetId) return;
    setLoading(true);
    fetchDigitalTwin(assetId)
      .then((data) => {
        setTwin(data);
        setZone(data.zone);
        setCriticality(data.criticality);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [assetId]);

  const handleSaveOverrides = async () => {
    setSaving(true);
    try {
      await updateAsset(assetId, { zone, criticality });
      const updated = await fetchDigitalTwin(assetId);
      setTwin(updated);
      onAssetUpdated();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (!assetId) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#0f172a] border border-[#1e2d4a] rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="p-5 border-b border-[#1e2d4a] bg-[#131c31] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-tr from-cyan-600 to-emerald-500 rounded-xl text-white">
              <Box className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white">{twin ? twin.asset_id : assetId}</h3>
                <span className="text-xs font-mono text-cyan-400 font-semibold">{twin?.ip}</span>
              </div>
              <p className="text-xs text-slate-400">Digital Twin Inspector Object</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white bg-[#1a2642] rounded-xl border border-[#1e2d4a] transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Sub-Tabs */}
        <div className="px-6 py-2 bg-[#0d1424] border-b border-[#1e2d4a] flex items-center gap-2">
          <button
            onClick={() => setActiveTab("overview")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 ${
              activeTab === "overview" ? "bg-cyan-600 text-white" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Box className="w-4 h-4" /> Twin State & Overrides
          </button>

          <button
            onClick={() => setActiveTab("communications")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 ${
              activeTab === "communications" ? "bg-cyan-600 text-white" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Network className="w-4 h-4" /> Communication Topology
          </button>

          <button
            onClick={() => setActiveTab("vulnerabilities")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 ${
              activeTab === "vulnerabilities" ? "bg-cyan-600 text-white" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Shield className="w-4 h-4" /> CVE Matches ({twin?.vulnerabilities?.length || 0})
          </button>

          <button
            onClick={() => setActiveTab("json")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 ${
              activeTab === "json" ? "bg-cyan-600 text-white" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Code className="w-4 h-4" /> Raw Twin JSON
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {loading || !twin ? (
            <div className="p-12 text-center text-slate-400">Loading Digital Twin State...</div>
          ) : (
            <>
              {/* Tab 1: Overview & Overrides */}
              {activeTab === "overview" && (
                <div className="space-y-6">
                  {/* Property Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-[#131c31] p-4 rounded-xl border border-[#1e2d4a]">
                    <div>
                      <p className="text-[11px] text-slate-400 font-semibold uppercase">Asset Type</p>
                      <p className="text-sm font-bold text-white">{twin.type}</p>
                    </div>
                    <div>
                      <p className="text-[11px] text-slate-400 font-semibold uppercase">Vendor</p>
                      <p className="text-sm font-bold text-white">{twin.vendor}</p>
                    </div>
                    <div>
                      <p className="text-[11px] text-slate-400 font-semibold uppercase">Model / Hardware</p>
                      <p className="text-sm font-bold text-white">{twin.model}</p>
                    </div>
                    <div>
                      <p className="text-[11px] text-slate-400 font-semibold uppercase">Firmware</p>
                      <p className="text-sm font-bold text-white">{twin.firmware}</p>
                    </div>
                  </div>

                  {/* Explainable Risk Engine Breakdown */}
                  <div className="p-4 bg-slate-900/80 rounded-xl border border-[#1e2d4a] space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-white flex items-center gap-2">
                        <Cpu className="w-4 h-4 text-cyan-400" /> Transparent Risk Engine Score
                      </h4>
                      <span className={`px-2.5 py-0.5 rounded-full font-extrabold text-xs ${
                        twin.risk_level === "CRITICAL" ? "bg-rose-950 text-rose-300 border border-rose-500" :
                        twin.risk_level === "HIGH" ? "bg-amber-950 text-amber-300 border border-amber-500" :
                        "bg-emerald-950 text-emerald-300 border border-emerald-500"
                      }`}>
                        {twin.risk_level} ({twin.risk_score} / 100)
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 bg-[#0d1424] p-3 rounded-lg border border-[#1e2d4a]">
                      <span className="font-bold text-cyan-300">Explanation: </span>
                      {twin.risk_breakdown?.summary || "Normal operational state."}
                    </p>
                  </div>

                  {/* Operational Overrides Section */}
                  <div className="p-4 bg-[#131c31] rounded-xl border border-[#1e2d4a] space-y-4">
                    <h4 className="text-xs font-bold text-white">Manual Security & Purdue Zone Overrides</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs text-slate-400 block mb-1">Purdue Model Zone</label>
                        <select
                          value={zone}
                          onChange={(e) => setZone(e.target.value)}
                          className="w-full px-3 py-2 bg-[#0d1424] border border-[#1e2d4a] rounded-xl text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                        >
                          <option value="Field (Purdue L0)">Field (Purdue L0)</option>
                          <option value="Control (Purdue L1)">Control (Purdue L1)</option>
                          <option value="Supervisory (Purdue L2)">Supervisory (Purdue L2)</option>
                          <option value="Operations (Purdue L3)">Operations (Purdue L3)</option>
                          <option value="External / DMZ">External / DMZ</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-xs text-slate-400 block mb-1">Asset Operational Criticality</label>
                        <select
                          value={criticality}
                          onChange={(e) => setCriticality(e.target.value)}
                          className="w-full px-3 py-2 bg-[#0d1424] border border-[#1e2d4a] rounded-xl text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                        >
                          <option value="LOW">LOW - Non-critical process</option>
                          <option value="MEDIUM">MEDIUM - Standard process</option>
                          <option value="HIGH">HIGH - Core Plant Controller</option>
                          <option value="CRITICAL">CRITICAL - Emergency Safety System / Main SCADA</option>
                        </select>
                      </div>
                    </div>

                    <button
                      onClick={handleSaveOverrides}
                      disabled={saving}
                      className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-all"
                    >
                      <Save className="w-4 h-4" />
                      {saving ? "Updating Twin..." : "Save Overrides"}
                    </button>
                  </div>
                </div>
              )}

              {/* Tab 2: Communications */}
              {activeTab === "communications" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-[#131c31] rounded-xl border border-[#1e2d4a] space-y-2">
                      <h4 className="text-xs font-bold text-cyan-400">Outbound Connections ({twin.communications?.outbound_connections?.length})</h4>
                      <div className="space-y-1 text-xs">
                        {twin.communications?.outbound_connections?.map((target) => (
                          <div key={target} className="p-2 bg-[#0d1424] rounded-lg border border-[#1e2d4a] font-mono text-slate-200">
                            ➔ {target}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="p-4 bg-[#131c31] rounded-xl border border-[#1e2d4a] space-y-2">
                      <h4 className="text-xs font-bold text-emerald-400">Inbound Connections ({twin.communications?.inbound_connections?.length})</h4>
                      <div className="space-y-1 text-xs">
                        {twin.communications?.inbound_connections?.map((src) => (
                          <div key={src} className="p-2 bg-[#0d1424] rounded-lg border border-[#1e2d4a] font-mono text-slate-200">
                            ⬅ {src}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 3: Vulnerabilities */}
              {activeTab === "vulnerabilities" && (
                <div className="space-y-3">
                  {twin.vulnerabilities?.length === 0 ? (
                    <div className="p-8 text-center text-slate-400">No CVE vulnerabilities matched for this asset profile.</div>
                  ) : (
                    twin.vulnerabilities?.map((v) => (
                      <div key={v.cve_id} className="p-4 bg-[#131c31] rounded-xl border border-rose-500/30 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-rose-400 font-mono">{v.cve_id}</span>
                          <div className="flex items-center gap-2 text-xs">
                            <span className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded">CVSS: {v.cvss_score}</span>
                            <span className="bg-rose-950 text-rose-300 font-bold px-2 py-0.5 rounded">
                              OT Contextual Risk: {v.contextual_risk_score}
                            </span>
                          </div>
                        </div>
                        <p className="text-xs font-semibold text-white">{v.title}</p>
                        <p className="text-xs text-slate-400 bg-[#0d1424] p-2.5 rounded-lg border border-[#1e2d4a] font-mono">
                          Remediation: {v.remediation}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* Tab 4: Raw JSON */}
              {activeTab === "json" && (
                <pre className="p-4 bg-[#080c14] rounded-xl border border-[#1e2d4a] text-xs font-mono text-emerald-400 overflow-x-auto max-h-96">
                  {JSON.stringify(twin, null, 2)}
                </pre>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
