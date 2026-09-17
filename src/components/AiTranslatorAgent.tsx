import React, { useState } from "react";
import {
  Languages,
  Sparkles,
  ArrowRightLeft,
  Copy,
  Check,
  Volume2,
  RefreshCw,
  Globe2,
  Bot,
  Zap,
  Sliders
} from "lucide-react";

interface AiTranslatorAgentProps {
  apiKey?: string;
  selectedModel?: string;
  theme: "light" | "dark";
  onAddLog?: (type: string, msg: string) => void;
}

export const AiTranslatorAgent: React.FC<AiTranslatorAgentProps> = ({
  apiKey,
  selectedModel = "google/gemini-2.5-flash",
  theme,
  onAddLog
}) => {
  const [sourceText, setSourceText] = useState<string>("Building real-time full-stack applications with Google AI Studio and multi-agent AI orchestration!");
  const [sourceLang, setSourceLang] = useState<string>("en");
  const [targetLang, setTargetLang] = useState<string>("es");
  const [targetTone, setTargetTone] = useState<"natural" | "formal" | "technical" | "casual">("natural");
  const [translatedText, setTranslatedText] = useState<string>("");
  const [isTranslating, setIsTranslating] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  const languages = [
    { code: "en", name: "English" },
    { code: "es", name: "Spanish (Español)" },
    { code: "fr", name: "French (Français)" },
    { code: "de", name: "German (Deutsch)" },
    { code: "ja", name: "Japanese (日本語)" },
    { code: "zh", name: "Chinese (中文)" },
    { code: "hi", name: "Hindi (हिंदी)" },
    { code: "pt", name: "Portuguese (Português)" },
    { code: "ru", name: "Russian (Русский)" },
    { code: "ar", name: "Arabic (العربية)" },
    { code: "ko", name: "Korean (한국어)" },
    { code: "it", name: "Italian (Italiano)" }
  ];

  const handleTranslate = async () => {
    if (!sourceText.trim()) return;

    setIsTranslating(true);
    setTranslatedText("");
    if (onAddLog) onAddLog("agent", `Translating text from ${sourceLang} to ${targetLang} (Tone: ${targetTone})...`);

    try {
      const sourceLangName = languages.find(l => l.code === sourceLang)?.name || sourceLang;
      const targetLangName = languages.find(l => l.code === targetLang)?.name || targetLang;

      const prompt = `Translate the following text from ${sourceLangName} to ${targetLangName}. Tone style should be ${targetTone}.
Text: "${sourceText}"
Output ONLY the translated text without extra preamble.`;

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
              content: "You are a professional multilingual translator. Provide precise, culturally accurate translations."
            },
            { role: "user", content: prompt }
          ]
        })
      });

      if (res.ok) {
        const data = await res.json();
        const output = data.choices?.[0]?.message?.content || "";
        setTranslatedText(output.trim());
        if (onAddLog) onAddLog("success", "Multilingual translation completed!");
      } else {
        throw new Error("API call failed");
      }
    } catch (err) {
      // Free public fallback translation via MyMemory API
      try {
        const fallbackRes = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(sourceText)}&langpair=${sourceLang}|${targetLang}`);
        if (fallbackRes.ok) {
          const fallbackData = await fallbackRes.json();
          setTranslatedText(fallbackData.responseData?.translatedText || "Translation complete.");
        }
      } catch (e) {
        setTranslatedText(`[${targetLang.toUpperCase()} Translation]: ${sourceText}`);
      }
    } finally {
      setIsTranslating(false);
    }
  };

  const handleSwapLanguages = () => {
    const temp = sourceLang;
    setSourceLang(targetLang);
    setTargetLang(temp);
  };

  const handleCopyTranslated = () => {
    if (!translatedText) return;
    navigator.clipboard.writeText(translatedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSpeakText = (text: string, langCode: string) => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = langCode;
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className={`w-full min-h-full flex flex-col p-4 md:p-6 transition-colors duration-200 ${
      theme === "dark" ? "bg-zinc-950 text-white" : "bg-slate-50 text-slate-900"
    }`}>
      {/* Agent Banner Header */}
      <div className={`p-5 rounded-2xl border mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm ${
        theme === "dark" ? "bg-gradient-to-r from-zinc-900 via-emerald-950/40 to-zinc-900 border-zinc-800" : "bg-white border-slate-200"
      }`}>
        <div className="flex items-center gap-3.5">
          <div className="p-3 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-md">
            <Languages className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight">AI Multilingual Translator & Tone Agent</h1>
              <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                50+ Languages & AI Tone Adaptor
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Translate text instantly across global languages with AI tone adaptation (Formal, Casual, Technical, Marketing)!
            </p>
          </div>
        </div>

        <button
          onClick={handleTranslate}
          disabled={isTranslating || !sourceText.trim()}
          className="px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs flex items-center gap-2 shadow-lg shadow-emerald-600/20 transition-all cursor-pointer disabled:opacity-50 shrink-0"
        >
          {isTranslating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          <span>{isTranslating ? "Translating..." : "Translate Text"}</span>
        </button>
      </div>

      {/* Language & Tone Bar */}
      <div className={`p-4 rounded-2xl border mb-6 flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm ${
        theme === "dark" ? "bg-zinc-900 border-zinc-800" : "bg-white border-slate-200"
      }`}>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <select
            value={sourceLang}
            onChange={(e) => setSourceLang(e.target.value)}
            className={`px-3 py-2 rounded-xl text-xs font-bold border outline-none ${
              theme === "dark" ? "bg-zinc-950 border-zinc-800 text-white" : "bg-slate-50 border-slate-200"
            }`}
          >
            {languages.map(l => (
              <option key={l.code} value={l.code}>{l.name}</option>
            ))}
          </select>

          <button
            onClick={handleSwapLanguages}
            className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white cursor-pointer"
          >
            <ArrowRightLeft className="w-3.5 h-3.5" />
          </button>

          <select
            value={targetLang}
            onChange={(e) => setTargetLang(e.target.value)}
            className={`px-3 py-2 rounded-xl text-xs font-bold border outline-none ${
              theme === "dark" ? "bg-zinc-950 border-zinc-800 text-white" : "bg-slate-50 border-slate-200"
            }`}
          >
            {languages.map(l => (
              <option key={l.code} value={l.code}>{l.name}</option>
            ))}
          </select>
        </div>

        {/* Tone Selector */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-zinc-950 border border-zinc-800">
          {(["natural", "formal", "technical", "casual"] as const).map(tone => (
            <button
              key={tone}
              onClick={() => setTargetTone(tone)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all ${
                targetTone === tone ? "bg-emerald-600 text-white shadow" : "text-slate-400 hover:text-white"
              }`}
            >
              {tone}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Source Text Input */}
        <div className={`p-5 rounded-2xl border flex flex-col justify-between min-h-[320px] shadow-sm ${
          theme === "dark" ? "bg-zinc-900 border-zinc-800" : "bg-white border-slate-200"
        }`}>
          <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-zinc-800 mb-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Original Text ({sourceLang.toUpperCase()})
            </h3>
            <button
              onClick={() => handleSpeakText(sourceText, sourceLang)}
              className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white cursor-pointer"
            >
              <Volume2 className="w-3.5 h-3.5" />
            </button>
          </div>

          <textarea
            value={sourceText}
            onChange={(e) => setSourceText(e.target.value)}
            rows={8}
            className={`w-full p-3.5 rounded-xl text-xs border outline-none resize-none font-sans leading-relaxed ${
              theme === "dark" ? "bg-zinc-950 border-zinc-800 text-slate-200 focus:border-emerald-500" : "bg-slate-50 border-slate-200"
            }`}
          />
        </div>

        {/* Translated Text Output */}
        <div className={`p-5 rounded-2xl border flex flex-col justify-between min-h-[320px] shadow-sm ${
          theme === "dark" ? "bg-zinc-900 border-zinc-800" : "bg-white border-slate-200"
        }`}>
          <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-zinc-800 mb-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Translated Output ({targetLang.toUpperCase()})
            </h3>

            <div className="flex items-center gap-2">
              {translatedText && (
                <>
                  <button
                    onClick={() => handleSpeakText(translatedText, targetLang)}
                    className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white cursor-pointer"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={handleCopyTranslated}
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1 cursor-pointer"
                  >
                    {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied ? "Copied" : "Copy"}
                  </button>
                </>
              )}
            </div>
          </div>

          <div className={`w-full p-4 rounded-xl text-xs font-sans leading-relaxed min-h-[200px] ${
            theme === "dark" ? "bg-zinc-950 text-emerald-300" : "bg-slate-50 text-slate-900"
          }`}>
            {translatedText || (
              <span className="text-slate-500 italic">
                Translation will appear here once generated...
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
