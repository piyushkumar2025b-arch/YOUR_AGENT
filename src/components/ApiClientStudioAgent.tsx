import React, { useState, useEffect, useRef } from "react";
import {
  Send,
  Plus,
  Trash2,
  Copy,
  Check,
  Code,
  Clock,
  Database,
  Globe,
  Settings,
  AlertCircle,
  CheckCircle,
  RefreshCw,
  Download,
  Share2,
  Terminal,
  Zap,
  ChevronDown,
  Layers,
  FileJson,
  Sliders,
  Sparkles
} from "lucide-react";
import { fetchWithAuth } from "../utils/apiAuth";

interface ApiClientStudioAgentProps {
  apiKey?: string;
  theme?: "light" | "dark" | string;
  onAddLog?: (type: string, message: string) => void;
}

interface KeyValuePair {
  id: string;
  key: string;
  value: string;
  enabled: boolean;
}

interface SavedRequest {
  id: string;
  name: string;
  method: string;
  url: string;
  timestamp: number;
}

const PRESET_REQUESTS = [
  {
    name: "Server Health Check",
    method: "GET",
    url: "/api/health",
    headers: [],
    body: ""
  },
  {
    name: "Available Models",
    method: "GET",
    url: "/api/models",
    headers: [],
    body: ""
  },
  {
    name: "JSONPlaceholder Users",
    method: "GET",
    url: "https://jsonplaceholder.typicode.com/users",
    headers: [{ id: "1", key: "Accept", value: "application/json", enabled: true }],
    body: ""
  },
  {
    name: "JSONPlaceholder Create Post",
    method: "POST",
    url: "https://jsonplaceholder.typicode.com/posts",
    headers: [{ id: "1", key: "Content-Type", value: "application/json", enabled: true }],
    body: JSON.stringify({
      title: "Built with Remix Studio",
      body: "Testing API Client inside developer workspace",
      userId: 1
    }, null, 2)
  },
  {
    name: "Random Dad Joke API",
    method: "GET",
    url: "/api/jokes/random?category=dad",
    headers: [],
    body: ""
  },
  {
    name: "GitHub Public Repository Info",
    method: "GET",
    url: "https://api.github.com/repos/facebook/react",
    headers: [{ id: "1", key: "Accept", value: "application/vnd.github.v3+json", enabled: true }],
    body: ""
  }
];

export const ApiClientStudioAgent: React.FC<ApiClientStudioAgentProps> = ({
  apiKey = "",
  theme = "dark",
  onAddLog
}) => {
  const isDark = theme !== "light";

  const [method, setMethod] = useState<string>("GET");
  const [url, setUrl] = useState<string>("/api/health");
  const [activeTab, setActiveTab] = useState<"params" | "headers" | "body" | "auth" | "snippets">("params");
  
  // Params & Headers
  const [params, setParams] = useState<KeyValuePair[]>([
    { id: "p1", key: "", value: "", enabled: true }
  ]);
  const [headers, setHeaders] = useState<KeyValuePair[]>([
    { id: "h1", key: "Content-Type", value: "application/json", enabled: true }
  ]);

  // Auth
  const [authType, setAuthType] = useState<"none" | "bearer" | "basic" | "apikey">("none");
  const [bearerToken, setBearerToken] = useState<string>("");
  const [basicUser, setBasicUser] = useState<string>("");
  const [basicPass, setBasicPass] = useState<string>("");
  const [apiKeyHeader, setApiKeyHeader] = useState<string>("x-api-key");
  const [apiKeyValue, setApiKeyValue] = useState<string>("");

  // Body
  const [bodyType, setBodyType] = useState<"json" | "raw">("json");
  const [bodyContent, setBodyContent] = useState<string>("{\n  \n}");

  // Response state
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [responseStatus, setResponseStatus] = useState<number | null>(null);
  const [responseStatusText, setResponseStatusText] = useState<string>("");
  const [responseTimeMs, setResponseTimeMs] = useState<number | null>(null);
  const [responseSizeBytes, setResponseSizeBytes] = useState<number | null>(null);
  const [responseData, setResponseData] = useState<any>(null);
  const [responseHeaders, setResponseHeaders] = useState<Record<string, string>>({});
  const [responseView, setResponseView] = useState<"pretty" | "raw" | "headers">("pretty");
  const [responseFilter, setResponseFilter] = useState<string>("");
  const [requestError, setRequestError] = useState<string | null>(null);

  // Copied indicator
  const [copiedResponse, setCopiedResponse] = useState<boolean>(false);
  const [copiedSnippet, setCopiedSnippet] = useState<string | null>(null);

  // Snippet language
  const [snippetLang, setSnippetLang] = useState<"curl" | "fetch" | "axios" | "python">("curl");

  // History & Presets
  const [history, setHistory] = useState<SavedRequest[]>(() => {
    try {
      const saved = localStorage.getItem("remix_api_client_history");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Sync params to URL
  const updateUrlWithParams = (newParams: KeyValuePair[]) => {
    try {
      const baseUrl = url.split("?")[0];
      const valid = newParams.filter(p => p.enabled && p.key.trim());
      if (valid.length === 0) {
        setUrl(baseUrl);
        return;
      }
      const searchParams = new URLSearchParams();
      valid.forEach(p => searchParams.append(p.key.trim(), p.value));
      setUrl(`${baseUrl}?${searchParams.toString()}`);
    } catch {
      // Ignore URL parse error
    }
  };

  // Add param row
  const addParamRow = () => {
    const updated = [...params, { id: Math.random().toString(), key: "", value: "", enabled: true }];
    setParams(updated);
  };

  // Remove param row
  const removeParamRow = (id: string) => {
    const updated = params.filter(p => p.id !== id);
    setParams(updated);
    updateUrlWithParams(updated);
  };

  // Update param row
  const updateParamRow = (id: string, field: "key" | "value" | "enabled", val: any) => {
    const updated = params.map(p => (p.id === id ? { ...p, [field]: val } : p));
    setParams(updated);
    if (field === "enabled" || field === "key" || field === "value") {
      updateUrlWithParams(updated);
    }
  };

  // Add header row
  const addHeaderRow = () => {
    setHeaders([...headers, { id: Math.random().toString(), key: "", value: "", enabled: true }]);
  };

  // Remove header row
  const removeHeaderRow = (id: string) => {
    setHeaders(headers.filter(h => h.id !== id));
  };

  // Update header row
  const updateHeaderRow = (id: string, field: "key" | "value" | "enabled", val: any) => {
    setHeaders(headers.map(h => (h.id === id ? { ...h, [field]: val } : h)));
  };

  // Prettify JSON body
  const prettifyJson = () => {
    try {
      const parsed = JSON.parse(bodyContent);
      setBodyContent(JSON.stringify(parsed, null, 2));
    } catch {
      // Invalid JSON
    }
  };

  // Load a preset
  const loadPreset = (preset: typeof PRESET_REQUESTS[0]) => {
    setMethod(preset.method);
    setUrl(preset.url);
    if (preset.headers && preset.headers.length > 0) {
      setHeaders(preset.headers);
    }
    if (preset.body) {
      setBodyContent(preset.body);
      setBodyType("json");
    }
  };

  // Execute Request
  const executeRequest = async () => {
    if (!url.trim()) return;
    setIsLoading(true);
    setRequestError(null);
    setResponseStatus(null);
    setResponseData(null);

    const compiledHeaders: Record<string, string> = {};
    headers.filter(h => h.enabled && h.key.trim()).forEach(h => {
      compiledHeaders[h.key.trim()] = h.value;
    });

    // Apply Auth
    if (authType === "bearer" && bearerToken.trim()) {
      compiledHeaders["Authorization"] = `Bearer ${bearerToken.trim()}`;
    } else if (authType === "basic" && (basicUser || basicPass)) {
      compiledHeaders["Authorization"] = `Basic ${btoa(`${basicUser}:${basicPass}`)}`;
    } else if (authType === "apikey" && apiKeyHeader.trim() && apiKeyValue.trim()) {
      compiledHeaders[apiKeyHeader.trim()] = apiKeyValue.trim();
    }

    let parsedBody: any = undefined;
    if (["POST", "PUT", "PATCH", "DELETE"].includes(method) && bodyContent.trim()) {
      if (bodyType === "json") {
        try {
          parsedBody = JSON.parse(bodyContent);
        } catch {
          parsedBody = bodyContent;
        }
      } else {
        parsedBody = bodyContent;
      }
    }

    try {
      const res = await fetchWithAuth(
        "/api/http-client/execute",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            url: url.trim(),
            method,
            headers: compiledHeaders,
            body: parsedBody
          })
        },
        apiKey
      );

      const result = await res.json();

      if (!res.ok && !result.status) {
        setRequestError(result.error || `HTTP ${res.status}`);
        return;
      }

      setResponseStatus(result.status);
      setResponseStatusText(result.statusText || "");
      setResponseTimeMs(result.timeMs);
      setResponseSizeBytes(result.sizeBytes);
      setResponseHeaders(result.headers || {});
      setResponseData(result.data);

      // Save to history
      const newHistoryItem: SavedRequest = {
        id: Math.random().toString(),
        name: `${method} ${url.split("?")[0]}`,
        method,
        url,
        timestamp: Date.now()
      };
      const updatedHistory = [newHistoryItem, ...history.filter(h => h.url !== url)].slice(0, 20);
      setHistory(updatedHistory);
      try {
        localStorage.setItem("remix_api_client_history", JSON.stringify(updatedHistory));
      } catch {}

      if (onAddLog) {
        onAddLog("api_test", `${method} ${url} -> ${result.status} (${result.timeMs}ms)`);
      }
    } catch (err: any) {
      setRequestError(err?.message || "Failed to execute request.");
    } finally {
      setIsLoading(false);
    }
  };

  // Generate code snippet
  const generateSnippet = (lang: "curl" | "fetch" | "axios" | "python"): string => {
    const compiledHeaders: Record<string, string> = {};
    headers.filter(h => h.enabled && h.key.trim()).forEach(h => {
      compiledHeaders[h.key.trim()] = h.value;
    });

    if (authType === "bearer" && bearerToken.trim()) {
      compiledHeaders["Authorization"] = `Bearer ${bearerToken.trim()}`;
    }

    if (lang === "curl") {
      let cmd = `curl -X ${method} "${url}"`;
      Object.entries(compiledHeaders).forEach(([k, v]) => {
        cmd += ` \\\n  -H "${k}: ${v}"`;
      });
      if (["POST", "PUT", "PATCH"].includes(method) && bodyContent.trim()) {
        cmd += ` \\\n  -d '${bodyContent.replace(/'/g, "'\\''")}'`;
      }
      return cmd;
    }

    if (lang === "fetch") {
      const opts: any = { method, headers: compiledHeaders };
      if (["POST", "PUT", "PATCH"].includes(method) && bodyContent.trim()) {
        opts.body = bodyContent;
      }
      return `fetch("${url}", ${JSON.stringify(opts, null, 2)})\n  .then(res => res.json())\n  .then(data => console.log(data))\n  .catch(err => console.error(err));`;
    }

    if (lang === "axios") {
      return `import axios from "axios";\n\nconst response = await axios({\n  method: "${method.toLowerCase()}",\n  url: "${url}",\n  headers: ${JSON.stringify(compiledHeaders, null, 2)},\n  data: ${bodyContent.trim() || "{}"}\n});\nconsole.log(response.data);`;
    }

    if (lang === "python") {
      return `import requests\n\nheaders = ${JSON.stringify(compiledHeaders, null, 2)}\nurl = "${url}"\n\nresponse = requests.${method.toLowerCase()}(\n    url,\n    headers=headers,\n    ${bodyContent.trim() ? `json=${bodyContent.trim()}` : ""}\n)\nprint(response.status_code)\nprint(response.json())`;
    }

    return "";
  };

  // Copy helper
  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    if (type === "response") {
      setCopiedResponse(true);
      setTimeout(() => setCopiedResponse(false), 2000);
    } else {
      setCopiedSnippet(type);
      setTimeout(() => setCopiedSnippet(null), 2000);
    }
  };

  // Status badge styling
  const getStatusBadge = (status: number) => {
    if (status >= 200 && status < 300) {
      return "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40";
    }
    if (status >= 300 && status < 400) {
      return "bg-cyan-500/20 text-cyan-400 border border-cyan-500/40";
    }
    if (status >= 400 && status < 500) {
      return "bg-amber-500/20 text-amber-400 border border-amber-500/40";
    }
    return "bg-rose-500/20 text-rose-400 border border-rose-500/40";
  };

  const getMethodColor = (m: string) => {
    switch (m) {
      case "GET": return "text-emerald-400";
      case "POST": return "text-indigo-400";
      case "PUT": return "text-amber-400";
      case "PATCH": return "text-purple-400";
      case "DELETE": return "text-rose-400";
      default: return "text-cyan-400";
    }
  };

  return (
    <div className={`w-full h-full flex flex-col overflow-hidden font-sans select-none ${
      isDark ? "bg-[#0c0d12] text-zinc-200" : "bg-slate-50 text-slate-800"
    }`}>
      {/* Top Header Bar */}
      <div className={`px-4 py-2.5 flex items-center justify-between border-b shrink-0 ${
        isDark ? "bg-[#11131a] border-zinc-800/80" : "bg-white border-slate-200"
      }`}>
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-gradient-to-br from-indigo-500/20 to-cyan-500/20 text-indigo-400 border border-indigo-500/30">
            <Zap className="w-4 h-4 text-indigo-400" />
          </div>
          <div>
            <h1 className="text-xs font-bold tracking-wide flex items-center gap-2">
              REST & API Studio
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                HTTP Client
              </span>
            </h1>
            <p className="text-[10px] text-zinc-500">Test backend endpoints, inspect responses & generate client code</p>
          </div>
        </div>

        {/* Quick presets selector */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-zinc-400 hidden sm:inline">Presets:</span>
          <select
            onChange={(e) => {
              const preset = PRESET_REQUESTS.find(p => p.name === e.target.value);
              if (preset) loadPreset(preset);
            }}
            defaultValue=""
            className={`text-xs px-2.5 py-1 rounded-md border outline-none cursor-pointer ${
              isDark ? "bg-zinc-900 border-zinc-700 text-zinc-200" : "bg-slate-100 border-slate-300 text-slate-700"
            }`}
          >
            <option value="" disabled>Load Example Request...</option>
            {PRESET_REQUESTS.map(p => (
              <option key={p.name} value={p.name}>{p.name} ({p.method})</option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Container - Split View */}
      <div className="flex-1 flex flex-col lg:flex-row min-h-0 overflow-hidden">
        {/* Left Column: Request Builder */}
        <div className={`flex-1 flex flex-col min-w-0 border-r overflow-hidden ${
          isDark ? "border-zinc-800" : "border-slate-200"
        }`}>
          {/* Method and URL Bar */}
          <div className="p-3 border-b shrink-0 flex items-center gap-2">
            <select
              value={method}
              onChange={(e) => setMethod(e.target.value)}
              className={`font-mono text-xs font-bold px-3 py-2 rounded-lg border outline-none cursor-pointer ${
                getMethodColor(method)
              } ${isDark ? "bg-[#14161f] border-zinc-700" : "bg-white border-slate-300"}`}
            >
              <option value="GET">GET</option>
              <option value="POST">POST</option>
              <option value="PUT">PUT</option>
              <option value="PATCH">PATCH</option>
              <option value="DELETE">DELETE</option>
              <option value="HEAD">HEAD</option>
              <option value="OPTIONS">OPTIONS</option>
            </select>

            <div className="flex-1 relative">
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
                    executeRequest();
                  }
                }}
                placeholder="Enter request URL (e.g. /api/health or https://api.example.com)..."
                className={`w-full px-3 py-2 text-xs font-mono rounded-lg border outline-none transition-all ${
                  isDark
                    ? "bg-[#14161f] border-zinc-700 text-zinc-100 focus:border-indigo-500"
                    : "bg-white border-slate-300 text-slate-800 focus:border-indigo-500"
                }`}
              />
            </div>

            <button
              onClick={executeRequest}
              disabled={isLoading || !url.trim()}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold text-white transition-all shadow-md cursor-pointer shrink-0 ${
                isLoading || !url.trim()
                  ? "bg-zinc-600 opacity-60 cursor-not-allowed"
                  : "bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/30 active:scale-95"
              }`}
              title="Shortcut: Ctrl+Enter"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  Send
                </>
              )}
            </button>
          </div>

          {/* Request Sub-Tabs */}
          <div className={`flex items-center px-3 border-b shrink-0 gap-1 ${
            isDark ? "bg-[#10121a] border-zinc-800/80" : "bg-slate-100/70 border-slate-200"
          }`}>
            {(["params", "headers", "body", "auth", "snippets"] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-2 text-xs font-medium capitalize border-b-2 transition-all cursor-pointer ${
                  activeTab === tab
                    ? "border-indigo-500 text-indigo-400 font-bold"
                    : "border-transparent text-zinc-400 hover:text-zinc-200"
                }`}
              >
                {tab === "params" && `Params (${params.filter(p => p.enabled && p.key).length})`}
                {tab === "headers" && `Headers (${headers.filter(h => h.enabled && h.key).length})`}
                {tab === "body" && `Body (${method})`}
                {tab === "auth" && `Auth (${authType})`}
                {tab === "snippets" && "Code Snippets"}
              </button>
            ))}
          </div>

          {/* Sub-Tab Contents */}
          <div className="flex-1 p-3 overflow-y-auto">
            {/* PARAMS TAB */}
            {activeTab === "params" && (
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between text-[11px] text-zinc-400 mb-1">
                  <span>Query Parameters (auto-synced to URL):</span>
                  <button
                    onClick={addParamRow}
                    className="flex items-center gap-1 text-indigo-400 hover:text-indigo-300 font-medium cursor-pointer"
                  >
                    <Plus className="w-3 h-3" /> Add Param
                  </button>
                </div>

                {params.map(p => (
                  <div key={p.id} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={p.enabled}
                      onChange={(e) => updateParamRow(p.id, "enabled", e.target.checked)}
                      className="cursor-pointer accent-indigo-500 rounded"
                    />
                    <input
                      type="text"
                      value={p.key}
                      onChange={(e) => updateParamRow(p.id, "key", e.target.value)}
                      placeholder="Parameter key..."
                      className={`flex-1 px-2.5 py-1.5 text-xs font-mono rounded border outline-none ${
                        isDark ? "bg-[#14161f] border-zinc-700 text-zinc-200" : "bg-white border-slate-300"
                      }`}
                    />
                    <input
                      type="text"
                      value={p.value}
                      onChange={(e) => updateParamRow(p.id, "value", e.target.value)}
                      placeholder="Value..."
                      className={`flex-1 px-2.5 py-1.5 text-xs font-mono rounded border outline-none ${
                        isDark ? "bg-[#14161f] border-zinc-700 text-zinc-200" : "bg-white border-slate-300"
                      }`}
                    />
                    <button
                      onClick={() => removeParamRow(p.id)}
                      className="p-1 text-zinc-500 hover:text-rose-400 cursor-pointer"
                      title="Delete row"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* HEADERS TAB */}
            {activeTab === "headers" && (
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between text-[11px] text-zinc-400 mb-1">
                  <span>HTTP Headers:</span>
                  <button
                    onClick={addHeaderRow}
                    className="flex items-center gap-1 text-indigo-400 hover:text-indigo-300 font-medium cursor-pointer"
                  >
                    <Plus className="w-3 h-3" /> Add Header
                  </button>
                </div>

                {headers.map(h => (
                  <div key={h.id} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={h.enabled}
                      onChange={(e) => updateHeaderRow(h.id, "enabled", e.target.checked)}
                      className="cursor-pointer accent-indigo-500 rounded"
                    />
                    <input
                      type="text"
                      value={h.key}
                      onChange={(e) => updateHeaderRow(h.id, "key", e.target.value)}
                      placeholder="Header name (e.g. Authorization)..."
                      className={`flex-1 px-2.5 py-1.5 text-xs font-mono rounded border outline-none ${
                        isDark ? "bg-[#14161f] border-zinc-700 text-zinc-200" : "bg-white border-slate-300"
                      }`}
                    />
                    <input
                      type="text"
                      value={h.value}
                      onChange={(e) => updateHeaderRow(h.id, "value", e.target.value)}
                      placeholder="Header value..."
                      className={`flex-1 px-2.5 py-1.5 text-xs font-mono rounded border outline-none ${
                        isDark ? "bg-[#14161f] border-zinc-700 text-zinc-200" : "bg-white border-slate-300"
                      }`}
                    />
                    <button
                      onClick={() => removeHeaderRow(h.id)}
                      className="p-1 text-zinc-500 hover:text-rose-400 cursor-pointer"
                      title="Delete row"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* BODY TAB */}
            {activeTab === "body" && (
              <div className="flex flex-col h-full gap-2">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setBodyType("json")}
                      className={`px-2 py-0.5 rounded text-[11px] font-semibold cursor-pointer ${
                        bodyType === "json"
                          ? "bg-indigo-500/20 text-indigo-400 border border-indigo-500/30"
                          : "text-zinc-400 hover:text-zinc-200"
                      }`}
                    >
                      JSON (application/json)
                    </button>
                    <button
                      onClick={() => setBodyType("raw")}
                      className={`px-2 py-0.5 rounded text-[11px] font-semibold cursor-pointer ${
                        bodyType === "raw"
                          ? "bg-indigo-500/20 text-indigo-400 border border-indigo-500/30"
                          : "text-zinc-400 hover:text-zinc-200"
                      }`}
                    >
                      Raw Text
                    </button>
                  </div>

                  {bodyType === "json" && (
                    <button
                      onClick={prettifyJson}
                      className="flex items-center gap-1 text-[11px] text-indigo-400 hover:text-indigo-300 cursor-pointer"
                    >
                      <Sparkles className="w-3 h-3" /> Prettify JSON
                    </button>
                  )}
                </div>

                <textarea
                  value={bodyContent}
                  onChange={(e) => setBodyContent(e.target.value)}
                  placeholder="Enter JSON request body..."
                  className={`w-full flex-1 min-h-[220px] p-3 font-mono text-xs rounded-lg border outline-none resize-none ${
                    isDark
                      ? "bg-[#14161f] border-zinc-700 text-zinc-200 focus:border-indigo-500"
                      : "bg-white border-slate-300 text-slate-800 focus:border-indigo-500"
                  }`}
                />
              </div>
            )}

            {/* AUTH TAB */}
            {activeTab === "auth" && (
              <div className="flex flex-col gap-4 max-w-lg">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-zinc-400">Authentication Type:</span>
                  <select
                    value={authType}
                    onChange={(e: any) => setAuthType(e.target.value)}
                    className={`text-xs px-2.5 py-1.5 rounded border outline-none ${
                      isDark ? "bg-[#14161f] border-zinc-700 text-zinc-200" : "bg-white border-slate-300"
                    }`}
                  >
                    <option value="none">No Auth</option>
                    <option value="bearer">Bearer Token</option>
                    <option value="basic">Basic Auth</option>
                    <option value="apikey">API Key Header</option>
                  </select>
                </div>

                {authType === "bearer" && (
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs text-zinc-400 font-medium">Bearer Token:</label>
                    <input
                      type="password"
                      value={bearerToken}
                      onChange={(e) => setBearerToken(e.target.value)}
                      placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                      className={`px-3 py-2 text-xs font-mono rounded border outline-none ${
                        isDark ? "bg-[#14161f] border-zinc-700 text-zinc-200" : "bg-white border-slate-300"
                      }`}
                    />
                  </div>
                )}

                {authType === "basic" && (
                  <div className="flex flex-col gap-2">
                    <div className="flex flex-col gap-1">
                      <label className="text-xs text-zinc-400">Username:</label>
                      <input
                        type="text"
                        value={basicUser}
                        onChange={(e) => setBasicUser(e.target.value)}
                        placeholder="admin"
                        className={`px-3 py-1.5 text-xs font-mono rounded border outline-none ${
                          isDark ? "bg-[#14161f] border-zinc-700 text-zinc-200" : "bg-white border-slate-300"
                        }`}
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-xs text-zinc-400">Password:</label>
                      <input
                        type="password"
                        value={basicPass}
                        onChange={(e) => setBasicPass(e.target.value)}
                        placeholder="••••••••"
                        className={`px-3 py-1.5 text-xs font-mono rounded border outline-none ${
                          isDark ? "bg-[#14161f] border-zinc-700 text-zinc-200" : "bg-white border-slate-300"
                        }`}
                      />
                    </div>
                  </div>
                )}

                {authType === "apikey" && (
                  <div className="flex flex-col gap-2">
                    <div className="flex flex-col gap-1">
                      <label className="text-xs text-zinc-400">Header Key:</label>
                      <input
                        type="text"
                        value={apiKeyHeader}
                        onChange={(e) => setApiKeyHeader(e.target.value)}
                        placeholder="x-api-key"
                        className={`px-3 py-1.5 text-xs font-mono rounded border outline-none ${
                          isDark ? "bg-[#14161f] border-zinc-700 text-zinc-200" : "bg-white border-slate-300"
                        }`}
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-xs text-zinc-400">Key Value:</label>
                      <input
                        type="password"
                        value={apiKeyValue}
                        onChange={(e) => setApiKeyValue(e.target.value)}
                        placeholder="sk_test_..."
                        className={`px-3 py-1.5 text-xs font-mono rounded border outline-none ${
                          isDark ? "bg-[#14161f] border-zinc-700 text-zinc-200" : "bg-white border-slate-300"
                        }`}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* CODE SNIPPETS TAB */}
            {activeTab === "snippets" && (
              <div className="flex flex-col h-full gap-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    {(["curl", "fetch", "axios", "python"] as const).map(l => (
                      <button
                        key={l}
                        onClick={() => setSnippetLang(l)}
                        className={`px-2.5 py-1 rounded text-xs font-mono uppercase font-bold cursor-pointer ${
                          snippetLang === l
                            ? "bg-indigo-500/20 text-indigo-400 border border-indigo-500/30"
                            : "text-zinc-400 hover:text-zinc-200"
                        }`}
                      >
                        {l}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => copyToClipboard(generateSnippet(snippetLang), snippetLang)}
                    className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 cursor-pointer"
                  >
                    {copiedSnippet === snippetLang ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" /> Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" /> Copy Code
                      </>
                    )}
                  </button>
                </div>

                <pre className={`w-full flex-1 p-3 text-xs font-mono rounded-lg border overflow-auto select-text ${
                  isDark ? "bg-[#14161f] border-zinc-700 text-zinc-200" : "bg-slate-100 border-slate-300 text-slate-800"
                }`}>
                  {generateSnippet(snippetLang)}
                </pre>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Response Viewer */}
        <div className={`flex-1 flex flex-col min-w-0 overflow-hidden ${
          isDark ? "bg-[#0f1118]" : "bg-slate-50"
        }`}>
          {/* Response Status Bar */}
          <div className={`px-4 py-2.5 border-b shrink-0 flex items-center justify-between ${
            isDark ? "bg-[#13151f] border-zinc-800" : "bg-white border-slate-200"
          }`}>
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">Response</span>

              {responseStatus !== null && (
                <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${getStatusBadge(responseStatus)}`}>
                  {responseStatus} {responseStatusText}
                </span>
              )}

              {responseTimeMs !== null && (
                <span className="flex items-center gap-1 text-[11px] font-mono text-zinc-400">
                  <Clock className="w-3 h-3 text-zinc-500" /> {responseTimeMs}ms
                </span>
              )}

              {responseSizeBytes !== null && (
                <span className="text-[11px] font-mono text-zinc-400">
                  {(responseSizeBytes / 1024).toFixed(2)} KB
                </span>
              )}
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2">
              <div className="flex items-center rounded border border-zinc-700/60 p-0.5">
                {(["pretty", "raw", "headers"] as const).map(v => (
                  <button
                    key={v}
                    onClick={() => setResponseView(v)}
                    className={`px-2 py-0.5 text-[10px] uppercase font-bold rounded cursor-pointer ${
                      responseView === v
                        ? "bg-indigo-500/20 text-indigo-400"
                        : "text-zinc-400 hover:text-zinc-200"
                    }`}
                  >
                    {v}
                  </button>
                ))}
              </div>

              {responseData !== null && (
                <button
                  onClick={() => copyToClipboard(
                    typeof responseData === "object" ? JSON.stringify(responseData, null, 2) : String(responseData),
                    "response"
                  )}
                  className="p-1 rounded text-zinc-400 hover:text-white cursor-pointer"
                  title="Copy Response Body"
                >
                  {copiedResponse ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              )}
            </div>
          </div>

          {/* Response Content View */}
          <div className="flex-1 p-3 overflow-auto">
            {isLoading ? (
              <div className="h-full flex flex-col items-center justify-center gap-3 text-zinc-500">
                <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin" />
                <p className="text-xs font-medium">Executing HTTP Request...</p>
              </div>
            ) : requestError ? (
              <div className="p-4 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
                <div>
                  <div className="font-bold mb-1">Request Failed</div>
                  <div className="font-mono text-[11px]">{requestError}</div>
                </div>
              </div>
            ) : responseData !== null ? (
              <>
                {responseView === "pretty" && (
                  <pre className="font-mono text-xs whitespace-pre-wrap select-text leading-relaxed">
                    {typeof responseData === "object"
                      ? JSON.stringify(responseData, null, 2)
                      : String(responseData)}
                  </pre>
                )}

                {responseView === "raw" && (
                  <pre className="font-mono text-xs whitespace-pre-wrap select-text leading-relaxed">
                    {typeof responseData === "object" ? JSON.stringify(responseData) : String(responseData)}
                  </pre>
                )}

                {responseView === "headers" && (
                  <div className="flex flex-col gap-1 font-mono text-xs">
                    {Object.entries(responseHeaders).map(([k, v]) => (
                      <div key={k} className="flex border-b border-zinc-800/40 py-1">
                        <span className="w-1/3 text-zinc-400 font-semibold">{k}:</span>
                        <span className="w-2/3 text-zinc-200 select-text break-all">{v}</span>
                      </div>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="h-full flex flex-col items-center justify-center gap-2 text-zinc-500">
                <Globe className="w-8 h-8 text-zinc-600" />
                <p className="text-xs">No response yet. Hit "Send" or choose a Preset above.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApiClientStudioAgent;
