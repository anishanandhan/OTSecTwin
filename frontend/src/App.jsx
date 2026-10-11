import React, { useState, useEffect, useCallback } from "react";
import Navbar from "./components/Navbar";
import DashboardOverview from "./components/DashboardOverview";
import TopologyGraph from "./components/TopologyGraph";
import AssetInventory from "./components/AssetInventory";
import DigitalTwinModal from "./components/DigitalTwinModal";
import VulnerabilityMatrix from "./components/VulnerabilityMatrix";
import BehavioralAlerts from "./components/BehavioralAlerts";
import TelemetrySimulator from "./components/TelemetrySimulator";
import CyberPhysicalLab from "./components/CyberPhysicalLab";
import AICopilotDrawer from "./components/AICopilotDrawer";
import { Sparkles } from "lucide-react";

import {
  fetchAssets,
  fetchTopology,
  fetchVulnerabilities,
  fetchVulnerabilityCorrelations,
  fetchAlerts,
  acknowledgeAlert,
  resolveAlert,
  triggerSimulation,
  resetLab
} from "./services/api";

export default function App() {
  const [activeTab, setActiveTab] = useState("overview");
  const [assets, setAssets] = useState([]);
  const [topology, setTopology] = useState(null);
  const [vulnerabilities, setVulnerabilities] = useState([]);
  const [correlations, setCorrelations] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [selectedAssetId, setSelectedAssetId] = useState(null);
  const [notification, setNotification] = useState(null);
  const [isAiCopilotOpen, setIsAiCopilotOpen] = useState(false);

  const loadAllData = useCallback(async () => {
    try {
      const [astData, topoData, vulnData, corrData, altData] = await Promise.all([
        fetchAssets(),
        fetchTopology(),
        fetchVulnerabilities(),
        fetchVulnerabilityCorrelations(),
        fetchAlerts()
      ]);
      setAssets(astData);
      setTopology(topoData);
      setVulnerabilities(vulnData);
      setCorrelations(corrData);
      setAlerts(altData);
    } catch (err) {
      console.error("Failed to sync platform telemetry:", err);
    }
  }, []);

  useEffect(() => {
    loadAllData();
    const interval = setInterval(loadAllData, 4000); // 4-sec polling sync
    return () => clearInterval(interval);
  }, [loadAllData]);

  const showNotification = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 4000);
  };

  const handleTriggerNormalSim = async () => {
    await triggerSimulation("NORMAL", "192.168.10.10", 10);
    await loadAllData();
    showNotification("Normal Modbus/TCP telemetry generated.");
  };

  const handleInjectAttack = async () => {
    await triggerSimulation("UNAUTHORIZED_WRITE", "192.168.10.10", 5);
    await loadAllData();
    showNotification("🚨 Unauthorized PLC Write Attack Injected!");
  };

  const handleResetLab = async () => {
    await resetLab();
    await loadAllData();
    showNotification("OT Lab environment reset to default baseline.");
  };

  const handleAcknowledgeAlert = async (alertId) => {
    await acknowledgeAlert(alertId);
    await loadAllData();
    showNotification("Alert acknowledged.");
  };

  const handleResolveAlert = async (alertId) => {
    await resolveAlert(alertId);
    await loadAllData();
    showNotification("Alert resolved.");
  };

  const newAlertCount = alerts.filter((a) => a.status === "NEW").length;

  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 flex flex-col font-sans">
      {/* Header Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        alertCount={newAlertCount}
        onTriggerSim={handleTriggerNormalSim}
        onInjectAttack={handleInjectAttack}
        onResetLab={handleResetLab}
        onToggleAiCopilot={() => setIsAiCopilotOpen((prev) => !prev)}
      />

      {/* Floating AI Copilot Quick Launcher Button */}
      {!isAiCopilotOpen && (
        <button
          onClick={() => setIsAiCopilotOpen(true)}
          className="fixed bottom-6 right-6 z-40 px-3.5 py-2 bg-[#172138] hover:bg-[#1e2a47] text-white text-xs font-medium rounded-full shadow-xl border border-blue-500/30 flex items-center gap-2 group transition-all"
        >
          <Sparkles className="w-3.5 h-3.5 text-blue-400 group-hover:rotate-12 transition-transform" />
          <span>AI Copilot</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
        </button>
      )}

      {/* AI Copilot Side Drawer (RouterPlus) */}
      <AICopilotDrawer
        isOpen={isAiCopilotOpen}
        onClose={() => setIsAiCopilotOpen(false)}
        alerts={alerts}
        assets={assets}
      />

      {/* Floating Notification Toast */}
      {notification && (
        <div className="fixed bottom-5 right-5 z-50 px-4 py-2 bg-[#121828] border border-white/10 text-slate-100 text-xs font-medium rounded-md shadow-2xl flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
          <span>{notification}</span>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 p-6 max-w-7xl w-full mx-auto space-y-6">
        {activeTab === "overview" && (
          <DashboardOverview
            assets={assets}
            alerts={alerts}
            vulns={vulnerabilities}
            onSelectAsset={setSelectedAssetId}
            onAcknowledgeAlert={handleAcknowledgeAlert}
            setActiveTab={setActiveTab}
          />
        )}

        {activeTab === "topology" && (
          <TopologyGraph
            topologyData={topology}
            onSelectAsset={setSelectedAssetId}
            onRefresh={loadAllData}
          />
        )}

        {activeTab === "assets" && (
          <AssetInventory
            assets={assets}
            onSelectAsset={setSelectedAssetId}
            onRefresh={loadAllData}
          />
        )}

        {activeTab === "vulnerabilities" && (
          <VulnerabilityMatrix
            vulnerabilities={vulnerabilities}
            correlations={correlations}
          />
        )}

        {activeTab === "alerts" && (
          <BehavioralAlerts
            alerts={alerts}
            onAcknowledge={handleAcknowledgeAlert}
            onResolve={handleResolveAlert}
            onRefresh={loadAllData}
          />
        )}

        {activeTab === "simulator" && (
          <div className="space-y-6">
            <CyberPhysicalLab onAnomalyDetected={loadAllData} />
            <TelemetrySimulator onSimulationTriggered={loadAllData} />
          </div>
        )}
      </main>

      {/* Digital Twin Inspector Modal */}
      {selectedAssetId && (
        <DigitalTwinModal
          assetId={selectedAssetId}
          onClose={() => setSelectedAssetId(null)}
          onAssetUpdated={loadAllData}
        />
      )}

      {/* Footer */}
      <footer className="border-t border-[#1e2d4a] bg-[#0d1424] py-4 text-center text-xs text-slate-500">
        OTSecTwin Platform • Operational Technology Asset Intelligence & Anomaly Engine • Passive Modbus Telemetry
      </footer>
    </div>
  );
}
