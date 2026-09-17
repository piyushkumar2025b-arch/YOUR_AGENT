import React, { useEffect, useRef } from "react";

export const TopScrollProgressBar: React.FC = () => {
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let ticking = false;

    const updateBar = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0 && barRef.current) {
        const pct = Math.min(100, Math.max(0, (window.scrollY / totalHeight) * 100));
        barRef.current.style.width = `${pct}%`;
      }
      ticking = false;
    };

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(updateBar);
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div
      ref={barRef}
      className="fixed top-0 left-0 h-1 bg-gradient-to-r from-indigo-500 via-cyan-400 to-emerald-400 z-[100] transition-[width] duration-75 pointer-events-none"
      style={{ width: "0%" }}
    />
  );
};
