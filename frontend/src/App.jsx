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
import ResearcherDossierModal from "./components/ResearcherDossierModal";
import PortfolioHub from "./components/PortfolioHub";
import { Sparkles, Sliders, Shield, ArrowRight, X, ExternalLink, Award } from "lucide-react";

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
  const [isDossierOpen, setIsDossierOpen] = useState(false);
  const [showExitBar, setShowExitBar] = useState(false);
  const [exitBarDismissed, setExitBarDismissed] = useState(false);

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

  // Global Keyboard Navigation & Accessibility (Layer 5)
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ignore if user is typing in an input or textarea
      if (["INPUT", "TEXTAREA"].includes(document.activeElement.tagName)) {
        if (e.key === "Escape") {
          document.activeElement.blur();
        }
        return;
      }

      if (e.key === "/") {
        e.preventDefault();
        setIsAiCopilotOpen((prev) => !prev);
      } else if (e.key === "Escape") {
        setIsAiCopilotOpen(false);
        setSelectedAssetId(null);
        setIsDossierOpen(false);
      } else if (e.key === "1") {
        setActiveTab("overview");
      } else if (e.key === "2") {
        setActiveTab("simulator");
      } else if (e.key === "3") {
        setActiveTab("assets");
      } else if (e.key === "4") {
        setActiveTab("topology");
      } else if (e.key === "5") {
        setActiveTab("vulnerabilities");
      } else if (e.key === "6") {
        setActiveTab("alerts");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Exit Intent / Scroll Recovery Trigger (Layer 3)
  useEffect(() => {
    const handleScroll = () => {
      if (exitBarDismissed) return;
      const scrollY = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (docHeight > 0 && scrollY / docHeight > 0.45) {
        setShowExitBar(true);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [exitBarDismissed]);

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
      {/* Skip to Main Content Link for WCAG Accessibility */}
      <a href="#main-content" className="skip-to-main-link">
        Skip to main content (Press Enter)
      </a>

      {/* Header Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        alertCount={newAlertCount}
        onTriggerSim={handleTriggerNormalSim}
        onInjectAttack={handleInjectAttack}
        onResetLab={handleResetLab}
        onToggleAiCopilot={() => setIsAiCopilotOpen((prev) => !prev)}
        onOpenDossier={() => setIsDossierOpen(true)}
      />

      {/* Floating AI Copilot Quick Launcher Button */}
      {!isAiCopilotOpen && (
        <button
          onClick={() => setIsAiCopilotOpen(true)}
          className="fixed bottom-6 right-6 z-40 px-3.5 py-2 bg-[#172138] hover:bg-[#1e2a47] text-white text-xs font-medium rounded-full shadow-xl border border-blue-500/30 flex items-center gap-2 group transition-all"
          title="Press / to open Copilot"
        >
          <Sparkles className="w-3.5 h-3.5 text-blue-400 group-hover:rotate-12 transition-transform" />
          <span>AI Copilot</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
        </button>
      )}

      {/* AI Copilot Side Drawer */}
      <AICopilotDrawer
        isOpen={isAiCopilotOpen}
        onClose={() => setIsAiCopilotOpen(false)}
        alerts={alerts}
        assets={assets}
      />

      {/* Researcher Dossier Modal */}
      <ResearcherDossierModal
        isOpen={isDossierOpen}
        onClose={() => setIsDossierOpen(false)}
      />

      {/* Floating Notification Toast */}
      {notification && (
        <div className="fixed bottom-5 right-5 z-50 px-4 py-2 bg-[#121828] border border-white/10 text-slate-100 text-xs font-medium rounded-md shadow-2xl flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
          <span>{notification}</span>
        </div>
      )}

      {/* Main Content Area */}
      <main id="main-content" className="flex-1 p-6 max-w-7xl w-full mx-auto space-y-6">
        {activeTab === "overview" && (
          <DashboardOverview
            assets={assets}
            alerts={alerts}
            vulns={vulnerabilities}
            onSelectAsset={setSelectedAssetId}
            onAcknowledgeAlert={handleAcknowledgeAlert}
            setActiveTab={setActiveTab}
            onOpenDossier={() => setIsDossierOpen(true)}
          />
        )}

        {activeTab === "simulator" && (
          <div className="space-y-6">
            <CyberPhysicalLab onAnomalyDetected={loadAllData} />
            <TelemetrySimulator onSimulationTriggered={loadAllData} />
          </div>
        )}

        {activeTab === "portfolio" && (
          <PortfolioHub onNavigateToPlantLab={() => setActiveTab("simulator")} />
        )}

        {activeTab === "assets" && (
          <AssetInventory
            assets={assets}
            onSelectAsset={setSelectedAssetId}
            onRefresh={loadAllData}
          />
        )}

        {activeTab === "topology" && (
          <TopologyGraph
            topologyData={topology}
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
      </main>

      {/* Digital Twin Inspector Modal */}
      {selectedAssetId && (
        <DigitalTwinModal
          assetId={selectedAssetId}
          onClose={() => setSelectedAssetId(null)}
          onAssetUpdated={loadAllData}
        />
      )}

      {/* ━━ EXIT INTENT / SCROLL RECOVERY BAR (LAYER 3) ━━ */}
      {showExitBar && !exitBarDismissed && (
        <aside 
          className="fixed bottom-0 inset-x-0 z-40 bg-[#0e1628]/95 backdrop-blur-md border-t border-blue-500/30 px-6 py-3 shadow-2xl animate-fade-in flex flex-wrap items-center justify-between gap-4"
          aria-label="Interactive simulation reminder"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-semibold text-white">
                Before you go — Simulate an unauthorized PLC write attack on the live LabShock plant
              </p>
              <p className="text-[11px] text-slate-400">
                Observe the tank level physics, valve dynamics, and mathematical digital twin anomaly detection.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setActiveTab("simulator");
                setShowExitBar(false);
              }}
              className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-md text-xs font-semibold flex items-center gap-1.5 shadow-sm transition"
            >
              <span>Launch Attack Simulation</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => {
                setShowExitBar(false);
                setExitBarDismissed(true);
              }}
              className="p-1.5 text-slate-400 hover:text-white rounded transition"
              aria-label="Dismiss banner"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </aside>
      )}

      {/* ━━ FOOTER (LAYER 2 SPECIFICATION) ━━ */}
      <footer className="border-t border-[#1e2d4a] bg-[#0c1220] py-6 px-6 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center md:text-left">
            <p className="text-slate-200 font-medium">
              OTSecTwin — Zero-intrusive cyber-physical threat intelligence for water, energy, and mission-critical industrial plants.
            </p>
            <p className="text-[11px] text-slate-500">
              Engineered by <button onClick={() => setIsDossierOpen(true)} className="text-blue-400 hover:underline">Anish Anandhan</button> • IIT Madras CyStar • Medtronic Global IT • IEEE Publications
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <button onClick={() => setActiveTab("overview")} className="hover:text-white transition">Dashboard</button>
            <button onClick={() => setActiveTab("simulator")} className="hover:text-white transition">LabShock P&ID</button>
            <button onClick={() => setActiveTab("assets")} className="hover:text-white transition">Assets</button>
            <button onClick={() => setIsDossierOpen(true)} className="hover:text-white transition">Researcher Dossier</button>
            <a 
              href="https://github.com/anishanandhan/OTSecTwin" 
              target="_blank" 
              rel="noreferrer"
              className="px-3 py-1 bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 rounded font-medium flex items-center gap-1 transition"
            >
              <span>GitHub</span>
              <ExternalLink className="w-3 h-3 text-slate-400" />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
