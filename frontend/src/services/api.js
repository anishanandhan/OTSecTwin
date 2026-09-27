const API_BASE_URL = "http://localhost:8000/api";

export async function fetchAssets() {
  const res = await fetch(`${API_BASE_URL}/assets`);
  if (!res.ok) throw new Error("Failed to fetch assets");
  return res.json();
}

export async function fetchAssetDetail(assetId) {
  const res = await fetch(`${API_BASE_URL}/assets/${assetId}`);
  if (!res.ok) throw new Error("Failed to fetch asset detail");
  return res.json();
}

export async function updateAsset(assetId, data) {
  const res = await fetch(`${API_BASE_URL}/assets/${assetId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update asset");
  return res.json();
}

export async function fetchTopology() {
  const res = await fetch(`${API_BASE_URL}/topology`);
  if (!res.ok) throw new Error("Failed to fetch topology");
  return res.json();
}

export async function fetchDigitalTwin(assetId) {
  const res = await fetch(`${API_BASE_URL}/twin/${assetId}`);
  if (!res.ok) throw new Error("Failed to fetch digital twin");
  return res.json();
}

export async function fetchVulnerabilities() {
  const res = await fetch(`${API_BASE_URL}/vulnerabilities`);
  if (!res.ok) throw new Error("Failed to fetch vulnerabilities");
  return res.json();
}

export async function fetchVulnerabilityCorrelations() {
  const res = await fetch(`${API_BASE_URL}/vulnerabilities/correlations`);
  if (!res.ok) throw new Error("Failed to fetch vulnerability correlations");
  return res.json();
}

export async function fetchAlerts() {
  const res = await fetch(`${API_BASE_URL}/alerts`);
  if (!res.ok) throw new Error("Failed to fetch alerts");
  return res.json();
}

export async function acknowledgeAlert(alertId) {
  const res = await fetch(`${API_BASE_URL}/alerts/${alertId}/acknowledge`, {
    method: "POST",
  });
  if (!res.ok) throw new Error("Failed to acknowledge alert");
  return res.json();
}

export async function resolveAlert(alertId) {
  const res = await fetch(`${API_BASE_URL}/alerts/${alertId}/resolve`, {
    method: "POST",
  });
  if (!res.ok) throw new Error("Failed to resolve alert");
  return res.json();
}

export async function fetchTelemetry(limit = 50) {
  const res = await fetch(`${API_BASE_URL}/telemetry?limit=${limit}`);
  if (!res.ok) throw new Error("Failed to fetch telemetry");
  return res.json();
}

export async function triggerSimulation(trafficType, targetIp = "192.168.10.10", count = 10) {
  const res = await fetch(`${API_BASE_URL}/simulator/trigger`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ traffic_type: trafficType, target_ip: targetIp, count }),
  });
  if (!res.ok) throw new Error("Failed to trigger simulation");
  return res.json();
}

export async function uploadPcapFile(file) {
  const formData = new FormData();
  formData.append("file", file);
  const res = await fetch(`${API_BASE_URL}/telemetry/upload_pcap`, {
    method: "POST",
    body: formData,
  });
  if (!res.ok) throw new Error("Failed to upload PCAP file");
  return res.json();
}

export async function resetLab() {
  const res = await fetch(`${API_BASE_URL}/simulator/reset_lab`, {
    method: "POST",
  });
  if (!res.ok) throw new Error("Failed to reset lab");
  return res.json();
}
