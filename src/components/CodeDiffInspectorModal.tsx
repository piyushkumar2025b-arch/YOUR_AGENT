import React, { useState, useMemo } from "react";
import {
  GitCompare,
  X,
  Columns,
  Rows,
  Copy,
  Check,
  ArrowRight,
  FileCode,
  CheckCheck
} from "lucide-react";
import { VirtualFile } from "../types";

interface CodeDiffInspectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  files: VirtualFile[];
  activeFilePath?: string;
  theme?: "light" | "dark" | string;
  onApplyDiff?: (targetPath: string, newContent: string) => void;
}

interface DiffLine {
  type: "added" | "deleted" | "unchanged";
  leftLineNum?: number;
  rightLineNum?: number;
  content: string;
}

// Line-by-line Myers / LCS Diff calculation
function computeSimpleDiff(originalText: string, modifiedText: string): DiffLine[] {
  const origLines = (originalText || "").split("\n");
  const modLines = (modifiedText || "").split("\n");
  const diff: DiffLine[] = [];

  const maxLen = Math.max(origLines.length, modLines.length);
  let origIdx = 0;
  let modIdx = 0;

  while (origIdx < origLines.length || modIdx < modLines.length) {
    const oLine = origLines[origIdx];
    const mLine = modLines[modIdx];

    if (origIdx >= origLines.length) {
      diff.push({ type: "added", rightLineNum: modIdx + 1, content: mLine });
      modIdx++;
    } else if (modIdx >= modLines.length) {
      diff.push({ type: "deleted", leftLineNum: origIdx + 1, content: oLine });
      origIdx++;
    } else if (oLine === mLine) {
      diff.push({ type: "unchanged", leftLineNum: origIdx + 1, rightLineNum: modIdx + 1, content: oLine });
      origIdx++;
      modIdx++;
    } else {
      // Lookahead to see if line was deleted or added
      const nextMatchInMod = modLines.slice(modIdx, modIdx + 5).indexOf(oLine);
      const nextMatchInOrig = origLines.slice(origIdx, origIdx + 5).indexOf(mLine);

      if (nextMatchInMod !== -1 && (nextMatchInOrig === -1 || nextMatchInMod <= nextMatchInOrig)) {
        diff.push({ type: "added", rightLineNum: modIdx + 1, content: mLine });
        modIdx++;
      } else {
        diff.push({ type: "deleted", leftLineNum: origIdx + 1, content: oLine });
        origIdx++;
      }
    }
  }

  return diff;
}

export const CodeDiffInspectorModal: React.FC<CodeDiffInspectorModalProps> = ({
  isOpen,
  onClose,
  files,
  activeFilePath = "",
  theme = "dark",
  onApplyDiff
}) => {
  const isDark = theme !== "light";

  const [leftPath, setLeftPath] = useState<string>(files[0]?.path || "");
  const [rightPath, setRightPath] = useState<string>(activeFilePath || files[1]?.path || files[0]?.path || "");
  const [viewMode, setViewMode] = useState<"side-by-side" | "unified">("side-by-side");
  const [copiedPatch, setCopiedPatch] = useState<boolean>(false);

  const leftFile = useMemo(() => files.find(f => f.path === leftPath) || files[0] || null, [files, leftPath]);
  const rightFile = useMemo(() => files.find(f => f.path === rightPath) || files[1] || files[0] || null, [files, rightPath]);

  const diffLines = useMemo(() => {
    return computeSimpleDiff(leftFile?.content || "", rightFile?.content || "");
  }, [leftFile, rightFile]);

  const stats = useMemo(() => {
    const added = diffLines.filter(l => l.type === "added").length;
    const deleted = diffLines.filter(l => l.type === "deleted").length;
    return { added, deleted };
  }, [diffLines]);

  const unifiedPatchText = useMemo(() => {
    return diffLines.map(line => {
      const prefix = line.type === "added" ? "+" : line.type === "deleted" ? "-" : " ";
      return `${prefix} ${line.content}`;
    }).join("\n");
  }, [diffLines]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
      <div className={`w-full max-w-6xl h-[85vh] rounded-2xl border shadow-2xl flex flex-col overflow-hidden ${
        isDark ? "bg-[#18181b] border-zinc-800 text-white" : "bg-white border-slate-300 text-slate-900"
      }`}>
        {/* Top Header */}
        <div className={`p-4 border-b flex flex-wrap items-center justify-between gap-3 shrink-0 ${
          isDark ? "border-zinc-800 bg-[#141416]" : "border-slate-200 bg-slate-50"
        }`}>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
              <GitCompare className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold flex items-center gap-2">
                Workspace Code Diff & Patch Inspector
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300">
                  +{stats.added} / -{stats.deleted} lines
                </span>
              </h3>
              <p className={`text-xs ${isDark ? "text-zinc-400" : "text-slate-500"}`}>
                Compare workspace files side-by-side or inspect diff patches before deployment.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* View Mode Toggle */}
            <div className={`flex items-center p-0.5 rounded-lg border ${
              isDark ? "bg-zinc-800/80 border-zinc-700" : "bg-slate-200/80 border-slate-300"
            }`}>
              <button
                onClick={() => setViewMode("side-by-side")}
                className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium cursor-pointer transition-colors ${
                  viewMode === "side-by-side"
                    ? "bg-indigo-600 text-white font-bold"
                    : isDark ? "text-zinc-400 hover:text-white" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Columns className="w-3.5 h-3.5" />
                Side-by-Side
              </button>
              <button
                onClick={() => setViewMode("unified")}
                className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium cursor-pointer transition-colors ${
                  viewMode === "unified"
                    ? "bg-indigo-600 text-white font-bold"
                    : isDark ? "text-zinc-400 hover:text-white" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Rows className="w-3.5 h-3.5" />
                Unified
              </button>
            </div>

            {/* Copy Patch */}
            <button
              onClick={() => {
                navigator.clipboard.writeText(unifiedPatchText);
                setCopiedPatch(true);
                setTimeout(() => setCopiedPatch(false), 2000);
              }}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold border cursor-pointer ${
                isDark ? "border-zinc-700 hover:bg-zinc-800 text-zinc-300" : "border-slate-300 hover:bg-slate-100 text-slate-700"
              }`}
            >
              {copiedPatch ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copiedPatch ? "Copied" : "Copy Patch"}
            </button>

            {/* Close */}
            <button
              onClick={onClose}
              className={`p-1.5 rounded-lg cursor-pointer ${
                isDark ? "hover:bg-zinc-800 text-zinc-400 hover:text-white" : "hover:bg-slate-200 text-slate-500 hover:text-slate-800"
              }`}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* File Selection Bars */}
        <div className={`p-3 border-b flex flex-wrap items-center justify-between gap-4 text-xs font-mono shrink-0 ${
          isDark ? "border-zinc-800 bg-[#1a1a1d]" : "border-slate-200 bg-slate-100"
        }`}>
          <div className="flex items-center gap-2">
            <span className="text-rose-400 font-bold">Base (Original):</span>
            <select
              value={leftPath}
              onChange={(e) => setLeftPath(e.target.value)}
              className={`px-2 py-1 rounded border outline-none cursor-pointer ${
                isDark ? "bg-zinc-800 border-zinc-700 text-white" : "bg-white border-slate-300 text-slate-800"
              }`}
            >
              {files.map(f => (
                <option key={`left-${f.path}`} value={f.path}>{f.path}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <ArrowRight className="w-4 h-4 text-zinc-500" />
            <span className="text-emerald-400 font-bold">Target (Modified):</span>
            <select
              value={rightPath}
              onChange={(e) => setRightPath(e.target.value)}
              className={`px-2 py-1 rounded border outline-none cursor-pointer ${
                isDark ? "bg-zinc-800 border-zinc-700 text-white" : "bg-white border-slate-300 text-slate-800"
              }`}
            >
              {files.map(f => (
                <option key={`right-${f.path}`} value={f.path}>{f.path}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Diff Content View */}
        <div className="flex-1 overflow-auto p-4 font-mono text-xs select-text">
          {viewMode === "unified" ? (
            /* Unified Diff View */
            <div className="space-y-0.5">
              {diffLines.map((line, idx) => {
                const bg =
                  line.type === "added"
                    ? isDark ? "bg-emerald-950/40 text-emerald-300" : "bg-emerald-50 text-emerald-800"
                    : line.type === "deleted"
                    ? isDark ? "bg-rose-950/40 text-rose-300" : "bg-rose-50 text-rose-800"
                    : isDark ? "text-zinc-400" : "text-slate-600";

                const sign = line.type === "added" ? "+" : line.type === "deleted" ? "-" : " ";

                return (
                  <div key={idx} className={`flex items-start px-2 py-0.5 rounded leading-relaxed ${bg}`}>
                    <span className="w-10 text-right pr-3 opacity-40 select-none">
                      {line.leftLineNum || ""}
                    </span>
                    <span className="w-10 text-right pr-3 opacity-40 select-none">
                      {line.rightLineNum || ""}
                    </span>
                    <span className="w-4 select-none font-bold">{sign}</span>
                    <span className="flex-1 whitespace-pre-wrap break-all">{line.content}</span>
                  </div>
                );
              })}
            </div>
          ) : (
            /* Side-by-Side Diff View */
            <div className="grid grid-cols-2 gap-4 h-full min-h-0">
              {/* Left Column (Original) */}
              <div className={`p-3 rounded-xl border overflow-y-auto ${
                isDark ? "bg-[#111113] border-zinc-800" : "bg-slate-50 border-slate-200"
              }`}>
                <div className="text-[11px] font-bold text-rose-400 pb-2 border-b border-zinc-800 mb-2">
                  {leftFile?.path} (Original)
                </div>
                {(leftFile?.content || "").split("\n").map((l, i) => (
                  <div key={`l-${i}`} className="flex items-start leading-relaxed text-zinc-300">
                    <span className="w-8 text-right pr-2 text-zinc-600 select-none">{i + 1}</span>
                    <span className="flex-1 whitespace-pre-wrap break-all">{l}</span>
                  </div>
                ))}
              </div>

              {/* Right Column (Modified) */}
              <div className={`p-3 rounded-xl border overflow-y-auto ${
                isDark ? "bg-[#111113] border-zinc-800" : "bg-slate-50 border-slate-200"
              }`}>
                <div className="text-[11px] font-bold text-emerald-400 pb-2 border-b border-zinc-800 mb-2">
                  {rightFile?.path} (Modified)
                </div>
                {(rightFile?.content || "").split("\n").map((l, i) => (
                  <div key={`r-${i}`} className="flex items-start leading-relaxed text-zinc-300">
                    <span className="w-8 text-right pr-2 text-zinc-600 select-none">{i + 1}</span>
                    <span className="flex-1 whitespace-pre-wrap break-all">{l}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CodeDiffInspectorModal;
