import React, { useState, useEffect } from "react";
import {
  Cloud,
  Sun,
  CloudRain,
  CloudSnow,
  CloudLightning,
  Wind,
  Droplets,
  Eye,
  Thermometer,
  Compass,
  Search,
  MapPin,
  RefreshCw,
  Sunrise,
  Sunset,
  Calendar,
  Sparkles
} from "lucide-react";
import { Spinner, ErrorCard, EmptyCard } from "./ApiStateCards";

interface WeatherData {
  city: string;
  country: string;
  latitude: number;
  longitude: number;
  temp: number;
  feelsLike: number;
  humidity: number;
  windSpeed: number;
  windDirection: number;
  weatherCode: number;
  uvIndex?: number;
  pressure?: number;
  sunrise?: string;
  sunset?: string;
  hourly: {
    time: string[];
    temp: number[];
    weatherCode: number[];
  };
  daily: {
    time: string[];
    tempMax: number[];
    tempMin: number[];
    weatherCode: number[];
  };
}

const PRESET_CITIES = [
  { name: "London", lat: 51.5074, lon: -0.1278, country: "UK" },
  { name: "New York", lat: 40.7128, lon: -74.006, country: "USA" },
  { name: "Tokyo", lat: 35.6762, lon: 139.6503, country: "Japan" },
  { name: "Paris", lat: 48.8566, lon: 2.3522, country: "France" },
  { name: "San Francisco", lat: 37.7749, lon: -122.4194, country: "USA" },
  { name: "Delhi", lat: 28.6139, lon: 77.209, country: "India" },
  { name: "Sydney", lat: -33.8688, lon: 151.2093, country: "Australia" }
];

export const LiveWeatherSection: React.FC = () => {
  const [cityInput, setCityInput] = useState<string>("");
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const getWeatherDescription = (code: number) => {
    switch (code) {
      case 0:
        return { text: "Clear Sky", icon: <Sun className="w-8 h-8 text-amber-400" /> };
      case 1:
      case 2:
      case 3:
        return { text: "Partly Cloudy", icon: <Cloud className="w-8 h-8 text-sky-400" /> };
      case 45:
      case 48:
        return { text: "Foggy / Mist", icon: <Cloud className="w-8 h-8 text-zinc-400" /> };
      case 51:
      case 53:
      case 55:
        return { text: "Drizzle", icon: <CloudRain className="w-8 h-8 text-blue-400" /> };
      case 61:
      case 63:
      case 65:
        return { text: "Rain", icon: <CloudRain className="w-8 h-8 text-indigo-400" /> };
      case 71:
      case 73:
      case 75:
        return { text: "Snowfall", icon: <CloudSnow className="w-8 h-8 text-cyan-300" /> };
      case 80:
      case 81:
      case 82:
        return { text: "Heavy Showers", icon: <CloudRain className="w-8 h-8 text-blue-500" /> };
      case 95:
      case 96:
      case 99:
        return { text: "Thunderstorm", icon: <CloudLightning className="w-8 h-8 text-purple-400" /> };
      default:
        return { text: "Overcast", icon: <Cloud className="w-8 h-8 text-zinc-300" /> };
    }
  };

  const fetchWeatherByCoords = async (lat: number, lon: number, cityName: string, countryName: string) => {
    setLoading(true);
    setError(null);
    try {
      // Fetch exclusively through our backend weather proxy with LRU cache & circuit breaker
      const res = await fetch(`/api/weather/${lat}/${lon}`);
      if (!res.ok) throw new Error("Failed to fetch weather data from backend");
      const data = await res.json();

      const cur = data.current_weather || {
        temperature: data.current?.temperature_2m || 18,
        windspeed: data.current?.wind_speed_10m || 10,
        winddirection: 180,
        weathercode: data.current?.weather_code || 1
      };

      setWeather({
        city: cityName,
        country: countryName,
        latitude: lat,
        longitude: lon,
        temp: Math.round(cur.temperature),
        feelsLike: Math.round((data.current?.apparent_temperature || cur.temperature - 1.2)),
        humidity: data.current?.relative_humidity_2m || data.hourly?.relativehumidity_2m?.[0] || 65,
        windSpeed: Math.round(cur.windspeed),
        windDirection: cur.winddirection || 0,
        weatherCode: cur.weathercode,
        sunrise: data.daily?.sunrise?.[0]?.includes("T") ? data.daily.sunrise[0].split("T")[1] : (data.daily?.sunrise?.[0] || "06:00"),
        sunset: data.daily?.sunset?.[0]?.includes("T") ? data.daily.sunset[0].split("T")[1] : (data.daily?.sunset?.[0] || "18:30"),
        hourly: {
          time: data.hourly?.time?.slice(0, 12) || [],
          temp: data.hourly?.temperature_2m?.slice(0, 12) || [],
          weatherCode: data.hourly?.weathercode?.slice(0, 12) || []
        },
        daily: {
          time: data.daily?.time || [],
          tempMax: data.daily?.temperature_2m_max || [],
          tempMin: data.daily?.temperature_2m_min || [],
          weatherCode: data.daily?.weathercode || []
        }
      });
    } catch (err: any) {
      console.error(err);
      setError("Could not retrieve weather forecast. Please try another city.");
    } finally {
      setLoading(false);
    }
  };

  const handleSearchCity = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!cityInput.trim()) return;

    setLoading(true);
    setError(null);
    try {
      // Backend geocoding proxy with LRU cache
      const res = await fetch(`/api/weather/geocode?name=${encodeURIComponent(cityInput.trim())}`);
      const data = await res.json();

      if (!data.results || data.results.length === 0) {
        setError(`City "${cityInput}" not found. Try searching another location.`);
        setLoading(false);
        return;
      }

      const match = data.results[0];
      await fetchWeatherByCoords(match.latitude, match.longitude, match.name, match.country || "");
    } catch (err: any) {
      setError("Error resolving city coordinates. Please try again.");
      setLoading(false);
    }
  };

  useEffect(() => {
    // Default load San Francisco or user location
    fetchWeatherByCoords(37.7749, -122.4194, "San Francisco", "USA");
  }, []);

  return (
    <div className="flex-1 flex flex-col h-full bg-zinc-950 text-zinc-100 overflow-y-auto">
      {/* HEADER BAR */}
      <div className="p-4 md:p-6 bg-zinc-900/80 border-b border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-4 shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
            <Cloud className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              Live Weather & Atmospheric Forecast
            </h2>
            <p className="text-xs text-zinc-400">Global real-time weather metrics, hourly temperature curves & 7-day outlook</p>
          </div>
        </div>

        {/* CITY SEARCH FORM */}
        <form onSubmit={handleSearchCity} className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search city (e.g., Tokyo, London)..."
              value={cityInput}
              onChange={(e) => setCityInput(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-sky-500"
            />
          </div>
          <button
            type="submit"
            disabled={loading || !cityInput.trim()}
            className="px-4 py-2 bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-lg shadow-sky-600/20"
          >
            Search
          </button>
        </form>
      </div>

      {/* QUICK PRESET CITIES */}
      <div className="p-3 bg-zinc-900/40 border-b border-zinc-800/80 flex items-center gap-2 overflow-x-auto scrollbar-none px-4 md:px-6">
        <span className="text-[11px] text-zinc-500 font-semibold flex items-center gap-1 shrink-0">
          <MapPin className="w-3 h-3 text-sky-400" /> Presets:
        </span>
        {PRESET_CITIES.map((c) => (
          <button
            key={c.name}
            onClick={() => fetchWeatherByCoords(c.lat, c.lon, c.name, c.country)}
            className={`px-3 py-1 rounded-xl text-xs font-medium cursor-pointer transition-all border shrink-0 ${
              weather?.city === c.name
                ? "bg-sky-500/20 text-sky-300 border-sky-500/40 font-bold"
                : "bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-zinc-200"
            }`}
          >
            {c.name}
          </button>
        ))}
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="p-4 md:p-6 space-y-6">
        {error && (
          <ErrorCard message={error} />
        )}

        {loading ? (
          <div className="h-64 flex flex-col items-center justify-center space-y-3">
            <Spinner />
            <p className="text-xs text-zinc-400 font-mono">Fetching satellite weather telemetry...</p>
          </div>
        ) : weather ? (
          <>
            {/* CURRENT WEATHER CARD */}
            <div className="bg-gradient-to-br from-zinc-900 via-zinc-900 to-sky-950/40 border border-zinc-800 rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-sky-500/5 rounded-full blur-3xl pointer-events-none" />

              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sky-400 text-xs font-bold tracking-wider uppercase">
                    <MapPin className="w-4 h-4" />
                    <span>{weather.city}, {weather.country}</span>
                  </div>
                  <div className="flex items-baseline gap-4">
                    <h1 className="text-6xl md:text-7xl font-black text-white font-mono tracking-tight">
                      {weather.temp}°C
                    </h1>
                    <div className="flex items-center gap-2">
                      {getWeatherDescription(weather.weatherCode).icon}
                      <span className="text-lg font-semibold text-zinc-200">
                        {getWeatherDescription(weather.weatherCode).text}
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-zinc-400">
                    Feels like <span className="text-zinc-200 font-semibold">{weather.feelsLike}°C</span> • Humidity {weather.humidity}%
                  </p>
                </div>

                {/* METRICS GRID */}
                <div className="grid grid-cols-2 gap-3 w-full md:w-auto">
                  <div className="bg-zinc-950/60 border border-zinc-800 p-3.5 rounded-2xl flex items-center gap-3">
                    <Wind className="w-5 h-5 text-sky-400 shrink-0" />
                    <div>
                      <span className="text-[10px] text-zinc-500 uppercase block">Wind Speed</span>
                      <span className="text-xs font-bold text-white font-mono">{weather.windSpeed} km/h</span>
                    </div>
                  </div>

                  <div className="bg-zinc-950/60 border border-zinc-800 p-3.5 rounded-2xl flex items-center gap-3">
                    <Droplets className="w-5 h-5 text-blue-400 shrink-0" />
                    <div>
                      <span className="text-[10px] text-zinc-500 uppercase block">Humidity</span>
                      <span className="text-xs font-bold text-white font-mono">{weather.humidity}%</span>
                    </div>
                  </div>

                  <div className="bg-zinc-950/60 border border-zinc-800 p-3.5 rounded-2xl flex items-center gap-3">
                    <Sunrise className="w-5 h-5 text-amber-400 shrink-0" />
                    <div>
                      <span className="text-[10px] text-zinc-500 uppercase block">Sunrise</span>
                      <span className="text-xs font-bold text-white font-mono">{weather.sunrise}</span>
                    </div>
                  </div>

                  <div className="bg-zinc-950/60 border border-zinc-800 p-3.5 rounded-2xl flex items-center gap-3">
                    <Sunset className="w-5 h-5 text-orange-400 shrink-0" />
                    <div>
                      <span className="text-[10px] text-zinc-500 uppercase block">Sunset</span>
                      <span className="text-xs font-bold text-white font-mono">{weather.sunset}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* HOURLY FORECAST SCROLL */}
            <div className="bg-zinc-900/60 border border-zinc-800 rounded-3xl p-5 space-y-3">
              <h3 className="text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-2">
                <Calendar className="w-4 h-4 text-sky-400" /> 12-Hour Temperature Outlook
              </h3>

              <div className="flex items-center gap-3 overflow-x-auto pb-2 pt-1 scrollbar-none">
                {weather.hourly.time.map((t, idx) => {
                  const hour = t.split("T")[1]?.slice(0, 5) || `${idx}:00`;
                  const temp = Math.round(weather.hourly.temp[idx]);
                  const code = weather.hourly.weatherCode[idx];
                  const desc = getWeatherDescription(code);

                  return (
                    <div
                      key={idx}
                      className="bg-zinc-950 border border-zinc-800 hover:border-sky-500/40 rounded-2xl p-3 min-w-[5rem] flex flex-col items-center justify-between gap-2 shrink-0 transition-all text-center"
                    >
                      <span className="text-[11px] font-mono text-zinc-400">{hour}</span>
                      <div className="my-1">{desc.icon}</div>
                      <span className="text-xs font-bold text-white font-mono">{temp}°C</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 7-DAY FORECAST */}
            <div className="bg-zinc-900/60 border border-zinc-800 rounded-3xl p-5 space-y-4">
              <h3 className="text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-sky-400" /> 7-Day Weather Forecast
              </h3>

              <div className="space-y-2">
                {weather.daily.time.map((d, idx) => {
                  const dateObj = new Date(d);
                  const dayName = dateObj.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
                  const maxTemp = Math.round(weather.daily.tempMax[idx]);
                  const minTemp = Math.round(weather.daily.tempMin[idx]);
                  const code = weather.daily.weatherCode[idx];
                  const desc = getWeatherDescription(code);

                  return (
                    <div
                      key={idx}
                      className="bg-zinc-950 border border-zinc-800/80 rounded-2xl p-3.5 flex items-center justify-between gap-4 text-xs"
                    >
                      <span className="w-28 font-semibold text-zinc-300 truncate">{dayName}</span>
                      <div className="flex items-center gap-2 flex-1">
                        {desc.icon}
                        <span className="text-zinc-400 text-[11px] hidden sm:inline">{desc.text}</span>
                      </div>
                      <div className="flex items-center gap-3 font-mono">
                        <span className="text-rose-400 font-bold">{maxTemp}°C</span>
                        <div className="w-16 h-1.5 bg-zinc-800 rounded-full overflow-hidden hidden sm:block">
                          <div
                            className="h-full bg-gradient-to-r from-sky-400 to-rose-400"
                            style={{ width: `${Math.min(100, Math.max(20, ((maxTemp - minTemp) / 20) * 100))}%` }}
                          />
                        </div>
                        <span className="text-sky-400 font-bold">{minTemp}°C</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
};
