import React, { useEffect, useRef } from "react";
import * as fabric from "fabric";
import { Type, Square, Circle as CircleIcon, Trash2 } from "lucide-react";

interface FabricCanvasOverlayProps {
  width?: number;
  height?: number;
}

export const FabricCanvasOverlay: React.FC<FabricCanvasOverlayProps> = ({
  width = 600,
  height = 400
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fabricCanvasRef = useRef<fabric.Canvas | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = new fabric.Canvas(canvasRef.current, {
      width,
      height,
      backgroundColor: "#18181b"
    });

    fabricCanvasRef.current = canvas;

    return () => {
      canvas.dispose();
    };
  }, [width, height]);

  const addRectangle = () => {
    if (!fabricCanvasRef.current) return;
    const rect = new fabric.Rect({
      left: 100,
      top: 100,
      fill: "rgba(99, 102, 241, 0.5)",
      width: 100,
      height: 80,
      stroke: "#6366f1",
      strokeWidth: 2
    });
    fabricCanvasRef.current.add(rect);
    fabricCanvasRef.current.setActiveObject(rect);
  };

  const addCircle = () => {
    if (!fabricCanvasRef.current) return;
    const circle = new fabric.Circle({
      left: 150,
      top: 150,
      fill: "rgba(6, 182, 212, 0.5)",
      radius: 45,
      stroke: "#06b6d4",
      strokeWidth: 2
    });
    fabricCanvasRef.current.add(circle);
    fabricCanvasRef.current.setActiveObject(circle);
  };

  const addText = () => {
    if (!fabricCanvasRef.current) return;
    const text = new fabric.Textbox("Sample Text", {
      left: 120,
      top: 120,
      fontSize: 22,
      fill: "#f4f4f5",
      fontFamily: "sans-serif"
    });
    fabricCanvasRef.current.add(text);
    fabricCanvasRef.current.setActiveObject(text);
  };

  const deleteSelected = () => {
    if (!fabricCanvasRef.current) return;
    const activeObjects = fabricCanvasRef.current.getActiveObjects();
    activeObjects.forEach((obj) => fabricCanvasRef.current?.remove(obj));
    fabricCanvasRef.current.discardActiveObject();
    fabricCanvasRef.current.requestRenderAll();
  };

  return (
    <div className="flex flex-col gap-3 p-4 rounded-2xl border border-zinc-800 bg-zinc-900/90 shadow-lg">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={addRectangle}
          className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
        >
          <Square className="w-3.5 h-3.5 text-indigo-400" />
          <span>Add Rect</span>
        </button>
        <button
          type="button"
          onClick={addCircle}
          className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
        >
          <CircleIcon className="w-3.5 h-3.5 text-cyan-400" />
          <span>Add Circle</span>
        </button>
        <button
          type="button"
          onClick={addText}
          className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
        >
          <Type className="w-3.5 h-3.5 text-emerald-400" />
          <span>Add Text</span>
        </button>
        <button
          type="button"
          onClick={deleteSelected}
          className="px-3 py-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 text-xs font-semibold flex items-center gap-1.5 border border-rose-500/30 cursor-pointer ml-auto"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Delete</span>
        </button>
      </div>

      <div className="overflow-hidden rounded-xl border border-zinc-800 bg-[#18181b] flex items-center justify-center">
        <canvas ref={canvasRef} />
      </div>
    </div>
  );
};
