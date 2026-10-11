import React, { useState } from "react";
import { BookOpen, Sparkles, MessageSquare, Share2, Tag, ArrowRight, ExternalLink, CheckCircle2, Copy, Check } from "lucide-react";
import { trackEvent } from "../utils/analytics";

export default function ContentEngineView({ onSelectCaseStudy }) {
  const [activeFilter, setActiveFilter] = useState("all");
  const [copiedId, setCopiedId] = useState(null);

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    trackEvent("Template Copied", { templateId: id });
    setTimeout(() => setCopiedId(null), 2500);
  };

  const articles = [
    {
      id: "art-1",
      type: "opinion",
      typeLabel: "Opinion Piece",
      title: "Why mutation testing beats test coverage metrics for AI systems",
      readTime: "4 min read",
      date: "October 2026",
      summary: "Traditional line coverage tells you which lines ran, not whether your model caught edge-case crowd stampedes. In SentStadium, mutation testing uncovered 14 silent clustering failures that 98% branch coverage missed completely.",
      tags: ["AI Systems", "Mutation Testing", "Reliability"],
      actionLabel: "Read Writeup",
      caseStudySlug: "sentstadium"
    },
    {
      id: "art-2",
      type: "micro",
      typeLabel: "Micro Learning",
      title: "The IOCTL Dispatch Trap: Why SHA256 hashes fail against BYOVD malware",
      readTime: "2 min read",
      date: "September 2026",
      summary: "I thought static hash blocklists were enough for known vulnerable drivers. Turns out attackers mutate non-code PE headers to generate new SHA256s while keeping the same MmMapIoSpace dispatch opcode. Auditing IOCTL control codes is the only durable defense.",
      tags: ["BYOVD", "Kernel Security", "CyStar"],
      actionLabel: "View Case Study",
      caseStudySlug: "driverarmory"
    },
    {
      id: "art-3",
      type: "opinion",
      typeLabel: "Opinion Piece",
      title: "What a 97.5/100 AI hackathon score actually measures",
      readTime: "5 min read",
      date: "August 2026",
      summary: "Hackathon judges see 50 generic LangChain wrappers. What separates a 97.5 score from a 75 is empirical error handling: proving your system survives simulated network loss, degraded sensor inputs, and adversarial prompt injections.",
      tags: ["Hackathons", "Systems Engineering", "Validation"],
      actionLabel: "Read Architecture",
      caseStudySlug: "sentstadium"
    },
    {
      id: "art-4",
      type: "writeup",
      typeLabel: "Project Writeup",
      title: "Zero-Downtime OT Defense: Modeling water plant physics in differential equations",
      readTime: "6 min read",
      date: "July 2026",
      summary: "How we built OTSecTwin to catch Stuxnet overfills and Oldsmar pH poisoning on live Modbus networks without injecting a single active network probe.",
      tags: ["OT Security", "ICS", "Digital Twin"],
      actionLabel: "Explore Digital Twin",
      caseStudySlug: "otsectwin"
    }
  ];

  const filtered = activeFilter === "all" ? articles : articles.filter(a => a.type === activeFilter);

  return (
    <div className="max-w-4xl mx-auto space-y-8 font-sans pb-12 animate-fade-in">
      {/* Header */}
      <div className="border-b border-white/10 pb-4 space-y-2">
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-cyan-400" />
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Content Engine & Technical Insights
          </h1>
        </div>
        <p className="text-xs sm:text-sm text-slate-300">
          A living archive of engineering writeups, CyStar security findings, and empirical systems lessons.
        </p>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-2">
          {["all", "opinion", "micro", "writeup"].map((f) => (
            <button
              key={f}
              onClick={() => {
                setActiveFilter(f);
                trackEvent("Content Filter Changed", { filter: f });
              }}
              className={`px-3 py-1 rounded-md text-xs font-medium capitalize transition ${
                activeFilter === f
                  ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
                  : "bg-white/5 text-slate-400 hover:text-white border border-white/5"
              }`}
            >
              {f === "all" ? "All Content" : f === "opinion" ? "Opinion Pieces" : f === "micro" ? "Micro Learnings" : "Project Writeups"}
            </button>
          ))}
        </div>
      </div>

      {/* Articles Feed */}
      <div className="space-y-4">
        {filtered.map((item) => (
          <div
            key={item.id}
            className="enterprise-card p-6 bg-[#0c1220] hover:bg-[#101729] border border-white/10 hover:border-cyan-500/30 transition rounded-xl space-y-3"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className={`status-pill ${item.type === 'opinion' ? 'status-pill-purple' : item.type === 'micro' ? 'status-pill-emerald' : 'status-pill-blue'} font-mono text-[10px]`}>
                {item.typeLabel}
              </span>
              <span className="text-[11px] font-mono text-slate-400">
                {item.date} • {item.readTime}
              </span>
            </div>

            <h2 className="text-base sm:text-lg font-bold text-white hover:text-cyan-300 transition">
              {item.title}
            </h2>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              {item.summary}
            </p>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-white/5">
              <div className="flex flex-wrap items-center gap-1.5">
                {item.tags.map(t => (
                  <span key={t} className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 text-slate-400">
                    #{t}
                  </span>
                ))}
              </div>

              <button
                onClick={() => {
                  trackEvent("Article Action Clicked", { article: item.title });
                  onSelectCaseStudy(item.caseStudySlug);
                }}
                className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1.5 transition"
              >
                <span>{item.actionLabel}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* ━━ SEO NICHE KEYWORDS AUDIT (LAYER 11) ━━ */}
      <section className="p-5 rounded-xl bg-[#090f1d] border border-cyan-500/20 space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
          <Tag className="w-3.5 h-3.5" />
          <span>SEO Long-Tail Keyword Dominance Plan</span>
        </h3>
        <p className="text-xs text-slate-300">
          Targeting specific, uncrowded search terms where first-page ranking is guaranteed:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 pt-1">
          {[
            { term: "anish anandhan", comp: "Zero Competition", target: "Personal Domain & Papers" },
            { term: "cyber-physical digital twin ICS", comp: "High Intent", target: "Platform Architecture" },
            { term: "BYOVD driver database", comp: "Very Niche", target: "DriverArmory Repository" },
            { term: "SentStadium hackathon", comp: "Zero Competition", target: "AI Architecture Writeup" },
            { term: "DriverArmory BYOVD", comp: "Zero Competition", target: "Kernel Security Analysis" },
            { term: "OTSecTwin Modbus twin", comp: "Zero Competition", target: "ICS Defense Platform" },
          ].map(k => (
            <div key={k.term} className="p-2.5 rounded bg-black/30 border border-white/5 flex flex-col justify-between">
              <span className="text-xs font-mono font-semibold text-white">"{k.term}"</span>
              <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1 font-mono">
                <span className="text-emerald-400">{k.comp}</span>
                <span>{k.target}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ━━ DISTRIBUTION ENGINE CHEATSHEET (LAYER 12) ━━ */}
      <section className="p-5 rounded-xl bg-[#0e1628] border border-white/10 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2">
            <Share2 className="w-4 h-4 text-blue-400" />
            <span>High-ROI Distribution Playbooks (LinkedIn & HackerNews)</span>
          </h3>
          <span className="text-[10px] font-mono text-slate-400">Tuesday-Thursday 8-10am IST</span>
        </div>

        <div className="p-3.5 rounded bg-black/30 border border-white/5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-cyan-300">LinkedIn High-Engagement 3-Paragraph Formula</span>
            <button
              onClick={() => copyToClipboard(`Most crowd monitoring tools fail during stampedes because they rely on 3-4 minute human review loops.\n\nAt SentStadium, we replaced traditional optical flow with spatial density clustering and mutation-tested the inference against emergency strobes.\n\nResult: 1.8-second alert latency and a 97.5/100 national score. Case study live on anishanandhan.dev`, "li-template")}
              className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1 transition"
            >
              {copiedId === "li-template" ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              <span>{copiedId === "li-template" ? "Copied" : "Copy Template"}</span>
            </button>
          </div>
          <p className="text-xs text-slate-300 font-mono text-[11px] whitespace-pre-line leading-relaxed">
            {`P1 (Problem): Most crowd monitoring tools fail during stampedes because they rely on 3-4 minute human review loops.\nP2 (What built): Replaced traditional optical flow with spatial density clustering and mutation-tested against emergency strobes.\nP3 (Result): 1.8-second alert latency and 97.5/100 score. Case study live on anishanandhan.dev`}
          </p>
        </div>
      </section>
    </div>
  );
}
