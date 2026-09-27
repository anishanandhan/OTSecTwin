import React from "react";
import { Shield, Box, AlertTriangle, Cpu, Radio, ChevronRight, Activity, Zap, CheckCircle2 } from "lucide-react";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";

export default function DashboardOverview({ assets, alerts, vulns, telemetry, onSelectAsset, onAcknowledgeAlert, setActiveTab }) {
  const criticalAssets = assets.filter((a) => a.risk_level === "CRITICAL" || a.risk_level === "HIGH");
  const newAlerts = alerts.filter((a) => a.status === "NEW");

  const riskDistribution = [
    { name: "Low", value: assets.filter((a) => a.risk_level === "LOW").length, color: "#10b981" },
    { name: "Medium", value: assets.filter((a) => a.risk_level === "MEDIUM").length, color: "#f59e0b" },
    { name: "High", value: assets.filter((a) => a.risk_level === "HIGH").length, color: "#f97316" },
    { name: "Critical", value: assets.filter((a) => a.risk_level === "CRITICAL").length, color: "#ef4444" },
  ];

  // Calculate Overall Security Posture Index (0 - 100)
  const avgRisk = assets.length > 0 ? assets.reduce((sum, a) => sum + (a.risk_score || 0), 0) / assets.length : 0;
  const postureScore = Math.max(0, Math.round(100 - avgRisk));

  const purdueLevels = [
    { level: "Purdue Level 3", name: "Operations & SCADA", zone: "Control Center (Purdue L3)", color: "border-purple-500/40 bg-purple-950/20" },
    { level: "Purdue Level 2", name: "Supervisory HMI", zone: "Supervisory (Purdue L2)", color: "border-blue-500/40 bg-blue-950/20" },
    { level: "Purdue Level 1", name: "Control (PLCs & Controllers)", zone: "Control (Purdue L1)", color: "border-cyan-500/40 bg-cyan-950/20" },
    { level: "Purdue Level 0", name: "Field Devices & I/O", zone: "Field (Purdue L0)", color: "border-emerald-500/40 bg-emerald-950/20" },
  ];

  return (
    <div className="space-y-6">
      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1: Discovered Assets */}
        <div className="glass-card p-5 relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-400">Passive Discovered Assets</p>
              <h3 className="text-3xl font-extrabold text-white mt-1">{assets.length}</h3>
              <p className="text-xs text-emerald-400 mt-1 flex items-center gap-1 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" /> 100% Fingerprinted from Telemetry
              </p>
            </div>
            <div className="p-3.5 bg-cyan-950/80 rounded-2xl border border-cyan-500/30 text-cyan-400">
              <Box className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Card 2: High & Critical Risk Assets */}
        <div className="glass-card p-5 relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-400">High/Critical Risk Assets</p>
              <h3 className="text-3xl font-extrabold text-amber-400 mt-1">{criticalAssets.length}</h3>
              <p className="text-xs text-amber-300 mt-1 font-medium">Requires Security Mitigation</p>
            </div>
            <div className="p-3.5 bg-amber-950/80 rounded-2xl border border-amber-500/30 text-amber-400">
              <AlertTriangle className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Card 3: Matched CVE Vulnerabilities */}
        <div className="glass-card p-5 relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-400">Matched ICS Vulnerabilities</p>
              <h3 className="text-3xl font-extrabold text-rose-400 mt-1">{vulns.length}</h3>
              <p className="text-xs text-rose-300 mt-1 font-medium">Correlated via CPE Specs</p>
            </div>
            <div className="p-3.5 bg-rose-950/80 rounded-2xl border border-rose-500/30 text-rose-400">
              <Shield className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Card 4: Active Behavioral Anomalies */}
        <div className="glass-card p-5 relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-400">Active Security Alerts</p>
              <h3 className="text-3xl font-extrabold text-emerald-400 mt-1">{newAlerts.length}</h3>
              <p className="text-xs text-cyan-300 mt-1 font-medium">Baseline Anomalies Tracked</p>
            </div>
            <div className="p-3.5 bg-emerald-950/80 rounded-2xl border border-emerald-500/30 text-emerald-400">
              <Activity className="w-6 h-6" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Posture Gauge & Threat Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Posture Score & Risk Breakdown */}
        <div className="glass-card p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Cpu className="w-5 h-5 text-cyan-400" /> Security Posture Score
              </h3>
              <span className="text-xs text-slate-400 font-mono">EN50127 / NIST SP 800-82</span>
            </div>

            <div className="my-6 flex flex-col items-center justify-center">
              <div className="relative w-40 h-40 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="40" stroke="#1e2d4a" strokeWidth="8" fill="transparent" />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke={postureScore > 70 ? "#10b981" : postureScore > 40 ? "#f59e0b" : "#ef4444"}
                    strokeWidth="8"
                    fill="transparent"
                    strokeDasharray={251.2}
                    strokeDashoffset={251.2 - (251.2 * postureScore) / 100}
                    strokeLinecap="round"
                    className="transition-all duration-1000 ease-out"
                  />
                </svg>
                <div className="absolute text-center">
                  <span className="text-4xl font-extrabold text-white">{postureScore}</span>
                  <p className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">/ 100 HEALTH</p>
                </div>
              </div>

              <p className="text-xs text-slate-300 font-medium text-center mt-2">
                {postureScore > 75 ? (
                  <span className="text-emerald-400 font-semibold">GOOD: Baseline operational traffic within normal bounds.</span>
                ) : postureScore > 40 ? (
                  <span className="text-amber-400 font-semibold">ATTENTION: Active CVE matches or policy alerts require review.</span>
                ) : (
                  <span className="text-rose-400 font-semibold">CRITICAL: Active unauthorized PLC write or scan activity detected!</span>
                )}
              </p>
            </div>
          </div>

          {/* Risk Level Distribution Pie */}
          <div className="pt-4 border-t border-[#1e2d4a]">
            <p className="text-xs font-semibold text-slate-400 mb-2">Asset Risk Breakdown</p>
            <div className="h-28 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={riskDistribution} dataKey="value" innerRadius={25} outerRadius={40} paddingAngle={4}>
                    {riskDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: "#131b2e", borderColor: "#1e2d4a", borderRadius: "8px" }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-slate-300 pl-2">
                {riskDistribution.map((r) => (
                  <div key={r.name} className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: r.color }} />
                    <span className="font-medium">{r.name}: {r.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Real-time Threat & Behavioral Alert Stream */}
        <div className="glass-card p-6 lg:col-span-2 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Activity className="w-5 h-5 text-rose-400" /> Behavioral Anomaly Stream
                </h3>
                <p className="text-xs text-slate-400">Live Modbus FC rules & policy violation feed</p>
              </div>
              <button
                onClick={() => setActiveTab("alerts")}
                className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1"
              >
                View All Alerts ({alerts.length}) <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 max-h-[340px] overflow-y-auto pr-1">
              {alerts.length === 0 ? (
                <div className="p-8 text-center text-slate-400 bg-[#0d1424] rounded-xl border border-[#1e2d4a]">
                  <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                  <p className="text-sm font-medium">No active security anomalies detected.</p>
                  <p className="text-xs text-slate-500 mt-1">Modbus traffic is adhering strictly to baseline policies.</p>
                </div>
              ) : (
                alerts.slice(0, 5).map((alt) => (
                  <div
                    key={alt.id}
                    className={`p-3.5 rounded-xl border flex flex-col md:flex-row md:items-center justify-between gap-3 transition-all ${
                      alt.severity === "CRITICAL"
                        ? "bg-rose-950/30 border-rose-500/40 glow-crimson"
                        : alt.severity === "HIGH"
                        ? "bg-amber-950/20 border-amber-500/40"
                        : "bg-[#0d1424] border-[#1e2d4a]"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg mt-0.5 ${
                        alt.severity === "CRITICAL" ? "bg-rose-600 text-white" : "bg-amber-600 text-white"
                      }`}>
                        <AlertTriangle className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-white">{alt.title}</span>
                          <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                            alt.severity === "CRITICAL" ? "bg-rose-900/80 text-rose-200" : "bg-amber-900/80 text-amber-200"
                          }`}>
                            {alt.severity}
                          </span>
                        </div>
                        <p className="text-xs text-slate-300 mt-1 line-clamp-2">{alt.description}</p>
                        <p className="text-[10px] text-slate-500 font-mono mt-1">
                          Source: {alt.src_ip} ➔ Target: {alt.dst_ip} | {new Date(alt.timestamp).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>

                    {alt.status === "NEW" && (
                      <button
                        onClick={() => onAcknowledgeAlert(alt.id)}
                        className="px-3 py-1 bg-cyan-950 border border-cyan-500/40 text-cyan-300 hover:bg-cyan-900 text-xs font-semibold rounded-lg self-end md:self-center transition-all"
                      >
                        Acknowledge
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Purdue Model Level Asset Matrix */}
      <div className="glass-card p-6">
        <h3 className="text-base font-bold text-white mb-1 flex items-center gap-2">
          <Zap className="w-5 h-5 text-amber-400" /> Purdue Model OT Asset Distribution Matrix
        </h3>
        <p className="text-xs text-slate-400 mb-5">
          Automatic zone categorization derived from Modbus function codes, port telemetry, and operational profiles
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {purdueLevels.map((p) => {
            const zoneAssets = assets.filter((a) => a.zone.includes(p.level) || a.zone.includes(p.zone));
            return (
              <div key={p.level} className={`p-4 rounded-xl border ${p.color} space-y-3`}>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-200">{p.level}</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-900/80 text-slate-300">
                    {zoneAssets.length} Assets
                  </span>
                </div>
                <p className="text-xs text-slate-400 font-medium">{p.name}</p>

                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {zoneAssets.map((ast) => (
                    <div
                      key={ast.id}
                      onClick={() => onSelectAsset(ast.id)}
                      className="p-2.5 bg-[#0d1424]/90 rounded-lg border border-[#1e2d4a] hover:border-cyan-500/50 cursor-pointer transition-all flex items-center justify-between"
                    >
                      <div>
                        <p className="text-xs font-bold text-slate-100">{ast.id}</p>
                        <p className="text-[10px] text-slate-400 font-mono">{ast.ip} • {ast.vendor}</p>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        ast.risk_level === "CRITICAL" ? "bg-rose-950 text-rose-300 border border-rose-500/40" :
                        ast.risk_level === "HIGH" ? "bg-amber-950 text-amber-300 border border-amber-500/40" :
                        "bg-emerald-950 text-emerald-300 border border-emerald-500/40"
                      }`}>
                        {ast.asset_type}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
