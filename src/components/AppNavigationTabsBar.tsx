import React from "react";
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
  Database,
  Flame,
  Settings,
  Mail,
  Youtube,
  Calculator,
  ImageIcon,
  Sparkles,
  Zap,
  Bot,
  Wand2,
  Languages,
  Share2,
  TrendingUp,
  CloudSun,
  HelpCircle,
  Video,
  FileText,
  Edit3,
  Laugh,
  Activity,
  Brain,
  Terminal,
  Volume2,
  DollarSign,
  QrCode,
  Rocket,
  Globe2,
  MapPin,
  Coins,
  FileCode2,
  Dog,
  HelpCircle as QuizIcon,
  Building2,
  Quote,
  Camera,
  Wind,
  Calendar,
  BookMarked,
  Newspaper,
  ShieldCheck,
  Regex as RegexIcon,
  GitCompare,
  Server,
  Box,
  GitBranch,
  FileJson,
  Key,
  Clock,
  Radio,
  Orbit,
  GitFork
} from "lucide-react";

interface AppNavigationTabsBarProps {
  activeTab: string;
  setActiveTab: (tab: any) => void;
  theme: "light" | "dark" | string;
  filesCount: number;
  actionsCount: number;
}

export const AppNavigationTabsBar: React.FC<AppNavigationTabsBarProps> = ({
  activeTab,
  setActiveTab,
  theme,
  filesCount,
  actionsCount
}) => {
  const isDark = theme !== "light";

  return (
    <div className={`h-[45px] border-b px-4 flex items-center justify-between shrink-0 shadow-xs z-10 transition-all ${
      isDark ? "border-zinc-800 bg-[#1e1e20] text-white" : "border-slate-200 bg-white"
    }`}>
      <div className="flex gap-1 overflow-x-auto max-w-full scrollbar-none py-1">
        <button
          onClick={() => setActiveTab("editor")}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold tracking-wide transition-all cursor-pointer shrink-0 touch-press ${
            activeTab === "editor"
              ? (isDark ? "bg-zinc-800 text-white border border-zinc-700 neon-border-selected" : "bg-slate-100 text-slate-800 border border-slate-200 neon-border-light font-bold")
              : (isDark ? "text-zinc-400 hover:text-white hover:bg-zinc-900/50 glow-indigo-hover" : "text-slate-500 hover:text-slate-800 hover:bg-slate-50 glow-indigo-hover")
          }`}
        >
          <Code2 className="w-3.5 h-3.5 text-indigo-500" />
          Code Editor
        </button>
        <button
          onClick={() => setActiveTab("preview")}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold tracking-wide transition-all cursor-pointer shrink-0 touch-press ${
            activeTab === "preview"
              ? (isDark ? "bg-zinc-800 text-white border border-zinc-700 neon-border-selected" : "bg-slate-100 text-slate-800 border border-slate-200 neon-border-light font-bold")
              : (isDark ? "text-zinc-400 hover:text-white hover:bg-zinc-900/50 glow-emerald-hover" : "text-slate-500 hover:text-slate-800 hover:bg-slate-50 glow-emerald-hover")
          }`}
        >
          <Globe className="w-3.5 h-3.5 text-emerald-500" />
          Universal Preview
        </button>
        <button
          onClick={() => setActiveTab("agents")}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold tracking-wide transition-all cursor-pointer shrink-0 touch-press ${
            activeTab === "agents"
              ? (isDark ? "bg-zinc-800 text-white border border-zinc-700 neon-border-selected" : "bg-slate-100 text-slate-800 border border-slate-200 neon-border-light font-bold")
              : (isDark ? "text-zinc-400 hover:text-white hover:bg-zinc-900/50 glow-indigo-hover" : "text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 glow-indigo-hover")
          }`}
        >
          <Cpu className="w-3.5 h-3.5 text-indigo-500 animate-pulse" />
          Agents Ecosystem
        </button>
        <button
          onClick={() => setActiveTab("skills")}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold tracking-wide transition-all cursor-pointer shrink-0 touch-press ${
            activeTab === "skills"
              ? (isDark ? "bg-indigo-600 text-white border border-indigo-500 shadow-xs" : "bg-indigo-600 text-white font-bold shadow-xs")
              : (isDark ? "text-indigo-400 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20" : "text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200")
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          Agent Skills & Tools
          <span className="px-1 py-0.2 text-[8px] bg-indigo-500 text-white rounded font-extrabold uppercase">
            v2.0
          </span>
        </button>
        <button
          onClick={() => setActiveTab("study")}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-[11px] font-bold tracking-wide transition-all cursor-pointer shrink-0 shadow-xs touch-press ${
            activeTab === "study"
              ? "bg-amber-500 text-white shadow-amber-500/30 scale-102"
              : (isDark ? "text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20" : "text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200")
          }`}
        >
          <GraduationCap className="w-3.5 h-3.5" />
          Study Agent
          <span className="px-1 py-0.2 text-[8px] bg-amber-600 text-white rounded font-extrabold uppercase">
            Docs & AI
          </span>
        </button>
        <button
          onClick={() => setActiveTab("photos")}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-[11px] font-bold tracking-wide transition-all cursor-pointer shrink-0 shadow-xs touch-press ${
            activeTab === "photos"
              ? "bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-indigo-500/30 scale-102"
              : (isDark ? "text-violet-400 bg-violet-500/10 hover:bg-violet-500/20 border border-violet-500/20" : "text-violet-700 bg-violet-50 hover:bg-violet-100 border border-violet-200")
          }`}
        >
          <Palette className="w-3.5 h-3.5 text-cyan-400" />
          Image Studio
          <span className="px-1 py-0.2 text-[8px] bg-gradient-to-r from-violet-500 to-cyan-500 text-white rounded font-extrabold uppercase">
            OpenRouter
          </span>
        </button>
        <button
          onClick={() => setActiveTab("map")}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-[11px] font-bold tracking-wide transition-all cursor-pointer shrink-0 shadow-xs touch-press ${
            activeTab === "map"
              ? "bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-cyan-500/30 scale-102"
              : (isDark ? "text-cyan-400 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/20" : "text-cyan-700 bg-cyan-50 hover:bg-cyan-100 border border-cyan-200")
          }`}
        >
          <Compass className="w-3.5 h-3.5 text-cyan-400 animate-spin-slow" />
          Map Viewer
          <span className="px-1 py-0.2 text-[8px] bg-cyan-600 text-white rounded font-extrabold uppercase">
            AI Maps
          </span>
        </button>
        <button
          onClick={() => setActiveTab("story")}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-[11px] font-bold tracking-wide transition-all cursor-pointer shrink-0 shadow-xs touch-press ${
            activeTab === "story"
              ? "bg-gradient-to-r from-amber-500 to-rose-600 text-white shadow-amber-500/30 scale-102"
              : (isDark ? "text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20" : "text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200")
          }`}
        >
          <BookOpen className="w-3.5 h-3.5 text-amber-400" />
          Story Maker
          <span className="px-1 py-0.2 text-[8px] bg-amber-600 text-white rounded font-extrabold uppercase">
            Novel AI
          </span>
        </button>
        <button
          onClick={() => setActiveTab("dictionary")}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-[11px] font-bold tracking-wide transition-all cursor-pointer shrink-0 shadow-xs touch-press ${
            activeTab === "dictionary"
              ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-emerald-500/30 scale-102"
              : (isDark ? "text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20" : "text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200")
          }`}
        >
          <Book className="w-3.5 h-3.5 text-emerald-400" />
          Dictionary
          <span className="px-1 py-0.2 text-[8px] bg-emerald-600 text-white rounded font-extrabold uppercase">
            Lexicon
          </span>
        </button>
        <button
          onClick={() => setActiveTab("gaming")}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-[11px] font-bold tracking-wide transition-all cursor-pointer shrink-0 shadow-xs touch-press ${
            activeTab === "gaming"
              ? "bg-gradient-to-r from-purple-600 to-rose-600 text-white shadow-purple-500/30 scale-102"
              : (isDark ? "text-purple-400 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/20" : "text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200")
          }`}
        >
          <Gamepad2 className="w-3.5 h-3.5 text-purple-400" />
          Gaming Arcade
          <span className="px-1 py-0.2 text-[8px] bg-purple-600 text-white rounded font-extrabold uppercase">
            Mini Games
          </span>
        </button>
        <button
          onClick={() => setActiveTab("music")}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold tracking-wide transition-all cursor-pointer shrink-0 touch-press ${
            activeTab === "music"
              ? (isDark ? "bg-zinc-800 text-white border border-zinc-700 neon-border-selected" : "bg-slate-100 text-slate-800 border border-slate-200 neon-border-light font-bold")
              : (isDark ? "text-zinc-400 hover:text-white hover:bg-zinc-900/50 glow-purple-hover" : "text-slate-500 hover:text-violet-600 hover:bg-violet-50 glow-purple-hover")
          }`}
        >
          <Music className="w-3.5 h-3.5 text-violet-500" />
          Song Player
        </button>
        <button
          onClick={() => setActiveTab("music-studio")}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold tracking-wide transition-all cursor-pointer shrink-0 touch-press ${
            activeTab === "music-studio" || activeTab === "piano" || activeTab === "drums"
              ? (isDark ? "bg-indigo-600 text-white border border-indigo-400 font-bold shadow-md shadow-indigo-600/30" : "bg-indigo-50 text-indigo-700 border border-indigo-300 font-bold")
              : (isDark ? "text-zinc-400 hover:text-white hover:bg-zinc-900/50 glow-purple-hover" : "text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 glow-purple-hover")
          }`}
          title="Interactive Polyphonic Piano & 16-Step Drum Machine"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          Piano & Drum Studio
          <span className="px-1 py-0.2 text-[8px] bg-amber-500 text-black font-extrabold rounded uppercase">
            New
          </span>
        </button>
        <button
          onClick={() => setActiveTab("search")}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold tracking-wide transition-all cursor-pointer shrink-0 touch-press ${
            activeTab === "search"
              ? (isDark ? "bg-zinc-800 text-white border border-zinc-700 neon-border-selected" : "bg-slate-100 text-slate-800 border border-slate-200 neon-border-light font-bold")
              : (isDark ? "text-zinc-400 hover:text-white hover:bg-zinc-900/50 glow-cyan-hover" : "text-slate-500 hover:text-blue-600 hover:bg-blue-50 glow-cyan-hover")
          }`}
        >
          <Search className="w-3.5 h-3.5 text-blue-500" />
          Google Search
        </button>
        <button
          onClick={() => setActiveTab("github")}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold tracking-wide transition-all cursor-pointer shrink-0 touch-press ${
            activeTab === "github"
              ? (isDark ? "bg-zinc-800 text-white border border-zinc-700 neon-border-selected" : "bg-slate-100 text-slate-800 border border-slate-200 neon-border-light font-bold")
              : (isDark ? "text-zinc-400 hover:text-white hover:bg-zinc-900/50 glow-emerald-hover" : "text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 glow-emerald-hover")
          }`}
        >
          <Github className="w-3.5 h-3.5 text-slate-400" />
          GitHub Sync
        </button>
        <button
          onClick={() => setActiveTab("firebase")}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-[11px] font-bold tracking-wide transition-all cursor-pointer shrink-0 shadow-xs touch-press ${
            activeTab === "firebase"
              ? "bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-orange-500/30 scale-102"
              : (isDark ? "text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30" : "text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200")
          }`}
        >
          <Flame className="w-3.5 h-3.5 text-amber-500" />
          Firebase DB
          <span className="px-1 py-0.2 text-[8px] bg-amber-600 text-white rounded font-extrabold uppercase">
            Firestore
          </span>
        </button>
        <button
          onClick={() => setActiveTab("supabase")}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold tracking-wide transition-all cursor-pointer shrink-0 touch-press ${
            activeTab === "supabase"
              ? (isDark ? "bg-zinc-800 text-white border border-zinc-700 neon-border-selected" : "bg-slate-100 text-slate-800 border border-slate-200 neon-border-light font-bold")
              : (isDark ? "text-zinc-400 hover:text-white hover:bg-zinc-900/50 glow-emerald-hover" : "text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 glow-emerald-hover")
          }`}
        >
          <Database className="w-3.5 h-3.5 text-emerald-500" />
          Supabase DB
        </button>
        <button
          onClick={() => setActiveTab("deep-research")}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold tracking-wide transition-all cursor-pointer shrink-0 touch-press ${
            activeTab === "deep-research"
              ? (isDark ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 font-bold" : "bg-indigo-100 text-indigo-900 border border-indigo-300 font-bold")
              : (isDark ? "text-zinc-400 hover:text-white hover:bg-zinc-900/50" : "text-slate-500 hover:text-indigo-600 hover:bg-indigo-50")
          }`}
        >
          <Brain className="w-3.5 h-3.5 text-indigo-400" />
          Deep Research
        </button>
        <button
          onClick={() => setActiveTab("code-analyzer")}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold tracking-wide transition-all cursor-pointer shrink-0 touch-press ${
            activeTab === "code-analyzer"
              ? (isDark ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold" : "bg-emerald-100 text-emerald-900 border border-emerald-300 font-bold")
              : (isDark ? "text-zinc-400 hover:text-white hover:bg-zinc-900/50" : "text-slate-500 hover:text-emerald-600 hover:bg-emerald-50")
          }`}
        >
          <Zap className="w-3.5 h-3.5 text-emerald-400" />
          Code Auditor
        </button>
        <button
          onClick={() => setActiveTab("voice-synth")}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold tracking-wide transition-all cursor-pointer shrink-0 touch-press ${
            activeTab === "voice-synth"
              ? (isDark ? "bg-purple-500/20 text-purple-300 border border-purple-500/40 font-bold" : "bg-purple-100 text-purple-900 border border-purple-300 font-bold")
              : (isDark ? "text-zinc-400 hover:text-white hover:bg-zinc-900/50" : "text-slate-500 hover:text-purple-600 hover:bg-purple-50")
          }`}
        >
          <Volume2 className="w-3.5 h-3.5 text-purple-400" />
          Voice Studio
        </button>
        <button
          onClick={() => setActiveTab("translator")}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold tracking-wide transition-all cursor-pointer shrink-0 touch-press ${
            activeTab === "translator"
              ? (isDark ? "bg-blue-500/20 text-blue-300 border border-blue-500/40 font-bold" : "bg-blue-100 text-blue-900 border border-blue-300 font-bold")
              : (isDark ? "text-zinc-400 hover:text-white hover:bg-zinc-900/50" : "text-slate-500 hover:text-blue-600 hover:bg-blue-50")
          }`}
        >
          <Languages className="w-3.5 h-3.5 text-blue-400" />
          AI Translator
        </button>
        <button
          onClick={() => setActiveTab("content-creator")}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold tracking-wide transition-all cursor-pointer shrink-0 touch-press ${
            activeTab === "content-creator"
              ? (isDark ? "bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold" : "bg-amber-100 text-amber-900 border border-amber-300 font-bold")
              : (isDark ? "text-zinc-400 hover:text-white hover:bg-zinc-900/50" : "text-slate-500 hover:text-amber-600 hover:bg-amber-50")
          }`}
        >
          <Wand2 className="w-3.5 h-3.5 text-amber-400" />
          Content Engine
        </button>
        <button
          onClick={() => setActiveTab("currency-agent")}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold tracking-wide transition-all cursor-pointer shrink-0 touch-press ${
            activeTab === "currency-agent"
              ? (isDark ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold" : "bg-emerald-100 text-emerald-900 border border-emerald-300 font-bold")
              : (isDark ? "text-zinc-400 hover:text-white hover:bg-zinc-900/50" : "text-slate-500 hover:text-emerald-600 hover:bg-emerald-50")
          }`}
        >
          <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
          Currency Exchange
        </button>
        <button
          onClick={() => setActiveTab("qrcode-agent")}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold tracking-wide transition-all cursor-pointer shrink-0 touch-press ${
            activeTab === "qrcode-agent"
              ? (isDark ? "bg-violet-500/20 text-violet-300 border border-violet-500/40 font-bold" : "bg-violet-100 text-violet-900 border border-violet-300 font-bold")
              : (isDark ? "text-zinc-400 hover:text-white hover:bg-zinc-900/50" : "text-slate-500 hover:text-violet-600 hover:bg-violet-50")
          }`}
        >
          <QrCode className="w-3.5 h-3.5 text-violet-400" />
          QR Code Generator
        </button>
        <button
          onClick={() => setActiveTab("wiki-agent")}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold tracking-wide transition-all cursor-pointer shrink-0 touch-press ${
            activeTab === "wiki-agent"
              ? (isDark ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold" : "bg-cyan-100 text-cyan-900 border border-cyan-300 font-bold")
              : (isDark ? "text-zinc-400 hover:text-white hover:bg-zinc-900/50" : "text-slate-500 hover:text-cyan-600 hover:bg-cyan-50")
          }`}
        >
          <Globe2 className="w-3.5 h-3.5 text-cyan-400" />
          Wikipedia Explorer
        </button>
        <button
          onClick={() => setActiveTab("nasa-agent")}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold tracking-wide transition-all cursor-pointer shrink-0 touch-press ${
            activeTab === "nasa-agent"
              ? (isDark ? "bg-blue-500/20 text-blue-300 border border-blue-500/40 font-bold" : "bg-blue-100 text-blue-900 border border-blue-300 font-bold")
              : (isDark ? "text-zinc-400 hover:text-white hover:bg-zinc-900/50" : "text-slate-500 hover:text-blue-600 hover:bg-blue-50")
          }`}
        >
          <Rocket className="w-3.5 h-3.5 text-blue-400" />
          NASA Space API
        </button>
        <button
          onClick={() => setActiveTab("earth-space-agent")}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold tracking-wide transition-all cursor-pointer shrink-0 touch-press ${
            activeTab === "earth-space-agent"
              ? "bg-gradient-to-r from-sky-500 to-indigo-600 text-white shadow-sm font-bold"
              : (isDark ? "text-sky-400 bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/20" : "text-sky-700 bg-sky-50 hover:bg-sky-100 border border-sky-200")
          }`}
        >
          <Globe className="w-3.5 h-3.5 text-sky-400" />
          Earth & Orbit Telemetry
          <span className="px-1 py-0.2 text-[8px] bg-emerald-600 text-white rounded font-extrabold uppercase">
            Live
          </span>
        </button>
        <button
          onClick={() => setActiveTab("ipgeo-agent")}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold tracking-wide transition-all cursor-pointer shrink-0 touch-press ${
            activeTab === "ipgeo-agent"
              ? (isDark ? "bg-teal-500/20 text-teal-300 border border-teal-500/40 font-bold" : "bg-teal-100 text-teal-900 border border-teal-300 font-bold")
              : (isDark ? "text-zinc-400 hover:text-white hover:bg-zinc-900/50" : "text-slate-500 hover:text-teal-600 hover:bg-teal-50")
          }`}
        >
          <MapPin className="w-3.5 h-3.5 text-teal-400" />
          IP Geolocation
        </button>
        <button
          onClick={() => setActiveTab("crypto-agent")}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold tracking-wide transition-all cursor-pointer shrink-0 touch-press ${
            activeTab === "crypto-agent"
              ? (isDark ? "bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold" : "bg-amber-100 text-amber-900 border border-amber-300 font-bold")
              : (isDark ? "text-zinc-400 hover:text-white hover:bg-zinc-900/50" : "text-slate-500 hover:text-amber-600 hover:bg-amber-50")
          }`}
        >
          <Coins className="w-3.5 h-3.5 text-amber-400" />
          Crypto Market
        </button>
        <button
          onClick={() => setActiveTab("mockdata-agent")}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold tracking-wide transition-all cursor-pointer shrink-0 touch-press ${
            activeTab === "mockdata-agent"
              ? (isDark ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 font-bold" : "bg-indigo-100 text-indigo-900 border border-indigo-300 font-bold")
              : (isDark ? "text-zinc-400 hover:text-white hover:bg-zinc-900/50" : "text-slate-500 hover:text-indigo-600 hover:bg-indigo-50")
          }`}
        >
          <FileCode2 className="w-3.5 h-3.5 text-indigo-400" />
          Mock Data Generator
        </button>
        <button
          onClick={() => setActiveTab("animal-agent")}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold tracking-wide transition-all cursor-pointer shrink-0 touch-press ${
            activeTab === "animal-agent"
              ? (isDark ? "bg-rose-500/20 text-rose-300 border border-rose-500/40 font-bold" : "bg-rose-100 text-rose-900 border border-rose-300 font-bold")
              : (isDark ? "text-zinc-400 hover:text-white hover:bg-zinc-900/50" : "text-slate-500 hover:text-rose-600 hover:bg-rose-50")
          }`}
        >
          <Dog className="w-3.5 h-3.5 text-rose-400" />
          Cute Animals API
        </button>
        <button
          onClick={() => setActiveTab("opentrivia-agent")}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold tracking-wide transition-all cursor-pointer shrink-0 touch-press ${
            activeTab === "opentrivia-agent"
              ? (isDark ? "bg-purple-500/20 text-purple-300 border border-purple-500/40 font-bold" : "bg-purple-100 text-purple-900 border border-purple-300 font-bold")
              : (isDark ? "text-zinc-400 hover:text-white hover:bg-zinc-900/50" : "text-slate-500 hover:text-purple-600 hover:bg-purple-50")
          }`}
        >
          <QuizIcon className="w-3.5 h-3.5 text-purple-400" />
          Open Trivia Quiz
        </button>
        <button
          onClick={() => setActiveTab("countries-agent")}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold tracking-wide transition-all cursor-pointer shrink-0 touch-press ${
            activeTab === "countries-agent"
              ? (isDark ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold" : "bg-emerald-100 text-emerald-900 border border-emerald-300 font-bold")
              : (isDark ? "text-zinc-400 hover:text-white hover:bg-zinc-900/50" : "text-slate-500 hover:text-emerald-600 hover:bg-emerald-50")
          }`}
        >
          <Building2 className="w-3.5 h-3.5 text-emerald-400" />
          World Countries
        </button>
        <button
          onClick={() => setActiveTab("universities-agent")}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold tracking-wide transition-all cursor-pointer shrink-0 touch-press ${
            activeTab === "universities-agent"
              ? (isDark ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 font-bold" : "bg-indigo-100 text-indigo-900 border border-indigo-300 font-bold")
              : (isDark ? "text-zinc-400 hover:text-white hover:bg-zinc-900/50" : "text-slate-500 hover:text-indigo-600 hover:bg-indigo-50")
          }`}
        >
          <GraduationCap className="w-3.5 h-3.5 text-indigo-400" />
          Global Universities
        </button>
        <button
          onClick={() => setActiveTab("advice-agent")}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold tracking-wide transition-all cursor-pointer shrink-0 touch-press ${
            activeTab === "advice-agent"
              ? (isDark ? "bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold" : "bg-amber-100 text-amber-900 border border-amber-300 font-bold")
              : (isDark ? "text-zinc-400 hover:text-white hover:bg-zinc-900/50" : "text-slate-500 hover:text-amber-600 hover:bg-amber-50")
          }`}
        >
          <Quote className="w-3.5 h-3.5 text-amber-400" />
          Wisdom API
        </button>
        <button
          onClick={() => setActiveTab("picsum-agent")}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold tracking-wide transition-all cursor-pointer shrink-0 touch-press ${
            activeTab === "picsum-agent"
              ? (isDark ? "bg-pink-500/20 text-pink-300 border border-pink-500/40 font-bold" : "bg-pink-100 text-pink-900 border border-pink-300 font-bold")
              : (isDark ? "text-zinc-400 hover:text-white hover:bg-zinc-900/50" : "text-slate-500 hover:text-pink-600 hover:bg-pink-50")
          }`}
        >
          <Camera className="w-3.5 h-3.5 text-pink-400" />
          Stock Photos API
        </button>
        <button
          onClick={() => setActiveTab("books-agent")}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold tracking-wide transition-all cursor-pointer shrink-0 touch-press ${
            activeTab === "books-agent"
              ? (isDark ? "bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold" : "bg-amber-100 text-amber-900 border border-amber-300 font-bold")
              : (isDark ? "text-zinc-400 hover:text-white hover:bg-zinc-900/50" : "text-slate-500 hover:text-amber-600 hover:bg-amber-50")
          }`}
        >
          <BookMarked className="w-3.5 h-3.5 text-amber-400" />
          Books API
        </button>
        <button
          onClick={() => setActiveTab("airquality-agent")}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold tracking-wide transition-all cursor-pointer shrink-0 touch-press ${
            activeTab === "airquality-agent"
              ? (isDark ? "bg-teal-500/20 text-teal-300 border border-teal-500/40 font-bold" : "bg-teal-100 text-teal-900 border border-teal-300 font-bold")
              : (isDark ? "text-zinc-400 hover:text-white hover:bg-zinc-900/50" : "text-slate-500 hover:text-teal-600 hover:bg-teal-50")
          }`}
        >
          <Wind className="w-3.5 h-3.5 text-teal-400" />
          Air Quality API
        </button>
        <button
          onClick={() => setActiveTab("calendar-agent")}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold tracking-wide transition-all cursor-pointer shrink-0 touch-press ${
            activeTab === "calendar-agent"
              ? (isDark ? "bg-purple-500/20 text-purple-300 border border-purple-500/40 font-bold" : "bg-purple-100 text-purple-900 border border-purple-300 font-bold")
              : (isDark ? "text-zinc-400 hover:text-white hover:bg-zinc-900/50" : "text-slate-500 hover:text-purple-600 hover:bg-purple-50")
          }`}
        >
          <Calendar className="w-3.5 h-3.5 text-purple-400" />
          Google Calendar
        </button>
        <button
          onClick={() => setActiveTab("english-agent")}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold tracking-wide transition-all cursor-pointer shrink-0 touch-press ${
            activeTab === "english-agent"
              ? (isDark ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold" : "bg-emerald-100 text-emerald-900 border border-emerald-300 font-bold")
              : (isDark ? "text-zinc-400 hover:text-white hover:bg-zinc-900/50" : "text-slate-500 hover:text-emerald-600 hover:bg-emerald-50")
          }`}
        >
          <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
          English Learning
        </button>
        <button
          onClick={() => setActiveTab("news-agent")}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold tracking-wide transition-all cursor-pointer shrink-0 touch-press ${
            activeTab === "news-agent"
              ? (isDark ? "bg-rose-500/20 text-rose-300 border border-rose-500/40 font-bold" : "bg-rose-100 text-rose-900 border border-rose-300 font-bold")
              : (isDark ? "text-zinc-400 hover:text-white hover:bg-zinc-900/50" : "text-slate-500 hover:text-rose-600 hover:bg-rose-50")
          }`}
        >
          <Newspaper className="w-3.5 h-3.5 text-rose-400" />
          Global News
        </button>
        <button
          onClick={() => setActiveTab("code-doctor")}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold tracking-wide transition-all cursor-pointer shrink-0 touch-press ${
            activeTab === "code-doctor"
              ? (isDark ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 font-bold" : "bg-indigo-100 text-indigo-900 border border-indigo-300 font-bold")
              : (isDark ? "text-zinc-400 hover:text-white hover:bg-zinc-900/50" : "text-slate-500 hover:text-indigo-600 hover:bg-indigo-50")
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
          Code Health Doctor
        </button>
        <button
          onClick={() => setActiveTab("regex-playground")}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold tracking-wide transition-all cursor-pointer shrink-0 touch-press ${
            activeTab === "regex-playground"
              ? (isDark ? "bg-purple-500/20 text-purple-300 border border-purple-500/40 font-bold" : "bg-purple-100 text-purple-900 border border-purple-300 font-bold")
              : (isDark ? "text-zinc-400 hover:text-white hover:bg-zinc-900/50" : "text-slate-500 hover:text-purple-600 hover:bg-purple-50")
          }`}
        >
          <RegexIcon className="w-3.5 h-3.5 text-purple-400" />
          Regex Studio
        </button>
        <button
          onClick={() => setActiveTab("diff-inspector")}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold tracking-wide transition-all cursor-pointer shrink-0 touch-press ${
            activeTab === "diff-inspector"
              ? (isDark ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold" : "bg-emerald-100 text-emerald-900 border border-emerald-300 font-bold")
              : (isDark ? "text-zinc-400 hover:text-white hover:bg-zinc-900/50" : "text-slate-500 hover:text-emerald-600 hover:bg-emerald-50")
          }`}
        >
          <GitCompare className="w-3.5 h-3.5 text-emerald-400" />
          Diff Inspector
        </button>
        <button
          onClick={() => setActiveTab("api-client")}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold tracking-wide transition-all cursor-pointer shrink-0 touch-press ${
            activeTab === "api-client"
              ? (isDark ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold" : "bg-cyan-100 text-cyan-900 border border-cyan-300 font-bold")
              : (isDark ? "text-zinc-400 hover:text-white hover:bg-zinc-900/50" : "text-slate-500 hover:text-cyan-600 hover:bg-cyan-50")
          }`}
        >
          <Zap className="w-3.5 h-3.5 text-cyan-400" />
          REST & API Studio
        </button>
        <button
          onClick={() => setActiveTab("sql-studio")}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold tracking-wide transition-all cursor-pointer shrink-0 touch-press ${
            activeTab === "sql-studio"
              ? (isDark ? "bg-teal-500/20 text-teal-300 border border-teal-500/40 font-bold" : "bg-teal-100 text-teal-900 border border-teal-300 font-bold")
              : (isDark ? "text-zinc-400 hover:text-white hover:bg-zinc-900/50" : "text-slate-500 hover:text-teal-600 hover:bg-teal-50")
          }`}
        >
          <Database className="w-3.5 h-3.5 text-teal-400" />
          SQL Studio
        </button>
        <button
          onClick={() => setActiveTab("mock-server")}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold tracking-wide transition-all cursor-pointer shrink-0 touch-press ${
            activeTab === "mock-server"
              ? (isDark ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold" : "bg-emerald-100 text-emerald-900 border border-emerald-300 font-bold")
              : (isDark ? "text-zinc-400 hover:text-white hover:bg-zinc-900/50" : "text-slate-500 hover:text-emerald-600 hover:bg-emerald-50")
          }`}
        >
          <Server className="w-3.5 h-3.5 text-emerald-400" />
          Mock & Webhooks
        </button>
        <button
          onClick={() => setActiveTab("perf-auditor")}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold tracking-wide transition-all cursor-pointer shrink-0 touch-press ${
            activeTab === "perf-auditor"
              ? (isDark ? "bg-rose-500/20 text-rose-300 border border-rose-500/40 font-bold" : "bg-rose-100 text-rose-900 border border-rose-300 font-bold")
              : (isDark ? "text-zinc-400 hover:text-white hover:bg-zinc-900/50" : "text-slate-500 hover:text-rose-600 hover:bg-rose-50")
          }`}
        >
          <Activity className="w-3.5 h-3.5 text-rose-400" />
          Perf & Health Auditor
        </button>

        {/* DEVELOPER STUDIO TOOLS */}
        <button
          onClick={() => setActiveTab("docker-studio")}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold tracking-wide transition-all cursor-pointer shrink-0 touch-press ${
            activeTab === "docker-studio"
              ? (isDark ? "bg-sky-500/20 text-sky-300 border border-sky-500/40 font-bold" : "bg-sky-100 text-sky-900 border border-sky-300 font-bold")
              : (isDark ? "text-zinc-400 hover:text-white hover:bg-zinc-900/50" : "text-slate-500 hover:text-sky-600 hover:bg-sky-50")
          }`}
        >
          <Box className="w-3.5 h-3.5 text-sky-400" />
          Docker & Compose
        </button>

        <button
          onClick={() => setActiveTab("load-benchmark")}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold tracking-wide transition-all cursor-pointer shrink-0 touch-press ${
            activeTab === "load-benchmark"
              ? (isDark ? "bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold" : "bg-amber-100 text-amber-900 border border-amber-300 font-bold")
              : (isDark ? "text-zinc-400 hover:text-white hover:bg-zinc-900/50" : "text-slate-500 hover:text-amber-600 hover:bg-amber-50")
          }`}
        >
          <Flame className="w-3.5 h-3.5 text-amber-400" />
          Load Benchmark
        </button>

        <button
          onClick={() => setActiveTab("seo-studio")}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold tracking-wide transition-all cursor-pointer shrink-0 touch-press ${
            activeTab === "seo-studio"
              ? (isDark ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold" : "bg-cyan-100 text-cyan-900 border border-cyan-300 font-bold")
              : (isDark ? "text-zinc-400 hover:text-white hover:bg-zinc-900/50" : "text-slate-500 hover:text-cyan-600 hover:bg-cyan-50")
          }`}
        >
          <Share2 className="w-3.5 h-3.5 text-cyan-400" />
          SEO & Social SERP
        </button>

        <button
          onClick={() => setActiveTab("git-graph-studio")}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold tracking-wide transition-all cursor-pointer shrink-0 touch-press ${
            activeTab === "git-graph-studio"
              ? (isDark ? "bg-blue-500/20 text-blue-300 border border-blue-500/40 font-bold" : "bg-blue-100 text-blue-900 border border-blue-300 font-bold")
              : (isDark ? "text-zinc-400 hover:text-white hover:bg-zinc-900/50" : "text-slate-500 hover:text-blue-600 hover:bg-blue-50")
          }`}
        >
          <GitBranch className="w-3.5 h-3.5 text-blue-400" />
          Git Graph & Commits
        </button>

        <button
          onClick={() => setActiveTab("json-schema-studio")}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold tracking-wide transition-all cursor-pointer shrink-0 touch-press ${
            activeTab === "json-schema-studio"
              ? (isDark ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold" : "bg-emerald-100 text-emerald-900 border border-emerald-300 font-bold")
              : (isDark ? "text-zinc-400 hover:text-white hover:bg-zinc-900/50" : "text-slate-500 hover:text-emerald-600 hover:bg-emerald-50")
          }`}
        >
          <FileJson className="w-3.5 h-3.5 text-emerald-400" />
          JSON Schema Architect
        </button>

        <button
          onClick={() => setActiveTab("network-har-studio")}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold tracking-wide transition-all cursor-pointer shrink-0 touch-press ${
            activeTab === "network-har-studio"
              ? (isDark ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold" : "bg-cyan-100 text-cyan-900 border border-cyan-300 font-bold")
              : (isDark ? "text-zinc-400 hover:text-white hover:bg-zinc-900/50" : "text-slate-500 hover:text-cyan-600 hover:bg-cyan-50")
          }`}
        >
          <Globe className="w-3.5 h-3.5 text-cyan-400" />
          Network HAR Waterfall
        </button>

        <button
          onClick={() => setActiveTab("tailwind-tokens-studio")}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold tracking-wide transition-all cursor-pointer shrink-0 touch-press ${
            activeTab === "tailwind-tokens-studio"
              ? (isDark ? "bg-pink-500/20 text-pink-300 border border-pink-500/40 font-bold" : "bg-pink-100 text-pink-900 border border-pink-300 font-bold")
              : (isDark ? "text-zinc-400 hover:text-white hover:bg-zinc-900/50" : "text-slate-500 hover:text-pink-600 hover:bg-pink-50")
          }`}
        >
          <Palette className="w-3.5 h-3.5 text-pink-400" />
          Tailwind Tokens
        </button>

        <button
          onClick={() => setActiveTab("jwt-lab")}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold tracking-wide transition-all cursor-pointer shrink-0 touch-press ${
            activeTab === "jwt-lab"
              ? (isDark ? "bg-purple-500/20 text-purple-300 border border-purple-500/40 font-bold" : "bg-purple-100 text-purple-900 border border-purple-300 font-bold")
              : (isDark ? "text-zinc-400 hover:text-white hover:bg-zinc-900/50" : "text-slate-500 hover:text-purple-600 hover:bg-purple-50")
          }`}
        >
          <Key className="w-3.5 h-3.5 text-purple-400" />
          JWT & Crypto Lab
        </button>

        <button
          onClick={() => setActiveTab("erd-studio")}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold tracking-wide transition-all cursor-pointer shrink-0 touch-press ${
            activeTab === "erd-studio" || activeTab === "database-erd"
              ? (isDark ? "bg-blue-500/20 text-blue-300 border border-blue-500/40 font-bold" : "bg-blue-100 text-blue-900 border border-blue-300 font-bold")
              : (isDark ? "text-zinc-400 hover:text-white hover:bg-zinc-900/50" : "text-slate-500 hover:text-blue-600 hover:bg-blue-50")
          }`}
        >
          <Database className="w-3.5 h-3.5 text-blue-400" />
          Database ERD
        </button>

        <button
          onClick={() => setActiveTab("cron-studio")}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold tracking-wide transition-all cursor-pointer shrink-0 touch-press ${
            activeTab === "cron-studio"
              ? (isDark ? "bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold" : "bg-amber-100 text-amber-900 border border-amber-300 font-bold")
              : (isDark ? "text-zinc-400 hover:text-white hover:bg-zinc-900/50" : "text-slate-500 hover:text-amber-600 hover:bg-amber-50")
          }`}
        >
          <Clock className="w-3.5 h-3.5 text-amber-400" />
          Cron Scheduler
        </button>

        <button
          onClick={() => setActiveTab("stream-tester")}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold tracking-wide transition-all cursor-pointer shrink-0 touch-press ${
            activeTab === "stream-tester"
              ? (isDark ? "bg-purple-500/20 text-purple-300 border border-purple-500/40 font-bold" : "bg-purple-100 text-purple-900 border border-purple-300 font-bold")
              : (isDark ? "text-zinc-400 hover:text-white hover:bg-zinc-900/50" : "text-slate-500 hover:text-purple-600 hover:bg-purple-50")
          }`}
        >
          <Radio className="w-3.5 h-3.5 text-purple-400" />
          Stream Tester
        </button>

        <button
          onClick={() => setActiveTab("openapi-studio")}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold tracking-wide transition-all cursor-pointer shrink-0 touch-press ${
            activeTab === "openapi-studio"
              ? (isDark ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold" : "bg-emerald-100 text-emerald-900 border border-emerald-300 font-bold")
              : (isDark ? "text-zinc-400 hover:text-white hover:bg-zinc-900/50" : "text-slate-500 hover:text-emerald-600 hover:bg-emerald-50")
          }`}
        >
          <FileCode2 className="w-3.5 h-3.5 text-emerald-400" />
          OpenAPI & Swagger
        </button>

        <button
          onClick={() => setActiveTab("graphql-studio")}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold tracking-wide transition-all cursor-pointer shrink-0 touch-press ${
            activeTab === "graphql-studio"
              ? (isDark ? "bg-pink-500/20 text-pink-300 border border-pink-500/40 font-bold" : "bg-pink-100 text-pink-900 border border-pink-300 font-bold")
              : (isDark ? "text-zinc-400 hover:text-white hover:bg-zinc-900/50" : "text-slate-500 hover:text-pink-600 hover:bg-pink-50")
          }`}
        >
          <Orbit className="w-3.5 h-3.5 text-pink-400" />
          GraphQL Explorer
        </button>

        <button
          onClick={() => setActiveTab("cicd-architect")}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold tracking-wide transition-all cursor-pointer shrink-0 touch-press ${
            activeTab === "cicd-architect" || activeTab === "cicd-studio"
              ? (isDark ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold" : "bg-emerald-100 text-emerald-900 border border-emerald-300 font-bold")
              : (isDark ? "text-zinc-400 hover:text-white hover:bg-zinc-900/50" : "text-slate-500 hover:text-emerald-600 hover:bg-emerald-50")
          }`}
        >
          <GitFork className="w-3.5 h-3.5 text-emerald-400" />
          CI/CD Architect
        </button>

        <button
          onClick={() => setActiveTab("settings")}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold tracking-wide transition-all cursor-pointer shrink-0 touch-press ${
            activeTab === "settings"
              ? (isDark ? "bg-zinc-800 text-white border border-zinc-700 neon-border-selected" : "bg-slate-100 text-slate-800 border border-slate-200 neon-border-light font-bold")
              : (isDark ? "text-zinc-400 hover:text-white hover:bg-zinc-900/50 glow-indigo-hover" : "text-slate-500 hover:text-indigo-500 hover:bg-indigo-50 glow-indigo-hover")
          }`}
        >
          <Settings className="w-3.5 h-3.5 text-indigo-500" />
          Settings & Regulations
        </button>
      </div>

      <div className={`text-[10px] font-mono shrink-0 ${isDark ? "text-zinc-500" : "text-slate-400"}`}>
        Files: {filesCount} • Actions: {actionsCount}
      </div>
    </div>
  );
};
