import React, { useState, useEffect } from "react";
import { RotateCcw, Trophy, Sparkles, Brain, Award, Layers } from "lucide-react";

interface Card {
  id: number;
  icon: string;
  label: string;
  isFlipped: boolean;
  isMatched: boolean;
}

const TECH_ICONS = [
  { icon: "🤖", label: "AI Bot" },
  { icon: "⚡", label: "Energy" },
  { icon: "🚀", label: "Rocket" },
  { icon: "💻", label: "Laptop" },
  { icon: "🧠", label: "Neural Net" },
  { icon: "⚛️", label: "React" },
  { icon: "🔮", label: "Future" },
  { icon: "🧬", label: "Algorithm" },
  { icon: "🛡️", label: "Cyber Shield" },
  { icon: "🌐", label: "Cloud Net" }
];

export const MemoryMatchGame: React.FC = () => {
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [moves, setMoves] = useState<number>(0);
  const [matches, setMatches] = useState<number>(0);
  const [timer, setTimer] = useState<number>(0);
  const [isGameActive, setIsGameActive] = useState<boolean>(false);
  const [isWon, setIsWon] = useState<boolean>(false);
  const [difficulty, setDifficulty] = useState<"8pairs" | "10pairs">("8pairs");

  const totalPairs = difficulty === "8pairs" ? 8 : 10;

  const initGame = () => {
    const selectedIcons = TECH_ICONS.slice(0, totalPairs);
    const duplicatedCards = [...selectedIcons, ...selectedIcons].map((item, index) => ({
      id: index,
      icon: item.icon,
      label: item.label,
      isFlipped: false,
      isMatched: false
    }));

    // Shuffle cards
    for (let i = duplicatedCards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [duplicatedCards[i], duplicatedCards[j]] = [duplicatedCards[j], duplicatedCards[i]];
    }

    setCards(duplicatedCards);
    setFlippedCards([]);
    setMoves(0);
    setMatches(0);
    setTimer(0);
    setIsGameActive(true);
    setIsWon(false);
  };

  useEffect(() => {
    initGame();
  }, [difficulty]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isGameActive && !isWon) {
      interval = setInterval(() => {
        setTimer((t) => t + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isGameActive, isWon]);

  const handleCardClick = (id: number) => {
    if (!isGameActive || isWon) return;
    const clickedCard = cards.find((c) => c.id === id);
    if (!clickedCard || clickedCard.isFlipped || clickedCard.isMatched) return;
    if (flippedCards.length >= 2) return;

    // Flip card
    const updatedCards = cards.map((c) => (c.id === id ? { ...c, isFlipped: true } : c));
    setCards(updatedCards);
    const nextFlipped = [...flippedCards, id];
    setFlippedCards(nextFlipped);

    if (nextFlipped.length === 2) {
      setMoves((m) => m + 1);
      const [firstId, secondId] = nextFlipped;
      const card1 = updatedCards.find((c) => c.id === firstId);
      const card2 = updatedCards.find((c) => c.id === secondId);

      if (card1 && card2 && card1.icon === card2.icon) {
        // Match found!
        setTimeout(() => {
          setCards((prev) =>
            prev.map((c) => (c.id === firstId || c.id === secondId ? { ...c, isMatched: true } : c))
          );
          setFlippedCards([]);
          setMatches((prevMatches) => {
            const newM = prevMatches + 1;
            if (newM === totalPairs) {
              setIsWon(true);
              setIsGameActive(false);
            }
            return newM;
          });
        }, 300);
      } else {
        // No match, flip back
        setTimeout(() => {
          setCards((prev) =>
            prev.map((c) => (c.id === firstId || c.id === secondId ? { ...c, isFlipped: false } : c))
          );
          setFlippedCards([]);
        }, 900);
      }
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  return (
    <div className="flex flex-col items-center space-y-4 max-w-lg mx-auto w-full">
      {/* Top Controls */}
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center gap-2">
          <Layers className="w-5 h-5 text-purple-400" />
          <h2 className="text-sm font-bold text-white">Cyber Tech Memory Match</h2>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex bg-zinc-900 border border-zinc-800 rounded-xl p-1 text-[11px] font-bold">
            <button
              onClick={() => setDifficulty("8pairs")}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                difficulty === "8pairs" ? "bg-purple-600 text-white" : "text-slate-400 hover:text-white"
              }`}
            >
              16 Cards
            </button>
            <button
              onClick={() => setDifficulty("10pairs")}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                difficulty === "10pairs" ? "bg-purple-600 text-white" : "text-slate-400 hover:text-white"
              }`}
            >
              20 Cards
            </button>
          </div>

          <button
            onClick={initGame}
            className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs text-slate-300 transition-all cursor-pointer flex items-center gap-1"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reset
          </button>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-3 gap-2 w-full text-center">
        <div className="p-2.5 rounded-2xl bg-[#111723] border border-zinc-800">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Time</span>
          <p className="text-sm font-extrabold text-cyan-400 font-mono">{formatTime(timer)}</p>
        </div>
        <div className="p-2.5 rounded-2xl bg-[#111723] border border-zinc-800">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Moves</span>
          <p className="text-sm font-extrabold text-amber-400 font-mono">{moves}</p>
        </div>
        <div className="p-2.5 rounded-2xl bg-[#111723] border border-zinc-800">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Pairs Found</span>
          <p className="text-sm font-extrabold text-emerald-400 font-mono">
            {matches}/{totalPairs}
          </p>
        </div>
      </div>

      {/* Card Grid */}
      <div className="relative w-full">
        <div
          className={`grid gap-2.5 w-full ${
            difficulty === "8pairs" ? "grid-cols-4" : "grid-cols-5"
          }`}
        >
          {cards.map((card) => (
            <button
              key={card.id}
              onClick={() => handleCardClick(card.id)}
              disabled={card.isMatched}
              className={`aspect-square rounded-2xl border-2 flex flex-col items-center justify-center p-2 transition-all duration-300 cursor-pointer transform ${
                card.isFlipped || card.isMatched
                  ? "bg-purple-950/80 border-purple-500 text-white shadow-lg shadow-purple-500/20 scale-100"
                  : "bg-zinc-900 border-zinc-800 hover:border-purple-500/50 text-transparent hover:scale-105"
              } ${card.isMatched ? "opacity-60 border-emerald-500/60 bg-emerald-950/40" : ""}`}
            >
              {card.isFlipped || card.isMatched ? (
                <>
                  <span className="text-2xl animate-bounce">{card.icon}</span>
                  <span className="text-[9px] font-bold text-purple-200 mt-1 truncate max-w-full">
                    {card.label}
                  </span>
                </>
              ) : (
                <div className="w-6 h-6 rounded-lg bg-zinc-800/80 border border-zinc-700/60 flex items-center justify-center text-[10px] font-mono text-purple-400">
                  ?
                </div>
              )}
            </button>
          ))}
        </div>

        {/* Victory Screen */}
        {isWon && (
          <div className="absolute inset-0 bg-black/85 backdrop-blur-sm rounded-2xl flex flex-col items-center justify-center p-6 text-center space-y-3 z-10">
            <Trophy className="w-12 h-12 text-amber-400 animate-bounce" />
            <h3 className="text-xl font-black text-white">MEMORY MATRIX CLEARED!</h3>
            <p className="text-xs text-slate-300">
              Completed in <strong className="text-cyan-400">{moves} moves</strong> and{" "}
              <strong className="text-amber-400">{formatTime(timer)}</strong>!
            </p>
            <button
              onClick={initGame}
              className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-xs shadow-lg shadow-purple-600/30 cursor-pointer transition-all"
            >
              Play Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
