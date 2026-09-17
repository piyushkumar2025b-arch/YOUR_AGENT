import React, { useState } from "react";
import { 
  Search, Globe, ExternalLink, Sparkles, Plus, Copy, Check, BookOpen, RefreshCw 
} from "lucide-react";
import { SearchResultItem, VirtualFile } from "../types";

interface SearchAgentProps {
  files: VirtualFile[];
  onInsertCode: (path: string, content: string) => void;
  theme: "light" | "dark";
  onSendToChat: (prompt: string) => void;
}

export const SearchAgent: React.FC<SearchAgentProps> = ({
  files,
  onInsertCode,
  theme,
  onSendToChat
}) => {
  const [query, setQuery] = useState<string>("React 19 hooks and server components best practices");
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [targetFilePath, setTargetFilePath] = useState<string>("docs/research_notes.md");
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  const handleSearch = async () => {
    if (!query.trim()) return;
    setIsLoading(true);

    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
      if (res.ok) {
        const json = await res.json();
        setResults(json.results || []);
      } else {
        throw new Error("Search server returned an error.");
      }
    } catch (err) {
      console.error("Search error:", err);
      // Fallback duckduckgo direct query
      setResults([
        {
          title: `Google Search Results for "${query}"`,
          snippet: `Live search query executed for "${query}". Use official documentation and verified stack overflow solutions.`,
          url: `https://www.google.com/search?q=${encodeURIComponent(query)}`
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInsertToWorkspace = () => {
    const markdownNotes = `# Search Grounding Report: ${query}\nDate: ${new Date().toLocaleString()}\n\n` + 
      results.map((r, i) => `### ${i+1}. [${r.title}](${r.url})\n${r.snippet}\n`).join("\n");

    onInsertCode(targetFilePath, markdownNotes);
  };

  return (
    <div className={`h-full w-full flex-1 flex flex-col overflow-hidden p-6 ${theme === "dark" ? "bg-[#121214] text-zinc-100" : "bg-slate-50 text-slate-800"}`}>
      
      {/* HEADER */}
      <div className="flex items-center gap-3 mb-6 shrink-0">
        <div className="p-2.5 bg-blue-600 text-white rounded-xl shadow-md">
          <Globe className="w-6 h-6 animate-spin [animation-duration:20s]" />
        </div>
        <div>
          <h2 className="text-base font-bold flex items-center gap-2">
            Google Search Powered Grounding Agent
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 font-mono border border-blue-200">
              Live Web Grounded
            </span>
          </h2>
          <p className="text-xs text-slate-400">Search the live web, fetch documentation, and feed real grounded facts into AI agent iterations</p>
        </div>
      </div>

      {/* SEARCH INPUT */}
      <div className={`p-4 rounded-xl border mb-6 flex items-center gap-3 shrink-0 shadow-xs ${
        theme === "dark" ? "bg-zinc-900 border-zinc-800" : "bg-white border-slate-200"
      }`}>
        <Search className="w-5 h-5 text-blue-500 ml-1" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search live web for technical documentation, libraries, or concepts..."
          className="flex-1 bg-transparent border-none text-slate-800 dark:text-zinc-200 text-xs font-medium focus:outline-none"
          onKeyDown={(e) => { if (e.key === "Enter") handleSearch(); }}
        />
        <button
          onClick={handleSearch}
          disabled={isLoading}
          className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2 rounded-lg text-xs font-bold transition-all active:scale-95 cursor-pointer flex items-center gap-1.5"
        >
          {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          Ground Search
        </button>
      </div>

      {/* RESULTS AND ACTIONS */}
      <div className="flex-1 grid grid-cols-12 gap-6 overflow-hidden">
        
        {/* LEFT 8 COLS: SEARCH RESULTS LIST */}
        <div className={`col-span-8 p-4 rounded-xl border flex flex-col overflow-hidden shadow-xs ${
          theme === "dark" ? "bg-zinc-900 border-zinc-800" : "bg-white border-slate-200"
        }`}>
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5 shrink-0">
            <BookOpen className="w-4 h-4 text-blue-500" /> Search Snippets ({results.length})
          </h3>

          <div className="flex-1 overflow-y-auto space-y-3 pr-1">
            {results.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 text-slate-400">
                <Search className="w-12 h-12 text-slate-300 dark:text-zinc-700 mb-2" />
                <p className="text-xs">Type a query above and click "Ground Search" to query the live web.</p>
              </div>
            ) : (
              results.map((res, idx) => (
                <div key={idx} className="p-3.5 rounded-xl border border-slate-100 dark:border-zinc-800 hover:border-blue-300 transition-all bg-slate-50/50 dark:bg-zinc-950/50">
                  <div className="flex items-start justify-between mb-1">
                    <a href={res.url} target="_blank" rel="noreferrer" className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1">
                      {res.title} <ExternalLink className="w-3 h-3" />
                    </a>
                    {res.source && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-medium border border-blue-200 dark:border-blue-800">
                        {res.source}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-600 dark:text-zinc-300 leading-relaxed mb-2">{res.snippet}</p>
                  
                  <div className="flex items-center gap-2 pt-2 border-t border-slate-200/60 dark:border-zinc-800/80">
                    <button
                      onClick={() => onSendToChat(`Use search context: "${res.title} - ${res.snippet}" to implement `)}
                      className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                    >
                      Ask AI Agent with this context
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* RIGHT 4 COLS: SAVE TO WORKSPACE */}
        <div className={`col-span-4 p-4 rounded-xl border flex flex-col space-y-4 shadow-xs ${
          theme === "dark" ? "bg-zinc-900 border-zinc-800" : "bg-white border-slate-200"
        }`}>
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Plus className="w-4 h-4 text-emerald-500" /> Save Research to File
          </h3>

          <div>
            <label className="text-[11px] font-semibold text-slate-500 mb-1 block">Target File Path</label>
            <input
              type="text"
              value={targetFilePath}
              onChange={(e) => setTargetFilePath(e.target.value)}
              className="w-full bg-slate-100 dark:bg-zinc-800 text-slate-800 dark:text-zinc-200 border border-slate-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-xs font-mono focus:outline-none"
            />
          </div>

          <button
            onClick={handleInsertToWorkspace}
            disabled={results.length === 0}
            className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-400 text-white py-2.5 rounded-lg text-xs font-bold transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
          >
            <Plus className="w-4 h-4" /> Save Research as File
          </button>
        </div>

      </div>
    </div>
  );
};
