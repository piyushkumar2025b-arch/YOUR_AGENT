import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  Search,
  Command,
  FileCode,
  FileText,
  FileSpreadsheet,
  FileJson,
  Code,
  Check,
  Zap,
  Play,
  Download,
  Terminal,
  Sliders,
  Sun,
  Moon,
  X,
  Keyboard,
  ArrowRight,
  Folder,
  Layers,
  Sparkles,
  Eye,
  Settings,
  Shield,
  HelpCircle
} from "lucide-react";

export interface ShortcutItem {
  id: string;
  category: "Files & Navigation" | "Editor & Workspace" | "Tools & Actions" | "Theme & View" | "Dev Tools";
  title: string;
  description: string;
  keys: string[];
  action?: () => void;
}

interface KeyboardShortcutsModalProps {
  files: Array<{ path: string; content: string; language?: string }>;
  selectedFilePath: string;
  onSelectFile: (path: string) => void;
  onSaveActiveFile?: () => void;
  activeTab: string;
  onSelectTab: (tab: any) => void;
  theme: "light" | "dark";
  onToggleTheme: () => void;
  onToggleTerminal: () => void;
  onToggleSlidersBar: () => void;
  onRunCode: () => void;
  onDownloadZip: () => void;
  isOpenHelpModal: boolean;
  onCloseHelpModal: () => void;
  isOpenCommandPalette: boolean;
  onCloseCommandPalette: () => void;
  onOpenCommandPalette: () => void;
  onOpenHelpModal: () => void;
}

export const KeyboardShortcutsModal: React.FC<KeyboardShortcutsModalProps> = ({
  files,
  selectedFilePath,
  onSelectFile,
  onSaveActiveFile,
  activeTab,
  onSelectTab,
  theme,
  onToggleTheme,
  onToggleTerminal,
  onToggleSlidersBar,
  onRunCode,
  onDownloadZip,
  isOpenHelpModal,
  onCloseHelpModal,
  isOpenCommandPalette,
  onCloseCommandPalette,
  onOpenCommandPalette,
  onOpenHelpModal
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [activeFilterTab, setActiveFilterTab] = useState<"all" | "files" | "actions">("all");
  const [toastNotification, setToastNotification] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Helper to show a sleek HUD toast notification
  const triggerHudToast = (msg: string) => {
    setToastNotification(msg);
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    toastTimeoutRef.current = setTimeout(() => {
      setToastNotification(null);
    }, 2200);
  };

  // Define All Global Keyboard Commands
  const shortcutList = useMemo<ShortcutItem[]>(() => [
    {
      id: "quick-open",
      category: "Files & Navigation",
      title: "Quick Open File / Command Palette",
      description: "Search and open any file or execute studio actions instantly",
      keys: ["Ctrl", "P"],
      action: onOpenCommandPalette
    },
    {
      id: "command-palette",
      category: "Files & Navigation",
      title: "Open Command Palette",
      description: "Alternative shortcut to launch command palette",
      keys: ["Ctrl", "K"],
      action: onOpenCommandPalette
    },
    {
      id: "save-file",
      category: "Editor & Workspace",
      title: "Save Active File",
      description: "Save changes to active workspace file & trigger instant build sync",
      keys: ["Ctrl", "S"],
      action: () => {
        if (onSaveActiveFile) onSaveActiveFile();
        triggerHudToast(`⚡ Ctrl+S: Saved file "${selectedFilePath}"`);
      }
    },
    {
      id: "toggle-help",
      category: "Tools & Actions",
      title: "Keyboard Shortcuts Cheat Sheet",
      description: "Toggle this global shortcuts cheat sheet overlay",
      keys: ["Ctrl", "/"],
      action: () => {
        if (isOpenHelpModal) onCloseHelpModal();
        else onOpenHelpModal();
      }
    },
    {
      id: "toggle-terminal",
      category: "Tools & Actions",
      title: "Toggle Terminal Panel",
      description: "Show or hide bottom execution terminal",
      keys: ["Ctrl", "`"],
      action: () => {
        onToggleTerminal();
        triggerHudToast("⚡ Ctrl+`: Toggled Terminal Panel");
      }
    },
    {
      id: "toggle-sliders",
      category: "Theme & View",
      title: "Toggle Border & Layout Sliders",
      description: "Open fine-tuning sliders bar for custom widths & borders",
      keys: ["Ctrl", "B"],
      action: () => {
        onToggleSlidersBar();
        triggerHudToast("⚡ Ctrl+B: Toggled Layout & Border Sliders");
      }
    },
    {
      id: "run-code",
      category: "Tools & Actions",
      title: "Run Active File",
      description: "Execute current file inside sandbox runner console",
      keys: ["Ctrl", "Shift", "R"],
      action: () => {
        onRunCode();
        triggerHudToast(`⚡ Ctrl+Shift+R: Executing ${selectedFilePath}...`);
      }
    },
    {
      id: "toggle-theme",
      category: "Theme & View",
      title: "Toggle Light / Dark Mode",
      description: "Switch application theme aesthetic",
      keys: ["Alt", "T"],
      action: () => {
        onToggleTheme();
        triggerHudToast(`⚡ Alt+T: Theme switched to ${theme === "dark" ? "Light" : "Dark"} Mode`);
      }
    },
    {
      id: "tab-editor",
      category: "Files & Navigation",
      title: "Switch to Code Editor",
      description: "Jump to main IDE code editor tab",
      keys: ["Ctrl", "Shift", "E"],
      action: () => {
        onSelectTab("editor");
        triggerHudToast("⚡ Jumped to Code Editor");
      }
    },
    {
      id: "tab-preview",
      category: "Files & Navigation",
      title: "Switch to Live Preview",
      description: "Jump to browser preview iframe tab",
      keys: ["Ctrl", "Shift", "V"],
      action: () => {
        onSelectTab("preview");
        triggerHudToast("⚡ Jumped to Live Preview");
      }
    },
    {
      id: "tab-docker-studio",
      category: "Dev Tools",
      title: "Open Docker & Dev Container Studio",
      description: "Generate multi-stage Dockerfile, compose & devcontainer specs",
      keys: ["Ctrl", "Alt", "D"],
      action: () => {
        onSelectTab("docker-studio");
        triggerHudToast("🐳 Opened Docker & Dev Container Studio");
      }
    },
    {
      id: "tab-erd-studio",
      category: "Dev Tools",
      title: "Open Database ERD Architect",
      description: "Entity Relationship Diagram visual modeler, schema scanner & Drizzle ORM generator",
      keys: ["Ctrl", "Alt", "E"],
      action: () => {
        onSelectTab("erd-studio");
        triggerHudToast("🗄️ Opened Database ERD Architect");
      }
    },
    {
      id: "tab-cron-studio",
      category: "Dev Tools",
      title: "Open Cron & Task Scheduler Studio",
      description: "Visual cron expression builder, English translation engine & runner sandbox",
      keys: ["Ctrl", "Alt", "C"],
      action: () => {
        onSelectTab("cron-studio");
        triggerHudToast("⏰ Opened Cron & Task Scheduler Studio");
      }
    },
    {
      id: "tab-openapi-studio",
      category: "Dev Tools",
      title: "Open OpenAPI & Swagger Studio",
      description: "Visual OpenAPI 3.1 architect, endpoint scanner & interactive Swagger test bench",
      keys: ["Ctrl", "Alt", "O"],
      action: () => {
        onSelectTab("openapi-studio");
        triggerHudToast("📄 Opened OpenAPI & Swagger Studio");
      }
    },
    {
      id: "tab-stream-tester",
      category: "Dev Tools",
      title: "Open WebSocket & SSE Stream Studio",
      description: "Live WebSocket and SSE stream inspector, message ledger & mock generator",
      keys: ["Ctrl", "Alt", "W"],
      action: () => {
        onSelectTab("stream-tester");
        triggerHudToast("📡 Opened WebSocket & SSE Stream Studio");
      }
    },
    {
      id: "tab-graphql-studio",
      category: "Dev Tools",
      title: "Open GraphQL Explorer & Playground",
      description: "Test GraphQL queries, mutations, variables & schema introspection",
      keys: ["Ctrl", "Alt", "G"],
      action: () => {
        onSelectTab("graphql-studio");
        triggerHudToast("🚀 Opened GraphQL Explorer");
      }
    },
    {
      id: "tab-mock-server",
      category: "Dev Tools",
      title: "Open Mock API Server & Webhooks",
      description: "Configure simulated REST endpoints with custom latency & catch webhooks",
      keys: ["Ctrl", "Alt", "M"],
      action: () => {
        onSelectTab("mock-server");
        triggerHudToast("⚡ Opened Mock API Server & Webhook Inspector");
      }
    },
    {
      id: "tab-perf-auditor",
      category: "Dev Tools",
      title: "Open Code & Performance Auditor",
      description: "Run Lighthouse-style performance, security, and quality analysis",
      keys: ["Ctrl", "Alt", "P"],
      action: () => {
        onSelectTab("perf-auditor");
        triggerHudToast("⚡ Opened Performance & Code Auditor");
      }
    },
    {
      id: "tab-api-client",
      category: "Dev Tools",
      title: "Open REST API Client Studio",
      description: "Test HTTP requests with SSRF protection & header presets",
      keys: ["Ctrl", "Alt", "R"],
      action: () => {
        onSelectTab("api-client");
        triggerHudToast("⚡ Opened REST Client Studio");
      }
    },
    {
      id: "tab-sql-studio",
      category: "Dev Tools",
      title: "Open Relational SQL Studio",
      description: "Interactive SQLite & PostgreSQL query sandbox with table visualizer",
      keys: ["Ctrl", "Alt", "S"],
      action: () => {
        onSelectTab("sql-studio");
        triggerHudToast("⚡ Opened Relational SQL Studio");
      }
    },
    {
      id: "tab-code-doctor",
      category: "Dev Tools",
      title: "Open Code Doctor AI",
      description: "Automated codebase scanner & 1-click refactoring engine",
      keys: ["Ctrl", "Alt", "H"],
      action: () => {
        onSelectTab("code-doctor");
        triggerHudToast("🩺 Opened Code Doctor AI");
      }
    },
    {
      id: "tab-diff-inspector",
      category: "Dev Tools",
      title: "Open Git Diff Inspector",
      description: "Side-by-side split visual diff inspector with patch applier",
      keys: ["Ctrl", "Alt", "F"],
      action: () => {
        onSelectTab("diff-inspector");
        triggerHudToast("🔍 Opened Git Diff Inspector");
      }
    },
    {
      id: "tab-regex-playground",
      category: "Dev Tools",
      title: "Open Regex Playground",
      description: "Interactive regular expression tester with capture groups & explanation",
      keys: ["Ctrl", "Alt", "X"],
      action: () => {
        onSelectTab("regex-playground");
        triggerHudToast("⚡ Opened Regex Playground");
      }
    },
    {
      id: "download-zip",
      category: "Tools & Actions",
      title: "Download Project ZIP",
      description: "Export entire project files into a downloadable archive",
      keys: ["Ctrl", "Shift", "D"],
      action: () => {
        onDownloadZip();
        triggerHudToast("⚡ Exporting Project ZIP...");
      }
    }
  ], [
    selectedFilePath,
    theme,
    isOpenHelpModal,
    onOpenCommandPalette,
    onSaveActiveFile,
    onCloseHelpModal,
    onOpenHelpModal,
    onToggleTerminal,
    onToggleSlidersBar,
    onRunCode,
    onToggleTheme,
    onSelectTab,
    onDownloadZip
  ]);

  // Global Keyboard Event Listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isCmdOrCtrl = e.metaKey || e.ctrlKey;

      // 1. Ctrl+S or Cmd+S -> Save File
      if (isCmdOrCtrl && (e.key === "s" || e.key === "S")) {
        e.preventDefault();
        const item = shortcutList.find((s) => s.id === "save-file");
        if (item?.action) item.action();
        return;
      }

      // 2. Ctrl+P or Cmd+P or Ctrl+K or Cmd+K -> Command Palette
      if (isCmdOrCtrl && (e.key === "p" || e.key === "P" || e.key === "k" || e.key === "K")) {
        e.preventDefault();
        onOpenCommandPalette();
        return;
      }

      // 3. Ctrl+/ -> Toggle Keyboard Shortcuts Cheat Sheet Modal
      if (isCmdOrCtrl && e.key === "/") {
        e.preventDefault();
        if (isOpenHelpModal) onCloseHelpModal();
        else onOpenHelpModal();
        return;
      }

      // 4. Ctrl+` or Ctrl+~ -> Toggle Terminal
      if (isCmdOrCtrl && (e.key === "`" || e.key === "~")) {
        e.preventDefault();
        onToggleTerminal();
        triggerHudToast("⚡ Ctrl+`: Toggled Terminal Panel");
        return;
      }

      // 5. Ctrl+B or Cmd+B -> Toggle Sliders Bar
      if (isCmdOrCtrl && (e.key === "b" || e.key === "B")) {
        e.preventDefault();
        onToggleSlidersBar();
        triggerHudToast("⚡ Ctrl+B: Toggled Layout & Border Sliders");
        return;
      }

      // 6. Ctrl+Shift+R -> Run Active Code
      if (isCmdOrCtrl && e.shiftKey && (e.key === "r" || e.key === "R")) {
        e.preventDefault();
        onRunCode();
        triggerHudToast(`⚡ Ctrl+Shift+R: Executing ${selectedFilePath}...`);
        return;
      }

      // 7. Alt+T -> Toggle Theme
      if (e.altKey && (e.key === "t" || e.key === "T")) {
        e.preventDefault();
        onToggleTheme();
        triggerHudToast(`⚡ Alt+T: Theme switched to ${theme === "dark" ? "Light" : "Dark"} Mode`);
        return;
      }

      // 8. Ctrl+Shift+E -> Code Editor
      if (isCmdOrCtrl && e.shiftKey && (e.key === "e" || e.key === "E")) {
        e.preventDefault();
        onSelectTab("editor");
        triggerHudToast("⚡ Jumped to Code Editor");
        return;
      }

      // 9. Ctrl+Shift+V -> Preview Tab
      if (isCmdOrCtrl && e.shiftKey && (e.key === "v" || e.key === "V")) {
        e.preventDefault();
        onSelectTab("preview");
        triggerHudToast("⚡ Jumped to Live Preview");
        return;
      }

      // 10. Ctrl+Shift+D -> Download Zip
      if (isCmdOrCtrl && e.shiftKey && (e.key === "d" || e.key === "D")) {
        e.preventDefault();
        onDownloadZip();
        triggerHudToast("⚡ Exporting Project ZIP...");
        return;
      }

      // 11. Esc -> Close Modals
      if (e.key === "Escape") {
        if (isOpenCommandPalette) onCloseCommandPalette();
        if (isOpenHelpModal) onCloseHelpModal();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    isOpenCommandPalette,
    isOpenHelpModal,
    onCloseCommandPalette,
    onCloseHelpModal,
    onOpenCommandPalette,
    onOpenHelpModal,
    onToggleTerminal,
    onToggleSlidersBar,
    onRunCode,
    onToggleTheme,
    onSelectTab,
    onDownloadZip,
    selectedFilePath,
    theme,
    shortcutList
  ]);

  // Focus input when Command Palette opens
  useEffect(() => {
    if (isOpenCommandPalette) {
      setSearchQuery("");
      setSelectedIndex(0);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  }, [isOpenCommandPalette]);

  // Combined Results for Command Palette (Files + Actions)
  const paletteResults = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();

    // 1. Filtered Files
    const fileItems = files
      .filter((f) => {
        if (activeFilterTab === "actions") return false;
        if (!query) return true;
        return f.path.toLowerCase().includes(query);
      })
      .map((f) => ({
        type: "file" as const,
        id: `file-${f.path}`,
        title: f.path,
        subtitle: `${f.content.split("\n").length} lines • ${f.content.length} chars`,
        icon: getFileIcon(f.path),
        action: () => {
          onSelectFile(f.path);
          onCloseCommandPalette();
          triggerHudToast(`Opened file: ${f.path}`);
        }
      }));

    // 2. Filtered Actions
    const actionItems = shortcutList
      .filter((s) => {
        if (activeFilterTab === "files") return false;
        if (!query) return true;
        return (
          s.title.toLowerCase().includes(query) ||
          s.description.toLowerCase().includes(query) ||
          s.category.toLowerCase().includes(query)
        );
      })
      .map((s) => ({
        type: "action" as const,
        id: s.id,
        title: s.title,
        subtitle: `${s.category} — ${s.description}`,
        keys: s.keys,
        icon: <Zap className="w-4 h-4 text-amber-400" />,
        action: () => {
          if (s.action) s.action();
          onCloseCommandPalette();
        }
      }));

    return [...fileItems, ...actionItems];
  }, [files, searchQuery, activeFilterTab, shortcutList, onSelectFile, onCloseCommandPalette]);

  // Handle Keyboard Navigation inside Command Palette (ArrowUp, ArrowDown, Enter)
  const handlePaletteKeyDown = (e: React.KeyboardEvent) => {
    if (paletteResults.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % paletteResults.length);
      scrollItemIntoView(selectedIndex + 1);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + paletteResults.length) % paletteResults.length);
      scrollItemIntoView(selectedIndex - 1);
    } else if (e.key === "Enter") {
      e.preventDefault();
      const target = paletteResults[selectedIndex];
      if (target) {
        target.action();
      }
    }
  };

  const scrollItemIntoView = (index: number) => {
    if (!listRef.current) return;
    const children = listRef.current.querySelectorAll(".palette-item");
    if (children[index]) {
      children[index].scrollIntoView({ block: "nearest", behavior: "smooth" });
    }
  };

  function getFileIcon(filename: string) {
    const ext = filename.split(".").pop()?.toLowerCase();
    if (ext === "tsx" || ext === "ts" || ext === "jsx" || ext === "js") {
      return <FileCode className="w-4 h-4 text-indigo-400" />;
    }
    if (ext === "json") {
      return <FileJson className="w-4 h-4 text-amber-400" />;
    }
    if (ext === "html") {
      return <Code className="w-4 h-4 text-rose-400" />;
    }
    if (ext === "css") {
      return <FileSpreadsheet className="w-4 h-4 text-cyan-400" />;
    }
    return <FileText className="w-4 h-4 text-slate-400" />;
  }

  return (
    <>
      {/* 1. Sleek HUD Toast Notification Banner */}
      {toastNotification && (
        <div className="fixed top-16 right-6 z-50 animate-bounce transition-all">
          <div className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-indigo-900/90 via-purple-900/90 to-zinc-900/90 backdrop-blur-xl border border-indigo-500/40 text-white shadow-2xl flex items-center gap-2.5 text-xs font-bold font-mono">
            <Sparkles className="w-4 h-4 text-indigo-400 animate-spin" />
            <span>{toastNotification}</span>
          </div>
        </div>
      )}

      {/* 2. Command Palette (Ctrl+P / Ctrl+K) Modal */}
      {isOpenCommandPalette && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/70 backdrop-blur-md animate-fadeIn">
          <div
            className={`w-full max-w-2xl rounded-2xl border shadow-2xl overflow-hidden transition-all ${
              theme === "dark"
                ? "bg-[#121216] border-zinc-800 text-white"
                : "bg-white border-slate-200 text-slate-900"
            }`}
          >
            {/* Search Input Box */}
            <div className="p-4 border-b border-zinc-800/60 flex items-center gap-3">
              <Search className="w-5 h-5 text-indigo-400 shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setSelectedIndex(0);
                }}
                onKeyDown={handlePaletteKeyDown}
                placeholder="Search files or run developer actions (e.g. App.tsx, Run, Save)..."
                className="w-full bg-transparent border-none text-sm focus:outline-none placeholder-slate-400 font-mono"
              />
              <button
                onClick={onCloseCommandPalette}
                className="p-1 rounded-lg hover:bg-zinc-800 text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Filter Tabs */}
            <div className="px-4 py-2 border-b border-zinc-800/40 flex items-center justify-between bg-zinc-900/40 text-xs">
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setActiveFilterTab("all")}
                  className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                    activeFilterTab === "all"
                      ? "bg-indigo-600 text-white"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  All ({paletteResults.length})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveFilterTab("files")}
                  className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                    activeFilterTab === "files"
                      ? "bg-indigo-600 text-white"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  Files ({files.length})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveFilterTab("actions")}
                  className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                    activeFilterTab === "actions"
                      ? "bg-indigo-600 text-white"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  Actions ({shortcutList.length})
                </button>
              </div>

              <div className="hidden sm:flex items-center gap-2 text-[10px] text-slate-400 font-mono">
                <span>↑↓ navigate</span>
                <span>↵ select</span>
                <span>esc close</span>
              </div>
            </div>

            {/* Results List */}
            <div ref={listRef} className="max-h-96 overflow-y-auto p-2 space-y-1">
              {paletteResults.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs font-mono">
                  No files or actions match "{searchQuery}"
                </div>
              ) : (
                paletteResults.map((item, idx) => {
                  const isSelected = idx === selectedIndex;
                  return (
                    <div
                      key={item.id}
                      onClick={() => item.action()}
                      onMouseEnter={() => setSelectedIndex(idx)}
                      className={`palette-item p-3 rounded-xl flex items-center justify-between cursor-pointer transition-all ${
                        isSelected
                          ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/30"
                          : theme === "dark"
                          ? "hover:bg-zinc-800/80 text-slate-200"
                          : "hover:bg-slate-100 text-slate-800"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`p-2 rounded-lg ${
                            isSelected ? "bg-white/20 text-white" : "bg-zinc-800 text-indigo-400"
                          }`}
                        >
                          {item.icon}
                        </div>
                        <div>
                          <div className="text-xs font-bold font-mono flex items-center gap-2">
                            {item.title}
                            {item.type === "file" && item.title === selectedFilePath && (
                              <span className="px-1.5 py-0.2 text-[9px] rounded bg-emerald-500/20 text-emerald-300 font-bold">
                                ACTIVE
                              </span>
                            )}
                          </div>
                          <div
                            className={`text-[11px] ${
                              isSelected ? "text-indigo-100" : "text-slate-400"
                            }`}
                          >
                            {item.subtitle}
                          </div>
                        </div>
                      </div>

                      {item.type === "action" && item.keys && (
                        <div className="flex items-center gap-1">
                          {item.keys.map((k) => (
                            <kbd
                              key={k}
                              className={`px-2 py-0.5 text-[10px] font-mono rounded font-bold border ${
                                isSelected
                                  ? "bg-indigo-700 border-indigo-500 text-white"
                                  : "bg-zinc-800 border-zinc-700 text-slate-300"
                              }`}
                            >
                              {k}
                            </kbd>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer Tip */}
            <div className="px-4 py-2.5 bg-zinc-900/60 border-t border-zinc-800/50 flex items-center justify-between text-[11px] text-slate-400 font-mono">
              <span className="flex items-center gap-1.5">
                <Command className="w-3.5 h-3.5 text-indigo-400" /> Quick Developer Command Palette
              </span>
              <button
                type="button"
                onClick={() => {
                  onCloseCommandPalette();
                  onOpenHelpModal();
                }}
                className="hover:text-white underline cursor-pointer flex items-center gap-1"
              >
                View Cheat Sheet (Ctrl+/)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Keyboard Shortcuts Cheat Sheet Overlay Modal (Ctrl+/) */}
      {isOpenHelpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div
            className={`w-full max-w-3xl rounded-3xl border shadow-2xl overflow-hidden flex flex-col max-h-[85vh] transition-all ${
              theme === "dark"
                ? "bg-[#141418] border-zinc-800 text-white"
                : "bg-white border-slate-200 text-slate-900"
            }`}
          >
            {/* Modal Header */}
            <div className="p-5 border-b border-zinc-800/70 flex items-center justify-between bg-zinc-900/50">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white shadow-lg">
                  <Keyboard className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <h2 className="text-base font-black uppercase tracking-wider flex items-center gap-2">
                    Developer Keyboard Shortcuts System
                    <span className="px-2 py-0.5 text-[10px] rounded-full bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 font-bold font-mono">
                      11 Hotkeys Active
                    </span>
                  </h2>
                  <p className="text-xs text-slate-400">
                    Boost coding speed with instant keyboard navigation, command palette & save triggers.
                  </p>
                </div>
              </div>

              <button
                onClick={onCloseHelpModal}
                className="p-2 rounded-xl bg-zinc-800/80 hover:bg-zinc-700 text-slate-400 hover:text-white cursor-pointer transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body Categorized List */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {(
                [
                  "Files & Navigation",
                  "Dev Tools",
                  "Editor & Workspace",
                  "Tools & Actions",
                  "Theme & View"
                ] as const
              ).map((category) => {
                const categoryShortcuts = shortcutList.filter((s) => s.category === category);
                if (categoryShortcuts.length === 0) return null;

                return (
                  <div key={category} className="space-y-3">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-2 border-b border-zinc-800/40 pb-1.5">
                      <Zap className="w-3.5 h-3.5" /> {category}
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {categoryShortcuts.map((item) => (
                        <div
                          key={item.id}
                          className="p-3 rounded-2xl bg-zinc-900/60 border border-zinc-800/70 hover:border-indigo-500/40 transition-all flex items-center justify-between"
                        >
                          <div>
                            <div className="text-xs font-bold font-mono text-slate-200">
                              {item.title}
                            </div>
                            <div className="text-[11px] text-slate-400">{item.description}</div>
                          </div>

                          <div className="flex items-center gap-1 shrink-0 ml-3">
                            {item.keys.map((k) => (
                              <kbd
                                key={k}
                                className="px-2.5 py-1 text-xs font-mono font-bold rounded-lg bg-zinc-800 border border-zinc-700 text-indigo-300 shadow-sm"
                              >
                                {k}
                              </kbd>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Footer with Quick Button to Launch Command Palette */}
            <div className="p-4 border-t border-zinc-800/60 bg-zinc-900/40 flex flex-wrap items-center justify-between gap-3 text-xs">
              <span className="text-slate-400 font-mono">
                Press <kbd className="px-2 py-0.5 bg-zinc-800 border border-zinc-700 rounded text-indigo-400 font-bold">Esc</kbd> anytime to dismiss overlays.
              </span>

              <button
                type="button"
                onClick={() => {
                  onCloseHelpModal();
                  onOpenCommandPalette();
                }}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-indigo-500/25 cursor-pointer transition-all"
              >
                <Command className="w-4 h-4" /> Open Command Palette (Ctrl+P)
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
