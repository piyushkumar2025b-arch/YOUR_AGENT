import React, { useState, useMemo } from "react";
import {
  FileCode,
  FileText,
  FileJson,
  Image as ImageIcon,
  Globe,
  Database,
  Copy,
  Check,
  Download,
  Eye,
  Code2,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Search
} from "lucide-react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { VirtualFile } from "../types";
import { TsxComponentPreviewer } from "./TsxComponentPreviewer";
import { sanitizeSvg } from "../utils/security";

interface UniversalFileInspectorProps {
  file: VirtualFile;
  files: VirtualFile[];
  theme: "light" | "dark";
  onSelectFile?: (path: string) => void;
}

export const UniversalFileInspector: React.FC<UniversalFileInspectorProps> = ({
  file,
  files,
  theme,
  onSelectFile
}) => {
  const [activeTab, setActiveTab] = useState<"render" | "code">("render");
  const [copied, setCopied] = useState(false);
  const [imgZoom, setImgZoom] = useState(1);
  const [csvSearch, setCsvSearch] = useState("");

  const ext = useMemo(() => {
    return file?.path ? file.path.split(".").pop()?.toLowerCase() || "" : "";
  }, [file?.path]);

  const fileType = useMemo(() => {
    if (["tsx", "jsx"].includes(ext)) return "tsx";
    if (["md", "markdown"].includes(ext)) return "markdown";
    if (["json"].includes(ext)) return "json";
    if (["html", "htm"].includes(ext)) return "html";
    if (["png", "jpg", "jpeg", "svg", "webp", "gif"].includes(ext)) return "image";
    if (["csv", "tsv"].includes(ext)) return "csv";
    return "code";
  }, [ext]);

  const handleCopy = () => {
    navigator.clipboard.writeText(file.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([file.content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = file.path.split("/").pop() || "download.txt";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Parsed JSON metadata
  const jsonParsed = useMemo(() => {
    if (fileType !== "json") return null;
    try {
      const parsed = JSON.parse(file.content);
      return { valid: true, data: parsed, error: null };
    } catch (e: any) {
      return { valid: false, data: null, error: e.message };
    }
  }, [file.content, fileType]);

  // Parsed CSV rows
  const csvData = useMemo(() => {
    if (fileType !== "csv") return null;
    const lines = file.content.trim().split("\n").filter(Boolean);
    if (lines.length === 0) return { headers: [], rows: [] };
    const delimiter = ext === "tsv" ? "\t" : ",";
    const headers = lines[0].split(delimiter).map(h => h.trim().replace(/^["']|["']$/g, ""));
    const rows = lines.slice(1).map(line => 
      line.split(delimiter).map(cell => cell.trim().replace(/^["']|["']$/g, ""))
    );
    return { headers, rows };
  }, [file.content, fileType, ext]);

  const filteredCsvRows = useMemo(() => {
    if (!csvData) return [];
    if (!csvSearch.trim()) return csvData.rows;
    return csvData.rows.filter(row => 
      row.some(cell => cell.toLowerCase().includes(csvSearch.toLowerCase()))
    );
  }, [csvData, csvSearch]);

  // If file is TSX / JSX, load our interactive TSX Live Component Previewer!
  if (fileType === "tsx") {
    return (
      <TsxComponentPreviewer
        files={files}
        initialFilePath={file.path}
        theme={theme}
        onSelectFile={onSelectFile}
      />
    );
  }

  return (
    <div className="h-full rounded-2xl border border-zinc-800 bg-[#0c0d12] text-slate-100 flex flex-col overflow-hidden shadow-2xl">
      {/* TOP HEADER */}
      <div className="px-4 py-2.5 bg-[#14151c] border-b border-zinc-800 flex items-center justify-between text-xs font-mono shrink-0">
        <div className="flex items-center gap-2.5 truncate">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80 inline-block"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80 inline-block"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 inline-block"></span>
          </div>

          <span className="px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[10px] font-bold uppercase">
            {ext || "FILE"}
          </span>

          <span className="text-slate-300 font-semibold truncate text-[11px]">{file.path}</span>
          <span className="text-zinc-500 text-[10px] hidden sm:inline">• {file.content.length} bytes</span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* View Tab Switcher for renderable files */}
          {["markdown", "html", "json", "csv"].includes(fileType) && (
            <div className="flex items-center gap-1 bg-black/40 p-0.5 rounded-lg border border-zinc-700/60 text-xs">
              <button
                onClick={() => setActiveTab("render")}
                className={`px-2 py-0.5 rounded-md text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1 ${
                  activeTab === "render" ? "bg-indigo-600 text-white shadow-xs" : "text-slate-400 hover:text-white"
                }`}
              >
                <Eye className="w-3 h-3" />
                <span>Preview</span>
              </button>
              <button
                onClick={() => setActiveTab("code")}
                className={`px-2 py-0.5 rounded-md text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1 ${
                  activeTab === "code" ? "bg-indigo-600 text-white shadow-xs" : "text-slate-400 hover:text-white"
                }`}
              >
                <Code2 className="w-3 h-3" />
                <span>Source</span>
              </button>
            </div>
          )}

          <button
            onClick={handleCopy}
            className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white text-[11px] font-semibold transition-all cursor-pointer flex items-center gap-1 border border-zinc-700"
            title="Copy File Content"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={handleDownload}
            className="p-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-300 text-[11px] font-semibold transition-all cursor-pointer flex items-center gap-1 border border-emerald-500/30"
            title="Download File"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
          </button>
        </div>
      </div>

      {/* BODY CONTENT */}
      <div className="flex-1 overflow-hidden relative flex flex-col">
        {/* 1. MARKDOWN PREVIEW */}
        {fileType === "markdown" && activeTab === "render" && (
          <div className="flex-1 overflow-auto p-6 md:p-8 font-sans bg-[#0e1017]">
            <div className="max-w-4xl mx-auto space-y-4 text-slate-200 leading-relaxed">
              <Markdown
                remarkPlugins={[remarkGfm]}
                components={{
                  h1: ({ children }) => <h1 className="text-2xl font-black text-white border-b border-zinc-800 pb-2 mb-4 tracking-tight">{children}</h1>,
                  h2: ({ children }) => <h2 className="text-xl font-bold text-white border-b border-zinc-800/60 pb-1.5 mt-6 mb-3">{children}</h2>,
                  h3: ({ children }) => <h3 className="text-base font-bold text-indigo-300 mt-4 mb-2">{children}</h3>,
                  p: ({ children }) => <p className="text-sm text-slate-300 my-2 leading-relaxed">{children}</p>,
                  ul: ({ children }) => <ul className="list-disc list-inside space-y-1 my-2 text-sm text-slate-300">{children}</ul>,
                  ol: ({ children }) => <ol className="list-decimal list-inside space-y-1 my-2 text-sm text-slate-300">{children}</ol>,
                  li: ({ children }) => <li className="text-slate-300">{children}</li>,
                  blockquote: ({ children }) => <blockquote className="border-l-4 border-indigo-500 pl-4 py-1 text-slate-400 italic bg-indigo-950/20 rounded-r-lg my-3">{children}</blockquote>,
                  code: ({ children, className }) => {
                    const isInline = !className;
                    return isInline ? (
                      <code className="px-1.5 py-0.5 rounded bg-zinc-800 text-indigo-300 font-mono text-xs">{children}</code>
                    ) : (
                      <pre className="p-4 rounded-xl bg-black/60 border border-zinc-800 text-indigo-200 font-mono text-xs overflow-x-auto my-3">
                        <code>{children}</code>
                      </pre>
                    );
                  },
                  table: ({ children }) => <div className="overflow-x-auto my-4"><table className="w-full border-collapse border border-zinc-800 text-xs text-left">{children}</table></div>,
                  th: ({ children }) => <th className="border border-zinc-800 bg-zinc-900/80 px-3 py-2 font-bold text-indigo-300">{children}</th>,
                  td: ({ children }) => <td className="border border-zinc-800 px-3 py-2 text-slate-300">{children}</td>,
                }}
              >
                {file.content}
              </Markdown>
            </div>
          </div>
        )}

        {/* 2. HTML PREVIEW */}
        {fileType === "html" && activeTab === "render" && (
          <div className="flex-1 overflow-hidden p-3 bg-zinc-950">
            <iframe
              srcDoc={file.content}
              title="HTML Live Preview"
              className="w-full h-full rounded-xl border border-zinc-800 bg-white"
              sandbox="allow-scripts allow-modals allow-same-origin allow-forms"
            />
          </div>
        )}

        {/* 3. JSON PREVIEW */}
        {fileType === "json" && activeTab === "render" && (
          <div className="flex-1 overflow-auto p-4 font-mono text-xs bg-[#0a0c10]">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-zinc-800 text-xs">
              <div className="flex items-center gap-2">
                {jsonParsed?.valid ? (
                  <span className="flex items-center gap-1 text-emerald-400 font-bold bg-emerald-500/10 px-2.5 py-0.5 rounded-md border border-emerald-500/20">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Valid JSON
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-rose-400 font-bold bg-rose-500/10 px-2.5 py-0.5 rounded-md border border-rose-500/20">
                    <AlertTriangle className="w-3.5 h-3.5" /> Invalid JSON: {jsonParsed?.error}
                  </span>
                )}
              </div>
            </div>

            <pre className="p-4 rounded-xl bg-black/60 border border-zinc-800/80 text-emerald-300 font-mono text-xs overflow-x-auto leading-relaxed">
              {jsonParsed?.valid 
                ? JSON.stringify(jsonParsed.data, null, 2) 
                : file.content
              }
            </pre>
          </div>
        )}

        {/* 4. IMAGE / SVG PREVIEW */}
        {fileType === "image" && (
          <div className="flex-1 flex flex-col items-center justify-center p-6 bg-zinc-950 relative overflow-hidden">
            {/* Zoom Controls */}
            <div className="absolute top-4 right-4 flex items-center gap-1 bg-black/70 p-1 rounded-xl border border-zinc-700 z-10">
              <button
                onClick={() => setImgZoom(z => Math.max(0.2, z - 0.2))}
                className="p-1.5 rounded-lg hover:bg-zinc-800 text-slate-300"
                title="Zoom Out"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <span className="text-[11px] font-mono font-bold px-2 text-slate-300">
                {Math.round(imgZoom * 100)}%
              </span>
              <button
                onClick={() => setImgZoom(z => Math.min(3, z + 0.2))}
                className="p-1.5 rounded-lg hover:bg-zinc-800 text-slate-300"
                title="Zoom In"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <button
                onClick={() => setImgZoom(1)}
                className="p-1.5 rounded-lg hover:bg-zinc-800 text-slate-400 hover:text-white"
                title="Reset Zoom"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>

            <div 
              className="p-6 rounded-2xl border border-zinc-800 shadow-2xl flex items-center justify-center transition-transform duration-150"
              style={{
                backgroundImage: `radial-gradient(#334155 1px, transparent 1px)`,
                backgroundSize: '16px 16px',
                transform: `scale(${imgZoom})`
              }}
            >
              {ext === "svg" ? (
                <div 
                  dangerouslySetInnerHTML={{ __html: sanitizeSvg(file.content) }} 
                  className="max-w-md max-h-96 flex items-center justify-center"
                />
              ) : (
                <img
                  src={file.content.startsWith("data:") ? file.content : `data:image/${ext};base64,${file.content}`}
                  alt={file.path}
                  className="max-w-md max-h-96 object-contain rounded-lg shadow-lg"
                  onError={(e) => {
                    // Fallback placeholder
                    (e.target as HTMLElement).style.display = "none";
                  }}
                />
              )}
            </div>
          </div>
        )}

        {/* 5. CSV / TSV DATA GRID */}
        {fileType === "csv" && activeTab === "render" && (
          <div className="flex-1 flex flex-col h-full overflow-hidden p-4 bg-[#0a0c10]">
            <div className="flex items-center justify-between gap-3 pb-3 border-b border-zinc-800 text-xs">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  <Database className="w-4 h-4" />
                </span>
                <span className="font-bold text-white">Table View ({filteredCsvRows.length} rows)</span>
              </div>

              <div className="relative flex items-center max-w-xs w-full">
                <Search className="w-3.5 h-3.5 absolute left-2.5 text-slate-500" />
                <input
                  type="text"
                  value={csvSearch}
                  onChange={(e) => setCsvSearch(e.target.value)}
                  placeholder="Filter rows..."
                  className="w-full bg-black/50 border border-zinc-800 rounded-lg pl-8 pr-2.5 py-1 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>
            </div>

            <div className="flex-1 overflow-auto rounded-xl border border-zinc-800 mt-3">
              <table className="w-full border-collapse text-left text-xs font-mono">
                <thead>
                  <tr className="bg-zinc-900 border-b border-zinc-800 sticky top-0">
                    <th className="px-3 py-2 text-zinc-500 w-12 text-center select-none">#</th>
                    {csvData?.headers.map((h, i) => (
                      <th key={i} className="px-3 py-2 font-bold text-indigo-300 border-r border-zinc-800 last:border-r-0">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60">
                  {filteredCsvRows.map((row, rIdx) => (
                    <tr key={rIdx} className="hover:bg-zinc-800/30 transition-colors">
                      <td className="px-3 py-2 text-zinc-600 text-center select-none text-[10px]">{rIdx + 1}</td>
                      {row.map((cell, cIdx) => (
                        <td key={cIdx} className="px-3 py-2 text-slate-300 border-r border-zinc-800/40 last:border-r-0">
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 6. RAW CODE / FALLBACK SOURCE VIEW */}
        {(activeTab === "code" || (!["markdown", "html", "json", "image", "csv"].includes(fileType))) && (
          <div className="flex-1 overflow-auto p-4 font-mono text-xs leading-relaxed bg-[#0c0d12]">
            <div className="max-w-5xl mx-auto space-y-0.5">
              {file.content.split("\n").map((line, idx) => (
                <div key={idx} className="flex items-start hover:bg-zinc-800/30 px-1 rounded transition-colors">
                  <span className="w-12 text-zinc-600 text-right pr-4 select-none shrink-0 text-[10px] pt-0.5">
                    {idx + 1}
                  </span>
                  <pre className="flex-1 whitespace-pre-wrap break-words text-slate-200 m-0 font-mono">
                    {line}
                  </pre>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* FOOTER */}
      <div className="px-4 py-1.5 bg-[#101218] border-t border-zinc-800 text-[10px] font-mono text-zinc-500 flex items-center justify-between shrink-0">
        <span>Type: {fileType.toUpperCase()}</span>
        <span>{file.content.split("\n").length} lines</span>
      </div>
    </div>
  );
};
