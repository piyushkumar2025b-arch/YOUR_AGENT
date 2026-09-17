import React from "react";
import { Activity, ShieldCheck, Cpu, Database, Zap, Flame, Globe } from "lucide-react";

export const LandingPageMetricsBanner: React.FC = () => {
  const metrics = [
    {
      icon: Activity,
      label: "Active Cloud Container",
      value: "Port 3000 Active",
      subtext: "Proxied through nginx layer",
      color: "text-emerald-400",
      bg: "bg-emerald-500/10 border-emerald-500/20"
    },
    {
      icon: Cpu,
      label: "Neural Agent Threads",
      value: "4 Dedicated Workers",
      subtext: "CP, Study, Search & Memory",
      color: "text-indigo-400",
      bg: "bg-indigo-500/10 border-indigo-500/20"
    },
    {
      icon: Database,
      label: "Math & Plotter Engine",
      value: "WebGL 3D Accelerated",
      subtext: "Calculus & vector calculus",
      color: "text-cyan-400",
      bg: "bg-cyan-500/10 border-cyan-500/20"
    },
    {
      icon: ShieldCheck,
      label: "User Auth Store",
      value: "Real Backend Auth",
      subtext: "SHA hashed session persistence",
      color: "text-amber-400",
      bg: "bg-amber-500/10 border-amber-500/20"
    }
  ];

  return (
    <div className="w-full my-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((m, idx) => {
          const Icon = m.icon;
          return (
            <div
              key={idx}
              className="bg-zinc-900/80 rounded-2xl border border-zinc-800/80 p-4 flex items-center gap-4 transition-all hover:border-zinc-700/80 hover:bg-zinc-900 shadow-md backdrop-blur-md"
            >
              <div className={`p-3 rounded-xl ${m.bg} ${m.color} shrink-0`}>
                <Icon className="w-6 h-6" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider truncate">{m.label}</div>
                <div className="text-base font-black text-white truncate">{m.value}</div>
                <div className="text-[10px] text-zinc-500 truncate">{m.subtext}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
