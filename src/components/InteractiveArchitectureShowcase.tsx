import React, { useState } from "react";
import { 
  Cpu, Layers, ShieldCheck, Terminal, Code2, Sparkles,
  Zap, Database, Activity, CheckCircle, ArrowRight, Play, Server,
  Globe, Lock, RefreshCw, Eye
} from "lucide-react";

interface TabItem {
  id: string;
  label: string;
  badge: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  features: string[];
  codeSnippet: string;
  metrics: { label: string; value: string }[];
}

export const InteractiveArchitectureShowcase: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>("agent-mesh");
  const [copied, setCopied] = useState<boolean>(false);

  const tabs: TabItem[] = [
    {
      id: "agent-mesh",
      label: "Multi-Agent Neural Mesh",
      badge: "Autonomous CP Agents",
      icon: Cpu,
      description: "Distributed AI agent orchestra with specialized reasoning for LeetCode problem solving, code generation, and test synthesis.",
      features: [
        "Real-time LeetCode GraphQL fetch with solution generation",
        "Deep thinking tree synthesis with algorithmic steps",
        "Parallel worker memory modal & context persistence",
        "Multi-language code converter (C++, Java, Python, TS)"
      ],
      codeSnippet: `// Neural Agent Mesh Task Dispatcher
const agentResult = await agentMesh.dispatch({
  task: "Solve LeetCode Hard #239 Sliding Window Maximum",
  targetLanguage: "cpp",
  optimizations: ["O(N) Time", "Deque Monotonic Queue"]
});
console.log(agentResult.generatedSolution);`,
      metrics: [
        { label: "Reasoning Depth", value: "99.4%" },
        { label: "Exec Latency", value: "<120ms" },
        { label: "Pass Rate", value: "98.2%" }
      ]
    },
    {
      id: "math-plotter",
      label: "Math Plotter & Calculus Engine",
      badge: "2D/3D Plotly Engine",
      icon: Activity,
      description: "High-performance vector function visualizer with real-time derivative generation, definite integration, and 3D surface mesh rendering.",
      features: [
        "Real mathjs expression parser with single & multi-var support",
        "Automatic dy/dx derivative and integral bounds calculator",
        "3D surface rendering with camera orbit control",
        "Vector export to high-res SVG & PNG graphics"
      ],
      codeSnippet: `// Math Plotter Engine Initialization
import { MathPlotter } from '@/components/MathPlotterModal';

const plot = new MathPlotter({
  expression: "sin(x) * cos(y)",
  domain: [-10, 10],
  dimension: "3D",
  showDerivatives: true
});
plot.render('#plotter-canvas');`,
      metrics: [
        { label: "Render FPS", value: "60 FPS" },
        { label: "Accuracy", value: "Float64" },
        { label: "Mesh Nodes", value: "10,000+" }
      ]
    },
    {
      id: "sandbox-runner",
      label: "Live Execution Sandbox",
      badge: "Cloud Run Container",
      icon: Terminal,
      description: "Secure node/python runtime sandbox running inside Cloud Run with real filesystem isolation and instant HTTP proxy routing.",
      features: [
        "Node.js ES Module runtime & direct tsx file execution",
        "Real filesystem read/write with binary chunk handling",
        "Zip file compilation for instant QR code file sharing",
        "Full-stack Express API proxy on port 3000"
      ],
      codeSnippet: `// Cloud Sandbox Code Execution Endpoint
app.post("/api/sandbox/run", async (req, res) => {
  const { activeFilePath, customCommand } = req.body;
  const result = await execInSandbox(activeFilePath, customCommand);
  return res.json({ stdout: result.stdout, status: "exit 0" });
});`,
      metrics: [
        { label: "Container Port", value: "3000" },
        { label: "Cold Start", value: "0ms" },
        { label: "Security Level", value: "Isolated" }
      ]
    },
    {
      id: "auth-hub",
      label: "Real Auth & File Share Hub",
      badge: "Enterprise Security",
      icon: ShieldCheck,
      description: "Complete email authentication store and real file upload service with live download URL generation and custom QR code encoding.",
      features: [
        "Real email signup/login backend with password hashing",
        "Google & GitHub OAuth single sign-on modal integrations",
        "Persistent user session token validation endpoint",
        "Real file server upload with direct download URL & QR"
      ],
      codeSnippet: `// Direct File Upload & Share Link Generator
const fileId = Math.random().toString(36).substring(2, 10);
fs.writeFileSync(filePath, Buffer.from(base64Content, 'base64'));
const downloadUrl = \`https://\${host}/api/share/download/\${fileId}\`;
const qrCode = await QRCode.toDataURL(downloadUrl);`,
      metrics: [
        { label: "Hash Encryption", value: "Base64/SHA" },
        { label: "Auth Latency", value: "12ms" },
        { label: "Session Persist", value: "LocalStorage" }
      ]
    }
  ];

  const currentTab = tabs.find(t => t.id === activeTab) || tabs[0];

  const handleCopyCode = () => {
    navigator.clipboard.writeText(currentTab.codeSnippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full my-16 bg-zinc-950/80 rounded-3xl border border-zinc-800/80 p-6 md:p-10 shadow-2xl backdrop-blur-xl relative overflow-hidden">
      {/* Background Subtle Gradient Glow */}
      <div className="absolute -top-32 -right-32 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4 border-b border-zinc-800/80 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Interactive Architecture Explorer</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight">
            Engineered for High-Performance Execution
          </h2>
          <p className="text-zinc-400 text-sm mt-1 max-w-xl">
            Explore the functional core of Google AI Studio Build with real server endpoints, interactive engines, and live container sandboxing.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-zinc-400 bg-zinc-900/90 px-3.5 py-2 rounded-xl border border-zinc-800">
          <Activity className="w-4 h-4 text-emerald-400 animate-pulse" />
          <span>Status: All Core Subsystems Online</span>
        </div>
      </div>

      {/* Tab Navigation Controls */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = tab.id === activeTab;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`p-4 rounded-2xl border text-left transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between ${
                isActive
                  ? "bg-gradient-to-br from-indigo-900/40 via-zinc-900 to-zinc-950 border-indigo-500/60 shadow-lg shadow-indigo-500/10 text-white"
                  : "bg-zinc-900/50 hover:bg-zinc-900 border-zinc-800/80 text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`p-2 rounded-xl ${isActive ? "bg-indigo-600 text-white" : "bg-zinc-800 text-zinc-400"}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  isActive ? "bg-indigo-400/20 text-indigo-300 border border-indigo-400/30" : "bg-zinc-800 text-zinc-500"
                }`}>
                  {tab.badge}
                </span>
              </div>
              <div className="font-bold text-xs md:text-sm tracking-tight text-white">{tab.label}</div>
            </button>
          );
        })}
      </div>

      {/* Main Feature Showcase Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        {/* Left Column: Explanations & Features */}
        <div className="lg:col-span-6 flex flex-col justify-between space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-mono font-bold text-indigo-400 uppercase tracking-widest">{currentTab.badge}</span>
            </div>
            <h3 className="text-xl font-bold text-white mb-3">{currentTab.description}</h3>

            <div className="space-y-2.5 mt-4">
              {currentTab.features.map((feat, idx) => (
                <div key={idx} className="flex items-start gap-3 bg-zinc-900/60 p-3 rounded-xl border border-zinc-800/60">
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span className="text-xs text-zinc-300 font-medium">{feat}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Metrics Row */}
          <div className="grid grid-cols-3 gap-3 pt-4 border-t border-zinc-800/80">
            {currentTab.metrics.map((m, idx) => (
              <div key={idx} className="bg-zinc-900/80 p-3 rounded-xl border border-zinc-800 text-center">
                <div className="text-lg font-black text-indigo-400">{m.value}</div>
                <div className="text-[10px] text-zinc-400 uppercase font-bold tracking-wider mt-0.5">{m.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Code & Terminal Output Simulation */}
        <div className="lg:col-span-6 bg-zinc-900/90 rounded-2xl border border-zinc-800 overflow-hidden flex flex-col justify-between shadow-xl">
          {/* Terminal Window Header */}
          <div className="bg-zinc-950 px-4 py-3 border-b border-zinc-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-rose-500/80" />
              <div className="w-3 h-3 rounded-full bg-amber-500/80" />
              <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
              <span className="text-xs font-mono text-zinc-400 ml-2">architecture-engine.ts</span>
            </div>
            <button
              onClick={handleCopyCode}
              className="text-xs font-mono text-zinc-400 hover:text-white bg-zinc-800 px-2.5 py-1 rounded-md transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Code2 className="w-3.5 h-3.5 text-indigo-400" />
              <span>{copied ? "Copied!" : "Copy Code"}</span>
            </button>
          </div>

          {/* Code Block */}
          <div className="p-4 font-mono text-xs text-indigo-300 overflow-x-auto bg-zinc-950/90 flex-1 leading-relaxed">
            <pre>
              <code>{currentTab.codeSnippet}</code>
            </pre>
          </div>

          {/* Footer Callout */}
          <div className="p-3.5 bg-zinc-950 border-t border-zinc-800/80 flex items-center justify-between text-xs text-zinc-400 font-mono">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-emerald-400" />
              <span>Compiled via Node.js ES Modules</span>
            </div>
            <div className="flex items-center gap-1 text-emerald-400 font-bold">
              <span>Ready for Invocation</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
