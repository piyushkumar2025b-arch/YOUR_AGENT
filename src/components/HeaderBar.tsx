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
  Wrench
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
  const [isToolsOpen, setIsToolsOpen] = useState(false);
  const toolsDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (toolsDropdownRef.current && !toolsDropdownRef.current.contains(e.target as Node)) {
        setIsToolsOpen(false);
      }
    };
    if (isToolsOpen) {
      document.addEventListener("mousedown", handleOutsideClick);
    }
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [isToolsOpen]);

  return (
    <header className={`w-full px-3.5 border-b flex items-center justify-between shrink-0 font-sans text-xs transition-colors duration-200 z-30 ${
      isDark 
        ? "bg-[#101014] text-zinc-100 border-zinc-800/80" 
        : "bg-white text-slate-900 border-slate-200/80 shadow-xs"
    }`}
    style={{ height: "46px" }}
    >
      {/* Left section: Studio Logo & Title */}
      <div className="flex items-center gap-2.5">
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
          <div className="relative ml-2 hidden sm:flex items-center gap-1">
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

      {/* Right section: Streamlined Action Controls */}
      <div className="flex items-center gap-1 sm:gap-1.5">

        {/* COMMAND PALETTE BUTTON (⌘K) */}
        {setIsCommandPaletteOpen && (
          <button
            onClick={() => setIsCommandPaletteOpen(true)}
            className={`px-2 py-1 rounded-lg font-medium flex items-center gap-1.5 transition-colors cursor-pointer text-xs border ${
              isDark
                ? "bg-zinc-900 border-zinc-800 text-zinc-300 hover:text-white hover:border-zinc-700"
                : "bg-slate-50 border-slate-200 text-slate-700 hover:text-slate-900 hover:border-slate-300"
            }`}
            title="Open Command Palette (Ctrl+K)"
          >
            <Terminal className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden md:inline">Palette</span>
            <kbd className={`text-[10px] font-mono px-1 rounded ${
              isDark ? "bg-zinc-800 text-zinc-400" : "bg-slate-200 text-slate-600"
            }`}>
              ⌘K
            </kbd>
          </button>
        )}

        {/* DOWNLOAD WORKSPACE ZIP */}
        {handleDownloadZip && (
          <button
            onClick={handleDownloadZip}
            className={`px-2 py-1 rounded-lg font-medium flex items-center gap-1 transition-colors cursor-pointer text-xs border ${
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

        {/* CONSOLIDATED STUDIO TOOLS DROPDOWN */}
        <div className="relative" ref={toolsDropdownRef}>
          <button
            onClick={() => setIsToolsOpen(!isToolsOpen)}
            className={`px-2 py-1 rounded-lg font-medium flex items-center gap-1 transition-colors cursor-pointer text-xs border ${
              isToolsOpen
                ? "bg-indigo-600 text-white border-indigo-500"
                : isDark
                ? "border-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-800/80"
                : "border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-100"
            }`}
            title="Access Developer Tools & Studio Labs"
          >
            <Wrench className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden sm:inline">Tools</span>
            <ChevronDown className={`w-3 h-3 transition-transform ${isToolsOpen ? "rotate-180" : ""}`} />
          </button>

          {isToolsOpen && (
            <div className={`absolute right-0 top-full mt-1.5 w-64 rounded-xl shadow-2xl border p-1.5 z-50 animate-in fade-in-50 zoom-in-95 space-y-0.5 ${
              isDark ? "bg-[#18181b] border-zinc-800 text-zinc-100" : "bg-white border-slate-200 text-slate-900"
            }`}>
              {onOpenSecurityShield && (
                <button
                  onClick={() => { onOpenSecurityShield(); setIsToolsOpen(false); }}
                  className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs transition-colors text-left cursor-pointer ${
                    isDark ? "hover:bg-zinc-800 text-zinc-300" : "hover:bg-slate-100 text-slate-700"
                  }`}
                >
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <div className="flex-1">
                    <span className="font-medium">Security Lab</span>
                    <span className="ml-1.5 px-1 py-0.2 rounded text-[9px] font-mono bg-emerald-500/20 text-emerald-300">A+</span>
                  </div>
                </button>
              )}

              {onOpenApiDashboard && (
                <button
                  onClick={() => { onOpenApiDashboard(); setIsToolsOpen(false); }}
                  className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs transition-colors text-left cursor-pointer ${
                    isDark ? "hover:bg-zinc-800 text-zinc-300" : "hover:bg-slate-100 text-slate-700"
                  }`}
                >
                  <Activity className="w-4 h-4 text-emerald-400" />
                  <span className="font-medium">API Health Status</span>
                </button>
              )}

              {onOpenGoogleServices && (
                <button
                  onClick={() => { onOpenGoogleServices(); setIsToolsOpen(false); }}
                  className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs transition-colors text-left cursor-pointer ${
                    isDark ? "hover:bg-zinc-800 text-zinc-300" : "hover:bg-slate-100 text-slate-700"
                  }`}
                >
                  <Sparkles className="w-4 h-4 text-blue-400" />
                  <span className="font-medium">Google Studio & Workspace</span>
                </button>
              )}

              {onOpenThemeSelector && (
                <button
                  onClick={() => { onOpenThemeSelector(); setIsToolsOpen(false); }}
                  className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs transition-colors text-left cursor-pointer ${
                    isDark ? "hover:bg-zinc-800 text-zinc-300" : "hover:bg-slate-100 text-slate-700"
                  }`}
                >
                  <Palette className="w-4 h-4 text-purple-400" />
                  <span className="font-medium">Theme Customizer</span>
                </button>
              )}

              {onOpenCalendar && (
                <button
                  onClick={() => { onOpenCalendar(); setIsToolsOpen(false); }}
                  className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs transition-colors text-left cursor-pointer ${
                    isDark ? "hover:bg-zinc-800 text-zinc-300" : "hover:bg-slate-100 text-slate-700"
                  }`}
                >
                  <Calendar className="w-4 h-4 text-purple-400" />
                  <span className="font-medium">Google Calendar & Scheduler</span>
                </button>
              )}

              {setIsMathPlotterOpen && (
                <button
                  onClick={() => { setIsMathPlotterOpen(true); setIsToolsOpen(false); }}
                  className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs transition-colors text-left cursor-pointer ${
                    isDark ? "hover:bg-zinc-800 text-zinc-300" : "hover:bg-slate-100 text-slate-700"
                  }`}
                >
                  <Calculator className="w-4 h-4 text-indigo-400" />
                  <span className="font-medium">Math Functions Plotter</span>
                </button>
              )}

              {handleUploadToDrive && (
                <button
                  onClick={() => { handleUploadToDrive(); setIsToolsOpen(false); }}
                  className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs transition-colors text-left cursor-pointer ${
                    isDark ? "hover:bg-zinc-800 text-zinc-300" : "hover:bg-slate-100 text-slate-700"
                  }`}
                >
                  <Upload className="w-4 h-4 text-sky-400" />
                  <span className="font-medium">Upload to Google Drive</span>
                </button>
              )}

              {setShowSlidersBar && (
                <button
                  onClick={() => { setShowSlidersBar(prev => !prev); setIsToolsOpen(false); }}
                  className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs transition-colors text-left cursor-pointer ${
                    isDark ? "hover:bg-zinc-800 text-zinc-300" : "hover:bg-slate-100 text-slate-700"
                  }`}
                >
                  <Sliders className="w-4 h-4 text-amber-400" />
                  <span className="font-medium">Layout Sliders Bar</span>
                </button>
              )}

              {setIsShortcutsHelpOpen && (
                <button
                  onClick={() => { setIsShortcutsHelpOpen(true); setIsToolsOpen(false); }}
                  className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs transition-colors text-left cursor-pointer ${
                    isDark ? "hover:bg-zinc-800 text-zinc-300" : "hover:bg-slate-100 text-slate-700"
                  }`}
                >
                  <HelpCircle className="w-4 h-4 text-zinc-400" />
                  <span className="font-medium">Shortcuts & Help</span>
                </button>
              )}
            </div>
          )}
        </div>

        {/* SYSTEM HEALTH / ERROR MONITOR */}
        {setIsErrorLogCenterOpen && (
          <button
            onClick={() => setIsErrorLogCenterOpen(true)}
            className={`p-1.5 rounded-lg relative font-medium transition-colors cursor-pointer border ${
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

        {/* DARK / LIGHT MODE TOGGLE */}
        <button
          onClick={() => setTheme(prev => prev === "light" ? "dark" : "light")}
          className={`p-1.5 rounded-lg font-medium flex items-center justify-center transition-colors cursor-pointer border ${
            isDark
              ? "border-zinc-800 text-amber-400 hover:bg-zinc-800/80"
              : "border-slate-200 text-indigo-600 hover:bg-slate-100"
          }`}
          title={`Switch to ${isDark ? "Light" : "Dark"} Mode`}
        >
          {isDark ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
        </button>

        {/* GUEST MODE BADGE */}
        {isGuest && (
          <div 
            className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold hidden sm:flex items-center gap-1 ${
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
            className={`px-2 py-1 rounded-lg font-medium flex items-center gap-1 transition-colors cursor-pointer text-xs border ${
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
