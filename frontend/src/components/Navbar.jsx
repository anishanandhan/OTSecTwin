import React from "react";
import { Shield, Activity, Network, Box, AlertTriangle, Play, RefreshCw, Cpu } from "lucide-react";

export default function Navbar({ activeTab, setActiveTab, alertCount, onTriggerSim, onInjectAttack, onResetLab }) {
  return (
    <header className="border-b border-[#1e2d4a] bg-[#0d1424]/90 backdrop-blur-md sticky top-0 z-40 px-6 py-3.5 flex flex-wrap items-center justify-between gap-4">
      {/* Brand Logo */}
      <div className="flex items-center gap-3">
        <div className="p-2.5 bg-gradient-to-tr from-cyan-600 to-emerald-500 rounded-xl shadow-lg shadow-cyan-500/20 text-white">
          <Shield className="w-6 h-6 stroke-[2.5]" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-extrabold tracking-wide text-white bg-gradient-to-r from-cyan-400 via-teal-300 to-emerald-400 bg-clip-text text-transparent">
              OTSecTwin
            </h1>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-cyan-950/80 border border-cyan-500/30 text-cyan-300">
              v1.0 PLATFORM
            </span>
          </div>
          <p className="text-xs text-slate-400 font-medium">
            OT/ICS Passive Asset Intelligence & Behavioral Anomaly Engine
          </p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <nav className="flex items-center gap-1.5 bg-[#131c31] p-1 rounded-xl border border-[#1e2d4a]">
        <button
          onClick={() => setActiveTab("overview")}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all ${
            activeTab === "overview"
              ? "bg-cyan-600 text-white shadow-md shadow-cyan-600/30"
              : "text-slate-400 hover:text-slate-200 hover:bg-[#1a2642]"
          }`}
        >
          <Activity className="w-4 h-4" />
          Overview
        </button>

        <button
          onClick={() => setActiveTab("topology")}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all ${
            activeTab === "topology"
              ? "bg-cyan-600 text-white shadow-md shadow-cyan-600/30"
              : "text-slate-400 hover:text-slate-200 hover:bg-[#1a2642]"
          }`}
        >
          <Network className="w-4 h-4" />
          Topology Map
        </button>

        <button
          onClick={() => setActiveTab("assets")}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all ${
            activeTab === "assets"
              ? "bg-cyan-600 text-white shadow-md shadow-cyan-600/30"
              : "text-slate-400 hover:text-slate-200 hover:bg-[#1a2642]"
          }`}
        >
          <Box className="w-4 h-4" />
          Asset Twin
        </button>

        <button
          onClick={() => setActiveTab("vulnerabilities")}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all ${
            activeTab === "vulnerabilities"
              ? "bg-cyan-600 text-white shadow-md shadow-cyan-600/30"
              : "text-slate-400 hover:text-slate-200 hover:bg-[#1a2642]"
          }`}
        >
          <Shield className="w-4 h-4" />
          CVE Matrix
        </button>

        <button
          onClick={() => setActiveTab("alerts")}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all relative ${
            activeTab === "alerts"
              ? "bg-cyan-600 text-white shadow-md shadow-cyan-600/30"
              : "text-slate-400 hover:text-slate-200 hover:bg-[#1a2642]"
          }`}
        >
          <AlertTriangle className="w-4 h-4" />
          Alerts
          {alertCount > 0 && (
            <span className="ml-1 px-1.5 py-0.2 bg-rose-600 text-white text-[10px] font-bold rounded-full animate-pulse">
              {alertCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab("simulator")}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all ${
            activeTab === "simulator"
              ? "bg-cyan-600 text-white shadow-md shadow-cyan-600/30"
              : "text-slate-400 hover:text-slate-200 hover:bg-[#1a2642]"
          }`}
        >
          <Cpu className="w-4 h-4" />
          OT Lab Sim
        </button>
      </nav>

      {/* Telemetry Status Indicator & Simulation Triggers */}
      <div className="flex items-center gap-3">
        <div className="hidden lg:flex items-center gap-2 bg-[#131c31] px-3 py-1.5 rounded-lg border border-[#1e2d4a]">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shadow-sm shadow-emerald-400" />
          <span className="text-xs text-slate-300 font-medium">Telemetry Active</span>
        </div>

        <button
          onClick={onTriggerSim}
          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 shadow-md shadow-emerald-600/30 transition-all"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          Poll Modbus
        </button>

        <button
          onClick={onInjectAttack}
          className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 shadow-md shadow-rose-600/30 transition-all"
        >
          <AlertTriangle className="w-3.5 h-3.5" />
          Inject Attack
        </button>

        <button
          onClick={onResetLab}
          title="Reset OT Lab State"
          className="p-1.5 bg-[#1a2642] hover:bg-[#25375d] text-slate-300 rounded-lg border border-[#1e2d4a] transition-all"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}
