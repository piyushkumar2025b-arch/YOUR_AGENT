import React, { useState } from "react";
import {
  MessageSquare,
  Send,
  FileText,
  Download,
  Sparkles,
  Bot,
  User,
  Paperclip,
  Check,
  RefreshCw,
  FileCode,
  Layers
} from "lucide-react";
import { VirtualFile } from "../types";
import { exportWordDocument, exportPdfDocument } from "../services/workspaceExportService";

interface DocumentChatWorkspaceProps {
  apiKey: string;
  selectedModel: string;
  theme: "light" | "dark";
  files: VirtualFile[];
  setFiles: React.Dispatch<React.SetStateAction<VirtualFile[]>>;
  addAgentAction: (type: any, message: string, path?: string) => void;
  onSelectFile?: (path: string) => void;
  initialPrompt?: string;
}

export const DocumentChatWorkspace: React.FC<DocumentChatWorkspaceProps> = ({
  apiKey,
  selectedModel,
  theme,
  files,
  setFiles,
  addAgentAction,
  onSelectFile,
  initialPrompt = ""
}) => {
  const isDark = theme !== "light";
  const [prompt, setPrompt] = useState<string>(initialPrompt);
  const [selectedFileAttachment, setSelectedFileAttachment] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [chatHistory, setChatHistory] = useState<Array<{ role: "user" | "assistant"; content: string }>>([
    {
      role: "assistant",
      content:
        "👋 Welcome to Document & Media AI Workspace! I can generate interactive Web notes (.html), Microsoft Word files (.docx), printable PDFs, or inline SVG vector graphics directly into your workspace. Describe what document or code you'd like to craft."
    }
  ]);

  const handleExportWord = async () => {
    try {
      addAgentAction("info", "Assembling Microsoft Word Document from workspace files...");
      const fullContent = files.map((f) => `File: ${f.path}\n\n${f.content}`).join("\n\n---\n\n");
      await exportWordDocument("AI Workspace Reference Document", "", fullContent);
      addAgentAction("info", "Microsoft Word (.docx) downloaded successfully.");
    } catch (err: any) {
      addAgentAction("error", `Word Doc export error: ${err.message}`);
    }
  };

  const handleExportPdf = async () => {
    try {
      addAgentAction("info", "Rendering interactive PDF document...");
      const fullContent = files.map((f) => `File: ${f.path}\n\n${f.content}`).join("\n\n---\n\n");
      await exportPdfDocument("AI Workspace Technical Report", fullContent);
      addAgentAction("info", "Downloaded PDF document successfully.");
    } catch (err: any) {
      addAgentAction("error", `PDF export error: ${err.message}`);
    }
  };

  const handleCreateSampleSvg = () => {
    const path = "images/architecture_diagram.svg";
    const content = `<svg viewBox="0 0 800 500" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
  <rect width="800" height="500" rx="20" fill="#0f172a"/>
  <rect x="20" y="20" width="370" height="290" rx="15" fill="#1e1b4b" stroke="#4338ca" stroke-width="2"/>
  <text x="40" y="55" fill="#a5b4fc" font-family="sans-serif" font-weight="bold" font-size="18">IDE Engine Module</text>
  <text x="40" y="85" fill="#cbd5e1" font-family="sans-serif" font-size="12">Core virtual sandbox file system & code compiler.</text>
  <circle cx="205" cy="180" r="40" fill="#4338ca"/>
  <text x="180" y="185" fill="#fff" font-family="sans-serif" font-weight="bold" font-size="12">REACT</text>
  <rect x="410" y="20" width="370" height="135" rx="15" fill="#022c22" stroke="#0f766e" stroke-width="2"/>
  <text x="430" y="55" fill="#6ee7b7" font-family="sans-serif" font-weight="bold" font-size="18">Virtual File Tree</text>
  <text x="430" y="85" fill="#cbd5e1" font-family="sans-serif" font-size="12">Safe reactive state caching & multi-file tabs.</text>
  <rect x="410" y="175" width="370" height="135" rx="15" fill="#180c24" stroke="#581c87" stroke-width="2"/>
  <text x="430" y="210" fill="#e9d5ff" font-family="sans-serif" font-weight="bold" font-size="18">Multi-Agent Router</text>
  <text x="430" y="240" fill="#cbd5e1" font-family="sans-serif" font-size="12">53 distinct workspace utilities & developer tools.</text>
</svg>`;

    setFiles((prev) => [
      ...prev.filter((f) => f.path !== path),
      { path, content, language: "xml" }
    ]);
    if (onSelectFile) onSelectFile(path);
    addAgentAction("create", `Created SVG graphic diagram: ${path}`, path);
  };

  const handleSendPrompt = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanPrompt = prompt.trim();
    if (!cleanPrompt || isLoading) return;

    let userText = cleanPrompt;
    setPrompt("");

    if (selectedFileAttachment) {
      const targetFile = files.find((f) => f.path === selectedFileAttachment);
      if (targetFile) {
        userText += `\n\n[Attached Workspace File: ${targetFile.path}]\n\`\`\`${targetFile.language}\n${targetFile.content}\n\`\`\``;
      }
    }

    const newMsg = { role: "user" as const, content: userText };
    setChatHistory((prev) => [...prev, newMsg]);
    setIsLoading(true);

    try {
      const systemPrompt = `You are a high-speed Document, Media, and Code Specialist AI assistant.
When the user asks you to create or modify documents or files, output them enclosed in <file path="folder/filename.ext">...</file> tags.
You can create:
1. High-fidelity HTML pages (.html)
2. Markdown documentation (.md)
3. Vector graphics (.svg)
4. JSON schemas or mock data (.json)
5. TypeScript / JavaScript code (.ts, .tsx, .js)

Always write comprehensive, production-ready code with no incomplete placeholders.`;

      const response = await fetch("/api/openrouter/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: apiKey ? `Bearer ${apiKey}` : ""
        },
        body: JSON.stringify({
          model: selectedModel,
          messages: [
            { role: "system", content: systemPrompt },
            ...chatHistory,
            newMsg
          ],
          temperature: 0.2
        })
      });

      if (!response.ok) {
        throw new Error(`OpenRouter request failed (${response.status})`);
      }

      const resData = await response.json();
      const assistantReply = resData.choices?.[0]?.message?.content || "No reply returned.";

      // Parse any <file path="..."> tags to automatically save into workspace files
      const fileRegex = /<file\s+path=["']([^"']+)["']>([\s\S]*?)<\/file>/gi;
      let match;
      const createdFiles: string[] = [];
      let updatedList = [...files];

      while ((match = fileRegex.exec(assistantReply)) !== null) {
        const filePath = match[1].trim();
        const fileContent = match[2].trim();
        let lang = "text";
        if (filePath.endsWith(".html")) lang = "html";
        else if (filePath.endsWith(".svg")) lang = "xml";
        else if (filePath.endsWith(".md")) lang = "markdown";
        else if (filePath.endsWith(".ts") || filePath.endsWith(".tsx")) lang = "typescript";
        else if (filePath.endsWith(".json")) lang = "json";

        const idx = updatedList.findIndex((f) => f.path.toLowerCase() === filePath.toLowerCase());
        if (idx > -1) {
          updatedList[idx] = { ...updatedList[idx], content: fileContent, language: lang };
        } else {
          updatedList.push({ path: filePath, content: fileContent, language: lang });
        }
        createdFiles.push(filePath);
        addAgentAction("create", `Drafted workspace file from Chat: ${filePath}`, filePath);
      }

      if (createdFiles.length > 0) {
        setFiles(updatedList);
      }

      setChatHistory((prev) => [...prev, { role: "assistant", content: assistantReply }]);
    } catch (err: any) {
      setChatHistory((prev) => [
        ...prev,
        { role: "assistant", content: `❌ Error communicating with model: ${err.message}` }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`h-full w-full flex-1 flex flex-col overflow-hidden ${
      isDark ? "bg-[#0c0d12] text-zinc-100" : "bg-slate-50 text-slate-800"
    }`}>
      {/* Header Toolbar */}
      <div className={`px-6 py-3.5 border-b flex flex-wrap items-center justify-between gap-4 shrink-0 ${
        isDark ? "bg-[#111622] border-zinc-800" : "bg-white border-slate-200"
      }`}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-600/10 text-indigo-400 rounded-xl border border-indigo-500/20">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold flex items-center gap-2">
              Document & Media AI Assistant
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                Workspace Companion
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Draft documents, interactive web pages, vector SVGs, and code with AI
            </p>
          </div>
        </div>

        {/* Quick Document Export Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportWord}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors border ${
              isDark
                ? "bg-zinc-800/80 hover:bg-zinc-700 text-zinc-200 border-zinc-700"
                : "bg-white hover:bg-slate-100 text-slate-700 border-slate-300 shadow-xs"
            }`}
            title="Download full workspace as Microsoft Word Document (.docx)"
          >
            <Download className="w-3.5 h-3.5 text-blue-400" />
            <span>Word Doc</span>
          </button>

          <button
            onClick={handleExportPdf}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors border ${
              isDark
                ? "bg-zinc-800/80 hover:bg-zinc-700 text-zinc-200 border-zinc-700"
                : "bg-white hover:bg-slate-100 text-slate-700 border-slate-300 shadow-xs"
            }`}
            title="Export workspace as printable PDF"
          >
            <FileText className="w-3.5 h-3.5 text-rose-400" />
            <span>PDF</span>
          </button>

          <button
            onClick={handleCreateSampleSvg}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors bg-indigo-600 hover:bg-indigo-500 text-white shadow-xs"
            title="Generate SVG Architecture Diagram"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>New SVG</span>
          </button>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 max-w-4xl mx-auto w-full">
        {chatHistory.map((msg, index) => (
          <div
            key={index}
            className={`flex items-start gap-3 ${
              msg.role === "user" ? "flex-row-reverse" : "flex-row"
            }`}
          >
            <div className={`p-2 rounded-xl shrink-0 ${
              msg.role === "user"
                ? "bg-indigo-600 text-white"
                : isDark
                ? "bg-zinc-800 text-indigo-400 border border-zinc-700"
                : "bg-slate-200 text-indigo-600"
            }`}>
              {msg.role === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>

            <div className={`p-4 rounded-2xl max-w-[85%] text-xs leading-relaxed space-y-2 whitespace-pre-wrap break-words ${
              msg.role === "user"
                ? "bg-indigo-600 text-white rounded-tr-none shadow-md"
                : isDark
                ? "bg-[#141721] text-zinc-200 border border-zinc-800/80 rounded-tl-none shadow-xs"
                : "bg-white text-slate-800 border border-slate-200 rounded-tl-none shadow-xs"
            }`}>
              {msg.content}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl shrink-0 ${isDark ? "bg-zinc-800 text-indigo-400" : "bg-slate-200 text-indigo-600"}`}>
              <Bot className="w-4 h-4" />
            </div>
            <div className={`p-3 rounded-2xl text-xs flex items-center gap-2 ${
              isDark ? "bg-[#141721] text-slate-400 border border-zinc-800" : "bg-white text-slate-500 border border-slate-200"
            }`}>
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-indigo-400" />
              <span>Drafting document response...</span>
            </div>
          </div>
        )}
      </div>

      {/* Input Form Bar */}
      <div className={`p-4 border-t shrink-0 ${
        isDark ? "bg-[#111622] border-zinc-800" : "bg-white border-slate-200"
      }`}>
        <form onSubmit={handleSendPrompt} className="max-w-4xl mx-auto space-y-2">
          {/* File Attachment Selector */}
          <div className="flex items-center gap-2">
            <Paperclip className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="text-[11px] text-slate-400 shrink-0">Attach Workspace File:</span>
            <select
              value={selectedFileAttachment}
              onChange={(e) => setSelectedFileAttachment(e.target.value)}
              className={`text-xs py-1 px-2 rounded-lg border focus:outline-none ${
                isDark
                  ? "bg-zinc-900 border-zinc-700 text-zinc-300"
                  : "bg-slate-50 border-slate-300 text-slate-700"
              }`}
            >
              <option value="">(None)</option>
              {files.map((f) => (
                <option key={f.path} value={f.path}>
                  {f.path}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g. Create a technical user manual HTML page with dark mode styling..."
              className={`flex-1 p-2.5 rounded-xl border text-xs focus:outline-none transition-all ${
                isDark
                  ? "bg-[#181d29] border-zinc-700 text-white focus:border-indigo-500"
                  : "bg-slate-50 border-slate-300 text-slate-900 focus:border-indigo-500"
              }`}
            />

            <button
              type="submit"
              disabled={isLoading || !prompt.trim()}
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-md shadow-indigo-600/20 shrink-0"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
