import React, { useState, useEffect } from "react";
import {
  Play,
  Terminal,
  Cpu,
  CheckCircle2,
  XCircle,
  Clock,
  Zap,
  RotateCcw,
  Copy,
  Check,
  Download,
  X,
  Sparkles,
  FileCode,
  Layers,
  ChevronDown,
  Info
} from "lucide-react";
import { VirtualFile } from "../types";
import { executeCodeFile, CodeExecutionResponse, detectLanguageFromPath } from "../services/codeRunnerService";

interface CodeRunnerModalProps {
  isOpen: boolean;
  onClose: () => void;
  files: VirtualFile[];
  activeFilePath: string;
  theme: "light" | "dark";
  apiKey?: string;
  selectedModel?: string;
  onSelectModel?: (model: string) => void;
}

const AVAILABLE_RUNNER_MODELS = [
  { id: "google/gemini-2.5-flash", name: "Gemini 2.5 Flash (Ultra Fast)" },
  { id: "google/gemini-2.5-pro", name: "Gemini 2.5 Pro (Deep Compiler Reasoning)" },
  { id: "anthropic/claude-3.5-sonnet", name: "Claude 3.5 Sonnet (Code Precision)" },
  { id: "deepseek/deepseek-chat", name: "DeepSeek V3 (High Efficiency Coder)" },
  { id: "deepseek/deepseek-reasoner", name: "DeepSeek R1 (Chain-of-Thought Execution)" },
  { id: "openai/gpt-4o", name: "OpenAI GPT-4o" },
  { id: "qwen/qwen-2.5-coder-32b-instruct", name: "Qwen 2.5 Coder 32B" }
];

export const CodeRunnerModal: React.FC<CodeRunnerModalProps> = ({
  isOpen,
  onClose,
  files,
  activeFilePath,
  theme,
  apiKey = "",
  selectedModel = "google/gemini-2.5-flash",
  onSelectModel
}) => {
  const [targetPath, setTargetPath] = useState<string>(activeFilePath || files[0]?.path || "script.js");
  const [stdinParams, setStdinParams] = useState<string>("");
  const [currentModel, setCurrentModel] = useState<string>(selectedModel);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [result, setResult] = useState<CodeExecutionResponse | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    if (activeFilePath) {
      setTargetPath(activeFilePath);
    }
  }, [activeFilePath]);

  useEffect(() => {
    if (selectedModel) {
      setCurrentModel(selectedModel);
    }
  }, [selectedModel]);

  if (!isOpen) return null;

  const currentFile = files.find(f => f.path === targetPath) || files[0];
  const detectedLang = currentFile ? detectLanguageFromPath(currentFile.path) : "javascript";

  const handleRunFile = async () => {
    if (!currentFile) return;

    setIsRunning(true);
    setResult(null);

    try {
      const execResult = await executeCodeFile({
        filePath: currentFile.path,
        code: currentFile.content,
        language: detectedLang,
        stdinParams: stdinParams.trim(),
        apiKey,
        selectedModel: currentModel
      });

      setResult(execResult);
    } catch (err: any) {
      setResult({
        stdout: "",
        stderr: `Execution Error: ${err.message || err}`,
        exitCode: 1,
        executionTimeMs: 0,
        memoryUsageMb: "0 MB",
        runnerType: "openrouter_ai",
        explanation: "Execution attempt failed due to an exception."
      });
    } finally {
      setIsRunning(false);
    }
  };

  const handleCopyLogs = () => {
    if (!result) return;
    const text = `=== FILE EXECUTION REPORT (${targetPath}) ===
Language: ${detectedLang}
Runner: ${result.runnerType} (${result.modelUsed || "Local"})
Execution Time: ${result.executionTimeMs}ms
Exit Code: ${result.exitCode}

--- STDOUT ---
${result.stdout}

--- STDERR ---
${result.stderr}

--- AI ANALYSIS ---
${result.explanation || "N/A"}`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadLogs = () => {
    if (!result) return;
    const logContent = `EXECUTION LOG: ${targetPath}\nTimestamp: ${new Date().toISOString()}\nRunner: ${result.runnerType} (${result.modelUsed || "Native"})\n\n[STDOUT]\n${result.stdout}\n\n[STDERR]\n${result.stderr}\n\n[ANALYSIS]\n${result.explanation || ""}`;
    const blob = new Blob([logContent], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `execution_${targetPath.replace(/[\/\\]/g, "_")}.log`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
      <div className={`w-full max-w-4xl rounded-2xl border shadow-2xl flex flex-col max-h-[90vh] overflow-hidden ${
        theme === "dark" ? "bg-[#0b0e14] border-zinc-800 text-zinc-100" : "bg-white border-slate-200 text-slate-800"
      }`}>
        {/* Header */}
        <div className="p-4 border-b border-zinc-800 flex items-center justify-between shrink-0 bg-slate-900/40">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-indigo-500/20 to-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              <Cpu className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold tracking-tight">Universal File Executor & AI Runner</h2>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold">
                  OpenRouter Enabled
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Run any script/program file via native runtime or OpenRouter AI Compiler Engine</p>
            </div>
          </div>

          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-white cursor-pointer transition-all">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toolbar & Config Bar */}
        <div className="p-3.5 border-b border-zinc-800/80 bg-[#10141d] flex flex-wrap items-center justify-between gap-3 shrink-0 text-xs">
          {/* File Picker */}
          <div className="flex items-center gap-2 flex-1 min-w-[200px]">
            <FileCode className="w-4 h-4 text-cyan-400 shrink-0" />
            <select
              value={targetPath}
              onChange={(e) => setTargetPath(e.target.value)}
              className="bg-zinc-900 border border-zinc-700 text-zinc-200 text-xs font-mono font-medium rounded-lg px-3 py-1.5 focus:outline-none focus:border-cyan-500 cursor-pointer w-full max-w-xs"
            >
              {files.map(f => (
                <option key={f.path} value={f.path}>
                  {f.path} ({detectLanguageFromPath(f.path).toUpperCase()})
                </option>
              ))}
            </select>
          </div>

          {/* Model Selector */}
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
            <select
              value={currentModel}
              onChange={(e) => {
                setCurrentModel(e.target.value);
                if (onSelectModel) onSelectModel(e.target.value);
              }}
              className="bg-zinc-900 border border-zinc-700 text-amber-300 text-xs font-mono font-semibold rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-amber-500 cursor-pointer"
            >
              {AVAILABLE_RUNNER_MODELS.map(m => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
          </div>

          {/* Run Action Button */}
          <button
            onClick={handleRunFile}
            disabled={isRunning || !currentFile}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-lg ${
              isRunning
                ? "bg-cyan-600/40 text-cyan-200 cursor-not-allowed"
                : "bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white shadow-cyan-500/20"
            }`}
          >
            {isRunning ? (
              <>
                <RotateCcw className="w-4 h-4 animate-spin" />
                <span>Executing Code...</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-white" />
                <span>Run File Now</span>
              </>
            )}
          </button>
        </div>

        {/* STDIN Input Field */}
        <div className="px-4 py-2 bg-zinc-950 border-b border-zinc-800 flex items-center gap-2 text-xs font-mono shrink-0">
          <span className="text-slate-400 text-[11px] font-bold shrink-0">STDIN / Arguments:</span>
          <input
            type="text"
            value={stdinParams}
            onChange={(e) => setStdinParams(e.target.value)}
            placeholder="e.g. arg1 arg2 100 or user input string"
            className="flex-1 bg-zinc-900/80 border border-zinc-800 text-cyan-300 rounded-lg px-2.5 py-1 text-xs font-mono focus:outline-none focus:border-cyan-500"
          />
        </div>

        {/* Body Output Terminal */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 font-mono text-xs bg-[#07090e] text-slate-200 min-h-[280px]">
          {!result && !isRunning && (
            <div className="h-full min-h-[220px] flex flex-col items-center justify-center text-center p-6 text-slate-500 space-y-3">
              <Terminal className="w-12 h-12 text-zinc-700 animate-bounce" />
              <div>
                <p className="text-xs font-semibold text-slate-300">Ready to execute <code className="text-cyan-400">{targetPath}</code></p>
                <p className="text-[11px] text-slate-500 mt-1">
                  Click <span className="text-emerald-400 font-bold">Run File Now</span> to execute locally or via chosen OpenRouter model ({currentModel}).
                </p>
              </div>
            </div>
          )}

          {isRunning && (
            <div className="p-8 flex flex-col items-center justify-center text-center space-y-3">
              <div className="relative">
                <div className="w-12 h-12 rounded-full border-4 border-cyan-500/20 border-t-cyan-400 animate-spin"></div>
                <Zap className="w-5 h-5 text-cyan-400 absolute inset-0 m-auto animate-pulse" />
              </div>
              <p className="text-xs font-bold text-cyan-300">Compiling & Executing Source Code...</p>
              <p className="text-[11px] text-slate-500 font-mono">Routing through OpenRouter AI Runner ({currentModel})</p>
            </div>
          )}

          {result && !isRunning && (
            <div className="space-y-4">
              {/* Execution Summary Header Banner */}
              <div className={`p-3 rounded-xl border flex flex-wrap items-center justify-between gap-2 text-xs font-mono ${
                result.exitCode === 0
                  ? "bg-emerald-950/30 border-emerald-500/30 text-emerald-300"
                  : "bg-rose-950/30 border-rose-500/30 text-rose-300"
              }`}>
                <div className="flex items-center gap-2">
                  {result.exitCode === 0 ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <XCircle className="w-4 h-4 text-rose-400" />}
                  <span className="font-bold">
                    {result.exitCode === 0 ? "Process Finished Successfully" : "Process Finished With Errors"} (Exit Code: {result.exitCode})
                  </span>
                </div>

                <div className="flex items-center gap-3 text-[11px] text-slate-400">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-cyan-400" /> {result.executionTimeMs} ms
                  </span>
                  <span className="flex items-center gap-1">
                    <Cpu className="w-3.5 h-3.5 text-amber-400" /> {result.memoryUsageMb}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-zinc-800 text-cyan-300 font-bold text-[10px]">
                    {result.runnerType === "openrouter_ai" ? `OpenRouter (${result.modelUsed || currentModel})` : result.runnerType}
                  </span>
                </div>
              </div>

              {/* Standard Output (STDOUT) */}
              <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 space-y-1.5">
                <div className="flex items-center justify-between text-[11px] text-emerald-400 font-bold border-b border-zinc-800/80 pb-1.5">
                  <span className="flex items-center gap-1.5">
                    <Terminal className="w-3.5 h-3.5" /> Standard Output (stdout)
                  </span>
                  <span className="text-zinc-500 text-[10px]">{result.stdout.split("\n").length} lines</span>
                </div>
                <pre className="text-emerald-300 text-xs font-mono whitespace-pre-wrap break-words leading-relaxed overflow-x-auto max-h-60 p-1">
                  {result.stdout || <span className="text-zinc-600 italic">No output produced on stdout.</span>}
                </pre>
              </div>

              {/* Standard Error (STDERR) */}
              {result.stderr && (
                <div className="p-3.5 rounded-xl bg-rose-950/20 border border-rose-900/50 space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] text-rose-400 font-bold border-b border-rose-900/40 pb-1.5">
                    <span className="flex items-center gap-1.5">
                      <XCircle className="w-3.5 h-3.5" /> Standard Error (stderr)
                    </span>
                  </div>
                  <pre className="text-rose-300 text-xs font-mono whitespace-pre-wrap break-words leading-relaxed overflow-x-auto max-h-40 p-1">
                    {result.stderr}
                  </pre>
                </div>
              )}

              {/* AI Execution Trace & Analysis */}
              {result.explanation && (
                <div className="p-3.5 rounded-xl bg-indigo-950/20 border border-indigo-800/40 space-y-1.5">
                  <div className="text-[11px] text-indigo-300 font-bold flex items-center gap-1.5 border-b border-indigo-900/40 pb-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" /> AI Runtime Trace & Execution Analysis
                  </div>
                  <p className="text-slate-300 text-xs font-sans leading-relaxed whitespace-pre-wrap">
                    {result.explanation}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-zinc-800 bg-[#0d1017] flex items-center justify-between shrink-0 text-xs font-mono">
          <div className="text-slate-400 text-[11px] flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-cyan-400" />
            <span>Runs locally or via chosen OpenRouter model.</span>
          </div>

          {result && (
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyLogs}
                className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-all border border-zinc-700"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? "Copied Logs" : "Copy Output"}</span>
              </button>
              <button
                onClick={handleDownloadLogs}
                className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all shadow-xs"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Save Execution Log</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
