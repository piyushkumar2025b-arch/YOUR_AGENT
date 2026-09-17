import React from "react";
import { 
  Award, CheckCircle2, Shield, Star, Rocket,
  Sparkles, Code, Calculator, Mail, Share2, Gamepad2, Play
} from "lucide-react";

export const LandingPageTestimonials: React.FC = () => {
  const highlightFeatures = [
    {
      title: "Math Plotter & Analysis",
      desc: "Plot implicit equations, calculus derivatives, and 3D surface meshes with custom export.",
      icon: Calculator,
      color: "from-cyan-500 to-blue-600"
    },
    {
      title: "Competitive Coding Agents",
      desc: "Fetch real LeetCode stats via GraphQL/mirror APIs & generate structured problem strategies.",
      icon: Code,
      color: "from-indigo-500 to-purple-600"
    },
    {
      title: "Real Email & Workspace Auth",
      desc: "Real backend authentication endpoints with disk-backed user state persistence.",
      icon: Shield,
      color: "from-amber-500 to-orange-600"
    },
    {
      title: "File Share & QR Hub",
      desc: "Upload files directly to server memory with instant downloadable share URLs & QR generation.",
      icon: Share2,
      color: "from-emerald-500 to-teal-600"
    }
  ];

  return (
    <div className="w-full my-12 space-y-8">
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-wider">
          <Award className="w-3.5 h-3.5" />
          <span>Production Ready Features</span>
        </div>
        <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight">
          Fully Functioning Modules & Real Integrations
        </h2>
        <p className="text-zinc-400 text-sm">
          Every tool inside Google AI Studio Build is backed by real server endpoints, active math algorithms, and genuine API services.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {highlightFeatures.map((feat, idx) => {
          const Icon = feat.icon;
          return (
            <div
              key={idx}
              className="bg-zinc-900/70 hover:bg-zinc-900 rounded-2xl border border-zinc-800 p-5 transition-all hover:scale-102 hover:border-zinc-700 flex flex-col justify-between group shadow-xl"
            >
              <div>
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${feat.color} flex items-center justify-center text-white mb-4 shadow-lg`}>
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-white text-base mb-1.5">{feat.title}</h3>
                <p className="text-xs text-zinc-400 leading-relaxed">{feat.desc}</p>
              </div>

              <div className="mt-4 pt-3 border-t border-zinc-800/80 flex items-center justify-between text-[11px] font-bold text-indigo-400">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>100% Operational</span>
                </span>
                <span className="text-zinc-500 group-hover:text-indigo-400 transition-colors">Verified →</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
