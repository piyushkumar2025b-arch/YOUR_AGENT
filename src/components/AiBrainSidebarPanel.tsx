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
  Database,
  PanelLeftClose
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Message, Model, VirtualFile } from "../types";
import { ThinkingPlanCard } from "./ThinkingPlanCard";
import { ChatMessageItem } from "./ChatMessageItem";

interface AiBrainSidebarPanelProps {
  onClose?: () => void;
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
  onClose,
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
      className={`border-r flex flex-col h-full min-h-0 overflow-hidden shrink-0 select-none ${
        isDark ? "border-zinc-800 bg-[#141416] text-white" : "border-slate-200 bg-slate-50/50 text-slate-900"
      }`}
      style={{ width: `${sidebarWidth}px`, minWidth: "240px", maxWidth: "650px" }}
    >
      {/* COMPACT AI BRAIN CONTROLS HEADER */}
      <div className={`p-3 border-b shadow-xs space-y-2 shrink-0 transition-all duration-200 ${
        isDark ? "border-zinc-800 bg-[#121214]" : "border-slate-200/80 bg-white"
      }`}>
        {/* Main Controls Row */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 flex-1 min-w-0">
            <Bot className="w-4 h-4 text-indigo-500 shrink-0" />
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className={`flex-1 border rounded-lg px-2 py-1 text-xs focus:outline-none cursor-pointer truncate ${
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

          <button
            onClick={() => setShowKey(!showKey)}
            className={`p-1.5 rounded-lg border text-xs transition-colors cursor-pointer ${
              showKey
                ? "bg-indigo-600 text-white border-indigo-500"
                : isDark
                ? "border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800"
                : "border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
            title="Configure Custom OpenRouter API Key"
          >
            <Key className="w-3.5 h-3.5" />
          </button>

          {onClose && (
            <button
              onClick={onClose}
              className={`p-1.5 rounded-lg border text-xs transition-colors cursor-pointer ${
                isDark
                  ? "border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800"
                  : "border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`}
              title="Collapse AI Sidebar (Ctrl+B)"
            >
              <PanelLeftClose className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Quick Selectors for Favorite Models */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setSelectedModel("google/gemini-2.5-flash")}
            className={`text-[10px] px-2 py-0.5 rounded-md border transition-all cursor-pointer ${
              selectedModel === "google/gemini-2.5-flash"
                ? "bg-indigo-500/10 border-indigo-500/30 text-indigo-400 font-bold"
                : isDark ? "bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white" : "bg-slate-50 border-slate-200 text-slate-500 hover:text-slate-800"
            }`}
          >
            Gemini Flash
          </button>
          <button
            onClick={() => setSelectedModel("anthropic/claude-3.5-sonnet")}
            className={`text-[10px] px-2 py-0.5 rounded-md border transition-all cursor-pointer ${
              selectedModel === "anthropic/claude-3.5-sonnet"
                ? "bg-indigo-500/10 border-indigo-500/30 text-indigo-400 font-bold"
                : isDark ? "bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white" : "bg-slate-50 border-slate-200 text-slate-500 hover:text-slate-800"
            }`}
          >
            Claude Sonnet
          </button>
          <button
            onClick={() => setSelectedModel("deepseek/deepseek-reasoner")}
            className={`text-[10px] px-2 py-0.5 rounded-md border transition-all cursor-pointer ${
              selectedModel === "deepseek/deepseek-reasoner"
                ? "bg-indigo-500/10 border-indigo-500/30 text-indigo-400 font-bold"
                : isDark ? "bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white" : "bg-slate-50 border-slate-200 text-slate-500 hover:text-slate-800"
            }`}
          >
            DeepSeek R1
          </button>
        </div>

        {/* Optional Collapsible OpenRouter API Key Input */}
        {showKey && (
          <div className="pt-2 border-t border-zinc-800/60 space-y-2">
            <div className="flex items-center justify-between text-[10px]">
              <span className="font-bold text-zinc-400 uppercase tracking-wider">Custom API Key</span>
              <button
                onClick={handleTestKeyConnection}
                className="text-indigo-400 hover:text-indigo-300 font-bold cursor-pointer flex items-center gap-1"
              >
                {apiConnectionStatus === "testing" ? <RefreshCw className="w-3 h-3 animate-spin" /> : "Test Link"}
              </button>
            </div>
            <div className="relative">
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="sk-or-v1-..."
                className={`w-full border rounded-lg px-2.5 py-1.5 text-xs font-mono pr-8 focus:outline-none ${
                  isDark
                    ? "bg-zinc-900 border-zinc-800 text-indigo-400 placeholder-zinc-600 focus:border-indigo-500"
                    : "bg-slate-50 border-slate-200 text-indigo-600 placeholder-slate-400 focus:border-indigo-500"
                }`}
              />
              <div className="absolute right-2 top-2">
                {apiConnectionStatus === "success" && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                {apiConnectionStatus === "error" && <AlertCircle className="w-3.5 h-3.5 text-rose-400" />}
              </div>
            </div>
            {apiErrorMessage && (
              <p className="text-[10px] text-rose-400 font-medium">⚠️ {apiErrorMessage}</p>
            )}
          </div>
        )}
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

        {/* Suggested Quick Prompts when dialogue is fresh */}
        {messages.length <= 1 && !isAgentProcessing && (
          <div className="pt-2 pb-1 space-y-2">
            <span className={`text-[10px] font-semibold uppercase tracking-wider ${
              isDark ? "text-zinc-500" : "text-slate-400"
            }`}>
              Suggested Prompts:
            </span>
            <div className="grid grid-cols-1 gap-1.5">
              {[
                "Refactor preview into a clean responsive layout",
                "Add interactive state management and form validation",
                "Create a modern hero visual with dark/light theme support"
              ].map((suggestion, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setInputPrompt(suggestion)}
                  className={`text-left text-xs px-3 py-2 rounded-xl border transition-all cursor-pointer ${
                    isDark
                      ? "bg-zinc-900/60 border-zinc-800 text-zinc-300 hover:border-indigo-500/50 hover:bg-zinc-800/80"
                      : "bg-white border-slate-200 text-slate-700 hover:border-indigo-400 hover:bg-indigo-50/50"
                  }`}
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Processing agent loader block */}
        {isAgentProcessing && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-start w-full"
          >
            <div className={`border rounded-xl p-3 w-full space-y-2 shadow-xs ${
              isDark ? "bg-[#18181b] border-zinc-800 text-zinc-300" : "bg-white border-slate-200 text-slate-700"
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3.5 h-3.5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-xs font-semibold text-indigo-400">Agent reasoning and writing code...</span>
                </div>
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
              </div>
              <div className="w-full bg-slate-200 dark:bg-zinc-800 h-1 rounded-full overflow-hidden">
                <div className="bg-gradient-to-r from-indigo-500 via-emerald-400 to-indigo-500 h-full w-2/3 animate-pulse"></div>
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
