import React, { useState, useEffect } from "react";
import {
  Book,
  Search,
  Volume2,
  VolumeX,
  Sparkles,
  Bookmark,
  BookMarked,
  Share2,
  Copy,
  Check,
  FileCode,
  Lightbulb,
  Layers,
  ArrowRight,
  Flame,
  Award,
  RefreshCw,
  X
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export interface DefinitionItem {
  definition: string;
  example?: string;
  synonyms?: string[];
  antonyms?: string[];
}

export interface Meaning {
  partOfSpeech: string;
  definitions: DefinitionItem[];
}

export interface DictionaryEntry {
  word: string;
  phonetic?: string;
  audioUrl?: string;
  meanings: Meaning[];
  etymology?: string;
  aiUsageTip?: string;
  synonyms?: string[];
  antonyms?: string[];
}

interface DictionaryProps {
  apiKey: string;
  selectedModel?: string;
  theme: "light" | "dark";
  onAddLog?: (type: string, message: string) => void;
  onInsertCode?: (path: string, content: string) => void;
}

const FEATURED_WORDS = [
  "Serendipity", "Petrichor", "Ephemeral", "Sonder", "Solitude",
  "Nefarious", "Limerence", "Mellifluous", "Resilience", "Quintessential"
];

export const Dictionary: React.FC<DictionaryProps> = ({
  apiKey,
  selectedModel,
  theme,
  onAddLog,
  onInsertCode
}) => {
  const [searchTerm, setSearchTerm] = useState("Serendipity");
  const [activeEntry, setActiveEntry] = useState<DictionaryEntry | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [savedWords, setSavedWords] = useState<string[]>([]);
  const [exported, setExported] = useState(false);

  // Initial load
  useEffect(() => {
    handleLookupWord("Serendipity");
  }, []);

  const handleLookupWord = async (wordToLookup: string) => {
    const cleanWord = wordToLookup.trim();
    if (!cleanWord) return;

    setIsLoading(true);
    setErrorMsg("");
    setSearchTerm(cleanWord);
    if (onAddLog) onAddLog("dictionary", `Searching dictionary for "${cleanWord}"...`);

    let foundApiEntry: DictionaryEntry | null = null;

    // 1. Fetch free public dictionary API via resilient proxy
    try {
      const res = await fetch(`/api/dictionary/${encodeURIComponent(cleanWord.toLowerCase())}`, {
        signal: AbortSignal.timeout(4000)
      }).catch(() => null);
      if (res && res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          const first = data[0];
          const audio = first.phonetics?.find((p: any) => p.audio && p.audio.length > 0)?.audio || "";

          foundApiEntry = {
            word: first.word,
            phonetic: first.phonetic || first.phonetics?.[0]?.text || "",
            audioUrl: audio,
            meanings: first.meanings || [],
            synonyms: first.synonyms || []
          };
        }
      }
    } catch {
      // Fall through to AI enrichment or structured card
    }

    // 2. Fetch AI Insights (Etymology, Usage tips, Synonyms/Antonyms)
    try {
      const aiRes = await fetch("/api/openrouter/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": apiKey ? `Bearer ${apiKey}` : ""
        },
        body: JSON.stringify({
          model: selectedModel || "google/gemini-2.5-flash",
          messages: [
            {
              role: "system",
              content: `You are a world-class lexicographer. Provide accurate definition, etymology, synonyms, antonyms, and modern usage tips for the given word.
Return strictly a JSON object matching this schema (no markdown formatting outside JSON):
{
  "word": "word",
  "phonetic": "/fəˈnɛtɪk/",
  "etymology": "Origin and history of the word",
  "aiUsageTip": "Pro-tip on when to use this word in writing or speaking",
  "synonyms": ["synonym1", "synonym2", "synonym3"],
  "antonyms": ["antonym1", "antonym2"],
  "meanings": [
    {
      "partOfSpeech": "noun",
      "definitions": [
        {
          "definition": "Clear concise definition",
          "example": "A natural example sentence demonstrating context."
        }
      ]
    }
  ]
}`
            },
            {
              role: "user",
              content: `Word: ${cleanWord}`
            }
          ]
        })
      });

      if (aiRes.ok) {
        const aiData = await aiRes.json();
        const rawContent = aiData.choices?.[0]?.message?.content || "";
        const cleanJson = rawContent.replace(/```json/g, "").replace(/```/g, "").trim();
        const jsonMatch = cleanJson.match(/\{[\s\S]*\}/);
        const parsed = JSON.parse(jsonMatch ? jsonMatch[0] : cleanJson);

        if (parsed && parsed.word) {
          if (foundApiEntry) {
            // Merge AI Insights into API Entry
            foundApiEntry.etymology = parsed.etymology;
            foundApiEntry.aiUsageTip = parsed.aiUsageTip;
            foundApiEntry.synonyms = parsed.synonyms || [];
            foundApiEntry.antonyms = parsed.antonyms || [];
            setActiveEntry(foundApiEntry);
          } else {
            setActiveEntry(parsed);
          }
          if (onAddLog) onAddLog("dictionary", `Dictionary entry for "${cleanWord}" loaded!`);
          setIsLoading(false);
          return;
        }
      }
    } catch (aiErr) {
      console.warn("AI dictionary enhancement failed:", aiErr);
    }

    if (foundApiEntry) {
      setActiveEntry(foundApiEntry);
    } else {
      setErrorMsg(`No definition found for "${cleanWord}". Try checking the spelling.`);
    }
    setIsLoading(false);
  };

  const handleAudioPlayback = () => {
    if (isSpeaking) {
      window.speechSynthesis?.cancel();
      setIsSpeaking(false);
      return;
    }

    if (activeEntry?.audioUrl) {
      const audio = new Audio(activeEntry.audioUrl);
      audio.play().catch(() => speakBrowserTts());
      return;
    }

    speakBrowserTts();
  };

  const speakBrowserTts = () => {
    if (!activeEntry || !window.speechSynthesis) return;
    const utterance = new SpeechSynthesisUtterance(activeEntry.word);
    utterance.rate = 0.9;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  const handleToggleBookmark = (word: string) => {
    setSavedBookmarks(prev =>
      prev.includes(word) ? prev.filter(w => w !== word) : [...prev, word]
    );
  };

  const [savedBookmarks, setSavedBookmarks] = useState<string[]>([]);

  const handleExportVocabulary = () => {
    if (!activeEntry || !onInsertCode) return;

    const content = `# Vocabulary Card: ${activeEntry.word}
Phonetic: ${activeEntry.phonetic || ''}

## Definitions
${activeEntry.meanings.map(m => `### ${m.partOfSpeech.toUpperCase()}\n${m.definitions.map(d => `- ${d.definition}${d.example ? `\n  *Example:* "${d.example}"` : ''}`).join('\n')}`).join('\n\n')}

${activeEntry.etymology ? `## Etymology\n${activeEntry.etymology}\n` : ''}
${activeEntry.aiUsageTip ? `## Pro-Tip\n${activeEntry.aiUsageTip}\n` : ''}
`;

    onInsertCode(`word_${activeEntry.word.toLowerCase()}.md`, content);
    setExported(true);
    setTimeout(() => setExported(false), 2000);
  };

  return (
    <div className={`h-full w-full flex flex-col overflow-hidden ${
      theme === "dark" ? "bg-[#0a0e17] text-slate-100" : "bg-slate-50 text-slate-900"
    }`}>
      {/* Top Search Banner */}
      <div className={`px-6 py-4 border-b flex flex-wrap items-center justify-between gap-4 shrink-0 ${
        theme === "dark" ? "bg-[#101622] border-zinc-800" : "bg-white border-slate-200"
      }`}>
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-cyan-600 text-white shadow-lg shadow-emerald-500/20">
            <Book className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold tracking-tight flex items-center gap-2">
              AI Smart Dictionary & Thesaurus
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                Word Knowledge Engine
              </span>
            </h1>
            <p className="text-xs text-slate-400 font-medium">
              Definitions, etymology origins, synonyms, AI writing context, and audio pronunciations
            </p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative min-w-[280px] sm:min-w-[360px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleLookupWord(searchTerm)}
            placeholder="Search any English word..."
            className={`w-full p-2.5 pl-9 pr-20 rounded-xl border text-xs font-semibold focus:outline-none transition-all ${
              theme === "dark"
                ? "bg-[#141b2b] border-zinc-800 text-slate-100 focus:border-emerald-500"
                : "bg-slate-100 border-slate-300 text-slate-900 focus:border-emerald-500"
            }`}
          />
          <button
            onClick={() => handleLookupWord(searchTerm)}
            disabled={isLoading}
            className="absolute right-1.5 top-1.5 bottom-1.5 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-1 disabled:opacity-50"
          >
            {isLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <span>Lookup</span>}
          </button>
        </div>
      </div>

      {/* Featured Words Row */}
      <div className="px-6 py-2 bg-[#0c101a] border-b border-zinc-800 flex items-center gap-2 overflow-x-auto no-scrollbar text-xs">
        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 shrink-0 flex items-center gap-1">
          <Flame className="w-3 h-3 text-amber-400" /> Discover:
        </span>
        {FEATURED_WORDS.map((w) => (
          <button
            key={w}
            onClick={() => handleLookupWord(w)}
            className="px-2.5 py-1 rounded-lg bg-zinc-800/80 hover:bg-emerald-600/20 text-slate-300 hover:text-emerald-300 border border-zinc-700/60 shrink-0 transition-all cursor-pointer text-[11px]"
          >
            {w}
          </button>
        ))}
      </div>

      {/* Main View Area */}
      <div className="flex-1 overflow-y-auto p-6 max-w-4xl mx-auto w-full space-y-6">
        {isLoading ? (
          <div className="py-20 text-center space-y-3">
            <RefreshCw className="w-8 h-8 text-emerald-400 animate-spin mx-auto" />
            <p className="text-xs text-slate-400 font-medium">Consulting Lexicon & AI Knowledge Base...</p>
          </div>
        ) : errorMsg ? (
          <div className="p-8 text-center space-y-3 bg-[#111723] rounded-3xl border border-zinc-800">
            <p className="text-sm font-bold text-rose-400">{errorMsg}</p>
            <p className="text-xs text-slate-400">Try searching another term like "petrichor", "resilience", or "serendipity".</p>
          </div>
        ) : activeEntry ? (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            {/* Word Main Banner */}
            <div className="p-6 rounded-3xl bg-gradient-to-r from-zinc-900 via-[#131a29] to-zinc-900 border border-zinc-800 flex flex-wrap items-center justify-between gap-4 shadow-xl">
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-extrabold text-white tracking-tight">{activeEntry.word}</h1>
                  {activeEntry.phonetic && (
                    <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
                      {activeEntry.phonetic}
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400">
                  {activeEntry.meanings.length} part(s) of speech defined
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleAudioPlayback}
                  className="p-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-all cursor-pointer flex items-center gap-2 shadow-lg shadow-emerald-600/20"
                  title="Listen to audio pronunciation"
                >
                  <Volume2 className="w-4 h-4" />
                  <span>Pronounce</span>
                </button>

                <button
                  onClick={() => handleToggleBookmark(activeEntry.word)}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer ${
                    savedBookmarks.includes(activeEntry.word)
                      ? "bg-amber-500/20 text-amber-400 border-amber-500/40"
                      : "bg-zinc-800 text-slate-300 border-zinc-700 hover:text-white"
                  }`}
                >
                  <Bookmark className="w-4 h-4" fill={savedBookmarks.includes(activeEntry.word) ? "currentColor" : "none"} />
                </button>

                {onInsertCode && (
                  <button
                    onClick={handleExportVocabulary}
                    className="p-3 rounded-2xl bg-zinc-800 hover:bg-zinc-700 text-cyan-300 border border-zinc-700 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                    title="Export word card to workspace"
                  >
                    {exported ? <Check className="w-4 h-4 text-emerald-400" /> : <FileCode className="w-4 h-4" />}
                    <span>{exported ? "Saved" : "Export Card"}</span>
                  </button>
                )}
              </div>
            </div>

            {/* AI Insights & Usage Tip */}
            {activeEntry.aiUsageTip && (
              <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-800/40 space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" /> AI Lexicographer Pro-Tip
                </span>
                <p className="text-xs text-emerald-200 leading-relaxed font-medium">
                  {activeEntry.aiUsageTip}
                </p>
              </div>
            )}

            {/* Meanings */}
            <div className="space-y-4">
              {activeEntry.meanings.map((meaning, idx) => (
                <div key={idx} className="p-5 rounded-2xl bg-[#111723] border border-zinc-800 space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 rounded-full text-xs font-extrabold uppercase italic bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      {meaning.partOfSpeech}
                    </span>
                  </div>

                  <ul className="space-y-3">
                    {meaning.definitions.map((def, dIdx) => (
                      <li key={dIdx} className="space-y-1 text-xs leading-relaxed">
                        <div className="flex items-start gap-2 text-slate-200">
                          <span className="text-emerald-400 font-bold">•</span>
                          <span>{def.definition}</span>
                        </div>
                        {def.example && (
                          <p className="pl-4 text-[11px] text-slate-400 italic border-l-2 border-emerald-500/40">
                            "{def.example}"
                          </p>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            {/* Etymology & Origins */}
            {activeEntry.etymology && (
              <div className="p-5 rounded-2xl bg-[#111723] border border-zinc-800 space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                  <Book className="w-3.5 h-3.5" /> Etymology & Historical Origin
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed font-serif">
                  {activeEntry.etymology}
                </p>
              </div>
            )}

            {/* Synonyms & Antonyms */}
            {((activeEntry.synonyms && activeEntry.synonyms.length > 0) || (activeEntry.antonyms && activeEntry.antonyms.length > 0)) && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {activeEntry.synonyms && activeEntry.synonyms.length > 0 && (
                  <div className="p-4 rounded-2xl bg-[#111723] border border-zinc-800 space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400">Synonyms (Similar Words)</span>
                    <div className="flex flex-wrap gap-1.5">
                      {activeEntry.synonyms.map((s, i) => (
                        <button
                          key={i}
                          onClick={() => handleLookupWord(s)}
                          className="px-2.5 py-1 rounded-lg bg-cyan-950/40 hover:bg-cyan-800/40 text-cyan-200 border border-cyan-800/40 text-xs font-medium cursor-pointer transition-all"
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {activeEntry.antonyms && activeEntry.antonyms.length > 0 && (
                  <div className="p-4 rounded-2xl bg-[#111723] border border-zinc-800 space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-rose-400">Antonyms (Opposites)</span>
                    <div className="flex flex-wrap gap-1.5">
                      {activeEntry.antonyms.map((a, i) => (
                        <button
                          key={i}
                          onClick={() => handleLookupWord(a)}
                          className="px-2.5 py-1 rounded-lg bg-rose-950/40 hover:bg-rose-800/40 text-rose-200 border border-rose-800/40 text-xs font-medium cursor-pointer transition-all"
                        >
                          {a}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        ) : null}
      </div>
    </div>
  );
};
