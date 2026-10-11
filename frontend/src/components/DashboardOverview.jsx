import React from "react";
import { 
  Shield, Box, AlertTriangle, Cpu, ChevronRight, Activity, Zap, CheckCircle2, 
  ArrowUpRight, Clock, Radio, Sliders, ArrowRight, Award, BookOpen, Layers, 
  ExternalLink, Lock, AlertCircle, FileText
} from "lucide-react";

export default function DashboardOverview({ 
  assets = [], 
  alerts = [], 
  vulns = [], 
  telemetry, 
  onSelectAsset, 
  onAcknowledgeAlert, 
  setActiveTab,
  onOpenDossier 
}) {
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
    { level: "Purdue Level 3", name: "Operations & SCADA", zone: "Control Center (Purdue L3)", color: "border-purple-500/20 bg-purple-500/5 text-purple-400" },
    { level: "Purdue Level 2", name: "Supervisory HMI", zone: "Supervisory (Purdue L2)", color: "border-blue-500/20 bg-blue-500/5 text-blue-400" },
    { level: "Purdue Level 1", name: "Basic Control (PLCs)", zone: "Control (Purdue L1)", color: "border-cyan-500/20 bg-cyan-500/5 text-cyan-400" },
    { level: "Purdue Level 0", name: "Field Devices & I/O", zone: "Field (Purdue L0)", color: "border-emerald-500/20 bg-emerald-500/5 text-emerald-400" },
  ];

  return (
    <div className="space-y-6 font-sans">
      {/* ━━ HERO SECTION (LAYER 2 COPY & LAYER 3 TRUST SIGNALS) ━━ */}
      <section className="enterprise-card p-6 md:p-8 bg-gradient-to-b from-[#101728] to-[#0c121e] border border-blue-500/20 relative overflow-hidden">
        <div className="relative z-10 max-w-4xl space-y-4">
          {/* Above the Fold Trust Signals */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-500/10 border border-blue-500/30 text-blue-300 font-medium">
              <Shield className="w-3.5 h-3.5 text-blue-400" />
              <span>Passive Deep Packet Inspection</span>
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Purdue ISA-95 Demarcation</span>
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-purple-500/10 border border-purple-500/30 text-purple-300 font-medium">
              <Zap className="w-3.5 h-3.5 text-purple-400" />
              <span>IEC 62443 / NIST SP 800-82r3</span>
            </span>
            <span className="text-[11px] font-mono text-slate-400">
              Live Baseline Active
            </span>
          </div>

          {/* Hero Headline: Maximum 8 words. Bold claim that earns attention */}
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white leading-tight">
            Stop Cyber-Physical Attacks Before Destruction Occurs.
          </h1>

          {/* Subheadline: Exactly 18 words, concrete details */}
          <p className="text-sm sm:text-base text-slate-300 max-w-3xl leading-relaxed">
            Passively fingerprints Level 0-3 Purdue OT devices, mathematically validates Modbus telemetry, and isolates cyber-physical threats in milliseconds.
          </p>

          {/* CTA Action Buttons */}
          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              onClick={() => setActiveTab("simulator")}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-md text-xs font-semibold flex items-center gap-2 shadow-lg shadow-blue-600/20 transition"
            >
              <Sliders className="w-4 h-4" />
              <span>Inspect Live Plant Telemetry</span>
            </button>

            <button
              onClick={() => setActiveTab("assets")}
              className="px-4 py-2 bg-[#172138] hover:bg-[#1e2a47] text-slate-200 border border-white/10 rounded-md text-xs font-semibold flex items-center gap-2 transition"
            >
              <Box className="w-4 h-4 text-blue-400" />
              <span>Audit Asset Inventory</span>
            </button>
          </div>
        </div>
      </section>

      {/* ━━ INLINE OBJECTION HANDLING (LAYER 3) ━━ */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Objection 1 */}
        <div className="enterprise-card p-4 border border-white/10 bg-[#0e1424] space-y-1.5">
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400">
            <Shield className="w-4 h-4" />
            <span>Zero Intrusive Probing</span>
          </div>
          <h4 className="text-xs font-bold text-white">Will scanning crash fragile legacy PLCs?</h4>
          <p className="text-[11px] text-slate-400 leading-normal">
            Never sends active Nmap sweeps. Operates 100% passively on SPAN mirror traffic, preventing CPU faults on legacy Schneider and Siemens controllers.
          </p>
        </div>

        {/* Objection 2 */}
        <div className="enterprise-card p-4 border border-white/10 bg-[#0e1424] space-y-1.5">
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-400">
            <Sliders className="w-4 h-4" />
            <span>Physics-Coupled Digital Twin</span>
          </div>
          <h4 className="text-xs font-bold text-white">Does it detect silent physical sabotage?</h4>
          <p className="text-[11px] text-slate-400 leading-normal">
            Coupled ODE models track hydraulic and chemical state divergence, exposing Stuxnet valve overfills and Oldsmar pH poisoning before plant alarms ring.
          </p>
        </div>

        {/* Objection 3 */}
        <div className="enterprise-card p-4 border border-white/10 bg-[#0e1424] space-y-1.5">
          <div className="flex items-center gap-2 text-xs font-semibold text-purple-400">
            <Award className="w-4 h-4" />
            <span>IEC 62443 & NIST SP 800-82r3</span>
          </div>
          <h4 className="text-xs font-bold text-white">How does it fit compliance standards?</h4>
          <p className="text-[11px] text-slate-400 leading-normal">
            Maps telemetry directly to Purdue ISA-95 zone boundaries and IEC 62443 security levels, providing continuous audit evidence for critical infrastructure audits.
          </p>
        </div>
      </section>

      {/* ━━ TOP ENTERPRISE KPI METRIC CARDS ━━ */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1 */}
        <div className="enterprise-card p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium uppercase tracking-wider text-slate-400">Inventoriable Assets</span>
            <span className="status-pill status-pill-blue">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
              100% Active
            </span>
          </div>
          <div className="mt-2.5">
            <div className="text-2xl font-bold tracking-tight text-white font-mono">{assets.length}</div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Passively fingerprinted from Modbus telemetry
            </p>
          </div>
        </div>

        {/* KPI 2 */}
        <div className="enterprise-card p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium uppercase tracking-wider text-slate-400">Critical / High Risk</span>
            <span className={`status-pill ${criticalAssets.length > 0 ? "status-pill-amber" : "status-pill-emerald"}`}>
              {criticalAssets.length > 0 ? "Mitigation Needed" : "Nominal"}
            </span>
          </div>
          <div className="mt-2.5">
            <div className="text-2xl font-bold tracking-tight text-amber-400 font-mono">{criticalAssets.length}</div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Controllers with anomalous writes or high exposure
            </p>
          </div>
        </div>

        {/* KPI 3 */}
        <div className="enterprise-card p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium uppercase tracking-wider text-slate-400">Matched CVEs</span>
            <span className="status-pill status-pill-rose">NVD / NIST</span>
          </div>
          <div className="mt-2.5">
            <div className="text-2xl font-bold tracking-tight text-rose-400 font-mono">{vulns.length}</div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Correlated via CPE specifications & firmware
            </p>
          </div>
        </div>

        {/* KPI 4 */}
        <div className="enterprise-card p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium uppercase tracking-wider text-slate-400">Active Security Alerts</span>
            <span className="status-pill status-pill-rose">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse" />
              Real-time
            </span>
          </div>
          <div className="mt-2.5">
            <div className="text-2xl font-bold tracking-tight text-white font-mono">{newAlerts.length}</div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Behavioral baseline rule violations detected
            </p>
          </div>
        </div>
      </section>

      {/* ━━ MAIN GRID: SECURITY POSTURE & ALERT QUEUE ━━ */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Security Posture Index */}
        <div className="enterprise-card p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <div>
                <h3 className="text-sm font-semibold text-slate-100">
                  Security Posture Index
                </h3>
                <p className="text-[11px] text-slate-400 font-mono">
                  IEC 62443 • NIST SP 800-82r3
                </p>
              </div>
              <span className={`status-pill ${postureScore > 75 ? "status-pill-emerald" : postureScore > 45 ? "status-pill-amber" : "status-pill-rose"}`}>
                Score: {postureScore}/100
              </span>
            </div>

            {/* Circular Gauge */}
            <div className="my-5 flex flex-col items-center justify-center">
              <div className="relative w-36 h-36 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="38" stroke="rgba(255,255,255,0.06)" strokeWidth="7" fill="transparent" />
                  <circle
                    cx="50"
                    cy="50"
                    r="38"
                    stroke={postureScore > 75 ? "#10b981" : postureScore > 45 ? "#f59e0b" : "#f43f5e"}
                    strokeWidth="7"
                    fill="transparent"
                    strokeDasharray={238.76}
                    strokeDashoffset={238.76 - (238.76 * postureScore) / 100}
                    strokeLinecap="round"
                    className="transition-all duration-1000 ease-out"
                  />
                </svg>
                <div className="absolute text-center">
                  <span className="text-3xl font-bold text-white font-mono">{postureScore}</span>
                  <p className="text-[10px] text-slate-400 uppercase tracking-widest font-mono">Health</p>
                </div>
              </div>

              <p className="text-xs text-center mt-1 text-slate-300">
                {postureScore > 75 ? (
                  <span className="text-emerald-400 font-medium">Plant operations within authorized behavioral envelope.</span>
                ) : postureScore > 45 ? (
                  <span className="text-amber-400 font-medium">Caution: Active policy deviations requiring triage.</span>
                ) : (
                  <span className="text-rose-400 font-medium">Critical: Rogue write attempts or unauthorized device active!</span>
                )}
              </p>
            </div>
          </div>

          {/* Risk Level Distribution Breakdown */}
          <div className="pt-3 border-t border-white/5">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Asset Criticality Breakdown
            </span>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {riskDistribution.map((r) => (
                <div key={r.name} className="flex items-center justify-between bg-black/20 px-2.5 py-1.5 rounded border border-white/5">
                  <span className="text-xs text-slate-300 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: r.color }} />
                    {r.name}
                  </span>
                  <span className="text-xs font-mono font-semibold text-slate-100">{r.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Real-time Threat & Behavioral Alert Queue */}
        <div className="enterprise-card p-5 lg:col-span-2 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-white/5 pb-3 mb-4">
              <div>
                <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-blue-400" />
                  Real-Time Behavioral Anomaly Stream
                </h3>
                <p className="text-[11px] text-slate-400">
                  Continuous Modbus Function Code & Purdue Policy Enforcement
                </p>
              </div>
              <button
                onClick={() => setActiveTab("alerts")}
                className="text-xs text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1 transition"
              >
                <span>View Full Log ({alerts.length})</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-2.5 max-h-[320px] overflow-y-auto pr-1">
              {alerts.length === 0 ? (
                <div className="p-8 text-center bg-black/20 rounded-lg border border-white/5">
                  <CheckCircle2 className="w-7 h-7 text-emerald-400 mx-auto mb-2" />
                  <p className="text-xs font-medium text-slate-200">No active behavioral anomalies detected.</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">All Modbus/TCP transactions comply with verified baseline policies.</p>
                </div>
              ) : (
                alerts.slice(0, 5).map((alt) => (
                  <div
                    key={alt.id}
                    className="p-3 bg-[#131929] hover:bg-[#182033] rounded-lg border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition"
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="mt-0.5">
                        <span
                          className={`status-pill ${
                            alt.severity === "CRITICAL"
                              ? "status-pill-rose font-mono"
                              : alt.severity === "HIGH"
                              ? "status-pill-amber font-mono"
                              : "status-pill-blue font-mono"
                          }`}
                        >
                          {alt.severity}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-xs font-semibold text-slate-100 truncate">
                          {alt.title}
                        </h4>
                        <p className="text-[11px] text-slate-400 truncate mt-0.5">
                          {alt.description}
                        </p>
                        <div className="flex items-center gap-2 mt-1.5 text-[10px] text-slate-400 font-mono">
                          <span className="text-blue-300">{alt.src_ip}</span>
                          <span>➔</span>
                          <span className="text-slate-200">{alt.dst_ip}</span>
                          <span>•</span>
                          <span className="text-slate-400">{new Date(alt.timestamp).toLocaleTimeString()} UTC</span>
                        </div>
                      </div>
                    </div>

                    {alt.status === "NEW" && (
                      <button
                        onClick={() => onAcknowledgeAlert(alt.id)}
                        className="px-2.5 py-1 bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 text-xs font-medium rounded transition shrink-0 self-start sm:self-center"
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
      </section>

      {/* ━━ PURDUE MODEL ZONE DISTRIBUTION MATRIX ━━ */}
      <section className="enterprise-card p-5">
        <div className="border-b border-white/5 pb-3 mb-4">
          <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
            <Zap className="w-4 h-4 text-blue-400" />
            Purdue Model OT Zone Distribution
          </h3>
          <p className="text-[11px] text-slate-400">
            Categorization derived from protocol DPI, network boundaries, and operational function codes
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {purdueLevels.map((p) => {
            const zoneAssets = assets.filter((a) => a.zone.includes(p.level) || a.zone.includes(p.zone));
            return (
              <div
                key={p.level}
                className="p-3.5 bg-[#131929] rounded-lg border border-white/5 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-200">{p.level}</span>
                    <span className="text-xs font-mono font-bold text-white px-2 py-0.5 rounded bg-white/5">
                      {zoneAssets.length}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">{p.name}</p>
                </div>

                <div className="mt-3 pt-2 border-t border-white/5 flex flex-wrap gap-1">
                  {zoneAssets.slice(0, 3).map((a) => (
                    <button
                      key={a.id}
                      onClick={() => onSelectAsset(a.id)}
                      className="text-[10px] font-mono bg-white/5 hover:bg-white/10 text-slate-300 px-1.5 py-0.5 rounded transition"
                      title={`${a.hostname} (${a.ip})`}
                    >
                      {a.id}
                    </button>
                  ))}
                  {zoneAssets.length > 3 && (
                    <span className="text-[10px] text-slate-400 font-mono self-center">
                      +{zoneAssets.length - 3} more
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
