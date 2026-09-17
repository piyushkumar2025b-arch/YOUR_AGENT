import React from "react";
import { 
  Sparkles, 
  Terminal, 
  Sun, 
  Moon, 
  Calculator, 
  Calendar,
  HelpCircle, 
  Sliders, 
  Download, 
  Upload, 
  AlertCircle, 
  Camera,
  Layers,
  Activity,
  Palette,
  LogOut,
  ShieldCheck
} from "lucide-react";
import { WorkspaceTemplate } from "../types";
import { BorderSettings } from "./BorderLayoutSliders";

export interface HeaderBarProps {
  workspaceTitle?: string;
  studioLogoPhoto?: string | null;
  setStudioLogoPhoto?: (photo: string | null) => void;
  handleStudioLogoUpload?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  studioLogoInputRef?: React.RefObject<HTMLInputElement>;
  theme: "light" | "dark" | string;
  setTheme: React.Dispatch<React.SetStateAction<any>>;
  templates?: WorkspaceTemplate[];
  handleTemplateLoad?: (templateId: string) => void;
  setIsCommandPaletteOpen?: (open: boolean) => void;
  setIsErrorLogCenterOpen?: (open: boolean) => void;
  unresolvedErrorCount?: number;
  setIsShortcutsHelpOpen?: (open: boolean) => void;
  setIsMathPlotterOpen?: (open: boolean) => void;
  onOpenCalendar?: () => void;
  onOpenSecurityShield?: () => void;
  onOpenApiDashboard?: () => void;
  onOpenGoogleServices?: () => void;
  onOpenThemeSelector?: () => void;
  showSlidersBar?: boolean;
  setShowSlidersBar?: React.Dispatch<React.SetStateAction<boolean>>;
  handleDownloadZip?: () => void;
  handleUploadToDrive?: () => void;
  borderSettings?: BorderSettings;
  isGuest?: boolean;
  onExitWorkspace?: () => void;
}

export const HeaderBar: React.FC<HeaderBarProps> = ({
  workspaceTitle = "VibeCoder AI Studio",
  studioLogoPhoto,
  handleStudioLogoUpload,
  studioLogoInputRef,
  theme,
  setTheme,
  templates = [],
  handleTemplateLoad,
  setIsCommandPaletteOpen,
  setIsErrorLogCenterOpen,
  unresolvedErrorCount = 0,
  setIsShortcutsHelpOpen,
  setIsMathPlotterOpen,
  onOpenCalendar,
  onOpenSecurityShield,
  onOpenApiDashboard,
  onOpenGoogleServices,
  onOpenThemeSelector,
  showSlidersBar,
  setShowSlidersBar,
  handleDownloadZip,
  handleUploadToDrive,
  borderSettings,
  isGuest,
  onExitWorkspace
}) => {
  const isDark = theme !== "light";

  return (
    <header className={`w-full px-4 border-b flex items-center justify-between shrink-0 font-sans text-xs transition-colors duration-200 z-30 ${
      isDark 
        ? "bg-[#101014] text-zinc-100 border-zinc-800/80" 
        : "bg-white text-slate-900 border-slate-200/80 shadow-xs"
    }`}
    style={{ height: "48px" }}
    >
      {/* Left section: Studio Logo & Title */}
      <div className="flex items-center gap-3">
        {/* Logo Avatar Upload */}
        <div className="relative group cursor-pointer" onClick={() => studioLogoInputRef?.current?.click()}>
          {studioLogoPhoto ? (
            <img 
              src={studioLogoPhoto} 
              alt="Studio Avatar" 
              className="w-7 h-7 rounded-lg object-cover border border-indigo-500/40 shadow-xs"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="p-1.5 rounded-lg bg-gradient-to-tr from-indigo-600 to-cyan-500 text-white font-bold shadow-xs">
              <Sparkles className="w-4 h-4 animate-pulse" />
            </div>
          )}
          <div className="absolute inset-0 bg-black/50 rounded-lg opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
            <Camera className="w-3.5 h-3.5 text-white" />
          </div>
          <input 
            ref={studioLogoInputRef}
            type="file" 
            accept="image/*" 
            onChange={handleStudioLogoUpload} 
            className="hidden"
          />
        </div>

        {/* Studio Branding */}
        <div className="flex flex-col">
          <span className="font-extrabold tracking-wide text-xs bg-gradient-to-r from-indigo-500 via-cyan-500 to-indigo-400 bg-clip-text text-transparent">
            {workspaceTitle}
          </span>
          <span className={`text-[9px] font-mono tracking-wider ${isDark ? "text-zinc-500" : "text-slate-400"}`}>
            AI FULLSTACK STUDIO
          </span>
        </div>

        {/* Template Selector Dropdown */}
        {templates.length > 0 && handleTemplateLoad && (
          <div className="relative ml-2 hidden sm:flex items-center gap-1.5">
            <Layers className={`w-3.5 h-3.5 ${isDark ? "text-zinc-400" : "text-slate-500"}`} />
            <select
              onChange={(e) => handleTemplateLoad(e.target.value)}
              defaultValue=""
              className={`text-[11px] px-2 py-1 rounded-lg border font-medium cursor-pointer focus:outline-none transition-all ${
                isDark 
                  ? "bg-zinc-900 border-zinc-700 text-zinc-300 hover:bg-zinc-800" 
                  : "bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200/70"
              }`}
            >
              <option value="" disabled>Load Template...</option>
              {templates.map((tpl) => (
                <option key={tpl.id} value={tpl.id} className={isDark ? "bg-zinc-900 text-zinc-200" : "bg-white text-slate-800"}>
                  {tpl.name} ({tpl.category || "App"})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Right section: Feature Action Controls */}
      <div className="flex items-center gap-1 sm:gap-1.5">

        {/* SYSTEM SECURITY SHIELD & LIVE PENETRATION LAB BUTTON */}
        {onOpenSecurityShield && (
          <button
            onClick={onOpenSecurityShield}
            className={`px-2 py-1 rounded-md font-medium flex items-center gap-1.5 transition-colors cursor-pointer text-xs ${
              isDark
                ? "text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 border border-emerald-500/30"
                : "text-emerald-700 hover:text-emerald-800 hover:bg-emerald-50 border border-emerald-300/60"
            }`}
            title="Open System Security Shield & Live Multi-Vector Penetration Testing Lab"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline font-bold">Security Lab</span>
            <span className="px-1 py-0.2 rounded text-[10px] font-mono bg-emerald-500/20 text-emerald-300">
              A+
            </span>
          </button>
        )}

        {/* AUTOMATED API HEALTH DASHBOARD BUTTON */}
        {onOpenApiDashboard && (
          <button
            onClick={onOpenApiDashboard}
            className={`px-2 py-1 rounded-md font-medium flex items-center gap-1.5 transition-colors cursor-pointer text-xs ${
              isDark
                ? "text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10"
                : "text-emerald-700 hover:text-emerald-800 hover:bg-emerald-50"
            }`}
            title="Open Automated API Status & Diagnostic Dashboard"
          >
            <Activity className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">API Status</span>
          </button>
        )}

        {/* GOOGLE SERVICES & MULTIMODAL STUDIO BUTTON */}
        {onOpenGoogleServices && (
          <button
            onClick={onOpenGoogleServices}
            className={`px-2 py-1 rounded-md font-medium flex items-center gap-1.5 transition-colors cursor-pointer text-xs ${
              isDark
                ? "text-zinc-300 hover:text-white hover:bg-white/5"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
            title="Google Workspace (Sheets, Docs, Tasks) & Gemini Multimodal Studio"
          >
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            <span className="hidden sm:inline">Google Studio</span>
          </button>
        )}

        {/* THEMES CUSTOMIZER SELECTOR */}
        {onOpenThemeSelector && (
          <button
            onClick={onOpenThemeSelector}
            className={`px-2 py-1 rounded-md font-medium flex items-center gap-1.5 transition-colors cursor-pointer text-xs ${
              isDark
                ? "text-zinc-300 hover:text-white hover:bg-white/5"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
            title="Open Themes Customizer (8 Preset Color Palettes)"
          >
            <Palette className="w-3.5 h-3.5 text-purple-400" />
            <span className="hidden md:inline">Themes</span>
          </button>
        )}

        {/* GOOGLE CALENDAR LAUNCHER */}
        {onOpenCalendar && (
          <button
            onClick={onOpenCalendar}
            className={`px-2 py-1 rounded-md font-medium flex items-center gap-1.5 transition-colors cursor-pointer text-xs ${
              isDark
                ? "text-zinc-300 hover:text-white hover:bg-white/5"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
            title="Open Google Calendar & AI Scheduler"
          >
            <Calendar className="w-3.5 h-3.5 text-purple-400" />
            <span className="hidden lg:inline">Calendar</span>
          </button>
        )}

        {/* MATH PLOTTER MODAL LAUNCHER */}
        <button
          onClick={() => setIsMathPlotterOpen && setIsMathPlotterOpen(true)}
          className={`px-2 py-1 rounded-md font-medium flex items-center gap-1.5 transition-colors cursor-pointer text-xs ${
            isDark
              ? "text-zinc-300 hover:text-white hover:bg-white/5"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          }`}
          title="Open Interactive Math Functions Plotter & 2D/3D Graph Visualizer"
        >
          <Calculator className="w-3.5 h-3.5 text-indigo-400" />
          <span className="hidden lg:inline">Math Plotter</span>
        </button>

        {/* COMMAND PALETTE BUTTON */}
        <button
          onClick={() => setIsCommandPaletteOpen && setIsCommandPaletteOpen(true)}
          className={`px-2 py-1 rounded-md font-medium flex items-center gap-1.5 transition-colors cursor-pointer text-xs ${
            isDark
              ? "text-zinc-300 hover:text-white hover:bg-white/5"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          }`}
          title="Open Command Palette (Ctrl+K)"
        >
          <Terminal className="w-3.5 h-3.5 text-cyan-400" />
          <span className="hidden xl:inline">Palette</span>
          <span className={`text-[10px] font-mono px-1 py-0.2 rounded border ${
            isDark ? "bg-zinc-800 border-zinc-700 text-zinc-400" : "bg-slate-200 border-slate-300 text-slate-600"
          }`}>
            ⌘K
          </span>
        </button>

        {/* DOWNLOAD WORKSPACE ZIP */}
        {handleDownloadZip && (
          <button
            onClick={handleDownloadZip}
            className={`px-2 py-1 rounded-md font-medium hidden sm:flex items-center gap-1.5 transition-colors cursor-pointer text-xs ${
              isDark
                ? "text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10"
                : "text-emerald-700 hover:text-emerald-800 hover:bg-emerald-50"
            }`}
            title="Export Entire Workspace as ZIP Archive"
          >
            <Download className="w-3.5 h-3.5" />
            <span>ZIP</span>
          </button>
        )}

        {/* DRIVE UPLOAD BUTTON */}
        {handleUploadToDrive && (
          <button
            onClick={handleUploadToDrive}
            className={`p-1.5 rounded-md font-medium hidden md:flex transition-colors cursor-pointer ${
              isDark
                ? "text-sky-400 hover:text-sky-300 hover:bg-white/5"
                : "text-sky-600 hover:text-sky-700 hover:bg-slate-100"
            }`}
            title="Upload Files to Google Drive"
          >
            <Upload className="w-3.5 h-3.5" />
          </button>
        )}

        {/* LAYOUT SLIDERS TOGGLE */}
        {setShowSlidersBar && (
          <button
            onClick={() => setShowSlidersBar(prev => !prev)}
            className={`p-1.5 rounded-md font-medium transition-colors cursor-pointer ${
              showSlidersBar
                ? "bg-indigo-600 text-white"
                : isDark
                ? "text-zinc-400 hover:text-zinc-100 hover:bg-white/5"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
            title="Toggle Custom Layout & Border Sliders Bar"
          >
            <Sliders className="w-3.5 h-3.5" />
          </button>
        )}

        {/* SYSTEM HEALTH / ERROR MONITOR */}
        {setIsErrorLogCenterOpen && (
          <button
            onClick={() => setIsErrorLogCenterOpen(true)}
            className={`p-1.5 rounded-md relative font-medium transition-colors cursor-pointer ${
              unresolvedErrorCount > 0
                ? "text-rose-400 hover:bg-rose-500/10"
                : isDark
                ? "text-emerald-400 hover:bg-white/5"
                : "text-emerald-600 hover:bg-slate-100"
            }`}
            title="System Security Shield & Error Monitor"
          >
            <AlertCircle className="w-3.5 h-3.5" />
            {unresolvedErrorCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-rose-600 text-white text-[8px] font-bold flex items-center justify-center">
                {unresolvedErrorCount}
              </span>
            )}
          </button>
        )}

        {/* SHORTCUTS / HELP */}
        {setIsShortcutsHelpOpen && (
          <button
            onClick={() => setIsShortcutsHelpOpen(true)}
            className={`p-1.5 rounded-md font-medium transition-colors cursor-pointer ${
              isDark
                ? "text-zinc-400 hover:text-zinc-100 hover:bg-white/5"
                : "text-slate-500 hover:text-slate-800 hover:bg-slate-100"
            }`}
            title="Keyboard Shortcuts & System Help"
          >
            <HelpCircle className="w-3.5 h-3.5" />
          </button>
        )}

        {/* DARK / LIGHT MODE TOGGLE */}
        <button
          onClick={() => setTheme(prev => prev === "light" ? "dark" : "light")}
          className={`p-1.5 rounded-md font-medium flex items-center justify-center transition-colors cursor-pointer ${
            isDark
              ? "text-amber-400 hover:text-amber-300 hover:bg-white/5"
              : "text-indigo-600 hover:text-indigo-700 hover:bg-slate-100"
          }`}
          title={`Switch to ${isDark ? "Light" : "Dark"} Mode`}
        >
          {isDark ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
        </button>

        {/* GUEST MODE BADGE */}
        {isGuest && (
          <div 
            className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold hidden sm:flex items-center gap-1 ${
              isDark 
                ? "text-emerald-400 bg-emerald-500/10 border border-emerald-500/20"
                : "text-emerald-700 bg-emerald-50 border border-emerald-200"
            }`}
            title="Direct Guest Session Active"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span>Guest</span>
          </div>
        )}

        {/* EXIT WORKSPACE / RETURN TO LANDING */}
        {onExitWorkspace && (
          <button
            onClick={onExitWorkspace}
            className={`px-2 py-1 rounded-md font-medium flex items-center gap-1 transition-colors cursor-pointer text-xs ${
              isDark
                ? "text-zinc-400 hover:text-white hover:bg-white/5"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
            title="Exit Workspace & Return to Landing Page"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Exit</span>
          </button>
        )}

      </div>
    </header>
  );
};
