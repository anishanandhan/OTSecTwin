import React, { useState, useEffect } from "react";
import ParticleNetwork from "./ParticleNetwork";
import CaseStudyView, { CASE_STUDIES } from "./CaseStudyView";
import ContentEngineView from "./ContentEngineView";
import MaintenanceSystemModal from "./MaintenanceSystemModal";
import { useScrambleText, useCurrentlyCycle, useCountUp } from "../utils/effects";
import { trackEvent, getABVariant } from "../utils/analytics";
import { 
  ArrowRight, ExternalLink, Github, Linkedin, Mail, BookOpen, Award, 
  ShieldCheck, Cpu, Code2, Layers, CheckCircle2, Terminal, Sparkles, Sliders, Wrench, Newspaper
} from "lucide-react";

export default function PortfolioHub({ onNavigateToPlantLab }) {
  const [selectedCaseStudy, setSelectedCaseStudy] = useState(null);
  const [activeSubTab, setActiveSubTab] = useState("overview"); // "overview" | "content_engine"
  const [isMaintenanceOpen, setIsMaintenanceOpen] = useState(false);
  const [headlineVariant, setHeadlineVariant] = useState("A");

  // Layer 10: Zero-Dependency A/B Testing Variant Split
  useEffect(() => {
    const variant = getABVariant("hero_headline", ["A", "B"]);
    setHeadlineVariant(variant);
    trackEvent("Hero Variant Loaded", { variant });
  }, []);

  // Layer 6 & 9: Currently Cycling Typewriter
  const currentlyItems = [
    "Building CrystalSliver at IIT Madras CyStar",
    "Shipping SentStadium — 97.5/100 AI score",
    "Joining Medtronic Global IT · Hyderabad · 2026",
    "Growing Seryth — AI fragrance personalization",
    "Engineering OTSecTwin zero-downtime ICS defense"
  ];
  const currentlyText = useCurrentlyCycle(currentlyItems, 3500);

  // Layer 6: Scramble Hook on Main Headline
  const { displayText: heroBadge, triggerScramble: scrambleBadge } = useScrambleText("AI_SECURITY_ENGINEERING");

  // Layer 6: Count-up Animated Metric
  const hackathonScore = useCountUp(97.5, 1200, 1);
  const driverCount = useCountUp(40, 1000, 0);

  if (selectedCaseStudy) {
    return (
      <CaseStudyView
        slug={selectedCaseStudy}
        onBack={() => {
          trackEvent("Case Study Closed", { project: selectedCaseStudy });
          setSelectedCaseStudy(null);
        }}
        onSelectSlug={(slug) => {
          trackEvent("Next Case Study Viewed", { project: slug });
          setSelectedCaseStudy(slug);
        }}
      />
    );
  }

  return (
    <div className="space-y-12 font-sans pb-16">
      {/* Maintenance System Modal (Layer 13) */}
      <MaintenanceSystemModal
        isOpen={isMaintenanceOpen}
        onClose={() => setIsMaintenanceOpen(false)}
      />

      {/* Top Dossier Subnavigation Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveSubTab("overview")}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition ${
              activeSubTab === "overview"
                ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>Engineer Dossier & Projects</span>
          </button>

          <button
            onClick={() => {
              setActiveSubTab("content_engine");
              trackEvent("Content Engine Tab Opened");
            }}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition ${
              activeSubTab === "content_engine"
                ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Newspaper className="w-3.5 h-3.5" />
            <span>Content Engine & Writeups</span>
          </button>
        </div>

        <button
          onClick={() => {
            setIsMaintenanceOpen(true);
            trackEvent("Maintenance Checklist Opened");
          }}
          className="text-xs text-slate-400 hover:text-cyan-400 flex items-center gap-1.5 transition px-2.5 py-1 rounded bg-white/5 border border-white/5"
          title="Quarterly Site Health & SEO Audit Checklist"
        >
          <Wrench className="w-3.5 h-3.5" />
          <span>Quarterly Audit Protocol</span>
        </button>
      </div>

      {activeSubTab === "content_engine" ? (
        <ContentEngineView onSelectCaseStudy={(slug) => setSelectedCaseStudy(slug)} />
      ) : (
        <>
          {/* ━━ HERO SECTION (LAYER 6 IT-FACTOR & LAYER 9 ANISH ANANDHAN) ━━ */}
          <section className="relative overflow-hidden rounded-2xl border border-cyan-500/20 bg-gradient-to-b from-[#090f1d] via-[#080d1a] to-[#070b14] p-8 md:p-12 noise-overlay">
            {/* Interactive Canvas Particle Network (Layer 6) */}
            <ParticleNetwork className="opacity-75" />

            <div className="relative z-10 max-w-4xl space-y-6">
              {/* Scramble Tech Badge */}
              <div className="inline-flex items-center gap-2">
                <span
                  onMouseEnter={scrambleBadge}
                  className="px-2.5 py-1 rounded bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 font-mono text-xs cursor-pointer select-none transition hover:bg-cyan-500/20"
                  title="Hover to scramble"
                >
                  &gt; {heroBadge}
                </span>
                <span className="text-slate-400 text-xs font-mono">IIT Madras CyStar · IEEE Author</span>
                <span className="status-pill status-pill-cyan text-[10px] font-mono">Test Variant {headlineVariant}</span>
              </div>

              {/* Hero Headline (Layer 9 & Layer 10 A/B Test Variant) */}
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.1]">
                {headlineVariant === "B" ? (
                  <>Multi-agent AI. Adversarial research. <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">Shipping at scale.</span></>
                ) : (
                  <>I build AI systems that operate where <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">security matters.</span></>
                )}
              </h1>

              {/* Subheadline (Layer 9) */}
              <p className="text-base sm:text-lg text-slate-300 max-w-2xl leading-relaxed font-normal">
                Research intern at <strong className="text-white">IIT Madras CyStar</strong> · IEEE author · Joining <strong className="text-white">Medtronic Global IT</strong> · Co-founder at <strong className="text-white">Seryth</strong>.
              </p>

              {/* Trust Institutional Marks (Layer 9: Grayscale 28px height) */}
              <div className="pt-2 flex flex-wrap items-center gap-6 sm:gap-8 border-t border-white/5 pt-4 text-xs font-mono text-slate-400">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-cyan-400" />
                  <span>IIT MADRAS CYSTAR</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-400" />
                  <span>MEDTRONIC GLOBAL IT</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-purple-400" />
                  <span>IEEE PUBLISHED</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span>VIT CHENNAI</span>
                </div>
              </div>

              {/* CTA Action Triggers */}
              <div className="pt-2 flex flex-wrap items-center gap-3">
                <a
                  href="#projects"
                  onClick={() => trackEvent("CTA Clicked", { location: "hero", destination: "projects" })}
                  className="px-4 py-2.5 rounded-md bg-cyan-500 hover:bg-cyan-400 text-black font-semibold text-xs transition shadow-lg shadow-cyan-500/20 flex items-center gap-2"
                >
                  <span>See My Work</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </a>
                <a
                  href="#research"
                  onClick={() => trackEvent("CTA Clicked", { location: "hero", destination: "research" })}
                  className="px-4 py-2.5 rounded-md bg-[#131b2e] hover:bg-[#1a253f] border border-white/10 text-slate-200 font-semibold text-xs transition flex items-center gap-2"
                >
                  <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Read My Research</span>
                </a>
                <button
                  onClick={() => {
                    trackEvent("CTA Clicked", { location: "hero", destination: "simulator" });
                    onNavigateToPlantLab();
                  }}
                  className="px-4 py-2.5 rounded-md bg-transparent hover:bg-white/5 border border-white/10 text-slate-300 font-medium text-xs transition flex items-center gap-2"
                >
                  <Sliders className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Open OTSecTwin Plant Lab</span>
                </button>
              </div>
            </div>
          </section>

          {/* ━━ CURRENTLY SECTION (LAYER 6 & LAYER 9 SPEC) ━━ */}
          <section className="p-4 rounded-xl bg-[#0c1220] border border-cyan-500/20 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[11px] font-mono font-semibold shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                CURRENTLY
              </span>
              <div className="text-xs sm:text-sm font-mono text-slate-200">
                <span className="text-cyan-400">&gt; </span>
                <span>{currentlyText}</span>
                <span className="inline-block w-2 h-3.5 bg-cyan-400 ml-1 animate-pulse" />
              </div>
            </div>

            <div className="text-[11px] font-mono text-slate-400">
              Updated: October 2026
            </div>
          </section>

          {/* ━━ SELECTED WORK / CASE STUDIES (LAYER 7 & LAYER 9) ━━ */}
          <section id="projects" className="space-y-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                  <Code2 className="w-5 h-5 text-cyan-400" />
                  <span>Selected Projects & Engineering Case Studies</span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Deep-dive case studies covering architectural decisions, mutation tests, and quantifiable impact.
                </p>
              </div>
              <span className="text-xs font-mono text-cyan-400">3 Pinned Systems</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Card 1: SentStadium */}
              <div 
                onClick={() => {
                  trackEvent("Project Viewed", { project: "SentStadium" });
                  setSelectedCaseStudy("sentstadium");
                }}
                className="enterprise-card p-6 bg-[#0c1220] hover:bg-[#101729] border border-white/10 hover:border-cyan-500/40 rounded-xl transition cursor-pointer group flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="status-pill status-pill-blue font-mono text-[10px]">Hackathon Winner</span>
                    <span className="text-2xl font-bold font-mono text-cyan-400">{hackathonScore} / 100</span>
                  </div>
                  <h3 className="text-base font-bold text-white group-hover:text-cyan-300 transition">
                    SentStadium
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Stadium crowd safety AI. Real-time heat + density spatial monitoring with automated anomaly alerts dispatched in under 2 seconds.
                  </p>
                  <div className="text-[11px] font-mono text-slate-400">
                    Python · FastAPI · React · GCP · OpenCV
                  </div>
                </div>

                <div className="pt-4 border-t border-white/5 flex items-center justify-between text-xs font-semibold text-cyan-400">
                  <span>Read Full Case Study</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
                </div>
              </div>

              {/* Card 2: DriverArmory */}
              <div 
                onClick={() => {
                  trackEvent("Project Viewed", { project: "DriverArmory" });
                  setSelectedCaseStudy("driverarmory");
                }}
                className="enterprise-card p-6 bg-[#0c1220] hover:bg-[#101729] border border-white/10 hover:border-cyan-500/40 rounded-xl transition cursor-pointer group flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="status-pill status-pill-emerald font-mono text-[10px]">IIT Madras CyStar</span>
                    <span className="text-2xl font-bold font-mono text-cyan-400">{driverCount}+ Drivers</span>
                  </div>
                  <h3 className="text-base font-bold text-white group-hover:text-cyan-300 transition">
                    DriverArmory
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    BYOVD adversarial threat intelligence. C2-integrated driver analysis database indexing vulnerable signed drivers to defend Ring 0.
                  </p>
                  <div className="text-[11px] font-mono text-slate-400">
                    Python · Splunk · NetworkX · Ghidra
                  </div>
                </div>

                <div className="pt-4 border-t border-white/5 flex items-center justify-between text-xs font-semibold text-cyan-400">
                  <span>Read Full Case Study</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
                </div>
              </div>

              {/* Card 3: OTSecTwin */}
              <div 
                onClick={() => {
                  trackEvent("Project Viewed", { project: "OTSecTwin" });
                  setSelectedCaseStudy("otsectwin");
                }}
                className="enterprise-card p-6 bg-[#0c1220] hover:bg-[#101729] border border-white/10 hover:border-cyan-500/40 rounded-xl transition cursor-pointer group flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="status-pill status-pill-amber font-mono text-[10px]">Critical Infrastructure</span>
                    <span className="text-2xl font-bold font-mono text-cyan-400">0ms Delay</span>
                  </div>
                  <h3 className="text-base font-bold text-white group-hover:text-cyan-300 transition">
                    OTSecTwin & LabShock
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Zero-downtime cyber-physical digital twin engine. Simulates water treatment hydraulics to catch Stuxnet overfills and Oldsmar pH poisoning.
                  </p>
                  <div className="text-[11px] font-mono text-slate-400">
                    FastAPI · React · Modbus TCP · Docker
                  </div>
                </div>

                <div className="pt-4 border-t border-white/5 flex items-center justify-between text-xs font-semibold text-cyan-400">
                  <span>Read Full Case Study</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
                </div>
              </div>
            </div>
          </section>

          {/* ━━ RESEARCH & IEEE PUBLICATIONS (LAYER 9) ━━ */}
          <section id="research" className="space-y-4">
            <div className="border-b border-white/10 pb-3">
              <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-purple-400" />
                <span>Research & IEEE Publications</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Peer-reviewed papers exploring cyber-physical attack resilience and autonomous agent security.
              </p>
            </div>

            <div className="space-y-4">
              <div className="enterprise-card p-5 bg-[#0c1220] border border-white/10 rounded-xl space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="status-pill status-pill-purple font-mono text-[10px]">
                    IEEE Industrial Electronics Society · 2026
                  </span>
                  <span className="text-[11px] font-mono text-cyan-400">IIT Madras CyStar</span>
                </div>

                <h3 className="text-sm sm:text-base font-bold text-white">
                  "Behavioral Fingerprinting and Cyber-Physical Telemetry Baselines in Modbus Industrial Environments"
                </h3>

                <p className="text-xs text-slate-300 leading-relaxed">
                  Presents an empirical methodology for passive Purdue Model Level 0-3 telemetry extraction, demonstrating that differential equation digital twins reliably isolate sensor spoofing without generating invasive probe packets.
                </p>

                <div className="flex items-center gap-3 pt-1">
                  <a
                    href="https://github.com/anishanandhan/OTSecTwin"
                    target="_blank"
                    rel="noreferrer"
                    onClick={() => trackEvent("Research Paper Opened", { paper: "Modbus Telemetry Baselines" })}
                    className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1 transition"
                  >
                    <span>Read Abstract & Paper</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                  <span className="text-slate-600">•</span>
                  <a
                    href="https://github.com/anishanandhan/OTSecTwin"
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-slate-400 hover:text-white flex items-center gap-1 transition"
                  >
                    <Github className="w-3 h-3" />
                    <span>Code Repository</span>
                  </a>
                </div>
              </div>
            </div>
          </section>

          {/* ━━ TECH STACK NARRATIVE & 3 COLUMNS (LAYER 9 SPEC) ━━ */}
          <section className="space-y-4">
            <div className="border-b border-white/10 pb-3">
              <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                <Cpu className="w-5 h-5 text-cyan-400" />
                <span>Technical Capabilities & Philosophy</span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 italic mt-1 leading-relaxed">
                "I work across Python, FastAPI, React, and Next.js for applications — Splunk, NetworkX, and multi-agent frameworks for intelligence systems — and GCP + Docker for anything that needs to scale."
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-[#0c1220] border border-white/10 space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-400">
                  1. Application Engineering
                </h3>
                <ul className="text-xs text-slate-300 space-y-1 font-mono">
                  <li>• Python / FastAPI / Uvicorn</li>
                  <li>• React 19 / Vite / Tailwind CSS</li>
                  <li>• WebSocket & SSE Streaming</li>
                  <li>• SQLite / PostgreSQL / Redis</li>
                </ul>
              </div>

              <div className="p-4 rounded-xl bg-[#0c1220] border border-white/10 space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-blue-400">
                  2. Threat Intelligence & AI
                </h3>
                <ul className="text-xs text-slate-300 space-y-1 font-mono">
                  <li>• Multi-Agent Systems & LLM Tool Use</li>
                  <li>• Modbus TCP / ICS Deep Packet Inspection</li>
                  <li>• Splunk SPL / NetworkX Graph Models</li>
                  <li>• Differential Equation Plant Digital Twins</li>
                </ul>
              </div>

              <div className="p-4 rounded-xl bg-[#0c1220] border border-white/10 space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-purple-400">
                  3. Infrastructure & Resilience
                </h3>
                <ul className="text-xs text-slate-300 space-y-1 font-mono">
                  <li>• Google Cloud Platform (GCP)</li>
                  <li>• Docker & Multi-Container Compose</li>
                  <li>• Purdue Model (ISA-95) Demarcation</li>
                  <li>• NIST SP 800-82r3 Compliance</li>
                </ul>
              </div>
            </div>
          </section>

          {/* ━━ AWARDS, HACKATHONS & CREDENTIALS (LAYER 9) ━━ */}
          <section className="space-y-4">
            <div className="border-b border-white/10 pb-3">
              <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-400" />
                <span>Honors, Hackathons & Professional Credentials</span>
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-[#0c1220] border border-white/10 space-y-1">
                <div className="text-2xl font-bold font-mono text-amber-400">97.5 / 100</div>
                <div className="text-xs font-semibold text-white">National AI Hackathon Winner</div>
                <p className="text-[11px] text-slate-400">SentStadium Crowd Safety Vision</p>
              </div>

              <div className="p-4 rounded-xl bg-[#0c1220] border border-white/10 space-y-1">
                <div className="text-2xl font-bold font-mono text-cyan-400">93.78 / 100</div>
                <div className="text-xs font-semibold text-white">Cyber Defense Track Finalist</div>
                <p className="text-[11px] text-slate-400">Adversarial C2 & BYOVD Detection</p>
              </div>

              <div className="p-4 rounded-xl bg-[#0c1220] border border-white/10 space-y-1">
                <div className="text-2xl font-bold font-mono text-emerald-400">ISC2 CC</div>
                <div className="text-xs font-semibold text-white">Certified in Cybersecurity</div>
                <p className="text-[11px] text-slate-400">Global Information Security Standard</p>
              </div>

              <div className="p-4 rounded-xl bg-[#0c1220] border border-white/10 space-y-1">
                <div className="text-2xl font-bold font-mono text-purple-400">IEEE Author</div>
                <div className="text-xs font-semibold text-white">Peer-Reviewed Publication</div>
                <p className="text-[11px] text-slate-400">Industrial Electronics Society</p>
              </div>
            </div>
          </section>

          {/* ━━ CONTACT & DIRECT OUTREACH (LAYER 9 SPEC) ━━ */}
          <section className="p-6 md:p-8 rounded-2xl bg-gradient-to-r from-[#0d162b] to-[#0a101f] border border-cyan-500/30 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2 text-center md:text-left">
              <div className="inline-flex items-center gap-2 text-xs font-mono text-cyan-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span>Open to research collaborations and speaking</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-white">
                Let's build secure intelligent systems.
              </h2>
              <p className="text-xs text-slate-400">
                Response time: Usually within 24 hours. Direct outreach over formal contact forms.
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3">
              <a
                href="mailto:anishanandhan@gmail.com"
                onClick={() => trackEvent("Contact Email Clicked")}
                className="px-4 py-2 rounded-md bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-semibold flex items-center gap-2 transition shadow-md"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>anishanandhan@gmail.com</span>
              </a>
              <a
                href="https://github.com/anishanandhan"
                target="_blank"
                rel="noreferrer"
                onClick={() => trackEvent("External Link Clicked", { destination: "GitHub" })}
                className="p-2 rounded-md bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 transition"
                title="GitHub Profile"
              >
                <Github className="w-4 h-4" />
              </a>
              <a
                href="https://linkedin.com/in/anishanandhan"
                target="_blank"
                rel="noreferrer"
                onClick={() => trackEvent("External Link Clicked", { destination: "LinkedIn" })}
                className="p-2 rounded-md bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 transition"
                title="LinkedIn Profile"
              >
                <Linkedin className="w-4 h-4 text-blue-400" />
              </a>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
