import React, { useState, useEffect } from "react";
import {
  Quote,
  Sparkles,
  RefreshCw,
  Copy,
  Check,
  Bot,
  Zap,
  Lightbulb
} from "lucide-react";

interface AdviceQuotesAgentProps {
  apiKey?: string;
  selectedModel?: string;
  theme: "light" | "dark";
  onAddLog?: (type: string, msg: string) => void;
}

export const AdviceQuotesAgent: React.FC<AdviceQuotesAgentProps> = ({
  apiKey,
  selectedModel = "google/gemini-2.5-flash",
  theme,
  onAddLog
}) => {
  const [advice, setAdvice] = useState<string>("");
  const [adviceId, setAdviceId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [aiPhilosophy, setAiPhilosophy] = useState<string>("");
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);

  useEffect(() => {
    fetchAdvice();
  }, []);

  const fetchAdvice = async () => {
    setIsLoading(true);
    setAiPhilosophy("");
    if (onAddLog) onAddLog("agent", "Fetching daily wisdom slip from AdviceSlip API...");

    try {
      const res = await fetch("/api/advice/random");
      if (res.ok) {
        const data = await res.json();
        setAdvice(data.advice || "");
        setAdviceId(data.id || null);
        if (onAddLog) onAddLog("success", `Wisdom slip #${data.id} fetched via backend!`);
      }
    } catch (e) {
      setAdvice("Always treat people with kindness and consistency.");
      setAdviceId(101);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAiReflect = async () => {
    if (!advice) return;

    setIsAnalyzing(true);
    setAiPhilosophy("");
    if (onAddLog) onAddLog("agent", "AI Stoic Philosopher reflecting on daily wisdom slip...");

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
              content: "You are a Stoic Philosopher & Cognitive Executive Coach."
            },
            {
              role: "user",
              content: `Wisdom Quote: "${advice}"\n\nProvide a 2-bullet practical actionable reflection on applying this mindset in daily decision making.`
            }
          ]
        })
      });

      if (res.ok) {
        const data = await res.json();
        const text = data.choices?.[0]?.message?.content || "";
        setAiPhilosophy(text.trim());
        if (onAddLog) onAddLog("success", "AI Stoic reflection generated!");
      }
    } catch (e) {
      setAiPhilosophy(`• **Actionable Principle**: Internalize focus on what is within direct control.\n• **Execution**: Approach friction with emotional calmness and long-term clarity.`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(`"${advice}"`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`w-full min-h-full flex flex-col p-4 md:p-6 transition-colors duration-200 ${
      theme === "dark" ? "bg-zinc-950 text-white" : "bg-slate-50 text-slate-900"
    }`}>
      {/* Banner Header */}
      <div className={`p-5 rounded-2xl border mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm ${
        theme === "dark" ? "bg-gradient-to-r from-zinc-900 via-amber-950/40 to-zinc-900 border-zinc-800" : "bg-white border-slate-200"
      }`}>
        <div className="flex items-center gap-3.5">
          <div className="p-3 rounded-2xl bg-gradient-to-br from-amber-500 to-yellow-600 text-white shadow-md">
            <Quote className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight">Daily Wisdom & Philosophical Advice Agent</h1>
              <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30">
                Live AdviceSlip API
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Random wisdom slips, stoic life hacks, and AI philosophical executive reflection!
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchAdvice}
            disabled={isLoading}
            className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-600 text-white text-xs font-extrabold flex items-center gap-1.5 cursor-pointer shadow-lg shadow-amber-500/20"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
            New Wisdom
          </button>
        </div>
      </div>

      <div className="max-w-2xl mx-auto w-full flex flex-col gap-6">
        <div className={`p-8 rounded-2xl border space-y-6 text-center shadow-xl ${
          theme === "dark" ? "bg-zinc-900 border-zinc-800" : "bg-white border-slate-200"
        }`}>
          {adviceId && (
            <span className="text-[10px] font-mono font-bold text-amber-400 uppercase tracking-widest block">
              Wisdom Slip #{adviceId}
            </span>
          )}

          <blockquote className="text-lg md:text-xl font-bold text-white italic leading-relaxed font-serif">
            "{advice}"
          </blockquote>

          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={handleCopy}
              className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? "Copied" : "Copy Quote"}
            </button>

            <button
              onClick={handleAiReflect}
              disabled={isAnalyzing}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-600 text-white font-extrabold text-xs flex items-center gap-1.5 shadow cursor-pointer disabled:opacity-50"
            >
              <Sparkles className={`w-3.5 h-3.5 ${isAnalyzing ? "animate-spin" : ""}`} />
              {isAnalyzing ? "Reflecting..." : "AI Stoic Reflection"}
            </button>
          </div>

          {aiPhilosophy && (
            <div className="p-4 rounded-xl bg-amber-950/30 border border-amber-500/30 text-left space-y-2">
              <h4 className="text-xs font-bold uppercase text-amber-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" /> AI Stoic Practical Reflection
              </h4>
              <div className="text-xs text-slate-200 leading-relaxed font-sans whitespace-pre-line">
                {aiPhilosophy}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
