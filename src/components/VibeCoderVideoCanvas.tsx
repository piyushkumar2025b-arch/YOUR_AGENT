import React, { useEffect, useRef } from "react";
import vibeCoderImg from "../assets/images/vibe_coder_coffee_1784902039829.jpg";

interface VibeCoderVideoCanvasProps {
  className?: string;
  children?: React.ReactNode;
}

export const VibeCoderVideoCanvas: React.FC<VibeCoderVideoCanvasProps> = ({ className = "", children }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let isVisible = true;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        isVisible = entry.isIntersecting;
        if (isVisible && !animId) {
          animId = requestAnimationFrame(render);
        }
      },
      { threshold: 0.05 }
    );
    observer.observe(canvas);

    const resize = () => {
      canvas.width = canvas.parentElement?.clientWidth || 1000;
      canvas.height = canvas.parentElement?.clientHeight || 600;
    };
    resize();
    window.addEventListener("resize", resize, { passive: true });

    // Code snippets streaming in background canvas
    const codeLines = [
      "const swarm = new AutonomousAgentSwarm({ mode: 'full-stack' });",
      "await swarm.analyzeASTAndBuildFolderTree();",
      "const coffee = await DeveloperMug.refillHotEspresso();",
      "console.log('Synthesizing high-throughput React & Express code...');",
      "if (bugDetected) await QA_Agent.autoFixAndRecompile();",
      "Supabase.syncPostgresSchema({ SSL: true });",
      "GitHubOAuth.commitAndPushPullRequest('main');",
      "Gemini_2_5_Flash.streamCodeCompletion(prompt);"
    ];

    const particles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      alpha: number;
      text?: string;
      color: string;
    }> = [];

    for (let i = 0; i < 14; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: -0.2 - Math.random() * 0.4,
        size: 10 + Math.random() * 4,
        alpha: 0.15 + Math.random() * 0.4,
        text: codeLines[i % codeLines.length],
        color: i % 2 === 0 ? "#06b6d4" : "#818cf8"
      });
    }

    const render = () => {
      if (!isVisible) {
        animId = 0;
        return;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      ctx.font = "11px monospace";

      for (let p of particles) {
        p.y += p.vy;
        p.x += p.vx;

        if (p.y < -20) {
          p.y = canvas.height + 20;
          p.x = Math.random() * canvas.width;
        }

        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        if (p.text) {
          ctx.fillText(p.text, p.x, p.y);
        }
      }

      ctx.globalAlpha = 1.0;
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", resize);
      if (animId) cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <div className={`relative rounded-3xl overflow-hidden border border-zinc-800 shadow-2xl ${className}`}>
      {/* BACKGROUND VIDEO SIMULATION IMAGE */}
      <div className="absolute inset-0 z-0">
        <img
          src={vibeCoderImg}
          alt="Developer Working & Drinking Coffee Background"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover opacity-35 filter brightness-90 contrast-125 saturate-120 scale-105 transition-all duration-1000"
        />
        {/* VIBE OVERLAY GRADIENTS */}
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/80 to-zinc-950/60" />
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-950/40 via-transparent to-cyan-950/40" />
      </div>

      {/* ANIMATED MATRIX CODE PARTICLES CANVAS */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none z-10 opacity-70"
      />

      {/* VIDEO STATUS HEADER BADGE */}
      <div className="relative z-20 px-6 pt-6 flex items-center justify-between">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-950/80 backdrop-blur-md border border-cyan-500/30 text-[10px] font-mono text-cyan-300 shadow-lg">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
          <span>● LIVE WORKSPACE FEED — CODER AT WORK (4K STREAM)</span>
        </div>
        <div className="hidden sm:inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-950/80 backdrop-blur-md border border-zinc-800 text-[10px] font-mono text-amber-400">
          <span>☕ Coffee Status: Brewing / Sucking Code</span>
        </div>
      </div>

      {/* CARD CONTENT */}
      <div className="relative z-20 p-6 sm:p-8">
        {children}
      </div>
    </div>
  );
};
