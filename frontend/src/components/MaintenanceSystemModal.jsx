import React, { useState } from "react";
import { X, CheckSquare, Square, Wrench, ShieldCheck, AlertCircle, BarChart3, RefreshCw } from "lucide-react";
import { trackEvent } from "../utils/analytics";

export default function MaintenanceSystemModal({ isOpen, onClose }) {
  const [checkedItems, setCheckedItems] = useState({
    "c-currently": true,
    "c-metrics": true,
    "c-medtronic": true,
    "c-ieee": true,
    "t-lighthouse": true,
    "t-links": true,
    "a-conversion": true,
  });

  if (!isOpen) return null;

  const toggleItem = (id) => {
    setCheckedItems(prev => {
      const updated = { ...prev, [id]: !prev[id] };
      trackEvent("Maintenance Checklist Toggled", { item: id, checked: updated[id] });
      return updated;
    });
  };

  const sections = [
    {
      title: "Content Audit (Quarterly)",
      badge: "Content Cadence",
      items: [
        { id: "c-currently", label: "Update 'Currently' section with current CyStar & Medtronic status" },
        { id: "c-metrics", label: "Add latest hackathon scores and benchmark results (97.5/100)" },
        { id: "c-medtronic", label: "Update Medtronic start dates and engineering role status" },
        { id: "c-archive", label: "Archive any legacy projects that no longer represent senior skill" },
        { id: "c-ieee", label: "Add newly accepted IEEE conference papers and preprints" },
        { id: "c-links", label: "Run broken link validator across all external GitHub & paper links" },
      ]
    },
    {
      title: "Technical & Performance Audit",
      badge: "Lighthouse & CWV",
      items: [
        { id: "t-lighthouse", label: "Run Lighthouse audit — ensure Performance, A11y, Best Practices ≥ 90" },
        { id: "t-cwv", label: "Verify Core Web Vitals (LCP < 2.5s, CLS < 0.1, INP < 200ms)" },
        { id: "t-npm", label: "Audit and update npm packages — test for breaking changes" },
        { id: "t-ssl", label: "Verify SSL certificate auto-renewal and HTTPS redirect header" },
        { id: "t-email", label: "Test 'Get in Touch' mailto trigger and recipient routing" },
        { id: "t-ctas", label: "Verify all primary CTA destinations and simulation endpoints" },
      ]
    },
    {
      title: "Analytics & Conversion Review",
      badge: "Target Benchmarks",
      items: [
        { id: "a-conversion", label: "Verify primary CTA click-through rate exceeds 8% target" },
        { id: "a-casestudy", label: "Verify at least 25% of visitors engage with deep case study views" },
        { id: "a-mobile", label: "Audit mobile bounce rate — ensure it stays below 60%" },
        { id: "a-heatmap", label: "Inspect Clarity scroll heatmaps — detect drop-offs above 60% scroll" },
      ]
    }
  ];

  const totalItems = sections.reduce((acc, s) => acc + s.items.length, 0);
  const completedCount = Object.values(checkedItems).filter(Boolean).length;
  const progressPercent = Math.round((completedCount / totalItems) * 100);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div 
        className="bg-[#0e1424] border border-white/10 rounded-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col text-slate-100"
        role="dialog"
        aria-modal="true"
        aria-labelledby="maintenance-title"
      >
        {/* Header */}
        <div className="sticky top-0 z-10 bg-[#0e1424]/95 backdrop-blur border-b border-white/10 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <h2 id="maintenance-title" className="text-base font-bold text-white flex items-center gap-2">
                <span>Site Maintenance & Audit System</span>
                <span className="status-pill status-pill-cyan font-mono text-[10px]">{progressPercent}% Audited</span>
              </h2>
              <p className="text-xs text-slate-400">
                Quarterly hygiene protocol to eliminate link rot, stale metrics, and conversion decay
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-white/5 rounded-md transition"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 text-xs">
          {/* Progress Bar */}
          <div className="p-4 rounded-lg bg-[#141c30] border border-cyan-500/20 space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-white">Quarterly Health Index</span>
              <span className="text-cyan-400 font-mono">{completedCount} of {totalItems} Tasks Completed</span>
            </div>
            <div className="w-full h-2 rounded-full bg-black/40 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-500" 
                style={{ width: `${progressPercent}%` }} 
              />
            </div>
          </div>

          {/* Checklist Sections */}
          <div className="space-y-5">
            {sections.map(sec => (
              <div key={sec.title} className="p-4 rounded-lg bg-[#101728] border border-white/5 space-y-3">
                <div className="flex items-center justify-between border-b border-white/5 pb-2">
                  <span className="text-xs font-bold text-white uppercase tracking-wider">{sec.title}</span>
                  <span className="text-[10px] font-mono text-cyan-400">{sec.badge}</span>
                </div>

                <div className="space-y-2">
                  {sec.items.map(it => {
                    const isChecked = !!checkedItems[it.id];
                    return (
                      <button
                        key={it.id}
                        onClick={() => toggleItem(it.id)}
                        className="w-full flex items-start gap-2.5 text-left p-1.5 rounded hover:bg-white/5 transition text-slate-300"
                      >
                        {isChecked ? (
                          <CheckSquare className="w-4 h-4 text-cyan-400 mt-0.5 shrink-0" />
                        ) : (
                          <Square className="w-4 h-4 text-slate-500 mt-0.5 shrink-0" />
                        )}
                        <span className={isChecked ? "line-through text-slate-500" : "text-slate-200"}>
                          {it.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Competitive Audit Guideline */}
          <div className="p-4 rounded-lg bg-[#0a0f1d] border border-white/10 text-slate-400 space-y-1">
            <span className="text-white font-semibold block">Competitive Audit Rhythm:</span>
            <p>
              Once per quarter, review 3 portfolios of engineers at Medtronic and top AI labs. Preserve your specific technical edge (cybersecurity + deep ODE digital twin + IIT Madras provenance) rather than following generic web design fads.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
