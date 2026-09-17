import React, { memo, useRef, useEffect } from "react";
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
  ChevronLeft,
  ChevronRight
} from "lucide-react";

export interface TabItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

export const WORKSPACE_TABS: TabItem[] = [
  { id: "editor", label: "Code Editor", icon: Code2 },
  { id: "preview", label: "Universal Preview", icon: Globe },
  { id: "agents", label: "Agents Ecosystem", icon: Cpu },
  { id: "study", label: "Study Agent", icon: GraduationCap },
  { id: "photos", label: "Image Studio", icon: Palette },
  { id: "map", label: "Map Viewer", icon: Compass },
  { id: "story", label: "Story Maker", icon: BookOpen },
  { id: "dictionary", label: "Dictionary", icon: Book },
  { id: "gaming", label: "Gaming Arcade", icon: Gamepad2 },
  { id: "music", label: "Song Player", icon: Music },
  { id: "search", label: "Google Search", icon: Search },
  { id: "github", label: "GitHub Sync", icon: Github },
  { id: "firebase", label: "Firebase DB", icon: Flame },
  { id: "supabase", label: "Supabase DB", icon: Database },
  { id: "gmail", label: "Gmail Agent", icon: Mail },
  { id: "youtube", label: "YT Agent", icon: Youtube },
  { id: "chat", label: "Just Chat", icon: Brain },
  { id: "actions", label: "Audit Logs", icon: Terminal },
  { id: "cp", label: "CP Agents", icon: Code2 },
  { id: "share", label: "Share & QR", icon: Upload },
  { id: "trending-repos", label: "Trending Repos", icon: Github },
  { id: "weather", label: "Live Weather", icon: Sun },
  { id: "live-quiz", label: "API Quiz", icon: Brain },
  { id: "english-agent", label: "English Coach", icon: GraduationCap },
  { id: "news-agent", label: "Global News", icon: Newspaper },
  { id: "calculator", label: "Calculator", icon: Calculator },
  { id: "media-downloader", label: "Media Downloader", icon: Download },
  { id: "doc-previewer", label: "Doc Previewer", icon: FileText },
  { id: "photo-editor", label: "Photo Editor", icon: Palette },
  { id: "jokes", label: "Jokes Agent", icon: Laugh },
  { id: "api-hub", label: "API Studio Hub", icon: Bot },
  { id: "deep-research", label: "Deep Research", icon: Compass },
  { id: "code-analyzer", label: "Code Security", icon: ShieldAlert },
  { id: "image-studio", label: "Create Image", icon: Wand2 },
  { id: "voice-synth", label: "AI Voice", icon: Volume2 },
  { id: "translator", label: "Translator", icon: Languages },
  { id: "content-creator", label: "Content Creator", icon: Share2 },
  { id: "currency-agent", label: "Forex & Crypto", icon: DollarSign },
  { id: "qrcode-agent", label: "QR Code API", icon: QrCode },
  { id: "wiki-agent", label: "Wikipedia API", icon: BookOpen },
  { id: "nasa-agent", label: "NASA Space", icon: Rocket },
  { id: "ipgeo-agent", label: "IP Geolocation", icon: Globe },
  { id: "crypto-agent", label: "Crypto API", icon: Coins },
  { id: "mockdata-agent", label: "Mock Data", icon: Users },
  { id: "animal-agent", label: "Pets API", icon: Dog },
  { id: "opentrivia-agent", label: "Trivia DB", icon: HelpCircle },
  { id: "countries-agent", label: "Countries API", icon: Globe },
  { id: "universities-agent", label: "Universities", icon: GraduationCap },
  { id: "advice-agent", label: "Wisdom Quotes", icon: Quote },
  { id: "picsum-agent", label: "Stock Photos", icon: ImageIcon },
  { id: "books-agent", label: "Books API", icon: BookOpen },
  { id: "airquality-agent", label: "Air Quality API", icon: Wind },
  { id: "settings", label: "Settings", icon: Settings }
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
  const tabsContainerRef = useRef<HTMLDivElement>(null);

  // Smooth scroll active tab into view when activeTab changes
  useEffect(() => {
    if (!tabsContainerRef.current) return;
    const activeBtn = tabsContainerRef.current.querySelector<HTMLElement>('[data-active="true"]');
    if (activeBtn) {
      activeBtn.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
    }
  }, [activeTab]);

  const handleWheel = (e: React.WheelEvent) => {
    if (tabsContainerRef.current) {
      tabsContainerRef.current.scrollLeft += e.deltaY;
    }
  };

  const scrollTabs = (offset: number) => {
    if (tabsContainerRef.current) {
      tabsContainerRef.current.scrollBy({ left: offset, behavior: "smooth" });
    }
  };

  return (
    <div className={`h-10 border-b px-2 flex items-center justify-between shrink-0 z-10 transition-colors w-full ${
      isDark ? "border-zinc-800 bg-[#161618] text-white" : "border-slate-200 bg-white text-slate-900"
    }`}>
      {/* Scroll Left Button */}
      <button
        onClick={() => scrollTabs(-240)}
        className={`p-1 rounded-md text-xs transition-colors shrink-0 cursor-pointer ${
          isDark ? "hover:bg-zinc-800 text-zinc-400 hover:text-white" : "hover:bg-slate-100 text-slate-500 hover:text-slate-900"
        }`}
        title="Scroll tabs left"
        aria-label="Scroll tabs left"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      {/* Scrollable Tabs List */}
      <div
        ref={tabsContainerRef}
        onWheel={handleWheel}
        className="flex-1 flex items-center gap-1 overflow-x-auto scrollbar-none py-1 mx-1 scroll-smooth"
      >
        {WORKSPACE_TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              data-active={isActive ? "true" : "false"}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium tracking-normal transition-colors cursor-pointer shrink-0 ${
                isActive
                  ? (isDark
                      ? "bg-zinc-800 text-white font-semibold shadow-xs border border-zinc-700/80"
                      : "bg-slate-100 text-slate-900 font-semibold shadow-xs border border-slate-300/80")
                  : (isDark
                      ? "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100")
              }`}
            >
              <Icon className={`w-3.5 h-3.5 shrink-0 ${
                isActive
                  ? (isDark ? "text-indigo-400" : "text-indigo-600")
                  : (isDark ? "text-zinc-500" : "text-slate-400")
              }`} />
              <span className="whitespace-nowrap">{tab.label}</span>
            </button>
          );
        })}

        {/* Runner Launcher Modal Button */}
        <button
          onClick={onOpenRunnerModal}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer shrink-0 ${
            isDark
              ? "text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10 border border-cyan-500/20"
              : "text-cyan-700 hover:text-cyan-800 hover:bg-cyan-50 border border-cyan-200"
          }`}
          title="Run Modules & Compilers"
        >
          <Cpu className="w-3.5 h-3.5 shrink-0 text-cyan-400" />
          <span className="whitespace-nowrap">Run Modules</span>
        </button>
      </div>

      {/* Scroll Right Button */}
      <button
        onClick={() => scrollTabs(240)}
        className={`p-1 rounded-md text-xs transition-colors shrink-0 cursor-pointer ${
          isDark ? "hover:bg-zinc-800 text-zinc-400 hover:text-white" : "hover:bg-slate-100 text-slate-500 hover:text-slate-900"
        }`}
        title="Scroll tabs right"
        aria-label="Scroll tabs right"
      >
        <ChevronRight className="w-4 h-4" />
      </button>

      {/* Quick stats counter */}
      <div className={`text-[10px] font-mono shrink-0 pl-2 hidden md:block ${
        isDark ? "text-zinc-500" : "text-slate-400"
      }`}>
        Files: {filesCount} • Actions: {agentActionsCount}
      </div>
    </div>
  );
});
