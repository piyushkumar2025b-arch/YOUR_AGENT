import React, { useState, useEffect, useCallback } from "react";
import { RotateCcw, Trophy, Sparkles, Brain, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Grid3X3 } from "lucide-react";

interface Game2048Props {
  apiKey?: string;
  selectedModel?: string;
}

type Board = number[][];

export const Game2048: React.FC<Game2048Props> = ({ apiKey, selectedModel }) => {
  const [board, setBoard] = useState<Board>(() => getEmptyBoard());
  const [score, setScore] = useState<number>(0);
  const [bestScore, setBestScore] = useState<number>(() => {
    return parseInt(localStorage.getItem("2048_best") || "0", 10);
  });
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [won, setWon] = useState<boolean>(false);
  const [aiHint, setAiHint] = useState<string>("");
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);

  function getEmptyBoard(): Board {
    return [
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0]
    ];
  }

  const addRandomTile = useCallback((currentBoard: Board): Board => {
    const emptyCells: { r: number; c: number }[] = [];
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        if (currentBoard[r][c] === 0) emptyCells.push({ r, c });
      }
    }
    if (emptyCells.length === 0) return currentBoard;
    const { r, c } = emptyCells[Math.floor(Math.random() * emptyCells.length)];
    const newBoard = currentBoard.map(row => [...row]);
    newBoard[r][c] = Math.random() < 0.9 ? 2 : 4;
    return newBoard;
  }, []);

  const initGame = useCallback(() => {
    let b = getEmptyBoard();
    b = addRandomTile(b);
    b = addRandomTile(b);
    setBoard(b);
    setScore(0);
    setGameOver(false);
    setWon(false);
    setAiHint("");
  }, [addRandomTile]);

  useEffect(() => {
    initGame();
  }, [initGame]);

  const checkGameOver = (currentBoard: Board): boolean => {
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        if (currentBoard[r][c] === 0) return false;
        if (c < 3 && currentBoard[r][c] === currentBoard[r][c + 1]) return false;
        if (r < 3 && currentBoard[r][c] === currentBoard[r + 1][c]) return false;
      }
    }
    return true;
  };

  const slideLeft = (currentBoard: Board): { board: Board; gainedScore: number; moved: boolean } => {
    let gainedScore = 0;
    let moved = false;
    const newBoard: Board = [];

    for (let r = 0; r < 4; r++) {
      const row = currentBoard[r].filter(val => val !== 0);
      const mergedRow: number[] = [];
      let skip = false;

      for (let c = 0; c < row.length; c++) {
        if (skip) {
          skip = false;
          continue;
        }
        if (c < row.length - 1 && row[c] === row[c + 1]) {
          const mergedVal = row[c] * 2;
          mergedRow.push(mergedVal);
          gainedScore += mergedVal;
          if (mergedVal === 2048) setWon(true);
          skip = true;
        } else {
          mergedRow.push(row[c]);
        }
      }

      while (mergedRow.length < 4) {
        mergedRow.push(0);
      }

      for (let c = 0; c < 4; c++) {
        if (mergedRow[c] !== currentBoard[r][c]) moved = true;
      }

      newBoard.push(mergedRow);
    }

    return { board: newBoard, gainedScore, moved };
  };

  const rotateBoard = (currentBoard: Board): Board => {
    const rotated: Board = getEmptyBoard();
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        rotated[c][3 - r] = currentBoard[r][c];
      }
    }
    return rotated;
  };

  const handleMove = useCallback((direction: "LEFT" | "RIGHT" | "UP" | "DOWN") => {
    if (gameOver) return;

    let tempBoard = board.map(r => [...r]);
    let rotations = 0;

    if (direction === "UP") rotations = 3;
    else if (direction === "RIGHT") rotations = 2;
    else if (direction === "DOWN") rotations = 1;

    for (let i = 0; i < rotations; i++) {
      tempBoard = rotateBoard(tempBoard);
    }

    const { board: slidBoard, gainedScore, moved } = slideLeft(tempBoard);

    if (!moved) return;

    let finalBoard = slidBoard;
    for (let i = 0; i < (4 - rotations) % 4; i++) {
      finalBoard = rotateBoard(finalBoard);
    }

    finalBoard = addRandomTile(finalBoard);
    setBoard(finalBoard);

    const newScore = score + gainedScore;
    setScore(newScore);
    if (newScore > bestScore) {
      setBestScore(newScore);
      localStorage.setItem("2048_best", newScore.toString());
    }

    if (checkGameOver(finalBoard)) {
      setGameOver(true);
    }
  }, [board, gameOver, score, bestScore, addRandomTile]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (["ArrowLeft", "a", "A"].includes(e.key)) handleMove("LEFT");
      else if (["ArrowRight", "d", "D"].includes(e.key)) handleMove("RIGHT");
      else if (["ArrowUp", "w", "W"].includes(e.key)) handleMove("UP");
      else if (["ArrowDown", "s", "S"].includes(e.key)) handleMove("DOWN");
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleMove]);

  const fetchAiHint = async () => {
    setIsAiLoading(true);
    try {
      const res = await fetch("/api/openrouter/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: apiKey ? `Bearer ${apiKey}` : "" },
        body: JSON.stringify({
          model: selectedModel || "google/gemini-2.5-flash",
          messages: [
            {
              role: "system",
              content: "You are a 2048 puzzle strategist. Analyze the 4x4 matrix and recommend the single best next move (LEFT, RIGHT, UP, or DOWN) with a brief 1-sentence explanation."
            },
            {
              role: "user",
              content: `Current 2048 Board State:\n${JSON.stringify(board)}\nCurrent Score: ${score}`
            }
          ]
        })
      });

      if (res.ok) {
        const data = await res.json();
        setAiHint(data.choices?.[0]?.message?.content || "Try sliding DOWN or LEFT to keep high values in corners!");
      } else {
        setAiHint("Keep your highest value tile locked in a corner!");
      }
    } catch {
      setAiHint("Strategy tip: Consolidate tiles downward to build 512+!");
    } finally {
      setIsAiLoading(false);
    }
  };

  const getTileColor = (val: number): string => {
    switch (val) {
      case 2: return "bg-zinc-800 text-slate-100 border-zinc-700";
      case 4: return "bg-cyan-950/80 text-cyan-300 border-cyan-700/60 shadow-cyan-900/30";
      case 8: return "bg-amber-950/80 text-amber-300 border-amber-700/60 shadow-amber-900/30";
      case 16: return "bg-orange-950/80 text-orange-300 border-orange-700/60 shadow-orange-900/30";
      case 32: return "bg-rose-950/80 text-rose-300 border-rose-700/60 shadow-rose-900/30";
      case 64: return "bg-fuchsia-950/80 text-fuchsia-300 border-fuchsia-700/60 shadow-fuchsia-900/30";
      case 128: return "bg-purple-900/90 text-purple-200 border-purple-500 shadow-purple-500/30 font-bold";
      case 256: return "bg-indigo-900/90 text-indigo-200 border-indigo-500 shadow-indigo-500/30 font-bold";
      case 512: return "bg-blue-900/90 text-blue-200 border-blue-400 shadow-blue-400/40 font-extrabold";
      case 1024: return "bg-emerald-900/90 text-emerald-200 border-emerald-400 shadow-emerald-400/50 font-black animate-pulse";
      case 2048: return "bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 text-black border-amber-300 shadow-amber-400/70 font-black animate-bounce";
      default: return "bg-purple-950 text-amber-300 border-amber-400 shadow-amber-400/80 font-black";
    }
  };

  return (
    <div className="flex flex-col items-center space-y-4 max-w-md mx-auto w-full">
      {/* Top Header Controls */}
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center gap-2">
          <Grid3X3 className="w-5 h-5 text-amber-400" />
          <h2 className="text-sm font-bold text-white">2048 Cyber Tile Merger</h2>
        </div>
        <button
          onClick={initGame}
          className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs text-slate-300 transition-all cursor-pointer flex items-center gap-1"
        >
          <RotateCcw className="w-3.5 h-3.5" /> Reset
        </button>
      </div>

      {/* Score Board */}
      <div className="grid grid-cols-2 gap-3 w-full">
        <div className="p-3 rounded-2xl bg-[#111723] border border-zinc-800 text-center">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Score</span>
          <p className="text-lg font-black text-cyan-400 font-mono">{score}</p>
        </div>
        <div className="p-3 rounded-2xl bg-[#111723] border border-zinc-800 text-center">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Best</span>
          <p className="text-lg font-black text-amber-400 font-mono">{bestScore}</p>
        </div>
      </div>

      {/* AI Strategy Hint */}
      <div className="w-full">
        {aiHint ? (
          <div className="p-3 rounded-xl bg-cyan-950/40 border border-cyan-800/40 text-xs text-cyan-300 flex items-start gap-2">
            <Sparkles className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
            <div>
              <strong className="block text-cyan-200">AI Tactical Advice:</strong>
              <span>{aiHint}</span>
            </div>
          </div>
        ) : (
          <button
            onClick={fetchAiHint}
            disabled={isAiLoading}
            className="w-full py-2 rounded-xl bg-cyan-950/40 hover:bg-cyan-900/50 text-cyan-400 border border-cyan-800/40 text-xs font-bold cursor-pointer transition-all flex items-center justify-center gap-1.5"
          >
            <Brain className="w-3.5 h-3.5" />
            <span>{isAiLoading ? "Analyzing Board..." : "Ask AI Advisor for Next Move"}</span>
          </button>
        )}
      </div>

      {/* 2048 Grid Board */}
      <div className="relative p-3 bg-zinc-950 border-2 border-zinc-800 rounded-2xl shadow-2xl w-full aspect-square max-w-[340px]">
        <div className="grid grid-cols-4 gap-2.5 h-full w-full">
          {board.map((row, rIdx) =>
            row.map((val, cIdx) => (
              <div
                key={`${rIdx}-${cIdx}`}
                className={`rounded-xl border flex items-center justify-center font-extrabold transition-all duration-150 text-lg shadow-md ${
                  val === 0
                    ? "bg-zinc-900/40 border-zinc-900 text-transparent"
                    : getTileColor(val)
                }`}
              >
                {val > 0 ? val : ""}
              </div>
            ))
          )}
        </div>

        {/* Game Over / Win Overlay */}
        {(gameOver || won) && (
          <div className="absolute inset-0 bg-black/85 backdrop-blur-sm rounded-2xl flex flex-col items-center justify-center p-6 text-center space-y-3 z-10">
            {won ? (
              <>
                <Trophy className="w-12 h-12 text-amber-400 animate-bounce" />
                <h3 className="text-xl font-black text-amber-300">2048 ACHIEVED!</h3>
                <p className="text-xs text-slate-300">Outstanding matrix calculations!</p>
              </>
            ) : (
              <>
                <div className="text-3xl">💥</div>
                <h3 className="text-lg font-bold text-rose-400">No More Moves!</h3>
                <p className="text-xs text-slate-400">Final Score: {score} pts</p>
              </>
            )}
            <button
              onClick={initGame}
              className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs shadow-lg shadow-amber-500/20 cursor-pointer transition-all"
            >
              Play Again
            </button>
          </div>
        )}
      </div>

      {/* Onscreen Touch / Direction Controls */}
      <div className="flex flex-col items-center gap-1 pt-1">
        <button
          onClick={() => handleMove("UP")}
          className="p-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl font-bold cursor-pointer transition-all active:scale-95"
          title="Move Up"
        >
          <ArrowUp className="w-5 h-5" />
        </button>
        <div className="flex gap-2">
          <button
            onClick={() => handleMove("LEFT")}
            className="p-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl font-bold cursor-pointer transition-all active:scale-95"
            title="Move Left"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => handleMove("DOWN")}
            className="p-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl font-bold cursor-pointer transition-all active:scale-95"
            title="Move Down"
          >
            <ArrowDown className="w-5 h-5" />
          </button>
          <button
            onClick={() => handleMove("RIGHT")}
            className="p-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl font-bold cursor-pointer transition-all active:scale-95"
            title="Move Right"
          >
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};
