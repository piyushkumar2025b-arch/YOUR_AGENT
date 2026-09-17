import React, { useState, useEffect, useRef } from "react";
import {
  Download,
  Search,
  Image as ImageIcon,
  Film,
  Volume2,
  Music,
  Play,
  Pause,
  Copy,
  Check,
  Sparkles,
  ExternalLink,
  RefreshCw,
  Maximize2,
  X,
  Zap,
  Globe,
  Tag,
  CheckCircle2,
  AlertCircle,
  FileText,
  Link as LinkIcon,
  Sliders
} from "lucide-react";
import { UniversalUrlAssetExtractor } from "./UniversalUrlAssetExtractor";
import { ImageFormatConverterUtility } from "./ImageFormatConverterUtility";

type MediaCategory = "photos" | "gifs" | "sounds" | "tunes" | "direct-url" | "converter";

export interface MediaItem {
  id: string;
  title: string;
  category: MediaCategory;
  previewUrl: string;
  downloadUrl: string;
  author?: string;
  tags?: string[];
  dimensions?: string;
  duration?: string;
  fileSize?: string;
  fileType?: string;
  license?: string;
}

export const MediaAssetsDownloader: React.FC<{ theme?: "light" | "dark" }> = ({ theme = "dark" }) => {
  const [activeCategory, setActiveCategory] = useState<MediaCategory>("photos");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [items, setItems] = useState<MediaItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [downloadStatusMsg, setDownloadStatusMsg] = useState<string | null>(null);
  const [previewMedia, setPreviewMedia] = useState<MediaItem | null>(null);

  // Audio playback state
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
  const [audioProgress, setAudioProgress] = useState<number>(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    fetchMediaResults(activeCategory, searchQuery);
  }, [activeCategory]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchMediaResults(activeCategory, searchQuery);
  };

  const fetchMediaResults = async (category: MediaCategory, query: string) => {
    setIsLoading(true);
    const q = query.trim() || getDefaultQuery(category);

    try {
      // Query backend proxy for reliable live media search (Wikimedia Commons, Jamendo, Giphy)
      const proxyRes = await fetch(`/api/media/search?category=${encodeURIComponent(category)}&query=${encodeURIComponent(q)}`).catch(() => null);
      if (proxyRes && proxyRes.ok) {
        const proxyData = await proxyRes.json();
        if (proxyData.items && Array.isArray(proxyData.items) && proxyData.items.length > 0) {
          setItems(proxyData.items);
          setIsLoading(false);
          return;
        }
      }

      // Direct client fallback
      if (category === "photos") {
        const wikimediaRes = await fetch(
          `https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent(
            q + " filetype:bitmap"
          )}&gsrlimit=20&prop=imageinfo&iiprop=url|size|mime&format=json&origin=*`
        );
        if (wikimediaRes.ok) {
          const data = await wikimediaRes.json();
          if (data.query && data.query.pages) {
            const pages = Object.values(data.query.pages);
            const formatted: MediaItem[] = pages
              .map((p: any) => {
                const info = p.imageinfo?.[0];
                if (!info) return null;
                const title = p.title.replace(/^File:/, "").replace(/\.[^/.]+$/, "");
                return {
                  id: `photo-${p.pageid}`,
                  title: title || `${q} HD Photo`,
                  category: "photos" as MediaCategory,
                  previewUrl: info.url,
                  downloadUrl: info.url,
                  author: "Wikimedia Commons (Public Domain / CC)",
                  tags: [q, "photo", "hd", "public"],
                  dimensions: `${info.width || 1920}x${info.height || 1080}`,
                  fileSize: `${((info.size || 2500000) / (1024 * 1024)).toFixed(1)} MB`,
                  fileType: info.mime?.split("/")[1]?.toUpperCase() || "JPG",
                  license: "CC BY-SA 4.0 / Public Domain"
                };
              })
              .filter(Boolean) as MediaItem[];

            if (formatted.length > 0) {
              setItems(formatted);
              setIsLoading(false);
              return;
            }
          }
        }
        setItems(getFallbackPhotos(q));
      } else if (category === "gifs") {
        setItems(getFallbackGifs(q));
      } else if (category === "sounds") {
        setItems(getFallbackSounds(q));
      } else if (category === "tunes") {
        setItems(getFallbackTunes(q));
      }
    } catch (err) {
      console.error("Media fetch error", err);
      if (category === "photos") setItems(getFallbackPhotos(q));
      else if (category === "gifs") setItems(getFallbackGifs(q));
      else if (category === "sounds") setItems(getFallbackSounds(q));
      else setItems(getFallbackTunes(q));
    } finally {
      setIsLoading(false);
    }
  };

  const getDefaultQuery = (cat: MediaCategory) => {
    if (cat === "photos") return "cyberpunk technology nature urban";
    if (cat === "gifs") return "developer coding celebration AI";
    if (cat === "sounds") return "click notification interface synthesized";
    return "lofi chill ambient beats synthwave";
  };

  const getPresetQueries = (cat: MediaCategory) => {
    if (cat === "photos") return ["Cyberpunk", "Space & Galaxy", "Coding Setup", "4K Landscapes", "Minimalist Desk"];
    if (cat === "gifs") return ["Developer", "Matrix Code", "Celebration", "AI Robot", "Retro Arcade"];
    if (cat === "sounds") return ["UI Click", "Cyber Chime", "Laser Beam", "Warning Alarm", "8-Bit Retro"];
    return ["Lo-Fi Chill", "Synthwave 80s", "Ambient Rain", "Cyber Beats", "Acoustic Zen"];
  };

  const handleCopyLink = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDownloadFile = async (item: MediaItem) => {
    setDownloadingId(item.id);
    setDownloadStatusMsg(`Initiating download for ${item.title}...`);

    const cleanTitle = item.title.replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 35);
    const ext = item.fileType ? item.fileType.toLowerCase() : item.category === "photos" ? "jpg" : item.category === "gifs" ? "gif" : "mp3";
    const filename = `${cleanTitle}.${ext}`;

    try {
      // Primary: Use Server Download Proxy Endpoint
      const proxyUrl = `/api/media/download?url=${encodeURIComponent(item.downloadUrl)}&filename=${encodeURIComponent(filename)}`;
      
      const link = document.createElement("a");
      link.href = proxyUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setDownloadStatusMsg(`✅ Downloading ${filename} via Proxy Service!`);
      setTimeout(() => setDownloadStatusMsg(null), 4000);
    } catch (err) {
      console.warn("Proxy download failed, attempting blob fallback...", err);
      try {
        const response = await fetch(item.downloadUrl, { mode: "cors" });
        const blob = await response.blob();
        const blobUrl = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = blobUrl;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(blobUrl);

        setDownloadStatusMsg(`✅ Downloaded ${filename} cleanly!`);
        setTimeout(() => setDownloadStatusMsg(null), 4000);
      } catch (blobErr) {
        // Direct Window Fallback
        window.open(item.downloadUrl, "_blank");
        setDownloadStatusMsg(`Opened media URL directly in new window.`);
        setTimeout(() => setDownloadStatusMsg(null), 4000);
      }
    } finally {
      setDownloadingId(null);
    }
  };

  const toggleAudioPlay = (item: MediaItem) => {
    if (playingAudioId === item.id) {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      setPlayingAudioId(null);
      setAudioProgress(0);
    } else {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      const audio = new Audio(item.downloadUrl);
      audioRef.current = audio;
      audio.ontimeupdate = () => {
        if (audio.duration) {
          setAudioProgress((audio.currentTime / audio.duration) * 100);
        }
      };
      audio.play().catch((e) => console.error("Audio play error", e));
      audio.onended = () => {
        setPlayingAudioId(null);
        setAudioProgress(0);
      };
      setPlayingAudioId(item.id);
    }
  };

  return (
    <div className={`h-full w-full flex-1 flex flex-col overflow-hidden p-4 md:p-6 transition-colors ${
      theme === "dark" ? "bg-zinc-950 text-white" : "bg-slate-50 text-slate-900"
    }`}>
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shadow-sm">
              <Download className="w-5 h-5 animate-bounce text-cyan-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold tracking-tight">Public Media Assets Downloader</h2>
                <span className="px-2 py-0.5 text-[10px] font-extrabold rounded-full bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">
                  CORS Proxy Active
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Search and download HD Photos, Animated GIFs, SFX Sounds, and Royalty-Free Music Tracks
              </p>
            </div>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-zinc-900 border border-zinc-800 self-start md:self-auto overflow-x-auto">
          <button
            onClick={() => setActiveCategory("photos")}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeCategory === "photos"
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <ImageIcon className="w-4 h-4" />
            HD Photos
          </button>

          <button
            onClick={() => setActiveCategory("gifs")}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeCategory === "gifs"
                ? "bg-purple-600 text-white shadow-lg shadow-purple-600/30"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Film className="w-4 h-4" />
            GIFs
          </button>

          <button
            onClick={() => setActiveCategory("sounds")}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeCategory === "sounds"
                ? "bg-amber-600 text-white shadow-lg shadow-amber-600/30"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Volume2 className="w-4 h-4" />
            SFX Sounds
          </button>

          <button
            onClick={() => setActiveCategory("tunes")}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeCategory === "tunes"
                ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/30"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Music className="w-4 h-4" />
            Music Tunes
          </button>

          <button
            onClick={() => setActiveCategory("direct-url")}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeCategory === "direct-url"
                ? "bg-cyan-600 text-white shadow-lg shadow-cyan-600/30"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <LinkIcon className="w-4 h-4" />
            Direct URL Link
          </button>

          <button
            onClick={() => setActiveCategory("converter")}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeCategory === "converter"
                ? "bg-purple-600 text-white shadow-lg shadow-purple-600/30"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Sliders className="w-4 h-4" />
            Image Converter
          </button>
        </div>
      </div>

      {/* Status Toast Banner */}
      {downloadStatusMsg && (
        <div className="mb-3 px-4 py-2.5 rounded-xl bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 text-xs font-medium flex items-center justify-between shadow-lg">
          <span className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-cyan-400" />
            {downloadStatusMsg}
          </span>
          <button onClick={() => setDownloadStatusMsg(null)} className="text-cyan-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Direct URL Tab */}
      {activeCategory === "direct-url" && (
        <div className="flex-1 overflow-y-auto pt-2">
          <UniversalUrlAssetExtractor
            theme={theme}
            onAddStatus={(msg) => {
              setDownloadStatusMsg(msg);
              setTimeout(() => setDownloadStatusMsg(null), 4000);
            }}
          />
        </div>
      )}

      {/* Image Converter Tab */}
      {activeCategory === "converter" && (
        <div className="flex-1 overflow-y-auto pt-2">
          <ImageFormatConverterUtility theme={theme} />
        </div>
      )}

      {/* Standard Catalog Search Bar & Preset Chips */}
      {activeCategory !== "direct-url" && activeCategory !== "converter" && (
        <>
      <div className="mb-4 space-y-2">
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={`Search ${activeCategory}... (e.g., ${getDefaultQuery(activeCategory)})`}
              className={`w-full pl-10 pr-4 py-2.5 rounded-2xl text-xs font-medium border focus:outline-none transition-all ${
                theme === "dark"
                  ? "bg-zinc-900 border-zinc-800 text-white placeholder-zinc-500 focus:border-cyan-500"
                  : "bg-white border-slate-200 text-slate-900 placeholder-slate-400 focus:border-cyan-500"
              }`}
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="px-5 py-2.5 rounded-2xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-cyan-600/20 transition-all cursor-pointer shrink-0 disabled:opacity-50"
          >
            {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            <span>Search</span>
          </button>
        </form>

        {/* Quick Presets */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1 uppercase tracking-wider shrink-0 mr-1">
            <Tag className="w-3 h-3 text-cyan-500" /> Presets:
          </span>
          {getPresetQueries(activeCategory).map((preset) => (
            <button
              key={preset}
              onClick={() => {
                setSearchQuery(preset);
                fetchMediaResults(activeCategory, preset);
              }}
              className={`px-3 py-1 rounded-xl text-[11px] font-medium whitespace-nowrap transition-all border ${
                searchQuery.toLowerCase() === preset.toLowerCase()
                  ? "bg-cyan-500/20 text-cyan-300 border-cyan-500 font-bold"
                  : theme === "dark"
                  ? "bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800"
                  : "bg-white border-slate-200 text-slate-600 hover:bg-slate-100"
              }`}
            >
              {preset}
            </button>
          ))}
        </div>
      </div>

      {/* Grid Content */}
      <div className="flex-1 overflow-y-auto pr-1">
        {isLoading ? (
          <div className="h-64 flex flex-col items-center justify-center gap-3 text-slate-400">
            <RefreshCw className="w-8 h-8 animate-spin text-cyan-400" />
            <p className="text-xs font-mono">Fetching public {activeCategory} assets via API...</p>
          </div>
        ) : items.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center gap-3 text-slate-400">
            <Sparkles className="w-8 h-8 text-amber-400" />
            <p className="text-xs">No media assets found for "{searchQuery}". Try selecting a preset above!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pb-8">
            {items.map((item) => (
              <div
                key={item.id}
                className={`group rounded-2xl border overflow-hidden flex flex-col transition-all duration-200 hover:-translate-y-1 hover:shadow-xl ${
                  theme === "dark"
                    ? "bg-zinc-900/90 border-zinc-800 hover:border-cyan-500/50"
                    : "bg-white border-slate-200 hover:border-cyan-500/50"
                }`}
              >
                {/* Visual Box */}
                <div className="relative aspect-video bg-black/40 overflow-hidden flex items-center justify-center group">
                  {item.category === "photos" || item.category === "gifs" ? (
                    <img
                      src={item.previewUrl}
                      alt={item.title}
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src =
                          item.category === "gifs"
                            ? "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop"
                            : "https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&auto=format&fit=crop";
                      }}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center p-4 bg-gradient-to-br from-indigo-950 via-zinc-900 to-purple-950 text-white relative">
                      <div className="p-3 rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 mb-2">
                        {item.category === "sounds" ? <Volume2 className="w-6 h-6" /> : <Music className="w-6 h-6" />}
                      </div>
                      <span className="text-xs font-bold text-center line-clamp-1">{item.title}</span>
                      <span className="text-[10px] text-slate-400">{item.author}</span>

                      {/* Play Progress Bar */}
                      {playingAudioId === item.id && (
                        <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden mt-2">
                          <div
                            className="h-full bg-cyan-400 transition-all"
                            style={{ width: `${audioProgress}%` }}
                          />
                        </div>
                      )}

                      <button
                        onClick={() => toggleAudioPlay(item)}
                        className="mt-2 px-3 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-extrabold text-[11px] flex items-center gap-1.5 transition-all cursor-pointer shadow-md"
                      >
                        {playingAudioId === item.id ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                        {playingAudioId === item.id ? "Pause" : "Listen Track"}
                      </button>
                    </div>
                  )}

                  {/* Hover Action Overlay */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 backdrop-blur-[2px]">
                    <button
                      onClick={() => setPreviewMedia(item)}
                      className="p-2 rounded-xl bg-white/20 hover:bg-white/40 text-white cursor-pointer transition-all"
                      title="Full Inspect Preview"
                    >
                      <Maximize2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleCopyLink(item.downloadUrl, item.id)}
                      className="p-2 rounded-xl bg-white/20 hover:bg-white/40 text-white cursor-pointer transition-all"
                      title="Copy Direct Media URL"
                    >
                      {copiedId === item.id ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => handleDownloadFile(item)}
                      disabled={downloadingId === item.id}
                      className="p-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-extrabold cursor-pointer transition-all shadow-lg flex items-center gap-1"
                      title="Direct Proxy Download File"
                    >
                      {downloadingId === item.id ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                    </button>
                  </div>

                  <span className="absolute top-2 right-2 px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-md text-cyan-400 text-[9px] font-mono font-bold uppercase border border-cyan-500/30">
                    {item.fileType || "HD"}
                  </span>
                </div>

                {/* Card Info */}
                <div className="p-3 flex-1 flex flex-col justify-between space-y-2">
                  <div>
                    <h3 className="text-xs font-bold truncate text-slate-200 group-hover:text-cyan-400 transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-[10px] text-slate-400 flex items-center justify-between mt-0.5">
                      <span className="truncate pr-1">{item.author || "Public Asset"}</span>
                      {item.dimensions && <span className="font-mono shrink-0">{item.dimensions}</span>}
                      {item.duration && <span className="font-mono text-cyan-400 shrink-0">{item.duration}</span>}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-zinc-800">
                    <div className="flex gap-1 overflow-x-auto text-[9px]">
                      {item.tags?.slice(0, 2).map((t, idx) => (
                        <span key={idx} className="px-1.5 py-0.5 rounded bg-zinc-800 text-slate-300 font-mono">
                          #{t}
                        </span>
                      ))}
                    </div>

                    <button
                      onClick={() => handleDownloadFile(item)}
                      disabled={downloadingId === item.id}
                      className="px-2.5 py-1 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 text-[11px] font-bold flex items-center gap-1 cursor-pointer border border-cyan-500/20"
                    >
                      <Download className="w-3 h-3" />
                      Download
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      </>
      )}

      {/* FULL PREVIEW MODAL */}
      {previewMedia && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl max-w-2xl w-full p-6 text-white space-y-4 relative shadow-2xl">
            <button
              onClick={() => setPreviewMedia(null)}
              className="absolute top-4 right-4 p-2 rounded-xl bg-zinc-800 text-slate-400 hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 pr-8">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                {previewMedia.category}
              </span>
              <h3 className="text-base font-bold truncate">{previewMedia.title}</h3>
            </div>

            <div className="rounded-2xl overflow-hidden bg-black max-h-[55vh] flex items-center justify-center border border-zinc-800 relative">
              {previewMedia.category === "photos" || previewMedia.category === "gifs" ? (
                <img
                  src={previewMedia.downloadUrl}
                  alt={previewMedia.title}
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src =
                      previewMedia.category === "gifs"
                        ? "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop"
                        : "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop";
                  }}
                  className="max-h-[50vh] object-contain"
                />
              ) : (
                <div className="p-8 text-center space-y-4 w-full">
                  <div className="w-16 h-16 rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 flex items-center justify-center mx-auto">
                    <Music className="w-8 h-8 animate-pulse" />
                  </div>
                  <div>
                    <p className="text-sm font-bold">{previewMedia.title}</p>
                    <p className="text-xs text-slate-400">{previewMedia.author}</p>
                  </div>
                  <button
                    onClick={() => toggleAudioPlay(previewMedia)}
                    className="px-6 py-2.5 rounded-xl bg-cyan-500 text-black font-bold text-xs flex items-center gap-2 mx-auto cursor-pointer shadow-lg"
                  >
                    {playingAudioId === previewMedia.id ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
                    {playingAudioId === previewMedia.id ? "Pause Audio" : "Play Audio Track"}
                  </button>
                </div>
              )}
            </div>

            <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 text-xs space-y-1 font-mono text-slate-300">
              <div className="flex justify-between">
                <span className="text-slate-500">Author / Source:</span>
                <span className="text-cyan-400 font-bold">{previewMedia.author || "Public Domain"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">File Format & Dimensions:</span>
                <span>{previewMedia.fileType || "HD"} • {previewMedia.dimensions || previewMedia.duration || "Standard"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">License:</span>
                <span className="text-emerald-400">{previewMedia.license || "Royalty Free / Open"}</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                onClick={() => handleCopyLink(previewMedia.downloadUrl, previewMedia.id)}
                className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-slate-200 font-semibold text-xs flex items-center gap-2 cursor-pointer"
              >
                <Copy className="w-4 h-4" />
                Copy Media URL
              </button>

              <button
                onClick={() => handleDownloadFile(previewMedia)}
                className="px-6 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-extrabold text-xs flex items-center gap-2 cursor-pointer shadow-lg"
              >
                <Download className="w-4 h-4" />
                Download Media File
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Fallback Generators
function getFallbackPhotos(query: string): MediaItem[] {
  return [
    {
      id: "p1",
      title: `${query} Developer High Resolution Setup`,
      category: "photos",
      previewUrl: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&auto=format&fit=crop&q=80",
      downloadUrl: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=1920&auto=format&fit=crop&q=80",
      author: "@alex_tech (Unsplash HD)",
      tags: ["tech", "developer", "hd"],
      fileType: "JPG",
      dimensions: "1920x1080",
      license: "Unsplash License (Free Commercial Use)"
    },
    {
      id: "p2",
      title: `${query} Cyber Neon Urban Landscape`,
      category: "photos",
      previewUrl: "https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=600&auto=format&fit=crop&q=80",
      downloadUrl: "https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=1920&auto=format&fit=crop&q=80",
      author: "@cyber_views (Unsplash HD)",
      tags: ["neon", "city", "futuristic"],
      fileType: "JPG",
      dimensions: "1920x1080",
      license: "Unsplash License (Free Commercial Use)"
    },
    {
      id: "p3",
      title: `${query} Minimalist Desk Workspace`,
      category: "photos",
      previewUrl: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=600&auto=format&fit=crop&q=80",
      downloadUrl: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1920&auto=format&fit=crop&q=80",
      author: "@coffee_code (Unsplash HD)",
      tags: ["minimal", "workspace", "coding"],
      fileType: "JPG",
      dimensions: "1920x1080",
      license: "Unsplash License (Free Commercial Use)"
    },
    {
      id: "p4",
      title: `${query} Fiber Optic Network Array`,
      category: "photos",
      previewUrl: "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=600&auto=format&fit=crop&q=80",
      downloadUrl: "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=1920&auto=format&fit=crop&q=80",
      author: "@net_connect (Unsplash HD)",
      tags: ["fiber", "network", "speed"],
      fileType: "JPG",
      dimensions: "1920x1080",
      license: "Unsplash License (Free Commercial Use)"
    }
  ];
}

function getFallbackGifs(query: string): MediaItem[] {
  return [
    {
      id: "g1",
      title: "Hacker Fast Typing Loop GIF",
      category: "gifs",
      previewUrl: "https://media.giphy.com/media/13Hgw8T855C20M/giphy.gif",
      downloadUrl: "https://media.giphy.com/media/13Hgw8T855C20M/giphy.gif",
      author: "@code_master",
      tags: ["coding", "typing", "hack"],
      fileType: "GIF",
      dimensions: "480x270",
      license: "Giphy Public Royalty-Free"
    },
    {
      id: "g2",
      title: "Digital Matrix Code Rain GIF",
      category: "gifs",
      previewUrl: "https://media.giphy.com/media/e2e3fAnP79sB2/giphy.gif",
      downloadUrl: "https://media.giphy.com/media/e2e3fAnP79sB2/giphy.gif",
      author: "@matrix_fan",
      tags: ["matrix", "green", "code"],
      fileType: "GIF",
      dimensions: "480x270",
      license: "Giphy Public Royalty-Free"
    }
  ];
}

function getFallbackSounds(query: string): MediaItem[] {
  return [
    {
      id: "s1",
      title: "UI Glass Click SFX Tone",
      category: "sounds",
      previewUrl: "",
      downloadUrl: "https://cdn.freesound.org/previews/566/566437_11861866-lq.mp3",
      author: "Freesound Public Library",
      tags: ["click", "ui", "glass"],
      duration: "0:02",
      fileType: "MP3",
      license: "Creative Commons Zero (CC0)"
    },
    {
      id: "s2",
      title: "Cyberpunk System Startup Chime",
      category: "sounds",
      previewUrl: "",
      downloadUrl: "https://cdn.freesound.org/previews/612/612092_11861866-lq.mp3",
      author: "Freesound Public Library",
      tags: ["boot", "synth", "cyber"],
      duration: "0:04",
      fileType: "MP3",
      license: "Creative Commons Zero (CC0)"
    }
  ];
}

function getFallbackTunes(query: string): MediaItem[] {
  return [
    {
      id: "t1",
      title: "Lofi Study Developer Heavy Rain Ambience",
      category: "tunes",
      previewUrl: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400",
      downloadUrl: "https://actions.google.com/sounds/v1/ambiences/rain_heavy.ogg",
      author: "Google Sound Library",
      tags: ["lofi", "chill", "study"],
      duration: "2:45",
      fileType: "OGG",
      license: "Royalty Free Audio Asset"
    },
    {
      id: "t2",
      title: "Synthwave Alien Space Hum Soundscape",
      category: "tunes",
      previewUrl: "https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=400",
      downloadUrl: "https://actions.google.com/sounds/v1/science_fiction/alien_spaceship_hum.ogg",
      author: "Google Sound Library",
      tags: ["synthwave", "80s", "space"],
      duration: "3:12",
      fileType: "OGG",
      license: "Royalty Free Audio Asset"
    }
  ];
}
