import React, { useMemo, useState, useEffect, useRef, memo } from "react";
import {
  MapPin,
  Layers,
  ChevronRight,
  ChevronLeft,
  Compass,
  Code2,
  List,
  Sparkles,
  Zap,
  AlignLeft,
  Search,
  Eye
} from "lucide-react";

interface CodeSymbol {
  line: number;
  name: string;
  type: "function" | "component" | "class" | "interface" | "import" | "export" | "variable";
  text: string;
}

interface CodeMapMinimapProps {
  content: string;
  editorTextareaRef: React.RefObject<HTMLTextAreaElement | null>;
  theme?: "light" | "dark";
  onJumpToLine?: (lineNumber: number) => void;
}

export const CodeMapMinimap: React.FC<CodeMapMinimapProps> = memo(({
  content,
  editorTextareaRef,
  theme = "dark",
  onJumpToLine
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState<"map" | "symbols">("map");
  const [symbolSearch, setSymbolSearch] = useState("");
  const minimapRef = useRef<HTMLDivElement>(null);
  const viewportBoxRef = useRef<HTMLDivElement>(null);
  const scrollPercentRef = useRef<HTMLSpanElement>(null);

  const lines = useMemo(() => (content || "").split("\n"), [content]);
  const totalLines = lines.length;

  const minimapLineElements = useMemo(() => {
    return lines.slice(0, 150).map((lineText, i) => {
      const trimmed = lineText.trim();
      const indent = lineText.length - lineText.trimStart().length;
      const widthPercent = Math.min(100, Math.max(8, (lineText.length / 80) * 100));

      let colorClass = "bg-slate-600/50";
      if (trimmed.startsWith("//") || trimmed.startsWith("/*")) {
        colorClass = "bg-emerald-500/60";
      } else if (
        trimmed.startsWith("import") ||
        trimmed.startsWith("export") ||
        trimmed.startsWith("from")
      ) {
        colorClass = "bg-amber-400/80";
      } else if (
        trimmed.includes("function") ||
        trimmed.includes("class") ||
        trimmed.includes("const ") ||
        trimmed.includes("let ")
      ) {
        colorClass = "bg-indigo-400/90";
      } else if (trimmed.includes("<") && trimmed.includes(">")) {
        colorClass = "bg-cyan-400/80";
      } else if (trimmed.includes("return") || trimmed.includes("if")) {
        colorClass = "bg-purple-400/80";
      }

      return (
        <div
          key={i}
          className="h-[3px] rounded-full transition-all"
          style={{
            marginLeft: `${Math.min(30, indent * 2)}px`,
            width: `${widthPercent}%`
          }}
        >
          <div className={`h-full w-full rounded-full ${colorClass}`} />
        </div>
      );
    });
  }, [lines]);

  // Extract symbols for rapid navigation (only when needed and capped for speed)
  const symbols = useMemo(() => {
    if (activeTab !== "symbols") return [];
    const list: CodeSymbol[] = [];
    const maxScanLines = Math.min(lines.length, 1200);
    for (let idx = 0; idx < maxScanLines; idx++) {
      const lineText = lines[idx];
      const trimmed = lineText.trim();
      const lineNum = idx + 1;

      if (!trimmed || trimmed.startsWith("//") || trimmed.startsWith("/*")) continue;

      // React / TS Component or Function
      const fnMatch = trimmed.match(/(?:export\s+)?(?:async\s+)?function\s+([a-zA-Z0-9_$]+)/);
      if (fnMatch) {
        list.push({ line: lineNum, name: fnMatch[1], type: "function", text: trimmed });
        if (list.length >= 80) break;
        continue;
      }

      // Const Component / Arrow function: const MyComp = ... or const handleX = ...
      const constMatch = trimmed.match(/(?:export\s+)?const\s+([a-zA-Z0-9_$]+)\s*[:=]/);
      if (constMatch) {
        const name = constMatch[1];
        const isComp = /^[A-Z]/.test(name);
        list.push({
          line: lineNum,
          name,
          type: isComp ? "component" : "variable",
          text: trimmed
        });
        if (list.length >= 80) break;
        continue;
      }

      // Class declaration
      const classMatch = trimmed.match(/(?:export\s+)?class\s+([a-zA-Z0-9_$]+)/);
      if (classMatch) {
        list.push({ line: lineNum, name: classMatch[1], type: "class", text: trimmed });
        if (list.length >= 80) break;
        continue;
      }

      // Interface or Type
      const typeMatch = trimmed.match(/(?:export\s+)?(?:interface|type)\s+([a-zA-Z0-9_$]+)/);
      if (typeMatch) {
        list.push({ line: lineNum, name: typeMatch[1], type: "interface", text: trimmed });
        if (list.length >= 80) break;
        continue;
      }

      // Export default
      if (trimmed.startsWith("export default")) {
        list.push({ line: lineNum, name: "export default", type: "export", text: trimmed });
        if (list.length >= 80) break;
      }
    }
    return list;
  }, [lines, activeTab]);

  // Track editor scrolling to update minimap viewport box (RAF throttled)
  useEffect(() => {
    const textarea = editorTextareaRef.current;
    if (!textarea) return;

    let rafId: number | null = null;
    const handleScroll = () => {
      if (rafId !== null) return;
      rafId = requestAnimationFrame(() => {
        rafId = null;
        const { scrollTop, scrollHeight, clientHeight } = textarea;
        const maxScroll = Math.max(1, scrollHeight - clientHeight);
        const ratio = Math.max(0, Math.min(1, scrollTop / maxScroll));
        const vpRatio = Math.min(1, Math.max(0.05, clientHeight / Math.max(1, scrollHeight)));
        if (viewportBoxRef.current) {
          viewportBoxRef.current.style.top = `${ratio * 85}%`;
          viewportBoxRef.current.style.height = `${Math.max(12, vpRatio * 100)}%`;
        }
        if (scrollPercentRef.current) {
          scrollPercentRef.current.innerText = `${Math.round(ratio * 100)}%`;
        }
      });
    };

    textarea.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => {
      if (rafId !== null) cancelAnimationFrame(rafId);
      textarea.removeEventListener("scroll", handleScroll);
    };
  }, [editorTextareaRef]);

  // Handle click on minimap to scroll editor
  const handleMinimapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const container = minimapRef.current;
    const textarea = editorTextareaRef.current;
    if (!container || !textarea) return;

    const rect = container.getBoundingClientRect();
    const clickY = e.clientY - rect.top;
    const clickRatio = Math.max(0, Math.min(1, clickY / rect.height));

    const lineIndex = Math.floor(clickRatio * totalLines);
    jumpToSpecificLine(lineIndex + 1);
  };

  const jumpToSpecificLine = (lineNum: number) => {
    const textarea = editorTextareaRef.current;
    if (!textarea) return;

    const totalHeight = textarea.scrollHeight;
    const targetScroll = ((lineNum - 1) / Math.max(1, totalLines)) * totalHeight;

    textarea.scrollTo({
      top: targetScroll,
      behavior: "smooth"
    });

    if (onJumpToLine) {
      onJumpToLine(lineNum);
    }
  };

  // Filter symbols search
  const filteredSymbols = useMemo(() => {
    if (!symbolSearch.trim()) return symbols;
    return symbols.filter(
      (s) =>
        s.name.toLowerCase().includes(symbolSearch.toLowerCase()) ||
        s.type.toLowerCase().includes(symbolSearch.toLowerCase())
    );
  }, [symbols, symbolSearch]);

  if (isCollapsed) {
    return (
      <div className="w-10 bg-[#16161a] border-l border-white/10 flex flex-col items-center py-3 shrink-0 select-none">
        <button
          type="button"
          onClick={() => setIsCollapsed(false)}
          className="p-2 rounded-xl bg-indigo-600/30 text-indigo-300 hover:bg-indigo-600 hover:text-white transition-all cursor-pointer shadow-lg"
          title="Expand Code Map Visualizer Sidebar"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <div className="mt-6 flex flex-col items-center gap-4 text-xs font-mono text-slate-400">
          <div className="writing-mode-vertical rotate-180 tracking-widest text-[10px] uppercase font-bold text-indigo-400/80 flex items-center gap-1">
            <Compass className="w-3 h-3 text-indigo-400" /> CODE MAP ({totalLines}L)
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-52 bg-[#121215] border-l border-white/10 flex flex-col shrink-0 select-none font-mono text-xs overflow-hidden relative shadow-2xl">
      {/* Header Bar */}
      <div className="h-9 px-3 bg-[#18181c] border-b border-white/10 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-1.5 text-indigo-400 font-bold text-[11px] tracking-wide uppercase">
          <Compass className="w-3.5 h-3.5 animate-spin-slow text-indigo-400" />
          <span>Code Map</span>
          <span className="px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 text-[9px]">
            {totalLines}L
          </span>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setActiveTab(activeTab === "map" ? "symbols" : "map")}
            className={`p-1 rounded transition-colors ${
              activeTab === "symbols"
                ? "bg-indigo-600 text-white"
                : "text-slate-400 hover:text-white hover:bg-white/10"
            }`}
            title="Toggle Symbol Outline List"
          >
            <List className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setIsCollapsed(true)}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            title="Collapse Code Map"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Tabs / Sub-Header */}
      {activeTab === "symbols" && (
        <div className="p-2 border-b border-white/5 bg-[#16161a]">
          <div className="relative flex items-center">
            <Search className="w-3 h-3 absolute left-2 text-slate-400" />
            <input
              type="text"
              value={symbolSearch}
              onChange={(e) => setSymbolSearch(e.target.value)}
              placeholder="Search symbols..."
              className="w-full bg-black/40 border border-white/10 rounded-lg pl-7 pr-2 py-1 text-[10px] text-white focus:outline-none focus:border-indigo-500 font-mono"
            />
          </div>
        </div>
      )}

      {/* Body: Minimap Canvas View vs Symbol List */}
      <div className="flex-1 overflow-hidden relative flex flex-col">
        {activeTab === "map" ? (
          <div
            ref={minimapRef}
            onClick={handleMinimapClick}
            className="flex-1 p-2 overflow-hidden relative cursor-pointer group hover:bg-white/[0.02] transition-colors"
          >
            {/* Miniature Code Line Preview Render */}
            <div className="w-full h-full space-y-[2px] opacity-75 group-hover:opacity-90 transition-opacity">
              {minimapLineElements}
            </div>

            {/* Viewport Overlay Box (Indicates current scroll window) */}
            <div
              ref={viewportBoxRef}
              className="absolute left-0 right-0 border-y-2 border-indigo-500 bg-indigo-500/15 backdrop-blur-[1px] rounded pointer-events-none shadow-lg shadow-indigo-500/20"
              style={{
                top: "0%",
                height: "20%"
              }}
            >
              <div className="absolute right-1 top-1 px-1 py-0.2 rounded bg-indigo-600 text-white text-[8px] font-bold shadow">
                VIEWPORT
              </div>
            </div>
          </div>
        ) : (
          /* Symbol Outline Navigation List */
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {filteredSymbols.length === 0 ? (
              <div className="p-4 text-center text-slate-500 text-[10px]">
                No symbols found in file
              </div>
            ) : (
              filteredSymbols.map((sym, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => jumpToSpecificLine(sym.line)}
                  className="w-full text-left p-1.5 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white transition-all flex items-center justify-between group cursor-pointer"
                >
                  <div className="flex items-center gap-2 truncate">
                    <span
                      className={`text-[9px] font-bold px-1 py-0.2 rounded uppercase ${
                        sym.type === "component"
                          ? "bg-purple-500/20 text-purple-300"
                          : sym.type === "function"
                          ? "bg-indigo-500/20 text-indigo-300"
                          : sym.type === "class"
                          ? "bg-cyan-500/20 text-cyan-300"
                          : "bg-emerald-500/20 text-emerald-300"
                      }`}
                    >
                      {sym.type.slice(0, 3)}
                    </span>
                    <span className="text-[11px] font-mono truncate font-semibold group-hover:text-indigo-300">
                      {sym.name}
                    </span>
                  </div>
                  <span className="text-[9px] text-slate-500 font-mono">L{sym.line}</span>
                </button>
              ))
            )}
          </div>
        )}
      </div>

      {/* Code Map Footer Stats */}
      <div className="px-3 py-2 bg-[#16161a] border-t border-white/10 flex items-center justify-between text-[10px] text-slate-400 font-mono shrink-0">
        <span className="flex items-center gap-1">
          <Zap className="w-3 h-3 text-indigo-400" />
          {symbols.length} Symbols
        </span>
        <span ref={scrollPercentRef} className="text-indigo-300 font-bold">
          0%
        </span>
      </div>
    </div>
  );
});

CodeMapMinimap.displayName = "CodeMapMinimap";
