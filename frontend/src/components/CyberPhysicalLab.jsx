import React, { useState, useEffect } from "react";
import { 
  Cpu, Play, AlertTriangle, RotateCcw, Shield, Activity, 
  ExternalLink, Droplets, Gauge, Zap, CheckCircle2, Sliders, ArrowRight
} from "lucide-react";
import { fetchPlantState, updatePlantControl, triggerSimulation, resetLab } from "../services/api";

export default function CyberPhysicalLab({ onAnomalyDetected }) {
  const [plant, setPlant] = useState({
    tank_level: 68.5,
    target_level: 70.0,
    inlet_flow: 45.2,
    pump_rpm: 1450,
    pump_status: "RUNNING",
    inflow_valve: "OPEN",
    relief_valve: "CLOSED",
    chemical_ph: 7.2,
    pressure_bar: 2.8,
    alarm_state: "NOMINAL",
    active_scenario: "NORMAL",
    modbus_registers: {
      40001: 69,
      40002: 452,
      40003: 28,
      40004: 1,
      40005: 72,
      40006: 0
    }
  });

  const [loading, setLoading] = useState(false);
  const [attackLoading, setAttackLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("pid"); // "pid" or "registers"

  // Poll plant state continuously every 1.5 seconds for real-time physics feel
  useEffect(() => {
    let isMounted = true;
    const poll = async () => {
      try {
        const state = await fetchPlantState();
        if (isMounted) setPlant(state);
      } catch (err) {
        // Silently handle if polling fails
      }
    };

    poll();
    const interval = setInterval(poll, 1500);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const handleTogglePump = async () => {
    const nextStatus = plant.pump_status === "RUNNING" ? "STOPPED" : "RUNNING";
    try {
      const updated = await updatePlantControl({ pump_status: nextStatus });
      setPlant(updated);
    } catch (err) {
      alert(`Control failed: ${err.message}`);
    }
  };

  const handleToggleValve = async () => {
    const nextValve = plant.inflow_valve === "OPEN" ? "CLOSED" : "OPEN";
    try {
      const updated = await updatePlantControl({ inflow_valve: nextValve });
      setPlant(updated);
    } catch (err) {
      alert(`Control failed: ${err.message}`);
    }
  };

  const handleToggleRelief = async () => {
    const nextRelief = plant.relief_valve === "OPEN" ? "CLOSED" : "OPEN";
    try {
      const updated = await updatePlantControl({ relief_valve: nextRelief });
      setPlant(updated);
    } catch (err) {
      alert(`Control failed: ${err.message}`);
    }
  };

  const handleRunAttack = async (scenarioType) => {
    setAttackLoading(true);
    try {
      const res = await triggerSimulation(scenarioType, "192.168.10.10", 8);
      if (res.plant_state) setPlant(res.plant_state);
      if (onAnomalyDetected) onAnomalyDetected();
    } catch (err) {
      alert(`Attack trigger failed: ${err.message}`);
    } finally {
      setAttackLoading(false);
    }
  };

  const handleReset = async () => {
    setLoading(true);
    try {
      await resetLab();
      const state = await fetchPlantState();
      setPlant(state);
      if (onAnomalyDetected) onAnomalyDetected();
    } catch (err) {
      alert(`Reset failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const isOverfill = plant.tank_level > 90 || plant.alarm_state.includes("OVERFLOW");
  const isOverpressure = plant.pressure_bar > 5.0 || plant.alarm_state.includes("OVERPRESSURE");
  const isAcidic = plant.chemical_ph < 5.5;

  return (
    <div className="space-y-6 font-sans">
      {/* Top Banner: LabShock Physical Process Testbed Info */}
      <div className="enterprise-card p-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <h2 className="text-base font-bold text-white tracking-tight">
                LabShock Cyber-Physical Range: Water Treatment & Chemical Dosing Facility
              </h2>
              <span className="status-pill status-pill-blue font-mono text-[10px]">
                Modbus L1/L2 Physics Engine
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Real-time fluid dynamics and chemical neutralization loop bound to virtual PLC-001 (`192.168.10.10`) and PLC-002 (`192.168.10.12`).
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <a
              href="http://localhost:1881"
              target="_blank"
              rel="noreferrer"
              className="px-3 py-1.5 bg-[#172138] hover:bg-[#1e2a47] text-blue-300 border border-blue-500/30 rounded-md text-xs font-medium flex items-center gap-1.5 transition"
              title="Open FUXA Web SCADA Operator HMI"
            >
              <span>FUXA Web SCADA</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>

            <button
              onClick={handleReset}
              disabled={loading}
              className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 rounded-md text-xs font-medium flex items-center gap-1.5 transition"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              <span>Reset Plant Baseline</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Interactive P&ID Schematic + Red Team Attack Launcher */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column (2 Cols): Live Animated Industrial P&ID Schematic */}
        <div className="enterprise-card p-5 lg:col-span-2 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-white/5 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-blue-400" />
                <h3 className="text-sm font-semibold text-slate-100">
                  Process Instrumentation Diagram (P&ID)
                </h3>
              </div>
              <div className="flex items-center gap-2">
                {plant.alarm_state !== "NOMINAL" ? (
                  <span className="status-pill status-pill-rose font-mono animate-pulse">
                    <AlertTriangle className="w-3 h-3 text-rose-400" />
                    {plant.alarm_state}
                  </span>
                ) : (
                  <span className="status-pill status-pill-emerald font-mono">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    Process Nominal
                  </span>
                )}
              </div>
            </div>

            {/* Visual Process Schematic Display */}
            <div className="relative bg-[#080d17] border border-white/10 rounded-xl p-5 overflow-hidden min-h-[380px] flex flex-col justify-between">
              
              {/* Process Top Row: Inflow line + Tanks */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                
                {/* 1. Main Water Tank (T-101) */}
                <div className="flex flex-col items-center">
                  <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-1">
                    Tank T-101 (Primary Storage)
                  </span>

                  {/* Cylindrical Tank Vessel */}
                  <div className="relative w-36 h-48 border-2 border-slate-600 rounded-b-2xl rounded-t-sm bg-[#0d1424] overflow-hidden shadow-inner flex flex-col justify-end">
                    
                    {/* Measurement Scale */}
                    <div className="absolute inset-y-0 left-1 flex flex-col justify-between text-[9px] font-mono text-slate-500 py-2 select-none pointer-events-none">
                      <span>100%</span>
                      <span>75%</span>
                      <span>50%</span>
                      <span>25%</span>
                      <span>0%</span>
                    </div>

                    {/* High-Level Sensor Alarm LSH-101 */}
                    <div className="absolute top-2 right-2 flex items-center gap-1">
                      <span className={`w-2 h-2 rounded-full ${isOverfill ? "bg-rose-500 animate-ping" : "bg-slate-700"}`} />
                      <span className="text-[8px] font-mono text-slate-400">LSH-101</span>
                    </div>

                    {/* Animated Water Body */}
                    <div
                      className={`w-full transition-all duration-700 relative ${
                        isOverfill
                          ? "bg-gradient-to-t from-rose-800 to-rose-500 animate-pulse"
                          : "bg-gradient-to-t from-blue-700 to-cyan-400"
                      }`}
                      style={{ height: `${Math.min(100, Math.max(5, plant.tank_level))}%` }}
                    >
                      {/* Fluid Surface Wave Effect */}
                      <div className="absolute inset-x-0 -top-1.5 h-3 bg-white/30 rounded-full blur-[1px] animate-pulse" />
                    </div>

                    {/* Center Digital Level Readout */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="bg-black/60 px-2.5 py-1 rounded border border-white/10 text-center backdrop-blur-xs">
                        <div className="text-base font-bold text-white font-mono leading-none">
                          {plant.tank_level}%
                        </div>
                        <span className="text-[9px] font-mono text-slate-400">LT-101</span>
                      </div>
                    </div>
                  </div>

                  {/* Tank Base Drain / Pump Inlet */}
                  <div className="w-4 h-3 bg-slate-600 mt-0" />
                </div>

                {/* 2. Middle Interconnecting Pipeline & Instrumentation */}
                <div className="flex flex-col items-center justify-center space-y-4">
                  {/* Flow Rate Meter (FIT-101) */}
                  <div className="bg-[#121929] border border-white/10 px-3 py-2 rounded-lg text-center w-full max-w-[160px]">
                    <div className="flex items-center justify-center gap-1 text-[10px] text-slate-400 font-mono">
                      <Droplets className="w-3 h-3 text-cyan-400" />
                      <span>Inflow (FIT-101)</span>
                    </div>
                    <div className="text-sm font-bold text-white font-mono mt-0.5">
                      {plant.inlet_flow} L/min
                    </div>
                  </div>

                  {/* Inflow Valve (FCV-101) */}
                  <div className="flex flex-col items-center">
                    <button
                      onClick={handleToggleValve}
                      className={`px-3 py-1.5 rounded border text-xs font-mono font-semibold transition flex items-center gap-1.5 ${
                        plant.inflow_valve === "OPEN"
                          ? "bg-emerald-950/80 text-emerald-300 border-emerald-500/40"
                          : "bg-slate-800 text-slate-300 border-slate-600"
                      }`}
                      title="Click to toggle Inflow Valve FCV-101"
                    >
                      <span>FCV-101: {plant.inflow_valve}</span>
                    </button>
                    <span className="text-[9px] text-slate-400 mt-0.5">Inlet Valve</span>
                  </div>

                  {/* Pressure Transmitter (PIT-101) */}
                  <div className="bg-[#121929] border border-white/10 px-3 py-2 rounded-lg text-center w-full max-w-[160px]">
                    <div className="flex items-center justify-center gap-1 text-[10px] text-slate-400 font-mono">
                      <Gauge className={`w-3 h-3 ${isOverpressure ? "text-rose-400 animate-spin" : "text-blue-400"}`} />
                      <span>Pressure (PIT-101)</span>
                    </div>
                    <div className={`text-sm font-bold font-mono mt-0.5 ${isOverpressure ? "text-rose-400" : "text-white"}`}>
                      {plant.pressure_bar} bar
                    </div>
                  </div>
                </div>

                {/* 3. Chemical Dosing Tank & Reactor (T-102) */}
                <div className="flex flex-col items-center">
                  <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-1">
                    Tank T-102 (Chemical Stage)
                  </span>

                  {/* Chemical Vessel with pH Color */}
                  <div className="relative w-32 h-44 border-2 border-slate-600 rounded-2xl bg-[#0d1424] overflow-hidden shadow-inner flex flex-col justify-end">
                    
                    {/* Animated Chemical Dosing Fluid */}
                    <div
                      className={`w-full h-3/4 transition-colors duration-1000 relative ${
                        isAcidic
                          ? "bg-gradient-to-t from-purple-900 to-rose-600 animate-pulse"
                          : "bg-gradient-to-t from-teal-800 to-emerald-500"
                      }`}
                    >
                      <div className="absolute inset-x-0 -top-1 h-2 bg-white/20 rounded-full" />
                    </div>

                    {/* pH Sensor Display */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="bg-black/60 px-2.5 py-1 rounded border border-white/10 text-center backdrop-blur-xs">
                        <div className={`text-base font-bold font-mono leading-none ${isAcidic ? "text-rose-400" : "text-emerald-300"}`}>
                          {plant.chemical_ph} pH
                        </div>
                        <span className="text-[9px] font-mono text-slate-400">AIT-102</span>
                      </div>
                    </div>
                  </div>

                  {/* Chemical Acid Alert */}
                  {isAcidic && (
                    <span className="mt-1 text-[10px] font-bold text-rose-400 animate-pulse font-mono">
                      ⚠️ TOXIC ACID SPIKE
                    </span>
                  )}
                </div>
              </div>

              {/* Bottom Row: Pump P-101 and Safety Relief Valve */}
              <div className="mt-6 pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-4 bg-black/20 p-3 rounded-lg">
                
                {/* Centrifugal Pump (P-101) */}
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full border-2 border-slate-500 flex items-center justify-center bg-[#101726] ${
                    plant.pump_status === "RUNNING" ? "border-emerald-400 shadow-md shadow-emerald-500/20" : ""
                  }`}>
                    {/* Rotating Impeller blades */}
                    <div className={`w-6 h-6 border-2 border-dashed border-emerald-400 rounded-full ${
                      plant.pump_status === "RUNNING" ? "animate-spin" : "opacity-30"
                    }`} />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-white">Pump P-101 (Main Feed)</div>
                    <div className="text-[11px] text-slate-400 font-mono">
                      Speed: {plant.pump_rpm} RPM • PLC-001 Coil 0001
                    </div>
                  </div>
                  <button
                    onClick={handleTogglePump}
                    className={`ml-2 px-3 py-1 text-xs font-mono font-bold rounded transition ${
                      plant.pump_status === "RUNNING"
                        ? "bg-emerald-600 hover:bg-emerald-500 text-white"
                        : "bg-slate-700 hover:bg-slate-600 text-slate-200"
                    }`}
                  >
                    {plant.pump_status === "RUNNING" ? "RUNNING" : "STOPPED"}
                  </button>
                </div>

                {/* Emergency Relief Valve PSV-101 */}
                <div className="flex items-center gap-3">
                  <div>
                    <div className="text-xs font-semibold text-white text-right">Relief Valve PSV-101</div>
                    <div className="text-[11px] text-slate-400 font-mono text-right">
                      {isOverpressure ? "Overpressure Triggered" : "Safety Interlock Ready"}
                    </div>
                  </div>
                  <button
                    onClick={handleToggleRelief}
                    className={`px-3 py-1 text-xs font-mono font-bold rounded transition ${
                      plant.relief_valve === "OPEN"
                        ? "bg-rose-700 text-white animate-pulse"
                        : "bg-slate-800 text-slate-300 border border-slate-600"
                    }`}
                  >
                    {plant.relief_valve}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (1 Col): Cyber-Physical Attack Launcher (Red Team Console) */}
        <div className="enterprise-card p-5 flex flex-col justify-between">
          <div>
            <div className="border-b border-white/5 pb-3 mb-4">
              <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-400" />
                Red Team Attack Scenario Launcher
              </h3>
              <p className="text-[11px] text-slate-400">
                Trigger real cyber-physical exploits and observe consequences on physical sensors and detection engine
              </p>
            </div>

            <div className="space-y-3">
              {/* Scenario 1: Water Tank Overfill Attack */}
              <div className="p-3 bg-[#111726] hover:bg-[#161e30] rounded-lg border border-white/5 transition flex flex-col justify-between gap-2">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">Scenario 1: Stuxnet Tank Overfill</span>
                    <span className="status-pill status-pill-rose font-mono text-[9px]">L1 PLC-001</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Forces pump to 100%, disables pressure relief valve, surges water level to 98% with critical overpressure.
                  </p>
                </div>
                <button
                  onClick={() => handleRunAttack("TANK_OVERFILL")}
                  disabled={attackLoading}
                  className="w-full mt-1 px-3 py-1.5 bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/30 rounded text-xs font-semibold transition flex items-center justify-center gap-1.5"
                >
                  <Play className="w-3 h-3 fill-current" />
                  <span>Execute Overfill Attack</span>
                </button>
              </div>

              {/* Scenario 2: Chemical Dosing Poisoning */}
              <div className="p-3 bg-[#111726] hover:bg-[#161e30] rounded-lg border border-white/5 transition flex flex-col justify-between gap-2">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">Scenario 2: Oldsmar Chemical Poisoning</span>
                    <span className="status-pill status-pill-rose font-mono text-[9px]">L1 PLC-002</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Overrides chemical dosing valve (Reg 40005), dropping water pH to 3.2 (toxic acid threshold).
                  </p>
                </div>
                <button
                  onClick={() => handleRunAttack("CHEMICAL_DOSING")}
                  disabled={attackLoading}
                  className="w-full mt-1 px-3 py-1.5 bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/30 rounded text-xs font-semibold transition flex items-center justify-center gap-1.5"
                >
                  <Play className="w-3 h-3 fill-current" />
                  <span>Execute Chemical Acid Attack</span>
                </button>
              </div>

              {/* Scenario 3: Sensor Spoofing Attack */}
              <div className="p-3 bg-[#111726] hover:bg-[#161e30] rounded-lg border border-white/5 transition flex flex-col justify-between gap-2">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">Scenario 3: False Data Injection (Spoofing)</span>
                    <span className="status-pill status-pill-amber font-mono text-[9px]">Modbus FC06</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Spoofs level sensor LIT-101 to read 20% while tank fills, blinding operator HMI.
                  </p>
                </div>
                <button
                  onClick={() => handleRunAttack("SENSOR_SPOOFING")}
                  disabled={attackLoading}
                  className="w-full mt-1 px-3 py-1.5 bg-amber-600/20 hover:bg-amber-600 text-amber-300 hover:text-white border border-amber-500/30 rounded text-xs font-semibold transition flex items-center justify-center gap-1.5"
                >
                  <Play className="w-3 h-3 fill-current" />
                  <span>Execute Sensor Spoof Attack</span>
                </button>
              </div>

              {/* Scenario 4: Honeypot Decoy Probing */}
              <div className="p-3 bg-[#111726] hover:bg-[#161e30] rounded-lg border border-white/5 transition flex flex-col justify-between gap-2">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">Scenario 4: Recon & Honeypot Trap</span>
                    <span className="status-pill status-pill-blue font-mono text-[9px]">Decoy 192.168.10.90</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Port scans industrial honey-PLC (Conpot decoy) to trigger automated tripwire detection.
                  </p>
                </div>
                <button
                  onClick={() => handleRunAttack("PORT_SCAN")}
                  disabled={attackLoading}
                  className="w-full mt-1 px-3 py-1.5 bg-blue-600/20 hover:bg-blue-600 text-blue-300 hover:text-white border border-blue-500/30 rounded text-xs font-semibold transition flex items-center justify-center gap-1.5"
                >
                  <Play className="w-3 h-3 fill-current" />
                  <span>Probe Decoy Honeypot</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Live Modbus/TCP Register Table */}
      <div className="enterprise-card p-5">
        <div className="border-b border-white/5 pb-3 mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
              <Cpu className="w-4 h-4 text-blue-400" />
              Live Virtual Modbus/TCP Register Map (Purdue L1 PLC-001 & PLC-002)
            </h3>
            <p className="text-[11px] text-slate-400">
              Synchronized real-time holding registers and coils queried by SCADA & HMI
            </p>
          </div>
          <span className="status-pill status-pill-emerald font-mono">
            Port 502 • Unit ID 1
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {/* Reg 40001 */}
          <div className="bg-[#111726] p-3 rounded border border-white/5">
            <span className="text-[10px] font-mono text-slate-400">REG 40001 (LIT-101)</span>
            <div className="text-base font-bold text-white font-mono mt-1">
              {plant.modbus_registers?.[40001] || Math.round(plant.tank_level)}
            </div>
            <span className="text-[10px] text-slate-400">Water Tank Level (%)</span>
          </div>

          {/* Reg 40002 */}
          <div className="bg-[#111726] p-3 rounded border border-white/5">
            <span className="text-[10px] font-mono text-slate-400">REG 40002 (FIT-101)</span>
            <div className="text-base font-bold text-white font-mono mt-1">
              {plant.modbus_registers?.[40002] || Math.round(plant.inlet_flow * 10)}
            </div>
            <span className="text-[10px] text-slate-400">Flow Rate (L/min × 10)</span>
          </div>

          {/* Reg 40003 */}
          <div className="bg-[#111726] p-3 rounded border border-white/5">
            <span className="text-[10px] font-mono text-slate-400">REG 40003 (PIT-101)</span>
            <div className="text-base font-bold text-white font-mono mt-1">
              {plant.modbus_registers?.[40003] || Math.round(plant.pressure_bar * 10)}
            </div>
            <span className="text-[10px] text-slate-400">Discharge Press (bar × 10)</span>
          </div>

          {/* Reg 40004 */}
          <div className="bg-[#111726] p-3 rounded border border-white/5">
            <span className="text-[10px] font-mono text-slate-400">REG 40004 (P-101)</span>
            <div className="text-base font-bold text-emerald-400 font-mono mt-1">
              {plant.modbus_registers?.[40004] ?? (plant.pump_status === "RUNNING" ? 1 : 0)}
            </div>
            <span className="text-[10px] text-slate-400">Pump Status (1=Run, 0=Stop)</span>
          </div>

          {/* Reg 40005 */}
          <div className="bg-[#111726] p-3 rounded border border-white/5">
            <span className="text-[10px] font-mono text-slate-400">REG 40005 (AIT-102)</span>
            <div className={`text-base font-bold font-mono mt-1 ${isAcidic ? "text-rose-400" : "text-white"}`}>
              {plant.modbus_registers?.[40005] || Math.round(plant.chemical_ph * 10)}
            </div>
            <span className="text-[10px] text-slate-400">Chemical pH (pH × 10)</span>
          </div>

          {/* Reg 40006 */}
          <div className="bg-[#111726] p-3 rounded border border-white/5">
            <span className="text-[10px] font-mono text-slate-400">REG 40006 (PSV-101)</span>
            <div className="text-base font-bold text-amber-400 font-mono mt-1">
              {plant.modbus_registers?.[40006] ?? (plant.relief_valve === "OPEN" ? 1 : 0)}
            </div>
            <span className="text-[10px] text-slate-400">Relief Valve (1=Open, 0=Shut)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
