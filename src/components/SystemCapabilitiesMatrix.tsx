import React, { useState } from "react";
import { 
  Calculator, Code, ShieldCheck, Share2, Terminal, Gamepad2, 
  Sparkles, CheckCircle2, ArrowRight, Zap, ExternalLink, Activity, RefreshCw 
} from "lucide-react";

interface CapabilityItem {
  id: string;
  category: "agents" | "math" | "auth" | "tools";
  title: string;
  subtitle: string;
  description: string;
  status: "Operational" | "Real Endpoint" | "WebGL Ready";
  endpoint: string;
  icon: React.ComponentType<{ className?: string }>;
  tags: string[];
}

export const SystemCapabilitiesMatrix: React.FC<{
  onLaunchWorkspace?: () => void;
  onOpenMathPlotter?: () => void;
}> = ({ onLaunchWorkspace, onOpenMathPlotter }) => {
  const [activeCategory, setActiveCategory] = useState<string>("all");

  const capabilities: CapabilityItem[] = [
    {
      id: "cp-agent",
      category: "agents",
      title: "Competitive Coding AI Agent",
      subtitle: "Real LeetCode GraphQL & Codeforces API Integration",
      description: "Queries LeetCode GraphQL and Codeforces API to pull live contest rankings, submission stats, upcoming contest countdowns, and generate optimal O(N) solutions.",
      status: "Real Endpoint",
      endpoint: "/api/leetcode/:username & Codeforces API",
      icon: Code,
      tags: ["LeetCode GraphQL", "Codeforces Live", "C++/Python/Java/JS"]
    },
    {
      id: "math-plotter",
      category: "math",
      title: "Math Plotter & Calculus Visualizer",
      subtitle: "2D/3D Plotly WebGL Graphics Engine",
      description: "Supports implicit functions, derivative tangent overlays dy/dx, definite integrals, and interactive 3D surface mesh rendering with CSV & SVG export.",
      status: "WebGL Ready",
      endpoint: "mathjs + Plotly WebGL",
      icon: Calculator,
      tags: ["3D Mesh", "Derivatives", "Definite Integrals", "SVG Export"]
    },
    {
      id: "auth-engine",
      category: "auth",
      title: "Real Email & OAuth Authentication",
      subtitle: "Disk-Backed Account Persistence",
      description: "Full backend authentication endpoints for email signup, login, session token validation, and OAuth modal integrations.",
      status: "Operational",
      endpoint: "/api/auth/signup & /api/auth/login",
      icon: ShieldCheck,
      tags: ["Base64/SHA Hashing", "Disk Storage", "Session Token"]
    },
    {
      id: "share-qr",
      category: "tools",
      title: "File Share & QR Code Hub",
      subtitle: "Real Server Upload & Direct Downloads",
      description: "Multipart file upload handling with generated download links and instant QR code rendering for fast mobile cross-device sharing.",
      status: "Real Endpoint",
      endpoint: "/api/share/upload & /api/share/download/:id",
      icon: Share2,
      tags: ["File Server", "QR Generation", "Zip Export"]
    }
  ];

  const filtered = activeCategory === "all" 
    ? capabilities 
    : capabilities.filter(c => c.category === activeCategory);

  return (
    <div className="w-full my-8 p-6 rounded-3xl bg-gradient-to-b from-zinc-900/90 via-zinc-950 to-black border border-zinc-800/80 shadow-2xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800 pb-5 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              Architecture Matrix
            </span>
            <span className="text-xs text-zinc-400">Production Engine Capabilities</span>
          </div>
          <h3 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            System Modules & Real API Endpoints
          </h3>
        </div>

        {/* Filter Buttons */}
        <div className="flex items-center gap-1.5 bg-zinc-900 p-1 rounded-2xl border border-zinc-800 overflow-x-auto text-xs">
          {["all", "agents", "math", "auth", "tools"].map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 rounded-xl font-bold capitalize transition-all cursor-pointer ${
                activeCategory === cat
                  ? "bg-indigo-600 text-white shadow-md"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Modules */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((item) => {
          const IconComp = item.icon;
          return (
            <div
              key={item.id}
              className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800 hover:border-indigo-500/40 transition-all space-y-3 flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                      <IconComp className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">{item.title}</h4>
                      <p className="text-[11px] text-indigo-300 font-mono">{item.subtitle}</p>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
                    {item.status}
                  </span>
                </div>

                <p className="text-xs text-zinc-300 leading-relaxed">{item.description}</p>
              </div>

              <div className="pt-3 border-t border-zinc-800/80 flex items-center justify-between gap-2">
                <div className="flex flex-wrap gap-1">
                  {item.tags.map((tag, tIdx) => (
                    <span key={tIdx} className="px-2 py-0.5 rounded-md text-[9px] font-mono bg-zinc-800 text-zinc-300 border border-zinc-700">
                      {tag}
                    </span>
                  ))}
                </div>

                {item.id === "math-plotter" && onOpenMathPlotter ? (
                  <button
                    onClick={onOpenMathPlotter}
                    className="px-3 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition-all flex items-center gap-1 cursor-pointer shrink-0"
                  >
                    <span>Launch Math Plotter</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                ) : onLaunchWorkspace ? (
                  <button
                    onClick={onLaunchWorkspace}
                    className="p-1.5 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all cursor-pointer shrink-0"
                    title="Launch Module in Studio"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </button>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
