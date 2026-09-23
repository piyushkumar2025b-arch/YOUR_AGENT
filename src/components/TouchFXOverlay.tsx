import React, { useEffect, useState, useRef } from "react";
import { Volume2, VolumeX, Sparkles, MousePointer, Flame, Layers } from "lucide-react";

interface TouchRipple {
  id: number;
  x: number;
  y: number;
  color: string;
  size: number;
}

interface TouchFXOverlayProps {
  theme?: "light" | "dark";
  soundEnabled?: boolean;
  onToggleSound?: () => void;
  fxEnabled?: boolean;
}

export const TouchFXOverlay: React.FC<TouchFXOverlayProps> = React.memo(({
  theme = "dark",
  soundEnabled = false,
  onToggleSound,
  fxEnabled = true
}) => {
  const [ripples, setRipples] = useState<TouchRipple[]>([]);
  const audioCtxRef = useRef<AudioContext | null>(null);

  // Colors for ripples
  const COLORS = [
    "rgba(99, 102, 241, 0.5)",   // Indigo
    "rgba(168, 85, 247, 0.5)",  // Purple
    "rgba(6, 182, 212, 0.5)",   // Cyan
  ];

  // Web Audio Synthesizer for tactile feedback
  const playTactileSound = (freq = 800, duration = 0.03) => {
    if (!soundEnabled) return;
    try {
      if (!audioCtxRef.current) {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioContextClass) {
          audioCtxRef.current = new AudioContextClass();
        }
      }
      const ctx = audioCtxRef.current;
      if (!ctx) return;
      if (ctx.state === "suspended") {
        ctx.resume();
      }

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(freq * 0.4, ctx.currentTime + duration);

      gain.gain.setValueAtTime(0.02, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch {
      // Audio context error fallback
    }
  };

  useEffect(() => {
    if (!fxEnabled) return;

    let rippleId = 0;

    const handlePointerDown = (e: PointerEvent) => {
      // Ignore if clicking input, textarea, code editor, or pre
      const target = e.target as HTMLElement;
      if (
        !target ||
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.tagName === "PRE" ||
        target.tagName === "CODE" ||
        target.isContentEditable ||
        target.closest("textarea") ||
        target.closest("pre")
      ) {
        return;
      }

      const color = COLORS[rippleId % COLORS.length];
      const newRipple: TouchRipple = {
        id: ++rippleId,
        x: e.clientX,
        y: e.clientY,
        color,
        size: 36
      };

      setRipples((prev) => [...prev.slice(-3), newRipple]);

      if (soundEnabled) {
        playTactileSound(900, 0.02);
      }

      // Clean up ripple after animation duration
      setTimeout(() => {
        setRipples((prev) => prev.filter((r) => r.id !== newRipple.id));
      }, 500);
    };

    window.addEventListener("pointerdown", handlePointerDown, { passive: true });
    return () => window.removeEventListener("pointerdown", handlePointerDown);
  }, [fxEnabled, soundEnabled]);

  if (!fxEnabled) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-[9999] overflow-hidden">
      {/* Touch & Click Ripples */}
      {ripples.map((ripple) => (
        <div
          key={ripple.id}
          className="absolute rounded-full border-2 animate-ping"
          style={{
            left: ripple.x - ripple.size / 2,
            top: ripple.y - ripple.size / 2,
            width: ripple.size,
            height: ripple.size,
            borderColor: ripple.color,
            boxShadow: `0 0 15px ${ripple.color}, inset 0 0 10px ${ripple.color}`,
            animationDuration: "0.65s"
          }}
        />
      ))}
    </div>
  );
});
