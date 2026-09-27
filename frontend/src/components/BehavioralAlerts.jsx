import React, { useState } from "react";
import { AlertTriangle, ShieldAlert, CheckCircle2, Clock, Filter, Radio, RefreshCw } from "lucide-react";

export default function BehavioralAlerts({ alerts, onAcknowledge, onResolve, onRefresh }) {
  const [selectedSeverity, setSelectedSeverity] = useState("ALL");
  const [selectedStatus, setSelectedStatus] = useState("ALL");

  const filteredAlerts = alerts.filter((a) => {
    const matchesSev = selectedSeverity === "ALL" || a.severity === selectedSeverity;
    const matchesStat = selectedStatus === "ALL" || a.status === selectedStatus;
    return matchesSev && matchesStat;
  });

  return (
    <div className="space-y-5">
      {/* Header & Controls */}
      <div className="glass-card p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-rose-400" /> Behavioral Anomaly & Threat Detection Center
            </h2>
            <p className="text-xs text-slate-400">
              Flags Modbus policy violations, unauthorized function codes, unexpected write operations, and reconnaissance scans.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onRefresh}
              className="px-3 py-1.5 bg-[#1a2642] hover:bg-[#25375d] text-slate-200 text-xs font-semibold rounded-xl border border-[#1e2d4a] flex items-center gap-1.5 transition-all"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Refresh Alerts
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <select
              value={selectedSeverity}
              onChange={(e) => setSelectedSeverity(e.target.value)}
              className="w-full px-3 py-2 bg-[#0d1424] border border-[#1e2d4a] rounded-xl text-xs text-slate-200 focus:outline-none focus:border-rose-500"
            >
              <option value="ALL">All Severity Levels</option>
              <option value="CRITICAL">CRITICAL (Unauthorized PLC Writes)</option>
              <option value="HIGH">HIGH (Policy Violations)</option>
              <option value="MEDIUM">MEDIUM (New Communication Pairs)</option>
              <option value="LOW">LOW (Informational)</option>
            </select>
          </div>

          <div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 bg-[#0d1424] border border-[#1e2d4a] rounded-xl text-xs text-slate-200 focus:outline-none focus:border-rose-500"
            >
              <option value="ALL">All Alert Statuses</option>
              <option value="NEW">NEW - Action Required</option>
              <option value="ACKNOWLEDGED">ACKNOWLEDGED</option>
              <option value="RESOLVED">RESOLVED</option>
            </select>
          </div>
        </div>
      </div>

      {/* Alert Feed List */}
      <div className="space-y-3">
        {filteredAlerts.length === 0 ? (
          <div className="glass-card p-12 text-center text-slate-400 space-y-2">
            <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
            <p className="text-base font-bold text-white">No active security anomalies found.</p>
            <p className="text-xs text-slate-500">All OT network traffic complies with defined baseline rules.</p>
          </div>
        ) : (
          filteredAlerts.map((alt) => (
            <div
              key={alt.id}
              className={`glass-card p-5 border flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all ${
                alt.severity === "CRITICAL"
                  ? "border-rose-500/50 bg-rose-950/20 glow-crimson"
                  : alt.severity === "HIGH"
                  ? "border-amber-500/50 bg-amber-950/15"
                  : "border-[#1e2d4a]"
              }`}
            >
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-xl mt-1 ${
                  alt.severity === "CRITICAL" ? "bg-rose-600 text-white shadow-lg shadow-rose-600/40" : "bg-amber-600 text-white"
                }`}>
                  <AlertTriangle className="w-6 h-6" />
                </div>

                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-bold text-white">{alt.title}</span>
                    <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full ${
                      alt.severity === "CRITICAL" ? "bg-rose-900 text-rose-200" : "bg-amber-900 text-amber-200"
                    }`}>
                      {alt.severity}
                    </span>
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300">
                      {alt.category}
                    </span>
                  </div>

                  <p className="text-xs text-slate-200">{alt.description}</p>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] font-mono text-slate-400 pt-1">
                    <span>Source: <strong className="text-cyan-300">{alt.src_ip}</strong></span>
                    <span>Target: <strong className="text-cyan-300">{alt.dst_ip}</strong> ({alt.asset_id})</span>
                    <span>Time: {new Date(alt.timestamp).toLocaleString()}</span>
                  </div>

                  {alt.raw_payload && (
                    <div className="mt-2 p-2 bg-[#080c14] rounded-lg border border-[#1e2d4a] text-[11px] font-mono text-amber-300">
                      Payload Specs: {JSON.stringify(alt.raw_payload)}
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex md:flex-col items-center gap-2 self-end md:self-center">
                {alt.status === "NEW" && (
                  <button
                    onClick={() => onAcknowledge(alt.id)}
                    className="px-3.5 py-1.5 bg-cyan-950 hover:bg-cyan-900 border border-cyan-500/40 text-cyan-300 text-xs font-semibold rounded-xl transition-all"
                  >
                    Acknowledge
                  </button>
                )}

                {alt.status !== "RESOLVED" && (
                  <button
                    onClick={() => onResolve(alt.id)}
                    className="px-3.5 py-1.5 bg-emerald-950 hover:bg-emerald-900 border border-emerald-500/40 text-emerald-300 text-xs font-semibold rounded-xl transition-all"
                  >
                    Mark Resolved
                  </button>
                )}

                {alt.status === "RESOLVED" && (
                  <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Resolved
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
