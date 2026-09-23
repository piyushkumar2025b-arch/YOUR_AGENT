import React, { useState, useEffect, useMemo } from "react";
import {
  History,
  RotateCcw,
  Clock,
  FileCode,
  Check,
  Copy,
  Download,
  X,
  ChevronRight,
  GitCommit,
  Sparkles,
  AlertCircle,
  Plus
} from "lucide-react";
import { VirtualFile } from "../types";

export interface FileSnapshot {
  id: string;
  filePath: string;
  content: string;
  timestamp: number;
  label?: string;
  lineCount: number;
}

interface FileHistoryTimeMachineModalProps {
  isOpen: boolean;
  onClose: () => void;
  files: VirtualFile[];
  activeFilePath?: string;
  theme?: "light" | "dark" | string;
  onRestoreSnapshot?: (filePath: string, content: string) => void;
  onAddLog?: (type: string, message: string) => void;
}

const STORAGE_KEY = "remix_file_history_snapshots";

export const FileHistoryTimeMachineModal: React.FC<FileHistoryTimeMachineModalProps> = ({
  isOpen,
  onClose,
  files = [],
  activeFilePath = "",
  theme = "dark",
  onRestoreSnapshot,
  onAddLog
}) => {
  const isDark = theme !== "light";

  const [selectedPath, setSelectedPath] = useState<string>(activeFilePath || files[0]?.path || "");
  const [snapshots, setSnapshots] = useState<FileSnapshot[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [selectedSnapshotId, setSelectedSnapshotId] = useState<string | null>(null);
  const [customLabel, setCustomLabel] = useState<string>("");
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [restoreConfirmed, setRestoreConfirmed] = useState<boolean>(false);

  // Sync selected path when activeFilePath changes
  useEffect(() => {
    if (activeFilePath) {
      setSelectedPath(activeFilePath);
    }
  }, [activeFilePath]);

  // Current file in workspace
  const currentFile = useMemo(() => {
    return files.find(f => f.path === selectedPath) || files[0] || null;
  }, [files, selectedPath]);

  // Auto-record snapshots for current file if none exist or content changed
  useEffect(() => {
    if (!currentFile || !currentFile.content) return;

    setSnapshots(prev => {
      const fileSnaps = prev.filter(s => s.filePath === currentFile.path);
      const latest = fileSnaps[fileSnaps.length - 1];

      // If content is identical to latest snapshot, don't duplicate
      if (latest && latest.content === currentFile.content) {
        return prev;
      }

      const newSnap: FileSnapshot = {
        id: Math.random().toString(36).substring(2, 9),
        filePath: currentFile.path,
        content: currentFile.content,
        timestamp: Date.now(),
        lineCount: currentFile.content.split("\n").length,
        label: fileSnaps.length === 0 ? "Initial Workspace Version" : "Auto-saved Edit"
      };

      const updated = [...prev, newSnap].slice(-100); // keep last 100 snapshots
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch {}
      return updated;
    });
  }, [currentFile?.path, currentFile?.content]);

  // Snapshots for active file
  const activeFileSnapshots = useMemo(() => {
    return snapshots
      .filter(s => s.filePath === (currentFile?.path || selectedPath))
      .sort((a, b) => b.timestamp - a.timestamp);
  }, [snapshots, currentFile, selectedPath]);

  // Active snapshot being viewed
  const activeSnapshot = useMemo(() => {
    if (!selectedSnapshotId) return activeFileSnapshots[0] || null;
    return activeFileSnapshots.find(s => s.id === selectedSnapshotId) || activeFileSnapshots[0] || null;
  }, [activeFileSnapshots, selectedSnapshotId]);

  // Create manual checkpoint
  const createManualSnapshot = () => {
    if (!currentFile) return;
    const newSnap: FileSnapshot = {
      id: Math.random().toString(36).substring(2, 9),
      filePath: currentFile.path,
      content: currentFile.content,
      timestamp: Date.now(),
      lineCount: currentFile.content.split("\n").length,
      label: customLabel.trim() || `Manual Checkpoint #${activeFileSnapshots.length + 1}`
    };

    const updated = [...snapshots, newSnap];
    setSnapshots(updated);
    setSelectedSnapshotId(newSnap.id);
    setCustomLabel("");
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {}

    if (onAddLog) {
      onAddLog("snapshot", `Created checkpoint for ${currentFile.path}: "${newSnap.label}"`);
    }
  };

  // Restore snapshot version
  const handleRestore = () => {
    if (!activeSnapshot || !currentFile || !onRestoreSnapshot) return;
    onRestoreSnapshot(currentFile.path, activeSnapshot.content);
    setRestoreConfirmed(true);
    setTimeout(() => {
      setRestoreConfirmed(false);
      onClose();
    }, 1200);

    if (onAddLog) {
      onAddLog("restore", `Restored ${currentFile.path} to version from ${new Date(activeSnapshot.timestamp).toLocaleTimeString()}`);
    }
  };

  // Compute Diff Lines
  const diffLines = useMemo(() => {
    if (!currentFile || !activeSnapshot) return [];

    const snapLines = activeSnapshot.content.split("\n");
    const currentLines = currentFile.content.split("\n");

    const maxLen = Math.max(snapLines.length, currentLines.length);
    const result: { lineNum: number; snapLine: string; currentLine: string; status: "same" | "diff" | "added" | "removed" }[] = [];

    for (let i = 0; i < maxLen; i++) {
      const s = snapLines[i];
      const c = currentLines[i];

      if (s === undefined) {
        result.push({ lineNum: i + 1, snapLine: "", currentLine: c, status: "added" });
      } else if (c === undefined) {
        result.push({ lineNum: i + 1, snapLine: s, currentLine: "", status: "removed" });
      } else if (s === c) {
        result.push({ lineNum: i + 1, snapLine: s, currentLine: c, status: "same" });
      } else {
        result.push({ lineNum: i + 1, snapLine: s, currentLine: c, status: "diff" });
      }
    }

    return result;
  }, [currentFile, activeSnapshot]);

  // Copy snapshot content
  const copySnapshot = () => {
    if (!activeSnapshot) return;
    navigator.clipboard.writeText(activeSnapshot.content);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  // Download snapshot file
  const downloadSnapshot = () => {
    if (!activeSnapshot) return;
    const blob = new Blob([activeSnapshot.content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const filename = activeSnapshot.filePath.split("/").pop() || "snapshot.txt";
    link.href = url;
    link.download = `snapshot_${Date.now()}_${filename}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 select-none">
      <div className={`w-full max-w-6xl h-[90vh] flex flex-col rounded-xl border shadow-2xl overflow-hidden font-sans ${
        isDark ? "bg-[#0d0f15] border-zinc-800 text-zinc-200" : "bg-white border-slate-300 text-slate-800"
      }`}>
        {/* Header */}
        <div className={`px-4 py-3 border-b flex items-center justify-between shrink-0 ${
          isDark ? "bg-[#12141c] border-zinc-800" : "bg-slate-100 border-slate-200"
        }`}>
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-gradient-to-br from-amber-500/20 to-orange-500/20 text-amber-400 border border-amber-500/30">
              <History className="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <h2 className="text-xs font-bold tracking-wide flex items-center gap-2">
                File History & Time Machine
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  Local Snapshots
                </span>
              </h2>
              <p className="text-[10px] text-zinc-500">Inspect version history, compare unified diffs & restore past edits</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* File Switcher */}
            <select
              value={selectedPath}
              onChange={(e) => setSelectedPath(e.target.value)}
              className={`text-xs px-2.5 py-1 rounded border outline-none cursor-pointer ${
                isDark ? "bg-zinc-900 border-zinc-700 text-zinc-200" : "bg-white border-slate-300 text-slate-700"
              }`}
            >
              {files.map(f => (
                <option key={f.path} value={f.path}>{f.path}</option>
              ))}
            </select>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content Body: Split View */}
        <div className="flex-1 flex flex-col md:flex-row min-h-0 overflow-hidden">
          {/* Left Column: Snapshot Timeline */}
          <div className={`w-full md:w-80 border-r flex flex-col shrink-0 overflow-hidden ${
            isDark ? "bg-[#10121a] border-zinc-800" : "bg-slate-50 border-slate-200"
          }`}>
            {/* Manual Checkpoint Form */}
            <div className="p-3 border-b flex flex-col gap-2">
              <span className="text-[10px] font-bold uppercase text-zinc-400">Save Named Checkpoint:</span>
              <div className="flex items-center gap-1.5">
                <input
                  type="text"
                  value={customLabel}
                  onChange={(e) => setCustomLabel(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && createManualSnapshot()}
                  placeholder="e.g. Before refactoring auth..."
                  className={`flex-1 px-2.5 py-1 text-xs rounded border outline-none ${
                    isDark ? "bg-zinc-900 border-zinc-700 text-zinc-200" : "bg-white border-slate-300"
                  }`}
                />
                <button
                  onClick={createManualSnapshot}
                  className="px-2.5 py-1 text-xs font-bold rounded bg-amber-600 hover:bg-amber-500 text-white flex items-center gap-1 cursor-pointer shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" /> Save
                </button>
              </div>
            </div>

            {/* Snapshots List */}
            <div className="flex-1 overflow-y-auto p-2 flex flex-col gap-1.5">
              <span className="text-[10px] font-bold uppercase text-zinc-500 px-1">
                Version Timeline ({activeFileSnapshots.length}):
              </span>

              {activeFileSnapshots.length === 0 ? (
                <div className="p-4 text-center text-xs text-zinc-500">
                  No snapshots recorded for this file yet. Edits will appear automatically.
                </div>
              ) : (
                activeFileSnapshots.map((snap, idx) => {
                  const isSelected = (activeSnapshot?.id === snap.id);
                  const isLatest = idx === 0;

                  return (
                    <button
                      key={snap.id}
                      onClick={() => setSelectedSnapshotId(snap.id)}
                      className={`text-left p-2.5 rounded-lg border transition-all cursor-pointer flex flex-col gap-1 ${
                        isSelected
                          ? "bg-amber-500/10 border-amber-500/40 text-amber-200 shadow-xs"
                          : (isDark ? "bg-zinc-900/40 border-zinc-800/80 hover:bg-zinc-800/50 text-zinc-300" : "bg-white border-slate-200 hover:bg-slate-100")
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs flex items-center gap-1.5 truncate">
                          <GitCommit className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                          <span className="truncate">{snap.label || `Version #${activeFileSnapshots.length - idx}`}</span>
                        </span>
                        {isLatest && (
                          <span className="text-[9px] uppercase font-extrabold px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-400">
                            Current
                          </span>
                        )}
                      </div>

                      <div className="flex items-center justify-between text-[10px] text-zinc-500 font-mono mt-0.5">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {new Date(snap.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </span>
                        <span>{snap.lineCount} lines</span>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Right Column: Diff & Version Inspection */}
          <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
            {/* Version Actions Bar */}
            <div className={`px-4 py-2.5 border-b shrink-0 flex items-center justify-between ${
              isDark ? "bg-[#13151f] border-zinc-800" : "bg-white border-slate-200"
            }`}>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-zinc-300">
                  {activeSnapshot ? (activeSnapshot.label || "Selected Snapshot") : "No Snapshot"}
                </span>
                {activeSnapshot && (
                  <span className="text-[11px] text-zinc-500 font-mono">
                    ({new Date(activeSnapshot.timestamp).toLocaleString()})
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={copySnapshot}
                  className="flex items-center gap-1 px-2.5 py-1 text-xs rounded border border-zinc-700 hover:text-white cursor-pointer"
                  title="Copy snapshot content"
                >
                  {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{isCopied ? "Copied" : "Copy"}</span>
                </button>

                <button
                  onClick={downloadSnapshot}
                  className="flex items-center gap-1 px-2.5 py-1 text-xs rounded border border-zinc-700 hover:text-white cursor-pointer"
                  title="Download snapshot as file"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Download</span>
                </button>

                {onRestoreSnapshot && (
                  <button
                    onClick={handleRestore}
                    disabled={restoreConfirmed}
                    className={`flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded text-white transition-all cursor-pointer ${
                      restoreConfirmed
                        ? "bg-emerald-600"
                        : "bg-amber-600 hover:bg-amber-500 active:scale-95 shadow-md shadow-amber-600/20"
                    }`}
                  >
                    {restoreConfirmed ? (
                      <>
                        <Check className="w-3.5 h-3.5" /> Restored!
                      </>
                    ) : (
                      <>
                        <RotateCcw className="w-3.5 h-3.5" /> Restore This Version
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>

            {/* Split Diff Comparison */}
            <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
              <div className="grid grid-cols-2 text-[11px] font-bold uppercase tracking-wider px-3 py-1.5 border-b border-zinc-800/80 bg-zinc-900/40 text-zinc-400">
                <div>Snapshot Version ({activeSnapshot?.lineCount || 0} lines)</div>
                <div>Current Workspace Version ({currentFile?.content.split("\n").length || 0} lines)</div>
              </div>

              <div className="flex-1 overflow-auto p-2 font-mono text-xs select-text">
                {diffLines.map((line, idx) => {
                  let bgStyle = "";
                  if (line.status === "added") bgStyle = "bg-emerald-500/10 text-emerald-300";
                  else if (line.status === "removed") bgStyle = "bg-rose-500/10 text-rose-300";
                  else if (line.status === "diff") bgStyle = "bg-amber-500/10 text-amber-300";

                  return (
                    <div key={idx} className={`grid grid-cols-2 gap-4 py-0.5 px-2 rounded ${bgStyle}`}>
                      <div className="truncate flex items-center gap-2">
                        <span className="text-zinc-600 text-[10px] w-6 shrink-0">{line.lineNum}</span>
                        <span className="truncate">{line.snapLine}</span>
                      </div>
                      <div className="truncate flex items-center gap-2 border-l border-zinc-800 pl-2">
                        <span className="text-zinc-600 text-[10px] w-6 shrink-0">{line.lineNum}</span>
                        <span className="truncate">{line.currentLine}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FileHistoryTimeMachineModal;
