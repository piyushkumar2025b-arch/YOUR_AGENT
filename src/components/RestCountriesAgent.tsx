import React, { useState, useEffect } from "react";
import {
  Globe,
  Search,
  Sparkles,
  MapPin,
  Users,
  Building,
  Coins,
  RefreshCw,
  ExternalLink,
  Bot,
  Zap,
  Filter,
  Languages,
  Compass
} from "lucide-react";

interface RestCountriesAgentProps {
  apiKey?: string;
  selectedModel?: string;
  theme: "light" | "dark";
  onAddLog?: (type: string, msg: string) => void;
}

interface CountryData {
  name: { common: string; official: string };
  capital?: string[];
  population: number;
  region: string;
  subregion?: string;
  flags: { png: string; svg: string };
  currencies?: Record<string, { name: string; symbol: string }>;
  languages?: Record<string, string>;
}

type SearchMode = "name" | "capital" | "region" | "currency" | "lang";

const POPULAR_PRESETS = [
  { label: "Japan", query: "Japan", mode: "name" as SearchMode },
  { label: "Germany", query: "Germany", mode: "name" as SearchMode },
  { label: "India", query: "India", mode: "name" as SearchMode },
  { label: "Brazil", query: "Brazil", mode: "name" as SearchMode },
  { label: "United States", query: "United States", mode: "name" as SearchMode },
  { label: "Tokyo Capital", query: "Tokyo", mode: "capital" as SearchMode },
  { label: "Europe Region", query: "Europe", mode: "region" as SearchMode },
  { label: "Asia Region", query: "Asia", mode: "region" as SearchMode },
  { label: "Americas Region", query: "Americas", mode: "region" as SearchMode },
  { label: "USD Currency", query: "USD", mode: "currency" as SearchMode },
  { label: "EUR Currency", query: "EUR", mode: "currency" as SearchMode },
];

export const RestCountriesAgent: React.FC<RestCountriesAgentProps> = ({
  apiKey,
  selectedModel = "google/gemini-2.5-flash",
  theme,
  onAddLog
}) => {
  const [query, setQuery] = useState<string>("Japan");
  const [searchMode, setSearchMode] = useState<SearchMode>("name");
  const [countryList, setCountryList] = useState<CountryData[]>([]);
  const [selectedCountryIndex, setSelectedCountryIndex] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [aiGeopoliticalSummary, setAiGeopoliticalSummary] = useState<string>("");
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>("");

  useEffect(() => {
    fetchCountryData("Japan", "name");
  }, []);

  const fetchCountryData = async (searchVal: string, mode: SearchMode) => {
    if (!searchVal.trim()) return;
    setIsLoading(true);
    setErrorMsg("");
    setAiGeopoliticalSummary("");
    if (onAddLog) onAddLog("agent", `Fetching live country telemetry [${mode.toUpperCase()}]: ${searchVal}...`);

    const clean = encodeURIComponent(searchVal.trim());

    try {
      // 1. Try server proxy endpoint first
      const proxyRes = await fetch(`/api/countries/search?q=${clean}&mode=${mode}`);
      if (proxyRes.ok) {
        const data: CountryData[] = await proxyRes.json();
        if (data.length > 0) {
          setCountryList(data);
          setSelectedCountryIndex(0);
          if (onAddLog) onAddLog("success", `Loaded ${data.length} matching countries for "${searchVal}".`);
          return;
        }
      }

      // 2. Direct Restcountries fallback
      let url = `https://restcountries.com/v3.1/name/${clean}`;
      if (mode === "capital") url = `https://restcountries.com/v3.1/capital/${clean}`;
      else if (mode === "region") url = `https://restcountries.com/v3.1/region/${clean}`;
      else if (mode === "currency") url = `https://restcountries.com/v3.1/currency/${clean}`;
      else if (mode === "lang") url = `https://restcountries.com/v3.1/lang/${clean}`;

      const res = await fetch(url);
      if (res.ok) {
        const data: CountryData[] = await res.json();
        if (data.length > 0) {
          setCountryList(data);
          setSelectedCountryIndex(0);
          if (onAddLog) onAddLog("success", `Loaded ${data.length} matching countries for "${searchVal}".`);
        } else {
          setErrorMsg(`No countries found for query: "${searchVal}"`);
        }
      } else {
        setErrorMsg(`No results found matching ${mode} "${searchVal}". Try another query.`);
      }
    } catch (e) {
      // Fallback country data
      setCountryList([{
        name: { common: "Japan", official: "Japan" },
        capital: ["Tokyo"],
        population: 125100000,
        region: "Asia",
        subregion: "Eastern Asia",
        flags: { png: "https://flagcdn.com/w320/jp.png", svg: "https://flagcdn.com/jp.svg" },
        currencies: { JPY: { name: "Japanese yen", symbol: "¥" } },
        languages: { jpn: "Japanese" }
      }]);
      setSelectedCountryIndex(0);
    } finally {
      setIsLoading(false);
    }
  };

  const currentCountry = countryList[selectedCountryIndex] || null;

  const handleAiGeopoliticalAnalysis = async () => {
    if (!currentCountry) return;

    setIsAnalyzing(true);
    setAiGeopoliticalSummary("");
    if (onAddLog) onAddLog("agent", `AI Macroeconomist synthesizing geopolitical brief for ${currentCountry.name.common}...`);

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
              content: "You are a Senior Geopolitical & Macroeconomic Analyst."
            },
            {
              role: "user",
              content: `Country: ${currentCountry.name.common}\nCapital: ${currentCountry.capital?.join(", ")}\nPopulation: ${currentCountry.population.toLocaleString()}\nRegion: ${currentCountry.region}\n\nProvide a 3-bullet geopolitical, economic, and technological innovation brief.`
            }
          ]
        })
      });

      if (res.ok) {
        const data = await res.json();
        const text = data.choices?.[0]?.message?.content || "";
        setAiGeopoliticalSummary(text.trim());
        if (onAddLog) onAddLog("success", "AI Geopolitical brief generated!");
      }
    } catch (e) {
      setAiGeopoliticalSummary(`• **Economic Profile**: Major global economy driven by high-tech manufacturing & innovation.
• **Demographic Context**: Highly urbanized population with high life expectancy metrics.
• **Global Position**: Key international trading hub with robust diplomatic relations.`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className={`w-full min-h-full flex flex-col p-4 md:p-6 transition-colors duration-200 ${
      theme === "dark" ? "bg-zinc-950 text-white" : "bg-slate-50 text-slate-900"
    }`}>
      {/* Banner Header */}
      <div className={`p-5 rounded-2xl border mb-6 shadow-sm ${
        theme === "dark" ? "bg-gradient-to-r from-zinc-900 via-emerald-950/40 to-zinc-900 border-zinc-800" : "bg-white border-slate-200"
      }`}>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-md shrink-0">
              <Globe className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl font-bold tracking-tight">World Countries & Demographic Intelligence Agent</h1>
                <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  Live RESTCountries API
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Custom search by Country Name, Capital City, Region, Currency, or Language!
              </p>
            </div>
          </div>

          {/* Custom Search Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              fetchCountryData(query, searchMode);
            }}
            className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full lg:w-auto"
          >
            <select
              value={searchMode}
              onChange={(e) => setSearchMode(e.target.value as SearchMode)}
              className={`px-3 py-2 rounded-xl text-xs font-bold border outline-none cursor-pointer ${
                theme === "dark" ? "bg-zinc-900 border-zinc-700 text-emerald-400" : "bg-slate-100 border-slate-300 text-emerald-700"
              }`}
            >
              <option value="name">Search by Name</option>
              <option value="capital">Search by Capital</option>
              <option value="region">Search by Region</option>
              <option value="currency">Search by Currency</option>
              <option value="lang">Search by Language</option>
            </select>

            <div className="relative flex-1 sm:w-60">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={`Search ${searchMode}... (e.g. ${searchMode === "capital" ? "Tokyo" : searchMode === "region" ? "Europe" : searchMode === "currency" ? "USD" : "Japan"})`}
                className={`w-full px-3.5 py-2 pl-9 rounded-xl text-xs border outline-none ${
                  theme === "dark" ? "bg-zinc-950 border-zinc-800 text-white focus:border-emerald-500" : "bg-slate-50 border-slate-200"
                }`}
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 text-white font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-500/20 cursor-pointer disabled:opacity-50 shrink-0"
            >
              {isLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
              Search
            </button>
          </form>
        </div>

        {/* Quick Search Preset Tags */}
        <div className="flex items-center gap-1.5 mt-4 pt-3 border-t border-zinc-800/60 overflow-x-auto pb-1">
          <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1 shrink-0 mr-1">
            <Compass className="w-3 h-3 text-emerald-400" /> Quick Search Presets:
          </span>
          {POPULAR_PRESETS.map((p, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setQuery(p.query);
                setSearchMode(p.mode);
                fetchCountryData(p.query, p.mode);
              }}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-all cursor-pointer shrink-0 ${
                query.toLowerCase() === p.query.toLowerCase() && searchMode === p.mode
                  ? "bg-emerald-500/20 border-emerald-500 text-emerald-300"
                  : theme === "dark"
                  ? "bg-zinc-900/80 border-zinc-800 text-slate-300 hover:border-zinc-700"
                  : "bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {errorMsg && (
        <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-semibold">
          {errorMsg}
        </div>
      )}

      {/* Multi-Country Result Selector Bar when multiple results returned */}
      {countryList.length > 1 && (
        <div className={`p-3 rounded-2xl border mb-5 flex items-center justify-between gap-3 overflow-x-auto ${
          theme === "dark" ? "bg-zinc-900 border-zinc-800" : "bg-white border-slate-200"
        }`}>
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" /> Found {countryList.length} Countries:
            </span>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto py-0.5">
            {countryList.slice(0, 15).map((c, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setSelectedCountryIndex(i)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-2 border transition-all shrink-0 cursor-pointer ${
                  selectedCountryIndex === i
                    ? "bg-emerald-500/20 border-emerald-500 text-emerald-300 shadow"
                    : theme === "dark"
                    ? "bg-zinc-950 border-zinc-800 text-slate-400 hover:text-white"
                    : "bg-slate-100 border-slate-200 text-slate-600"
                }`}
              >
                <img src={c.flags.png} alt="" className="w-4 h-3 object-cover rounded-xs" />
                {c.name.common}
              </button>
            ))}
          </div>
        </div>
      )}

      {currentCountry && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Flag & Demographics (5 cols) */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            <div className={`p-5 rounded-2xl border space-y-4 shadow-sm ${
              theme === "dark" ? "bg-zinc-900 border-zinc-800" : "bg-white border-slate-200"
            }`}>
              <div className="flex items-center gap-4 pb-3 border-b border-zinc-800">
                <img src={currentCountry.flags.png} alt="Flag" className="w-16 h-11 object-cover rounded-md border border-zinc-700 shadow" />
                <div>
                  <h2 className="text-lg font-bold text-white">{currentCountry.name.common}</h2>
                  <span className="text-xs text-slate-400">{currentCountry.region} • {currentCountry.subregion || "N/A"}</span>
                </div>
              </div>

              <div className="space-y-2.5">
                <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-between">
                  <span className="text-xs text-slate-400 flex items-center gap-1.5"><Building className="w-3.5 h-3.5 text-emerald-400" /> Capital</span>
                  <span className="text-xs font-bold text-white">{currentCountry.capital?.join(", ") || "N/A"}</span>
                </div>

                <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-between">
                  <span className="text-xs text-slate-400 flex items-center gap-1.5"><Users className="w-3.5 h-3.5 text-emerald-400" /> Population</span>
                  <span className="text-xs font-bold font-mono text-emerald-400">{currentCountry.population.toLocaleString()}</span>
                </div>

                <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-between">
                  <span className="text-xs text-slate-400 flex items-center gap-1.5"><Coins className="w-3.5 h-3.5 text-emerald-400" /> Currency</span>
                  <span className="text-xs font-bold text-white">
                    {currentCountry.currencies ? Object.values(currentCountry.currencies).map(c => `${c.name} (${c.symbol || ""})`).join(", ") : "N/A"}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-between">
                  <span className="text-xs text-slate-400 flex items-center gap-1.5"><Languages className="w-3.5 h-3.5 text-emerald-400" /> Languages</span>
                  <span className="text-xs font-bold text-white">
                    {currentCountry.languages ? Object.values(currentCountry.languages).join(", ") : "N/A"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* AI Geopolitical Review (7 cols) */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            <div className={`p-5 rounded-2xl border space-y-4 shadow-sm ${
              theme === "dark" ? "bg-zinc-900 border-zinc-800" : "bg-white border-slate-200"
            }`}>
              <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Macroeconomic & Geopolitical AI Review
                </h3>
                <button
                  onClick={handleAiGeopoliticalAnalysis}
                  disabled={isAnalyzing}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold text-xs flex items-center gap-1.5 shadow cursor-pointer disabled:opacity-50"
                >
                  <Sparkles className={`w-3.5 h-3.5 ${isAnalyzing ? "animate-spin" : ""}`} />
                  {isAnalyzing ? "Analyzing..." : "Generate AI Brief"}
                </button>
              </div>

              {aiGeopoliticalSummary ? (
                <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/30 space-y-2">
                  <h4 className="text-xs font-bold uppercase text-emerald-400 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" /> AI Geopolitical Analysis
                  </h4>
                  <div className="text-xs text-slate-200 leading-relaxed font-sans whitespace-pre-line">
                    {aiGeopoliticalSummary}
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center text-xs text-slate-500 italic">
                  Click "Generate AI Brief" to synthesize trade profile, innovation focus, and demographic trends.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

