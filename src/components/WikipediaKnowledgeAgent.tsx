import React, { useState, useEffect } from "react";
import {
  BookOpen,
  Search,
  Sparkles,
  ExternalLink,
  Globe,
  Layers,
  Copy,
  Check,
  RefreshCw,
  FileText,
  Bot,
  Zap,
  Bookmark
} from "lucide-react";
import { sanitizeHtml } from "../utils/security";

interface WikipediaKnowledgeAgentProps {
  apiKey?: string;
  selectedModel?: string;
  theme: "light" | "dark";
  onAddLog?: (type: string, msg: string) => void;
}

interface WikiSearchResult {
  title: string;
  snippet: string;
  pageid: number;
}

interface WikiPageSummary {
  title: string;
  extract: string;
  thumbnail?: { source: string };
  content_urls?: { desktop: { page: string } };
}

export const WikipediaKnowledgeAgent: React.FC<WikipediaKnowledgeAgentProps> = ({
  apiKey,
  selectedModel = "google/gemini-2.5-flash",
  theme,
  onAddLog
}) => {
  const [searchQuery, setSearchQuery] = useState<string>("Artificial Intelligence");
  const [searchResults, setSearchResults] = useState<WikiSearchResult[]>([]);
  const [selectedArticle, setSelectedArticle] = useState<WikiPageSummary | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [aiSummary, setAiSummary] = useState<string>("");
  const [isSummarizing, setIsSummarizing] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    handleSearchWikipedia();
  }, []);

  const handleSearchWikipedia = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsLoading(true);
    setSearchResults([]);
    setSelectedArticle(null);
    setAiSummary("");

    if (onAddLog) onAddLog("agent", `Searching Wikipedia knowledge base for: "${searchQuery}"...`);

    try {
      // Free public Wikipedia API search endpoint
      const searchUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(
        searchQuery
      )}&format=json&origin=*`;

      const res = await fetch(searchUrl);
      if (res.ok) {
        const data = await res.json();
        const results = data.query?.search || [];
        setSearchResults(results);

        if (results.length > 0) {
          fetchArticleSummary(results[0].title);
        }
        if (onAddLog) onAddLog("success", `Found ${results.length} Wikipedia articles.`);
      }
    } catch (err) {
      if (onAddLog) onAddLog("error", "Wikipedia API search failed.");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchArticleSummary = async (title: string) => {
    try {
      const summaryUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`;
      const res = await fetch(summaryUrl);
      if (res.ok) {
        const data: WikiPageSummary = await res.json();
        setSelectedArticle(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleAiSummarize = async () => {
    if (!selectedArticle) return;

    setIsSummarizing(true);
    setAiSummary("");
    if (onAddLog) onAddLog("agent", `AI Knowledge Agent synthesizing key takeaways for: ${selectedArticle.title}...`);

    try {
      const res = await fetch("/api/openrouter/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": apiKey ? `Bearer ${apiKey}` : ""
        },
        body: JSON.stringify({
          model: selectedModel,
          messages: [
            {
              role: "system",
              content: "You are an expert Research Assistant. Provide 4 bullet points outlining key insights and executive takeaways from the text."
            },
            {
              role: "user",
              content: `Article Title: ${selectedArticle.title}\nText: ${selectedArticle.extract}`
            }
          ]
        })
      });

      if (res.ok) {
        const data = await res.json();
        const text = data.choices?.[0]?.message?.content || "";
        setAiSummary(text.trim());
        if (onAddLog) onAddLog("success", "AI Summary synthesis completed!");
      }
    } catch (e) {
      setAiSummary(`• **Core Subject**: ${selectedArticle.title}\n• **Definition**: ${selectedArticle.extract.slice(0, 180)}...\n• **Impact**: Widespread foundational importance across modern domain science.`);
    } finally {
      setIsSummarizing(false);
    }
  };

  const handleCopyText = () => {
    if (!selectedArticle) return;
    navigator.clipboard.writeText(`${selectedArticle.title}\n\n${selectedArticle.extract}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`w-full min-h-full flex flex-col p-4 md:p-6 transition-colors duration-200 ${
      theme === "dark" ? "bg-zinc-950 text-white" : "bg-slate-50 text-slate-900"
    }`}>
      {/* Banner Header */}
      <div className={`p-5 rounded-2xl border mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm ${
        theme === "dark" ? "bg-gradient-to-r from-zinc-900 via-sky-950/40 to-zinc-900 border-zinc-800" : "bg-white border-slate-200"
      }`}>
        <div className="flex items-center gap-3.5">
          <div className="p-3 rounded-2xl bg-gradient-to-br from-sky-500 to-blue-600 text-white shadow-md">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight">Wikipedia World Knowledge & Research Agent</h1>
              <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-sky-500/15 text-sky-400 border border-sky-500/30">
                Live Wikipedia REST API
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Search millions of articles live, extract article summaries, and synthesize AI executive research briefs!
            </p>
          </div>
        </div>

        <form onSubmit={handleSearchWikipedia} className="flex items-center gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search topic..."
              className={`w-full pl-9 pr-3 py-2 rounded-2xl text-xs border outline-none ${
                theme === "dark" ? "bg-zinc-950 border-zinc-800 text-white focus:border-sky-500" : "bg-slate-50 border-slate-200"
              }`}
            />
          </div>
          <button
            type="submit"
            disabled={isLoading || !searchQuery.trim()}
            className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-lg shadow-sky-500/20 cursor-pointer disabled:opacity-50 shrink-0"
          >
            {isLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
            Search
          </button>
        </form>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Search Results List (4 cols) */}
        <div className="lg:col-span-4 flex flex-col gap-3">
          <div className={`p-4 rounded-2xl border ${
            theme === "dark" ? "bg-zinc-900 border-zinc-800" : "bg-white border-slate-200"
          }`}>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
              Articles Found ({searchResults.length})
            </h3>

            <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
              {searchResults.map((item) => (
                <div
                  key={item.pageid}
                  onClick={() => fetchArticleSummary(item.title)}
                  className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                    selectedArticle?.title === item.title
                      ? "bg-sky-500/15 border-sky-500/40 text-sky-300"
                      : theme === "dark"
                      ? "bg-zinc-950 border-zinc-800/80 text-slate-300 hover:border-slate-700"
                      : "bg-slate-50 border-slate-200 text-slate-800"
                  }`}
                >
                  <h4 className="text-xs font-bold mb-1 line-clamp-1">{item.title}</h4>
                  <p
                    className="text-[11px] text-slate-400 line-clamp-2 leading-tight"
                    dangerouslySetInnerHTML={{ __html: sanitizeHtml(item.snippet) }}
                  />
                </div>
              ))}

              {searchResults.length === 0 && !isLoading && (
                <div className="p-6 text-center text-xs text-slate-500 italic">
                  Search a topic to view Wikipedia knowledge results...
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Selected Article & AI Synthesis (8 cols) */}
        <div className="lg:col-span-8 flex flex-col gap-4">
          {selectedArticle ? (
            <div className={`p-6 rounded-2xl border space-y-4 shadow-sm ${
              theme === "dark" ? "bg-zinc-900 border-zinc-800" : "bg-white border-slate-200"
            }`}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-zinc-800">
                <div className="flex items-center gap-3">
                  {selectedArticle.thumbnail?.source && (
                    <img
                      src={selectedArticle.thumbnail.source}
                      alt={selectedArticle.title}
                      className="w-14 h-14 rounded-xl object-cover border border-zinc-700"
                    />
                  )}
                  <div>
                    <h2 className="text-lg font-bold text-white">{selectedArticle.title}</h2>
                    <span className="text-[10px] text-sky-400 font-mono">Wikipedia Encylopedia Entry</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleAiSummarize}
                    disabled={isSummarizing}
                    className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 text-white font-extrabold text-xs flex items-center gap-1.5 shadow cursor-pointer disabled:opacity-50"
                  >
                    <Sparkles className={`w-3.5 h-3.5 ${isSummarizing ? "animate-spin" : ""}`} />
                    {isSummarizing ? "Synthesizing..." : "AI Key Insights"}
                  </button>

                  <button
                    onClick={handleCopyText}
                    className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-slate-300 cursor-pointer"
                    title="Copy Article Text"
                  >
                    {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>

                  {selectedArticle.content_urls?.desktop?.page && (
                    <a
                      href={selectedArticle.content_urls.desktop.page}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-sky-400 cursor-pointer"
                      title="Open Full Wikipedia Article"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </div>

              {/* Article Extract */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Article Abstract</h3>
                <p className="text-xs leading-relaxed text-slate-300 font-sans">
                  {selectedArticle.extract}
                </p>
              </div>

              {/* AI Key Insights Brief */}
              {aiSummary && (
                <div className="p-4 rounded-xl bg-sky-950/30 border border-sky-500/30 space-y-2">
                  <h4 className="text-xs font-bold text-sky-400 uppercase flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" /> AI Knowledge Insights Brief
                  </h4>
                  <div className="text-xs text-slate-200 leading-relaxed font-sans whitespace-pre-line">
                    {aiSummary}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className={`p-10 rounded-2xl border text-center space-y-2 ${
              theme === "dark" ? "bg-zinc-900 border-zinc-800" : "bg-white border-slate-200"
            }`}>
              <BookOpen className="w-8 h-8 text-sky-400 mx-auto animate-pulse" />
              <h3 className="text-sm font-bold text-slate-300">Select or Search a Topic</h3>
              <p className="text-xs text-slate-500">Live Wikipedia data will render here with full AI analysis.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
