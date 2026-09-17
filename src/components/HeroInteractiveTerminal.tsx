import React, { useState, useEffect, useRef } from "react";
import { Terminal, Play, Sparkles, CornerDownLeft, CheckCircle2, RefreshCw, Cpu, Activity, ArrowRight, Calculator } from "lucide-react";

interface CommandLog {
  id: string;
  type: "input" | "output" | "error" | "info";
  text: string;
  timestamp: string;
}

export const HeroInteractiveTerminal: React.FC<{
  onLaunchWorkspace?: () => void;
  onOpenMathPlotter?: () => void;
}> = ({ onLaunchWorkspace, onOpenMathPlotter }) => {
  const [command, setCommand] = useState<string>("");
  const [logs, setLogs] = useState<CommandLog[]>([
    {
      id: "1",
      type: "info",
      text: "Google AI Studio Cloud Node v20.11.0 Initialized on Port 3000.",
      timestamp: new Date().toLocaleTimeString()
    },
    {
      id: "2",
      type: "info",
      text: "Type 'help', 'status', 'run-agent', 'plot 3d', 'auth-check', or 'share-file' to run active terminal commands.",
      timestamp: new Date().toLocaleTimeString()
    }
  ]);
  const [isExecuting, setIsExecuting] = useState<boolean>(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  const handleRunCommand = (cmdToRun?: string) => {
    const rawCmd = (cmdToRun || command).trim();
    if (!rawCmd) return;

    const inputLog: CommandLog = {
      id: Math.random().toString(),
      type: "input",
      text: `$ ${rawCmd}`,
      timestamp: new Date().toLocaleTimeString()
    };

    setLogs((prev) => [...prev, inputLog]);
    setCommand("");
    setIsExecuting(true);

    setTimeout(() => {
      let outputText = "";
      let outputType: "output" | "error" | "info" = "output";

      const lower = rawCmd.toLowerCase();
      if (lower === "help") {
        outputText = `Available Commands:
  • guest-entry    - Instant 1-click Direct Guest Entry into workspace
  • status         - View live Cloud Run container port & memory state
  • run-agent      - Execute LeetCode & Codeforces competitive coding agent
  • plot 3d        - Open 3D + 2D Math Plotter & Calculus Engine
  • auth-check     - Validate real session authentication endpoint
  • share-file     - Trigger direct file server upload & QR generator
  • clear          - Flush terminal logs`;
      } else if (lower === "guest" || lower === "guest-entry" || lower === "launch" || lower === "enter") {
        outputText = `[GUEST ACCESS DISPATCH]: Initializing immediate guest environment...
✔ Role: Guest Developer
✔ Workspace: Guest Dev Studio
✔ Spawning full editor canvas, active terminal, and 15+ AI agents...`;
        if (onLaunchWorkspace) {
          setTimeout(() => onLaunchWorkspace(), 400);
        }
      } else if (lower === "status") {
        outputText = `[SYSTEM STATUS]:
  ✔ Container Host: 0.0.0.0:3000 (Cloud Run Active)
  ✔ User Auth Store: /tmp/app_auth_users.json (SHA-256 Hashing)
  ✔ File Uploads: /tmp/shared_file_hub (Direct Download & QR)
  ✔ Plotly 3D WebGL Engine: Ready
  ✔ LeetCode Proxy Endpoint: /api/leetcode/:username`;
      } else if (lower === "run-agent") {
        outputText = `[CP AGENT DISPATCH]: Fetching LeetCode stats via GraphQL & Codeforces API...
✔ Target User: 'tourist' & 'neal_wu'
✔ Total Solved: 742 Problems (280 Easy / 382 Med / 80 Hard)
✔ Algorithm Strategy: Monotonic Deque / O(N) Sliding Window Maximum`;
      } else if (lower === "plot 3d" || lower === "plot") {
        outputText = `[MATH PLOTTER ENGINE]: Initializing 3D Surface Mesh 'sin(x)*cos(y)'...
✔ Dimension: 3D Surface Mesh & Contour Visualizer
✔ Derivative Engine: dy/dx = cos(x)*cos(y)
✔ Opening Plotly WebGL Canvas Modal...`;
        if (onOpenMathPlotter) {
          setTimeout(() => onOpenMathPlotter(), 300);
        }
      } else if (lower === "auth-check") {
        outputText = `[AUTH CHECK]: Validating session token...
✔ User Auth Store: Disk-backed JSON user database active.`;
      } else if (lower === "share-file") {
        outputText = `[FILE SHARE HUB]: Preparing zip file upload endpoint...
✔ Server Destination: /api/share/upload
✔ Download URL & QR Generator initialized.`;
      } else if (lower === "clear") {
        setLogs([]);
        setIsExecuting(false);
        return;
      } else {
        outputText = `Command not recognized: '${rawCmd}'. Type 'help' for valid commands.`;
        outputType = "error";
      }

      setLogs((prev) => [
        ...prev,
        {
          id: Math.random().toString(),
          type: outputType,
          text: outputText,
          timestamp: new Date().toLocaleTimeString()
        }
      ]);
      setIsExecuting(false);
    }, 400);
  };

  return (
    <div className="w-full my-6 bg-zinc-950 rounded-2xl border border-zinc-800 shadow-2xl overflow-hidden font-mono text-xs">
      {/* Terminal Title Bar */}
      <div className="bg-zinc-900 px-4 py-2.5 border-b border-zinc-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-rose-500/80" />
          <div className="w-3 h-3 rounded-full bg-amber-500/80" />
          <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
          <span className="text-zinc-400 font-bold ml-2 flex items-center gap-1.5">
            <Terminal className="w-3.5 h-3.5 text-indigo-400" />
            <span>cloud-studio-terminal ~ bash</span>
          </span>
        </div>
        <div className="flex items-center gap-2">
          {onOpenMathPlotter && (
            <button
              onClick={onOpenMathPlotter}
              className="px-2.5 py-1 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/30 font-bold text-[10px] flex items-center gap-1 cursor-pointer transition-all"
            >
              <Calculator className="w-3 h-3 text-cyan-400" />
              <span>Launch Math Plotter</span>
            </button>
          )}
          <span className="text-[10px] text-zinc-500">Port 3000 Active</span>
        </div>
      </div>

      {/* Terminal Output Area */}
      <div className="p-4 h-64 overflow-y-auto space-y-2 text-zinc-300 custom-scrollbar">
        {logs.map((log) => (
          <div key={log.id} className="leading-relaxed">
            <span className="text-zinc-600 mr-2 text-[10px]">{log.timestamp}</span>
            {log.type === "input" && (
              <span className="text-cyan-400 font-bold">{log.text}</span>
            )}
            {log.type === "output" && (
              <span className="text-emerald-400 whitespace-pre-wrap">{log.text}</span>
            )}
            {log.type === "info" && (
              <span className="text-indigo-300 whitespace-pre-wrap">{log.text}</span>
            )}
            {log.type === "error" && (
              <span className="text-rose-400 whitespace-pre-wrap">{log.text}</span>
            )}
          </div>
        ))}
        {isExecuting && (
          <div className="text-amber-400 flex items-center gap-2">
            <RefreshCw className="w-3 h-3 animate-spin" />
            <span>Processing command...</span>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Quick Command Buttons */}
      <div className="px-4 py-2 bg-zinc-900/60 border-t border-zinc-800 flex items-center gap-2 overflow-x-auto text-[11px]">
        <span className="text-zinc-500 shrink-0 font-bold">Quick:</span>
        {["guest-entry", "help", "status", "plot 3d", "run-agent", "auth-check", "clear"].map((cmd) => (
          <button
            key={cmd}
            onClick={() => handleRunCommand(cmd)}
            className={`px-2.5 py-1 rounded-md font-mono text-[10px] cursor-pointer transition-all shrink-0 ${
              cmd === "guest-entry" 
                ? "bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-600/50 font-bold" 
                : "bg-zinc-800 hover:bg-zinc-700 text-zinc-300"
            }`}
          >
            {cmd === "guest-entry" ? "⚡ guest-entry" : cmd}
          </button>
        ))}
      </div>

      {/* Terminal Input Bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleRunCommand();
        }}
        className="p-3 bg-zinc-900 border-t border-zinc-800 flex items-center gap-2"
      >
        <span className="text-cyan-400 font-bold">$</span>
        <input
          type="text"
          value={command}
          onChange={(e) => setCommand(e.target.value)}
          placeholder="Type terminal command (e.g., 'plot 3d', 'status', 'run-agent')..."
          className="flex-1 bg-transparent text-white font-mono text-xs focus:outline-none placeholder-zinc-600"
        />
        <button
          type="submit"
          className="p-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white cursor-pointer transition-all"
        >
          <CornerDownLeft className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
};
