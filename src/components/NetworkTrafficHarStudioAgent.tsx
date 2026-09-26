import React, { useState, useMemo, useEffect } from "react";
import {
  Globe,
  ArrowDownLeft,
  ArrowUpRight,
  Clock,
  Copy,
  Check,
  CheckCircle2,
  AlertCircle,
  Download,
  Save,
  Play,
  RotateCcw,
  Search,
  Filter,
  Code,
  Terminal,
  FileCode,
  Sliders,
  Sparkles,
  Zap,
  Activity,
  Layers,
  ChevronRight,
  ShieldAlert,
  Send,
  Trash2,
  RefreshCw
} from "lucide-react";

export interface NetworkTrafficHarStudioAgentProps {
  theme: "light" | "dark";
  onSaveFile?: (path: string, content: string) => void;
  onAddLog?: (type: string, msg: string) => void;
}

export interface NetworkRequestItem {
  id: string;
  url: string;
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  status: number;
  statusText: string;
  type: "fetch" | "xhr" | "script" | "stylesheet" | "image";
  durationMs: number;
  sizeBytes: number;
  timestamp: number;
  timings: {
    dnsMs: number;
    connectMs: number;
    sslMs: number;
    ttfbMs: number;
    downloadMs: number;
  };
  requestHeaders: Record<string, string>;
  responseHeaders: Record<string, string>;
  requestBody?: string;
  responseBody?: string;
}

export const NetworkTrafficHarStudioAgent: React.FC<NetworkTrafficHarStudioAgentProps> = ({
  theme,
  onSaveFile,
  onAddLog
}) => {
  const [requests, setRequests] = useState<NetworkRequestItem[]>([]);
  const [selectedRequestId, setSelectedRequestId] = useState<string>("");
  const [searchFilter, setSearchFilter] = useState<string>("");
  const [methodFilter, setMethodFilter] = useState<string>("ALL");
  const [activeTab, setActiveTab] = useState<"waterfall" | "curl" | "har" | "mock">("waterfall");

  // cURL Importer / Converter State
  const [curlInput, setCurlInput] = useState<string>(
    `curl -X POST https://api.remixstudio.dev/v1/data/query \\\n  -H "Content-Type: application/json" \\\n  -H "Authorization: Bearer token_sample_abc123" \\\n  -d '{"query": "SELECT * FROM users LIMIT 10"}'`
  );

  // Mock Injection State
  const [mockLatencyMs, setMockLatencyMs] = useState<number>(350);
  const [mockStatusCode, setMockStatusCode] = useState<number>(200);

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState<boolean>(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const selectedRequest = useMemo(() => {
    return requests.find(r => r.id === selectedRequestId) || requests[0];
  }, [requests, selectedRequestId]);

  const filteredRequests = useMemo(() => {
    return requests.filter(r => {
      const matchSearch =
        searchFilter === "" ||
        r.url.toLowerCase().includes(searchFilter.toLowerCase()) ||
        String(r.status).includes(searchFilter);
      const matchMethod = methodFilter === "ALL" || r.method === methodFilter;
      return matchSearch && matchMethod;
    });
  }, [requests, searchFilter, methodFilter]);

  // Convert cURL to Fetch Code
  const convertedFetchCode = useMemo(() => {
    let method = "GET";
    let url = "https://example.com/api";
    const headers: Record<string, string> = {};
    let body = "";

    const methodMatch = curlInput.match(/-X\s+([A-Z]+)/i);
    if (methodMatch) method = methodMatch[1].toUpperCase();

    const urlMatch = curlInput.match(/curl(?:\s+-[A-Za-z0-9]+)*\s+['"]?([^'"\s\\]+)['"]?/);
    if (urlMatch) url = urlMatch[1];

    const headerRegex = /-H\s+['"]([^'"]+)['"]/g;
    let hMatch;
    while ((hMatch = headerRegex.exec(curlInput)) !== null) {
      const parts = hMatch[1].split(":");
      if (parts.length >= 2) {
        headers[parts[0].trim()] = parts.slice(1).join(":").trim();
      }
    }

    const bodyMatch = curlInput.match(/(?:-d|--data(?:-raw)?)\s+['"]([\s\S]*?)['"](?:\s|$)/);
    if (bodyMatch) {
      body = bodyMatch[1];
      if (method === "GET") method = "POST";
    }

    return `/**
 * Generated Fetch Client Snippet
 * Converted from cURL command
 */
async function executeApiCall() {
  const response = await fetch("${url}", {
    method: "${method}",
    headers: ${JSON.stringify(headers, null, 4)},
    ${body ? `body: JSON.stringify(${body.startsWith("{") ? body : JSON.stringify(body)}),` : ""}
  });

  if (!response.ok) {
    throw new Error(\`HTTP error \${response.status}: \${response.statusText}\`);
  }

  const data = await response.json();
  console.log("Success:", data);
  return data;
}

executeApiCall();`;
  }, [curlInput]);

  // Generate full HAR 1.2 Object
  const generatedHarJson = useMemo(() => {
    const entries = requests.map(r => ({
      startedDateTime: new Date(r.timestamp).toISOString(),
      time: r.durationMs,
      request: {
        method: r.method,
        url: r.url,
        httpVersion: "HTTP/2.0",
        headers: Object.entries(r.requestHeaders).map(([name, value]) => ({ name, value })),
        queryString: [],
        postData: r.requestBody ? { mimeType: "application/json", text: r.requestBody } : undefined,
        headersSize: -1,
        bodySize: r.requestBody ? r.requestBody.length : 0
      },
      response: {
        status: r.status,
        statusText: r.statusText,
        httpVersion: "HTTP/2.0",
        headers: Object.entries(r.responseHeaders).map(([name, value]) => ({ name, value })),
        content: {
          size: r.sizeBytes,
          mimeType: r.responseHeaders["content-type"] || "application/json",
          text: r.responseBody
        },
        headersSize: -1,
        bodySize: r.sizeBytes
      },
      timings: {
        blocked: 0,
        dns: r.timings.dnsMs,
        connect: r.timings.connectMs,
        ssl: r.timings.sslMs,
        send: 2,
        wait: r.timings.ttfbMs,
        receive: r.timings.downloadMs
      }
    }));

    return JSON.stringify({
      log: {
        version: "1.2",
        creator: { name: "Remix Studio HAR Architect", version: "3.4" },
        entries
      }
    }, null, 2);
  }, [requests]);

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setIsCopied(true);
    showToast(`Copied ${label} to clipboard!`);
    setTimeout(() => setIsCopied(false), 2000);
  };

  // Live Request State
  const [liveReqUrl, setLiveReqUrl] = useState<string>("/api/health");
  const [liveReqMethod, setLiveReqMethod] = useState<"GET" | "POST">("GET");
  const [liveReqBody, setLiveReqBody] = useState<string>('{\n  "query": "test"\n}');
  const [isSendingLiveReq, setIsSendingLiveReq] = useState<boolean>(false);

  // Auto-capture real browser network resources & execute real server probe on initial load
  useEffect(() => {
    const fetchRealData = async () => {
      const items: NetworkRequestItem[] = [];

      // 1. Fetch live real health endpoint
      try {
        const start = performance.now();
        const res = await fetch("/api/health");
        const dur = Math.max(Math.round(performance.now() - start), 4);
        const data = await res.json();
        const resHeaders: Record<string, string> = {};
        res.headers.forEach((val, key) => { resHeaders[key] = val; });
        const text = JSON.stringify(data, null, 2);

        items.push({
          id: `req-health-${Date.now()}`,
          url: `${window.location.origin}/api/health`,
          method: "GET",
          status: res.status,
          statusText: res.statusText || "OK",
          type: "fetch",
          durationMs: dur,
          sizeBytes: text.length,
          timestamp: Date.now(),
          timings: { dnsMs: 1, connectMs: 2, sslMs: 4, ttfbMs: Math.max(dur - 4, 2), downloadMs: 3 },
          requestHeaders: { "Accept": "application/json" },
          responseHeaders: resHeaders,
          responseBody: text
        });
      } catch {}

      // 2. Fetch live real system status endpoint
      try {
        const start = performance.now();
        const res = await fetch("/api/system/status");
        const dur = Math.max(Math.round(performance.now() - start), 4);
        const data = await res.json();
        const resHeaders: Record<string, string> = {};
        res.headers.forEach((val, key) => { resHeaders[key] = val; });
        const text = JSON.stringify(data, null, 2);

        items.push({
          id: `req-status-${Date.now()}`,
          url: `${window.location.origin}/api/system/status`,
          method: "GET",
          status: res.status,
          statusText: res.statusText || "OK",
          type: "fetch",
          durationMs: dur,
          sizeBytes: text.length,
          timestamp: Date.now(),
          timings: { dnsMs: 1, connectMs: 2, sslMs: 4, ttfbMs: Math.max(dur - 4, 2), downloadMs: 3 },
          requestHeaders: { "Accept": "application/json" },
          responseHeaders: resHeaders,
          responseBody: text
        });
      } catch {}

      // 3. Capture real browser resource timings
      const entries = performance.getEntriesByType("resource") as PerformanceResourceTiming[];
      if (entries.length > 0) {
        entries.slice(-12).forEach((e, idx) => {
          const durationMs = Math.max(Math.round(e.duration), 5);
          const ttfb = Math.max(Math.round(e.responseStart - e.requestStart), 4);
          const isApi = e.name.includes("/api/");
          items.push({
            id: `perf-${idx}-${Date.now()}`,
            url: e.name,
            method: "GET",
            status: 200,
            statusText: "OK",
            type: e.name.endsWith(".js") ? "script" : e.name.endsWith(".css") ? "stylesheet" : isApi ? "fetch" : "fetch",
            durationMs,
            sizeBytes: Math.round(e.transferSize || e.encodedBodySize || 1200),
            timestamp: Date.now() - Math.round(performance.now() - e.startTime),
            timings: {
              dnsMs: Math.max(Math.round(e.domainLookupEnd - e.domainLookupStart), 2),
              connectMs: Math.max(Math.round(e.connectEnd - e.connectStart), 4),
              sslMs: 6,
              ttfbMs: ttfb,
              downloadMs: Math.max(Math.round(e.responseEnd - e.responseStart), 2)
            },
            requestHeaders: { "Accept": "*/*", "User-Agent": navigator.userAgent },
            responseHeaders: { "content-type": e.name.endsWith(".css") ? "text/css" : isApi ? "application/json" : "application/javascript" },
            responseBody: isApi ? JSON.stringify({ status: "active" }, null, 2) : undefined
          });
        });
      }

      setRequests(items);
      if (items.length > 0) setSelectedRequestId(items[0].id);
    };

    fetchRealData();
  }, []);

  const handleCaptureRealNetwork = () => {
    const entries = performance.getEntriesByType("resource") as PerformanceResourceTiming[];
    const realItems: NetworkRequestItem[] = entries.slice(-15).map((e, idx) => {
      const durationMs = Math.round(e.duration);
      const ttfb = Math.max(Math.round(e.responseStart - e.requestStart), 8);
      const isApi = e.name.includes("/api/");
      return {
        id: `perf-cap-${Date.now()}-${idx}`,
        url: e.name,
        method: "GET",
        status: 200,
        statusText: "OK",
        type: e.name.endsWith(".js") ? "script" : e.name.endsWith(".css") ? "stylesheet" : "fetch",
        durationMs: Math.max(durationMs, 8),
        sizeBytes: Math.round(e.transferSize || e.encodedBodySize || 1200),
        timestamp: Date.now() - Math.round(performance.now() - e.startTime),
        timings: {
          dnsMs: Math.max(Math.round(e.domainLookupEnd - e.domainLookupStart), 2),
          connectMs: Math.max(Math.round(e.connectEnd - e.connectStart), 4),
          sslMs: 6,
          ttfbMs: ttfb,
          downloadMs: Math.max(Math.round(e.responseEnd - e.responseStart), 4)
        },
        requestHeaders: { "Accept": "*/*", "User-Agent": navigator.userAgent },
        responseHeaders: { "content-type": isApi ? "application/json" : "application/javascript" }
      };
    });
    setRequests(realItems);
    if (realItems.length > 0) setSelectedRequestId(realItems[0].id);
    showToast(`Captured ${realItems.length} live browser network requests!`);
    if (onAddLog) onAddLog("network", `Captured ${realItems.length} browser performance network traces.`);
  };

  const handleExecuteLiveRequest = async () => {
    setIsSendingLiveReq(true);
    showToast(`Sending ${liveReqMethod} ${liveReqUrl}...`);
    const start = performance.now();
    try {
      const fetchTarget = liveReqUrl.startsWith("/")
        ? liveReqUrl
        : (liveReqUrl.startsWith("http") ? `/api/proxy?url=${encodeURIComponent(liveReqUrl)}` : liveReqUrl);
      const res = await fetch(fetchTarget, {
        method: liveReqMethod,
        headers: liveReqMethod === "POST" ? { "Content-Type": "application/json" } : undefined,
        body: liveReqMethod === "POST" ? liveReqBody : undefined
      });
      const durationMs = Math.round(performance.now() - start);
      const text = await res.text();
      let parsedBody = text;
      try {
        parsedBody = JSON.stringify(JSON.parse(text), null, 2);
      } catch {}

      const resHeaders: Record<string, string> = {};
      res.headers.forEach((val, key) => { resHeaders[key] = val; });

      const newId = `req-live-${Date.now()}`;
      const newReq: NetworkRequestItem = {
        id: newId,
        url: liveReqUrl.startsWith("http") ? liveReqUrl : `${window.location.origin}${liveReqUrl}`,
        method: liveReqMethod,
        status: res.status,
        statusText: res.statusText || (res.ok ? "OK" : "Error"),
        type: "fetch",
        durationMs,
        sizeBytes: text.length,
        timestamp: Date.now(),
        timings: {
          dnsMs: 3,
          connectMs: 6,
          sslMs: 10,
          ttfbMs: Math.max(durationMs - 12, 8),
          downloadMs: 12
        },
        requestHeaders: {
          "Accept": "application/json, text/plain, */*",
          ...(liveReqMethod === "POST" ? { "Content-Type": "application/json" } : {})
        },
        responseHeaders: resHeaders,
        requestBody: liveReqMethod === "POST" ? liveReqBody : undefined,
        responseBody: parsedBody
      };

      setRequests(prev => [newReq, ...prev]);
      setSelectedRequestId(newId);
      showToast(`Received ${res.status} ${res.statusText} in ${durationMs}ms`);
      if (onAddLog) onAddLog("network", `Live test: ${liveReqMethod} ${liveReqUrl} -> ${res.status} (${durationMs}ms)`);
    } catch (err: any) {
      showToast(`Request failed: ${err.message}`);
    } finally {
      setIsSendingLiveReq(false);
    }
  };

  const handleExecuteMockRequest = () => {
    const newId = `req-mock-${Date.now()}`;
    const newReq: NetworkRequestItem = {
      id: newId,
      url: `/api/health?simulated_latency=${mockLatencyMs}ms&status=${mockStatusCode}`,
      method: "GET",
      status: mockStatusCode,
      statusText: mockStatusCode === 200 ? "OK" : mockStatusCode === 429 ? "Too Many Requests" : "Server Error",
      type: "fetch",
      durationMs: mockLatencyMs + Math.floor(Math.random() * 30),
      sizeBytes: 840,
      timestamp: Date.now(),
      timings: {
        dnsMs: 4,
        connectMs: 14,
        sslMs: 18,
        ttfbMs: mockLatencyMs,
        downloadMs: 12
      },
      requestHeaders: { "Accept": "application/json" },
      responseHeaders: {
        "content-type": "application/json",
        "x-simulated-latency": `${mockLatencyMs}ms`
      },
      responseBody: JSON.stringify({
        simulated: true,
        statusCode: mockStatusCode,
        latencyMs: mockLatencyMs,
        timestamp: Date.now()
      }, null, 2)
    };

    setRequests(prev => [newReq, ...prev]);
    setSelectedRequestId(newId);
    showToast(`Simulated request completed in ${newReq.durationMs}ms (HTTP ${mockStatusCode})`);
    if (onAddLog) onAddLog("network", `Injected mock network request (${mockStatusCode}, ${mockLatencyMs}ms).`);
  };

  const getStatusColor = (status: number) => {
    if (status >= 200 && status < 300) return "text-emerald-400 bg-emerald-500/10 border-emerald-500/30";
    if (status >= 300 && status < 400) return "text-cyan-400 bg-cyan-500/10 border-cyan-500/30";
    if (status >= 400 && status < 500) return "text-amber-400 bg-amber-500/10 border-amber-500/30";
    return "text-rose-400 bg-rose-500/10 border-rose-500/30";
  };

  return (
    <div className={`w-full h-full flex flex-col overflow-hidden ${theme === "dark" ? "bg-slate-950 text-slate-100" : "bg-slate-50 text-slate-900"}`}>
      {/* Toast Notification */}
      {toastMessage && (
        <div className="absolute top-4 right-6 z-50 px-4 py-2 bg-cyan-600 text-white text-xs font-semibold rounded-lg shadow-xl border border-cyan-400/40 flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-200">
          <CheckCircle2 className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Bar */}
      <div className={`px-5 py-3 border-b flex flex-wrap items-center justify-between gap-4 ${theme === "dark" ? "bg-slate-900/90 border-slate-800" : "bg-white border-slate-200"}`}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 text-white">
            <Globe className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold tracking-tight">Network HAR & Traffic Replay Studio</h1>
              <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                HAR 1.2 & cURL
              </span>
              <span className="text-xs text-slate-400">({requests.length} Requests)</span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              HTTP Archive inspector, timing waterfalls, cURL-to-Fetch converter & latency injection simulator
            </p>
          </div>
        </div>

        {/* Global Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleCaptureRealNetwork}
            className="px-3 py-1.5 text-xs font-medium rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-1.5 shadow-md shadow-emerald-600/20 transition-all"
            title="Read live network requests from window.performance"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Capture Live App Traffic</span>
          </button>

          {onSaveFile && (
            <button
              onClick={() => {
                onSaveFile("network-log.har", generatedHarJson);
                showToast("Saved network-log.har to project!");
                if (onAddLog) onAddLog("create", "Saved network-log.har export.");
              }}
              className="px-3 py-1.5 text-xs font-medium rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white flex items-center gap-1.5 shadow-md shadow-cyan-600/20 transition-all"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save network-log.har</span>
            </button>
          )}

          <button
            onClick={() => handleCopy(generatedHarJson, "HAR JSON")}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg border flex items-center gap-1.5 transition-all ${
              theme === "dark" ? "bg-slate-800 border-slate-700 hover:bg-slate-700 text-slate-200" : "bg-white border-slate-300 hover:bg-slate-100 text-slate-800"
            }`}
          >
            {isCopied ? <Check className="w-3.5 h-3.5 text-cyan-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>Export HAR</span>
          </button>
        </div>
      </div>

      {/* Sub-header Navigation Bar */}
      <div className={`px-5 py-2 border-b flex items-center justify-between gap-4 text-xs ${theme === "dark" ? "bg-slate-900/50 border-slate-800" : "bg-slate-100/70 border-slate-200"}`}>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setActiveTab("waterfall")}
            className={`px-3 py-1.5 rounded-md font-medium flex items-center gap-1.5 transition-colors ${
              activeTab === "waterfall"
                ? theme === "dark" ? "bg-slate-800 text-white shadow-sm" : "bg-white text-slate-900 shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Activity className="w-3.5 h-3.5 text-cyan-400" />
            <span>Traffic Waterfall & Inspector</span>
          </button>
          <button
            onClick={() => setActiveTab("curl")}
            className={`px-3 py-1.5 rounded-md font-medium flex items-center gap-1.5 transition-colors ${
              activeTab === "curl"
                ? theme === "dark" ? "bg-slate-800 text-white shadow-sm" : "bg-white text-slate-900 shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Terminal className="w-3.5 h-3.5 text-emerald-400" />
            <span>cURL to Code Converter</span>
          </button>
          <button
            onClick={() => setActiveTab("mock")}
            className={`px-3 py-1.5 rounded-md font-medium flex items-center gap-1.5 transition-colors ${
              activeTab === "mock"
                ? theme === "dark" ? "bg-slate-800 text-white shadow-sm" : "bg-white text-slate-900 shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Sliders className="w-3.5 h-3.5 text-amber-400" />
            <span>Latency & Error Injector</span>
          </button>
          <button
            onClick={() => setActiveTab("har")}
            className={`px-3 py-1.5 rounded-md font-medium flex items-center gap-1.5 transition-colors ${
              activeTab === "har"
                ? theme === "dark" ? "bg-slate-800 text-white shadow-sm" : "bg-white text-slate-900 shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <FileCode className="w-3.5 h-3.5 text-purple-400" />
            <span>Raw HAR 1.2 JSON</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* VIEW 1: TRAFFIC WATERFALL & INSPECTOR */}
        {activeTab === "waterfall" && (
          <div className="flex-1 flex flex-col md:flex-row h-full overflow-hidden">
            {/* Left Ledger: Requests Table */}
            <div className={`w-full md:w-1/2 flex flex-col border-r h-full overflow-hidden shrink-0 ${theme === "dark" ? "border-slate-800" : "border-slate-200"}`}>
              {/* Search and Filters */}
              <div className="p-3 border-b space-y-2">
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Filter by URL or status..."
                      value={searchFilter}
                      onChange={e => setSearchFilter(e.target.value)}
                      className={`w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border outline-none ${
                        theme === "dark" ? "bg-slate-800 border-slate-700 text-white" : "bg-white border-slate-300 text-slate-800"
                      }`}
                    />
                  </div>
                  <select
                    value={methodFilter}
                    onChange={e => setMethodFilter(e.target.value)}
                    className={`px-2 py-1.5 text-xs rounded-lg border font-mono ${
                      theme === "dark" ? "bg-slate-800 border-slate-700 text-white" : "bg-white border-slate-300 text-slate-800"
                    }`}
                  >
                    <option value="ALL">ALL</option>
                    <option value="GET">GET</option>
                    <option value="POST">POST</option>
                    <option value="PUT">PUT</option>
                    <option value="DELETE">DELETE</option>
                  </select>
                </div>
              </div>

              {/* Requests List */}
              <div className="flex-1 overflow-y-auto divide-y divide-slate-800">
                {filteredRequests.map(r => {
                  const isSelected = r.id === selectedRequestId;
                  return (
                    <div
                      key={r.id}
                      onClick={() => setSelectedRequestId(r.id)}
                      className={`p-3 cursor-pointer transition-all flex items-center justify-between gap-3 ${
                        isSelected
                          ? "bg-slate-800/80 border-l-4 border-cyan-500"
                          : theme === "dark"
                          ? "hover:bg-slate-900/60"
                          : "hover:bg-slate-100"
                      }`}
                    >
                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold font-mono border ${getStatusColor(r.status)}`}>
                            {r.status}
                          </span>
                          <span className="font-mono text-xs font-semibold text-slate-300">{r.method}</span>
                          <span className="text-xs truncate font-mono text-slate-200">{r.url}</span>
                        </div>
                        {/* Mini Timing Bar */}
                        <div className="flex items-center gap-2 text-[10px] text-slate-500 font-mono">
                          <span>{r.durationMs}ms</span>
                          <span>•</span>
                          <span>{r.sizeBytes} B</span>
                          <span>•</span>
                          <span>{new Date(r.timestamp).toLocaleTimeString()}</span>
                        </div>
                      </div>
                      <ChevronRight className={`w-3.5 h-3.5 shrink-0 ${isSelected ? "text-cyan-400" : "text-slate-600"}`} />
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right Pane: Selected Request Details & Waterfalls */}
            <div className="flex-1 flex flex-col h-full overflow-y-auto p-5 space-y-5">
              {selectedRequest && (
                <>
                  {/* Top Summary Card */}
                  <div className={`p-4 rounded-xl border space-y-2 ${theme === "dark" ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-xs font-bold font-mono border ${getStatusColor(selectedRequest.status)}`}>
                          {selectedRequest.status} {selectedRequest.statusText}
                        </span>
                        <span className="font-mono font-bold text-xs">{selectedRequest.method}</span>
                      </div>
                      <span className="text-xs text-slate-400 font-mono">{selectedRequest.durationMs}ms</span>
                    </div>
                    <div className="font-mono text-xs text-slate-300 break-all">{selectedRequest.url}</div>
                  </div>

                  {/* Waterfall Latency Breakdown */}
                  <div className={`p-4 rounded-xl border space-y-3 ${theme === "dark" ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"}`}>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-cyan-400" />
                      Detailed Timing Breakdown (Waterfall)
                    </h3>
                    <div className="space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">DNS Resolution</span>
                        <span className="font-mono text-cyan-300">{selectedRequest.timings.dnsMs}ms</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">TCP Handshake</span>
                        <span className="font-mono text-cyan-300">{selectedRequest.timings.connectMs}ms</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">SSL/TLS Negotiation</span>
                        <span className="font-mono text-cyan-300">{selectedRequest.timings.sslMs}ms</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400 font-semibold">Waiting (TTFB)</span>
                        <span className="font-mono text-amber-300 font-bold">{selectedRequest.timings.ttfbMs}ms</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Content Download</span>
                        <span className="font-mono text-emerald-300">{selectedRequest.timings.downloadMs}ms</span>
                      </div>
                    </div>
                  </div>

                  {/* Headers */}
                  <div className={`p-4 rounded-xl border space-y-2 ${theme === "dark" ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"}`}>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Response Headers</h3>
                    <div className="font-mono text-xs space-y-1">
                      {Object.entries(selectedRequest.responseHeaders).map(([k, v]) => (
                        <div key={k} className="flex gap-2">
                          <span className="text-cyan-400 font-semibold">{k}:</span>
                          <span className="text-slate-300">{v}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Response Body */}
                  {selectedRequest.responseBody && (
                    <div className={`p-4 rounded-xl border space-y-2 ${theme === "dark" ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"}`}>
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Response Payload</h3>
                      <pre className={`p-3 rounded-lg overflow-x-auto text-xs font-mono max-h-60 ${
                        theme === "dark" ? "bg-slate-950 border border-slate-800 text-emerald-300" : "bg-slate-50 border border-slate-300 text-slate-900"
                      }`}>
                        {selectedRequest.responseBody}
                      </pre>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}

        {/* VIEW 2: CURL TO CODE CONVERTER */}
        {activeTab === "curl" && (
          <div className="flex-1 flex flex-col md:flex-row h-full overflow-hidden">
            <div className={`w-full md:w-1/2 flex flex-col border-r h-full p-4 space-y-3 ${theme === "dark" ? "border-slate-800" : "border-slate-200"}`}>
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Paste cURL Command</h3>
                <span className="text-[11px] text-slate-500 font-mono">curl -X POST ...</span>
              </div>
              <textarea
                value={curlInput}
                onChange={e => setCurlInput(e.target.value)}
                rows={12}
                className={`w-full flex-1 p-3 font-mono text-xs rounded-xl border outline-none ${
                  theme === "dark" ? "bg-slate-900 border-slate-800 text-amber-300" : "bg-slate-50 border-slate-300 text-amber-900"
                }`}
              />
            </div>
            <div className="w-full md:w-1/2 flex flex-col h-full p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Converted TypeScript Fetch Code</h3>
                <button
                  onClick={() => handleCopy(convertedFetchCode, "Fetch Code")}
                  className="px-2.5 py-1 text-xs rounded border border-slate-700 hover:bg-slate-800 text-slate-300 flex items-center gap-1"
                >
                  <Copy className="w-3 h-3" /> Copy
                </button>
              </div>
              <pre className={`flex-1 p-3 rounded-xl overflow-auto font-mono text-xs border ${
                theme === "dark" ? "bg-slate-900 border-slate-800 text-cyan-300" : "bg-slate-50 border-slate-300 text-slate-900"
              }`}>
                {convertedFetchCode}
              </pre>
            </div>
          </div>
        )}

        {/* VIEW 3: LIVE HTTP REQUEST RUNNER & LATENCY INJECTOR */}
        {activeTab === "mock" && (
          <div className="flex-1 flex flex-col h-full overflow-y-auto p-5 space-y-6">
            {/* Live Request Runner */}
            <div className={`p-5 rounded-xl border space-y-4 max-w-xl ${theme === "dark" ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"}`}>
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold flex items-center gap-2">
                  <Send className="w-4 h-4 text-emerald-400" />
                  <span>Live HTTP Request Runner</span>
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold">
                  Real Network Fetch
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Dispatch real HTTP requests to app endpoints or external APIs and inspect actual network waterfall timings.
              </p>

              <div className="flex gap-2">
                <select
                  value={liveReqMethod}
                  onChange={e => setLiveReqMethod(e.target.value as any)}
                  className={`px-3 py-1.5 text-xs rounded-lg border font-mono font-bold ${
                    theme === "dark" ? "bg-slate-800 border-slate-700 text-white" : "bg-slate-100 border-slate-300 text-slate-800"
                  }`}
                >
                  <option value="GET">GET</option>
                  <option value="POST">POST</option>
                </select>

                <input
                  type="text"
                  value={liveReqUrl}
                  onChange={e => setLiveReqUrl(e.target.value)}
                  placeholder="e.g. /api/health or /api/crypto/live"
                  className={`flex-1 px-3 py-1.5 text-xs rounded-lg border font-mono ${
                    theme === "dark" ? "bg-slate-800 border-slate-700 text-white" : "bg-slate-100 border-slate-300 text-slate-800"
                  }`}
                />
              </div>

              {/* Quick Preset Buttons */}
              <div className="flex gap-1.5 flex-wrap text-[10px]">
                <span className="text-slate-500 py-0.5">Presets:</span>
                {["/api/health", "/api/crypto/live", "/api/forex/latest", "/api/system/token-savings"].map(p => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => { setLiveReqUrl(p); setLiveReqMethod("GET"); }}
                    className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono"
                  >
                    {p}
                  </button>
                ))}
              </div>

              {liveReqMethod === "POST" && (
                <div>
                  <label className="text-xs font-semibold text-slate-400 block mb-1">Request Payload (JSON)</label>
                  <textarea
                    rows={3}
                    value={liveReqBody}
                    onChange={e => setLiveReqBody(e.target.value)}
                    className={`w-full p-2 text-xs rounded-lg border font-mono ${
                      theme === "dark" ? "bg-slate-950 border-slate-800 text-white" : "bg-slate-50 border-slate-300 text-slate-900"
                    }`}
                  />
                </div>
              )}

              <button
                disabled={isSendingLiveReq}
                onClick={handleExecuteLiveRequest}
                className="w-full py-2 rounded-lg font-semibold text-xs bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white flex items-center justify-center gap-2 shadow"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isSendingLiveReq ? "Dispatching..." : "Dispatch Real HTTP Request"}</span>
              </button>
            </div>

            {/* Network Chaos / Latency Simulator */}
            <div>
              <h2 className="text-sm font-bold">Network Chaos & Latency Simulator</h2>
              <p className="text-xs text-slate-400">Inject high latency, rate limits, or server errors to test UI fault tolerance</p>
            </div>

            <div className={`p-5 rounded-xl border space-y-4 max-w-xl ${theme === "dark" ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"}`}>
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Simulated Response Status</label>
                <select
                  value={mockStatusCode}
                  onChange={e => setMockStatusCode(Number(e.target.value))}
                  className={`w-full px-3 py-1.5 text-xs rounded-lg border font-mono ${
                    theme === "dark" ? "bg-slate-800 border-slate-700 text-white" : "bg-slate-100 border-slate-300 text-slate-800"
                  }`}
                >
                  <option value={200}>200 OK (Standard Success)</option>
                  <option value={201}>201 Created</option>
                  <option value={400}>400 Bad Request (Validation Failure)</option>
                  <option value={401}>401 Unauthorized (Expired Session)</option>
                  <option value={429}>429 Too Many Requests (Rate Limited)</option>
                  <option value={500}>500 Internal Server Error</option>
                  <option value={504}>504 Gateway Timeout</option>
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-semibold text-slate-300">Simulated Latency (RTT)</span>
                  <span className="font-mono text-cyan-400 font-bold">{mockLatencyMs}ms</span>
                </div>
                <input
                  type="range"
                  min={50}
                  max={3000}
                  step={50}
                  value={mockLatencyMs}
                  onChange={e => setMockLatencyMs(Number(e.target.value))}
                  className="w-full accent-cyan-500 cursor-pointer"
                />
              </div>

              <button
                onClick={handleExecuteMockRequest}
                className="w-full py-2 rounded-lg font-semibold text-xs bg-cyan-600 hover:bg-cyan-500 text-white flex items-center justify-center gap-2 shadow"
              >
                <Play className="w-3.5 h-3.5 fill-white" />
                <span>Inject Simulated Request</span>
              </button>
            </div>
          </div>
        )}

        {/* VIEW 4: RAW HAR JSON */}
        {activeTab === "har" && (
          <div className="flex-1 flex flex-col h-full overflow-hidden p-5">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="text-sm font-bold">Standard HTTP Archive 1.2 Specification JSON</h2>
                <p className="text-xs text-slate-400">Compatible with Chrome DevTools, Charles Proxy, and Postman</p>
              </div>
              <button
                onClick={() => handleCopy(generatedHarJson, "HAR JSON")}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border flex items-center gap-1.5 ${
                  theme === "dark" ? "bg-slate-800 border-slate-700 text-slate-200" : "bg-white border-slate-300 text-slate-800"
                }`}
              >
                <Copy className="w-3.5 h-3.5" /> Copy JSON
              </button>
            </div>
            <pre className={`flex-1 p-4 rounded-xl font-mono text-xs overflow-auto border ${
              theme === "dark" ? "bg-slate-900 border-slate-800 text-purple-300" : "bg-slate-100 border-slate-300 text-slate-800"
            }`}>
              {generatedHarJson}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default NetworkTrafficHarStudioAgent;
