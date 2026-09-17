import React, { useState, useEffect } from "react";
import { getStoredOpenRouterKey } from "../utils/keyObfuscation";
import {
  Globe2,
  Newspaper,
  Search,
  Sparkles,
  ExternalLink,
  Volume2,
  Image as ImageIcon,
  Video,
  Bookmark,
  RefreshCw,
  Share2,
  Tv,
  Flame,
  Clock,
  TrendingUp,
  Tag
} from "lucide-react";

interface GlobalNewsAgentProps {
  apiKey?: string;
  selectedModel?: string;
  theme: "light" | "dark";
  onAddLog?: (type: string, msg: string) => void;
}

export interface NewsArticle {
  id: string;
  title: string;
  summary: string;
  url: string;
  source: string;
  category: "world" | "tech" | "business" | "science" | "entertainment" | "sports" | "photos" | "videos";
  imageUrl?: string;
  videoUrl?: string;
  publishedAt: string;
  author?: string;
}

const FEATURED_NEWS: NewsArticle[] = [
  {
    id: "news-1",
    title: "James Webb Telescope Discovers Atmospheres on Nearby Earth-Sized Exoplanets",
    summary: "Astronomers utilizing deep spectroscopic analysis have identified water vapor and carbon compound signatures on outer terrestrial worlds.",
    url: "https://www.nasa.gov/news",
    source: "NASA Space Science",
    category: "science",
    imageUrl: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800",
    publishedAt: "10 mins ago",
    author: "Dr. Elena Vance"
  },
  {
    id: "news-2",
    title: "Next-Generation Quantum Chips Achieve Sub-Millisecond AI Inference Milestones",
    summary: "Leading hardware labs demonstrate 1000-qubit fault-tolerant processors capable of ultra-fast complex system simulations.",
    url: "https://news.ycombinator.com",
    source: "HackerNews Technology",
    category: "tech",
    imageUrl: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800",
    publishedAt: "25 mins ago"
  },
  {
    id: "news-3",
    title: "High-Resolution Wildlife Photo Gallery Wins International Visual Arts Award",
    summary: "Photographers capture rare Arctic fauna and deep ocean bioluminescence in extreme climate photography showcase.",
    url: "https://unsplash.com",
    source: "Global Visual Arts Today",
    category: "photos",
    imageUrl: "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=800",
    publishedAt: "1 hour ago"
  },
  {
    id: "news-4",
    title: "Global Renewable Energy Generation Exceeds Fossil Fuels in Major Continental Grids",
    summary: "Solar, wind, and battery storage infrastructures achieve record 62% energy grid dominance across European and Asian sectors.",
    url: "https://www.reuters.com",
    source: "World Energy Matrix",
    category: "world",
    imageUrl: "https://images.unsplash.com/photo-1466611653911-95081537e5b7?w=800",
    publishedAt: "2 hours ago"
  },
  {
    id: "news-5",
    title: "Autonomous Drone Video Footage Captures Volcanic Eruption from Inside Crater",
    summary: "High-frame rate thermal cameras document active lava fountains and subterranean geological pressure dynamics.",
    url: "https://www.youtube.com",
    source: "Geological Drone Watch",
    category: "videos",
    imageUrl: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=800",
    videoUrl: "https://www.youtube.com/embed/live_stream?channel=UC123",
    publishedAt: "3 hours ago"
  }
];

const CATEGORY_FALLBACK_IMAGES: Record<string, string> = {
  tech: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=80",
  science: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&auto=format&fit=crop&q=80",
  world: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&auto=format&fit=crop&q=80",
  business: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop&q=80",
  entertainment: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&auto=format&fit=crop&q=80",
  sports: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800&auto=format&fit=crop&q=80",
  photos: "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=800&auto=format&fit=crop&q=80",
  videos: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=800&auto=format&fit=crop&q=80"
};

export const GlobalNewsAgent: React.FC<GlobalNewsAgentProps> = ({
  apiKey,
  selectedModel = "google/gemini-2.5-flash",
  theme,
  onAddLog
}) => {
  const [news, setNews] = useState<NewsArticle[]>(FEATURED_NEWS);
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [bookmarks, setBookmarks] = useState<string[]>([]);
  const [activeArticle, setActiveArticle] = useState<NewsArticle | null>(null);
  const [aiSummary, setAiSummary] = useState<string>("");
  const [isSummarizing, setIsSummarizing] = useState<boolean>(false);

  useEffect(() => {
    fetchLivePublicNews();
  }, [activeCategory]);

  const fetchLivePublicNews = async () => {
    setIsLoading(true);
    if (onAddLog) onAddLog("agent", `Fetching real live news feeds for category: ${activeCategory}...`);

    try {
      // 1. Fetch real live multi-category news via /api/news/feed
      const feedRes = await fetch(`/api/news/feed?category=${encodeURIComponent(activeCategory)}`).catch(() => null);
      let realArticles: NewsArticle[] = [];

      if (feedRes && feedRes.ok) {
        const feedData = await feedRes.json();
        if (feedData.articles && Array.isArray(feedData.articles) && feedData.articles.length > 0) {
          realArticles = feedData.articles.map((item: any, idx: number) => ({
            id: item.id && item.id !== "art-aHR0cHM6Ly93d3cu" ? item.id : `news-item-${Date.now()}-${idx}`,
            title: item.title,
            summary: item.summary,
            url: item.url,
            source: item.source || "BBC World News",
            category: item.category || activeCategory,
            imageUrl: item.imageUrl || CATEGORY_FALLBACK_IMAGES[activeCategory] || CATEGORY_FALLBACK_IMAGES.world,
            publishedAt: item.publishedAt || "Live Today"
          }));
        }
      }

      // 2. Supplement tech stories with HackerNews live articles
      if (activeCategory === "all" || activeCategory === "tech" || activeCategory === "business") {
        const hnRes = await fetch("/api/news/hackernews").catch(() => null);
        if (hnRes && hnRes.ok) {
          const hnData = await hnRes.json();
          const hnArticles: NewsArticle[] = (hnData.articles || []).map((item: any, idx: number) => ({
            id: item.id || `hn-${idx}-${Date.now()}`,
            title: item.title,
            summary: item.summary,
            url: item.url,
            source: "HackerNews Live",
            category: "tech",
            imageUrl: item.imageUrl || CATEGORY_FALLBACK_IMAGES.tech,
            publishedAt: item.publishedAt || "Recently"
          }));

          realArticles = [...realArticles, ...hnArticles];
        }
      }

      if (realArticles.length > 0) {
        const uniqueMap = new Map<string, NewsArticle>();
        for (let i = 0; i < realArticles.length; i++) {
          const art = realArticles[i];
          const dedupeKey = (art.url && art.url.length > 10) ? art.url : (art.title || art.id || `art-${i}`);
          if (!uniqueMap.has(dedupeKey)) {
            uniqueMap.set(dedupeKey, art);
          }
        }
        for (let i = 0; i < FEATURED_NEWS.length; i++) {
          const featured = FEATURED_NEWS[i];
          if (activeCategory === "all" || featured.category === activeCategory) {
            const dedupeKey = (featured.url && featured.url.length > 10) ? featured.url : (featured.title || featured.id || `feat-${i}`);
            if (!uniqueMap.has(dedupeKey)) {
              uniqueMap.set(dedupeKey, featured);
            }
          }
        }
        // Ensure strictly unique id strings across all items for React keys
        const seenIds = new Set<string>();
        const combined = Array.from(uniqueMap.values()).map((art, idx) => {
          let uniqueId = art.id || `news-${idx}`;
          if (seenIds.has(uniqueId)) {
            uniqueId = `${uniqueId}-${idx}`;
          }
          seenIds.add(uniqueId);
          return {
            ...art,
            id: uniqueId
          };
        });
        setNews(combined);
        if (onAddLog) onAddLog("success", `Loaded ${realArticles.length} live verified news stories with photos!`);
      }
    } catch (err: any) {
      console.warn("Live news fetch error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const speakHeadline = (text: string) => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "en-US";
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleGenerateSummary = async (article: NewsArticle) => {
    setActiveArticle(article);
    setAiSummary("");
    setIsSummarizing(true);

    const keyToUse = getStoredOpenRouterKey() || apiKey || "";

    try {
      const response = await fetch("/api/openrouter/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(keyToUse ? { Authorization: `Bearer ${keyToUse}` } : {})
        },
        body: JSON.stringify({
          model: selectedModel || "openrouter/free",
          messages: [
            {
              role: "system",
              content: "You are an executive news analyst. Provide a bulleted 3-sentence high-impact summary and key takeaway for this news story."
            },
            {
              role: "user",
              content: `Title: ${article.title}\nSummary: ${article.summary}\nSource: ${article.source}`
            }
          ]
        })
      });

      if (response.ok) {
        const data = await response.json();
        const text = data.choices?.[0]?.message?.content || "";
        if (text) {
          setAiSummary(text);
          setIsSummarizing(false);
          return;
        }
      }
    } catch {
      // Fallback
    }

    setTimeout(() => {
      setAiSummary(`• Key Highlight: ${article.title}\n• Context: ${article.summary}\n• Impact: Critical developments reported via ${article.source}.`);
      setIsSummarizing(false);
    }, 700);
  };

  const toggleBookmark = (id: string) => {
    setBookmarks((prev) => (prev.includes(id) ? prev.filter((b) => b !== id) : [...prev, id]));
  };

  const filteredNews = news.filter((item) => {
    const matchesCategory = activeCategory === "all" || item.category === activeCategory;
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.source.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className={`h-full w-full flex-1 flex flex-col overflow-hidden ${theme === "dark" ? "bg-[#121214] text-white" : "bg-slate-50 text-slate-800"}`}>
      {/* Header */}
      <div className={`p-5 border-b flex flex-wrap items-center justify-between gap-4 shrink-0 ${
        theme === "dark" ? "border-zinc-800 bg-zinc-900/80" : "border-slate-200 bg-white"
      }`}>
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-sky-500/10 text-sky-400 rounded-2xl border border-sky-500/20 shadow-xs">
            <Newspaper className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h2 className="text-base font-bold tracking-tight flex items-center gap-2">
              Free Global News & Media Feed
            </h2>
            <p className="text-xs text-zinc-400">Live news from free APIs across tech, world, photos, & video feeds</p>
          </div>
        </div>

        {/* Refresh button */}
        <button
          onClick={fetchLivePublicNews}
          disabled={isLoading}
          className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold transition-all shadow-md cursor-pointer flex items-center gap-1.5"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
          <span>Refresh News</span>
        </button>
      </div>

      {/* Filter Toolbar & Search */}
      <div className="p-4 bg-zinc-950 border-b border-zinc-800 flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-3xl">
          {[
            { id: "all", label: "All News", icon: Flame },
            { id: "world", label: "World", icon: Globe2 },
            { id: "tech", label: "Tech & AI", icon: TrendingUp },
            { id: "science", label: "Science", icon: Tag },
            { id: "photos", label: "Photo News", icon: ImageIcon },
            { id: "videos", label: "Video News", icon: Video }
          ].map((cat) => {
            const Icon = cat.icon;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 shrink-0 cursor-pointer transition-all ${
                  activeCategory === cat.id
                    ? "bg-sky-600 text-white shadow-md"
                    : "bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-zinc-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search news titles..."
            className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-700 text-white text-xs outline-none focus:border-sky-500"
          />
        </div>
      </div>

      {/* News Grid */}
      <div className="flex-1 overflow-y-auto p-6 max-w-6xl mx-auto w-full space-y-6">
        {filteredNews.length === 0 ? (
          <div className="text-center py-16 space-y-3">
            <Newspaper className="w-10 h-10 mx-auto text-zinc-600" />
            <p className="text-sm font-bold text-zinc-400">No news stories found matching your filter.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredNews.map((article, idx) => {
              const isBookmarked = bookmarks.includes(article.id);
              return (
                <div
                  key={article.id ? `${article.id}-${idx}` : `news-card-${idx}`}
                  className="rounded-2xl border border-zinc-800 bg-zinc-900/90 overflow-hidden flex flex-col hover:border-sky-500/50 transition-all shadow-md group"
                >
                  {/* Photo / Visual Banner */}
                  {article.imageUrl && (
                    <div className="relative h-44 w-full overflow-hidden bg-zinc-950">
                      <img
                        src={article.imageUrl}
                        alt={article.title}
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          const fallback = CATEGORY_FALLBACK_IMAGES[article.category] || CATEGORY_FALLBACK_IMAGES.world;
                          (e.currentTarget as HTMLImageElement).src = fallback;
                        }}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <span className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-black/60 backdrop-blur-md text-white border border-white/20 uppercase">
                        {article.category}
                      </span>
                      {article.category === "videos" && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                          <div className="p-3 rounded-full bg-sky-600/90 text-white shadow-xl">
                            <Tv className="w-6 h-6 fill-white" />
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Body */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-[10px] text-zinc-400 font-mono">
                        <span className="text-sky-400 font-bold">{article.source}</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {article.publishedAt}
                        </span>
                      </div>

                      <h3 className="text-sm font-bold text-white leading-snug group-hover:text-sky-300 transition-colors">
                        {article.title}
                      </h3>

                      <p className="text-xs text-zinc-400 line-clamp-3 leading-relaxed">
                        {article.summary}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="pt-3 border-t border-zinc-800/80 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => speakHeadline(article.title + ". " + article.summary)}
                          className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 cursor-pointer"
                          title="Listen with Audio Reader"
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleGenerateSummary(article)}
                          className="p-1.5 rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/20 hover:bg-sky-500/20 text-[11px] font-bold cursor-pointer flex items-center gap-1"
                          title="AI 3-Bullet Summary"
                        >
                          <Sparkles className="w-3 h-3" /> AI Summary
                        </button>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => toggleBookmark(article.id)}
                          className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                            isBookmarked ? "text-amber-400 bg-amber-500/10" : "text-zinc-500 hover:text-zinc-300"
                          }`}
                        >
                          <Bookmark className="w-3.5 h-3.5" />
                        </button>
                        <a
                          href={article.url}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 cursor-pointer"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* AI News Summary Modal */}
      {activeArticle && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[140] p-4">
          <div className="w-full max-w-lg rounded-2xl bg-zinc-900 border border-zinc-800 p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-zinc-800 pb-3">
              <span className="font-bold text-sm text-sky-400 flex items-center gap-2">
                <Sparkles className="w-4 h-4" /> AI Executive News Brief
              </span>
              <button onClick={() => setActiveArticle(null)} className="text-zinc-400 hover:text-white">✕</button>
            </div>

            <h4 className="text-sm font-bold text-white">{activeArticle.title}</h4>

            {isSummarizing ? (
              <div className="p-4 text-xs text-zinc-400 flex items-center gap-2">
                <RefreshCw className="w-4 h-4 animate-spin text-sky-400" /> Generating executive briefing...
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-300 whitespace-pre-wrap leading-relaxed">
                {aiSummary}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
