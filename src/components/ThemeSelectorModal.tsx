import React from "react";
import { Palette, Check, Sparkles, Moon, Sun, Monitor } from "lucide-react";

export interface ThemePreset {
  id: string;
  name: string;
  description: string;
  bgClass: string;
  cardClass: string;
  accentClass: string;
  accentColor: string;
  previewGradient: string;
  isDark: boolean;
}

export const THEME_PRESETS: ThemePreset[] = [
  {
    id: "dark",
    name: "Obsidian Dark (Default)",
    description: "Sleek, high-contrast dark palette for deep coding focus",
    bgClass: "bg-[#121214] text-zinc-100",
    cardClass: "bg-zinc-900 border-zinc-800 text-zinc-100",
    accentClass: "bg-blue-600 text-white",
    accentColor: "#3b82f6",
    previewGradient: "from-zinc-900 via-zinc-800 to-blue-900",
    isDark: true
  },
  {
    id: "cyberpunk",
    name: "Cyberpunk Neon",
    description: "Vibrant neon cyan and hot magenta dark interface",
    bgClass: "bg-[#0a0a12] text-cyan-100",
    cardClass: "bg-[#121224] border-cyan-500/30 text-cyan-100",
    accentClass: "bg-cyan-500 text-black font-extrabold",
    accentColor: "#06b6d4",
    previewGradient: "from-cyan-900 via-fuchsia-950 to-pink-900",
    isDark: true
  },
  {
    id: "midnight",
    name: "Midnight Deep Navy",
    description: "Sophisticated deep ocean navy blue & slate accents",
    bgClass: "bg-[#0b132b] text-slate-100",
    cardClass: "bg-[#1c2541] border-slate-700 text-slate-100",
    accentClass: "bg-indigo-500 text-white",
    accentColor: "#6366f1",
    previewGradient: "from-slate-900 via-sky-950 to-indigo-900",
    isDark: true
  },
  {
    id: "emerald",
    name: "Forest Emerald",
    description: "Calm dark jade green canvas for reduced eye fatigue",
    bgClass: "bg-[#061e14] text-emerald-100",
    cardClass: "bg-[#0d2d20] border-emerald-800/60 text-emerald-100",
    accentClass: "bg-emerald-500 text-black font-bold",
    accentColor: "#10b981",
    previewGradient: "from-emerald-950 via-teal-900 to-green-950",
    isDark: true
  },
  {
    id: "dracula",
    name: "Dracula Violet",
    description: "Classic gothic dark purple & magenta developer theme",
    bgClass: "bg-[#1e1e2e] text-purple-100",
    cardClass: "bg-[#282a36] border-purple-500/30 text-purple-100",
    accentClass: "bg-purple-500 text-white",
    accentColor: "#a855f7",
    previewGradient: "from-purple-950 via-slate-900 to-fuchsia-950",
    isDark: true
  },
  {
    id: "matrix",
    name: "Matrix Green Terminal",
    description: "Hacker green monospace CRT aesthetic",
    bgClass: "bg-[#030d03] text-green-400 font-mono",
    cardClass: "bg-[#081a08] border-green-500/40 text-green-300 font-mono",
    accentClass: "bg-green-500 text-black font-extrabold",
    accentColor: "#22c55e",
    previewGradient: "from-green-950 via-black to-emerald-950",
    isDark: true
  },
  {
    id: "sunset",
    name: "Sunset Amber",
    description: "Warm copper, amber gold, and dark mahogany palette",
    bgClass: "bg-[#1c120c] text-amber-100",
    cardClass: "bg-[#2e1d13] border-amber-800/50 text-amber-100",
    accentClass: "bg-amber-500 text-black font-bold",
    accentColor: "#f59e0b",
    previewGradient: "from-amber-950 via-orange-950 to-amber-900",
    isDark: true
  },
  {
    id: "light",
    name: "Clean Minimal Light",
    description: "Crisp white background with high-contrast typography",
    bgClass: "bg-slate-50 text-slate-800",
    cardClass: "bg-white border-slate-200 text-slate-800",
    accentClass: "bg-blue-600 text-white",
    accentColor: "#2563eb",
    previewGradient: "from-slate-100 via-blue-50 to-slate-200",
    isDark: false
  }
];

interface ThemeSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTheme: string;
  onSelectTheme: (themeId: string) => void;
}

export const ThemeSelectorModal: React.FC<ThemeSelectorModalProps> = ({
  isOpen,
  onClose,
  currentTheme,
  onSelectTheme
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-zinc-950 border border-zinc-800 text-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* HEADER */}
        <div className="p-5 border-b border-zinc-800 bg-zinc-900/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 text-white shadow-lg shadow-purple-500/20">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold">Theme & Visual Customizer</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Default open mode is Dark. Select your preferred color palette.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-zinc-800 cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* THEMES GRID */}
        <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[70vh] overflow-y-auto custom-scrollbar">
          {THEME_PRESETS.map((preset) => {
            const isSelected = currentTheme === preset.id;
            return (
              <div
                key={preset.id}
                onClick={() => {
                  onSelectTheme(preset.id);
                  onClose();
                }}
                className={`p-4 rounded-xl border-2 transition-all cursor-pointer flex flex-col justify-between gap-3 relative overflow-hidden group ${
                  isSelected
                    ? "border-blue-500 bg-zinc-900 shadow-xl ring-2 ring-blue-500/30"
                    : "border-zinc-800 bg-zinc-900/50 hover:border-zinc-700 hover:bg-zinc-900"
                }`}
              >
                <div className={`h-2.5 w-full rounded-full bg-gradient-to-r ${preset.previewGradient}`} />

                <div>
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-white flex items-center gap-2">
                      {preset.isDark ? <Moon className="w-3.5 h-3.5 text-blue-400" /> : <Sun className="w-3.5 h-3.5 text-amber-500" />}
                      {preset.name}
                    </h3>

                    {isSelected && (
                      <span className="p-1 rounded-full bg-blue-500 text-white text-[10px]">
                        <Check className="w-3 h-3" />
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">{preset.description}</p>
                </div>

                <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono border-t border-zinc-800/80 pt-2">
                  <span>{preset.isDark ? "Dark Palette" : "Light Palette"}</span>
                  <span className="flex items-center gap-1 font-bold text-slate-300">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: preset.accentColor }} />
                    Accent
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* FOOTER */}
        <div className="p-4 border-t border-zinc-800 bg-zinc-900/50 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
