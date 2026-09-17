import React, { useState, useEffect, useRef } from "react";
import { GripHorizontal } from "lucide-react";

interface HorizontalResizeSliderHandleProps {
  currentHeight: number;
  onHeightChange: (height: number) => void;
  minHeight?: number;
  maxHeight?: number;
  label?: string;
  theme?: "light" | "dark" | string;
}

export const HorizontalResizeSliderHandle: React.FC<HorizontalResizeSliderHandleProps> = ({
  currentHeight,
  onHeightChange,
  minHeight = 100,
  maxHeight = 600,
  theme = "dark"
}) => {
  const isDraggingRef = useRef(false);
  const startYRef = useRef(0);
  const startHeightRef = useRef(currentHeight);
  const isDark = theme !== "light";

  const handleMouseDown = (e: React.MouseEvent) => {
    isDraggingRef.current = true;
    startYRef.current = e.clientY;
    startHeightRef.current = currentHeight;
    document.body.style.cursor = "row-resize";
    document.body.style.userSelect = "none";

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!isDraggingRef.current) return;
      const deltaY = startYRef.current - moveEvent.clientY;
      const newHeight = Math.min(maxHeight, Math.max(minHeight, startHeightRef.current + deltaY));
      onHeightChange(newHeight);
    };

    const handleMouseUp = () => {
      isDraggingRef.current = false;
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  };

  return (
    <div
      onMouseDown={handleMouseDown}
      className={`h-2 border-t flex items-center justify-center cursor-row-resize select-none transition-colors group relative z-20 ${
        isDark
          ? "border-zinc-800 bg-[#1e1e20] hover:bg-indigo-600/30"
          : "border-slate-200 bg-slate-100 hover:bg-indigo-100"
      }`}
      title="Drag to resize panel height"
    >
      <div className="w-12 h-1 rounded-full bg-zinc-600 group-hover:bg-indigo-400 transition-colors flex items-center justify-center">
        <GripHorizontal className="w-3 h-3 text-zinc-400 group-hover:text-white" />
      </div>
    </div>
  );
};
