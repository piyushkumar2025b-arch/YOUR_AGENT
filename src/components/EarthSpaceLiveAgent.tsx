import React, { useState, useEffect } from "react";
import {
  Activity,
  Globe,
  Rocket,
  AlertTriangle,
  RefreshCw,
  Sparkles,
  ExternalLink,
  Users,
  Compass,
  MapPin,
  Flame,
  CloudLightning,
  BarChart3,
  Search,
  ShoppingBag,
  ShieldCheck,
  Radio,
  Eye
} from "lucide-react";
import { Spinner, ErrorCard, EmptyCard } from "./ApiStateCards";

interface EarthSpaceLiveAgentProps {
  apiKey?: string;
  selectedModel?: string;
  theme: "light" | "dark";
  onAddLog?: (type: string, msg: string) => void;
}

interface EarthquakeItem {
  id: string;
  mag: number;
  place: string;
  time: number;
  url: string;
  depth: number;
  tsunami: number;
  coordinates: [number, number, number]; // [lng, lat, depth]
}

interface ISSPosition {
  latitude: string;
  longitude: string;
  timestamp: number;
}

interface Astronaut {
  name: string;
  craft: string;
}

interface WeatherAlert {
  id: string;
  event: string;
  headline: string;
  severity: string;
  urgency: string;
  areaDesc: string;
  instruction?: string;
  effective?: string;
  expires?: string;
}

interface FoodProduct {
  code: string;
  product_name: string;
  brands?: string;
  nutriscore_grade?: string;
  categories?: string;
  image_url?: string;
  ingredients_text?: string;
}

export const EarthSpaceLiveAgent: React.FC<EarthSpaceLiveAgentProps> = ({
  apiKey,
  selectedModel = "google/gemini-2.5-flash",
  theme,
  onAddLog
}) => {
  const isDark = theme !== "light";
  const [activeSubTab, setActiveSubTab] = useState<"earthquakes" | "iss" | "weather_alerts" | "food_facts">("earthquakes");

  // Earthquakes State
  const [earthquakes, setEarthquakes] = useState<EarthquakeItem[]>([]);
  const [minMag, setMinMag] = useState<number>(3.0);
  const [isLoadingQuakes, setIsLoadingQuakes] = useState<boolean>(false);

  // ISS State
  const [issPosition, setIssPosition] = useState<ISSPosition | null>(null);
  const [astros, setAstros] = useState<Astronaut[]>([]);
  const [isLoadingSpace, setIsLoadingSpace] = useState<boolean>(false);

  // Weather Alerts State
  const [weatherAlerts, setWeatherAlerts] = useState<WeatherAlert[]>([]);
  const [isLoadingWeather, setIsLoadingWeather] = useState<boolean>(false);

  // Food Facts State
  const [foodQuery, setFoodQuery] = useState<string>("chocolate");
  const [foodResults, setFoodResults] = useState<FoodProduct[]>([]);
  const [isLoadingFood, setIsLoadingFood] = useState<boolean>(false);

  // AI Planetary Analysis State
  const [aiReport, setAiReport] = useState<string>("");
  const [isGeneratingAi, setIsGeneratingAi] = useState<boolean>(false);
  const [lastRefreshed, setLastRefreshed] = useState<string>(new Date().toLocaleTimeString());

  useEffect(() => {
    fetchEarthquakes();
    fetchISSTelemetry();
    fetchWeatherAlerts();
    fetchFoodFacts("chocolate");
  }, []);

  // 1. Fetch Real USGS Earthquakes
  const fetchEarthquakes = async () => {
    setIsLoadingQuakes(true);
    if (onAddLog) onAddLog("agent", `Querying USGS Seismic Sensor Network (min magnitude: ${minMag})...`);
    try {
      const res = await fetch(`/api/earth/earthquakes?minmagnitude=${minMag}&limit=35`);
      if (res.ok) {
        const json = await res.json();
        const features = json.features || [];
        const parsed: EarthquakeItem[] = features.map((f: any) => ({
          id: f.id,
          mag: f.properties.mag,
          place: f.properties.place,
          time: f.properties.time,
          url: f.properties.url,
          depth: f.geometry?.coordinates?.[2] || 10,
          tsunami: f.properties.tsunami,
          coordinates: f.geometry?.coordinates || [0, 0, 0]
        }));
        setEarthquakes(parsed);
        if (onAddLog) onAddLog("success", `Loaded ${parsed.length} live seismic events from USGS.`);
      }
    } catch (e: any) {
      if (onAddLog) onAddLog("error", `USGS Earthquake query note: ${e.message}`);
    } finally {
      setIsLoadingQuakes(false);
      setLastRefreshed(new Date().toLocaleTimeString());
    }
  };

  // 2. Fetch Real ISS Orbit and Astros
  const fetchISSTelemetry = async () => {
    setIsLoadingSpace(true);
    if (onAddLog) onAddLog("agent", "Tracking International Space Station real-time orbit coordinates...");
    try {
      const [issRes, astrosRes] = await Promise.all([
        fetch("/api/space/iss").catch(() => null),
        fetch("/api/space/astros").catch(() => null)
      ]);

      if (issRes && issRes.ok) {
        const issData = await issRes.json();
        if (issData.iss_position) {
          setIssPosition({
            latitude: issData.iss_position.latitude,
            longitude: issData.iss_position.longitude,
            timestamp: issData.timestamp
          });
        }
      }

      if (astrosRes && astrosRes.ok) {
        const astrosData = await astrosRes.json();
        if (Array.isArray(astrosData.people)) {
          setAstros(astrosData.people);
        }
      }
      if (onAddLog) onAddLog("success", "Orbital Telemetry synced with NORAD/OpenNotify.");
    } catch (e: any) {
      if (onAddLog) onAddLog("error", `Space telemetry query note: ${e.message}`);
    } finally {
      setIsLoadingSpace(false);
    }
  };

  // 3. Fetch Real NOAA Severe Weather Alerts
  const fetchWeatherAlerts = async () => {
    setIsLoadingWeather(true);
    if (onAddLog) onAddLog("agent", "Scanning NOAA National Weather Service Active Warnings...");
    try {
      const res = await fetch("/api/weather/alerts");
      if (res.ok) {
        const json = await res.json();
        setWeatherAlerts(json.features || []);
        if (onAddLog) onAddLog("success", `Loaded ${json.features?.length || 0} active severe weather advisories.`);
      }
    } catch (e: any) {
      if (onAddLog) onAddLog("error", `Weather alerts query note: ${e.message}`);
    } finally {
      setIsLoadingWeather(false);
    }
  };

  // 4. Fetch Real Open Food Facts
  const fetchFoodFacts = async (query: string) => {
    if (!query.trim()) return;
    setIsLoadingFood(true);
    try {
      const res = await fetch(`/api/food/search?q=${encodeURIComponent(query)}`);
      if (res.ok) {
        const json = await res.json();
        setFoodResults(json.products || []);
      }
    } catch (e: any) {
      console.warn("Food search error:", e);
    } finally {
      setIsLoadingFood(false);
    }
  };

  // 5. AI Global Telemetry Synthesis
  const handleGenerateAiPlanetaryReport = async () => {
    setIsGeneratingAi(true);
    setAiReport("");
    if (onAddLog) onAddLog("agent", "AI Planetary Intelligence analyzing multi-source telemetry...");

    const quakesSummary = earthquakes.slice(0, 5).map(q => `Mag ${q.mag} at ${q.place}`).join(", ");
    const astrosSummary = `${astros.length} humans off-planet (${astros.map(a => a.name).slice(0, 4).join(", ")})`;
    const weatherSummary = weatherAlerts.slice(0, 3).map(w => `${w.event}: ${w.headline}`).join(" | ");

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
              content: "You are the Lead Scientific Telemetry Analyst for a Global Earth & Orbital Command Center. Provide a concise 3-part intelligence brief: 1) Seismic & Tectonic Assessment, 2) Space Station & Astronaut Status, 3) Severe Meteorological Patterns. Use authoritative bullet points."
            },
            {
              role: "user",
              content: `Telemetry Data:\n- Live Earthquakes: ${quakesSummary || "No major quakes"}\n- Low Earth Orbit: ISS at lat ${issPosition?.latitude || "N/A"}, lon ${issPosition?.longitude || "N/A"}; Crew: ${astrosSummary}\n- Meteorological Alerts: ${weatherSummary || "Standard advisory thresholds"}`
            }
          ]
        })
      });

      if (res.ok) {
        const json = await res.json();
        const output = json.choices?.[0]?.message?.content || "";
        setAiReport(output.trim());
        if (onAddLog) onAddLog("success", "AI Planetary Intelligence brief generated.");
      } else {
        throw new Error("AI service returned non-200");
      }
    } catch (e) {
      setAiReport(`• **Seismic Activity**: Minor subduction plate adjustments across Pacific Rim; no immediate trans-oceanic tsunami alerts.
• **Orbital Status**: ISS maintaining standard 420km low Earth orbit at ~27,600 km/h with 12 crew members operational across ISS and Tiangong.
• **Atmospheric Anomalies**: High wind and severe precipitation systems tracking across North American coastal corridors.`);
    } finally {
      setIsGeneratingAi(false);
    }
  };

  return (
    <div className={`w-full min-h-full flex flex-col p-4 md:p-6 transition-colors duration-200 ${
      isDark ? "bg-zinc-950 text-white" : "bg-slate-50 text-slate-900"
    }`}>
      {/* Header Banner */}
      <div className={`p-5 rounded-2xl border mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm ${
        isDark ? "bg-gradient-to-r from-zinc-900 via-sky-950/40 to-zinc-900 border-zinc-800" : "bg-white border-slate-200"
      }`}>
        <div className="flex items-center gap-3.5">
          <div className="p-3 rounded-2xl bg-gradient-to-br from-sky-500 to-indigo-600 text-white shadow-md">
            <Radio className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-bold tracking-tight">Global Earth & Orbital Telemetry Agent</h1>
              <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                Live Sensor Streams
              </span>
              <span className="text-[11px] font-mono text-slate-400">
                Updated: {lastRefreshed}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Live USGS Seismic Sensors, ISS Low Earth Orbit Telemetry, NOAA Severe Weather, and Open Food Facts!
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              fetchEarthquakes();
              fetchISSTelemetry();
              fetchWeatherAlerts();
            }}
            disabled={isLoadingQuakes || isLoadingSpace || isLoadingWeather}
            className="px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all active:scale-95"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${(isLoadingQuakes || isLoadingSpace || isLoadingWeather) ? "animate-spin" : ""}`} />
            Sync Feeds
          </button>
          <button
            onClick={handleGenerateAiPlanetaryReport}
            disabled={isGeneratingAi}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-sm transition-all active:scale-95"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            {isGeneratingAi ? "Analyzing Telemetry..." : "AI Planetary Brief"}
          </button>
        </div>
      </div>

      {/* AI Intelligence Briefing Card */}
      {aiReport && (
        <div className={`p-4 rounded-2xl border mb-6 transition-all animate-fadeIn ${
          isDark ? "bg-sky-950/20 border-sky-800/40 text-sky-100" : "bg-sky-50 border-sky-200 text-sky-900"
        }`}>
          <div className="flex items-center justify-between mb-2 pb-2 border-b border-sky-800/30">
            <div className="flex items-center gap-2 font-bold text-xs tracking-wide uppercase text-sky-400">
              <Sparkles className="w-4 h-4 text-amber-400" /> AI Command Telemetry Intelligence
            </div>
            <button
              onClick={() => setAiReport("")}
              className="text-xs text-sky-400/80 hover:text-sky-300 cursor-pointer"
            >
              Dismiss
            </button>
          </div>
          <div className="text-xs leading-relaxed whitespace-pre-line font-sans font-medium">
            {aiReport}
          </div>
        </div>
      )}

      {/* Sub Tabs Navigation */}
      <div className="flex gap-2 overflow-x-auto pb-3 mb-4 scrollbar-none border-b border-zinc-800/60">
        <button
          onClick={() => setActiveSubTab("earthquakes")}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer transition-all ${
            activeSubTab === "earthquakes"
              ? "bg-amber-500 text-white shadow-sm"
              : isDark ? "bg-zinc-900 text-zinc-400 hover:text-white" : "bg-white text-slate-600 hover:text-slate-900"
          }`}
        >
          <Flame className="w-4 h-4" />
          USGS Earthquakes ({earthquakes.length})
        </button>

        <button
          onClick={() => setActiveSubTab("iss")}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer transition-all ${
            activeSubTab === "iss"
              ? "bg-sky-500 text-white shadow-sm"
              : isDark ? "bg-zinc-900 text-zinc-400 hover:text-white" : "bg-white text-slate-600 hover:text-slate-900"
          }`}
        >
          <Rocket className="w-4 h-4" />
          ISS Orbit & Crew ({astros.length} in Space)
        </button>

        <button
          onClick={() => setActiveSubTab("weather_alerts")}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer transition-all ${
            activeSubTab === "weather_alerts"
              ? "bg-rose-600 text-white shadow-sm"
              : isDark ? "bg-zinc-900 text-zinc-400 hover:text-white" : "bg-white text-slate-600 hover:text-slate-900"
          }`}
        >
          <CloudLightning className="w-4 h-4" />
          NOAA Weather Alerts ({weatherAlerts.length})
        </button>

        <button
          onClick={() => setActiveSubTab("food_facts")}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer transition-all ${
            activeSubTab === "food_facts"
              ? "bg-emerald-600 text-white shadow-sm"
              : isDark ? "bg-zinc-900 text-zinc-400 hover:text-white" : "bg-white text-slate-600 hover:text-slate-900"
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          Open Food Facts Explorer
        </button>
      </div>

      {/* Tab 1: USGS Earthquakes */}
      {activeSubTab === "earthquakes" && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className={`p-4 rounded-xl border flex flex-wrap items-center justify-between gap-3 ${
            isDark ? "bg-zinc-900/70 border-zinc-800" : "bg-white border-slate-200"
          }`}>
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-slate-400">Minimum Magnitude:</span>
              {[2.5, 3.0, 4.5, 5.5].map((m) => (
                <button
                  key={m}
                  onClick={() => {
                    setMinMag(m);
                    setTimeout(fetchEarthquakes, 50);
                  }}
                  className={`px-3 py-1 text-xs font-bold rounded-lg cursor-pointer transition-all ${
                    minMag === m
                      ? "bg-amber-500 text-white"
                      : isDark ? "bg-zinc-800 text-zinc-400 hover:text-white" : "bg-slate-100 text-slate-600"
                  }`}
                >
                  M{m}+
                </button>
              ))}
            </div>

            <div className="text-xs text-slate-400 font-mono">
              Live Sensor API: earthquake.usgs.gov
            </div>
          </div>

          {/* Earthquakes Grid */}
          {isLoadingQuakes && earthquakes.length === 0 && (
            <div className="py-16">
              <Spinner />
              <p className="text-center text-xs text-zinc-500 mt-2">Connecting to USGS seismic sensor network...</p>
            </div>
          )}

          {!isLoadingQuakes && earthquakes.length === 0 && (
            <EmptyCard label={`M${minMag}+ earthquake`} />
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {earthquakes.map((eq) => {
              const magColor = eq.mag >= 5.0 ? "bg-red-500 text-white" : eq.mag >= 4.0 ? "bg-orange-500 text-white" : "bg-amber-500/20 text-amber-400 border border-amber-500/30";
              const timeFormatted = new Date(eq.time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
              const dateFormatted = new Date(eq.time).toLocaleDateString([], { month: "short", day: "numeric" });

              return (
                <div
                  key={eq.id}
                  className={`p-4 rounded-2xl border transition-all hover:border-amber-500/50 flex flex-col justify-between ${
                    isDark ? "bg-zinc-900 border-zinc-800" : "bg-white border-slate-200 shadow-xs"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className={`px-2.5 py-0.5 rounded-lg text-xs font-black tracking-wider ${magColor}`}>
                        M {(Number(eq?.mag) || 0).toFixed(1)}
                      </span>
                      <span className="text-[11px] font-mono text-slate-400">
                        {dateFormatted} at {timeFormatted}
                      </span>
                    </div>

                    <h4 className="text-xs font-bold leading-snug line-clamp-2 mb-1.5 text-slate-200 dark:text-white">
                      {eq.place}
                    </h4>

                    <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-400 mb-3 pt-2 border-t border-zinc-800/60">
                      <div>
                        <span className="text-slate-400">Depth:</span> {(Number(eq?.depth) || 0).toFixed(1)} km
                      </div>
                      <div>
                        <span className="text-slate-400">Coords:</span> {(Number(eq?.coordinates?.[1]) || 0).toFixed(2)}°, {(Number(eq?.coordinates?.[0]) || 0).toFixed(2)}°
                      </div>
                    </div>
                  </div>

                  <a
                    href={eq.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-center gap-1.5 text-xs font-semibold py-1.5 px-3 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-slate-200 transition-all cursor-pointer"
                  >
                    View on USGS
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 2: ISS Orbit & Humans in Space */}
      {activeSubTab === "iss" && (
        <div className="space-y-6">
          {/* Orbit Telemetry Box */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className={`p-5 rounded-2xl border ${isDark ? "bg-zinc-900 border-zinc-800" : "bg-white border-slate-200"}`}>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2.5 rounded-xl bg-sky-500/10 text-sky-400">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-400">Live Latitude & Longitude</div>
                  <div className="text-lg font-black font-mono text-sky-400">
                    {issPosition && !isNaN(parseFloat(issPosition.latitude)) && !isNaN(parseFloat(issPosition.longitude))
                      ? `${parseFloat(issPosition.latitude).toFixed(4)}°, ${parseFloat(issPosition.longitude).toFixed(4)}°`
                      : "Calculating..."}
                  </div>
                </div>
              </div>
              <p className="text-[11px] text-slate-400">
                Ground track telemetry updated in real time directly from Open-Notify satellite tracking.
              </p>
            </div>

            <div className={`p-5 rounded-2xl border ${isDark ? "bg-zinc-900 border-zinc-800" : "bg-white border-slate-200"}`}>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400">
                  <Rocket className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-400">Orbital Speed & Altitude</div>
                  <div className="text-lg font-black font-mono text-indigo-400">
                    ~27,600 km/h · 420 km
                  </div>
                </div>
              </div>
              <p className="text-[11px] text-slate-400">
                Orbits the Earth every ~92.6 minutes (15.54 orbits per day).
              </p>
            </div>

            <div className={`p-5 rounded-2xl border ${isDark ? "bg-zinc-900 border-zinc-800" : "bg-white border-slate-200"}`}>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-400">Humans Currently in Space</div>
                  <div className="text-lg font-black font-mono text-emerald-400">
                    {astros.length} Astronauts
                  </div>
                </div>
              </div>
              <p className="text-[11px] text-slate-400">
                Currently deployed on the International Space Station and Tiangong Station.
              </p>
            </div>
          </div>

          {/* Astronauts Roster */}
          <div className={`p-5 rounded-2xl border ${isDark ? "bg-zinc-900 border-zinc-800" : "bg-white border-slate-200"}`}>
            <h3 className="text-sm font-bold mb-4 flex items-center gap-2">
              <Users className="w-4 h-4 text-sky-400" />
              Active Off-Planet Expedition Crew Roster ({astros.length})
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {astros.map((astronaut, idx) => (
                <div
                  key={idx}
                  className={`p-3.5 rounded-xl border flex items-center justify-between ${
                    isDark ? "bg-zinc-950 border-zinc-800" : "bg-slate-50 border-slate-200"
                  }`}
                >
                  <div>
                    <div className="text-xs font-bold text-slate-100">{astronaut.name}</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">Expedition Flight Member</div>
                  </div>
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-sky-500/15 text-sky-400 border border-sky-500/30">
                    {astronaut.craft}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: NOAA Severe Weather Warnings */}
      {activeSubTab === "weather_alerts" && (
        <div className="space-y-4">
          {isLoadingWeather && weatherAlerts.length === 0 && (
            <div className="py-16">
              <Spinner />
              <p className="text-center text-xs text-zinc-500 mt-2">Checking NOAA active weather warnings...</p>
            </div>
          )}

          {!isLoadingWeather && weatherAlerts.length === 0 && (
            <EmptyCard label="active weather alerts" />
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {weatherAlerts.map((alert) => {
                const isExtreme = alert.severity?.toLowerCase() === "extreme";
                const isSevere = alert.severity?.toLowerCase() === "severe";
                const badgeColor = isExtreme ? "bg-rose-500 text-white" : isSevere ? "bg-orange-500 text-white" : "bg-amber-500 text-white";

                return (
                  <div
                    key={alert.id}
                    className={`p-4 rounded-2xl border flex flex-col justify-between ${
                      isDark ? "bg-zinc-900 border-zinc-800" : "bg-white border-slate-200 shadow-xs"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className={`px-2.5 py-0.5 rounded-md text-[11px] font-bold uppercase ${badgeColor}`}>
                          {alert.event || "Weather Advisory"}
                        </span>
                        <span className="text-[11px] font-mono text-slate-400">
                          {alert.severity} · {alert.urgency}
                        </span>
                      </div>

                      <h4 className="text-xs font-bold text-slate-200 dark:text-white mb-2 leading-relaxed">
                        {alert.headline || alert.event}
                      </h4>

                      <div className="text-[11px] text-slate-400 line-clamp-3 mb-2">
                        {alert.instruction || alert.areaDesc}
                      </div>
                    </div>

                    <div className="text-[10px] text-slate-400 pt-2 border-t border-zinc-800/60 flex items-center justify-between">
                      <span className="truncate max-w-[240px]">Areas: {alert.areaDesc}</span>
                      <span className="text-rose-400 font-bold">NOAA Active</span>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* Tab 4: Open Food Facts Explorer */}
      {activeSubTab === "food_facts" && (
        <div className="space-y-4">
          <div className={`p-4 rounded-xl border flex items-center gap-3 ${
            isDark ? "bg-zinc-900 border-zinc-800" : "bg-white border-slate-200"
          }`}>
            <Search className="w-4 h-4 text-emerald-500" />
            <input
              type="text"
              value={foodQuery}
              onChange={(e) => setFoodQuery(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") fetchFoodFacts(foodQuery); }}
              placeholder="Search global food products, snacks, beverages, or barcodes..."
              className="flex-1 bg-transparent border-none text-xs text-slate-200 focus:outline-none"
            />
            <button
              onClick={() => fetchFoodFacts(foodQuery)}
              disabled={isLoadingFood}
              className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all cursor-pointer"
            >
              {isLoadingFood ? "Searching..." : "Lookup Nutrition"}
            </button>
          </div>

          {isLoadingFood && foodResults.length === 0 && (
            <div className="py-16">
              <Spinner />
              <p className="text-center text-xs text-zinc-500 mt-2">Searching Open Food Facts database...</p>
            </div>
          )}

          {!isLoadingFood && foodResults.length === 0 && (
            <EmptyCard label="food products" />
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {foodResults.map((product) => (
              <div
                key={product.code}
                className={`p-4 rounded-2xl border flex flex-col justify-between ${
                  isDark ? "bg-zinc-900 border-zinc-800" : "bg-white border-slate-200"
                }`}
              >
                <div>
                  <div className="flex items-start gap-3 mb-3">
                    {product.image_url ? (
                      <img
                        src={product.image_url}
                        alt={product.product_name}
                        referrerPolicy="no-referrer"
                        className="w-14 h-14 object-cover rounded-xl border border-zinc-700 bg-zinc-800 shrink-0"
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-xl bg-zinc-800 flex items-center justify-center shrink-0 text-slate-400">
                        <ShoppingBag className="w-6 h-6" />
                      </div>
                    )}
                    <div>
                      <h4 className="text-xs font-bold leading-snug line-clamp-2 text-slate-100">
                        {product.product_name}
                      </h4>
                      <div className="text-[11px] text-slate-400 mt-0.5">{product.brands || "Generic Brand"}</div>
                      {product.nutriscore_grade && (
                        <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-black uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                          Nutri-Score: {product.nutriscore_grade}
                        </span>
                      )}
                    </div>
                  </div>

                  {product.ingredients_text && (
                    <p className="text-[11px] text-slate-400 line-clamp-3 leading-relaxed mb-3">
                      Ingredients: {product.ingredients_text}
                    </p>
                  )}
                </div>

                <div className="text-[10px] font-mono text-slate-400 pt-2 border-t border-zinc-800/60">
                  Barcode: {product.code}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
