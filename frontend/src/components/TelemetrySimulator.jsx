import React, { useState } from "react";
import { Cpu, Play, AlertTriangle, Upload, Download, RefreshCw, FileText, CheckCircle2 } from "lucide-react";
import { triggerSimulation, uploadPcapFile, resetLab } from "../services/api";

export default function TelemetrySimulator({ onSimulationTriggered }) {
  const [trafficType, setTrafficType] = useState("NORMAL");
  const [targetIp, setTargetIp] = useState("192.168.10.10");
  const [count, setCount] = useState(10);
  const [loading, setLoading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState("");
  const [file, setFile] = useState(null);

  const handleRunSimulation = async () => {
    setLoading(true);
    try {
      await triggerSimulation(trafficType, targetIp, count);
      onSimulationTriggered();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUploadPcap = async (e) => {
    e.preventDefault();
    if (!file) return;
    setLoading(true);
    setUploadStatus("Uploading & parsing PCAP frames...");
    try {
      const res = await uploadPcapFile(file);
      setUploadStatus(`Processed ${res.processed_packets} packets cleanly! Assets & topology updated.`);
      onSimulationTriggered();
    } catch (err) {
      setUploadStatus("Failed to process PCAP file.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetLab = async () => {
    setLoading(true);
    try {
      await resetLab();
      onSimulationTriggered();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-card p-5">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Cpu className="w-5 h-5 text-cyan-400" /> OT Laboratory Simulator & Passive Telemetry Ingestion Engine
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Generate realistic Modbus/TCP traffic, trigger simulated cyber attack scenarios, upload external PCAP files, or download generated captures for Wireshark analysis.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Section 1: Traffic Simulator Controls */}
        <div className="glass-card p-6 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Play className="w-4 h-4 text-emerald-400 fill-current" /> Live Telemetry Generator
          </h3>

          <div className="space-y-3">
            <div>
              <label className="text-xs text-slate-400 block mb-1">Traffic Pattern / Attack Scenario</label>
              <select
                value={trafficType}
                onChange={(e) => setTrafficType(e.target.value)}
                className="w-full px-3 py-2 bg-[#0d1424] border border-[#1e2d4a] rounded-xl text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
              >
                <option value="NORMAL">Normal Polling (HMI & SCADA Read FC03/FC04)</option>
                <option value="UNAUTHORIZED_WRITE">🚨 Unauthorized PLC Write Attack (Rogue Host FC06 Register Override)</option>
                <option value="PORT_SCAN">🚨 Modbus Reconnaissance & Port Probe (TCP 502, 102, 20000 Scan)</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Target Asset IP</label>
                <select
                  value={targetIp}
                  onChange={(e) => setTargetIp(e.target.value)}
                  className="w-full px-3 py-2 bg-[#0d1424] border border-[#1e2d4a] rounded-xl text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
                >
                  <option value="192.168.10.10">192.168.10.10 (PLC-001)</option>
                  <option value="192.168.10.12">192.168.10.12 (PLC-002)</option>
                  <option value="192.168.10.15">192.168.10.15 (RTU-001)</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Frame Count</label>
                <input
                  type="number"
                  value={count}
                  onChange={(e) => setCount(parseInt(e.target.value) || 10)}
                  className="w-full px-3 py-2 bg-[#0d1424] border border-[#1e2d4a] rounded-xl text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
                />
              </div>
            </div>

            <div className="pt-2 flex items-center gap-3">
              <button
                onClick={handleRunSimulation}
                disabled={loading}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl flex items-center gap-2 shadow-lg shadow-emerald-600/30 transition-all"
              >
                <Play className="w-4 h-4 fill-current" />
                {loading ? "Generating Telemetry..." : "Generate Telemetry Batch"}
              </button>

              <button
                onClick={handleResetLab}
                disabled={loading}
                className="px-4 py-2.5 bg-[#1a2642] hover:bg-[#25375d] text-slate-300 text-xs font-semibold rounded-xl border border-[#1e2d4a] flex items-center gap-1.5 transition-all"
              >
                <RefreshCw className="w-4 h-4" /> Reset Lab Baseline
              </button>
            </div>
          </div>
        </div>

        {/* Section 2: PCAP Ingestion & Wireshark Export */}
        <div className="glass-card p-6 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Upload className="w-4 h-4 text-cyan-400" /> PCAP Packet File Ingestion & Wireshark Export
          </h3>

          <form onSubmit={handleUploadPcap} className="space-y-3">
            <div>
              <label className="text-xs text-slate-400 block mb-1">Upload Custom .PCAP File</label>
              <input
                type="file"
                accept=".pcap,.pcapng,.cap"
                onChange={(e) => setFile(e.target.files[0])}
                className="w-full p-2 bg-[#0d1424] border border-[#1e2d4a] rounded-xl text-xs text-slate-300 file:mr-4 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-cyan-950 file:text-cyan-300 hover:file:bg-cyan-900"
              />
            </div>

            <button
              type="submit"
              disabled={!file || loading}
              className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white text-xs font-semibold rounded-xl flex items-center gap-2 transition-all"
            >
              <Upload className="w-4 h-4" /> Parse & Fingerprint Assets
            </button>

            {uploadStatus && (
              <p className="text-xs font-mono text-cyan-300 bg-[#0d1424] p-2.5 rounded-lg border border-[#1e2d4a]">
                {uploadStatus}
              </p>
            )}
          </form>

          <div className="pt-4 border-t border-[#1e2d4a]">
            <p className="text-xs font-semibold text-slate-300 mb-2">Export Telemetry for Wireshark</p>
            <a
              href="http://localhost:8000/api/simulator/download_pcap"
              download="ot_telemetry_capture.pcap"
              className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-semibold rounded-xl border border-cyan-500/30 transition-all"
            >
              <Download className="w-4 h-4" /> Download Live .PCAP File
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
