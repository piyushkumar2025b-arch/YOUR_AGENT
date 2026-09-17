import React, { useEffect, useRef, useState } from "react";
import WaveSurfer from "wavesurfer.js";
import { Play, Pause, Volume2, VolumeX } from "lucide-react";

interface WaveformVisualizerProps {
  audioUrl: string;
  waveColor?: string;
  progressColor?: string;
  height?: number;
}

export const WaveformVisualizer: React.FC<WaveformVisualizerProps> = ({
  audioUrl,
  waveColor = "#4f46e5",
  progressColor = "#06b6d4",
  height = 64
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const wavesurferRef = useRef<WaveSurfer | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);

  useEffect(() => {
    if (!containerRef.current || !audioUrl) return;

    const ws = WaveSurfer.create({
      container: containerRef.current,
      waveColor,
      progressColor,
      height,
      barWidth: 2,
      barGap: 3,
      barRadius: 2,
      cursorColor: "#a855f7"
    });

    ws.load(audioUrl);

    ws.on("play", () => setIsPlaying(true));
    ws.on("pause", () => setIsPlaying(false));
    ws.on("finish", () => setIsPlaying(false));

    wavesurferRef.current = ws;

    return () => {
      ws.destroy();
    };
  }, [audioUrl, waveColor, progressColor, height]);

  const togglePlay = () => {
    if (wavesurferRef.current) {
      wavesurferRef.current.playPause();
    }
  };

  const toggleMute = () => {
    if (wavesurferRef.current) {
      const nextMute = !isMuted;
      wavesurferRef.current.setMuted(nextMute);
      setIsMuted(nextMute);
    }
  };

  return (
    <div className="w-full p-4 rounded-2xl border border-zinc-800 bg-zinc-900/90 flex flex-col gap-3 shadow-md">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={togglePlay}
          className="p-2.5 rounded-full bg-cyan-500 hover:bg-cyan-400 text-zinc-950 font-bold transition-all shadow-md active:scale-95 cursor-pointer"
        >
          {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
        </button>

        <div className="flex-1 min-w-0" ref={containerRef} />

        <button
          type="button"
          onClick={toggleMute}
          className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors cursor-pointer"
        >
          {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
        </button>
      </div>
    </div>
  );
};
