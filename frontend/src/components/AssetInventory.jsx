import React, { useState } from "react";
import { Box, Search, Filter, ShieldAlert, Cpu, Eye, CheckCircle2, ChevronRight, Activity } from "lucide-react";

export default function AssetInventory({ assets, onSelectAsset }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedZone, setSelectedZone] = useState("ALL");
  const [selectedType, setSelectedType] = useState("ALL");

  const filteredAssets = assets.filter((ast) => {
    const matchesSearch =
      ast.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ast.ip.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ast.vendor.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ast.model.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesZone = selectedZone === "ALL" || ast.zone.includes(selectedZone);
    const matchesType = selectedType === "ALL" || ast.asset_type === selectedType;

    return matchesSearch && matchesZone && matchesType;
  });

  return (
    <div className="space-y-5">
      {/* Header & Filters */}
      <div className="glass-card p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Box className="w-5 h-5 text-cyan-400" /> Passive Discovered Asset Intelligence Inventory
            </h2>
            <p className="text-xs text-slate-400">
              Derived automatically from Modbus/TCP frames & packet header inspection. No manual entry required.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-cyan-950/60 border border-cyan-500/30 px-3 py-1.5 rounded-xl text-xs text-cyan-300 font-semibold">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{assets.length} Discovered Digital Twins Active</span>
          </div>
        </div>

        {/* Search Bar & Dropdown Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="relative md:col-span-2">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search by Asset ID, IP Address, Vendor, or Model..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-[#0d1424] border border-[#1e2d4a] rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <select
              value={selectedZone}
              onChange={(e) => setSelectedZone(e.target.value)}
              className="w-full px-3 py-2 bg-[#0d1424] border border-[#1e2d4a] rounded-xl text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
            >
              <option value="ALL">All Purdue Model Zones</option>
              <option value="Purdue L0">Level 0 - Field Devices</option>
              <option value="Purdue L1">Level 1 - Direct Control</option>
              <option value="Purdue L2">Level 2 - Supervisory</option>
              <option value="Purdue L3">Level 3 - Operations</option>
              <option value="External">External / DMZ</option>
            </select>
          </div>

          <div>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full px-3 py-2 bg-[#0d1424] border border-[#1e2d4a] rounded-xl text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
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
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-[#0d1424] border-b border-[#1e2d4a] text-slate-400 font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Asset ID / Hostname</th>
                <th className="py-3.5 px-4">IP Address</th>
                <th className="py-3.5 px-4">Asset Type</th>
                <th className="py-3.5 px-4">Vendor & Model</th>
                <th className="py-3.5 px-4">Purdue Zone</th>
                <th className="py-3.5 px-4">Protocols & Ports</th>
                <th className="py-3.5 px-4">Risk Level</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e2d4a]">
              {filteredAssets.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-8 text-center text-slate-500">
                    No assets matching current search criteria.
                  </td>
                </tr>
              ) : (
                filteredAssets.map((ast) => (
                  <tr key={ast.id} className="hover:bg-[#152037] transition-colors group">
                    <td className="py-3.5 px-4 font-bold text-white flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${
                        ast.status === "ONLINE" ? "bg-emerald-400 animate-pulse" : "bg-rose-500"
                      }`} />
                      <div>
                        <p>{ast.id}</p>
                        <p className="text-[10px] text-slate-400 font-normal">{ast.hostname || "unnamed"}</p>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-mono text-cyan-300 font-semibold">{ast.ip}</td>

                    <td className="py-3.5 px-4">
                      <span className="px-2 py-1 rounded bg-[#0d1424] border border-[#1e2d4a] font-semibold text-slate-200">
                        {ast.asset_type}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <p className="font-semibold text-slate-200">{ast.vendor}</p>
                      <p className="text-[10px] text-slate-400">{ast.model} ({ast.firmware})</p>
                    </td>

                    <td className="py-3.5 px-4 text-slate-300 font-medium">{ast.zone}</td>

                    <td className="py-3.5 px-4">
                      <div className="flex flex-wrap gap-1">
                        {(ast.protocols || ["Modbus/TCP"]).map((p) => (
                          <span key={p} className="px-1.5 py-0.5 rounded bg-cyan-950/80 border border-cyan-500/30 text-cyan-300 text-[10px] font-mono">
                            {p}
                          </span>
                        ))}
                        {(ast.open_ports || [502]).map((port) => (
                          <span key={port} className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-300 text-[10px] font-mono">
                            :{port}
                          </span>
                        ))}
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <span className={`px-2.5 py-0.5 rounded-full font-extrabold text-[10px] ${
                          ast.risk_level === "CRITICAL" ? "bg-rose-950 text-rose-300 border border-rose-500/40" :
                          ast.risk_level === "HIGH" ? "bg-amber-950 text-amber-300 border border-amber-500/40" :
                          ast.risk_level === "MEDIUM" ? "bg-yellow-950 text-yellow-300 border border-yellow-500/40" :
                          "bg-emerald-950 text-emerald-300 border border-emerald-500/40"
                        }`}>
                          {ast.risk_level} ({ast.risk_score})
                        </span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => onSelectAsset(ast.id)}
                        className="px-3 py-1 bg-cyan-950 hover:bg-cyan-900 border border-cyan-500/40 text-cyan-300 text-xs font-semibold rounded-lg inline-flex items-center gap-1 transition-all"
                      >
                        <Eye className="w-3.5 h-3.5" /> Digital Twin
                      </button>
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
