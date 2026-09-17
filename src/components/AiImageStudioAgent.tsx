import React, { useState } from "react";
import {
  Wand2,
  Image as ImageIcon,
  Sparkles,
  Download,
  Copy,
  Check,
  RefreshCw,
  Sliders,
  Layers,
  Palette,
  Eye,
  Maximize2,
  Zap,
  Tag,
  Share2,
  ExternalLink,
  Bot
} from "lucide-react";

interface AiImageStudioAgentProps {
  apiKey?: string;
  selectedModel?: string;
  theme: "light" | "dark";
  onAddLog?: (type: string, msg: string) => void;
}

export const AiImageStudioAgent: React.FC<AiImageStudioAgentProps> = ({
  apiKey,
  selectedModel = "google/gemini-2.5-flash",
  theme,
  onAddLog
}) => {
  const [prompt, setPrompt] = useState<string>("Futuristic cyberpunk city bathed in neon rain, hyperrealistic 8k render, octane render, dramatic lighting");
  const [aspectRatio, setAspectRatio] = useState<string>("16:9");
  const [selectedStyle, setSelectedStyle] = useState<string>("Cyberpunk");
  const [negativePrompt, setNegativePrompt] = useState<string>("blurry, low resolution, distorted, watermark, extra limbs");
  const [seed, setSeed] = useState<number>(Math.floor(Math.random() * 100000));
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [enhancedPrompt, setEnhancedPrompt] = useState<string>("");
  const [isEnhancingPrompt, setIsEnhancingPrompt] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  const stylePresets = [
    { name: "Cyberpunk", prefix: "futuristic cyberpunk neon glow, octane render, 8k resolution, photorealistic, " },
    { name: "Anime / Manga", prefix: "vibrant studio ghibli anime style, detailed digital illustration, Makoto Shinkai aesthetics, " },
    { name: "Photorealistic 8K", prefix: "award winning photography, 85mm lens, f/1.8, dramatic cinematic lighting, ultra-detailed, " },
    { name: "3D Pixar Render", prefix: "cute 3D character animation style, Disney Pixar render, soft lighting, vibrant colors, " },
    { name: "Oil Painting", prefix: "classic oil painting on textured canvas, impasto brush strokes, expressive lighting, " },
    { name: "Minimalist Vector", prefix: "clean flat vector art, vibrant minimalist graphic design, sharp lines, " }
  ];

  const aspectRatios = [
    { label: "16:9 Landscape", width: 1280, height: 720 },
    { label: "1:1 Square", width: 1024, height: 1024 },
    { label: "9:16 Story / Reel", width: 720, height: 1280 },
    { label: "4:3 Classic", width: 1024, height: 768 }
  ];

  const handleEnhancePromptWithAI = async () => {
    setIsEnhancingPrompt(true);
    if (onAddLog) onAddLog("agent", "AI Prompt Engineer Agent optimizing image prompt...");

    try {
      const res = await fetch("/api/openrouter/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": apiKey ? `Bearer ${apiKey}` : ""
        },
        body: JSON.stringify({
          model: selectedModel,
          messages: [
            {
              role: "system",
              content: "You are a World-Class AI Image Prompt Engineer. Transform simple descriptions into highly detailed, descriptive image generation prompts with visual descriptors, lighting, lens specs, and atmosphere."
            },
            { role: "user", content: `Enhance this prompt into a masterpiece AI image prompt: "${prompt}"` }
          ]
        })
      });

      if (res.ok) {
        const data = await res.json();
        const optimized = data.choices?.[0]?.message?.content || prompt;
        setPrompt(optimized.trim());
        setEnhancedPrompt(optimized.trim());
        if (onAddLog) onAddLog("success", "Prompt optimized by AI Image Engineer Agent!");
      }
    } catch (e) {
      setPrompt(`${prompt}, ultra detailed, highly cinematic, 8k resolution, volumetric lighting, photorealistic octane render`);
    } finally {
      setIsEnhancingPrompt(false);
    }
  };

  const handleGenerateImage = () => {
    setIsGenerating(true);
    const newSeed = Math.floor(Math.random() * 1000000);
    setSeed(newSeed);

    if (onAddLog) onAddLog("agent", `Generating high-res AI image for prompt: "${prompt.slice(0, 40)}..."`);

    const activeStyleObj = stylePresets.find(s => s.name === selectedStyle);
    const fullPrompt = `${activeStyleObj ? activeStyleObj.prefix : ""}${prompt}`;

    const selectedArObj = aspectRatios.find(ar => ar.label === aspectRatio) || aspectRatios[0];
    const encodedPrompt = encodeURIComponent(fullPrompt);

    // Primary generation URL via Pollinations AI Engine
    const imgUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=${selectedArObj.width}&height=${selectedArObj.height}&seed=${newSeed}&nologo=true`;

    setTimeout(() => {
      setGeneratedImageUrl(imgUrl);
      setIsGenerating(false);
      if (onAddLog) onAddLog("success", "AI Image generated successfully!");
    }, 1200);
  };

  const handleCopyUrl = () => {
    if (!generatedImageUrl) return;
    navigator.clipboard.writeText(generatedImageUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadImage = async () => {
    if (!generatedImageUrl) return;
    try {
      const proxyUrl = `/api/media/download?url=${encodeURIComponent(generatedImageUrl)}&filename=ai_generated_image_${seed}.jpg`;
      const link = document.createElement("a");
      link.href = proxyUrl;
      link.download = `ai_generated_image_${seed}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (e) {
      window.open(generatedImageUrl, "_blank");
    }
  };

  return (
    <div className={`w-full min-h-full flex flex-col p-4 md:p-6 transition-colors duration-200 ${
      theme === "dark" ? "bg-zinc-950 text-white" : "bg-slate-50 text-slate-900"
    }`}>
      {/* Agent Banner Header */}
      <div className={`p-5 rounded-2xl border mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm ${
        theme === "dark" ? "bg-gradient-to-r from-zinc-900 via-purple-950/40 to-zinc-900 border-zinc-800" : "bg-white border-slate-200"
      }`}>
        <div className="flex items-center gap-3.5">
          <div className="p-3 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-600 text-white shadow-md">
            <Wand2 className="w-6 h-6 animate-spin-slow" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight">AI Image Studio & Prompt Agent</h1>
              <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-purple-500/15 text-purple-400 border border-purple-500/30">
                Pollinations AI & Prompt Optimizer
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Transform creative ideas into high-resolution artwork with AI prompt enhancement, style presets, and aspect ratios!
            </p>
          </div>
        </div>

        <button
          onClick={handleGenerateImage}
          disabled={isGenerating || !prompt.trim()}
          className="px-6 py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-extrabold text-xs flex items-center gap-2 shadow-lg shadow-purple-600/20 transition-all cursor-pointer disabled:opacity-50 shrink-0"
        >
          {isGenerating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          <span>{isGenerating ? "Generating Image..." : "Generate AI Image"}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Controls & Configuration Panel (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <div className={`p-5 rounded-2xl border space-y-4 shadow-sm ${
            theme === "dark" ? "bg-zinc-900 border-zinc-800" : "bg-white border-slate-200"
          }`}>
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Palette className="w-4 h-4 text-purple-400" /> Prompt Description
              </h3>

              <button
                type="button"
                onClick={handleEnhancePromptWithAI}
                disabled={isEnhancingPrompt}
                className="px-2.5 py-1 rounded-lg bg-purple-500/15 hover:bg-purple-500/25 text-purple-400 border border-purple-500/30 text-[11px] font-bold flex items-center gap-1 cursor-pointer"
              >
                <Sparkles className={`w-3 h-3 ${isEnhancingPrompt ? "animate-spin" : ""}`} />
                AI Prompt Enhancer
              </button>
            </div>

            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={4}
              placeholder="Describe the image you want to generate..."
              className={`w-full p-3.5 rounded-xl text-xs border outline-none resize-none font-sans ${
                theme === "dark" ? "bg-zinc-950 border-zinc-800 text-white focus:border-purple-500" : "bg-slate-50 border-slate-200"
              }`}
            />

            {/* Style Preset Selector */}
            <div>
              <label className="text-[11px] font-bold text-slate-400 uppercase mb-2 block">
                Art Style Preset
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                {stylePresets.map((style) => (
                  <button
                    key={style.name}
                    type="button"
                    onClick={() => setSelectedStyle(style.name)}
                    className={`px-3 py-2 rounded-xl text-xs font-medium text-left transition-all border ${
                      selectedStyle === style.name
                        ? "bg-purple-600 text-white border-purple-500 font-bold shadow-sm"
                        : theme === "dark" ? "bg-zinc-950 border-zinc-800 text-slate-400 hover:text-white" : "bg-slate-50 border-slate-200 text-slate-700"
                    }`}
                  >
                    {style.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Aspect Ratio Selector */}
            <div>
              <label className="text-[11px] font-bold text-slate-400 uppercase mb-2 block">
                Aspect Ratio
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                {aspectRatios.map((ar) => (
                  <button
                    key={ar.label}
                    type="button"
                    onClick={() => setAspectRatio(ar.label)}
                    className={`px-3 py-2 rounded-xl text-xs font-medium text-center transition-all border ${
                      aspectRatio === ar.label
                        ? "bg-purple-600 text-white border-purple-500 font-bold shadow-sm"
                        : theme === "dark" ? "bg-zinc-950 border-zinc-800 text-slate-400 hover:text-white" : "bg-slate-50 border-slate-200 text-slate-700"
                    }`}
                  >
                    {ar.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Negative Prompt */}
            <div>
              <label className="text-[11px] font-bold text-slate-400 uppercase mb-1 block">
                Negative Prompt (To Exclude)
              </label>
              <input
                type="text"
                value={negativePrompt}
                onChange={(e) => setNegativePrompt(e.target.value)}
                className={`w-full px-3 py-2 rounded-xl text-xs border outline-none ${
                  theme === "dark" ? "bg-zinc-950 border-zinc-800 text-slate-300" : "bg-slate-50 border-slate-200"
                }`}
              />
            </div>
          </div>
        </div>

        {/* Generated Artwork Canvas Display (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          <div className={`p-5 rounded-2xl border shadow-sm flex flex-col justify-between min-h-[440px] ${
            theme === "dark" ? "bg-zinc-900 border-zinc-800" : "bg-white border-slate-200"
          }`}>
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-zinc-800 mb-4">
              <div className="flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-purple-400" />
                <h3 className="text-sm font-bold">Generated Artwork Canvas</h3>
              </div>

              {generatedImageUrl && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopyUrl}
                    className="p-2 rounded-xl bg-zinc-800 text-slate-200 hover:text-white text-xs font-bold flex items-center gap-1 cursor-pointer"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                  <button
                    onClick={handleDownloadImage}
                    className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center gap-1.5 shadow cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Download HD
                  </button>
                </div>
              )}
            </div>

            {/* Display Canvas Box */}
            <div className="relative flex-1 rounded-2xl overflow-hidden bg-black/80 border border-zinc-800 flex items-center justify-center min-h-[340px]">
              {isGenerating ? (
                <div className="flex flex-col items-center gap-3 text-purple-400 p-6 text-center">
                  <RefreshCw className="w-10 h-10 animate-spin text-purple-400" />
                  <p className="text-xs font-mono">Synthesizing neural diffusion layers...</p>
                </div>
              ) : generatedImageUrl ? (
                <img
                  src={generatedImageUrl}
                  alt={prompt}
                  className="w-full h-full object-contain max-h-[500px]"
                />
              ) : (
                <div className="flex flex-col items-center gap-3 text-slate-500 p-8 text-center">
                  <Wand2 className="w-10 h-10 text-purple-500/50" />
                  <p className="text-xs max-w-sm">
                    Configure your prompt and style preset above, then click <strong>"Generate AI Image"</strong>!
                  </p>
                </div>
              )}
            </div>

            {generatedImageUrl && (
              <div className="mt-4 p-3 rounded-xl bg-zinc-950 border border-zinc-800 text-[11px] font-mono text-slate-400 flex justify-between">
                <span>Seed: #{seed}</span>
                <span>Preset: {selectedStyle}</span>
                <span>Format: {aspectRatio}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
