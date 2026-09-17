import React, { useState, useEffect } from "react";
import {
  Dog,
  Cat,
  Sparkles,
  RefreshCw,
  Heart,
  Bot,
  Zap,
  Info,
  Copy,
  Check
} from "lucide-react";

interface AnimalFactsAgentProps {
  apiKey?: string;
  selectedModel?: string;
  theme: "light" | "dark";
  onAddLog?: (type: string, msg: string) => void;
}

export const AnimalFactsAgent: React.FC<AnimalFactsAgentProps> = ({
  apiKey,
  selectedModel = "google/gemini-2.5-flash",
  theme,
  onAddLog
}) => {
  const [petType, setPetType] = useState<"dog" | "cat">("dog");
  const [imageUrl, setImageUrl] = useState<string>("");
  const [petFact, setPetFact] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [aiPetBehavior, setAiPetBehavior] = useState<string>("");
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);

  useEffect(() => {
    fetchPetMedia();
  }, [petType]);

  const fetchPetMedia = async () => {
    setIsLoading(true);
    setAiPetBehavior("");
    if (onAddLog) onAddLog("agent", `Fetching random ${petType} media & facts from free public APIs...`);

    try {
      const res = await fetch(`/api/animals/pet?type=${encodeURIComponent(petType)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.imageUrl) setImageUrl(data.imageUrl);
        if (data.fact) setPetFact(data.fact);
        if (onAddLog) onAddLog("success", `Fetched new ${petType} media via backend!`);
      } else {
        throw new Error("Failed to fetch animal data");
      }
    } catch (e) {
      setImageUrl(petType === "dog" ? "https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=800&auto=format&fit=crop&q=80" : "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=800&auto=format&fit=crop&q=80");
      setPetFact(petType === "dog" ? "Dogs have a sense of time and predict future events based on daily routines!" : "Cats spend 70% of their lives sleeping!");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAiPetAnalysis = async () => {
    setIsAnalyzing(true);
    setAiPetBehavior("");
    if (onAddLog) onAddLog("agent", `AI Veterinary & Pet Behaviorist synthesizing species profile...`);

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
              content: "You are a Certified Veterinary Ethologist & Pet Behaviorist."
            },
            {
              role: "user",
              content: `Provide 3 fun science-backed facts and care guidelines for ${petType}s.`
            }
          ]
        })
      });

      if (res.ok) {
        const data = await res.json();
        const text = data.choices?.[0]?.message?.content || "";
        setAiPetBehavior(text.trim());
        if (onAddLog) onAddLog("success", "AI Pet Ethology facts generated!");
      }
    } catch (e) {
      setAiPetBehavior(`• **Social Structure**: Highly perceptive to voice inflection and emotional valence.
• **Dietary Needs**: Requires high protein intake with fresh hydration stations.
• **Enrichment**: Daily play stimulation lowers anxiety markers and boosts cognitive health.`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className={`w-full min-h-full flex flex-col p-4 md:p-6 transition-colors duration-200 ${
      theme === "dark" ? "bg-zinc-950 text-white" : "bg-slate-50 text-slate-900"
    }`}>
      {/* Banner Header */}
      <div className={`p-5 rounded-2xl border mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm ${
        theme === "dark" ? "bg-gradient-to-r from-zinc-900 via-orange-950/40 to-zinc-900 border-zinc-800" : "bg-white border-slate-200"
      }`}>
        <div className="flex items-center gap-3.5">
          <div className="p-3 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-600 text-white shadow-md">
            <Dog className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight">Dog & Cat Media Facts Agent</h1>
              <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-orange-500/15 text-orange-400 border border-orange-500/30">
                Live Dog CEO & CatNinja APIs
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Random high-resolution pet media, feline trivia, and AI veterinary ethology insights!
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setPetType(petType === "dog" ? "cat" : "dog")}
            className="px-4 py-2.5 rounded-2xl bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
          >
            {petType === "dog" ? <Cat className="w-3.5 h-3.5 text-amber-400" /> : <Dog className="w-3.5 h-3.5 text-orange-400" />}
            Switch to {petType === "dog" ? "Cats" : "Dogs"}
          </button>

          <button
            onClick={fetchPetMedia}
            disabled={isLoading}
            className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-600 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
            New Pet
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Media Canvas (6 cols) */}
        <div className="lg:col-span-6 flex flex-col gap-4">
          <div className={`p-4 rounded-2xl border flex flex-col items-center justify-center min-h-[360px] ${
            theme === "dark" ? "bg-zinc-900 border-zinc-800" : "bg-white border-slate-200"
          }`}>
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={petType}
                className="w-full max-h-[420px] object-cover rounded-xl shadow-lg border border-zinc-800"
              />
            ) : (
              <div className="p-10 text-slate-500 text-xs">Loading media...</div>
            )}
          </div>
        </div>

        {/* Fact & AI Ethology (6 cols) */}
        <div className="lg:col-span-6 flex flex-col gap-4">
          <div className={`p-5 rounded-2xl border space-y-4 shadow-sm ${
            theme === "dark" ? "bg-zinc-900 border-zinc-800" : "bg-white border-slate-200"
          }`}>
            {petFact && (
              <div className="p-4 rounded-xl bg-amber-950/30 border border-amber-500/30 space-y-1">
                <span className="text-[10px] font-bold text-amber-400 uppercase">
                  {petType === "dog" ? "Canine Fact Trivia" : "Feline Fact Trivia"}
                </span>
                <p className="text-xs text-slate-200 leading-relaxed font-sans">{petFact}</p>
              </div>
            )}

            <div className="flex items-center justify-between pt-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Species Behavioral Ethology
              </h3>
              <button
                onClick={handleAiPetAnalysis}
                disabled={isAnalyzing}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-600 text-white font-bold text-xs flex items-center gap-1.5 shadow cursor-pointer disabled:opacity-50"
              >
                <Sparkles className={`w-3.5 h-3.5 ${isAnalyzing ? "animate-spin" : ""}`} />
                {isAnalyzing ? "Analyzing..." : "AI Ethology Insights"}
              </button>
            </div>

            {aiPetBehavior && (
              <div className="p-4 rounded-xl bg-orange-950/30 border border-orange-500/30 space-y-2">
                <h4 className="text-xs font-bold uppercase text-orange-400 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" /> AI Ethology Care Guidelines
                </h4>
                <div className="text-xs text-slate-200 leading-relaxed font-sans whitespace-pre-line">
                  {aiPetBehavior}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
