import React, { useState, useEffect, useRef, useDeferredValue, useMemo, useCallback, memo } from "react";
import {
  Edit3,
  Trash2,
  Sparkles,
  Play,
  Terminal,
  Compass,
  FileCode,
  Search,
  History,
  KeyRound,
  Component
} from "lucide-react";
import { VirtualFile, BorderSettings } from "../types";
import { CodeMapMinimap } from "./CodeMapMinimap";
import { TerminalConsolePanel } from "./TerminalConsolePanel";
import { VirtualLineGutter } from "./VirtualLineGutter";
import { LineOffsetIndex } from "../utils/editorPerformance";
import { EditorFindReplaceBar } from "./EditorFindReplaceBar";

interface MainEditorWorkspaceProps {
  theme: "light" | "dark";
  activeFile: VirtualFile | undefined;
  activeBadge: { badge: string; colorClass: string } | null;
  getFileBadgeAndIcon: (filename: string) => { badge: string; colorClass: string };
  handleLanguageChange: (lang: string) => void;
  setRenamingPath: (target: { type: "file" | "folder"; path: string } | null) => void;
  setRenameInputValue: (val: string) => void;
  setDeleteConfirmTarget: (target: { type: "file" | "folder"; path: string } | null) => void;
  setIsCodeRunnerOpen: (open: boolean) => void;
  handleRunActiveFile: (cmd?: string) => void;
  isTerminalRunning: boolean;
  showTerminal: boolean;
  setShowTerminal: React.Dispatch<React.SetStateAction<boolean>>;
  showCodeMap: boolean;
  setShowCodeMap: React.Dispatch<React.SetStateAction<boolean>>;
  editorFontSize: number;
  setEditorFontSize: React.Dispatch<React.SetStateAction<number>>;
  borderSettings: BorderSettings;
  breakpoints: Record<string, number[]>;
  toggleBreakpoint: (path: string, line: number) => void;
  cursorLine: number;
  cursorCol: number;
  jumpToLine: (line: number) => void;
  highlightCode: (code: string, language?: string) => string;
  handleEditFileContent: (val: string) => void;
  updateCursorPos: (target: HTMLTextAreaElement) => void;
  handleKeyDownInEditor: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  handleEditorScroll: (e: React.UIEvent<HTMLTextAreaElement>) => void;
  editorGutterRef: React.RefObject<HTMLDivElement>;
  editorPreRef: React.RefObject<HTMLPreElement>;
  editorTextareaRef: React.RefObject<HTMLTextAreaElement>;
  setShowVSCodeProModal: (open: boolean) => void;
  setGotoLineInput: (val: string) => void;
  setShowGoToLineModal: (open: boolean) => void;
  setShowDocStatsModal: (open: boolean) => void;
  handleFormatCode: () => void;
  setShowEncodingPickerModal: (open: boolean) => void;
  fileEncoding: string;
  indentSize: number;
  setIndentSize: (size: number) => void;
  indentType: string;
  setShowLanguagePickerModal: (open: boolean) => void;
  selectedFilePath: string;
  addAgentAction: (type: any, message: string, path?: string) => void;
  brainBoardHeight: number;
  setBrainBoardHeight: (h: number) => void;
  terminalExitCode: number | null;
  terminalOutput: string;
  setTerminalOutput: React.Dispatch<React.SetStateAction<string>>;
  customCommandInput: string;
  setCustomCommandInput: React.Dispatch<React.SetStateAction<string>>;
  onOpenTimeMachine?: () => void;
  onOpenSecretsVault?: () => void;
  onOpenSnippets?: () => void;
}

export const MainEditorWorkspace: React.FC<MainEditorWorkspaceProps> = memo(({
  theme,
  activeFile,
  activeBadge,
  getFileBadgeAndIcon,
  handleLanguageChange,
  setRenamingPath,
  setRenameInputValue,
  setDeleteConfirmTarget,
  setIsCodeRunnerOpen,
  handleRunActiveFile,
  isTerminalRunning,
  showTerminal,
  setShowTerminal,
  showCodeMap,
  setShowCodeMap,
  editorFontSize,
  setEditorFontSize,
  borderSettings,
  breakpoints,
  toggleBreakpoint,
  cursorLine,
  cursorCol,
  jumpToLine,
  highlightCode,
  handleEditFileContent,
  updateCursorPos,
  handleKeyDownInEditor,
  handleEditorScroll,
  editorGutterRef,
  editorPreRef,
  editorTextareaRef,
  setShowVSCodeProModal,
  setGotoLineInput,
  setShowGoToLineModal,
  setShowDocStatsModal,
  handleFormatCode,
  setShowEncodingPickerModal,
  fileEncoding,
  indentSize,
  setIndentSize,
  indentType,
  setShowLanguagePickerModal,
  selectedFilePath,
  addAgentAction,
  brainBoardHeight,
  setBrainBoardHeight,
  terminalExitCode,
  terminalOutput,
  setTerminalOutput,
  customCommandInput,
  setCustomCommandInput,
  onOpenTimeMachine,
  onOpenSecretsVault,
  onOpenSnippets
}) => {
  // Local immediate content buffer to decouple keystrokes from root App.tsx re-renders
  const [localContent, setLocalContent] = useState<string>(activeFile?.content || "");
  const deferredContent = useDeferredValue(localContent);
  const debounceSyncRef = useRef<any>(null);
  const lastActivePathRef = useRef<string | undefined>(activeFile?.path);
  const isTypingRef = useRef<boolean>(false);

  // Line Indexer & decoupled high-performance cursor tracking
  const lineIndexerRef = useRef(new LineOffsetIndex());
  const [localCursor, setLocalCursor] = useState({ line: cursorLine || 1, col: cursorCol || 1 });
  const cursorPosDebounceRef = useRef<any>(null);
  const activeLineRef = useRef<HTMLDivElement | null>(null);

  // In-Editor Find & Replace State
  const [showFindBar, setShowFindBar] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [replaceQuery, setReplaceQuery] = useState<string>("");
  const [matchCase, setMatchCase] = useState<boolean>(false);
  const [useRegex, setUseRegex] = useState<boolean>(false);
  const [matchWholeWord, setMatchWholeWord] = useState<boolean>(false);
  const [currentMatchIndex, setCurrentMatchIndex] = useState<number>(0);

  // Calculate search match intervals
  const searchMatches = useMemo(() => {
    if (!searchQuery) return [];
    try {
      let pattern = searchQuery;
      if (!useRegex) {
        pattern = pattern.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      }
      if (matchWholeWord) {
        pattern = `\\b${pattern}\\b`;
      }
      const regex = new RegExp(pattern, matchCase ? "g" : "gi");
      const indices: { start: number; end: number }[] = [];
      let m: RegExpExecArray | null;
      let limit = 0;
      while ((m = regex.exec(localContent)) !== null && limit < 1000) {
        limit++;
        indices.push({ start: m.index, end: m.index + m[0].length });
        if (m[0].length === 0) regex.lastIndex++;
      }
      return indices;
    } catch {
      return [];
    }
  }, [searchQuery, localContent, matchCase, useRegex, matchWholeWord]);

  // Sync cursor when prop changes externally (e.g. goto line modal)
  useEffect(() => {
    if (cursorLine && (cursorLine !== localCursor.line || cursorCol !== localCursor.col)) {
      setLocalCursor({ line: cursorLine, col: cursorCol || 1 });
    }
  }, [cursorLine, cursorCol]);

  // Keep active line highlight positioned smoothly without React state updates
  useEffect(() => {
    if (activeLineRef.current && editorTextareaRef.current) {
      const st = editorTextareaRef.current.scrollTop;
      const lhFloat = parseFloat(String(borderSettings.codeLineHeight || 1.625));
      const lineH = editorFontSize * (isNaN(lhFloat) ? 1.625 : lhFloat);
      activeLineRef.current.style.transform = `translateY(${16 + (localCursor.line - 1) * lineH - st}px)`;
      activeLineRef.current.style.height = `${lineH}px`;
    }
  }, [localCursor.line, editorFontSize, borderSettings.codeLineHeight]);

  // Sync with activeFile when switching files or when external updates occur
  useEffect(() => {
    if (activeFile?.path !== lastActivePathRef.current) {
      lastActivePathRef.current = activeFile?.path;
      setLocalContent(activeFile?.content || "");
      lineIndexerRef.current.update(activeFile?.content || "");
      setLocalCursor({ line: 1, col: 1 });
    } else if (!isTypingRef.current && activeFile?.content !== localContent) {
      setLocalContent(activeFile?.content || "");
      lineIndexerRef.current.update(activeFile?.content || "");
    }
  }, [activeFile?.path, activeFile?.content]);

  const onLocalTextChange = (val: string) => {
    isTypingRef.current = true;
    setLocalContent(val);
    lineIndexerRef.current.update(val);

    if (debounceSyncRef.current) clearTimeout(debounceSyncRef.current);
    debounceSyncRef.current = setTimeout(() => {
      handleEditFileContent(val);
      setTimeout(() => {
        isTypingRef.current = false;
      }, 50);
    }, 300);
  };

  const onLocalBlur = () => {
    if (debounceSyncRef.current) clearTimeout(debounceSyncRef.current);
    handleEditFileContent(localContent);
    setTimeout(() => {
      isTypingRef.current = false;
    }, 50);
  };

  // High-performance O(log N) cursor positioning that never lags root App.tsx
  const handleCursorEvent = (target: HTMLTextAreaElement) => {
    const pos = lineIndexerRef.current.getPosition(target.selectionStart || 0);
    setLocalCursor(pos);

    // Debounce notification to parent App.tsx so keystrokes/arrows never freeze root UI
    if (cursorPosDebounceRef.current) clearTimeout(cursorPosDebounceRef.current);
    cursorPosDebounceRef.current = setTimeout(() => {
      updateCursorPos(target);
    }, 250);
  };

  // Direct synchronous scrolling across DOM nodes (60/120 FPS zero React bottleneck)
  const onEditorScrollInternal = (e: React.UIEvent<HTMLTextAreaElement>) => {
    const st = e.currentTarget.scrollTop;
    const sl = e.currentTarget.scrollLeft;

    if (editorPreRef.current) {
      editorPreRef.current.scrollTop = st;
      editorPreRef.current.scrollLeft = sl;
    }
    if (editorGutterRef.current) {
      editorGutterRef.current.scrollTop = st;
    }
    if (activeLineRef.current) {
      const lhFloat = parseFloat(String(borderSettings.codeLineHeight || 1.625));
      const lineH = editorFontSize * (isNaN(lhFloat) ? 1.625 : lhFloat);
      activeLineRef.current.style.transform = `translateY(${16 + (localCursor.line - 1) * lineH - st}px)`;
    }

    if (handleEditorScroll) {
      handleEditorScroll(e);
    }
  };

  // Find & Replace navigation and execution handlers
  const onFindNext = useCallback(() => {
    if (searchMatches.length === 0) return;
    const nextIdx = (currentMatchIndex + 1) % searchMatches.length;
    setCurrentMatchIndex(nextIdx);
    const match = searchMatches[nextIdx];
    if (editorTextareaRef.current && match) {
      editorTextareaRef.current.focus();
      editorTextareaRef.current.selectionStart = match.start;
      editorTextareaRef.current.selectionEnd = match.end;
      const pos = lineIndexerRef.current.getPosition(match.start);
      handleJumpToLineInternal(pos.line);
    }
  }, [searchMatches, currentMatchIndex]);

  const onFindPrev = useCallback(() => {
    if (searchMatches.length === 0) return;
    const prevIdx = (currentMatchIndex - 1 + searchMatches.length) % searchMatches.length;
    setCurrentMatchIndex(prevIdx);
    const match = searchMatches[prevIdx];
    if (editorTextareaRef.current && match) {
      editorTextareaRef.current.focus();
      editorTextareaRef.current.selectionStart = match.start;
      editorTextareaRef.current.selectionEnd = match.end;
      const pos = lineIndexerRef.current.getPosition(match.start);
      handleJumpToLineInternal(pos.line);
    }
  }, [searchMatches, currentMatchIndex]);

  const onReplace = useCallback(() => {
    if (searchMatches.length === 0) return;
    const match = searchMatches[currentMatchIndex] || searchMatches[0];
    if (!match) return;
    const nextContent = localContent.substring(0, match.start) + replaceQuery + localContent.substring(match.end);
    onLocalTextChange(nextContent);
  }, [searchMatches, currentMatchIndex, localContent, replaceQuery]);

  const onReplaceAll = useCallback(() => {
    if (searchMatches.length === 0) return;
    try {
      let pattern = searchQuery;
      if (!useRegex) {
        pattern = pattern.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      }
      if (matchWholeWord) {
        pattern = `\\b${pattern}\\b`;
      }
      const regex = new RegExp(pattern, matchCase ? "g" : "gi");
      const nextContent = localContent.replace(regex, replaceQuery);
      onLocalTextChange(nextContent);
    } catch {}
  }, [searchMatches, searchQuery, replaceQuery, useRegex, matchWholeWord, matchCase, localContent]);

  // Instant local Tab key indentation & shortcuts
  const handleKeyDownInternal = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && (e.key.toLowerCase() === "f" || e.key.toLowerCase() === "h")) {
      e.preventDefault();
      setShowFindBar(true);
      return;
    }
    if (e.key === "Tab") {
      e.preventDefault();
      const textarea = e.currentTarget;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const spaces = "  ";
      const nextContent = localContent.substring(0, start) + spaces + localContent.substring(end);
      onLocalTextChange(nextContent);
      requestAnimationFrame(() => {
        textarea.selectionStart = textarea.selectionEnd = start + spaces.length;
        handleCursorEvent(textarea);
      });
      return;
    }
    if (handleKeyDownInEditor) {
      handleKeyDownInEditor(e);
    }
  };

  const handleJumpToLineInternal = (lineNum: number) => {
    const lhFloat = parseFloat(String(borderSettings.codeLineHeight || 1.625));
    const lineH = editorFontSize * (isNaN(lhFloat) ? 1.625 : lhFloat);
    const targetOffset = lineIndexerRef.current.getOffset(lineNum);
    const textarea = editorTextareaRef.current;
    if (textarea) {
      textarea.focus();
      textarea.selectionStart = textarea.selectionEnd = targetOffset;
      const targetScroll = Math.max(0, (lineNum - 1) * lineH - textarea.clientHeight / 3);
      textarea.scrollTop = targetScroll;
      if (editorPreRef.current) editorPreRef.current.scrollTop = targetScroll;
      if (editorGutterRef.current) editorGutterRef.current.scrollTop = targetScroll;
    }
    setLocalCursor({ line: lineNum, col: 1 });
    jumpToLine(lineNum);
  };

  const highlightedCodeHtml = useMemo(() => {
    return highlightCode(deferredContent, activeFile?.language || "text");
  }, [deferredContent, activeFile?.language, highlightCode]);

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#1e1e1e] text-slate-300 min-w-0">
      {activeFile ? (
        <>
          {/* Editor header panel */}
          <div className="h-10 px-3 border-b border-white/5 flex items-center justify-between bg-[#1e1e1e] select-none shrink-0 overflow-x-auto scrollbar-none text-xs">
            <div className="flex items-center gap-2.5 shrink-0">
              <div className="flex items-center gap-1.5 font-mono text-white/90">
                <FileCode className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                <span className="font-semibold text-xs tracking-tight">{activeFile.path}</span>
                {activeBadge && (
                  <span className={`px-1 text-[8px] font-extrabold rounded ${activeBadge.colorClass} uppercase`}>
                    {activeBadge.badge}
                  </span>
                )}
              </div>

              {/* Language Syntax Selector */}
              <div className="flex items-center text-[11px] text-white/60">
                <select
                  value={activeFile.language}
                  onChange={(e) => handleLanguageChange(e.target.value)}
                  className="bg-transparent text-emerald-400 font-mono focus:outline-none cursor-pointer hover:text-emerald-300 transition-colors"
                >
                  <option value="c" className="bg-[#1e1e1e] text-white">C (.c)</option>
                  <option value="cpp" className="bg-[#1e1e1e] text-white">C++ (.cpp)</option>
                  <option value="python" className="bg-[#1e1e1e] text-white">Python (.py)</option>
                  <option value="javascript" className="bg-[#1e1e1e] text-white">JavaScript (.js)</option>
                  <option value="typescript" className="bg-[#1e1e1e] text-white">TypeScript (.ts)</option>
                  <option value="jsx" className="bg-[#1e1e1e] text-white">JSX (.jsx)</option>
                  <option value="tsx" className="bg-[#1e1e1e] text-white">TSX (.tsx)</option>
                  <option value="html" className="bg-[#1e1e1e] text-white">HTML (.html)</option>
                  <option value="css" className="bg-[#1e1e1e] text-white">CSS (.css)</option>
                  <option value="json" className="bg-[#1e1e1e] text-white">JSON (.json)</option>
                  <option value="java" className="bg-[#1e1e1e] text-white">Java (.java)</option>
                  <option value="sql" className="bg-[#1e1e1e] text-white">SQL (.sql)</option>
                  <option value="bash" className="bg-[#1e1e1e] text-white">Bash / Shell (.sh)</option>
                  <option value="markdown" className="bg-[#1e1e1e] text-white">Markdown (.md)</option>
                  <option value="text" className="bg-[#1e1e1e] text-white">Plain Text</option>
                </select>
              </div>

              {/* Quick Actions for active file */}
              <div className="flex items-center gap-0.5 border-l border-white/10 pl-2">
                <button
                  onClick={() => {
                    setRenamingPath({ type: "file", path: activeFile.path });
                    setRenameInputValue(activeFile.path.split("/").pop() || activeFile.path);
                  }}
                  className="p-1 text-white/50 hover:text-blue-400 hover:bg-white/5 rounded transition-all cursor-pointer"
                  title="Rename active file"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setDeleteConfirmTarget({ type: "file", path: activeFile.path })}
                  className="p-1 text-white/50 hover:text-rose-400 hover:bg-white/5 rounded transition-all cursor-pointer"
                  title="Delete active file"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Runner Actions */}
              <div className="flex items-center gap-1.5 border-l border-white/10 pl-2">
                <button
                  onClick={() => setIsCodeRunnerOpen(true)}
                  className="flex items-center gap-1 px-2 py-0.5 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded text-xs transition-colors cursor-pointer"
                  title="Run file via OpenRouter AI Compiler Engine & See Output"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>AI Runner</span>
                </button>
                <button
                  onClick={() => handleRunActiveFile()}
                  disabled={isTerminalRunning}
                  className="flex items-center gap-1 px-2 py-0.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-zinc-700 text-white font-medium rounded text-xs transition-colors cursor-pointer"
                  title="Execute and check working of this code"
                >
                  <Play className="w-3.5 h-3.5 text-white" />
                  <span>Run</span>
                </button>
                <button
                  onClick={() => setShowTerminal(!showTerminal)}
                  className={`flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium transition-colors cursor-pointer ${
                    showTerminal
                      ? "bg-white/15 text-white"
                      : "text-zinc-400 hover:text-white hover:bg-white/5"
                  }`}
                  title="Toggle Terminal Console"
                >
                  <Terminal className="w-3.5 h-3.5" />
                  <span>Terminal</span>
                </button>

                <button
                  onClick={() => setShowCodeMap(!showCodeMap)}
                  className={`flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium transition-colors cursor-pointer ${
                    showCodeMap
                      ? "bg-indigo-600/80 text-white"
                      : "text-zinc-400 hover:text-white hover:bg-white/5"
                  }`}
                  title="Toggle Code Map Minimap Visualizer Sidebar"
                >
                  <Compass className="w-3.5 h-3.5 text-indigo-300" />
                  <span className="hidden sm:inline">Map</span>
                </button>

                <button
                  onClick={() => setShowFindBar(!showFindBar)}
                  className={`flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium transition-colors cursor-pointer ${
                    showFindBar
                      ? "bg-indigo-600/80 text-white"
                      : "text-zinc-400 hover:text-white hover:bg-white/5"
                  }`}
                  title="Find & Replace in active file (Ctrl+F / Cmd+F)"
                >
                  <Search className="w-3.5 h-3.5 text-indigo-300" />
                  <span className="hidden sm:inline">Find</span>
                </button>

                {onOpenTimeMachine && (
                  <button
                    onClick={onOpenTimeMachine}
                    className="flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium text-amber-400/90 hover:text-amber-300 hover:bg-amber-500/10 transition-colors cursor-pointer"
                    title="File History & Time Machine Snapshots"
                  >
                    <History className="w-3.5 h-3.5 text-amber-400" />
                    <span className="hidden sm:inline">History</span>
                  </button>
                )}

                {onOpenSecretsVault && (
                  <button
                    onClick={onOpenSecretsVault}
                    className="flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium text-yellow-400/90 hover:text-yellow-300 hover:bg-yellow-500/10 transition-colors cursor-pointer"
                    title="Environment Variables & Secrets Vault (.env)"
                  >
                    <KeyRound className="w-3.5 h-3.5 text-yellow-400" />
                    <span className="hidden sm:inline">Secrets</span>
                  </button>
                )}

                {onOpenSnippets && (
                  <button
                    onClick={onOpenSnippets}
                    className="flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium text-indigo-400/90 hover:text-indigo-300 hover:bg-indigo-500/10 transition-colors cursor-pointer"
                    title="Curated Production Snippets & UI Components"
                  >
                    <Component className="w-3.5 h-3.5 text-indigo-400" />
                    <span className="hidden sm:inline">Snippets</span>
                  </button>
                )}
              </div>
            </div>

            {/* Font size adjustment */}
            <div className="flex items-center gap-2 shrink-0">
              <div className="flex items-center gap-1 text-[11px] font-mono text-white/50">
                <span>{editorFontSize}px</span>
                <button
                  onClick={() => setEditorFontSize(prev => Math.max(10, prev - 1))}
                  className="hover:text-white px-1 hover:bg-white/5 rounded"
                  title="Decrease font size"
                >
                  -
                </button>
                <button
                  onClick={() => setEditorFontSize(prev => Math.min(24, prev + 1))}
                  className="hover:text-white px-1 hover:bg-white/5 rounded"
                  title="Increase font size"
                >
                  +
                </button>
              </div>
              <div className="text-[10px] font-mono text-white/40 uppercase tracking-wider hidden lg:block">
                {(localContent || "").length} chars
              </div>
            </div>
          </div>

          {/* Editor content workspace */}
          <div className="flex-1 flex flex-col font-mono overflow-hidden bg-[#1e1e1e] relative">
            {/* VS Code-style Floating Find & Replace Bar */}
            <EditorFindReplaceBar
              isOpen={showFindBar}
              onClose={() => setShowFindBar(false)}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              replaceQuery={replaceQuery}
              setReplaceQuery={setReplaceQuery}
              matchCase={matchCase}
              setMatchCase={setMatchCase}
              useRegex={useRegex}
              setUseRegex={setUseRegex}
              matchWholeWord={matchWholeWord}
              setMatchWholeWord={setMatchWholeWord}
              currentMatchIndex={currentMatchIndex}
              totalMatches={searchMatches.length}
              onFindNext={onFindNext}
              onFindPrev={onFindPrev}
              onReplace={onReplace}
              onReplaceAll={onReplaceAll}
              theme={theme}
            />

            <div className="flex-1 flex overflow-hidden relative">
              {/* Virtualized Line Numbers Gutter (O(1) DOM nodes, never lags) */}
              {(() => {
                const totalLines = lineIndexerRef.current.getLineCount() || 1;
                const lhFloat = parseFloat(String(borderSettings.codeLineHeight || 1.625));
                const lineHPx = editorFontSize * (isNaN(lhFloat) ? 1.625 : lhFloat);
                const activeBps = breakpoints[activeFile.path] || [];

                return (
                  <VirtualLineGutter
                    totalLines={totalLines}
                    lineHeight={lineHPx}
                    editorFontSize={editorFontSize}
                    cursorLine={localCursor.line}
                    activeBreakpoints={activeBps}
                    onToggleBreakpoint={(lineNum) => toggleBreakpoint(activeFile.path, lineNum)}
                    onJumpToLine={handleJumpToLineInternal}
                    editorTextareaRef={editorTextareaRef}
                    gutterRef={editorGutterRef}
                  />
                );
              })()}

              {/* Highlighting Code Container */}
              <div className="flex-1 relative h-full overflow-hidden bg-[#1e1e1e]">
                {/* Current Active Line Background Highlight Bar */}
                {localCursor.line > 0 && (
                  <div
                    ref={activeLineRef}
                    className="absolute left-0 right-0 top-0 bg-sky-500/10 border-y border-sky-500/20 pointer-events-none z-0"
                    style={{
                      transform: `translateY(${16 + (localCursor.line - 1) * (editorFontSize * (isNaN(parseFloat(String(borderSettings.codeLineHeight))) ? 1.625 : parseFloat(String(borderSettings.codeLineHeight))))}px)`,
                      height: `${editorFontSize * (isNaN(parseFloat(String(borderSettings.codeLineHeight))) ? 1.625 : parseFloat(String(borderSettings.codeLineHeight)))}px`
                    }}
                  />
                )}

                {/* The highlighted background pre block */}
                <pre
                  ref={editorPreRef}
                  className="absolute inset-0 p-4 font-mono leading-relaxed whitespace-pre overflow-hidden pointer-events-none select-none bg-transparent z-10"
                  style={{ margin: 0, border: "none", fontSize: `${editorFontSize}px`, lineHeight: borderSettings.codeLineHeight }}
                  dangerouslySetInnerHTML={{ __html: highlightedCodeHtml }}
                />

                {/* The overlay interactive transparent textarea */}
                <textarea
                  ref={editorTextareaRef}
                  value={localContent}
                  onChange={(e) => {
                    onLocalTextChange(e.target.value);
                    handleCursorEvent(e.target);
                  }}
                  onBlur={onLocalBlur}
                  onKeyUp={(e) => handleCursorEvent(e.currentTarget)}
                  onClick={(e) => handleCursorEvent(e.currentTarget)}
                  onSelect={(e) => handleCursorEvent(e.currentTarget)}
                  onFocus={(e) => handleCursorEvent(e.currentTarget)}
                  onKeyDown={handleKeyDownInternal}
                  onScroll={onEditorScrollInternal}
                  className="absolute inset-0 p-4 bg-transparent text-transparent caret-sky-400 font-mono leading-relaxed focus:outline-none resize-none w-full h-full overflow-auto selection:bg-indigo-500/30 whitespace-pre scrollbar-thin z-20"
                  style={{ fontSize: `${editorFontSize}px`, lineHeight: borderSettings.codeLineHeight }}
                  spellCheck="false"
                />
              </div>

              {/* Code Map Minimap Visualizer Sidebar */}
              {showCodeMap && (
                <CodeMapMinimap
                  content={deferredContent || ""}
                  editorTextareaRef={editorTextareaRef}
                  theme={theme === "light" ? "light" : "dark"}
                  onJumpToLine={handleJumpToLineInternal}
                />
              )}
            </div>

            {/* VS Code Dark+ Professional Status Bar */}
            <div className="h-6 bg-[#007acc] text-white px-3 text-[10px] font-mono flex items-center justify-between border-t border-black/20 select-none shrink-0 z-30">
              <div className="flex items-center gap-1 sm:gap-2">
                <button
                  type="button"
                  onClick={() => setShowVSCodeProModal(true)}
                  className="flex items-center gap-1 font-bold hover:bg-white/20 px-1.5 py-0.5 rounded cursor-pointer transition-colors"
                  title="Click to view VS Code Pro Workspace Diagnostics & Health"
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  VS Code Pro
                </button>
                <span>•</span>
                <button
                  type="button"
                  onClick={() => {
                    setGotoLineInput(String(localCursor.line));
                    setShowGoToLineModal(true);
                  }}
                  className="hover:bg-white/20 px-1.5 py-0.5 rounded cursor-pointer transition-colors"
                  title="Click to Go to Line / Column (Ctrl+G)"
                >
                  Ln {localCursor.line}, Col {localCursor.col}
                </button>
                <span>•</span>
                <button
                  type="button"
                  onClick={() => setShowDocStatsModal(true)}
                  className="hover:bg-white/20 px-1.5 py-0.5 rounded cursor-pointer transition-colors hidden sm:inline-block"
                  title="Click to view detailed Document Statistics & Analysis"
                >
                  Lines: {(activeFile.content || "").split("\n").length} • Chars: {(activeFile.content || "").length}
                </button>
              </div>

              <div className="flex items-center gap-1 sm:gap-2">
                <button
                  type="button"
                  onClick={handleFormatCode}
                  className="hover:bg-amber-400/30 px-1.5 py-0.5 rounded flex items-center gap-1 font-semibold cursor-pointer text-amber-200 transition-colors"
                  title="Format document code automatically"
                >
                  <Sparkles className="w-3 h-3 text-amber-300" />
                  Format Code
                </button>
                <span>•</span>
                <button
                  type="button"
                  onClick={() => setShowEncodingPickerModal(true)}
                  className="hover:bg-white/20 px-1.5 py-0.5 rounded cursor-pointer transition-colors"
                  title="Click to change document character encoding"
                >
                  {fileEncoding}
                </button>
                <span>•</span>
                <button
                  type="button"
                  onClick={() => {
                    const nextSize = indentSize === 2 ? 4 : indentSize === 4 ? 8 : 2;
                    setIndentSize(nextSize);
                    addAgentAction("edit", `Configured tab spacing to ${indentType} (${nextSize}).`, selectedFilePath);
                  }}
                  className="hover:bg-white/20 px-1.5 py-0.5 rounded cursor-pointer transition-colors"
                  title="Click to toggle tab indentation size (2 -> 4 -> 8)"
                >
                  {indentType}: {indentSize}
                </button>
                <span>•</span>
                <button
                  type="button"
                  onClick={() => setShowLanguagePickerModal(true)}
                  className="hover:bg-white/20 px-1.5 py-0.5 rounded uppercase font-bold text-sky-100 cursor-pointer transition-colors"
                  title="Click to select language mode for syntax highlighting"
                >
                  {activeFile.language}
                </button>
              </div>
            </div>
          </div>

          {/* Split-Screen Terminal Panel */}
          {showTerminal && (
            <TerminalConsolePanel
              theme={theme}
              brainBoardHeight={brainBoardHeight}
              setBrainBoardHeight={setBrainBoardHeight}
              isTerminalRunning={isTerminalRunning}
              terminalExitCode={terminalExitCode}
              terminalOutput={terminalOutput}
              setTerminalOutput={setTerminalOutput}
              setShowTerminal={setShowTerminal}
              customCommandInput={customCommandInput}
              setCustomCommandInput={setCustomCommandInput}
              handleRunActiveFile={handleRunActiveFile}
              activeFile={activeFile}
            />
          )}
        </>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-slate-500 bg-[#1e1e1e]">
          <FileCode className="w-10 h-10 mb-2 text-slate-700" />
          <p className="text-xs">No active file selected. Click a file on the Explorer tree to start editing!</p>
        </div>
      )}
    </div>
  );
});
