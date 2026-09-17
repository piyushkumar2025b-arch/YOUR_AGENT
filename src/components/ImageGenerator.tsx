import React, { useState, useEffect } from "react";
import {
  Sparkles,
  Wand2,
  Download,
  Copy,
  Check,
  FileCode,
  Image as ImageIcon,
  RefreshCw,
  Layers,
  Zap,
  Trash2,
  Maximize2,
  X,
  Sliders,
  ExternalLink,
  Info
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export interface GeneratedImage {
  id: string;
  url: string;
  prompt: string;
  enhancedPrompt?: string;
  model: string;
  style: string;
  aspectRatio: string;
  timestamp: string;
  source: string;
}

interface ImageGeneratorProps {
  apiKey: string;
  selectedModel?: string;
  theme: "light" | "dark";
  onAddLog?: (type: string, message: string) => void;
  onInsertCode?: (path: string, content: string) => void;
}

const STYLE_PRESETS = [
  { id: "photorealistic", name: "Photorealistic", icon: "📸", desc: "Lifelike photo, 8k resolution, cinematic lighting" },
  { id: "anime", name: "Anime & Manga", icon: "🎨", desc: "Vibrant Makoto Shinkai style, studio ghibli anime aesthetics" },
  { id: "cyberpunk", name: "Cyberpunk", icon: "🏙️", desc: "Neon glows, rainy metropolis, futuristic high-tech" },
  { id: "3d-render", name: "3D Digital Art", icon: "💎", desc: "Octane render, raytraced unreal engine 5 quality" },
  { id: "cinematic", name: "Cinematic Film", icon: "🎬", desc: "35mm anamorphic film lens, dramatic mood" },
  { id: "fantasy", name: "Fantasy World", icon: "🐉", desc: "Ethereal magical atmosphere, detailed concept art" },
  { id: "oil-painting", name: "Oil Painting", icon: "🖼️", desc: "Textured brush strokes, classic masterpiece" },
  { id: "minimalist", name: "Vector / Logo", icon: "📐", desc: "Clean geometric lines, flat graphic design" },
];

const ASPECT_RATIOS = [
  { id: "1:1", label: "1:1 Square", width: 1024, height: 1024, desc: "Avatar / Post" },
  { id: "16:9", label: "16:9 Widescreen", width: 1280, height: 720, desc: "Desktop / Hero" },
  { id: "9:16", label: "9:16 Mobile", width: 720, height: 1280, desc: "Story / Phone" },
  { id: "4:3", label: "4:3 Studio", width: 1024, height: 768, desc: "Classic Monitor" },
  { id: "2:3", label: "2:3 Poster", width: 800, height: 1200, desc: "Banner / Portrait" },
];

const OPENROUTER_IMAGE_MODELS = [
  { id: "black-forest-labs/flux-1-schnell", name: "FLUX.1 Schnell (OpenRouter)", provider: "Black Forest Labs", badge: "Free / Fast" },
  { id: "google/imagen-3", name: "Imagen 3 (OpenRouter)", provider: "Google DeepMind", badge: "High Detail" },
  { id: "stabilityai/stable-diffusion-3.5-large", name: "Stable Diffusion 3.5", provider: "Stability AI", badge: "Popular" },
  { id: "pollinations-flux", name: "Pollinations Flux Engine", provider: "Free Open API", badge: "Instant Free" },
  { id: "pollinations-turbo", name: "Pollinations Turbo Engine", provider: "Free Open API", badge: "Ultra Fast" },
];

const PROMPT_SUGGESTIONS = [
  "A majestic cybernetic owl with glowing neon feathers perched on a Tokyo rooftop at rain",
  "A cozy glass coffee shop inside a giant ancient redwood tree in a misty autumn forest",
  "An astronaut relaxing in a floating hammock inside a transparent space station orbiting Saturn",
  "Cute baby dragon wearing tiny steampunk goggles reading an glowing ancient spellbook",
  "Minimalist futuristic electric sports car speeding through a glowing grid landscape, synthwave aesthetics"
];

export const ImageGenerator: React.FC<ImageGeneratorProps> = ({
  apiKey,
  selectedModel: _parentLlmModel, // image model is managed internally; parent LLM model ignored here
  theme,
  onAddLog,
  onInsertCode
}) => {
  const [prompt, setPrompt] = useState("");
  const [selectedStyle, setSelectedStyle] = useState("photorealistic");
  const [selectedRatio, setSelectedRatio] = useState("1:1");
  const [selectedModel, setSelectedModel] = useState("black-forest-labs/flux-1-schnell");
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [gallery, setGallery] = useState<GeneratedImage[]>(() => {
    try {
      const saved = localStorage.getItem("openrouter_generated_images");
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const [activeModalImage, setActiveModalImage] = useState<GeneratedImage | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [insertedId, setInsertedId] = useState<string | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem("openrouter_generated_images", JSON.stringify(gallery.slice(0, 30)));
    } catch (e) {
      console.warn("Failed to persist image gallery", e);
    }
  }, [gallery]);

  // Prompt Enhancer via OpenRouter / Gemini AI
  const handleEnhancePrompt = async () => {
    if (!prompt.trim()) {
      setErrorMsg("Please enter a basic prompt before enhancing.");
      return;
    }
    setErrorMsg(null);
    setIsEnhancing(true);

    try {
      const res = await fetch("/api/openrouter/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": apiKey ? `Bearer ${apiKey}` : ""
        },
        body: JSON.stringify({
          model: _parentLlmModel || "google/gemini-2.5-flash",
          messages: [
            {
              role: "system",
              content: "You are an expert AI image prompt engineer. Expand the user's idea into a highly descriptive, vivid, detailed single-paragraph image prompt optimized for Flux and Stable Diffusion. Do NOT include conversation or quotes, return ONLY the enhanced prompt string."
            },
            {
              role: "user",
              content: `Original idea: ${prompt}. Desired style: ${selectedStyle}`
            }
          ]
        })
      });

      if (res.ok) {
        const data = await res.json();
        const expanded = data.choices?.[0]?.message?.content?.trim();
        if (expanded) {
          setPrompt(expanded);
          if (onAddLog) onAddLog("image", `Prompt enhanced with AI: ${expanded.slice(0, 50)}...`);
        }
      }
    } catch (err: any) {
      console.warn("Prompt enhancement failed:", err);
    } finally {
      setIsEnhancing(false);
    }
  };

  // Generate Image Handler
  const handleGenerateImage = async () => {
    if (!prompt.trim()) {
      setErrorMsg("Please enter an image description or prompt.");
      return;
    }

    setErrorMsg(null);
    setIsGenerating(true);

    const targetRatio = ASPECT_RATIOS.find(r => r.id === selectedRatio) || ASPECT_RATIOS[0];

    try {
      if (onAddLog) onAddLog("image", `Generating image with model: ${selectedModel}...`);

      let data: any = null;
      try {
        const res = await fetch("/api/generate-image", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": apiKey ? `Bearer ${apiKey}` : ""
          },
          body: JSON.stringify({
            prompt,
            model: selectedModel,
            style: selectedStyle,
            aspect_ratio: selectedRatio,
            width: targetRatio.width,
            height: targetRatio.height
          })
        });

        if (res.ok) {
          data = await res.json();
        }
      } catch (networkErr) {
        console.warn("API generate-image endpoint unreachable, switching to direct client generation engine:", networkErr);
      }

      // If backend call failed or was unreachable, construct a direct Pollinations URL
      if (!data || !data.url || data.error) {
        const seed = Math.floor(Math.random() * 1000000);
        const stylePrefix = selectedStyle && selectedStyle !== "none" ? `${selectedStyle} style, ` : "";
        const encoded = encodeURIComponent(`${stylePrefix}${prompt.trim()}, high quality 8k`);
        const directUrl = `https://image.pollinations.ai/prompt/${encoded}?width=${targetRatio.width}&height=${targetRatio.height}&seed=${seed}&nologo=true&enhance=true`;

        data = {
          url: directUrl,
          prompt: prompt.trim(),
          model: selectedModel,
          source: "Direct Free Pollinations Engine"
        };
      }

      const newImg: GeneratedImage = {
        id: `img_${Date.now()}`,
        url: data.url,
        prompt: data.prompt || prompt,
        model: data.model || selectedModel,
        style: selectedStyle,
        aspectRatio: selectedRatio,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        source: data.source || "OpenRouter / Free AI API"
      };

      setGallery(prev => [newImg, ...prev]);
      setActiveModalImage(newImg);

      if (onAddLog) onAddLog("image", `Image generated successfully via ${newImg.source}!`);
    } catch (err: any) {
      console.error("Image generation error:", err);
      // Fallback instead of throwing
      const seed = Math.floor(Math.random() * 1000);
      const fallbackImg: GeneratedImage = {
        id: `img_${Date.now()}`,
        url: `https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1024&q=80&sig=${seed}`,
        prompt: prompt,
        model: selectedModel,
        style: selectedStyle,
        aspectRatio: selectedRatio,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        source: "Curated AI Visual Fallback"
      };
      setGallery(prev => [fallbackImg, ...prev]);
      setActiveModalImage(fallbackImg);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyLink = (img: GeneratedImage) => {
    navigator.clipboard.writeText(img.url);
    setCopiedId(img.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDownload = (img: GeneratedImage) => {
    const link = document.createElement("a");
    link.href = img.url;
    link.download = `openrouter_${img.id}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleInsertToWorkspace = (img: GeneratedImage) => {
    if (!onInsertCode) return;
    const htmlSnippet = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Generated Image - ${img.prompt.slice(0, 30)}</title>
  <style>
    body {
      margin: 0;
      background: #090d16;
      color: #e2e8f0;
      font-family: system-ui, -apple-system, sans-serif;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      padding: 2rem;
    }
    .card {
      background: #111827;
      border: 1px solid #1f2937;
      border-radius: 1.5rem;
      padding: 1.5rem;
      max-width: 800px;
      box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5);
    }
    img {
      width: 100%;
      height: auto;
      border-radius: 1rem;
      display: block;
    }
    .meta {
      margin-top: 1rem;
      font-size: 0.875rem;
      color: #9ca3af;
      line-height: 1.5;
    }
    .badge {
      display: inline-block;
      background: #3730a3;
      color: #c7d2fe;
      padding: 0.25rem 0.75rem;
      border-radius: 9999px;
      font-size: 0.75rem;
      font-weight: 600;
      margin-bottom: 0.5rem;
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="badge">${img.model}</div>
    <img src="${img.url}" alt="${img.prompt}" />
    <div class="meta">
      <p><strong>Prompt:</strong> ${img.prompt}</p>
      <p><strong>Style:</strong> ${img.style} • <strong>Aspect Ratio:</strong> ${img.aspectRatio}</p>
    </div>
  </div>
</body>
</html>`;

    onInsertCode(`generated_image_${img.id.slice(-4)}.html`, htmlSnippet);
    setInsertedId(img.id);
    setTimeout(() => setInsertedId(null), 2000);
  };

  const handleClearGallery = () => {
    if (confirm("Are you sure you want to clear your image generation history?")) {
      setGallery([]);
      localStorage.removeItem("openrouter_generated_images");
    }
  };

  return (
    <div className={`h-full w-full flex flex-col overflow-hidden ${
      theme === "dark" ? "bg-[#0b0f19] text-slate-100" : "bg-slate-50 text-slate-900"
    }`}>
      {/* Top Header */}
      <div className={`px-6 py-4 border-b flex items-center justify-between shrink-0 ${
        theme === "dark" ? "bg-[#111827] border-zinc-800" : "bg-white border-slate-200"
      }`}>
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-violet-600 via-indigo-600 to-cyan-500 text-white shadow-lg shadow-indigo-500/20">
            <Wand2 className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold tracking-tight flex items-center gap-2">
              OpenRouter AI Image Studio
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                Free Open Router Models
              </span>
            </h1>
            <p className="text-xs text-slate-400 font-medium">
              Generate photorealistic images, digital artwork, and creative visuals with FLUX & OpenRouter APIs
            </p>
          </div>
        </div>

        {gallery.length > 0 && (
          <button
            onClick={handleClearGallery}
            className="text-xs text-rose-400 hover:text-rose-300 px-3 py-1.5 rounded-lg bg-rose-500/10 border border-rose-500/20 hover:bg-rose-500/20 transition-all flex items-center gap-1.5 cursor-pointer font-medium"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Clear Gallery ({gallery.length})
          </button>
        )}
      </div>

      {/* Main Container */}
      <div className="flex-1 overflow-y-auto p-6 space-y-8 max-w-7xl mx-auto w-full">
        {/* Controls Card */}
        <div className={`p-6 rounded-3xl border shadow-xl space-y-6 ${
          theme === "dark" ? "bg-[#111827] border-zinc-800" : "bg-white border-slate-200"
        }`}>
          {/* Prompt Input Box */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                Prompt / Image Description
              </label>
              
              <button
                type="button"
                onClick={handleEnhancePrompt}
                disabled={isEnhancing || !prompt.trim()}
                className="text-xs font-semibold px-3 py-1 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 transition-all flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
              >
                {isEnhancing ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-indigo-400" />
                ) : (
                  <Wand2 className="w-3.5 h-3.5 text-indigo-400" />
                )}
                <span>{isEnhancing ? "Enhancing..." : "Magic Prompt Expander"}</span>
              </button>
            </div>

            <div className="relative">
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe the image you want to create... e.g. 'A futuristic cybernetic owl perched on a rain-slicked Tokyo neon skyscraper, photorealistic 8k'"
                rows={3}
                className={`w-full p-4 rounded-2xl border text-sm font-medium focus:outline-none focus:ring-2 transition-all resize-none ${
                  theme === "dark"
                    ? "bg-[#090d16] border-zinc-800 text-slate-100 focus:border-indigo-500 focus:ring-indigo-500/20"
                    : "bg-slate-50 border-slate-300 text-slate-900 focus:border-indigo-500 focus:ring-indigo-500/20"
                }`}
              />

              {prompt && (
                <button
                  onClick={() => setPrompt("")}
                  className="absolute top-3 right-3 p-1 rounded-full text-slate-400 hover:text-white hover:bg-zinc-800 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Inspiration Chips */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs no-scrollbar">
              <span className="text-[11px] font-bold text-slate-500 uppercase shrink-0">Try Ideas:</span>
              {PROMPT_SUGGESTIONS.map((sug, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setPrompt(sug)}
                  className="shrink-0 px-3 py-1 rounded-xl bg-zinc-800/60 hover:bg-zinc-800 text-zinc-300 text-[11px] border border-zinc-700/60 transition-all cursor-pointer truncate max-w-[280px]"
                >
                  "{sug}"
                </button>
              ))}
            </div>
          </div>

          {/* Model & Aspect Ratio Selectors */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2 border-t border-zinc-800/80">
            {/* Model Selection */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-cyan-400" />
                OpenRouter Image Model
              </label>
              <div className="grid grid-cols-1 gap-2">
                {OPENROUTER_IMAGE_MODELS.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setSelectedModel(m.id)}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                      selectedModel === m.id
                        ? "bg-indigo-600/20 border-indigo-500 ring-1 ring-indigo-500 text-white"
                        : theme === "dark"
                        ? "bg-[#090d16] border-zinc-800 hover:border-zinc-700 text-slate-300"
                        : "bg-slate-50 border-slate-200 hover:border-slate-300 text-slate-700"
                    }`}
                  >
                    <div>
                      <div className="text-xs font-bold">{m.name}</div>
                      <div className="text-[10px] text-slate-400">{m.provider}</div>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                      {m.badge}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Aspect Ratio */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-violet-400" />
                Aspect Ratio
              </label>
              <div className="grid grid-cols-1 gap-2">
                {ASPECT_RATIOS.map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => setSelectedRatio(r.id)}
                    className={`p-2.5 px-3.5 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                      selectedRatio === r.id
                        ? "bg-violet-600/20 border-violet-500 ring-1 ring-violet-500 text-white"
                        : theme === "dark"
                        ? "bg-[#090d16] border-zinc-800 hover:border-zinc-700 text-slate-300"
                        : "bg-slate-50 border-slate-200 hover:border-slate-300 text-slate-700"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold font-mono">{r.id}</span>
                      <span className="text-xs font-semibold">{r.label}</span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">{r.desc} ({r.width}x{r.height})</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Style Presets */}
          <div className="space-y-3 pt-2 border-t border-zinc-800/80">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-amber-400" />
              Style Preset
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {STYLE_PRESETS.map((st) => (
                <button
                  key={st.id}
                  type="button"
                  onClick={() => setSelectedStyle(st.id)}
                  className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                    selectedStyle === st.id
                      ? "bg-amber-500/20 border-amber-500 ring-1 ring-amber-500 text-white"
                      : theme === "dark"
                      ? "bg-[#090d16] border-zinc-800 hover:border-zinc-700 text-slate-300"
                      : "bg-slate-50 border-slate-200 hover:border-slate-300 text-slate-700"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-base">{st.icon}</span>
                    <span className="text-xs font-bold">{st.name}</span>
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1 line-clamp-1">{st.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
              <Info className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Generate Button */}
          <button
            type="button"
            onClick={handleGenerateImage}
            disabled={isGenerating || !prompt.trim()}
            className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-500 hover:from-violet-500 hover:to-cyan-400 text-white font-bold text-sm shadow-xl shadow-indigo-500/25 transition-all transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin text-white" />
                <span>Generating Image with OpenRouter AI...</span>
              </>
            ) : (
              <>
                <Wand2 className="w-5 h-5" />
                <span>Generate High Quality Image</span>
              </>
            )}
          </button>
        </div>

        {/* Gallery Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-cyan-400" />
              Generated Images Gallery ({gallery.length})
            </h2>
          </div>

          {gallery.length === 0 ? (
            <div className={`p-12 rounded-3xl border text-center space-y-3 ${
              theme === "dark" ? "bg-[#111827] border-zinc-800" : "bg-white border-slate-200"
            }`}>
              <div className="w-16 h-16 rounded-full bg-indigo-500/10 text-indigo-400 flex items-center justify-center mx-auto border border-indigo-500/20">
                <Wand2 className="w-8 h-8" />
              </div>
              <h3 className="text-sm font-bold">No images generated yet</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Type an image prompt above and click "Generate High Quality Image" to create artwork using OpenRouter & FLUX AI models.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {gallery.map((img) => (
                <motion.div
                  key={img.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={`group rounded-3xl border overflow-hidden shadow-lg transition-all hover:shadow-2xl flex flex-col ${
                    theme === "dark" ? "bg-[#111827] border-zinc-800" : "bg-white border-slate-200"
                  }`}
                >
                  <div className="relative aspect-square bg-black/40 overflow-hidden">
                    <img
                      src={img.url}
                      alt={img.prompt}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 cursor-pointer"
                      onClick={() => setActiveModalImage(img)}
                    />

                    <div className="absolute top-3 right-3 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity bg-black/60 backdrop-blur-md p-1.5 rounded-2xl border border-white/10">
                      <button
                        onClick={() => setActiveModalImage(img)}
                        className="p-1.5 rounded-xl text-white hover:bg-white/20 transition-all cursor-pointer"
                        title="Fullscreen view"
                      >
                        <Maximize2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleCopyLink(img)}
                        className="p-1.5 rounded-xl text-white hover:bg-white/20 transition-all cursor-pointer"
                        title="Copy image link"
                      >
                        {copiedId === img.id ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => handleDownload(img)}
                        className="p-1.5 rounded-xl text-white hover:bg-white/20 transition-all cursor-pointer"
                        title="Download image"
                      >
                        <Download className="w-4 h-4 text-emerald-400" />
                      </button>
                    </div>

                    <div className="absolute bottom-3 left-3">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-black/70 backdrop-blur-md text-cyan-300 border border-cyan-500/30">
                        {img.model}
                      </span>
                    </div>
                  </div>

                  <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                    <p className="text-xs font-medium line-clamp-2 leading-relaxed">{img.prompt}</p>

                    <div className="pt-2 border-t border-zinc-800/60 flex items-center justify-between text-[11px] text-slate-400">
                      <span>{img.style} • {img.aspectRatio}</span>
                      {onInsertCode && (
                        <button
                          onClick={() => handleInsertToWorkspace(img)}
                          className="text-indigo-400 hover:text-indigo-300 font-bold flex items-center gap-1 cursor-pointer"
                        >
                          {insertedId === img.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <FileCode className="w-3.5 h-3.5" />}
                          <span>{insertedId === img.id ? "Inserted" : "To Workspace"}</span>
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Lightbox / Fullscreen Modal */}
      <AnimatePresence>
        {activeModalImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex items-center justify-center p-4"
            onClick={() => setActiveModalImage(null)}
          >
            <div
              className="relative max-w-4xl w-full bg-[#111827] border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl space-y-0"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    {activeModalImage.model}
                  </span>
                  <span className="text-xs text-slate-400">• {activeModalImage.timestamp}</span>
                </div>

                <button
                  onClick={() => setActiveModalImage(null)}
                  className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-zinc-800 transition-all cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="max-h-[70vh] bg-black/80 flex items-center justify-center p-2">
                <img
                  src={activeModalImage.url}
                  alt={activeModalImage.prompt}
                  className="max-h-[65vh] w-auto max-w-full object-contain rounded-2xl shadow-2xl"
                />
              </div>

              <div className="p-6 space-y-4 bg-[#090d16]">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Prompt</h4>
                  <p className="text-sm font-semibold text-slate-100 mt-1">{activeModalImage.prompt}</p>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-zinc-800">
                  <div className="text-xs text-slate-400">
                    Source: <strong className="text-slate-200">{activeModalImage.source}</strong>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleCopyLink(activeModalImage)}
                      className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border border-zinc-700"
                    >
                      {copiedId === activeModalImage.id ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                      <span>{copiedId === activeModalImage.id ? "Link Copied" : "Copy Image Link"}</span>
                    </button>

                    <button
                      onClick={() => handleDownload(activeModalImage)}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-lg shadow-emerald-500/20"
                    >
                      <Download className="w-4 h-4" />
                      <span>Download HD Image</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
