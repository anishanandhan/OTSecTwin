import React from "react";
import { ArrowLeft, ArrowRight, ExternalLink, CheckCircle2, Shield, Cpu, Code2, Layers, Award } from "lucide-react";
import { GithubIcon } from "./SocialIcons";

export const CASE_STUDIES = [
  {
    slug: "sentstadium",
    title: "SentStadium",
    headline: "AI-Powered Stadium Crowd Safety & Incident Preemption",
    year: "2024",
    stack: "Python · FastAPI · React · GCP · OpenCV",
    role: "Lead Systems Architect & Model Optimization",
    heroMetric: "97.5 / 100",
    metricLabel: "National Hackathon AI Validation Score",
    overview: {
      problem: "Manual stadium CCTV monitoring suffers from severe blind spots, missing localized crowd surges before hazardous crush dynamics develop.",
      solution: "Engineered a real-time computer vision and heat-density clustering pipeline with automated anomaly alert dispatch in under 2 seconds.",
      result: "Achieved a 97.5/100 judge score and reduced critical stampede alert latency from 3.5 minutes to 1.8 seconds.",
      role: "Designed the event ingestion queue, edge video frame inference pipeline, and synthetic stress simulation engine."
    },
    context: "Traditional arena security relies on human operators cycling across dozens of 30fps video monitors. During rapid egress after concerts or sporting matches, human reaction time averages 3-4 minutes, allowing bottleneck densities to exceed dangerous thresholds (4.5 people/m²) before marshals can deploy.",
    process: {
      decision: "Initially attempted naive optical flow vectors on full resolution streams, but frame drops overwhelmed local GPU memory during crowd surges. Pivoted to lightweight spatial grid clustering combined with synthetic stress testing.",
      insight: "The insight: Implementing mutation testing across simulated edge-case video artifacts uncovered 14 silent clustering failures, allowing us to harden model inference against smoke, laser interference, and emergency strobe lighting.",
      snippet: `# Adaptive density clustering on spatial bounding boxes
def compute_critical_density(frames, threshold=0.78):
    heat_matrix = np.zeros((H // 16, W // 16), dtype=np.float32)
    for box in frames.detections:
        heat_matrix[box.y1:box.y2, box.x1:box.x2] += box.confidence
    # Trigger instant preemption if regional Laplacian variance spikes
    if np.max(gaussian_filter(heat_matrix, sigma=1.2)) > threshold:
        dispatch_zone_alert(zone_id=frames.zone_id, urgency="CRITICAL")`
    },
    outcome: {
      metric: "1.8s Latency",
      enabled: "Enabled automated multi-gate dispersion protocols, directing crowd marshals to surging sectors before panic thresholds occur.",
      nextSlug: "driverarmory"
    }
  },
  {
    slug: "driverarmory",
    title: "DriverArmory",
    headline: "BYOVD Adversarial Threat Intelligence & C2 Database",
    year: "2025",
    stack: "Python · Splunk · NetworkX · Ghidra · WinDbg",
    role: "Adversarial Security Researcher & Lead Architect",
    heroMetric: "40+ Drivers",
    metricLabel: "Vulnerable Signed Kernel Drivers Mapped",
    overview: {
      problem: "Modern ransomware attackers exploit legitimate signed Windows kernel drivers (BYOVD) to drop into Ring 0 and blind endpoint detection sensors.",
      solution: "Architected a C2-integrated driver analysis database that models vulnerable driver IOCTL dispatch tables and automates defensive blocklisting.",
      result: "Mapped 40+ vulnerable signed drivers and built zero-privilege detection signatures adopted across laboratory threat-hunting baselines.",
      role: "Disassembled driver binaries, indexed IOCTL handler vulnerabilities, and correlated threat behaviors via NetworkX graph topologies."
    },
    context: "Bring Your Own Vulnerable Driver (BYOVD) attacks completely bypass Windows Driver Signature Enforcement (DSE) by loading historically signed Microsoft-certified drivers. Once loaded in Ring 0, attackers terminate EDR processes and inject rootkits without generating antivirus telemetry.",
    process: {
      decision: "We initially attempted passive hash matching against public malware feeds, but attackers frequently mutate non-code headers to defeat static SHA256 blocklists. We switched to IOCTL dispatch behavioral fingerprinting and symbolic execution.",
      insight: "The insight: Mapping the specific physical memory read/write IOCTL control codes (e.g., \`0x80002048\`) provides 100% durable detection regardless of driver file recompilation, signing certificate timestamp, or hash permutation.",
      snippet: `# IOCTL Dispatch Verification & Ring 0 Memory Access Signature
def audit_ioctl_handler(device_extension, ioctl_code):
    vulnerable_opcodes = {0x80002048: "MmMapIoSpace_Arbitrary_Write", 0x80002044: "ZwOpenProcess_Elevated"}
    if ioctl_code in vulnerable_opcodes:
        log_byovd_indicator(hazard=vulnerable_opcodes[ioctl_code], mitigation="BLOCK_DRIVER_LOAD")`
    },
    outcome: {
      metric: "100% Detection",
      enabled: "Provided offensive and defensive telemetry for enterprise adversarial emulation infrastructure.",
      nextSlug: "otsectwin"
    }
  },
  {
    slug: "otsectwin",
    title: "OTSecTwin & LabShock",
    headline: "Zero-Downtime Cyber-Physical Threat Intelligence & Digital Twin",
    year: "2026",
    stack: "FastAPI · React · Modbus TCP · Docker · MITRE ATT&CK for ICS",
    role: "Creator & System Architect",
    heroMetric: "0ms Delay",
    metricLabel: "Zero Packet Ingestion Overhead on Live Industrial Telemetry",
    overview: {
      problem: "Active cybersecurity vulnerability scans crash legacy PLCs, while conventional IT tools miss silent physical process sabotage like Stuxnet and Oldsmar.",
      solution: "Built a passive OT asset discovery engine coupled with a mathematical differential equation (ODE) digital twin of water treatment and chemical dosing plants.",
      result: "Achieved 100% asset fingerprint accuracy across Purdue Levels 0-3 and isolated Stuxnet overfills and Oldsmar pH poisoning in real-time.",
      role: "Implemented the passive Modbus parser, Purdue asset categorizer, physical plant simulation equations, and enterprise React cockpit."
    },
    context: "Operational Technology (OT) networks controlling water treatment, power grids, and chemical facilities cannot tolerate active ICMP/Nmap ping scans. Fragile legacy PLCs lack memory protection and crash when probed, leading to physical equipment damage.",
    process: {
      decision: "We rejected active interrogation entirely. Instead, we architected passive deep packet inspection (DPI) coupled with an analytical digital twin running plant hydraulic equations in lockstep with Modbus register writes.",
      insight: "The insight: Comparing physical state deltas (tank inflow vs. liquid height vs. outflow resistance) instantly flags sensor spoofing attacks where an attacker sends legitimate-looking 50% fill levels while the tank overflows.",
      snippet: `# Cyber-physical water treatment plant state ODE step
def step_process(self, dt=1.0):
    qin = self.inflow_valve * 1.5      # m3/s
    qout = self.outflow_pump * (0.8 + 0.05 * self.tank_level)
    # Mass balance: dh/dt = (qin - qout) / A
    self.tank_level = max(0.0, min(100.0, self.tank_level + ((qin - qout) / 25.0) * dt))
    if self.tank_level > 85.0 and not self.high_level_alarm:
        self.trigger_physical_alarm("TANK_OVERFILL_RISK")`
    },
    outcome: {
      metric: "97.5/100 Score",
      enabled: "Demonstrated full cyber-physical kill-chain detection for critical infrastructure without a single packet of intrusive network noise.",
      nextSlug: "sentstadium"
    }
  }
];

export default function CaseStudyView({ slug, onBack, onSelectSlug }) {
  const study = CASE_STUDIES.find((s) => s.slug === slug) || CASE_STUDIES[0];
  const nextStudy = CASE_STUDIES.find((s) => s.slug === study.outcome.nextSlug) || CASE_STUDIES[0];

  return (
    <article className="max-w-4xl mx-auto space-y-8 animate-fade-in font-sans pb-12">
      {/* Back Button */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs font-medium text-slate-400 hover:text-white transition px-3 py-1.5 rounded-md bg-white/5 hover:bg-white/10 border border-white/10"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Portfolio Overview</span>
        </button>

        <span className="text-[11px] font-mono text-cyan-400 border border-cyan-500/20 px-2 py-0.5 rounded bg-cyan-500/5">
          Case Study: {study.title}
        </span>
      </div>

      {/* ━━ 1. HEADER ━━ */}
      <header className="space-y-4 border-b border-white/10 pb-8">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="status-pill status-pill-blue font-mono">{study.year}</span>
          <span className="status-pill status-pill-emerald font-mono">{study.role}</span>
          <span className="text-slate-400 text-xs font-mono">{study.stack}</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
          {study.title}
        </h1>
        <p className="text-lg sm:text-xl text-slate-300 font-medium">
          {study.headline}
        </p>

        {/* Hero Metric Banner */}
        <div className="p-4 rounded-xl bg-gradient-to-r from-cyan-950/40 to-blue-950/20 border border-cyan-500/30 flex items-center justify-between gap-4">
          <div>
            <div className="text-3xl font-extrabold text-cyan-400 font-mono">
              {study.heroMetric}
            </div>
            <div className="text-xs text-slate-300 font-medium">
              {study.metricLabel}
            </div>
          </div>
          <Award className="w-8 h-8 text-cyan-400/80 shrink-0" />
        </div>
      </header>

      {/* ━━ 2. OVERVIEW (30 SECONDS TO READ) ━━ */}
      <section className="enterprise-card p-6 space-y-4 bg-[#0e1526]">
        <h2 className="text-xs uppercase tracking-wider font-bold text-cyan-400">
          Executive Summary
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs leading-relaxed">
          <div className="space-y-1">
            <span className="font-semibold text-slate-200">The Problem:</span>
            <p className="text-slate-400">{study.overview.problem}</p>
          </div>
          <div className="space-y-1">
            <span className="font-semibold text-slate-200">The Solution:</span>
            <p className="text-slate-400">{study.overview.solution}</p>
          </div>
          <div className="space-y-1">
            <span className="font-semibold text-slate-200">The Key Result:</span>
            <p className="text-emerald-400 font-medium">{study.overview.result}</p>
          </div>
          <div className="space-y-1">
            <span className="font-semibold text-slate-200">My Role:</span>
            <p className="text-slate-400">{study.overview.role}</p>
          </div>
        </div>
      </section>

      {/* ━━ 3. CONTEXT (WHY THIS MATTERED) ━━ */}
      <section className="space-y-3">
        <h2 className="text-sm font-bold text-white flex items-center gap-2">
          <Shield className="w-4 h-4 text-blue-400" />
          <span>Operational Context & Vulnerability Landscape</span>
        </h2>
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
          {study.context}
        </p>
      </section>

      {/* ━━ 4. PROCESS & THE INTERESTING PART ━━ */}
      <section className="space-y-4">
        <h2 className="text-sm font-bold text-white flex items-center gap-2">
          <Layers className="w-4 h-4 text-purple-400" />
          <span>Engineering Decisions & Architecture</span>
        </h2>
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
          {study.process.decision}
        </p>

        {/* CALLOUT BOX COMPONENT (LAYER 7 SPEC) */}
        <div className="callout-box my-4">
          <p className="text-slate-200 font-medium text-xs sm:text-sm leading-relaxed">
            {study.process.insight}
          </p>
        </div>

        {/* CODE SNIPPET (KEY DECISION) */}
        <div className="rounded-lg bg-[#080d18] border border-white/10 p-4 font-mono text-xs overflow-x-auto text-slate-200 shadow-inner">
          <div className="text-[11px] text-slate-500 mb-2">// Critical Implementation Snippet</div>
          <pre>{study.process.snippet}</pre>
        </div>
      </section>

      {/* ━━ 5. OUTCOME ━━ */}
      <section className="enterprise-card p-6 bg-[#0e1526] space-y-4">
        <h2 className="text-xs uppercase tracking-wider font-bold text-emerald-400">
          Impact & Deliverables
        </h2>
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
          {study.outcome.enabled}
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <a
            href="https://github.com/anishanandhan"
            target="_blank"
            rel="noreferrer"
            className="px-3.5 py-1.5 rounded-md bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-medium flex items-center gap-1.5 transition"
          >
            <GithubIcon className="w-3.5 h-3.5" />
            <span>GitHub Repository</span>
          </a>
        </div>
      </section>

      {/* ━━ 6. NEXT PROJECT READING LOOP (LAYER 7 SPEC) ━━ */}
      <section className="pt-4 border-t border-white/10">
        <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
          Next Case Study
        </div>
        <button
          onClick={() => onSelectSlug(nextStudy.slug)}
          className="w-full p-5 rounded-xl bg-gradient-to-r from-[#12192c] to-[#0c1220] border border-white/10 hover:border-cyan-500/40 transition group text-left flex items-center justify-between gap-4"
        >
          <div>
            <div className="text-xs text-cyan-400 font-mono">Next Project →</div>
            <h3 className="text-base sm:text-lg font-bold text-white group-hover:text-cyan-300 transition">
              {nextStudy.title} — {nextStudy.headline}
            </h3>
            <p className="text-xs text-slate-400 mt-1">{nextStudy.overview.result}</p>
          </div>
          <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-cyan-400 group-hover:translate-x-1 transition shrink-0" />
        </button>
      </section>
    </article>
  );
}
