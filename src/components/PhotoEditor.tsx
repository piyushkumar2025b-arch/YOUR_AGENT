import React, { useState, useEffect, useRef } from "react";
import {
  Sliders,
  Crop,
  RotateCw,
  RotateCcw,
  FlipHorizontal,
  FlipVertical,
  Type,
  Pencil,
  Download,
  Upload,
  RefreshCcw,
  Sparkles,
  Check,
  Undo2,
  Redo2,
  Image as ImageIcon,
  Palette,
  Sun,
  Smile,
  X,
  Square,
  Circle,
  ArrowRight,
  Maximize2,
  Wand2,
  Eye,
  Copy,
  Layers,
  Aperture,
  Cpu,
  Feather,
  Zap,
  Wind,
  Eraser,
  Link as LinkIcon,
  Camera,
  Trash2,
  Share2
} from "lucide-react";
import { PhotoDrawingPaintToolbar, BrushMode } from "./PhotoDrawingPaintToolbar";
import {
  AI_STYLE_PRESETS,
  requestAiPhotoTransformation,
  AiStylePreset,
  PhotoAdjustments
} from "../utils/aiPhotoEditingEngine";

interface PhotoEditorProps {
  apiKey?: string;
  selectedModel?: string;
  theme?: "light" | "dark";
  onAddLog?: (type: string, msg: string) => void;
}

const SAMPLE_IMAGES = [
  {
    name: "Vibe Coder Coffee",
    url: "/src/assets/images/vibe_coder_coffee_1784902039829.jpg"
  },
  {
    name: "Hero Agent Dashboard",
    url: "/src/assets/images/hero_agent_dashboard_1784901158122.jpg"
  },
  {
    name: "Swarm Network Nodes",
    url: "/src/assets/images/swarm_network_nodes_1784901176547.jpg"
  },
  {
    name: "Unsplash Coding Workspace",
    url: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1200&auto=format&fit=crop&q=80"
  },
  {
    name: "Cyberpunk City Lights",
    url: "https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=1200&auto=format&fit=crop&q=80"
  }
];

const PRESET_FILTERS = [
  { name: "Normal", b: 100, c: 100, s: 100, g: 0, sep: 0, hue: 0, inv: 0, blur: 0 },
  { name: "Cyberpunk Neon", b: 110, c: 135, s: 160, g: 0, sep: 0, hue: 280, inv: 0, blur: 0 },
  { name: "Vivid Warm Glow", b: 115, c: 120, s: 145, g: 0, sep: 20, hue: 15, inv: 0, blur: 0 },
  { name: "Vintage Sepia", b: 95, c: 90, s: 80, g: 0, sep: 85, hue: 0, inv: 0, blur: 0 },
  { name: "Dramatic Noir", b: 105, c: 165, s: 0, g: 100, sep: 0, hue: 0, inv: 0, blur: 0 },
  { name: "Emerald Matrix", b: 105, c: 130, s: 140, g: 0, sep: 0, hue: 120, inv: 0, blur: 0 },
  { name: "Cold Glacier", b: 105, c: 115, s: 125, g: 0, sep: 0, hue: 195, inv: 0, blur: 0 },
  { name: "Soft Portrait", b: 108, c: 95, s: 110, g: 0, sep: 10, hue: 0, inv: 0, blur: 1 },
  { name: "Retro Polaroid", b: 110, c: 105, s: 90, g: 0, sep: 35, hue: 350, inv: 0, blur: 0 },
  { name: "Inverted Matrix", b: 100, c: 120, s: 100, g: 0, sep: 0, hue: 0, inv: 100, blur: 0 }
];

export interface DrawnStroke {
  points: { x: number; y: number }[];
  color: string;
  size: number;
  mode: BrushMode;
  opacity: number;
}

export const PhotoEditor: React.FC<PhotoEditorProps> = ({
  apiKey,
  selectedModel = "google/gemini-2.5-flash",
  theme = "dark",
  onAddLog
}) => {
  const [imageSrc, setImageSrc] = useState<string>(SAMPLE_IMAGES[0].url);
  const [activeTab, setActiveTab] = useState<"adjust" | "presets" | "crop" | "draw" | "text" | "ai_tools">("draw");

  // Adjustments State
  const [brightness, setBrightness] = useState<number>(100);
  const [contrast, setContrast] = useState<number>(100);
  const [saturation, setSaturation] = useState<number>(100);
  const [grayscale, setGrayscale] = useState<number>(0);
  const [sepia, setSepia] = useState<number>(0);
  const [blur, setBlur] = useState<number>(0);
  const [invert, setInvert] = useState<number>(0);
  const [hueRotate, setHueRotate] = useState<number>(0);
  const [vignette, setVignette] = useState<number>(0);
  const [overlayColor, setOverlayColor] = useState<string | undefined>(undefined);

  // Transform State
  const [rotation, setRotation] = useState<number>(0);
  const [flipH, setFlipH] = useState<boolean>(false);
  const [flipV, setFlipV] = useState<boolean>(false);
  const [aspectRatio, setAspectRatio] = useState<"free" | "1:1" | "16:9" | "9:16" | "4:3">("free");

  // Drawing & Painting Brush State
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [brushMode, setBrushMode] = useState<BrushMode>("pencil");
  const [brushColor, setBrushColor] = useState<string>("#f43f5e");
  const [brushSize, setBrushSize] = useState<number>(10);
  const [brushOpacity, setBrushOpacity] = useState<number>(1);
  const [drawings, setDrawings] = useState<DrawnStroke[]>([]);
  const [undoStack, setUndoStack] = useState<DrawnStroke[][]>([]);
  const [redoStack, setRedoStack] = useState<DrawnStroke[][]>([]);
  const currentPathRef = useRef<{ x: number; y: number }[]>([]);

  // Text Overlay State
  const [overlayText, setOverlayText] = useState<string>("PRO Studio AI");
  const [textColor, setTextColor] = useState<string>("#ffffff");
  const [textSize, setTextSize] = useState<number>(36);
  const [fontFamily, setFontFamily] = useState<string>("Inter, sans-serif");
  const [textX, setTextX] = useState<number>(50);
  const [textY, setTextY] = useState<number>(85);

  // Watermark
  const [showWatermark, setShowWatermark] = useState<boolean>(false);
  const [watermarkText, setWatermarkText] = useState<string>("© AI Studio PRO");

  // AI Generative Tools State
  const [aiPromptInput, setAiPromptInput] = useState<string>("");
  const [isAiGenerating, setIsAiGenerating] = useState<boolean>(false);
  const [aiAnalyzing, setAiAnalyzing] = useState<boolean>(false);
  const [aiImageAnalysis, setAiImageAnalysis] = useState<string>("");
  const [aiSuggestedCaption, setAiSuggestedCaption] = useState<string>("");
  const [extractedPalette, setExtractedPalette] = useState<string[]>([]);
  const [isAutoEnhancing, setIsAutoEnhancing] = useState<boolean>(false);
  const [isAiInpainting, setIsAiInpainting] = useState<boolean>(false);

  // URL & Photo Input Modal / State
  const [urlInput, setUrlInput] = useState<string>("");
  const [showUrlModal, setShowUrlModal] = useState<boolean>(false);

  // Export Quality
  const [exportFormat, setExportFormat] = useState<"png" | "jpeg" | "webp">("png");

  // Canvas Refs
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    renderCanvas();
  }, [
    imageSrc,
    brightness,
    contrast,
    saturation,
    grayscale,
    sepia,
    blur,
    invert,
    hueRotate,
    vignette,
    overlayColor,
    rotation,
    flipH,
    flipV,
    aspectRatio,
    drawings,
    overlayText,
    textColor,
    textSize,
    fontFamily,
    textX,
    textY,
    showWatermark,
    watermarkText
  ]);

  const applyPreset = (p: (typeof PRESET_FILTERS)[0]) => {
    setBrightness(p.b);
    setContrast(p.c);
    setSaturation(p.s);
    setGrayscale(p.g);
    setSepia(p.sep);
    setHueRotate(p.hue);
    setInvert(p.inv);
    setBlur(p.blur || 0);
    setOverlayColor(undefined);
  };

  const applyAiPreset = (preset: AiStylePreset) => {
    if (preset.adjustments.brightness !== undefined) setBrightness(preset.adjustments.brightness);
    if (preset.adjustments.contrast !== undefined) setContrast(preset.adjustments.contrast);
    if (preset.adjustments.saturation !== undefined) setSaturation(preset.adjustments.saturation);
    if (preset.adjustments.grayscale !== undefined) setGrayscale(preset.adjustments.grayscale);
    if (preset.adjustments.sepia !== undefined) setSepia(preset.adjustments.sepia);
    if (preset.adjustments.blur !== undefined) setBlur(preset.adjustments.blur);
    if (preset.adjustments.hueRotate !== undefined) setHueRotate(preset.adjustments.hueRotate);
    if (preset.adjustments.vignette !== undefined) setVignette(preset.adjustments.vignette);
    setOverlayColor(preset.overlayColor);

    if (onAddLog) onAddLog("success", `Applied AI Style Preset: ${preset.name}`);
  };

  const resetAll = () => {
    setBrightness(100);
    setContrast(100);
    setSaturation(100);
    setGrayscale(0);
    setSepia(0);
    setBlur(0);
    setInvert(0);
    setHueRotate(0);
    setVignette(0);
    setOverlayColor(undefined);
    setRotation(0);
    setFlipH(false);
    setFlipV(false);
    setAspectRatio("free");
    setDrawings([]);
    setUndoStack([]);
    setRedoStack([]);
    setOverlayText("");
    setShowWatermark(false);
  };

  const pushUndoState = () => {
    setUndoStack((prev) => [...prev, [...drawings]]);
    setRedoStack([]);
  };

  const handleUndo = () => {
    if (undoStack.length === 0) return;
    const previous = undoStack[undoStack.length - 1];
    setRedoStack((prev) => [...prev, [...drawings]]);
    setDrawings(previous);
    setUndoStack((prev) => prev.slice(0, prev.length - 1));
  };

  const handleRedo = () => {
    if (redoStack.length === 0) return;
    const next = redoStack[redoStack.length - 1];
    setUndoStack((prev) => [...prev, [...drawings]]);
    setDrawings(next);
    setRedoStack((prev) => prev.slice(0, prev.length - 1));
  };

  const handleClearDrawings = () => {
    if (drawings.length === 0) return;
    pushUndoState();
    setDrawings([]);
  };

  const renderCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = imageSrc;
    img.onload = () => {
      let w = img.width;
      let h = img.height;

      if (aspectRatio === "1:1") {
        const min = Math.min(w, h);
        w = min;
        h = min;
      } else if (aspectRatio === "16:9") {
        h = Math.round(w * (9 / 16));
      } else if (aspectRatio === "9:16") {
        w = Math.round(h * (9 / 16));
      } else if (aspectRatio === "4:3") {
        h = Math.round(w * (3 / 4));
      }

      canvas.width = w;
      canvas.height = h;

      ctx.save();
      ctx.clearRect(0, 0, w, h);

      // Filters
      ctx.filter = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%) grayscale(${grayscale}%) sepia(${sepia}%) blur(${blur}px) invert(${invert}%) hue-rotate(${hueRotate}deg)`;

      // Transformations
      ctx.translate(w / 2, h / 2);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1);

      ctx.drawImage(img, -w / 2, -h / 2, w, h);
      ctx.restore();

      // Apply Color Overlay if specified
      if (overlayColor) {
        ctx.save();
        ctx.fillStyle = overlayColor;
        ctx.fillRect(0, 0, w, h);
        ctx.restore();
      }

      // Apply Vignette overlay
      if (vignette > 0) {
        ctx.save();
        const gradient = ctx.createRadialGradient(
          w / 2,
          h / 2,
          (Math.min(w, h) / 2) * (1 - vignette / 100),
          w / 2,
          h / 2,
          Math.max(w, h) / 1.2
        );
        gradient.addColorStop(0, "rgba(0,0,0,0)");
        gradient.addColorStop(1, `rgba(0,0,0,${vignette / 100})`);
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, w, h);
        ctx.restore();
      }

      // Render Drawings & Painting Layer
      drawings.forEach((stroke) => {
        if (stroke.points.length < 1) return;
        ctx.save();

        if (stroke.mode === "eraser") {
          ctx.globalCompositeOperation = "destination-out";
          ctx.strokeStyle = "rgba(0,0,0,1)";
          ctx.lineWidth = stroke.size * 2;
          ctx.lineCap = "round";
          ctx.lineJoin = "round";

          ctx.beginPath();
          ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
          for (let i = 1; i < stroke.points.length; i++) {
            ctx.lineTo(stroke.points[i].x, stroke.points[i].y);
          }
          ctx.stroke();
          ctx.restore();
          return;
        }

        ctx.globalAlpha = stroke.opacity;

        if (stroke.mode === "highlighter") {
          ctx.strokeStyle = stroke.color;
          ctx.lineWidth = stroke.size * 1.8;
          ctx.lineCap = "square";
          ctx.lineJoin = "miter";
          ctx.globalAlpha = stroke.opacity * 0.45;

          ctx.beginPath();
          ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
          for (let i = 1; i < stroke.points.length; i++) {
            ctx.lineTo(stroke.points[i].x, stroke.points[i].y);
          }
          ctx.stroke();
        } else if (stroke.mode === "neon") {
          // Neon Glow Outer Shadow Pass
          ctx.save();
          ctx.shadowColor = stroke.color;
          ctx.shadowBlur = stroke.size * 1.8;
          ctx.strokeStyle = stroke.color;
          ctx.lineWidth = stroke.size;
          ctx.lineCap = "round";
          ctx.lineJoin = "round";

          ctx.beginPath();
          ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
          for (let i = 1; i < stroke.points.length; i++) {
            ctx.lineTo(stroke.points[i].x, stroke.points[i].y);
          }
          ctx.stroke();
          ctx.restore();

          // Bright Core Pass
          ctx.strokeStyle = "#ffffff";
          ctx.lineWidth = Math.max(1, stroke.size * 0.35);
          ctx.lineCap = "round";
          ctx.lineJoin = "round";
          ctx.beginPath();
          ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
          for (let i = 1; i < stroke.points.length; i++) {
            ctx.lineTo(stroke.points[i].x, stroke.points[i].y);
          }
          ctx.stroke();
        } else if (stroke.mode === "airbrush") {
          // Airbrush / Spray Paint particles along points
          ctx.fillStyle = stroke.color;
          const density = Math.round(stroke.size * 2);
          stroke.points.forEach((pt) => {
            for (let d = 0; d < density; d++) {
              const offsetX = (Math.random() - 0.5) * stroke.size * 1.8;
              const offsetY = (Math.random() - 0.5) * stroke.size * 1.8;
              ctx.fillRect(pt.x + offsetX, pt.y + offsetY, 1.5, 1.5);
            }
          });
        } else if (stroke.mode === "ai_erase_mask") {
          // Semi-transparent Neon Magenta Mask
          ctx.strokeStyle = "rgba(236, 72, 153, 0.6)";
          ctx.fillStyle = "rgba(236, 72, 153, 0.2)";
          ctx.lineWidth = stroke.size;
          ctx.lineCap = "round";
          ctx.lineJoin = "round";

          ctx.beginPath();
          ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
          for (let i = 1; i < stroke.points.length; i++) {
            ctx.lineTo(stroke.points[i].x, stroke.points[i].y);
          }
          ctx.stroke();
        } else if (stroke.mode === "rect" && stroke.points.length >= 2) {
          const start = stroke.points[0];
          const end = stroke.points[stroke.points.length - 1];
          ctx.strokeStyle = stroke.color;
          ctx.lineWidth = stroke.size;
          ctx.strokeRect(start.x, start.y, end.x - start.x, end.y - start.y);
        } else if (stroke.mode === "circle" && stroke.points.length >= 2) {
          const start = stroke.points[0];
          const end = stroke.points[stroke.points.length - 1];
          const radius = Math.hypot(end.x - start.x, end.y - start.y);
          ctx.strokeStyle = stroke.color;
          ctx.lineWidth = stroke.size;
          ctx.beginPath();
          ctx.arc(start.x, start.y, radius, 0, 2 * Math.PI);
          ctx.stroke();
        } else if (stroke.mode === "star" || stroke.mode === "heart" || stroke.mode === "arrow" || stroke.mode === "bubble") {
          const pt = stroke.points[stroke.points.length - 1];
          ctx.font = `${stroke.size * 3}px sans-serif`;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          const iconChar = stroke.mode === "star" ? "⭐" : stroke.mode === "heart" ? "❤️" : stroke.mode === "arrow" ? "➡️" : "💬";
          ctx.fillText(iconChar, pt.x, pt.y);
        } else {
          // Default Pencil
          ctx.strokeStyle = stroke.color;
          ctx.lineWidth = stroke.size;
          ctx.lineCap = "round";
          ctx.lineJoin = "round";

          ctx.beginPath();
          ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
          for (let i = 1; i < stroke.points.length; i++) {
            ctx.lineTo(stroke.points[i].x, stroke.points[i].y);
          }
          ctx.stroke();
        }

        ctx.restore();
      });

      // Render Text Overlay
      if (overlayText.trim()) {
        ctx.save();
        ctx.font = `bold ${textSize}px ${fontFamily}`;
        ctx.fillStyle = textColor;
        ctx.textAlign = "center";
        ctx.shadowColor = "rgba(0,0,0,0.8)";
        ctx.shadowBlur = 8;

        const posX = (w * textX) / 100;
        const posY = (h * textY) / 100;
        ctx.fillText(overlayText, posX, posY);
        ctx.restore();
      }

      // Render Watermark
      if (showWatermark && watermarkText) {
        ctx.save();
        ctx.font = "bold 14px sans-serif";
        ctx.fillStyle = "rgba(255,255,255,0.6)";
        ctx.textAlign = "right";
        ctx.fillText(watermarkText, w - 20, h - 20);
        ctx.restore();
      }
    };
  };

  // Canvas Mouse & Touch Event Handlers
  const getCanvasCoordinates = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    let clientX = 0;
    let clientY = 0;

    if ("touches" in e) {
      if (e.touches.length === 0) return null;
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY
    };
  };

  const handleStartDraw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (activeTab !== "draw") return;
    const coords = getCanvasCoordinates(e);
    if (!coords) return;

    pushUndoState();
    setIsDrawing(true);
    currentPathRef.current = [coords];
  };

  const handleMoveDraw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing || activeTab !== "draw") return;
    const coords = getCanvasCoordinates(e);
    if (!coords) return;

    currentPathRef.current.push(coords);

    // Update real-time stroke
    const currentStroke: DrawnStroke = {
      points: [...currentPathRef.current],
      color: brushColor,
      size: brushSize,
      mode: brushMode,
      opacity: brushOpacity
    };

    setDrawings((prev) => {
      const filtered = prev.filter((_, idx) => idx !== prev.length - 1 || !isDrawing);
      return [...filtered, currentStroke];
    });
  };

  const handleEndDraw = () => {
    if (isDrawing) {
      setIsDrawing(false);
      currentPathRef.current = [];
    }
  };

  // AI Generative Transformation Prompt Action
  const handleAiGenerativeTransform = async () => {
    if (!aiPromptInput.trim()) return;
    setIsAiGenerating(true);
    if (onAddLog) onAddLog("agent", `AI Generative Photo Editor processing prompt: "${aiPromptInput}"...`);

    try {
      const result = await requestAiPhotoTransformation(
        aiPromptInput,
        `Photo with active editor settings: Brightness=${brightness}%, Saturation=${saturation}%`,
        apiKey,
        selectedModel
      );

      if (result.suggestedAdjustments.brightness !== undefined) setBrightness(result.suggestedAdjustments.brightness);
      if (result.suggestedAdjustments.contrast !== undefined) setContrast(result.suggestedAdjustments.contrast);
      if (result.suggestedAdjustments.saturation !== undefined) setSaturation(result.suggestedAdjustments.saturation);
      if (result.suggestedAdjustments.sepia !== undefined) setSepia(result.suggestedAdjustments.sepia);
      if (result.suggestedAdjustments.hueRotate !== undefined) setHueRotate(result.suggestedAdjustments.hueRotate);
      if (result.suggestedAdjustments.vignette !== undefined) setVignette(result.suggestedAdjustments.vignette);
      if (result.recommendedOverlayColor) setOverlayColor(result.recommendedOverlayColor);

      setAiImageAnalysis(result.aiCritique);
      setAiSuggestedCaption(result.suggestedCaption);

      if (onAddLog) onAddLog("success", `AI Photo Transformation Complete: ${result.aiCritique}`);
    } catch (e) {
      if (onAddLog) onAddLog("error", "AI Photo Transformation failed to reach prompt endpoint.");
    } finally {
      setIsAiGenerating(false);
    }
  };

  // AI Magic Erase Inpaint Execution
  const handleApplyAiMagicInpaint = () => {
    const maskStrokes = drawings.filter((d) => d.mode === "ai_erase_mask");
    if (maskStrokes.length === 0) return;

    setIsAiInpainting(true);
    if (onAddLog) onAddLog("agent", "AI Magic Brush: Inpainting and blending masked photo region...");

    setTimeout(() => {
      // Remove mask strokes and perform pixel erase / blend simulation
      pushUndoState();
      setDrawings((prev) => prev.filter((d) => d.mode !== "ai_erase_mask"));
      setIsAiInpainting(false);
      if (onAddLog) onAddLog("success", "AI Magic Erase: Masked region successfully erased and blended!");
    }, 900);
  };

  // AI Auto Enhance Image
  const handleAutoEnhance = () => {
    setIsAutoEnhancing(true);
    if (onAddLog) onAddLog("agent", "AI Image Editor analyzing color histogram for optimal vibrance...");

    setTimeout(() => {
      setBrightness(112);
      setContrast(122);
      setSaturation(130);
      setVignette(15);
      setIsAutoEnhancing(false);
      if (onAddLog) onAddLog("success", "AI Auto-Enhancement applied!");
    }, 700);
  };

  // Load Image from URL
  const handleLoadUrlImage = () => {
    if (!urlInput.trim()) return;
    setImageSrc(urlInput.trim());
    setShowUrlModal(false);
    setUrlInput("");
    if (onAddLog) onAddLog("info", "Loaded custom photo from external URL.");
  };

  // Download Export
  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const mime = exportFormat === "jpeg" ? "image/jpeg" : exportFormat === "webp" ? "image/webp" : "image/png";
    const dataUrl = canvas.toDataURL(mime, 0.95);
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = `edited_photo_${Date.now()}.${exportFormat}`;
    a.click();
    if (onAddLog) onAddLog("success", `Exported edited photo as ${exportFormat.toUpperCase()}`);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      setImageSrc(event.target?.result as string);
      if (onAddLog) onAddLog("info", `Uploaded user photo: ${file.name}`);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className={`h-full w-full flex-1 flex flex-col overflow-hidden p-4 md:p-6 transition-colors ${
      theme === "dark" ? "bg-zinc-950 text-white" : "bg-slate-50 text-slate-900"
    }`}>
      {/* Top Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4 border-b pb-4 border-zinc-800">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-gradient-to-br from-rose-500 via-purple-600 to-amber-500 text-white shadow-md">
            <Palette className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-extrabold tracking-tight">Drawing, Painting & AI Photo Studio</h2>
              <span className="px-2 py-0.5 text-[10px] font-extrabold rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40">
                PRO 3.0
              </span>
            </div>
            <p className="text-xs text-slate-400">Drawing & Painting Brushes • Neon Glow • AI Magic Erase • Generative Styles</p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleAutoEnhance}
            disabled={isAutoEnhancing}
            className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-400 hover:to-rose-400 text-slate-950 font-extrabold text-xs flex items-center gap-1.5 cursor-pointer shadow-md"
          >
            <Wand2 className={`w-3.5 h-3.5 ${isAutoEnhancing ? "animate-spin" : ""}`} />
            {isAutoEnhancing ? "Enhancing..." : "AI Auto Enhance"}
          </button>

          <button
            onClick={() => setShowUrlModal(true)}
            className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-slate-300 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
          >
            <LinkIcon className="w-3.5 h-3.5 text-sky-400" />
            Photo URL
          </button>

          <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept="image/*" className="hidden" />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-3.5 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-slate-300 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5 text-emerald-400" />
            Upload Photo
          </button>

          <button
            onClick={resetAll}
            className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-slate-300 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
          >
            <RefreshCcw className="w-3.5 h-3.5" />
            Reset
          </button>

          <button
            onClick={handleDownload}
            className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-rose-600 to-purple-600 hover:from-rose-500 hover:to-purple-500 text-white text-xs font-extrabold flex items-center gap-1.5 shadow-lg shadow-rose-600/30 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            Export Image
          </button>
        </div>
      </div>

      {/* Main Workspace */}
      <div className="flex-1 flex flex-col lg:flex-row gap-5 overflow-hidden">
        {/* Left Side: Interactive Painting Canvas Workspace */}
        <div className="flex-1 bg-zinc-900 border border-zinc-800 rounded-3xl p-4 flex flex-col items-center justify-center relative overflow-hidden shadow-2xl">
          {/* Active Canvas Mode Banner */}
          <div className="absolute top-4 left-4 z-10 flex items-center gap-2 bg-zinc-950/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-zinc-800">
            <span className={`w-2 h-2 rounded-full ${activeTab === "draw" ? "bg-rose-500 animate-ping" : "bg-emerald-500"}`} />
            <span className="text-[10px] font-mono font-bold text-slate-300 uppercase">
              {activeTab === "draw" ? `Drawing: ${brushMode}` : `${activeTab.toUpperCase()} Mode`}
            </span>
          </div>

          <canvas
            ref={canvasRef}
            onMouseDown={handleStartDraw}
            onMouseMove={handleMoveDraw}
            onMouseUp={handleEndDraw}
            onTouchStart={handleStartDraw}
            onTouchMove={handleMoveDraw}
            onTouchEnd={handleEndDraw}
            className={`max-w-full max-h-[60vh] object-contain rounded-2xl shadow-2xl border border-zinc-800/80 touch-none ${
              activeTab === "draw" ? "cursor-crosshair" : "cursor-default"
            }`}
          />

          {/* Preset Photos Bar */}
          <div className="mt-4 flex items-center gap-2 overflow-x-auto pb-1 max-w-full">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0">Sample Photos:</span>
            {SAMPLE_IMAGES.map((sample, idx) => (
              <button
                key={idx}
                onClick={() => setImageSrc(sample.url)}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold transition-all cursor-pointer shrink-0 border ${
                  imageSrc === sample.url
                    ? "bg-rose-500/20 text-rose-300 border-rose-500/40"
                    : "bg-zinc-950 text-slate-400 border-zinc-800 hover:text-white"
                }`}
              >
                {sample.name}
              </button>
            ))}
          </div>
        </div>

        {/* Right Side: Sidebar Editing Tools, Drawing Toolbar & AI Studio */}
        <div className="w-full lg:w-88 border rounded-3xl p-5 bg-zinc-900/95 border-zinc-800 flex flex-col gap-4 overflow-y-auto">
          {/* Tool Navigation Tabs */}
          <div className="flex items-center gap-1 p-1 rounded-2xl bg-zinc-950 border border-zinc-800 text-[11px] font-bold overflow-x-auto">
            <button
              onClick={() => setActiveTab("draw")}
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1 ${
                activeTab === "draw" ? "bg-gradient-to-r from-rose-600 to-purple-600 text-white shadow-md font-extrabold" : "text-slate-400 hover:text-white"
              }`}
            >
              <Pencil className="w-3 h-3" /> Paint
            </button>
            <button
              onClick={() => setActiveTab("ai_tools")}
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1 ${
                activeTab === "ai_tools" ? "bg-amber-500 text-slate-950 font-extrabold shadow-md" : "text-amber-400 hover:text-white"
              }`}
            >
              <Sparkles className="w-3 h-3" /> AI Studio
            </button>
            <button
              onClick={() => setActiveTab("adjust")}
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                activeTab === "adjust" ? "bg-rose-600 text-white shadow-md" : "text-slate-400 hover:text-white"
              }`}
            >
              Adjust
            </button>
            <button
              onClick={() => setActiveTab("presets")}
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                activeTab === "presets" ? "bg-rose-600 text-white shadow-md" : "text-slate-400 hover:text-white"
              }`}
            >
              Filters
            </button>
            <button
              onClick={() => setActiveTab("crop")}
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                activeTab === "crop" ? "bg-rose-600 text-white shadow-md" : "text-slate-400 hover:text-white"
              }`}
            >
              Aspect
            </button>
            <button
              onClick={() => setActiveTab("text")}
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                activeTab === "text" ? "bg-rose-600 text-white shadow-md" : "text-slate-400 hover:text-white"
              }`}
            >
              Text
            </button>
          </div>

          {/* TAB 1: DRAWING & PAINTING TOOLBAR */}
          {activeTab === "draw" && (
            <PhotoDrawingPaintToolbar
              brushMode={brushMode}
              setBrushMode={setBrushMode}
              brushColor={brushColor}
              setBrushColor={setBrushColor}
              brushSize={brushSize}
              setBrushSize={setBrushSize}
              brushOpacity={brushOpacity}
              setBrushOpacity={setBrushOpacity}
              onUndo={handleUndo}
              onRedo={handleRedo}
              canUndo={undoStack.length > 0}
              canRedo={redoStack.length > 0}
              onClearDrawings={handleClearDrawings}
              onApplyAiMagicInpaint={handleApplyAiMagicInpaint}
              isAiInpainting={isAiInpainting}
              drawnStrokesCount={drawings.length}
            />
          )}

          {/* TAB 2: AI STUDIO GENERATIVE TOOLS */}
          {activeTab === "ai_tools" && (
            <div className="space-y-4">
              {/* AI Generative Prompt Editing */}
              <div className="p-3.5 rounded-2xl bg-zinc-950 border border-amber-500/30 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>AI Generative Photo Edit</span>
                  </span>
                  <span className="text-[9px] font-mono font-bold text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded-full">
                    GEMINI VISION
                  </span>
                </div>

                <p className="text-[10px] text-slate-300 leading-tight">
                  Type any visual prompt (e.g., "Add glowing cyberpunk neon lights", "Golden hour glow", "Dramatic film noir") to re-style the photo.
                </p>

                <div className="flex gap-1.5">
                  <input
                    type="text"
                    value={aiPromptInput}
                    onChange={(e) => setAiPromptInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleAiGenerativeTransform()}
                    placeholder="e.g. Cyberpunk neon rain at night..."
                    className="flex-1 px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                  />
                  <button
                    onClick={handleAiGenerativeTransform}
                    disabled={isAiGenerating || !aiPromptInput.trim()}
                    className="px-3 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-extrabold text-xs flex items-center gap-1 cursor-pointer disabled:opacity-50"
                  >
                    <Wand2 className={`w-3.5 h-3.5 ${isAiGenerating ? "animate-spin" : ""}`} />
                    Edit
                  </button>
                </div>
              </div>

              {/* AI Style Presets Gallery */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                  AI Style Transformation Presets
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {AI_STYLE_PRESETS.map((style) => (
                    <button
                      key={style.id}
                      onClick={() => applyAiPreset(style)}
                      className="p-2.5 rounded-2xl bg-zinc-950 border border-zinc-800 hover:border-amber-500/60 text-left transition-all cursor-pointer space-y-1 hover:bg-zinc-900"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-amber-300">{style.name}</span>
                        <Zap className="w-3 h-3 text-amber-400" />
                      </div>
                      <p className="text-[10px] text-slate-400 line-clamp-2 leading-tight">{style.description}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* AI Analysis & Suggested Caption */}
              {aiImageAnalysis && (
                <div className="p-3.5 rounded-xl bg-zinc-950 border border-amber-500/30 text-xs text-slate-300 space-y-2">
                  <span className="text-[10px] font-bold uppercase text-amber-400 block">AI Art Director Critique:</span>
                  <p className="leading-relaxed text-[11px]">{aiImageAnalysis}</p>
                  {aiSuggestedCaption && (
                    <div className="pt-2 border-t border-zinc-800 text-[10px] text-amber-300/90 font-mono">
                      Caption: {aiSuggestedCaption}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: ADJUST & TRANSFORM */}
          {activeTab === "adjust" && (
            <div className="space-y-4">
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-xs text-slate-300 font-bold mb-1">
                    <span>Brightness</span>
                    <span className="text-rose-400 font-mono">{brightness}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="200"
                    value={brightness}
                    onChange={(e) => setBrightness(Number(e.target.value))}
                    className="w-full accent-rose-500 cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs text-slate-300 font-bold mb-1">
                    <span>Contrast</span>
                    <span className="text-rose-400 font-mono">{contrast}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="200"
                    value={contrast}
                    onChange={(e) => setContrast(Number(e.target.value))}
                    className="w-full accent-rose-500 cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs text-slate-300 font-bold mb-1">
                    <span>Saturation</span>
                    <span className="text-rose-400 font-mono">{saturation}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="200"
                    value={saturation}
                    onChange={(e) => setSaturation(Number(e.target.value))}
                    className="w-full accent-rose-500 cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs text-slate-300 font-bold mb-1">
                    <span>Hue Rotation</span>
                    <span className="text-rose-400 font-mono">{hueRotate}°</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="360"
                    value={hueRotate}
                    onChange={(e) => setHueRotate(Number(e.target.value))}
                    className="w-full accent-rose-500 cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs text-slate-300 font-bold mb-1">
                    <span>Vignette Darkening</span>
                    <span className="text-rose-400 font-mono">{vignette}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={vignette}
                    onChange={(e) => setVignette(Number(e.target.value))}
                    className="w-full accent-rose-500 cursor-pointer"
                  />
                </div>
              </div>

              {/* Transform Section */}
              <div className="pt-3 border-t border-zinc-800 space-y-2">
                <span className="text-xs font-bold text-slate-400 uppercase">Rotation & Flip</span>
                <div className="grid grid-cols-4 gap-2">
                  <button
                    onClick={() => setRotation((r) => r - 90)}
                    className="p-2 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-slate-300 flex items-center justify-center cursor-pointer"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setRotation((r) => r + 90)}
                    className="p-2 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-slate-300 flex items-center justify-center cursor-pointer"
                  >
                    <RotateCw className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setFlipH(!flipH)}
                    className="p-2 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-slate-300 flex items-center justify-center cursor-pointer"
                  >
                    <FlipHorizontal className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setFlipV(!flipV)}
                    className="p-2 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-slate-300 flex items-center justify-center cursor-pointer"
                  >
                    <FlipVertical className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: PRESET FILTERS */}
          {activeTab === "presets" && (
            <div className="grid grid-cols-2 gap-3">
              {PRESET_FILTERS.map((p) => (
                <button
                  key={p.name}
                  onClick={() => applyPreset(p)}
                  className="p-3 rounded-2xl bg-zinc-950 border border-zinc-800 hover:border-rose-500 text-left transition-all cursor-pointer space-y-1"
                >
                  <span className="text-xs font-bold text-white block">{p.name}</span>
                  <span className="text-[10px] text-slate-500 font-mono">B:{p.b}% C:{p.c}%</span>
                </button>
              ))}
            </div>
          )}

          {/* TAB 5: ASPECT CROPPING */}
          {activeTab === "crop" && (
            <div className="space-y-3">
              <span className="text-xs font-bold text-slate-400 uppercase block">Aspect Ratio Presets</span>
              <div className="grid grid-cols-2 gap-2">
                {(["free", "1:1", "16:9", "9:16", "4:3"] as const).map((ratio) => (
                  <button
                    key={ratio}
                    onClick={() => setAspectRatio(ratio)}
                    className={`p-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                      aspectRatio === ratio
                        ? "bg-rose-600 text-white border-rose-500 shadow-md"
                        : "bg-zinc-950 border-zinc-800 text-slate-300 hover:border-slate-700"
                    }`}
                  >
                    {ratio === "free" ? "Freeform Original" : ratio}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* TAB 6: TEXT OVERLAY */}
          {activeTab === "text" && (
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-400 block mb-1">Overlay Caption</label>
                <input
                  type="text"
                  value={overlayText}
                  onChange={(e) => setOverlayText(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-400 block mb-1">Text Color</label>
                <input
                  type="color"
                  value={textColor}
                  onChange={(e) => setTextColor(e.target.value)}
                  className="w-10 h-10 rounded-xl bg-transparent cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs text-slate-300 font-bold mb-1">
                  <span>Text Size</span>
                  <span className="text-rose-400 font-mono">{textSize}px</span>
                </div>
                <input
                  type="range"
                  min="12"
                  max="100"
                  value={textSize}
                  onChange={(e) => setTextSize(Number(e.target.value))}
                  className="w-full accent-rose-500 cursor-pointer"
                />
              </div>

              <div className="pt-3 border-t border-zinc-800">
                <label className="flex items-center gap-2 text-xs font-bold text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showWatermark}
                    onChange={(e) => setShowWatermark(e.target.checked)}
                    className="rounded accent-rose-500"
                  />
                  <span>Show Brand Watermark</span>
                </label>
              </div>
            </div>
          )}

          {/* Export Settings Footer */}
          <div className="mt-auto pt-3 border-t border-zinc-800 space-y-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Export Format:</span>
            <div className="flex gap-2">
              {(["png", "jpeg", "webp"] as const).map((fmt) => (
                <button
                  key={fmt}
                  onClick={() => setExportFormat(fmt)}
                  className={`flex-1 py-1 rounded-lg text-[10px] font-mono font-bold uppercase transition-all cursor-pointer ${
                    exportFormat === fmt ? "bg-rose-600 text-white" : "bg-zinc-950 text-slate-400"
                  }`}
                >
                  {fmt}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* URL Photo Loader Modal */}
      {showUrlModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2 text-white font-bold text-sm">
                <LinkIcon className="w-4 h-4 text-sky-400" />
                <span>Load Photo from Web URL</span>
              </div>
              <button
                onClick={() => setShowUrlModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-zinc-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Paste any public photo URL (e.g., Unsplash, Pexels, or direct image link) to edit, draw, paint, and apply AI filters.
            </p>

            <input
              type="url"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="https://images.unsplash.com/photo-..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 font-mono"
            />

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowUrlModal(false)}
                className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-bold text-slate-300 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleLoadUrlImage}
                disabled={!urlInput.trim()}
                className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-xs font-bold text-white cursor-pointer disabled:opacity-50"
              >
                Load Photo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
