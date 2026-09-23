import React, { useState, useMemo } from "react";
import {
  Code,
  Search,
  Copy,
  Check,
  Plus,
  Layers,
  Sparkles,
  FileCode,
  X,
  ExternalLink,
  ChevronRight,
  Database,
  Terminal,
  Zap,
  Layout,
  Component
} from "lucide-react";

interface CodeSnippet {
  id: string;
  title: string;
  description: string;
  category: "React UI" | "React Hooks" | "Tailwind Layouts" | "Backend & Express" | "Database & SQL";
  language: string;
  tags: string[];
  code: string;
}

const SNIPPETS_COLLECTION: CodeSnippet[] = [
  {
    id: "snip-glass-card",
    title: "Glassmorphic Metric Card",
    description: "Modern glassmorphism KPI card with subtle neon border, hover glow, and trend indicator.",
    category: "React UI",
    language: "tsx",
    tags: ["tailwind", "ui", "kpi", "card", "glassmorphism"],
    code: `import React from "react";
import { TrendingUp, ArrowUpRight } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string;
  change: string;
  isPositive?: boolean;
}

export const GlassMetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  change,
  isPositive = true
}) => {
  return (
    <div className="relative group p-5 rounded-2xl bg-zinc-900/40 backdrop-blur-xl border border-zinc-800/80 hover:border-indigo-500/50 transition-all duration-300 shadow-xl overflow-hidden">
      <div className="absolute -top-12 -right-12 w-28 h-28 bg-indigo-500/10 rounded-full blur-2xl group-hover:bg-indigo-500/20 transition-all" />
      <div className="flex items-center justify-between text-xs font-semibold text-zinc-400 mb-2">
        <span>{title}</span>
        <ArrowUpRight className="w-4 h-4 text-zinc-500 group-hover:text-indigo-400 transition-colors" />
      </div>
      <div className="text-2xl font-extrabold tracking-tight text-white mb-2">{value}</div>
      <div className="flex items-center gap-1.5 text-xs font-bold">
        <span className={isPositive ? "text-emerald-400" : "text-rose-400"}>{change}</span>
        <span className="text-zinc-500 font-normal">vs last month</span>
      </div>
    </div>
  );
};`
  },
  {
    id: "snip-modal-dialog",
    title: "Animated Modal with Backdrop Blur",
    description: "Accessible modal dialog with Esc key listener, backdrop blur, and smooth spring entry animation.",
    category: "React UI",
    language: "tsx",
    tags: ["modal", "dialog", "accessibility", "react"],
    code: `import React, { useEffect } from "react";
import { X } from "lucide-react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export const AnimatedModal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="w-full max-w-lg rounded-2xl bg-[#0f1017] border border-zinc-800 shadow-2xl p-6 relative animate-in zoom-in-95 duration-200 text-zinc-100"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
          <h3 className="text-base font-bold">{title}</h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="py-4">{children}</div>
      </div>
    </div>
  );
};`
  },
  {
    id: "snip-use-debounce",
    title: "useDebounce Hook",
    description: "Generic debounce hook that delays updating value until specified milliseconds have elapsed.",
    category: "React Hooks",
    language: "ts",
    tags: ["hook", "debounce", "search", "performance"],
    code: `import { useState, useEffect } from "react";

export function useDebounce<T>(value: T, delayMs: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delayMs);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delayMs]);

  return debouncedValue;
}`
  },
  {
    id: "snip-use-localstorage",
    title: "useLocalStorage Hook",
    description: "Safely sync state with localStorage with automatic JSON serialization and SSR fallback.",
    category: "React Hooks",
    language: "ts",
    tags: ["hook", "storage", "persistence"],
    code: `import { useState, useEffect } from "react";

export function useLocalStorage<T>(key: string, initialValue: T): [T, (val: T | ((prev: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      if (typeof window === "undefined") return initialValue;
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (err) {
      console.warn(\`Error reading localStorage key "\${key}":\`, err);
      return initialValue;
    }
  });

  const setValue = (valOrFn: T | ((prev: T) => T)) => {
    try {
      const valueToStore = valOrFn instanceof Function ? valOrFn(storedValue) : valOrFn;
      setStoredValue(valueToStore);
      if (typeof window !== "undefined") {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (err) {
      console.error(\`Error setting localStorage key "\${key}":\`, err);
    }
  };

  return [storedValue, setValue];
}`
  },
  {
    id: "snip-paginated-table",
    title: "Paginated Search Data Table",
    description: "Responsive table with real-time text query filtering, sortable columns, and page navigation.",
    category: "React UI",
    language: "tsx",
    tags: ["table", "pagination", "search", "filter"],
    code: `import React, { useState, useMemo } from "react";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";

interface RowItem {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
}

export const PaginatedTable: React.FC<{ data: RowItem[] }> = ({ data }) => {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 5;

  const filtered = useMemo(() => {
    return data.filter(item =>
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.email.toLowerCase().includes(search.toLowerCase())
    );
  }, [data, search]);

  const totalPages = Math.ceil(filtered.length / pageSize) || 1;
  const currentRows = filtered.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="w-full rounded-2xl border border-zinc-800 bg-zinc-950/40 p-4 space-y-3">
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3 top-2.5 text-zinc-400" />
        <input
          type="text"
          placeholder="Search records..."
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }}
          className="w-full pl-9 pr-4 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white outline-hidden"
        />
      </div>

      <div className="overflow-x-auto rounded-xl border border-zinc-800">
        <table className="w-full text-xs text-left">
          <thead className="bg-zinc-900 text-zinc-400 font-bold uppercase tracking-wider">
            <tr>
              <th className="p-3">Name</th>
              <th className="p-3">Email</th>
              <th className="p-3">Role</th>
              <th className="p-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            {currentRows.map(row => (
              <tr key={row.id} className="hover:bg-zinc-900/50">
                <td className="p-3 font-semibold text-white">{row.name}</td>
                <td className="p-3 text-zinc-400">{row.email}</td>
                <td className="p-3 text-zinc-300">{row.role}</td>
                <td className="p-3"><span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-400 font-bold">{row.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between text-xs text-zinc-400 pt-1">
        <span>Showing {currentRows.length} of {filtered.length} entries</span>
        <div className="flex items-center gap-2">
          <button onClick={() => setPage(p => Math.max(p - 1, 1))} disabled={page === 1} className="p-1 rounded bg-zinc-900 disabled:opacity-30">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span>Page {page} of {totalPages}</span>
          <button onClick={() => setPage(p => Math.min(p + 1, totalPages))} disabled={page === totalPages} className="p-1 rounded bg-zinc-900 disabled:opacity-30">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};`
  },
  {
    id: "snip-express-router",
    title: "Express REST Router with Validation",
    description: "Production-ready Express.js router with JSON body validation, error handling, and typed response.",
    category: "Backend & Express",
    language: "ts",
    tags: ["express", "node", "api", "backend", "rest"],
    code: `import { Router, Request, Response, NextFunction } from "express";

export const itemsRouter = Router();

interface CreateItemInput {
  name: string;
  price: number;
  category?: string;
}

// In-memory data store
let itemsDb = [
  { id: "1", name: "High-Performance Cloud Node", price: 29.99, category: "Infrastructure" }
];

// GET /api/items
itemsRouter.get("/", (req: Request, res: Response) => {
  return res.json({ success: true, count: itemsDb.length, data: itemsDb });
});

// POST /api/items
itemsRouter.post("/", (req: Request, res: Response, next: NextFunction) => {
  const { name, price, category } = req.body as CreateItemInput;

  if (!name || typeof name !== "string" || name.trim().length === 0) {
    return res.status(400).json({ error: "Validation failed: 'name' is required and must be non-empty." });
  }

  if (typeof price !== "number" || isNaN(price) || price < 0) {
    return res.status(400).json({ error: "Validation failed: 'price' must be a positive number." });
  }

  const newItem = {
    id: Date.now().toString(),
    name: name.trim(),
    price,
    category: category ? String(category).trim() : "General",
    createdAt: new Date().toISOString()
  };

  itemsDb.push(newItem);
  return res.status(201).json({ success: true, item: newItem });
});`
  },
  {
    id: "snip-sql-schema",
    title: "PostgreSQL Schema with Timestamps & Indexes",
    description: "Clean relational PostgreSQL schema with UUID keys, foreign key constraints, and performance indexes.",
    category: "Database & SQL",
    language: "sql",
    tags: ["sql", "postgres", "database", "schema"],
    code: `-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users Table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  display_name VARCHAR(100),
  role VARCHAR(50) DEFAULT 'user' CHECK (role IN ('admin', 'editor', 'user')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Projects Table
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Performance Indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);`
  },
  {
    id: "snip-retry-fetch",
    title: "Async Fetch with Exponential Backoff",
    description: "Resilient fetch wrapper with automatic retries, exponential backoff jitter, and abort timeout.",
    category: "React Hooks",
    language: "ts",
    tags: ["fetch", "network", "retry", "backoff"],
    code: `export async function fetchWithRetry(
  url: string,
  options: RequestInit = {},
  maxRetries: number = 3,
  baseDelayMs: number = 500
): Promise<Response> {
  let attempt = 0;

  while (attempt < maxRetries) {
    try {
      const res = await fetch(url, {
        ...options,
        signal: AbortSignal.timeout(10000)
      });

      if (res.ok || res.status < 500) {
        return res; // Don't retry 4xx errors
      }
    } catch (err: any) {
      if (attempt === maxRetries - 1) throw err;
    }

    attempt++;
    const delay = baseDelayMs * Math.pow(2, attempt) + Math.random() * 200;
    await new Promise(resolve => setTimeout(resolve, delay));
  }

  throw new Error(\`Failed to fetch \${url} after \${maxRetries} attempts.\`);
}`
  }
];

interface CodeSnippetsLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme?: "light" | "dark" | string;
  onInsertCode?: (code: string) => void;
  onAddLog?: (type: string, message: string) => void;
}

export const CodeSnippetsLibraryModal: React.FC<CodeSnippetsLibraryModalProps> = ({
  isOpen,
  onClose,
  theme = "dark",
  onInsertCode,
  onAddLog
}) => {
  const isDark = theme === "dark";
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedSnippet, setSelectedSnippet] = useState<CodeSnippet>(SNIPPETS_COLLECTION[0]);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const categories = ["All", "React UI", "React Hooks", "Tailwind Layouts", "Backend & Express", "Database & SQL"];

  const filteredSnippets = useMemo(() => {
    return SNIPPETS_COLLECTION.filter(snip => {
      const matchesCat = selectedCategory === "All" || snip.category === selectedCategory;
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        !searchQuery ||
        snip.title.toLowerCase().includes(q) ||
        snip.description.toLowerCase().includes(q) ||
        snip.tags.some(t => t.toLowerCase().includes(q));
      return matchesCat && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1800);
  };

  const handleInsert = (snip: CodeSnippet) => {
    if (onInsertCode) {
      onInsertCode(snip.code);
      if (onAddLog) onAddLog("create", `Inserted snippet "${snip.title}" into active file.`);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div
        className={`w-full max-w-5xl h-[85vh] rounded-2xl border shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200 ${
          isDark ? "bg-[#0f1017] border-zinc-800 text-zinc-100" : "bg-white border-slate-200 text-slate-800"
        }`}
      >
        {/* HEADER */}
        <div
          className={`px-5 py-3.5 border-b flex items-center justify-between shrink-0 ${
            isDark ? "border-zinc-800/80 bg-zinc-900/60" : "border-slate-200 bg-slate-50"
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Component className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold flex items-center gap-2">
                Code Snippets & Component Library
                <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                  Ready to Use
                </span>
              </h2>
              <p className="text-xs text-zinc-400">
                Curated production components, custom React hooks, Express APIs, and SQL schemas.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* SEARCH & CATEGORY BAR */}
        <div
          className={`px-5 py-2.5 border-b flex flex-wrap items-center justify-between gap-3 shrink-0 ${
            isDark ? "border-zinc-800 bg-zinc-950/40" : "border-slate-200 bg-slate-100"
          }`}
        >
          {/* CATEGORIES */}
          <div className="flex items-center gap-1.5 overflow-x-auto">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap cursor-pointer transition-all ${
                  selectedCategory === cat
                    ? "bg-indigo-600 text-white shadow-xs"
                    : isDark
                    ? "text-zinc-400 hover:text-white hover:bg-zinc-800/60"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-200"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* SEARCH INPUT */}
          <div className="relative w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-zinc-400" />
            <input
              type="text"
              placeholder="Search components or tags..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className={`w-full pl-8 pr-3 py-1.5 rounded-lg border text-xs outline-hidden ${
                isDark ? "bg-zinc-900 border-zinc-800 text-white" : "bg-white border-slate-300"
              }`}
            />
          </div>
        </div>

        {/* CONTENT SPLIT PANE */}
        <div className="flex-1 flex min-h-0 overflow-hidden">
          {/* SNIPPETS LIST */}
          <div
            className={`w-80 border-r flex flex-col shrink-0 overflow-y-auto p-3 space-y-2 ${
              isDark ? "border-zinc-800/80 bg-zinc-950/40" : "border-slate-200 bg-slate-50/50"
            }`}
          >
            {filteredSnippets.map(snip => {
              const isSelected = selectedSnippet.id === snip.id;
              return (
                <div
                  key={snip.id}
                  onClick={() => setSelectedSnippet(snip)}
                  className={`p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                    isSelected
                      ? isDark
                        ? "bg-zinc-900 border-indigo-500/50 shadow-md"
                        : "bg-white border-indigo-500 shadow-md ring-1 ring-indigo-500/20"
                      : isDark
                      ? "bg-zinc-900/40 border-zinc-800/60 hover:bg-zinc-900/80 hover:border-zinc-700"
                      : "bg-white border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-zinc-200">{snip.title}</span>
                    <span className="text-[10px] uppercase font-bold text-indigo-400 font-mono">
                      {snip.language}
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-400 line-clamp-2 mb-2">{snip.description}</p>
                  <div className="flex items-center gap-1 flex-wrap">
                    {snip.tags.slice(0, 3).map(tag => (
                      <span
                        key={tag}
                        className="px-1.5 py-0.2 rounded text-[9px] bg-zinc-800 text-zinc-400 font-mono"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}

            {filteredSnippets.length === 0 && (
              <div className="text-center py-10 text-zinc-500 text-xs">
                No snippets match your filter.
              </div>
            )}
          </div>

          {/* CODE PREVIEW PANE */}
          <div className="flex-1 flex flex-col min-w-0 min-h-0 overflow-hidden">
            {/* SNIPPET HEADER */}
            <div
              className={`p-4 border-b flex items-center justify-between gap-3 shrink-0 ${
                isDark ? "border-zinc-800 bg-zinc-900/30" : "border-slate-200 bg-white"
              }`}
            >
              <div>
                <h3 className="text-sm font-bold flex items-center gap-2">
                  {selectedSnippet.title}
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                    {selectedSnippet.category}
                  </span>
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">{selectedSnippet.description}</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => copyToClipboard(selectedSnippet.code, selectedSnippet.id)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-bold hover:bg-zinc-800 cursor-pointer transition-colors"
                >
                  {copiedId === selectedSnippet.id ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                  Copy Code
                </button>
                {onInsertCode && (
                  <button
                    onClick={() => handleInsert(selectedSnippet)}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white cursor-pointer shadow-md transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Insert in Editor
                  </button>
                )}
              </div>
            </div>

            {/* CODE VIEWER */}
            <div className="flex-1 overflow-auto p-4 bg-[#0a0a0f]">
              <pre className="text-xs font-mono text-zinc-200 leading-relaxed select-all">
                {selectedSnippet.code}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CodeSnippetsLibraryModal;
