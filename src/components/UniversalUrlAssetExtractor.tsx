import React, { useState } from "react";
import { 
  Link as LinkIcon, Download, FileText, CheckCircle2, 
  AlertCircle, RefreshCw, Copy, Check, ExternalLink, Play, Film, Music, Image as ImageIcon
} from "lucide-react";

interface UniversalUrlAssetExtractorProps {
  theme?: "light" | "dark";
  onAddStatus?: (msg: string) => void;
}

export const UniversalUrlAssetExtractor: React.FC<UniversalUrlAssetExtractorProps> = ({
  theme = "dark",
  onAddStatus
}) => {
  const [inputUrl, setInputUrl] = useState<string>("");
  const [customFilename, setCustomFilename] = useState<string>("");
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [extractedInfo, setExtractedInfo] = useState<{
    url: string;
    type: "image" | "video" | "audio" | "document" | "youtube" | "generic";
    mimeType?: string;
    sizeBytes?: number;
    title: string;
    ext: string;
    previewUrl?: string;
  } | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);

  const handleAnalyzeUrl = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputUrl.trim()) return;

    setIsAnalyzing(true);
    setErrorMsg(null);
    setExtractedInfo(null);

    const targetUrl = inputUrl.trim();

    // Check if YouTube URL
    if (targetUrl.includes("youtube.com") || targetUrl.includes("youtu.be")) {
      let videoId = "";
      if (targetUrl.includes("youtu.be/")) {
        videoId = targetUrl.split("youtu.be/")[1]?.split("?")[0] || "";
      } else if (targetUrl.includes("v=")) {
        videoId = targetUrl.split("v=")[1]?.split("&")[0] || "";
      }

      setExtractedInfo({
        url: targetUrl,
        type: "youtube",
        title: `YouTube Video (${videoId || "Media"})`,
        ext: "mp4",
        previewUrl: videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : undefined
      });
      setIsAnalyzing(false);
      return;
    }

    // Infer type from extension or fetch HEAD via server proxy
    const cleanUrlPath = targetUrl.split("?")[0].toLowerCase();
    let detectedType: "image" | "video" | "audio" | "document" | "generic" = "generic";
    let detectedExt = "bin";

    if (/\.(jpg|jpeg|png|gif|webp|svg|bmp|ico)$/i.test(cleanUrlPath)) {
      detectedType = "image";
      detectedExt = cleanUrlPath.split(".").pop() || "jpg";
    } else if (/\.(mp4|webm|mkv|mov|avi)$/i.test(cleanUrlPath)) {
      detectedType = "video";
      detectedExt = cleanUrlPath.split(".").pop() || "mp4";
    } else if (/\.(mp3|wav|ogg|aac|m4a|flac)$/i.test(cleanUrlPath)) {
      detectedType = "audio";
      detectedExt = cleanUrlPath.split(".").pop() || "mp3";
    } else if (/\.(pdf|doc|docx|txt|json|zip|csv)$/i.test(cleanUrlPath)) {
      detectedType = "document";
      detectedExt = cleanUrlPath.split(".").pop() || "pdf";
    }

    // Try fetching via proxy to check actual headers
    try {
      const checkRes = await fetch(`/api/media/download?url=${encodeURIComponent(targetUrl)}&filename=test`, {
        method: "HEAD"
      }).catch(() => null);

      let mimeType = "";
      let contentLength = 0;

      if (checkRes && checkRes.ok) {
        mimeType = checkRes.headers.get("content-type") || "";
        contentLength = parseInt(checkRes.headers.get("content-length") || "0", 10);

        if (mimeType.includes("image")) detectedType = "image";
        else if (mimeType.includes("video")) detectedType = "video";
        else if (mimeType.includes("audio")) detectedType = "audio";
        else if (mimeType.includes("pdf") || mimeType.includes("document") || mimeType.includes("text")) detectedType = "document";
      }

      const inferredTitle = targetUrl.split("/").pop()?.split("?")[0] || "Web_Downloaded_Asset";

      setExtractedInfo({
        url: targetUrl,
        type: detectedType,
        mimeType: mimeType || "application/octet-stream",
        sizeBytes: contentLength || undefined,
        title: inferredTitle,
        ext: detectedExt,
        previewUrl: detectedType === "image" ? targetUrl : undefined
      });
    } catch (err) {
      console.warn("HEAD check failed, using URL fallback info:", err);
      const inferredTitle = targetUrl.split("/").pop()?.split("?")[0] || "Web_Asset";
      setExtractedInfo({
        url: targetUrl,
        type: detectedType,
        title: inferredTitle,
        ext: detectedExt,
        previewUrl: detectedType === "image" ? targetUrl : undefined
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleTriggerDownload = async () => {
    if (!extractedInfo) return;

    setIsDownloading(true);
    const filenameToUse = customFilename.trim() 
      ? (customFilename.includes(".") ? customFilename : `${customFilename}.${extractedInfo.ext}`)
      : (extractedInfo.title.includes(".") ? extractedInfo.title : `${extractedInfo.title}.${extractedInfo.ext}`);

    try {
      // 1. Try server proxy endpoint
      const proxyUrl = `/api/media/download?url=${encodeURIComponent(extractedInfo.url)}&filename=${encodeURIComponent(filenameToUse)}`;
      
      const link = document.createElement("a");
      link.href = proxyUrl;
      link.download = filenameToUse;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      if (onAddStatus) onAddStatus(`✅ Initiated proxy download for ${filenameToUse}`);
    } catch (err) {
      // 2. Direct Blob fallback
      try {
        const res = await fetch(extractedInfo.url);
        const blob = await res.blob();
        const blobUrl = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = blobUrl;
        a.download = filenameToUse;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(blobUrl);
      } catch (blobErr) {
        // 3. New Window direct open
        window.open(extractedInfo.url, "_blank");
      }
    } finally {
      setIsDownloading(false);
    }
  };

  const handleCopyLink = () => {
    if (!extractedInfo) return;
    navigator.clipboard.writeText(extractedInfo.url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4">
      {/* Input Form Card */}
      <div className={`p-4 rounded-2xl border ${
        theme === "dark" ? "bg-zinc-900 border-zinc-800" : "bg-white border-slate-200"
      }`}>
        <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-400 mb-2 flex items-center gap-1.5">
          <LinkIcon className="w-4 h-4" /> Universal Direct Media & File Link Grabber
        </h3>
        <p className="text-xs text-slate-400 mb-3">
          Paste any web URL (YouTube, MP3/MP4 media links, Images, Documents, or CDN assets) to extract and download directly bypass CORS constraints.
        </p>

        <form onSubmit={handleAnalyzeUrl} className="flex flex-col sm:flex-row gap-2">
          <input
            type="url"
            value={inputUrl}
            onChange={(e) => setInputUrl(e.target.value)}
            placeholder="https://example.com/media/file.mp4 or YouTube video link..."
            required
            className={`flex-1 px-3.5 py-2.5 rounded-xl text-xs font-mono border focus:outline-none transition-all ${
              theme === "dark"
                ? "bg-zinc-950 border-zinc-800 text-white placeholder-zinc-600 focus:border-cyan-500"
                : "bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400 focus:border-cyan-500"
            }`}
          />
          <button
            type="submit"
            disabled={isAnalyzing}
            className="px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md disabled:opacity-50 shrink-0"
          >
            {isAnalyzing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <LinkIcon className="w-4 h-4" />}
            {isAnalyzing ? "Extracting..." : "Analyze Link"}
          </button>
        </form>

        {/* Quick URL Preset Examples */}
        <div className="flex items-center gap-1.5 overflow-x-auto mt-3 pt-2 border-t border-zinc-800 text-[11px]">
          <span className="text-slate-500 font-bold shrink-0">Try Examples:</span>
          <button
            onClick={() => setInputUrl("https://actions.google.com/sounds/v1/ambiences/rain_heavy.ogg")}
            className="px-2.5 py-1 rounded-lg bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 font-mono text-[10px] cursor-pointer shrink-0"
          >
            Google Rain Sound (.ogg)
          </button>
          <button
            onClick={() => setInputUrl("https://images.unsplash.com/photo-1518770660439-4636190af475?w=1920")}
            className="px-2.5 py-1 rounded-lg bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 font-mono text-[10px] cursor-pointer shrink-0"
          >
            Unsplash 4K Tech Photo
          </button>
          <button
            onClick={() => setInputUrl("https://media.giphy.com/media/13Hgw8T855C20M/giphy.gif")}
            className="px-2.5 py-1 rounded-lg bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 font-mono text-[10px] cursor-pointer shrink-0"
          >
            Hacker GIF Loop
          </button>
        </div>
      </div>

      {/* Extracted Asset Card */}
      {extractedInfo && (
        <div className={`p-4 rounded-2xl border space-y-4 ${
          theme === "dark" ? "bg-zinc-900 border-cyan-500/40" : "bg-white border-cyan-500/40"
        }`}>
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                {extractedInfo.type === "image" && <ImageIcon className="w-5 h-5" />}
                {extractedInfo.type === "video" && <Film className="w-5 h-5" />}
                {extractedInfo.type === "youtube" && <Film className="w-5 h-5 text-rose-500" />}
                {extractedInfo.type === "audio" && <Music className="w-5 h-5" />}
                {extractedInfo.type === "document" && <FileText className="w-5 h-5" />}
                {extractedInfo.type === "generic" && <Download className="w-5 h-5" />}
              </div>
              <div>
                <h4 className="text-xs font-bold text-white truncate max-w-md">{extractedInfo.title}</h4>
                <p className="text-[10px] text-slate-400 font-mono">
                  Type: {extractedInfo.type.toUpperCase()} • Format: {extractedInfo.ext.toUpperCase()} 
                  {extractedInfo.sizeBytes && ` • ${(extractedInfo.sizeBytes / (1024 * 1024)).toFixed(2)} MB`}
                </p>
              </div>
            </div>

            <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold">
              Ready To Download
            </span>
          </div>

          {/* Media Preview Box */}
          {extractedInfo.type === "image" && extractedInfo.previewUrl && (
            <div className="rounded-xl overflow-hidden bg-black/60 max-h-64 flex items-center justify-center border border-zinc-800">
              <img src={extractedInfo.previewUrl} alt="Preview" className="max-h-60 object-contain" />
            </div>
          )}

          {extractedInfo.type === "audio" && (
            <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800">
              <audio controls src={extractedInfo.url} className="w-full h-8" />
            </div>
          )}

          {extractedInfo.type === "youtube" && (
            <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 text-xs space-y-2">
              {extractedInfo.previewUrl && (
                <img src={extractedInfo.previewUrl} alt="YouTube Thumbnail" className="w-full max-h-48 object-cover rounded-lg" />
              )}
              <p className="text-[11px] text-slate-300">
                YouTube links can be opened or embedded directly. For direct audio/video streams, click Download below!
              </p>
            </div>
          )}

          {/* Options & Action Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
            <div className="w-full sm:w-auto flex-1 flex items-center gap-2">
              <span className="text-[11px] text-slate-400 font-bold shrink-0">Custom Name:</span>
              <input
                type="text"
                value={customFilename}
                onChange={(e) => setCustomFilename(e.target.value)}
                placeholder={`Save as (default: ${extractedInfo.title})`}
                className="w-full px-3 py-1.5 rounded-xl text-xs bg-zinc-950 border border-zinc-800 text-white focus:outline-none focus:border-cyan-500 font-mono"
              />
            </div>

            <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto justify-end">
              <button
                onClick={handleCopyLink}
                className="px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-slate-300 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                {copied ? "Copied" : "Copy URL"}
              </button>

              <button
                onClick={handleTriggerDownload}
                disabled={isDownloading}
                className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-extrabold text-xs flex items-center gap-1.5 cursor-pointer shadow-lg transition-all disabled:opacity-50"
              >
                {isDownloading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                {isDownloading ? "Downloading..." : "Download File Now"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
