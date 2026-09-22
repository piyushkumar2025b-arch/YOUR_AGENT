import React, { useState } from "react";
import { Brain, CheckCircle2, ChevronDown, ChevronRight, FileCode, Layers, ListChecks, Play, Sparkles } from "lucide-react";

interface ThinkingPlanCardProps {
  content: string;
  theme: "light" | "dark";
  onOpenPreview?: () => void;
}

export const ThinkingPlanCard: React.FC<ThinkingPlanCardProps> = ({ content = "", theme, onOpenPreview }) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  if (!content) return null;

  // Extract <thinking_plan> block or ### 🧠 Implementation Plan section if present
  const planMatch = content.match(/<thinking_plan>([\s\S]*?)<\/thinking_plan>/i);
  const planText = planMatch ? planMatch[1].trim() : null;

  // Extract file tags if present
  const fileMatches = Array.from(content.matchAll(/<file\s+path=["']([^"']+)["']/gi)).map(m => m[1]);

  if (!planText && fileMatches.length === 0) {
    return null;
  }

  // Parse lines into structured sections
  const lines = (planText || "").split("\n").map(l => l.trim()).filter(Boolean);
  
  const filesRead: string[] = [];
  const planSteps: string[] = [];
  let architecturalSummary = "";

  lines.forEach(line => {
    if (line.toLowerCase().startsWith("read:") || line.toLowerCase().startsWith("context:") || line.toLowerCase().includes("file:")) {
      filesRead.push(line.replace(/^(read|context|file):\s*/i, ""));
    } else if (line.match(/^(\d+\.|-|\*|\[x\]|\[ \])\s*/)) {
      planSteps.push(line.replace(/^(\d+\.|-|\*|\[x\]|\[ \])\s*/, ""));
    } else if (line.length > 5 && !architecturalSummary) {
      architecturalSummary = line;
    }
  });

  return (
    <div className={`my-2 rounded-xl border shadow-sm transition-all overflow-hidden ${
      theme === "dark" 
        ? "bg-[#1c1c22] border-indigo-500/30 text-zinc-100" 
        : "bg-gradient-to-br from-indigo-50/80 to-purple-50/50 border-indigo-200 text-slate-800"
    }`}>
      {/* CARD HEADER */}
      <div 
        onClick={() => setIsExpanded(!isExpanded)}
        className={`px-3.5 py-2.5 flex items-center justify-between cursor-pointer select-none transition-colors ${
          theme === "dark" ? "hover:bg-indigo-500/10" : "hover:bg-indigo-100/50"
        }`}
      >
        <div className="flex items-center gap-2">
          <div className="p-1 rounded-lg bg-indigo-600 text-white shadow-xs">
            <Brain className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-500 flex items-center gap-1">
                Agent Thinking Orchestrator
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                Plan Formulated
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-zinc-400 font-medium line-clamp-1">
              {architecturalSummary || "Synthesized workspace context & planned file operations."}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onOpenPreview && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onOpenPreview();
              }}
              className="flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-lg bg-indigo-600 text-white hover:bg-indigo-500 shadow-xs transition-all cursor-pointer"
            >
              <Play className="w-3 h-3 fill-white" />
              Live Preview
            </button>
          )}
          {isExpanded ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
        </div>
      </div>

      {/* CARD EXPANDABLE BODY */}
      {isExpanded && (
        <div className={`p-3.5 border-t space-y-3 text-xs ${
          theme === "dark" ? "border-zinc-800 bg-[#16161a]" : "border-indigo-100 bg-white/80"
        }`}>
          {/* READ FILES CONTEXT */}
          {filesRead.length > 0 && (
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                <FileCode className="w-3.5 h-3.5 text-indigo-500" /> Workspace Context Read
              </span>
              <div className="flex flex-wrap gap-1.5 pt-0.5">
                {filesRead.map((f, i) => (
                  <span key={i} className="font-mono text-[11px] px-2 py-0.5 rounded bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-indigo-600 dark:text-indigo-400">
                    {f}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* IMPLEMENTATION STEPS CHECKLIST */}
          {planSteps.length > 0 && (
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                <ListChecks className="w-3.5 h-3.5 text-indigo-500" /> Execution Roadmap & Strategy
              </span>
              <ul className="space-y-1">
                {planSteps.map((step, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-[11px] text-slate-700 dark:text-zinc-300">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                    <span>{step}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* GENERATED/EDITED FILES TRACE */}
          {fileMatches.length > 0 && (
            <div className="space-y-1 pt-1 border-t border-slate-200 dark:border-zinc-800">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                <Layers className="w-3.5 h-3.5 text-indigo-500" /> Exact Files Executed ({fileMatches.length})
              </span>
              <div className="flex flex-wrap gap-1.5 pt-0.5">
                {fileMatches.map((filePath, i) => (
                  <span key={i} className="font-mono text-[11px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-semibold flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> {filePath}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
