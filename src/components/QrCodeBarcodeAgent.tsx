import React, { useState, useEffect, useRef } from "react";
import QRCode from "qrcode";
import {
  QrCode,
  Sparkles,
  Download,
  Copy,
  Check,
  RefreshCw,
  Sliders,
  Type,
  Link,
  Wifi,
  Mail,
  Phone,
  Globe,
  User,
  MessageSquare,
  ShieldCheck,
  Zap,
  Eye,
  FileCode,
  CheckCircle2,
  Share2,
  Info,
  AlertCircle
} from "lucide-react";

interface QrCodeBarcodeAgentProps {
  apiKey?: string;
  selectedModel?: string;
  theme: "light" | "dark";
  onAddLog?: (type: string, msg: string) => void;
}

export const QrCodeBarcodeAgent: React.FC<QrCodeBarcodeAgentProps> = ({
  theme,
  onAddLog
}) => {
  // Payload Types: "url" | "wifi" | "vcard" | "email" | "phone" | "sms" | "text"
  const [qrType, setQrType] = useState<"url" | "wifi" | "vcard" | "email" | "phone" | "sms" | "text">("url");

  // Input states
  const [urlInput, setUrlInput] = useState<string>("https://ai.studio/build");
  const [textInput, setTextInput] = useState<string>("Hello, world! Genuine ISO/IEC 18004 Standard QR Code");
  
  // Wi-Fi inputs
  const [wifiSsid, setWifiSsid] = useState<string>("Home_Studio_5G");
  const [wifiPass, setWifiPass] = useState<string>("SecurePassword2026");
  const [wifiEnc, setWifiEnc] = useState<"WPA" | "WEP" | "nopass">("WPA");

  // vCard Contact inputs
  const [vName, setVName] = useState<string>("Alex Rivera");
  const [vPhone, setVPhone] = useState<string>("+1 (555) 019-2831");
  const [vEmail, setVEmail] = useState<string>("alex.rivera@example.com");
  const [vOrg, setVOrg] = useState<string>("AI Innovation Labs");

  // Email inputs
  const [emailTo, setEmailTo] = useState<string>("contact@example.com");
  const [emailSubj, setEmailSubj] = useState<string>("Inquiry from QR Code");
  const [emailBody, setEmailBody] = useState<string>("Hi there, I scanned your QR code!");

  // Phone & SMS inputs
  const [phoneNum, setPhoneNum] = useState<string>("+15550192831");
  const [smsNum, setSmsNum] = useState<string>("+15550192831");
  const [smsMsg, setSmsMsg] = useState<string>("Hello! Scanning this QR code sent a message.");

  // QR Customization Settings
  const [fgColor, setFgColor] = useState<string>("#0f172a");
  const [bgColor, setBgColor] = useState<string>("#ffffff");
  const [ecLevel, setEcLevel] = useState<"L" | "M" | "Q" | "H">("M");
  const [qrMargin, setQrMargin] = useState<number>(2);
  const [qrSize, setQrSize] = useState<number>(360);
  const [centerIcon, setCenterIcon] = useState<"none" | "wifi" | "link" | "user" | "sparkles">("none");

  // Output states
  const [dataUrl, setDataUrl] = useState<string>("");
  const [svgString, setSvgString] = useState<string>("");
  const [rawPayload, setRawPayload] = useState<string>("");
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [copiedDataUrl, setCopiedDataUrl] = useState<boolean>(false);
  const [verifiedScan, setVerifiedScan] = useState<boolean>(true);
  const [qrError, setQrError] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Compute raw payload based on type
  useEffect(() => {
    let payload = "";
    switch (qrType) {
      case "url":
        payload = urlInput.trim() || "https://ai.studio/build";
        break;
      case "wifi":
        payload = `WIFI:S:${wifiSsid};T:${wifiEnc};P:${wifiPass};;`;
        break;
      case "vcard":
        payload = `BEGIN:VCARD\nVERSION:3.0\nFN:${vName}\nTEL:${vPhone}\nEMAIL:${vEmail}\nORG:${vOrg}\nEND:VCARD`;
        break;
      case "email":
        payload = `mailto:${emailTo}?subject=${encodeURIComponent(emailSubj)}&body=${encodeURIComponent(emailBody)}`;
        break;
      case "phone":
        payload = `tel:${phoneNum}`;
        break;
      case "sms":
        payload = `SMSTO:${smsNum}:${smsMsg}`;
        break;
      case "text":
        payload = textInput || "Sample Text Payload";
        break;
      default:
        payload = urlInput;
    }
    setRawPayload(payload);
  }, [
    qrType,
    urlInput,
    textInput,
    wifiSsid,
    wifiPass,
    wifiEnc,
    vName,
    vPhone,
    vEmail,
    vOrg,
    emailTo,
    emailSubj,
    emailBody,
    phoneNum,
    smsNum,
    smsMsg
  ]);

  // Generate 100% Real QR Code locally on canvas and SVG
  useEffect(() => {
    if (!rawPayload) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const renderQr = async () => {
      try {
        // 1. Draw standard ISO/IEC 18004 QR onto canvas
        await QRCode.toCanvas(canvas, rawPayload, {
          width: qrSize,
          margin: qrMargin,
          errorCorrectionLevel: ecLevel,
          color: {
            dark: fgColor,
            light: bgColor
          }
        });

        // 2. Draw optional center logo overlay if selected
        if (centerIcon !== "none") {
          const ctx = canvas.getContext("2d");
          if (ctx) {
            const iconSize = Math.floor(qrSize * 0.22);
            const centerX = (qrSize - iconSize) / 2;
            const centerY = (qrSize - iconSize) / 2;

            // Draw rounded white background pill behind icon
            ctx.fillStyle = bgColor;
            ctx.beginPath();
            if (typeof (ctx as any).roundRect === "function") {
              (ctx as any).roundRect(centerX - 4, centerY - 4, iconSize + 8, iconSize + 8, 12);
            } else {
              ctx.rect(centerX - 4, centerY - 4, iconSize + 8, iconSize + 8);
            }
            ctx.fill();
            ctx.lineWidth = 2;
            ctx.strokeStyle = fgColor;
            ctx.stroke();

            // Draw center emblem accent
            ctx.fillStyle = fgColor;
            ctx.font = `bold ${Math.floor(iconSize * 0.55)}px sans-serif`;
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            
            let emblem = "★";
            if (centerIcon === "wifi") emblem = "📶";
            if (centerIcon === "link") emblem = "🔗";
            if (centerIcon === "user") emblem = "👤";
            if (centerIcon === "sparkles") emblem = "✨";

            ctx.fillText(emblem, qrSize / 2, qrSize / 2);
          }
        }

        const generatedDataUrl = canvas.toDataURL("image/png");
        setDataUrl(generatedDataUrl);

        // 3. Generate SVG string
        const svg = await QRCode.toString(rawPayload, {
          type: "svg",
          margin: qrMargin,
          errorCorrectionLevel: ecLevel,
          color: {
            dark: fgColor,
            light: bgColor
          }
        });
        setSvgString(svg);
        setVerifiedScan(true);
        setQrError(null);
      } catch (err: any) {
        console.error("Local Real QR Generation Error:", err);
        const inputLen = rawPayload?.length || 0;
        const msg = inputLen > 2500
          ? `QR input too long (${inputLen} chars). Maximum is ~2500 characters for reliable QR codes. Shorten the text or use a URL shortener.`
          : `QR code generation failed: ${err?.message || "Unknown error"}`;
        setQrError(msg);
        setVerifiedScan(false);
      }
    };

    renderQr();
  }, [rawPayload, fgColor, bgColor, ecLevel, qrMargin, qrSize, centerIcon]);

  // Handle Download PNG
  const handleDownloadPng = () => {
    if (!dataUrl) return;
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = `real_qrcode_${qrType}_${Date.now()}.png`;
    a.click();
    if (onAddLog) onAddLog("success", `Downloaded HD PNG QR code for [${qrType}]`);
  };

  // Handle Download SVG
  const handleDownloadSvg = () => {
    if (!svgString) return;
    const blob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `real_qrcode_${qrType}_${Date.now()}.svg`;
    a.click();
    URL.revokeObjectURL(url);
    if (onAddLog) onAddLog("success", `Downloaded Vector SVG QR code for [${qrType}]`);
  };

  // Handle Copy Image to Clipboard
  const handleCopyImage = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
      canvas.toBlob(async (blob) => {
        if (!blob) return;
        const item = new ClipboardItem({ "image/png": blob });
        await navigator.clipboard.write([item]);
        setCopiedLink(true);
        if (onAddLog) onAddLog("agent", "Copied real QR code image to system clipboard");
        setTimeout(() => setCopiedLink(false), 2000);
      });
    } catch {
      // Fallback to copying Data URL text
      navigator.clipboard.writeText(dataUrl);
      setCopiedDataUrl(true);
      setTimeout(() => setCopiedDataUrl(false), 2000);
    }
  };

  return (
    <div className={`w-full min-h-full flex flex-col p-4 md:p-6 transition-colors duration-200 ${
      theme === "dark" ? "bg-zinc-950 text-white" : "bg-slate-50 text-slate-900"
    }`}>
      {/* Agent Banner Header */}
      <div className={`p-5 rounded-2xl border mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm ${
        theme === "dark" ? "bg-gradient-to-r from-zinc-900 via-indigo-950/40 to-zinc-900 border-zinc-800" : "bg-white border-slate-200"
      }`}>
        <div className="flex items-center gap-3.5">
          <div className="p-3 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-md">
            <QrCode className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight">Real ISO/IEC 18004 Standard QR Code Generator</h1>
              <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                100% Real Local Canvas Render
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Generates genuine, scannable 2D matrix QR codes client-side with error correction, SVG vectors, Wi-Fi auto-connect, & vCards!
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleCopyImage}
            className="px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer border border-zinc-700"
          >
            {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            {copiedLink ? "Copied Image!" : "Copy QR Image"}
          </button>

          <button
            onClick={handleDownloadSvg}
            className="px-3.5 py-2 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <FileCode className="w-3.5 h-3.5 text-purple-400" /> SVG Vector
          </button>

          <button
            onClick={handleDownloadPng}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white font-extrabold text-xs flex items-center gap-2 shadow-lg shadow-indigo-500/20 cursor-pointer"
          >
            <Download className="w-4 h-4" /> Download HD PNG
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Controls Column (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-5">
          {/* Payload Type Selector */}
          <div className={`p-5 rounded-2xl border space-y-4 shadow-sm ${
            theme === "dark" ? "bg-zinc-900 border-zinc-800" : "bg-white border-slate-200"
          }`}>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <Sliders className="w-3.5 h-3.5 text-indigo-400" />
              1. Select Standard Payload Format
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: "url", label: "Website URL", icon: Link, desc: "Open link in browser" },
                { id: "wifi", label: "Wi-Fi Network", icon: Wifi, desc: "Auto-connect to Wi-Fi" },
                { id: "vcard", label: "Contact vCard", icon: User, desc: "Add contact to phone" },
                { id: "email", label: "Email Mailto", icon: Mail, desc: "Draft email message" },
                { id: "phone", label: "Phone Call", icon: Phone, desc: "Dial phone number" },
                { id: "sms", label: "SMS Message", icon: MessageSquare, desc: "Send pre-filled SMS" },
                { id: "text", label: "Plain Text", icon: Type, desc: "Raw text data" }
              ].map((item) => {
                const IconComp = item.icon;
                const isActive = qrType === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setQrType(item.id as any)}
                    className={`p-3 rounded-xl text-left border transition-all cursor-pointer flex flex-col gap-1 ${
                      isActive
                        ? "bg-indigo-600 text-white border-indigo-500 shadow-md ring-2 ring-indigo-500/30"
                        : theme === "dark"
                          ? "bg-zinc-950 border-zinc-800 text-slate-400 hover:border-zinc-700 hover:text-white"
                          : "bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    <div className="flex items-center gap-2 font-bold text-xs">
                      <IconComp className="w-3.5 h-3.5 shrink-0" />
                      <span>{item.label}</span>
                    </div>
                    <span className={`text-[10px] ${isActive ? "text-indigo-200" : "text-slate-500"}`}>
                      {item.desc}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Dynamic Input Forms */}
            <div className={`p-4 rounded-xl border mt-2 ${
              theme === "dark" ? "bg-zinc-950 border-zinc-800" : "bg-slate-50 border-slate-200"
            }`}>
              {/* URL */}
              {qrType === "url" && (
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-300">Target Website Link (HTTPS/HTTP)</label>
                  <input
                    type="url"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    placeholder="https://your-website.com"
                    className="w-full p-3 rounded-xl text-xs font-mono border outline-none bg-transparent border-zinc-700 focus:border-indigo-500 text-white"
                  />
                </div>
              )}

              {/* Wi-Fi */}
              {qrType === "wifi" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="md:col-span-2">
                    <label className="text-xs font-bold text-slate-300">Wi-Fi Network Name (SSID)</label>
                    <input
                      type="text"
                      value={wifiSsid}
                      onChange={(e) => setWifiSsid(e.target.value)}
                      placeholder="MyHomeWiFi_5G"
                      className="w-full p-2.5 rounded-xl text-xs border outline-none bg-transparent border-zinc-700 focus:border-indigo-500 text-white"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-300">Password</label>
                    <input
                      type="text"
                      value={wifiPass}
                      onChange={(e) => setWifiPass(e.target.value)}
                      placeholder="WiFi Password"
                      className="w-full p-2.5 rounded-xl text-xs border outline-none bg-transparent border-zinc-700 focus:border-indigo-500 text-white"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-300">Encryption Type</label>
                    <select
                      value={wifiEnc}
                      onChange={(e) => setWifiEnc(e.target.value as any)}
                      className="w-full p-2.5 rounded-xl text-xs border outline-none bg-zinc-900 border-zinc-700 text-white"
                    >
                      <option value="WPA">WPA / WPA2 / WPA3 (Standard)</option>
                      <option value="WEP">WEP (Legacy)</option>
                      <option value="nopass">No Password (Open)</option>
                    </select>
                  </div>
                </div>
              )}

              {/* vCard Contact */}
              {qrType === "vcard" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-300">Full Name</label>
                    <input
                      type="text"
                      value={vName}
                      onChange={(e) => setVName(e.target.value)}
                      className="w-full p-2.5 rounded-xl text-xs border outline-none bg-transparent border-zinc-700 text-white"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-300">Phone Number</label>
                    <input
                      type="text"
                      value={vPhone}
                      onChange={(e) => setVPhone(e.target.value)}
                      className="w-full p-2.5 rounded-xl text-xs border outline-none bg-transparent border-zinc-700 text-white"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-300">Email Address</label>
                    <input
                      type="email"
                      value={vEmail}
                      onChange={(e) => setVEmail(e.target.value)}
                      className="w-full p-2.5 rounded-xl text-xs border outline-none bg-transparent border-zinc-700 text-white"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-300">Organization / Company</label>
                    <input
                      type="text"
                      value={vOrg}
                      onChange={(e) => setVOrg(e.target.value)}
                      className="w-full p-2.5 rounded-xl text-xs border outline-none bg-transparent border-zinc-700 text-white"
                    />
                  </div>
                </div>
              )}

              {/* Email */}
              {qrType === "email" && (
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-bold text-slate-300">Recipient Email</label>
                    <input
                      type="email"
                      value={emailTo}
                      onChange={(e) => setEmailTo(e.target.value)}
                      className="w-full p-2.5 rounded-xl text-xs border outline-none bg-transparent border-zinc-700 text-white"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold text-slate-300">Subject</label>
                      <input
                        type="text"
                        value={emailSubj}
                        onChange={(e) => setEmailSubj(e.target.value)}
                        className="w-full p-2.5 rounded-xl text-xs border outline-none bg-transparent border-zinc-700 text-white"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-300">Default Body Text</label>
                      <input
                        type="text"
                        value={emailBody}
                        onChange={(e) => setEmailBody(e.target.value)}
                        className="w-full p-2.5 rounded-xl text-xs border outline-none bg-transparent border-zinc-700 text-white"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Phone */}
              {qrType === "phone" && (
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-300">Phone Number to Call</label>
                  <input
                    type="tel"
                    value={phoneNum}
                    onChange={(e) => setPhoneNum(e.target.value)}
                    placeholder="+1 (555) 000-0000"
                    className="w-full p-3 rounded-xl text-xs font-mono border outline-none bg-transparent border-zinc-700 text-white"
                  />
                </div>
              )}

              {/* SMS */}
              {qrType === "sms" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-300">SMS Recipient Number</label>
                    <input
                      type="tel"
                      value={smsNum}
                      onChange={(e) => setSmsNum(e.target.value)}
                      className="w-full p-2.5 rounded-xl text-xs border outline-none bg-transparent border-zinc-700 text-white"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-300">SMS Pre-filled Text</label>
                    <input
                      type="text"
                      value={smsMsg}
                      onChange={(e) => setSmsMsg(e.target.value)}
                      className="w-full p-2.5 rounded-xl text-xs border outline-none bg-transparent border-zinc-700 text-white"
                    />
                  </div>
                </div>
              )}

              {/* Text */}
              {qrType === "text" && (
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-300">Arbitrary Raw Text Content</label>
                  <textarea
                    rows={3}
                    value={textInput}
                    onChange={(e) => setTextInput(e.target.value)}
                    className="w-full p-3 rounded-xl text-xs font-mono border outline-none bg-transparent border-zinc-700 text-white resize-none"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Styling & Color Customizations */}
          <div className={`p-5 rounded-2xl border space-y-4 shadow-sm ${
            theme === "dark" ? "bg-zinc-900 border-zinc-800" : "bg-white border-slate-200"
          }`}>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              2. Custom Styling, Colors & Error Correction
            </h3>

            {/* Presets */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-slate-400">Color Presets:</span>
              <div className="flex flex-wrap gap-2">
                {[
                  { name: "Classic Navy", fg: "#0f172a", bg: "#ffffff" },
                  { name: "Cyber Neon", fg: "#00f0ff", bg: "#09090b" },
                  { name: "Emerald Mint", fg: "#059669", bg: "#ecfdf5" },
                  { name: "Ruby Sunset", fg: "#e11d48", bg: "#fff1f2" },
                  { name: "Amethyst", fg: "#7c3aed", bg: "#f5f3ff" },
                  { name: "Dark Mode", fg: "#f8fafc", bg: "#09090b" }
                ].map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setFgColor(preset.fg);
                      setBgColor(preset.bg);
                    }}
                    className="px-2.5 py-1 rounded-lg text-xs font-semibold border border-zinc-700/60 hover:border-indigo-500 transition-all cursor-pointer flex items-center gap-1.5 bg-zinc-800/40 text-slate-200"
                  >
                    <span
                      className="w-3 h-3 rounded-full border border-black/20 shrink-0"
                      style={{ backgroundColor: preset.fg }}
                    />
                    <span>{preset.name}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
              <div>
                <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">QR Modules</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={fgColor}
                    onChange={(e) => setFgColor(e.target.value)}
                    className="w-8 h-8 rounded-lg bg-transparent cursor-pointer border border-zinc-700"
                  />
                  <span className="text-xs font-mono text-slate-300">{fgColor}</span>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Background</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={bgColor}
                    onChange={(e) => setBgColor(e.target.value)}
                    className="w-8 h-8 rounded-lg bg-transparent cursor-pointer border border-zinc-700"
                  />
                  <span className="text-xs font-mono text-slate-300">{bgColor}</span>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Error Correction</label>
                <select
                  value={ecLevel}
                  onChange={(e) => setEcLevel(e.target.value as any)}
                  className="w-full p-2 rounded-xl text-xs font-semibold bg-zinc-950 border border-zinc-700 text-white"
                >
                  <option value="L">L (7% Recovery)</option>
                  <option value="M">M (15% Recovery)</option>
                  <option value="Q">Q (25% Recovery)</option>
                  <option value="H">H (30% Recovery)</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Center Badge</label>
                <select
                  value={centerIcon}
                  onChange={(e) => setCenterIcon(e.target.value as any)}
                  className="w-full p-2 rounded-xl text-xs font-semibold bg-zinc-950 border border-zinc-700 text-white"
                >
                  <option value="none">None (Clean Matrix)</option>
                  <option value="wifi">📶 Wi-Fi Badge</option>
                  <option value="link">🔗 Link Badge</option>
                  <option value="user">👤 User Badge</option>
                  <option value="sparkles">✨ AI Emblem</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Live Preview Display Column (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-5">
          {/* Main QR Code Canvas Frame */}
          <div className={`p-6 rounded-2xl border shadow-lg flex flex-col items-center justify-center text-center space-y-4 ${
            theme === "dark" ? "bg-zinc-900 border-zinc-800" : "bg-white border-slate-200"
          }`}>
            <div className="flex items-center justify-between w-full pb-2 border-b border-zinc-800/60">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-indigo-400" />
                Live Real-Time QR Render
              </span>
              <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-mono font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> ISO/IEC 18004
              </span>
            </div>

            {/* Hidden Canvas for High Quality Local Rendering */}
            <canvas ref={canvasRef} className="hidden" />

            {/* Rendered Live QR Code Canvas Display */}
            <div
              className="p-5 rounded-2xl border shadow-2xl transition-all transform hover:scale-102 flex items-center justify-center"
              style={{ backgroundColor: bgColor }}
            >
              {dataUrl ? (
                <img
                  src={dataUrl}
                  alt="Real Standard QR Code"
                  className="max-w-full h-auto rounded-lg shadow-sm border border-black/5"
                  style={{ width: `${Math.min(qrSize, 280)}px`, height: `${Math.min(qrSize, 280)}px` }}
                />
              ) : (
                <div className="w-64 h-64 flex items-center justify-center text-slate-400 text-xs">
                  Generating Real Matrix...
                </div>
              )}
            </div>

            {qrError && (
              <div className="w-full mt-2 p-2.5 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-xs flex items-start gap-1.5">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{qrError}</span>
              </div>
            )}

            {/* Action Bar */}
            <div className="grid grid-cols-2 gap-2 w-full pt-1">
              <button
                onClick={handleDownloadPng}
                className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-md transition-all cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" /> Download PNG
              </button>
              <button
                onClick={handleCopyImage}
                className="w-full py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-slate-200 text-xs font-bold flex items-center justify-center gap-1.5 border border-zinc-700 transition-all cursor-pointer"
              >
                {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedLink ? "Copied!" : "Copy Image"}
              </button>
            </div>
          </div>

          {/* Raw Payload Inspector (Verification) */}
          <div className={`p-4 rounded-2xl border space-y-2 ${
            theme === "dark" ? "bg-zinc-900 border-zinc-800" : "bg-white border-slate-200"
          }`}>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-sky-400" />
                Raw Encoded Matrix Payload String:
              </span>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                Genuine Scannable String
              </span>
            </div>

            <div className="p-3 rounded-xl bg-zinc-950 font-mono text-xs text-indigo-300 break-all border border-zinc-800/80 max-h-28 overflow-y-auto custom-scrollbar">
              {rawPayload}
            </div>

            <p className="text-[10px] text-slate-400 leading-relaxed">
              When scanned by any camera phone, tablet, or barcode reader, this exact ISO standard payload will execute natively on the user's device!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

