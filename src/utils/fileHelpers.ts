import { Model } from "../types";

// Curated popular and active verified models
export const popularModels: Model[] = [
  { id: "google/gemini-2.5-flash", name: "Google: Gemini 2.5 Flash (Fast & Recommended)" },
  { id: "liquid/lfm-2.5-2.6b:free", name: "LiquidAI: LFM2.5-2.6B (Free)" },
  { id: "nex-agi/nex-n2.5-mini:free", name: "Nex-AGI: Nex N2.5 Mini (Free)" },
  { id: "poolside/laguna-s-2.1:free", name: "Poolside: Laguna S 2.1 Agent (Free)" },
  { id: "cohere/north-mini-code:free", name: "Cohere: North Mini Code (Free)" },
  { id: "thinkingmachines/inkling:free", name: "Thinking Machines: Inkling (Free)" },
  { id: "nvidia/nemotron-3.5-lightning:free", name: "NVIDIA: Nemotron 3.5 Lightning (Free)" },
  { id: "poolside/laguna-xs-2.1:free", name: "Poolside: Laguna XS 2.1 (Free)" },
  { id: "google/gemma-4-31b-it:free", name: "Google: Gemma 4 31B Instruct (Free)" },
  { id: "google/gemma-4-26b-a4b-it:free", name: "Google: Gemma 4 26B A4B (Free)" },
  { id: "nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free", name: "NVIDIA: Nemotron 3 Nano Omni (Free)" },
  { id: "nvidia/nemotron-3-ultra-550b-a55b:free", name: "NVIDIA: Nemotron 3 Ultra (Free)" },
  { id: "nvidia/nemotron-3-super-120b-a12b:free", name: "NVIDIA: Nemotron 3 Super (Free)" },
  { id: "thinkingmachines/inkling-small:free", name: "Thinking Machines: Inkling Small (Free)" },
  { id: "inclusionai/ling-3.0-flash-fin:free", name: "InclusionAI: Ling 3.0 Flash Fin (Free)" },
  { id: "dots-studio/dots-3-note-preview:free", name: "Dots Studio: Dots3-Note Preview (Free)" },
  { id: "openrouter/auto", name: "OpenRouter: Auto Router" },
  { id: "google/gemini-2.5-pro", name: "Google: Gemini 2.5 Pro" },
  { id: "anthropic/claude-3.5-sonnet", name: "Anthropic: Claude 3.5 Sonnet" },
  { id: "deepseek/deepseek-chat", name: "DeepSeek: V3" },
  { id: "deepseek/deepseek-reasoner", name: "DeepSeek: R1 (Reasoning)" },
  { id: "meta-llama/llama-3.3-70b-instruct", name: "Meta: Llama 3.3 70B Instruct" },
  { id: "openai/gpt-4o", name: "OpenAI: GPT-4o" },
  { id: "openai/gpt-4o-mini", name: "OpenAI: GPT-4o Mini" },
  { id: "qwen/qwen-2.5-coder-32b-instruct", name: "Qwen: 2.5 Coder 32B" }
];

// Deduplicate helper ensuring strictly unique model items
export const deduplicateModels = (list: Model[]): Model[] => {
  const seen = new Set<string>();
  return (list || []).filter(item => {
    if (!item || !item.id || seen.has(item.id)) return false;
    seen.add(item.id);
    return true;
  });
};

// File type badge and icon style helper
export const getFileBadgeAndIcon = (filePath?: string) => {
  if (!filePath || typeof filePath !== "string") return null;
  const ext = (filePath.split(".").pop() || "").toLowerCase();
  
  if (ext === "c") {
    return {
      badge: "C",
      colorClass: "bg-cyan-500/15 text-cyan-600 border-cyan-500/30 dark:text-cyan-400 dark:bg-cyan-500/20",
      iconColor: "text-cyan-500"
    };
  }
  if (["cpp", "cc", "cxx", "h", "hpp"].includes(ext)) {
    return {
      badge: "C++",
      colorClass: "bg-blue-500/15 text-blue-600 border-blue-500/30 dark:text-blue-400 dark:bg-blue-500/20",
      iconColor: "text-blue-500"
    };
  }
  if (["py", "python"].includes(ext)) {
    return {
      badge: "PY",
      colorClass: "bg-amber-500/15 text-amber-600 border-amber-500/30 dark:text-amber-400 dark:bg-amber-500/20",
      iconColor: "text-amber-500"
    };
  }
  if (["js", "javascript", "cjs", "mjs"].includes(ext)) {
    return {
      badge: "JS",
      colorClass: "bg-yellow-500/15 text-yellow-600 border-yellow-500/30 dark:text-yellow-400 dark:bg-yellow-500/20",
      iconColor: "text-yellow-500"
    };
  }
  if (["jsx"].includes(ext)) {
    return {
      badge: "JSX",
      colorClass: "bg-yellow-500/15 text-yellow-600 border-yellow-500/30 dark:text-yellow-400 dark:bg-yellow-500/20",
      iconColor: "text-yellow-500"
    };
  }
  if (["ts", "typescript"].includes(ext)) {
    return {
      badge: "TS",
      colorClass: "bg-sky-500/15 text-sky-600 border-sky-500/30 dark:text-sky-400 dark:bg-sky-500/20",
      iconColor: "text-sky-500"
    };
  }
  if (["tsx"].includes(ext)) {
    return {
      badge: "TSX",
      colorClass: "bg-sky-500/15 text-sky-600 border-sky-500/30 dark:text-sky-400 dark:bg-sky-500/20",
      iconColor: "text-sky-500"
    };
  }
  if (["html", "htm"].includes(ext)) {
    return {
      badge: "HTML",
      colorClass: "bg-orange-500/15 text-orange-600 border-orange-500/30 dark:text-orange-400 dark:bg-orange-500/20",
      iconColor: "text-orange-500"
    };
  }
  if (["css"].includes(ext)) {
    return {
      badge: "CSS",
      colorClass: "bg-pink-500/15 text-pink-600 border-pink-500/30 dark:text-pink-400 dark:bg-pink-500/20",
      iconColor: "text-pink-500"
    };
  }
  if (["json"].includes(ext)) {
    return {
      badge: "JSON",
      colorClass: "bg-emerald-500/15 text-emerald-600 border-emerald-500/30 dark:text-emerald-400 dark:bg-emerald-500/20",
      iconColor: "text-emerald-500"
    };
  }
  if (["java"].includes(ext)) {
    return {
      badge: "JAVA",
      colorClass: "bg-rose-500/15 text-rose-600 border-rose-500/30 dark:text-rose-400 dark:bg-rose-500/20",
      iconColor: "text-rose-500"
    };
  }
  if (["sql"].includes(ext)) {
    return {
      badge: "SQL",
      colorClass: "bg-purple-500/15 text-purple-600 border-purple-500/30 dark:text-purple-400 dark:bg-purple-500/20",
      iconColor: "text-purple-500"
    };
  }
  if (["sh", "bash"].includes(ext)) {
    return {
      badge: "SH",
      colorClass: "bg-lime-500/15 text-lime-600 border-lime-500/30 dark:text-lime-400 dark:bg-lime-500/20",
      iconColor: "text-lime-500"
    };
  }
  if (["md", "markdown"].includes(ext)) {
    return {
      badge: "MD",
      colorClass: "bg-slate-500/15 text-slate-600 border-slate-500/30 dark:text-slate-400 dark:bg-slate-500/20",
      iconColor: "text-slate-500"
    };
  }
  if (["svg", "xml"].includes(ext)) {
    return {
      badge: "XML",
      colorClass: "bg-violet-500/15 text-violet-600 border-violet-500/30 dark:text-violet-400 dark:bg-violet-500/20",
      iconColor: "text-violet-500"
    };
  }
  
  return {
    badge: ext ? ext.toUpperCase().slice(0, 4) : "FILE",
    colorClass: "bg-slate-500/10 text-slate-600 border-slate-300 dark:text-slate-400 dark:bg-slate-800",
    iconColor: "text-slate-400"
  };
};
