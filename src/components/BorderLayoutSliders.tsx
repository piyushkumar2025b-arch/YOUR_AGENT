import React, { useState, useEffect } from "react";
import {
  Sliders,
  GripVertical,
  GripHorizontal,
  RotateCcw,
  Sparkles,
  Layers,
  Check,
  PanelLeft,
  Terminal as TerminalIcon,
  Palette,
  Layout,
  Type,
  Activity,
  Maximize2,
  Minimize2,
  X,
  Gauge,
  SlidersHorizontal,
  Grid,
  Sun,
  Moon,
  Zap,
  Box,
  Eye
} from "lucide-react";

export interface BorderSettings {
  borderRadius: number; // 0 to 32 px
  borderWidth: number; // 0.5 to 6 px
  borderOpacity: number; // 10% to 100%
  borderAccentColor: "indigo" | "emerald" | "cyan" | "rose" | "amber" | "purple" | "slate";
  borderGlow: boolean;
  headerHeight: number; // 48 to 96 px
  editorWidthPercent: number; // 20% to 80%
  backdropBlur: number; // 0 to 24 px
  shadowIntensity: number; // 0 to 100%
  uiTextScale: number; // 85% to 120%
  codeLineHeight: number; // 1.1 to 2.2
  canvasDotSpacing: number; // 20 to 80 px
  canvasAnimationSpeed: number; // 0.2 to 3.0
  panelGap: number; // 0 to 32 px
  panelPadding: number; // 4 to 32 px
}

interface BorderLayoutSlidersProps {
  theme: "light" | "dark";
  sidebarWidth: number;
  onSidebarWidthChange: (width: number) => void;
  terminalHeight: number;
  onTerminalHeightChange: (height: number) => void;
  editorFontSize: number;
  onEditorFontSizeChange: (size: number) => void;
  borderSettings: BorderSettings;
  onBorderSettingsChange: (settings: BorderSettings) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const DEFAULT_BORDER_SETTINGS: BorderSettings = {
  borderRadius: 12,
  borderWidth: 1,
  borderOpacity: 30,
  borderAccentColor: "indigo",
  borderGlow: false,
  headerHeight: 64,
  editorWidthPercent: 50,
  backdropBlur: 8,
  shadowIntensity: 40,
  uiTextScale: 100,
  codeLineHeight: 1.5,
  canvasDotSpacing: 40,
  canvasAnimationSpeed: 1.0,
  panelGap: 12,
  panelPadding: 16
};

export const ACCENT_COLOR_CLASSES: Record<
  BorderSettings["borderAccentColor"],
  { border: string; bg: string; text: string; shadow: string }
> = {
  indigo: {
    border: "border-indigo-500/50",
    bg: "bg-indigo-500/10",
    text: "text-indigo-400",
    shadow: "shadow-indigo-500/20"
  },
  emerald: {
    border: "border-emerald-500/50",
    bg: "bg-emerald-500/10",
    text: "text-emerald-400",
    shadow: "shadow-emerald-500/20"
  },
  cyan: {
    border: "border-cyan-500/50",
    bg: "bg-cyan-500/10",
    text: "text-cyan-400",
    shadow: "shadow-cyan-500/20"
  },
  rose: {
    border: "border-rose-500/50",
    bg: "bg-rose-500/10",
    text: "text-rose-400",
    shadow: "shadow-rose-500/20"
  },
  amber: {
    border: "border-amber-500/50",
    bg: "bg-amber-500/10",
    text: "text-amber-400",
    shadow: "shadow-amber-500/20"
  },
  purple: {
    border: "border-purple-500/50",
    bg: "bg-purple-500/10",
    text: "text-purple-400",
    shadow: "shadow-purple-500/20"
  },
  slate: {
    border: "border-slate-500/50",
    bg: "bg-slate-500/10",
    text: "text-slate-400",
    shadow: "shadow-slate-500/20"
  }
};

type SliderCategory = "layout" | "borders" | "typography" | "canvas";

export const BorderLayoutSlidersBar: React.FC<BorderLayoutSlidersProps> = ({
  theme,
  sidebarWidth,
  onSidebarWidthChange,
  terminalHeight,
  onTerminalHeightChange,
  editorFontSize,
  onEditorFontSizeChange,
  borderSettings,
  onBorderSettingsChange,
  isOpen,
  onClose
}) => {
  const [activeCategory, setActiveCategory] = useState<SliderCategory>("layout");

  if (!isOpen) return null;

  const updateSetting = <K extends keyof BorderSettings>(key: K, value: BorderSettings[K]) => {
    onBorderSettingsChange({
      ...borderSettings,
      [key]: value
    });
  };

  const handleResetDefaults = () => {
    onSidebarWidthChange(320);
    onTerminalHeightChange(220);
    onEditorFontSizeChange(13);
    onBorderSettingsChange(DEFAULT_BORDER_SETTINGS);
  };

  const applyPreset = (preset: "compact" | "modern" | "cyberpunk" | "spacious") => {
    if (preset === "compact") {
      onSidebarWidthChange(240);
      onTerminalHeightChange(140);
      onEditorFontSizeChange(12);
      onBorderSettingsChange({
        ...borderSettings,
        borderRadius: 4,
        borderWidth: 1,
        headerHeight: 52,
        editorWidthPercent: 50,
        panelGap: 6,
        panelPadding: 10,
        uiTextScale: 92
      });
    } else if (preset === "modern") {
      onSidebarWidthChange(320);
      onTerminalHeightChange(220);
      onEditorFontSizeChange(13);
      onBorderSettingsChange(DEFAULT_BORDER_SETTINGS);
    } else if (preset === "cyberpunk") {
      onSidebarWidthChange(360);
      onTerminalHeightChange(260);
      onEditorFontSizeChange(14);
      onBorderSettingsChange({
        ...borderSettings,
        borderRadius: 0,
        borderWidth: 2,
        borderOpacity: 80,
        borderAccentColor: "cyan",
        borderGlow: true,
        backdropBlur: 12,
        shadowIntensity: 80,
        canvasDotSpacing: 30,
        canvasAnimationSpeed: 1.8
      });
    } else if (preset === "spacious") {
      onSidebarWidthChange(420);
      onTerminalHeightChange(300);
      onEditorFontSizeChange(15);
      onBorderSettingsChange({
        ...borderSettings,
        borderRadius: 20,
        borderWidth: 1.5,
        borderOpacity: 40,
        borderAccentColor: "purple",
        borderGlow: false,
        headerHeight: 76,
        panelGap: 20,
        panelPadding: 24,
        uiTextScale: 108
      });
    }
  };

  return (
    <div
      className={`p-4 border-b shadow-2xl transition-all z-40 select-none ${
        theme === "dark"
          ? "bg-[#141418] border-zinc-800 text-white"
          : "bg-slate-100 border-slate-200 text-slate-800"
      }`}
    >
      <div className="max-w-7xl mx-auto space-y-3.5">
        {/* Header Title & Category Tabs Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-zinc-800/30">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-white shadow-lg">
              <Sliders className="w-4 h-4 animate-pulse" />
            </div>
            <div>
              <h3 className="text-xs font-black uppercase tracking-wider flex items-center gap-2">
                Universal Border & Layout Sliders Control Center
                <span className="px-2 py-0.5 text-[10px] font-mono rounded-full bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 font-bold">
                  16 Live Sliders
                </span>
              </h3>
              <p className="text-[11px] text-slate-400">
                Fine-tune every border width, radius, sidebar size, terminal height, gap, text scaling, and canvas physics in real-time.
              </p>
            </div>
          </div>

          {/* Quick Presets & Reset */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="hidden md:flex items-center gap-1 bg-zinc-900/80 p-1 rounded-xl border border-zinc-800 text-[10px]">
              <span className="text-slate-400 px-1 font-bold">Presets:</span>
              <button
                type="button"
                onClick={() => applyPreset("compact")}
                className="px-2 py-0.5 rounded-lg hover:bg-zinc-800 text-indigo-400 font-bold cursor-pointer"
              >
                Compact
              </button>
              <button
                type="button"
                onClick={() => applyPreset("modern")}
                className="px-2 py-0.5 rounded-lg hover:bg-zinc-800 text-emerald-400 font-bold cursor-pointer"
              >
                Standard IDE
              </button>
              <button
                type="button"
                onClick={() => applyPreset("cyberpunk")}
                className="px-2 py-0.5 rounded-lg hover:bg-zinc-800 text-cyan-400 font-bold cursor-pointer"
              >
                Neon Cyber
              </button>
              <button
                type="button"
                onClick={() => applyPreset("spacious")}
                className="px-2 py-0.5 rounded-lg hover:bg-zinc-800 text-purple-400 font-bold cursor-pointer"
              >
                Spacious Studio
              </button>
            </div>

            <button
              type="button"
              onClick={handleResetDefaults}
              className="px-3 py-1.5 rounded-xl bg-zinc-800/80 hover:bg-zinc-700 text-slate-300 text-xs font-bold flex items-center gap-1.5 border border-zinc-700 cursor-pointer transition-all"
              title="Reset all sliders to default"
            >
              <RotateCcw className="w-3.5 h-3.5 text-amber-400" /> Reset
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl bg-zinc-800/50 hover:bg-zinc-700 text-slate-400 hover:text-white cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Category Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-zinc-800/20 pb-2 overflow-x-auto scrollbar-none">
          <button
            type="button"
            onClick={() => setActiveCategory("layout")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
              activeCategory === "layout"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/20"
                : "bg-zinc-900/60 hover:bg-zinc-800 text-slate-400"
            }`}
          >
            <PanelLeft className="w-3.5 h-3.5 text-indigo-300" /> 📐 Layout & Dimensions
          </button>

          <button
            type="button"
            onClick={() => setActiveCategory("borders")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
              activeCategory === "borders"
                ? "bg-cyan-600 text-white shadow-md shadow-cyan-500/20"
                : "bg-zinc-900/60 hover:bg-zinc-800 text-slate-400"
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-cyan-300" /> 🖼️ Borders, Radii & Glass FX
          </button>

          <button
            type="button"
            onClick={() => setActiveCategory("typography")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
              activeCategory === "typography"
                ? "bg-amber-600 text-white shadow-md shadow-amber-500/20"
                : "bg-zinc-900/60 hover:bg-zinc-800 text-slate-400"
            }`}
          >
            <Type className="w-3.5 h-3.5 text-amber-300" /> 🔤 Typography & Editor
          </button>

          <button
            type="button"
            onClick={() => setActiveCategory("canvas")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
              activeCategory === "canvas"
                ? "bg-emerald-600 text-white shadow-md shadow-emerald-500/20"
                : "bg-zinc-900/60 hover:bg-zinc-800 text-slate-400"
            }`}
          >
            <Activity className="w-3.5 h-3.5 text-emerald-300" /> 🎨 Canvas Grid & Physics
          </button>
        </div>

        {/* CATEGORY 1: LAYOUT & DIMENSIONS SLIDERS */}
        {activeCategory === "layout" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 pt-1">
            {/* 1. Sidebar Width Slider */}
            <div className="p-3 rounded-2xl bg-zinc-900/70 border border-zinc-800/80 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold flex items-center gap-1.5 text-indigo-400">
                  <PanelLeft className="w-3.5 h-3.5" /> Sidebar Width
                </span>
                <span className="font-mono text-[11px] bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded border border-indigo-500/30 font-bold">
                  {sidebarWidth}px
                </span>
              </div>
              <input
                type="range"
                min={180}
                max={650}
                step={5}
                value={sidebarWidth}
                onChange={(e) => onSidebarWidthChange(Number(e.target.value))}
                className="w-full accent-indigo-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <button type="button" onClick={() => onSidebarWidthChange(220)} className="hover:text-indigo-400">
                  220px
                </button>
                <button type="button" onClick={() => onSidebarWidthChange(340)} className="hover:text-indigo-400 font-bold">
                  340px
                </button>
                <button type="button" onClick={() => onSidebarWidthChange(500)} className="hover:text-indigo-400">
                  500px
                </button>
              </div>
            </div>

            {/* 2. Top Header Height Slider */}
            <div className="p-3 rounded-2xl bg-zinc-900/70 border border-zinc-800/80 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold flex items-center gap-1.5 text-purple-400">
                  <Box className="w-3.5 h-3.5" /> Top Header Height
                </span>
                <span className="font-mono text-[11px] bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded border border-purple-500/30 font-bold">
                  {borderSettings.headerHeight}px
                </span>
              </div>
              <input
                type="range"
                min={48}
                max={96}
                step={2}
                value={borderSettings.headerHeight}
                onChange={(e) => updateSetting("headerHeight", Number(e.target.value))}
                className="w-full accent-purple-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <button type="button" onClick={() => updateSetting("headerHeight", 52)} className="hover:text-purple-400">
                  52px (Slim)
                </button>
                <button type="button" onClick={() => updateSetting("headerHeight", 64)} className="hover:text-purple-400 font-bold">
                  64px (Std)
                </button>
                <button type="button" onClick={() => updateSetting("headerHeight", 84)} className="hover:text-purple-400">
                  84px (Tall)
                </button>
              </div>
            </div>

            {/* 3. Terminal Height Slider */}
            <div className="p-3 rounded-2xl bg-zinc-900/70 border border-zinc-800/80 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold flex items-center gap-1.5 text-emerald-400">
                  <TerminalIcon className="w-3.5 h-3.5" /> Terminal Panel Height
                </span>
                <span className="font-mono text-[11px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded border border-emerald-500/30 font-bold">
                  {terminalHeight}px
                </span>
              </div>
              <input
                type="range"
                min={100}
                max={500}
                step={10}
                value={terminalHeight}
                onChange={(e) => onTerminalHeightChange(Number(e.target.value))}
                className="w-full accent-emerald-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <button type="button" onClick={() => onTerminalHeightChange(120)} className="hover:text-emerald-400">
                  120px
                </button>
                <button type="button" onClick={() => onTerminalHeightChange(220)} className="hover:text-emerald-400 font-bold">
                  220px
                </button>
                <button type="button" onClick={() => onTerminalHeightChange(380)} className="hover:text-emerald-400">
                  380px
                </button>
              </div>
            </div>

            {/* 4. Editor vs Preview Split Ratio Slider */}
            <div className="p-3 rounded-2xl bg-zinc-900/70 border border-zinc-800/80 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold flex items-center gap-1.5 text-cyan-400">
                  <Eye className="w-3.5 h-3.5" /> Editor / Preview Split
                </span>
                <span className="font-mono text-[11px] bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded border border-cyan-500/30 font-bold">
                  {borderSettings.editorWidthPercent}% / {100 - borderSettings.editorWidthPercent}%
                </span>
              </div>
              <input
                type="range"
                min={20}
                max={80}
                step={1}
                value={borderSettings.editorWidthPercent}
                onChange={(e) => updateSetting("editorWidthPercent", Number(e.target.value))}
                className="w-full accent-cyan-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <button type="button" onClick={() => updateSetting("editorWidthPercent", 30)} className="hover:text-cyan-400">
                  30:70
                </button>
                <button type="button" onClick={() => updateSetting("editorWidthPercent", 50)} className="hover:text-cyan-400 font-bold">
                  50:50
                </button>
                <button type="button" onClick={() => updateSetting("editorWidthPercent", 70)} className="hover:text-cyan-400">
                  70:30
                </button>
              </div>
            </div>

            {/* 5. Panel Gap & Spacing Slider */}
            <div className="p-3 rounded-2xl bg-zinc-900/70 border border-zinc-800/80 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold flex items-center gap-1.5 text-rose-400">
                  <Grid className="w-3.5 h-3.5" /> Panel Gap Spacing
                </span>
                <span className="font-mono text-[11px] bg-rose-500/20 text-rose-300 px-2 py-0.5 rounded border border-rose-500/30 font-bold">
                  {borderSettings.panelGap}px
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={32}
                step={2}
                value={borderSettings.panelGap}
                onChange={(e) => updateSetting("panelGap", Number(e.target.value))}
                className="w-full accent-rose-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <button type="button" onClick={() => updateSetting("panelGap", 0)} className="hover:text-rose-400">
                  0px Seamless
                </button>
                <button type="button" onClick={() => updateSetting("panelGap", 12)} className="hover:text-rose-400 font-bold">
                  12px Balanced
                </button>
                <button type="button" onClick={() => updateSetting("panelGap", 24)} className="hover:text-rose-400">
                  24px Wide
                </button>
              </div>
            </div>

            {/* 6. Panel Inner Padding Slider */}
            <div className="p-3 rounded-2xl bg-zinc-900/70 border border-zinc-800/80 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold flex items-center gap-1.5 text-amber-400">
                  <SlidersHorizontal className="w-3.5 h-3.5" /> Panel Inner Padding
                </span>
                <span className="font-mono text-[11px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded border border-amber-500/30 font-bold">
                  {borderSettings.panelPadding}px
                </span>
              </div>
              <input
                type="range"
                min={4}
                max={32}
                step={2}
                value={borderSettings.panelPadding}
                onChange={(e) => updateSetting("panelPadding", Number(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <button type="button" onClick={() => updateSetting("panelPadding", 8)} className="hover:text-amber-400">
                  8px Dense
                </button>
                <button type="button" onClick={() => updateSetting("panelPadding", 16)} className="hover:text-amber-400 font-bold">
                  16px Std
                </button>
                <button type="button" onClick={() => updateSetting("panelPadding", 28)} className="hover:text-amber-400">
                  28px Airy
                </button>
              </div>
            </div>
          </div>
        )}

        {/* CATEGORY 2: BORDERS, RADII & GLASS FX SLIDERS */}
        {activeCategory === "borders" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 pt-1">
            {/* 1. Global Border Radius Slider */}
            <div className="p-3 rounded-2xl bg-zinc-900/70 border border-zinc-800/80 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold flex items-center gap-1.5 text-cyan-400">
                  <Layout className="w-3.5 h-3.5" /> Border Corner Radius
                </span>
                <span className="font-mono text-[11px] bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded border border-cyan-500/30 font-bold">
                  {borderSettings.borderRadius}px
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={32}
                step={1}
                value={borderSettings.borderRadius}
                onChange={(e) => updateSetting("borderRadius", Number(e.target.value))}
                className="w-full accent-cyan-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <button type="button" onClick={() => updateSetting("borderRadius", 0)} className="hover:text-cyan-400">
                  0px Sharp
                </button>
                <button type="button" onClick={() => updateSetting("borderRadius", 12)} className="hover:text-cyan-400 font-bold">
                  12px Smooth
                </button>
                <button type="button" onClick={() => updateSetting("borderRadius", 28)} className="hover:text-cyan-400">
                  28px Soft
                </button>
              </div>
            </div>

            {/* 2. Border Thickness Slider */}
            <div className="p-3 rounded-2xl bg-zinc-900/70 border border-zinc-800/80 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold flex items-center gap-1.5 text-rose-400">
                  <Layers className="w-3.5 h-3.5" /> Border Thickness
                </span>
                <span className="font-mono text-[11px] bg-rose-500/20 text-rose-300 px-2 py-0.5 rounded border border-rose-500/30 font-bold">
                  {borderSettings.borderWidth}px
                </span>
              </div>
              <input
                type="range"
                min={0.5}
                max={6}
                step={0.5}
                value={borderSettings.borderWidth}
                onChange={(e) => updateSetting("borderWidth", Number(e.target.value))}
                className="w-full accent-rose-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <button type="button" onClick={() => updateSetting("borderWidth", 0.5)} className="hover:text-rose-400">
                  0.5px Hairline
                </button>
                <button type="button" onClick={() => updateSetting("borderWidth", 1.5)} className="hover:text-rose-400 font-bold">
                  1.5px Solid
                </button>
                <button type="button" onClick={() => updateSetting("borderWidth", 4)} className="hover:text-rose-400">
                  4px Thick
                </button>
              </div>
            </div>

            {/* 3. Border Opacity Slider */}
            <div className="p-3 rounded-2xl bg-zinc-900/70 border border-zinc-800/80 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold flex items-center gap-1.5 text-indigo-400">
                  <Eye className="w-3.5 h-3.5" /> Border Opacity
                </span>
                <span className="font-mono text-[11px] bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded border border-indigo-500/30 font-bold">
                  {borderSettings.borderOpacity}%
                </span>
              </div>
              <input
                type="range"
                min={10}
                max={100}
                step={5}
                value={borderSettings.borderOpacity}
                onChange={(e) => updateSetting("borderOpacity", Number(e.target.value))}
                className="w-full accent-indigo-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <button type="button" onClick={() => updateSetting("borderOpacity", 15)} className="hover:text-indigo-400">
                  15% Faint
                </button>
                <button type="button" onClick={() => updateSetting("borderOpacity", 40)} className="hover:text-indigo-400 font-bold">
                  40% Medium
                </button>
                <button type="button" onClick={() => updateSetting("borderOpacity", 90)} className="hover:text-indigo-400">
                  90% Vivid
                </button>
              </div>
            </div>

            {/* 4. Backdrop Blur Glassmorphism Slider */}
            <div className="p-3 rounded-2xl bg-zinc-900/70 border border-zinc-800/80 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold flex items-center gap-1.5 text-purple-400">
                  <Sparkles className="w-3.5 h-3.5" /> Glass Backdrop Blur
                </span>
                <span className="font-mono text-[11px] bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded border border-purple-500/30 font-bold">
                  {borderSettings.backdropBlur}px
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={24}
                step={2}
                value={borderSettings.backdropBlur}
                onChange={(e) => updateSetting("backdropBlur", Number(e.target.value))}
                className="w-full accent-purple-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <button type="button" onClick={() => updateSetting("backdropBlur", 0)} className="hover:text-purple-400">
                  0px None
                </button>
                <button type="button" onClick={() => updateSetting("backdropBlur", 8)} className="hover:text-purple-400 font-bold">
                  8px Glass
                </button>
                <button type="button" onClick={() => updateSetting("backdropBlur", 20)} className="hover:text-purple-400">
                  20px Frosted
                </button>
              </div>
            </div>

            {/* 5. Shadow Depth Slider */}
            <div className="p-3 rounded-2xl bg-zinc-900/70 border border-zinc-800/80 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold flex items-center gap-1.5 text-emerald-400">
                  <Box className="w-3.5 h-3.5" /> Panel Shadow Depth
                </span>
                <span className="font-mono text-[11px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded border border-emerald-500/30 font-bold">
                  {borderSettings.shadowIntensity}%
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                step={5}
                value={borderSettings.shadowIntensity}
                onChange={(e) => updateSetting("shadowIntensity", Number(e.target.value))}
                className="w-full accent-emerald-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <button type="button" onClick={() => updateSetting("shadowIntensity", 0)} className="hover:text-emerald-400">
                  Flat
                </button>
                <button type="button" onClick={() => updateSetting("shadowIntensity", 40)} className="hover:text-emerald-400 font-bold">
                  Medium
                </button>
                <button type="button" onClick={() => updateSetting("shadowIntensity", 90)} className="hover:text-emerald-400">
                  Deep 3D
                </button>
              </div>
            </div>

            {/* Accent Color & Glow Control Panel */}
            <div className="p-3 rounded-2xl bg-zinc-900/70 border border-zinc-800/80 space-y-2 col-span-1 lg:col-span-3 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-300 flex items-center gap-1">
                  <Palette className="w-3.5 h-3.5 text-amber-400" /> Border Accent Hue:
                </span>
                <div className="flex items-center gap-1.5">
                  {(["indigo", "emerald", "cyan", "rose", "amber", "purple", "slate"] as const).map((color) => {
                    const colorBgMap: Record<string, string> = {
                      indigo: "bg-indigo-500",
                      emerald: "bg-emerald-500",
                      cyan: "bg-cyan-500",
                      rose: "bg-rose-500",
                      amber: "bg-amber-500",
                      purple: "bg-purple-500",
                      slate: "bg-slate-500"
                    };
                    return (
                      <button
                        key={color}
                        type="button"
                        onClick={() => updateSetting("borderAccentColor", color)}
                        className={`w-6 h-6 rounded-full ${colorBgMap[color]} transition-all cursor-pointer flex items-center justify-center ${
                          borderSettings.borderAccentColor === color
                            ? "ring-2 ring-white ring-offset-2 ring-offset-zinc-900 scale-110 shadow-lg"
                            : "opacity-60 hover:opacity-100"
                        }`}
                        title={`Set border accent to ${color}`}
                      >
                        {borderSettings.borderAccentColor === color && (
                          <Check className="w-3.5 h-3.5 text-white stroke-[3]" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center gap-2 border-l border-zinc-800/80 pl-4">
                <label htmlFor="borderGlow" className="text-xs font-bold text-slate-200 flex items-center gap-1.5 cursor-pointer">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  Neon Border Glow Accent:
                </label>
                <input
                  type="checkbox"
                  id="borderGlow"
                  checked={borderSettings.borderGlow}
                  onChange={(e) => updateSetting("borderGlow", e.target.checked)}
                  className="rounded bg-zinc-800 border-zinc-700 text-indigo-500 cursor-pointer w-4 h-4"
                />
              </div>
            </div>
          </div>
        )}

        {/* CATEGORY 3: TYPOGRAPHY & EDITOR SLIDERS */}
        {activeCategory === "typography" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 pt-1">
            {/* 1. Code Editor Font Size Slider */}
            <div className="p-3 rounded-2xl bg-zinc-900/70 border border-zinc-800/80 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold flex items-center gap-1.5 text-amber-400">
                  <Type className="w-3.5 h-3.5" /> Code Editor Font Size
                </span>
                <span className="font-mono text-[11px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded border border-amber-500/30 font-bold">
                  {editorFontSize}px
                </span>
              </div>
              <input
                type="range"
                min={10}
                max={24}
                step={1}
                value={editorFontSize}
                onChange={(e) => onEditorFontSizeChange(Number(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <button type="button" onClick={() => onEditorFontSizeChange(11)} className="hover:text-amber-400">
                  11px Small
                </button>
                <button type="button" onClick={() => onEditorFontSizeChange(14)} className="hover:text-amber-400 font-bold">
                  14px Medium
                </button>
                <button type="button" onClick={() => onEditorFontSizeChange(20)} className="hover:text-amber-400">
                  20px Large
                </button>
              </div>
            </div>

            {/* 2. Code Editor Line Height Slider */}
            <div className="p-3 rounded-2xl bg-zinc-900/70 border border-zinc-800/80 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold flex items-center gap-1.5 text-indigo-400">
                  <Type className="w-3.5 h-3.5" /> Code Line Height
                </span>
                <span className="font-mono text-[11px] bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded border border-indigo-500/30 font-bold">
                  {borderSettings.codeLineHeight}x
                </span>
              </div>
              <input
                type="range"
                min={1.1}
                max={2.2}
                step={0.1}
                value={borderSettings.codeLineHeight}
                onChange={(e) => updateSetting("codeLineHeight", Number(e.target.value))}
                className="w-full accent-indigo-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <button type="button" onClick={() => updateSetting("codeLineHeight", 1.2)} className="hover:text-indigo-400">
                  1.2x Compact
                </button>
                <button type="button" onClick={() => updateSetting("codeLineHeight", 1.5)} className="hover:text-indigo-400 font-bold">
                  1.5x Normal
                </button>
                <button type="button" onClick={() => updateSetting("codeLineHeight", 2.0)} className="hover:text-indigo-400">
                  2.0x Double
                </button>
              </div>
            </div>

            {/* 3. Global UI Text Scaling Factor Slider */}
            <div className="p-3 rounded-2xl bg-zinc-900/70 border border-zinc-800/80 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold flex items-center gap-1.5 text-emerald-400">
                  <Maximize2 className="w-3.5 h-3.5" /> Global UI Text Scale
                </span>
                <span className="font-mono text-[11px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded border border-emerald-500/30 font-bold">
                  {borderSettings.uiTextScale}%
                </span>
              </div>
              <input
                type="range"
                min={85}
                max={125}
                step={5}
                value={borderSettings.uiTextScale}
                onChange={(e) => updateSetting("uiTextScale", Number(e.target.value))}
                className="w-full accent-emerald-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <button type="button" onClick={() => updateSetting("uiTextScale", 90)} className="hover:text-emerald-400">
                  90% Compact
                </button>
                <button type="button" onClick={() => updateSetting("uiTextScale", 100)} className="hover:text-emerald-400 font-bold">
                  100% Default
                </button>
                <button type="button" onClick={() => updateSetting("uiTextScale", 115)} className="hover:text-emerald-400">
                  115% High Visibility
                </button>
              </div>
            </div>
          </div>
        )}

        {/* CATEGORY 4: CANVAS GRID & ANIMATION PHYSICS SLIDERS */}
        {activeCategory === "canvas" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-3.5 pt-1">
            {/* 1. Canvas Background Grid Density Slider */}
            <div className="p-3 rounded-2xl bg-zinc-900/70 border border-zinc-800/80 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold flex items-center gap-1.5 text-cyan-400">
                  <Grid className="w-3.5 h-3.5" /> Background Canvas Grid Density
                </span>
                <span className="font-mono text-[11px] bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded border border-cyan-500/30 font-bold">
                  {borderSettings.canvasDotSpacing}px Spacing
                </span>
              </div>
              <input
                type="range"
                min={20}
                max={80}
                step={5}
                value={borderSettings.canvasDotSpacing}
                onChange={(e) => updateSetting("canvasDotSpacing", Number(e.target.value))}
                className="w-full accent-cyan-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <button type="button" onClick={() => updateSetting("canvasDotSpacing", 20)} className="hover:text-cyan-400">
                  20px Ultra Dense
                </button>
                <button type="button" onClick={() => updateSetting("canvasDotSpacing", 40)} className="hover:text-cyan-400 font-bold">
                  40px Standard
                </button>
                <button type="button" onClick={() => updateSetting("canvasDotSpacing", 70)} className="hover:text-cyan-400">
                  70px Sparse
                </button>
              </div>
            </div>

            {/* 2. Canvas Animation Speed Multiplier Slider */}
            <div className="p-3 rounded-2xl bg-zinc-900/70 border border-zinc-800/80 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold flex items-center gap-1.5 text-purple-400">
                  <Zap className="w-3.5 h-3.5" /> Canvas Particle Speed Multiplier
                </span>
                <span className="font-mono text-[11px] bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded border border-purple-500/30 font-bold">
                  {borderSettings.canvasAnimationSpeed}x Speed
                </span>
              </div>
              <input
                type="range"
                min={0.2}
                max={3.0}
                step={0.1}
                value={borderSettings.canvasAnimationSpeed}
                onChange={(e) => updateSetting("canvasAnimationSpeed", Number(e.target.value))}
                className="w-full accent-purple-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <button type="button" onClick={() => updateSetting("canvasAnimationSpeed", 0.3)} className="hover:text-purple-400">
                  0.3x Zen Slow
                </button>
                <button type="button" onClick={() => updateSetting("canvasAnimationSpeed", 1.0)} className="hover:text-purple-400 font-bold">
                  1.0x Normal
                </button>
                <button type="button" onClick={() => updateSetting("canvasAnimationSpeed", 2.5)} className="hover:text-purple-400">
                  2.5x Hyper
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

{/* Draggable Vertical Splitter Slider Handle Component */}
export const VerticalResizeSliderHandle: React.FC<{
  currentWidth: number;
  minWidth?: number;
  maxWidth?: number;
  onWidthChange: (newWidth: number) => void;
  label?: string;
  theme?: "light" | "dark";
}> = ({ currentWidth, minWidth = 240, maxWidth = 650, onWidthChange, label = "Sidebar Width", theme = "dark" }) => {
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    if (!isDragging) return;

    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";

    const handleMouseMove = (e: MouseEvent) => {
      e.preventDefault();
      const newWidth = Math.min(maxWidth, Math.max(minWidth, e.clientX));
      onWidthChange(newWidth);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, minWidth, maxWidth, onWidthChange]);

  return (
    <div
      onMouseDown={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDoubleClick={() => onWidthChange(340)}
      className={`relative w-2 group cursor-col-resize select-none shrink-0 transition-colors flex items-center justify-center z-10 ${
        isDragging
          ? "bg-indigo-500 text-white z-20 shadow-lg shadow-indigo-500/50"
          : theme === "dark"
          ? "bg-zinc-800/80 hover:bg-indigo-500/80"
          : "bg-slate-300 hover:bg-indigo-500"
      }`}
      title={`Drag to adjust ${label} (${currentWidth}px). Double-click to reset.`}
    >
      {/* Slider Knob Icon Handle */}
      <div className="p-1 rounded-md bg-zinc-900 border border-zinc-700 text-indigo-400 group-hover:scale-110 transition-transform shadow-md">
        <GripVertical className="w-3.5 h-3.5" />
      </div>

      {/* Hover Tooltip showing live pixel slider width */}
      <div className="absolute top-1/2 -translate-y-1/2 left-4 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity bg-zinc-900 text-white border border-zinc-700 text-[10px] font-mono font-bold px-2 py-1 rounded shadow-xl whitespace-nowrap z-50">
        {label}: <span className="text-indigo-400">{currentWidth}px</span> (Double-click to reset)
      </div>
    </div>
  );
};

{/* Draggable Horizontal Splitter Slider Handle Component */}
export const HorizontalResizeSliderHandle: React.FC<{
  currentHeight: number;
  minHeight?: number;
  maxHeight?: number;
  onHeightChange: (newHeight: number) => void;
  label?: string;
  theme?: "light" | "dark";
}> = ({ currentHeight, minHeight = 48, maxHeight = 600, onHeightChange, label = "Terminal Height", theme = "dark" }) => {
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      const windowHeight = window.innerHeight;
      const newHeight = Math.min(maxHeight, Math.max(minHeight, windowHeight - e.clientY));
      onHeightChange(newHeight);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, minHeight, maxHeight, onHeightChange]);

  return (
    <div
      onMouseDown={() => setIsDragging(true)}
      className={`relative h-2 group cursor-row-resize select-none shrink-0 transition-colors flex items-center justify-center ${
        isDragging
          ? "bg-emerald-500 text-white z-50 shadow-lg shadow-emerald-500/50"
          : theme === "dark"
          ? "bg-zinc-800/80 hover:bg-emerald-500/80"
          : "bg-slate-300 hover:bg-emerald-500"
      }`}
      title={`Drag border slider to adjust ${label} (${currentHeight}px)`}
    >
      {/* Slider Knob Icon Handle */}
      <div className="p-0.5 px-2 rounded-md bg-zinc-900 border border-zinc-700 text-emerald-400 group-hover:scale-110 transition-transform shadow-md">
        <GripHorizontal className="w-3.5 h-3.5" />
      </div>

      {/* Hover Tooltip showing live height */}
      <div className="absolute left-1/2 -translate-x-1/2 -top-7 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity bg-zinc-900 text-white border border-zinc-700 text-[10px] font-mono font-bold px-2 py-0.5 rounded shadow-xl whitespace-nowrap z-50">
        {label}: <span className="text-emerald-400">{currentHeight}px</span>
      </div>
    </div>
  );
};
