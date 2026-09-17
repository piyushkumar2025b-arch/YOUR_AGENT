import React from "react";

export const NeonSignature: React.FC = () => {
  const name = "PIYUSH KUMAR";

  return (
    <div className="flex flex-col items-center justify-center pt-6 pb-4 space-y-2 border-t border-zinc-900/80 mt-6">
      <style>{`
        @keyframes neonGlowRotate {
          0% {
            border-color: #06b6d4;
            box-shadow: 0 0 8px #06b6d4, inset 0 0 4px #06b6d4;
          }
          25% {
            border-color: #a855f7;
            box-shadow: 0 0 8px #a855f7, inset 0 0 4px #a855f7;
          }
          50% {
            border-color: #ec4899;
            box-shadow: 0 0 8px #ec4899, inset 0 0 4px #ec4899;
          }
          75% {
            border-color: #eab308;
            box-shadow: 0 0 8px #eab308, inset 0 0 4px #eab308;
          }
          100% {
            border-color: #06b6d4;
            box-shadow: 0 0 8px #06b6d4, inset 0 0 4px #06b6d4;
          }
        }

        .neon-letter-box {
          animation: neonGlowRotate 4s linear infinite;
        }
      `}</style>

      <div className="text-[10px] uppercase font-mono tracking-widest text-zinc-400 flex items-center gap-1.5 font-semibold">
        <span>DEVELOPED FOR ADVANCED SOFTWARE ENGINEERING</span>
      </div>

      <div className="flex items-center gap-1 sm:gap-1.5 my-1">
        <span className="text-[11px] font-mono text-zinc-400 mr-1.5 font-medium">Developed by</span>
        {name.split("").map((char, index) => {
          if (char === " ") {
            return <div key={index} className="w-2 sm:w-3" />;
          }

          // Stagger the animation delay so neon colors revolve around each letter
          const animationDelay = `${(index * 0.35) % 4}s`;

          return (
            <span
              key={index}
              style={{ animationDelay }}
              className="neon-letter-box inline-flex items-center justify-center w-5 h-6 sm:w-6 sm:h-7 rounded-md border text-[11px] sm:text-xs font-black text-white bg-zinc-950/90 tracking-tighter transition-transform hover:scale-110 select-none"
            >
              {char}
            </span>
          );
        })}
      </div>

      <p className="text-[9px] font-mono text-zinc-400">
        © 2026 Agent Swarm Studio OS • Handcrafted with Precision
      </p>
    </div>
  );
};
