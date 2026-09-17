import React, { useState, useEffect, useCallback } from "react";
import { RotateCcw, Trophy, Flag, Bomb, Sparkles, Brain, ShieldAlert } from "lucide-react";

interface Cell {
  r: number;
  c: number;
  isMine: boolean;
  isRevealed: boolean;
  isFlagged: boolean;
  neighborMines: number;
}

interface MinesweeperProps {
  apiKey?: string;
  selectedModel?: string;
}

export const MinesweeperGame: React.FC<MinesweeperProps> = ({ apiKey, selectedModel }) => {
  const [gridSize, setGridSize] = useState<"8x8" | "10x10">("8x8");
  const ROWS = gridSize === "8x8" ? 8 : 10;
  const COLS = gridSize === "8x8" ? 8 : 10;
  const MINES_COUNT = gridSize === "8x8" ? 10 : 18;

  const [grid, setGrid] = useState<Cell[][]>([]);
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [won, setWon] = useState<boolean>(false);
  const [timer, setTimer] = useState<number>(0);
  const [isGameActive, setIsGameActive] = useState<boolean>(false);
  const [flagMode, setFlagMode] = useState<boolean>(false);
  const [aiAdvice, setAiAdvice] = useState<string>("");
  const [isAiScanning, setIsAiScanning] = useState<boolean>(false);

  const initBoard = useCallback(() => {
    // Empty board
    const newGrid: Cell[][] = [];
    for (let r = 0; r < ROWS; r++) {
      const row: Cell[] = [];
      for (let c = 0; c < COLS; c++) {
        row.push({ r, c, isMine: false, isRevealed: false, isFlagged: false, neighborMines: 0 });
      }
      newGrid.push(row);
    }

    // Plant Mines
    let planted = 0;
    while (planted < MINES_COUNT) {
      const r = Math.floor(Math.random() * ROWS);
      const c = Math.floor(Math.random() * COLS);
      if (!newGrid[r][c].isMine) {
        newGrid[r][c].isMine = true;
        planted++;
      }
    }

    // Calculate Neighbor Mines
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        if (!newGrid[r][c].isMine) {
          let count = 0;
          for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
              const nr = r + dr;
              const nc = c + dc;
              if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS && newGrid[nr][nc].isMine) {
                count++;
              }
            }
          }
          newGrid[r][c].neighborMines = count;
        }
      }
    }

    setGrid(newGrid);
    setGameOver(false);
    setWon(false);
    setTimer(0);
    setIsGameActive(false);
    setAiAdvice("");
  }, [ROWS, COLS, MINES_COUNT]);

  useEffect(() => {
    initBoard();
  }, [initBoard]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isGameActive && !gameOver && !won) {
      interval = setInterval(() => {
        setTimer((t) => t + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isGameActive, gameOver, won]);

  const revealCell = (r: number, c: number, currentGrid: Cell[][]) => {
    if (r < 0 || r >= ROWS || c < 0 || c >= COLS) return;
    const cell = currentGrid[r][c];
    if (cell.isRevealed || cell.isFlagged) return;

    cell.isRevealed = true;

    if (cell.neighborMines === 0 && !cell.isMine) {
      // Flood fill zero neighbor cells
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          if (dr !== 0 || dc !== 0) revealCell(r + dr, c + dc, currentGrid);
        }
      }
    }
  };

  const handleCellClick = (r: number, c: number) => {
    if (gameOver || won) return;
    if (!isGameActive) setIsGameActive(true);

    const newGrid = grid.map((row) => row.map((cell) => ({ ...cell })));
    const cell = newGrid[r][c];

    if (flagMode) {
      if (!cell.isRevealed) {
        cell.isFlagged = !cell.isFlagged;
        setGrid(newGrid);
      }
      return;
    }

    if (cell.isFlagged || cell.isRevealed) return;

    if (cell.isMine) {
      // Detonate game over
      newGrid.forEach((row) =>
        row.forEach((cell) => {
          if (cell.isMine) cell.isRevealed = true;
        })
      );
      setGrid(newGrid);
      setGameOver(true);
      return;
    }

    revealCell(r, c, newGrid);
    setGrid(newGrid);

    // Check Win
    let unrevealedNonMines = 0;
    for (let row of newGrid) {
      for (let cell of row) {
        if (!cell.isMine && !cell.isRevealed) unrevealedNonMines++;
      }
    }

    if (unrevealedNonMines === 0) {
      setWon(true);
    }
  };

  const handleRightClick = (e: React.MouseEvent, r: number, c: number) => {
    e.preventDefault();
    if (gameOver || won) return;
    const newGrid = grid.map((row) => row.map((cell) => ({ ...cell })));
    if (!newGrid[r][c].isRevealed) {
      newGrid[r][c].isFlagged = !newGrid[r][c].isFlagged;
      setGrid(newGrid);
    }
  };

  const flaggedCount = grid.reduce(
    (acc, row) => acc + row.reduce((rAcc, cell) => rAcc + (cell.isFlagged ? 1 : 0), 0),
    0
  );

  const getAiScanHint = async () => {
    setIsAiScanning(true);
    try {
      const res = await fetch("/api/openrouter/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: apiKey ? `Bearer ${apiKey}` : "" },
        body: JSON.stringify({
          model: selectedModel || "google/gemini-2.5-flash",
          messages: [
            {
              role: "system",
              content: "You are a Cyber Minefield AI scanner. Provide 1 concise sentence of tactical advice on safely sweeping mines near revealed numbers."
            },
            {
              role: "user",
              content: `Minesweeper Grid: ${ROWS}x${COLS}, Flagged: ${flaggedCount}/${MINES_COUNT}`
            }
          ]
        })
      });

      if (res.ok) {
        const data = await res.json();
        setAiAdvice(data.choices?.[0]?.message?.content || "Focus on corners and single-number edges to deduct guaranteed safe cells!");
      } else {
        setAiAdvice("Tip: If a 1 touches only 1 unopened square, that square is guaranteed to hold a mine!");
      }
    } catch {
      setAiAdvice("Tip: Numbers tell you exactly how many mines exist in the surrounding 8 tiles.");
    } finally {
      setIsAiScanning(false);
    }
  };

  const getNumberColor = (num: number): string => {
    switch (num) {
      case 1: return "text-cyan-400";
      case 2: return "text-emerald-400";
      case 3: return "text-rose-400";
      case 4: return "text-purple-400";
      case 5: return "text-amber-400";
      default: return "text-fuchsia-400";
    }
  };

  return (
    <div className="flex flex-col items-center space-y-4 max-w-md mx-auto w-full">
      {/* Top Controls */}
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center gap-2">
          <Bomb className="w-5 h-5 text-rose-500 animate-pulse" />
          <h2 className="text-sm font-bold text-white">Cyber Minefield Sweeper</h2>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex bg-zinc-900 border border-zinc-800 rounded-xl p-1 text-[11px] font-bold">
            <button
              onClick={() => setGridSize("8x8")}
              className={`px-2 py-1 rounded-lg transition-all cursor-pointer ${
                gridSize === "8x8" ? "bg-rose-600 text-white" : "text-slate-400 hover:text-white"
              }`}
            >
              8x8
            </button>
            <button
              onClick={() => setGridSize("10x10")}
              className={`px-2 py-1 rounded-lg transition-all cursor-pointer ${
                gridSize === "10x10" ? "bg-rose-600 text-white" : "text-slate-400 hover:text-white"
              }`}
            >
              10x10
            </button>
          </div>

          <button
            onClick={initBoard}
            className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs text-slate-300 transition-all cursor-pointer flex items-center gap-1"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reset
          </button>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-3 gap-2 w-full text-center">
        <div className="p-2.5 rounded-2xl bg-[#111723] border border-zinc-800">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Mines</span>
          <p className="text-sm font-black text-rose-400 font-mono">
            {MINES_COUNT - flaggedCount}
          </p>
        </div>
        <div className="p-2.5 rounded-2xl bg-[#111723] border border-zinc-800">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Timer</span>
          <p className="text-sm font-black text-cyan-400 font-mono">{timer}s</p>
        </div>
        <button
          onClick={() => setFlagMode(!flagMode)}
          className={`p-2.5 rounded-2xl border text-center transition-all cursor-pointer ${
            flagMode
              ? "bg-amber-500/20 border-amber-500/60 text-amber-300 font-bold"
              : "bg-[#111723] border-zinc-800 text-slate-400"
          }`}
        >
          <span className="text-[10px] font-bold uppercase tracking-wider block">Mode</span>
          <span className="text-xs font-black flex items-center justify-center gap-1">
            <Flag className="w-3.5 h-3.5 fill-current" /> {flagMode ? "FLAGGING" : "DIGGING"}
          </span>
        </button>
      </div>

      {/* AI Scanner */}
      <div className="w-full">
        {aiAdvice ? (
          <div className="p-3 rounded-xl bg-cyan-950/40 border border-cyan-800/40 text-xs text-cyan-300 flex items-start gap-2">
            <Sparkles className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
            <div>
              <strong className="block text-cyan-200">AI Scanner Analysis:</strong>
              <span>{aiAdvice}</span>
            </div>
          </div>
        ) : (
          <button
            onClick={getAiScanHint}
            disabled={isAiScanning}
            className="w-full py-2 rounded-xl bg-rose-950/40 hover:bg-rose-900/50 text-rose-400 border border-rose-800/40 text-xs font-bold cursor-pointer transition-all flex items-center justify-center gap-1.5"
          >
            <Brain className="w-3.5 h-3.5" />
            <span>{isAiScanning ? "Scanning Sector..." : "Scan Sector with AI Radar"}</span>
          </button>
        )}
      </div>

      {/* Grid Matrix */}
      <div className="relative p-3 bg-zinc-950 border-2 border-zinc-800 rounded-2xl shadow-2xl w-full aspect-square max-w-[340px]">
        <div
          className={`grid gap-1.5 h-full w-full ${
            gridSize === "8x8" ? "grid-cols-8" : "grid-cols-10"
          }`}
        >
          {grid.map((row, r) =>
            row.map((cell, c) => (
              <button
                key={`${r}-${c}`}
                onClick={() => handleCellClick(r, c)}
                onContextMenu={(e) => handleRightClick(e, r, c)}
                className={`rounded-lg border font-black text-xs flex items-center justify-center transition-all cursor-pointer ${
                  cell.isRevealed
                    ? cell.isMine
                      ? "bg-rose-900 border-rose-500 text-white"
                      : "bg-zinc-900/80 border-zinc-800 text-white"
                    : "bg-zinc-800 hover:bg-zinc-700 border-zinc-700 text-slate-300 active:scale-95"
                }`}
              >
                {cell.isRevealed ? (
                  cell.isMine ? (
                    "💣"
                  ) : cell.neighborMines > 0 ? (
                    <span className={getNumberColor(cell.neighborMines)}>
                      {cell.neighborMines}
                    </span>
                  ) : (
                    ""
                  )
                ) : cell.isFlagged ? (
                  "🚩"
                ) : (
                  ""
                )}
              </button>
            ))
          )}
        </div>

        {/* Win / Loss Overlay */}
        {(gameOver || won) && (
          <div className="absolute inset-0 bg-black/85 backdrop-blur-sm rounded-2xl flex flex-col items-center justify-center p-6 text-center space-y-3 z-10">
            {won ? (
              <>
                <Trophy className="w-12 h-12 text-amber-400 animate-bounce" />
                <h3 className="text-xl font-black text-white">MINEFIELD SWEPT!</h3>
                <p className="text-xs text-slate-300">Time: <strong className="text-cyan-400">{timer} seconds</strong></p>
              </>
            ) : (
              <>
                <div className="text-3xl">💥</div>
                <h3 className="text-lg font-bold text-rose-500">MINE DETONATED!</h3>
                <p className="text-xs text-slate-400">Better luck next sweep!</p>
              </>
            )}
            <button
              onClick={initBoard}
              className="px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs shadow-lg shadow-rose-600/30 cursor-pointer transition-all"
            >
              Play Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
