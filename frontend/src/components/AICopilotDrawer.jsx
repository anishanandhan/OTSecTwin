import React, { useState, useEffect, useRef } from "react";
import { ShieldCheck, Sparkles, Send, X, Bot, AlertTriangle, ArrowRight, CornerDownLeft, Terminal } from "lucide-react";
import { sendAIChat, fetchAIStatus } from "../services/api";

function FormattedContent({ content }) {
  if (!content) return null;

  const lines = content.split("\n");
  const elements = [];
  let currentList = [];

  const flushList = (keyPrefix) => {
    if (currentList.length > 0) {
      elements.push(
        <ul key={`${keyPrefix}-list`} className="space-y-1 my-1.5 pl-1">
          {currentList.map((item, i) => (
            <li key={i} className="flex items-start gap-2 text-xs text-slate-300 leading-relaxed">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 shrink-0" />
              <span>{formatInlineText(item)}</span>
            </li>
          ))}
        </ul>
      );
      currentList = [];
    }
  };

  const formatInlineText = (text) => {
    // Splits text by bold **text** and inline `code`
    const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
    return parts.map((part, idx) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return (
          <strong key={idx} className="font-semibold text-slate-100">
            {part.slice(2, -2)}
          </strong>
        );
      }
      if (part.startsWith("`") && part.endsWith("`")) {
        return (
          <code key={idx} className="font-mono text-[11px] px-1.5 py-0.5 rounded bg-black/40 text-blue-300 border border-white/10">
            {part.slice(1, -1)}
          </code>
        );
      }
      return part;
    });
  };

  lines.forEach((line, index) => {
    const trimmed = line.trim();

    if (trimmed.startsWith("### ")) {
      flushList(index);
      elements.push(
        <h4 key={index} className="text-xs font-bold text-slate-100 uppercase tracking-wider mt-3 mb-1.5 pb-1 border-b border-white/10 flex items-center gap-1.5">
          <Terminal className="w-3.5 h-3.5 text-blue-400" />
          {trimmed.slice(4)}
        </h4>
      );
    } else if (trimmed.startsWith("#### ")) {
      flushList(index);
      elements.push(
        <h5 key={index} className="text-xs font-semibold text-blue-300 mt-2 mb-1">
          {trimmed.slice(5)}
        </h5>
      );
    } else if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
      currentList.push(trimmed.slice(2));
    } else if (trimmed === "---") {
      flushList(index);
      elements.push(<hr key={index} className="my-2 border-white/10" />);
    } else if (trimmed.length > 0) {
      flushList(index);
      elements.push(
        <p key={index} className="text-xs text-slate-300 leading-relaxed my-1">
          {formatInlineText(line)}
        </p>
      );
    } else {
      flushList(index);
    }
  });

  flushList("end");
  return <div className="space-y-0.5">{elements}</div>;
}

export default function AICopilotDrawer({ isOpen, onClose, alerts = [], assets = [] }) {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "### OTSecTwin AI Intelligence Engine\nConnected to **RouterPlus** (`gpt-4.1-mini`). Active telemetry and Purdue zone baselines are loaded.\n\nHow can I assist your industrial cybersecurity operations today?",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [aiStatus, setAiStatus] = useState(null);
  const chatEndRef = useRef(null);

  useEffect(() => {
    fetchAIStatus()
      .then(setAiStatus)
      .catch((err) => console.error("Could not fetch AI status:", err));
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen) onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const handleSend = async (textToSend) => {
    const query = textToSend || input;
    if (!query.trim() || loading) return;

    const userMsg = { role: "user", content: query };
    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setInput("");
    setLoading(true);

    try {
      const context = {
        total_assets: assets.length,
        critical_alerts: alerts.filter((a) => a.severity === "CRITICAL").map((a) => ({
          title: a.title,
          src_ip: a.src_ip,
          dst_ip: a.dst_ip,
          category: a.category,
        })),
      };

      const res = await sendAIChat(
        query,
        newHistory.map((m) => ({ role: m.role, content: m.content })),
        context
      );
      setMessages([...newHistory, { role: "assistant", content: res.reply }]);
    } catch (err) {
      setMessages([
        ...newHistory,
        {
          role: "assistant",
          content: `### Query Failed\nUnable to reach RouterPlus: \`${err.message}\`. Please check gateway connectivity.`,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const quickPrompts = [
    "Analyze active critical OT alerts",
    "How to secure Modbus/TCP on Purdue L1?",
    "Detect configuration drift on PLCs",
    "Explain cyber-physical overpressure risk",
  ];

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 transition-opacity"
        onClick={onClose} 
      />

      {/* Drawer */}
      <aside className="fixed inset-y-0 right-0 w-full max-w-lg bg-[#0d121f] border-l border-white/10 shadow-2xl z-50 flex flex-col font-sans animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="px-5 py-4 border-b border-white/10 bg-[#0a0e18] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <ShieldCheck className="w-4 h-4 stroke-[2]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-slate-100 tracking-tight">
                  OTSecTwin AI Copilot
                </h3>
                {aiStatus?.status === "CONNECTED" ? (
                  <span className="status-pill status-pill-emerald font-mono">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    RouterPlus Online
                  </span>
                ) : (
                  <span className="status-pill status-pill-amber font-mono">
                    Connecting...
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                Model: {aiStatus?.model || "gpt-4.1-mini"} • Key: d2fd9300...
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 p-1.5 rounded-md hover:bg-white/5 transition"
            title="Close Copilot (Esc)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Chat Stream */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex flex-col ${
                m.role === "user" ? "items-end" : "items-start"
              }`}
            >
              <div
                className={`max-w-[92%] rounded-lg p-3 text-xs leading-relaxed ${
                  m.role === "user"
                    ? "bg-[#1d273f] text-slate-100 border border-blue-500/30 rounded-tr-none shadow-sm"
                    : "bg-[#111726] text-slate-200 border border-white/10 rounded-tl-none shadow-sm"
                }`}
              >
                <FormattedContent content={m.content} />
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-2.5 text-xs text-blue-400 bg-[#111726] px-3.5 py-2.5 rounded-lg border border-white/10 w-fit">
              <span className="w-2 h-2 rounded-full bg-blue-400 animate-ping" />
              <span className="font-medium">Synthesizing OT telemetry with RouterPlus...</span>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Quick Suggestions */}
        <div className="px-5 py-3 bg-[#0a0e18] border-t border-white/10">
          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Suggested Queries
          </p>
          <div className="flex flex-wrap gap-1.5">
            {quickPrompts.map((qp, i) => (
              <button
                key={i}
                onClick={() => handleSend(qp)}
                className="text-[11px] bg-[#141b2b] hover:bg-[#1a2337] text-slate-300 hover:text-white border border-white/10 px-2.5 py-1 rounded transition text-left"
              >
                {qp}
              </button>
            ))}
          </div>
        </div>

        {/* Input Form */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="p-3 bg-[#0a0e18] border-t border-white/10 flex items-center gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask Copilot about assets, Modbus anomalies, CVEs..."
            className="flex-1 bg-[#111726] border border-white/10 rounded-md px-3.5 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition font-sans"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-md text-xs font-semibold disabled:opacity-50 transition flex items-center gap-1.5 shrink-0"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Send</span>
          </button>
        </form>
      </aside>
    </>
  );
}
