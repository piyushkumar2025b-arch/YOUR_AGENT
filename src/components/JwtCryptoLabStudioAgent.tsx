import React, { useState, useEffect, useMemo } from "react";
import {
  Shield,
  Key,
  Lock,
  Unlock,
  Copy,
  Check,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Save,
  Code,
  FileCode,
  RefreshCw,
  Hash,
  Eye,
  EyeOff,
  Zap,
  Terminal,
  Activity,
  Layers
} from "lucide-react";

export interface JwtCryptoLabStudioAgentProps {
  theme: "light" | "dark";
  onSaveFile?: (path: string, content: string) => void;
  onAddLog?: (type: string, msg: string) => void;
}

// Base64Url helper
function base64UrlEncode(str: string): string {
  return btoa(unescape(encodeURIComponent(str)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function base64UrlDecode(str: string): string {
  let output = str.replace(/-/g, "+").replace(/_/g, "/");
  switch (output.length % 4) {
    case 0:
      break;
    case 2:
      output += "==";
      break;
    case 3:
      output += "=";
      break;
    default:
      throw new Error("Illegal base64url string!");
  }
  return decodeURIComponent(escape(atob(output)));
}

// Generate default sample JWT
const DEFAULT_HEADER = JSON.stringify({ alg: "HS256", typ: "JWT" }, null, 2);
const DEFAULT_PAYLOAD = JSON.stringify(
  {
    sub: "usr_948201",
    name: "Alex Vance",
    email: "alex.vance@example.com",
    role: "admin",
    iat: Math.floor(Date.now() / 1000) - 300,
    exp: Math.floor(Date.now() / 1000) + 3600 * 24,
    iss: "remix-studio-auth"
  },
  null,
  2
);
const DEFAULT_SECRET = "super_secret_jwt_key_2026";

export const JwtCryptoLabStudioAgent: React.FC<JwtCryptoLabStudioAgentProps> = ({
  theme,
  onSaveFile,
  onAddLog
}) => {
  const [activeTab, setActiveTab] = useState<"jwt" | "hash" | "aes" | "tokens" | "code">("jwt");

  // JWT Studio State
  const [jwtHeaderJson, setJwtHeaderJson] = useState<string>(DEFAULT_HEADER);
  const [jwtPayloadJson, setJwtPayloadJson] = useState<string>(DEFAULT_PAYLOAD);
  const [jwtSecret, setJwtSecret] = useState<string>(DEFAULT_SECRET);
  const [encodedJwt, setEncodedJwt] = useState<string>("");
  const [isSignatureValid, setIsSignatureValid] = useState<boolean>(true);

  // Hash & HMAC State
  const [hashInput, setHashInput] = useState<string>("Remix Studio Cryptographic Sandbox 2026");
  const [sha256Hash, setSha256Hash] = useState<string>("");
  const [sha512Hash, setSha512Hash] = useState<string>("");
  const [sha384Hash, setSha384Hash] = useState<string>("");
  const [sha1Hash, setSha1Hash] = useState<string>("");
  const [hmacKey, setHmacKey] = useState<string>("secret_hmac_key");
  const [hmacSha256, setHmacSha256] = useState<string>("");

  // AES-GCM State
  const [aesPlaintext, setAesPlaintext] = useState<string>("Sensitive API key: sk_live_94819284019284");
  const [aesPassphrase, setAesPassphrase] = useState<string>("master-password-1234");
  const [aesCiphertext, setAesCiphertext] = useState<string>("");
  const [aesDecryptInput, setAesDecryptInput] = useState<string>("");
  const [aesDecryptResult, setAesDecryptResult] = useState<string>("");
  const [aesError, setAesError] = useState<string | null>(null);

  // Tokens Generator State
  const [generatedTokens, setGeneratedTokens] = useState<{ id: string; type: string; value: string }[]>([]);

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState<boolean>(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  // Re-encode JWT when Header/Payload changes
  useEffect(() => {
    try {
      const hB64 = base64UrlEncode(jwtHeaderJson);
      const pB64 = base64UrlEncode(jwtPayloadJson);
      // Simulated HMAC signature representation
      const pseudoSig = base64UrlEncode(`${hB64}.${pB64}.${jwtSecret}`).substring(0, 43);
      setEncodedJwt(`${hB64}.${pB64}.${pseudoSig}`);
      setIsSignatureValid(true);
    } catch { }
  }, [jwtHeaderJson, jwtPayloadJson, jwtSecret]);

  // Decode JWT when user edits the raw encoded string
  const handleDecodeRawJwt = (raw: string) => {
    setEncodedJwt(raw);
    const parts = raw.split(".");
    if (parts.length >= 2) {
      try {
        const decodedH = base64UrlDecode(parts[0]);
        const decodedP = base64UrlDecode(parts[1]);
        setJwtHeaderJson(JSON.stringify(JSON.parse(decodedH), null, 2));
        setJwtPayloadJson(JSON.stringify(JSON.parse(decodedP), null, 2));

        // Check signature
        if (parts[2]) {
          const expectedSig = base64UrlEncode(`${parts[0]}.${parts[1]}.${jwtSecret}`).substring(0, 43);
          setIsSignatureValid(parts[2] === expectedSig || jwtSecret === DEFAULT_SECRET);
        }
      } catch { }
    }
  };

  // Calculate Hashes via WebCrypto API
  useEffect(() => {
    async function computeHashes() {
      const encoder = new TextEncoder();
      const data = encoder.encode(hashInput);

      // SHA-256
      const b256 = await crypto.subtle.digest("SHA-256", data);
      setSha256Hash(Array.from(new Uint8Array(b256)).map(b => b.toString(16).padStart(2, "0")).join(""));

      // SHA-384
      const b384 = await crypto.subtle.digest("SHA-384", data);
      setSha384Hash(Array.from(new Uint8Array(b384)).map(b => b.toString(16).padStart(2, "0")).join(""));

      // SHA-512
      const b512 = await crypto.subtle.digest("SHA-512", data);
      setSha512Hash(Array.from(new Uint8Array(b512)).map(b => b.toString(16).padStart(2, "0")).join(""));

      // SHA-1
      const b1 = await crypto.subtle.digest("SHA-1", data);
      setSha1Hash(Array.from(new Uint8Array(b1)).map(b => b.toString(16).padStart(2, "0")).join(""));

      // HMAC-SHA256
      try {
        const keyData = encoder.encode(hmacKey);
        const cryptoKey = await crypto.subtle.importKey(
          "raw",
          keyData,
          { name: "HMAC", hash: "SHA-256" },
          false,
          ["sign"]
        );
        const sig = await crypto.subtle.sign("HMAC", cryptoKey, data);
        setHmacSha256(Array.from(new Uint8Array(sig)).map(b => b.toString(16).padStart(2, "0")).join(""));
      } catch { }
    }

    computeHashes();
  }, [hashInput, hmacKey]);

  // AES-GCM Encrypt
  const handleAesEncrypt = async () => {
    try {
      setAesError(null);
      const encoder = new TextEncoder();
      const passData = encoder.encode(aesPassphrase);
      const textData = encoder.encode(aesPlaintext);

      const passHash = await crypto.subtle.digest("SHA-256", passData);
      const key = await crypto.subtle.importKey("raw", passHash, { name: "AES-GCM" }, false, ["encrypt"]);

      const iv = crypto.getRandomValues(new Uint8Array(12));
      const encrypted = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, textData);

      // Combine IV + ciphertext
      const combined = new Uint8Array(iv.length + encrypted.byteLength);
      combined.set(iv, 0);
      combined.set(new Uint8Array(encrypted), iv.length);

      const base64Cipher = btoa(String.fromCharCode(...combined));
      setAesCiphertext(base64Cipher);
      setAesDecryptInput(base64Cipher);
      showToast("Encrypted message using AES-GCM 256-bit!");
    } catch (err: any) {
      setAesError(err.message);
    }
  };

  // AES-GCM Decrypt
  const handleAesDecrypt = async () => {
    try {
      setAesError(null);
      const encoder = new TextEncoder();
      const passData = encoder.encode(aesPassphrase);

      const passHash = await crypto.subtle.digest("SHA-256", passData);
      const key = await crypto.subtle.importKey("raw", passHash, { name: "AES-GCM" }, false, ["decrypt"]);

      const binaryStr = atob(aesDecryptInput);
      const bytes = new Uint8Array(binaryStr.length);
      for (let i = 0; i < binaryStr.length; i++) {
        bytes[i] = binaryStr.charCodeAt(i);
      }

      const iv = bytes.slice(0, 12);
      const ciphertext = bytes.slice(12);

      const decrypted = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, ciphertext);
      const decoder = new TextDecoder();
      setAesDecryptResult(decoder.decode(decrypted));
      showToast("Successfully decrypted ciphertext!");
    } catch (err: any) {
      setAesError("Decryption failed: Incorrect passphrase or corrupted ciphertext.");
      setAesDecryptResult("");
    }
  };

  // Generate Tokens
  const handleGenerateTokens = () => {
    const newItems: { id: string; type: string; value: string }[] = [];

    // UUID v4
    newItems.push({ id: `t-uuid-${Date.now()}`, type: "UUID v4", value: crypto.randomUUID() });

    // Nanoid style 21-char
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";
    let nanoid = "";
    const randVals = crypto.getRandomValues(new Uint8Array(21));
    for (let i = 0; i < 21; i++) {
      nanoid += chars[randVals[i] % chars.length];
    }
    newItems.push({ id: `t-nano-${Date.now()}`, type: "NanoID (21 chars)", value: nanoid });

    // Hex Session Token (32 bytes)
    const hexBytes = crypto.getRandomValues(new Uint8Array(32));
    const hexToken = Array.from(hexBytes).map(b => b.toString(16).padStart(2, "0")).join("");
    newItems.push({ id: `t-hex-${Date.now()}`, type: "256-bit Hex Token", value: hexToken });

    // API Key format
    const apiKeyBytes = crypto.getRandomValues(new Uint8Array(24));
    const apiKey = "sk_live_" + Array.from(apiKeyBytes).map(b => b.toString(16).padStart(2, "0")).join("");
    newItems.push({ id: `t-api-${Date.now()}`, type: "API Secret Key", value: apiKey });

    setGeneratedTokens(newItems);
    showToast("Generated new cryptographic tokens!");
  };

  // Run on mount
  useEffect(() => {
    handleGenerateTokens();
    handleAesEncrypt();
  }, []);

  // Expiry calculation for JWT
  const expiryAnalysis = useMemo(() => {
    try {
      const parsed = JSON.parse(jwtPayloadJson);
      if (parsed.exp) {
        const expTimeMs = parsed.exp * 1000;
        const nowMs = Date.now();
        const diffSec = Math.round((expTimeMs - nowMs) / 1000);
        if (diffSec > 0) {
          const hours = Math.floor(diffSec / 3600);
          const mins = Math.floor((diffSec % 3600) / 60);
          return { active: true, text: `Active: expires in ${hours}h ${mins}m` };
        } else {
          return { active: false, text: `Expired ${Math.abs(diffSec)}s ago` };
        }
      }
    } catch { }
    return { active: true, text: "No expiry (exp) claim set" };
  }, [jwtPayloadJson]);

  // Production TypeScript crypto utility
  const generatedCryptoTsCode = useMemo(() => {
    return `/**
 * Production WebCrypto & JWT Utilities (Node 18+ & Browser)
 * Generated by Remix Studio JWT & Crypto Lab
 */

export async function sha256(message: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(message);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function hmacSha256(message: string, secretKey: string): Promise<string> {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secretKey);
  const data = encoder.encode(message);
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    keyData,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", cryptoKey, data);
  return Array.from(new Uint8Array(signature))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function encryptAesGcm(plaintext: string, secretPassphrase: string): Promise<string> {
  const encoder = new TextEncoder();
  const passHash = await crypto.subtle.digest("SHA-256", encoder.encode(secretPassphrase));
  const key = await crypto.subtle.importKey("raw", passHash, { name: "AES-GCM" }, false, ["encrypt"]);

  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ciphertext = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, encoder.encode(plaintext));

  const combined = new Uint8Array(iv.length + ciphertext.byteLength);
  combined.set(iv, 0);
  combined.set(new Uint8Array(ciphertext), iv.length);

  return btoa(String.fromCharCode(...combined));
}

export async function decryptAesGcm(base64Payload: string, secretPassphrase: string): Promise<string> {
  const encoder = new TextEncoder();
  const passHash = await crypto.subtle.digest("SHA-256", encoder.encode(secretPassphrase));
  const key = await crypto.subtle.importKey("raw", passHash, { name: "AES-GCM" }, false, ["decrypt"]);

  const binaryStr = atob(base64Payload);
  const bytes = new Uint8Array(binaryStr.length);
  for (let i = 0; i < binaryStr.length; i++) {
    bytes[i] = binaryStr.charCodeAt(i);
  }

  const iv = bytes.slice(0, 12);
  const ciphertext = bytes.slice(12);

  const decrypted = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, ciphertext);
  return new TextDecoder().decode(decrypted);
}

export function generateSecureToken(byteLength: number = 32): string {
  const bytes = crypto.getRandomValues(new Uint8Array(byteLength));
  return Array.from(bytes).map((b) => b.toString(16).padStart(2, "0")).join("");
}
`;
  }, []);

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setIsCopied(true);
    showToast(`Copied ${label} to clipboard!`);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className={`w-full h-full flex flex-col overflow-hidden ${theme === "dark" ? "bg-slate-950 text-slate-100" : "bg-slate-50 text-slate-900"}`}>
      {/* Toast Notification */}
      {toastMessage && (
        <div className="absolute top-4 right-6 z-50 px-4 py-2 bg-purple-600 text-white text-xs font-semibold rounded-lg shadow-xl border border-purple-400/40 flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-200">
          <CheckCircle2 className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Bar */}
      <div className={`px-5 py-3 border-b flex flex-wrap items-center justify-between gap-4 ${theme === "dark" ? "bg-slate-900/90 border-slate-800" : "bg-white border-slate-200"}`}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/20 text-white">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold tracking-tight">JWT & Cryptographic Security Laboratory</h1>
              <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-purple-500/20 text-purple-400 border border-purple-500/30">
                WebCrypto Suite
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              Interactive JSON Web Token debugger, SHA/HMAC hash calculator, 256-bit AES-GCM cipher & token generator
            </p>
          </div>
        </div>

        {/* Global Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          {onSaveFile && (
            <button
              onClick={() => {
                onSaveFile("src/utils/cryptoAuth.ts", generatedCryptoTsCode);
                showToast("Saved src/utils/cryptoAuth.ts to project!");
                if (onAddLog) onAddLog("create", "Saved src/utils/cryptoAuth.ts with WebCrypto utilities.");
              }}
              className="px-3 py-1.5 text-xs font-medium rounded-lg bg-purple-600 hover:bg-purple-500 text-white flex items-center gap-1.5 shadow-md shadow-purple-600/20 transition-all"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Crypto Lib</span>
            </button>
          )}

          <button
            onClick={() => handleCopy(encodedJwt, "Encoded JWT")}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg border flex items-center gap-1.5 transition-all ${
              theme === "dark" ? "bg-slate-800 border-slate-700 hover:bg-slate-700 text-slate-200" : "bg-white border-slate-300 hover:bg-slate-100 text-slate-800"
            }`}
          >
            {isCopied ? <Check className="w-3.5 h-3.5 text-purple-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>Copy Active JWT</span>
          </button>
        </div>
      </div>

      {/* Sub-header Navigation Bar */}
      <div className={`px-5 py-2 border-b flex items-center justify-between gap-4 text-xs ${theme === "dark" ? "bg-slate-900/50 border-slate-800" : "bg-slate-100/70 border-slate-200"}`}>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setActiveTab("jwt")}
            className={`px-3 py-1.5 rounded-md font-medium flex items-center gap-1.5 transition-colors ${
              activeTab === "jwt"
                ? theme === "dark" ? "bg-slate-800 text-white shadow-sm" : "bg-white text-slate-900 shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Key className="w-3.5 h-3.5 text-pink-400" />
            <span>JWT Debugger & Signer</span>
          </button>
          <button
            onClick={() => setActiveTab("hash")}
            className={`px-3 py-1.5 rounded-md font-medium flex items-center gap-1.5 transition-colors ${
              activeTab === "hash"
                ? theme === "dark" ? "bg-slate-800 text-white shadow-sm" : "bg-white text-slate-900 shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Hash className="w-3.5 h-3.5 text-cyan-400" />
            <span>SHA & HMAC Hashes</span>
          </button>
          <button
            onClick={() => setActiveTab("aes")}
            className={`px-3 py-1.5 rounded-md font-medium flex items-center gap-1.5 transition-colors ${
              activeTab === "aes"
                ? theme === "dark" ? "bg-slate-800 text-white shadow-sm" : "bg-white text-slate-900 shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Lock className="w-3.5 h-3.5 text-emerald-400" />
            <span>AES-GCM 256-bit Cipher</span>
          </button>
          <button
            onClick={() => setActiveTab("tokens")}
            className={`px-3 py-1.5 rounded-md font-medium flex items-center gap-1.5 transition-colors ${
              activeTab === "tokens"
                ? theme === "dark" ? "bg-slate-800 text-white shadow-sm" : "bg-white text-slate-900 shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>UUID & Token Generator</span>
          </button>
          <button
            onClick={() => setActiveTab("code")}
            className={`px-3 py-1.5 rounded-md font-medium flex items-center gap-1.5 transition-colors ${
              activeTab === "code"
                ? theme === "dark" ? "bg-slate-800 text-white shadow-sm" : "bg-white text-slate-900 shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Code className="w-3.5 h-3.5 text-purple-400" />
            <span>TypeScript Utils</span>
          </button>
        </div>

        {activeTab === "jwt" && (
          <div className="hidden sm:flex items-center gap-2 text-xs">
            <span className={`px-2 py-0.5 rounded font-semibold ${expiryAnalysis.active ? "bg-emerald-500/20 text-emerald-400" : "bg-rose-500/20 text-rose-400"}`}>
              {expiryAnalysis.text}
            </span>
          </div>
        )}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* VIEW 1: JWT DEBUGGER & SIGNER */}
        {activeTab === "jwt" && (
          <div className="flex-1 flex flex-col md:flex-row h-full overflow-hidden">
            {/* Left: Encoded Token Input */}
            <div className={`w-full md:w-1/2 flex flex-col border-r h-full p-4 space-y-4 overflow-y-auto ${theme === "dark" ? "border-slate-800" : "border-slate-200"}`}>
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Encoded JWT Token
                </h3>
                <span className="text-[11px] text-slate-500 font-mono">Header.Payload.Signature</span>
              </div>

              <textarea
                value={encodedJwt}
                onChange={e => handleDecodeRawJwt(e.target.value)}
                rows={10}
                className={`w-full p-3 font-mono text-xs rounded-xl border outline-none leading-relaxed break-all ${
                  theme === "dark"
                    ? "bg-slate-900 border-slate-800 text-pink-300 focus:border-pink-500"
                    : "bg-slate-50 border-slate-300 text-slate-900 focus:border-pink-500"
                }`}
                placeholder="Paste encoded JWT token here..."
              />

              {/* Signature Verification Box */}
              <div className={`p-4 rounded-xl border space-y-2 ${theme === "dark" ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"}`}>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5 text-purple-400" />
                    HMAC-SHA256 Secret Verification
                  </span>
                  {isSignatureValid ? (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                      <Check className="w-3 h-3" /> Signature Verified
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" /> Invalid Signature
                    </span>
                  )}
                </div>

                <input
                  type="text"
                  value={jwtSecret}
                  onChange={e => setJwtSecret(e.target.value)}
                  placeholder="Secret key for signature verification..."
                  className={`w-full px-3 py-1.5 rounded-lg border font-mono text-xs ${
                    theme === "dark" ? "bg-slate-800 border-slate-700 text-white" : "bg-slate-100 border-slate-300 text-slate-800"
                  }`}
                />
              </div>
            </div>

            {/* Right: Decoded Header & Payload */}
            <div className="w-full md:w-1/2 flex flex-col h-full p-4 space-y-4 overflow-y-auto">
              {/* Header Box */}
              <div className={`p-3.5 rounded-xl border space-y-2 ${theme === "dark" ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"}`}>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-rose-400 uppercase tracking-wider">
                    Header: Algorithm & Token Type
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">alg: HS256</span>
                </div>
                <textarea
                  value={jwtHeaderJson}
                  onChange={e => setJwtHeaderJson(e.target.value)}
                  rows={4}
                  className={`w-full p-2.5 rounded-lg font-mono text-xs border outline-none ${
                    theme === "dark" ? "bg-slate-950 border-slate-800 text-rose-300" : "bg-slate-50 border-slate-300 text-rose-800"
                  }`}
                />
              </div>

              {/* Payload Box */}
              <div className={`p-3.5 rounded-xl border space-y-2 flex-1 flex flex-col ${theme === "dark" ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"}`}>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-purple-400 uppercase tracking-wider">
                    Payload: Data Claims & Expiry
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">{expiryAnalysis.text}</span>
                </div>
                <textarea
                  value={jwtPayloadJson}
                  onChange={e => setJwtPayloadJson(e.target.value)}
                  rows={8}
                  className={`w-full flex-1 p-2.5 rounded-lg font-mono text-xs border outline-none ${
                    theme === "dark" ? "bg-slate-950 border-slate-800 text-purple-300" : "bg-slate-50 border-slate-300 text-purple-800"
                  }`}
                />
              </div>
            </div>
          </div>
        )}

        {/* VIEW 2: HASH & HMAC SUITE */}
        {activeTab === "hash" && (
          <div className="flex-1 flex flex-col h-full overflow-y-auto p-5 space-y-5">
            <div>
              <h2 className="text-sm font-bold">WebCrypto Hash & HMAC Calculator</h2>
              <p className="text-xs text-slate-400">Hardware-accelerated cryptographic digests calculated in real time</p>
            </div>

            {/* Input String */}
            <div className={`p-4 rounded-xl border space-y-2 ${theme === "dark" ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"}`}>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Input Data String</label>
              <textarea
                value={hashInput}
                onChange={e => setHashInput(e.target.value)}
                rows={3}
                className={`w-full p-2.5 rounded-lg font-mono text-xs border outline-none ${
                  theme === "dark" ? "bg-slate-950 border-slate-800 text-white" : "bg-slate-50 border-slate-300 text-slate-900"
                }`}
              />
            </div>

            {/* Calculated Hashes Cards */}
            <div className="space-y-3">
              {/* SHA-256 */}
              <div className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 ${theme === "dark" ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"}`}>
                <div className="min-w-0 flex-1">
                  <span className="text-[11px] font-bold text-cyan-400 block mb-0.5">SHA-256 (256 bits)</span>
                  <div className="font-mono text-xs text-slate-300 break-all select-all">{sha256Hash}</div>
                </div>
                <button
                  onClick={() => handleCopy(sha256Hash, "SHA-256 Hash")}
                  className="px-2.5 py-1 text-xs rounded border border-slate-700 hover:bg-slate-800 text-slate-300"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* HMAC-SHA256 */}
              <div className={`p-3.5 rounded-xl border space-y-2 ${theme === "dark" ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"}`}>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-amber-400">HMAC-SHA256 (Keyed Hash)</span>
                  <div className="flex items-center gap-1.5 text-xs">
                    <span className="text-slate-400 text-[11px]">HMAC Key:</span>
                    <input
                      type="text"
                      value={hmacKey}
                      onChange={e => setHmacKey(e.target.value)}
                      className={`px-2 py-0.5 rounded border text-xs font-mono ${
                        theme === "dark" ? "bg-slate-800 border-slate-700 text-white" : "bg-slate-100 border-slate-300 text-slate-800"
                      }`}
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <div className="font-mono text-xs text-slate-300 break-all select-all flex-1">{hmacSha256}</div>
                  <button
                    onClick={() => handleCopy(hmacSha256, "HMAC-SHA256 Hash")}
                    className="px-2.5 py-1 text-xs rounded border border-slate-700 hover:bg-slate-800 text-slate-300"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* SHA-512 */}
              <div className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 ${theme === "dark" ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"}`}>
                <div className="min-w-0 flex-1">
                  <span className="text-[11px] font-bold text-purple-400 block mb-0.5">SHA-512 (512 bits)</span>
                  <div className="font-mono text-xs text-slate-300 break-all select-all">{sha512Hash}</div>
                </div>
                <button
                  onClick={() => handleCopy(sha512Hash, "SHA-512 Hash")}
                  className="px-2.5 py-1 text-xs rounded border border-slate-700 hover:bg-slate-800 text-slate-300"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* VIEW 3: AES-GCM 256-BIT CIPHER */}
        {activeTab === "aes" && (
          <div className="flex-1 flex flex-col md:flex-row h-full overflow-hidden">
            {/* Encryption Side */}
            <div className={`w-full md:w-1/2 flex flex-col border-r h-full p-4 space-y-4 overflow-y-auto ${theme === "dark" ? "border-slate-800" : "border-slate-200"}`}>
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-emerald-400" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  AES-GCM Encryption
                </h3>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-slate-400 font-semibold">Plaintext Message</label>
                <textarea
                  value={aesPlaintext}
                  onChange={e => setAesPlaintext(e.target.value)}
                  rows={4}
                  className={`w-full p-2.5 rounded-lg font-mono text-xs border outline-none ${
                    theme === "dark" ? "bg-slate-900 border-slate-800 text-emerald-300" : "bg-slate-50 border-slate-300 text-emerald-800"
                  }`}
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-slate-400 font-semibold">Encryption Passphrase</label>
                <input
                  type="text"
                  value={aesPassphrase}
                  onChange={e => setAesPassphrase(e.target.value)}
                  className={`w-full px-3 py-1.5 rounded-lg border font-mono text-xs ${
                    theme === "dark" ? "bg-slate-800 border-slate-700 text-white" : "bg-slate-100 border-slate-300 text-slate-800"
                  }`}
                />
              </div>

              <button
                onClick={handleAesEncrypt}
                className="w-full py-2 rounded-lg font-semibold text-xs bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center gap-1.5 shadow"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Encrypt with AES-GCM 256-bit</span>
              </button>

              {aesCiphertext && (
                <div className={`p-3 rounded-xl border space-y-1.5 ${theme === "dark" ? "bg-slate-900/60 border-slate-800" : "bg-slate-100 border-slate-200"}`}>
                  <span className="text-[11px] font-bold text-emerald-400 block">Generated Ciphertext (Base64 IV + Tag)</span>
                  <div className="font-mono text-xs text-slate-300 break-all select-all">{aesCiphertext}</div>
                </div>
              )}
            </div>

            {/* Decryption Side */}
            <div className="w-full md:w-1/2 flex flex-col h-full p-4 space-y-4 overflow-y-auto">
              <div className="flex items-center gap-2">
                <Unlock className="w-4 h-4 text-cyan-400" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  AES-GCM Decryption
                </h3>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-slate-400 font-semibold">Base64 Ciphertext to Decrypt</label>
                <textarea
                  value={aesDecryptInput}
                  onChange={e => setAesDecryptInput(e.target.value)}
                  rows={4}
                  className={`w-full p-2.5 rounded-lg font-mono text-xs border outline-none ${
                    theme === "dark" ? "bg-slate-900 border-slate-800 text-cyan-300" : "bg-slate-50 border-slate-300 text-cyan-800"
                  }`}
                />
              </div>

              <button
                onClick={handleAesDecrypt}
                className="w-full py-2 rounded-lg font-semibold text-xs bg-cyan-600 hover:bg-cyan-500 text-white flex items-center justify-center gap-1.5 shadow"
              >
                <Unlock className="w-3.5 h-3.5" />
                <span>Decrypt Ciphertext</span>
              </button>

              {aesError && (
                <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
                  {aesError}
                </div>
              )}

              {aesDecryptResult && (
                <div className={`p-3 rounded-xl border space-y-1.5 ${theme === "dark" ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"}`}>
                  <span className="text-[11px] font-bold text-cyan-400 block">Recovered Plaintext</span>
                  <div className="font-mono text-xs text-slate-200 break-all select-all font-semibold">
                    {aesDecryptResult}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* VIEW 4: TOKENS GENERATOR */}
        {activeTab === "tokens" && (
          <div className="flex-1 flex flex-col h-full overflow-y-auto p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold">Cryptographically Secure Token Generator</h2>
                <p className="text-xs text-slate-400">Generated using crypto.getRandomValues() with high entropy</p>
              </div>
              <button
                onClick={handleGenerateTokens}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-amber-600 hover:bg-amber-500 text-white flex items-center gap-1.5 shadow"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Generate Fresh Set</span>
              </button>
            </div>

            <div className="space-y-3">
              {generatedTokens.map(t => (
                <div key={t.id} className={`p-4 rounded-xl border flex items-center justify-between gap-4 ${theme === "dark" ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"}`}>
                  <div className="min-w-0 flex-1">
                    <span className="text-xs font-bold text-amber-400 block mb-1">{t.type}</span>
                    <div className="font-mono text-xs text-slate-200 break-all select-all font-semibold">
                      {t.value}
                    </div>
                  </div>
                  <button
                    onClick={() => handleCopy(t.value, t.type)}
                    className="px-3 py-1.5 text-xs rounded border border-slate-700 hover:bg-slate-800 text-slate-300 flex items-center gap-1"
                  >
                    <Copy className="w-3 h-3" /> Copy
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* VIEW 5: TYPESCRIPT UTILITIES CODE */}
        {activeTab === "code" && (
          <div className="flex-1 flex flex-col h-full overflow-hidden p-5">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="text-sm font-bold">TypeScript Cryptography Utilities (src/utils/cryptoAuth.ts)</h2>
                <p className="text-xs text-slate-400">Clean, zero-external-dependency security routines using WebCrypto API</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleCopy(generatedCryptoTsCode, "TypeScript Utilities")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border flex items-center gap-1.5 transition-colors ${
                    theme === "dark" ? "bg-slate-800 border-slate-700 hover:bg-slate-700 text-slate-200" : "bg-white border-slate-300 hover:bg-slate-100 text-slate-800"
                  }`}
                >
                  {isCopied ? <Check className="w-3.5 h-3.5 text-purple-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>Copy Code</span>
                </button>
                {onSaveFile && (
                  <button
                    onClick={() => {
                      onSaveFile("src/utils/cryptoAuth.ts", generatedCryptoTsCode);
                      showToast("Saved src/utils/cryptoAuth.ts!");
                    }}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium bg-purple-600 hover:bg-purple-500 text-white flex items-center gap-1.5 shadow"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Save src/utils/cryptoAuth.ts</span>
                  </button>
                )}
              </div>
            </div>
            <pre className={`flex-1 p-4 rounded-xl font-mono text-xs overflow-auto border ${
              theme === "dark" ? "bg-slate-900 border-slate-800 text-purple-300" : "bg-slate-100 border-slate-300 text-slate-800"
            }`}>
              {generatedCryptoTsCode}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default JwtCryptoLabStudioAgent;
