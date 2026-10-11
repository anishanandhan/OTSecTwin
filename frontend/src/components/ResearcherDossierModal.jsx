import React from "react";
import { X, ExternalLink, Award, BookOpen, Briefcase, GraduationCap, Github, Linkedin, Mail, Calendar, ArrowRight, ShieldCheck, CheckCircle2, Sparkles, Terminal } from "lucide-react";

export default function ResearcherDossierModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div 
        className="bg-[#0e1424] border border-white/10 rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col text-slate-100"
        role="dialog"
        aria-modal="true"
        aria-labelledby="dossier-title"
      >
        {/* Header Bar */}
        <div className="sticky top-0 z-10 bg-[#0e1424]/95 backdrop-blur border-b border-white/10 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center font-bold">
              AA
            </div>
            <div>
              <h2 id="dossier-title" className="text-base font-bold text-white flex items-center gap-2">
                <span>Anish Anandhan</span>
                <span className="status-pill status-pill-blue text-[10px] font-mono">IIT Madras CyStar</span>
                <span className="status-pill status-pill-emerald text-[10px] font-mono">Medtronic 2026</span>
              </h2>
              <p className="text-xs text-slate-400">
                Cybersecurity Researcher & Autonomous AI Systems Engineer
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-white/5 rounded-md transition"
            aria-label="Close dossier"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 text-sm">
          {/* Bio Headline & Core Value */}
          <div className="p-4 rounded-lg bg-[#141c30] border border-blue-500/20 space-y-2">
            <div className="text-xs uppercase tracking-wider font-semibold text-blue-400">
              Researcher Provenance & Core Specialization
            </div>
            <p className="text-slate-200 text-sm leading-relaxed">
              Cybersecurity researcher at <strong className="text-white">IIT Madras CyStar</strong> and incoming Software Engineer at <strong className="text-white">Medtronic Global IT</strong>. Specializes in autonomous multi-agent systems, operational technology (OT) cyber-physical protection, and zero-loss industrial telemetry forensics.
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-2 text-xs text-slate-400">
              <span className="flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-amber-400" />
                <span>97.5/100 Benchmark Rating</span>
              </span>
              <span className="text-slate-600">•</span>
              <span className="flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-blue-400" />
                <span>IEEE Published Researcher</span>
              </span>
              <span className="text-slate-600">•</span>
              <span className="flex items-center gap-1.5">
                <GraduationCap className="w-3.5 h-3.5 text-cyan-400" />
                <span>Vellore Institute of Technology (VIT)</span>
              </span>
            </div>
          </div>

          {/* CURRENTLY SECTION */}
          <div className="p-4 rounded-lg bg-[#101728] border border-white/10 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Right Now I Am</span>
              </div>
              <span className="text-[11px] font-mono text-slate-400">Updated: October 2026</span>
            </div>
            <ul className="space-y-2 text-xs text-slate-300">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
                <span>
                  <strong>IIT Madras CyStar:</strong> Engineering autonomous threat correlation pipelines and cyber-physical digital twin ODEs for critical infrastructure.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
                <span>
                  <strong>Medtronic Global IT:</strong> Joining as Software Engineer focusing on high-reliability distributed systems and compliance architectures.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
                <span>
                  <strong>OTSecTwin & Seryth:</strong> Architecting edge-deployed ICS passive defense systems and multi-agent AI personalization platforms.
                </span>
              </li>
            </ul>
          </div>

          {/* SELECTED WORK & PROJECTS */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Selected Engineered Systems
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Project 1 */}
              <div className="p-4 rounded-lg bg-[#101728] border border-white/10 hover:border-blue-500/30 transition space-y-2.5">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-white text-sm">OTSecTwin</h4>
                  <span className="status-pill status-pill-blue font-mono text-[10px]">97.5/100 Benchmark</span>
                </div>
                <p className="text-xs text-slate-300">
                  Zero-loss passive OT asset intelligence and real-time cyber-physical digital twin engine. Detects Stuxnet and Oldsmar manipulation without intrusive scans.
                </p>
                <div className="text-[11px] font-mono text-slate-400">
                  FastAPI • React • Modbus TCP • MITRE ATT&CK for ICS
                </div>
                <div className="pt-1 flex items-center gap-2">
                  <a
                    href="https://github.com/anishanandhan/OTSecTwin"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300"
                  >
                    <span>View Repository</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>

              {/* Project 2 */}
              <div className="p-4 rounded-lg bg-[#101728] border border-white/10 hover:border-blue-500/30 transition space-y-2.5">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-white text-sm">Seryth AI</h4>
                  <span className="status-pill status-pill-emerald font-mono text-[10px]">Multi-Agent</span>
                </div>
                <p className="text-xs text-slate-300">
                  Generative olfactory AI personalization engine that converts emotional and contextual inputs into precise molecular fragrance formulation profiles.
                </p>
                <div className="text-[11px] font-mono text-slate-400">
                  Agentic Workflows • Python • Vector Embeddings
                </div>
                <div className="pt-1 flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 text-xs text-emerald-400">
                    <span>Proprietary Architecture</span>
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* RESEARCH & IEEE PUBLICATIONS */}
          <div className="p-4 rounded-lg bg-[#101728] border border-white/10 space-y-2.5">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <BookOpen className="w-3.5 h-3.5 text-blue-400" />
                <span>Research & IEEE Publications</span>
              </h3>
              <span className="status-pill status-pill-blue font-mono text-[10px]">Peer-Reviewed</span>
            </div>
            <p className="text-xs text-slate-300">
              Co-author on industrial cyber-physical resilience, multi-agent AI security, and protocol-level ICS anomaly identification.
            </p>
            <div className="p-3 rounded bg-[#0b0f19] border border-white/5 space-y-1">
              <div className="text-xs font-semibold text-white">
                "Behavioral Fingerprinting and Cyber-Physical Telemetry Baselines in Modbus Industrial Environments"
              </div>
              <div className="text-[11px] text-slate-400">
                IEEE Industrial Electronics Society / CyStar Research Group
              </div>
            </div>
          </div>

          {/* ACTIONABLE CONTACT & SOCIALS */}
          <div className="p-4 rounded-lg bg-[#141c30] border border-blue-500/20 flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="text-xs font-semibold text-white">Open to Technical Collaboration</div>
              <p className="text-xs text-slate-400 mt-0.5">
                Reach out for enterprise OT security evaluation, research exchange, or speaking engagements.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <a
                href="https://github.com/anishanandhan"
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 rounded-md bg-[#0e1424] hover:bg-[#1a233a] border border-white/10 text-white text-xs font-medium flex items-center gap-1.5 transition"
              >
                <Github className="w-3.5 h-3.5" />
                <span>GitHub</span>
              </a>
              <a
                href="https://linkedin.com/in/anishanandhan"
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 rounded-md bg-[#0e1424] hover:bg-[#1a233a] border border-white/10 text-white text-xs font-medium flex items-center gap-1.5 transition"
              >
                <Linkedin className="w-3.5 h-3.5 text-blue-400" />
                <span>LinkedIn</span>
              </a>
              <a
                href="mailto:anishanandhan@gmail.com"
                className="px-3.5 py-1.5 rounded-md bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1.5 transition shadow-sm"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Get in Touch</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
