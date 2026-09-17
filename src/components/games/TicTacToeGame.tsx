import React, { useState, useEffect } from "react";
import { RotateCcw, Trophy, Brain, Sparkles, User, Cpu, Circle, X } from "lucide-react";

interface TicTacToeProps {
  apiKey?: string;
  selectedModel?: string;
}

type Player = "X" | "O" | null;

export const TicTacToeGame: React.FC<TicTacToeProps> = ({ apiKey, selectedModel }) => {
  const [board, setBoard] = useState<Player[]>(Array(9).fill(null));
  const [isXNext, setIsXNext] = useState<boolean>(true); // Human is X
  const [mode, setMode] = useState<"vsAI" | "vsHuman">("vsAI");
  const [aiDifficulty, setAiDifficulty] = useState<"easy" | "hard" | "unbeatable">("unbeatable");
  const [winnerInfo, setWinnerInfo] = useState<{ winner: Player | "Draw"; line: number[] | null } | null>(null);
  const [scores, setScores] = useState({ player: 0, ai: 0, draws: 0 });
  const [aiAdvice, setAiAdvice] = useState<string>("");
  const [isAiAnalyzing, setIsAiAnalyzing] = useState<boolean>(false);

  const WINNING_COMBOS = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // Cols
    [0, 4, 8], [2, 4, 6]             // Diagonals
  ];

  const checkWinner = (b: Player[]): { winner: Player | "Draw"; line: number[] | null } | null => {
    for (const combo of WINNING_COMBOS) {
      const [a, bIdx, c] = combo;
      if (b[a] && b[a] === b[bIdx] && b[a] === b[c]) {
        return { winner: b[a], line: combo };
      }
    }
    if (b.every(cell => cell !== null)) {
      return { winner: "Draw", line: null };
    }
    return null;
  };

  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setIsXNext(true);
    setWinnerInfo(null);
    setAiAdvice("");
  };

  // Minimax algorithm for Unbeatable AI
  const minimax = (b: Player[], depth: number, isMaximizing: boolean): number => {
    const result = checkWinner(b);
    if (result) {
      if (result.winner === "O") return 10 - depth; // AI wins
      if (result.winner === "X") return depth - 10; // Human wins
      if (result.winner === "Draw") return 0;
    }

    if (isMaximizing) {
      let bestScore = -Infinity;
      for (let i = 0; i < 9; i++) {
        if (!b[i]) {
          b[i] = "O";
          const score = minimax(b, depth + 1, false);
          b[i] = null;
          bestScore = Math.max(score, bestScore);
        }
      }
      return bestScore;
    } else {
      let bestScore = Infinity;
      for (let i = 0; i < 9; i++) {
        if (!b[i]) {
          b[i] = "X";
          const score = minimax(b, depth + 1, true);
          b[i] = null;
          bestScore = Math.min(score, bestScore);
        }
      }
      return bestScore;
    }
  };

  const getBestMove = (b: Player[]): number => {
    const emptyIndices = b.map((val, idx) => (val === null ? idx : null)).filter(val => val !== null) as number[];

    if (aiDifficulty === "easy") {
      return emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
    }

    if (aiDifficulty === "hard" && Math.random() < 0.3) {
      return emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
    }

    // Unbeatable Minimax
    let bestScore = -Infinity;
    let bestMove = emptyIndices[0];

    for (const i of emptyIndices) {
      b[i] = "O";
      const score = minimax(b, 0, false);
      b[i] = null;
      if (score > bestScore) {
        bestScore = score;
        bestMove = i;
      }
    }
    return bestMove;
  };

  const handleCellClick = (index: number) => {
    if (board[index] || winnerInfo) return;

    const newBoard = [...board];
    newBoard[index] = isXNext ? "X" : "O";
    setBoard(newBoard);

    const result = checkWinner(newBoard);
    if (result) {
      setWinnerInfo(result);
      updateScores(result.winner);
      return;
    }

    if (mode === "vsAI" && isXNext) {
      setIsXNext(false);
      // AI's Turn
      setTimeout(() => {
        const aiMove = getBestMove(newBoard);
        if (aiMove !== undefined) {
          newBoard[aiMove] = "O";
          setBoard([...newBoard]);
          const aiResult = checkWinner(newBoard);
          if (aiResult) {
            setWinnerInfo(aiResult);
            updateScores(aiResult.winner);
          } else {
            setIsXNext(true);
          }
        }
      }, 350);
    } else {
      setIsXNext(!isXNext);
    }
  };

  const updateScores = (winner: Player | "Draw") => {
    if (winner === "X") setScores(s => ({ ...s, player: s.player + 1 }));
    else if (winner === "O") setScores(s => ({ ...s, ai: s.ai + 1 }));
    else setScores(s => ({ ...s, draws: s.draws + 1 }));
  };

  const getAiStrategyAdvice = async () => {
    setIsAiAnalyzing(true);
    try {
      const res = await fetch("/api/openrouter/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: apiKey ? `Bearer ${apiKey}` : "" },
        body: JSON.stringify({
          model: selectedModel || "google/gemini-2.5-flash",
          messages: [
            {
              role: "system",
              content: "You are a master Tic-Tac-Toe strategist. Given the current 3x3 board array (0-8 indices), recommend the best move for X and explain why in 1 clear sentence."
            },
            {
              role: "user",
              content: `Current Board: ${JSON.stringify(board)}`
            }
          ]
        })
      });

      if (res.ok) {
        const data = await res.json();
        setAiAdvice(data.choices?.[0]?.message?.content || "Control the center (cell 4) and corners for double threats!");
      } else {
        setAiAdvice("Control the center cell (position 4) to dictate all diagonal win lines!");
      }
    } catch {
      setAiAdvice("Tip: Claiming corners forces your opponent into a defensive pattern.");
    } finally {
      setIsAiAnalyzing(false);
    }
  };

  return (
    <div className="flex flex-col items-center space-y-4 max-w-md mx-auto w-full">
      {/* Top Header */}
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center gap-2">
          <X className="w-5 h-5 text-cyan-400" />
          <h2 className="text-sm font-bold text-white">Cyber XO Tactics</h2>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex bg-zinc-900 border border-zinc-800 rounded-xl p-1 text-[11px] font-bold">
            <button
              onClick={() => { setMode("vsAI"); resetGame(); }}
              className={`px-2 py-1 rounded-lg transition-all cursor-pointer ${
                mode === "vsAI" ? "bg-cyan-600 text-white" : "text-slate-400 hover:text-white"
              }`}
            >
              vs AI
            </button>
            <button
              onClick={() => { setMode("vsHuman"); resetGame(); }}
              className={`px-2 py-1 rounded-lg transition-all cursor-pointer ${
                mode === "vsHuman" ? "bg-cyan-600 text-white" : "text-slate-400 hover:text-white"
              }`}
            >
              2 Players
            </button>
          </div>

          <button
            onClick={resetGame}
            className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs text-slate-300 transition-all cursor-pointer flex items-center gap-1"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reset
          </button>
        </div>
      </div>

      {/* AI Difficulty Selector */}
      {mode === "vsAI" && (
        <div className="flex items-center justify-between w-full bg-[#111723] p-2 rounded-xl border border-zinc-800 text-xs">
          <span className="text-slate-400 font-bold text-[11px]">AI Level:</span>
          <div className="flex gap-1">
            {(["easy", "hard", "unbeatable"] as const).map(diff => (
              <button
                key={diff}
                onClick={() => setAiDifficulty(diff)}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold capitalize transition-all cursor-pointer ${
                  aiDifficulty === diff
                    ? "bg-amber-500 text-black font-extrabold shadow-sm shadow-amber-500/20"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {diff}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Score Banner */}
      <div className="grid grid-cols-3 gap-2 w-full text-center">
        <div className="p-2.5 rounded-2xl bg-[#111723] border border-zinc-800">
          <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400">Player (X)</span>
          <p className="text-base font-black text-white font-mono">{scores.player}</p>
        </div>
        <div className="p-2.5 rounded-2xl bg-[#111723] border border-zinc-800">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Draws</span>
          <p className="text-base font-black text-slate-300 font-mono">{scores.draws}</p>
        </div>
        <div className="p-2.5 rounded-2xl bg-[#111723] border border-zinc-800">
          <span className="text-[10px] font-bold uppercase tracking-wider text-rose-400">
            {mode === "vsAI" ? "AI Bot (O)" : "Player 2 (O)"}
          </span>
          <p className="text-base font-black text-white font-mono">{scores.ai}</p>
        </div>
      </div>

      {/* AI Strategy Advice */}
      <div className="w-full">
        {aiAdvice ? (
          <div className="p-3 rounded-xl bg-cyan-950/40 border border-cyan-800/40 text-xs text-cyan-300 flex items-start gap-2">
            <Sparkles className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
            <div>
              <strong className="block text-cyan-200">AI Tactical Hint:</strong>
              <span>{aiAdvice}</span>
            </div>
          </div>
        ) : (
          <button
            onClick={getAiStrategyAdvice}
            disabled={isAiAnalyzing}
            className="w-full py-2 rounded-xl bg-cyan-950/40 hover:bg-cyan-900/50 text-cyan-400 border border-cyan-800/40 text-xs font-bold cursor-pointer transition-all flex items-center justify-center gap-1.5"
          >
            <Brain className="w-3.5 h-3.5" />
            <span>{isAiAnalyzing ? "Analyzing Grid..." : "Get AI Strategy Hint"}</span>
          </button>
        )}
      </div>

      {/* Grid Canvas */}
      <div className="relative p-3 bg-zinc-950 border-2 border-zinc-800 rounded-2xl shadow-2xl w-full aspect-square max-w-[320px]">
        <div className="grid grid-cols-3 gap-2.5 h-full w-full">
          {board.map((cell, idx) => {
            const isWinningCell = winnerInfo?.line?.includes(idx);
            return (
              <button
                key={idx}
                onClick={() => handleCellClick(idx)}
                disabled={cell !== null || winnerInfo !== null}
                className={`rounded-2xl border-2 flex items-center justify-center transition-all duration-200 text-3xl font-black cursor-pointer ${
                  cell === "X"
                    ? "bg-cyan-950/60 border-cyan-500 text-cyan-400 shadow-md shadow-cyan-500/20"
                    : cell === "O"
                    ? "bg-rose-950/60 border-rose-500 text-rose-400 shadow-md shadow-rose-500/20"
                    : "bg-zinc-900/60 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800/50"
                } ${isWinningCell ? "animate-pulse border-amber-400 bg-amber-500/20" : ""}`}
              >
                {cell === "X" && <X className="w-10 h-10 stroke-[3]" />}
                {cell === "O" && <Circle className="w-9 h-9 stroke-[3]" />}
              </button>
            );
          })}
        </div>

        {/* Victory Overlay */}
        {winnerInfo && (
          <div className="absolute inset-0 bg-black/85 backdrop-blur-sm rounded-2xl flex flex-col items-center justify-center p-6 text-center space-y-3 z-10">
            {winnerInfo.winner === "Draw" ? (
              <>
                <div className="text-3xl">🤝</div>
                <h3 className="text-xl font-bold text-slate-300">STALEMATE DRAW!</h3>
              </>
            ) : (
              <>
                <Trophy className={`w-12 h-12 ${winnerInfo.winner === "X" ? "text-cyan-400 animate-bounce" : "text-rose-500"}`} />
                <h3 className="text-xl font-black text-white">
                  {winnerInfo.winner === "X" ? "🎉 PLAYER X VICTORIOUS!" : "🤖 O WINS MATCH!"}
                </h3>
              </>
            )}
            <button
              onClick={resetGame}
              className="px-6 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-extrabold text-xs shadow-lg shadow-cyan-600/20 cursor-pointer transition-all"
            >
              Play Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
