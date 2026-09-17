import React, { useState, useEffect, useRef } from "react";
import { Play, RotateCcw, Trophy, Rocket, Zap, Sparkles } from "lucide-react";

export const FlappyRocketGame: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [score, setScore] = useState<number>(0);
  const [highScore, setHighScore] = useState<number>(() => {
    return parseInt(localStorage.getItem("flappy_high") || "0", 10);
  });
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [gameOver, setGameOver] = useState<boolean>(false);

  const CANVAS_WIDTH = 380;
  const CANVAS_HEIGHT = 420;
  const GRAVITY = 0.45;
  const THRUST = -7.5;
  const PIPE_SPEED = 2.8;
  const PIPE_SPAWN_RATE = 80; // frames
  const GAP_SIZE = 110;

  const stateRef = useRef({
    rocketY: 180,
    velocity: 0,
    pipes: [] as { x: number; topHeight: number; passed: boolean }[],
    frameCount: 0
  });

  const startGame = () => {
    stateRef.current = {
      rocketY: 180,
      velocity: 0,
      pipes: [],
      frameCount: 0
    };
    setScore(0);
    setGameOver(false);
    setIsPlaying(true);
  };

  const handleThrust = () => {
    if (!isPlaying) {
      if (gameOver || !isPlaying) startGame();
      return;
    }
    stateRef.current.velocity = THRUST;
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ([" ", "ArrowUp", "w", "W"].includes(e.key)) {
        e.preventDefault();
        handleThrust();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isPlaying, gameOver]);

  useEffect(() => {
    if (!isPlaying || gameOver) return;

    let animId: number;

    const gameLoop = () => {
      const state = stateRef.current;
      state.frameCount++;

      // Apply Gravity
      state.velocity += GRAVITY;
      state.rocketY += state.velocity;

      // Spawn Pipes
      if (state.frameCount % PIPE_SPAWN_RATE === 0) {
        const minHeight = 40;
        const maxHeight = CANVAS_HEIGHT - GAP_SIZE - minHeight;
        const topHeight = Math.floor(Math.random() * (maxHeight - minHeight + 1)) + minHeight;
        state.pipes.push({ x: CANVAS_WIDTH, topHeight, passed: false });
      }

      // Move & Filter Pipes
      state.pipes.forEach((pipe) => {
        pipe.x -= PIPE_SPEED;

        // Check Passed
        if (!pipe.passed && pipe.x < 60) {
          pipe.passed = true;
          setScore((s) => {
            const newS = s + 1;
            if (newS > highScore) {
              setHighScore(newS);
              localStorage.setItem("flappy_high", newS.toString());
            }
            return newS;
          });
        }
      });

      state.pipes = state.pipes.filter((pipe) => pipe.x > -60);

      // Floor / Ceiling Collision
      if (state.rocketY <= 0 || state.rocketY >= CANVAS_HEIGHT - 20) {
        setGameOver(true);
        setIsPlaying(false);
        return;
      }

      // Pipe Collisions
      const rocketX = 60;
      const rocketSize = 18;

      for (const pipe of state.pipes) {
        if (pipe.x < rocketX + rocketSize && pipe.x + 45 > rocketX) {
          // Check top pipe or bottom pipe collision
          if (
            state.rocketY < pipe.topHeight ||
            state.rocketY + rocketSize > pipe.topHeight + GAP_SIZE
          ) {
            setGameOver(true);
            setIsPlaying(false);
            return;
          }
        }
      }

      // Render Canvas
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext("2d");
        if (ctx) {
          // Background
          ctx.fillStyle = "#0a0e17";
          ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

          // Grid lines background
          ctx.strokeStyle = "#131b2e";
          ctx.lineWidth = 1;
          for (let x = 0; x < CANVAS_WIDTH; x += 30) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, CANVAS_HEIGHT);
            ctx.stroke();
          }

          // Draw Cyber Barriers (Pipes)
          state.pipes.forEach((pipe) => {
            // Top Pipe
            ctx.fillStyle = "#101d36";
            ctx.strokeStyle = "#06b6d4";
            ctx.lineWidth = 2;

            ctx.fillRect(pipe.x, 0, 45, pipe.topHeight);
            ctx.strokeRect(pipe.x, 0, 45, pipe.topHeight);

            // Bottom Pipe
            const bottomY = pipe.topHeight + GAP_SIZE;
            const bottomH = CANVAS_HEIGHT - bottomY;
            ctx.fillRect(pipe.x, bottomY, 45, bottomH);
            ctx.strokeRect(pipe.x, bottomY, 45, bottomH);

            // Barrier End Glow Caps
            ctx.fillStyle = "#06b6d4";
            ctx.fillRect(pipe.x - 2, pipe.topHeight - 6, 49, 6);
            ctx.fillRect(pipe.x - 2, bottomY, 49, 6);
          });

          // Draw Rocket
          ctx.save();
          ctx.translate(rocketX + 10, state.rocketY + 10);
          const rotation = Math.min(Math.PI / 4, Math.max(-Math.PI / 4, (state.velocity * 0.1)));
          ctx.rotate(rotation);

          // Rocket Body
          ctx.fillStyle = "#f59e0b";
          ctx.shadowColor = "#f59e0b";
          ctx.shadowBlur = 12;
          ctx.beginPath();
          ctx.arc(0, 0, 10, 0, Math.PI * 2);
          ctx.fill();

          // Thruster Flame
          ctx.fillStyle = "#ef4444";
          ctx.beginPath();
          ctx.arc(-12, 0, 5, 0, Math.PI * 2);
          ctx.fill();

          ctx.restore();
        }
      }

      animId = requestAnimationFrame(gameLoop);
    };

    animId = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(animId);
  }, [isPlaying, gameOver, highScore]);

  return (
    <div className="flex flex-col items-center space-y-4 max-w-md mx-auto w-full">
      {/* Top Header */}
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center gap-2">
          <Rocket className="w-5 h-5 text-amber-400 animate-bounce" />
          <h2 className="text-sm font-bold text-white">Flappy Rocket Dodger</h2>
        </div>
        <button
          onClick={startGame}
          className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs text-slate-300 transition-all cursor-pointer flex items-center gap-1"
        >
          <RotateCcw className="w-3.5 h-3.5" /> Reset
        </button>
      </div>

      {/* Scores Banner */}
      <div className="grid grid-cols-2 gap-3 w-full">
        <div className="p-3 rounded-2xl bg-[#111723] border border-zinc-800 text-center">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Score</span>
          <p className="text-lg font-black text-amber-400 font-mono">{score}</p>
        </div>
        <div className="p-3 rounded-2xl bg-[#111723] border border-zinc-800 text-center">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Best</span>
          <p className="text-lg font-black text-cyan-400 font-mono">{highScore}</p>
        </div>
      </div>

      {/* Game Stage Canvas */}
      <div
        onClick={handleThrust}
        className="relative border-2 border-amber-500/40 rounded-2xl overflow-hidden shadow-2xl bg-[#0a0e17] cursor-pointer"
      >
        <canvas ref={canvasRef} width={CANVAS_WIDTH} height={CANVAS_HEIGHT} className="block w-full max-w-[380px]" />

        {(!isPlaying || gameOver) && (
          <div className="absolute inset-0 bg-black/85 backdrop-blur-sm flex flex-col items-center justify-center p-6 space-y-3 text-center z-10">
            {gameOver ? (
              <>
                <div className="text-4xl">💥</div>
                <h3 className="text-xl font-black text-rose-400">CRASH LANDING!</h3>
                <p className="text-xs text-slate-300">Final Score: <strong className="text-amber-400">{score}</strong></p>
              </>
            ) : (
              <>
                <Rocket className="w-12 h-12 text-amber-400 animate-pulse" />
                <h3 className="text-lg font-bold text-white">Flappy Cyber Rocket</h3>
                <p className="text-xs text-slate-400">Tap / Click or Press SPACE to thrust up!</p>
              </>
            )}

            <button
              onClick={startGame}
              className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs shadow-lg shadow-amber-500/20 cursor-pointer transition-all flex items-center gap-1.5"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>{gameOver ? "Fly Again" : "Launch Rocket"}</span>
            </button>
          </div>
        )}
      </div>

      {/* Onscreen Thrust Button for mobile/click */}
      <button
        onClick={handleThrust}
        className="w-full py-3 bg-amber-500/20 border border-amber-500/40 hover:bg-amber-500/30 text-amber-300 font-extrabold text-xs rounded-xl flex items-center justify-center gap-2 cursor-pointer active:scale-98 transition-all"
      >
        <Zap className="w-4 h-4 fill-amber-300" />
        <span>TAP TO THRUST UP</span>
      </button>
    </div>
  );
};
