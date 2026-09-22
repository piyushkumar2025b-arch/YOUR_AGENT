import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Music,
  Radio,
  Sliders,
  Volume2,
  Mic,
  Square,
  Download,
  Share2,
  Sparkles,
  Zap,
  Activity,
  Maximize2,
  Minimize2,
  RefreshCw,
  Waves
} from "lucide-react";
import { VirtualPiano } from "./VirtualPiano";
import { DrumMachine } from "./DrumMachine";
import { audioSynthEngine } from "../services/audioSynthEngine";

interface MusicStudioWorkstationProps {
  theme?: "light" | "dark" | string;
  initialMode?: "studio" | "piano" | "drums";
  onClose?: () => void;
}

export const MusicStudioWorkstation: React.FC<MusicStudioWorkstationProps> = ({
  theme = "dark",
  initialMode = "studio",
  onClose
}) => {
  const isDark = theme !== "light";

  const [viewMode, setViewMode] = useState<"studio" | "piano" | "drums">(initialMode);
  const [masterVolume, setMasterVolume] = useState<number>(0.85);
  const [reverbAmount, setReverbAmount] = useState<number>(0.25);
  const [visualizerType, setVisualizerType] = useState<"waveform" | "spectrum">("spectrum");

  // Recording state
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordedAudioUrl, setRecordedAudioUrl] = useState<string | null>(null);
  const [recordingSeconds, setRecordingSeconds] = useState<number>(0);
  const recordingTimerRef = useRef<number | null>(null);

  // Canvas ref for visualizer
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // Update master volume & reverb
  useEffect(() => {
    audioSynthEngine.setMasterVolume(masterVolume);
  }, [masterVolume]);

  useEffect(() => {
    audioSynthEngine.setReverbAmount(reverbAmount);
  }, [reverbAmount]);

  // Audio Visualizer loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const analyser = audioSynthEngine.getAnalyser();
    if (!analyser) return;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const render = () => {
      animFrameRef.current = requestAnimationFrame(render);

      const width = canvas.width;
      const height = canvas.height;

      ctx.clearRect(0, 0, width, height);

      if (visualizerType === "spectrum") {
        analyser.getByteFrequencyData(dataArray);

        // Background subtle grid
        ctx.fillStyle = isDark ? "#0f0f12" : "#f8fafc";
        ctx.fillRect(0, 0, width, height);

        const barWidth = (width / (bufferLength / 3)) * 2.5;
        let x = 0;

        for (let i = 0; i < bufferLength / 3; i++) {
          const barHeight = (dataArray[i] / 255) * height * 0.95;

          // Gradient from indigo to cyan to amber
          const grad = ctx.createLinearGradient(0, height, 0, height - barHeight);
          grad.addColorStop(0, "#4f46e5");
          grad.addColorStop(0.6, "#06b6d4");
          grad.addColorStop(1, "#f59e0b");

          ctx.fillStyle = grad;
          ctx.fillRect(x, height - barHeight, Math.max(1, barWidth - 1), barHeight);

          x += barWidth;
          if (x > width) break;
        }
      } else {
        // Waveform / Oscilloscope mode
        analyser.getByteTimeDomainData(dataArray);

        ctx.fillStyle = isDark ? "#0f0f12" : "#f8fafc";
        ctx.fillRect(0, 0, width, height);

        ctx.lineWidth = 2.5;
        ctx.strokeStyle = "#06b6d4";
        ctx.beginPath();

        const sliceWidth = (width * 1.0) / bufferLength;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
          const v = dataArray[i] / 128.0;
          const y = (v * height) / 2;

          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }

          x += sliceWidth;
        }

        ctx.lineTo(width, height / 2);
        ctx.stroke();
      }
    };

    render();

    return () => {
      if (animFrameRef.current !== null) {
        cancelAnimationFrame(animFrameRef.current);
        animFrameRef.current = null;
      }
    };
  }, [visualizerType, isDark]);

  // Recording controls
  const handleStartRecording = () => {
    const started = audioSynthEngine.startRecording();
    if (started) {
      setIsRecording(true);
      setRecordingSeconds(0);
      setRecordedAudioUrl(null);

      recordingTimerRef.current = window.setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    }
  };

  const handleStopRecording = async () => {
    if (recordingTimerRef.current !== null) {
      window.clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }

    try {
      const { url } = await audioSynthEngine.stopRecording();
      setIsRecording(false);
      setRecordedAudioUrl(url);
    } catch (err) {
      console.warn("Failed to complete recording:", err);
      setIsRecording(false);
    }
  };

  // Format seconds mm:ss
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div
      className={`w-full h-full flex flex-col overflow-y-auto p-4 md:p-6 transition-all ${
        isDark ? "bg-[#121214] text-zinc-100" : "bg-slate-50 text-slate-900"
      }`}
    >
      {/* WORKSTATION HEADER */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-zinc-800/80 mb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-linear-to-br from-indigo-500 via-purple-600 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-500/20 text-white">
            <Music className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg md:text-xl font-extrabold tracking-tight flex items-center gap-2">
              <span>Pro Audio & Beat Studio</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                Web Audio Polyphonic
              </span>
            </h1>
            <p className="text-xs text-zinc-400">
              Interactive Polyphonic Grand Piano & 16-Step Programmable Drum Machine Workstation
            </p>
          </div>
        </div>

        {/* VIEW SELECTOR & MASTER FX */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Mode Switcher Tabs */}
          <div className="flex items-center bg-zinc-900/90 border border-zinc-800 rounded-xl p-1 text-xs font-semibold">
            <button
              onClick={() => setViewMode("studio")}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                viewMode === "studio"
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              Full Studio
            </button>
            <button
              onClick={() => setViewMode("piano")}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                viewMode === "piano"
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              Piano Only
            </button>
            <button
              onClick={() => setViewMode("drums")}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                viewMode === "drums"
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              Drums Only
            </button>
          </div>

          {/* Master Volume & Reverb Knobs */}
          <div className="flex items-center gap-3 bg-zinc-900/80 border border-zinc-800 rounded-xl px-3 py-1.5 text-xs">
            <div className="flex items-center gap-1.5">
              <Volume2 className="w-3.5 h-3.5 text-indigo-400" />
              <span className="text-zinc-400">Master:</span>
              <input
                type="range"
                min="0"
                max="1.2"
                step="0.05"
                value={masterVolume}
                onChange={(e) => setMasterVolume(parseFloat(e.target.value))}
                className="w-16 accent-indigo-500 cursor-pointer"
                title={`Master Volume: ${Math.round(masterVolume * 100)}%`}
              />
            </div>

            <div className="flex items-center gap-1.5 border-l border-zinc-800 pl-3">
              <Waves className="w-3.5 h-3.5 text-cyan-400" />
              <span className="text-zinc-400">Reverb:</span>
              <input
                type="range"
                min="0"
                max="0.8"
                step="0.05"
                value={reverbAmount}
                onChange={(e) => setReverbAmount(parseFloat(e.target.value))}
                className="w-16 accent-cyan-500 cursor-pointer"
                title={`Reverb: ${Math.round(reverbAmount * 100)}%`}
              />
            </div>
          </div>

          {/* Recording Button */}
          <div className="flex items-center gap-2">
            {!isRecording ? (
              <button
                onClick={handleStartRecording}
                className="px-3 py-1.5 rounded-xl border border-rose-500/50 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 font-bold text-xs transition-all cursor-pointer flex items-center gap-1.5"
                title="Record combined live performance to audio file"
              >
                <div className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                <span>Record Session</span>
              </button>
            ) : (
              <button
                onClick={handleStopRecording}
                className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition-all cursor-pointer flex items-center gap-1.5 animate-pulse"
              >
                <Square className="w-3 h-3 fill-white" />
                <span>Stop ({formatTime(recordingSeconds)})</span>
              </button>
            )}

            {recordedAudioUrl && (
              <a
                href={recordedAudioUrl}
                download={`studio-session-${Date.now()}.webm`}
                className="px-3 py-1.5 rounded-xl border border-emerald-500/50 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 font-bold text-xs transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Audio</span>
              </a>
            )}
          </div>
        </div>
      </div>

      {/* LIVE AUDIO VISUALIZER STRIP */}
      <div className="relative mb-5 rounded-2xl border border-zinc-800 bg-zinc-950 p-2 overflow-hidden shadow-inner">
        <div className="flex items-center justify-between px-2 pb-1.5 text-xs text-zinc-400">
          <div className="flex items-center gap-2">
            <Activity className="w-3.5 h-3.5 text-cyan-400" />
            <span className="font-semibold text-zinc-300">Live Audio Signal Visualizer</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setVisualizerType("spectrum")}
              className={`px-2 py-0.5 rounded text-[11px] font-medium cursor-pointer ${
                visualizerType === "spectrum"
                  ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              Spectrum FFT
            </button>
            <button
              onClick={() => setVisualizerType("waveform")}
              className={`px-2 py-0.5 rounded text-[11px] font-medium cursor-pointer ${
                visualizerType === "waveform"
                  ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              Waveform
            </button>
          </div>
        </div>

        <canvas
          ref={canvasRef}
          width={800}
          height={75}
          className="w-full h-[75px] rounded-xl block"
        />
      </div>

      {/* MAIN INSTRUMENTS STACK */}
      <div className="flex flex-col gap-6">
        {/* DRUM MACHINE */}
        {(viewMode === "studio" || viewMode === "drums") && (
          <div>
            <div className="flex items-center gap-2 mb-2 font-bold text-sm text-zinc-300">
              <Zap className="w-4 h-4 text-amber-400" />
              <span>16-Step Programmable Drum Sequencer & MPC Pad Engine</span>
            </div>
            <DrumMachine theme={theme} />
          </div>
        )}

        {/* VIRTUAL GRAND PIANO */}
        {(viewMode === "studio" || viewMode === "piano") && (
          <div>
            <div className="flex items-center gap-2 mb-2 font-bold text-sm text-zinc-300">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <span>Polyphonic Virtual Piano (Multi-Octave Keyboard & Arpeggiator)</span>
            </div>
            <VirtualPiano theme={theme} />
          </div>
        )}
      </div>
    </div>
  );
};

export default MusicStudioWorkstation;
