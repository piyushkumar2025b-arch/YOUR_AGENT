import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Play,
  Square,
  Volume2,
  Sliders,
  RotateCcw,
  Sparkles,
  Zap,
  Music,
  Share2,
  Download,
  Upload,
  Radio,
  Clock,
  Flame,
  VolumeX,
  Volume1
} from "lucide-react";
import {
  audioSynthEngine,
  DrumInstrument,
  DrumKitType,
  DrumTrackConfig,
  DrumPatternPreset
} from "../services/audioSynthEngine";

interface DrumMachineProps {
  theme?: "light" | "dark" | string;
  onStepChange?: (step: number) => void;
}

const DEFAULT_TRACKS: DrumTrackConfig[] = [
  {
    id: "kick",
    name: "808 Kick",
    keyTrigger: "1",
    volume: 0.95,
    pan: 0,
    muted: false,
    solo: false,
    steps: [true, false, false, false, false, false, false, false, true, false, false, false, false, false, false, false],
    accents: [2, 1, 1, 1, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 1, 1]
  },
  {
    id: "snare",
    name: "Snare",
    keyTrigger: "2",
    volume: 0.9,
    pan: 0,
    muted: false,
    solo: false,
    steps: [false, false, false, false, true, false, false, false, false, false, false, false, true, false, false, false],
    accents: [1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 1, 1, 2, 1, 1, 1]
  },
  {
    id: "hihat_closed",
    name: "Closed Hat",
    keyTrigger: "3",
    volume: 0.75,
    pan: -0.2,
    muted: false,
    solo: false,
    steps: [true, false, true, false, true, false, true, false, true, false, true, false, true, false, true, false],
    accents: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
  },
  {
    id: "hihat_open",
    name: "Open Hat",
    keyTrigger: "4",
    volume: 0.7,
    pan: 0.2,
    muted: false,
    solo: false,
    steps: [false, false, false, false, false, false, true, false, false, false, false, false, false, false, true, false],
    accents: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
  },
  {
    id: "clap",
    name: "Clap",
    keyTrigger: "5",
    volume: 0.85,
    pan: 0,
    muted: false,
    solo: false,
    steps: [false, false, false, false, true, false, false, false, false, false, false, false, true, false, false, false],
    accents: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
  },
  {
    id: "tom_low",
    name: "Low Tom",
    keyTrigger: "6",
    volume: 0.8,
    pan: -0.4,
    muted: false,
    solo: false,
    steps: [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, true],
    accents: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
  },
  {
    id: "tom_high",
    name: "High Tom",
    keyTrigger: "7",
    volume: 0.8,
    pan: 0.4,
    muted: false,
    solo: false,
    steps: [false, false, false, false, false, false, false, true, false, false, false, false, false, false, false, false],
    accents: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
  },
  {
    id: "crash",
    name: "Crash",
    keyTrigger: "8",
    volume: 0.7,
    pan: 0,
    muted: false,
    solo: false,
    steps: [true, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false],
    accents: [2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
  }
];

const PRESETS: Record<string, DrumPatternPreset> = {
  trap: {
    name: "Trap Anthem",
    bpm: 140,
    swing: 0.08,
    tracks: {
      kick: [true, false, false, false, false, false, true, false, false, false, true, false, false, false, false, false],
      snare: [false, false, false, false, false, false, false, false, true, false, false, false, false, false, false, false],
      hihat_closed: [true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true],
      hihat_open: [false, false, false, false, false, false, false, true, false, false, false, false, false, false, true, false],
      clap: [false, false, false, false, false, false, false, false, true, false, false, false, false, false, false, false],
      tom_low: [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, true],
      tom_high: [false, false, false, false, false, false, false, false, false, false, false, false, false, true, false, false],
      crash: [true, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false]
    }
  },
  boombap: {
    name: "Boom Bap 90s",
    bpm: 92,
    swing: 0.25,
    tracks: {
      kick: [true, false, false, false, false, false, true, false, false, false, true, false, false, false, false, false],
      snare: [false, false, false, false, true, false, false, false, false, false, false, false, true, false, false, false],
      hihat_closed: [true, false, true, true, true, false, true, true, true, false, true, true, true, false, true, true],
      hihat_open: [false, false, false, false, false, false, false, false, false, false, false, false, false, false, true, false],
      clap: [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false],
      tom_low: [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false],
      tom_high: [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false],
      crash: [true, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false]
    }
  },
  house: {
    name: "4-Floor Club House",
    bpm: 126,
    swing: 0.12,
    tracks: {
      kick: [true, false, false, false, true, false, false, false, true, false, false, false, true, false, false, false],
      snare: [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false],
      hihat_closed: [false, false, true, false, false, false, true, false, false, false, true, false, false, false, true, false],
      hihat_open: [false, false, true, false, false, false, true, false, false, false, true, false, false, false, true, false],
      clap: [false, false, false, false, true, false, false, false, false, false, false, false, true, false, false, false],
      tom_low: [false, false, false, false, false, false, false, false, false, false, false, true, false, false, false, false],
      tom_high: [false, false, false, true, false, false, false, false, false, false, false, false, false, false, false, false],
      crash: [true, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false]
    }
  },
  synthwave: {
    name: "Synthwave Highway",
    bpm: 110,
    swing: 0.05,
    tracks: {
      kick: [true, false, false, false, false, false, true, false, true, false, false, false, false, false, false, false],
      snare: [false, false, false, false, true, false, false, false, false, false, false, false, true, false, false, false],
      hihat_closed: [true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true],
      hihat_open: [false, false, false, false, false, false, true, false, false, false, false, false, false, false, true, false],
      clap: [false, false, false, false, true, false, false, false, false, false, false, false, true, false, false, false],
      tom_low: [false, false, false, false, false, false, false, false, false, false, false, false, false, true, false, true],
      tom_high: [false, false, false, false, false, false, false, false, false, false, false, false, true, false, true, false],
      crash: [true, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false]
    }
  },
  dnb: {
    name: "DnB Jungle Break",
    bpm: 174,
    swing: 0.04,
    tracks: {
      kick: [true, false, false, false, false, false, false, false, false, false, true, false, false, false, false, false],
      snare: [false, false, false, false, true, false, false, false, false, false, false, false, true, false, false, true],
      hihat_closed: [true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true],
      hihat_open: [false, false, true, false, false, false, false, false, false, false, true, false, false, false, false, false],
      clap: [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false],
      tom_low: [false, false, false, false, false, false, false, false, false, false, false, false, false, false, true, false],
      tom_high: [false, false, false, false, false, false, false, false, false, false, false, false, false, true, false, false],
      crash: [true, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false]
    }
  }
};

export const DrumMachine: React.FC<DrumMachineProps> = ({
  theme = "dark",
  onStepChange
}) => {
  const isDark = theme !== "light";

  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [bpm, setBpm] = useState<number>(120);
  const [swing, setSwing] = useState<number>(0.1);
  const [selectedKit, setSelectedKit] = useState<DrumKitType>("808");
  const [tracks, setTracks] = useState<DrumTrackConfig[]>(DEFAULT_TRACKS);
  const [activePad, setActivePad] = useState<DrumInstrument | null>(null);

  // Tap tempo state
  const tapTimesRef = useRef<number[]>([]);

  // Synchronize sequencer parameters with synth engine
  useEffect(() => {
    audioSynthEngine.setDrumKit(selectedKit);
  }, [selectedKit]);

  useEffect(() => {
    audioSynthEngine.setSequencerConfig(bpm, swing, tracks);
  }, [bpm, swing, tracks]);

  // Step callback
  const handleStep = useCallback(
    (step: number) => {
      setCurrentStep(step);
      if (onStepChange) onStepChange(step);
    },
    [onStepChange]
  );

  // Play / Stop transport
  const togglePlay = useCallback(() => {
    if (isPlaying) {
      audioSynthEngine.stopSequencer();
      setIsPlaying(false);
      setCurrentStep(0);
    } else {
      audioSynthEngine.setSequencerConfig(bpm, swing, tracks);
      audioSynthEngine.startSequencer(handleStep);
      setIsPlaying(true);
    }
  }, [isPlaying, bpm, swing, tracks, handleStep]);

  // Trigger drum pad manually
  const triggerPad = useCallback(
    (inst: DrumInstrument, volume: number = 0.95) => {
      audioSynthEngine.triggerDrum(inst, volume);
      setActivePad(inst);
      setTimeout(() => {
        setActivePad((current) => (current === inst ? null : current));
      }, 150);
    },
    []
  );

  // Keyboard triggers (1-8 keys)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable ||
          target.closest(".monaco-editor"))
      ) {
        return;
      }

      if (e.code === "Space" && !e.repeat && e.shiftKey) {
        e.preventDefault();
        togglePlay();
        return;
      }

      const track = tracks.find((t) => t.keyTrigger === e.key);
      if (track) {
        e.preventDefault();
        triggerPad(track.id, track.volume);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [tracks, triggerPad, togglePlay]);

  // Step toggle
  const toggleStep = (trackId: DrumInstrument, stepIdx: number) => {
    setTracks((prev) =>
      prev.map((t) => {
        if (t.id === trackId) {
          const newSteps = [...t.steps];
          newSteps[stepIdx] = !newSteps[stepIdx];
          return { ...t, steps: newSteps };
        }
        return t;
      })
    );
  };

  // Track volume
  const updateTrackVolume = (trackId: DrumInstrument, vol: number) => {
    setTracks((prev) =>
      prev.map((t) => (t.id === trackId ? { ...t, volume: vol } : t))
    );
  };

  // Track mute / solo
  const toggleMute = (trackId: DrumInstrument) => {
    setTracks((prev) =>
      prev.map((t) => (t.id === trackId ? { ...t, muted: !t.muted } : t))
    );
  };

  const toggleSolo = (trackId: DrumInstrument) => {
    setTracks((prev) =>
      prev.map((t) => (t.id === trackId ? { ...t, solo: !t.solo } : t))
    );
  };

  // Load preset
  const loadPreset = (presetKey: string) => {
    const preset = PRESETS[presetKey];
    if (!preset) return;

    setBpm(preset.bpm);
    setSwing(preset.swing);

    setTracks((prev) =>
      prev.map((t) => {
        const pSteps = preset.tracks[t.id];
        return {
          ...t,
          steps: pSteps ? [...pSteps] : Array(16).fill(false)
        };
      })
    );
  };

  // Randomize pattern
  const randomizePattern = () => {
    setTracks((prev) =>
      prev.map((t) => {
        const randSteps = Array(16).fill(false);
        // Probability varies per drum
        let prob = 0.2;
        if (t.id === "kick") prob = 0.25;
        if (t.id === "snare" || t.id === "clap") prob = 0.18;
        if (t.id === "hihat_closed") prob = 0.65;
        if (t.id === "hihat_open") prob = 0.15;
        if (t.id === "crash") prob = 0.06;

        for (let i = 0; i < 16; i++) {
          randSteps[i] = Math.random() < prob;
        }
        return { ...t, steps: randSteps };
      })
    );
  };

  // Clear all steps
  const clearAllSteps = () => {
    setTracks((prev) =>
      prev.map((t) => ({ ...t, steps: Array(16).fill(false) }))
    );
  };

  // Tap tempo
  const handleTapTempo = () => {
    const now = performance.now();
    const times = tapTimesRef.current;
    times.push(now);

    // Keep only last 4 taps within 2.5s
    const filtered = times.filter((t) => now - t < 2500);
    tapTimesRef.current = filtered;

    if (filtered.length >= 2) {
      let totalDiff = 0;
      for (let i = 1; i < filtered.length; i++) {
        totalDiff += filtered[i] - filtered[i - 1];
      }
      const avgDiff = totalDiff / (filtered.length - 1);
      const calculatedBpm = Math.round(60000 / avgDiff);
      if (calculatedBpm >= 40 && calculatedBpm <= 260) {
        setBpm(calculatedBpm);
      }
    }
  };

  return (
    <div
      className={`rounded-2xl border flex flex-col p-4 select-none transition-all ${
        isDark ? "bg-[#18181b] border-zinc-800 text-zinc-100" : "bg-white border-slate-200 text-slate-800 shadow-sm"
      }`}
    >
      {/* HEADER / TRANSPORT CONTROLS */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-zinc-800/60 dark:border-zinc-800 mb-4">
        {/* Play/Stop & BPM */}
        <div className="flex items-center gap-3">
          <button
            onClick={togglePlay}
            className={`px-4 py-2 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-2 shadow-md ${
              isPlaying
                ? "bg-rose-600 hover:bg-rose-500 text-white animate-pulse"
                : "bg-emerald-600 hover:bg-emerald-500 text-white"
            }`}
          >
            {isPlaying ? <Square className="w-4 h-4 fill-white" /> : <Play className="w-4 h-4 fill-white" />}
            <span>{isPlaying ? "STOP" : "PLAY BEAT"}</span>
          </button>

          {/* BPM Tempo & Tap */}
          <div className="flex items-center gap-2 bg-zinc-900/80 border border-zinc-700/60 rounded-xl px-3 py-1.5 text-xs">
            <Clock className="w-3.5 h-3.5 text-indigo-400" />
            <span className="text-zinc-400 font-medium">BPM:</span>
            <input
              type="number"
              min="40"
              max="260"
              value={bpm}
              onChange={(e) => setBpm(Math.max(40, Math.min(260, parseInt(e.target.value, 10) || 120)))}
              className="w-12 bg-transparent text-sm font-bold font-mono text-center focus:outline-hidden"
            />
            <button
              onClick={handleTapTempo}
              className="px-2 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-indigo-300 font-bold active:scale-95 cursor-pointer text-[11px]"
              title="Tap repeatedly to calculate BPM automatically"
            >
              TAP
            </button>
          </div>

          {/* Swing / Shuffle Slider */}
          <div className="flex items-center gap-2 bg-zinc-900/80 border border-zinc-700/60 rounded-xl px-3 py-1.5 text-xs">
            <Sliders className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-zinc-400 font-medium">Swing:</span>
            <input
              type="range"
              min="0"
              max="0.5"
              step="0.02"
              value={swing}
              onChange={(e) => setSwing(parseFloat(e.target.value))}
              className="w-16 accent-amber-500 cursor-pointer"
            />
            <span className="font-mono text-zinc-300 w-8">{Math.round(swing * 100)}%</span>
          </div>
        </div>

        {/* Kit Selector & Presets */}
        <div className="flex items-center gap-2">
          {/* Drum Kit Selector */}
          <div className="flex items-center gap-1.5 bg-zinc-900/80 border border-zinc-700/60 rounded-xl px-2 py-1 text-xs">
            <Radio className="w-3.5 h-3.5 text-pink-400" />
            <span className="text-zinc-400 font-medium">Kit:</span>
            <select
              value={selectedKit}
              onChange={(e) => setSelectedKit(e.target.value as DrumKitType)}
              className="bg-transparent text-xs font-semibold focus:outline-hidden cursor-pointer"
            >
              <option value="808" className="bg-zinc-900">808 Trap & Bass</option>
              <option value="909" className="bg-zinc-900">909 House / Techno</option>
              <option value="acoustic" className="bg-zinc-900">Acoustic Studio</option>
              <option value="synthwave" className="bg-zinc-900">Synthwave Cyber</option>
              <option value="lofi" className="bg-zinc-900">Lofi Warm Vinyl</option>
            </select>
          </div>

          {/* Preset Patterns */}
          <div className="flex items-center gap-1.5 bg-zinc-900/80 border border-zinc-700/60 rounded-xl px-2 py-1 text-xs">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-zinc-400 font-medium">Groove:</span>
            <select
              onChange={(e) => loadPreset(e.target.value)}
              defaultValue=""
              className="bg-transparent text-xs font-semibold focus:outline-hidden cursor-pointer"
            >
              <option value="" disabled className="bg-zinc-900">Load Preset...</option>
              <option value="trap" className="bg-zinc-900">Trap Anthem (140 BPM)</option>
              <option value="boombap" className="bg-zinc-900">Boom Bap 90s (92 BPM)</option>
              <option value="house" className="bg-zinc-900">4-Floor House (126 BPM)</option>
              <option value="synthwave" className="bg-zinc-900">Synthwave (110 BPM)</option>
              <option value="dnb" className="bg-zinc-900">DnB Break (174 BPM)</option>
            </select>
          </div>

          {/* Quick Randomize & Clear */}
          <button
            onClick={randomizePattern}
            className="p-1.5 rounded-lg border border-zinc-700/60 hover:bg-zinc-800 text-zinc-300 cursor-pointer"
            title="Generate Random Beat Pattern"
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
          </button>
          <button
            onClick={clearAllSteps}
            className="p-1.5 rounded-lg border border-zinc-700/60 hover:bg-zinc-800 text-zinc-300 cursor-pointer"
            title="Clear All Steps"
          >
            <RotateCcw className="w-4 h-4 text-rose-400" />
          </button>
        </div>
      </div>

      {/* DRUM PADS MATRIX (MPC STYLE 4x2 TRIGGER MATRIX) */}
      <div className="mb-5">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            Real-Time Drum Performance Pads (Keys 1-8 or Click)
          </span>
          <span className="text-[11px] text-zinc-400">Low-latency physical modeling synthesis</span>
        </div>

        <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
          {tracks.map((track) => {
            const isHit = activePad === track.id;
            return (
              <button
                key={track.id}
                onMouseDown={() => triggerPad(track.id, track.volume)}
                onTouchStart={(e) => {
                  e.preventDefault();
                  triggerPad(track.id, track.volume);
                }}
                className={`relative h-20 rounded-xl border flex flex-col items-center justify-between p-2 font-bold transition-all cursor-pointer select-none ${
                  isHit
                    ? "bg-amber-500 border-amber-300 text-black scale-95 shadow-lg shadow-amber-500/50"
                    : "bg-linear-to-b from-zinc-800/90 to-zinc-900 border-zinc-700/80 hover:border-indigo-500/80 hover:bg-zinc-800 text-zinc-200 shadow-md"
                }`}
              >
                <div className="w-full flex items-center justify-between text-[10px] text-zinc-400 font-mono">
                  <span className="px-1 rounded bg-zinc-950/60 text-indigo-300">[{track.keyTrigger}]</span>
                  <div
                    className={`w-2 h-2 rounded-full ${
                      isHit ? "bg-black" : "bg-emerald-500/80"
                    }`}
                  />
                </div>
                <span className="text-xs text-center leading-tight truncate w-full">{track.name}</span>
                <span className="text-[9px] font-normal text-zinc-400">Pad {track.keyTrigger}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 16-STEP SEQUENCER GRID */}
      <div className="overflow-x-auto pb-2 scrollbar-thin">
        <div className="min-w-[780px] flex flex-col gap-1.5 bg-zinc-950 p-3 rounded-xl border border-zinc-800">
          {/* STEP HEADER INDICATORS (1 to 16 with running playhead) */}
          <div className="flex items-center gap-2 mb-1 pl-44 pr-1">
            {Array.from({ length: 16 }).map((_, stepIdx) => {
              const isCurrent = isPlaying && currentStep === stepIdx;
              const isBeatMarker = stepIdx % 4 === 0;
              return (
                <div
                  key={stepIdx}
                  className={`flex-1 h-3 rounded flex items-center justify-center transition-all ${
                    isCurrent
                      ? "bg-indigo-500 shadow-xs shadow-indigo-500"
                      : isBeatMarker
                      ? "bg-zinc-700"
                      : "bg-zinc-800/60"
                  }`}
                >
                  <span className={`text-[8px] font-mono font-bold ${isCurrent ? "text-white" : "text-zinc-400"}`}>
                    {stepIdx + 1}
                  </span>
                </div>
              );
            })}
          </div>

          {/* TRACK ROWS */}
          {tracks.map((track) => (
            <div key={track.id} className="flex items-center gap-2 py-0.5">
              {/* Track Info & Mixer */}
              <div className="w-44 shrink-0 flex items-center justify-between pr-2 text-xs">
                <button
                  onClick={() => triggerPad(track.id, track.volume)}
                  className="font-bold text-left hover:text-indigo-400 truncate cursor-pointer text-zinc-300 max-w-[80px]"
                  title={`Test ${track.name}`}
                >
                  {track.name}
                </button>

                <div className="flex items-center gap-1">
                  {/* Mute button */}
                  <button
                    onClick={() => toggleMute(track.id)}
                    className={`w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold cursor-pointer ${
                      track.muted
                        ? "bg-rose-600 text-white"
                        : "bg-zinc-800 hover:bg-zinc-700 text-zinc-400"
                    }`}
                    title="Mute Track"
                  >
                    M
                  </button>

                  {/* Solo button */}
                  <button
                    onClick={() => toggleSolo(track.id)}
                    className={`w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold cursor-pointer ${
                      track.solo
                        ? "bg-amber-500 text-black font-extrabold"
                        : "bg-zinc-800 hover:bg-zinc-700 text-zinc-400"
                    }`}
                    title="Solo Track"
                  >
                    S
                  </button>

                  {/* Mini volume fader */}
                  <input
                    type="range"
                    min="0"
                    max="1.2"
                    step="0.05"
                    value={track.volume}
                    onChange={(e) => updateTrackVolume(track.id, parseFloat(e.target.value))}
                    className="w-12 accent-indigo-500 cursor-pointer h-1"
                    title={`Volume: ${Math.round(track.volume * 100)}%`}
                  />
                </div>
              </div>

              {/* 16 Step Buttons */}
              <div className="flex-1 flex items-center gap-1.5">
                {track.steps.map((isOn, stepIdx) => {
                  const isCurrent = isPlaying && currentStep === stepIdx;
                  const isBeatStart = stepIdx % 4 === 0;

                  return (
                    <button
                      key={stepIdx}
                      onClick={() => toggleStep(track.id, stepIdx)}
                      className={`flex-1 h-9 rounded-lg border transition-all cursor-pointer relative flex items-center justify-center ${
                        isOn
                          ? isCurrent
                            ? "bg-amber-400 border-white text-black font-bold scale-105 shadow-md shadow-amber-400/80"
                            : "bg-indigo-600 hover:bg-indigo-500 border-indigo-400 text-white shadow-xs"
                          : isCurrent
                          ? "bg-zinc-700 border-indigo-400/80"
                          : isBeatStart
                          ? "bg-zinc-800/90 hover:bg-zinc-700 border-zinc-700"
                          : "bg-zinc-900/80 hover:bg-zinc-800 border-zinc-800/80"
                      }`}
                      title={`${track.name} Step ${stepIdx + 1}`}
                    >
                      {isOn && (
                        <div
                          className={`w-2 h-2 rounded-full ${
                            isCurrent ? "bg-black animate-ping" : "bg-white"
                          }`}
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* FOOTER SHORTCUTS & INFO */}
      <div className="flex items-center justify-between text-[11px] text-zinc-400 pt-3 border-t border-zinc-800/40 mt-3">
        <div className="flex items-center gap-2">
          <Zap className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span>Shortcuts: Press 1-8 for live drum hits. Press Shift+Spacebar to toggle playback!</span>
        </div>
        <span className="font-mono text-zinc-400 hidden sm:inline">
          Tempo: {bpm} BPM | Swing: {Math.round(swing * 100)}%
        </span>
      </div>
    </div>
  );
};

export default DrumMachine;
