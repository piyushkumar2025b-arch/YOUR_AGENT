import React, { useState, useEffect } from "react";
import {
  Laugh,
  Sparkles,
  RefreshCw,
  Copy,
  Check,
  Volume2,
  VolumeX,
  Star,
  Flame,
  Globe,
  Code2,
  Cpu,
  Terminal,
  Send,
  BookOpen,
  Bookmark,
  Share2,
  Play,
  CheckCircle2,
  ChevronRight,
  ExternalLink,
  Bot,
  Zap,
  Info,
  Layers,
  Smile,
  ShieldCheck,
  Search,
  MessageSquareQuote
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import {
  JokeItem,
  AdviceItem,
  QuoteItem,
  FactItem,
  PublicApiEndpoint,
  PUBLIC_API_DIRECTORY,
  fetchLiveJoke,
  fetchLiveAdvice,
  fetchLiveQuote,
  fetchLiveFact,
  testPublicEndpointLive
} from "../services/freeApisService";

interface LiveJokesAgentProps {
  apiKey?: string;
  selectedModel?: string;
  theme: "light" | "dark";
  onAddLog?: (type: string, msg: string) => void;
}

export const LiveJokesAgent: React.FC<LiveJokesAgentProps> = ({
  apiKey,
  selectedModel = "google/gemini-2.5-flash",
  theme,
  onAddLog
}) => {
  // Navigation Tabs inside Agent
  const [activeSubTab, setActiveSubTab] = useState<"jokes" | "free-apis" | "ai-roaster" | "favorites">("jokes");

  // Jokes State
  const [currentJoke, setCurrentJoke] = useState<JokeItem | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("any");
  const [isLoadingJoke, setIsLoadingJoke] = useState<boolean>(false);
  const [revealPunchline, setRevealPunchline] = useState<boolean>(false);
  const [copiedJoke, setCopiedJoke] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [userRating, setUserRating] = useState<number | null>(null);

  // Favorites
  const [favoriteJokes, setFavoriteJokes] = useState<JokeItem[]>(() => {
    try {
      const saved = localStorage.getItem("saved_favorite_jokes");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Advice & Quote & Fact Widgets
  const [dailyAdvice, setDailyAdvice] = useState<AdviceItem | null>(null);
  const [dailyQuote, setDailyQuote] = useState<QuoteItem | null>(null);
  const [dailyFact, setDailyFact] = useState<FactItem | null>(null);

  // Free APIs Explorer State
  const [apiDirectory, setApiDirectory] = useState<PublicApiEndpoint[]>(PUBLIC_API_DIRECTORY);
  const [apiSearchQuery, setApiSearchQuery] = useState<string>("");
  const [selectedApiCategory, setSelectedApiCategory] = useState<string>("All");
  const [activeApi, setActiveApi] = useState<PublicApiEndpoint>(PUBLIC_API_DIRECTORY[0]);
  const [testResult, setTestResult] = useState<any | null>(null);
  const [isTestingApi, setIsTestingApi] = useState<boolean>(false);
  const [activeCodeTab, setActiveCodeTab] = useState<"curl" | "javascript" | "python">("javascript");
  const [copiedCode, setCopiedCode] = useState<boolean>(false);

  // AI Code Roaster & Custom Joke State
  const [aiPrompt, setAiPrompt] = useState<string>("");
  const [aiJokeOutput, setAiJokeOutput] = useState<string>("");
  const [isAiGenerating, setIsAiGenerating] = useState<boolean>(false);
  const [aiMode, setAiMode] = useState<"roast" | "custom" | "explain">("roast");

  // Load initial joke, advice, quote & fact
  useEffect(() => {
    handleFetchJoke("any");
    loadWidgets();
  }, []);

  const loadWidgets = async () => {
    const adv = await fetchLiveAdvice();
    const qte = await fetchLiveQuote();
    const fct = await fetchLiveFact("cat");
    setDailyAdvice(adv);
    setDailyQuote(qte);
    setDailyFact(fct);
  };

  const handleFetchJoke = async (cat: string) => {
    setIsLoadingJoke(true);
    setRevealPunchline(false);
    setUserRating(null);
    setSelectedCategory(cat);

    try {
      const joke = await fetchLiveJoke(cat);
      setCurrentJoke(joke);
      if (onAddLog) {
        onAddLog("info", `Fetched live joke [Category: ${joke.category}] from ${joke.source}`);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoadingJoke(false);
    }
  };

  const toggleFavorite = (joke: JokeItem) => {
    const exists = favoriteJokes.some(f => f.id === joke.id);
    let updated: JokeItem[];
    if (exists) {
      updated = favoriteJokes.filter(f => f.id !== joke.id);
    } else {
      updated = [...favoriteJokes, joke];
    }
    setFavoriteJokes(updated);
    localStorage.setItem("saved_favorite_jokes", JSON.stringify(updated));
  };

  const handleCopyText = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedJoke(true);
    setTimeout(() => setCopiedJoke(false), 2000);
  };

  const handleSpeech = (text: string) => {
    if (!("speechSynthesis" in window)) {
      try {
        (window as any)?.alert?.("Speech synthesis is not supported in this browser.");
      } catch {}
      return;
    }
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  const handleTestApi = async (apiEndpoint: PublicApiEndpoint) => {
    setActiveApi(apiEndpoint);
    setIsTestingApi(true);
    setTestResult(null);

    const res = await testPublicEndpointLive(apiEndpoint);
    setTestResult(res);
    setIsTestingApi(false);
  };

  // AI Joke & Roaster Service Call
  const handleGenerateAiHumor = async () => {
    if (!aiPrompt.trim()) {
      try {
        if (typeof window !== "undefined" && typeof window.alert === "function") {
          window.alert("Please enter a code snippet, tech topic, or joke prompt!");
        }
      } catch {}
      return;
    }

    setIsAiGenerating(true);
    setAiJokeOutput("");

    try {
      let sysInstruction = "";
      if (aiMode === "roast") {
        sysInstruction = "You are an elite, hilarious tech comedian and senior software engineer. Roast the user's prompt or code snippet with razor-sharp humor, clever puns, and witty developer jokes. Be lighthearted, energetic, and extremely funny!";
      } else if (aiMode === "explain") {
        sysInstruction = "You are an AI Joke Explainer. Explain the underlying computer science, programming, or dad joke reference in an entertaining, witty way.";
      } else {
        sysInstruction = "You are a master comedian AI agent. Craft an original, hilarious joke, setup, and punchline specifically tailored to the topic requested.";
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
            { role: "system", content: sysInstruction },
            { role: "user", content: aiPrompt }
          ],
          temperature: 0.8
        })
      });

      if (res.ok) {
        const data = await res.json();
        const responseContent = data.choices?.[0]?.message?.content || "No humor generated.";
        setAiJokeOutput(responseContent);
        if (onAddLog) {
          onAddLog("info", `AI Humor Agent generated response for mode [${aiMode}]`);
        }
      } else {
        setAiJokeOutput("🔥 AI Humor Output:\nWhy did the developer throw their keyboard out the window?\nBecause they wanted to see if Ctrl+S could save them in mid-air!");
      }
    } catch (err: any) {
      setAiJokeOutput("😄 Joke of the moment:\nThere are 2 hard problems in computer science: cache invalidation, naming things, and off-by-1 errors!");
    } finally {
      setIsAiGenerating(false);
    }
  };

  // Filtered APIs for directory
  const filteredApis = apiDirectory.filter(api => {
    const matchesCat = selectedApiCategory === "All" || api.category === selectedApiCategory;
    const matchesSearch = api.name.toLowerCase().includes(apiSearchQuery.toLowerCase()) ||
                          api.description.toLowerCase().includes(apiSearchQuery.toLowerCase()) ||
                          api.category.toLowerCase().includes(apiSearchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const categoriesList = ["any", "programming", "dad", "chucknorris", "general", "knock-knock"];

  return (
    <div className={`w-full min-h-full flex flex-col p-4 md:p-6 transition-colors duration-200 ${
      theme === "dark" ? "bg-zinc-950 text-white" : "bg-slate-50 text-slate-900"
    }`}>
      {/* Top Banner Header */}
      <div className={`p-5 rounded-2xl border mb-6 relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm ${
        theme === "dark"
          ? "bg-gradient-to-r from-amber-950/40 via-zinc-900 to-amber-900/20 border-amber-500/20"
          : "bg-gradient-to-r from-amber-500/10 via-amber-100/50 to-orange-500/10 border-amber-200"
      }`}>
        <div className="flex items-center gap-3.5 z-10">
          <div className="p-3 rounded-2xl bg-amber-500 text-slate-950 shadow-md flex items-center justify-center font-bold">
            <Laugh className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight">Live Jokes & Free APIs Agent</h1>
              <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                v2.5 Live
              </span>
            </div>
            <p className={`text-xs mt-0.5 ${theme === "dark" ? "text-zinc-400" : "text-slate-600"}`}>
              Real-time humor generator, icanhazdadjoke API, JokeAPI v2, Chuck Norris facts, and 12+ public APIs live tester!
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-black/10 dark:bg-zinc-900/80 border border-slate-200 dark:border-zinc-800 z-10 overflow-x-auto">
          <button
            onClick={() => setActiveSubTab("jokes")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-all ${
              activeSubTab === "jokes"
                ? "bg-amber-500 text-slate-950 shadow-sm"
                : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <Laugh className="w-3.5 h-3.5" />
            Live Jokes
          </button>
          <button
            onClick={() => setActiveSubTab("free-apis")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-all ${
              activeSubTab === "free-apis"
                ? "bg-amber-500 text-slate-950 shadow-sm"
                : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            Free APIs Hub
          </button>
          <button
            onClick={() => setActiveSubTab("ai-roaster")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-all ${
              activeSubTab === "ai-roaster"
                ? "bg-amber-500 text-slate-950 shadow-sm"
                : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            AI Code Roaster
          </button>
          <button
            onClick={() => setActiveSubTab("favorites")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-all relative ${
              activeSubTab === "favorites"
                ? "bg-amber-500 text-slate-950 shadow-sm"
                : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <Bookmark className="w-3.5 h-3.5" />
            Favorites
            {favoriteJokes.length > 0 && (
              <span className="ml-1 px-1.5 py-0.2 text-[10px] rounded-full bg-slate-900 text-white font-bold">
                {favoriteJokes.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      {activeSubTab === "jokes" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Joke Card Section (8 cols) */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            {/* Category Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              <span className="text-xs font-semibold text-slate-500 dark:text-zinc-400 whitespace-nowrap flex items-center gap-1 mr-1">
                <Smile className="w-3.5 h-3.5 text-amber-500" /> Filter:
              </span>
              {categoriesList.map(cat => (
                <button
                  key={cat}
                  onClick={() => handleFetchJoke(cat)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-xl capitalize transition-all whitespace-nowrap border ${
                    selectedCategory === cat
                      ? "bg-amber-500 text-slate-950 border-amber-500 font-bold shadow-sm"
                      : theme === "dark"
                      ? "bg-zinc-900 border-zinc-800 text-zinc-300 hover:bg-zinc-800"
                      : "bg-white border-slate-200 text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  {cat === "any" ? "✨ All Humor" : cat === "chucknorris" ? "🥋 Chuck Norris" : cat === "dad" ? "🧔 Dad Joke" : cat === "programming" ? "💻 Code Jokes" : cat}
                </button>
              ))}
            </div>

            {/* Joke Display Card */}
            <div className={`p-6 md:p-8 rounded-2xl border shadow-lg flex flex-col justify-between min-h-[300px] relative overflow-hidden transition-all ${
              theme === "dark"
                ? "bg-gradient-to-b from-zinc-900 to-zinc-950 border-zinc-800"
                : "bg-white border-slate-200"
            }`}>
              {/* Category Tag Header */}
              <div className="flex items-center justify-between gap-2 border-b pb-4 border-slate-100 dark:border-zinc-800/80">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                    {currentJoke?.category || "Humor"}
                  </span>
                  <span className="text-xs text-slate-400 dark:text-zinc-500 flex items-center gap-1">
                    <Globe className="w-3 h-3" /> {currentJoke?.source || "Live API"}
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => currentJoke && toggleFavorite(currentJoke)}
                    title="Save to Favorites"
                    className={`p-2 rounded-xl border text-xs transition-all ${
                      currentJoke && favoriteJokes.some(f => f.id === currentJoke.id)
                        ? "bg-amber-500 text-slate-950 border-amber-500 font-bold"
                        : theme === "dark"
                        ? "bg-zinc-800 border-zinc-700 text-zinc-300 hover:bg-zinc-700"
                        : "bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    <Bookmark className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => {
                      const fullText = currentJoke?.joke || `${currentJoke?.setup}\n${currentJoke?.delivery}`;
                      fullText && handleSpeech(fullText);
                    }}
                    title={isSpeaking ? "Stop Voice" : "Read Joke Aloud"}
                    className={`p-2 rounded-xl border text-xs transition-all ${
                      isSpeaking
                        ? "bg-rose-500 text-white border-rose-500 animate-pulse"
                        : theme === "dark"
                        ? "bg-zinc-800 border-zinc-700 text-zinc-300 hover:bg-zinc-700"
                        : "bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                  </button>

                  <button
                    onClick={() => {
                      const text = currentJoke?.joke || `${currentJoke?.setup}\n${currentJoke?.delivery}`;
                      text && handleCopyText(text);
                    }}
                    title="Copy Joke"
                    className={`p-2 rounded-xl border text-xs transition-all ${
                      copiedJoke
                        ? "bg-emerald-500 text-white border-emerald-500"
                        : theme === "dark"
                        ? "bg-zinc-800 border-zinc-700 text-zinc-300 hover:bg-zinc-700"
                        : "bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    {copiedJoke ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Main Joke Content */}
              <div className="my-6">
                {isLoadingJoke ? (
                  <div className="flex flex-col items-center justify-center py-12 gap-3 text-amber-500">
                    <RefreshCw className="w-8 h-8 animate-spin" />
                    <p className="text-xs font-semibold animate-pulse">Fetching fresh live joke from API...</p>
                  </div>
                ) : currentJoke ? (
                  <div className="space-y-4">
                    {currentJoke.joke ? (
                      <p className="text-lg md:text-xl font-semibold leading-relaxed tracking-tight">
                        "{currentJoke.joke}"
                      </p>
                    ) : (
                      <>
                        <p className="text-lg md:text-xl font-bold leading-relaxed tracking-tight text-slate-900 dark:text-white">
                          "{currentJoke.setup}"
                        </p>

                        <div className="mt-4 pt-4 border-t border-dashed border-slate-200 dark:border-zinc-800">
                          {revealPunchline ? (
                            <motion.p
                              initial={{ opacity: 0, y: 8 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="text-lg font-bold text-amber-600 dark:text-amber-400 flex items-center gap-2"
                            >
                              👉 {currentJoke.delivery}
                            </motion.p>
                          ) : (
                            <button
                              onClick={() => setRevealPunchline(true)}
                              className="px-4 py-2 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs hover:bg-amber-400 transition-all flex items-center gap-2 shadow-sm"
                            >
                              <Sparkles className="w-3.5 h-3.5" /> Reveal Punchline
                            </button>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                ) : null}
              </div>

              {/* Rating & Action Footer */}
              <div className="border-t pt-4 border-slate-100 dark:border-zinc-800/80 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500 dark:text-zinc-400">Rate this joke:</span>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map(star => (
                      <button
                        key={star}
                        onClick={() => setUserRating(star)}
                        className={`p-1 rounded-lg transition-all ${
                          userRating && userRating >= star
                            ? "text-amber-500 fill-amber-500"
                            : "text-slate-300 dark:text-zinc-700 hover:text-amber-400"
                        }`}
                      >
                        <Star className="w-4 h-4" />
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => handleFetchJoke(selectedCategory)}
                  disabled={isLoadingJoke}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold text-xs transition-all shadow-md flex items-center gap-2 disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoadingJoke ? "animate-spin" : ""}`} />
                  Next Live Joke
                </button>
              </div>
            </div>
          </div>

          {/* Side Widgets (4 cols) */}
          <div className="lg:col-span-4 flex flex-col gap-4">
            {/* Advice Widget */}
            <div className={`p-4 rounded-2xl border shadow-sm ${
              theme === "dark" ? "bg-zinc-900 border-zinc-800" : "bg-white border-slate-200"
            }`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-amber-500 flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5" /> Daily Advice Slip API
                </span>
                <button
                  onClick={async () => setDailyAdvice(await fetchLiveAdvice())}
                  className="text-[10px] text-slate-400 hover:text-amber-500"
                >
                  Refresh
                </button>
              </div>
              <p className="text-xs italic text-slate-700 dark:text-zinc-300 leading-relaxed">
                "{dailyAdvice?.advice || "Write code for clarity first, optimize later."}"
              </p>
            </div>

            {/* Daily Quote Widget */}
            <div className={`p-4 rounded-2xl border shadow-sm ${
              theme === "dark" ? "bg-zinc-900 border-zinc-800" : "bg-white border-slate-200"
            }`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-cyan-500 flex items-center gap-1.5">
                  <MessageSquareQuote className="w-3.5 h-3.5" /> DummyJSON Quotes API
                </span>
                <button
                  onClick={async () => setDailyQuote(await fetchLiveQuote())}
                  className="text-[10px] text-slate-400 hover:text-cyan-500"
                >
                  Refresh
                </button>
              </div>
              <p className="text-xs font-medium text-slate-700 dark:text-zinc-200 leading-relaxed">
                "{dailyQuote?.quote}"
              </p>
              <p className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 mt-1 text-right">
                — {dailyQuote?.author}
              </p>
            </div>

            {/* Cat / Dog Facts Widget */}
            <div className={`p-4 rounded-2xl border shadow-sm ${
              theme === "dark" ? "bg-zinc-900 border-zinc-800" : "bg-white border-slate-200"
            }`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-emerald-500 flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5" /> Cat Facts Ninja API
                </span>
                <button
                  onClick={async () => setDailyFact(await fetchLiveFact("cat"))}
                  className="text-[10px] text-slate-400 hover:text-emerald-500"
                >
                  Refresh
                </button>
              </div>
              <p className="text-xs text-slate-700 dark:text-zinc-300 leading-relaxed">
                {dailyFact?.fact}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Free APIs Directory & Live Tester */}
      {activeSubTab === "free-apis" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* API Catalog List (5 cols) */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search 12+ Free Public APIs..."
                  value={apiSearchQuery}
                  onChange={(e) => setApiSearchQuery(e.target.value)}
                  className={`w-full pl-9 pr-4 py-2 text-xs rounded-xl border outline-none ${
                    theme === "dark"
                      ? "bg-zinc-900 border-zinc-800 text-white focus:border-amber-500"
                      : "bg-white border-slate-200 text-slate-900 focus:border-amber-500"
                  }`}
                />
              </div>

              {/* Category selector */}
              <div className="flex items-center gap-1 overflow-x-auto pb-1">
                {["All", "Humor", "Quotes & Wisdom", "Animals", "Crypto & Finance", "Dev Tools", "Weather & Nature"].map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedApiCategory(cat)}
                    className={`px-2.5 py-1 text-[11px] font-medium rounded-lg whitespace-nowrap transition-all ${
                      selectedApiCategory === cat
                        ? "bg-amber-500 text-slate-950 font-bold"
                        : theme === "dark"
                        ? "bg-zinc-900 text-zinc-400 hover:bg-zinc-800"
                        : "bg-slate-200 text-slate-700 hover:bg-slate-300"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-2 max-h-[520px] overflow-y-auto pr-1">
              {filteredApis.map(api => (
                <div
                  key={api.id}
                  onClick={() => handleTestApi(api)}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                    activeApi.id === api.id
                      ? "border-amber-500 bg-amber-500/10 shadow-sm"
                      : theme === "dark"
                      ? "bg-zinc-900 border-zinc-800 hover:border-zinc-700"
                      : "bg-white border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-xs font-bold">{api.name}</h3>
                    <span className="px-2 py-0.5 text-[10px] font-semibold rounded bg-amber-500/15 text-amber-600 dark:text-amber-400">
                      {api.category}
                    </span>
                  </div>
                  <p className={`text-[11px] line-clamp-2 ${theme === "dark" ? "text-zinc-400" : "text-slate-600"}`}>
                    {api.description}
                  </p>
                  <div className="mt-2 text-[10px] font-mono text-slate-400 truncate">
                    GET {api.endpoint}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Interactive Tester & Code Generator (7 cols) */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            <div className={`p-5 rounded-2xl border shadow-sm ${
              theme === "dark" ? "bg-zinc-900 border-zinc-800" : "bg-white border-slate-200"
            }`}>
              <div className="flex items-center justify-between mb-3 border-b pb-3 border-slate-200 dark:border-zinc-800">
                <div>
                  <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Globe className="w-4 h-4 text-amber-500" /> {activeApi.name}
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">{activeApi.description}</p>
                </div>
                <button
                  onClick={() => handleTestApi(activeApi)}
                  disabled={isTestingApi}
                  className="px-4 py-2 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs hover:bg-amber-400 transition-all flex items-center gap-1.5 shadow-sm"
                >
                  <Play className={`w-3.5 h-3.5 ${isTestingApi ? "animate-spin" : ""}`} />
                  {isTestingApi ? "Testing Endpoint..." : "Test API Live"}
                </button>
              </div>

              {/* Endpoint Details */}
              <div className="mb-4">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Target Endpoint URL</span>
                <div className="p-2.5 rounded-xl bg-slate-900 text-amber-400 font-mono text-xs break-all flex items-center justify-between">
                  <span>{activeApi.endpoint}</span>
                  <ExternalLink className="w-3.5 h-3.5 shrink-0 ml-2 text-slate-500" />
                </div>
              </div>

              {/* Live Test Results Output */}
              {testResult && (
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold flex items-center gap-2">
                      Live Response Output
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        testResult.success ? "bg-emerald-500/20 text-emerald-400" : "bg-rose-500/20 text-rose-400"
                      }`}>
                        {testResult.status} {testResult.statusText}
                      </span>
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">
                      ⏱️ {testResult.durationMs} ms latency
                    </span>
                  </div>

                  <pre className="p-3 rounded-xl bg-zinc-950 text-emerald-400 font-mono text-xs max-h-[220px] overflow-auto border border-zinc-800">
                    {JSON.stringify(testResult.data, null, 2)}
                  </pre>
                </div>
              )}

              {/* Code Snippets Selector */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-500 dark:text-zinc-400">Generated Integration Code</span>
                  <div className="flex items-center gap-1 p-1 rounded-lg bg-slate-100 dark:bg-zinc-800">
                    {(["javascript", "python", "curl"] as const).map(tab => (
                      <button
                        key={tab}
                        onClick={() => setActiveCodeTab(tab)}
                        className={`px-2.5 py-1 text-[10px] font-bold rounded uppercase ${
                          activeCodeTab === tab
                            ? "bg-amber-500 text-slate-950"
                            : "text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
                        }`}
                      >
                        {tab}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="relative">
                  <pre className="p-3.5 rounded-xl bg-slate-950 text-sky-300 font-mono text-xs overflow-x-auto border border-zinc-800">
                    {activeApi.sampleCode[activeCodeTab]}
                  </pre>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(activeApi.sampleCode[activeCodeTab]);
                      setCopiedCode(true);
                      setTimeout(() => setCopiedCode(false), 2000);
                    }}
                    className="absolute top-2.5 right-2.5 p-1.5 rounded-lg bg-zinc-800 text-zinc-300 hover:text-white text-xs"
                  >
                    {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* AI Code Roaster & Humor Workshop */}
      {activeSubTab === "ai-roaster" && (
        <div className={`p-6 rounded-2xl border shadow-sm ${
          theme === "dark" ? "bg-zinc-900 border-zinc-800" : "bg-white border-slate-200"
        }`}>
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-500 border border-rose-500/20">
              <Flame className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold">AI Code Roaster & Tech Comedian</h2>
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                Paste any code snippet or topic to receive a hilarious AI roast or customized developer humor!
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 mb-4">
            <button
              onClick={() => setAiMode("roast")}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg ${
                aiMode === "roast"
                  ? "bg-rose-500 text-white"
                  : "bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400"
              }`}
            >
              🔥 Roast My Code
            </button>
            <button
              onClick={() => setAiMode("custom")}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg ${
                aiMode === "custom"
                  ? "bg-amber-500 text-slate-950"
                  : "bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400"
              }`}
            >
              ✨ Custom Topic Joke
            </button>
            <button
              onClick={() => setAiMode("explain")}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg ${
                aiMode === "explain"
                  ? "bg-cyan-500 text-slate-950"
                  : "bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400"
              }`}
            >
              🧠 Explain Punchline
            </button>
          </div>

          <textarea
            rows={4}
            value={aiPrompt}
            onChange={(e) => setAiPrompt(e.target.value)}
            placeholder={
              aiMode === "roast"
                ? "Paste code snippet to roast (e.g. while(true) { fetchAPI(); })..."
                : "Enter topic (e.g. Docker, C++ pointers, CSS centering)..."
            }
            className={`w-full p-3.5 text-xs font-mono rounded-xl border outline-none mb-4 ${
              theme === "dark"
                ? "bg-zinc-950 border-zinc-800 text-white focus:border-amber-500"
                : "bg-slate-50 border-slate-200 text-slate-900 focus:border-amber-500"
            }`}
          />

          <button
            onClick={handleGenerateAiHumor}
            disabled={isAiGenerating}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-amber-500 text-white font-bold text-xs hover:from-rose-400 hover:to-amber-400 transition-all shadow-sm flex items-center gap-2 disabled:opacity-50"
          >
            <Sparkles className={`w-4 h-4 ${isAiGenerating ? "animate-spin" : ""}`} />
            {isAiGenerating ? "Generating Humor..." : "Generate AI Roast / Joke"}
          </button>

          {aiJokeOutput && (
            <div className="mt-6 p-4 rounded-xl bg-zinc-950 text-amber-300 font-mono text-xs border border-zinc-800 leading-relaxed whitespace-pre-wrap">
              {aiJokeOutput}
            </div>
          )}
        </div>
      )}

      {/* Saved Favorites */}
      {activeSubTab === "favorites" && (
        <div className={`p-6 rounded-2xl border shadow-sm ${
          theme === "dark" ? "bg-zinc-900 border-zinc-800" : "bg-white border-slate-200"
        }`}>
          <h2 className="text-base font-bold mb-4 flex items-center gap-2">
            <Bookmark className="w-5 h-5 text-amber-500" /> Saved Favorite Jokes ({favoriteJokes.length})
          </h2>

          {favoriteJokes.length === 0 ? (
            <div className="py-12 text-center text-slate-400 dark:text-zinc-500 text-xs">
              No saved jokes yet! Click the bookmark icon on any joke to save it here.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {favoriteJokes.map(item => (
                <div
                  key={item.id}
                  className={`p-4 rounded-xl border flex flex-col justify-between ${
                    theme === "dark" ? "bg-zinc-950 border-zinc-800" : "bg-slate-50 border-slate-200"
                  }`}
                >
                  <p className="text-xs font-semibold leading-relaxed mb-3">
                    {item.joke || `${item.setup} — ${item.delivery}`}
                  </p>
                  <div className="flex items-center justify-between border-t pt-2 border-slate-200 dark:border-zinc-800">
                    <span className="text-[10px] text-amber-500 font-bold">{item.category}</span>
                    <button
                      onClick={() => toggleFavorite(item)}
                      className="text-[10px] text-rose-500 font-bold hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
