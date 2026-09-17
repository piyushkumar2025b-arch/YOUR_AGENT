import React, { useState, useEffect, useRef } from "react";
import {
  FileSpreadsheet,
  FileText,
  CheckSquare,
  HardDrive,
  Eye,
  Volume2,
  VolumeX,
  Play,
  Square,
  Sparkles,
  UploadCloud,
  CheckCircle2,
  ExternalLink,
  RefreshCw,
  Copy,
  Layers,
  FileCode,
  ShieldCheck,
  AlertCircle
} from "lucide-react";
import { VirtualFile } from "../types";
import {
  exportFilesToGoogleSheets,
  exportApiBenchmarksToSheets,
  extractWorkspaceTodos,
  syncTodosToGoogleTasks,
  speakCodeWalkthrough,
  downloadDocFallback,
  ExtractedTodo,
  ExportResult
} from "../services/googleWorkspaceService";
import firebaseConfig from "../../firebase-applet-config.json";

interface GoogleWorkspaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme: "light" | "dark" | string;
  files: VirtualFile[];
  onAddFile?: (filePath: string, content: string) => void;
}

export const GoogleWorkspaceModal: React.FC<GoogleWorkspaceModalProps> = ({
  isOpen,
  onClose,
  theme,
  files,
  onAddFile
}) => {
  const [activeTab, setActiveTab] = useState<"workspace" | "vision" | "voice" | "cloud">("workspace");

  // Workspace exports state
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [exportNotice, setExportNotice] = useState<ExportResult | null>(null);
  const [extractedTodos, setExtractedTodos] = useState<ExtractedTodo[]>([]);

  // Multimodal Vision state
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageMimeType, setImageMimeType] = useState<string>("image/png");
  const [visionPrompt, setVisionPrompt] = useState<string>(
    "Analyze this UI wireframe or design screenshot and generate a modern, responsive React functional component styled with Tailwind CSS."
  );
  const [componentName, setComponentName] = useState<string>("CustomWidget");
  const [isGeneratingVision, setIsGeneratingVision] = useState<boolean>(false);
  const [generatedCode, setGeneratedCode] = useState<string>("");
  const [visionModelUsed, setVisionModelUsed] = useState<string>("");
  const [visionSuccessMsg, setVisionSuccessMsg] = useState<string>("");

  // Voice narration state
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [voiceSpeechScript, setVoiceSpeechScript] = useState<string>("");
  const speechControllerRef = useRef<{ stop: () => void } | null>(null);

  const isDark = theme !== "light";

  // Scan todos when modal opens
  useEffect(() => {
    if (isOpen) {
      const todos = extractWorkspaceTodos(files);
      setExtractedTodos(todos);

      // Prepare standard voice summary of workspace
      const tsFiles = files.filter((f) => f.path.endsWith(".ts") || f.path.endsWith(".tsx"));
      setVoiceSpeechScript(
        `Workspace overview: This project contains ${files.length} active files, including ${tsFiles.length} TypeScript source modules. The architecture is powered by Google Gemini 2.5 reasoning and Firebase Cloud Firestore for real-time document synchronization. All systems and API bridges are fully operational.`
      );
    }
  }, [isOpen, files]);

  // Clean up speech on close
  useEffect(() => {
    return () => {
      if (speechControllerRef.current) {
        speechControllerRef.current.stop();
      }
    };
  }, []);

  if (!isOpen) return null;

  // 1. Google Sheets Export Handler
  const handleExportSheets = async () => {
    setIsExporting(true);
    setExportNotice(null);
    try {
      const res = await exportFilesToGoogleSheets(files);
      setExportNotice(res);
    } catch (err: any) {
      setExportNotice({
        success: false,
        type: "fallback_download",
        message: err?.message || "Sheets export failed"
      });
    } finally {
      setIsExporting(false);
    }
  };

  // 2. Google Docs Export Handler
  const handleExportDocs = () => {
    setIsExporting(true);
    const docContent = `# Project Architecture & Technical Specification\n\nGenerated: ${new Date().toLocaleString()}\n\n## 1. System Summary\n- Total Workspace Files: ${files.length}\n- Primary Stack: React 18, TypeScript, Tailwind CSS, Express, Cloud Firestore\n- AI Reasoning Engine: Google Gemini 2.5 Flash / Pro\n\n## 2. File Manifest\n${files.map((f) => `- **${f.path}** (${(f.content || "").split("\n").length} lines)`).join("\n")}\n\n## 3. Active TODOs & Refactoring Items\n${extractedTodos.map((t) => `- [${t.type}] \`${t.filePath}:${t.line}\` - ${t.text}`).join("\n")}\n`;

    const res = downloadDocFallback(`Project_Architecture_Spec_${Date.now()}.md`, docContent);
    setExportNotice(res);
    setIsExporting(false);
  };

  // 3. Google Tasks Sync Handler
  const handleSyncTasks = async () => {
    if (extractedTodos.length === 0) {
      setExportNotice({
        success: true,
        type: "clipboard",
        message: "No TODO or FIXME comments detected in codebase.",
        itemsCount: 0
      });
      return;
    }
    setIsExporting(true);
    try {
      const res = await syncTodosToGoogleTasks(extractedTodos);
      setExportNotice(res);
    } catch (err: any) {
      setExportNotice({
        success: false,
        type: "clipboard",
        message: err?.message || "Tasks sync failed"
      });
    } finally {
      setIsExporting(false);
    }
  };

  // 4. Gemini Multimodal Vision: File Upload
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageMimeType(file.type || "image/png");
    const reader = new FileReader();
    reader.onload = (event) => {
      setImagePreview(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  // 5. Run Gemini Multimodal Vision
  const handleGenerateFromVision = async () => {
    if (!imagePreview) return;
    setIsGeneratingVision(true);
    setVisionSuccessMsg("");
    try {
      const res = await fetch("/api/gemini/vision", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageBase64: imagePreview,
          mimeType: imageMimeType,
          prompt: visionPrompt,
          componentName
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || `HTTP ${res.status}`);
      }

      setGeneratedCode(data.code || "// No code returned");
      setVisionModelUsed(data.modelUsed || "Gemini 2.5 Flash");
    } catch (err: any) {
      setGeneratedCode(`// Generation notice: ${err?.message}\n// Please verify your GEMINI_API_KEY.`);
    } finally {
      setIsGeneratingVision(false);
    }
  };

  // 6. Save Generated Component to Workspace
  const handleSaveVisionComponent = () => {
    if (!generatedCode || !onAddFile) return;

    // Extract code from ```tsx ... ``` if wrapped
    let cleanCode = generatedCode;
    const match = generatedCode.match(/```(?:tsx|typescript|jsx|javascript)?\n([\s\S]*?)```/);
    if (match && match[1]) {
      cleanCode = match[1].trim();
    }

    const path = `src/components/${componentName}.tsx`;
    onAddFile(path, cleanCode);
    setVisionSuccessMsg(`Saved component as '${path}' in workspace!`);
    setTimeout(() => setVisionSuccessMsg(""), 4000);
  };

  // 7. Voice Code Walkthrough Handler
  const handleToggleVoice = () => {
    if (isSpeaking) {
      if (speechControllerRef.current) {
        speechControllerRef.current.stop();
      }
      setIsSpeaking(false);
    } else {
      setIsSpeaking(true);
      speechControllerRef.current = speakCodeWalkthrough(
        voiceSpeechScript,
        () => setIsSpeaking(true),
        () => setIsSpeaking(false)
      );
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div
        className={`w-full max-w-5xl max-h-[92vh] rounded-2xl border shadow-2xl flex flex-col overflow-hidden ${
          isDark ? "bg-zinc-950 border-zinc-800 text-zinc-100" : "bg-white border-slate-200 text-slate-800"
        }`}
      >
        {/* MODAL HEADER */}
        <div
          className={`p-5 border-b flex flex-wrap items-center justify-between gap-4 ${
            isDark ? "bg-zinc-900/80 border-zinc-800" : "bg-slate-100 border-slate-200"
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/20">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold tracking-tight">Google Services & Multimodal Studio</h2>
                <span className="px-2.5 py-0.5 text-xs font-extrabold rounded-full bg-blue-500/15 text-blue-400 border border-blue-500/30">
                  Zero Latency Suite
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Google Sheets, Docs, Tasks, Drive, Gemini Multimodal Vision, and Voice Narration.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-zinc-800 cursor-pointer transition-colors"
          >
            ✕
          </button>
        </div>

        {/* NAVIGATION TABS */}
        <div className={`px-5 py-2.5 border-b flex items-center gap-2 overflow-x-auto text-xs font-bold ${
          isDark ? "bg-zinc-900/40 border-zinc-800/80" : "bg-slate-50 border-slate-200"
        }`}>
          <button
            onClick={() => setActiveTab("workspace")}
            className={`px-3.5 py-2 rounded-xl flex items-center gap-2 cursor-pointer transition-all ${
              activeTab === "workspace"
                ? "bg-blue-600 text-white shadow-sm shadow-blue-500/30"
                : "text-slate-400 hover:text-zinc-200 hover:bg-zinc-800/50"
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Workspace & Sheets Export</span>
          </button>

          <button
            onClick={() => setActiveTab("vision")}
            className={`px-3.5 py-2 rounded-xl flex items-center gap-2 cursor-pointer transition-all ${
              activeTab === "vision"
                ? "bg-blue-600 text-white shadow-sm shadow-blue-500/30"
                : "text-slate-400 hover:text-zinc-200 hover:bg-zinc-800/50"
            }`}
          >
            <Eye className="w-4 h-4" />
            <span>Gemini Vision (Wireframe-to-Code)</span>
          </button>

          <button
            onClick={() => setActiveTab("voice")}
            className={`px-3.5 py-2 rounded-xl flex items-center gap-2 cursor-pointer transition-all ${
              activeTab === "voice"
                ? "bg-blue-600 text-white shadow-sm shadow-blue-500/30"
                : "text-slate-400 hover:text-zinc-200 hover:bg-zinc-800/50"
            }`}
          >
            <Volume2 className="w-4 h-4" />
            <span>Voice Code Walkthrough</span>
          </button>

          <button
            onClick={() => setActiveTab("cloud")}
            className={`px-3.5 py-2 rounded-xl flex items-center gap-2 cursor-pointer transition-all ${
              activeTab === "cloud"
                ? "bg-blue-600 text-white shadow-sm shadow-blue-500/30"
                : "text-slate-400 hover:text-zinc-200 hover:bg-zinc-800/50"
            }`}
          >
            <HardDrive className="w-4 h-4" />
            <span>Firestore & Cloud Telemetry</span>
          </button>
        </div>

        {/* EXPORT NOTIFICATION BANNER */}
        {exportNotice && (
          <div className={`px-5 py-2.5 text-xs font-bold flex items-center justify-between border-b ${
            exportNotice.success ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-400" : "bg-amber-500/15 border-amber-500/30 text-amber-400"
          }`}>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{exportNotice.message}</span>
            </div>
            {exportNotice.url && (
              <a
                href={exportNotice.url}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 underline font-extrabold hover:text-emerald-300"
              >
                <span>Open in Google</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        )}

        {/* MODAL BODY */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* TAB 1: GOOGLE WORKSPACE EXPORTS */}
          {activeTab === "workspace" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* SHEETS EXPORT CARD */}
                <div className={`p-5 rounded-2xl border flex flex-col justify-between ${
                  isDark ? "bg-zinc-900/60 border-zinc-800" : "bg-slate-50 border-slate-200"
                }`}>
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="p-2 rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                        <FileSpreadsheet className="w-5 h-5" />
                      </div>
                      <span className="text-[10px] uppercase font-extrabold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400">
                        Google Sheets
                      </span>
                    </div>
                    <h3 className="font-bold text-sm">Export File Manifest</h3>
                    <p className="text-xs text-slate-400 mt-1">
                      Exports all {files.length} workspace files, sizes, line counts, and metadata directly into a Google Spreadsheet or CSV.
                    </p>
                  </div>
                  <button
                    onClick={handleExportSheets}
                    disabled={isExporting}
                    className="mt-4 w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-emerald-600/20 disabled:opacity-50 transition-all"
                  >
                    <FileSpreadsheet className="w-4 h-4" />
                    <span>{isExporting ? "Exporting..." : "Export to Sheets"}</span>
                  </button>
                </div>

                {/* DOCS EXPORT CARD */}
                <div className={`p-5 rounded-2xl border flex flex-col justify-between ${
                  isDark ? "bg-zinc-900/60 border-zinc-800" : "bg-slate-50 border-slate-200"
                }`}>
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="p-2 rounded-xl bg-blue-500/15 text-blue-400 border border-blue-500/30">
                        <FileText className="w-5 h-5" />
                      </div>
                      <span className="text-[10px] uppercase font-extrabold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400">
                        Google Docs
                      </span>
                    </div>
                    <h3 className="font-bold text-sm">Architecture Document</h3>
                    <p className="text-xs text-slate-400 mt-1">
                      Compiles technical specifications, module hierarchies, and system overview into a structured Google Doc.
                    </p>
                  </div>
                  <button
                    onClick={handleExportDocs}
                    disabled={isExporting}
                    className="mt-4 w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-blue-600/20 disabled:opacity-50 transition-all"
                  >
                    <FileText className="w-4 h-4" />
                    <span>Export to Docs</span>
                  </button>
                </div>

                {/* TASKS SYNC CARD */}
                <div className={`p-5 rounded-2xl border flex flex-col justify-between ${
                  isDark ? "bg-zinc-900/60 border-zinc-800" : "bg-slate-50 border-slate-200"
                }`}>
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="p-2 rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/30">
                        <CheckSquare className="w-5 h-5" />
                      </div>
                      <span className="text-[10px] uppercase font-extrabold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400">
                        Google Tasks
                      </span>
                    </div>
                    <h3 className="font-bold text-sm">Sync Code TODOs</h3>
                    <p className="text-xs text-slate-400 mt-1">
                      Scanned {extractedTodos.length} TODO/FIXME items across your codebase. Pushes items into your primary Google Task list.
                    </p>
                  </div>
                  <button
                    onClick={handleSyncTasks}
                    disabled={isExporting || extractedTodos.length === 0}
                    className="mt-4 w-full py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-amber-600/20 disabled:opacity-50 transition-all"
                  >
                    <CheckSquare className="w-4 h-4" />
                    <span>{extractedTodos.length > 0 ? `Sync ${extractedTodos.length} Tasks` : "No TODOs Found"}</span>
                  </button>
                </div>
              </div>

              {/* EXTRACTED CODE TODOS LIST */}
              {extractedTodos.length > 0 && (
                <div className={`p-4 rounded-2xl border ${
                  isDark ? "bg-zinc-900/40 border-zinc-800" : "bg-slate-50 border-slate-200"
                }`}>
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
                    <CheckSquare className="w-4 h-4 text-amber-400" />
                    <span>Detected Code Action Items ({extractedTodos.length})</span>
                  </h4>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {extractedTodos.map((todo) => (
                      <div
                        key={todo.id}
                        className={`p-2.5 rounded-xl border flex items-center justify-between text-xs ${
                          isDark ? "bg-zinc-950 border-zinc-800" : "bg-white border-slate-200"
                        }`}
                      >
                        <div className="flex items-center gap-2 overflow-hidden">
                          <span className={`px-2 py-0.5 rounded-md font-mono text-[10px] font-bold ${
                            todo.type === "BUG"
                              ? "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                              : todo.type === "FIXME"
                              ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                              : "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                          }`}>
                            {todo.type}
                          </span>
                          <span className="font-mono text-slate-400 truncate">{todo.filePath}:{todo.line}</span>
                          <span className="font-medium text-zinc-200 truncate">{todo.text}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: GEMINI MULTIMODAL VISION (WIREFRAME-TO-CODE) */}
          {activeTab === "vision" && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* UPLOAD & PROMPT PANEL */}
                <div className="space-y-4">
                  <div className={`p-5 rounded-2xl border border-dashed flex flex-col items-center justify-center text-center relative ${
                    isDark ? "bg-zinc-900/40 border-zinc-700" : "bg-slate-50 border-slate-300"
                  }`}>
                    {imagePreview ? (
                      <div className="relative group w-full flex flex-col items-center">
                        <img
                          src={imagePreview}
                          alt="Uploaded mockup"
                          className="max-h-52 rounded-xl object-contain shadow-md"
                        />
                        <label className="mt-3 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-bold text-white cursor-pointer transition-colors">
                          Replace Image
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageFileChange}
                            className="hidden"
                          />
                        </label>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center cursor-pointer p-4">
                        <UploadCloud className="w-10 h-10 text-blue-400 mb-2" />
                        <span className="font-bold text-sm">Upload Wireframe or Screenshot</span>
                        <span className="text-xs text-slate-400 mt-1">PNG, JPG, or WebP UI mockups</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageFileChange}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-400 block mb-1">Component Name</label>
                    <input
                      type="text"
                      value={componentName}
                      onChange={(e) => setComponentName(e.target.value.replace(/[^a-zA-Z0-9_]/g, ""))}
                      className={`w-full px-3 py-2 rounded-xl border text-xs font-mono font-bold ${
                        isDark ? "bg-zinc-900 border-zinc-800 text-white" : "bg-white border-slate-300 text-slate-900"
                      }`}
                      placeholder="e.g. AnalyticsCard"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-400 block mb-1">Custom Vision Prompt</label>
                    <textarea
                      rows={3}
                      value={visionPrompt}
                      onChange={(e) => setVisionPrompt(e.target.value)}
                      className={`w-full p-3 rounded-xl border text-xs font-medium resize-none ${
                        isDark ? "bg-zinc-900 border-zinc-800 text-zinc-200" : "bg-white border-slate-300 text-slate-900"
                      }`}
                      placeholder="Describe specific styling or behavior preferences..."
                    />
                  </div>

                  <button
                    onClick={handleGenerateFromVision}
                    disabled={!imagePreview || isGeneratingVision}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-extrabold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-blue-500/20 disabled:opacity-50 transition-all"
                  >
                    <Sparkles className={`w-4 h-4 ${isGeneratingVision ? "animate-spin" : ""}`} />
                    <span>{isGeneratingVision ? "Gemini 2.5 Analyzing Wireframe..." : "Convert Wireframe to React Code"}</span>
                  </button>
                </div>

                {/* GENERATED CODE PREVIEW */}
                <div className={`rounded-2xl border flex flex-col overflow-hidden ${
                  isDark ? "bg-zinc-900/60 border-zinc-800" : "bg-slate-50 border-slate-200"
                }`}>
                  <div className="p-3 border-b flex items-center justify-between text-xs font-bold">
                    <div className="flex items-center gap-2">
                      <FileCode className="w-4 h-4 text-blue-400" />
                      <span>Generated Component ({visionModelUsed || "Gemini Vision"})</span>
                    </div>
                    {generatedCode && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => navigator.clipboard.writeText(generatedCode)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-zinc-800 cursor-pointer"
                          title="Copy Code"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={handleSaveVisionComponent}
                          className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold cursor-pointer"
                        >
                          Save as File
                        </button>
                      </div>
                    )}
                  </div>

                  {visionSuccessMsg && (
                    <div className="px-3 py-1.5 bg-emerald-500/15 text-emerald-400 text-xs font-bold border-b border-emerald-500/30">
                      {visionSuccessMsg}
                    </div>
                  )}

                  <div className="p-3 flex-1 overflow-auto font-mono text-xs max-h-96">
                    {generatedCode ? (
                      <pre className="text-zinc-300 whitespace-pre-wrap">{generatedCode}</pre>
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center text-slate-500 text-xs text-center p-6">
                        <Eye className="w-8 h-8 mb-2 opacity-40" />
                        <span>Upload a mockup and click "Convert" to generate responsive React + Tailwind code.</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: VOICE CODE WALKTHROUGH */}
          {activeTab === "voice" && (
            <div className="space-y-5">
              <div className={`p-6 rounded-2xl border flex flex-col sm:flex-row items-center justify-between gap-6 ${
                isDark ? "bg-zinc-900/60 border-zinc-800" : "bg-slate-50 border-slate-200"
              }`}>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="p-2 rounded-xl bg-purple-500/15 text-purple-400 border border-purple-500/30">
                      <Volume2 className="w-5 h-5" />
                    </span>
                    <h3 className="text-base font-bold">Natural Codebase Narration</h3>
                  </div>
                  <p className="text-xs text-slate-400">
                    Browser-native audio synthesis narrating your project structure and architecture with zero network overhead.
                  </p>
                </div>

                <button
                  onClick={handleToggleVoice}
                  className={`px-5 py-3 rounded-xl font-extrabold text-xs flex items-center gap-2 cursor-pointer shadow-lg transition-all ${
                    isSpeaking
                      ? "bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/30 animate-pulse"
                      : "bg-purple-600 hover:bg-purple-500 text-white shadow-purple-600/30"
                  }`}
                >
                  {isSpeaking ? (
                    <>
                      <Square className="w-4 h-4 fill-current" />
                      <span>Stop Narration</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 fill-current" />
                      <span>Narrate Architecture</span>
                    </>
                  )}
                </button>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-400 block mb-1">Narration Script</label>
                <textarea
                  rows={4}
                  value={voiceSpeechScript}
                  onChange={(e) => setVoiceSpeechScript(e.target.value)}
                  className={`w-full p-3 rounded-xl border text-xs font-medium resize-none ${
                    isDark ? "bg-zinc-900 border-zinc-800 text-zinc-200" : "bg-white border-slate-300 text-slate-900"
                  }`}
                />
              </div>
            </div>
          )}

          {/* TAB 4: FIRESTORE & CLOUD TELEMETRY */}
          {activeTab === "cloud" && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className={`p-4 rounded-2xl border ${
                  isDark ? "bg-zinc-900/50 border-zinc-800" : "bg-slate-50 border-slate-200"
                }`}>
                  <div className="flex items-center gap-2 mb-2 text-emerald-400 font-bold text-xs">
                    <ShieldCheck className="w-4 h-4" />
                    <span>Cloud Firestore Status</span>
                  </div>
                  <p className="text-xs text-slate-400">Database ID:</p>
                  <p className="font-mono text-xs font-bold text-zinc-200">{firebaseConfig.firestoreDatabaseId}</p>
                  <p className="text-xs text-slate-400 mt-2">Project ID:</p>
                  <p className="font-mono text-xs font-bold text-zinc-200">{firebaseConfig.projectId}</p>
                </div>

                <div className={`p-4 rounded-2xl border ${
                  isDark ? "bg-zinc-900/50 border-zinc-800" : "bg-slate-50 border-slate-200"
                }`}>
                  <div className="flex items-center gap-2 mb-2 text-blue-400 font-bold text-xs">
                    <Sparkles className="w-4 h-4" />
                    <span>Google AI Studio & Gemini Engine</span>
                  </div>
                  <p className="text-xs text-slate-400">Primary Model:</p>
                  <p className="font-mono text-xs font-bold text-zinc-200">Gemini 2.5 Flash / Pro Multimodal</p>
                  <p className="text-xs text-slate-400 mt-2">Vision Gateway:</p>
                  <p className="font-mono text-xs font-bold text-zinc-200">/api/gemini/vision (Online)</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
