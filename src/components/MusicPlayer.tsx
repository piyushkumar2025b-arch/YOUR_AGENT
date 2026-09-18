import React, { useState, useEffect, useRef } from "react";
import { WaveformVisualizer } from "./common/WaveformVisualizer";
import { 
  Music, Search, Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, 
  Repeat, Shuffle, Radio, Sparkles, ListMusic, Heart, Flame, Disc, Radio as RadioIcon,
  Sliders, AlertCircle, StopCircle, RefreshCw, ExternalLink
} from "lucide-react";

export {
  type Track,
  LOFI_STUDY_TRACKS,
  WORLD_RADIO_STATIONS,
  TOP_REAL_CHARTS
} from "../data/musicTracks";
import { Track, LOFI_STUDY_TRACKS, WORLD_RADIO_STATIONS, TOP_REAL_CHARTS } from "../data/musicTracks";

interface MusicPlayerProps {
  theme: "light" | "dark";
  // Controlled mode props from App.tsx
  globalTracks?: Track[];
  globalCurrentIndex?: number | null;
  globalIsPlaying?: boolean;
  globalVolume?: number;
  globalIsMuted?: boolean;
  globalCurrentTime?: number;
  globalDuration?: number;
  onTogglePlay?: () => void;
  onForceStop?: () => void;
  onNextTrack?: () => void;
  onPrevTrack?: () => void;
  onSelectTrack?: (index: number) => void;
  onSetTracks?: (tracks: Track[]) => void;
  onSetVolume?: (vol: number) => void;
  onVolumeChange?: (vol: number) => void;
  onToggleMute?: () => void;
  onSeek?: (time: number) => void;
}

export const MusicPlayer: React.FC<MusicPlayerProps> = ({
  theme,
  globalTracks,
  globalCurrentIndex,
  globalIsPlaying,
  globalVolume,
  globalIsMuted,
  globalCurrentTime,
  globalDuration,
  onTogglePlay,
  onForceStop,
  onNextTrack,
  onPrevTrack,
  onSelectTrack,
  onSetTracks,
  onSetVolume,
  onVolumeChange,
  onToggleMute,
  onSeek
}) => {
  const isControlled = globalTracks !== undefined;

  const [source, setSource] = useState<"itunes" | "jiosaavn" | "jamendo">("itunes");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [localTracks, setLocalTracks] = useState<Track[]>(TOP_REAL_CHARTS);
  const [localCurrentIndex, setLocalCurrentIndex] = useState<number>(0);
  const [localIsPlaying, setLocalIsPlaying] = useState<boolean>(false);
  const [localVolume, setLocalVolume] = useState<number>(0.8);
  const [localIsMuted, setLocalIsMuted] = useState<boolean>(false);
  const [localCurrentTime, setLocalCurrentTime] = useState<number>(0);
  const [localDuration, setLocalDuration] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [likedTracks, setLikedTracks] = useState<string[]>([]);
  const toggleLike = (id: string) => {
    setLikedTracks(prev => prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]);
  };
  const [activeSubTab, setActiveSubTab] = useState<"all" | "liked">("all");
  const [audioError, setAudioError] = useState<string | null>(null);

  const localAudioRef = useRef<HTMLAudioElement | null>(null);

  const tracks = isControlled ? (globalTracks || TOP_REAL_CHARTS) : localTracks;
  const currentIndex = isControlled ? (globalCurrentIndex ?? 0) : localCurrentIndex;
  const isPlaying = isControlled ? (globalIsPlaying ?? false) : localIsPlaying;
  const volume = isControlled ? (globalVolume ?? 0.8) : localVolume;
  const isMuted = isControlled ? (globalIsMuted ?? false) : localIsMuted;
  const currentTime = isControlled ? (globalCurrentTime ?? 0) : localCurrentTime;
  const duration = isControlled ? (globalDuration ?? 0) : localDuration;

  const displayTracks = activeSubTab === "liked"
    ? tracks.filter(t => likedTracks.includes(t.id))
    : tracks;

  const currentTrack = displayTracks[currentIndex] || tracks[0] || TOP_REAL_CHARTS[0];

  // Initialize and manage local audio instance in uncontrolled mode
  useEffect(() => {
    if (isControlled) return;

    if (!localAudioRef.current) {
      localAudioRef.current = new Audio();
    }
    const audio = localAudioRef.current;

    const onPlay = () => setLocalIsPlaying(true);
    const onPause = () => setLocalIsPlaying(false);
    const onTimeUpdate = () => setLocalCurrentTime(audio.currentTime);
    const onDurationChange = () => setLocalDuration(audio.duration || 0);
    const onEnded = () => {
      setLocalCurrentIndex(prev => (prev + 1) % (displayTracks.length || 1));
      setLocalIsPlaying(true);
    };
    const onError = (e: any) => {
      console.warn("Audio element error on track:", e);
      setAudioError("Unable to play current stream. Auto-skipping...");
      setTimeout(() => {
        setLocalCurrentIndex(prev => (prev + 1) % (displayTracks.length || 1));
        setLocalIsPlaying(true);
      }, 1200);
    };

    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);
    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("durationchange", onDurationChange);
    audio.addEventListener("ended", onEnded);
    audio.addEventListener("error", onError);

    return () => {
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("durationchange", onDurationChange);
      audio.removeEventListener("ended", onEnded);
      audio.removeEventListener("error", onError);
    };
  }, [isControlled, displayTracks.length]);

  // Synchronize audio source, volume and play state in uncontrolled mode
  useEffect(() => {
    if (isControlled || !localAudioRef.current) return;
    const audio = localAudioRef.current;
    if (!currentTrack || !currentTrack.audioUrl) return;

    if (audio.src !== currentTrack.audioUrl) {
      audio.src = currentTrack.audioUrl;
      audio.load();
    }
    audio.volume = localIsMuted ? 0 : localVolume;

    if (localIsPlaying) {
      audio.play().catch(e => {
        console.log("Local audio play deferred/blocked:", e);
      });
    } else {
      audio.pause();
    }
  }, [isControlled, currentTrack, localIsPlaying, localVolume, localIsMuted]);

  // Perform online music search
  const handleSearchMusic = async (overrideQuery?: string, overrideSource?: string) => {
    const q = overrideQuery !== undefined ? overrideQuery : searchQuery;
    const src = overrideSource || source;

    if (!q.trim()) {
      if (isControlled && onSetTracks) onSetTracks(TOP_REAL_CHARTS);
      else setLocalTracks(TOP_REAL_CHARTS);
      return;
    }

    setIsLoading(true);
    setAudioError(null);

    try {
      // Query backend resilient proxy first for reliable CORS & artwork formatting
      const res = await fetch(`/api/music/search?query=${encodeURIComponent(q)}&source=${src}`);
      if (res.ok) {
        const json = await res.json();
        if (json.tracks && json.tracks.length > 0) {
          const formatted: Track[] = json.tracks.map((t: any) => ({
            id: t.id || `track-${Math.random()}`,
            title: t.title || "Untitled Track",
            artist: t.artist || "Unknown Artist",
            album: t.album || (src === "itunes" ? "iTunes Single" : "Online Music"),
            audioUrl: t.audioUrl,
            imageUrl: t.imageUrl || "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600",
            duration: t.duration || 30,
            source: t.source || (src === "itunes" ? "iTunes Store" : "Music API")
          }));

          if (isControlled && onSetTracks) {
            onSetTracks(formatted);
            if (onSelectTrack) onSelectTrack(0);
          } else {
            setLocalTracks(formatted);
            setLocalCurrentIndex(0);
            setLocalIsPlaying(true);
          }
          return;
        }
      }

      // Client-side fallback if server proxy was unavailable
      if (src === "itunes") {
        const directRes = await fetch(`https://itunes.apple.com/search?media=music&entity=song&limit=25&term=${encodeURIComponent(q)}`);
        if (directRes.ok) {
          const json = await directRes.json();
          if (json.results && json.results.length > 0) {
            const formatted: Track[] = json.results
              .filter((t: any) => t.previewUrl)
              .map((t: any) => ({
                id: `itunes-${t.trackId}`,
                title: t.trackName,
                artist: t.artistName,
                album: t.collectionName || "Single",
                audioUrl: t.previewUrl,
                imageUrl: t.artworkUrl100 ? t.artworkUrl100.replace("100x100bb", "600x600bb") : "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600",
                duration: 30,
                source: "iTunes Store"
              }));

            if (formatted.length > 0) {
              if (isControlled && onSetTracks) {
                onSetTracks(formatted);
                if (onSelectTrack) onSelectTrack(0);
              } else {
                setLocalTracks(formatted);
                setLocalCurrentIndex(0);
                setLocalIsPlaying(true);
              }
              return;
            }
          }
        }
      }
      setAudioError(`No playable tracks found for "${q}". Try another search.`);
    } catch (err: any) {
      console.error("Music API search error:", err);
      setAudioError("Unable to fetch online results. Switched to featured hits.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleTogglePlayClick = () => {
    if (isControlled && onTogglePlay) {
      onTogglePlay();
    } else {
      if (localAudioRef.current) {
        if (localIsPlaying) {
          localAudioRef.current.pause();
          setLocalIsPlaying(false);
        } else {
          localAudioRef.current.play().then(() => {
            setLocalIsPlaying(true);
          }).catch(e => {
            console.warn("Audio play error:", e);
            setLocalIsPlaying(true);
          });
        }
      } else {
        setLocalIsPlaying(prev => !prev);
      }
    }
  };

  const handleStopClick = () => {
    if (isControlled && onForceStop) {
      onForceStop();
    } else {
      if (localAudioRef.current) {
        localAudioRef.current.pause();
        localAudioRef.current.currentTime = 0;
      }
      setLocalIsPlaying(false);
      setLocalCurrentTime(0);
    }
  };

  const handleNextClick = () => {
    if (isControlled && onNextTrack) {
      onNextTrack();
    } else {
      setLocalCurrentIndex(prev => (prev + 1) % (displayTracks.length || 1));
      setLocalIsPlaying(true);
    }
  };

  const handlePrevClick = () => {
    if (isControlled && onPrevTrack) {
      onPrevTrack();
    } else {
      setLocalCurrentIndex(prev => (prev - 1 + (displayTracks.length || 1)) % (displayTracks.length || 1));
      setLocalIsPlaying(true);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const uploadedTracks: Track[] = Array.from(files).map((file, idx) => {
      const objectUrl = URL.createObjectURL(file);
      const title = file.name.replace(/\.[^/.]+$/, "");
      return {
        id: `local-upload-${Date.now()}-${idx}`,
        title: title,
        artist: "Local Device Audio File",
        album: "Local Storage",
        audioUrl: objectUrl,
        imageUrl: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400",
        duration: 180,
        source: "Local Upload"
      };
    });

    if (isControlled && onSetTracks) {
      onSetTracks([...uploadedTracks, ...tracks]);
      if (onSelectTrack) onSelectTrack(0);
    } else {
      setLocalTracks((prev) => [...uploadedTracks, ...prev]);
      setLocalCurrentIndex(0);
      setLocalIsPlaying(true);
    }
  };

  const [customRadioUrl, setCustomRadioUrl] = useState<string>("");

  const handleLoadWorldRadio = () => {
    if (isControlled && onSetTracks) {
      onSetTracks(WORLD_RADIO_STATIONS);
      if (onSelectTrack) onSelectTrack(0);
    } else {
      setLocalTracks(WORLD_RADIO_STATIONS);
      setLocalCurrentIndex(0);
      setLocalIsPlaying(true);
    }
  };

  const handleConnectCustomRadio = () => {
    if (!customRadioUrl.trim()) return;
    const customStation: Track = {
      id: `custom-radio-${Date.now()}`,
      title: "Custom World Radio Stream",
      artist: "Live Stream URL",
      album: "User Stream Connection",
      audioUrl: customRadioUrl.trim(),
      imageUrl: "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=400",
      duration: 99999,
      source: "Custom Radio URL"
    };

    const newTracks = [customStation, ...tracks];
    if (isControlled && onSetTracks) {
      onSetTracks(newTracks);
      if (onSelectTrack) onSelectTrack(0);
    } else {
      setLocalTracks(newTracks);
      setLocalCurrentIndex(0);
      setLocalIsPlaying(true);
    }
    setCustomRadioUrl("");
  };

  const formatTime = (secs: number) => {
    if (isNaN(secs)) return "0:00";
    const mins = Math.floor(secs / 60);
    const rem = Math.floor(secs % 60);
    return `${mins}:${rem < 10 ? "0" : ""}${rem}`;
  };

  return (
    <div className={`h-full w-full flex-1 flex flex-col overflow-hidden ${theme === "dark" ? "bg-[#121214] text-zinc-100" : "bg-slate-50 text-slate-800"}`}>
      {/* HEADER & SEARCH */}
      <div className={`p-4 border-b flex flex-wrap items-center justify-between gap-3 shrink-0 ${
        theme === "dark" ? "border-zinc-800 bg-zinc-900" : "border-slate-200 bg-white"
      }`}>
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-violet-600/10 text-violet-500 rounded-xl border border-violet-500/20">
            <Music className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h2 className="text-sm font-bold tracking-tight flex items-center gap-2">
              Persistent Studio Music Player
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Plays Across All Tabs
              </span>
            </h2>
            <p className="text-[11px] text-slate-400">Search millions of songs or stream background study lofi beats</p>
          </div>
        </div>

        {/* Source Switcher */}
        <div className="flex items-center gap-1 bg-slate-200 dark:bg-zinc-800 p-1 rounded-xl text-xs font-bold">
          <button
            onClick={() => { setSource("itunes"); handleSearchMusic("", "itunes"); }}
            className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
              source === "itunes" ? "bg-violet-600 text-white shadow-sm" : "text-slate-500 dark:text-zinc-400"
            }`}
          >
            iTunes Previews
          </button>
          <button
            onClick={() => { setSource("jamendo"); handleSearchMusic("", "jamendo"); }}
            className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
              source === "jamendo" ? "bg-violet-600 text-white shadow-sm" : "text-slate-500 dark:text-zinc-400"
            }`}
          >
            Jamendo Full Songs
          </button>
          <button
            onClick={handleLoadWorldRadio}
            className="px-3 py-1 rounded-lg transition-all cursor-pointer bg-amber-500 hover:bg-amber-400 text-zinc-950 font-extrabold flex items-center gap-1 shadow-sm"
          >
            <RadioIcon className="w-3.5 h-3.5" />
            World Radio FM
          </button>
        </div>

        {/* Custom Stream & Search Bar */}
        <div className="flex items-center gap-2 w-full lg:w-auto">
          <div className="flex items-center gap-1 bg-zinc-800/80 p-1 rounded-xl border border-zinc-700/60">
            <input
              type="text"
              value={customRadioUrl}
              onChange={(e) => setCustomRadioUrl(e.target.value)}
              placeholder="Paste Radio Stream URL (icecast/hls)..."
              className="w-44 py-1 px-2 text-[11px] font-mono rounded bg-zinc-900 border border-zinc-700 text-amber-300 placeholder-zinc-500 focus:outline-none"
            />
            <button
              onClick={handleConnectCustomRadio}
              className="px-2.5 py-1 rounded bg-amber-500 hover:bg-amber-400 text-zinc-950 text-[11px] font-bold cursor-pointer"
            >
              Stream
            </button>
          </div>

          <div className="relative flex-1 md:w-56">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search artist, song, album..."
              className={`w-full py-1.5 pl-8 pr-3 text-xs rounded-xl border focus:outline-none focus:ring-1 focus:ring-violet-500 ${
                theme === "dark" ? "bg-zinc-800 border-zinc-700 text-white placeholder-zinc-500" : "bg-slate-100 border-slate-300 text-slate-800 placeholder-slate-400"
              }`}
              onKeyDown={(e) => e.key === "Enter" && handleSearchMusic()}
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
          </div>
          <button
            onClick={() => handleSearchMusic()}
            disabled={isLoading}
            className="px-3 py-1.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold transition-all shadow-sm cursor-pointer disabled:opacity-50"
          >
            {isLoading ? "Searching..." : "Search"}
          </button>
        </div>
      </div>

      {/* MAIN BODY GRID */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
        {/* Left Column: Track List */}
        <div className={`lg:col-span-7 xl:col-span-8 border-r flex flex-col h-full overflow-hidden ${
          theme === "dark" ? "border-zinc-800 bg-[#0d0d0e]" : "border-slate-200 bg-white"
        }`}>
          {/* Subtabs: All vs Liked vs Local Upload */}
          <div className="p-3 border-b border-zinc-800/60 flex items-center justify-between flex-wrap gap-2">
            <div className="flex gap-2">
              <button
                onClick={() => setActiveSubTab("all")}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeSubTab === "all" ? "bg-violet-600/20 text-violet-400 border border-violet-500/30" : "text-slate-400 hover:text-white"
                }`}
              >
                All Playlist ({tracks.length})
              </button>
              <button
                onClick={() => setActiveSubTab("liked")}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                  activeSubTab === "liked" ? "bg-rose-500/20 text-rose-400 border border-rose-500/30" : "text-slate-400 hover:text-white"
                }`}
              >
                <Heart className="w-3 h-3 fill-current" />
                Liked ({likedTracks.length})
              </button>
            </div>

            <label className="px-3 py-1 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all">
              <Disc className="w-3.5 h-3.5" />
              <span>Upload Local Songs</span>
              <input
                type="file"
                accept="audio/*"
                multiple
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>

          {audioError && (
            <div className="m-3 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{audioError}</span>
            </div>
          )}

          {/* Track List Scrolling Table */}
          <div className="flex-1 overflow-y-auto divide-y divide-zinc-800/40">
            {displayTracks.map((track, idx) => {
              const originalIdx = tracks.findIndex(t => t.id === track.id);
              const targetIdx = originalIdx >= 0 ? originalIdx : idx;
              const isSelected = currentIndex === targetIdx;
              const isLiked = likedTracks.includes(track.id);

              return (
                <div
                  key={track.id || idx}
                  onClick={() => {
                    if (isControlled && onSelectTrack) onSelectTrack(targetIdx);
                    else {
                      setLocalCurrentIndex(targetIdx);
                      setLocalIsPlaying(true);
                    }
                  }}
                  className={`p-3 px-4 flex items-center justify-between gap-3 cursor-pointer transition-all ${
                    isSelected
                      ? "bg-violet-600/15 border-l-4 border-violet-500 text-white"
                      : "hover:bg-zinc-800/40 text-slate-300"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-xs font-mono font-bold text-slate-500 w-5 shrink-0 text-right">
                      {isSelected && isPlaying ? <Disc className="w-4 h-4 text-violet-400 animate-spin" /> : idx + 1}
                    </span>

                    <img
                      src={track.imageUrl}
                      alt={track.title}
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600";
                      }}
                      className="w-10 h-10 rounded-xl object-cover border border-white/10 shrink-0 shadow-sm"
                    />

                    <div className="min-w-0">
                      <div className={`text-xs font-bold truncate ${isSelected ? "text-violet-400" : "text-white"}`}>
                        {track.title}
                      </div>
                      <div className="text-[11px] text-slate-400 truncate">
                        {track.artist} {track.album ? `• ${track.album}` : ""}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleLike(track.id);
                      }}
                      className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                        isLiked ? "text-rose-500" : "text-slate-500 hover:text-white"
                      }`}
                    >
                      <Heart className="w-4 h-4" fill={isLiked ? "currentColor" : "none"} />
                    </button>
                    <span className="text-xs font-mono text-slate-500">{formatTime(track.duration || 30)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Player Controls & Visualizer */}
        <div className="lg:col-span-5 xl:col-span-4 p-6 flex flex-col justify-between h-full bg-gradient-to-b from-zinc-900 via-zinc-900 to-[#0a0a0c]">
          {/* Track Cover Display */}
          <div className="space-y-6 text-center">
            <div className="relative w-48 h-48 mx-auto rounded-3xl overflow-hidden shadow-2xl border border-white/10 group">
              <img
                src={currentTrack?.imageUrl || "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600"}
                alt={currentTrack?.title}
                referrerPolicy="no-referrer"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600";
                }}
                className={`w-full h-full object-cover transition-transform duration-700 ${isPlaying ? "scale-105" : "scale-100"}`}
              />
              {isPlaying && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <div className="flex items-end gap-1 h-8">
                    <span className="w-1.5 bg-violet-400 rounded-full animate-bounce h-full"></span>
                    <span className="w-1.5 bg-violet-400 rounded-full animate-bounce h-2/3 delay-75"></span>
                    <span className="w-1.5 bg-violet-400 rounded-full animate-bounce h-4/5 delay-150"></span>
                    <span className="w-1.5 bg-violet-400 rounded-full animate-bounce h-1/2 delay-100"></span>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-1">
              <h3 className="text-base font-bold text-white line-clamp-1">{currentTrack?.title || "No track selected"}</h3>
              <p className="text-xs text-violet-400 font-medium">{currentTrack?.artist || "Unknown Artist"}</p>
              <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-mono text-slate-400 bg-white/5 border border-white/10 mt-1">
                {currentTrack?.source || "Studio Audio Player"}
              </span>
            </div>
          </div>

          {/* Progress Bar & Seek */}
          <div className="space-y-2 my-2">
            <input
              type="range"
              min="0"
              max={duration || 100}
              value={currentTime || 0}
              onChange={(e) => {
                const newTime = parseFloat(e.target.value);
                if (isControlled && onSeek) onSeek(newTime);
                else setLocalCurrentTime(newTime);
              }}
              className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-violet-500"
            />
            <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>

            {/* Waveform Visualizer */}
            {currentTrack?.audioUrl && (
              <div className="mt-2">
                <WaveformVisualizer audioUrl={currentTrack.audioUrl} height={40} />
              </div>
            )}
          </div>

          {/* Playback Action Buttons */}
          <div className="space-y-4">
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={handlePrevClick}
                className="p-3 rounded-full bg-white/5 hover:bg-white/10 text-white transition-all cursor-pointer"
              >
                <SkipBack className="w-5 h-5" />
              </button>

              <button
                onClick={handleTogglePlayClick}
                className="p-4 rounded-full bg-violet-600 hover:bg-violet-500 text-white shadow-lg shadow-violet-600/30 transition-all cursor-pointer transform hover:scale-105 active:scale-95 flex items-center justify-center"
                title={isPlaying ? "Pause Music" : "Play Music"}
                id="music-play-pause-btn"
              >
                {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 fill-current ml-0.5" />}
              </button>

              <button
                onClick={handleStopClick}
                className="p-3.5 rounded-full bg-rose-600/20 hover:bg-rose-600/40 text-rose-400 hover:text-white border border-rose-500/30 transition-all cursor-pointer transform hover:scale-105 active:scale-95 flex items-center justify-center"
                title="Stop Music Playback (Reset)"
                id="music-stop-btn"
              >
                <StopCircle className="w-5 h-5" />
              </button>

              <button
                onClick={handleNextClick}
                className="p-3 rounded-full bg-white/5 hover:bg-white/10 text-white transition-all cursor-pointer"
                title="Next Track"
              >
                <SkipForward className="w-5 h-5" />
              </button>
            </div>

            {/* Volume Control */}
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => {
                  if (isControlled && onToggleMute) onToggleMute();
                  else setLocalIsMuted(prev => !prev);
                }}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                {isMuted || volume === 0 ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4" />}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={isMuted ? 0 : volume}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  if (isControlled) {
                    if (onVolumeChange) onVolumeChange(val);
                    else if (onSetVolume) onSetVolume(val);
                  } else {
                    setLocalVolume(val);
                  }
                }}
                className="w-28 h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-violet-500"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
