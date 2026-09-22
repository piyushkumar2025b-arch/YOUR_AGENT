import React, { useState } from "react";
import { motion } from "motion/react";
import { Copy, Check } from "lucide-react";
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
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
      const cleanContent = msg.content.replace(/<thinking_plan>[\s\S]*?<\/thinking_plan>/gi, "").trim();
      navigator.clipboard.writeText(cleanContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    };
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
              className={`mt-2 pt-2 border-t flex items-center justify-between text-[11px] font-mono ${
                isDark
                  ? "border-zinc-800/80 text-zinc-400"
                  : "border-slate-200 text-slate-500"
              }`}
            >
              <span className="text-[10px] text-zinc-500">
                {msg.stats ? `${msg.stats.durationSeconds}s` : ""}
              </span>
              <button
                onClick={handleCopy}
                className={`flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium transition-colors cursor-pointer ${
                  isDark
                    ? "hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200"
                    : "hover:bg-slate-100 text-slate-500 hover:text-slate-800"
                }`}
                title="Copy message content"
              >
                {copied ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-400" />
                    <span className="text-emerald-400 font-semibold">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Copy</span>
                  </>
                )}
              </button>
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
