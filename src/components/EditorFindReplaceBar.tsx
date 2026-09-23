import React, { useRef, useEffect } from "react";
import {
  Search,
  Replace,
  ChevronUp,
  ChevronDown,
  X,
  CaseSensitive,
  Regex as RegexIcon,
  WholeWord,
  CheckCheck
} from "lucide-react";

interface EditorFindReplaceBarProps {
  isOpen: boolean;
  onClose: () => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  replaceQuery: string;
  setReplaceQuery: (r: string) => void;
  matchCase: boolean;
  setMatchCase: React.Dispatch<React.SetStateAction<boolean>>;
  useRegex: boolean;
  setUseRegex: React.Dispatch<React.SetStateAction<boolean>>;
  matchWholeWord: boolean;
  setMatchWholeWord: React.Dispatch<React.SetStateAction<boolean>>;
  currentMatchIndex: number;
  totalMatches: number;
  onFindNext: () => void;
  onFindPrev: () => void;
  onReplace: () => void;
  onReplaceAll: () => void;
  showReplaceRow?: boolean;
  setShowReplaceRow?: React.Dispatch<React.SetStateAction<boolean>>;
  theme?: "light" | "dark" | string;
}

export const EditorFindReplaceBar: React.FC<EditorFindReplaceBarProps> = ({
  isOpen,
  onClose,
  searchQuery,
  setSearchQuery,
  replaceQuery,
  setReplaceQuery,
  matchCase,
  setMatchCase,
  useRegex,
  setUseRegex,
  matchWholeWord,
  setMatchWholeWord,
  currentMatchIndex,
  totalMatches,
  onFindNext,
  onFindPrev,
  onReplace,
  onReplaceAll,
  showReplaceRow = true,
  setShowReplaceRow,
  theme = "dark"
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const isDark = theme !== "light";

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      }, 50);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") {
      e.preventDefault();
      onClose();
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (e.shiftKey) {
        onFindPrev();
      } else {
        onFindNext();
      }
    }
  };

  return (
    <div
      className={`absolute top-2 right-4 z-30 shadow-2xl rounded-lg border backdrop-blur-md transition-all duration-150 animate-in fade-in slide-in-from-top-2 p-2 ${
        isDark
          ? "bg-[#252528]/95 border-zinc-700/80 text-white"
          : "bg-white/95 border-slate-300 text-slate-900"
      }`}
      style={{ width: "360px", maxWidth: "calc(100% - 24px)" }}
    >
      {/* Search Row */}
      <div className="flex items-center gap-1.5 mb-1.5">
        <div className="relative flex-1 flex items-center">
          <Search className={`w-3.5 h-3.5 absolute left-2 pointer-events-none ${isDark ? "text-zinc-400" : "text-slate-400"}`} />
          <input
            ref={inputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Find in file (Enter = Next)..."
            className={`w-full pl-7 pr-20 py-1 text-xs rounded border font-mono outline-none transition-colors ${
              isDark
                ? "bg-[#18181b] border-zinc-700 text-white placeholder-zinc-500 focus:border-indigo-500"
                : "bg-slate-50 border-slate-300 text-slate-800 placeholder-slate-400 focus:border-indigo-500"
            }`}
          />
          <div className="absolute right-1 flex items-center gap-0.5">
            <button
              type="button"
              onClick={() => setMatchCase(prev => !prev)}
              className={`p-0.5 rounded text-[10px] cursor-pointer ${
                matchCase
                  ? "bg-indigo-600 text-white"
                  : isDark ? "text-zinc-400 hover:text-white" : "text-slate-500 hover:text-slate-800"
              }`}
              title="Match Case (Alt+C)"
            >
              <CaseSensitive className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setMatchWholeWord(prev => !prev)}
              className={`p-0.5 rounded text-[10px] cursor-pointer ${
                matchWholeWord
                  ? "bg-indigo-600 text-white"
                  : isDark ? "text-zinc-400 hover:text-white" : "text-slate-500 hover:text-slate-800"
              }`}
              title="Match Whole Word (Alt+W)"
            >
              <WholeWord className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setUseRegex(prev => !prev)}
              className={`p-0.5 rounded text-[10px] cursor-pointer ${
                useRegex
                  ? "bg-indigo-600 text-white"
                  : isDark ? "text-zinc-400 hover:text-white" : "text-slate-500 hover:text-slate-800"
              }`}
              title="Use Regular Expression (Alt+R)"
            >
              <RegexIcon className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Match Count Badge */}
        <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded shrink-0 ${
          totalMatches > 0
            ? isDark ? "bg-indigo-950/80 text-indigo-300 border border-indigo-800/50" : "bg-indigo-50 text-indigo-700 border border-indigo-200"
            : isDark ? "text-zinc-500" : "text-slate-400"
        }`}>
          {totalMatches > 0 ? `${currentMatchIndex + 1}/${totalMatches}` : searchQuery ? "No results" : "0/0"}
        </span>

        {/* Up / Down navigation buttons */}
        <button
          type="button"
          onClick={onFindPrev}
          disabled={totalMatches === 0}
          className={`p-1 rounded cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed ${
            isDark ? "hover:bg-zinc-700 text-zinc-300" : "hover:bg-slate-200 text-slate-700"
          }`}
          title="Previous Match (Shift+Enter)"
        >
          <ChevronUp className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={onFindNext}
          disabled={totalMatches === 0}
          className={`p-1 rounded cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed ${
            isDark ? "hover:bg-zinc-700 text-zinc-300" : "hover:bg-slate-200 text-slate-700"
          }`}
          title="Next Match (Enter)"
        >
          <ChevronDown className="w-3.5 h-3.5" />
        </button>

        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className={`p-1 rounded cursor-pointer ${
            isDark ? "hover:bg-zinc-700 text-zinc-400 hover:text-white" : "hover:bg-slate-200 text-slate-500 hover:text-slate-800"
          }`}
          title="Close (Esc)"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Replace Row */}
      {showReplaceRow && (
        <div className="flex items-center gap-1.5 pt-1 border-t border-zinc-700/40">
          <div className="relative flex-1 flex items-center">
            <Replace className={`w-3.5 h-3.5 absolute left-2 pointer-events-none ${isDark ? "text-zinc-400" : "text-slate-400"}`} />
            <input
              type="text"
              value={replaceQuery}
              onChange={(e) => setReplaceQuery(e.target.value)}
              placeholder="Replace with..."
              className={`w-full pl-7 pr-2 py-1 text-xs rounded border font-mono outline-none transition-colors ${
                isDark
                  ? "bg-[#18181b] border-zinc-700 text-white placeholder-zinc-500 focus:border-indigo-500"
                  : "bg-slate-50 border-slate-300 text-slate-800 placeholder-slate-400 focus:border-indigo-500"
              }`}
            />
          </div>

          <button
            type="button"
            onClick={onReplace}
            disabled={totalMatches === 0}
            className={`px-2 py-1 rounded text-[11px] font-medium cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed transition-colors ${
              isDark ? "bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700" : "bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300"
            }`}
            title="Replace Current Occurrence"
          >
            Replace
          </button>

          <button
            type="button"
            onClick={onReplaceAll}
            disabled={totalMatches === 0}
            className={`flex items-center gap-1 px-2 py-1 rounded text-[11px] font-medium cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed transition-colors ${
              isDark ? "bg-indigo-600 hover:bg-indigo-500 text-white" : "bg-indigo-600 hover:bg-indigo-700 text-white"
            }`}
            title="Replace All Occurrences"
          >
            <CheckCheck className="w-3 h-3" />
            All
          </button>
        </div>
      )}
    </div>
  );
};
