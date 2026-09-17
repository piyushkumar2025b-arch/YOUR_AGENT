import React, { useState, useEffect, useRef } from "react";
import { Play, Pause, RotateCcw, Trophy, Swords, Zap, ArrowUp, ArrowDown } from "lucide-react";

export const CyberPongGame: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [playerScore, setPlayerScore] = useState<number>(0);
  const [aiScore, setAiScore] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [winner, setWinner] = useState<"player" | "ai" | null>(null);
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "cyber">("medium");

  const CANVAS_WIDTH = 480;
  const CANVAS_HEIGHT = 320;
  const PADDLE_WIDTH = 10;
  const PADDLE_HEIGHT = 60;
  const BALL_SIZE = 8;
  const WINNING_SCORE = 7;

  const gameState = useRef({
    playerY: CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2,
    aiY: CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2,
    ballX: CANVAS_WIDTH / 2,
    ballY: CANVAS_HEIGHT / 2,
    ballSpeedX: 4,
    ballSpeedY: 3,
    keys: { up: false, down: false }
  });

  const resetBall = (direction: number) => {
    gameState.current.ballX = CANVAS_WIDTH / 2;
    gameState.current.ballY = CANVAS_HEIGHT / 2;
    const speedMultiplier = difficulty === "cyber" ? 5 : difficulty === "medium" ? 4 : 3;
    gameState.current.ballSpeedX = direction * speedMultiplier;
    gameState.current.ballSpeedY = (Math.random() - 0.5) * 4;
  };

  const startGame = () => {
    setPlayerScore(0);
    setAiScore(0);
    setGameOver(false);
    setWinner(null);
    gameState.current.playerY = CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2;
    gameState.current.aiY = CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2;
    resetBall(1);
    setIsPlaying(true);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (["ArrowUp", "w", "W"].includes(e.key)) gameState.current.keys.up = true;
      if (["ArrowDown", "s", "S"].includes(e.key)) gameState.current.keys.down = true;
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (["ArrowUp", "w", "W"].includes(e.key)) gameState.current.keys.up = false;
      if (["ArrowDown", "s", "S"].includes(e.key)) gameState.current.keys.down = false;
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  useEffect(() => {
    if (!isPlaying || gameOver) return;

    let animId: number;

    const gameLoop = () => {
      const state = gameState.current;

      // Player Movement
      if (state.keys.up) state.playerY = Math.max(0, state.playerY - 6);
      if (state.keys.down) state.playerY = Math.min(CANVAS_HEIGHT - PADDLE_HEIGHT, state.playerY + 6);

      // AI Movement
      const aiSpeed = difficulty === "cyber" ? 5.5 : difficulty === "medium" ? 3.8 : 2.5;
      const aiCenter = state.aiY + PADDLE_HEIGHT / 2;
      if (aiCenter < state.ballY - 10) {
        state.aiY = Math.min(CANVAS_HEIGHT - PADDLE_HEIGHT, state.aiY + aiSpeed);
      } else if (aiCenter > state.ballY + 10) {
        state.aiY = Math.max(0, state.aiY - aiSpeed);
      }

      // Ball Movement
      state.ballX += state.ballSpeedX;
      state.ballY += state.ballSpeedY;

      // Top/Bottom bounce
      if (state.ballY <= 0 || state.ballY >= CANVAS_HEIGHT - BALL_SIZE) {
        state.ballSpeedY = -state.ballSpeedY;
      }

      // Left Paddle Collision (Player)
      if (
        state.ballX <= PADDLE_WIDTH + 10 &&
        state.ballY + BALL_SIZE >= state.playerY &&
        state.ballY <= state.playerY + PADDLE_HEIGHT
      ) {
        state.ballSpeedX = Math.abs(state.ballSpeedX) * 1.05; // speed up slightly
        const hitPos = (state.ballY - (state.playerY + PADDLE_HEIGHT / 2)) / (PADDLE_HEIGHT / 2);
        state.ballSpeedY = hitPos * 5;
        state.ballX = PADDLE_WIDTH + 10;
      }

      // Right Paddle Collision (AI)
      if (
        state.ballX >= CANVAS_WIDTH - PADDLE_WIDTH - 10 - BALL_SIZE &&
        state.ballY + BALL_SIZE >= state.aiY &&
        state.ballY <= state.aiY + PADDLE_HEIGHT
      ) {
        state.ballSpeedX = -Math.abs(state.ballSpeedX) * 1.05;
        const hitPos = (state.ballY - (state.aiY + PADDLE_HEIGHT / 2)) / (PADDLE_HEIGHT / 2);
        state.ballSpeedY = hitPos * 5;
        state.ballX = CANVAS_WIDTH - PADDLE_WIDTH - 10 - BALL_SIZE;
      }

      // Score logic
      if (state.ballX < 0) {
        // AI Point
        setAiScore((prev) => {
          const newScore = prev + 1;
          if (newScore >= WINNING_SCORE) {
            setGameOver(true);
            setWinner("ai");
            setIsPlaying(false);
          } else {
            resetBall(1);
          }
          return newScore;
        });
      } else if (state.ballX > CANVAS_WIDTH) {
        // Player Point
        setPlayerScore((prev) => {
          const newScore = prev + 1;
          if (newScore >= WINNING_SCORE) {
            setGameOver(true);
            setWinner("player");
            setIsPlaying(false);
          } else {
            resetBall(-1);
          }
          return newScore;
        });
      }

      // Render Canvas
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext("2d");
        if (ctx) {
          // Dark Arena background
          ctx.fillStyle = "#090d16";
          ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

          // Center dashed line
          ctx.strokeStyle = "#1e293b";
          ctx.lineWidth = 2;
          ctx.setLineDash([6, 6]);
          ctx.beginPath();
          ctx.moveTo(CANVAS_WIDTH / 2, 0);
          ctx.lineTo(CANVAS_WIDTH / 2, CANVAS_HEIGHT);
          ctx.stroke();
          ctx.setLineDash([]);

          // Player Paddle (Cyan)
          ctx.fillStyle = "#06b6d4";
          ctx.shadowColor = "#06b6d4";
          ctx.shadowBlur = 10;
          ctx.fillRect(10, state.playerY, PADDLE_WIDTH, PADDLE_HEIGHT);

          // AI Paddle (Rose)
          ctx.fillStyle = "#f43f5e";
          ctx.shadowColor = "#f43f5e";
          ctx.shadowBlur = 10;
          ctx.fillRect(CANVAS_WIDTH - 10 - PADDLE_WIDTH, state.aiY, PADDLE_WIDTH, PADDLE_HEIGHT);

          // Ball (Glowing Amber)
          ctx.fillStyle = "#fbbf24";
          ctx.shadowColor = "#fbbf24";
          ctx.shadowBlur = 12;
          ctx.beginPath();
          ctx.arc(state.ballX, state.ballY, BALL_SIZE, 0, Math.PI * 2);
          ctx.fill();

          ctx.shadowBlur = 0; // reset
        }
      }

      animId = requestAnimationFrame(gameLoop);
    };

    animId = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(animId);
  }, [isPlaying, gameOver, difficulty]);

  return (
    <div className="flex flex-col items-center space-y-4 max-w-lg mx-auto w-full">
      {/* Header Controls */}
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center gap-2">
          <Swords className="w-5 h-5 text-cyan-400" />
          <h2 className="text-sm font-bold text-white">Cyber Pong Air Hockey</h2>
        </div>

        <div className="flex items-center gap-2">
          {/* Difficulty selector */}
          <div className="flex bg-zinc-900 border border-zinc-800 rounded-xl p-1 text-[11px] font-bold">
            {(["easy", "medium", "cyber"] as const).map((d) => (
              <button
                key={d}
                onClick={() => setDifficulty(d)}
                className={`px-2.5 py-1 rounded-lg capitalize transition-all cursor-pointer ${
                  difficulty === d ? "bg-cyan-600 text-white" : "text-slate-400 hover:text-white"
                }`}
              >
                {d}
              </button>
            ))}
          </div>

          <button
            onClick={startGame}
            className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs text-slate-300 transition-all cursor-pointer flex items-center gap-1"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reset
          </button>
        </div>
      </div>

      {/* Score Banner */}
      <div className="flex items-center justify-between w-full px-6 py-2.5 rounded-2xl bg-[#111723] border border-zinc-800 font-mono">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-cyan-400 shadow-sm shadow-cyan-400" />
          <span className="text-xs text-slate-300 font-bold">YOU (Cyan):</span>
          <span className="text-lg font-black text-cyan-400">{playerScore}</span>
        </div>
        <span className="text-xs text-slate-500 font-bold">FIRST TO 7</span>
        <div className="flex items-center gap-2">
          <span className="text-lg font-black text-rose-400">{aiScore}</span>
          <span className="text-xs text-slate-300 font-bold">:AI (Rose)</span>
          <div className="w-3 h-3 rounded-full bg-rose-400 shadow-sm shadow-rose-400" />
        </div>
      </div>

      {/* Game Canvas Container */}
      <div className="relative border-2 border-cyan-500/40 rounded-2xl overflow-hidden shadow-2xl bg-[#090d16]">
        <canvas ref={canvasRef} width={CANVAS_WIDTH} height={CANVAS_HEIGHT} className="block w-full max-w-[480px]" />

        {(!isPlaying || gameOver) && (
          <div className="absolute inset-0 bg-black/85 backdrop-blur-sm flex flex-col items-center justify-center p-6 space-y-3 text-center z-10">
            {gameOver ? (
              <>
                <Trophy className={`w-12 h-12 ${winner === "player" ? "text-cyan-400 animate-bounce" : "text-rose-500"}`} />
                <h3 className="text-xl font-black text-white">
                  {winner === "player" ? "🎉 VICTORY! YOU DEFEATED CYBER AI" : "🤖 CYBER AI WINS!"}
                </h3>
                <p className="text-xs text-slate-400">Final Score: {playerScore} - {aiScore}</p>
              </>
            ) : (
              <>
                <Zap className="w-10 h-10 text-cyan-400 animate-pulse" />
                <h3 className="text-lg font-bold text-white">Cyber Pong Challenge</h3>
                <p className="text-xs text-slate-400">Controls: Use W/S or UP/DOWN Arrow keys to move your paddle.</p>
              </>
            )}

            <button
              onClick={startGame}
              className="px-6 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-extrabold text-xs shadow-lg shadow-cyan-600/30 cursor-pointer transition-all flex items-center gap-1.5"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>{gameOver ? "Play Again" : "Start Match"}</span>
            </button>
          </div>
        )}
      </div>

      {/* Touch / Onscreen Controls */}
      <div className="flex gap-4">
        <button
          onMouseDown={() => (gameState.current.keys.up = true)}
          onMouseUp={() => (gameState.current.keys.up = false)}
          onTouchStart={() => (gameState.current.keys.up = true)}
          onTouchEnd={() => (gameState.current.keys.up = false)}
          className="px-6 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-cyan-400 rounded-xl font-extrabold text-xs flex items-center gap-1 cursor-pointer"
        >
          <ArrowUp className="w-4 h-4" /> Move Up
        </button>
        <button
          onMouseDown={() => (gameState.current.keys.down = true)}
          onMouseUp={() => (gameState.current.keys.down = false)}
          onTouchStart={() => (gameState.current.keys.down = true)}
          onTouchEnd={() => (gameState.current.keys.down = false)}
          className="px-6 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-cyan-400 rounded-xl font-extrabold text-xs flex items-center gap-1 cursor-pointer"
        >
          <ArrowDown className="w-4 h-4" /> Move Down
        </button>
      </div>
    </div>
  );
};
