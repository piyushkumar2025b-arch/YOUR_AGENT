import React, { useState, useRef, useEffect } from "react";
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
  ShieldCheck,
  ChevronDown,
  Wrench,
  Music,
  PanelLeft,
  PanelLeftClose
} from "lucide-react";
import { WorkspaceTemplate } from "../types";
import { BorderSettings } from "./BorderLayoutSliders";

export interface HeaderBarProps {
  isSidebarOpen?: boolean;
  onToggleSidebar?: () => void;
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
  onOpenCodeRunner?: () => void;
  onOpenMusicStudio?: () => void;
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
  isSidebarOpen = true,
  onToggleSidebar,
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
  onOpenCodeRunner,
  onOpenMusicStudio,
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
    <header className={`w-full px-2.5 sm:px-3.5 border-b flex items-center justify-between shrink-0 font-sans text-xs transition-colors duration-200 z-40 relative select-none ${
      isDark 
        ? "bg-[#101014] text-zinc-100 border-zinc-800/80" 
        : "bg-white text-slate-900 border-slate-200/80 shadow-xs"
    }`}
    style={{ height: "46px" }}
    >
      {/* Left section: Sidebar Toggle, Studio Logo & Title */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Sidebar Toggle Button */}
        {onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            className={`p-1.5 rounded-lg border transition-all cursor-pointer flex items-center justify-center ${
              isSidebarOpen
                ? (isDark 
                    ? "bg-zinc-800/80 border-zinc-700 text-indigo-400 hover:text-white hover:bg-zinc-700" 
                    : "bg-slate-100 border-slate-200 text-indigo-600 hover:bg-slate-200")
                : (isDark 
                    ? "bg-indigo-600/20 border-indigo-500/40 text-indigo-300 hover:bg-indigo-600/30" 
                    : "bg-indigo-50 border-indigo-200 text-indigo-600 hover:bg-indigo-100")
            }`}
            title={isSidebarOpen ? "Hide AI Sidebar (Ctrl+B)" : "Show AI Sidebar (Ctrl+B)"}
          >
            {isSidebarOpen ? <PanelLeftClose className="w-4 h-4" /> : <PanelLeft className="w-4 h-4" />}
          </button>
        )}

        {/* Logo Avatar Upload */}
        <div className="relative group cursor-pointer" onClick={() => studioLogoInputRef?.current?.click()}>
          {studioLogoPhoto ? (
            <img 
              src={studioLogoPhoto} 
              alt="Studio Avatar" 
              className="w-6 h-6 rounded-lg object-cover border border-indigo-500/40 shadow-xs"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="p-1 rounded-lg bg-gradient-to-tr from-indigo-600 to-cyan-500 text-white font-bold shadow-xs">
              <Sparkles className="w-3.5 h-3.5 animate-pulse" />
            </div>
          )}
          <div className="absolute inset-0 bg-black/50 rounded-lg opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
            <Camera className="w-3 h-3 text-white" />
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
          <span className="font-bold tracking-tight text-xs bg-gradient-to-r from-indigo-500 via-cyan-500 to-indigo-400 bg-clip-text text-transparent leading-tight">
            {workspaceTitle}
          </span>
          <span className={`text-[8.5px] font-mono tracking-wider ${isDark ? "text-zinc-500" : "text-slate-400"}`}>
            AI FULLSTACK STUDIO
          </span>
        </div>

        {/* Template Selector Dropdown */}
        {templates.length > 0 && handleTemplateLoad && (
          <div className="relative ml-1.5 hidden md:flex items-center gap-1">
            <Layers className={`w-3.5 h-3.5 ${isDark ? "text-zinc-400" : "text-slate-500"}`} />
            <select
              onChange={(e) => handleTemplateLoad(e.target.value)}
              defaultValue=""
              className={`text-[11px] px-2 py-0.5 rounded-md border font-medium cursor-pointer focus:outline-none transition-all ${
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

      {/* Right section: All Most Used Real Features Directly in Toolbar */}
      <div className="flex items-center gap-1 sm:gap-1.5 overflow-x-auto scrollbar-none py-1">

        {/* 1. COMMAND PALETTE (⌘K) */}
        {setIsCommandPaletteOpen && (
          <button
            onClick={() => setIsCommandPaletteOpen(true)}
            className={`px-2 py-1 rounded-lg font-medium flex items-center gap-1.5 transition-colors cursor-pointer text-xs border shrink-0 ${
              isDark
                ? "bg-zinc-900 border-zinc-800 text-zinc-300 hover:text-white hover:border-zinc-700"
                : "bg-slate-50 border-slate-200 text-slate-700 hover:text-slate-900 hover:border-slate-300"
            }`}
            title="Open Command Palette (Ctrl+K)"
          >
            <Terminal className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden lg:inline">Palette</span>
            <kbd className={`text-[10px] font-mono px-1 rounded ${
              isDark ? "bg-zinc-800 text-zinc-400" : "bg-slate-200 text-slate-600"
            }`}>
              ⌘K
            </kbd>
          </button>
        )}

        {/* 2. RUN CODE / SANDBOX */}
        {onOpenCodeRunner && (
          <button
            onClick={onOpenCodeRunner}
            className={`px-2 py-1 rounded-lg font-medium flex items-center gap-1 transition-colors cursor-pointer text-xs border shrink-0 ${
              isDark
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20"
                : "bg-emerald-50 border-emerald-300/60 text-emerald-700 hover:bg-emerald-100"
            }`}
            title="Run Code in Isolated Sandbox"
          >
            <Terminal className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden xl:inline">Runner</span>
          </button>
        )}

        {/* 3. SECURITY LAB */}
        {onOpenSecurityShield && (
          <button
            onClick={onOpenSecurityShield}
            className={`px-2 py-1 rounded-lg font-medium flex items-center gap-1 transition-colors cursor-pointer text-xs border shrink-0 ${
              isDark
                ? "border-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-800/80"
                : "border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-100"
            }`}
            title="Open Security Lab & Vulnerability Scanner"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden lg:inline">Security</span>
            <span className="px-1 py-0.2 rounded text-[9px] font-mono bg-emerald-500/20 text-emerald-300 hidden sm:inline">A+</span>
          </button>
        )}

        {/* 4. API HEALTH & STATUS */}
        {onOpenApiDashboard && (
          <button
            onClick={onOpenApiDashboard}
            className={`px-2 py-1 rounded-lg font-medium flex items-center gap-1 transition-colors cursor-pointer text-xs border shrink-0 ${
              isDark
                ? "border-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-800/80"
                : "border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-100"
            }`}
            title="Open Realtime API Status & Latency Monitor"
          >
            <Activity className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden xl:inline">API Status</span>
          </button>
        )}

        {/* 5. GOOGLE WORKSPACE */}
        {onOpenGoogleServices && (
          <button
            onClick={onOpenGoogleServices}
            className={`px-2 py-1 rounded-lg font-medium flex items-center gap-1 transition-colors cursor-pointer text-xs border shrink-0 ${
              isDark
                ? "border-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-800/80"
                : "border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-100"
            }`}
            title="Google Studio & Workspace Integration (Gmail, Drive)"
          >
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            <span className="hidden xl:inline">Workspace</span>
          </button>
        )}

        {/* 6. GOOGLE CALENDAR */}
        {onOpenCalendar && (
          <button
            onClick={onOpenCalendar}
            className={`px-2 py-1 rounded-lg font-medium flex items-center gap-1 transition-colors cursor-pointer text-xs border shrink-0 ${
              isDark
                ? "border-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-800/80"
                : "border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-100"
            }`}
            title="Google Calendar & Scheduling Manager"
          >
            <Calendar className="w-3.5 h-3.5 text-purple-400" />
            <span className="hidden xl:inline">Calendar</span>
          </button>
        )}

        {/* 7. MATH FUNCTIONS PLOTTER */}
        {setIsMathPlotterOpen && (
          <button
            onClick={() => setIsMathPlotterOpen(true)}
            className={`px-2 py-1 rounded-lg font-medium flex items-center gap-1 transition-colors cursor-pointer text-xs border shrink-0 ${
              isDark
                ? "border-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-800/80"
                : "border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-100"
            }`}
            title="Open Scientific Calculus & 2D Math Plotter"
          >
            <Calculator className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden xl:inline">Math</span>
          </button>
        )}

        {/* 8. LAYOUT SLIDERS BAR */}
        {setShowSlidersBar && (
          <button
            onClick={() => setShowSlidersBar(prev => !prev)}
            className={`px-2 py-1 rounded-lg font-medium flex items-center gap-1 transition-colors cursor-pointer text-xs border shrink-0 ${
              showSlidersBar
                ? (isDark ? "bg-amber-500/20 border-amber-500/40 text-amber-300" : "bg-amber-50 border-amber-300 text-amber-800")
                : (isDark
                    ? "border-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-800/80"
                    : "border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-100")
            }`}
            title="Toggle Layout Sizing & Border Sliders"
          >
            <Sliders className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden 2xl:inline">Sliders</span>
          </button>
        )}

        {/* 9. THEME CUSTOMIZER */}
        {onOpenThemeSelector && (
          <button
            onClick={onOpenThemeSelector}
            className={`px-2 py-1 rounded-lg font-medium flex items-center gap-1 transition-colors cursor-pointer text-xs border shrink-0 ${
              isDark
                ? "border-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-800/80"
                : "border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-100"
            }`}
            title="Open Theme Palette & Color Customizer"
          >
            <Palette className="w-3.5 h-3.5 text-purple-400" />
            <span className="hidden 2xl:inline">Themes</span>
          </button>
        )}

        {/* 10. EXPORT WORKSPACE ZIP */}
        {handleDownloadZip && (
          <button
            onClick={handleDownloadZip}
            className={`px-2 py-1 rounded-lg font-medium flex items-center gap-1 transition-colors cursor-pointer text-xs border shrink-0 ${
              isDark
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20"
                : "bg-emerald-50 border-emerald-300/60 text-emerald-700 hover:bg-emerald-100"
            }`}
            title="Export Entire Workspace as ZIP Archive"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export ZIP</span>
          </button>
        )}

        {/* 11. UPLOAD TO GOOGLE DRIVE */}
        {handleUploadToDrive && (
          <button
            onClick={handleUploadToDrive}
            className={`px-2 py-1 rounded-lg font-medium flex items-center gap-1 transition-colors cursor-pointer text-xs border shrink-0 ${
              isDark
                ? "border-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-800/80"
                : "border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-100"
            }`}
            title="Backup & Upload Workspace to Google Drive"
          >
            <Upload className="w-3.5 h-3.5 text-sky-400" />
            <span className="hidden xl:inline">Drive</span>
          </button>
        )}

        {/* 12. SHORTCUTS & HELP */}
        {setIsShortcutsHelpOpen && (
          <button
            onClick={() => setIsShortcutsHelpOpen(true)}
            className={`p-1.5 rounded-lg font-medium flex items-center justify-center transition-colors cursor-pointer border shrink-0 ${
              isDark
                ? "border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800/80"
                : "border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
            title="Keyboard Shortcuts & Developer Help"
          >
            <HelpCircle className="w-3.5 h-3.5" />
          </button>
        )}

        {/* 13. SYSTEM HEALTH & ERROR MONITOR */}
        {setIsErrorLogCenterOpen && (
          <button
            onClick={() => setIsErrorLogCenterOpen(true)}
            className={`p-1.5 rounded-lg relative font-medium transition-colors cursor-pointer border shrink-0 ${
              unresolvedErrorCount > 0
                ? "text-rose-400 border-rose-500/40 bg-rose-500/10"
                : isDark
                ? "border-zinc-800 text-emerald-400 hover:bg-zinc-800/80"
                : "border-slate-200 text-emerald-600 hover:bg-slate-100"
            }`}
            title={unresolvedErrorCount > 0 ? `${unresolvedErrorCount} Unresolved System Errors` : "System Healthy & Secure"}
          >
            {unresolvedErrorCount > 0 ? (
              <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
            ) : (
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            )}
            {unresolvedErrorCount > 0 && (
              <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-rose-600 text-white text-[8px] font-bold flex items-center justify-center">
                {unresolvedErrorCount}
              </span>
            )}
          </button>
        )}

        {/* 14. DARK / LIGHT MODE TOGGLE */}
        <button
          onClick={() => setTheme(prev => prev === "light" ? "dark" : "light")}
          className={`p-1.5 rounded-lg font-medium flex items-center justify-center transition-colors cursor-pointer border shrink-0 ${
            isDark
              ? "border-zinc-800 text-amber-400 hover:bg-zinc-800/80"
              : "border-slate-200 text-indigo-600 hover:bg-slate-100"
          }`}
          title={`Switch to ${isDark ? "Light" : "Dark"} Mode`}
        >
          {isDark ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
        </button>

        {/* 15. GUEST MODE BADGE */}
        {isGuest && (
          <div 
            className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold hidden sm:flex items-center gap-1 shrink-0 ${
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

        {/* 16. EXIT WORKSPACE */}
        {onExitWorkspace && (
          <button
            onClick={onExitWorkspace}
            className={`px-2 py-1 rounded-lg font-medium flex items-center gap-1 transition-colors cursor-pointer text-xs border shrink-0 ${
              isDark
                ? "border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800/80"
                : "border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100"
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
