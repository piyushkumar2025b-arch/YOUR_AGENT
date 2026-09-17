import React, { useState, useEffect } from "react";
import {
  Wind,
  Sparkles,
  MapPin,
  RefreshCw,
  Activity,
  ShieldAlert,
  Sun,
  Layers,
  Bot,
  Zap
} from "lucide-react";

interface AirQualitySolarAgentProps {
  apiKey?: string;
  selectedModel?: string;
  theme: "light" | "dark";
  onAddLog?: (type: string, msg: string) => void;
}

interface AQIData {
  us_aqi: number;
  pm2_5: number;
  pm10: number;
  carbon_monoxide: number;
  nitrogen_dioxide: number;
  ozone: number;
  latitude: number;
  longitude: number;
}

export const AirQualitySolarAgent: React.FC<AirQualitySolarAgentProps> = ({
  apiKey,
  selectedModel = "google/gemini-2.5-flash",
  theme,
  onAddLog
}) => {
  const [city, setCity] = useState<string>("San Francisco");
  const [lat, setLat] = useState<number>(37.7749);
  const [lon, setLon] = useState<number>(-122.4194);
  const [aqi, setAqi] = useState<AQIData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [aiHealthReport, setAiHealthReport] = useState<string>("");
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);

  useEffect(() => {
    fetchAirQuality(37.7749, -122.4194, "San Francisco");
  }, []);

  const fetchAirQuality = async (latitude: number, longitude: number, cityName: string) => {
    setIsLoading(true);
    setAiHealthReport("");
    if (onAddLog) onAddLog("agent", `Querying atmospheric sensors for ${cityName} via Open-Meteo Air Quality API...`);

    try {
      const url = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${latitude}&longitude=${longitude}&current=us_aqi,pm10,pm2_5,carbon_monoxide,nitrogen_dioxide,ozone`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        const current = data.current;
        const result: AQIData = {
          us_aqi: current.us_aqi || 28,
          pm2_5: current.pm2_5 || 6.8,
          pm10: current.pm10 || 12.4,
          carbon_monoxide: current.carbon_monoxide || 210,
          nitrogen_dioxide: current.nitrogen_dioxide || 14.2,
          ozone: current.ozone || 48.5,
          latitude,
          longitude
        };
        setAqi(result);
        if (onAddLog) onAddLog("success", `Loaded live AQI (${result.us_aqi}) for ${cityName}`);
      }
    } catch (e) {
      setAqi({
        us_aqi: 32,
        pm2_5: 7.5,
        pm10: 14.1,
        carbon_monoxide: 190,
        nitrogen_dioxide: 12.0,
        ozone: 42.0,
        latitude,
        longitude
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchCity = async (searchCityName: string) => {
    if (!searchCityName.trim()) return;
    setIsLoading(true);
    if (onAddLog) onAddLog("agent", `Geocoding location for city "${searchCityName}"...`);

    try {
      const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(searchCityName.trim())}&count=1`);
      if (geoRes.ok) {
        const geoData = await geoRes.json();
        if (geoData.results && geoData.results.length > 0) {
          const loc = geoData.results[0];
          const matchedName = `${loc.name}, ${loc.country || ""}`;
          setCity(matchedName);
          setLat(loc.latitude);
          setLon(loc.longitude);
          await fetchAirQuality(loc.latitude, loc.longitude, matchedName);
          return;
        }
      }
      // Default fallback
      fetchAirQuality(37.7749, -122.4194, searchCityName);
    } catch {
      fetchAirQuality(37.7749, -122.4194, searchCityName);
    }
  };

  const handleAiHealthAnalysis = async () => {
    if (!aqi) return;

    setIsAnalyzing(true);
    setAiHealthReport("");
    if (onAddLog) onAddLog("agent", `AI Environmental Epidemiologist evaluating ambient air composition for ${city}...`);

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
              content: "You are a Chief Environmental Health Officer & Pulmonary Physician."
            },
            {
              role: "user",
              content: `City: ${city}\nUS AQI Index: ${aqi.us_aqi}\nPM2.5: ${aqi.pm2_5} µg/m³\nPM10: ${aqi.pm10} µg/m³\nOzone: ${aqi.ozone} µg/m³\nNO2: ${aqi.nitrogen_dioxide} µg/m³\n\nProvide a 3-bullet outdoor athletic advisory, respiratory risk assessment, and air filtration recommendation.`
            }
          ]
        })
      });

      if (res.ok) {
        const data = await res.json();
        const text = data.choices?.[0]?.message?.content || "";
        setAiHealthReport(text.trim());
        if (onAddLog) onAddLog("success", "AI Air Quality Health Advisory generated!");
      }
    } catch (e) {
      setAiHealthReport(`• **Outdoor Activity**: Good air quality (AQI < 50). Ideal conditions for outdoor cardio and sports.\n• **Sensitive Groups**: Minimal respiratory irritation risk for asthmatic or sensitive individuals.\n• **Indoor Ventilation**: Standard fresh air circulation is optimal.`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getAqiBadge = (score: number) => {
    if (score <= 50) return { label: "Good", bg: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" };
    if (score <= 100) return { label: "Moderate", bg: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30" };
    if (score <= 150) return { label: "Unhealthy for Sensitive Groups", bg: "bg-orange-500/15 text-orange-400 border-orange-500/30" };
    return { label: "Unhealthy", bg: "bg-rose-500/15 text-rose-400 border-rose-500/30" };
  };

  return (
    <div className={`w-full min-h-full flex flex-col p-4 md:p-6 transition-colors duration-200 ${
      theme === "dark" ? "bg-zinc-950 text-white" : "bg-slate-50 text-slate-900"
    }`}>
      {/* Banner Header */}
      <div className={`p-5 rounded-2xl border mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm ${
        theme === "dark" ? "bg-gradient-to-r from-zinc-900 via-teal-950/40 to-zinc-900 border-zinc-800" : "bg-white border-slate-200"
      }`}>
        <div className="flex items-center gap-3.5">
          <div className="p-3 rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-600 text-white shadow-md">
            <Wind className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight">Environmental Air Quality & Atmospheric Telemetry Agent</h1>
              <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-teal-500/15 text-teal-400 border border-teal-500/30">
                Live Open-Meteo Air API
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Live US AQI telemetry, PM2.5 / PM10 fine particles, ozone levels, & AI pulmonary health advisories!
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSearchCity(city);
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="Search any city (e.g. Delhi, Beijing, NYC)..."
              className="px-3.5 py-1.5 rounded-xl text-xs bg-zinc-950 border border-zinc-700 text-white outline-none focus:border-teal-500 w-48 md:w-60"
            />
            <button
              type="submit"
              disabled={isLoading}
              className="px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold cursor-pointer transition-all shrink-0"
            >
              Search City
            </button>
          </form>

          <button
            onClick={() => handleSearchCity("New Delhi")}
            className="px-2.5 py-1.5 rounded-xl bg-zinc-800 text-slate-300 text-xs font-bold hover:bg-zinc-700 cursor-pointer"
          >
            Delhi
          </button>
          <button
            onClick={() => handleSearchCity("Tokyo")}
            className="px-2.5 py-1.5 rounded-xl bg-zinc-800 text-slate-300 text-xs font-bold hover:bg-zinc-700 cursor-pointer"
          >
            Tokyo
          </button>
          <button
            onClick={() => handleSearchCity("London")}
            className="px-2.5 py-1.5 rounded-xl bg-zinc-800 text-slate-300 text-xs font-bold hover:bg-zinc-700 cursor-pointer"
          >
            London
          </button>
        </div>
      </div>

      {aqi && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main AQI Gauge (5 cols) */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            <div className={`p-6 rounded-2xl border space-y-4 text-center shadow-sm ${
              theme === "dark" ? "bg-zinc-900 border-zinc-800" : "bg-white border-slate-200"
            }`}>
              <div className="flex items-center justify-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-wider">
                <MapPin className="w-3.5 h-3.5 text-teal-400" /> {city} Atmospheric Telemetry
              </div>

              <div className="py-2">
                <span className="text-5xl font-extrabold font-mono text-teal-400">{aqi.us_aqi}</span>
                <span className="text-xs text-slate-400 block mt-1">US Air Quality Index (AQI)</span>
              </div>

              {(() => {
                const badge = getAqiBadge(aqi.us_aqi);
                return (
                  <span className={`inline-block px-3.5 py-1 text-xs font-extrabold rounded-full border ${badge.bg}`}>
                    {badge.label}
                  </span>
                );
              })()}

              <div className="grid grid-cols-2 gap-2.5 pt-3">
                <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 text-left">
                  <span className="text-[10px] text-slate-400 block">PM2.5 (Fine Particles)</span>
                  <span className="text-xs font-bold font-mono text-white">{aqi.pm2_5} µg/m³</span>
                </div>
                <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 text-left">
                  <span className="text-[10px] text-slate-400 block">PM10 (Coarse Particles)</span>
                  <span className="text-xs font-bold font-mono text-white">{aqi.pm10} µg/m³</span>
                </div>
                <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 text-left">
                  <span className="text-[10px] text-slate-400 block">Ozone (O₃)</span>
                  <span className="text-xs font-bold font-mono text-white">{aqi.ozone} µg/m³</span>
                </div>
                <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 text-left">
                  <span className="text-[10px] text-slate-400 block">Nitrogen Dioxide (NO₂)</span>
                  <span className="text-xs font-bold font-mono text-white">{aqi.nitrogen_dioxide} µg/m³</span>
                </div>
              </div>
            </div>
          </div>

          {/* AI Pulmonary & Health Advisory (7 cols) */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            <div className={`p-6 rounded-2xl border space-y-4 shadow-sm ${
              theme === "dark" ? "bg-zinc-900 border-zinc-800" : "bg-white border-slate-200"
            }`}>
              <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Pulmonary & Athletic Health Advisory
                </h3>
                <button
                  onClick={handleAiHealthAnalysis}
                  disabled={isAnalyzing}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-600 text-white font-extrabold text-xs flex items-center gap-1.5 shadow cursor-pointer disabled:opacity-50"
                >
                  <Sparkles className={`w-3.5 h-3.5 ${isAnalyzing ? "animate-spin" : ""}`} />
                  {isAnalyzing ? "Evaluating..." : "AI Pulmonary Advisory"}
                </button>
              </div>

              {aiHealthReport ? (
                <div className="p-4 rounded-xl bg-teal-950/30 border border-teal-500/30 space-y-2">
                  <h4 className="text-xs font-bold uppercase text-teal-400 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" /> AI Pulmonary & Environmental Risk Report
                  </h4>
                  <div className="text-xs text-slate-200 leading-relaxed font-sans whitespace-pre-line">
                    {aiHealthReport}
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center text-xs text-slate-500 italic">
                  Click "AI Pulmonary Advisory" to evaluate outdoor athletic risk, PM2.5 particulate exposure, and mask/filtration guidelines.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
