import React, { memo, useRef, useEffect, useState, useMemo } from "react";
import { createPortal } from "react-dom";
import {
  Code2,
  Globe,
  Cpu,
  Sparkles,
  Terminal,
  Github,
  Flame,
  Database,
  ShieldAlert,
  Stethoscope,
  GitCompare,
  Binary,
  Send,
  Server,
  Calculator,
  Settings,
  Search,
  Mail,
  Calendar,
  Youtube,
  Wind,
  Compass,
  MapPin,
  Globe2,
  Rocket,
  Brain,
  Bot,
  GraduationCap,
  BookOpen,
  Book,
  BookMarked,
  Languages,
  Wand2,
  HelpCircle,
  Quote,
  Dog,
  Building2,
  Newspaper,
  Palette,
  Camera,
  ImageIcon,
  Download,
  FileText,
  Volume2,
  Music,
  Laugh,
  Gamepad2,
  Trophy,
  Share2,
  TrendingUp,
  DollarSign,
  Coins,
  QrCode,
  FileCode2,
  Sun,
  X,
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
  Check,
  Key,
  Box,
  Orbit,
  Gauge,
  Clock,
  GitBranch,
  FileJson,
  Radio,
  GitFork
} from "lucide-react";

export type ToolCategory = "core" | "music" | "ai" | "web" | "dev" | "media" | "new";

export interface TabItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  category: ToolCategory;
  description: string;
  badge?: string;
  badgeColor?: string;
}

// ============================================================================
// ALL ORIGINAL, MOST USED REAL FEATURES (KEPT FRONT & CENTER IN THE MAIN TOOLBAR)
// Not the new ones - all the old, real, most used features are here in the main bar!
// ============================================================================
export const REAL_WORKSPACE_TABS: TabItem[] = [
  // Core Dev & Workspace
  { id: "editor", label: "Code Editor", icon: Code2, category: "core", description: "Multi-file IDE with syntax highlighting, live tabs & AI Runner" },
  { id: "preview", label: "Universal Preview", icon: Globe, category: "core", description: "Realtime responsive web browser & device viewport emulator" },
  { id: "agents", label: "Agents Ecosystem", icon: Cpu, category: "core", description: "Autonomous multi-agent orchestration & execution pipelines" },
  { id: "skills", label: "Agent Skills & Tools", icon: Sparkles, category: "core", description: "Configured system skills, capabilities & tool inspectors" },
  { id: "actions", label: "Audit & Logs", icon: Terminal, category: "core", description: "Realtime diagnostic system logstream & execution telemetry" },
  { id: "github", label: "GitHub Sync", icon: Github, category: "core", description: "Branch commits, repo cloning, push/pull & OAuth integration" },
  { id: "firebase", label: "Firebase DB", icon: Flame, category: "core", description: "Cloud Firestore database synchronization & auth management" },
  { id: "supabase", label: "Supabase DB", icon: Database, category: "core", description: "PostgreSQL realtime tables, storage buckets & SQL console" },
  { id: "code-analyzer", label: "Code Auditor", icon: ShieldAlert, category: "dev", description: "Static AST security auditing, vulnerability & CVE scanner" },
  { id: "code-doctor", label: "Code Health Doctor", icon: Stethoscope, category: "dev", description: "Live codebase diagnostic health, syntax & performance audit" },
  { id: "diff-inspector", label: "Diff Inspector", icon: GitCompare, category: "dev", description: "Side-by-side git diff & code modification comparison" },
  { id: "regex-playground", label: "Regex Playground", icon: Binary, category: "dev", description: "Realtime regular expressions sandbox & match evaluator" },
  { id: "api-client", label: "REST Client Studio", icon: Send, category: "dev", description: "Interactive Postman-style HTTP client with SSRF protection & header presets" },
  { id: "sql-studio", label: "Relational SQL", icon: Server, category: "dev", description: "SQL query runner, schema inspector & table data explorer" },
  { id: "calculator", label: "Scientific Calc", icon: Calculator, category: "dev", description: "Scientific & programmer calculator with expression history" },

  // Web & Cloud
  { id: "search", label: "Google Search", icon: Search, category: "web", description: "Live web search engine integration with verified instant results" },
  { id: "gmail", label: "Gmail Productivity", icon: Mail, category: "web", description: "Email drafting, smart inbox search & Gmail thread assistant" },
  { id: "calendar-agent", label: "Google Calendar", icon: Calendar, category: "web", description: "Schedule meetings, plan deadlines & sync Google Calendar events" },
  { id: "youtube", label: "YouTube Studio", icon: Youtube, category: "web", description: "Video search, chapters, transcript extraction & thumbnail viewer" },
  { id: "weather", label: "Live Weather", icon: Wind, category: "web", description: "Realtime meteorological forecast, temperature & atmospheric radar" },
  { id: "map", label: "Interactive Maps", icon: Compass, category: "web", description: "Global vector map visualizer with place search & coordinates" },
  { id: "ipgeo-agent", label: "IP Geolocation", icon: MapPin, category: "web", description: "IP network geolocation, ISP lookup & coordinates mapping" },
  { id: "earth-space-agent", label: "Earth & Orbit Live", icon: Globe2, category: "web", description: "Satellite orbits, ISS tracker & atmospheric live telemetry" },
  { id: "nasa-agent", label: "NASA Space API", icon: Rocket, category: "web", description: "Astronomy picture of the day, Mars rover & deep space exploration" },

  // AI & Reasoning
  { id: "chat", label: "Just Chat AI", icon: Brain, category: "ai", description: "Distraction-free conversational reasoning & brainstorming workspace" },
  { id: "deep-research", label: "Deep Research", icon: Bot, category: "ai", description: "Multi-source research agent with citations & factual analysis" },
  { id: "study", label: "Study Agent", icon: GraduationCap, category: "ai", description: "Interactive study planner, flashcards generator & syllabus tutor" },
  { id: "story", label: "Story Maker", icon: BookOpen, category: "ai", description: "Branching creative fiction & dynamic narrative story generator" },
  { id: "dictionary", label: "Lexical Dictionary", icon: Book, category: "ai", description: "Word definitions, etymology, phonetics & synonyms lookup" },
  { id: "english-agent", label: "English Learning", icon: BookMarked, category: "ai", description: "Grammar corrector, vocabulary enrichment & idiom trainer" },
  { id: "wiki-agent", label: "Wikipedia Explorer", icon: Globe, category: "ai", description: "Deep encyclopedic knowledge extraction & summary explorer" },
  { id: "translator", label: "AI Translator", icon: Languages, category: "ai", description: "Instant text translation across 80+ spoken languages" },
  { id: "content-creator", label: "Content Engine", icon: Wand2, category: "ai", description: "AI copywriter, blog outlines, social posts & ad copy generator" },
  { id: "live-quiz", label: "Live API Quiz", icon: HelpCircle, category: "ai", description: "Interactive computer science & web development quiz challenge" },
  { id: "opentrivia-agent", label: "Open Trivia Quiz", icon: HelpCircle, category: "ai", description: "Multi-category general knowledge trivia & scoring" },
  { id: "advice-agent", label: "Advice & Quotes", icon: Quote, category: "ai", description: "Curated wisdom, inspirational quotes & life perspectives" },
  { id: "animal-agent", label: "Cute Animals API", icon: Dog, category: "ai", description: "Animal facts, species encyclopedia & photography" },
  { id: "universities-agent", label: "Universities Agent", icon: Building2, category: "ai", description: "Global colleges, academic programs & university search" },
  { id: "countries-agent", label: "REST Countries", icon: Globe, category: "ai", description: "Comprehensive country demographics, flags, currencies & capitals" },
  { id: "news-agent", label: "Global News", icon: Newspaper, category: "ai", description: "Realtime international news headlines, breaking topics & feeds" },

  // Media, Music & Creative
  { id: "photos", label: "Image Studio", icon: Palette, category: "media", description: "Curated stock photo gallery & asset collection" },
  { id: "photo-editor", label: "Photo Editor", icon: Camera, category: "media", description: "In-browser canvas image adjustments, filters & export" },
  { id: "picsum-agent", label: "Picsum Gallery", icon: ImageIcon, category: "media", description: "High-resolution placeholder photography & aesthetic gallery" },
  { id: "media-downloader", label: "Media Downloader", icon: Download, category: "media", description: "Streamlined asset downloader for project images & files" },
  { id: "doc-previewer", label: "Document Previewer", icon: FileText, category: "media", description: "Rich markdown, PDF & document preview renderer" },
  { id: "voice-synth", label: "Voice Studio", icon: Volume2, category: "music", description: "Text-to-speech voice generator & audio frequency visualizer" },
  { id: "music", label: "Ambient Beats Player", icon: Music, category: "music", description: "Lo-fi background radio & ambient study audio visualizer" },
  { id: "jokes", label: "Live Jokes", icon: Laugh, category: "media", description: "Curated developer & programming jokes collection" },
  { id: "gaming", label: "Arcade Games", icon: Gamepad2, category: "media", description: "Retro browser games, arcade physics & coding minigames" },
  { id: "cp", label: "Competitive Coding", icon: Trophy, category: "dev", description: "Algorithm challenges, LeetCode style problems & sandbox testing" },
  { id: "share", label: "File Share QR Hub", icon: Share2, category: "dev", description: "Instant local file sharing & mobile QR code access hub" },
  { id: "trending-repos", label: "Trending Repos", icon: TrendingUp, category: "dev", description: "Trending open-source GitHub repositories & tech stacks" },
  { id: "currency-agent", label: "Currency Exchange", icon: DollarSign, category: "dev", description: "Realtime foreign exchange rates & currency conversion" },
  { id: "crypto-agent", label: "Crypto Market", icon: Coins, category: "dev", description: "Live cryptocurrency prices, market caps & 24h performance" },
  { id: "qrcode-agent", label: "QR Code Generator", icon: QrCode, category: "dev", description: "Customizable QR codes with colors, branding & instant download" },
  { id: "mockdata-agent", label: "Mock Data Generator", icon: FileCode2, category: "dev", description: "Generate realistic JSON, CSV & SQL mock data datasets" },
  { id: "airquality-agent", label: "Air Quality & Solar", icon: Sun, category: "web", description: "Atmospheric Air Quality Index (AQI), UV index & solar radiation" },
  { id: "settings", label: "Studio Settings", icon: Settings, category: "core", description: "Studio layout, API keys, dark/light themes & preferences" }
];

// ============================================================================
// NEW EXPERIMENTAL LABS (KEPT IN LABS / MORE TOOLS MODAL, NOT CLOGGING MAIN BAR)
// ============================================================================
export const EXTENDED_LABS_TABS: TabItem[] = [
  { id: "load-benchmark", label: "Load & Stress Benchmark", icon: Flame, category: "new", description: "Real-time API load & stress testing, concurrency runner, latency percentiles & k6/autocannon exporter", badge: "Lab", badgeColor: "bg-amber-500/20 text-amber-300" },
  { id: "seo-studio", label: "SEO & Social Previews", icon: Share2, category: "new", description: "Interactive Google SERP, Twitter Cards & OpenGraph live feed simulator, Schema.org generator & sitemaps", badge: "Lab", badgeColor: "bg-cyan-500/20 text-cyan-300" },
  { id: "git-graph-studio", label: "Git Graph & Commits", icon: GitBranch, category: "new", description: "Visual branch commit graph tree, conventional commit builder, branch merging & changelog exporter", badge: "Lab", badgeColor: "bg-blue-500/20 text-blue-300" },
  { id: "json-schema-studio", label: "JSON Schema & Validator", icon: FileJson, category: "new", description: "Live JSON Schema Draft 2020-12 validator, automatic schema inference, synthetic mock generator & Zod exporter", badge: "Lab", badgeColor: "bg-emerald-500/20 text-emerald-300" },
  { id: "network-har-studio", label: "Network HAR & Waterfall", icon: Globe, category: "new", description: "HTTP Archive (HAR) inspector, network waterfalls, cURL-to-Fetch converter & latency injector", badge: "Lab", badgeColor: "bg-cyan-500/20 text-cyan-300" },
  { id: "tailwind-tokens-studio", label: "Tailwind Design Tokens", icon: Palette, category: "new", description: "Visual design system architect, 50-950 shade generator, WCAG contrast auditor & UI sandbox", badge: "Lab", badgeColor: "bg-pink-500/20 text-pink-300" },
  { id: "cicd-architect", label: "CI/CD & GitHub Actions", icon: GitFork, category: "new", description: "Automated pipeline architect, Docker build & Cloud Run deploy with dry-run simulator", badge: "Lab", badgeColor: "bg-emerald-500/20 text-emerald-300" },
  { id: "jwt-lab", label: "JWT & Crypto Lab", icon: Key, category: "new", description: "Interactive JSON Web Token debugger, SHA/HMAC hash suite & AES-GCM 256-bit cipher", badge: "Lab", badgeColor: "bg-purple-500/20 text-purple-300" },
  { id: "erd-studio", label: "Database ERD Architect", icon: Database, category: "new", description: "Interactive Entity Relationship Diagram (ERD) visual modeler, schema scanner & Drizzle ORM generator", badge: "Lab", badgeColor: "bg-blue-500/20 text-blue-300" },
  { id: "cron-studio", label: "Cron & Task Scheduler", icon: Clock, category: "new", description: "Visual cron expression builder, English translation engine, schedule forecaster & runner sandbox", badge: "Lab", badgeColor: "bg-amber-500/20 text-amber-300" },
  { id: "openapi-studio", label: "OpenAPI & Swagger", icon: FileCode2, category: "new", description: "Interactive OpenAPI 3.1 & Swagger visual architect, automated endpoint scanner & live API test bench", badge: "Lab", badgeColor: "bg-emerald-500/20 text-emerald-300" },
  { id: "stream-tester", label: "WebSocket & SSE Stream", icon: Radio, category: "new", description: "Realtime WebSocket (WSS) & Server-Sent Events (SSE) live connection tester & mock feed emulator", badge: "Lab", badgeColor: "bg-purple-500/20 text-purple-300" },
  { id: "mock-server", label: "Mock API Server", icon: Server, category: "new", description: "Configurable mock REST server with custom latency, status codes & webhook catcher", badge: "Lab", badgeColor: "bg-emerald-500/20 text-emerald-300" },
  { id: "perf-auditor", label: "Perf & Bundle Audit", icon: Gauge, category: "new", description: "Lighthouse-style code quality, bundle size, security & accessibility auditor", badge: "Lab", badgeColor: "bg-cyan-500/20 text-cyan-300" },
  { id: "docker-studio", label: "Docker & Compose", icon: Box, category: "new", description: "Multi-stage Dockerfile, docker-compose & devcontainer configuration architect", badge: "Lab", badgeColor: "bg-sky-500/20 text-sky-300" },
  { id: "graphql-studio", label: "GraphQL Explorer", icon: Orbit, category: "new", description: "Interactive GraphQL playground, schema introspection visualizer & query tester", badge: "Lab", badgeColor: "bg-pink-500/20 text-pink-300" },
  { id: "music-studio", label: "Piano & Drum Studio", icon: Music, category: "new", description: "Audio workstation with polyphonic piano & step sequencer", badge: "Lab", badgeColor: "bg-amber-500/20 text-amber-300" },
  { id: "piano", label: "Virtual Piano", icon: Music, category: "new", description: "8-voice polyphonic synthesizer piano with octave shifting & sustain", badge: "Lab", badgeColor: "bg-indigo-500/20 text-indigo-300" },
  { id: "drums", label: "16-Step Drum Machine", icon: Sparkles, category: "new", description: "Programmable 4-voice rhythm beatmaker with BPM swing & live loop", badge: "Lab", badgeColor: "bg-emerald-500/20 text-emerald-300" }
];

export const WORKSPACE_TABS: TabItem[] = [...REAL_WORKSPACE_TABS, ...EXTENDED_LABS_TABS];

export const REAL_TAB_IDS = new Set(REAL_WORKSPACE_TABS.map(t => t.id));

export const CATEGORY_DEFINITIONS: { id: ToolCategory | "all"; label: string; icon: string }[] = [
  { id: "all", label: "All Real Tools", icon: "✨" },
  { id: "core", label: "Core Dev", icon: "💻" },
  { id: "web", label: "Web & Cloud", icon: "🌐" },
  { id: "ai", label: "AI & Agents", icon: "🤖" },
  { id: "dev", label: "Utilities & Data", icon: "🛠️" },
  { id: "media", label: "Media & Audio", icon: "🎨" }
];

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

  const [activeCategoryFilter, setActiveCategoryFilter] = useState<ToolCategory | "all">("all");
  const [isFullMenuOpen, setIsFullMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const scrollContainerRef = useRef<HTMLDivElement>(null);

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

  // Smooth mouse-wheel horizontal scrolling support
  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;

    const onWheel = (e: WheelEvent) => {
      if (e.deltaY !== 0) {
        e.preventDefault();
        el.scrollLeft += e.deltaY;
      }
    };

    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  // Smooth scroll tabs row via chevrons
  const handleScroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const scrollOffset = direction === "left" ? -280 : 280;
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
  }, [activeTab, activeCategoryFilter]);

  // Main Toolbar Tabs: ALWAYS ONLY the REAL most used features (Filtered by category if selected)
  // The new ones are NOT in the main bar!
  const displayedBarTabs = useMemo(() => {
    if (activeCategoryFilter === "all") {
      return REAL_WORKSPACE_TABS;
    }
    return REAL_WORKSPACE_TABS.filter(t => t.category === activeCategoryFilter);
  }, [activeCategoryFilter]);

  // If the user opened an extended lab (new tool) from the More Tools menu,
  // display it as an active temporary tab in the bar with a close button!
  const activeSecondaryTab = useMemo(() => {
    if (!REAL_TAB_IDS.has(activeTab)) {
      return EXTENDED_LABS_TABS.find(t => t.id === activeTab) || null;
    }
    return null;
  }, [activeTab]);

  // Filter tabs for the Full Menu Modal (Search across all tabs)
  const modalFilteredTabs = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return WORKSPACE_TABS.filter(tab => {
      const matchesSearch = !q ||
        tab.label.toLowerCase().includes(q) ||
        tab.description.toLowerCase().includes(q) ||
        tab.id.toLowerCase().includes(q) ||
        tab.category.toLowerCase().includes(q) ||
        (tab.badge && tab.badge.toLowerCase().includes(q));
      return matchesSearch;
    });
  }, [searchQuery]);

  return (
    <>
      {/* EXECUTIVE MAIN WORKSPACE TOOLBAR */}
      <div className={`h-10 border-b px-2 flex items-center justify-between shrink-0 z-20 transition-colors w-full relative select-none ${
        isDark ? "border-zinc-800 bg-[#121214] text-white" : "border-slate-200 bg-white text-slate-900"
      }`}>
        
        {/* Left Section: Scroll controls & Real Feature Tabs */}
        <div className="flex-1 min-w-0 flex items-center relative overflow-hidden pr-2">
          
          {/* Scroll Left Button */}
          <button
            onClick={() => handleScroll("left")}
            className={`p-1 mr-1 rounded-md border shrink-0 transition-colors cursor-pointer z-10 ${
              isDark ? "border-zinc-800 bg-zinc-900/90 text-zinc-400 hover:text-white" : "border-slate-200 bg-slate-100 text-slate-600 hover:text-slate-900"
            }`}
            title="Scroll Real Features Left"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>

          {/* Quick Category Filter Selector for Real Features */}
          <div className="flex items-center gap-1 shrink-0 mr-1.5 border-r pr-1.5 border-zinc-700/50">
            <select
              value={activeCategoryFilter}
              onChange={(e) => setActiveCategoryFilter(e.target.value as any)}
              className={`text-[11px] font-semibold px-2 py-0.5 rounded border focus:outline-none cursor-pointer transition-colors ${
                isDark
                  ? "bg-zinc-900 border-zinc-800 text-indigo-400 hover:bg-zinc-800 hover:border-zinc-700"
                  : "bg-slate-100 border-slate-200 text-indigo-600 hover:bg-slate-200"
              }`}
              title="Filter Real Features by Category"
            >
              {CATEGORY_DEFINITIONS.map(cat => (
                <option key={cat.id} value={cat.id} className={isDark ? "bg-zinc-900 text-white" : "bg-white text-slate-800"}>
                  {cat.icon} {cat.label}
                </option>
              ))}
            </select>
          </div>

          {/* Horizontally Scrollable Real Feature Tabs Row */}
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
                      ? "bg-indigo-600 text-white font-semibold shadow-xs"
                      : (isDark
                          ? "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/70"
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

            {/* If an extended lab was opened from the menu, show it temporarily with a close button */}
            {activeSecondaryTab && (
              <div className="flex items-center gap-0.5 shrink-0 ml-1 pl-1 border-l border-amber-500/40">
                <button
                  data-active="true"
                  onClick={() => setActiveTab(activeSecondaryTab.id)}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-l-md text-xs font-semibold tracking-normal transition-all cursor-pointer bg-gradient-to-r from-amber-600 to-amber-700 text-white shadow-xs"
                  title={`${activeSecondaryTab.label}: ${activeSecondaryTab.description}`}
                >
                  <activeSecondaryTab.icon className="w-3.5 h-3.5 shrink-0 text-white" />
                  <span className="whitespace-nowrap">{activeSecondaryTab.label}</span>
                  <span className="px-1 rounded text-[9px] bg-black/30 text-amber-200 font-bold uppercase">
                    Lab
                  </span>
                </button>
                <button
                  onClick={() => setActiveTab("editor")}
                  className="p-1 rounded-r-md bg-amber-700 hover:bg-amber-800 text-white/90 hover:text-white cursor-pointer transition-colors"
                  title="Close Lab (Return to Code Editor)"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          {/* Scroll Right Button */}
          <button
            onClick={() => handleScroll("right")}
            className={`p-1 ml-1 rounded-md border shrink-0 transition-colors cursor-pointer z-10 ${
              isDark ? "border-zinc-800 bg-zinc-900/90 text-zinc-400 hover:text-white" : "border-slate-200 bg-slate-100 text-slate-600 hover:text-slate-900"
            }`}
            title="Scroll Real Features Right"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>

          {/* "+ Dev Labs" / More Tools Button (Access new developer labs without crowding main bar) */}
          <button
            onClick={() => setIsFullMenuOpen(true)}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer shrink-0 ml-1.5 border shadow-2xs ${
              isDark
                ? "border-amber-500/30 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20"
                : "border-amber-300 bg-amber-50 text-amber-800 hover:bg-amber-100"
            }`}
            title="Open Specialized Developer Labs & Full Module Catalog"
          >
            <LayoutGrid className="w-3.5 h-3.5 text-amber-400" />
            <span className="whitespace-nowrap">+ Dev Labs</span>
            <span className={`text-[9px] font-mono px-1 rounded font-bold ${
              isDark ? "bg-amber-900/60 text-amber-200" : "bg-amber-200 text-amber-900"
            }`}>
              {EXTENDED_LABS_TABS.length}
            </span>
          </button>
        </div>

        {/* Right Section: Action buttons & Stats */}
        <div className={`shrink-0 flex items-center gap-2 pl-2 border-l ${
          isDark ? "border-zinc-800 bg-[#121214]" : "border-slate-200 bg-white"
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

      {/* DEV LABS & ALL TOOLS MODAL (Mounted in document.body) */}
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
                <div className="p-2 rounded-xl bg-gradient-to-tr from-amber-600 to-indigo-600 text-white shadow-md">
                  <LayoutGrid className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-bold tracking-tight">Specialized Developer Labs & Tools</h2>
                    <span className="text-xs px-2 py-0.5 rounded-full font-mono font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      {EXTENDED_LABS_TABS.length} New Labs
                    </span>
                  </div>
                  <p className={`text-xs ${isDark ? "text-zinc-400" : "text-slate-500"}`}>
                    All 58 core features stay in your main toolbar. Launch any experimental developer lab here without cluttering the bar.
                  </p>
                </div>
              </div>

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

            {/* Search Input */}
            <div className={`p-4 border-b shrink-0 ${
              isDark ? "border-zinc-800 bg-[#16161a]" : "border-slate-100 bg-white"
            }`}>
              <div className="relative">
                <Search className={`w-4 h-4 absolute left-3.5 top-3 ${isDark ? "text-zinc-400" : "text-slate-400"}`} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search labs & tools (e.g. stress test, git graph, json schema, websocket, docker)..."
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
            </div>

            {/* Tools Grid Area */}
            <div className={`p-4 overflow-y-auto flex-1 ${isDark ? "bg-[#141418]" : "bg-slate-50/50"}`}>
              {/* Specialized Labs Section */}
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-2.5">
                  <Flame className="w-4 h-4 text-amber-400" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400">
                    New Developer Labs ({EXTENDED_LABS_TABS.length})
                  </h3>
                  <span className={`text-[10px] ${isDark ? "text-zinc-500" : "text-slate-400"}`}>
                    — Isolated from main bar
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
                  {EXTENDED_LABS_TABS.filter(t => {
                    const q = searchQuery.toLowerCase().trim();
                    return !q || t.label.toLowerCase().includes(q) || t.description.toLowerCase().includes(q) || t.id.toLowerCase().includes(q);
                  }).map(tab => {
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
                                ? "bg-amber-950/40 border-amber-500/80 shadow-md shadow-amber-500/10 ring-1 ring-amber-500/30"
                                : "bg-amber-50/80 border-amber-500 shadow-md shadow-amber-500/10 ring-1 ring-amber-500/30")
                            : (isDark
                                ? "bg-zinc-900/60 border-zinc-800 hover:border-amber-500/50 hover:bg-zinc-800/80"
                                : "bg-white border-slate-200 hover:border-amber-400 hover:bg-slate-50")
                        }`}
                      >
                        <div className="flex items-start gap-2.5">
                          <div className={`p-2 rounded-lg shrink-0 transition-colors ${
                            isActive
                              ? "bg-amber-600 text-white"
                              : isDark
                              ? "bg-zinc-800 text-amber-400 group-hover:bg-amber-600 group-hover:text-white"
                              : "bg-amber-50 text-amber-600 group-hover:bg-amber-600 group-hover:text-white"
                          }`}>
                            <TabIcon className="w-4 h-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-xs truncate group-hover:text-amber-400 transition-colors">
                                {tab.label}
                              </span>
                              <span className="px-1 py-0.2 rounded text-[9px] font-bold bg-amber-500/20 text-amber-300">
                                Lab
                              </span>
                            </div>
                            <span className={`text-[10px] font-mono capitalize block ${
                              isDark ? "text-zinc-500" : "text-slate-400"
                            }`}>
                              Developer Lab
                            </span>
                          </div>
                          {isActive && (
                            <span className="p-1 rounded-full bg-amber-500 text-white shrink-0 shadow-xs" title="Currently Open">
                              <Check className="w-3 h-3" />
                            </span>
                          )}
                        </div>

                        <p className={`text-[11px] leading-relaxed mt-2 line-clamp-2 ${
                          isDark ? "text-zinc-400" : "text-slate-600"
                        }`}>
                          {tab.description}
                        </p>

                        <div className={`mt-3 pt-2 border-t flex items-center justify-between text-[10px] ${
                          isDark ? "border-zinc-800/80 text-zinc-500" : "border-slate-100 text-slate-400"
                        }`}>
                          <span className="flex items-center gap-1 font-medium">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                            <span>Interactive Lab</span>
                          </span>
                          <span className="text-amber-400 font-semibold group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
                            Launch Lab →
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Complete Catalog Section if user is searching */}
              {searchQuery && (
                <div className="mt-6 pt-4 border-t border-zinc-800/60">
                  <div className="flex items-center gap-2 mb-2.5">
                    <Sparkles className="w-4 h-4 text-indigo-400" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-400">
                      All Matching Features ({modalFilteredTabs.length})
                    </h3>
                  </div>
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
                          className={`p-3 rounded-xl border flex flex-col justify-between transition-all cursor-pointer text-left group ${
                            isActive
                              ? "bg-indigo-950/40 border-indigo-500/80 shadow-md ring-1 ring-indigo-500/30"
                              : (isDark ? "bg-zinc-900/60 border-zinc-800 hover:border-zinc-700" : "bg-white border-slate-200 hover:border-slate-300")
                          }`}
                        >
                          <div className="flex items-start gap-2.5">
                            <div className={`p-2 rounded-lg shrink-0 ${
                              isActive ? "bg-indigo-600 text-white" : (isDark ? "bg-zinc-800 text-indigo-400" : "bg-indigo-50 text-indigo-600")
                            }`}>
                              <TabIcon className="w-4 h-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <span className="font-bold text-xs truncate block group-hover:text-indigo-400">
                                {tab.label}
                              </span>
                              <span className={`text-[10px] capitalize ${isDark ? "text-zinc-500" : "text-slate-400"}`}>
                                {tab.category}
                              </span>
                            </div>
                          </div>
                          <p className={`text-[11px] mt-2 line-clamp-2 ${isDark ? "text-zinc-400" : "text-slate-600"}`}>
                            {tab.description}
                          </p>
                        </div>
                      );
                    })}
                  </div>
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
