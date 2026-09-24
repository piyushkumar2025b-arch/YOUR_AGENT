import React, { useState, useMemo } from "react";
import {
  Palette,
  Sliders,
  Eye,
  Check,
  CheckCircle2,
  Copy,
  Save,
  Code,
  FileCode,
  Sparkles,
  Layers,
  Type,
  Sun,
  Moon,
  ShieldCheck,
  ShieldAlert,
  RotateCcw,
  Zap,
  Layout,
  MousePointer
} from "lucide-react";
import { VirtualFile } from "../types";

export interface DesignTokensTailwindStudioAgentProps {
  files: VirtualFile[];
  theme: "light" | "dark";
  onSaveFile: (path: string, content: string) => void;
  onAddLog?: (type: string, msg: string) => void;
}

export interface ColorToken {
  name: string;
  baseHex: string;
  shades: Record<number, string>;
}

// Helper to generate 50-950 shades from base hex
function generateShades(hex: string): Record<number, string> {
  // Simple HSL lightness stepping
  return {
    50: adjustLightness(hex, 0.45),
    100: adjustLightness(hex, 0.38),
    200: adjustLightness(hex, 0.28),
    300: adjustLightness(hex, 0.18),
    400: adjustLightness(hex, 0.08),
    500: hex,
    600: adjustLightness(hex, -0.08),
    700: adjustLightness(hex, -0.18),
    800: adjustLightness(hex, -0.28),
    900: adjustLightness(hex, -0.38),
    950: adjustLightness(hex, -0.45)
  };
}

function adjustLightness(hex: string, percent: number): string {
  let num = parseInt(hex.replace("#", ""), 16);
  let r = (num >> 16) + Math.round(255 * percent);
  let g = ((num >> 8) & 0x00ff) + Math.round(255 * percent);
  let b = (num & 0x0000ff) + Math.round(255 * percent);

  r = Math.min(255, Math.max(0, r));
  g = Math.min(255, Math.max(0, g));
  b = Math.min(255, Math.max(0, b));

  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

// Calculate relative luminance for contrast ratio
function getLuminance(hex: string): number {
  const rgb = parseInt(hex.replace("#", ""), 16);
  const r = ((rgb >> 16) & 0xff) / 255;
  const g = ((rgb >> 8) & 0xff) / 255;
  const b = (rgb & 0xff) / 255;

  const a = [r, g, b].map(v => (v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)));
  return 0.2126 * a[0] + 0.7152 * a[1] + 0.0722 * a[2];
}

function getContrastRatio(hex1: string, hex2: string): number {
  const lum1 = getLuminance(hex1);
  const lum2 = getLuminance(hex2);
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);
  return parseFloat(((brightest + 0.05) / (darkest + 0.05)).toFixed(2));
}

const DEFAULT_BRAND_PRIMARY = "#3b82f6";
const DEFAULT_BRAND_ACCENT = "#8b5cf6";
const DEFAULT_BRAND_SUCCESS = "#10b981";

export const DesignTokensTailwindStudioAgent: React.FC<DesignTokensTailwindStudioAgentProps> = ({
  theme,
  onSaveFile,
  onAddLog
}) => {
  const [primaryHex, setPrimaryHex] = useState<string>(DEFAULT_BRAND_PRIMARY);
  const [accentHex, setAccentHex] = useState<string>(DEFAULT_BRAND_ACCENT);
  const [successHex, setSuccessHex] = useState<string>(DEFAULT_BRAND_SUCCESS);
  const [borderRadius, setBorderRadius] = useState<string>("0.5rem");
  const [activeTab, setActiveTab] = useState<"sandbox" | "palette" | "css" | "tailwind-config">("sandbox");

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState<boolean>(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const primaryShades = useMemo(() => generateShades(primaryHex), [primaryHex]);
  const accentShades = useMemo(() => generateShades(accentHex), [accentHex]);
  const successShades = useMemo(() => generateShades(successHex), [successHex]);

  // WCAG Contrast Checks
  const primaryContrastWhite = useMemo(() => getContrastRatio(primaryHex, "#ffffff"), [primaryHex]);
  const primaryContrastDark = useMemo(() => getContrastRatio(primaryHex, "#0f172a"), [primaryHex]);

  // Generated Tailwind v4 @theme CSS
  const generatedCssTokens = useMemo(() => {
    const lines: string[] = [
      `@import "tailwindcss";`,
      ``,
      `@theme {`,
      `  --radius-custom: ${borderRadius};`,
      ``,
      `  /* Primary Palette */`
    ];

    Object.entries(primaryShades).forEach(([shade, hex]) => {
      lines.push(`  --color-primary-${shade}: ${hex};`);
    });

    lines.push(``, `  /* Accent Palette */`);
    Object.entries(accentShades).forEach(([shade, hex]) => {
      lines.push(`  --color-accent-${shade}: ${hex};`);
    });

    lines.push(``, `  /* Success Palette */`);
    Object.entries(successShades).forEach(([shade, hex]) => {
      lines.push(`  --color-success-${shade}: ${hex};`);
    });

    lines.push(`}`);
    return lines.join("\n");
  }, [primaryShades, accentShades, successShades, borderRadius]);

  // Generated Tailwind v3 JS config
  const generatedTailwindConfigJs = useMemo(() => {
    return `/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      borderRadius: {
        custom: "${borderRadius}",
      },
      colors: {
        primary: ${JSON.stringify(primaryShades, null, 8).replace(/"/g, "'")},
        accent: ${JSON.stringify(accentShades, null, 8).replace(/"/g, "'")},
        success: ${JSON.stringify(successShades, null, 8).replace(/"/g, "'")},
      },
    },
  },
  plugins: [],
};
`;
  }, [primaryShades, accentShades, successShades, borderRadius]);

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setIsCopied(true);
    showToast(`Copied ${label} to clipboard!`);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className={`w-full h-full flex flex-col overflow-hidden ${theme === "dark" ? "bg-slate-950 text-slate-100" : "bg-slate-50 text-slate-900"}`}>
      {/* Toast Notification */}
      {toastMessage && (
        <div className="absolute top-4 right-6 z-50 px-4 py-2 bg-pink-600 text-white text-xs font-semibold rounded-lg shadow-xl border border-pink-400/40 flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-200">
          <CheckCircle2 className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Bar */}
      <div className={`px-5 py-3 border-b flex flex-wrap items-center justify-between gap-4 ${theme === "dark" ? "bg-slate-900/90 border-slate-800" : "bg-white border-slate-200"}`}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-pink-500 to-rose-500 flex items-center justify-center shadow-lg shadow-pink-500/20 text-white">
            <Palette className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold tracking-tight">Tailwind Design Tokens Studio</h1>
              <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-pink-500/20 text-pink-400 border border-pink-500/30">
                Tailwind v4 @theme
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              Visual palette architect, 50-950 shade generator, WCAG accessibility contrast auditor & live UI sandbox
            </p>
          </div>
        </div>

        {/* Global Save Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => {
              onSaveFile("src/theme.css", generatedCssTokens);
              showToast("Saved src/theme.css with @theme tokens!");
              if (onAddLog) onAddLog("create", "Saved src/theme.css design tokens.");
            }}
            className="px-3 py-1.5 text-xs font-medium rounded-lg bg-pink-600 hover:bg-pink-500 text-white flex items-center gap-1.5 shadow-md shadow-pink-600/20 transition-all"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save src/theme.css</span>
          </button>

          <button
            onClick={() => {
              onSaveFile("tailwind.config.js", generatedTailwindConfigJs);
              showToast("Saved tailwind.config.js!");
            }}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg border flex items-center gap-1.5 transition-all ${
              theme === "dark" ? "bg-slate-800 border-slate-700 hover:bg-slate-700 text-slate-200" : "bg-white border-slate-300 hover:bg-slate-100 text-slate-800"
            }`}
          >
            <Code className="w-3.5 h-3.5" />
            <span>Save tailwind.config.js</span>
          </button>
        </div>
      </div>

      {/* Sub-header Navigation Bar */}
      <div className={`px-5 py-2 border-b flex items-center justify-between gap-4 text-xs ${theme === "dark" ? "bg-slate-900/50 border-slate-800" : "bg-slate-100/70 border-slate-200"}`}>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setActiveTab("sandbox")}
            className={`px-3 py-1.5 rounded-md font-medium flex items-center gap-1.5 transition-colors ${
              activeTab === "sandbox"
                ? theme === "dark" ? "bg-slate-800 text-white shadow-sm" : "bg-white text-slate-900 shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Layout className="w-3.5 h-3.5 text-pink-400" />
            <span>Live Component Sandbox</span>
          </button>
          <button
            onClick={() => setActiveTab("palette")}
            className={`px-3 py-1.5 rounded-md font-medium flex items-center gap-1.5 transition-colors ${
              activeTab === "palette"
                ? theme === "dark" ? "bg-slate-800 text-white shadow-sm" : "bg-white text-slate-900 shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Palette className="w-3.5 h-3.5 text-cyan-400" />
            <span>50-950 Shades & WCAG</span>
          </button>
          <button
            onClick={() => setActiveTab("css")}
            className={`px-3 py-1.5 rounded-md font-medium flex items-center gap-1.5 transition-colors ${
              activeTab === "css"
                ? theme === "dark" ? "bg-slate-800 text-white shadow-sm" : "bg-white text-slate-900 shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <FileCode className="w-3.5 h-3.5 text-emerald-400" />
            <span>Tailwind v4 @theme CSS</span>
          </button>
          <button
            onClick={() => setActiveTab("tailwind-config")}
            className={`px-3 py-1.5 rounded-md font-medium flex items-center gap-1.5 transition-colors ${
              activeTab === "tailwind-config"
                ? theme === "dark" ? "bg-slate-800 text-white shadow-sm" : "bg-white text-slate-900 shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Code className="w-3.5 h-3.5 text-amber-400" />
            <span>tailwind.config.js</span>
          </button>
        </div>

        {/* Global Controls */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] text-slate-400">Primary:</span>
            <input
              type="color"
              value={primaryHex}
              onChange={e => setPrimaryHex(e.target.value)}
              className="w-5 h-5 rounded cursor-pointer border-0 bg-transparent"
            />
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] text-slate-400">Accent:</span>
            <input
              type="color"
              value={accentHex}
              onChange={e => setAccentHex(e.target.value)}
              className="w-5 h-5 rounded cursor-pointer border-0 bg-transparent"
            />
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* VIEW 1: LIVE COMPONENT SANDBOX */}
        {activeTab === "sandbox" && (
          <div className="flex-1 flex flex-col md:flex-row h-full overflow-hidden">
            {/* Left Controls */}
            <div className={`w-full md:w-80 flex flex-col border-r h-full p-4 space-y-4 overflow-y-auto shrink-0 ${theme === "dark" ? "border-slate-800" : "border-slate-200"}`}>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Design System Controls
              </h3>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="text-slate-400 block mb-1 font-semibold">Primary Brand Color</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={primaryHex}
                      onChange={e => setPrimaryHex(e.target.value)}
                      className="w-8 h-8 rounded border-0 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={primaryHex}
                      onChange={e => setPrimaryHex(e.target.value)}
                      className={`flex-1 px-2.5 py-1.5 rounded border font-mono ${
                        theme === "dark" ? "bg-slate-800 border-slate-700 text-white" : "bg-white border-slate-300 text-slate-900"
                      }`}
                    />
                  </div>
                </div>

                <div>
                  <label className="text-slate-400 block mb-1 font-semibold">Accent Color</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={accentHex}
                      onChange={e => setAccentHex(e.target.value)}
                      className="w-8 h-8 rounded border-0 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={accentHex}
                      onChange={e => setAccentHex(e.target.value)}
                      className={`flex-1 px-2.5 py-1.5 rounded border font-mono ${
                        theme === "dark" ? "bg-slate-800 border-slate-700 text-white" : "bg-white border-slate-300 text-slate-900"
                      }`}
                    />
                  </div>
                </div>

                <div>
                  <label className="text-slate-400 block mb-1 font-semibold">Border Radius Scale</label>
                  <select
                    value={borderRadius}
                    onChange={e => setBorderRadius(e.target.value)}
                    className={`w-full px-2.5 py-1.5 rounded border font-mono ${
                      theme === "dark" ? "bg-slate-800 border-slate-700 text-white" : "bg-white border-slate-300 text-slate-900"
                    }`}
                  >
                    <option value="0px">None (0px)</option>
                    <option value="0.25rem">Small (4px / 0.25rem)</option>
                    <option value="0.5rem">Medium (8px / 0.5rem)</option>
                    <option value="0.75rem">Large (12px / 0.75rem)</option>
                    <option value="1rem">X-Large (16px / 1rem)</option>
                    <option value="9999px">Full (Pill)</option>
                  </select>
                </div>
              </div>

              {/* Contrast Quick Check */}
              <div className={`p-3 rounded-xl border space-y-2 ${theme === "dark" ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"}`}>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                  WCAG 2.1 Contrast
                </span>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">On White:</span>
                  <span className={`font-mono font-bold ${primaryContrastWhite >= 4.5 ? "text-emerald-400" : "text-amber-400"}`}>
                    {primaryContrastWhite}:1 {primaryContrastWhite >= 4.5 ? "✓ (AA)" : "⚠ Fail"}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">On Slate-900:</span>
                  <span className={`font-mono font-bold ${primaryContrastDark >= 4.5 ? "text-emerald-400" : "text-amber-400"}`}>
                    {primaryContrastDark}:1 {primaryContrastDark >= 4.5 ? "✓ (AA)" : "⚠ Fail"}
                  </span>
                </div>
              </div>
            </div>

            {/* Right Sandbox Component Grid */}
            <div className="flex-1 flex flex-col h-full overflow-y-auto p-6 space-y-6">
              <div>
                <h2 className="text-sm font-bold">Dynamic Component Sandbox</h2>
                <p className="text-xs text-slate-400">Components rendered with current design tokens in real time</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {/* Buttons Card */}
                <div className={`p-5 rounded-2xl border space-y-3 ${theme === "dark" ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"}`}>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Buttons & Actions</h3>
                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      style={{ backgroundColor: primaryHex, borderRadius }}
                      className="px-4 py-2 text-xs font-semibold text-white shadow-md active:scale-95 transition-all"
                    >
                      Primary Action
                    </button>
                    <button
                      style={{ backgroundColor: accentHex, borderRadius }}
                      className="px-4 py-2 text-xs font-semibold text-white shadow-md active:scale-95 transition-all"
                    >
                      Accent Action
                    </button>
                    <button
                      style={{ borderColor: primaryHex, color: primaryHex, borderRadius }}
                      className="px-4 py-2 text-xs font-semibold border active:scale-95 transition-all"
                    >
                      Outlined
                    </button>
                  </div>
                </div>

                {/* Form Controls */}
                <div className={`p-5 rounded-2xl border space-y-3 ${theme === "dark" ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"}`}>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Form Controls</h3>
                  <div className="space-y-2">
                    <input
                      type="text"
                      placeholder="Styled input field..."
                      style={{ borderRadius }}
                      className={`w-full px-3 py-2 text-xs border outline-none ${
                        theme === "dark" ? "bg-slate-950 border-slate-700 text-white" : "bg-slate-50 border-slate-300 text-slate-900"
                      }`}
                    />
                  </div>
                </div>

                {/* Notification Badge Card */}
                <div className={`p-5 rounded-2xl border space-y-3 ${theme === "dark" ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"}`}>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Status Badges</h3>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      style={{ backgroundColor: `${primaryHex}25`, color: primaryHex, borderRadius }}
                      className="px-2.5 py-1 text-xs font-bold"
                    >
                      Active Session
                    </span>
                    <span
                      style={{ backgroundColor: `${accentHex}25`, color: accentHex, borderRadius }}
                      className="px-2.5 py-1 text-xs font-bold"
                    >
                      Feature Flag
                    </span>
                    <span
                      style={{ backgroundColor: `${successHex}25`, color: successHex, borderRadius }}
                      className="px-2.5 py-1 text-xs font-bold"
                    >
                      Deployment Healthy
                    </span>
                  </div>
                </div>

                {/* Interactive Card */}
                <div
                  style={{ borderRadius, borderColor: `${primaryHex}40` }}
                  className={`p-5 border shadow-lg space-y-2 ${theme === "dark" ? "bg-slate-900/80" : "bg-white"}`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold font-mono" style={{ color: primaryHex }}>
                      CLOUD RESOURCE
                    </span>
                    <span className="text-xs text-slate-400">Live Metric</span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-100">Production Cluster v3</h4>
                  <p className="text-xs text-slate-400">Zero-downtime rolling deployments active across 3 availability zones.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* VIEW 2: 50-950 SHADES */}
        {activeTab === "palette" && (
          <div className="flex-1 flex flex-col h-full overflow-y-auto p-5 space-y-6">
            <div>
              <h2 className="text-sm font-bold">Generated 50-950 Color Swatches</h2>
              <p className="text-xs text-slate-400">Complete stepping spectrum calculated with lightness curves</p>
            </div>

            {/* Primary Shades */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Primary Spectrum</h3>
              <div className="grid grid-cols-11 gap-1 text-center">
                {Object.entries(primaryShades).map(([shade, hex]) => (
                  <div key={shade} className="space-y-1">
                    <div style={{ backgroundColor: hex }} className="h-14 rounded-lg shadow-sm" />
                    <div className="text-[10px] font-mono text-slate-400">{shade}</div>
                    <div className="text-[9px] font-mono text-slate-500">{hex}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Accent Shades */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Accent Spectrum</h3>
              <div className="grid grid-cols-11 gap-1 text-center">
                {Object.entries(accentShades).map(([shade, hex]) => (
                  <div key={shade} className="space-y-1">
                    <div style={{ backgroundColor: hex }} className="h-14 rounded-lg shadow-sm" />
                    <div className="text-[10px] font-mono text-slate-400">{shade}</div>
                    <div className="text-[9px] font-mono text-slate-500">{hex}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* VIEW 3: TAILWIND V4 @THEME CSS */}
        {activeTab === "css" && (
          <div className="flex-1 flex flex-col h-full overflow-hidden p-5">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="text-sm font-bold">Tailwind v4 @theme CSS (src/theme.css)</h2>
                <p className="text-xs text-slate-400">Modern CSS variables block matching Tailwind CSS v4 design specifications</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleCopy(generatedCssTokens, "CSS Tokens")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border flex items-center gap-1.5 ${
                    theme === "dark" ? "bg-slate-800 border-slate-700 text-slate-200" : "bg-white border-slate-300 text-slate-800"
                  }`}
                >
                  <Copy className="w-3.5 h-3.5" /> Copy CSS
                </button>
                <button
                  onClick={() => {
                    onSaveFile("src/theme.css", generatedCssTokens);
                    showToast("Saved src/theme.css!");
                  }}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium bg-pink-600 hover:bg-pink-500 text-white flex items-center gap-1.5 shadow"
                >
                  <Save className="w-3.5 h-3.5" /> Save to Workspace
                </button>
              </div>
            </div>
            <pre className={`flex-1 p-4 rounded-xl font-mono text-xs overflow-auto border ${
              theme === "dark" ? "bg-slate-900 border-slate-800 text-pink-300" : "bg-slate-100 border-slate-300 text-slate-800"
            }`}>
              {generatedCssTokens}
            </pre>
          </div>
        )}

        {/* VIEW 4: TAILWIND CONFIG JS */}
        {activeTab === "tailwind-config" && (
          <div className="flex-1 flex flex-col h-full overflow-hidden p-5">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="text-sm font-bold">Tailwind v3 Config Object (tailwind.config.js)</h2>
                <p className="text-xs text-slate-400">Standard theme.extend configuration object</p>
              </div>
              <button
                onClick={() => handleCopy(generatedTailwindConfigJs, "Config JS")}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border flex items-center gap-1.5 ${
                  theme === "dark" ? "bg-slate-800 border-slate-700 text-slate-200" : "bg-white border-slate-300 text-slate-800"
                }`}
              >
                <Copy className="w-3.5 h-3.5" /> Copy JS
              </button>
            </div>
            <pre className={`flex-1 p-4 rounded-xl font-mono text-xs overflow-auto border ${
              theme === "dark" ? "bg-slate-900 border-slate-800 text-cyan-300" : "bg-slate-100 border-slate-300 text-slate-800"
            }`}>
              {generatedTailwindConfigJs}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default DesignTokensTailwindStudioAgent;
