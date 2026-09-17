import React from "react";
import { 
  Building2, Cpu, Rocket, Users, ShieldCheck, Code, Sparkles, CheckCircle2, ArrowRight 
} from "lucide-react";

export const DevelopedForSection: React.FC = () => {
  const audiences = [
    {
      title: "Enterprise Software Architects",
      role: "Mission-Critical Systems",
      icon: Building2,
      color: "from-indigo-500 to-cyan-500",
      textColor: "text-indigo-400",
      borderColor: "hover:border-indigo-500/50",
      desc: "Architects requiring zero-server key retention, air-gapped sandboxed client execution, and automated multi-agent AST static type analysis.",
      bullets: [
        "Zero API key server storage or logging",
        "Encrypted local session storage",
        "Automated TypeScript compiler validation"
      ]
    },
    {
      title: "Autonomous AI & Swarm Researchers",
      role: "Multi-Agent Orchestration",
      icon: Cpu,
      color: "from-cyan-500 to-emerald-500",
      textColor: "text-cyan-400",
      borderColor: "hover:border-cyan-500/50",
      desc: "Researchers prototyping complex multi-role LLM agents, chain-of-thought thinking trees, and real-time model hot-swapping (Gemini, Claude, DeepSeek).",
      bullets: [
        "20+ OpenRouter models with instant switching",
        "Expandable agent thinking step trees",
        "Custom system role & agent prompt overrides"
      ]
    },
    {
      title: "Full-Stack SaaS Founders",
      role: "Rapid 0-to-1 Product Launch",
      icon: Rocket,
      color: "from-amber-500 to-rose-500",
      textColor: "text-amber-400",
      borderColor: "hover:border-amber-500/50",
      desc: "Founders looking to move from prompt concept to deployed React, Node.js, and Supabase Postgres web applications in less than 2 minutes.",
      bullets: [
        "Instant live preview on Port 3000",
        "1-Click Supabase SQL schema migrations",
        "Export directly to GitHub Repositories or ZIP"
      ]
    },
    {
      title: "Product Leads & Engineering Managers",
      role: "Seamless Workspace Integration",
      icon: Users,
      color: "from-purple-500 to-pink-500",
      textColor: "text-purple-400",
      borderColor: "hover:border-purple-500/50",
      desc: "Engineering leads who need unified Google Workspace automation (Gmail, Drive), YouTube transcript summaries, and team sharing tools.",
      bullets: [
        "Google Workspace OAuth integration",
        "JioSaavn ambient focus music player",
        "Automated Gmail drafting & document generation"
      ]
    }
  ];

  return (
    <section id="developed-for" className="space-y-12 pt-12">
      <div className="text-center space-y-3 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-mono font-bold uppercase">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>TAILORED FOR HIGH-IMPACT BUILDERS</span>
        </div>
        <h2 className="text-3xl md:text-5xl font-black text-white">
          Who Agent Swarm Studio is Developed For
        </h2>
        <p className="text-sm md:text-base text-zinc-400 leading-relaxed">
          Engineered to empower developers, founders, researchers, and enterprise leads with autonomous AI software creation tools.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {audiences.map((aud, index) => {
          const Icon = aud.icon;
          return (
            <div
              key={index}
              className={`p-8 rounded-3xl bg-zinc-900/80 border border-zinc-800/90 ${aud.borderColor} transition-all duration-300 space-y-6 hover:-translate-y-1 shadow-2xl relative overflow-hidden group`}
            >
              <div className="flex items-center justify-between">
                <div className={`p-3.5 rounded-2xl bg-gradient-to-r ${aud.color} text-white shadow-lg`}>
                  <Icon className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-mono font-bold px-3 py-1 rounded-full bg-zinc-950 border border-zinc-800 text-zinc-400">
                  {aud.role}
                </span>
              </div>

              <div className="space-y-2">
                <h3 className="text-xl font-bold text-white group-hover:text-cyan-300 transition-colors">
                  {aud.title}
                </h3>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  {aud.desc}
                </p>
              </div>

              <div className="border-t border-zinc-800/80 pt-4 space-y-2.5">
                {aud.bullets.map((bullet, bIdx) => (
                  <div key={bIdx} className="flex items-center gap-2.5 text-xs text-zinc-300 font-mono">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>{bullet}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
