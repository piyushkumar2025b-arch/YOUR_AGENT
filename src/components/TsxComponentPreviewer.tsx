import React, { useState, useEffect, useRef } from "react";
import {
  Play,
  RotateCcw,
  Monitor,
  Tablet,
  Smartphone,
  Copy,
  Check,
  Download,
  Terminal,
  Code2,
  Sparkles,
  Layers,
  Upload,
  AlertCircle,
  Eye,
  CheckCircle2,
  FileCode,
  Maximize2,
  Minimize2,
  Sliders,
  Sun,
  Moon
} from "lucide-react";
import { VirtualFile } from "../types";

interface TsxComponentPreviewerProps {
  files: VirtualFile[];
  initialFilePath?: string;
  theme: "light" | "dark";
  onSelectFile?: (path: string) => void;
}

// Preset interactive TSX components for instant testing & demonstration
const PRESET_TSX_COMPONENTS: { id: string; name: string; description: string; code: string }[] = [
  {
    id: "counter-meter",
    name: "Interactive Counter & Glow Meter",
    description: "Stateful counter with progress ring, step multiplier, and celebration",
    code: `import React, { useState } from 'react';
import { Plus, Minus, RotateCcw, Zap, Sparkles } from 'lucide-react';

export default function CounterMeter() {
  const [count, setCount] = useState(12);
  const [step, setStep] = useState(1);
  const max = 50;
  const progress = Math.min(100, Math.max(0, (count / max) * 100));

  return (
    <div className="p-8 max-w-md mx-auto bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl shadow-2xl border border-indigo-500/30 font-sans">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <span className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
            <Zap className="w-5 h-5 text-indigo-400" />
          </span>
          <div>
            <h2 className="text-lg font-extrabold tracking-tight">Quantum Counter</h2>
            <p className="text-xs text-indigo-300/80">Interactive TSX Component</p>
          </div>
        </div>
        <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
          Step: +{step}
        </span>
      </div>

      <div className="flex flex-col items-center justify-center my-8">
        <div className="relative flex items-center justify-center">
          <div className="w-36 h-36 rounded-full border-4 border-indigo-950 flex items-center justify-center shadow-inner relative">
            <div 
              className="absolute inset-0 rounded-full border-4 border-indigo-500 border-t-transparent transition-all duration-300"
              style={{ transform: \`rotate(\${progress * 3.6}deg)\` }}
            />
            <div className="text-center">
              <span className="text-4xl font-black tracking-tight text-white">{count}</span>
              <span className="block text-[10px] uppercase font-bold text-indigo-400">Value</span>
            </div>
          </div>
        </div>

        <div className="w-full bg-indigo-950/60 rounded-full h-2 mt-6 overflow-hidden border border-indigo-800/40">
          <div 
            className="h-full bg-gradient-to-r from-indigo-500 via-sky-400 to-cyan-300 transition-all duration-300"
            style={{ width: \`\${progress}%\` }}
          />
        </div>
        <div className="w-full flex justify-between text-[11px] text-slate-400 mt-1.5 font-mono">
          <span>0</span>
          <span>{progress.toFixed(0)}% Capacity</span>
          <span>{max}</span>
        </div>
      </div>

      <div className="flex items-center justify-center gap-3 mb-6">
        <button
          onClick={() => setCount(prev => Math.max(0, prev - step))}
          className="p-3 rounded-2xl bg-white/5 hover:bg-white/10 active:scale-95 transition-all text-slate-200 border border-white/10 cursor-pointer"
        >
          <Minus className="w-5 h-5" />
        </button>
        <button
          onClick={() => setCount(0)}
          className="p-3 rounded-2xl bg-white/5 hover:bg-white/10 active:scale-95 transition-all text-slate-400 hover:text-white border border-white/10 cursor-pointer"
          title="Reset"
        >
          <RotateCcw className="w-5 h-5" />
        </button>
        <button
          onClick={() => setCount(prev => Math.min(max, prev + step))}
          className="p-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 active:scale-95 transition-all text-white font-bold shadow-lg shadow-indigo-600/40 cursor-pointer"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>

      <div className="flex justify-center gap-2 pt-4 border-t border-white/10">
        {[1, 5, 10].map(s => (
          <button
            key={s}
            onClick={() => setStep(s)}
            className={\`px-3 py-1 rounded-xl text-xs font-semibold transition-all \${step === s ? 'bg-indigo-500 text-white shadow-md' : 'bg-white/5 text-slate-400 hover:text-white'}\`}
          >
            +{s} step
          </button>
        ))}
      </div>
    </div>
  );
}`
  },
  {
    id: "metric-dashboard-card",
    name: "Animated Metric Card & Sparkline",
    description: "Production analytics card with percentage change and interactive tabs",
    code: `import React, { useState } from 'react';
import { TrendingUp, Users, DollarSign, Activity, ArrowUpRight } from 'lucide-react';

export default function MetricDashboardCard() {
  const [timeframe, setTimeframe] = useState('7D');
  const [activeMetric, setActiveMetric] = useState('revenue');

  const metrics = {
    revenue: { label: 'Total Revenue', value: '$48,290.50', change: '+18.4%', trend: [20, 35, 28, 45, 60, 55, 78] },
    users: { label: 'Active Users', value: '12,450', change: '+24.1%', trend: [40, 50, 48, 65, 70, 85, 92] },
    conversion: { label: 'Conversion Rate', value: '4.82%', change: '+3.2%', trend: [3.1, 3.4, 3.2, 4.0, 4.2, 4.5, 4.8] }
  };

  const curr = metrics[activeMetric];

  return (
    <div className="p-6 max-w-lg mx-auto bg-slate-900 border border-slate-800 text-white rounded-3xl shadow-xl font-sans">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Activity className="w-5 h-5 text-emerald-400" />
          </span>
          <div>
            <h3 className="text-base font-bold">Analytics Overview</h3>
            <p className="text-xs text-slate-400">Live Workspace Telemetry</p>
          </div>
        </div>

        <div className="flex bg-slate-800 p-1 rounded-xl border border-slate-700 text-xs font-semibold">
          {['24H', '7D', '30D'].map(t => (
            <button
              key={t}
              onClick={() => setTimeframe(t)}
              className={\`px-2.5 py-1 rounded-lg transition-all \${timeframe === t ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'}\`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 mb-6">
        {Object.entries(metrics).map(([key, data]) => (
          <button
            key={key}
            onClick={() => setActiveMetric(key)}
            className={\`p-3 rounded-2xl border text-left transition-all \${activeMetric === key ? 'bg-indigo-600/20 border-indigo-500/60 shadow-lg' : 'bg-slate-800/50 border-slate-800 hover:bg-slate-800'}\`}
          >
            <p className="text-[10px] text-slate-400 font-medium truncate">{data.label}</p>
            <p className="text-sm font-bold text-white mt-1">{data.value}</p>
          </button>
        ))}
      </div>

      <div className="bg-slate-950/70 p-5 rounded-2xl border border-slate-800/80 relative overflow-hidden">
        <div className="flex items-center justify-between mb-4">
          <div>
            <span className="text-xs text-slate-400 font-medium">{curr.label}</span>
            <div className="text-2xl font-black tracking-tight text-white mt-0.5">{curr.value}</div>
          </div>
          <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            <TrendingUp className="w-3.5 h-3.5" />
            {curr.change}
          </span>
        </div>

        {/* Dynamic Sparkline Bars */}
        <div className="h-20 flex items-end gap-2 pt-4">
          {curr.trend.map((val, idx) => {
            const maxVal = Math.max(...curr.trend);
            const heightPct = (val / maxVal) * 100;
            return (
              <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 group">
                <div className="w-full bg-indigo-950 rounded-t-md relative overflow-hidden h-16 flex items-end">
                  <div
                    className="w-full bg-gradient-to-t from-indigo-600 to-cyan-400 rounded-t-md transition-all duration-500 group-hover:brightness-125"
                    style={{ height: \`\${heightPct}%\` }}
                  />
                </div>
                <span className="text-[9px] text-slate-500 font-mono">D{idx + 1}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}`
  },
  {
    id: "interactive-task-board",
    name: "Interactive Task Checklist",
    description: "Add, check off, and filter tasks with smooth badge indicators",
    code: `import React, { useState } from 'react';
import { CheckCircle2, Circle, Plus, Trash2, CheckSquare, Sparkles } from 'lucide-react';

export default function InteractiveTaskBoard() {
  const [tasks, setTasks] = useState([
    { id: 1, text: 'Design Universal Previewer architecture', done: true, tag: 'UI' },
    { id: 2, text: 'Optimize syntax highlight latency for 60fps', done: true, tag: 'Engine' },
    { id: 3, text: 'Test Babel live TSX compilation pipeline', done: false, tag: 'Dev' },
    { id: 4, text: 'Deploy responsive layout breakpoints', done: false, tag: 'CSS' }
  ]);
  const [inputVal, setInputVal] = useState('');
  const [filter, setFilter] = useState('all');

  const toggleDone = (id) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, done: !t.done } : t));
  };

  const addTask = (e) => {
    e.preventDefault();
    if (!inputVal.trim()) return;
    setTasks([...tasks, { id: Date.now(), text: inputVal.trim(), done: false, tag: 'Task' }]);
    setInputVal('');
  };

  const deleteTask = (id) => {
    setTasks(tasks.filter(t => t.id !== id));
  };

  const filtered = tasks.filter(t => {
    if (filter === 'active') return !t.done;
    if (filter === 'completed') return t.done;
    return true;
  });

  const completedCount = tasks.filter(t => t.done).length;

  return (
    <div className="p-6 max-w-md mx-auto bg-slate-900 border border-slate-800 text-white rounded-3xl shadow-2xl font-sans">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2.5">
          <span className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
            <CheckSquare className="w-5 h-5" />
          </span>
          <div>
            <h3 className="text-base font-bold">Sprint Checklist</h3>
            <p className="text-xs text-slate-400">{completedCount} of {tasks.length} tasks completed</p>
          </div>
        </div>

        <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
          {Math.round((completedCount / (tasks.length || 1)) * 100)}%
        </span>
      </div>

      <form onSubmit={addTask} className="flex gap-2 mb-4">
        <input
          type="text"
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          placeholder="New task item..."
          className="flex-1 px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
        />
        <button
          type="submit"
          className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1 cursor-pointer transition-all shadow-md shadow-indigo-600/30"
        >
          <Plus className="w-4 h-4" /> Add
        </button>
      </form>

      <div className="flex items-center gap-1.5 mb-4 text-xs font-medium">
        {['all', 'active', 'completed'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={\`px-3 py-1 rounded-lg capitalize transition-all \${filter === f ? 'bg-indigo-600 text-white shadow-xs' : 'bg-slate-800/80 text-slate-400 hover:text-white'}\`}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
        {filtered.map(task => (
          <div
            key={task.id}
            onClick={() => toggleDone(task.id)}
            className={\`p-3 rounded-2xl border flex items-center justify-between gap-3 cursor-pointer transition-all \${task.done ? 'bg-slate-950/60 border-slate-900 text-slate-500' : 'bg-slate-800/60 border-slate-700/80 text-slate-200 hover:bg-slate-800'}\`}
          >
            <div className="flex items-center gap-2.5 truncate">
              {task.done ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : (
                <Circle className="w-4 h-4 text-slate-500 shrink-0" />
              )}
              <span className={\`text-xs font-medium truncate \${task.done ? 'line-through text-slate-500' : ''}\`}>
                {task.text}
              </span>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-white/5 border border-white/10 uppercase">
                {task.tag}
              </span>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); deleteTask(task.id); }}
                className="p-1 text-slate-500 hover:text-rose-400 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}`
  }
];

export const TsxComponentPreviewer: React.FC<TsxComponentPreviewerProps> = ({
  files,
  initialFilePath,
  theme,
  onSelectFile
}) => {
  // All .tsx and .jsx files present in the current workspace
  const tsxFiles = files.filter(f => 
    f.path.toLowerCase().endsWith(".tsx") || 
    f.path.toLowerCase().endsWith(".jsx")
  );

  const defaultFile = initialFilePath 
    ? files.find(f => f.path === initialFilePath) 
    : (tsxFiles[0] || files[0]);

  const [selectedFilePath, setSelectedFilePath] = useState<string>(defaultFile?.path || "");
  const [currentCode, setCurrentCode] = useState<string>(defaultFile?.content || PRESET_TSX_COMPONENTS[0].code);
  const [activeTab, setActiveTab] = useState<"preview" | "code" | "editor" | "console">("preview");
  const [viewport, setViewport] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [previewTheme, setPreviewTheme] = useState<"dark" | "light">("dark");
  const [reloadKey, setReloadKey] = useState<number>(0);
  const [copied, setCopied] = useState<boolean>(false);
  const [consoleLogs, setConsoleLogs] = useState<{ type: string; text: string; time: string }[]>([]);
  const [runtimeError, setRuntimeError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Sync selected file when changed
  useEffect(() => {
    if (selectedFilePath) {
      const match = files.find(f => f.path === selectedFilePath);
      if (match) {
        setCurrentCode(match.content);
        setRuntimeError(null);
        setConsoleLogs([]);
        setReloadKey(prev => prev + 1);
      }
    }
  }, [selectedFilePath, files]);

  // Listen to postMessage console & error logs from the TSX iframe sandbox
  useEffect(() => {
    const handleMessage = (e: MessageEvent) => {
      // Only accept messages from our own origin or opaque sandbox origin
      if (e.origin !== window.location.origin && e.origin !== "null") return;
      // Ensure messages originate from this specific preview iframe instance
      if (iframeRef.current && e.source !== iframeRef.current.contentWindow) return;
      if (e.data && e.data.source === "tsx-preview-sandbox") {
        if (e.data.type === "error") {
          setRuntimeError(e.data.message);
        } else {
          setConsoleLogs(prev => [
            ...prev.slice(-80),
            {
              type: e.data.logType || "log",
              text: e.data.message,
              time: new Date().toLocaleTimeString()
            }
          ]);
        }
      }
    };
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  // Handle local external .tsx file upload / load
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      if (text) {
        setCurrentCode(text);
        setSelectedFilePath(file.name);
        setRuntimeError(null);
        setConsoleLogs([]);
        setReloadKey(prev => prev + 1);
      }
    };
    reader.readAsText(file);
    // Reset file input
    e.target.value = "";
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(currentCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadCode = () => {
    const blob = new Blob([currentCode], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = selectedFilePath ? selectedFilePath.split("/").pop() || "Component.tsx" : "Component.tsx";
    a.click();
    URL.revokeObjectURL(url);
  };

  // Build the sandboxed HTML payload that compiles and mounts the TSX code
  const buildSandboxDoc = (): string => {
    // 1. Transform ES imports & export signatures so Babel and the browser UMD runtime can evaluate them
    let cleanCode = currentCode;

    // Strip type imports
    cleanCode = cleanCode.replace(/import\s+type\s+[^;]+;/g, "");
    cleanCode = cleanCode.replace(/import\s+React\s*,\s*\{([^}]+)\}\s*from\s*["']react["'];?/g, "const {$1} = React;");
    cleanCode = cleanCode.replace(/import\s*\{([^}]+)\}\s*from\s*["']react["'];?/g, "const {$1} = React;");
    cleanCode = cleanCode.replace(/import\s+React\s+from\s*["']react["'];?/g, "const React = window.React;");
    
    // Lucide icons shim
    cleanCode = cleanCode.replace(/import\s*\{([^}]+)\}\s*from\s*["']lucide-react["'];?/g, (match, icons) => {
      const iconList = icons.split(",").map((i: string) => i.trim()).filter(Boolean);
      return iconList.map((iconName: string) => 
        `const ${iconName} = (props) => React.createElement('span', { 
          className: 'inline-flex items-center justify-center ' + (props.className || ''),
          style: { display: 'inline-flex' }
        }, React.createElement('i', { 'data-lucide': '${iconName.toLowerCase()}' }));`
      ).join("\n");
    });

    // Motion/Framer Motion shim
    cleanCode = cleanCode.replace(/import\s*\{([^}]+)\}\s*from\s*["'](?:motion\/react|framer-motion)["'];?/g, 
      "const { motion, AnimatePresence } = window.Motion || { motion: { div: 'div', button: 'button', span: 'span', section: 'section', p: 'p' }, AnimatePresence: ({children}) => children };"
    );

    // Any generic unknown imports shim
    cleanCode = cleanCode.replace(/import\s+[^;]+from\s*["'][^"']+["'];?/g, "// Imported module simulated in browser sandbox");

    // Component export capture
    // Case 1: export default function ComponentName
    cleanCode = cleanCode.replace(/export\s+default\s+function\s+([A-Za-z0-9_]+)/g, "function $1\nwindow.ActiveComponent = $1;");
    // Case 2: export default ComponentName
    cleanCode = cleanCode.replace(/export\s+default\s+([A-Za-z0-9_]+);?/g, "window.ActiveComponent = $1;");
    // Case 3: export const ComponentName = ...
    cleanCode = cleanCode.replace(/export\s+const\s+([A-Za-z0-9_]+)/g, (match, name) => {
      return `const ${name}`;
    });
    // Strip other TS keywords
    cleanCode = cleanCode.replace(/export\s+(?:function|class|interface|type)\s+/g, "");

    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>TSX Component Sandbox</title>
  
  <!-- Tailwind CSS CDN -->
  <script src="https://cdn.tailwindcss.com"></script>
  
  <!-- React 18 & ReactDOM 18 UMD Pinned Versions -->
  <script src="https://unpkg.com/react@18.3.1/umd/react.production.min.js" crossorigin="anonymous"></script>
  <script src="https://unpkg.com/react-dom@18.3.1/umd/react-dom.production.min.js" crossorigin="anonymous"></script>
  
  <!-- Babel Standalone Pinned for live in-browser TSX/JSX compilation -->
  <script src="https://unpkg.com/@babel/standalone@7.24.7/babel.min.js" crossorigin="anonymous"></script>
  
  <!-- Lucide Icons UMD Pinned Version -->
  <script src="https://unpkg.com/lucide@0.383.0/dist/umd/lucide.min.js" crossorigin="anonymous"></script>

  <style>
    body {
      margin: 0;
      padding: 16px;
      font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      background-color: ${previewTheme === "dark" ? "#09090b" : "#f8fafc"};
      color: ${previewTheme === "dark" ? "#f4f4f5" : "#0f172a"};
    }
  </style>

  <script>
    // Intercept console and window errors
    (function() {
      const origLog = console.log;
      const origWarn = console.warn;
      const origError = console.error;
      const TARGET_ORIGIN = ${JSON.stringify(typeof window !== "undefined" && window.location?.origin ? window.location.origin : "*")};

      function post(type, args) {
        try {
          const text = Array.from(args).map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ');
          window.parent.postMessage({
            source: 'tsx-preview-sandbox',
            type: 'log',
            logType: type,
            message: text
          }, TARGET_ORIGIN);
        } catch(e) {}
      }

      console.log = function(...a) { origLog.apply(console, a); post('log', a); };
      console.warn = function(...a) { origWarn.apply(console, a); post('warn', a); };
      console.error = function(...a) { origError.apply(console, a); post('error', a); };

      window.onerror = function(msg, url, line) {
        window.parent.postMessage({
          source: 'tsx-preview-sandbox',
          type: 'error',
          message: 'Error at line ' + line + ': ' + msg
        }, TARGET_ORIGIN);
      };
    })();
  </script>
</head>
<body>
  <div id="root" class="w-full flex items-center justify-center"></div>

  <!-- Live TSX Evaluator -->
  <script type="text/babel" data-presets="react,typescript">
    try {
      const TARGET_ORIGIN = ${JSON.stringify(typeof window !== "undefined" && window.location?.origin ? window.location.origin : "*")};
      ${cleanCode}

      // Detect component to render
      let ComponentToRender = window.ActiveComponent;
      if (!ComponentToRender) {
        // Find any function that starts with uppercase
        for (const key of Object.keys(window)) {
          if (/^[A-Z][A-Za-z0-9_]+$/.test(key) && typeof window[key] === 'function') {
            ComponentToRender = window[key];
            break;
          }
        }
      }

      const rootEl = document.getElementById('root');
      if (ComponentToRender && rootEl && window.ReactDOM && window.ReactDOM.createRoot) {
        const root = window.ReactDOM.createRoot(rootEl);
        root.render(React.createElement(ComponentToRender));
      } else {
        rootEl.innerHTML = '<div style="padding:24px;text-align:center;color:#94a3b8;font-size:13px;border:1px dashed #334155;border-radius:16px;"><strong>Component Ready</strong><br/><span style="font-size:11px;">Make sure your file has "export default function ComponentName()"</span></div>';
      }

      // Initialize Lucide icons
      if (window.lucide) {
        setTimeout(() => window.lucide.createIcons(), 50);
      }
    } catch(err) {
      const errMsg = (err && err.message) || String(err);
      console.warn("TSX Compilation / Execution Error:", errMsg);
      const TARGET_ORIGIN = ${JSON.stringify(typeof window !== "undefined" && window.location?.origin ? window.location.origin : "*")};
      window.parent.postMessage({
        source: 'tsx-preview-sandbox',
        type: 'error',
        message: errMsg
      }, TARGET_ORIGIN);
    }
  </script>
</body>
</html>
    `;
  };

  return (
    <div className={`h-full flex flex-col overflow-hidden ${theme === "dark" ? "bg-[#121214] text-zinc-100" : "bg-slate-50 text-slate-800"}`}>
      
      {/* HEADER CONTROLS TOOLBAR */}
      <div className={`px-4 py-2 border-b flex flex-wrap items-center justify-between gap-3 shrink-0 ${
        theme === "dark" ? "bg-[#18181c] border-zinc-800" : "bg-white border-slate-200"
      }`}>
        
        {/* Left: Component Selector & Loader */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 font-bold text-xs text-indigo-400">
            <span className="p-1 rounded bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              <Code2 className="w-4 h-4" />
            </span>
            <span className="hidden sm:inline">TSX Component Sandbox</span>
          </div>

          {/* Workspace TSX Files Selector */}
          <div className="flex items-center gap-1 bg-black/30 dark:bg-zinc-900 px-2 py-1 rounded-lg border border-zinc-700 text-xs">
            <FileCode className="w-3.5 h-3.5 text-indigo-400" />
            <select
              value={selectedFilePath}
              onChange={(e) => {
                setSelectedFilePath(e.target.value);
                if (onSelectFile) onSelectFile(e.target.value);
              }}
              className="bg-transparent border-none text-white text-xs font-mono focus:outline-none cursor-pointer max-w-[200px] truncate"
            >
              <optgroup label="Workspace TSX/JSX Files">
                {tsxFiles.map(f => (
                  <option key={f.path} value={f.path} className="bg-zinc-900 text-white">
                    {f.path}
                  </option>
                ))}
              </optgroup>
            </select>
          </div>

          {/* Presets Dropdown */}
          <div className="flex items-center gap-1 bg-black/30 dark:bg-zinc-900 px-2 py-1 rounded-lg border border-zinc-700 text-xs">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <select
              onChange={(e) => {
                const preset = PRESET_TSX_COMPONENTS.find(p => p.id === e.target.value);
                if (preset) {
                  setCurrentCode(preset.code);
                  setSelectedFilePath(`${preset.name}.tsx`);
                  setRuntimeError(null);
                  setConsoleLogs([]);
                  setReloadKey(prev => prev + 1);
                }
              }}
              defaultValue=""
              className="bg-transparent border-none text-slate-300 text-xs font-mono focus:outline-none cursor-pointer"
            >
              <option value="" disabled className="bg-zinc-900 text-slate-400">Load Preset TSX...</option>
              {PRESET_TSX_COMPONENTS.map(p => (
                <option key={p.id} value={p.id} className="bg-zinc-900 text-white">
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* Open / Upload Custom TSX File Button */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".tsx,.jsx,.ts,.js"
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-2.5 py-1 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-300 border border-indigo-500/30 text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-all"
            title="Load local .tsx file from your computer"
          >
            <Upload className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Open TSX File</span>
          </button>
        </div>

        {/* Right: Viewport, Theme & Actions */}
        <div className="flex items-center gap-2">
          {/* Mode Tabs */}
          <div className="flex items-center gap-1 bg-black/40 p-0.5 rounded-lg border border-zinc-800 text-xs">
            <button
              onClick={() => setActiveTab("preview")}
              className={`px-2.5 py-1 rounded-md font-bold transition-all cursor-pointer flex items-center gap-1 ${
                activeTab === "preview" ? "bg-indigo-600 text-white shadow-xs" : "text-slate-400 hover:text-white"
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Preview</span>
            </button>
            <button
              onClick={() => setActiveTab("code")}
              className={`px-2.5 py-1 rounded-md font-bold transition-all cursor-pointer flex items-center gap-1 ${
                activeTab === "code" ? "bg-indigo-600 text-white shadow-xs" : "text-slate-400 hover:text-white"
              }`}
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>Source</span>
            </button>
            <button
              onClick={() => setActiveTab("editor")}
              className={`px-2.5 py-1 rounded-md font-bold transition-all cursor-pointer flex items-center gap-1 ${
                activeTab === "editor" ? "bg-indigo-600 text-white shadow-xs" : "text-slate-400 hover:text-white"
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Live Edit</span>
            </button>
          </div>

          {/* Viewport switchers for Preview */}
          {activeTab === "preview" && (
            <div className="hidden sm:flex items-center gap-0.5 bg-black/40 p-0.5 rounded-lg border border-zinc-800">
              <button
                onClick={() => setViewport("desktop")}
                className={`p-1.5 rounded cursor-pointer ${viewport === "desktop" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"}`}
                title="Desktop View (100%)"
              >
                <Monitor className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setViewport("tablet")}
                className={`p-1.5 rounded cursor-pointer ${viewport === "tablet" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"}`}
                title="Tablet View (768px)"
              >
                <Tablet className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setViewport("mobile")}
                className={`p-1.5 rounded cursor-pointer ${viewport === "mobile" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"}`}
                title="Mobile View (375px)"
              >
                <Smartphone className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Preview Theme Toggle */}
          <button
            onClick={() => {
              setPreviewTheme(prev => prev === "dark" ? "light" : "dark");
              setReloadKey(prev => prev + 1);
            }}
            className="p-1.5 rounded-lg bg-black/40 hover:bg-black/60 text-slate-300 border border-zinc-800 cursor-pointer"
            title={`Toggle Component Background (${previewTheme})`}
          >
            {previewTheme === "dark" ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-indigo-400" />}
          </button>

          {/* Reload Component */}
          <button
            onClick={() => {
              setRuntimeError(null);
              setReloadKey(prev => prev + 1);
            }}
            className="p-1.5 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 cursor-pointer"
            title="Recompile & Rerender Component"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          {/* Copy Code */}
          <button
            onClick={handleCopyCode}
            className="p-1.5 rounded-lg bg-black/40 hover:bg-black/60 text-slate-300 border border-zinc-800 cursor-pointer"
            title="Copy TSX code"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>

          {/* Download File */}
          <button
            onClick={handleDownloadCode}
            className="p-1.5 rounded-lg bg-black/40 hover:bg-black/60 text-slate-300 border border-zinc-800 cursor-pointer"
            title="Download TSX file"
          >
            <Download className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* ERROR BANNER */}
      {runtimeError && (
        <div className="px-4 py-2 bg-rose-950/80 border-b border-rose-800 text-rose-200 text-xs font-mono flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span className="font-bold">Compilation / Runtime Notice:</span>
            <span className="truncate">{runtimeError}</span>
          </div>
          <button
            onClick={() => setRuntimeError(null)}
            className="text-rose-400 hover:text-white px-2 py-0.5 text-[10px] rounded bg-rose-900/60"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* MAIN VIEWPORT BODY */}
      <div className="flex-1 overflow-hidden relative flex flex-col">
        
        {/* TAB 1: LIVE COMPONENT PREVIEW */}
        {activeTab === "preview" && (
          <div className="flex-1 flex flex-col h-full overflow-hidden p-3 bg-slate-900/20">
            <div className="flex-1 flex justify-center items-center overflow-auto rounded-2xl border border-zinc-800/80 shadow-2xl relative bg-zinc-950">
              <iframe
                key={reloadKey}
                ref={iframeRef}
                srcDoc={buildSandboxDoc()}
                title="TSX Component Sandbox"
                className={`h-full border-none transition-all duration-300 ${
                  viewport === "mobile" 
                    ? "w-[375px] my-4 rounded-2xl border-4 border-slate-800 shadow-2xl h-[92%]" 
                    : viewport === "tablet" 
                      ? "w-[768px] my-4 rounded-xl border-2 border-slate-700 shadow-xl h-[96%]" 
                      : "w-full"
                }`}
                sandbox="allow-scripts allow-modals allow-forms"
              />
            </div>
          </div>
        )}

        {/* TAB 2: TSX SOURCE CODE */}
        {activeTab === "code" && (
          <div className="flex-1 overflow-auto p-4 font-mono text-xs leading-relaxed bg-[#0c0d12]">
            <div className="max-w-4xl mx-auto space-y-0.5">
              {currentCode.split("\n").map((line, idx) => (
                <div key={idx} className="flex items-start hover:bg-zinc-800/30 px-1 rounded transition-colors">
                  <span className="w-10 text-zinc-600 text-right pr-4 select-none shrink-0 text-[10px] pt-0.5">
                    {idx + 1}
                  </span>
                  <pre className="flex-1 whitespace-pre-wrap break-words text-slate-200 m-0 font-mono">
                    {line}
                  </pre>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: LIVE QUICK EDITOR */}
        {activeTab === "editor" && (
          <div className="flex-1 flex flex-col h-full overflow-hidden p-3 bg-[#0d0e12]">
            <div className="flex items-center justify-between pb-2 text-xs font-mono text-slate-400">
              <span>Live Tweak Code (Modifications re-render sandbox immediately)</span>
              <button
                onClick={() => {
                  setReloadKey(prev => prev + 1);
                  setActiveTab("preview");
                }}
                className="px-3 py-1 rounded bg-indigo-600 hover:bg-indigo-500 text-white font-bold flex items-center gap-1 cursor-pointer shadow-sm"
              >
                <Play className="w-3 h-3 fill-white" /> Apply & View
              </button>
            </div>
            <textarea
              value={currentCode}
              onChange={(e) => {
                setCurrentCode(e.target.value);
                setRuntimeError(null);
              }}
              spellCheck={false}
              className="flex-1 w-full p-4 rounded-xl bg-[#090a0f] border border-zinc-800 text-indigo-300 font-mono text-xs leading-relaxed resize-none focus:outline-none focus:border-indigo-500 selection:bg-indigo-500/30 custom-scrollbar"
            />
          </div>
        )}

      </div>

      {/* FOOTER STATUS & CONSOLE LOGS TOGGLE */}
      <div className={`px-4 py-1.5 border-t text-[11px] font-mono flex items-center justify-between shrink-0 ${
        theme === "dark" ? "bg-[#101012] border-zinc-800 text-zinc-400" : "bg-slate-100 border-slate-200 text-slate-600"
      }`}>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 text-emerald-400 font-bold">
            <CheckCircle2 className="w-3.5 h-3.5" /> Babel + React 18 Engine
          </span>
          <span className="hidden sm:inline">Component: {selectedFilePath || "Active Component"}</span>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-indigo-400 font-semibold">{currentCode.split("\n").length} lines</span>
          <span className="text-slate-500">Universal TSX Loader v3.0</span>
        </div>
      </div>

    </div>
  );
};
