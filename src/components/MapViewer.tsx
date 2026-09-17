import React, { useState, useEffect, useRef } from "react";
import {
  APIProvider,
  Map,
  AdvancedMarker,
  Pin,
  InfoWindow
} from "@vis.gl/react-google-maps";
import {
  MapPin,
  Compass,
  Navigation,
  Layers,
  Search,
  Sparkles,
  Wand2,
  Route as RouteIcon,
  Map as MapIcon,
  Download,
  Volume2,
  VolumeX,
  Bookmark,
  Star,
  Info,
  X,
  ChevronRight,
  Key,
  ExternalLink,
  FileCode,
  RefreshCw,
  Coffee,
  Camera,
  Utensils,
  Landmark,
  Hotel,
  Share2,
  Check,
  Globe
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import L from "leaflet";

const GOOGLE_API_KEY =
  process.env.GOOGLE_MAPS_PLATFORM_KEY ||
  (import.meta as any).env?.VITE_GOOGLE_MAPS_PLATFORM_KEY ||
  (globalThis as any).GOOGLE_MAPS_PLATFORM_KEY ||
  "";

const hasValidGoogleKey = Boolean(GOOGLE_API_KEY) && GOOGLE_API_KEY !== "YOUR_API_KEY" && GOOGLE_API_KEY.trim().length > 10;

export interface MapPlace {
  id: string;
  name: string;
  category: "cafe" | "sight" | "food" | "hotel" | "hidden_gem";
  address: string;
  lat: number;
  lng: number;
  rating?: number;
  description: string;
  aiTip?: string;
  estimatedTime?: string;
}

export interface MapItinerary {
  title: string;
  city: string;
  summary: string;
  places: MapPlace[];
  routeHighlights: string[];
}

interface MapViewerProps {
  apiKey: string; // OpenRouter / Gemini API key
  selectedModel?: string;
  theme: "light" | "dark";
  onAddLog?: (type: string, message: string) => void;
  onInsertCode?: (path: string, content: string) => void;
}

export type MapProvider = "osm" | "carto_dark" | "carto_light" | "esri_satellite" | "opentopo" | "google";

const MAP_PROVIDERS: { id: MapProvider; name: string; url?: string; attribution?: string; isGoogle?: boolean }[] = [
  {
    id: "osm",
    name: "OpenStreetMap",
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  },
  {
    id: "carto_dark",
    name: "CartoDB Dark",
    url: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
    attribution: '&copy; <a href="https://carto.com/">CARTO</a>'
  },
  {
    id: "carto_light",
    name: "CartoDB Positron",
    url: "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
    attribution: '&copy; <a href="https://carto.com/">CARTO</a>'
  },
  {
    id: "esri_satellite",
    name: "Esri Satellite",
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    attribution: "Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community"
  },
  {
    id: "opentopo",
    name: "OpenTopo Terrain",
    url: "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
    attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a>'
  },
  {
    id: "google",
    name: "Google Maps Platform",
    isGoogle: true
  }
];

const SAMPLE_CITIES = [
  { name: "Tokyo, Japan", lat: 35.6762, lng: 139.6503, zoom: 12 },
  { name: "San Francisco, USA", lat: 37.7749, lng: -122.4194, zoom: 12 },
  { name: "Paris, France", lat: 48.8566, lng: 2.3522, zoom: 12 },
  { name: "London, UK", lat: 51.5074, lng: -0.1278, zoom: 12 },
  { name: "Kyoto, Japan", lat: 35.0116, lng: 135.7681, zoom: 12 },
  { name: "New York, USA", lat: 40.7128, lng: -74.006, zoom: 12 }
];

const QUICK_PROMPTS = [
  "A 1-day specialty coffee & hidden ramen tour in Tokyo with scenic photo spots",
  "Top 5 historical landmarks & parks in Kyoto for a peaceful afternoon walk",
  "Art galleries, vintage bookstores, and cozy cafes in Paris Saint-Germain",
  "San Francisco tech history, waterfront viewpoints, and local sourdough bakeries",
  "An evening food lovers itinerary in New York Greenwich Village"
];

const PRESET_PLACES: MapPlace[] = [
  {
    id: "p1",
    name: "Shibuya Sky & Viewpoint",
    category: "sight",
    address: "2 Chome-24-12 Shibuya, Tokyo",
    lat: 35.6585,
    lng: 139.7013,
    rating: 4.8,
    description: "Panoramic 360-degree open-air observation deck over Shibuya Crossing.",
    aiTip: "Visit 30 minutes before sunset for dramatic golden hour lighting.",
    estimatedTime: "1.5 hours"
  },
  {
    id: "p2",
    name: "Fuglen Tokyo Specialty Coffee",
    category: "cafe",
    address: "1 Chome-16-11 Tomigaya, Shibuya, Tokyo",
    lat: 35.6681,
    lng: 139.6912,
    rating: 4.7,
    description: "Vintage Scandinavian coffee bar famous for single-origin filter roasts.",
    aiTip: "Try their signature Nordic light roast espresso and cardamom cinnamon bun.",
    estimatedTime: "45 mins"
  },
  {
    id: "p3",
    name: "Ichiran Ramen Shibuya",
    category: "food",
    address: "1 Chome-22-7 Jinnan, Shibuya, Tokyo",
    lat: 35.6619,
    lng: 139.7006,
    rating: 4.6,
    description: "World-famous solo dining booth Tonkotsu ramen experience.",
    aiTip: "Customize noodle firmness to 'Extra Hard' and add secret red garlic sauce.",
    estimatedTime: "1 hour"
  },
  {
    id: "p4",
    name: "Meiji Jingu Shrine",
    category: "sight",
    address: "1-1 Yoyogikamizonocho, Shibuya, Tokyo",
    lat: 35.6764,
    lng: 139.6993,
    rating: 4.9,
    description: "Serene Shinto shrine enveloped in a dense 170-acre evergreen forest.",
    aiTip: "Walk through the massive cedar Torii gates for instant tranquil quietness.",
    estimatedTime: "2 hours"
  }
];

export const MapViewer: React.FC<MapViewerProps> = ({
  apiKey,
  selectedModel,
  theme,
  onAddLog,
  onInsertCode
}) => {
  const [currentCenter, setCurrentCenter] = useState({ lat: 35.6762, lng: 139.6503 });
  const [currentZoom, setCurrentZoom] = useState(12);
  const [selectedCity, setSelectedCity] = useState("Tokyo, Japan");
  const [provider, setProvider] = useState<MapProvider>("osm");

  const [promptInput, setPromptInput] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [itinerary, setItinerary] = useState<MapItinerary | null>({
    title: "Tokyo Specialty Coffee & Shibuya Highlights",
    city: "Tokyo, Japan",
    summary: "A curated 1-day journey blending panoramic skyline views, world-class specialty coffee, and serene forest shrines.",
    places: PRESET_PLACES,
    routeHighlights: [
      "Start at Meiji Jingu for morning tranquility",
      "Grab light-roast coffee at Fuglen Tomigaya",
      "Head to Shibuya Sky for golden hour sunset",
      "Finish with warm Tonkotsu ramen in Shibuya"
    ]
  });

  const [selectedPlace, setSelectedPlace] = useState<MapPlace | null>(PRESET_PLACES[0]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [insertedCode, setInsertedCode] = useState(false);
  const [savedBookmarks, setSavedBookmarks] = useState<string[]>([]);
  const [googleMapType, setGoogleMapType] = useState<"roadmap" | "satellite" | "terrain" | "hybrid">("roadmap");

  // Leaflet Container Reference
  const leafletContainerRef = useRef<HTMLDivElement | null>(null);
  const leafletMapRef = useRef<L.Map | null>(null);
  const leafletMarkersRef = useRef<L.Marker[]>([]);
  const leafletTileLayerRef = useRef<L.TileLayer | null>(null);

  // Dynamically load Leaflet CSS
  useEffect(() => {
    if (!document.getElementById("leaflet-css")) {
      const link = document.createElement("link");
      link.id = "leaflet-css";
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);
    }
  }, []);

  // Initialize and update Leaflet Map for non-Google providers
  useEffect(() => {
    if (provider === "google") return;
    if (!leafletContainerRef.current) return;

    const currentProviderObj = MAP_PROVIDERS.find(p => p.id === provider) || MAP_PROVIDERS[0];

    if (!leafletMapRef.current) {
      const map = L.map(leafletContainerRef.current, {
        center: [currentCenter.lat, currentCenter.lng],
        zoom: currentZoom,
        zoomControl: true
      });

      leafletMapRef.current = map;
    } else {
      leafletMapRef.current.setView([currentCenter.lat, currentCenter.lng], currentZoom);
    }

    // Update tile layer
    if (leafletTileLayerRef.current) {
      leafletMapRef.current.removeLayer(leafletTileLayerRef.current);
    }

    if (currentProviderObj.url) {
      const tileLayer = L.tileLayer(currentProviderObj.url, {
        attribution: currentProviderObj.attribution || "",
        maxZoom: 19
      }).addTo(leafletMapRef.current);
      leafletTileLayerRef.current = tileLayer;
    }

    // Clear existing markers
    leafletMarkersRef.current.forEach(m => m.remove());
    leafletMarkersRef.current = [];

    // Add itinerary markers
    if (itinerary && itinerary.places) {
      itinerary.places.forEach((place, idx) => {
        const isSelected = selectedPlace?.id === place.id;

        // Custom HTML marker pin
        const customIcon = L.divIcon({
          className: "custom-leaflet-marker",
          html: `<div style="
            background: ${isSelected ? '#06b6d4' : '#3b82f6'};
            color: white;
            font-weight: bold;
            font-size: 11px;
            width: 28px;
            height: 28px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            border: 2px solid white;
            box-shadow: 0 4px 12px rgba(0,0,0,0.4);
            cursor: pointer;
            transform: ${isSelected ? 'scale(1.2)' : 'scale(1.0)'};
            transition: all 0.2s ease;
          ">${idx + 1}</div>`,
          iconSize: [28, 28],
          iconAnchor: [14, 14]
        });

        const marker = L.marker([place.lat, place.lng], { icon: customIcon })
          .addTo(leafletMapRef.current!)
          .bindTooltip(`<b>${place.name}</b><br/>${place.category.toUpperCase()}`, { direction: "top", offset: [0, -10] });

        marker.on("click", () => {
          setSelectedPlace(place);
          setCurrentCenter({ lat: place.lat, lng: place.lng });
        });

        leafletMarkersRef.current.push(marker);
      });
    }
  }, [provider, itinerary, selectedPlace, currentCenter, currentZoom]);

  // Handle City Change
  const handleCitySelect = (cityObj: typeof SAMPLE_CITIES[0]) => {
    setSelectedCity(cityObj.name);
    setCurrentCenter({ lat: cityObj.lat, lng: cityObj.lng });
    setCurrentZoom(cityObj.zoom);
    if (leafletMapRef.current && provider !== "google") {
      leafletMapRef.current.setView([cityObj.lat, cityObj.lng], cityObj.zoom);
    }
  };

  // AI Itinerary Generator using OpenRouter / Gemini
  const handleGenerateAIItinerary = async () => {
    const input = promptInput.trim() || `Explore the best places in ${selectedCity}`;
    setIsGenerating(true);
    if (onAddLog) onAddLog("map", `Generating AI travel route for: "${input}"...`);

    try {
      const localToken = typeof window !== "undefined" ? (localStorage.getItem("app_auth_token") || "") : "";
      const authHeader = apiKey ? `Bearer ${apiKey}` : (localToken ? `Bearer ${localToken}` : "");

      const res = await fetch("/api/openrouter/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": authHeader
        },
        body: JSON.stringify({
          model: selectedModel || "google/gemini-2.5-flash",
          messages: [
            {
              role: "system",
              content: `You are an expert AI travel planner and map guide. Given a user travel request, generate a JSON object matching this TypeScript format strictly (no markdown formatting outside JSON):
{
  "title": "Short catchy title",
  "city": "City name",
  "summary": "1-2 sentence overview of the journey",
  "places": [
    {
      "id": "unique_id",
      "name": "Place name",
      "category": "cafe" | "sight" | "food" | "hotel" | "hidden_gem",
      "address": "Full street address",
      "lat": number (accurate float lat coordinate),
      "lng": number (accurate float lng coordinate),
      "rating": number (e.g. 4.8),
      "description": "Short description of what makes this special",
      "aiTip": "Actionable insider travel tip",
      "estimatedTime": "e.g. 45 mins"
    }
  ],
  "routeHighlights": ["Highlight 1", "Highlight 2", "Highlight 3"]
}
Provide 4 to 6 accurate, exciting places with real GPS coordinates near the requested location.`
            },
            {
              role: "user",
              content: `Location/Request: ${input}. Base city: ${selectedCity}`
            }
          ]
        })
      });

      if (res.ok) {
        const data = await res.json();
        const rawContent = data.choices?.[0]?.message?.content || "";
        const cleanJsonStr = rawContent.replace(/```json/g, "").replace(/```/g, "").trim();
        const parsed: MapItinerary = JSON.parse(cleanJsonStr);

        if (parsed && parsed.places && parsed.places.length > 0) {
          setItinerary(parsed);
          setSelectedPlace(parsed.places[0]);
          setCurrentCenter({ lat: parsed.places[0].lat, lng: parsed.places[0].lng });
          setCurrentZoom(13);
          if (onAddLog) onAddLog("map", `AI map route successfully generated: ${parsed.title}!`);
        }
      }
    } catch (err: any) {
      console.warn("AI Itinerary Generation Fallback:", err);
      // Generate fallback local places around city
      const fallbackPlaces: MapPlace[] = [
        {
          id: `p_${Date.now()}_1`,
          name: `${selectedCity.split(",")[0]} Landmark Tower`,
          category: "sight",
          address: `Center of ${selectedCity}`,
          lat: currentCenter.lat + 0.005,
          lng: currentCenter.lng + 0.005,
          rating: 4.8,
          description: `Must-see architectural viewpoint in ${selectedCity}.`,
          aiTip: "Visit during early morning to beat the crowds.",
          estimatedTime: "1 hour"
        },
        {
          id: `p_${Date.now()}_2`,
          name: "Artisan Roastery & Lounge",
          category: "cafe",
          address: `Arts District, ${selectedCity}`,
          lat: currentCenter.lat - 0.004,
          lng: currentCenter.lng - 0.003,
          rating: 4.7,
          description: "Locally renowned micro-roaster with artisanal pour-overs.",
          aiTip: "Pair your coffee with their fresh organic pastries.",
          estimatedTime: "45 mins"
        },
        {
          id: `p_${Date.now()}_3`,
          name: "Gourmet Street Food Haven",
          category: "food",
          address: `Market Square, ${selectedCity}`,
          lat: currentCenter.lat + 0.003,
          lng: currentCenter.lng - 0.006,
          rating: 4.9,
          description: "Vibrant culinary street food hub featuring regional specialties.",
          aiTip: "Try the chef special tasting platter.",
          estimatedTime: "1.5 hours"
        }
      ];

      setItinerary({
        title: `AI Exploration of ${selectedCity}`,
        city: selectedCity,
        summary: `Custom curated itinerary for ${selectedCity} with top rated local gems.`,
        places: fallbackPlaces,
        routeHighlights: ["Morning viewpoint", "Artisan coffee break", "Gourmet lunch"]
      });
      setSelectedPlace(fallbackPlaces[0]);
    } finally {
      setIsGenerating(false);
    }
  };

  // Text to Speech Voice Assistant
  const handleToggleSpeech = (text: string) => {
    if (isSpeaking) {
      window.speechSynthesis?.cancel();
      setIsSpeaking(false);
      return;
    }

    if (!window.speechSynthesis) return;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  const handleToggleBookmark = (id: string) => {
    setSavedBookmarks(prev =>
      prev.includes(id) ? prev.filter(b => b !== id) : [...prev, id]
    );
  };

  // Export HTML Map to Workspace
  const handleInsertMapToWorkspace = () => {
    if (!onInsertCode || !itinerary) return;

    const code = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${itinerary.title} - AI Map Guide</title>
  <style>
    body { font-family: system-ui, sans-serif; margin: 0; padding: 2rem; background: #0f172a; color: #f8fafc; }
    .card { background: #1e293b; border-radius: 1rem; padding: 1.5rem; max-width: 800px; margin: 0 auto; border: 1px solid #334155; }
    h1 { color: #38bdf8; margin-top: 0; }
    .place { background: #0f172a; border-radius: 0.75rem; padding: 1rem; margin-top: 1rem; border-left: 4px solid #38bdf8; }
    .badge { display: inline-block; background: #0284c7; color: white; padding: 0.2rem 0.6rem; border-radius: 9999px; font-size: 0.75rem; font-weight: bold; }
    .tip { background: #1e1b4b; color: #c7d2fe; padding: 0.5rem 0.75rem; border-radius: 0.5rem; font-size: 0.85rem; margin-top: 0.5rem; }
  </style>
</head>
<body>
  <div class="card">
    <h1>📍 ${itinerary.title}</h1>
    <p><em>${itinerary.summary}</em></p>
    
    <h2>Route Highlights</h2>
    <ul>
      ${itinerary.routeHighlights.map(h => `<li>${h}</li>`).join("")}
    </ul>

    <h2>Stopping Points</h2>
    ${itinerary.places.map(p => `
      <div class="place">
        <span class="badge">${p.category.toUpperCase()}</span>
        <h3>${p.name} ⭐ ${p.rating || '4.8'}</h3>
        <p>📍 ${p.address} (${p.lat}, ${p.lng})</p>
        <p>${p.description}</p>
        <div class="tip">💡 AI Travel Tip: ${p.aiTip}</div>
      </div>
    `).join("")}
  </div>
</body>
</html>`;

    onInsertCode(`ai_map_itinerary_${Date.now().toString().slice(-4)}.html`, code);
    setInsertedCode(true);
    setTimeout(() => setInsertedCode(false), 2000);
  };

  const categoryIcons = {
    sight: <Camera className="w-4 h-4 text-emerald-400" />,
    cafe: <Coffee className="w-4 h-4 text-amber-400" />,
    food: <Utensils className="w-4 h-4 text-rose-400" />,
    hotel: <Hotel className="w-4 h-4 text-indigo-400" />,
    hidden_gem: <Sparkles className="w-4 h-4 text-cyan-400" />
  };

  return (
    <div className={`h-full w-full flex flex-col overflow-hidden ${
      theme === "dark" ? "bg-[#0a0e17] text-slate-100" : "bg-slate-50 text-slate-900"
    }`}>
      {/* Top Controls Header */}
      <div className={`px-6 py-3.5 border-b flex flex-wrap items-center justify-between gap-4 shrink-0 ${
        theme === "dark" ? "bg-[#101622] border-zinc-800" : "bg-white border-slate-200"
      }`}>
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-cyan-600 via-blue-600 to-indigo-600 text-white shadow-lg shadow-cyan-500/20">
            <Compass className="w-5 h-5 animate-spin-slow" />
          </div>
          <div>
            <h1 className="text-base font-bold tracking-tight flex items-center gap-2">
              Multi-Provider AI Smart Map
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                {MAP_PROVIDERS.find(p => p.id === provider)?.name || "OpenStreetMap"}
              </span>
            </h1>
            <p className="text-xs text-slate-400 font-medium">
              OpenStreetMap, CartoDB, Esri Satellite, OpenTopo & Google Maps with AI route generation
            </p>
          </div>
        </div>

        {/* Map Provider Selector */}
        <div className="flex items-center gap-1 bg-slate-200 dark:bg-zinc-800 p-1 rounded-xl border border-slate-300 dark:border-zinc-700 text-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase px-2 flex items-center gap-1">
            <Globe className="w-3 h-3 text-cyan-400" /> Map Provider:
          </span>
          {MAP_PROVIDERS.map((p) => (
            <button
              key={p.id}
              onClick={() => setProvider(p.id)}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                provider === p.id
                  ? "bg-cyan-600 text-white shadow-sm"
                  : "text-slate-600 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              {p.name}
            </button>
          ))}
        </div>

        {/* City Fast Switches */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-xl no-scrollbar">
          <span className="text-[11px] font-bold text-slate-400 uppercase mr-1">City:</span>
          {SAMPLE_CITIES.map((c) => (
            <button
              key={c.name}
              onClick={() => handleCitySelect(c)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition-all cursor-pointer ${
                selectedCity === c.name
                  ? "bg-cyan-600 text-white shadow-md shadow-cyan-500/20"
                  : theme === "dark"
                  ? "bg-zinc-800/80 hover:bg-zinc-800 text-zinc-300 border border-zinc-700/60"
                  : "bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200"
              }`}
            >
              {c.name.split(",")[0]}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid Layout */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
        {/* Left Sidebar: AI Route Planner & Places List */}
        <div className={`lg:col-span-5 xl:col-span-4 border-r flex flex-col h-full overflow-hidden ${
          theme === "dark" ? "bg-[#0d121d] border-zinc-800" : "bg-white border-slate-200"
        }`}>
          {/* AI Generator Box */}
          <div className="p-4 border-b border-zinc-800/80 space-y-3 shrink-0">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Wand2 className="w-3.5 h-3.5 text-cyan-400" />
                AI Smart Itinerary Builder
              </label>
              <span className="text-[10px] text-cyan-400 font-mono">Gemini 2.5 Flash</span>
            </div>

            <div className="relative">
              <input
                type="text"
                value={promptInput}
                onChange={(e) => setPromptInput(e.target.value)}
                placeholder="Ask AI e.g. 'Coffee & hidden views in Tokyo'..."
                className={`w-full p-2.5 pl-3 pr-20 rounded-xl border text-xs font-medium focus:outline-none transition-all ${
                  theme === "dark"
                    ? "bg-[#141b2b] border-zinc-800 text-slate-100 focus:border-cyan-500"
                    : "bg-slate-50 border-slate-300 text-slate-900 focus:border-cyan-500"
                }`}
                onKeyDown={(e) => e.key === "Enter" && handleGenerateAIItinerary()}
              />
              <button
                onClick={handleGenerateAIItinerary}
                disabled={isGenerating}
                className="absolute right-1.5 top-1.5 bottom-1.5 px-3 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-1 disabled:opacity-50"
              >
                {isGenerating ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                <span>{isGenerating ? "Planning..." : "AI Route"}</span>
              </button>
            </div>

            {/* Quick Prompts */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-[10px]">
              {QUICK_PROMPTS.map((qp, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setPromptInput(qp);
                  }}
                  className="shrink-0 px-2.5 py-1 rounded-lg bg-zinc-800/60 hover:bg-zinc-800 text-slate-300 border border-zinc-700/50 truncate max-w-[200px] cursor-pointer"
                >
                  "{qp.slice(0, 30)}..."
                </button>
              ))}
            </div>
          </div>

          {/* Current Itinerary Details */}
          {itinerary && (
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-bold text-slate-100">{itinerary.title}</h2>
                  <div className="flex items-center gap-1.5">
                    {onInsertCode && (
                      <button
                        onClick={handleInsertMapToWorkspace}
                        className="p-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 text-[10px] font-bold border border-cyan-500/30 transition-all cursor-pointer flex items-center gap-1"
                        title="Save map itinerary to code workspace"
                      >
                        {insertedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <FileCode className="w-3.5 h-3.5" />}
                        <span>{insertedCode ? "Saved" : "Export HTML"}</span>
                      </button>
                    )}
                  </div>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">{itinerary.summary}</p>
              </div>

              {/* Route Highlights */}
              <div className="p-3 rounded-xl bg-cyan-950/30 border border-cyan-800/40 space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1">
                  <RouteIcon className="w-3 h-3" />
                  Suggested Order & Highlights
                </span>
                <ul className="text-xs text-cyan-200/90 space-y-1 list-disc list-inside font-medium">
                  {itinerary.routeHighlights.map((hl, i) => (
                    <li key={i}>{hl}</li>
                  ))}
                </ul>
              </div>

              {/* Places Cards List */}
              <div className="space-y-2.5 pt-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Stopping Points ({itinerary.places.length})
                </span>

                {itinerary.places.map((place, index) => {
                  const isSelected = selectedPlace?.id === place.id;
                  const isBookmarked = savedBookmarks.includes(place.id);

                  return (
                    <motion.div
                      key={place.id}
                      onClick={() => {
                        setSelectedPlace(place);
                        setCurrentCenter({ lat: place.lat, lng: place.lng });
                        setCurrentZoom(14);
                        if (leafletMapRef.current && provider !== "google") {
                          leafletMapRef.current.setView([place.lat, place.lng], 14);
                        }
                      }}
                      className={`p-3.5 rounded-2xl border transition-all cursor-pointer space-y-2 ${
                        isSelected
                          ? "bg-cyan-600/15 border-cyan-500 ring-1 ring-cyan-500 text-white"
                          : theme === "dark"
                          ? "bg-[#121929] border-zinc-800 hover:border-zinc-700 text-slate-200"
                          : "bg-slate-50 border-slate-200 hover:border-slate-300 text-slate-800"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-full bg-cyan-600/30 text-cyan-300 border border-cyan-500/40 text-xs font-bold flex items-center justify-center shrink-0">
                            {index + 1}
                          </span>
                          <div>
                            <h3 className="text-xs font-bold line-clamp-1">{place.name}</h3>
                            <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                              <span className="capitalize text-cyan-300 flex items-center gap-1">
                                {categoryIcons[place.category]}
                                {place.category.replace("_", " ")}
                              </span>
                              <span>• {place.estimatedTime || "30 mins"}</span>
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleBookmark(place.id);
                          }}
                          className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                            isBookmarked
                              ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                              : "text-slate-400 hover:text-white"
                          }`}
                        >
                          <Bookmark className="w-3.5 h-3.5" fill={isBookmarked ? "currentColor" : "none"} />
                        </button>
                      </div>

                      <p className="text-[11px] text-slate-300 line-clamp-2 leading-snug">{place.description}</p>

                      {place.aiTip && (
                        <div className="p-2 rounded-xl bg-indigo-950/40 border border-indigo-800/40 text-[10px] text-indigo-300 flex items-start gap-1.5">
                          <Sparkles className="w-3 h-3 text-indigo-400 shrink-0 mt-0.5" />
                          <span><strong>AI Tip:</strong> {place.aiTip}</span>
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Right Pane: Map Render + Detailed Selected Location */}
        <div className="lg:col-span-7 xl:col-span-8 relative h-full flex flex-col overflow-hidden bg-black">
          {provider === "google" ? (
            !hasValidGoogleKey ? (
              <div className="flex-1 flex flex-col items-center justify-center p-6 bg-[#090d16] text-slate-100 overflow-y-auto">
                <div className="max-w-md w-full text-center space-y-4 p-8 rounded-3xl border border-zinc-800 bg-[#111827] shadow-2xl">
                  <div className="w-16 h-16 rounded-full bg-cyan-500/10 text-cyan-400 flex items-center justify-center mx-auto border border-cyan-500/20">
                    <MapIcon className="w-8 h-8" />
                  </div>

                  <div className="space-y-1">
                    <h2 className="text-lg font-bold">Google Maps Key Required</h2>
                    <p className="text-xs text-slate-400">
                      To render Google Maps tiles, add your API key secret in AI Studio, or switch to OpenStreetMap / Carto / Esri above (No API key needed!).
                    </p>
                  </div>

                  <div className="flex justify-center pt-2">
                    <button
                      onClick={() => setProvider("osm")}
                      className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition-all shadow-lg cursor-pointer"
                    >
                      Switch to OpenStreetMap (Free, No Key)
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex-1 relative w-full h-full min-h-[400px]">
                <APIProvider apiKey={GOOGLE_API_KEY} version="weekly">
                  <Map
                    center={currentCenter}
                    zoom={currentZoom}
                    mapId="DEMO_MAP_ID"
                    mapTypeId={googleMapType}
                    internalUsageAttributionIds={["gmp_mcp_codeassist_v1_aistudio"]}
                    style={{ width: "100%", height: "100%" }}
                    onCameraChanged={(ev) => {
                      setCurrentCenter(ev.detail.center);
                      setCurrentZoom(ev.detail.zoom);
                    }}
                  >
                    {itinerary?.places.map((place, idx) => (
                      <AdvancedMarker
                        key={place.id}
                        position={{ lat: place.lat, lng: place.lng }}
                        onClick={() => setSelectedPlace(place)}
                        title={place.name}
                      >
                        <Pin
                          background={selectedPlace?.id === place.id ? "#06b6d4" : "#3b82f6"}
                          glyphColor="#ffffff"
                          borderColor="#ffffff"
                        />
                      </AdvancedMarker>
                    ))}

                    {selectedPlace && (
                      <InfoWindow
                        position={{ lat: selectedPlace.lat, lng: selectedPlace.lng }}
                        onCloseClick={() => setSelectedPlace(null)}
                      >
                        <div className="p-2 text-slate-900 max-w-xs space-y-1">
                          <div className="text-xs font-bold text-cyan-800">{selectedPlace.name}</div>
                          <div className="text-[11px] text-slate-600">{selectedPlace.address}</div>
                          <p className="text-[11px] leading-snug">{selectedPlace.description}</p>
                        </div>
                      </InfoWindow>
                    )}
                  </Map>
                </APIProvider>

                <div className="absolute top-4 left-4 z-10 flex items-center gap-1 bg-black/70 backdrop-blur-md p-1.5 rounded-xl border border-white/10 shadow-lg text-xs">
                  {(["roadmap", "satellite", "terrain", "hybrid"] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() => setGoogleMapType(t)}
                      className={`px-2.5 py-1 rounded-lg font-bold capitalize transition-all cursor-pointer ${
                        googleMapType === t
                          ? "bg-cyan-600 text-white"
                          : "text-slate-300 hover:text-white hover:bg-white/10"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            )
          ) : (
            /* Leaflet OpenStreetMap / Carto / Esri Canvas */
            <div className="flex-1 relative w-full h-full min-h-[400px]">
              <div ref={leafletContainerRef} className="w-full h-full z-0" />
            </div>
          )}

          {/* Bottom Floating Bar: Selected Place AI Guide Card */}
          {selectedPlace && (
            <div className="p-4 bg-[#101622] border-t border-zinc-800 flex flex-wrap items-center justify-between gap-4 shrink-0 shadow-2xl z-20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-cyan-600/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center shrink-0 font-bold">
                  {categoryIcons[selectedPlace.category]}
                </div>

                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    {selectedPlace.name}
                    <span className="text-amber-400 text-xs font-semibold flex items-center gap-0.5">
                      <Star className="w-3 h-3 fill-amber-400" /> {selectedPlace.rating || 4.8}
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-cyan-400" />
                    {selectedPlace.address}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() =>
                    handleToggleSpeech(
                      `${selectedPlace.name}. ${selectedPlace.description}. AI Travel Tip: ${selectedPlace.aiTip || ""}`
                    )
                  }
                  className={`px-3 py-2 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer ${
                    isSpeaking
                      ? "bg-rose-500 text-white animate-pulse"
                      : "bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 border border-cyan-500/30"
                  }`}
                >
                  {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
                  <span>{isSpeaking ? "Stop Voice" : "Listen AI Voice"}</span>
                </button>

                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                    `${selectedPlace.name} ${selectedPlace.address}`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold border border-zinc-700 transition-all flex items-center gap-1.5"
                >
                  <Navigation className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Google Maps</span>
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
