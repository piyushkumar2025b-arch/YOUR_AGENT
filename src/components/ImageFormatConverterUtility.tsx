import React, { useState, useRef } from "react";
import { 
  ImageIcon, Download, RefreshCw, Upload, Sparkles, Check, Sliders
} from "lucide-react";

interface ImageFormatConverterUtilityProps {
  theme?: "light" | "dark";
}

export const ImageFormatConverterUtility: React.FC<ImageFormatConverterUtilityProps> = ({
  theme = "dark"
}) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageName, setImageName] = useState<string>("converted_image");
  const [targetFormat, setTargetFormat] = useState<"png" | "jpeg" | "webp" | "ico">("webp");
  const [quality, setQuality] = useState<number>(0.9);
  const [scaleWidth, setScaleWidth] = useState<number>(1920);
  const [scaleHeight, setScaleHeight] = useState<number>(1080);
  const [maintainAspect, setMaintainAspect] = useState<boolean>(true);
  const [originalAspect, setOriginalAspect] = useState<number>(16 / 9);

  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const nameWithoutExt = file.name.replace(/\.[^/.]+$/, "");
    setImageName(nameWithoutExt);

    const reader = new FileReader();
    reader.onload = (event) => {
      const src = event.target?.result as string;
      setSelectedImage(src);

      const img = new Image();
      img.onload = () => {
        setScaleWidth(img.width);
        setScaleHeight(img.height);
        if (img.height > 0) {
          setOriginalAspect(img.width / img.height);
        }
      };
      img.src = src;
    };
    reader.readAsDataURL(file);
  };

  const handleWidthChange = (w: number) => {
    setScaleWidth(w);
    if (maintainAspect && originalAspect > 0) {
      setScaleHeight(Math.round(w / originalAspect));
    }
  };

  const handleHeightChange = (h: number) => {
    setScaleHeight(h);
    if (maintainAspect && originalAspect > 0) {
      setScaleWidth(Math.round(h * originalAspect));
    }
  };

  const handleConvertAndDownload = () => {
    if (!selectedImage) return;

    setIsProcessing(true);
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = scaleWidth || img.width;
      canvas.height = scaleHeight || img.height;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        setIsProcessing(false);
        return;
      }

      // Fill white background for JPEG if transparent
      if (targetFormat === "jpeg") {
        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      const mimeType = targetFormat === "ico" ? "image/x-icon" : `image/${targetFormat}`;
      const dataUrl = canvas.toDataURL(mimeType, quality);

      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = `${imageName}_converted.${targetFormat}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      setIsProcessing(false);
    };
    img.src = selectedImage;
  };

  return (
    <div className={`p-4 rounded-2xl border space-y-4 ${
      theme === "dark" ? "bg-zinc-900 border-zinc-800" : "bg-white border-slate-200"
    }`}>
      <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-purple-400 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4" /> Client-Side Image Converter & Resizer
          </h3>
          <p className="text-xs text-slate-400">
            Convert PNG, JPG, WEBP, or SVG images instantly without uploading to any server!
          </p>
        </div>

        <label className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-2 cursor-pointer transition-all shadow-md">
          <Upload className="w-4 h-4" /> Choose Image File
          <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
        </label>
      </div>

      {!selectedImage ? (
        <div className="h-40 border-2 border-dashed border-zinc-800 rounded-2xl flex flex-col items-center justify-center p-4 text-center text-slate-500 space-y-2">
          <ImageIcon className="w-8 h-8 text-purple-400" />
          <p className="text-xs font-medium">No image loaded. Click "Choose Image File" above to start converting!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Image Preview */}
          <div className="rounded-xl overflow-hidden bg-black/60 border border-zinc-800 p-2 flex flex-col items-center justify-center max-h-64">
            <img src={selectedImage} alt="Selected" className="max-h-52 object-contain" />
            <span className="text-[10px] text-slate-400 font-mono mt-1">
              {scaleWidth} x {scaleHeight} px
            </span>
          </div>

          {/* Conversion Controls */}
          <div className="space-y-3 text-xs">
            <div>
              <label className="block text-[11px] font-bold text-slate-300 mb-1">Target Format:</label>
              <div className="grid grid-cols-4 gap-1.5">
                {(["webp", "png", "jpeg", "ico"] as const).map((fmt) => (
                  <button
                    key={fmt}
                    type="button"
                    onClick={() => setTargetFormat(fmt)}
                    className={`py-1.5 rounded-lg text-xs font-bold uppercase border transition-all cursor-pointer ${
                      targetFormat === fmt
                        ? "bg-purple-600 text-white border-purple-500"
                        : "bg-zinc-950 border-zinc-800 text-slate-400 hover:text-white"
                    }`}
                  >
                    {fmt}
                  </button>
                ))}
              </div>
            </div>

            {/* Quality Slider */}
            {targetFormat !== "png" && (
              <div>
                <div className="flex justify-between text-[11px] text-slate-300 mb-1">
                  <span>Compression Quality:</span>
                  <span className="font-mono text-purple-400">{Math.round(quality * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="1.0"
                  step="0.05"
                  value={quality}
                  onChange={(e) => setQuality(parseFloat(e.target.value))}
                  className="w-full accent-purple-500 cursor-pointer"
                />
              </div>
            )}

            {/* Resolution Scaling */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] text-slate-400 mb-0.5">Width (px):</label>
                <input
                  type="number"
                  value={scaleWidth}
                  onChange={(e) => handleWidthChange(parseInt(e.target.value) || 100)}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-zinc-950 border border-zinc-800 text-white text-xs font-mono"
                />
              </div>
              <div>
                <label className="block text-[10px] text-slate-400 mb-0.5">Height (px):</label>
                <input
                  type="number"
                  value={scaleHeight}
                  onChange={(e) => handleHeightChange(parseInt(e.target.value) || 100)}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-zinc-950 border border-zinc-800 text-white text-xs font-mono"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <label className="flex items-center gap-1.5 text-[11px] text-slate-400 cursor-pointer">
                <input
                  type="checkbox"
                  checked={maintainAspect}
                  onChange={(e) => setMaintainAspect(e.target.checked)}
                  className="accent-purple-500"
                />
                Maintain Aspect Ratio
              </label>

              <button
                onClick={handleConvertAndDownload}
                disabled={isProcessing}
                className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-lg transition-all disabled:opacity-50"
              >
                {isProcessing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                Convert & Download
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
