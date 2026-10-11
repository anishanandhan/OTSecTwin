import React, { useState } from "react";
import { Box, Search, Filter, ShieldAlert, Cpu, Eye, CheckCircle2, ChevronRight, Activity, Zap, ShieldCheck, AlertTriangle, RefreshCw } from "lucide-react";
import { probeAsset } from "../services/api";

export default function AssetInventory({ assets = [], onSelectAsset, onRefresh }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedZone, setSelectedZone] = useState("ALL");
  const [selectedType, setSelectedType] = useState("ALL");
  const [probingId, setProbingId] = useState(null);

  const handleSafeProbe = async (assetId) => {
    setProbingId(assetId);
    try {
      await probeAsset(assetId);
      if (onRefresh) {
        await onRefresh();
      }
    } catch (err) {
      alert(`Probe failed: ${err.message}`);
    } finally {
      setProbingId(null);
    }
  };

  const avgAccuracy = assets.length
    ? Math.round(assets.reduce((acc, a) => acc + (a.confidence_score || 90), 0) / assets.length)
    : 95;

  const driftedCount = assets.filter((a) => a.drift_detected).length;

  const filteredAssets = assets.filter((ast) => {
    const matchesSearch =
      ast.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ast.ip.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (ast.vendor && ast.vendor.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (ast.model && ast.model.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesZone = selectedZone === "ALL" || (ast.zone && ast.zone.includes(selectedZone));
    const matchesType = selectedType === "ALL" || ast.asset_type === selectedType;

    return matchesSearch && matchesZone && matchesType;
  });

  return (
    <div className="space-y-5 font-sans">
      {/* Header & Accuracy Stats */}
      <div className="enterprise-card p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Box className="w-4 h-4 text-blue-400" />
              High-Fidelity OT Asset Intelligence Engine
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Multi-signal passive fingerprinting (Layer 2 MAC OUI + Layer 4 TCP/RTOS stack + Layer 7 Modbus DPI) & physical rack chassis profiling
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <span className="status-pill status-pill-emerald font-mono">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              {avgAccuracy}% Average Accuracy Confidence
            </span>

            {driftedCount > 0 ? (
              <span className="status-pill status-pill-rose font-mono">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
                {driftedCount} Configuration Drift Flagged
              </span>
            ) : (
              <span className="status-pill status-pill-blue font-mono">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />
                Cryptographic Baselines In Sync
              </span>
            )}
          </div>
        </div>

        {/* Search Bar & Dropdown Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="relative md:col-span-2">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by Asset ID, IP Address, Vendor, or Model..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 bg-[#121828] border border-white/10 rounded-md text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition font-sans"
            />
          </div>

          <div>
            <select
              value={selectedZone}
              onChange={(e) => setSelectedZone(e.target.value)}
              className="w-full px-3 py-2 bg-[#121828] border border-white/10 rounded-md text-xs text-slate-200 focus:outline-none focus:border-blue-500 transition"
            >
              <option value="ALL">All Purdue Zones</option>
              <option value="Purdue L0">Level 0 - Field Devices</option>
              <option value="Purdue L1">Level 1 - Basic Control</option>
              <option value="Purdue L2">Level 2 - Supervisory</option>
              <option value="Purdue L3">Level 3 - Operations</option>
              <option value="External">External / DMZ</option>
            </select>
          </div>

          <div>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full px-3 py-2 bg-[#121828] border border-white/10 rounded-md text-xs text-slate-200 focus:outline-none focus:border-blue-500 transition"
            >
              <option value="ALL">All Asset Types</option>
              <option value="PLC">Programmable Logic Controller (PLC)</option>
              <option value="HMI">Human Machine Interface (HMI)</option>
              <option value="SCADA">SCADA Master Gateway</option>
              <option value="RTU">Remote Terminal Unit (RTU)</option>
              <option value="EWS">Engineering Workstation (EWS)</option>
              <option value="Historian">Process Historian</option>
              <option value="Attacker Host">External / Rogue Host</option>
            </select>
          </div>
        </div>
      </div>

      {/* Asset Data Table */}
      <div className="enterprise-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-[#0b0f19] border-b border-white/10 text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">Asset ID / Hostname</th>
                <th className="py-3 px-4">IP & MAC Address</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Hardware & Firmware</th>
                <th className="py-3 px-4">Purdue Zone</th>
                <th className="py-3 px-4">Accuracy / Evidence</th>
                <th className="py-3 px-4">Risk Profile</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredAssets.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-8 text-center text-slate-400">
                    No industrial assets match current filters.
                  </td>
                </tr>
              ) : (
                filteredAssets.map((ast) => (
                  <tr key={ast.id} className="hover:bg-[#151c2d] transition-colors">
                    <td className="py-3 px-4 font-semibold text-white">
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full shrink-0 ${
                          ast.status === "ONLINE" ? "bg-emerald-400" : "bg-rose-500"
                        }`} />
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono text-slate-100">{ast.id}</span>
                            {ast.drift_detected && (
                              <span className="status-pill status-pill-rose font-mono text-[9px] py-0 px-1.5">
                                DRIFT
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-slate-400 font-normal">{ast.hostname || "unnamed"}</span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4 font-mono text-xs">
                      <div className="text-blue-300 font-medium">{ast.ip}</div>
                      <div className="text-[10px] text-slate-400">{ast.mac || "Unknown MAC"}</div>
                    </td>

                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 font-medium text-slate-200">
                        {ast.asset_type}
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-medium text-slate-200">{ast.vendor}</div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        {ast.model} • <span className="text-slate-300">{ast.firmware}</span>
                      </div>
                    </td>

                    <td className="py-3 px-4 text-slate-300">
                      <span className="text-[11px] font-mono text-slate-400">{ast.zone}</span>
                    </td>

                    {/* Accuracy Confidence & Fingerprint Method */}
                    <td className="py-3 px-4">
                      <div className="space-y-1">
                        <span className={`status-pill font-mono ${
                          (ast.confidence_score || 90) >= 98
                            ? "status-pill-emerald"
                            : "status-pill-blue"
                        }`}>
                          {ast.confidence_score || 95}% Accuracy
                        </span>
                        <p className="text-[10px] text-slate-400 font-mono truncate max-w-[150px]" title={ast.fingerprint_method}>
                          {ast.fingerprint_method || "DPI Verified"}
                        </p>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <span className={`status-pill font-mono ${
                        ast.risk_level === "CRITICAL" ? "status-pill-rose" :
                        ast.risk_level === "HIGH" ? "status-pill-amber" :
                        ast.risk_level === "MEDIUM" ? "status-pill-amber" :
                        "status-pill-emerald"
                      }`}>
                        {ast.risk_level} ({ast.risk_score})
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleSafeProbe(ast.id)}
                          disabled={probingId === ast.id}
                          title="Execute safe protocol-native FC43 probe"
                          className="px-2.5 py-1 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 hover:text-white text-xs font-medium rounded transition disabled:opacity-50 inline-flex items-center gap-1"
                        >
                          <Zap className={`w-3 h-3 text-emerald-400 ${probingId === ast.id ? "animate-spin text-amber-300" : ""}`} />
                          <span>{probingId === ast.id ? "Probing..." : "Probe"}</span>
                        </button>

                        <button
                          onClick={() => onSelectAsset(ast.id)}
                          className="px-2.5 py-1 bg-blue-600/10 hover:bg-blue-600/20 border border-blue-500/30 text-blue-300 text-xs font-medium rounded transition inline-flex items-center gap-1"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Twin</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
