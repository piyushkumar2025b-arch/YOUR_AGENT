import React from "react";
import {
  Pencil,
  Highlighter,
  Zap,
  Wind,
  Eraser,
  PaintBucket,
  Square,
  Circle,
  ArrowRight,
  Star,
  Heart,
  MessageSquare,
  Sparkles,
  Undo2,
  Redo2,
  Trash2,
  Wand2,
  Palette
} from "lucide-react";

export type BrushMode =
  | "pencil"
  | "highlighter"
  | "neon"
  | "airbrush"
  | "calligraphy"
  | "eraser"
  | "ai_erase_mask"
  | "rect"
  | "circle"
  | "arrow"
  | "star"
  | "heart"
  | "bubble";

interface PhotoDrawingPaintToolbarProps {
  brushMode: BrushMode;
  setBrushMode: (mode: BrushMode) => void;
  brushColor: string;
  setBrushColor: (color: string) => void;
  brushSize: number;
  setBrushSize: (size: number) => void;
  brushOpacity: number;
  setBrushOpacity: (opacity: number) => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onClearDrawings: () => void;
  onApplyAiMagicInpaint?: () => void;
  isAiInpainting?: boolean;
  drawnStrokesCount: number;
}

const PRESET_SWATCHES = [
  "#f43f5e", // Crimson Red
  "#fb923c", // Vibrant Orange
  "#facc15", // Bright Gold Yellow
  "#4ade80", // Neon Emerald
  "#38bdf8", // Cyber Cyan
  "#818cf8", // Electric Blue
  "#c084fc", // Purple Glow
  "#f472b6", // Hot Pink
  "#ffffff", // Pure White
  "#000000", // Dark Black
  "#22c55e", // Matrix Green
  "#06b6d4", // Deep Aqua
  "#3b82f6", // Royal Sapphire
  "#a855f7", // Deep Violet
  "#e11d48", // Rose Red
  "#fbbf24"  // Amber Warm
];

export const PhotoDrawingPaintToolbar: React.FC<PhotoDrawingPaintToolbarProps> = ({
  brushMode,
  setBrushMode,
  brushColor,
  setBrushColor,
  brushSize,
  setBrushSize,
  brushOpacity,
  setBrushOpacity,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  onClearDrawings,
  onApplyAiMagicInpaint,
  isAiInpainting = false,
  drawnStrokesCount
}) => {
  return (
    <div className="space-y-4 p-1">
      {/* 1. Primary Brush & Tool Types */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <Palette className="w-3.5 h-3.5 text-rose-400" />
            <span>Brush & Paint Tools</span>
          </span>
          <span className="text-[10px] font-mono font-bold text-slate-400 bg-zinc-950 px-2 py-0.5 rounded-full border border-zinc-800">
            {drawnStrokesCount} {drawnStrokesCount === 1 ? "stroke" : "strokes"}
          </span>
        </div>

        <div className="grid grid-cols-4 gap-1.5">
          <button
            onClick={() => setBrushMode("pencil")}
            className={`p-2 rounded-xl border text-xs font-bold transition-all flex flex-col items-center gap-1 cursor-pointer ${
              brushMode === "pencil"
                ? "bg-rose-600 text-white border-rose-500 shadow-md scale-102"
                : "bg-zinc-950 border-zinc-800 text-slate-300 hover:border-slate-700"
            }`}
            title="Pencil: Precision solid stroke"
          >
            <Pencil className="w-3.5 h-3.5" />
            <span className="text-[10px]">Pencil</span>
          </button>

          <button
            onClick={() => setBrushMode("highlighter")}
            className={`p-2 rounded-xl border text-xs font-bold transition-all flex flex-col items-center gap-1 cursor-pointer ${
              brushMode === "highlighter"
                ? "bg-rose-600 text-white border-rose-500 shadow-md scale-102"
                : "bg-zinc-950 border-zinc-800 text-slate-300 hover:border-slate-700"
            }`}
            title="Highlighter: Semi-transparent marker overlay"
          >
            <Highlighter className="w-3.5 h-3.5" />
            <span className="text-[10px]">Marker</span>
          </button>

          <button
            onClick={() => setBrushMode("neon")}
            className={`p-2 rounded-xl border text-xs font-bold transition-all flex flex-col items-center gap-1 cursor-pointer ${
              brushMode === "neon"
                ? "bg-purple-600 text-white border-purple-500 shadow-md scale-102"
                : "bg-zinc-950 border-zinc-800 text-purple-300 hover:border-purple-500/50"
            }`}
            title="Neon Glow: Electric luminescent stroke"
          >
            <Zap className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
            <span className="text-[10px]">Neon</span>
          </button>

          <button
            onClick={() => setBrushMode("airbrush")}
            className={`p-2 rounded-xl border text-xs font-bold transition-all flex flex-col items-center gap-1 cursor-pointer ${
              brushMode === "airbrush"
                ? "bg-rose-600 text-white border-rose-500 shadow-md scale-102"
                : "bg-zinc-950 border-zinc-800 text-slate-300 hover:border-slate-700"
            }`}
            title="Airbrush: Soft spray paint effect"
          >
            <Wind className="w-3.5 h-3.5" />
            <span className="text-[10px]">Airbrush</span>
          </button>

          <button
            onClick={() => setBrushMode("eraser")}
            className={`p-2 rounded-xl border text-xs font-bold transition-all flex flex-col items-center gap-1 cursor-pointer ${
              brushMode === "eraser"
                ? "bg-amber-600 text-white border-amber-500 shadow-md scale-102"
                : "bg-zinc-950 border-zinc-800 text-slate-300 hover:border-slate-700"
            }`}
            title="Eraser: Cleanly erase drawn strokes"
          >
            <Eraser className="w-3.5 h-3.5" />
            <span className="text-[10px]">Eraser</span>
          </button>

          <button
            onClick={() => setBrushMode("ai_erase_mask")}
            className={`p-2 rounded-xl border text-xs font-bold transition-all flex flex-col items-center gap-1 cursor-pointer ${
              brushMode === "ai_erase_mask"
                ? "bg-gradient-to-r from-amber-500 to-rose-500 text-slate-950 border-amber-400 font-extrabold shadow-md scale-102"
                : "bg-zinc-950 border-amber-500/40 text-amber-400 hover:bg-amber-500/10"
            }`}
            title="AI Erase Mask: Paint area to remove/inpaint with AI"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="text-[10px]">AI Mask</span>
          </button>

          <button
            onClick={() => setBrushMode("rect")}
            className={`p-2 rounded-xl border text-xs font-bold transition-all flex flex-col items-center gap-1 cursor-pointer ${
              brushMode === "rect"
                ? "bg-rose-600 text-white border-rose-500 shadow-md scale-102"
                : "bg-zinc-950 border-zinc-800 text-slate-300 hover:border-slate-700"
            }`}
            title="Rectangle Shape"
          >
            <Square className="w-3.5 h-3.5" />
            <span className="text-[10px]">Rect</span>
          </button>

          <button
            onClick={() => setBrushMode("circle")}
            className={`p-2 rounded-xl border text-xs font-bold transition-all flex flex-col items-center gap-1 cursor-pointer ${
              brushMode === "circle"
                ? "bg-rose-600 text-white border-rose-500 shadow-md scale-102"
                : "bg-zinc-950 border-zinc-800 text-slate-300 hover:border-slate-700"
            }`}
            title="Circle Shape"
          >
            <Circle className="w-3.5 h-3.5" />
            <span className="text-[10px]">Circle</span>
          </button>
        </div>
      </div>

      {/* 2. Shape Stamps Bar */}
      <div className="space-y-1.5 pt-2 border-t border-zinc-800">
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Stamp Shapes</span>
        <div className="flex gap-1.5">
          <button
            onClick={() => setBrushMode("arrow")}
            className={`p-2 rounded-xl border flex-1 text-xs font-bold flex items-center justify-center cursor-pointer ${
              brushMode === "arrow" ? "bg-rose-600 text-white border-rose-500" : "bg-zinc-950 border-zinc-800 text-slate-300"
            }`}
            title="Arrow Stamp"
          >
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setBrushMode("star")}
            className={`p-2 rounded-xl border flex-1 text-xs font-bold flex items-center justify-center cursor-pointer ${
              brushMode === "star" ? "bg-rose-600 text-white border-rose-500" : "bg-zinc-950 border-zinc-800 text-slate-300"
            }`}
            title="Star Stamp"
          >
            <Star className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setBrushMode("heart")}
            className={`p-2 rounded-xl border flex-1 text-xs font-bold flex items-center justify-center cursor-pointer ${
              brushMode === "heart" ? "bg-rose-600 text-white border-rose-500" : "bg-zinc-950 border-zinc-800 text-slate-300"
            }`}
            title="Heart Stamp"
          >
            <Heart className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setBrushMode("bubble")}
            className={`p-2 rounded-xl border flex-1 text-xs font-bold flex items-center justify-center cursor-pointer ${
              brushMode === "bubble" ? "bg-rose-600 text-white border-rose-500" : "bg-zinc-950 border-zinc-800 text-slate-300"
            }`}
            title="Speech Bubble Stamp"
          >
            <MessageSquare className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* AI Mask Inpaint Action Button if AI Mask mode selected */}
      {brushMode === "ai_erase_mask" && onApplyAiMagicInpaint && (
        <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-2">
          <div className="text-[11px] font-bold text-amber-300 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Magic Brush Masking Active</span>
          </div>
          <p className="text-[10px] text-slate-300 leading-tight">
            Paint over any object, face, or background defect on the photo, then click below to execute AI Inpaint & Erase.
          </p>
          <button
            onClick={onApplyAiMagicInpaint}
            disabled={isAiInpainting || drawnStrokesCount === 0}
            className="w-full py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-extrabold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-md disabled:opacity-50"
          >
            <Wand2 className={`w-3.5 h-3.5 ${isAiInpainting ? "animate-spin" : ""}`} />
            {isAiInpainting ? "AI Magic Erasing..." : "Execute AI Magic Inpaint Erase"}
          </button>
        </div>
      )}

      {/* 3. Color Picker & Preset Palette Swatches */}
      <div className="space-y-2 pt-2 border-t border-zinc-800">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-300">Paint Color</span>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={brushColor}
              onChange={(e) => setBrushColor(e.target.value)}
              className="w-6 h-6 rounded-md bg-transparent cursor-pointer border border-zinc-700"
            />
            <span className="text-[11px] font-mono text-rose-400 font-bold">{brushColor}</span>
          </div>
        </div>

        {/* Swatches Grid */}
        <div className="grid grid-cols-8 gap-1.5">
          {PRESET_SWATCHES.map((hex) => (
            <button
              key={hex}
              onClick={() => setBrushColor(hex)}
              style={{ backgroundColor: hex }}
              className={`w-full aspect-square rounded-lg transition-transform cursor-pointer border ${
                brushColor.toLowerCase() === hex.toLowerCase()
                  ? "ring-2 ring-rose-500 ring-offset-2 ring-offset-zinc-900 scale-110"
                  : "border-white/20 hover:scale-105"
              }`}
              title={hex}
            />
          ))}
        </div>
      </div>

      {/* 4. Stroke Size & Opacity Sliders */}
      <div className="space-y-3 pt-2 border-t border-zinc-800">
        <div>
          <div className="flex justify-between text-xs text-slate-300 font-bold mb-1">
            <span>Stroke Thickness</span>
            <span className="text-rose-400 font-mono">{brushSize}px</span>
          </div>
          <input
            type="range"
            min="1"
            max="100"
            value={brushSize}
            onChange={(e) => setBrushSize(Number(e.target.value))}
            className="w-full accent-rose-500 cursor-pointer"
          />
        </div>

        <div>
          <div className="flex justify-between text-xs text-slate-300 font-bold mb-1">
            <span>Paint Opacity</span>
            <span className="text-rose-400 font-mono">{Math.round(brushOpacity * 100)}%</span>
          </div>
          <input
            type="range"
            min="0.1"
            max="1"
            step="0.05"
            value={brushOpacity}
            onChange={(e) => setBrushOpacity(Number(e.target.value))}
            className="w-full accent-rose-500 cursor-pointer"
          />
        </div>
      </div>

      {/* 5. Undo / Redo & Clear History Controls */}
      <div className="flex items-center gap-2 pt-2 border-t border-zinc-800">
        <button
          onClick={onUndo}
          disabled={!canUndo}
          className="flex-1 py-1.5 rounded-xl bg-zinc-950 border border-zinc-800 hover:border-slate-700 disabled:opacity-40 text-xs font-bold text-slate-200 flex items-center justify-center gap-1 cursor-pointer"
          title="Undo last stroke"
        >
          <Undo2 className="w-3.5 h-3.5" /> Undo
        </button>

        <button
          onClick={onRedo}
          disabled={!canRedo}
          className="flex-1 py-1.5 rounded-xl bg-zinc-950 border border-zinc-800 hover:border-slate-700 disabled:opacity-40 text-xs font-bold text-slate-200 flex items-center justify-center gap-1 cursor-pointer"
          title="Redo stroke"
        >
          <Redo2 className="w-3.5 h-3.5" /> Redo
        </button>

        <button
          onClick={onClearDrawings}
          disabled={drawnStrokesCount === 0}
          className="py-1.5 px-3 rounded-xl bg-rose-500/10 border border-rose-500/30 hover:bg-rose-500/20 disabled:opacity-40 text-xs font-bold text-rose-400 flex items-center justify-center gap-1 cursor-pointer"
          title="Clear all drawings"
        >
          <Trash2 className="w-3.5 h-3.5" /> Clear
        </button>
      </div>
    </div>
  );
};
