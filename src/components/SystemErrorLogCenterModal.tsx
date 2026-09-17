import React, { useState, useEffect } from "react";
import {
  ShieldAlert,
  AlertTriangle,
  Info,
  CheckCircle2,
  X,
  Search,
  Trash2,
  Copy,
  Check,
  Download,
  RefreshCw,
  Bug,
  Activity,
  Terminal,
  Zap,
  CheckSquare,
  Square,
  ChevronDown,
  ChevronRight,
  Database,
  Globe,
  Radio,
  Cpu
} from "lucide-react";
import { errorHandler, SystemErrorEntry, ErrorCategory, ErrorSeverity } from "../services/errorHandlerService";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const SystemErrorLogCenterModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [errors, setErrors] = useState<SystemErrorEntry[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [selectedSeverity, setSelectedSeverity] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [expandedErrorId, setExpandedErrorId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [copiedAll, setCopiedAll] = useState<boolean>(false);

  useEffect(() => {
    // Subscribe to real-time error log changes
    const unsubscribe = errorHandler.subscribe((logs) => {
      setErrors(logs);
    });
    return () => unsubscribe();
  }, []);

  if (!isOpen) return null;

  const filteredErrors = errors.filter((err) => {
    const matchesCat = selectedCategory === "ALL" || err.category === selectedCategory;
    const matchesSev = selectedSeverity === "ALL" || err.severity === selectedSeverity;
    const matchesSearch =
      searchQuery === "" ||
      err.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
      err.source?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      err.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSev && matchesSearch;
  });

  const unresolvedCount = errors.filter((e) => !e.resolved).length;
  const fatalCount = errors.filter((e) => e.severity === "fatal" || e.severity === "error").length;

  const getHealthStatus = () => {
    if (fatalCount > 0) {
      return {
        title: "System Exception Intercepted",
        desc: `${fatalCount} active error(s) safely trapped by Error Handler`,
        color: "bg-rose-500/10 text-rose-400 border-rose-500/30",
        badge: "bg-rose-500 text-white",
        icon: ShieldAlert
      };
    }
    if (unresolvedCount > 0) {
      return {
        title: "Minor System Warnings",
        desc: `${unresolvedCount} item(s) logged in system history`,
        color: "bg-amber-500/10 text-amber-400 border-amber-500/30",
        badge: "bg-amber-500 text-zinc-950",
        icon: AlertTriangle
      };
    }
    return {
      title: "All Systems Operational",
      desc: "Zero unresolved exceptions. Error handling safeguard active.",
      color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
      badge: "bg-emerald-500 text-zinc-950",
      icon: CheckCircle2
    };
  };

  const health = getHealthStatus();
  const HealthIcon = health.icon;

  const copySingleError = (err: SystemErrorEntry) => {
    const text = `[${err.timestamp}] [${err.category}] [${err.severity.toUpperCase()}] ${err.message}\nSource: ${err.source || "N/A"}\nStack:\n${err.stack || "N/A"}`;
    try {
      if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
        navigator.clipboard.writeText(text).catch(() => {});
      }
    } catch {}
    setCopiedId(err.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const exportLogsAsJSON = () => {
    try {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(errors, null, 2));
      const downloadAnchor = document.createElement("a");
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `system_error_report_${Date.now()}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    } catch {}
  };

  const copyAllLogs = () => {
    const report = errors.map(e => `[${e.timestamp}] [${e.category}] (${e.severity}): ${e.message}\nSource: ${e.source}\nStack: ${e.stack || "None"}\n`).join("\n---\n");
    try {
      if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
        navigator.clipboard.writeText(report || "No error logs available.").catch(() => {});
      }
    } catch {}
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  const triggerTestError = (type: "api" | "unhandled" | "network") => {
    if (type === "api") {
      errorHandler.logError({
        message: "Simulated Gemini API quota rate-limit (HTTP 429)",
        category: "API",
        severity: "warning",
        source: "GeminiApiService",
        stack: "Error: 429 Too Many Requests\n  at callGeminiApi (server.ts:42)"
      });
    } else if (type === "unhandled") {
      Promise.reject(new Error("Simulated unhandled promise rejection in async worker"));
    } else if (type === "network") {
      errorHandler.logError({
        message: "Failed to fetch YouTube oEmbed payload (Timeout 5000ms)",
        category: "Network",
        severity: "error",
        source: "oEmbedFetcher",
        stack: "TypeError: Failed to fetch\n  at safeFetch (errorHandlerService.ts:182)"
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-zinc-950 border border-zinc-800 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden text-slate-100">
        
        {/* Top Header */}
        <div className="p-5 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-500/20 text-red-400 border border-red-500/30 flex items-center justify-center shadow-inner">
              <Bug className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h2 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
                System Error Log & Health Console
              </h2>
              <p className="text-xs text-slate-400">
                Real-time exception trapping, network monitoring & fault diagnostics
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-zinc-800/80 hover:bg-zinc-700 text-slate-400 hover:text-white transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* System Health Status Bar */}
        <div className="p-4 bg-zinc-900/80 border-b border-zinc-800/80 flex flex-wrap items-center justify-between gap-4">
          <div className={`px-4 py-2.5 rounded-xl border flex items-center gap-3 ${health.color}`}>
            <HealthIcon className="w-5 h-5 shrink-0" />
            <div>
              <div className="text-xs font-bold leading-none mb-0.5">{health.title}</div>
              <div className="text-[11px] opacity-80">{health.desc}</div>
            </div>
          </div>

          {/* Quick Simulation & Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1 bg-zinc-950 p-1 rounded-xl border border-zinc-800">
              <span className="text-[10px] font-mono text-slate-400 px-2">Test Error:</span>
              <button
                onClick={() => triggerTestError("api")}
                className="px-2 py-1 rounded-lg bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 text-[10px] font-mono font-semibold transition-all cursor-pointer"
              >
                + API Error
              </button>
              <button
                onClick={() => triggerTestError("network")}
                className="px-2 py-1 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 text-[10px] font-mono font-semibold transition-all cursor-pointer"
              >
                + Network
              </button>
            </div>

            <button
              onClick={exportLogsAsJSON}
              className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-slate-200 border border-zinc-700 text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer"
              title="Export all logged errors as JSON report"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export</span>
            </button>

            <button
              onClick={copyAllLogs}
              className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-slate-200 border border-zinc-700 text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer"
            >
              {copiedAll ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedAll ? "Copied" : "Copy Report"}</span>
            </button>

            {errors.length > 0 && (
              <button
                onClick={() => errorHandler.clearAll()}
                className="px-3 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear All</span>
              </button>
            )}
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className="p-4 bg-zinc-950 border-b border-zinc-800/80 flex flex-wrap items-center justify-between gap-3">
          {/* Category Tabs */}
          <div className="flex flex-wrap items-center gap-1 bg-zinc-900 p-1 rounded-xl border border-zinc-800 text-xs font-medium">
            {["ALL", "API", "UI", "Network", "Runtime", "System"].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  selectedCategory === cat
                    ? "bg-indigo-600 text-white font-bold shadow-sm"
                    : "text-slate-400 hover:text-white hover:bg-zinc-800"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative flex-1 max-w-xs">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search error logs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-all"
            />
          </div>
        </div>

        {/* Logs List Container */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[300px]">
          {filteredErrors.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-center p-6 text-slate-500 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-emerald-400">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-300">No Matching Error Logs</h3>
              <p className="text-xs text-slate-500 max-w-sm">
                System health monitoring is active. All caught runtime exceptions and network errors will be recorded here automatically.
              </p>
            </div>
          ) : (
            filteredErrors.map((err) => {
              const isExpanded = expandedErrorId === err.id;

              const severityBadge =
                err.severity === "fatal" || err.severity === "error"
                  ? "bg-rose-500/20 text-rose-300 border-rose-500/30"
                  : err.severity === "warning"
                  ? "bg-amber-500/20 text-amber-300 border-amber-500/30"
                  : "bg-blue-500/20 text-blue-300 border-blue-500/30";

              return (
                <div
                  key={err.id}
                  className={`border rounded-xl p-3.5 transition-all ${
                    err.resolved
                      ? "bg-zinc-900/40 border-zinc-800/50 opacity-60"
                      : "bg-zinc-900/90 border-zinc-800 hover:border-zinc-700"
                  }`}
                >
                  {/* Summary Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-2.5 flex-1 min-w-0">
                      <button
                        onClick={() => setExpandedErrorId(isExpanded ? null : err.id)}
                        className="mt-0.5 text-slate-400 hover:text-white transition-colors cursor-pointer"
                      >
                        {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                      </button>

                      <div className="space-y-1 flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold uppercase border ${severityBadge}`}>
                            {err.severity}
                          </span>
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-mono bg-zinc-800 text-slate-300 border border-zinc-700">
                            {err.category}
                          </span>
                          <span className="text-[10px] font-mono text-slate-500">
                            {err.timestamp} • Source: {err.source || "System"}
                          </span>
                        </div>

                        <p className={`text-xs font-mono font-medium leading-relaxed break-words ${err.resolved ? "line-through text-slate-500" : "text-slate-100"}`}>
                          {err.message}
                        </p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => errorHandler.markAsResolved(err.id)}
                        className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                          err.resolved
                            ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                            : "bg-zinc-800 hover:bg-zinc-700 text-slate-400 hover:text-white border-zinc-700"
                        }`}
                        title={err.resolved ? "Marked as Resolved" : "Mark as Resolved"}
                      >
                        {err.resolved ? <CheckSquare className="w-3.5 h-3.5" /> : <Square className="w-3.5 h-3.5" />}
                      </button>

                      <button
                        onClick={() => copySingleError(err)}
                        className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-slate-400 hover:text-white border border-zinc-700 transition-all cursor-pointer"
                        title="Copy error details"
                      >
                        {copiedId === err.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  {/* Expanded Stack Trace Details */}
                  {isExpanded && (
                    <div className="mt-3 pt-3 border-t border-zinc-800/80 space-y-2">
                      <div className="text-[11px] font-mono text-slate-400 font-bold flex items-center gap-1.5">
                        <Terminal className="w-3 h-3 text-indigo-400" />
                        <span>Diagnostic Stack Trace:</span>
                      </div>
                      <pre className="p-3 rounded-xl bg-black/80 border border-zinc-800 font-mono text-[11px] text-rose-300 leading-tight overflow-x-auto whitespace-pre-wrap max-h-48">
                        {err.stack || "No stack trace recorded for this error entry."}
                      </pre>
                      {err.metadata && (
                        <div className="p-2 rounded-lg bg-zinc-950 border border-zinc-800 font-mono text-[10px] text-slate-400">
                          <strong>Metadata:</strong> {JSON.stringify(err.metadata)}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer info bar */}
        <div className="p-4 bg-zinc-900/60 border-t border-zinc-800 text-xs text-slate-400 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 font-mono text-[11px]">
            <Activity className="w-3.5 h-3.5 text-emerald-400" />
            <span>ErrorHandlerService Active • {errors.length} total entry(ies) recorded</span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-medium transition-all cursor-pointer"
          >
            Close Console
          </button>
        </div>

      </div>
    </div>
  );
};

export default SystemErrorLogCenterModal;
