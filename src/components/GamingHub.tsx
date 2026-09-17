import React, { useState, useEffect, useRef } from "react";
import {
  Gamepad2,
  Trophy,
  Sparkles,
  Zap,
  RotateCcw,
  Brain,
  HelpCircle,
  Play,
  Check,
  X,
  Flame,
  Award,
  RefreshCw,
  Shuffle,
  Grid,
  Volume2,
  VolumeX,
  Target,
  Grid3X3,
  Swords,
  Layers,
  Rocket,
  Bomb,
  Music
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Game2048 } from "./games/Game2048";
import { CyberPongGame } from "./games/CyberPongGame";
import { MemoryMatchGame } from "./games/MemoryMatchGame";
import { FlappyRocketGame } from "./games/FlappyRocketGame";
import { TicTacToeGame } from "./games/TicTacToeGame";
import { BreakoutGame } from "./games/BreakoutGame";
import { MinesweeperGame } from "./games/MinesweeperGame";
import { SimonSaysGame } from "./games/SimonSaysGame";

interface GamingHubProps {
  apiKey: string;
  selectedModel?: string;
  theme: "light" | "dark";
  onAddLog?: (type: string, message: string) => void;
}

type ActiveGame = "wordle" | "trivia" | "snake" | "invaders" | "game2048" | "pong" | "memory" | "flappy" | "tictactoe" | "breakout" | "minesweeper" | "simon";

/* =========================================================
   4. SPACE INVADERS RETRO ARCADE
   ========================================================= */
const SpaceInvadersGame: React.FC = () => {
  const [playerX, setPlayerX] = useState(180);
  const [bullets, setBullets] = useState<{ id: number; x: number; y: number }[]>([]);
  const [aliens, setAliens] = useState<{ id: number; x: number; y: number; alive: boolean }[]>([]);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  useEffect(() => {
    initGame();
  }, []);

  const initGame = () => {
    const initialAliens = [];
    let id = 1;
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 6; col++) {
        initialAliens.push({ id: id++, x: col * 55 + 30, y: row * 35 + 30, alive: true });
      }
    }
    setAliens(initialAliens);
    setBullets([]);
    setPlayerX(180);
    setScore(0);
    setGameOver(false);
  };

  useEffect(() => {
    if (gameOver) return;
    const interval = setInterval(() => {
      // Move bullets
      setBullets((prevBullets) =>
        prevBullets
          .map((b) => ({ ...b, y: b.y - 12 }))
          .filter((b) => b.y > 0)
      );

      // Check collision
      setBullets((prevBullets) => {
        let remainingBullets = [...prevBullets];
        setAliens((prevAliens) => {
          return prevAliens.map((alien) => {
            if (!alien.alive) return alien;
            const hitIndex = remainingBullets.findIndex(
              (b) => Math.abs(b.x - alien.x) < 20 && Math.abs(b.y - alien.y) < 20
            );
            if (hitIndex !== -1) {
              remainingBullets.splice(hitIndex, 1);
              setScore((s) => s + 100);
              return { ...alien, alive: false };
            }
            return alien;
          });
        });
        return remainingBullets;
      });
    }, 50);

    return () => clearInterval(interval);
  }, [gameOver]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (gameOver) return;
    if (e.key === "ArrowLeft") {
      setPlayerX((x) => Math.max(20, x - 20));
    } else if (e.key === "ArrowRight") {
      setPlayerX((x) => Math.min(360, x + 20));
    } else if (e.key === " " || e.key === "ArrowUp") {
      setBullets((b) => [...b, { id: Date.now(), x: playerX + 15, y: 260 }]);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-4" tabIndex={0} onKeyDown={handleKeyDown}>
      <div className="flex items-center justify-between w-96 text-xs font-mono font-bold text-slate-300">
        <span>SCORE: {score}</span>
        <span>CONTROLS: ← → to Move, SPACE to Shoot</span>
      </div>

      <div className="relative w-96 h-80 bg-zinc-950 rounded-2xl border-2 border-purple-500/40 overflow-hidden shadow-2xl focus:outline-none">
        {/* Aliens */}
        {aliens.map((alien) =>
          alien.alive ? (
            <div
              key={alien.id}
              className="absolute w-8 h-6 bg-purple-500 rounded-sm text-white text-[10px] flex items-center justify-center font-bold shadow-sm animate-pulse"
              style={{ left: `${alien.x}px`, top: `${alien.y}px` }}
            >
              👾
            </div>
          ) : null
        )}

        {/* Bullets */}
        {bullets.map((b) => (
          <div
            key={b.id}
            className="absolute w-1.5 h-4 bg-amber-400 rounded-full shadow-md shadow-amber-400"
            style={{ left: `${b.x}px`, top: `${b.y}px` }}
          />
        ))}

        {/* Player Ship */}
        <div
          className="absolute bottom-2 w-8 h-6 bg-cyan-400 rounded-t-lg flex items-center justify-center text-xs text-black font-bold shadow-lg shadow-cyan-400/50 transition-all duration-75"
          style={{ left: `${playerX}px` }}
        >
          🚀
        </div>

        {aliens.every((a) => !a.alive) && (
          <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center text-center space-y-3">
            <Trophy className="w-10 h-10 text-amber-400 animate-bounce" />
            <h3 className="text-lg font-bold text-white">VICTORY! ALL INVADERS DESTROYED</h3>
            <button
              onClick={initGame}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-xl cursor-pointer"
            >
              Play Again
            </button>
          </div>
        )}
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => setPlayerX((x) => Math.max(20, x - 20))}
          className="px-4 py-2 rounded-xl bg-zinc-800 text-white font-bold text-xs"
        >
          ← Left
        </button>
        <button
          onClick={() => setBullets((b) => [...b, { id: Date.now(), x: playerX + 15, y: 260 }])}
          className="px-6 py-2 rounded-xl bg-purple-600 text-white font-bold text-xs"
        >
          🚀 Shoot
        </button>
        <button
          onClick={() => setPlayerX((x) => Math.min(360, x + 20))}
          className="px-4 py-2 rounded-xl bg-zinc-800 text-white font-bold text-xs"
        >
          Right →
        </button>
      </div>
    </div>
  );
};

/* =========================================================
   1. AI WORDLE / WORD GUESSER
   ========================================================= */
const WORD_LIST = ["REACT", "LOGIC", "PIXEL", "CYBER", "SMART", "BRAIN", "CODEC", "CLOUD", "MODEL", "SWIFT"];

const WordleGame: React.FC<{ apiKey: string; selectedModel?: string }> = ({ apiKey, selectedModel }) => {
  const [targetWord, setTargetWord] = useState("REACT");
  const [guesses, setGuesses] = useState<string[]>([]);
  const [currentGuess, setCurrentGuess] = useState("");
  const [gameStatus, setGameStatus] = useState<"playing" | "won" | "lost">("playing");
  const [hint, setHint] = useState("");
  const [isLoadingHint, setIsLoadingHint] = useState(false);

  useEffect(() => {
    startNewWordle();
  }, []);

  const startNewWordle = () => {
    const randomWord = WORD_LIST[Math.floor(Math.random() * WORD_LIST.length)];
    setTargetWord(randomWord);
    setGuesses([]);
    setCurrentGuess("");
    setGameStatus("playing");
    setHint("");
  };

  const handleKeyPress = (char: string) => {
    if (gameStatus !== "playing") return;

    if (char === "ENTER") {
      if (currentGuess.length === 5) {
        const updated = [...guesses, currentGuess];
        setGuesses(updated);
        setCurrentGuess("");

        if (currentGuess === targetWord) {
          setGameStatus("won");
        } else if (updated.length >= 6) {
          setGameStatus("lost");
        }
      }
    } else if (char === "BACK") {
      setCurrentGuess((prev) => prev.slice(0, -1));
    } else if (currentGuess.length < 5 && /^[A-Z]$/.test(char)) {
      setCurrentGuess((prev) => prev + char);
    }
  };

  const fetchAIHint = async () => {
    setIsLoadingHint(true);
    try {
      const res = await fetch("/api/openrouter/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": apiKey ? `Bearer ${apiKey}` : "" },
        body: JSON.stringify({
          model: selectedModel || "google/gemini-2.5-flash",
          messages: [
            { role: "system", content: "You are a fun Wordle clue master. Give a clever, cryptic 1-sentence hint for the word without revealing the letters directly." },
            { role: "user", content: `Secret Word: ${targetWord}` }
          ]
        })
      });
      if (res.ok) {
        const data = await res.json();
        setHint(data.choices?.[0]?.message?.content || "It's a popular technical term!");
      }
    } catch (err) {
      setHint("Think of modern software & web development!");
    } finally {
      setIsLoadingHint(false);
    }
  };

  const getLetterStatus = (guessWord: string, index: number) => {
    const letter = guessWord[index];
    if (targetWord[index] === letter) return "bg-emerald-600 text-white border-emerald-500";
    if (targetWord.includes(letter)) return "bg-amber-600 text-white border-amber-500";
    return "bg-zinc-800 text-zinc-400 border-zinc-700";
  };

  const KEYBOARD_ROWS = [
    ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
    ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
    ["ENTER", "Z", "X", "C", "V", "B", "N", "M", "BACK"]
  ];

  return (
    <div className="flex flex-col items-center space-y-4 max-w-md mx-auto w-full">
      <div className="flex items-center justify-between w-full">
        <h2 className="text-sm font-bold text-white flex items-center gap-1.5">
          <Target className="w-4 h-4 text-emerald-400" /> AI Word Detective (5-Letter Word)
        </h2>
        <button
          onClick={startNewWordle}
          className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs text-slate-300 transition-all cursor-pointer flex items-center gap-1"
        >
          <RotateCcw className="w-3.5 h-3.5" /> Reset
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-rows-6 gap-2 my-2">
        {Array.from({ length: 6 }).map((_, rowIndex) => {
          const guess = guesses[rowIndex] || (rowIndex === guesses.length ? currentGuess : "");
          return (
            <div key={rowIndex} className="grid grid-cols-5 gap-2">
              {Array.from({ length: 5 }).map((_, colIndex) => {
                const char = guess[colIndex] || "";
                const isSubmitted = rowIndex < guesses.length;
                const statusClass = isSubmitted
                  ? getLetterStatus(guesses[rowIndex], colIndex)
                  : char
                  ? "bg-zinc-900 border-cyan-500 text-white"
                  : "bg-zinc-900/60 border-zinc-800 text-slate-500";

                return (
                  <div
                    key={colIndex}
                    className={`w-11 h-11 border-2 rounded-xl flex items-center justify-center font-extrabold text-base transition-all ${statusClass}`}
                  >
                    {char}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>

      {/* Status banner */}
      {gameStatus === "won" && (
        <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold text-center w-full">
          🎉 Spectacular! You guessed "{targetWord}" in {guesses.length} attempt(s)!
        </div>
      )}
      {gameStatus === "lost" && (
        <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs font-bold text-center w-full">
          ❌ Game Over! The secret word was "{targetWord}".
        </div>
      )}

      {/* AI Hint */}
      <div className="w-full space-y-1">
        {hint ? (
          <div className="p-2.5 rounded-xl bg-cyan-950/40 border border-cyan-800/40 text-xs text-cyan-300 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-cyan-400 shrink-0" />
            <span><strong>AI Clue:</strong> {hint}</span>
          </div>
        ) : (
          <button
            onClick={fetchAIHint}
            disabled={isLoadingHint}
            className="w-full py-2 rounded-xl bg-cyan-950/40 hover:bg-cyan-900/50 text-cyan-400 border border-cyan-800/40 text-xs font-bold cursor-pointer transition-all flex items-center justify-center gap-1.5"
          >
            {isLoadingHint ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Brain className="w-3.5 h-3.5" />}
            <span>Get AI Hint</span>
          </button>
        )}
      </div>

      {/* Onscreen Keyboard */}
      <div className="space-y-1.5 w-full pt-2">
        {KEYBOARD_ROWS.map((row, rIdx) => (
          <div key={rIdx} className="flex justify-center gap-1">
            {row.map((key) => (
              <button
                key={key}
                onClick={() => handleKeyPress(key)}
                className={`h-9 px-2.5 rounded-lg text-xs font-extrabold cursor-pointer transition-all ${
                  key === "ENTER" || key === "BACK"
                    ? "bg-cyan-600 text-white min-w-[50px]"
                    : "bg-zinc-800 hover:bg-zinc-700 text-slate-200 min-w-[32px]"
                }`}
              >
                {key === "BACK" ? "⌫" : key}
              </button>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

/* =========================================================
   2. AI TRIVIA MASTER
   ========================================================= */
export interface TriviaQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

const TriviaGame: React.FC<{ apiKey: string; selectedModel?: string }> = ({ apiKey, selectedModel }) => {
  const [category, setCategory] = useState("Science & Tech");
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState<TriviaQuestion | null>(null);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchNextQuestion();
  }, []);

  const fetchNextQuestion = async () => {
    setIsLoading(true);
    setSelectedOption(null);

    try {
      const res = await fetch("/api/openrouter/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": apiKey ? `Bearer ${apiKey}` : "" },
        body: JSON.stringify({
          model: selectedModel || "google/gemini-2.5-flash",
          messages: [
            {
              role: "system",
              content: `You are a trivia master. Generate 1 engaging trivia question for the requested category.
Return strictly a JSON object matching this schema (no markdown outside JSON):
{
  "question": "Trivia question prompt",
  "options": ["Option A", "Option B", "Option C", "Option D"],
  "correctIndex": 0, 1, 2, or 3,
  "explanation": "Fun 1-sentence educational explanation"
}`
            },
            { role: "user", content: `Category: ${category}` }
          ]
        })
      });

      if (res.ok) {
        const data = await res.json();
        const raw = data.choices?.[0]?.message?.content || "";
        const clean = raw.replace(/```json/g, "").replace(/```/g, "").trim();
        const jsonMatch = clean.match(/\{[\s\S]*\}/);
        const parsed: TriviaQuestion = JSON.parse(jsonMatch ? jsonMatch[0] : clean);
        setCurrentQuestion(parsed);
      }
    } catch (err) {
      // Fallback question
      setCurrentQuestion({
        question: "What was the original name of Google before it was renamed?",
        options: ["BackRub", "PageRank", "WebSearch", "Googol"],
        correctIndex: 0,
        explanation: "Google was originally named BackRub in 1996 because the system analyzed backlinks to estimate site importance."
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectOption = (idx: number) => {
    if (selectedOption !== null || !currentQuestion) return;
    setSelectedOption(idx);

    if (idx === currentQuestion.correctIndex) {
      setScore(prev => prev + 100 * (streak + 1));
      setStreak(prev => prev + 1);
    } else {
      setStreak(0);
    }
  };

  return (
    <div className="space-y-4 max-w-lg mx-auto w-full">
      {/* Header Stats */}
      <div className="p-4 rounded-2xl bg-[#111723] border border-zinc-800 flex items-center justify-between">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Score</span>
          <p className="text-xl font-extrabold text-amber-400 font-mono">{score} pts</p>
        </div>
        <div className="text-right">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Current Streak</span>
          <p className="text-sm font-bold text-emerald-400 flex items-center justify-end gap-1">
            <Flame className="w-4 h-4 fill-emerald-400" /> {streak}x
          </p>
        </div>
      </div>

      {/* Category selector */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar text-xs">
        {["Science & Tech", "Pop Culture", "History & World", "Gaming & AI"].map((cat) => (
          <button
            key={cat}
            onClick={() => {
              setCategory(cat);
              fetchNextQuestion();
            }}
            className={`px-3 py-1.5 rounded-xl font-bold shrink-0 transition-all cursor-pointer ${
              category === cat ? "bg-amber-500 text-black" : "bg-zinc-800 text-slate-300 hover:text-white"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Question Card */}
      {isLoading ? (
        <div className="p-12 text-center space-y-2 bg-[#111723] rounded-2xl border border-zinc-800">
          <RefreshCw className="w-6 h-6 text-amber-400 animate-spin mx-auto" />
          <p className="text-xs text-slate-400">Generating AI Trivia Question...</p>
        </div>
      ) : currentQuestion ? (
        <div className="p-5 rounded-2xl bg-[#111723] border border-zinc-800 space-y-4">
          <h3 className="text-sm font-bold text-white leading-relaxed">{currentQuestion.question}</h3>

          <div className="space-y-2">
            {currentQuestion.options.map((opt, i) => {
              const isSelected = selectedOption === i;
              const isCorrect = currentQuestion.correctIndex === i;
              let style = "bg-zinc-900 border-zinc-800 text-slate-200 hover:border-amber-500/50";

              if (selectedOption !== null) {
                if (isCorrect) style = "bg-emerald-600/20 border-emerald-500 text-emerald-300 font-bold";
                else if (isSelected) style = "bg-rose-600/20 border-rose-500 text-rose-300";
              }

              return (
                <button
                  key={i}
                  onClick={() => handleSelectOption(i)}
                  className={`w-full text-left p-3 rounded-xl border text-xs transition-all cursor-pointer ${style}`}
                >
                  {opt}
                </button>
              );
            })}
          </div>

          {selectedOption !== null && (
            <div className="space-y-3 pt-2">
              <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-800/40 text-xs text-amber-200">
                <strong>Explanation:</strong> {currentQuestion.explanation}
              </div>

              <button
                onClick={fetchNextQuestion}
                className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span>Next Question</span>
                <Shuffle className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
};

/* =========================================================
   3. RETRO ARCADE SNAKE
   ========================================================= */
const SnakeGame: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const GRID_SIZE = 20;
  const dirRef = useRef<{ x: number; y: number }>({ x: 1, y: 0 });
  const snakeRef = useRef<Array<{ x: number; y: number }>>([{ x: 10, y: 10 }]);
  const foodRef = useRef<{ x: number; y: number }>({ x: 15, y: 10 });

  const startGame = () => {
    snakeRef.current = [{ x: 10, y: 10 }, { x: 9, y: 10 }];
    dirRef.current = { x: 1, y: 0 };
    spawnFood();
    setScore(0);
    setIsGameOver(false);
    setIsPlaying(true);
  };

  const spawnFood = () => {
    foodRef.current = {
      x: Math.floor(Math.random() * 20),
      y: Math.floor(Math.random() * 20)
    };
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isPlaying) return;
      if (e.key === "ArrowUp" && dirRef.current.y === 0) dirRef.current = { x: 0, y: -1 };
      if (e.key === "ArrowDown" && dirRef.current.y === 0) dirRef.current = { x: 0, y: 1 };
      if (e.key === "ArrowLeft" && dirRef.current.x === 0) dirRef.current = { x: -1, y: 0 };
      if (e.key === "ArrowRight" && dirRef.current.x === 0) dirRef.current = { x: 1, y: 0 };
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isPlaying]);

  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      const head = { ...snakeRef.current[0] };
      head.x += dirRef.current.x;
      head.y += dirRef.current.y;

      // Wall collision
      if (head.x < 0 || head.x >= 20 || head.y < 0 || head.y >= 20) {
        setIsGameOver(true);
        setIsPlaying(false);
        return;
      }

      // Self collision
      if (snakeRef.current.some(s => s.x === head.x && s.y === head.y)) {
        setIsGameOver(true);
        setIsPlaying(false);
        return;
      }

      snakeRef.current.unshift(head);

      // Eat food
      if (head.x === foodRef.current.x && head.y === foodRef.current.y) {
        setScore(s => {
          const newS = s + 10;
          if (newS > highScore) setHighScore(newS);
          return newS;
        });
        spawnFood();
      } else {
        snakeRef.current.pop();
      }

      // Render canvas
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.fillStyle = "#0a0e17";
          ctx.fillRect(0, 0, 400, 400);

          // Draw grid lines
          ctx.strokeStyle = "#172033";
          for (let i = 0; i < 400; i += GRID_SIZE) {
            ctx.beginPath();
            ctx.moveTo(i, 0);
            ctx.lineTo(i, 400);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(0, i);
            ctx.lineTo(400, i);
            ctx.stroke();
          }

          // Draw Food
          ctx.fillStyle = "#f43f5e";
          ctx.beginPath();
          ctx.arc(
            foodRef.current.x * GRID_SIZE + GRID_SIZE / 2,
            foodRef.current.y * GRID_SIZE + GRID_SIZE / 2,
            GRID_SIZE / 2 - 2,
            0,
            Math.PI * 2
          );
          ctx.fill();

          // Draw Snake
          snakeRef.current.forEach((seg, idx) => {
            ctx.fillStyle = idx === 0 ? "#06b6d4" : "#22d3ee";
            ctx.fillRect(
              seg.x * GRID_SIZE + 1,
              seg.y * GRID_SIZE + 1,
              GRID_SIZE - 2,
              GRID_SIZE - 2
            );
          });
        }
      }
    }, 120);

    return () => clearInterval(interval);
  }, [isPlaying, highScore]);

  return (
    <div className="flex flex-col items-center space-y-4 max-w-md mx-auto w-full">
      <div className="flex items-center justify-between w-full">
        <div>
          <span className="text-[10px] text-slate-400 font-bold uppercase">Score</span>
          <p className="text-base font-extrabold text-cyan-400 font-mono">{score} pts</p>
        </div>
        <div className="text-right">
          <span className="text-[10px] text-slate-400 font-bold uppercase">High Score</span>
          <p className="text-base font-extrabold text-amber-400 font-mono">{highScore} pts</p>
        </div>
      </div>

      <div className="relative border-2 border-cyan-500/40 rounded-2xl overflow-hidden shadow-2xl">
        <canvas ref={canvasRef} width={400} height={400} className="bg-[#0a0e17]" />

        {(!isPlaying || isGameOver) && (
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center p-6 space-y-3 text-center">
            <h3 className="text-lg font-bold text-white">
              {isGameOver ? "💥 Game Over!" : "🐍 Retro Arcade Snake"}
            </h3>
            <p className="text-xs text-slate-400">Use Arrow Keys to steer the snake and collect power food.</p>
            <button
              onClick={startGame}
              className="px-6 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs transition-all cursor-pointer shadow-lg shadow-cyan-600/30"
            >
              {isGameOver ? "Play Again" : "Start Game"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

/* =========================================================
   MAIN GAMING HUB WRAPPER
   ========================================================= */
export const GamingHub: React.FC<GamingHubProps> = ({ apiKey, selectedModel, theme, onAddLog }) => {
  const [activeGame, setActiveGame] = useState<ActiveGame>("wordle");

  return (
    <div className={`h-full w-full flex flex-col overflow-hidden ${
      theme === "dark" ? "bg-[#0a0e17] text-slate-100" : "bg-slate-50 text-slate-900"
    }`}>
      {/* Top Banner */}
      <div className={`px-6 py-3.5 border-b flex flex-wrap items-center justify-between gap-4 shrink-0 ${
        theme === "dark" ? "bg-[#101622] border-zinc-800" : "bg-white border-slate-200"
      }`}>
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-purple-600 via-pink-600 to-rose-600 text-white shadow-lg shadow-purple-600/20">
            <Gamepad2 className="w-5 h-5 animate-bounce" />
          </div>
          <div>
            <h1 className="text-base font-bold tracking-tight flex items-center gap-2">
              AI Arcade & Mini-Games Hub
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-400 border border-purple-500/30">
                Interactive Games
              </span>
            </h1>
            <p className="text-xs text-slate-400 font-medium">
              Challenge your mind with 12 arcade games: XO Tactics, Brick Breaker, Minefield, Pattern Recall, 2048, Cyber Pong, Memory Match, Flappy Rocket & More!
            </p>
          </div>
        </div>

        {/* Game Switcher Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto py-1 no-scrollbar max-w-full">
          <button
            onClick={() => setActiveGame("tictactoe")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
              activeGame === "tictactoe"
                ? "bg-cyan-600 text-white shadow-md shadow-cyan-600/20"
                : "bg-zinc-800 text-slate-300 hover:text-white"
            }`}
          >
            <X className="w-3.5 h-3.5" />
            <span>Cyber XO</span>
          </button>

          <button
            onClick={() => setActiveGame("breakout")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
              activeGame === "breakout"
                ? "bg-rose-600 text-white shadow-md shadow-rose-600/20"
                : "bg-zinc-800 text-slate-300 hover:text-white"
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-rose-400" />
            <span>Brick Breaker</span>
          </button>

          <button
            onClick={() => setActiveGame("minesweeper")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
              activeGame === "minesweeper"
                ? "bg-rose-700 text-white shadow-md shadow-rose-700/20"
                : "bg-zinc-800 text-slate-300 hover:text-white"
            }`}
          >
            <Bomb className="w-3.5 h-3.5 text-rose-400" />
            <span>Minefield</span>
          </button>

          <button
            onClick={() => setActiveGame("simon")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
              activeGame === "simon"
                ? "bg-fuchsia-600 text-white shadow-md shadow-fuchsia-600/20"
                : "bg-zinc-800 text-slate-300 hover:text-white"
            }`}
          >
            <Music className="w-3.5 h-3.5 text-fuchsia-300" />
            <span>Pattern Recall</span>
          </button>

          <button
            onClick={() => setActiveGame("game2048")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
              activeGame === "game2048"
                ? "bg-amber-500 text-black shadow-md shadow-amber-500/20"
                : "bg-zinc-800 text-slate-300 hover:text-white"
            }`}
          >
            <Grid3X3 className="w-3.5 h-3.5" />
            <span>2048 Merger</span>
          </button>

          <button
            onClick={() => setActiveGame("pong")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
              activeGame === "pong"
                ? "bg-cyan-600 text-white shadow-md shadow-cyan-600/20"
                : "bg-zinc-800 text-slate-300 hover:text-white"
            }`}
          >
            <Swords className="w-3.5 h-3.5" />
            <span>Cyber Pong</span>
          </button>

          <button
            onClick={() => setActiveGame("memory")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
              activeGame === "memory"
                ? "bg-purple-600 text-white shadow-md shadow-purple-600/20"
                : "bg-zinc-800 text-slate-300 hover:text-white"
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Memory Match</span>
          </button>

          <button
            onClick={() => setActiveGame("flappy")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
              activeGame === "flappy"
                ? "bg-rose-600 text-white shadow-md shadow-rose-600/20"
                : "bg-zinc-800 text-slate-300 hover:text-white"
            }`}
          >
            <Rocket className="w-3.5 h-3.5" />
            <span>Flappy Rocket</span>
          </button>

          <button
            onClick={() => setActiveGame("wordle")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
              activeGame === "wordle"
                ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20"
                : "bg-zinc-800 text-slate-300 hover:text-white"
            }`}
          >
            <Target className="w-3.5 h-3.5" />
            <span>Word Detective</span>
          </button>

          <button
            onClick={() => setActiveGame("trivia")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
              activeGame === "trivia"
                ? "bg-amber-600 text-white shadow-md shadow-amber-600/20"
                : "bg-zinc-800 text-slate-300 hover:text-white"
            }`}
          >
            <Brain className="w-3.5 h-3.5" />
            <span>AI Trivia</span>
          </button>

          <button
            onClick={() => setActiveGame("snake")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
              activeGame === "snake"
                ? "bg-teal-600 text-white shadow-md shadow-teal-600/20"
                : "bg-zinc-800 text-slate-300 hover:text-white"
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Arcade Snake</span>
          </button>

          <button
            onClick={() => setActiveGame("invaders")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
              activeGame === "invaders"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                : "bg-zinc-800 text-slate-300 hover:text-white"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-300" />
            <span>Space Invaders</span>
          </button>
        </div>
      </div>

      {/* Game Stage */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 flex flex-col items-center justify-start min-h-0 w-full">
        <div className="my-auto w-full flex flex-col items-center">
          {activeGame === "tictactoe" && <TicTacToeGame apiKey={apiKey} selectedModel={selectedModel} />}
          {activeGame === "breakout" && <BreakoutGame />}
          {activeGame === "minesweeper" && <MinesweeperGame apiKey={apiKey} selectedModel={selectedModel} />}
          {activeGame === "simon" && <SimonSaysGame />}
          {activeGame === "game2048" && <Game2048 apiKey={apiKey} selectedModel={selectedModel} />}
          {activeGame === "pong" && <CyberPongGame />}
          {activeGame === "memory" && <MemoryMatchGame />}
          {activeGame === "flappy" && <FlappyRocketGame />}
          {activeGame === "wordle" && <WordleGame apiKey={apiKey} selectedModel={selectedModel} />}
          {activeGame === "trivia" && <TriviaGame apiKey={apiKey} selectedModel={selectedModel} />}
          {activeGame === "snake" && <SnakeGame />}
          {activeGame === "invaders" && <SpaceInvadersGame />}
        </div>
      </div>
    </div>
  );
};
