import React, { useState, useEffect } from "react";
import { Play, RotateCcw, Trophy, Music, Zap, Sparkles } from "lucide-react";

interface Pad {
  id: number;
  color: string;
  glowColor: string;
  borderColor: string;
}

const PADS: Pad[] = [
  { id: 0, color: "bg-emerald-600", glowColor: "bg-emerald-400 shadow-emerald-400/80 scale-105", borderColor: "border-emerald-500" },
  { id: 1, color: "bg-rose-600", glowColor: "bg-rose-400 shadow-rose-400/80 scale-105", borderColor: "border-rose-500" },
  { id: 2, color: "bg-amber-600", glowColor: "bg-amber-400 shadow-amber-400/80 scale-105", borderColor: "border-amber-500" },
  { id: 3, color: "bg-cyan-600", glowColor: "bg-cyan-400 shadow-cyan-400/80 scale-105", borderColor: "border-cyan-500" }
];

export const SimonSaysGame: React.FC = () => {
  const [sequence, setSequence] = useState<number[]>([]);
  const [playerStep, setPlayerStep] = useState<number>(0);
  const [score, setScore] = useState<number>(0);
  const [highScore, setHighScore] = useState<number>(() => {
    return parseInt(localStorage.getItem("simon_high") || "0", 10);
  });
  const [activePad, setActivePad] = useState<number | null>(null);
  const [isAiPlaying, setIsAiPlaying] = useState<boolean>(false);
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [isGameStarted, setIsGameStarted] = useState<boolean>(false);

  const startGame = () => {
    setSequence([]);
    setPlayerStep(0);
    setScore(0);
    setGameOver(false);
    setIsGameStarted(true);
    addNextStep([]);
  };

  const addNextStep = (currentSeq: number[]) => {
    const nextPad = Math.floor(Math.random() * 4);
    const newSeq = [...currentSeq, nextPad];
    setSequence(newSeq);
    setPlayerStep(0);
    playSequence(newSeq);
  };

  const playSequence = (seq: number[]) => {
    setIsAiPlaying(true);
    let i = 0;
    const interval = setInterval(() => {
      if (i >= seq.length) {
        clearInterval(interval);
        setIsAiPlaying(false);
        setActivePad(null);
        return;
      }
      setActivePad(seq[i]);
      setTimeout(() => setActivePad(null), 350);
      i++;
    }, 600);
  };

  const handlePadClick = (id: number) => {
    if (!isGameStarted || isAiPlaying || gameOver) return;

    // Flash Pad
    setActivePad(id);
    setTimeout(() => setActivePad(null), 200);

    if (sequence[playerStep] === id) {
      // Correct step
      if (playerStep + 1 === sequence.length) {
        // Completed full round!
        const newScore = score + 1;
        setScore(newScore);
        if (newScore > highScore) {
          setHighScore(newScore);
          localStorage.setItem("simon_high", newScore.toString());
        }
        setIsAiPlaying(true);
        setTimeout(() => addNextStep(sequence), 800);
      } else {
        setPlayerStep(s => s + 1);
      }
    } else {
      // Wrong pad
      setGameOver(true);
      setIsGameStarted(false);
    }
  };

  return (
    <div className="flex flex-col items-center space-y-4 max-w-md mx-auto w-full">
      {/* Top Header */}
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center gap-2">
          <Music className="w-5 h-5 text-fuchsia-400 animate-pulse" />
          <h2 className="text-sm font-bold text-white">Cyber Simon Pattern Recall</h2>
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
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Sequence Level</span>
          <p className="text-lg font-black text-fuchsia-400 font-mono">{score}</p>
        </div>
        <div className="p-3 rounded-2xl bg-[#111723] border border-zinc-800 text-center">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Best Level</span>
          <p className="text-lg font-black text-amber-400 font-mono">{highScore}</p>
        </div>
      </div>

      {/* Game Stage Pads */}
      <div className="relative p-6 bg-zinc-950 border-2 border-fuchsia-500/40 rounded-full shadow-2xl w-full aspect-square max-w-[300px] flex items-center justify-center">
        <div className="grid grid-cols-2 gap-4 h-full w-full p-2">
          {PADS.map((pad) => {
            const isActive = activePad === pad.id;
            return (
              <button
                key={pad.id}
                onClick={() => handlePadClick(pad.id)}
                disabled={isAiPlaying || !isGameStarted || gameOver}
                className={`rounded-3xl border-4 transition-all duration-150 cursor-pointer ${
                  isActive ? pad.glowColor : pad.color
                } ${pad.borderColor} shadow-xl active:scale-95 disabled:cursor-not-allowed`}
              />
            );
          })}
        </div>

        {/* Center Control / Overlay */}
        <div className="absolute w-24 h-24 rounded-full bg-zinc-900 border-4 border-zinc-800 flex flex-col items-center justify-center shadow-2xl z-10 p-2 text-center">
          {!isGameStarted || gameOver ? (
            <button
              onClick={startGame}
              className="w-full h-full rounded-full bg-fuchsia-600 hover:bg-fuchsia-500 text-white font-extrabold text-[10px] uppercase flex flex-col items-center justify-center gap-0.5 cursor-pointer transition-all shadow-lg"
            >
              <Play className="w-5 h-5 fill-current" />
              <span>{gameOver ? "Retry" : "Start"}</span>
            </button>
          ) : (
            <div className="text-center">
              <span className="text-[9px] font-bold text-slate-400 uppercase block">
                {isAiPlaying ? "LISTEN" : "REPEAT"}
              </span>
              <p className="text-sm font-black text-fuchsia-400 font-mono">{sequence.length}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
