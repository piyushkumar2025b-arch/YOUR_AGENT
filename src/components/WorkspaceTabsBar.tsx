import React, { memo, useRef, useEffect, useState, useMemo } from "react";
import { createPortal } from "react-dom";
import {
  Code2,
  Globe,
  Cpu,
  GraduationCap,
  Palette,
  Compass,
  BookOpen,
  Book,
  Gamepad2,
  Music,
  Search,
  Github,
  Flame,
  Database,
  Mail,
  Youtube,
  Brain,
  Terminal,
  Upload,
  Sun,
  Newspaper,
  Calculator,
  Download,
  FileText,
  Laugh,
  Bot,
  ShieldAlert,
  Wand2,
  Volume2,
  Languages,
  Share2,
  DollarSign,
  QrCode,
  Rocket,
  Coins,
  Users,
  Dog,
  HelpCircle,
  Quote,
  ImageIcon,
  Wind,
  Settings,
  Sparkles,
  ChevronDown,
  LayoutGrid,
  X,
  ChevronLeft,
  ChevronRight,
  Sliders,
  Calendar,
  Check,
  Box,
  Orbit,
  Server,
  Gauge,
  Send,
  Stethoscope,
  Binary,
  GitCompare,
  FileCode2,
  Radio
} from "lucide-react";

export type ToolCategory = "core" | "music" | "ai" | "web" | "dev" | "data" | "media";

export interface TabItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  category: ToolCategory;
  description: string;
  badge?: string;
  badgeColor?: string;
}

export const WORKSPACE_TABS: TabItem[] = [
  // Core Development
  { id: "editor", label: "Code Editor", icon: Code2, category: "core", description: "Multi-file IDE with syntax highlighting, live tabs & AI Runner" },
  { id: "preview", label: "Universal Preview", icon: Globe, category: "core", description: "Realtime responsive web browser & device viewport emulator" },
  { id: "agents", label: "Agents Ecosystem", icon: Cpu, category: "core", description: "Autonomous multi-agent orchestration & execution pipelines" },
  { id: "actions", label: "Audit & Logs", icon: Terminal, category: "core", description: "Realtime diagnostic system logstream & execution telemetry" },
  { id: "github", label: "GitHub Sync", icon: Github, category: "core", description: "Branch commits, repo cloning, push/pull & OAuth integration" },
  { id: "firebase", label: "Firebase DB", icon: Flame, category: "core", description: "Cloud Firestore database synchronization & auth management" },
  { id: "supabase", label: "Supabase DB", icon: Database, category: "core", description: "PostgreSQL realtime tables, storage buckets & SQL console" },
  { id: "settings", label: "Studio Settings", icon: Settings, category: "core", description: "Studio layout, API keys, dark/light themes & preferences" },

  // Music & Audio Studio
  { id: "music-studio", label: "Piano & Drum Studio", icon: Music, category: "music", description: "Comprehensive audio workstation with polyphonic piano & step sequencer", badge: "New", badgeColor: "bg-amber-500/20 text-amber-300" },
  { id: "piano", label: "Virtual Piano", icon: Music, category: "music", description: "8-voice polyphonic synthesizer piano with octave shifting & sustain", badge: "Pro", badgeColor: "bg-indigo-500/20 text-indigo-300" },
  { id: "drums", label: "16-Step Drum Machine", icon: Sparkles, category: "music", description: "Programmable 4-voice rhythm beatmaker with BPM swing & live loop", badge: "Pro", badgeColor: "bg-emerald-500/20 text-emerald-300" },
  { id: "music", label: "Ambient Beats Player", icon: Music, category: "music", description: "Lo-fi background radio & ambient study audio visualizer" },
  { id: "voice-synth", label: "AI Voice Synth", icon: Volume2, category: "music", description: "Text-to-speech voice generator & audio frequency visualizer" },

  // AI & Reasoning Agents
  { id: "study", label: "Study Agent", icon: GraduationCap, category: "ai", description: "Interactive study planner, flashcards generator & syllabus tutor" },
  { id: "english-agent", label: "English Coach", icon: GraduationCap, category: "ai", description: "Grammar corrector, vocabulary coach & tone analyzer" },
  { id: "story", label: "Story Maker", icon: BookOpen, category: "ai", description: "Branching creative fiction & dynamic narrative story generator" },
  { id: "chat", label: "Just Chat AI", icon: Brain, category: "ai", description: "Distraction-free conversational reasoning & brainstorming workspace" },
  { id: "jokes", label: "Jokes & Humor", icon: Laugh, category: "ai", description: "Programmer jokes, puns & stand-up humor generator" },
  { id: "content-creator", label: "Content Creator", icon: Share2, category: "ai", description: "Social media copy, blog posts & SEO marketing generator" },
  { id: "deep-research", label: "Deep Research", icon: Compass, category: "ai", description: "Multi-source research agent with citations & factual analysis" },
  { id: "live-quiz", label: "Interactive Quiz", icon: Brain, category: "ai", description: "Realtime knowledge trivia & coding challenge engine" },
  { id: "cp", label: "Competitive Coding", icon: Code2, category: "ai", description: "Algorithms, time complexity analyzer & LeetCode assistant" },

  // Web & Cloud Integrations
  { id: "search", label: "Google Search", icon: Search, category: "web", description: "Live web search engine integration with verified instant results" },
  { id: "gmail", label: "Gmail Productivity", icon: Mail, category: "web", description: "Email drafting, smart inbox search & Gmail thread assistant" },
  { id: "youtube", label: "YouTube Studio", icon: Youtube, category: "web", description: "Video search, chapters, transcript extraction & thumbnail viewer" },
  { id: "calendar-agent", label: "Google Calendar", icon: Calendar, category: "web", description: "Schedule meetings, plan deadlines & sync Google Calendar events" },
  { id: "map", label: "Interactive Maps", icon: Compass, category: "web", description: "Global vector map visualizer with place search & coordinates" },
  { id: "share", label: "Share & QR Export", icon: Upload, category: "web", description: "Deploy live URL, generate instant QR code & export bundle" },
  { id: "trending-repos", label: "Trending Repos", icon: Github, category: "web", description: "Explore trending open-source repositories on GitHub today" },

  // Dev Utilities & Tools
  { id: "openapi-studio", label: "OpenAPI & Swagger", icon: FileCode2, category: "dev", description: "Interactive OpenAPI 3.1 & Swagger visual architect, automated endpoint scanner & live API test bench", badge: "New", badgeColor: "bg-emerald-500/20 text-emerald-300" },
  { id: "stream-tester", label: "WebSocket & SSE Stream", icon: Radio, category: "dev", description: "Realtime WebSocket (WSS) & Server-Sent Events (SSE) live connection tester & mock feed emulator", badge: "Pro", badgeColor: "bg-purple-500/20 text-purple-300" },
  { id: "mock-server", label: "Mock API Server", icon: Server, category: "dev", description: "Configurable mock REST server with custom latency, status codes & webhook catcher", badge: "Pro", badgeColor: "bg-emerald-500/20 text-emerald-300" },
  { id: "perf-auditor", label: "Perf & Bundle Audit", icon: Gauge, category: "dev", description: "Lighthouse-style code quality, bundle size, security & accessibility auditor", badge: "New", badgeColor: "bg-cyan-500/20 text-cyan-300" },
  { id: "docker-studio", label: "Docker & Compose", icon: Box, category: "dev", description: "Multi-stage Dockerfile, docker-compose & devcontainer configuration architect", badge: "New", badgeColor: "bg-sky-500/20 text-sky-300" },
  { id: "graphql-studio", label: "GraphQL Explorer", icon: Orbit, category: "dev", description: "Interactive GraphQL playground, schema introspection visualizer & query tester", badge: "New", badgeColor: "bg-pink-500/20 text-pink-300" },
  { id: "api-client", label: "REST Client Studio", icon: Send, category: "dev", description: "Interactive Postman-style HTTP client with SSRF protection & header presets" },
  { id: "code-doctor", label: "Code Doctor AI", icon: Stethoscope, category: "dev", description: "Automated codebase scanner, syntax error diagnostician & 1-click refactoring" },
  { id: "diff-inspector", label: "Git Diff Inspector", icon: GitCompare, category: "dev", description: "Side-by-side split visual diff inspector with chunk navigation & patch applier" },
  { id: "regex-playground", label: "Regex Playground", icon: Binary, category: "dev", description: "Interactive regex evaluator with capture groups, cheat sheet & AI explainer" },
  { id: "calculator", label: "Scientific Calc", icon: Calculator, category: "dev", description: "Scientific & programmer calculator with expression history" },
  { id: "code-analyzer", label: "Code Security", icon: ShieldAlert, category: "dev", description: "Static AST security auditing, vulnerability & CVE scanner" },
  { id: "api-hub", label: "API Studio Hub", icon: Bot, category: "dev", description: "Explore and test 50+ free public REST APIs directly" },
  { id: "media-downloader", label: "Media Downloader", icon: Download, category: "dev", description: "Direct video, audio & asset media download helper" },
  { id: "doc-previewer", label: "Doc Previewer", icon: FileText, category: "dev", description: "Rich markdown, PDF and documentation renderer" },
  { id: "qrcode-agent", label: "QR Code API", icon: QrCode, category: "dev", description: "Custom styled SVG and PNG QR Code generator" },
  { id: "translator", label: "Translator API", icon: Languages, category: "dev", description: "Instant text translation across 80+ spoken languages" },
  { id: "dictionary", label: "Lexical Dictionary", icon: Book, category: "dev", description: "Word definitions, etymology, phonetics & synonyms lookup" },
  { id: "gaming", label: "Arcade Games", icon: Gamepad2, category: "dev", description: "Retro browser games, arcade physics & coding minigames" },

  // Data & Knowledge APIs
  { id: "sql-studio", label: "Relational SQL Studio", icon: Database, category: "data", description: "Interactive SQLite & PostgreSQL relational query sandbox with table visualizer", badge: "Pro", badgeColor: "bg-blue-500/20 text-blue-300" },
  { id: "weather", label: "Live Weather", icon: Sun, category: "data", description: "Realtime meteorological forecasts, radar & humidity" },
  { id: "currency-agent", label: "Forex & Crypto", icon: DollarSign, category: "data", description: "Live foreign exchange rates & fiat conversions" },
  { id: "crypto-agent", label: "Crypto API", icon: Coins, category: "data", description: "Realtime cryptocurrency market prices & 24h volume tracking" },
  { id: "wiki-agent", label: "Wikipedia API", icon: BookOpen, category: "data", description: "Search encyclopedia articles & summaries via MediaWiki" },
  { id: "nasa-agent", label: "NASA Space", icon: Rocket, category: "data", description: "Astronomy Picture of the Day & Mars Rover photographs" },
  { id: "earth-space-agent", label: "Earth & Space", icon: Globe, category: "data", description: "Satellite imagery, planetary orbits & astronomical data" },
  { id: "ipgeo-agent", label: "IP Geolocation", icon: Globe, category: "data", description: "Inspect client IP, ISP, geolocation coordinates & ASN" },
  { id: "mockdata-agent", label: "Mock Data API", icon: Users, category: "data", description: "Generate JSON schemas, mock user databases & sample data" },
  { id: "animal-agent", label: "Pets & Fauna", icon: Dog, category: "data", description: "Random dog & cat images, animal facts & breed info" },
  { id: "opentrivia-agent", label: "Trivia DB", icon: HelpCircle, category: "data", description: "Curated multi-category quiz questions & trivia challenges" },
  { id: "countries-agent", label: "World Countries", icon: Globe, category: "data", description: "Demographics, flags, borders & currencies of all nations" },
  { id: "universities-agent", label: "Universities", icon: GraduationCap, category: "data", description: "Directory of global universities, colleges & domains" },
  { id: "advice-agent", label: "Wisdom Quotes", icon: Quote, category: "data", description: "Daily inspirational life advice & famous literature quotes" },
  { id: "books-agent", label: "Books API", icon: BookOpen, category: "data", description: "Google Books database search by ISBN, author & title" },
  { id: "airquality-agent", label: "Air Quality API", icon: Wind, category: "data", description: "Live PM2.5, ozone & global air pollution indexes" },
  { id: "news-agent", label: "Global News", icon: Newspaper, category: "data", description: "Top breaking world headlines & RSS technology feeds" },

  // Visuals & Creative Media
  { id: "photos", label: "Image Studio", icon: Palette, category: "media", description: "Curated stock photo gallery & asset collection" },
  { id: "photo-editor", label: "Photo Editor", icon: Palette, category: "media", description: "Canvas image filters, crop, rotate & contrast adjustments" },
  { id: "image-studio", label: "Create Image", icon: Wand2, category: "media", description: "AI generative diffusion model image creator" },
  { id: "picsum-agent", label: "Stock Photos", icon: ImageIcon, category: "media", description: "High-resolution Lorem Picsum & Unsplash photography" }
];

export const CATEGORY_DEFINITIONS: { id: ToolCategory | "all"; label: string; icon: string }[] = [
  { id: "all", label: "All Tools", icon: "✨" },
  { id: "core", label: "Core Dev", icon: "💻" },
  { id: "music", label: "Music & Audio", icon: "🎵" },
  { id: "ai", label: "AI Agents", icon: "🤖" },
  { id: "web", label: "Web & Cloud", icon: "🌐" },
  { id: "dev", label: "Utilities", icon: "🛠️" },
  { id: "data", label: "Data & APIs", icon: "📊" },
  { id: "media", label: "Media & Visuals", icon: "🎨" }
];

const CORE_TAB_IDS = ["editor", "preview", "agents", "actions", "github", "firebase", "settings"];

interface WorkspaceTabsBarProps {
  activeTab: string;
  setActiveTab: (tab: any) => void;
  theme: "light" | "dark" | string;
  filesCount: number;
  agentActionsCount: number;
  onOpenRunnerModal: () => void;
}

export const WorkspaceTabsBar: React.FC<WorkspaceTabsBarProps> = memo(({
  activeTab,
  setActiveTab,
  theme,
  filesCount,
  agentActionsCount,
  onOpenRunnerModal
}) => {
  const isDark = theme !== "light";

  // Display mode: "compact" (core tabs + more menu) or "full" (all tabs visible in the bar)
  const [barMode, setBarMode] = useState<"compact" | "full">(() => {
    return (localStorage.getItem("app_workspace_bar_mode") as "compact" | "full") || "compact";
  });

  const [activeCategoryFilter, setActiveCategoryFilter] = useState<ToolCategory | "all">("all");
  const [isFullMenuOpen, setIsFullMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Persist bar mode
  const toggleBarMode = () => {
    const nextMode = barMode === "compact" ? "full" : "compact";
    setBarMode(nextMode);
    localStorage.setItem("app_workspace_bar_mode", nextMode);
  };

  // Close full menu with Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isFullMenuOpen) {
        setIsFullMenuOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isFullMenuOpen]);

  // Smooth scroll tabs row
  const handleScroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const scrollOffset = direction === "left" ? -260 : 260;
      scrollContainerRef.current.scrollBy({ left: scrollOffset, behavior: "smooth" });
    }
  };

  // Auto-scroll active tab into view
  useEffect(() => {
    if (scrollContainerRef.current) {
      const activeEl = scrollContainerRef.current.querySelector('[data-active="true"]');
      if (activeEl) {
        activeEl.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "nearest" });
      }
    }
  }, [activeTab, barMode, activeCategoryFilter]);

  // Filter tabs for bar in full mode
  const displayedBarTabs = useMemo(() => {
    if (barMode === "compact") {
      return WORKSPACE_TABS.filter(t => CORE_TAB_IDS.includes(t.id));
    }
    if (activeCategoryFilter === "all") {
      return WORKSPACE_TABS;
    }
    return WORKSPACE_TABS.filter(t => t.category === activeCategoryFilter);
  }, [barMode, activeCategoryFilter]);

  // Check if current active tab is secondary (not in core tabs)
  const activeSecondaryTab = !CORE_TAB_IDS.includes(activeTab)
    ? WORKSPACE_TABS.find(t => t.id === activeTab)
    : null;

  // Search filtered tabs for the Full Menu Modal
  const modalFilteredTabs = useMemo(() => {
    return WORKSPACE_TABS.filter(tab => {
      const matchesCategory = activeCategoryFilter === "all" || tab.category === activeCategoryFilter;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q ||
        tab.label.toLowerCase().includes(q) ||
        tab.description.toLowerCase().includes(q) ||
        tab.id.toLowerCase().includes(q) ||
        tab.category.toLowerCase().includes(q);
      return matchesCategory && matchesSearch;
    });
  }, [searchQuery, activeCategoryFilter]);

  return (
    <>
      {/* NORMAL TAB BAR */}
      <div className={`h-10 border-b px-2.5 flex items-center justify-between shrink-0 z-20 transition-colors w-full relative select-none ${
        isDark ? "border-zinc-800 bg-[#141416] text-white" : "border-slate-200 bg-white text-slate-900"
      }`}>
        
        {/* Left Section: Scroll controls & Tabs */}
        <div className="flex-1 min-w-0 flex items-center relative overflow-hidden pr-2">
          
          {/* Scroll Left Button (Full Bar Mode) */}
          {barMode === "full" && (
            <button
              onClick={() => handleScroll("left")}
              className={`p-1 mr-1 rounded-md border shrink-0 transition-colors cursor-pointer z-10 ${
                isDark ? "border-zinc-800 bg-zinc-900/90 text-zinc-400 hover:text-white" : "border-slate-200 bg-slate-100 text-slate-600 hover:text-slate-900"
              }`}
              title="Scroll Tabs Left"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Category Filter Pills (Full Bar Mode) */}
          {barMode === "full" && (
            <div className="flex items-center gap-1 shrink-0 mr-2 border-r pr-2 border-zinc-700/50">
              <select
                value={activeCategoryFilter}
                onChange={(e) => setActiveCategoryFilter(e.target.value as any)}
                className={`text-[11px] font-semibold px-2 py-0.5 rounded border focus:outline-none cursor-pointer ${
                  isDark
                    ? "bg-zinc-900 border-zinc-800 text-indigo-400 hover:bg-zinc-800"
                    : "bg-slate-100 border-slate-200 text-indigo-600 hover:bg-slate-200"
                }`}
              >
                {CATEGORY_DEFINITIONS.map(cat => (
                  <option key={cat.id} value={cat.id} className={isDark ? "bg-zinc-900 text-white" : "bg-white text-slate-800"}>
                    {cat.icon} {cat.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Horizontally Scrollable Tabs Row */}
          <div
            ref={scrollContainerRef}
            className="flex-1 min-w-0 flex items-center gap-1 overflow-x-auto scrollbar-none py-1 scroll-smooth"
          >
            {displayedBarTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  data-active={isActive ? "true" : "false"}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium tracking-normal transition-all cursor-pointer shrink-0 ${
                    isActive
                      ? (isDark
                          ? "bg-indigo-600 text-white font-semibold shadow-xs"
                          : "bg-indigo-600 text-white font-semibold shadow-xs")
                      : (isDark
                          ? "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/60"
                          : "text-slate-600 hover:text-slate-900 hover:bg-slate-100")
                  }`}
                  title={`${tab.label}: ${tab.description}`}
                >
                  <Icon className={`w-3.5 h-3.5 shrink-0 ${
                    isActive ? "text-white" : (isDark ? "text-zinc-400" : "text-slate-400")
                  }`} />
                  <span className="whitespace-nowrap">{tab.label}</span>
                  {tab.badge && (
                    <span className={`px-1 py-0.2 rounded text-[9px] font-bold ${tab.badgeColor || "bg-indigo-500/20 text-indigo-300"}`}>
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}

            {/* In compact mode, show the active secondary tab if opened from more menu */}
            {barMode === "compact" && activeSecondaryTab && (
              <div className="flex items-center gap-1 shrink-0">
                <button
                  data-active="true"
                  onClick={() => setActiveTab(activeSecondaryTab.id)}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold tracking-normal transition-all cursor-pointer ${
                    isDark
                      ? "bg-indigo-600 text-white shadow-xs"
                      : "bg-indigo-600 text-white shadow-xs"
                  }`}
                  title={activeSecondaryTab.description}
                >
                  <activeSecondaryTab.icon className="w-3.5 h-3.5 shrink-0 text-white" />
                  <span className="whitespace-nowrap">{activeSecondaryTab.label}</span>
                  {activeSecondaryTab.badge && (
                    <span className="px-1 rounded text-[9px] bg-white/20 text-white font-bold">
                      {activeSecondaryTab.badge}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => setActiveTab("editor")}
                  className={`p-1 rounded hover:bg-white/10 text-white/70 hover:text-white cursor-pointer ${
                    isDark ? "bg-zinc-800" : "bg-slate-200"
                  }`}
                  title="Close tab (Return to Code Editor)"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>

          {/* Scroll Right Button (Full Bar Mode) */}
          {barMode === "full" && (
            <button
              onClick={() => handleScroll("right")}
              className={`p-1 ml-1 rounded-md border shrink-0 transition-colors cursor-pointer z-10 ${
                isDark ? "border-zinc-800 bg-zinc-900/90 text-zinc-400 hover:text-white" : "border-slate-200 bg-slate-100 text-slate-600 hover:text-slate-900"
              }`}
              title="Scroll Tabs Right"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}

          {/* "MORE TOOLS" / FULL MENU BUTTON */}
          <button
            onClick={() => setIsFullMenuOpen(true)}
            className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer shrink-0 ml-1 border ${
              isDark
                ? "border-indigo-500/30 bg-indigo-500/10 text-indigo-300 hover:bg-indigo-500/20"
                : "border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100"
            }`}
            title={`Open Full Tools & Agents Library (All ${WORKSPACE_TABS.length} Modules)`}
          >
            <LayoutGrid className="w-3.5 h-3.5 text-indigo-400" />
            <span className="font-semibold whitespace-nowrap">More Tools</span>
            <span className={`text-[9px] font-mono px-1 rounded ${
              isDark ? "bg-indigo-900/60 text-indigo-200" : "bg-indigo-100 text-indigo-800"
            }`}>
              {WORKSPACE_TABS.length}
            </span>
          </button>

          {/* BAR MODE TOGGLE SWITCH ("Full in normal bar") */}
          <button
            onClick={toggleBarMode}
            className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer shrink-0 ml-1 border ${
              barMode === "full"
                ? (isDark ? "bg-amber-500/20 border-amber-500/40 text-amber-300" : "bg-amber-50 border-amber-300 text-amber-800")
                : (isDark ? "border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800" : "border-slate-200 text-slate-600 hover:bg-slate-100")
            }`}
            title={barMode === "full" ? "Switch to Compact Bar Mode (Core Tabs Only)" : `Switch to Full Bar Mode (Show All ${WORKSPACE_TABS.length} Tools in Normal Bar)`}
          >
            <Sliders className="w-3 h-3 text-amber-400" />
            <span className="hidden xl:inline whitespace-nowrap">
              {barMode === "full" ? "Compact Bar" : "Full in Bar"}
            </span>
          </button>
        </div>

        {/* Right Section: Action buttons & Stats */}
        <div className={`shrink-0 flex items-center gap-2 pl-2 border-l ${
          isDark ? "border-zinc-800 bg-[#141416]" : "border-slate-200 bg-white"
        }`}>
          {/* Runner Launcher Modal Button */}
          <button
            onClick={onOpenRunnerModal}
            className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer shrink-0 border ${
              isDark
                ? "text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10 border-cyan-500/30"
                : "text-cyan-700 hover:text-cyan-800 hover:bg-cyan-50 border-cyan-200"
            }`}
            title="Open Module Compilers & Code Runners"
          >
            <Cpu className="w-3.5 h-3.5 shrink-0 text-cyan-400" />
            <span className="whitespace-nowrap hidden sm:inline">Run Modules</span>
          </button>

          {/* Quick stats counter */}
          <div className={`text-[11px] font-mono shrink-0 hidden lg:flex items-center gap-2 ${
            isDark ? "text-zinc-400" : "text-slate-500"
          }`}>
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              <span>{filesCount} Files</span>
            </span>
            <span>•</span>
            <span>{agentActionsCount} Logs</span>
          </div>
        </div>
      </div>

      {/* FULL TOOLS & AGENTS MODAL (Mounted in document.body to eliminate all UI clipping/overflow bugs) */}
      {isFullMenuOpen && createPortal(
        <div
          className="fixed inset-0 z-[95] bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-150"
          onClick={() => setIsFullMenuOpen(false)}
        >
          <div
            className={`w-full max-w-4xl max-h-[90vh] flex flex-col rounded-2xl shadow-2xl border overflow-hidden animate-in zoom-in-95 duration-200 ${
              isDark ? "bg-[#16161a] border-zinc-800 text-white shadow-black/90" : "bg-white border-slate-200 text-slate-900 shadow-slate-900/30"
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className={`px-5 py-4 border-b flex items-center justify-between shrink-0 ${
              isDark ? "border-zinc-800 bg-[#121214]" : "border-slate-200 bg-slate-50"
            }`}>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-indigo-600 text-white shadow-md">
                  <LayoutGrid className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-bold tracking-tight">Studio Tools & Agents Menu</h2>
                    <span className="text-xs px-2 py-0.5 rounded-full font-mono font-semibold bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                      {WORKSPACE_TABS.length} Modules
                    </span>
                  </div>
                  <p className={`text-xs ${isDark ? "text-zinc-400" : "text-slate-500"}`}>
                    Choose any module to open it, or toggle Full Bar Mode to keep all tools in the top bar.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    toggleBarMode();
                  }}
                  className={`px-3 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                    barMode === "full"
                      ? "bg-amber-500/20 border-amber-500/40 text-amber-300"
                      : isDark
                      ? "bg-zinc-800 border-zinc-700 text-zinc-300 hover:bg-zinc-700"
                      : "bg-slate-100 border-slate-300 text-slate-700 hover:bg-slate-200"
                  }`}
                  title="Show all tools directly in the normal bar"
                >
                  <Sliders className="w-3.5 h-3.5 text-amber-400" />
                  <span>{barMode === "full" ? "Full Bar Enabled" : "Show All in Normal Bar"}</span>
                </button>

                <button
                  onClick={() => setIsFullMenuOpen(false)}
                  className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                    isDark ? "border-zinc-800 hover:bg-zinc-800 text-zinc-400 hover:text-white" : "border-slate-200 hover:bg-slate-100 text-slate-500 hover:text-slate-900"
                  }`}
                  title="Close Menu (Esc)"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Search & Category Filter Controls */}
            <div className={`p-4 border-b space-y-3 shrink-0 ${
              isDark ? "border-zinc-800 bg-[#16161a]" : "border-slate-100 bg-white"
            }`}>
              {/* Search input */}
              <div className="relative">
                <Search className={`w-4 h-4 absolute left-3.5 top-3 ${isDark ? "text-zinc-400" : "text-slate-400"}`} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search 54 tools, AI agents, audio studios, APIs, or utilities..."
                  className={`w-full text-xs pl-10 pr-9 py-2.5 rounded-xl border focus:outline-none transition-all ${
                    isDark 
                      ? "bg-zinc-900/90 border-zinc-800 text-zinc-100 placeholder-zinc-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30" 
                      : "bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30"
                  }`}
                  autoFocus
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-3 text-zinc-400 hover:text-white cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Category Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1">
                {CATEGORY_DEFINITIONS.map(cat => {
                  const isSelected = activeCategoryFilter === cat.id;
                  const count = cat.id === "all"
                    ? WORKSPACE_TABS.length
                    : WORKSPACE_TABS.filter(t => t.category === cat.id).length;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setActiveCategoryFilter(cat.id)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                        isSelected
                          ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                          : isDark
                          ? "bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800"
                          : "bg-slate-100 border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-200"
                      }`}
                    >
                      <span>{cat.icon}</span>
                      <span>{cat.label}</span>
                      <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                        isSelected ? "bg-white/20 text-white" : (isDark ? "bg-zinc-800 text-zinc-400" : "bg-slate-200 text-slate-600")
                      }`}>
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Tools Grid Area */}
            <div className={`p-4 overflow-y-auto flex-1 ${isDark ? "bg-[#141418]" : "bg-slate-50/50"}`}>
              {modalFilteredTabs.length === 0 ? (
                <div className="text-center py-12">
                  <Bot className="w-10 h-10 mx-auto text-zinc-500 mb-2 opacity-60" />
                  <p className="text-sm font-semibold text-zinc-300">No matching tools or agents found</p>
                  <p className="text-xs text-zinc-500 mt-1">Try searching for keywords like "audio", "code", "weather", or "image".</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
                  {modalFilteredTabs.map(tab => {
                    const TabIcon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                      <div
                        key={tab.id}
                        onClick={() => {
                          setActiveTab(tab.id);
                          setIsFullMenuOpen(false);
                        }}
                        className={`p-3 rounded-xl border flex flex-col justify-between transition-all cursor-pointer text-left group relative ${
                          isActive
                            ? (isDark
                                ? "bg-indigo-950/40 border-indigo-500/80 shadow-md shadow-indigo-500/10 ring-1 ring-indigo-500/30"
                                : "bg-indigo-50/80 border-indigo-500 shadow-md shadow-indigo-500/10 ring-1 ring-indigo-500/30")
                            : (isDark
                                ? "bg-zinc-900/60 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800/80"
                                : "bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50")
                        }`}
                      >
                        {/* Top row: Icon, Name, Badge */}
                        <div className="flex items-start gap-2.5">
                          <div className={`p-2 rounded-lg shrink-0 transition-colors ${
                            isActive
                              ? "bg-indigo-600 text-white"
                              : isDark
                              ? "bg-zinc-800 text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white"
                              : "bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white"
                          }`}>
                            <TabIcon className="w-4 h-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-xs truncate group-hover:text-indigo-400 transition-colors">
                                {tab.label}
                              </span>
                              {tab.badge && (
                                <span className={`px-1 py-0.2 rounded text-[9px] font-bold ${tab.badgeColor || "bg-indigo-500/20 text-indigo-300"}`}>
                                  {tab.badge}
                                </span>
                              )}
                            </div>
                            <span className={`text-[10px] font-mono capitalize block ${
                              isDark ? "text-zinc-500" : "text-slate-400"
                            }`}>
                              {tab.category}
                            </span>
                          </div>
                          {isActive && (
                            <span className="p-1 rounded-full bg-emerald-500 text-white shrink-0 shadow-xs" title="Currently Open">
                              <Check className="w-3 h-3" />
                            </span>
                          )}
                        </div>

                        {/* Description */}
                        <p className={`text-[11px] leading-relaxed mt-2 line-clamp-2 ${
                          isDark ? "text-zinc-400" : "text-slate-600"
                        }`}>
                          {tab.description}
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className={`px-5 py-3 border-t flex items-center justify-between text-xs shrink-0 ${
              isDark ? "border-zinc-800 bg-[#121214] text-zinc-400" : "border-slate-200 bg-slate-50 text-slate-600"
            }`}>
              <div className="flex items-center gap-2">
                <span>Currently active:</span>
                <span className="font-semibold text-indigo-400">
                  {WORKSPACE_TABS.find(t => t.id === activeTab)?.label || activeTab}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[11px] font-mono">
                  Press <kbd className={`px-1 rounded ${isDark ? "bg-zinc-800 text-zinc-300" : "bg-slate-200 text-slate-800"}`}>Esc</kbd> to close
                </span>
                <button
                  onClick={() => setIsFullMenuOpen(false)}
                  className={`px-3 py-1 rounded-lg border font-semibold cursor-pointer ${
                    isDark ? "bg-zinc-800 border-zinc-700 text-zinc-200 hover:bg-zinc-700" : "bg-white border-slate-300 text-slate-800 hover:bg-slate-100"
                  }`}
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
});
