import React, { memo, useRef, useEffect, useState } from "react";
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
  X
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
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsMoreOpen(false);
      }
    };
    if (isMoreOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMoreOpen]);

  const coreTabs = WORKSPACE_TABS.filter(t => CORE_TAB_IDS.includes(t.id));
  const activeSecondaryTab = !CORE_TAB_IDS.includes(activeTab)
    ? WORKSPACE_TABS.find(t => t.id === activeTab)
    : null;

  const moreTabs = WORKSPACE_TABS.filter(t => !CORE_TAB_IDS.includes(t.id));
  const filteredMoreTabs = moreTabs.filter(t =>
    t.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className={`h-10 border-b px-3 flex items-center justify-between shrink-0 z-20 transition-colors w-full relative ${
      isDark ? "border-zinc-800 bg-[#161618] text-white" : "border-slate-200 bg-white text-slate-900"
    }`}>
      {/* Primary Clean Navigation Tabs */}
      <div className="flex items-center gap-1 overflow-x-auto scrollbar-none py-1">
        {coreTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium tracking-normal transition-all cursor-pointer shrink-0 ${
                isActive
                  ? (isDark
                      ? "bg-zinc-800 text-white font-semibold shadow-xs"
                      : "bg-slate-200/80 text-slate-900 font-semibold shadow-xs")
                  : (isDark
                      ? "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50"
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

        {/* Currently active secondary tool tab if one was chosen from More */}
        {activeSecondaryTab && (
          <button
            onClick={() => setActiveTab(activeSecondaryTab.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold tracking-normal transition-colors cursor-pointer shrink-0 border ${
              isDark
                ? "bg-indigo-500/10 text-indigo-400 border-indigo-500/30"
                : "bg-indigo-50 text-indigo-700 border-indigo-200"
            }`}
          >
            <activeSecondaryTab.icon className="w-3.5 h-3.5 shrink-0 text-indigo-500" />
            <span className="whitespace-nowrap">{activeSecondaryTab.label}</span>
          </button>
        )}

        {/* More Tools Dropdown Trigger */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsMoreOpen(!isMoreOpen)}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
              isMoreOpen || activeSecondaryTab
                ? (isDark ? "bg-zinc-800 text-zinc-200" : "bg-slate-100 text-slate-900")
                : (isDark ? "text-zinc-400 hover:text-white hover:bg-zinc-800/40" : "text-slate-600 hover:text-slate-900 hover:bg-slate-100")
            }`}
            title="Explore all tools and agent modules"
          >
            <LayoutGrid className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden sm:inline">More Tools</span>
            <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${isMoreOpen ? "rotate-180" : ""}`} />
          </button>

          {/* More Tools Popover Modal */}
          {isMoreOpen && (
            <div className={`absolute top-full left-0 mt-1.5 w-80 rounded-xl shadow-2xl border p-2 z-50 animate-in fade-in-50 zoom-in-95 ${
              isDark ? "bg-[#18181b] border-zinc-800 text-zinc-100" : "bg-white border-slate-200 text-slate-900"
            }`}>
              <div className="relative mb-2">
                <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter 40+ tools & agents..."
                  className={`w-full text-xs pl-8 pr-3 py-1.5 rounded-lg border focus:outline-none ${
                    isDark ? "bg-zinc-900 border-zinc-800 text-zinc-200 placeholder-zinc-500" : "bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400"
                  }`}
                  autoFocus
                />
              </div>

              <div className="max-h-72 overflow-y-auto space-y-0.5 pr-1">
                {filteredMoreTabs.length === 0 ? (
                  <p className="text-xs text-zinc-500 text-center py-4">No matching tools found</p>
                ) : (
                  filteredMoreTabs.map(tab => {
                    const TabIcon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => {
                          setActiveTab(tab.id);
                          setIsMoreOpen(false);
                        }}
                        className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs transition-colors text-left cursor-pointer ${
                          isActive
                            ? (isDark ? "bg-indigo-600 text-white font-semibold" : "bg-indigo-600 text-white font-semibold")
                            : (isDark ? "hover:bg-zinc-800 text-zinc-300" : "hover:bg-slate-100 text-slate-700")
                        }`}
                      >
                        <TabIcon className="w-3.5 h-3.5 shrink-0 opacity-80" />
                        <span className="truncate">{tab.label}</span>
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>

        {/* Runner Launcher Modal Button */}
        <button
          onClick={onOpenRunnerModal}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer shrink-0 ${
            isDark
              ? "text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10 border border-cyan-500/20"
              : "text-cyan-700 hover:text-cyan-800 hover:bg-cyan-50 border border-cyan-200"
          }`}
          title="Run Modules & Compilers"
        >
          <Cpu className="w-3.5 h-3.5 shrink-0 text-cyan-400" />
          <span className="whitespace-nowrap hidden sm:inline">Run Modules</span>
        </button>
      </div>

      {/* Quick stats counter */}
      <div className={`text-[11px] font-mono shrink-0 pl-2 hidden md:flex items-center gap-2 ${
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
  );
});
