import React, { useState, useEffect, useRef } from "react";
import { Play, RotateCcw, Trophy, Shield, Zap, Sparkles, Flame } from "lucide-react";

export const BreakoutGame: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [score, setScore] = useState<number>(0);
  const [highScore, setHighScore] = useState<number>(() => {
    return parseInt(localStorage.getItem("breakout_high") || "0", 10);
  });
  const [lives, setLives] = useState<number>(3);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [won, setWon] = useState<boolean>(false);

  const CANVAS_WIDTH = 440;
  const CANVAS_HEIGHT = 360;
  const PADDLE_WIDTH = 75;
  const PADDLE_HEIGHT = 10;
  const BALL_RADIUS = 6;
  const BRICK_ROWS = 5;
  const BRICK_COLS = 7;
  const BRICK_HEIGHT = 16;
  const BRICK_PADDING = 6;
  const BRICK_OFFSET_TOP = 35;
  const BRICK_OFFSET_LEFT = 15;

  const BRICK_WIDTH = Math.floor(
    (CANVAS_WIDTH - BRICK_OFFSET_LEFT * 2 - (BRICK_COLS - 1) * BRICK_PADDING) / BRICK_COLS
  );

  const stateRef = useRef({
    paddleX: CANVAS_WIDTH / 2 - PADDLE_WIDTH / 2,
    ballX: CANVAS_WIDTH / 2,
    ballY: CANVAS_HEIGHT - 30,
    ballSpeedX: 3.5,
    ballSpeedY: -3.5,
    bricks: [] as { x: number; y: number; hits: number; color: string; pts: number }[],
    keys: { left: false, right: false }
  });

  const initBricks = () => {
    const colors = ["#f43f5e", "#fbbf24", "#38bdf8", "#a855f7", "#34d399"];
    const points = [50, 40, 30, 20, 10];
    const newBricks = [];

    for (let r = 0; r < BRICK_ROWS; r++) {
      for (let c = 0; c < BRICK_COLS; c++) {
        const brickX = c * (BRICK_WIDTH + BRICK_PADDING) + BRICK_OFFSET_LEFT;
        const brickY = r * (BRICK_HEIGHT + BRICK_PADDING) + BRICK_OFFSET_TOP;
        newBricks.push({
          x: brickX,
          y: brickY,
          hits: r === 0 ? 2 : 1, // Top row requires 2 hits
          color: colors[r],
          pts: points[r]
        });
      }
    }
    return newBricks;
  };

  const startGame = () => {
    stateRef.current.bricks = initBricks();
    stateRef.current.paddleX = CANVAS_WIDTH / 2 - PADDLE_WIDTH / 2;
    stateRef.current.ballX = CANVAS_WIDTH / 2;
    stateRef.current.ballY = CANVAS_HEIGHT - 35;
    stateRef.current.ballSpeedX = (Math.random() > 0.5 ? 1 : -1) * 3.5;
    stateRef.current.ballSpeedY = -3.5;
    setScore(0);
    setLives(3);
    setGameOver(false);
    setWon(false);
    setIsPlaying(true);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (["ArrowLeft", "a", "A"].includes(e.key)) stateRef.current.keys.left = true;
      if (["ArrowRight", "d", "D"].includes(e.key)) stateRef.current.keys.right = true;
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (["ArrowLeft", "a", "A"].includes(e.key)) stateRef.current.keys.left = false;
      if (["ArrowRight", "d", "D"].includes(e.key)) stateRef.current.keys.right = false;
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  useEffect(() => {
    if (!isPlaying || gameOver || won) return;

    let animId: number;

    const gameLoop = () => {
      const state = stateRef.current;

      // Move Paddle
      if (state.keys.left) state.paddleX = Math.max(0, state.paddleX - 6.5);
      if (state.keys.right) state.paddleX = Math.min(CANVAS_WIDTH - PADDLE_WIDTH, state.paddleX + 6.5);

      // Move Ball
      state.ballX += state.ballSpeedX;
      state.ballY += state.ballSpeedY;

      // Wall Collisions
      if (state.ballX <= BALL_RADIUS || state.ballX >= CANVAS_WIDTH - BALL_RADIUS) {
        state.ballSpeedX = -state.ballSpeedX;
      }
      if (state.ballY <= BALL_RADIUS) {
        state.ballSpeedY = -state.ballSpeedY;
      }

      // Bottom Collision (Lose Life)
      if (state.ballY >= CANVAS_HEIGHT - BALL_RADIUS) {
        setLives((prev) => {
          const newLives = prev - 1;
          if (newLives <= 0) {
            setGameOver(true);
            setIsPlaying(false);
          } else {
            // Reset ball position
            state.ballX = state.paddleX + PADDLE_WIDTH / 2;
            state.ballY = CANVAS_HEIGHT - 35;
            state.ballSpeedY = -3.5;
            state.ballSpeedX = (Math.random() > 0.5 ? 1 : -1) * 3.5;
          }
          return newLives;
        });
      }

      // Paddle Collision
      if (
        state.ballY + BALL_RADIUS >= CANVAS_HEIGHT - 20 - PADDLE_HEIGHT &&
        state.ballY - BALL_RADIUS <= CANVAS_HEIGHT - 20 &&
        state.ballX >= state.paddleX &&
        state.ballX <= state.paddleX + PADDLE_WIDTH
      ) {
        state.ballSpeedY = -Math.abs(state.ballSpeedY);
        const hitPos = (state.ballX - (state.paddleX + PADDLE_WIDTH / 2)) / (PADDLE_WIDTH / 2);
        state.ballSpeedX = hitPos * 5;
      }

      // Brick Collision
      state.bricks.forEach((brick) => {
        if (brick.hits > 0) {
          if (
            state.ballX + BALL_RADIUS >= brick.x &&
            state.ballX - BALL_RADIUS <= brick.x + BRICK_WIDTH &&
            state.ballY + BALL_RADIUS >= brick.y &&
            state.ballY - BALL_RADIUS <= brick.y + BRICK_HEIGHT
          ) {
            state.ballSpeedY = -state.ballSpeedY;
            brick.hits--;

            if (brick.hits === 0) {
              setScore((s) => {
                const newS = s + brick.pts;
                if (newS > highScore) {
                  setHighScore(newS);
                  localStorage.setItem("breakout_high", newS.toString());
                }
                return newS;
              });
            }
          }
        }
      });

      // Win Condition Check
      if (state.bricks.every((b) => b.hits === 0)) {
        setWon(true);
        setIsPlaying(false);
        return;
      }

      // Render Canvas
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext("2d");
        if (ctx) {
          // Clear
          ctx.fillStyle = "#090d16";
          ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

          // Draw Bricks
          state.bricks.forEach((brick) => {
            if (brick.hits > 0) {
              ctx.fillStyle = brick.hits === 2 ? "#e11d48" : brick.color;
              ctx.shadowColor = brick.color;
              ctx.shadowBlur = 8;
              ctx.beginPath();
              ctx.roundRect(brick.x, brick.y, BRICK_WIDTH, BRICK_HEIGHT, 4);
              ctx.fill();
              ctx.shadowBlur = 0;
            }
          });

          // Draw Paddle
          ctx.fillStyle = "#38bdf8";
          ctx.shadowColor = "#38bdf8";
          ctx.shadowBlur = 10;
          ctx.beginPath();
          ctx.roundRect(state.paddleX, CANVAS_HEIGHT - 20, PADDLE_WIDTH, PADDLE_HEIGHT, 5);
          ctx.fill();

          // Draw Ball
          ctx.fillStyle = "#fbbf24";
          ctx.shadowColor = "#fbbf24";
          ctx.shadowBlur = 12;
          ctx.beginPath();
          ctx.arc(state.ballX, state.ballY, BALL_RADIUS, 0, Math.PI * 2);
          ctx.fill();

          ctx.shadowBlur = 0;
        }
      }

      animId = requestAnimationFrame(gameLoop);
    };

    animId = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(animId);
  }, [isPlaying, gameOver, won, highScore]);

  return (
    <div className="flex flex-col items-center space-y-4 max-w-md mx-auto w-full">
      {/* Header */}
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center gap-2">
          <Flame className="w-5 h-5 text-rose-500 animate-pulse" />
          <h2 className="text-sm font-bold text-white">Cyber Brick Breaker</h2>
        </div>
        <button
          onClick={startGame}
          className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs text-slate-300 transition-all cursor-pointer flex items-center gap-1"
        >
          <RotateCcw className="w-3.5 h-3.5" /> Reset
        </button>
      </div>

      {/* Score & Lives Banner */}
      <div className="grid grid-cols-3 gap-2 w-full text-center">
        <div className="p-2.5 rounded-2xl bg-[#111723] border border-zinc-800">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Score</span>
          <p className="text-base font-black text-amber-400 font-mono">{score}</p>
        </div>
        <div className="p-2.5 rounded-2xl bg-[#111723] border border-zinc-800">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Best</span>
          <p className="text-base font-black text-cyan-400 font-mono">{highScore}</p>
        </div>
        <div className="p-2.5 rounded-2xl bg-[#111723] border border-zinc-800">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Shield Lives</span>
          <p className="text-base font-black text-rose-400 font-mono">{"❤️".repeat(lives)}</p>
        </div>
      </div>

      {/* Canvas Container */}
      <div className="relative border-2 border-rose-500/40 rounded-2xl overflow-hidden shadow-2xl bg-[#090d16]">
        <canvas ref={canvasRef} width={CANVAS_WIDTH} height={CANVAS_HEIGHT} className="block w-full max-w-[440px]" />

        {(!isPlaying || gameOver || won) && (
          <div className="absolute inset-0 bg-black/85 backdrop-blur-sm flex flex-col items-center justify-center p-6 space-y-3 text-center z-10">
            {won ? (
              <>
                <Trophy className="w-12 h-12 text-amber-400 animate-bounce" />
                <h3 className="text-xl font-black text-white">CYBER MATRIX DESTROYED!</h3>
                <p className="text-xs text-slate-300">Final Score: <strong className="text-amber-400">{score}</strong></p>
              </>
            ) : gameOver ? (
              <>
                <div className="text-3xl">💥</div>
                <h3 className="text-lg font-bold text-rose-400">SHIELD DEFENSES DEFEATED!</h3>
                <p className="text-xs text-slate-400">Score: {score} pts</p>
              </>
            ) : (
              <>
                <Flame className="w-10 h-10 text-rose-500 animate-bounce" />
                <h3 className="text-lg font-bold text-white">Breakout Arcade</h3>
                <p className="text-xs text-slate-400">Use A/D or Left/Right Arrow keys to control paddle.</p>
              </>
            )}

            <button
              onClick={startGame}
              className="px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs shadow-lg shadow-rose-600/30 cursor-pointer transition-all flex items-center gap-1.5"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>{gameOver || won ? "Replay Stage" : "Start Launch"}</span>
            </button>
          </div>
        )}
      </div>

      {/* Touch Paddle Buttons */}
      <div className="flex gap-4 w-full">
        <button
          onMouseDown={() => (stateRef.current.keys.left = true)}
          onMouseUp={() => (stateRef.current.keys.left = false)}
          onTouchStart={() => (stateRef.current.keys.left = true)}
          onTouchEnd={() => (stateRef.current.keys.left = false)}
          className="flex-1 py-3 bg-zinc-800 hover:bg-zinc-700 text-cyan-400 rounded-xl font-extrabold text-xs cursor-pointer active:scale-95"
        >
          ◀ MOVE LEFT
        </button>
        <button
          onMouseDown={() => (stateRef.current.keys.right = true)}
          onMouseUp={() => (stateRef.current.keys.right = false)}
          onTouchStart={() => (stateRef.current.keys.right = true)}
          onTouchEnd={() => (stateRef.current.keys.right = false)}
          className="flex-1 py-3 bg-zinc-800 hover:bg-zinc-700 text-cyan-400 rounded-xl font-extrabold text-xs cursor-pointer active:scale-95"
        >
          MOVE RIGHT ▶
        </button>
      </div>
    </div>
  );
};
