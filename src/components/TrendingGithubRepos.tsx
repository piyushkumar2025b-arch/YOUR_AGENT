import React, { useState, useEffect } from "react";
import {
  Github,
  Star,
  GitFork,
  Search,
  Filter,
  ExternalLink,
  Copy,
  Check,
  TrendingUp,
  AlertCircle,
  RefreshCw,
  Code2,
  Calendar,
  Sparkles,
  BookOpen,
  X,
  FileText,
  GitCommit,
  Tag,
  Folder,
  Download,
  Key,
  ShieldCheck,
  Eye,
  Terminal
} from "lucide-react";

export interface GithubRepo {
  id: number;
  name: string;
  full_name: string;
  html_url: string;
  description: string;
  stargazers_count: number;
  forks_count: number;
  open_issues_count: number;
  watchers_count?: number;
  default_branch?: string;
  language: string;
  owner: {
    login: string;
    avatar_url: string;
    html_url: string;
  };
  topics?: string[];
  updated_at: string;
  pushed_at: string;
}

interface CommitItem {
  sha: string;
  commit: {
    author: { name: string; date: string };
    message: string;
  };
  html_url: string;
  author?: { avatar_url?: string; login?: string };
}

interface ReleaseItem {
  id: number;
  name: string;
  tag_name: string;
  published_at: string;
  html_url: string;
  body?: string;
}

interface RepoContentItem {
  name: string;
  path: string;
  type: "file" | "dir";
  size?: number;
  html_url: string;
}

const LANGUAGES = ["All", "TypeScript", "Python", "Rust", "Go", "JavaScript", "C++", "Java"];
const TIMEFRAMES = [
  { label: "Trending Recently", query: "stars:>1000 created:>2024-01-01" },
  { label: "Top Starred", query: "stars:>10000" },
  { label: "AI & Machine Learning", query: "topic:ai OR topic:machine-learning OR topic:llm" },
  { label: "Web Frameworks", query: "topic:react OR topic:vue OR topic:nextjs OR topic:vite" }
];

const FALLBACK_REPOS: GithubRepo[] = [
  {
    id: 1,
    name: "deepmind-research",
    full_name: "google-deepmind/deepmind-research",
    html_url: "https://github.com/google-deepmind/deepmind-research",
    description: "Example code and publications from Google DeepMind research projects.",
    stargazers_count: 24500,
    forks_count: 4800,
    open_issues_count: 45,
    language: "Python",
    owner: {
      login: "google-deepmind",
      avatar_url: "https://avatars.githubusercontent.com/u/8159670?v=4",
      html_url: "https://github.com/google-deepmind"
    },
    topics: ["machine-learning", "deep-learning", "ai", "python"],
    updated_at: "2026-07-25T10:00:00Z",
    pushed_at: "2026-07-25T10:00:00Z"
  },
  {
    id: 2,
    name: "vite",
    full_name: "vitejs/vite",
    html_url: "https://github.com/vitejs/vite",
    description: "Next Generation Frontend Tooling. It's fast!",
    stargazers_count: 72000,
    forks_count: 6200,
    open_issues_count: 310,
    language: "TypeScript",
    owner: {
      login: "vitejs",
      avatar_url: "https://avatars.githubusercontent.com/u/65625612?v=4",
      html_url: "https://github.com/vitejs"
    },
    topics: ["vite", "frontend", "typescript", "build-tool"],
    updated_at: "2026-07-26T14:20:00Z",
    pushed_at: "2026-07-26T14:20:00Z"
  },
  {
    id: 3,
    name: "ollama",
    full_name: "ollama/ollama",
    html_url: "https://github.com/ollama/ollama",
    description: "Get up and running with Llama 3.3, Mistral, Gemma 2, and other large language models.",
    stargazers_count: 110000,
    forks_count: 9800,
    open_issues_count: 420,
    language: "Go",
    owner: {
      login: "ollama",
      avatar_url: "https://avatars.githubusercontent.com/u/127116892?v=4",
      html_url: "https://github.com/ollama"
    },
    topics: ["llm", "ai", "go", "llama", "local-ai"],
    updated_at: "2026-07-27T08:15:00Z",
    pushed_at: "2026-07-27T08:15:00Z"
  },
  {
    id: 4,
    name: "tailwind-css",
    full_name: "tailwindlabs/tailwindcss",
    html_url: "https://github.com/tailwindlabs/tailwindcss",
    description: "A utility-first CSS framework for rapid UI development.",
    stargazers_count: 85000,
    forks_count: 4200,
    open_issues_count: 80,
    language: "TypeScript",
    owner: {
      login: "tailwindlabs",
      avatar_url: "https://avatars.githubusercontent.com/u/67010828?v=4",
      html_url: "https://github.com/tailwindlabs"
    },
    topics: ["tailwindcss", "css", "ui", "design-system"],
    updated_at: "2026-07-24T18:00:00Z",
    pushed_at: "2026-07-24T18:00:00Z"
  }
];

export const TrendingGithubRepos: React.FC = () => {
  const [repos, setRepos] = useState<GithubRepo[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchFilter, setSearchFilter] = useState<string>("");
  const [customSearchQuery, setCustomSearchQuery] = useState<string>("");
  const [selectedLang, setSelectedLang] = useState<string>("All");
  const [selectedCategoryIndex, setSelectedCategoryIndex] = useState<number>(0);
  const [copiedRepoId, setCopiedRepoId] = useState<number | null>(null);

  // PAT Token State
  const [patToken, setPatToken] = useState<string>(() => localStorage.getItem("github_pat") || "");
  const [showPatInput, setShowPatInput] = useState<boolean>(false);
  const [rateLimitInfo, setRateLimitInfo] = useState<{ remaining: number; limit: number } | null>(null);

  // Modal / Inspector State
  const [inspectingRepo, setInspectingRepo] = useState<GithubRepo | null>(null);
  const [activeTab, setActiveTab] = useState<"readme" | "commits" | "releases" | "files">("readme");
  const [readmeContent, setReadmeContent] = useState<string>("");
  const [readmeLoading, setReadmeLoading] = useState<boolean>(false);
  const [commits, setCommits] = useState<CommitItem[]>([]);
  const [commitsLoading, setCommitsLoading] = useState<boolean>(false);
  const [releases, setReleases] = useState<ReleaseItem[]>([]);
  const [releasesLoading, setReleasesLoading] = useState<boolean>(false);
  const [files, setFiles] = useState<RepoContentItem[]>([]);
  const [filesLoading, setFilesLoading] = useState<boolean>(false);

  const getHeaders = () => {
    const headers: Record<string, string> = {
      Accept: "application/vnd.github.v3+json",
      "User-Agent": "AI-Studio-Agent"
    };
    if (patToken.trim()) {
      headers["Authorization"] = `token ${patToken.trim()}`;
    }
    return headers;
  };

  const updateRateLimitFromHeaders = (res: Response) => {
    const rem = res.headers.get("X-RateLimit-Remaining");
    const lim = res.headers.get("X-RateLimit-Limit");
    if (rem && lim) {
      setRateLimitInfo({ remaining: parseInt(rem, 10), limit: parseInt(lim, 10) });
    }
  };

  const savePatToken = (token: string) => {
    setPatToken(token);
    localStorage.setItem("github_pat", token);
  };

  const fetchTrendingRepos = async (overrideQuery?: string) => {
    setLoading(true);
    setError(null);
    try {
      let url = "";
      const trimmedCustom = (overrideQuery !== undefined ? overrideQuery : customSearchQuery).trim();

      if (trimmedCustom.includes("/")) {
        // Direct Owner/Repo lookup
        url = `https://api.github.com/repos/${trimmedCustom}`;
        const res = await fetch(url, { headers: getHeaders() });
        updateRateLimitFromHeaders(res);
        if (res.ok) {
          const repoData = await res.json();
          setRepos([repoData]);
          setLoading(false);
          return;
        }
      }

      const qStr = trimmedCustom
        ? encodeURIComponent(trimmedCustom)
        : TIMEFRAMES[selectedCategoryIndex].query;
      const langQuery = selectedLang !== "All" ? `+language:${selectedLang.toLowerCase()}` : "";
      url = `https://api.github.com/search/repositories?q=${qStr}${langQuery}&sort=stars&order=desc&per_page=30`;

      const res = await fetch(url, { headers: getHeaders() });
      updateRateLimitFromHeaders(res);

      if (!res.ok) {
        throw new Error(`GitHub API HTTP ${res.status}`);
      }
      const data = await res.json();
      if (data.items && Array.isArray(data.items)) {
        setRepos(data.items);
      } else {
        setRepos(FALLBACK_REPOS);
      }
    } catch (err: any) {
      console.warn("GitHub API fetch notice:", err);
      if (!patToken) {
        setError("GitHub API unauthenticated limit hit. Enter a Personal Access Token (PAT) for 5,000 req/hr or view cached repositories.");
      } else {
        setError(`GitHub API Error: ${err.message}`);
      }
      setRepos(FALLBACK_REPOS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrendingRepos();
  }, [selectedLang, selectedCategoryIndex, patToken]);

  const handleCopyClone = (cloneUrl: string, repoId: number) => {
    navigator.clipboard.writeText(`git clone ${cloneUrl}.git`);
    setCopiedRepoId(repoId);
    setTimeout(() => setCopiedRepoId(null), 2000);
  };

  // Open Inspector Modal
  const openRepoInspector = (repo: GithubRepo) => {
    setInspectingRepo(repo);
    setActiveTab("readme");
    fetchRepoReadme(repo);
  };

  const fetchRepoReadme = async (repo: GithubRepo) => {
    setReadmeLoading(true);
    setReadmeContent("");
    try {
      const res = await fetch(`https://api.github.com/repos/${repo.full_name}/readme`, { headers: getHeaders() });
      if (res.ok) {
        const data = await res.json();
        if (data.content) {
          // Decode Base64 content safely
          const rawText = decodeURIComponent(escape(atob(data.content.replace(/\n/g, ""))));
          setReadmeContent(rawText);
        }
      } else {
        setReadmeContent(`# ${repo.full_name}\n\n${repo.description || "No description provided."}\n\n*README file not directly available via API.*`);
      }
    } catch (err) {
      setReadmeContent(`# ${repo.full_name}\n\n${repo.description || ""}`);
    } finally {
      setReadmeLoading(false);
    }
  };

  const fetchRepoCommits = async (repo: GithubRepo) => {
    setCommitsLoading(true);
    try {
      const res = await fetch(`https://api.github.com/repos/${repo.full_name}/commits?per_page=15`, { headers: getHeaders() });
      if (res.ok) {
        const data = await res.json();
        setCommits(data);
      }
    } catch (err) {
      console.warn("Failed to fetch commits:", err);
    } finally {
      setCommitsLoading(false);
    }
  };

  const fetchRepoReleases = async (repo: GithubRepo) => {
    setReleasesLoading(true);
    try {
      const res = await fetch(`https://api.github.com/repos/${repo.full_name}/releases?per_page=10`, { headers: getHeaders() });
      if (res.ok) {
        const data = await res.json();
        setReleases(data);
      }
    } catch (err) {
      console.warn("Failed to fetch releases:", err);
    } finally {
      setReleasesLoading(false);
    }
  };

  const fetchRepoFiles = async (repo: GithubRepo) => {
    setFilesLoading(true);
    try {
      const res = await fetch(`https://api.github.com/repos/${repo.full_name}/contents`, { headers: getHeaders() });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) setFiles(data);
      }
    } catch (err) {
      console.warn("Failed to fetch files:", err);
    } finally {
      setFilesLoading(false);
    }
  };

  const handleTabChange = (tab: "readme" | "commits" | "releases" | "files") => {
    setActiveTab(tab);
    if (!inspectingRepo) return;
    if (tab === "commits" && commits.length === 0) fetchRepoCommits(inspectingRepo);
    if (tab === "releases" && releases.length === 0) fetchRepoReleases(inspectingRepo);
    if (tab === "files" && files.length === 0) fetchRepoFiles(inspectingRepo);
  };

  const filteredRepos = repos.filter((r) => {
    const query = searchFilter.toLowerCase();
    if (!query) return true;
    const matchName = r.name.toLowerCase().includes(query) || r.full_name.toLowerCase().includes(query);
    const matchDesc = r.description ? r.description.toLowerCase().includes(query) : false;
    const matchTopic = r.topics ? r.topics.some((t) => t.toLowerCase().includes(query)) : false;
    return matchName || matchDesc || matchTopic;
  });

  return (
    <div className="flex-1 flex flex-col h-full bg-zinc-950 text-zinc-100 overflow-hidden relative">
      {/* HEADER BAR */}
      <div className="p-4 md:p-6 bg-zinc-900/90 border-b border-zinc-800 flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shadow-inner">
            <Github className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              GitHub Repositories Explorer
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono border border-emerald-500/30 font-semibold">
                REST API LIVE
              </span>
            </h2>
            <p className="text-xs text-zinc-400">Search, inspect READMEs, view commits, release tags, and clone open-source repositories</p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto flex-wrap">
          {rateLimitInfo && (
            <span className="text-[10px] font-mono px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400">
              API Quota: <strong className="text-indigo-400">{rateLimitInfo.remaining}</strong>/{rateLimitInfo.limit}
            </span>
          )}

          <button
            onClick={() => setShowPatInput(!showPatInput)}
            className={`px-3 py-2 rounded-xl text-xs font-semibold border flex items-center gap-1.5 transition-all cursor-pointer ${
              patToken
                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20"
                : "bg-zinc-900 text-zinc-300 border-zinc-800 hover:border-zinc-700"
            }`}
          >
            <Key className="w-3.5 h-3.5" />
            <span>{patToken ? "PAT Token Active" : "Add GitHub PAT"}</span>
          </button>

          <button
            onClick={() => fetchTrendingRepos()}
            disabled={loading}
            className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white shadow-lg shadow-indigo-600/20 flex items-center gap-2 cursor-pointer transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* PAT TOKEN EXPANDER BAR */}
      {showPatInput && (
        <div className="p-4 bg-zinc-900/90 border-b border-indigo-500/30 flex flex-col sm:flex-row items-center gap-3 shrink-0">
          <Key className="w-4 h-4 text-indigo-400 shrink-0" />
          <input
            type="password"
            value={patToken}
            onChange={(e) => savePatToken(e.target.value)}
            placeholder="Enter GitHub Personal Access Token (ghp_...)"
            className="flex-1 w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs font-mono text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
          />
          <span className="text-[10px] text-zinc-400 shrink-0">Boosts GitHub REST API rate limit from 60 to 5,000 req/hr</span>
        </div>
      )}

      {/* FILTER & CATEGORY BAR */}
      <div className="p-4 bg-zinc-900/40 border-b border-zinc-800/80 space-y-3 shrink-0">
        <div className="flex flex-col md:flex-row items-center gap-3">
          {/* Live Search Input */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              fetchTrendingRepos(customSearchQuery);
            }}
            className="relative flex-1 w-full"
          >
            <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search GitHub (e.g. 'react', 'tensorflow', or 'owner/repo' like 'torvalds/linux')..."
              value={customSearchQuery}
              onChange={(e) => setCustomSearchQuery(e.target.value)}
              className="w-full pl-9 pr-20 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500 font-mono"
            />
            <button
              type="submit"
              className="absolute right-1.5 top-1/2 -translate-y-1/2 px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-[11px] font-semibold cursor-pointer transition-all"
            >
              Search
            </button>
          </form>

          {/* Timeframe Categories */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scrollbar-none">
            {TIMEFRAMES.map((tf, i) => (
              <button
                key={i}
                onClick={() => {
                  setCustomSearchQuery("");
                  setSelectedCategoryIndex(i);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap cursor-pointer transition-all border ${
                  selectedCategoryIndex === i && !customSearchQuery
                    ? "bg-indigo-600 text-white border-indigo-500 shadow-lg shadow-indigo-600/20"
                    : "bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-zinc-200"
                }`}
              >
                {tf.label}
              </button>
            ))}
          </div>
        </div>

        {/* Language Filters & Filter Query */}
        <div className="flex items-center justify-between gap-3 overflow-x-auto pt-1 scrollbar-none">
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-[11px] font-semibold text-zinc-500 flex items-center gap-1 shrink-0">
              <Filter className="w-3 h-3" /> Language:
            </span>
            {LANGUAGES.map((lang) => (
              <button
                key={lang}
                onClick={() => setSelectedLang(lang)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-mono cursor-pointer transition-all border shrink-0 ${
                  selectedLang === lang
                    ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40 font-bold"
                    : "bg-zinc-900/80 text-zinc-400 border-zinc-800 hover:text-zinc-300"
                }`}
              >
                {lang}
              </button>
            ))}
          </div>

          <div className="relative shrink-0">
            <input
              type="text"
              placeholder="Filter listed cards..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="px-2.5 py-1 bg-zinc-900 border border-zinc-800 rounded-lg text-[11px] text-zinc-300 placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>
      </div>

      {/* ERROR / NOTICE BANNER */}
      {error && (
        <div className="mx-4 mt-3 p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-400 text-xs flex items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
          {!patToken && (
            <button
              onClick={() => setShowPatInput(true)}
              className="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-bold text-[10px] cursor-pointer"
            >
              Add PAT Token
            </button>
          )}
        </div>
      )}

      {/* REPOSITORY CARDS GRID */}
      <div className="flex-1 p-4 md:p-6 overflow-y-auto">
        {loading ? (
          <div className="h-64 flex flex-col items-center justify-center space-y-3">
            <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin" />
            <p className="text-xs text-zinc-400 font-mono">Querying GitHub REST API live...</p>
          </div>
        ) : filteredRepos.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center text-center p-6 bg-zinc-900/30 rounded-2xl border border-zinc-800 space-y-2">
            <BookOpen className="w-10 h-10 text-zinc-600" />
            <h4 className="text-sm font-bold text-zinc-300">No Repositories Found</h4>
            <p className="text-xs text-zinc-500">Try adjusting your search query or language filter.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredRepos.map((repo) => (
              <div
                key={repo.id}
                className="bg-zinc-900/80 hover:bg-zinc-900 border border-zinc-800 hover:border-indigo-500/50 rounded-2xl p-4 flex flex-col justify-between transition-all duration-200 shadow-lg group"
              >
                <div className="space-y-3">
                  {/* Top Owner & Title */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <img
                        src={repo.owner.avatar_url}
                        alt={repo.owner.login}
                        className="w-8 h-8 rounded-full border border-zinc-700 shrink-0 object-cover"
                        referrerPolicy="no-referrer"
                      />
                      <div className="min-w-0">
                        <button
                          onClick={() => openRepoInspector(repo)}
                          className="text-xs font-bold text-indigo-400 group-hover:text-indigo-300 truncate hover:underline text-left block w-full cursor-pointer"
                        >
                          <span className="truncate">{repo.full_name}</span>
                        </button>
                        <span className="text-[10px] text-zinc-500 block truncate">by @{repo.owner.login}</span>
                      </div>
                    </div>

                    {repo.language && (
                      <span className="px-2 py-0.5 rounded-md bg-zinc-800 text-[10px] font-mono text-zinc-300 border border-zinc-700 shrink-0">
                        {repo.language}
                      </span>
                    )}
                  </div>

                  {/* Description */}
                  <p className="text-xs text-zinc-300 line-clamp-3 leading-relaxed min-h-[3rem]">
                    {repo.description || "No description provided."}
                  </p>

                  {/* Topics / Tags */}
                  {repo.topics && repo.topics.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-1">
                      {repo.topics.slice(0, 4).map((topic, tidx) => (
                        <span
                          key={tidx}
                          className="text-[9px] px-1.5 py-0.5 rounded-md bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 font-mono"
                        >
                          #{topic}
                        </span>
                      ))}
                      {repo.topics.length > 4 && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-zinc-800 text-zinc-500 font-mono">
                          +{repo.topics.length - 4}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Footer Stats & Actions */}
                <div className="pt-4 mt-3 border-t border-zinc-800/80 flex items-center justify-between text-xs text-zinc-400">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1 font-mono text-amber-400 font-semibold">
                      <Star className="w-3.5 h-3.5 fill-amber-400/20" />
                      {repo.stargazers_count.toLocaleString()}
                    </span>
                    <span className="flex items-center gap-1 font-mono text-zinc-400">
                      <GitFork className="w-3.5 h-3.5" />
                      {repo.forks_count.toLocaleString()}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => openRepoInspector(repo)}
                      className="px-2.5 py-1 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 text-[11px] font-semibold border border-indigo-500/30 flex items-center gap-1 transition-all cursor-pointer"
                    >
                      <Eye className="w-3 h-3" /> Inspect
                    </button>

                    <button
                      onClick={() => handleCopyClone(repo.html_url, repo.id)}
                      className="px-2 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-[11px] font-mono text-zinc-300 flex items-center gap-1 transition-colors cursor-pointer border border-zinc-700"
                      title="Copy Git Clone Command"
                    >
                      {copiedRepoId === repo.id ? (
                        <Check className="w-3 h-3 text-emerald-400" />
                      ) : (
                        <Copy className="w-3 h-3 text-zinc-400" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* REPOSITORY INSPECTOR MODAL */}
      {inspectingRepo && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
            {/* Modal Header */}
            <div className="p-4 md:p-6 bg-zinc-950 border-b border-zinc-800 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <img
                  src={inspectingRepo.owner.avatar_url}
                  alt={inspectingRepo.owner.login}
                  className="w-10 h-10 rounded-full border border-zinc-700"
                />
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    {inspectingRepo.full_name}
                    <a
                      href={inspectingRepo.html_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-400 hover:text-indigo-300"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </h3>
                  <p className="text-xs text-zinc-400 line-clamp-1">{inspectingRepo.description}</p>
                </div>
              </div>

              <button
                onClick={() => setInspectingRepo(null)}
                className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Stats Bar */}
            <div className="px-6 py-3 bg-zinc-900/80 border-b border-zinc-800 flex items-center justify-between flex-wrap gap-4 text-xs font-mono">
              <div className="flex items-center gap-4">
                <span className="text-amber-400 font-bold flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 fill-amber-400/20" /> {inspectingRepo.stargazers_count.toLocaleString()} Stars
                </span>
                <span className="text-zinc-300 flex items-center gap-1">
                  <GitFork className="w-3.5 h-3.5 text-zinc-400" /> {inspectingRepo.forks_count.toLocaleString()} Forks
                </span>
                <span className="text-rose-400 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" /> {inspectingRepo.open_issues_count.toLocaleString()} Issues
                </span>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={`${inspectingRepo.html_url}/archive/refs/heads/${inspectingRepo.default_branch || "main"}.zip`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" /> Download ZIP
                </a>
              </div>
            </div>

            {/* Modal Tabs */}
            <div className="px-6 pt-3 bg-zinc-950 border-b border-zinc-800 flex items-center gap-2">
              <button
                onClick={() => handleTabChange("readme")}
                className={`px-4 py-2 text-xs font-semibold rounded-t-xl flex items-center gap-1.5 transition-colors ${
                  activeTab === "readme" ? "bg-zinc-900 text-indigo-400 border-t border-x border-zinc-800" : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                <FileText className="w-3.5 h-3.5" /> README.md
              </button>
              <button
                onClick={() => handleTabChange("commits")}
                className={`px-4 py-2 text-xs font-semibold rounded-t-xl flex items-center gap-1.5 transition-colors ${
                  activeTab === "commits" ? "bg-zinc-900 text-indigo-400 border-t border-x border-zinc-800" : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                <GitCommit className="w-3.5 h-3.5" /> Recent Commits
              </button>
              <button
                onClick={() => handleTabChange("releases")}
                className={`px-4 py-2 text-xs font-semibold rounded-t-xl flex items-center gap-1.5 transition-colors ${
                  activeTab === "releases" ? "bg-zinc-900 text-indigo-400 border-t border-x border-zinc-800" : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                <Tag className="w-3.5 h-3.5" /> Releases
              </button>
              <button
                onClick={() => handleTabChange("files")}
                className={`px-4 py-2 text-xs font-semibold rounded-t-xl flex items-center gap-1.5 transition-colors ${
                  activeTab === "files" ? "bg-zinc-900 text-indigo-400 border-t border-x border-zinc-800" : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                <Folder className="w-3.5 h-3.5" /> Root Files
              </button>
            </div>

            {/* Tab Body */}
            <div className="flex-1 p-6 overflow-y-auto bg-zinc-900/50">
              {activeTab === "readme" && (
                readmeLoading ? (
                  <div className="h-48 flex items-center justify-center">
                    <RefreshCw className="w-6 h-6 text-indigo-500 animate-spin" />
                  </div>
                ) : (
                  <div className="prose prose-invert prose-xs max-w-none font-sans whitespace-pre-wrap leading-relaxed bg-zinc-950 p-5 rounded-xl border border-zinc-800 font-mono text-zinc-300">
                    {readmeContent || "No README available."}
                  </div>
                )
              )}

              {activeTab === "commits" && (
                commitsLoading ? (
                  <div className="h-48 flex items-center justify-center">
                    <RefreshCw className="w-6 h-6 text-indigo-500 animate-spin" />
                  </div>
                ) : commits.length === 0 ? (
                  <p className="text-xs text-zinc-400 text-center py-8">No recent commits loaded.</p>
                ) : (
                  <div className="space-y-3">
                    {commits.map((c) => (
                      <div key={c.sha} className="p-3 bg-zinc-950 border border-zinc-800 rounded-xl flex items-start justify-between gap-3 text-xs">
                        <div className="space-y-1">
                          <p className="font-semibold text-zinc-200">{c.commit.message}</p>
                          <p className="text-[10px] text-zinc-500 font-mono">
                            by {c.commit.author.name} on {new Date(c.commit.author.date).toLocaleDateString()}
                          </p>
                        </div>
                        <a
                          href={c.html_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-mono text-[10px] text-indigo-400 bg-indigo-500/10 px-2 py-1 rounded border border-indigo-500/20 hover:bg-indigo-500/20 shrink-0"
                        >
                          {c.sha.slice(0, 7)}
                        </a>
                      </div>
                    ))}
                  </div>
                )
              )}

              {activeTab === "releases" && (
                releasesLoading ? (
                  <div className="h-48 flex items-center justify-center">
                    <RefreshCw className="w-6 h-6 text-indigo-500 animate-spin" />
                  </div>
                ) : releases.length === 0 ? (
                  <p className="text-xs text-zinc-400 text-center py-8">No official releases found for this repository.</p>
                ) : (
                  <div className="space-y-3">
                    {releases.map((rel) => (
                      <div key={rel.id} className="p-4 bg-zinc-950 border border-zinc-800 rounded-xl space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono text-xs font-bold border border-emerald-500/30">
                            {rel.tag_name}
                          </span>
                          <span className="text-[10px] text-zinc-500 font-mono">
                            Published {new Date(rel.published_at).toLocaleDateString()}
                          </span>
                        </div>
                        <h4 className="text-xs font-bold text-white">{rel.name || rel.tag_name}</h4>
                        {rel.body && <p className="text-xs text-zinc-400 line-clamp-3 font-mono">{rel.body}</p>}
                      </div>
                    ))}
                  </div>
                )
              )}

              {activeTab === "files" && (
                filesLoading ? (
                  <div className="h-48 flex items-center justify-center">
                    <RefreshCw className="w-6 h-6 text-indigo-500 animate-spin" />
                  </div>
                ) : files.length === 0 ? (
                  <p className="text-xs text-zinc-400 text-center py-8">No root files retrieved.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 font-mono text-xs">
                    {files.map((file) => (
                      <a
                        key={file.path}
                        href={file.html_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2.5 bg-zinc-950 border border-zinc-800 hover:border-indigo-500/40 rounded-xl flex items-center gap-2 text-zinc-300 hover:text-white transition-all"
                      >
                        {file.type === "dir" ? (
                          <Folder className="w-4 h-4 text-amber-400 shrink-0" />
                        ) : (
                          <FileText className="w-4 h-4 text-indigo-400 shrink-0" />
                        )}
                        <span className="truncate">{file.name}</span>
                      </a>
                    ))}
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

