import React, { useState, useEffect } from "react";
import {
  Brain,
  HelpCircle,
  Trophy,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Clock,
  Sparkles,
  Flame,
  Award,
  ChevronRight,
  RotateCcw
} from "lucide-react";

interface QuizQuestion {
  category: string;
  type: string;
  difficulty: string;
  question: string;
  correct_answer: string;
  incorrect_answers: string[];
  allAnswers?: string[];
}

const CATEGORIES = [
  { id: 0, name: "Any Category" },
  { id: 18, name: "Science: Computers" },
  { id: 19, name: "Science: Mathematics" },
  { id: 17, name: "Science & Nature" },
  { id: 9, name: "General Knowledge" },
  { id: 15, name: "Video Games" },
  { id: 23, name: "History" },
  { id: 11, name: "Film & Cinema" }
];

const DIFFICULTIES = ["any", "easy", "medium", "hard"];

// Helper to decode HTML entities in API text
function decodeHtml(html: string) {
  const txt = document.createElement("textarea");
  txt.innerHTML = html;
  return txt.value;
}

// Web Audio sound synthesizer for quiz SFX
function playQuizSfx(type: "correct" | "wrong" | "victory") {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();

    if (type === "correct") {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
      osc.frequency.exponentialRampToValueAtTime(659.25, ctx.currentTime + 0.15); // E5
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.25);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.25);
    } else if (type === "wrong") {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(220, ctx.currentTime); // A3
      osc.frequency.exponentialRampToValueAtTime(146.83, ctx.currentTime + 0.2); // D3
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.3);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    } else if (type === "victory") {
      [523.25, 659.25, 783.99, 1046.5].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.1);
        gain.gain.setValueAtTime(0.15, ctx.currentTime + i * 0.1);
        gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + i * 0.1 + 0.2);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + i * 0.1);
        osc.stop(ctx.currentTime + i * 0.1 + 0.2);
      });
    }
  } catch (e) {
    // Audio Context blocked or unavailable
  }
}

export const LiveApiQuiz: React.FC = () => {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedCat, setSelectedCat] = useState<number>(18); // Default Computers
  const [selectedDiff, setSelectedDiff] = useState<string>("any");
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
  const [score, setScore] = useState<number>(0);
  const [streak, setStreak] = useState<number>(0);
  const [quizFinished, setQuizFinished] = useState<boolean>(false);
  const [timeLeft, setTimeLeft] = useState<number>(20);
  const [timerActive, setTimerActive] = useState<boolean>(false);

  const fetchQuizQuestions = async () => {
    setLoading(true);
    setQuizFinished(false);
    setCurrentIndex(0);
    setUserAnswers({});
    setScore(0);
    setStreak(0);
    try {
      let url = `https://opentdb.com/api.php?amount=10`;
      if (selectedCat !== 0) url += `&category=${selectedCat}`;
      if (selectedDiff !== "any") url += `&difficulty=${selectedDiff}`;

      const res = await fetch(url);
      const data = await res.json();

      if (data.results && data.results.length > 0) {
        const prepared = data.results.map((q: QuizQuestion) => {
          const decQuestion = decodeHtml(q.question);
          const decCorrect = decodeHtml(q.correct_answer);
          const decIncorrect = q.incorrect_answers.map((ans) => decodeHtml(ans));
          const all = [...decIncorrect, decCorrect].sort(() => Math.random() - 0.5);

          return {
            ...q,
            question: decQuestion,
            correct_answer: decCorrect,
            incorrect_answers: decIncorrect,
            allAnswers: all
          };
        });
        setQuestions(prepared);
        setTimeLeft(20);
        setTimerActive(true);
      } else {
        throw new Error("No quiz questions returned.");
      }
    } catch (err) {
      console.warn("OpenTDB API error, loading local backup quiz:", err);
      // Backup offline trivia questions
      const backup: QuizQuestion[] = [
        {
          category: "Science: Computers",
          type: "multiple",
          difficulty: "easy",
          question: "What does CPU stand for?",
          correct_answer: "Central Processing Unit",
          incorrect_answers: ["Central Process Unit", "Computer Personal Unit", "Central Power Unit"],
          allAnswers: ["Central Processing Unit", "Central Process Unit", "Computer Personal Unit", "Central Power Unit"].sort(() => Math.random() - 0.5)
        },
        {
          category: "Science: Computers",
          type: "multiple",
          difficulty: "medium",
          question: "Which programming language is known as the 'mother of all languages'?",
          correct_answer: "C",
          incorrect_answers: ["Java", "Assembly", "Fortran"],
          allAnswers: ["C", "Java", "Assembly", "Fortran"].sort(() => Math.random() - 0.5)
        },
        {
          category: "General Knowledge",
          type: "multiple",
          difficulty: "easy",
          question: "Which planet is known as the Red Planet?",
          correct_answer: "Mars",
          incorrect_answers: ["Venus", "Jupiter", "Saturn"],
          allAnswers: ["Mars", "Venus", "Jupiter", "Saturn"].sort(() => Math.random() - 0.5)
        }
      ];
      setQuestions(backup);
      setTimeLeft(20);
      setTimerActive(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuizQuestions();
  }, [selectedCat, selectedDiff]);

  // Question Timer Countdown
  useEffect(() => {
    if (!timerActive || quizFinished) return;
    if (timeLeft <= 0) {
      handleSelectAnswer("__TIMEOUT__");
      return;
    }
    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timerActive, timeLeft, quizFinished]);

  const handleSelectAnswer = (ans: string) => {
    if (userAnswers[currentIndex] !== undefined) return; // already answered

    const currentQ = questions[currentIndex];
    const isCorrect = ans === currentQ.correct_answer;

    setUserAnswers((prev) => ({ ...prev, [currentIndex]: ans }));

    if (isCorrect) {
      playQuizSfx("correct");
      setScore((prev) => prev + 1);
      setStreak((prev) => prev + 1);
    } else {
      playQuizSfx("wrong");
      setStreak(0);
    }

    setTimerActive(false);
  };

  const handleNextQuestion = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setTimeLeft(20);
      setTimerActive(true);
    } else {
      setQuizFinished(true);
      setTimerActive(false);
      playQuizSfx("victory");
    }
  };

  const currentQ = questions[currentIndex];

  return (
    <div className="flex-1 flex flex-col h-full bg-zinc-950 text-zinc-100 overflow-y-auto">
      {/* HEADER BAR */}
      <div className="p-4 md:p-6 bg-zinc-900/80 border-b border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-4 shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Brain className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              Live API Knowledge Quiz Arena
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono border border-amber-500/30">
                OpenTDB Live API
              </span>
            </h2>
            <p className="text-xs text-zinc-400">Challenge your mind with live trivia fetched from global trivia databases</p>
          </div>
        </div>

        {/* CONTROLS */}
        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={selectedCat}
            onChange={(e) => setSelectedCat(Number(e.target.value))}
            className="px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-zinc-200 focus:outline-none focus:border-amber-500 cursor-pointer"
          >
            {CATEGORIES.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          <select
            value={selectedDiff}
            onChange={(e) => setSelectedDiff(e.target.value)}
            className="px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-zinc-200 uppercase focus:outline-none focus:border-amber-500 cursor-pointer"
          >
            {DIFFICULTIES.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>

          <button
            onClick={fetchQuizQuestions}
            disabled={loading}
            className="p-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-xl border border-zinc-700 cursor-pointer transition-all"
            title="Fetch New Quiz Questions"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* MAIN QUIZ ARENA */}
      <div className="p-4 md:p-8 max-w-3xl mx-auto w-full flex-1 flex flex-col justify-center space-y-6">
        {loading ? (
          <div className="h-64 flex flex-col items-center justify-center space-y-3">
            <RefreshCw className="w-8 h-8 text-amber-400 animate-spin" />
            <p className="text-xs text-zinc-400 font-mono">Fetching live trivia questions from OpenTDB...</p>
          </div>
        ) : quizFinished ? (
          /* QUIZ FINISHED RESULTS CARD */
          <div className="bg-zinc-900/90 border border-zinc-800 rounded-3xl p-8 text-center space-y-6 shadow-2xl animate-fadeIn">
            <div className="p-4 rounded-3xl bg-amber-500/10 text-amber-400 border border-amber-500/20 w-16 h-16 mx-auto flex items-center justify-center">
              <Trophy className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h3 className="text-2xl font-black text-white">Quiz Completed!</h3>
              <p className="text-xs text-zinc-400">Here is your final performance breakdown</p>
            </div>

            <div className="grid grid-cols-3 gap-4 max-w-md mx-auto">
              <div className="bg-zinc-950 border border-zinc-800 p-4 rounded-2xl">
                <span className="text-[10px] text-zinc-500 uppercase block">Score</span>
                <span className="text-2xl font-black text-amber-400 font-mono">
                  {score} / {questions.length}
                </span>
              </div>
              <div className="bg-zinc-950 border border-zinc-800 p-4 rounded-2xl">
                <span className="text-[10px] text-zinc-500 uppercase block">Accuracy</span>
                <span className="text-2xl font-black text-emerald-400 font-mono">
                  {Math.round((score / questions.length) * 100)}%
                </span>
              </div>
              <div className="bg-zinc-950 border border-zinc-800 p-4 rounded-2xl">
                <span className="text-[10px] text-zinc-500 uppercase block">Max Streak</span>
                <span className="text-2xl font-black text-purple-400 font-mono">{streak} 🔥</span>
              </div>
            </div>

            <button
              onClick={fetchQuizQuestions}
              className="px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 text-xs font-bold rounded-2xl shadow-xl shadow-amber-500/20 flex items-center gap-2 mx-auto cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" /> Start New Quiz Round
            </button>
          </div>
        ) : currentQ ? (
          /* ACTIVE QUESTION CARD */
          <div className="bg-zinc-900/90 border border-zinc-800 rounded-3xl p-6 md:p-8 space-y-6 shadow-2xl relative overflow-hidden">
            {/* STATS HEADER */}
            <div className="flex items-center justify-between text-xs text-zinc-400 border-b border-zinc-800/80 pb-4">
              <span className="font-mono text-zinc-300 font-bold">
                Question {currentIndex + 1} <span className="text-zinc-600">/ {questions.length}</span>
              </span>

              <div className="flex items-center gap-4">
                {streak > 1 && (
                  <span className="text-amber-400 font-bold font-mono flex items-center gap-1">
                    <Flame className="w-4 h-4 text-amber-500" /> {streak} Streak!
                  </span>
                )}

                <span className={`font-mono font-bold flex items-center gap-1 ${timeLeft <= 5 ? "text-rose-400 animate-pulse" : "text-zinc-300"}`}>
                  <Clock className="w-4 h-4" /> {timeLeft}s
                </span>
              </div>
            </div>

            {/* CATEGORY & DIFFICULTY BADGES */}
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-300 text-[11px] font-mono border border-amber-500/20">
                {currentQ.category}
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-zinc-800 text-zinc-400 text-[11px] font-mono uppercase border border-zinc-700">
                {currentQ.difficulty}
              </span>
            </div>

            {/* QUESTION TEXT */}
            <h3 className="text-lg md:text-xl font-bold text-white leading-relaxed">
              {currentQ.question}
            </h3>

            {/* ANSWER OPTIONS */}
            <div className="space-y-3 pt-2">
              {currentQ.allAnswers?.map((ans, idx) => {
                const isSelected = userAnswers[currentIndex] === ans;
                const isAnswered = userAnswers[currentIndex] !== undefined;
                const isCorrectAns = ans === currentQ.correct_answer;

                let btnStyle = "bg-zinc-950 border-zinc-800 text-zinc-200 hover:border-amber-500/50";
                if (isAnswered) {
                  if (isCorrectAns) {
                    btnStyle = "bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold";
                  } else if (isSelected) {
                    btnStyle = "bg-rose-500/20 border-rose-500 text-rose-300 font-bold";
                  } else {
                    btnStyle = "bg-zinc-950/40 border-zinc-800 text-zinc-600 opacity-60";
                  }
                }

                return (
                  <button
                    key={idx}
                    onClick={() => handleSelectAnswer(ans)}
                    disabled={isAnswered}
                    className={`w-full p-4 rounded-2xl border text-left text-xs font-medium transition-all flex items-center justify-between cursor-pointer ${btnStyle}`}
                  >
                    <span>{ans}</span>
                    {isAnswered && (
                      <div>
                        {isCorrectAns && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
                        {isSelected && !isCorrectAns && <XCircle className="w-5 h-5 text-rose-400" />}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* NEXT BUTTON */}
            {userAnswers[currentIndex] !== undefined && (
              <div className="pt-4 border-t border-zinc-800 flex justify-end">
                <button
                  onClick={handleNextQuestion}
                  className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-bold rounded-xl shadow-lg transition-all flex items-center gap-2 cursor-pointer"
                >
                  <span>{currentIndex < questions.length - 1 ? "Next Question" : "View Final Score"}</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
};
