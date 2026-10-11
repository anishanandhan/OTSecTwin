import React from "react";
import { Shield, Activity, Network, Box, AlertTriangle, Play, RotateCcw, Sparkles, Sliders } from "lucide-react";

export default function Navbar({ activeTab, setActiveTab, alertCount, onTriggerSim, onInjectAttack, onResetLab, onToggleAiCopilot }) {
  const tabs = [
    { id: "overview", label: "Dashboard", icon: Activity },
    { id: "simulator", label: "Plant P&ID", icon: Sliders },
    { id: "assets", label: "Assets", icon: Box },
    { id: "topology", label: "Topology", icon: Network },
    { id: "vulnerabilities", label: "CVEs", icon: Shield },
    { id: "alerts", label: "Alerts", icon: AlertTriangle, count: alertCount },
  ];

  return (
    <header className="border-b border-white/10 bg-[#0b0f19] sticky top-0 z-40 px-4 sm:px-6 py-2.5">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        {/* Brand Identity */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center shadow-sm">
            <Shield className="w-4 h-4 stroke-[2]" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-bold tracking-tight text-white font-sans">
                OTSecTwin
              </span>
              <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-white/5 border border-white/10 text-slate-300">
                v1.2 ENTERPRISE
              </span>
            </div>
            <p className="text-[10px] text-slate-400 leading-none mt-0.5 hidden sm:block">
              Industrial Cyber-Physical Defense & Digital Twin
            </p>
          </div>
        </div>

        {/* Primary Navigation Tabs */}
        <nav className="hidden lg:flex items-center gap-0.5 bg-[#101625] p-1 rounded-lg border border-white/10 shrink-0">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-2.5 py-1.2 rounded-md text-xs font-medium flex items-center gap-1.5 transition-all ${
                  isActive
                    ? "bg-[#1d273f] text-white border border-blue-500/30 shadow-sm"
                    : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? "text-blue-400" : "text-slate-400"}`} />
                <span>{tab.label}</span>
                {tab.count > 0 && (
                  <span className="ml-0.5 px-1.5 py-0.2 bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[10px] font-mono rounded-full font-semibold">
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Action Controls & AI Trigger */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Telemetry Indicator */}
          <div className="hidden xl:flex items-center gap-1.5 bg-[#101625] px-2.5 py-1.5 rounded-md border border-white/10">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[11px] text-slate-300 font-mono">Telemetry Active</span>
          </div>

          {/* Quick Simulation Buttons */}
          <div className="flex items-center bg-[#101625] p-0.5 rounded-md border border-white/10">
            <button
              onClick={onTriggerSim}
              className="px-2 py-1 text-slate-300 hover:text-white hover:bg-white/5 rounded text-xs font-medium flex items-center gap-1 transition"
              title="Poll Modbus registers"
            >
              <Play className="w-3 h-3 text-emerald-400 fill-emerald-400" />
              <span>Poll</span>
            </button>
            <div className="w-[1px] h-3 bg-white/10 mx-0.5" />
            <button
              onClick={onInjectAttack}
              className="px-2 py-1 text-slate-300 hover:text-rose-300 hover:bg-rose-500/10 rounded text-xs font-medium flex items-center gap-1 transition"
              title="Inject unauthorized Modbus write attack"
            >
              <AlertTriangle className="w-3 h-3 text-rose-400" />
              <span>Inject</span>
            </button>
            <div className="w-[1px] h-3 bg-white/10 mx-0.5" />
            <button
              onClick={onResetLab}
              className="p-1 text-slate-400 hover:text-slate-200 hover:bg-white/5 rounded transition"
              title="Reset lab to default baseline"
            >
              <RotateCcw className="w-3 h-3" />
            </button>
          </div>

          {/* AI Copilot Trigger */}
          <button
            onClick={onToggleAiCopilot}
            className="px-2.5 py-1.5 bg-[#172138] hover:bg-[#1e2a47] text-white border border-blue-500/30 rounded-md text-xs font-medium flex items-center gap-1.5 shadow-sm transition group"
            title="Press / or click to open AI Copilot"
          >
            <Sparkles className="w-3.5 h-3.5 text-blue-400 group-hover:rotate-12 transition-transform" />
            <span className="hidden sm:inline">AI Copilot</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          </button>
        </div>
      </div>

      {/* Sub-Navigation for Medium & Mobile Screens */}
      <nav className="flex lg:hidden items-center gap-1 overflow-x-auto pt-2 border-t border-white/5 mt-2 scrollbar-none">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-2.5 py-1 rounded-md text-xs font-medium flex items-center gap-1.5 shrink-0 transition ${
                isActive
                  ? "bg-[#1d273f] text-white border border-blue-500/30"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
              {tab.count > 0 && (
                <span className="px-1 py-0.2 bg-rose-500/20 text-rose-300 text-[10px] font-mono rounded-full font-bold">
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </nav>
    </header>
  );
}
