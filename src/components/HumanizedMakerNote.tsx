import React from "react";
import { Heart, Terminal, Sparkles, Coffee, ShieldCheck, Check } from "lucide-react";

export const HumanizedMakerNote: React.FC = () => {
  return (
    <section className="max-w-4xl mx-auto rounded-3xl p-8 md:p-10 bg-gradient-to-br from-zinc-900/90 via-zinc-950 to-indigo-950/20 border border-zinc-800/80 shadow-2xl relative overflow-hidden backdrop-blur-xl space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
          <Coffee className="w-5 h-5 text-amber-400" />
        </div>
        <div>
          <span className="text-xs font-semibold text-indigo-400 tracking-wider uppercase">A Note from the Makers</span>
          <h3 className="text-xl md:text-2xl font-bold text-white">Why We Built This Studio</h3>
        </div>
      </div>

      <div className="space-y-4 text-sm text-zinc-300 leading-relaxed font-normal">
        <p>
          Developer tools have gotten unnecessarily noisy. Over the last two years, we watched AI coding tools turn into slot machines: you type a single question, wait twenty seconds, and burn 20,000 tokens as the tool re-sends your entire codebase over and over again. When something goes wrong, you get cryptic errors and empty promises.
        </p>
        <p>
          We wanted to build something deeply human, quiet, and respectful:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          <div className="p-4 rounded-2xl bg-zinc-950/70 border border-zinc-800/80 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
              <ShieldCheck className="w-4 h-4" />
              <span>Zero Wasted Tokens</span>
            </div>
            <p className="text-xs text-zinc-400 leading-normal">
              Prompts are automatically condensed, whitespace is collapsed, and repeated queries are served straight from memory with zero token expenditure.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-zinc-950/70 border border-zinc-800/80 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-cyan-400">
              <Terminal className="w-4 h-4" />
              <span>Real Working Sandbox</span>
            </div>
            <p className="text-xs text-zinc-400 leading-normal">
              Your code actually compiles and runs live on Port 3000. You can inspect the files, tweak the styles, and test with real browser ergonomics.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-zinc-950/70 border border-zinc-800/80 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-indigo-400">
              <Sparkles className="w-4 h-4" />
              <span>Real Google Integrations</span>
            </div>
            <p className="text-xs text-zinc-400 leading-normal">
              Direct exports to Google Sheets and Docs, live Firestore sync, and vision wireframe translation so your whole team stays in the loop.
            </p>
          </div>
        </div>

        <p className="pt-2 text-zinc-400 text-xs italic">
          "Software is about creating things that give people leverage and joy. We hope this workspace gives you both."
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 border-t border-zinc-800/80 pt-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-cyan-400 flex items-center justify-center text-white font-bold text-sm shadow-md">
            PK
          </div>
          <div>
            <div className="text-xs font-bold text-white">Crafted by Piyush Kumar</div>
            <div className="text-[11px] text-zinc-400">VIT University • Google AI Studio Contributor</div>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-zinc-400">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Crafted with genuine developer care</span>
        </div>
      </div>
    </section>
  );
};
