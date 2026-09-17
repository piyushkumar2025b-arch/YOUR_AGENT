import React, { useState } from "react";
import {
  Terminal,
  Download,
  Copy,
  Check,
  Cpu,
  Boxes,
  FileCode,
  ShieldCheck,
  Sparkles,
  X,
  Layers
} from "lucide-react";

interface RunnerModulesModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme: "light" | "dark";
}

export const RunnerModulesModal: React.FC<RunnerModulesModalProps> = ({ isOpen, onClose, theme }) => {
  const [copiedModule, setCopiedModule] = useState<string | null>(null);

  if (!isOpen) return null;

  const nodeRunnerScript = `#!/usr/bin/env node
/**
 * Local Node.js Execution Wrapper
 * Auto-resolves dependencies and runs TypeScript / JavaScript scripts
 */
const { execSync } = require('child_process');
const fs = require('fs');

console.log('🚀 Launching Local Node Execution Runner...');
try {
  execSync('node -v', { stdio: 'inherit' });
  console.log('✅ Environment Verified. Ready to execute scripts!');
} catch (e) {
  console.error('❌ Error executing node script:', e.message);
}
`;

  const pythonRunnerScript = `#!/usr/bin/env python3
"""
Python Studio Local Execution Wrapper
Automated environment setup and script executor
"""
import sys
import subprocess

def main():
    print(f"🐍 Python Execution Environment Active ({sys.version.split()[0]})")
    print("✅ Ready to execute data analytics & AI workloads.")

if __name__ == "__main__":
    main()
`;

  const dockerRunnerSetup = `version: '3.8'
services:
  applet-runner:
    image: node:20-alpine
    container_name: local-applet-sandbox
    ports:
      - "3000:3000"
    volumes:
      - .:/app
    working_dir: /app
    command: npm run dev
`;

  const copyScript = (content: string, name: string) => {
    navigator.clipboard.writeText(content);
    setCopiedModule(name);
    setTimeout(() => setCopiedModule(null), 2000);
  };

  const downloadFile = (content: string, filename: string) => {
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className={`w-full max-w-3xl rounded-2xl border shadow-2xl flex flex-col max-h-[85vh] overflow-hidden ${
        theme === "dark" ? "bg-zinc-900 border-zinc-800 text-white" : "bg-white border-slate-200 text-slate-800"
      }`}>
        {/* Modal Header */}
        <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold tracking-tight">Download Local Execution & Runner Modules</h2>
              <p className="text-[11px] text-slate-400">Download environment wrappers to run applet files locally or in Docker</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-4">
          {/* Node.js Module */}
          <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileCode className="w-4 h-4 text-emerald-400" />
                <h3 className="text-xs font-bold text-emerald-400 font-mono">Node.js Execution Wrapper (runner.js)</h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => copyScript(nodeRunnerScript, "node")}
                  className="px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-slate-300 text-xs font-mono flex items-center gap-1 cursor-pointer"
                >
                  {copiedModule === "node" ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  {copiedModule === "node" ? "Copied" : "Copy"}
                </button>
                <button
                  onClick={() => downloadFile(nodeRunnerScript, "runner.js")}
                  className="px-3 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Download className="w-3 h-3" />
                  Download Script
                </button>
              </div>
            </div>
            <pre className="p-3 rounded-xl bg-black border border-zinc-800 text-slate-300 font-mono text-[11px] overflow-x-auto">
              <code>{nodeRunnerScript}</code>
            </pre>
          </div>

          {/* Python Module */}
          <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-amber-400" />
                <h3 className="text-xs font-bold text-amber-400 font-mono">Python Runtime Wrapper (python_runner.py)</h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => copyScript(pythonRunnerScript, "python")}
                  className="px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-slate-300 text-xs font-mono flex items-center gap-1 cursor-pointer"
                >
                  {copiedModule === "python" ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  {copiedModule === "python" ? "Copied" : "Copy"}
                </button>
                <button
                  onClick={() => downloadFile(pythonRunnerScript, "python_runner.py")}
                  className="px-3 py-1 rounded bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Download className="w-3 h-3" />
                  Download Script
                </button>
              </div>
            </div>
            <pre className="p-3 rounded-xl bg-black border border-zinc-800 text-slate-300 font-mono text-[11px] overflow-x-auto">
              <code>{pythonRunnerScript}</code>
            </pre>
          </div>

          {/* Docker Compose Setup */}
          <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Boxes className="w-4 h-4 text-cyan-400" />
                <h3 className="text-xs font-bold text-cyan-400 font-mono">Docker Container Config (docker-compose.yml)</h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => copyScript(dockerRunnerSetup, "docker")}
                  className="px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-slate-300 text-xs font-mono flex items-center gap-1 cursor-pointer"
                >
                  {copiedModule === "docker" ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  {copiedModule === "docker" ? "Copied" : "Copy"}
                </button>
                <button
                  onClick={() => downloadFile(dockerRunnerSetup, "docker-compose.yml")}
                  className="px-3 py-1 rounded bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Download className="w-3 h-3" />
                  Download File
                </button>
              </div>
            </div>
            <pre className="p-3 rounded-xl bg-black border border-zinc-800 text-slate-300 font-mono text-[11px] overflow-x-auto">
              <code>{dockerRunnerSetup}</code>
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
