import React, { useState, useEffect, useRef } from "react";
import { 
  FileCode, Eye, Image as ImageIcon, FileText, Database, 
  Music, Film, Download, Copy, Check, RefreshCw, ZoomIn, ZoomOut, Layers,
  Globe, Terminal, Monitor, Smartphone, Tablet, Server, ArrowRight, Play, Sparkles,
  Plus, X, Box, Code2, Layout, ExternalLink
} from "lucide-react";
import { VirtualFile } from "../types";
import { TsxComponentPreviewer } from "./TsxComponentPreviewer";
import { UniversalFileInspector } from "./UniversalFileInspector";

interface UniversalPreviewProps {
  files: VirtualFile[];
  activeFilePath: string;
  onSelectFile: (path: string) => void;
  theme: "light" | "dark";
  onOpenCodeRunner?: () => void;
}

interface PreviewTabInstance {
  id: string;
  title: string;
  urlPath: string;
  viewportMode: "desktop" | "tablet" | "mobile";
  previewMode: "localhost" | "tsx" | "file";
  selectedFilePath: string;
}

// Colorful Code Inspector with syntax highlights, line numbers, copy, and download
const ColorfulCodeInspector: React.FC<{ file: VirtualFile }> = ({ file }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(file.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([file.content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    const filename = file.path.split("/").pop() || "source_file.txt";
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const fileExt = file?.path ? file.path.split(".").pop()?.toUpperCase() || "FILE" : "FILE";
  const lines = (file?.content || "").split("\n");

  const highlightLine = (line: string) => {
    const trimmed = line.trim();
    if (trimmed.startsWith("//") || trimmed.startsWith("#") || trimmed.startsWith("/*")) {
      return <span className="text-emerald-400/80 italic">{line}</span>;
    }
    
    const tokens = line.split(/(\b(?:import|export|from|const|let|var|function|return|if|else|async|await|class|interface|type|extends|implements|default|case|switch|try|catch|new)\b|<[\/a-zA-Z0-9]+>|".*?"|'.*?'|`.*?`|\d+)/g);

    return (
      <span className="leading-relaxed">
        {tokens.map((tok, tIdx) => {
          if (/^(import|export|from|const|let|var|function|return|if|else|async|await|class|interface|type|extends|implements|default|case|switch|try|catch|new)$/.test(tok)) {
            return <span key={tIdx} className="text-cyan-400 font-bold">{tok}</span>;
          }
          if (/^<[\/a-zA-Z0-9]+>$/.test(tok)) {
            return <span key={tIdx} className="text-violet-400 font-semibold">{tok}</span>;
          }
          if (/^".*?"$|^'.*?'$|^`.*?`$/.test(tok)) {
            return <span key={tIdx} className="text-amber-300 font-normal">{tok}</span>;
          }
          if (/^\d+$/.test(tok)) {
            return <span key={tIdx} className="text-orange-400 font-mono">{tok}</span>;
          }
          return <span key={tIdx} className="text-slate-200">{tok}</span>;
        })}
      </span>
    );
  };

  return (
    <div className="h-full bg-[#0d1117] text-slate-100 flex flex-col overflow-hidden">
      <div className="px-4 py-2 bg-[#161b22] border-b border-zinc-800 flex items-center justify-between text-xs font-mono shrink-0">
        <div className="flex items-center gap-2.5 truncate">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block"></span>
            <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block"></span>
            <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block"></span>
          </div>
          <span className="px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[10px] font-bold">
            {fileExt}
          </span>
          <span className="text-slate-300 font-semibold truncate text-[11px]">{file.path}</span>
          <span className="text-zinc-500 text-[10px]">• {lines.length} lines</span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleCopy}
            className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white text-[11px] font-semibold transition-all cursor-pointer flex items-center gap-1 border border-zinc-700"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
            <span>{copied ? "Copied" : "Copy"}</span>
          </button>
          <button
            onClick={handleDownload}
            className="px-2.5 py-1 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-300 text-[11px] font-semibold transition-all cursor-pointer flex items-center gap-1 border border-emerald-500/30"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span>Download</span>
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4 font-mono text-xs leading-relaxed space-y-0.5">
        {lines.map((line, idx) => (
          <div key={idx} className="flex items-start hover:bg-zinc-800/30 px-1 rounded transition-all">
            <span className="w-10 text-zinc-600 text-right pr-4 select-none shrink-0 text-[10px] pt-0.5">{idx + 1}</span>
            <div className="flex-1 whitespace-pre break-words">{highlightLine(line)}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export const UniversalPreview: React.FC<UniversalPreviewProps> = ({
  files,
  activeFilePath,
  onSelectFile,
  theme,
  onOpenCodeRunner
}) => {
  // Multi-preview instances support
  const [instances, setInstances] = useState<PreviewTabInstance[]>([
    {
      id: "prev-1",
      title: "Main App (:3000)",
      urlPath: "http://localhost:3000/",
      viewportMode: "desktop",
      previewMode: "localhost",
      selectedFilePath: activeFilePath || (files[0]?.path || "index.html")
    }
  ]);
  const [activeInstanceId, setActiveInstanceId] = useState<string>("prev-1");

  const [copied, setCopied] = useState<boolean>(false);
  const [showConsoleLogs, setShowConsoleLogs] = useState<boolean>(false);
  const [showApiTester, setShowApiTester] = useState<boolean>(false);
  const [consoleLogs, setConsoleLogs] = useState<{ type: "log" | "warn" | "error" | "info"; text: string; time: string }[]>([]);
  const [iframeKey, setIframeKey] = useState<number>(0);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Server API route mock tester state
  const [apiTesterEndpoint, setApiTesterEndpoint] = useState<string>("/api/health");
  const [apiTesterOutput, setApiTesterOutput] = useState<string>("");
  const [apiTesterStatus, setApiTesterStatus] = useState<number | null>(null);

  const activeInstance = instances.find(i => i.id === activeInstanceId) || instances[0];
  const activeFile = files.find(f => f.path === activeInstance.selectedFilePath) || files[0];

  // Sync activeFilePath prop when changed externally
  useEffect(() => {
    if (activeFilePath && activeInstance) {
      setInstances(prev => prev.map(inst => inst.id === activeInstance.id ? { ...inst, selectedFilePath: activeFilePath } : inst));
    }
  }, [activeFilePath]);

  // Listen for iframe console messages via window postMessage
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Validate sender origin (same origin or sandboxed srcdoc iframe null origin)
      if (event.origin !== window.location.origin && event.origin !== "null") return;
      if (event.data && typeof event.data === "object" && event.data.source === "workspace-iframe-console") {
        const cleanMsg = typeof event.data.message === "string" ? event.data.message.slice(0, 5000) : String(event.data.message || "").slice(0, 5000);
        setConsoleLogs(prev => [
          ...prev.slice(-100), // Keep last 100 logs
          {
            type: ["log", "warn", "error", "info"].includes(event.data.logType) ? event.data.logType : "log",
            text: cleanMsg,
            time: new Date().toLocaleTimeString()
          }
        ]);
      }
    };
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  const handleAddPreviewInstance = () => {
    const newId = `prev-${Date.now()}`;
    const newInst: PreviewTabInstance = {
      id: newId,
      title: `Preview ${instances.length + 1}`,
      urlPath: `http://localhost:3000/v${instances.length + 1}`,
      viewportMode: "desktop",
      previewMode: "localhost",
      selectedFilePath: files[0]?.path || "index.html"
    };
    setInstances([...instances, newInst]);
    setActiveInstanceId(newId);
  };

  const handleRemoveInstance = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (instances.length <= 1) return;
    const filtered = instances.filter(i => i.id !== id);
    setInstances(filtered);
    if (activeInstanceId === id) {
      setActiveInstanceId(filtered[0].id);
    }
  };

  const updateActiveInstance = (updates: Partial<PreviewTabInstance>) => {
    setInstances(prev => prev.map(inst => inst.id === activeInstance.id ? { ...inst, ...updates } : inst));
  };

  const handleCopyContent = () => {
    if (!activeFile) return;
    navigator.clipboard.writeText(activeFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRefreshLocalhost = () => {
    setConsoleLogs([]);
    setIframeKey(prev => prev + 1);
  };

  // Build complete multi-file HTML + CSS + JS bundle supporting HTML/CSS/Tailwind/JS/JSX/TSX/Three.js/Chart.js/React
  const generateLocalhostBundle = (): string => {
    const htmlFile = files.find(f => f.path.toLowerCase().endsWith(".html") || f.path.toLowerCase() === "index.html");
    const cssFiles = files.filter(f => f.path.toLowerCase().endsWith(".css"));
    const jsFiles = files.filter(f => 
      f.path.toLowerCase().endsWith(".js") || 
      f.path.toLowerCase().endsWith(".jsx") || 
      f.path.toLowerCase().endsWith(".ts") || 
      f.path.toLowerCase().endsWith(".tsx")
    );

    // Extract all CSS contents
    const combinedCSS = cssFiles.map(f => `/* File: ${f.path} */\n${f.content}`).join("\n\n");

    // Extract all JS/React scripts & transform ES imports/exports for in-browser Babel execution
    const transformCodeForBrowser = (code: string) => {
      let cleaned = code;
      cleaned = cleaned.replace(/import\s+type\s+[^;]+;/g, "");
      cleaned = cleaned.replace(/import\s+React\s*,\s*\{([^}]+)\}\s*from\s*["']react["'];?/g, "const {$1} = React;");
      cleaned = cleaned.replace(/import\s*\{([^}]+)\}\s*from\s*["']react["'];?/g, "const {$1} = React;");
      cleaned = cleaned.replace(/import\s+React\s+from\s*["']react["'];?/g, "const React = window.React;");
      cleaned = cleaned.replace(/import\s*\{([^}]+)\}\s*from\s*["']lucide-react["'];?/g, (match, icons) => {
        const iconList = icons.split(",").map((i: string) => i.trim()).filter(Boolean);
        return iconList.map((iconName: string) => `const ${iconName} = (props) => React.createElement('span', { className: 'inline-flex items-center justify-center ' + (props.className || '') }, React.createElement('i', { 'data-lucide': '${iconName.toLowerCase()}' }));`).join("\n");
      });
      cleaned = cleaned.replace(/import\s*\{([^}]+)\}\s*from\s*["'](?:motion\/react|framer-motion)["'];?/g, "const { motion, AnimatePresence } = window.Motion || { motion: { div: 'div', button: 'button', span: 'span', section: 'section' }, AnimatePresence: ({children}) => children };");
      cleaned = cleaned.replace(/import\s+[^;]+from\s*["'][^"']+["'];?/g, "// Import statement processed for UMD runtime");
      cleaned = cleaned.replace(/export\s+default\s+function\s+([A-Za-z0-9_]+)/g, "function $1\nwindow.App = $1;");
      cleaned = cleaned.replace(/export\s+default\s+([A-Za-z0-9_]+);?/g, "window.App = $1;");
      cleaned = cleaned.replace(/export\s+const\s+/g, "const ");
      cleaned = cleaned.replace(/export\s+function\s+/g, "function ");
      cleaned = cleaned.replace(/export\s+class\s+/g, "class ");
      cleaned = cleaned.replace(/export\s+interface\s+/g, "interface ");
      cleaned = cleaned.replace(/export\s+type\s+/g, "type ");
      return cleaned;
    };

    const combinedJS = jsFiles.map(f => `// File: ${f.path}\n${transformCodeForBrowser(f.content)}`).join("\n\n");

    // Base HTML template
    let bodyContent = "";
    if (htmlFile) {
      bodyContent = htmlFile.content;
      if (bodyContent.includes("<body")) {
        const bodyMatch = bodyContent.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
        if (bodyMatch) bodyContent = bodyMatch[1];
      }
    } else {
      bodyContent = `
        <div id="root"></div>
        <div id="app"></div>
      `;
    }

    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Localhost 3000 Universal Runtime</title>
  
  <!-- 1. TAILWIND CSS CDN -->
  <script src="https://cdn.tailwindcss.com"></script>
  
  <!-- 2. REACT & REACT-DOM 18 CDNs -->
  <script src="https://unpkg.com/react@18/umd/react.development.js" crossorigin></script>
  <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js" crossorigin></script>
  
  <!-- 3. BABEL STANDALONE (Transpiles JSX, TSX, ES6 live) -->
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
  
  <!-- 4. THREE.JS 3D CANVAS LIBRARY -->
  <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>

  <!-- 5. CHART.JS & CANVAS-CONFETTI & AXIOS -->
  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/canvas-confetti@1.6.0/dist/confetti.browser.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/axios/dist/axios.min.js"></script>
  
  <!-- 6. LUCIDE ICONS UMD -->
  <script src="https://unpkg.com/lucide@latest"></script>

  <style>
    body {
      font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      margin: 0;
      padding: 0;
      min-height: 100vh;
      background-color: #f8fafc;
    }
    ${combinedCSS}
  </style>

  <script>
    // Intercept console logs and postMessage to parent IDE
    (function() {
      const origLog = console.log;
      const origWarn = console.warn;
      const origError = console.error;
      const origInfo = console.info;

      function sendLog(type, args) {
        try {
          const msg = Array.from(args).map(a => typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a)).join(' ');
          window.parent.postMessage({
            source: 'workspace-iframe-console',
            logType: type,
            message: msg
          }, '*');
        } catch(e) {}
      }

      console.log = function(...args) { origLog.apply(console, args); sendLog('log', args); };
      console.warn = function(...args) { origWarn.apply(console, args); sendLog('warn', args); };
      console.error = function(...args) { origError.apply(console, args); sendLog('error', args); };
      console.info = function(...args) { origInfo.apply(console, args); sendLog('info', args); };

      window.onerror = function(msg, url, line) {
        sendLog('error', ['Uncaught Error:', msg, 'at line', line]);
      };
    })();
  </script>
</head>
<body>
  ${bodyContent}

  <!-- Injected Multi-File Workspace Engine -->
  <script type="text/babel" data-presets="react,typescript">
    try {
      ${combinedJS}

      // Auto-mount React component if defined
      if (window.App && typeof window.App === 'function') {
        const rootEl = document.getElementById('root') || document.getElementById('app') || document.body;
        if (rootEl && window.ReactDOM && window.ReactDOM.createRoot) {
          window.ReactDOM.createRoot(rootEl).render(React.createElement(window.App));
        }
      }

      // Auto initialize Lucide icons
      if (window.lucide) {
        window.lucide.createIcons();
      }
    } catch(err) {
      const errMsg = (err && err.message) || String(err);
      console.warn("Workspace Execution Error:", errMsg);
      const rootEl = document.getElementById('root') || document.body;
      const errBox = document.createElement('div');
      errBox.style.padding = '16px';
      errBox.style.margin = '16px';
      errBox.style.background = '#fef2f2';
      errBox.style.border = '1px solid #fca5a5';
      errBox.style.borderRadius = '12px';
      errBox.style.color = '#991b1b';
      errBox.style.fontFamily = 'monospace';
      errBox.style.fontSize = '12px';
      errBox.innerHTML = '<strong>Runtime Render Exception:</strong><br/>' + errMsg;
      rootEl.prepend(errBox);
    }
  </script>
</body>
</html>
    `;
  };

  // Test mock API server endpoints
  const handleTestApiEndpoint = () => {
    const endpoint = apiTesterEndpoint.trim().toLowerCase();
    
    const matchingJson = files.find(f => 
      f.path.toLowerCase().endsWith(".json") && 
      (f.path.toLowerCase().includes(endpoint.replace("/api/", "")) || endpoint.includes(f.path.toLowerCase()))
    );

    const matchingServerFile = files.find(f => 
      f.path.toLowerCase().includes("server") || f.path.toLowerCase().includes("api")
    );

    if (endpoint === "/api/health" || endpoint === "/health") {
      setApiTesterStatus(200);
      setApiTesterOutput(JSON.stringify({ status: "ok", server: "Express Cloud Run", port: 3000, uptime: "Active", multiPreview: true }, null, 2));
    } else if (matchingJson) {
      setApiTesterStatus(200);
      setApiTesterOutput(matchingJson.content);
    } else if (matchingServerFile && matchingServerFile.content && matchingServerFile.content.includes(endpoint)) {
      setApiTesterStatus(200);
      setApiTesterOutput(JSON.stringify({ message: `Successfully matched route '${endpoint}' inside ${matchingServerFile.path}`, timestamp: new Date().toISOString() }, null, 2));
    } else {
      setApiTesterStatus(404);
      setApiTesterOutput(JSON.stringify({ error: `404 Not Found: Endpoint '${endpoint}' is not defined in workspace routes.` }, null, 2));
    }
  };

  const getFileType = (pathName: string) => {
    const ext = pathName.split(".").pop()?.toLowerCase() || "";
    if (["html", "htm"].includes(ext)) return "html";
    if (["md", "markdown"].includes(ext)) return "markdown";
    if (["json"].includes(ext)) return "json";
    if (["png", "jpg", "jpeg", "svg", "webp", "gif"].includes(ext)) return "image";
    if (["mp3", "wav", "ogg", "aac"].includes(ext)) return "audio";
    if (["csv", "tsv"].includes(ext)) return "csv";
    return "code";
  };

  const fileType = activeFile ? getFileType(activeFile.path) : "code";

  return (
    <div className={`h-full w-full flex-1 flex flex-col overflow-hidden ${theme === "dark" ? "bg-[#121214] text-zinc-100" : "bg-slate-50 text-slate-800"}`}>
      
      {/* UNIFIED STREAMLINED BROWSER TOOLBAR */}
      <div className={`h-10 px-3 border-b flex items-center justify-between gap-2 shrink-0 text-xs ${
        theme === "dark" ? "border-zinc-800 bg-[#161618]" : "border-slate-200 bg-white"
      }`}>
        {/* Left: Instance Selector & Mode Segmented Control */}
        <div className="flex items-center gap-2 shrink-0">
          {instances.length > 1 ? (
            <div className="flex items-center gap-1">
              {instances.map(inst => (
                <div
                  key={inst.id}
                  onClick={() => setActiveInstanceId(inst.id)}
                  className={`flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-medium cursor-pointer transition-all ${
                    activeInstanceId === inst.id
                      ? "bg-indigo-600 text-white shadow-xs"
                      : (theme === "dark" ? "text-zinc-400 hover:text-white hover:bg-zinc-800" : "text-slate-600 hover:text-slate-900 hover:bg-slate-100")
                  }`}
                >
                  <span>{inst.title}</span>
                  <button
                    onClick={(e) => handleRemoveInstance(inst.id, e)}
                    className="p-0.5 hover:bg-black/20 rounded transition-all"
                  >
                    <X className="w-2.5 h-2.5" />
                  </button>
                </div>
              ))}
              <button
                onClick={handleAddPreviewInstance}
                className="p-1 rounded text-zinc-400 hover:text-indigo-500 hover:bg-indigo-500/10 transition-all cursor-pointer"
                title="Add preview instance"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" title="Local Server Ready" />
              <button
                onClick={handleAddPreviewInstance}
                className="p-1 rounded text-zinc-400 hover:text-indigo-500 hover:bg-indigo-500/10 transition-all cursor-pointer"
                title="Add split preview instance"
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>
          )}

          {/* Mode Switcher Segmented Control */}
          <div className="flex items-center bg-zinc-900/10 dark:bg-zinc-800/80 p-0.5 rounded-md">
            <button
              onClick={() => updateActiveInstance({ previewMode: "localhost" })}
              className={`px-2 py-0.5 rounded text-[11px] font-medium transition-all cursor-pointer ${
                activeInstance.previewMode === "localhost"
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
              }`}
            >
              App
            </button>
            <button
              onClick={() => updateActiveInstance({ previewMode: "tsx" })}
              className={`px-2 py-0.5 rounded text-[11px] font-medium transition-all cursor-pointer ${
                activeInstance.previewMode === "tsx"
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
              }`}
            >
              TSX
            </button>
            <button
              onClick={() => updateActiveInstance({ previewMode: "file" })}
              className={`px-2 py-0.5 rounded text-[11px] font-medium transition-all cursor-pointer ${
                activeInstance.previewMode === "file"
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
              }`}
            >
              File
            </button>
          </div>
        </div>

        {/* Center: Address Bar */}
        <div className="flex-1 max-w-xl min-w-0">
          {activeInstance.previewMode === "localhost" ? (
            <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-[11px] font-mono transition-all ${
              theme === "dark" ? "bg-zinc-900 border-zinc-700/70 text-zinc-200" : "bg-white border-slate-300 text-slate-800"
            }`}>
              <span className="text-emerald-500 font-bold shrink-0">http://</span>
              <input
                type="text"
                value={activeInstance.urlPath}
                onChange={(e) => updateActiveInstance({ urlPath: e.target.value })}
                className="bg-transparent border-none focus:outline-none w-full font-mono text-[11px] min-w-0"
              />
              <button
                onClick={handleRefreshLocalhost}
                className="p-1 rounded text-zinc-400 hover:text-indigo-400 transition-colors shrink-0"
                title="Reload Preview"
              >
                <RefreshCw className="w-3 h-3" />
              </button>
            </div>
          ) : (
            <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-xs font-mono ${
              theme === "dark" ? "bg-zinc-900 border-zinc-700/70 text-zinc-200" : "bg-white border-slate-300 text-slate-800"
            }`}>
              <FileCode className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
              <select
                value={activeInstance.selectedFilePath}
                onChange={(e) => {
                  updateActiveInstance({ selectedFilePath: e.target.value });
                  onSelectFile(e.target.value);
                }}
                className="bg-transparent border-none font-mono font-medium text-inherit focus:outline-none cursor-pointer w-full text-xs"
              >
                {files.map(f => (
                  <option key={f.path} value={f.path} className="bg-white dark:bg-zinc-900 text-slate-800 dark:text-zinc-200">
                    {f.path}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Right: Viewport, Console, Run, New Tab */}
        <div className="flex items-center gap-1.5 shrink-0">
          {activeInstance.previewMode === "localhost" && (
            <>
              {/* Viewport size switcher */}
              <div className="hidden md:flex items-center bg-zinc-900/10 dark:bg-zinc-800/80 p-0.5 rounded-md">
                <button
                  onClick={() => updateActiveInstance({ viewportMode: "desktop" })}
                  className={`p-1 rounded cursor-pointer transition-all ${
                    activeInstance.viewportMode === "desktop" ? "bg-indigo-600 text-white shadow-xs" : "text-zinc-400 hover:text-zinc-200"
                  }`}
                  title="Desktop View (100%)"
                >
                  <Monitor className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => updateActiveInstance({ viewportMode: "tablet" })}
                  className={`p-1 rounded cursor-pointer transition-all ${
                    activeInstance.viewportMode === "tablet" ? "bg-indigo-600 text-white shadow-xs" : "text-zinc-400 hover:text-zinc-200"
                  }`}
                  title="Tablet View (768px)"
                >
                  <Tablet className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => updateActiveInstance({ viewportMode: "mobile" })}
                  className={`p-1 rounded cursor-pointer transition-all ${
                    activeInstance.viewportMode === "mobile" ? "bg-indigo-600 text-white shadow-xs" : "text-zinc-400 hover:text-zinc-200"
                  }`}
                  title="Mobile View (375px)"
                >
                  <Smartphone className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Console Toggle */}
              <button
                onClick={() => setShowConsoleLogs(!showConsoleLogs)}
                className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium cursor-pointer transition-all ${
                  showConsoleLogs
                    ? "bg-slate-900 text-emerald-400 shadow-xs"
                    : (theme === "dark" ? "text-zinc-400 hover:text-white hover:bg-zinc-800" : "text-slate-600 hover:text-slate-900 hover:bg-slate-100")
                }`}
                title="Toggle Console Logs"
              >
                <Terminal className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Console</span>
                {consoleLogs.length > 0 && (
                  <span className="px-1 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-bold">
                    {consoleLogs.length}
                  </span>
                )}
              </button>

              {/* API Route Tester Toggle */}
              <button
                onClick={() => setShowApiTester(!showApiTester)}
                className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium cursor-pointer transition-all ${
                  showApiTester
                    ? "bg-indigo-600 text-white shadow-xs"
                    : (theme === "dark" ? "text-zinc-400 hover:text-white hover:bg-zinc-800" : "text-slate-600 hover:text-slate-900 hover:bg-slate-100")
                }`}
                title="Toggle API Route Tester"
              >
                <Server className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">API</span>
              </button>

              {/* Open in New Window/Tab */}
              <button
                onClick={() => {
                  const previewBlob = new Blob([generateLocalhostBundle()], { type: 'text/html' });
                  const previewUrl = URL.createObjectURL(previewBlob);
                  window.open(previewUrl, "_blank");
                }}
                className={`p-1.5 rounded-md transition-all cursor-pointer ${
                  theme === "dark" ? "text-zinc-400 hover:text-white hover:bg-zinc-800" : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                }`}
                title="Open preview in new tab"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </>
          )}

          {activeInstance.previewMode === "file" && (
            <button
              onClick={handleCopyContent}
              className="p-1.5 rounded-md bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 hover:text-indigo-600 cursor-pointer transition-all"
              title="Copy file content"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
            </button>
          )}

          {onOpenCodeRunner && (
            <button
              onClick={onOpenCodeRunner}
              className="px-2.5 py-1 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-semibold transition-all cursor-pointer flex items-center gap-1 shadow-xs"
              title="Run active file"
            >
              <Play className="w-3 h-3 fill-white" />
              <span className="hidden sm:inline">Run</span>
            </button>
          )}
        </div>
      </div>

      {/* CONTENT AREA */}
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden relative">
        
        {/* LOCALHOST RUNTIME VIEWPORT */}
        {activeInstance.previewMode === "localhost" && (
          <div className="flex-1 flex flex-col h-full overflow-hidden relative">
            
            {/* IFRAME FRAMEWORK VIEWPORT (Full-bleed, clean, responsive) */}
            <div className={`flex-1 flex justify-center overflow-hidden relative ${
              theme === "dark" ? "bg-zinc-950" : "bg-white"
            }`}>
              <iframe
                key={`${iframeKey}-${activeInstance.id}`}
                ref={iframeRef}
                srcDoc={generateLocalhostBundle()}
                title={`Localhost Server - ${activeInstance.title}`}
                className={`h-full border-none transition-all duration-200 ${
                  activeInstance.viewportMode === "mobile" 
                    ? "w-[375px] my-auto rounded-2xl border-4 border-slate-800 shadow-2xl h-[94%]" 
                    : activeInstance.viewportMode === "tablet" 
                      ? "w-[768px] my-auto rounded-xl border-2 border-slate-700 shadow-xl h-[96%]" 
                      : "w-full"
                }`}
                sandbox="allow-scripts allow-modals allow-same-origin allow-forms"
              />
            </div>

            {/* SERVER API ROUTE TESTER BAR (Shown on demand, not cluttering default view) */}
            {showApiTester && (
              <div className={`p-3 border-t flex flex-col gap-2 shrink-0 ${
                theme === "dark" ? "bg-[#18181b] border-zinc-800 text-zinc-200" : "bg-white border-slate-200 text-slate-800"
              }`}>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-500 flex items-center gap-1">
                    <Server className="w-3.5 h-3.5" /> Mock Backend API Route Tester
                  </span>
                  {apiTesterStatus && (
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                      apiTesterStatus === 200 ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500"
                    }`}>
                      HTTP {apiTesterStatus}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={apiTesterEndpoint}
                    onChange={(e) => setApiTesterEndpoint(e.target.value)}
                    placeholder="/api/health or /api/data"
                    className={`flex-1 border rounded-lg px-2.5 py-1 text-xs font-mono focus:outline-none ${
                      theme === "dark" ? "bg-zinc-900 border-zinc-700 text-zinc-100" : "bg-slate-50 border-slate-200 text-slate-800"
                    }`}
                  />
                  <button
                    onClick={handleTestApiEndpoint}
                    className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 shadow-xs"
                  >
                    <Play className="w-3 h-3 fill-white" /> Test Route
                  </button>
                </div>

                {apiTesterOutput && (
                  <pre className="p-2 rounded bg-slate-900 text-emerald-400 font-mono text-[10px] overflow-x-auto max-h-24">
                    {apiTesterOutput}
                  </pre>
                )}
              </div>
            )}

            {/* CONSOLE LOGS DRAWER */}
            {showConsoleLogs && (
              <div className="h-40 border-t border-zinc-800 bg-slate-950 text-slate-200 font-mono text-xs flex flex-col shrink-0 overflow-hidden">
                <div className="h-7 px-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                  <span className="flex items-center gap-1.5 font-bold text-emerald-400">
                    <Terminal className="w-3.5 h-3.5" /> Console Logs ({consoleLogs.length})
                  </span>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => setConsoleLogs([])}
                      className="hover:text-white cursor-pointer text-[10px]"
                    >
                      Clear
                    </button>
                    <button 
                      onClick={() => setShowConsoleLogs(false)}
                      className="hover:text-white cursor-pointer text-[10px] p-0.5"
                      title="Close Console"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto p-2.5 space-y-1 text-[11px]">
                  {consoleLogs.length === 0 ? (
                    <p className="text-slate-600 italic">No console messages logged yet. Interactions inside preview will show here.</p>
                  ) : (
                    consoleLogs.map((log, idx) => (
                      <div key={idx} className="flex items-start gap-2 border-b border-slate-900/60 pb-0.5">
                        <span className="text-slate-500 text-[10px]">{log.time}</span>
                        <span className={`font-bold uppercase text-[9px] px-1 rounded ${
                          log.type === "error" ? "bg-rose-500/20 text-rose-400" : log.type === "warn" ? "bg-amber-500/20 text-amber-400" : "bg-emerald-500/20 text-emerald-400"
                        }`}>
                          {log.type}
                        </span>
                        <span className="whitespace-pre-wrap break-words">{log.text}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TSX COMPONENT LIVE SANDBOX & FILE LOADER */}
        {activeInstance.previewMode === "tsx" && (
          <div className="flex-1 overflow-hidden h-full">
            <TsxComponentPreviewer
              files={files}
              initialFilePath={activeInstance.selectedFilePath || activeFilePath}
              theme={theme}
              onSelectFile={onSelectFile}
            />
          </div>
        )}

        {/* UNIVERSAL FILE INSPECTOR MODE (TSX, Markdown, HTML, JSON, Images, CSV, Code) */}
        {activeInstance.previewMode === "file" && (
          <div className="flex-1 overflow-hidden h-full">
            {activeFile ? (
              <UniversalFileInspector
                file={activeFile}
                files={files}
                theme={theme}
                onSelectFile={onSelectFile}
              />
            ) : (
              <div className="p-8 text-center text-slate-400">
                <p className="text-xs">No file selected for inspection.</p>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};
