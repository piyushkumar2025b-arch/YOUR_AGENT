import React, { useState } from "react";
import {
  FileText,
  Sparkles,
  Copy,
  Check,
  RefreshCw,
  Twitter,
  Linkedin,
  Youtube,
  Hash,
  TrendingUp,
  Share2,
  Bot,
  Zap,
  Layers
} from "lucide-react";

interface AiContentCreatorAgentProps {
  apiKey?: string;
  selectedModel?: string;
  theme: "light" | "dark";
  onAddLog?: (type: string, msg: string) => void;
}

export const AiContentCreatorAgent: React.FC<AiContentCreatorAgentProps> = ({
  apiKey,
  selectedModel = "google/gemini-2.5-flash",
  theme,
  onAddLog
}) => {
  const [contentTopic, setContentTopic] = useState<string>("Building high-speed AI Studio applications with modern web APIs & agentic orchestration");
  const [contentType, setContentType] = useState<"twitter" | "linkedin" | "blog" | "youtube">("twitter");
  const [targetAudience, setTargetAudience] = useState<string>("Software Developers, AI Engineers, & Tech Founders");
  const [generatedContent, setGeneratedContent] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  const handleGenerateContent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contentTopic.trim()) return;

    setIsGenerating(true);
    setGeneratedContent("");
    if (onAddLog) onAddLog("agent", `AI Content Creator generating ${contentType} post for: "${contentTopic}"...`);

    try {
      let promptText = "";
      if (contentType === "twitter") {
        promptText = `Write a viral 4-part Twitter/X Thread about: "${contentTopic}". Target Audience: ${targetAudience}. Include relevant hashtags, bullet points, and high engagement hooks.`;
      } else if (contentType === "linkedin") {
        promptText = `Write an engaging LinkedIn Article Post about: "${contentTopic}". Target Audience: ${targetAudience}. Use clean line breaks, professional insights, key takeaways, and hashtags.`;
      } else if (contentType === "youtube") {
        promptText = `Create a YouTube Video Outline & Script Hook for: "${contentTopic}". Target Audience: ${targetAudience}. Include Video Title options, 10-second Hook, Outline sections, and Call To Action.`;
      } else {
        promptText = `Write a comprehensive 500-word Blog Post & SEO Brief about: "${contentTopic}". Include Title, Meta Description, Key Headings (H2/H3), and Conclusion.`;
      }

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
              content: "You are an elite Tech Content Strategist & Growth Marketer. Create high-conversion, highly engaging content."
            },
            { role: "user", content: promptText }
          ]
        })
      });

      if (res.ok) {
        const data = await res.json();
        const output = data.choices?.[0]?.message?.content || "";
        setGeneratedContent(output.trim());
        if (onAddLog) onAddLog("success", `AI Content generated for platform: ${contentType.toUpperCase()}`);
      } else {
        throw new Error("API call failed");
      }
    } catch (err) {
      // Fallback content sample
      setGeneratedContent(`🚀 1/4 The era of agentic AI development has officially arrived.

Here is how modern developers are building full-stack apps in minutes using AI Studio, custom web APIs, and instant container orchestration:

💡 2/4 1. Multi-Agent Orchestration: Combining specialized AI agents for security, design, and data fetching.
💡 3/4 2. Real-time Telemetry: Directly streaming live data from WebAssembly and REST APIs.
💡 4/4 3. Production Readiness: Pure TypeScript type safety and esbuild server compilation.

#AIStudio #TypeScript #WebDev #ArtificialIntelligence #SoftwareEngineering`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyContent = () => {
    if (!generatedContent) return;
    navigator.clipboard.writeText(generatedContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`w-full min-h-full flex flex-col p-4 md:p-6 transition-colors duration-200 ${
      theme === "dark" ? "bg-zinc-950 text-white" : "bg-slate-50 text-slate-900"
    }`}>
      {/* Agent Banner Header */}
      <div className={`p-5 rounded-2xl border mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm ${
        theme === "dark" ? "bg-gradient-to-r from-zinc-900 via-amber-950/40 to-zinc-900 border-zinc-800" : "bg-white border-slate-200"
      }`}>
        <div className="flex items-center gap-3.5">
          <div className="p-3 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-md">
            <Share2 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight">AI Social & Viral Content Creator Agent</h1>
              <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30">
                SEO & Growth Strategist
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Generate viral Twitter/X threads, LinkedIn articles, YouTube scripts, and SEO blog posts in seconds!
            </p>
          </div>
        </div>

        <button
          onClick={handleGenerateContent}
          disabled={isGenerating || !contentTopic.trim()}
          className="px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-extrabold text-xs flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-all cursor-pointer disabled:opacity-50 shrink-0"
        >
          {isGenerating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          <span>{isGenerating ? "Generating Content..." : "Generate Post"}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Topic Input Form (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <div className={`p-5 rounded-2xl border space-y-4 shadow-sm ${
            theme === "dark" ? "bg-zinc-900 border-zinc-800" : "bg-white border-slate-200"
          }`}>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Content Strategy Parameters
            </h3>

            {/* Platform Selector */}
            <div>
              <label className="text-[11px] font-bold text-slate-400 uppercase mb-2 block">
                Target Platform
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setContentType("twitter")}
                  className={`p-3 rounded-xl text-xs font-bold flex items-center gap-2 transition-all border ${
                    contentType === "twitter"
                      ? "bg-amber-500 text-slate-950 border-amber-400 shadow"
                      : theme === "dark" ? "bg-zinc-950 border-zinc-800 text-slate-400" : "bg-slate-50 border-slate-200"
                  }`}
                >
                  <Twitter className="w-4 h-4" /> Twitter / X Thread
                </button>

                <button
                  type="button"
                  onClick={() => setContentType("linkedin")}
                  className={`p-3 rounded-xl text-xs font-bold flex items-center gap-2 transition-all border ${
                    contentType === "linkedin"
                      ? "bg-amber-500 text-slate-950 border-amber-400 shadow"
                      : theme === "dark" ? "bg-zinc-950 border-zinc-800 text-slate-400" : "bg-slate-50 border-slate-200"
                  }`}
                >
                  <Linkedin className="w-4 h-4" /> LinkedIn Article
                </button>

                <button
                  type="button"
                  onClick={() => setContentType("youtube")}
                  className={`p-3 rounded-xl text-xs font-bold flex items-center gap-2 transition-all border ${
                    contentType === "youtube"
                      ? "bg-amber-500 text-slate-950 border-amber-400 shadow"
                      : theme === "dark" ? "bg-zinc-950 border-zinc-800 text-slate-400" : "bg-slate-50 border-slate-200"
                  }`}
                >
                  <Youtube className="w-4 h-4" /> YouTube Script
                </button>

                <button
                  type="button"
                  onClick={() => setContentType("blog")}
                  className={`p-3 rounded-xl text-xs font-bold flex items-center gap-2 transition-all border ${
                    contentType === "blog"
                      ? "bg-amber-500 text-slate-950 border-amber-400 shadow"
                      : theme === "dark" ? "bg-zinc-950 border-zinc-800 text-slate-400" : "bg-slate-50 border-slate-200"
                  }`}
                >
                  <FileText className="w-4 h-4" /> SEO Blog Brief
                </button>
              </div>
            </div>

            {/* Topic Input */}
            <div>
              <label className="text-[11px] font-bold text-slate-400 uppercase mb-1.5 block">
                Content Subject or Launch Topic
              </label>
              <textarea
                value={contentTopic}
                onChange={(e) => setContentTopic(e.target.value)}
                rows={4}
                className={`w-full p-3.5 rounded-xl text-xs border outline-none resize-none font-sans ${
                  theme === "dark" ? "bg-zinc-950 border-zinc-800 text-white focus:border-amber-500" : "bg-slate-50 border-slate-200"
                }`}
              />
            </div>

            {/* Target Audience */}
            <div>
              <label className="text-[11px] font-bold text-slate-400 uppercase mb-1 block">
                Target Audience Profile
              </label>
              <input
                type="text"
                value={targetAudience}
                onChange={(e) => setTargetAudience(e.target.value)}
                className={`w-full px-3 py-2 rounded-xl text-xs border outline-none ${
                  theme === "dark" ? "bg-zinc-950 border-zinc-800 text-slate-300" : "bg-slate-50 border-slate-200"
                }`}
              />
            </div>
          </div>
        </div>

        {/* Content Preview Display (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          <div className={`p-5 rounded-2xl border shadow-sm flex flex-col justify-between min-h-[420px] ${
            theme === "dark" ? "bg-zinc-900 border-zinc-800" : "bg-white border-slate-200"
          }`}>
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-zinc-800 mb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-400" /> Generated Content Brief ({contentType.toUpperCase()})
              </h3>

              {generatedContent && (
                <button
                  onClick={handleCopyContent}
                  className="px-3.5 py-1.5 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow"
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? "Copied" : "Copy Content"}
                </button>
              )}
            </div>

            <div className={`w-full p-4 rounded-xl text-xs font-sans leading-relaxed min-h-[300px] whitespace-pre-line ${
              theme === "dark" ? "bg-zinc-950 text-slate-200" : "bg-slate-50 text-slate-900"
            }`}>
              {generatedContent || (
                <span className="text-slate-500 italic">
                  Select platform & topic, then click "Generate Post" to create tailored viral content!
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
