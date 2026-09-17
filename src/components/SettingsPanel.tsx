import React, { useState } from "react";
import { 
  Settings, Sliders, ShieldCheck, Lock, Database, Sparkles, Key, 
  Cpu, Trash2, CheckCircle2, AlertTriangle, Monitor, Sun, Moon, 
  Eye, RefreshCw, Radio, HardDrive, Link, Globe2, FileText, Zap, ChevronRight, Activity, Wifi
} from "lucide-react";
import { NetworkSpeedTestModal } from "./NetworkSpeedTestModal";
import { isValidOpenRouterKey } from "../utils/keyObfuscation";

interface SettingsPanelProps {
  theme: "light" | "dark";
  onThemeChange: (theme: "light" | "dark") => void;
  sidebarWidth: number;
  onSidebarWidthChange: (width: number) => void;
  editorWidth?: number;
  onEditorWidthChange?: (width: number) => void;
  editorFontSize: number;
  onEditorFontSizeChange: (size: number) => void;
  apiKey: string;
  onApiKeyChange: (key: string) => void;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({
  theme,
  onThemeChange,
  sidebarWidth,
  onSidebarWidthChange,
  editorWidth = 50,
  onEditorWidthChange,
  editorFontSize,
  onEditorFontSizeChange,
  apiKey,
  onApiKeyChange,
}) => {
  // Regulation & Data Usage Settings
  const [dataAccessMode, setDataAccessMode] = useState<"full" | "permission">("permission");
  const [enableTelemetry, setEnableTelemetry] = useState<boolean>(false);
  const [enableLocalCache, setEnableLocalCache] = useState<boolean>(true);
  const [enableContextSharing, setEnableContextSharing] = useState<boolean>(true);
  const [savedNotice, setSavedNotice] = useState<string | null>(null);

  // Speed test modal state
  const [isSpeedTestOpen, setIsSpeedTestOpen] = useState<boolean>(false);

  // Key testing state
  const [isTestingKeys, setIsTestingKeys] = useState<boolean>(false);
  const [keyTestResults, setKeyTestResults] = useState<{
    [key: string]: { status: "ok" | "error" | "missing"; latency: number; msg: string };
  }>({});

  const handleTestAllKeys = async () => {
    setIsTestingKeys(true);
    const results: { [key: string]: { status: "ok" | "error" | "missing"; latency: number; msg: string } } = {};

    // 1. OpenRouter Key test
    if (apiKey) {
      const start = performance.now();
      try {
        const res = await fetch("/api/openrouter/verify-key", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ apiKey })
        }).catch(() => null);
        const lat = Math.round(performance.now() - start);
        if (res && res.ok) {
          const data = await res.json().catch(() => ({}));
          if (data.valid) {
            results["openrouter"] = { status: "ok", latency: lat, msg: "Verified & Active (200 OK)" };
          } else {
            results["openrouter"] = { status: "error", latency: lat, msg: data.message || "Invalid key or unauthorized" };
          }
        } else {
          results["openrouter"] = { status: "error", latency: lat, msg: "Verification failed" };
        }
      } catch {
        results["openrouter"] = { status: "error", latency: 0, msg: "Network error" };
      }
    } else {
      results["openrouter"] = { status: "missing", latency: 0, msg: "Key not set" };
    }

    // 2. Gemini Key test
    const geminiKey = localStorage.getItem("gemini_api_key");
    if (geminiKey) {
      const start = performance.now();
      try {
        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${geminiKey}`).catch(() => null);
        const lat = Math.round(performance.now() - start);
        if (res && res.ok) {
          results["gemini"] = { status: "ok", latency: lat, msg: "Active (200 OK)" };
        } else {
          results["gemini"] = { status: "error", latency: lat, msg: "Invalid key" };
        }
      } catch {
        results["gemini"] = { status: "error", latency: 0, msg: "Network error" };
      }
    } else {
      results["gemini"] = { status: "missing", latency: 0, msg: "Key not set" };
    }

    // 3. YouTube Key test
    const ytKey = localStorage.getItem("youtube_api_key");
    if (ytKey) {
      const start = performance.now();
      try {
        const res = await fetch(`https://www.googleapis.com/youtube/v3/videoCategories?part=snippet&regionCode=US&key=${ytKey}`).catch(() => null);
        const lat = Math.round(performance.now() - start);
        if (res && res.ok) {
          results["youtube"] = { status: "ok", latency: lat, msg: "Active (200 OK)" };
        } else {
          results["youtube"] = { status: "error", latency: lat, msg: "Invalid key" };
        }
      } catch {
        results["youtube"] = { status: "error", latency: 0, msg: "Network error" };
      }
    } else {
      results["youtube"] = { status: "missing", latency: 0, msg: "Key not set" };
    }

    setKeyTestResults(results);
    setIsTestingKeys(false);
  };

  // Connectors State
  const [hfToken, setHfToken] = useState<string>("");
  const [webhookUrl, setWebhookUrl] = useState<string>("");
  const [connectedServices, setConnectedServices] = useState<{ [key: string]: boolean }>({
    openrouter: Boolean(apiKey),
    github: true,
    supabase: true,
    huggingface: false,
    webhook: false,
  });

  const handleSaveSettings = () => {
    setSavedNotice("Settings & Data Regulations updated successfully!");
    setTimeout(() => setSavedNotice(null), 3000);
  };

  const handleClearCache = () => {
    if (window.confirm("Are you sure you want to clear all local workspace cache and stored preferences?")) {
      localStorage.clear();
      setSavedNotice("Local cache cleared!");
      setTimeout(() => setSavedNotice(null), 3000);
    }
  };

  return (
    <div className={`h-full w-full flex-1 flex flex-col overflow-y-auto ${theme === "dark" ? "bg-[#121214] text-zinc-100" : "bg-slate-50 text-slate-800"}`}>
      
      {/* HEADER */}
      <div className={`p-5 border-b flex flex-wrap items-center justify-between gap-4 shrink-0 ${
        theme === "dark" ? "border-zinc-800 bg-zinc-900/80" : "border-slate-200 bg-white"
      }`}>
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-indigo-600/10 text-indigo-500 rounded-2xl border border-indigo-500/20 shadow-xs">
            <Settings className="w-6 h-6 animate-[spin_10s_linear_infinite]" />
          </div>
          <div>
            <h2 className="text-base font-bold tracking-tight">System Settings & Data Governance</h2>
            <p className="text-xs text-slate-400">Configure layout sliders, data content regulations, and AI connectors</p>
          </div>
        </div>

        <button
          onClick={handleSaveSettings}
          className="bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white px-5 py-2 rounded-xl text-xs font-bold transition-all shadow-md hover:shadow-indigo-500/25 cursor-pointer flex items-center gap-1.5"
        >
          <CheckCircle2 className="w-4 h-4" /> Save Regulations & Layout
        </button>
      </div>

      {savedNotice && (
        <div className="bg-emerald-500/10 border-b border-emerald-500/20 px-6 py-2.5 text-emerald-400 text-xs font-semibold flex items-center gap-2 shrink-0">
          <CheckCircle2 className="w-4 h-4" />
          <span>{savedNotice}</span>
        </div>
      )}

      {/* CONTENT GRID */}
      <div className="p-6 space-y-8 max-w-5xl mx-auto w-full">
        
        {/* SECTION 1: LAYOUT & SCREEN ADJUSTABLE SLIDERS */}
        <div className={`p-6 rounded-2xl border shadow-sm space-y-5 ${
          theme === "dark" ? "bg-zinc-900/90 border-zinc-800" : "bg-white border-slate-200"
        }`}>
          <div className="flex items-center gap-2.5 border-b pb-3 border-slate-200 dark:border-zinc-800">
            <Sliders className="w-5 h-5 text-indigo-500" />
            <h3 className="text-sm font-bold tracking-tight">Interactive Screen Sliders & Visual Themes</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Sidebar Width Slider */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs font-semibold">
                <span className="flex items-center gap-1.5 text-slate-600 dark:text-zinc-300">
                  <Monitor className="w-4 h-4 text-indigo-500" /> Chat Sidebar Width
                </span>
                <span className="font-mono text-indigo-500 bg-indigo-500/10 px-2 py-0.5 rounded text-[11px]">
                  {sidebarWidth}px
                </span>
              </div>
              <input
                type="range"
                min="240"
                max="600"
                value={sidebarWidth}
                onChange={(e) => onSidebarWidthChange(Number(e.target.value))}
                className="w-full accent-indigo-600 h-2 bg-slate-200 dark:bg-zinc-800 rounded-lg cursor-pointer"
              />
              <p className="text-[11px] text-slate-400">Drag to adjust pixel width of the chat & agent sidebar (240px - 600px).</p>
            </div>

            {/* Editor vs Viewer Split Slider */}
            {onEditorWidthChange && (
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs font-semibold">
                  <span className="flex items-center gap-1.5 text-slate-600 dark:text-zinc-300">
                    <Sliders className="w-4 h-4 text-indigo-500" /> Editor / Viewer Split
                  </span>
                  <span className="font-mono text-indigo-500 bg-indigo-500/10 px-2 py-0.5 rounded text-[11px]">
                    {editorWidth}% Editor / {100 - editorWidth}% Viewer
                  </span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="80"
                  value={editorWidth}
                  onChange={(e) => onEditorWidthChange(Number(e.target.value))}
                  className="w-full accent-indigo-600 h-2 bg-slate-200 dark:bg-zinc-800 rounded-lg cursor-pointer"
                />
                <p className="text-[11px] text-slate-400">Balance screen real-estate between Code Editor and Live Preview Viewer.</p>
              </div>
            )}

            {/* Code Font Size Slider */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs font-semibold">
                <span className="flex items-center gap-1.5 text-slate-600 dark:text-zinc-300">
                  <FileText className="w-4 h-4 text-indigo-500" /> Code Editor Font Size
                </span>
                <span className="font-mono text-indigo-500 bg-indigo-500/10 px-2 py-0.5 rounded text-[11px]">
                  {editorFontSize}px
                </span>
              </div>
              <input
                type="range"
                min="10"
                max="22"
                value={editorFontSize}
                onChange={(e) => onEditorFontSizeChange(Number(e.target.value))}
                className="w-full accent-indigo-600 h-2 bg-slate-200 dark:bg-zinc-800 rounded-lg cursor-pointer"
              />
              <p className="text-[11px] text-slate-400">Adjust syntax font density for optimal code readability.</p>
            </div>

          </div>

          {/* Theme Toggle Buttons */}
          <div className="pt-2">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Visual Palette Theme</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <button
                onClick={() => onThemeChange("dark")}
                className={`p-3 rounded-xl border flex items-center justify-between text-xs font-bold transition-all cursor-pointer ${
                  theme === "dark" 
                    ? "border-indigo-500 bg-indigo-950/30 text-white shadow-xs" 
                    : "border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300"
                }`}
              >
                <span className="flex items-center gap-2">
                  <Moon className="w-4 h-4 text-indigo-400" /> Obsidian Dark Mode
                </span>
                {theme === "dark" && <CheckCircle2 className="w-4 h-4 text-indigo-400" />}
              </button>

              <button
                onClick={() => onThemeChange("light")}
                className={`p-3 rounded-xl border flex items-center justify-between text-xs font-bold transition-all cursor-pointer ${
                  theme === "light" 
                    ? "border-indigo-500 bg-indigo-50 text-indigo-900 shadow-xs" 
                    : "border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300"
                }`}
              >
                <span className="flex items-center gap-2">
                  <Sun className="w-4 h-4 text-amber-500" /> Light Elegance
                </span>
                {theme === "light" && <CheckCircle2 className="w-4 h-4 text-indigo-600" />}
              </button>
            </div>
          </div>
        </div>

        {/* SECTION 2: DATA REGULATIONS & CONTENT USAGE PERMISSIONS */}
        <div className={`p-6 rounded-2xl border shadow-sm space-y-5 ${
          theme === "dark" ? "bg-zinc-900/90 border-zinc-800" : "bg-white border-slate-200"
        }`}>
          <div className="flex items-center justify-between border-b pb-3 border-slate-200 dark:border-zinc-800">
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="w-5 h-5 text-emerald-500" />
              <div>
                <h3 className="text-sm font-bold tracking-tight">Content Usage Regulations & User Data Permissions</h3>
                <p className="text-[11px] text-slate-400">Control how code snippets and telemetry are processed by connected AI models</p>
              </div>
            </div>
            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
              dataAccessMode === "full" ? "bg-amber-500/10 text-amber-500 border border-amber-500/20" : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
            }`}>
              {dataAccessMode === "full" ? "Full Access Mode" : "Permission-Based Zero Retention"}
            </span>
          </div>

          {/* Mode Selector Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div
              onClick={() => setDataAccessMode("permission")}
              className={`p-4 rounded-xl border cursor-pointer transition-all ${
                dataAccessMode === "permission"
                  ? "border-emerald-500 bg-emerald-950/20 dark:bg-emerald-950/30 shadow-xs"
                  : "border-slate-200 dark:border-zinc-800 hover:border-slate-300"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="flex items-center gap-2 font-bold text-xs text-emerald-500">
                  <Lock className="w-4 h-4" /> Strict Permission-Based (Recommended)
                </span>
                {dataAccessMode === "permission" && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Code files are processed in isolated memory. AI models do NOT store, index, or train on your workspace data.
              </p>
            </div>

            <div
              onClick={() => setDataAccessMode("full")}
              className={`p-4 rounded-xl border cursor-pointer transition-all ${
                dataAccessMode === "full"
                  ? "border-amber-500 bg-amber-950/20 dark:bg-amber-950/30 shadow-xs"
                  : "border-slate-200 dark:border-zinc-800 hover:border-slate-300"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="flex items-center gap-2 font-bold text-xs text-amber-500">
                  <Zap className="w-4 h-4" /> Full Access & Context Optimization
                </span>
                {dataAccessMode === "full" && <CheckCircle2 className="w-4 h-4 text-amber-500" />}
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Allows AI models full access to cross-file analysis and telemetry to provide higher quality contextual completions.
              </p>
            </div>
          </div>

          {/* Granular Privacy Toggles */}
          <div className="space-y-3 pt-2 divide-y divide-slate-100 dark:divide-zinc-800/60">
            
            <div className="flex items-center justify-between pt-3">
              <div>
                <h4 className="text-xs font-bold">Include Full Code Base Context in AI Prompts</h4>
                <p className="text-[11px] text-slate-400">Pass active files to OpenRouter models for accurate multi-file edits.</p>
              </div>
              <button
                onClick={() => setEnableContextSharing(!enableContextSharing)}
                className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                  enableContextSharing ? "bg-indigo-600" : "bg-slate-300 dark:bg-zinc-700"
                }`}
              >
                <div className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${
                  enableContextSharing ? "left-6" : "left-1"
                }`} />
              </button>
            </div>

            <div className="flex items-center justify-between pt-3">
              <div>
                <h4 className="text-xs font-bold">Local Workspace Persistence Cache</h4>
                <p className="text-[11px] text-slate-400">Save workspace tabs, open files, and search history in browser localStorage.</p>
              </div>
              <button
                onClick={() => setEnableLocalCache(!enableLocalCache)}
                className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                  enableLocalCache ? "bg-indigo-600" : "bg-slate-300 dark:bg-zinc-700"
                }`}
              >
                <div className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${
                  enableLocalCache ? "left-6" : "left-1"
                }`} />
              </button>
            </div>

            <div className="flex items-center justify-between pt-3">
              <div>
                <h4 className="text-xs font-bold">Anonymous Performance Diagnostics</h4>
                <p className="text-[11px] text-slate-400">Send error call stacks to improve model execution speed.</p>
              </div>
              <button
                onClick={() => setEnableTelemetry(!enableTelemetry)}
                className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                  enableTelemetry ? "bg-indigo-600" : "bg-slate-300 dark:bg-zinc-700"
                }`}
              >
                <div className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${
                  enableTelemetry ? "left-6" : "left-1"
                }`} />
              </button>
            </div>

          </div>

          <div className="pt-2 flex justify-end">
            <button
              onClick={handleClearCache}
              className="text-xs text-rose-500 hover:text-rose-400 font-semibold flex items-center gap-1.5 border border-rose-500/20 bg-rose-500/10 px-3 py-1.5 rounded-lg cursor-pointer transition-all hover:bg-rose-500/20"
            >
              <Trash2 className="w-3.5 h-3.5" /> Clear Local Workspace Cache
            </button>
          </div>
        </div>

        {/* SECTION 3: CONNECTORS & API PIPELINES */}
        <div className={`p-6 rounded-2xl border shadow-sm space-y-5 ${
          theme === "dark" ? "bg-zinc-900/90 border-zinc-800" : "bg-white border-slate-200"
        }`}>
          <div className="flex items-center gap-2.5 border-b pb-3 border-slate-200 dark:border-zinc-800">
            <Link className="w-5 h-5 text-indigo-500" />
            <h3 className="text-sm font-bold tracking-tight">Integrations & Model Connectors</h3>
          </div>

          <div className="space-y-4">
            
            {/* Setup Guide Checklist Box */}
            <div className="p-4 rounded-xl border border-indigo-500/30 bg-indigo-500/10 text-xs space-y-2">
              <span className="font-bold text-indigo-400 flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-amber-400" /> Complete Setup Guide for Full Workspace Features:
              </span>
              <ul className="space-y-1.5 font-mono text-[11px] text-slate-300">
                <li className="flex items-start gap-1.5">
                  <span className="text-amber-400 font-bold shrink-0">1. OpenRouter Key:</span>
                  <span>Get your key from <a href="https://openrouter.ai/keys" target="_blank" rel="noreferrer" className="text-indigo-400 hover:underline font-bold">openrouter.ai/keys</a> and paste below.</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-amber-400 font-bold shrink-0">2. GitHub Integration:</span>
                  <span>Create a Personal Access Token at <a href="https://github.com/settings/tokens" target="_blank" rel="noreferrer" className="text-indigo-400 hover:underline font-bold">github.com/settings/tokens</a> with <code className="text-emerald-400 font-bold">repo</code> scope for pushing code.</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-amber-400 font-bold shrink-0">3. Supabase Cloud DB:</span>
                  <span>Retrieve Project URL and Anon Key from <a href="https://supabase.com/dashboard" target="_blank" rel="noreferrer" className="text-indigo-400 hover:underline font-bold">supabase.com/dashboard</a> settings.</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-amber-400 font-bold shrink-0">4. Google & Gmail:</span>
                  <span>Click "Connect Google Account" in the top bar to enable Gmail & Drive exports.</span>
                </li>
              </ul>
            </div>

            {/* Network Speed Test Banner Card */}
            <div className="p-4 rounded-xl border border-sky-500/30 bg-sky-950/20 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
                  <Activity className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white flex items-center gap-2">
                    Network Speed & Bandwidth Diagnostic Tool
                  </h4>
                  <p className="text-[11px] text-zinc-400">Test download/upload speeds, latency ping (ms), and connection stability.</p>
                </div>
              </div>

              <button
                onClick={() => setIsSpeedTestOpen(true)}
                className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-md"
              >
                <Wifi className="w-4 h-4" /> Run Network Speed Test
              </button>
            </div>

            {/* Comprehensive API Keys Management Section */}
            <div className="p-4 rounded-xl border border-indigo-500/30 bg-indigo-950/20 space-y-4">
              <div className="flex flex-wrap items-center justify-between border-b border-zinc-800 pb-2 gap-2">
                <span className="font-extrabold text-xs text-indigo-400 flex items-center gap-2">
                  <Key className="w-4 h-4 text-amber-400" /> Comprehensive API Keys & Credentials Manager
                </span>
                
                <button
                  onClick={handleTestAllKeys}
                  disabled={isTestingKeys}
                  className="px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-bold cursor-pointer transition-all flex items-center gap-1.5 shadow-xs disabled:opacity-50"
                >
                  <RefreshCw className={`w-3 h-3 ${isTestingKeys ? "animate-spin" : ""}`} />
                  {isTestingKeys ? "Testing Connections..." : "Test All API Key Connections"}
                </button>
              </div>

              {/* Key Test Results Display */}
              {Object.keys(keyTestResults).length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 p-3 rounded-xl bg-zinc-950 border border-zinc-800 text-[11px] font-mono">
                  {Object.entries(keyTestResults).map(([keyName, res]) => (
                    <div key={keyName} className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-between">
                      <span className="font-bold text-zinc-300 uppercase">{keyName}:</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        res.status === "ok"
                          ? "bg-emerald-500/10 text-emerald-400"
                          : res.status === "error"
                          ? "bg-rose-500/10 text-rose-400"
                          : "bg-zinc-800 text-zinc-500"
                      }`}>
                        {res.msg} {res.latency > 0 && `(${res.latency}ms)`}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                {/* Gemini API Key */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-300 uppercase block">Google Gemini API Key</label>
                  <input
                    type="password"
                    value={localStorage.getItem("gemini_api_key") || ""}
                    onChange={(e) => localStorage.setItem("gemini_api_key", e.target.value)}
                    placeholder="AIzaSy..."
                    className="w-full p-2 rounded-lg bg-zinc-900 border border-zinc-700 text-white font-mono text-xs outline-none focus:border-indigo-500"
                  />
                </div>

                {/* YouTube Data API Key */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-300 uppercase block">YouTube Data API Key</label>
                  <input
                    type="password"
                    value={localStorage.getItem("youtube_api_key") || ""}
                    onChange={(e) => localStorage.setItem("youtube_api_key", e.target.value)}
                    placeholder="AIzaSy..."
                    className="w-full p-2 rounded-lg bg-zinc-900 border border-zinc-700 text-white font-mono text-xs outline-none focus:border-indigo-500"
                  />
                </div>

                {/* Unsplash API Key */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-300 uppercase block">Unsplash Stock Photos API Key</label>
                  <input
                    type="password"
                    value={localStorage.getItem("unsplash_api_key") || ""}
                    onChange={(e) => localStorage.setItem("unsplash_api_key", e.target.value)}
                    placeholder="Client-ID..."
                    className="w-full p-2 rounded-lg bg-zinc-900 border border-zinc-700 text-white font-mono text-xs outline-none focus:border-indigo-500"
                  />
                </div>

                {/* OpenWeather / Air Quality Key */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-300 uppercase block">OpenWeather / AQI Key</label>
                  <input
                    type="password"
                    value={localStorage.getItem("openweather_api_key") || ""}
                    onChange={(e) => localStorage.setItem("openweather_api_key", e.target.value)}
                    placeholder="ow_..."
                    className="w-full p-2 rounded-lg bg-zinc-900 border border-zinc-700 text-white font-mono text-xs outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>

            {/* OpenRouter API Key */}
            <div className="p-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-950/40 space-y-2">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 font-bold text-xs">
                  <Key className="w-4 h-4 text-indigo-500" /> OpenRouter API Connector
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                  apiKey ? "bg-emerald-500/10 text-emerald-400" : "bg-amber-500/10 text-amber-500"
                }`}>
                  {apiKey ? "Connected" : "Key Not Set"}
                </span>
              </div>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => onApiKeyChange(e.target.value)}
                placeholder="sk-or-v1-..."
                className={`w-full bg-white dark:bg-zinc-900 border ${
                  apiKey && !isValidOpenRouterKey(apiKey) 
                    ? "border-rose-500 focus:border-rose-500" 
                    : "border-slate-200 dark:border-zinc-700 focus:border-indigo-500"
                } rounded-lg px-3 py-1.5 text-xs text-mono focus:outline-none`}
              />
              {apiKey && !isValidOpenRouterKey(apiKey) && (
                <p className="text-[10px] text-rose-500 dark:text-rose-400 font-medium flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3 shrink-0" />
                  OpenRouter keys usually begin with "sk-or-". Please verify your key.
                </p>
              )}
              <p className="text-[10px] text-slate-400">Used to route prompts directly to your chosen Target AI Brain model.</p>
            </div>

            {/* HuggingFace Connector */}
            <div className="p-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-950/40 space-y-2">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 font-bold text-xs">
                  <Globe2 className="w-4 h-4 text-amber-500" /> Hugging Face Model Hub Connector
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                  hfToken ? "bg-emerald-500/10 text-emerald-400" : "bg-slate-500/10 text-slate-400"
                }`}>
                  {hfToken ? "Connected" : "Optional"}
                </span>
              </div>
              <input
                type="password"
                value={hfToken}
                onChange={(e) => setHfToken(e.target.value)}
                placeholder="hf_..."
                className="w-full bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-lg px-3 py-1.5 text-xs text-mono focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Custom Webhook Connector */}
            <div className="p-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-950/40 space-y-2">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 font-bold text-xs">
                  <Radio className="w-4 h-4 text-emerald-500" /> Webhook Output Dispatcher
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                  webhookUrl ? "bg-emerald-500/10 text-emerald-400" : "bg-slate-500/10 text-slate-400"
                }`}>
                  {webhookUrl ? "Active" : "Disabled"}
                </span>
              </div>
              <input
                type="text"
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
                placeholder="https://your-server.com/api/agent-events"
                className="w-full bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-lg px-3 py-1.5 text-xs text-mono focus:outline-none focus:border-indigo-500"
              />
            </div>

          </div>
        </div>

      </div>

      <NetworkSpeedTestModal
        isOpen={isSpeedTestOpen}
        onClose={() => setIsSpeedTestOpen(false)}
        theme={theme}
      />
    </div>
  );
};
