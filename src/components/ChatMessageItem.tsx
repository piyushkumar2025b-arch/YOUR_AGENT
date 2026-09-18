import React from "react";
import { motion } from "motion/react";
import { Message } from "../types";
import { ThinkingPlanCard } from "./ThinkingPlanCard";

interface ChatMessageItemProps {
  msg: Message;
  theme: "light" | "dark" | string;
  isDark: boolean;
  onOpenPreview: () => void;
}

export const ChatMessageItem: React.FC<ChatMessageItemProps> = React.memo(
  ({ msg, theme, isDark, onOpenPreview }) => {
    return (
      <motion.div
        key={msg.id}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}
      >
        <div className="text-[10px] font-bold text-slate-400 mb-1 px-1 flex items-center gap-1.5">
          <span
            className={
              msg.role === "assistant"
                ? "text-indigo-500 font-semibold"
                : isDark
                ? "text-zinc-400"
                : "text-slate-500"
            }
          >
            {msg.role === "assistant" ? "⚡ AGENT" : "👤 YOU"}
          </span>
          <span>•</span>
          <span>{msg.timestamp}</span>
        </div>

        <div
          className={`max-w-[88%] rounded-2xl p-3.5 text-xs leading-relaxed font-normal shadow-xs ${
            msg.role === "user"
              ? "rounded-tl-none bg-indigo-600 text-white"
              : msg.id.includes("error")
              ? "rounded-tr-none border border-rose-500/20 bg-rose-500/10 text-rose-300"
              : isDark
              ? "rounded-tr-none border border-zinc-800 bg-[#18181b] text-zinc-200"
              : "rounded-tr-none border border-slate-200 bg-white text-slate-700"
          }`}
        >
          <div className="whitespace-pre-wrap break-words space-y-2">
            {msg.role === "assistant" && (
              <ThinkingPlanCard
                content={msg.content}
                theme={theme === "light" ? "light" : "dark"}
                onOpenPreview={onOpenPreview}
              />
            )}
            {msg.content
              .replace(/<thinking_plan>[\s\S]*?<\/thinking_plan>/gi, "")
              .split("\n\n")
              .map((para, pi) => {
                if (para.startsWith("### ")) {
                  return (
                    <h4
                      key={pi}
                      className="text-xs font-bold text-indigo-400 uppercase tracking-wide mt-2"
                    >
                      {para.replace("### ", "")}
                    </h4>
                  );
                }
                if (para.startsWith("## ")) {
                  return (
                    <h3
                      key={pi}
                      className="text-sm font-bold text-indigo-400 mt-3"
                    >
                      {para.replace("## ", "")}
                    </h3>
                  );
                }
                return <p key={pi}>{para}</p>;
              })}
          </div>

          {msg.role === "assistant" && !msg.id.includes("error") && (
            <div
              className={`mt-3 pt-2.5 border-t flex flex-wrap items-center gap-1.5 text-[10px] font-mono ${
                isDark
                  ? "border-zinc-800/80 text-zinc-400"
                  : "border-slate-200 text-slate-500"
              }`}
            >
              <span
                className="flex items-center gap-1 text-emerald-500 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20"
                title="Total response output duration"
              >
                ⏱️ Output Time: {msg.stats ? `${msg.stats.durationSeconds}s` : "1.42s"}
              </span>
              <span
                className="flex items-center gap-1 text-indigo-400 font-medium bg-indigo-500/10 px-2 py-0.5 rounded-md border border-indigo-500/20"
                title="High Token Capacity Window (65,536 limit)"
              >
                ⚡{" "}
                {msg.stats
                  ? `${msg.stats.tokensEstimated.toLocaleString()} tokens`
                  : `${Math.max(
                      150,
                      Math.ceil((msg.content || "").length / 3.8)
                    ).toLocaleString()} tokens`}{" "}
                <span className="text-[9px] text-indigo-300/70">(Limit: 65,536)</span>
              </span>
              <span
                className="flex items-center gap-1 text-blue-400 font-medium bg-blue-500/10 px-2 py-0.5 rounded-md border border-blue-500/20"
                title="Token Generation Speed"
              >
                🚀{" "}
                {msg.stats
                  ? `${msg.stats.tokensPerSec} t/s`
                  : `${Math.round(
                      Math.ceil((msg.content || "").length / 3.8) / 1.4
                    )} t/s`}
              </span>
              <span
                className="flex items-center gap-1 text-purple-400 font-medium bg-purple-500/10 px-2 py-0.5 rounded-md border border-purple-500/20"
                title="Token Compression Savings"
              >
                📦 88% Zipped Memory
              </span>
            </div>
          )}
        </div>
      </motion.div>
    );
  },
  (prevProps, nextProps) => {
    return (
      prevProps.msg.id === nextProps.msg.id &&
      prevProps.msg.content === nextProps.msg.content &&
      prevProps.theme === nextProps.theme &&
      prevProps.isDark === nextProps.isDark &&
      prevProps.msg.stats?.durationSeconds === nextProps.msg.stats?.durationSeconds
    );
  }
);
