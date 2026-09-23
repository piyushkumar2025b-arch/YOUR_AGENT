import React, { useState, useEffect } from "react";
import {
  KeyRound,
  Eye,
  EyeOff,
  Copy,
  Check,
  Plus,
  Trash2,
  Sparkles,
  Download,
  FileCode,
  ShieldCheck,
  AlertCircle,
  X,
  RefreshCw,
  Sliders,
  Lock,
  Unlock,
  CheckCircle
} from "lucide-react";
import { VirtualFile } from "../types";

interface EnvSecretsVaultModalProps {
  isOpen: boolean;
  onClose: () => void;
  files: VirtualFile[];
  theme?: "light" | "dark" | string;
  onSaveEnvFile: (path: string, content: string) => void;
  onAddLog?: (type: string, message: string) => void;
}

interface EnvVarItem {
  id: string;
  key: string;
  value: string;
  comment?: string;
}

export const EnvSecretsVaultModal: React.FC<EnvSecretsVaultModalProps> = ({
  isOpen,
  onClose,
  files,
  theme = "dark",
  onSaveEnvFile,
  onAddLog
}) => {
  const isDark = theme === "dark";
  const [activeTab, setActiveTab] = useState<"visual" | "raw">("visual");

  // State
  const [envVars, setEnvVars] = useState<EnvVarItem[]>([]);
  const [rawText, setRawText] = useState<string>("");
  const [visibleValues, setVisibleValues] = useState<Record<string, boolean>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  // New variable inputs
  const [newKey, setNewKey] = useState<string>("");
  const [newValue, setNewValue] = useState<string>("");
  const [newComment, setNewComment] = useState<string>("");
  const [inputError, setInputError] = useState<string | null>(null);

  // Parse .env from files on open
  useEffect(() => {
    if (!isOpen) return;

    const envFile =
      files.find(f => f.path === ".env") ||
      files.find(f => f.path === ".env.local") ||
      files.find(f => f.path === ".env.example");

    const content = envFile?.content || `# RemixStudio Environment Secrets\nVITE_APP_NAME="RemixStudio AI"\nPORT=3000\nDATABASE_URL="postgres://user:password@localhost:5432/main_db"\nJWT_SECRET="e9b21a8d05fc37bc210398f4"\nAPI_KEY="sk_live_sec_991823746"\n`;
    setRawText(content);
    parseEnvContent(content);
  }, [isOpen, files]);

  const parseEnvContent = (content: string) => {
    const lines = content.split("\n");
    const parsed: EnvVarItem[] = [];
    let currentComment = "";

    lines.forEach((line, index) => {
      const trimmed = line.trim();
      if (!trimmed) return;

      if (trimmed.startsWith("#")) {
        currentComment = trimmed.replace(/^#\s*/, "");
        return;
      }

      const match = trimmed.match(/^([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/);
      if (match) {
        let val = match[2].trim();
        // Remove enclosing quotes if present
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
          val = val.substring(1, val.length - 1);
        }

        parsed.push({
          id: `env_${index}_${match[1]}`,
          key: match[1],
          value: val,
          comment: currentComment
        });
        currentComment = "";
      }
    });

    setEnvVars(parsed);
  };

  const serializeEnvVars = (vars: EnvVarItem[]): string => {
    let out = "# RemixStudio Environment Secrets Vault\n# Generated automatically\n\n";
    vars.forEach(v => {
      if (v.comment) {
        out += `# ${v.comment}\n`;
      }
      const needsQuotes = v.value.includes(" ") || v.value.includes("#") || v.value.includes("\n");
      out += `${v.key}=${needsQuotes ? `"${v.value}"` : v.value}\n`;
    });
    return out;
  };

  // Toggle Visibility
  const toggleVisibility = (id: string) => {
    setVisibleValues(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Copy to clipboard
  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1800);
  };

  // Add variable
  const handleAddVar = () => {
    const cleanKey = newKey.trim().toUpperCase().replace(/[^A-Z0-9_]/g, "_");
    if (!cleanKey) {
      setInputError("Variable key name is required.");
      return;
    }

    if (envVars.some(v => v.key === cleanKey)) {
      setInputError(`Variable '${cleanKey}' already exists.`);
      return;
    }

    const newItem: EnvVarItem = {
      id: `env_${Date.now()}_${cleanKey}`,
      key: cleanKey,
      value: newValue.trim(),
      comment: newComment.trim() || undefined
    };

    const updated = [...envVars, newItem];
    setEnvVars(updated);
    setRawText(serializeEnvVars(updated));

    setNewKey("");
    setNewValue("");
    setNewComment("");
    setInputError(null);
  };

  // Delete variable
  const handleDeleteVar = (id: string) => {
    const updated = envVars.filter(v => v.id !== id);
    setEnvVars(updated);
    setRawText(serializeEnvVars(updated));
  };

  // Update existing value
  const handleUpdateValue = (id: string, val: string) => {
    const updated = envVars.map(v => (v.id === id ? { ...v, value: val } : v));
    setEnvVars(updated);
    setRawText(serializeEnvVars(updated));
  };

  // Generate Crypto Secrets
  const generateRandomSecret = (type: "jwt" | "uuid" | "apikey" | "aes") => {
    let result = "";
    if (type === "jwt") {
      const arr = new Uint8Array(32);
      window.crypto.getRandomValues(arr);
      result = Array.from(arr, b => b.toString(16).padStart(2, "0")).join("");
    } else if (type === "uuid") {
      result = crypto.randomUUID();
    } else if (type === "apikey") {
      const arr = new Uint8Array(24);
      window.crypto.getRandomValues(arr);
      const hex = Array.from(arr, b => b.toString(16).padStart(2, "0")).join("");
      result = `sk_live_${hex}`;
    } else if (type === "aes") {
      const arr = new Uint8Array(32);
      window.crypto.getRandomValues(arr);
      result = btoa(String.fromCharCode(...arr));
    }

    setNewValue(result);
  };

  // Save to Workspace
  const handleSaveToWorkspace = () => {
    const textToSave = activeTab === "visual" ? serializeEnvVars(envVars) : rawText;
    onSaveEnvFile(".env", textToSave);
    setSavedSuccess(true);
    if (onAddLog) onAddLog("edit", "Synchronized .env secrets vault with workspace.");
    setTimeout(() => setSavedSuccess(false), 2200);
  };

  // Export .env.example
  const handleExportExample = () => {
    let example = "# Environment Configuration Template (.env.example)\n\n";
    envVars.forEach(v => {
      if (v.comment) example += `# ${v.comment}\n`;
      example += `${v.key}=""\n`;
    });
    const blob = new Blob([example], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = ".env.example";
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div
        className={`w-full max-w-4xl max-h-[90vh] rounded-2xl border shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200 ${
          isDark ? "bg-[#0f1017] border-zinc-800 text-zinc-100" : "bg-white border-slate-200 text-slate-800"
        }`}
      >
        {/* MODAL HEADER */}
        <div
          className={`px-5 py-4 border-b flex items-center justify-between shrink-0 ${
            isDark ? "border-zinc-800/80 bg-zinc-900/50" : "border-slate-200 bg-slate-50"
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold flex items-center gap-2">
                Environment Variables & Secrets Vault
                <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  .env
                </span>
              </h2>
              <p className="text-xs text-zinc-400">
                Safely manage application secrets, masked keys, and generate cryptographic tokens.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div
              className={`flex items-center p-1 rounded-lg border text-xs font-semibold ${
                isDark ? "bg-zinc-950 border-zinc-800" : "bg-slate-200 border-slate-300"
              }`}
            >
              <button
                onClick={() => setActiveTab("visual")}
                className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                  activeTab === "visual"
                    ? "bg-amber-500 text-black font-bold shadow-xs"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                Table View
              </button>
              <button
                onClick={() => {
                  setRawText(serializeEnvVars(envVars));
                  setActiveTab("raw");
                }}
                className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                  activeTab === "raw"
                    ? "bg-amber-500 text-black font-bold shadow-xs"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                Raw .env
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* MODAL BODY */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {activeTab === "visual" ? (
            <div className="space-y-4">
              {/* ADD VARIABLE CARD */}
              <div
                className={`p-4 rounded-xl border space-y-3 ${
                  isDark ? "bg-zinc-900/50 border-zinc-800" : "bg-slate-50 border-slate-200"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Plus className="w-3.5 h-3.5 text-amber-400" /> Add Environment Variable
                  </span>
                  <div className="flex items-center gap-1 text-[11px]">
                    <span className="text-zinc-500 font-semibold mr-1">Quick Generate:</span>
                    <button
                      onClick={() => generateRandomSecret("jwt")}
                      className="px-2 py-0.5 rounded border border-amber-500/30 text-amber-400 hover:bg-amber-500/10 cursor-pointer"
                    >
                      JWT Secret
                    </button>
                    <button
                      onClick={() => generateRandomSecret("apikey")}
                      className="px-2 py-0.5 rounded border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10 cursor-pointer"
                    >
                      API Key
                    </button>
                    <button
                      onClick={() => generateRandomSecret("uuid")}
                      className="px-2 py-0.5 rounded border border-blue-500/30 text-blue-400 hover:bg-blue-500/10 cursor-pointer"
                    >
                      UUID v4
                    </button>
                  </div>
                </div>

                {inputError && (
                  <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    {inputError}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-12 gap-2">
                  <div className="md:col-span-4">
                    <input
                      type="text"
                      placeholder="KEY_NAME (e.g. STRIPE_SECRET)"
                      value={newKey}
                      onChange={e => setNewKey(e.target.value)}
                      className={`w-full px-3 py-1.5 rounded-lg border text-xs font-mono font-bold uppercase outline-hidden ${
                        isDark ? "bg-zinc-950 border-zinc-800 text-white" : "bg-white border-slate-300"
                      }`}
                    />
                  </div>
                  <div className="md:col-span-5">
                    <input
                      type="text"
                      placeholder="Value or secret string"
                      value={newValue}
                      onChange={e => setNewValue(e.target.value)}
                      className={`w-full px-3 py-1.5 rounded-lg border text-xs font-mono outline-hidden ${
                        isDark ? "bg-zinc-950 border-zinc-800 text-amber-300" : "bg-white border-slate-300 text-amber-800"
                      }`}
                    />
                  </div>
                  <div className="md:col-span-3 flex gap-2">
                    <button
                      onClick={handleAddVar}
                      className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-500 hover:bg-amber-400 text-black cursor-pointer shadow-xs transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Add Key
                    </button>
                  </div>
                </div>
              </div>

              {/* VARIABLES LIST TABLE */}
              <div
                className={`rounded-xl border overflow-hidden ${
                  isDark ? "border-zinc-800 bg-zinc-950/40" : "border-slate-200 bg-white"
                }`}
              >
                <div
                  className={`grid grid-cols-12 px-4 py-2 text-[11px] font-bold uppercase tracking-wider border-b ${
                    isDark ? "border-zinc-800 bg-zinc-900/60 text-zinc-400" : "border-slate-200 bg-slate-100 text-slate-600"
                  }`}
                >
                  <div className="col-span-4">Variable Key</div>
                  <div className="col-span-6">Value (Encrypted/Masked)</div>
                  <div className="col-span-2 text-right">Actions</div>
                </div>

                <div className="divide-y divide-zinc-800/60">
                  {envVars.map(v => {
                    const isVisible = visibleValues[v.id];
                    return (
                      <div
                        key={v.id}
                        className={`grid grid-cols-12 px-4 py-2.5 items-center gap-2 text-xs transition-colors ${
                          isDark ? "hover:bg-zinc-900/30" : "hover:bg-slate-50"
                        }`}
                      >
                        <div className="col-span-4 flex items-center gap-2 overflow-hidden">
                          <Lock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                          <span className="font-mono font-bold truncate text-zinc-200">{v.key}</span>
                        </div>

                        <div className="col-span-6 flex items-center gap-2 font-mono">
                          {isVisible ? (
                            <input
                              type="text"
                              value={v.value}
                              onChange={e => handleUpdateValue(v.id, e.target.value)}
                              className={`w-full px-2 py-1 rounded border text-xs font-mono outline-hidden ${
                                isDark ? "bg-zinc-900 border-zinc-700 text-amber-300" : "bg-slate-100 border-slate-300"
                              }`}
                            />
                          ) : (
                            <span className="text-zinc-500 select-none tracking-widest text-xs">
                              ••••••••••••••••••••••••
                            </span>
                          )}
                        </div>

                        <div className="col-span-2 flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => toggleVisibility(v.id)}
                            className="p-1 rounded text-zinc-400 hover:text-white transition-colors"
                            title={isVisible ? "Mask value" : "Reveal value"}
                          >
                            {isVisible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          </button>
                          <button
                            onClick={() => copyToClipboard(v.value, v.id)}
                            className="p-1 rounded text-zinc-400 hover:text-emerald-400 transition-colors"
                            title="Copy value"
                          >
                            {copiedId === v.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                          <button
                            onClick={() => handleDeleteVar(v.id)}
                            className="p-1 rounded text-zinc-400 hover:text-rose-400 transition-colors"
                            title="Delete key"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}

                  {envVars.length === 0 && (
                    <div className="text-center py-8 text-zinc-500 text-xs">
                      No environment variables configured. Add one above!
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            /* RAW TEXT EDITOR */
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-400 flex items-center justify-between">
                <span>Raw .env Content</span>
                <span className="text-[11px] text-zinc-500 font-mono">Lines: {rawText.split("\n").length}</span>
              </label>
              <textarea
                rows={14}
                value={rawText}
                onChange={e => {
                  setRawText(e.target.value);
                  parseEnvContent(e.target.value);
                }}
                className={`w-full p-4 rounded-xl border text-xs font-mono outline-hidden ${
                  isDark ? "bg-zinc-950 border-zinc-800 text-amber-300" : "bg-slate-50 border-slate-300 text-amber-900"
                }`}
              />
            </div>
          )}
        </div>

        {/* MODAL FOOTER */}
        <div
          className={`px-5 py-3 border-t flex items-center justify-between shrink-0 ${
            isDark ? "border-zinc-800/80 bg-zinc-900/50" : "border-slate-200 bg-slate-50"
          }`}
        >
          <button
            onClick={handleExportExample}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-bold text-zinc-400 hover:text-white hover:bg-zinc-800 cursor-pointer transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            Export .env.example
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg text-xs font-bold text-zinc-400 hover:text-white cursor-pointer"
            >
              Close
            </button>
            <button
              onClick={handleSaveToWorkspace}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold cursor-pointer shadow-md transition-all ${
                savedSuccess
                  ? "bg-emerald-600 text-white"
                  : "bg-amber-500 hover:bg-amber-400 text-black"
              }`}
            >
              {savedSuccess ? (
                <>
                  <CheckCircle className="w-3.5 h-3.5" /> Saved to Workspace!
                </>
              ) : (
                <>
                  <ShieldCheck className="w-3.5 h-3.5" /> Save to .env File
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnvSecretsVaultModal;
