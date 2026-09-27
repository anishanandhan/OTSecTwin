import React, { useState, useEffect, useCallback } from "react";
import Navbar from "./components/Navbar";
import DashboardOverview from "./components/DashboardOverview";
import TopologyGraph from "./components/TopologyGraph";
import AssetInventory from "./components/AssetInventory";
import DigitalTwinModal from "./components/DigitalTwinModal";
import VulnerabilityMatrix from "./components/VulnerabilityMatrix";
import BehavioralAlerts from "./components/BehavioralAlerts";
import TelemetrySimulator from "./components/TelemetrySimulator";

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
      />

      {/* Floating Notification Toast */}
      {notification && (
        <div className="fixed bottom-5 right-5 z-50 px-4 py-2.5 bg-cyan-950 border border-cyan-500/50 text-cyan-200 text-xs font-semibold rounded-xl shadow-2xl animate-bounce">
          {notification}
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
          <TelemetrySimulator
            onSimulationTriggered={loadAllData}
          />
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
