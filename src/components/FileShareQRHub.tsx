import React, { useState, useEffect, useRef } from "react";
import QRCode from "qrcode";
import JSZip from "jszip";
import {
  QrCode,
  Share2,
  FileArchive,
  Download,
  Upload,
  Copy,
  Check,
  Link as LinkIcon,
  FileText,
  Image as ImageIcon,
  Sparkles,
  AlertCircle,
  File,
  X,
  CheckCircle2,
  ArrowRight
} from "lucide-react";

interface FileShareQRHubProps {
  theme: "light" | "dark";
}

interface SharedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  dataUrl: string;
}

export const FileShareQRHub: React.FC<FileShareQRHubProps> = ({ theme }) => {
  // Mode selection: "qr_gen" or "file_share"
  const [activeTab, setActiveTab] = useState<"qr_gen" | "file_share">("file_share");

  // QR Code Generator State
  const [qrInput, setQrInput] = useState<string>("https://ai.studio/build");
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [qrFileName, setQrFileName] = useState<string>("my-qrcode");
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  // File Share State
  const [files, setFiles] = useState<SharedFile[]>([]);
  const [isZipping, setIsZipping] = useState<boolean>(false);
  const [zipDataUrl, setZipDataUrl] = useState<string | null>(null);
  const [zipFileName, setZipFileName] = useState<string>("shared_package.zip");
  const [fileQrUrl, setFileQrUrl] = useState<string>("");
  const [shareLink, setShareLink] = useState<string>("");
  const [isAutoZipped, setIsAutoZipped] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Generate QR code for arbitrary text/URL
  useEffect(() => {
    if (!qrInput.trim()) {
      setQrDataUrl("");
      return;
    }
    QRCode.toDataURL(qrInput.trim(), {
      width: 360,
      margin: 2,
      errorCorrectionLevel: "M",
      color: {
        dark: "#000000",
        light: "#ffffff"
      }
    })
      .then((url) => setQrDataUrl(url))
      .catch((err) => console.error("QR gen error:", err));
  }, [qrInput]);

  // Total file size calculation
  const totalSizeBytes = files.reduce((acc, f) => acc + f.size, 0);
  const totalMB = totalSizeBytes / (1024 * 1024);
  const autoZipThresholdMB = 2.0;

  // Handle file uploads
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const newFilesList: SharedFile[] = [];
    const rawFiles = Array.from(e.target.files);

    let processedCount = 0;
    rawFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        newFilesList.push({
          id: Math.random().toString(36).substring(2, 9),
          name: file.name,
          size: file.size,
          type: file.type || "application/octet-stream",
          dataUrl: (event.target?.result as string) || ""
        });
        processedCount++;
        if (processedCount === rawFiles.length) {
          const updated = [...files, ...newFilesList];
          setFiles(updated);
          processFileSharing(updated);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removeFile = (id: string) => {
    const updated = files.filter(f => f.id !== id);
    setFiles(updated);
    if (updated.length > 0) {
      processFileSharing(updated);
    } else {
      setZipDataUrl(null);
      setFileQrUrl("");
      setShareLink("");
      setIsAutoZipped(false);
    }
  };

  // Convert files into ZIP if size > threshold or requested
  const processFileSharing = async (fileList: SharedFile[]) => {
    if (fileList.length === 0) return;
    setIsZipping(true);

    try {
      const currentMB = fileList.reduce((acc, f) => acc + f.size, 0) / (1024 * 1024);
      const shouldZip = currentMB > autoZipThresholdMB || fileList.length > 1;
      setIsAutoZipped(shouldZip);

      if (shouldZip) {
        const zip = new JSZip();
        fileList.forEach((file) => {
          // Extract base64 part
          const base64Data = file.dataUrl.split(",")[1] || "";
          zip.file(file.name, base64Data, { base64: true });
        });

        const zipBlob = await zip.generateAsync({ type: "blob" });
        const generatedZipUrl = URL.createObjectURL(zipBlob);
        setZipDataUrl(generatedZipUrl);

        const customZipName = `shared_files_${Date.now().toString().slice(-4)}.zip`;
        setZipFileName(customZipName);

        // Upload ZIP blob to server for real direct download URL
        try {
          const reader = new FileReader();
          reader.onloadend = async () => {
            const base64data = reader.result as string;
            const res = await fetch("/api/share/upload", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ fileName: customZipName, fileData: base64data })
            });
            if (res.ok) {
              const data = await res.json();
              if (data.downloadUrl) {
                setShareLink(data.downloadUrl);
                const qrUrl = await QRCode.toDataURL(data.downloadUrl, {
                  width: 320,
                  margin: 2,
                  color: { dark: "#38bdf8", light: "#0f172a" }
                });
                setFileQrUrl(qrUrl);
              }
            }
          };
          reader.readAsDataURL(zipBlob);
        } catch {
          setShareLink(generatedZipUrl);
          const qrUrl = await QRCode.toDataURL(window.location.href, {
            width: 320,
            margin: 2,
            color: { dark: "#38bdf8", light: "#0f172a" }
          });
          setFileQrUrl(qrUrl);
        }
      } else if (fileList.length === 1) {
        // Single small file share directly
        const single = fileList[0];
        setZipDataUrl(single.dataUrl);

        try {
          const res = await fetch("/api/share/upload", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ fileName: single.name, fileData: single.dataUrl })
          });
          if (res.ok) {
            const data = await res.json();
            if (data.downloadUrl) {
              setShareLink(data.downloadUrl);
              const qrUrl = await QRCode.toDataURL(data.downloadUrl, {
                width: 320,
                margin: 2,
                color: { dark: "#38bdf8", light: "#0f172a" }
              });
              setFileQrUrl(qrUrl);
            }
          }
        } catch {
          setShareLink(single.dataUrl);
          const qrUrl = await QRCode.toDataURL(window.location.href, {
            width: 320,
            margin: 2,
            color: { dark: "#38bdf8", light: "#0f172a" }
          });
          setFileQrUrl(qrUrl);
        }
      }
    } catch (err) {
      console.error("Zipping error:", err);
    } finally {
      setIsZipping(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <div className={`h-full w-full flex-1 flex flex-col overflow-hidden ${theme === "dark" ? "bg-[#0c0d10] text-zinc-100" : "bg-slate-50 text-slate-800"}`}>
      {/* TOP HEADER */}
      <div className={`p-4 border-b flex flex-wrap items-center justify-between gap-3 shrink-0 ${
        theme === "dark" ? "border-zinc-800 bg-zinc-900/90" : "border-slate-200 bg-white"
      }`}>
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-sky-500/10 text-sky-400 rounded-2xl border border-sky-500/20 shadow-sm">
            <QrCode className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h2 className="text-sm font-bold tracking-tight flex items-center gap-2">
              File Share & QR Generator Hub
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-sky-500/10 text-sky-400 border border-sky-500/20">
                Instant Share & Auto ZIP
              </span>
            </h2>
            <p className="text-[11px] text-slate-400">Share files via QR code, auto-zip large documents, and generate custom QR links</p>
          </div>
        </div>

        {/* TAB TOGGLES */}
        <div className="flex items-center gap-1 bg-slate-200 dark:bg-zinc-800 p-1 rounded-xl text-xs font-bold">
          <button
            onClick={() => setActiveTab("file_share")}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === "file_share" ? "bg-sky-600 text-white shadow-sm" : "text-slate-400 hover:text-white"
            }`}
          >
            <Share2 className="w-3.5 h-3.5" />
            File Share & Zip
          </button>
          <button
            onClick={() => setActiveTab("qr_gen")}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === "qr_gen" ? "bg-sky-600 text-white shadow-sm" : "text-slate-400 hover:text-white"
            }`}
          >
            <LinkIcon className="w-3.5 h-3.5" />
            Link to QR Code
          </button>
        </div>
      </div>

      {/* MAIN CONTAINER */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* TAB 1: FILE SHARE & ZIP */}
        {activeTab === "file_share" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            {/* Left Upload Panel */}
            <div className="lg:col-span-7 space-y-4">
              <div
                onClick={() => fileInputRef.current?.click()}
                className={`p-6 rounded-2xl border-2 border-dashed transition-all cursor-pointer text-center space-y-3 ${
                  theme === "dark"
                    ? "bg-zinc-900/50 hover:bg-zinc-900 border-zinc-700 hover:border-sky-500"
                    : "bg-white hover:bg-slate-100 border-slate-300 hover:border-sky-500"
                }`}
              >
                <div className="w-12 h-12 mx-auto rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 flex items-center justify-center">
                  <Upload className="w-6 h-6 animate-bounce" />
                </div>
                <div>
                  <p className="text-xs font-bold text-white">Click or Drag & Drop Any Files Here</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Images, Documents, PDFs, Audio, Code Files</p>
                </div>
                <span className="inline-block px-3 py-1 rounded-full text-[10px] font-mono font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  ⚡ Auto Converts to ZIP if size exceeds {autoZipThresholdMB} MB!
                </span>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  multiple
                  className="hidden"
                />
              </div>

              {/* Uploaded File List */}
              {files.length > 0 && (
                <div className={`p-4 rounded-2xl border space-y-3 ${theme === "dark" ? "bg-zinc-900/90 border-zinc-800" : "bg-white border-slate-200"}`}>
                  <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                    <span className="text-xs font-bold text-sky-400 flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      Uploaded Documents ({files.length})
                    </span>
                    <span className="text-[11px] font-mono text-slate-400">
                      Total Size: {formatFileSize(totalSizeBytes)}
                    </span>
                  </div>

                  <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                    {files.map((file) => (
                      <div
                        key={file.id}
                        className="p-2.5 rounded-xl bg-zinc-950/70 border border-zinc-800/80 flex items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          {file.type.startsWith("image/") ? (
                            <ImageIcon className="w-4 h-4 text-emerald-400 shrink-0" />
                          ) : (
                            <File className="w-4 h-4 text-sky-400 shrink-0" />
                          )}
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-white truncate">{file.name}</p>
                            <p className="text-[10px] font-mono text-slate-400">{formatFileSize(file.size)}</p>
                          </div>
                        </div>

                        <button
                          onClick={() => removeFile(file.id)}
                          className="p-1 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-all cursor-pointer"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="pt-2 flex items-center justify-between border-t border-zinc-800">
                    <button
                      onClick={() => processFileSharing(files)}
                      disabled={isZipping}
                      className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold transition-all shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      <FileArchive className="w-4 h-4" />
                      {isZipping ? "Packaging ZIP..." : "Force ZIP Archive & Get QR"}
                    </button>
                    {totalMB > autoZipThresholdMB && (
                      <span className="text-[10px] font-bold text-amber-400 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" />
                        Exceeds {autoZipThresholdMB}MB: Automatically Zipped!
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Right QR & Download Card */}
            <div className="lg:col-span-5 space-y-4">
              <div className={`p-5 rounded-2xl border text-center space-y-4 ${
                theme === "dark" ? "bg-zinc-900/90 border-zinc-800" : "bg-white border-slate-200"
              }`}>
                <h3 className="text-xs font-bold text-sky-400 uppercase tracking-wider flex items-center justify-center gap-2">
                  <QrCode className="w-4 h-4" /> Scan QR to Download Shared Files
                </h3>

                {fileQrUrl ? (
                  <div className="space-y-3">
                    <div className="p-3 bg-zinc-950 inline-block rounded-2xl border border-sky-500/30 shadow-xl">
                      <img src={fileQrUrl} alt="File QR Code" className="w-52 h-52 mx-auto rounded-xl" />
                    </div>

                    <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 text-left space-y-1.5">
                      <span className="text-[10px] text-slate-400 font-bold uppercase">Easily Named Share Link</span>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          readOnly
                          value={shareLink}
                          className="flex-1 px-2.5 py-1 text-xs font-mono rounded bg-zinc-900 text-sky-300 border border-zinc-700"
                        />
                        <button
                          onClick={() => copyToClipboard(shareLink)}
                          className="px-2.5 py-1 rounded bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold flex items-center gap-1 cursor-pointer"
                        >
                          {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                          {copiedLink ? "Copied" : "Copy"}
                        </button>
                      </div>
                    </div>

                    {zipDataUrl && (
                      <a
                        href={zipDataUrl}
                        download={zipFileName}
                        className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <Download className="w-4 h-4" />
                        Download {isAutoZipped ? "ZIP Archive" : "File"} Directly
                      </a>
                    )}
                  </div>
                ) : (
                  <div className="p-8 text-center space-y-2 text-slate-400">
                    <QrCode className="w-12 h-12 mx-auto opacity-30" />
                    <p className="text-xs font-medium">Upload files on the left to generate instant QR Code & ZIP link</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: LINK TO QR CODE */}
        {activeTab === "qr_gen" && (
          <div className="max-w-xl mx-auto space-y-4">
            <div className={`p-6 rounded-2xl border space-y-4 ${
              theme === "dark" ? "bg-zinc-900/90 border-zinc-800" : "bg-white border-slate-200"
            }`}>
              <div className="flex items-center gap-2">
                <LinkIcon className="w-5 h-5 text-sky-400" />
                <h3 className="text-sm font-bold text-white">Convert Any URL or Link to QR Code</h3>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300">Target Website Link / Text:</label>
                <input
                  type="text"
                  value={qrInput}
                  onChange={(e) => setQrInput(e.target.value)}
                  placeholder="https://your-website.com or custom text..."
                  className="w-full p-2.5 text-xs font-mono rounded-xl bg-zinc-950 border border-zinc-700 text-white focus:outline-none focus:ring-1 focus:ring-sky-500"
                />
              </div>

              {qrDataUrl && (
                <div className="text-center space-y-4 pt-2">
                  <div className="p-4 bg-zinc-950 inline-block rounded-2xl border border-sky-500/30 shadow-xl">
                    <img src={qrDataUrl} alt="Generated QR" className="w-56 h-56 mx-auto rounded-xl" />
                  </div>

                  <div className="flex items-center justify-center gap-3">
                    <a
                      href={qrDataUrl}
                      download={`${qrFileName || "qrcode"}.png`}
                      className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold flex items-center gap-2 cursor-pointer shadow-md"
                    >
                      <Download className="w-4 h-4" />
                      Download QR Code Image
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
