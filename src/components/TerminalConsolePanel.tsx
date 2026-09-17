import React from "react";
import { Terminal } from "lucide-react";
import { HorizontalResizeSliderHandle } from "./HorizontalResizeSliderHandle";
import { VirtualFile } from "../types";

interface TerminalConsolePanelProps {
  theme: "light" | "dark" | string;
  brainBoardHeight: number;
  setBrainBoardHeight: (h: number) => void;
  isTerminalRunning: boolean;
  terminalExitCode: number | null;
  terminalOutput: string;
  setTerminalOutput: React.Dispatch<React.SetStateAction<string>>;
  setShowTerminal: React.Dispatch<React.SetStateAction<boolean>>;
  customCommandInput: string;
  setCustomCommandInput: React.Dispatch<React.SetStateAction<string>>;
  handleRunActiveFile: (cmd?: string) => void;
  activeFile: VirtualFile;
}

export const TerminalConsolePanel: React.FC<TerminalConsolePanelProps> = ({
  theme,
  brainBoardHeight,
  setBrainBoardHeight,
  isTerminalRunning,
  terminalExitCode,
  terminalOutput,
  setTerminalOutput,
  setShowTerminal,
  customCommandInput,
  setCustomCommandInput,
  handleRunActiveFile,
  activeFile
}) => {
  return (
    <>
      <HorizontalResizeSliderHandle
        currentHeight={brainBoardHeight}
        onHeightChange={setBrainBoardHeight}
        minHeight={100}
        maxHeight={500}
        label="Terminal Panel Height"
        theme={theme}
      />
      <div
        style={{ height: `${brainBoardHeight}px` }}
        className="border-t border-white/10 bg-[#141414] text-[#cccccc] flex flex-col font-mono overflow-hidden shrink-0"
      >
        {/* Terminal Header */}
        <div className="h-8 bg-[#252526] border-b border-white/5 px-4 flex items-center justify-between select-none shrink-0">
          <div className="flex items-center gap-2">
            <Terminal className="w-3.5 h-3.5 text-indigo-400" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-white/70">Terminal & Execution Console</span>
            {isTerminalRunning && (
              <span className="text-[10px] bg-indigo-500/15 text-indigo-400 border border-indigo-500/25 px-1.5 py-0.5 rounded font-bold uppercase animate-pulse">Running...</span>
            )}
            {terminalExitCode !== null && (
              <span className={`text-[10px] border px-1.5 py-0.5 rounded font-bold uppercase ${
                terminalExitCode === 0 ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/25" : "bg-rose-500/15 text-rose-400 border-rose-500/25"
              }`}>Exit Code: {terminalExitCode}</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setTerminalOutput("OpenRouter Sandbox Terminal\nClick 'Run Active File' or type a custom command below to execute...\n")}
              className="text-[10px] text-white/40 hover:text-white px-1.5 py-0.5 hover:bg-white/5 rounded cursor-pointer font-semibold uppercase"
              title="Clear terminal buffer"
            >
              Clear
            </button>
            <button
              onClick={() => setShowTerminal(false)}
              className="text-[10px] text-white/40 hover:text-white px-1.5 py-0.5 hover:bg-white/5 rounded cursor-pointer font-semibold uppercase"
              title="Hide Terminal panel"
            >
              Hide
            </button>
          </div>
        </div>

        {/* Terminal Buffer Output */}
        <div className="flex-1 p-4 overflow-y-auto text-xs leading-normal font-mono scrollbar-thin scrollbar-thumb-white/10 whitespace-pre-wrap select-text selection:bg-white/20">
          {terminalOutput}
          {isTerminalRunning && (
            <div className="inline-block h-3 w-1.5 bg-indigo-500 animate-pulse ml-0.5"></div>
          )}
        </div>

        {/* Terminal Input Row */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!customCommandInput.trim() || isTerminalRunning) return;
            handleRunActiveFile(customCommandInput);
          }}
          className="h-9 border-t border-white/5 bg-[#1a1a1a] px-4 flex items-center gap-2 shrink-0"
        >
          <span className="text-emerald-500 font-bold select-none text-xs">$</span>
          <input
            type="text"
            value={customCommandInput}
            onChange={(e) => setCustomCommandInput(e.target.value)}
            placeholder={
              activeFile.path.endsWith(".py") ? `python3 "${activeFile.path}"` :
              activeFile.path.endsWith(".ts") || activeFile.path.endsWith(".tsx") ? `npx tsx "${activeFile.path}"` :
              `node "${activeFile.path}"`
            }
            className="flex-1 bg-transparent border-none text-xs text-[#cccccc] placeholder-white/20 focus:outline-none font-mono"
            disabled={isTerminalRunning}
          />
          <button
            type="submit"
            disabled={isTerminalRunning || !customCommandInput.trim()}
            className="text-[10px] bg-slate-700 hover:bg-slate-600 disabled:bg-transparent border border-white/10 disabled:border-transparent text-white disabled:text-white/20 font-semibold px-2.5 py-1 rounded cursor-pointer select-none"
          >
            Execute
          </button>
        </form>
      </div>
    </>
  );
};
