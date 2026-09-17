import React, { useState, useEffect } from "react";
import {
  HelpCircle,
  Sparkles,
  CheckCircle,
  XCircle,
  RefreshCw,
  Trophy,
  Award,
  Layers,
  Bot,
  Zap
} from "lucide-react";
import { sanitizeHtml } from "../utils/security";

interface OpenTriviaAgentProps {
  apiKey?: string;
  selectedModel?: string;
  theme: "light" | "dark";
  onAddLog?: (type: string, msg: string) => void;
}

interface TriviaQuestion {
  category: string;
  question: string;
  correct_answer: string;
  incorrect_answers: string[];
  all_answers?: string[];
}

export const OpenTriviaAgent: React.FC<OpenTriviaAgentProps> = ({
  apiKey,
  selectedModel = "google/gemini-2.5-flash",
  theme,
  onAddLog
}) => {
  const [questions, setQuestions] = useState<TriviaQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [score, setScore] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [aiExplanation, setAiExplanation] = useState<string>("");
  const [isExplaining, setIsExplaining] = useState<boolean>(false);

  useEffect(() => {
    fetchTriviaQuestions();
  }, []);

  const fetchTriviaQuestions = async () => {
    setIsLoading(true);
    setCurrentIndex(0);
    setScore(0);
    setSelectedAnswer(null);
    setAiExplanation("");
    if (onAddLog) onAddLog("agent", "Fetching live trivia questions from Open Trivia DB API...");

    try {
      const res = await fetch("/api/trivia/questions");
      if (res.ok) {
        const data = await res.json();
        const results: TriviaQuestion[] = (data.results || []).map((q: TriviaQuestion) => {
          const answers = q.all_answers || [...q.incorrect_answers, q.correct_answer].sort(() => Math.random() - 0.5);
          return { ...q, all_answers: answers };
        });
        setQuestions(results);
        if (onAddLog) onAddLog("success", "Loaded 5 computer science trivia questions via backend!");
      }
    } catch (e) {
      // Fallback trivia dataset
      const mock: TriviaQuestion[] = [
        {
          category: "Science: Computers",
          question: "What does CPU stand for?",
          correct_answer: "Central Processing Unit",
          incorrect_answers: ["Central Process Unit", "Computer Personal Unit", "Central Processor Unit"],
          all_answers: ["Central Process Unit", "Central Processing Unit", "Computer Personal Unit", "Central Processor Unit"]
        }
      ];
      setQuestions(mock);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectAnswer = (ans: string) => {
    if (selectedAnswer !== null) return;
    setSelectedAnswer(ans);
    const currentQ = questions[currentIndex];
    if (ans === currentQ.correct_answer) {
      setScore(prev => prev + 1);
      if (onAddLog) onAddLog("success", "Correct answer selected!");
    } else {
      if (onAddLog) onAddLog("error", "Incorrect answer selected.");
    }
  };

  const handleNextQuestion = () => {
    setSelectedAnswer(null);
    setAiExplanation("");
    setCurrentIndex(prev => prev + 1);
  };

  const handleAiExplainQuestion = async () => {
    const currentQ = questions[currentIndex];
    if (!currentQ) return;

    setIsExplaining(true);
    setAiExplanation("");
    if (onAddLog) onAddLog("agent", `AI Tutor synthesizing deep conceptual explanation for question...`);

    try {
      const res = await fetch("/api/openrouter/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": apiKey ? `Bearer ${apiKey}` : ""
        },
        body: JSON.stringify({
          model: selectedModel,
          messages: [
            {
              role: "system",
              content: "You are an expert Computer Science Professor."
            },
            {
              role: "user",
              content: `Question: ${currentQ.question}\nCorrect Answer: ${currentQ.correct_answer}\n\nExplain why this answer is correct in 2 short bullet points.`
            }
          ]
        })
      });

      if (res.ok) {
        const data = await res.json();
        const text = data.choices?.[0]?.message?.content || "";
        setAiExplanation(text.trim());
        if (onAddLog) onAddLog("success", "AI Explanation generated!");
      }
    } catch (e) {
      setAiExplanation(`• **Core Principle**: ${currentQ.correct_answer} represents standard computing terminology.\n• **Context**: Essential architectural component in digital system logic.`);
    } finally {
      setIsExplaining(false);
    }
  };

  const currentQ = questions[currentIndex];

  return (
    <div className={`w-full min-h-full flex flex-col p-4 md:p-6 transition-colors duration-200 ${
      theme === "dark" ? "bg-zinc-950 text-white" : "bg-slate-50 text-slate-900"
    }`}>
      {/* Banner Header */}
      <div className={`p-5 rounded-2xl border mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm ${
        theme === "dark" ? "bg-gradient-to-r from-zinc-900 via-indigo-950/40 to-zinc-900 border-zinc-800" : "bg-white border-slate-200"
      }`}>
        <div className="flex items-center gap-3.5">
          <div className="p-3 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-md">
            <HelpCircle className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight">Open Trivia & AI Science Quiz Agent</h1>
              <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-indigo-500/15 text-indigo-400 border border-indigo-500/30">
                Live Open Trivia DB API
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Live computer science trivia, interactive score tracking, and AI Professor conceptual explanations!
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-4 py-2 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center gap-2">
            <Trophy className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-bold font-mono text-white">Score: {score} / {questions.length}</span>
          </div>

          <button
            onClick={fetchTriviaQuestions}
            disabled={isLoading}
            className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-extrabold text-xs flex items-center gap-1.5 cursor-pointer shadow-lg shadow-indigo-500/20"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
            New Quiz
          </button>
        </div>
      </div>

      {currentQ ? (
        <div className="max-w-3xl mx-auto w-full flex flex-col gap-4">
          <div className={`p-6 rounded-2xl border space-y-4 shadow-sm ${
            theme === "dark" ? "bg-zinc-900 border-zinc-800" : "bg-white border-slate-200"
          }`}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-indigo-400 uppercase">
                Question {currentIndex + 1} of {questions.length} • {currentQ.category}
              </span>
              <button
                onClick={handleAiExplainQuestion}
                disabled={isExplaining}
                className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-indigo-400 text-xs font-bold flex items-center gap-1 cursor-pointer"
              >
                <Sparkles className={`w-3.5 h-3.5 ${isExplaining ? "animate-spin" : ""}`} />
                AI Explanation
              </button>
            </div>

            <h3
              className="text-base font-bold text-white leading-relaxed"
              dangerouslySetInnerHTML={{ __html: sanitizeHtml(currentQ.question) }}
            />

            {/* Answer Options */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {currentQ.all_answers?.map((ans, idx) => {
                const isSelected = selectedAnswer === ans;
                const isCorrect = ans === currentQ.correct_answer;
                let btnStyle = theme === "dark" ? "bg-zinc-950 border-zinc-800 text-slate-300 hover:border-slate-700" : "bg-slate-50 border-slate-200 text-slate-800";

                if (selectedAnswer !== null) {
                  if (isCorrect) {
                    btnStyle = "bg-emerald-950/60 border-emerald-500 text-emerald-300 font-bold";
                  } else if (isSelected) {
                    btnStyle = "bg-rose-950/60 border-rose-500 text-rose-300 font-bold";
                  }
                }

                return (
                  <button
                    key={idx}
                    onClick={() => handleSelectAnswer(ans)}
                    className={`p-3.5 rounded-xl border text-left text-xs transition-all cursor-pointer ${btnStyle}`}
                    dangerouslySetInnerHTML={{ __html: sanitizeHtml(ans) }}
                  />
                );
              })}
            </div>

            {selectedAnswer && (
              <div className="pt-3 flex justify-end">
                {currentIndex < questions.length - 1 ? (
                  <button
                    onClick={handleNextQuestion}
                    className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs cursor-pointer"
                  >
                    Next Question →
                  </button>
                ) : (
                  <div className="text-xs font-bold text-emerald-400">
                    Quiz Complete! Final Score: {score} / {questions.length}
                  </div>
                )}
              </div>
            )}

            {/* AI Explanation Box */}
            {aiExplanation && (
              <div className="p-4 rounded-xl bg-indigo-950/30 border border-indigo-500/30 space-y-2">
                <h4 className="text-xs font-bold uppercase text-indigo-400 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" /> AI Professor Conceptual Explanation
                </h4>
                <div className="text-xs text-slate-200 leading-relaxed font-sans whitespace-pre-line">
                  {aiExplanation}
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="p-10 text-center text-xs text-slate-500">Loading trivia...</div>
      )}
    </div>
  );
};
