import React from "react";
import {
  Key,
  RefreshCw,
  Check,
  AlertCircle,
  HelpCircle,
  Search,
  Trash2,
  Send,
  Square,
  Paperclip,
  Bot,
  Flame,
  Database
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Message, Model, VirtualFile } from "../types";
import { ThinkingPlanCard } from "./ThinkingPlanCard";
import { ChatMessageItem } from "./ChatMessageItem";

interface AiBrainSidebarPanelProps {
  theme: "light" | "dark" | string;
  sidebarWidth: number;
  showKey: boolean;
  setShowKey: React.Dispatch<React.SetStateAction<boolean>>;
  apiKey: string;
  setApiKey: React.Dispatch<React.SetStateAction<string>>;
  apiConnectionStatus: "idle" | "testing" | "success" | "error";
  apiErrorMessage: string;
  handleTestKeyConnection: () => void;
  selectedModel: string;
  setSelectedModel: React.Dispatch<React.SetStateAction<string>>;
  modelSearch: string;
  setModelSearch: React.Dispatch<React.SetStateAction<string>>;
  filteredModels: Model[];
  messages: Message[];
  isAgentProcessing: boolean;
  chatEndRef: React.RefObject<HTMLDivElement>;
  inputPrompt: string;
  setInputPrompt: React.Dispatch<React.SetStateAction<string>>;
  handleSendPrompt: (e?: React.FormEvent) => void;
  handleStopPrompt?: () => void;
  attachedFileForChat: string;
  setAttachedFileForChat: React.Dispatch<React.SetStateAction<string>>;
  selectedAgentForChat: string;
  setSelectedAgentForChat: React.Dispatch<React.SetStateAction<string>>;
  files: VirtualFile[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  addAgentAction: (type: any, message: string, path?: string) => void;
  setActiveTab: (tab: any) => void;
}

export const AiBrainSidebarPanel: React.FC<AiBrainSidebarPanelProps> = ({
  theme,
  sidebarWidth,
  showKey,
  setShowKey,
  apiKey,
  setApiKey,
  apiConnectionStatus,
  apiErrorMessage,
  handleTestKeyConnection,
  selectedModel,
  setSelectedModel,
  modelSearch,
  setModelSearch,
  filteredModels,
  messages,
  isAgentProcessing,
  chatEndRef,
  inputPrompt,
  setInputPrompt,
  handleSendPrompt,
  handleStopPrompt,
  attachedFileForChat,
  setAttachedFileForChat,
  selectedAgentForChat,
  setSelectedAgentForChat,
  files,
  setMessages,
  addAgentAction,
  setActiveTab
}) => {
  const isDark = theme !== "light";

  return (
    <aside
      className={`border-r flex flex-col h-[calc(100vh-96px)] overflow-hidden transition-all duration-150 shrink-0 ${
        isDark ? "border-zinc-800 bg-[#141416] text-white" : "border-slate-200 bg-slate-50/50 text-slate-900"
      }`}
      style={{ width: `${sidebarWidth}px` }}
    >
      {/* API CONFIG & MODEL SWITCHER (HEADER OF SIDEBAR) */}
      <div className={`p-4 border-b shadow-xs space-y-3.5 shrink-0 transition-all duration-200 ${
        isDark ? "border-zinc-800 bg-[#121214]" : "border-slate-200/80 bg-white"
      }`}>
        {/* OpenRouter API Key Input */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className={`text-[10px] font-bold uppercase tracking-widest flex items-center gap-1 ${
              isDark ? "text-zinc-400" : "text-slate-400"
            }`}>
              <Key className="w-3.5 h-3.5 text-indigo-500" />
              OpenRouter Credentials
            </label>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setShowKey(!showKey)}
                className="text-[10px] text-indigo-500 hover:text-indigo-400 font-semibold cursor-pointer"
              >
                {showKey ? "Hide" : "Show"}
              </button>
              <span className={isDark ? "text-zinc-700" : "text-slate-300"}>|</span>
              <button
                onClick={handleTestKeyConnection}
                className="text-[10px] text-indigo-500 hover:text-indigo-400 font-bold cursor-pointer flex items-center gap-0.5"
              >
                Test Link
              </button>
            </div>
          </div>

          <div className="relative">
            <input
              type={showKey ? "text" : "password"}
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="sk-or-v1-..."
              className={`w-full border rounded-lg px-3 py-2 text-xs font-mono transition-all pr-10 focus:outline-none ${
                isDark
                  ? "bg-zinc-900 border-zinc-800 text-indigo-400 placeholder-zinc-600 focus:border-indigo-500"
                  : "bg-slate-50 border-slate-200 text-indigo-600 placeholder-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              }`}
            />
            <div className="absolute right-2.5 top-2.5 flex items-center">
              {apiConnectionStatus === "testing" && (
                <RefreshCw className="w-4 h-4 text-slate-400 animate-spin" />
              )}
              {apiConnectionStatus === "success" && (
                <Check className="w-4 h-4 text-emerald-500" />
              )}
              {apiConnectionStatus === "error" && (
                <AlertCircle className="w-4 h-4 text-rose-500" />
              )}
              {apiConnectionStatus === "idle" && (
                <span title="Input your key to start compiling real-time changes.">
                  <HelpCircle className="w-4 h-4 text-slate-400 cursor-help" />
                </span>
              )}
            </div>
          </div>

          {/* Fallback API Status Text */}
          {apiErrorMessage ? (
            <p className="text-[10px] text-rose-500 mt-1.5 font-medium leading-normal bg-rose-500/10 p-2 rounded border border-rose-500/20">
              ⚠️ {apiErrorMessage}
            </p>
          ) : !apiKey ? (
            <p className={`text-[10px] mt-1.5 font-medium leading-relaxed px-2.5 py-1.5 rounded border ${
              isDark
                ? "text-amber-300/90 bg-amber-500/10 border-amber-500/20"
                : "text-amber-800 bg-amber-50 border-amber-200"
            }`}>
              💡 Built-in fallback to **Gemini 2.5 API** active for workspace compilation!
            </p>
          ) : apiConnectionStatus === "success" ? (
            <p className="text-[10px] text-emerald-500 mt-1 font-semibold flex items-center gap-1">
              ✓ Connection established. Code agent active.
            </p>
          ) : null}
        </div>

        {/* Model Selector & Filter */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={`block text-[10px] font-bold uppercase tracking-widest mb-1 ${
              isDark ? "text-zinc-400" : "text-slate-400"
            }`}>
              Target AI Brain
            </label>
            <div className="relative">
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className={`w-full border rounded-lg px-2.5 py-1.5 text-xs focus:outline-none cursor-pointer ${
                  isDark ? "bg-zinc-900 border-zinc-800 text-zinc-200" : "bg-slate-50 border-slate-200 text-slate-700"
                }`}
              >
                {Array.from(new Map((filteredModels || []).map(m => [m.id, m])).values()).map(m => (
                  <option key={m.id} value={m.id} className={isDark ? "bg-zinc-900 text-white" : "bg-white text-slate-700"}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className={`block text-[10px] font-bold uppercase tracking-widest mb-1 ${
              isDark ? "text-zinc-400" : "text-slate-400"
            }`}>
              Search Models
            </label>
            <div className="relative">
              <input
                type="text"
                value={modelSearch}
                onChange={(e) => setModelSearch(e.target.value)}
                placeholder="Filter AI..."
                className={`w-full border rounded-lg pl-6 pr-2 py-1.5 text-xs focus:outline-none ${
                  isDark ? "bg-zinc-900 border-zinc-800 text-zinc-200 placeholder-zinc-500" : "bg-slate-50 border-slate-200 text-slate-700 placeholder-slate-400"
                }`}
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2 top-2.5" />
            </div>
          </div>
        </div>

        {/* Quick selectors for favorite premium models */}
        <div className="flex flex-wrap gap-1">
          <span className={`text-[9px] uppercase tracking-wider font-bold self-center mr-1 ${
            isDark ? "text-zinc-500" : "text-slate-400"
          }`}>Favorites:</span>
          <button
            onClick={() => setSelectedModel("google/gemini-2.5-flash")}
            className={`text-[10px] px-2 py-0.5 rounded border transition-all cursor-pointer ${
              selectedModel === "google/gemini-2.5-flash"
                ? "bg-indigo-500/10 border-indigo-500/30 text-indigo-400 font-bold"
                : (isDark ? "bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white" : "bg-slate-50 border-slate-200 text-slate-500 hover:text-slate-800")
            }`}
          >
            Gemini Flash
          </button>
          <button
            onClick={() => setSelectedModel("anthropic/claude-3.5-sonnet")}
            className={`text-[10px] px-2 py-0.5 rounded border transition-all cursor-pointer ${
              selectedModel === "anthropic/claude-3.5-sonnet"
                ? "bg-indigo-500/10 border-indigo-500/30 text-indigo-400 font-bold"
                : (isDark ? "bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white" : "bg-slate-50 border-slate-200 text-slate-500 hover:text-slate-800")
            }`}
          >
            Claude Sonnet
          </button>
          <button
            onClick={() => setSelectedModel("deepseek/deepseek-reasoner")}
            className={`text-[10px] px-2 py-0.5 rounded border transition-all cursor-pointer ${
              selectedModel === "deepseek/deepseek-reasoner"
                ? "bg-indigo-500/10 border-indigo-500/30 text-indigo-400 font-bold"
                : (isDark ? "bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white" : "bg-slate-50 border-slate-200 text-slate-500 hover:text-slate-800")
            }`}
          >
            DeepSeek R1
          </button>
          <button
            onClick={() => setActiveTab("firebase")}
            className="text-[10px] px-2 py-0.5 rounded border border-amber-500/30 bg-amber-500/10 text-amber-400 font-bold transition-all cursor-pointer flex items-center gap-1 hover:bg-amber-500/20"
            title="Open Firebase Firestore Database Dashboard"
          >
            <Flame className="w-2.5 h-2.5 text-amber-500" />
            Firestore Cloud
          </button>
        </div>
      </div>

      {/* ACTIVE AGENT DIALOGUE (CHAT WINDOW) */}
      <div className={`flex-1 overflow-y-auto p-4 space-y-4 min-h-0 ${
        isDark ? "bg-[#0c0c0e]" : "bg-slate-50/50"
      }`}>
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <ChatMessageItem
              key={msg.id}
              msg={msg}
              theme={theme}
              isDark={isDark}
              onOpenPreview={() => setActiveTab("preview")}
            />
          ))}
        </AnimatePresence>

        {/* Processing agent loader block */}
        {isAgentProcessing && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-start w-full"
          >
            <div className="text-[10px] font-bold text-indigo-500 mb-1 px-1 flex items-center justify-between w-full">
              <span className="flex items-center gap-1.5 animate-pulse">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping"></span>
                ⚡ AGENT WORKING & GENERATING CODE...
              </span>
              <div className="flex items-center gap-2">
                {handleStopPrompt && (
                  <button
                    type="button"
                    onClick={handleStopPrompt}
                    className="px-2 py-0.5 rounded bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 border border-rose-500/40 text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-all"
                    title="Stop AI code generation"
                  >
                    <Square className="w-2.5 h-2.5 fill-current" />
                    Stop
                  </button>
                )}
                <span className="font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  Max Limit: 65,536 Tokens
                </span>
              </div>
            </div>
            <div className={`border rounded-2xl p-4 w-full space-y-3 shadow-md ${
              isDark ? "bg-[#18181b] border-zinc-800 text-zinc-300" : "bg-white border-slate-200 text-slate-700"
            }`}>
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                <div className="flex-1">
                  <div className="text-xs font-bold text-indigo-400">Compiling logic blocks & writing complete code files...</div>
                  <div className="text-[10px] text-slate-400 font-mono mt-0.5">High-speed token engine • Zipped context memory active</div>
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-[10px] font-mono text-slate-400">
                  <span>Generating Output...</span>
                  <span className="text-emerald-400 font-bold">Uncapped High Output Capacity</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-gradient-to-r from-indigo-500 via-emerald-400 to-indigo-500 h-full w-3/4 animate-pulse"></div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* CHAT INPUT AREA (BOTTOM OF SIDEBAR) */}
      <div className={`p-4 border-t shrink-0 ${
        isDark ? "border-zinc-800 bg-[#121214]" : "border-slate-200 bg-white"
      }`}>
        <form onSubmit={handleSendPrompt} className="relative flex items-center">
          <textarea
            value={inputPrompt}
            onChange={(e) => setInputPrompt(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSendPrompt();
              }
            }}
            placeholder="Ask AI agent to build files, write algorithms, edit components..."
            className={`w-full rounded-xl border pl-4 pr-12 py-3 text-xs leading-relaxed resize-none h-16 transition-all shadow-inner focus:outline-none ${
              isDark
                ? "bg-[#1c1c1f] border-zinc-800 text-zinc-100 placeholder-zinc-500 focus:border-indigo-500"
                : "bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            }`}
          />
          {isAgentProcessing ? (
            <button
              type="button"
              onClick={handleStopPrompt}
              className="absolute right-3.5 p-2 bg-rose-600 hover:bg-rose-500 text-white rounded-lg transition-all cursor-pointer shadow-md flex items-center justify-center"
              title="Stop AI Generation"
            >
              <Square className="w-4 h-4 fill-current" />
            </button>
          ) : (
            <button
              type="submit"
              disabled={!inputPrompt.trim()}
              className="absolute right-3.5 p-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white rounded-lg transition-all cursor-pointer shadow-md"
              title="Send prompt to agent"
            >
              <Send className="w-4 h-4" />
            </button>
          )}
        </form>

        {/* Extended controls bar: File attachment context selector & agent target mode */}
        <div className="mt-2.5 flex items-center justify-between text-[10px]">
          <div className="flex items-center gap-1.5 overflow-x-auto max-w-[70%] scrollbar-none">
            <Paperclip className="w-3 h-3 text-indigo-400 shrink-0" />
            <span className="text-slate-400 shrink-0">Attach File:</span>
            <select
              value={attachedFileForChat}
              onChange={(e) => setAttachedFileForChat(e.target.value)}
              className={`rounded px-1.5 py-0.5 border text-[10px] font-mono focus:outline-none cursor-pointer ${
                isDark ? "bg-zinc-900 border-zinc-800 text-indigo-300" : "bg-slate-100 border-slate-200 text-indigo-600"
              }`}
            >
              <option value="">(None)</option>
              {files.map(f => (
                <option key={f.path} value={f.path}>{f.path}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => {
                setMessages([{
                  id: "1",
                  role: "assistant",
                  content: "Workspace history cleared. How can I assist you with your code or files today?",
                  timestamp: new Date().toLocaleTimeString()
                }]);
                addAgentAction("info", "Cleared chat history.");
              }}
              className={`flex items-center gap-1 text-[10px] font-medium transition-colors cursor-pointer ${
                isDark ? "text-zinc-400 hover:text-indigo-400" : "text-slate-500 hover:text-indigo-600"
              }`}
              title="Clear workspace chat history"
            >
              <Trash2 className="w-3 h-3" />
              Clear History
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
};
