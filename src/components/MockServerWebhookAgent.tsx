import React, { useState, useEffect, useRef } from "react";
import {
  Server,
  Radio,
  Plus,
  Trash2,
  Play,
  RotateCcw,
  Copy,
  Check,
  Clock,
  Code,
  Globe,
  Sliders,
  Send,
  AlertCircle,
  CheckCircle,
  Terminal,
  ExternalLink,
  RefreshCw,
  Layers,
  Sparkles,
  FileJson
} from "lucide-react";
import { fetchWithAuth } from "../utils/apiAuth";

interface MockServerWebhookAgentProps {
  apiKey?: string;
  theme?: "light" | "dark" | string;
  onAddLog?: (type: string, message: string) => void;
}

interface MockEndpoint {
  id: string;
  path: string;
  method: string;
  statusCode: number;
  delayMs: number;
  headers: Record<string, string>;
  responseBody: any;
  enabled: boolean;
  createdAt: number;
}

interface WebhookLog {
  id: string;
  timestamp: string;
  method: string;
  path: string;
  ip: string;
  headers: Record<string, string>;
  query: Record<string, any>;
  body: any;
}

export const MockServerWebhookAgent: React.FC<MockServerWebhookAgentProps> = ({
  apiKey,
  theme = "dark",
  onAddLog
}) => {
  const isDark = theme === "dark";
  const [activeTab, setActiveTab] = useState<"endpoints" | "webhooks">("endpoints");

  // Endpoints State
  const [endpoints, setEndpoints] = useState<MockEndpoint[]>([]);
  const [isLoadingEndpoints, setIsLoadingEndpoints] = useState<boolean>(false);
  const [selectedEndpoint, setSelectedEndpoint] = useState<MockEndpoint | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);

  // Edit Form State
  const [formPath, setFormPath] = useState<string>("/api/v1/data");
  const [formMethod, setFormMethod] = useState<string>("GET");
  const [formStatusCode, setFormStatusCode] = useState<number>(200);
  const [formDelayMs, setFormDelayMs] = useState<number>(100);
  const [formResponseBody, setFormResponseBody] = useState<string>('{\n  "success": true,\n  "data": []\n}');
  const [formError, setFormError] = useState<string | null>(null);

  // Test Runner State
  const [testResult, setTestResult] = useState<{
    status: number;
    timeMs: number;
    headers: Record<string, string>;
    data: any;
    error?: string;
  } | null>(null);
  const [isTesting, setIsTesting] = useState<boolean>(false);

  // Webhooks State
  const [webhookLogs, setWebhookLogs] = useState<WebhookLog[]>([]);
  const [isLoadingLogs, setIsLoadingLogs] = useState<boolean>(false);
  const [selectedLog, setSelectedLog] = useState<WebhookLog | null>(null);
  const [autoRefreshLogs, setAutoRefreshLogs] = useState<boolean>(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Fetch Endpoints
  const loadEndpoints = async () => {
    setIsLoadingEndpoints(true);
    try {
      const res = await fetch("/api/mock-server/endpoints");
      if (res.ok) {
        const data = await res.json();
        setEndpoints(data.endpoints || []);
        if (!selectedEndpoint && data.endpoints?.length > 0) {
          setSelectedEndpoint(data.endpoints[0]);
        }
      }
    } catch (err: any) {
      console.error("Failed to load mock endpoints:", err);
    } finally {
      setIsLoadingEndpoints(false);
    }
  };

  // Fetch Webhook Logs
  const loadWebhookLogs = async () => {
    try {
      const res = await fetch("/api/mock-server/logs");
      if (res.ok) {
        const data = await res.json();
        setWebhookLogs(data.logs || []);
        if (data.logs?.length > 0 && !selectedLog) {
          setSelectedLog(data.logs[0]);
        }
      }
    } catch (err: any) {
      console.error("Failed to load webhook logs:", err);
    }
  };

  useEffect(() => {
    loadEndpoints();
    loadWebhookLogs();
  }, []);

  // Polling for webhooks
  useEffect(() => {
    if (!autoRefreshLogs) return;
    const interval = setInterval(() => {
      loadWebhookLogs();
    }, 2500);
    return () => clearInterval(interval);
  }, [autoRefreshLogs]);

  // Open Edit Form for new or existing
  const openNewEndpoint = () => {
    setSelectedEndpoint(null);
    setFormPath(`/custom-endpoint-${Math.floor(Math.random() * 900 + 100)}`);
    setFormMethod("GET");
    setFormStatusCode(200);
    setFormDelayMs(100);
    setFormResponseBody(JSON.stringify({ status: "success", timestamp: new Date().toISOString() }, null, 2));
    setFormError(null);
    setIsEditing(true);
  };

  const openEditEndpoint = (ep: MockEndpoint) => {
    setSelectedEndpoint(ep);
    setFormPath(ep.path);
    setFormMethod(ep.method);
    setFormStatusCode(ep.statusCode);
    setFormDelayMs(ep.delayMs);
    setFormResponseBody(
      typeof ep.responseBody === "string"
        ? ep.responseBody
        : JSON.stringify(ep.responseBody, null, 2)
    );
    setFormError(null);
    setIsEditing(true);
  };

  // Save Endpoint
  const handleSaveEndpoint = async () => {
    let parsedBody: any;
    try {
      parsedBody = JSON.parse(formResponseBody);
    } catch {
      parsedBody = formResponseBody;
    }

    try {
      const res = await fetchWithAuth(
        "/api/mock-server/endpoints",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: selectedEndpoint?.id,
            path: formPath.trim(),
            method: formMethod,
            statusCode: formStatusCode,
            delayMs: formDelayMs,
            responseBody: parsedBody,
            enabled: true
          })
        },
        apiKey
      );

      if (res.ok) {
        setIsEditing(false);
        await loadEndpoints();
        if (onAddLog) {
          onAddLog("agent", `Mock endpoint ${formMethod} ${formPath} saved successfully.`);
        }
      } else {
        const errData = await res.json();
        setFormError(errData.error || "Failed to save endpoint");
      }
    } catch (err: any) {
      setFormError(err.message || "Failed to save endpoint");
    }
  };

  // Delete Endpoint
  const handleDeleteEndpoint = async (id: string, path: string) => {
    try {
      const res = await fetch(`/api/mock-server/endpoints/${id}`, { method: "DELETE" });
      if (res.ok) {
        if (selectedEndpoint?.id === id) {
          setSelectedEndpoint(null);
        }
        await loadEndpoints();
        if (onAddLog) onAddLog("agent", `Deleted mock endpoint: ${path}`);
      }
    } catch (err) {
      console.error("Failed to delete endpoint:", err);
    }
  };

  // Test an endpoint live
  const handleTestEndpoint = async (ep: MockEndpoint) => {
    setIsTesting(true);
    setTestResult(null);

    const callUrl = `/api/mock-server/call${ep.path.startsWith("/") ? ep.path : `/${ep.path}`}`;
    const startTime = performance.now();

    try {
      const methodToUse = ep.method === "ANY" ? "GET" : ep.method;
      const fetchOpts: RequestInit = {
        method: methodToUse,
        headers: { "Content-Type": "application/json" }
      };

      if (["POST", "PUT", "PATCH"].includes(methodToUse)) {
        fetchOpts.body = JSON.stringify({ testTrigger: true, pingTime: new Date().toISOString() });
      }

      const res = await fetch(callUrl, fetchOpts);
      const timeMs = Math.round(performance.now() - startTime);

      const respHeaders: Record<string, string> = {};
      res.headers.forEach((v, k) => {
        respHeaders[k] = v;
      });

      let data: any;
      const contentType = res.headers.get("content-type") || "";
      if (contentType.includes("application/json")) {
        data = await res.json();
      } else {
        data = await res.text();
      }

      setTestResult({
        status: res.status,
        timeMs,
        headers: respHeaders,
        data
      });
    } catch (err: any) {
      setTestResult({
        status: 0,
        timeMs: Math.round(performance.now() - startTime),
        headers: {},
        data: null,
        error: err.message
      });
    } finally {
      setIsTesting(false);
    }
  };

  // Send a test webhook
  const handleSendTestWebhook = async () => {
    try {
      const sampleEvents = [
        { event: "payment.succeeded", amount: 4900, currency: "usd", customer: "cus_mock912" },
        { event: "deployment.completed", status: "success", commit: "a7b3c9e", branch: "main" },
        { event: "user.signup", userId: "u_8821", plan: "enterprise", email: "lead@startup.io" }
      ];
      const randomEvent = sampleEvents[Math.floor(Math.random() * sampleEvents.length)];

      await fetch("/api/mock-server/webhook", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Webhook-Signature": "sha256=mocked_hmac_signature_value"
        },
        body: JSON.stringify({
          ...randomEvent,
          sentAt: new Date().toISOString()
        })
      });

      await loadWebhookLogs();
      if (onAddLog) onAddLog("agent", `Sent test webhook event: ${randomEvent.event}`);
    } catch (err) {
      console.error("Failed to send test webhook:", err);
    }
  };

  // Clear webhook logs
  const handleClearWebhookLogs = async () => {
    try {
      await fetch("/api/mock-server/logs", { method: "DELETE" });
      setWebhookLogs([]);
      setSelectedLog(null);
    } catch (err) {
      console.error("Failed to clear webhook logs:", err);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1800);
  };

  const webhookUrl = `${window.location.origin}/api/mock-server/webhook`;

  return (
    <div
      className={`w-full h-full flex flex-col min-w-0 min-h-0 overflow-hidden ${
        isDark ? "bg-[#0c0d12] text-zinc-100" : "bg-slate-50 text-slate-800"
      }`}
    >
      {/* HEADER BAR */}
      <div
        className={`px-4 py-3 border-b flex items-center justify-between shrink-0 gap-3 ${
          isDark ? "border-zinc-800/80 bg-zinc-900/60" : "border-slate-200 bg-white"
        }`}
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Server className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold flex items-center gap-2">
              Mock API Server & Webhook Inspector
              <span className="px-1.5 py-0.5 rounded text-[10px] font-extrabold uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                Live Engine
              </span>
            </h2>
            <p className="text-[11px] text-zinc-400">
              Spin up mock REST endpoints with simulated latency, and inspect incoming webhooks in real-time.
            </p>
          </div>
        </div>

        {/* TABS SWITCHER */}
        <div
          className={`flex items-center p-1 rounded-xl border text-xs font-semibold ${
            isDark ? "bg-zinc-950/80 border-zinc-800" : "bg-slate-100 border-slate-200"
          }`}
        >
          <button
            onClick={() => setActiveTab("endpoints")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              activeTab === "endpoints"
                ? isDark
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "bg-emerald-600 text-white shadow-xs"
                : isDark
                ? "text-zinc-400 hover:text-white"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Server className="w-3.5 h-3.5" />
            Mock Endpoints ({endpoints.length})
          </button>
          <button
            onClick={() => setActiveTab("webhooks")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              activeTab === "webhooks"
                ? isDark
                  ? "bg-purple-600 text-white shadow-xs"
                  : "bg-purple-600 text-white shadow-xs"
                : isDark
                ? "text-zinc-400 hover:text-white"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Radio className="w-3.5 h-3.5 animate-pulse text-purple-300" />
            Webhook Inspector ({webhookLogs.length})
          </button>
        </div>
      </div>

      {/* BODY CONTENT */}
      {activeTab === "endpoints" ? (
        <div className="flex-1 flex min-h-0 overflow-hidden">
          {/* ENDPOINTS LIST SIDEBAR */}
          <div
            className={`w-80 border-r flex flex-col shrink-0 ${
              isDark ? "border-zinc-800/80 bg-zinc-950/40" : "border-slate-200 bg-slate-50/50"
            }`}
          >
            <div className="p-3 border-b border-zinc-800/60 flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                Registered Routes
              </span>
              <button
                onClick={openNewEndpoint}
                className="flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer shadow-xs transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                New Route
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
              {endpoints.map(ep => {
                const isSelected = selectedEndpoint?.id === ep.id;
                const methodColor =
                  ep.method === "GET"
                    ? "bg-blue-500/20 text-blue-400 border-blue-500/30"
                    : ep.method === "POST"
                    ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                    : ep.method === "DELETE"
                    ? "bg-rose-500/20 text-rose-400 border-rose-500/30"
                    : "bg-amber-500/20 text-amber-400 border-amber-500/30";

                return (
                  <div
                    key={ep.id}
                    onClick={() => {
                      setSelectedEndpoint(ep);
                      setIsEditing(false);
                      setTestResult(null);
                    }}
                    className={`p-2.5 rounded-xl border text-xs cursor-pointer transition-all ${
                      isSelected
                        ? isDark
                          ? "bg-zinc-900 border-emerald-500/50 shadow-md"
                          : "bg-white border-emerald-500 shadow-md ring-1 ring-emerald-500/20"
                        : isDark
                        ? "bg-zinc-900/40 border-zinc-800/60 hover:bg-zinc-900/80 hover:border-zinc-700"
                        : "bg-white border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <div className="flex items-center gap-1.5 overflow-hidden">
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-extrabold uppercase border ${methodColor}`}>
                          {ep.method}
                        </span>
                        <span className="font-mono font-bold truncate">{ep.path}</span>
                      </div>
                      <span className="text-[10px] font-mono text-zinc-400 shrink-0">
                        {ep.statusCode}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-zinc-400">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-zinc-500" />
                        {ep.delayMs}ms delay
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={e => {
                            e.stopPropagation();
                            handleTestEndpoint(ep);
                          }}
                          title="Run Test"
                          className="p-1 hover:text-emerald-400 transition-colors"
                        >
                          <Play className="w-3 h-3" />
                        </button>
                        <button
                          onClick={e => {
                            e.stopPropagation();
                            handleDeleteEndpoint(ep.id, ep.path);
                          }}
                          title="Delete Route"
                          className="p-1 hover:text-rose-400 transition-colors"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}

              {endpoints.length === 0 && !isLoadingEndpoints && (
                <div className="text-center py-8 text-zinc-500 text-xs">
                  No mock endpoints found. Create one above!
                </div>
              )}
            </div>
          </div>

          {/* MAIN DETAIL / EDITOR AREA */}
          <div className="flex-1 flex flex-col min-w-0 min-h-0 overflow-y-auto p-4 space-y-4">
            {isEditing ? (
              /* EDIT / CREATE FORM */
              <div
                className={`p-4 rounded-2xl border space-y-4 ${
                  isDark ? "bg-zinc-900/60 border-zinc-800" : "bg-white border-slate-200"
                }`}
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-emerald-400" />
                    {selectedEndpoint ? "Configure Mock Route" : "New Mock Route"}
                  </h3>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="text-xs text-zinc-400 hover:text-white"
                  >
                    Cancel
                  </button>
                </div>

                {formError && (
                  <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    {formError}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  {/* METHOD */}
                  <div>
                    <label className="block text-[11px] font-bold text-zinc-400 mb-1">Method</label>
                    <select
                      value={formMethod}
                      onChange={e => setFormMethod(e.target.value)}
                      className={`w-full px-3 py-1.5 rounded-lg border text-xs font-mono font-bold outline-hidden ${
                        isDark ? "bg-zinc-950 border-zinc-800 text-white" : "bg-slate-50 border-slate-300"
                      }`}
                    >
                      <option value="GET">GET</option>
                      <option value="POST">POST</option>
                      <option value="PUT">PUT</option>
                      <option value="PATCH">PATCH</option>
                      <option value="DELETE">DELETE</option>
                      <option value="ANY">ANY (Wildcard)</option>
                    </select>
                  </div>

                  {/* PATH */}
                  <div className="md:col-span-2">
                    <label className="block text-[11px] font-bold text-zinc-400 mb-1">
                      Route Path (relative to /api/mock-server/call)
                    </label>
                    <input
                      type="text"
                      value={formPath}
                      onChange={e => setFormPath(e.target.value)}
                      placeholder="/users or /v1/products"
                      className={`w-full px-3 py-1.5 rounded-lg border text-xs font-mono outline-hidden ${
                        isDark ? "bg-zinc-950 border-zinc-800 text-white" : "bg-slate-50 border-slate-300"
                      }`}
                    />
                  </div>

                  {/* STATUS CODE */}
                  <div>
                    <label className="block text-[11px] font-bold text-zinc-400 mb-1">HTTP Status</label>
                    <select
                      value={formStatusCode}
                      onChange={e => setFormStatusCode(Number(e.target.value))}
                      className={`w-full px-3 py-1.5 rounded-lg border text-xs font-mono outline-hidden ${
                        isDark ? "bg-zinc-950 border-zinc-800 text-white" : "bg-slate-50 border-slate-300"
                      }`}
                    >
                      <option value={200}>200 OK</option>
                      <option value={201}>201 Created</option>
                      <option value={204}>204 No Content</option>
                      <option value={400}>400 Bad Request</option>
                      <option value={401}>401 Unauthorized</option>
                      <option value={403}>403 Forbidden</option>
                      <option value={404}>404 Not Found</option>
                      <option value={429}>429 Rate Limit</option>
                      <option value={500}>500 Internal Error</option>
                    </select>
                  </div>
                </div>

                {/* DELAY SLIDER */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] font-bold text-zinc-400 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-zinc-400" />
                      Simulated Response Latency
                    </label>
                    <span className="text-xs font-mono font-bold text-emerald-400">{formDelayMs} ms</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="3000"
                    step="50"
                    value={formDelayMs}
                    onChange={e => setFormDelayMs(Number(e.target.value))}
                    className="w-full accent-emerald-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-zinc-500 font-mono mt-0.5">
                    <span>Instant (0ms)</span>
                    <span>500ms</span>
                    <span>1000ms</span>
                    <span>2000ms</span>
                    <span>High Latency (3000ms)</span>
                  </div>
                </div>

                {/* RESPONSE BODY */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] font-bold text-zinc-400 flex items-center gap-1.5">
                      <Code className="w-3.5 h-3.5 text-zinc-400" />
                      Mock Response Body (JSON or Text)
                    </label>
                    <button
                      onClick={() => {
                        try {
                          const formatted = JSON.stringify(JSON.parse(formResponseBody), null, 2);
                          setFormResponseBody(formatted);
                        } catch {
                          // Not valid json, ignore
                        }
                      }}
                      className="text-[11px] font-bold text-emerald-400 hover:underline"
                    >
                      Prettify JSON
                    </button>
                  </div>
                  <textarea
                    rows={8}
                    value={formResponseBody}
                    onChange={e => setFormResponseBody(e.target.value)}
                    className={`w-full p-3 rounded-xl border text-xs font-mono outline-hidden ${
                      isDark ? "bg-zinc-950 border-zinc-800 text-emerald-300" : "bg-slate-50 border-slate-300 text-slate-800"
                    }`}
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-zinc-400 hover:text-white cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveEndpoint}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer shadow-md transition-colors"
                  >
                    <Check className="w-4 h-4" />
                    Save & Deploy Route
                  </button>
                </div>
              </div>
            ) : selectedEndpoint ? (
              /* VIEW / TEST ACTIVE ENDPOINT */
              <div className="space-y-4">
                {/* ENDPOINT HEADER CARD */}
                <div
                  className={`p-4 rounded-2xl border flex flex-col md:flex-row md:items-center justify-between gap-3 ${
                    isDark ? "bg-zinc-900/60 border-zinc-800" : "bg-white border-slate-200"
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-xs font-extrabold uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        {selectedEndpoint.method}
                      </span>
                      <span className="font-mono text-sm font-bold">{selectedEndpoint.path}</span>
                      <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-zinc-800 text-zinc-300">
                        {selectedEndpoint.statusCode}
                      </span>
                    </div>
                    <div className="text-xs text-zinc-400 flex items-center gap-3">
                      <span>Latency: {selectedEndpoint.delayMs}ms</span>
                      <span>Target: <code className="font-mono text-emerald-400">/api/mock-server/call{selectedEndpoint.path}</code></span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() =>
                        copyToClipboard(
                          `${window.location.origin}/api/mock-server/call${selectedEndpoint.path}`,
                          "copy-url"
                        )
                      }
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg border text-xs font-bold hover:bg-zinc-800 cursor-pointer transition-colors"
                    >
                      {copiedId === "copy-url" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      Copy URL
                    </button>
                    <button
                      onClick={() => openEditEndpoint(selectedEndpoint)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg border text-xs font-bold hover:bg-zinc-800 cursor-pointer transition-colors"
                    >
                      <Sliders className="w-3.5 h-3.5" />
                      Configure
                    </button>
                    <button
                      onClick={() => handleTestEndpoint(selectedEndpoint)}
                      disabled={isTesting}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer shadow-md transition-colors"
                    >
                      {isTesting ? (
                        <RotateCcw className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Play className="w-3.5 h-3.5" />
                      )}
                      Test Live Call
                    </button>
                  </div>
                </div>

                {/* TEST RESULT OR PREVIEW */}
                {testResult ? (
                  <div
                    className={`p-4 rounded-2xl border space-y-3 ${
                      isDark ? "bg-zinc-900/60 border-zinc-800" : "bg-white border-slate-200"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-0.5 rounded text-xs font-bold font-mono ${
                            testResult.status >= 200 && testResult.status < 300
                              ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                              : "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                          }`}
                        >
                          Status {testResult.status}
                        </span>
                        <span className="text-xs text-zinc-400 font-mono flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" /> {testResult.timeMs}ms
                        </span>
                      </div>
                      <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                        <CheckCircle className="w-3.5 h-3.5" /> Response Received
                      </span>
                    </div>

                    <pre
                      className={`p-3 rounded-xl border text-xs font-mono overflow-x-auto max-h-80 ${
                        isDark ? "bg-zinc-950 border-zinc-800 text-emerald-300" : "bg-slate-50 border-slate-300 text-slate-800"
                      }`}
                    >
                      {typeof testResult.data === "object"
                        ? JSON.stringify(testResult.data, null, 2)
                        : String(testResult.data)}
                    </pre>
                  </div>
                ) : (
                  <div
                    className={`p-4 rounded-2xl border space-y-2 ${
                      isDark ? "bg-zinc-900/60 border-zinc-800" : "bg-white border-slate-200"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                        Configured Response Payload
                      </span>
                      <button
                        onClick={() =>
                          copyToClipboard(
                            JSON.stringify(selectedEndpoint.responseBody, null, 2),
                            "copy-payload"
                          )
                        }
                        className="text-xs font-bold text-zinc-400 hover:text-white flex items-center gap-1"
                      >
                        {copiedId === "copy-payload" ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        Copy
                      </button>
                    </div>

                    <pre
                      className={`p-3 rounded-xl border text-xs font-mono overflow-x-auto max-h-72 ${
                        isDark ? "bg-zinc-950 border-zinc-800 text-emerald-300" : "bg-slate-50 border-slate-300 text-slate-800"
                      }`}
                    >
                      {typeof selectedEndpoint.responseBody === "object"
                        ? JSON.stringify(selectedEndpoint.responseBody, null, 2)
                        : String(selectedEndpoint.responseBody)}
                    </pre>
                  </div>
                )}

                {/* CURL SNIPPET */}
                <div
                  className={`p-3 rounded-xl border space-y-2 ${
                    isDark ? "bg-zinc-950/60 border-zinc-800/80" : "bg-slate-100 border-slate-200"
                  }`}
                >
                  <div className="flex items-center justify-between text-xs text-zinc-400 font-bold">
                    <span>cURL Request Example</span>
                    <button
                      onClick={() =>
                        copyToClipboard(
                          `curl -X ${selectedEndpoint.method === "ANY" ? "GET" : selectedEndpoint.method} "${window.location.origin}/api/mock-server/call${selectedEndpoint.path}"`,
                          "copy-curl"
                        )
                      }
                      className="text-emerald-400 hover:underline flex items-center gap-1"
                    >
                      {copiedId === "copy-curl" ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      Copy cURL
                    </button>
                  </div>
                  <code className="block text-xs font-mono text-zinc-300 break-all select-all">
                    curl -X {selectedEndpoint.method === "ANY" ? "GET" : selectedEndpoint.method} "{window.location.origin}/api/mock-server/call{selectedEndpoint.path}"
                  </code>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-zinc-500 space-y-2">
                <Server className="w-8 h-8 opacity-40" />
                <p className="text-sm">Select an endpoint on the left or create a new one.</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* WEBHOOK INSPECTOR VIEW */
        <div className="flex-1 flex min-h-0 overflow-hidden">
          {/* WEBHOOK LOGS SIDEBAR */}
          <div
            className={`w-88 border-r flex flex-col shrink-0 ${
              isDark ? "border-zinc-800/80 bg-zinc-950/40" : "border-slate-200 bg-slate-50/50"
            }`}
          >
            {/* WEBHOOK URL HEADER */}
            <div className="p-3 border-b border-zinc-800/60 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-purple-400 flex items-center gap-1.5">
                  <Radio className="w-3.5 h-3.5 animate-pulse" />
                  Your Webhook URL
                </span>
                <span className="text-[10px] text-zinc-500 font-mono">
                  {webhookLogs.length} events
                </span>
              </div>

              <div
                className={`flex items-center justify-between p-2 rounded-lg border text-xs font-mono ${
                  isDark ? "bg-zinc-950 border-zinc-800" : "bg-white border-slate-200"
                }`}
              >
                <span className="truncate text-zinc-300 pr-2">{webhookUrl}</span>
                <button
                  onClick={() => copyToClipboard(webhookUrl, "wh-url")}
                  className="text-purple-400 hover:text-purple-300 shrink-0 p-1"
                  title="Copy Webhook URL"
                >
                  {copiedId === "wh-url" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={handleSendTestWebhook}
                  className="flex-1 flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold bg-purple-600 hover:bg-purple-500 text-white cursor-pointer shadow-xs transition-colors"
                >
                  <Send className="w-3 h-3" />
                  Send Test Webhook
                </button>
                <button
                  onClick={handleClearWebhookLogs}
                  className="px-2 py-1.5 rounded-lg border text-xs font-bold text-zinc-400 hover:text-rose-400 hover:border-rose-500/30 cursor-pointer transition-colors"
                  title="Clear all captured events"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* LOGS LIST */}
            <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
              {webhookLogs.map(log => {
                const isSelected = selectedLog?.id === log.id;
                const timeAgo = new Date(log.timestamp).toLocaleTimeString();

                return (
                  <div
                    key={log.id}
                    onClick={() => setSelectedLog(log)}
                    className={`p-2.5 rounded-xl border text-xs cursor-pointer transition-all ${
                      isSelected
                        ? isDark
                          ? "bg-zinc-900 border-purple-500/50 shadow-md"
                          : "bg-white border-purple-500 shadow-md ring-1 ring-purple-500/20"
                        : isDark
                        ? "bg-zinc-900/40 border-zinc-800/60 hover:bg-zinc-900/80 hover:border-zinc-700"
                        : "bg-white border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <div className="flex items-center gap-1.5">
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-extrabold uppercase bg-purple-500/20 text-purple-400 border border-purple-500/30">
                          {log.method}
                        </span>
                        <span className="font-mono font-bold truncate text-zinc-300">{log.path}</span>
                      </div>
                      <span className="text-[10px] font-mono text-zinc-500">{timeAgo}</span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-zinc-400">
                      <span>IP: {log.ip}</span>
                      <span className="truncate max-w-[120px] font-mono text-zinc-500">
                        {typeof log.body === "object" ? JSON.stringify(log.body).slice(0, 20) + "..." : "empty"}
                      </span>
                    </div>
                  </div>
                );
              })}

              {webhookLogs.length === 0 && (
                <div className="text-center py-12 text-zinc-500 text-xs space-y-2">
                  <Radio className="w-6 h-6 mx-auto opacity-30 text-purple-400" />
                  <p>Listening for incoming webhooks...</p>
                  <p className="text-[11px] text-zinc-600">
                    Click "Send Test Webhook" above or send a POST request to your URL.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* WEBHOOK EVENT INSPECTOR */}
          <div className="flex-1 flex flex-col min-w-0 min-h-0 overflow-y-auto p-4 space-y-4">
            {selectedLog ? (
              <div className="space-y-4">
                {/* HEADER METRICS */}
                <div
                  className={`p-4 rounded-2xl border flex items-center justify-between ${
                    isDark ? "bg-zinc-900/60 border-zinc-800" : "bg-white border-slate-200"
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-xs font-extrabold uppercase bg-purple-500/20 text-purple-400 border border-purple-500/30">
                        {selectedLog.method}
                      </span>
                      <span className="font-mono text-sm font-bold">{selectedLog.path}</span>
                    </div>
                    <div className="text-xs text-zinc-400 flex items-center gap-3">
                      <span>Timestamp: {new Date(selectedLog.timestamp).toLocaleString()}</span>
                      <span>Client IP: <code className="font-mono text-purple-400">{selectedLog.ip}</code></span>
                    </div>
                  </div>

                  <button
                    onClick={() =>
                      copyToClipboard(
                        JSON.stringify(selectedLog.body, null, 2),
                        "copy-wh-body"
                      )
                    }
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg border text-xs font-bold hover:bg-zinc-800 cursor-pointer transition-colors"
                  >
                    {copiedId === "copy-wh-body" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    Copy Payload
                  </button>
                </div>

                {/* BODY PAYLOAD */}
                <div
                  className={`p-4 rounded-2xl border space-y-2 ${
                    isDark ? "bg-zinc-900/60 border-zinc-800" : "bg-white border-slate-200"
                  }`}
                >
                  <h4 className="text-xs font-bold uppercase tracking-wider text-purple-400 flex items-center gap-1.5">
                    <FileJson className="w-3.5 h-3.5" />
                    Parsed JSON Payload
                  </h4>
                  <pre
                    className={`p-3 rounded-xl border text-xs font-mono overflow-x-auto max-h-80 ${
                      isDark ? "bg-zinc-950 border-zinc-800 text-purple-300" : "bg-slate-50 border-slate-300 text-slate-800"
                    }`}
                  >
                    {typeof selectedLog.body === "object"
                      ? JSON.stringify(selectedLog.body, null, 2)
                      : String(selectedLog.body || "(No body provided)")}
                  </pre>
                </div>

                {/* HEADERS VIEWER */}
                <div
                  className={`p-4 rounded-2xl border space-y-2 ${
                    isDark ? "bg-zinc-900/60 border-zinc-800" : "bg-white border-slate-200"
                  }`}
                >
                  <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                    Received Request Headers ({Object.keys(selectedLog.headers || {}).length})
                  </h4>
                  <div
                    className={`p-3 rounded-xl border divide-y text-xs font-mono max-h-48 overflow-y-auto ${
                      isDark ? "bg-zinc-950 border-zinc-800 divide-zinc-800/60" : "bg-slate-50 border-slate-200 divide-slate-200"
                    }`}
                  >
                    {Object.entries(selectedLog.headers || {}).map(([key, val]) => (
                      <div key={key} className="py-1 flex justify-between gap-4">
                        <span className="text-zinc-400 shrink-0 font-bold">{key}:</span>
                        <span className="text-zinc-200 truncate select-all">{val}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-zinc-500 space-y-2">
                <Radio className="w-8 h-8 opacity-40 text-purple-400" />
                <p className="text-sm">Select an incoming webhook from the left list to inspect.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MockServerWebhookAgent;
