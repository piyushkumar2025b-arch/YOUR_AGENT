import React, { useState, useEffect } from "react";
import { Search, Sparkles, Terminal, BookOpen, Layers, X, Flame } from "lucide-react";
import { useAppStore } from "../../store/useAppStore";
import { performFuzzySearch, SearchableItem } from "../../utils/fuzzySearch";
import { triggerConfettiBurst } from "../../utils/celebrationFX";
import { saveLogToDb } from "../../db/indexedDb";
import { formatDisplayDate } from "../../utils/dateFormatter";

interface GlobalCommandPaletteProps {
  agentsList: { id: string; name: string; description: string; category?: string }[];
  onSelectAgent: (agentId: string) => void;
}

export const GlobalCommandPalette: React.FC<GlobalCommandPaletteProps> = ({
  agentsList,
  onSelectAgent
}) => {
  const commandPaletteOpen = useAppStore((s) => s.commandPaletteOpen);
  const setCommandPaletteOpen = useAppStore((s) => s.setCommandPaletteOpen);
  const addNotification = useAppStore((s) => s.addNotification);

  const [query, setQuery] = useState("");

  const searchableItems: SearchableItem[] = agentsList.map((a) => ({
    id: a.id,
    title: a.name,
    category: a.category || "AI Agent",
    description: a.description,
    action: () => {
      onSelectAgent(a.id);
      saveLogToDb(a.id, a.name, "info", `Launched agent from Command Palette at ${formatDisplayDate(new Date())}`);
      addNotification("info", "Agent Launched", `Opening ${a.name}...`);
      triggerConfettiBurst(40);
    }
  }));

  const results = performFuzzySearch(searchableItems, query);

  useEffect(() => {
    if (!commandPaletteOpen) {
      setQuery("");
    }
  }, [commandPaletteOpen]);

  if (!commandPaletteOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-black/80 backdrop-blur-md p-4">
      <div className="w-full max-w-2xl bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150">
        
        {/* Search Input Bar */}
        <div className="p-4 border-b border-zinc-800 flex items-center gap-3 bg-zinc-950/80">
          <Search className="w-5 h-5 text-indigo-400 shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command or search 60+ AI agents & tools... (Esc to exit)"
            className="w-full bg-transparent text-zinc-100 placeholder-zinc-500 text-sm font-medium focus:outline-none"
            autoFocus
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="p-1 rounded-md text-zinc-400 hover:text-zinc-200 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <span className="text-[10px] font-mono px-2 py-1 rounded bg-zinc-800 text-zinc-400 border border-zinc-700">
            Ctrl+K
          </span>
        </div>

        {/* Results List */}
        <div className="p-2 max-h-[380px] overflow-y-auto custom-scrollbar flex flex-col gap-1">
          {results.length > 0 ? (
            results.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  if (item.action) item.action();
                  setCommandPaletteOpen(false);
                }}
                className="w-full text-left p-3 rounded-xl hover:bg-indigo-600/15 border border-transparent hover:border-indigo-500/30 transition-all flex items-start gap-3 group cursor-pointer"
              >
                <div className="p-2 rounded-lg bg-zinc-800 group-hover:bg-indigo-500/20 text-zinc-300 group-hover:text-indigo-400 shrink-0 transition-colors">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <h5 className="text-xs font-bold text-zinc-100 group-hover:text-indigo-300 truncate">
                      {item.title}
                    </h5>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-800/80 text-zinc-400">
                      {item.category}
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-400 truncate mt-0.5">{item.description}</p>
                </div>
              </button>
            ))
          ) : (
            <div className="py-12 text-center text-zinc-500 text-xs">
              No matching agents or tools found for "{query}"
            </div>
          )}
        </div>

        {/* Quick Footer */}
        <div className="p-3 bg-zinc-950 border-t border-zinc-800 flex items-center justify-between text-[11px] text-zinc-400 font-mono">
          <div className="flex items-center gap-2">
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            <span>Fuzzy Search Powered by Fuse.js</span>
          </div>
          <div className="flex items-center gap-3">
            <span>↑↓ Navigate</span>
            <span>↵ Select</span>
          </div>
        </div>

      </div>
    </div>
  );
};
