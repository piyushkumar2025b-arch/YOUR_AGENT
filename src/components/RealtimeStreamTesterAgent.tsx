import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  Radio,
  Wifi,
  WifiOff,
  Play,
  Square,
  Send,
  Trash2,
  Copy,
  Check,
  Download,
  Save,
  Search,
  RefreshCw,
  Clock,
  ArrowUpRight,
  ArrowDownLeft,
  Activity,
  Sliders,
  CheckCircle2,
  AlertCircle,
  FileCode,
  TrendingUp,
  Cpu,
  MessageSquare,
  Sparkles,
  Zap,
  Layers,
  Code
} from "lucide-react";

export interface RealtimeStreamTesterAgentProps {
  apiKey?: string;
  theme: "light" | "dark";
  onSaveFile?: (path: string, content: string) => void;
  onAddLog?: (type: string, msg: string) => void;
}

export type StreamProtocol = "websocket" | "sse" | "simulation";
export type PacketDirection = "incoming" | "outgoing" | "system" | "ping";

export interface PacketMessage {
  id: string;
  timestamp: number;
  direction: PacketDirection;
  payload: string;
  sizeBytes: number;
  latencyMs?: number;
  isJson: boolean;
}

export type SimMode = "crypto" | "telemetry" | "chat" | "tokens";

const DEFAULT_ENDPOINTS = [
  { label: "Public WebSocket Echo (Postman)", url: "wss://ws.postman-echo.com/raw", protocol: "websocket" },
  { label: "Public WebSocket Echo (Events)", url: "wss://echo.websocket.events", protocol: "websocket" },
  { label: "Public SSE Stream (sse.dev)", url: "https://sse.dev/test", protocol: "sse" },
  { label: "Local Dev WebSocket", url: "ws://localhost:3000/ws", protocol: "websocket" },
  { label: "Built-in Simulator (Zero Network Req)", url: "sim://local-feed", protocol: "simulation" }
];

export const RealtimeStreamTesterAgent: React.FC<RealtimeStreamTesterAgentProps> = ({
  theme,
  onSaveFile,
  onAddLog
}) => {
  const [protocol, setProtocol] = useState<StreamProtocol>("websocket");
  const [endpointUrl, setEndpointUrl] = useState<string>("wss://echo.websocket.events");
  const [connectionStatus, setConnectionStatus] = useState<"disconnected" | "connecting" | "connected" | "error">("disconnected");
  const [packets, setPackets] = useState<PacketMessage[]>([]);
  const [searchFilter, setSearchFilter] = useState<string>("");
  const [directionFilter, setDirectionFilter] = useState<"all" | "incoming" | "outgoing">("all");
  const [autoScroll, setAutoScroll] = useState<boolean>(true);

  // Message composer
  const [outgoingPayload, setOutgoingPayload] = useState<string>(
    JSON.stringify({ type: "ping", timestamp: Date.now() }, null, 2)
  );
  const [autoIntervalMs, setAutoIntervalMs] = useState<number>(0);
  const [simMode, setSimMode] = useState<SimMode>("crypto");
  const [activeTab, setActiveTab] = useState<"stream" | "code" | "stats">("stream");

  // Heartbeat ping tracking
  const [pingStats, setPingStats] = useState<{ min: number; max: number; avg: number; count: number }>({
    min: 0,
    max: 0,
    avg: 0,
    count: 0
  });

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState<boolean>(false);

  // Native refs
  const wsRef = useRef<WebSocket | null>(null);
  const sseRef = useRef<EventSource | null>(null);
  const simIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const autoPingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const packetsEndRef = useRef<HTMLDivElement | null>(null);
  const pingTimestampMapRef = useRef<Map<string, number>>(new Map());

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  // Scroll to bottom when packets change
  useEffect(() => {
    if (autoScroll && packetsEndRef.current) {
      packetsEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [packets, autoScroll]);

  // Clean up connections on unmount
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, []);

  const addPacket = (direction: PacketDirection, payload: string, latencyMs?: number) => {
    let isJson = false;
    try {
      JSON.parse(payload);
      isJson = true;
    } catch {
      isJson = false;
    }

    const newPacket: PacketMessage = {
      id: `pkt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      timestamp: Date.now(),
      direction,
      payload,
      sizeBytes: new Blob([payload]).size,
      latencyMs,
      isJson
    };

    setPackets(prev => {
      const updated = [...prev, newPacket];
      if (updated.length > 500) {
        return updated.slice(updated.length - 500);
      }
      return updated;
    });

    if (direction === "incoming" && latencyMs !== undefined) {
      setPingStats(prev => {
        const count = prev.count + 1;
        const min = prev.min === 0 ? latencyMs : Math.min(prev.min, latencyMs);
        const max = Math.max(prev.max, latencyMs);
        const avg = Math.round((prev.avg * prev.count + latencyMs) / count);
        return { min, max, avg, count };
      });
    }
  };

  // Connect handler
  const connect = () => {
    disconnect();
    setConnectionStatus("connecting");
    addPacket("system", `Attempting connection to ${endpointUrl} via [${protocol.toUpperCase()}]`);

    if (protocol === "simulation") {
      setConnectionStatus("connected");
      addPacket("system", `Connected to Simulated Realtime Feed (${simMode.toUpperCase()})`);
      if (onAddLog) onAddLog("network", `Connected to Realtime Simulator (${simMode})`);

      startSimulationFeed();
      return;
    }

    if (protocol === "websocket") {
      try {
        const ws = new WebSocket(endpointUrl);
        wsRef.current = ws;

        ws.onopen = () => {
          setConnectionStatus("connected");
          addPacket("system", `WebSocket handshake established with ${endpointUrl}`);
          showToast("WebSocket connected!");
          if (onAddLog) onAddLog("network", `WebSocket connected: ${endpointUrl}`);
        };

        ws.onmessage = (event) => {
          const rawData = typeof event.data === "string" ? event.data : "[Binary data]";
          // Check if it's an echo of a ping we sent
          let measuredLatency: number | undefined;
          try {
            const parsed = JSON.parse(rawData);
            if (parsed.pingId && pingTimestampMapRef.current.has(parsed.pingId)) {
              const sentAt = pingTimestampMapRef.current.get(parsed.pingId)!;
              measuredLatency = Math.round(performance.now() - sentAt);
              pingTimestampMapRef.current.delete(parsed.pingId);
            }
          } catch { }

          addPacket("incoming", rawData, measuredLatency);
        };

        ws.onerror = () => {
          setConnectionStatus("error");
          addPacket("system", `WebSocket error occurred on endpoint ${endpointUrl}`);
        };

        ws.onclose = (event) => {
          setConnectionStatus("disconnected");
          addPacket("system", `WebSocket closed (Code: ${event.code}, Reason: ${event.reason || "normal"})`);
        };
      } catch (err: any) {
        setConnectionStatus("error");
        addPacket("system", `Failed to instantiate WebSocket: ${err.message}`);
      }
      return;
    }

    if (protocol === "sse") {
      try {
        const sse = new EventSource(endpointUrl);
        sseRef.current = sse;

        sse.onopen = () => {
          setConnectionStatus("connected");
          addPacket("system", `EventSource connection open to ${endpointUrl}`);
          showToast("SSE Stream open!");
          if (onAddLog) onAddLog("network", `SSE Connected: ${endpointUrl}`);
        };

        sse.onmessage = (event) => {
          addPacket("incoming", event.data || "[Empty SSE frame]");
        };

        sse.onerror = () => {
          setConnectionStatus("error");
          addPacket("system", `EventSource encountered an error or connection was closed`);
        };
      } catch (err: any) {
        setConnectionStatus("error");
        addPacket("system", `Failed to connect EventSource: ${err.message}`);
      }
    }
  };

  // Disconnect handler
  const disconnect = () => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    if (sseRef.current) {
      sseRef.current.close();
      sseRef.current = null;
    }
    if (simIntervalRef.current) {
      clearInterval(simIntervalRef.current);
      simIntervalRef.current = null;
    }
    if (autoPingIntervalRef.current) {
      clearInterval(autoPingIntervalRef.current);
      autoPingIntervalRef.current = null;
    }
    setAutoIntervalMs(0);
    setConnectionStatus("disconnected");
  };

  // Simulation Feed Generator
  const startSimulationFeed = () => {
    let tickCount = 0;
    let btcPrice = 64250.0;
    let ethPrice = 3450.0;

    simIntervalRef.current = setInterval(() => {
      tickCount++;
      if (simMode === "crypto") {
        btcPrice += (Math.random() - 0.49) * 45;
        ethPrice += (Math.random() - 0.49) * 8;
        const tick = {
          feed: "crypto_market_ticker",
          sequence: tickCount,
          timestamp: Date.now(),
          tickers: [
            { symbol: "BTC-USD", price: parseFloat(btcPrice.toFixed(2)), change24h: "+3.42%", volume: 4891.2 },
            { symbol: "ETH-USD", price: parseFloat(ethPrice.toFixed(2)), change24h: "+1.85%", volume: 19821.5 },
            { symbol: "SOL-USD", price: parseFloat((145.2 + Math.random() * 2).toFixed(2)), change24h: "+5.12%", volume: 84920.1 }
          ]
        };
        addPacket("incoming", JSON.stringify(tick, null, 2));
      } else if (simMode === "telemetry") {
        const telemetry = {
          feed: "cluster_node_telemetry",
          nodeId: "worker-node-us-east-4",
          cpuLoadPercent: parseFloat((28 + Math.random() * 35).toFixed(1)),
          memoryUsageMb: 1420 + Math.floor(Math.random() * 120),
          activeConnections: 340 + Math.floor(Math.random() * 20),
          reqPerSec: Math.floor(850 + Math.random() * 400),
          networkRxKbs: parseFloat((1200 + Math.random() * 500).toFixed(1)),
          status: "healthy",
          timestamp: Date.now()
        };
        addPacket("incoming", JSON.stringify(telemetry, null, 2));
      } else if (simMode === "chat") {
        const users = ["Maya", "Devin", "Alex", "Zoe", "Liam", "Sarah"];
        const texts = [
          "Deployed the new patch to staging.",
          "Check the latest OpenAPI schema specs.",
          "Who is on call for cluster telemetry?",
          "Reviewing pull request #42 right now.",
          "Tests passing across all CI workers!"
        ];
        const user = users[Math.floor(Math.random() * users.length)];
        const text = texts[Math.floor(Math.random() * texts.length)];
        const chatMsg = {
          event: "chat_message",
          room: "engineering-general",
          author: { id: `usr_${user.toLowerCase()}`, name: user },
          content: text,
          timestamp: new Date().toLocaleTimeString()
        };
        addPacket("incoming", JSON.stringify(chatMsg, null, 2));
      } else if (simMode === "tokens") {
        const sampleTokens = [" The", " neural", " system", " has", " synchronized", " all", " distributed", " nodes", " successfully.", " Latency", " is", " optimal."];
        const token = sampleTokens[tickCount % sampleTokens.length];
        const chunk = {
          event: "ai_token_chunk",
          chunkIndex: tickCount,
          token,
          finishReason: tickCount % sampleTokens.length === sampleTokens.length - 1 ? "stop" : null
        };
        addPacket("incoming", JSON.stringify(chunk, null, 2));
      }
    }, 1800);
  };

  // Send single packet
  const handleSendPacket = () => {
    if (connectionStatus !== "connected") {
      showToast("Cannot send: not connected to server!");
      return;
    }

    if (!outgoingPayload.trim()) return;

    if (protocol === "websocket" && wsRef.current) {
      try {
        const pingId = `png_${Date.now()}`;
        let sendStr = outgoingPayload;
        // Inject pingId if json
        try {
          const parsed = JSON.parse(outgoingPayload);
          parsed.pingId = pingId;
          sendStr = JSON.stringify(parsed);
          pingTimestampMapRef.current.set(pingId, performance.now());
        } catch { }

        wsRef.current.send(sendStr);
        addPacket("outgoing", outgoingPayload);
      } catch (err: any) {
        showToast(`Send error: ${err.message}`);
      }
    } else if (protocol === "simulation") {
      addPacket("outgoing", outgoingPayload);
      // In simulation mode, echo back response after brief delay
      setTimeout(() => {
        addPacket("incoming", JSON.stringify({
          acknowledged: true,
          echo: outgoingPayload,
          serverTimestamp: Date.now()
        }, null, 2), Math.floor(18 + Math.random() * 25));
      }, 60);
    } else {
      showToast("Server-Sent Events (SSE) is receive-only. Client cannot send upstream frames.");
    }
  };

  // Interval dispatcher toggle
  const toggleAutoInterval = (intervalMs: number) => {
    if (autoPingIntervalRef.current) {
      clearInterval(autoPingIntervalRef.current);
      autoPingIntervalRef.current = null;
    }

    if (autoIntervalMs === intervalMs || intervalMs === 0) {
      setAutoIntervalMs(0);
      showToast("Stopped automated repeat sender.");
      return;
    }

    setAutoIntervalMs(intervalMs);
    showToast(`Sending packet every ${intervalMs}ms...`);

    autoPingIntervalRef.current = setInterval(() => {
      if (protocol === "websocket" && wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        const payload = JSON.stringify({ type: "heartbeat", seq: Date.now() });
        wsRef.current.send(payload);
        addPacket("ping", payload);
      } else if (protocol === "simulation") {
        const payload = JSON.stringify({ type: "heartbeat", seq: Date.now() });
        addPacket("ping", payload);
      }
    }, intervalMs);
  };

  // Export packets capture
  const handleExportPackets = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(packets, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `realtime-packets-${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast("Downloaded packets capture JSON!");
  };

  // Generated Client Integration Code
  const generatedClientCode = useMemo(() => {
    return `/**
 * Production-ready Realtime Stream Client
 * Generated by Remix Studio Realtime Stream Tester
 */

export interface RealtimeMessageListener {
  (data: any, raw: string): void;
}

export class RealtimeStreamClient {
  private ws: WebSocket | null = null;
  private url: string;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private listeners: Set<RealtimeMessageListener> = new Set();
  private heartbeatInterval: any = null;

  constructor(url: string = "${endpointUrl.startsWith("sim://") ? "wss://ws.postman-echo.com/raw" : endpointUrl}") {
    this.url = url;
  }

  public connect(): void {
    try {
      this.ws = new WebSocket(this.url);

      this.ws.onopen = () => {
        console.log("⚡ [RealtimeClient] Connected to", this.url);
        this.reconnectAttempts = 0;
        this.startHeartbeat();
      };

      this.ws.onmessage = (event) => {
        let parsed: any = null;
        try {
          parsed = JSON.parse(event.data);
        } catch {
          parsed = event.data;
        }
        this.listeners.forEach((listener) => listener(parsed, event.data));
      };

      this.ws.onclose = () => {
        this.stopHeartbeat();
        this.attemptReconnect();
      };

      this.ws.onerror = (err) => {
        console.error("❌ [RealtimeClient] WebSocket error:", err);
      };
    } catch (err) {
      console.error("❌ [RealtimeClient] Initialization failed:", err);
    }
  }

  public send(payload: any): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      const msg = typeof payload === "string" ? payload : JSON.stringify(payload);
      this.ws.send(msg);
    } else {
      console.warn("⚠️ [RealtimeClient] Socket not open, message queued or dropped");
    }
  }

  public subscribe(listener: RealtimeMessageListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  public disconnect(): void {
    this.stopHeartbeat();
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  private startHeartbeat(): void {
    this.heartbeatInterval = setInterval(() => {
      this.send({ type: "ping", timestamp: Date.now() });
    }, 30000);
  }

  private stopHeartbeat(): void {
    if (this.heartbeatInterval) clearInterval(this.heartbeatInterval);
  }

  private attemptReconnect(): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 15000);
      console.log(\`🔄 [RealtimeClient] Reconnecting in \${delay}ms...\`);
      setTimeout(() => this.connect(), delay);
    }
  }
}

export const realtimeClient = new RealtimeStreamClient();
`;
  }, [endpointUrl]);

  // Filtered Packets
  const filteredPackets = useMemo(() => {
    return packets.filter(p => {
      const matchesDir =
        directionFilter === "all" ||
        (directionFilter === "incoming" && p.direction === "incoming") ||
        (directionFilter === "outgoing" && (p.direction === "outgoing" || p.direction === "ping"));
      const matchesSearch =
        searchFilter === "" ||
        p.payload.toLowerCase().includes(searchFilter.toLowerCase());
      return matchesDir && matchesSearch;
    });
  }, [packets, directionFilter, searchFilter]);

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
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-500 to-indigo-500 flex items-center justify-center shadow-lg shadow-purple-500/20 text-white">
            <Radio className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold tracking-tight">WebSocket & SSE Stream Studio</h1>
              <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-purple-500/20 text-purple-400 border border-purple-500/30">
                Live Inspector
              </span>
              {connectionStatus === "connected" && (
                <span className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  Live Stream
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              Interactive WebSocket & Server-Sent Events tester, real-time message ledger & mock stream generator
            </p>
          </div>
        </div>

        {/* Global Save / Export Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          {onSaveFile && (
            <button
              onClick={() => {
                onSaveFile("src/services/realtimeClient.ts", generatedClientCode);
                showToast("Saved realtimeClient.ts to project!");
                if (onAddLog) onAddLog("create", "Saved src/services/realtimeClient.ts");
              }}
              className="px-3 py-1.5 text-xs font-medium rounded-lg bg-purple-600 hover:bg-purple-500 text-white flex items-center gap-1.5 shadow-md shadow-purple-600/20 transition-all"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Client to Project</span>
            </button>
          )}

          <button
            onClick={handleExportPackets}
            disabled={packets.length === 0}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg border flex items-center gap-1.5 transition-all disabled:opacity-40 ${
              theme === "dark" ? "bg-slate-800 border-slate-700 hover:bg-slate-700 text-slate-200" : "bg-white border-slate-300 hover:bg-slate-100 text-slate-800"
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export PCAP JSON ({packets.length})</span>
          </button>
        </div>
      </div>

      {/* Connection Config Bar */}
      <div className={`p-4 border-b space-y-3 ${theme === "dark" ? "bg-slate-900/60 border-slate-800" : "bg-slate-100/70 border-slate-200"}`}>
        <div className="flex flex-wrap items-center gap-3">
          {/* Protocol Selector */}
          <div className="flex items-center rounded-lg border p-1 bg-slate-800/40 text-xs border-slate-700">
            <button
              onClick={() => {
                setProtocol("websocket");
                setEndpointUrl("wss://ws.postman-echo.com/raw");
              }}
              className={`px-3 py-1 rounded font-medium transition-colors ${
                protocol === "websocket" ? "bg-purple-600 text-white" : "text-slate-400 hover:text-white"
              }`}
            >
              WebSocket (WSS)
            </button>
            <button
              onClick={() => {
                setProtocol("sse");
                setEndpointUrl("https://sse.dev/test");
              }}
              className={`px-3 py-1 rounded font-medium transition-colors ${
                protocol === "sse" ? "bg-purple-600 text-white" : "text-slate-400 hover:text-white"
              }`}
            >
              Server-Sent Events (SSE)
            </button>
            <button
              onClick={() => {
                setProtocol("simulation");
                setEndpointUrl("sim://local-feed");
              }}
              className={`px-3 py-1 rounded font-medium transition-colors ${
                protocol === "simulation" ? "bg-purple-600 text-white" : "text-slate-400 hover:text-white"
              }`}
            >
              Virtual Simulator
            </button>
          </div>

          {/* Quick Presets Dropdown */}
          <select
            onChange={e => {
              const selected = DEFAULT_ENDPOINTS.find(d => d.url === e.target.value);
              if (selected) {
                setProtocol(selected.protocol as StreamProtocol);
                setEndpointUrl(selected.url);
              }
            }}
            value={endpointUrl}
            className={`px-2.5 py-1.5 text-xs rounded-lg border outline-none font-mono ${
              theme === "dark" ? "bg-slate-800 border-slate-700 text-slate-300" : "bg-white border-slate-300 text-slate-800"
            }`}
          >
            {DEFAULT_ENDPOINTS.map(d => (
              <option key={d.url} value={d.url}>
                {d.label}
              </option>
            ))}
          </select>

          {/* Target URL Input */}
          <div className="flex-1 min-w-[260px] flex items-center gap-2">
            <input
              type="text"
              value={endpointUrl}
              onChange={e => setEndpointUrl(e.target.value)}
              placeholder="ws:// or wss:// or https:// endpoint"
              className={`flex-1 px-3 py-1.5 text-xs rounded-lg border font-mono outline-none ${
                theme === "dark" ? "bg-slate-800 border-slate-700 text-purple-300 focus:border-purple-500" : "bg-white border-slate-300 text-slate-800 focus:border-purple-500"
              }`}
            />
          </div>

          {/* Connect / Disconnect Buttons */}
          {connectionStatus === "connected" ? (
            <button
              onClick={disconnect}
              className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-rose-600 hover:bg-rose-500 text-white flex items-center gap-1.5 shadow"
            >
              <WifiOff className="w-3.5 h-3.5" />
              <span>Disconnect</span>
            </button>
          ) : (
            <button
              onClick={connect}
              disabled={connectionStatus === "connecting"}
              className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-1.5 shadow"
            >
              {connectionStatus === "connecting" ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Connecting...</span>
                </>
              ) : (
                <>
                  <Wifi className="w-3.5 h-3.5" />
                  <span>Connect Stream</span>
                </>
              )}
            </button>
          )}
        </div>

        {/* If in Virtual Simulator Mode, show Sim Type Chooser */}
        {protocol === "simulation" && (
          <div className="flex items-center gap-2 pt-1 text-xs">
            <span className="text-slate-400 flex items-center gap-1 font-medium">
              <Sparkles className="w-3.5 h-3.5 text-purple-400" /> Simulation Mode:
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setSimMode("crypto")}
                className={`px-2.5 py-1 rounded-md text-[11px] font-medium flex items-center gap-1 transition-colors ${
                  simMode === "crypto" ? "bg-amber-500 text-black font-bold" : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                }`}
              >
                <TrendingUp className="w-3 h-3" /> Crypto Ticker
              </button>
              <button
                onClick={() => setSimMode("telemetry")}
                className={`px-2.5 py-1 rounded-md text-[11px] font-medium flex items-center gap-1 transition-colors ${
                  simMode === "telemetry" ? "bg-cyan-500 text-black font-bold" : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                }`}
              >
                <Cpu className="w-3 h-3" /> Cluster Telemetry
              </button>
              <button
                onClick={() => setSimMode("chat")}
                className={`px-2.5 py-1 rounded-md text-[11px] font-medium flex items-center gap-1 transition-colors ${
                  simMode === "chat" ? "bg-indigo-500 text-white font-bold" : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                }`}
              >
                <MessageSquare className="w-3 h-3" /> Chat Room
              </button>
              <button
                onClick={() => setSimMode("tokens")}
                className={`px-2.5 py-1 rounded-md text-[11px] font-medium flex items-center gap-1 transition-colors ${
                  simMode === "tokens" ? "bg-emerald-500 text-black font-bold" : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                }`}
              >
                <Zap className="w-3 h-3" /> AI Token Stream
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Main Body: Dual-Pane Stream View */}
      <div className="flex-1 flex flex-col md:flex-row h-full overflow-hidden">
        {/* Left Pane: Realtime Packet Ledger / Stream */}
        <div className="flex-1 flex flex-col h-full border-r border-slate-800 overflow-hidden">
          {/* Stream Filter & Control Bar */}
          <div className={`p-2.5 border-b flex flex-wrap items-center justify-between gap-2 text-xs ${theme === "dark" ? "bg-slate-900/40 border-slate-800" : "bg-slate-100 border-slate-200"}`}>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="w-3 h-3 absolute left-2 top-2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Filter packets..."
                  value={searchFilter}
                  onChange={e => setSearchFilter(e.target.value)}
                  className={`pl-7 pr-2 py-1 text-xs rounded border outline-none font-mono ${
                    theme === "dark" ? "bg-slate-800 border-slate-700 text-white" : "bg-white border-slate-300 text-slate-800"
                  }`}
                />
              </div>

              <div className="flex items-center rounded border p-0.5 text-[11px] border-slate-700">
                <button
                  onClick={() => setDirectionFilter("all")}
                  className={`px-2 py-0.5 rounded font-medium ${directionFilter === "all" ? "bg-slate-700 text-white" : "text-slate-400"}`}
                >
                  All ({packets.length})
                </button>
                <button
                  onClick={() => setDirectionFilter("incoming")}
                  className={`px-2 py-0.5 rounded font-medium flex items-center gap-1 ${directionFilter === "incoming" ? "bg-emerald-600 text-white" : "text-slate-400"}`}
                >
                  <ArrowDownLeft className="w-2.5 h-2.5" /> In
                </button>
                <button
                  onClick={() => setDirectionFilter("outgoing")}
                  className={`px-2 py-0.5 rounded font-medium flex items-center gap-1 ${directionFilter === "outgoing" ? "bg-purple-600 text-white" : "text-slate-400"}`}
                >
                  <ArrowUpRight className="w-2.5 h-2.5" /> Out
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setAutoScroll(!autoScroll)}
                className={`px-2 py-1 rounded text-[11px] font-medium border ${
                  autoScroll ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" : "bg-slate-800 text-slate-400 border-slate-700"
                }`}
              >
                Auto-scroll {autoScroll ? "ON" : "OFF"}
              </button>
              <button
                onClick={() => setPackets([])}
                className="px-2 py-1 rounded text-[11px] text-slate-400 hover:text-rose-400 flex items-center gap-1"
                title="Clear packets"
              >
                <Trash2 className="w-3 h-3" /> Clear
              </button>
            </div>
          </div>

          {/* Packets Stream Scroll View */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2 font-mono text-xs">
            {filteredPackets.length === 0 ? (
              <div className="text-center py-20 text-slate-500 space-y-2">
                <Activity className="w-8 h-8 mx-auto opacity-30 text-purple-400" />
                <p>No packets in stream buffer yet.</p>
                <p className="text-[11px]">Click "Connect Stream" or send a packet to observe live events.</p>
              </div>
            ) : (
              filteredPackets.map(pkt => {
                const isIncoming = pkt.direction === "incoming";
                const isSystem = pkt.direction === "system";
                const isPing = pkt.direction === "ping";

                return (
                  <div
                    key={pkt.id}
                    className={`p-2.5 rounded-lg border transition-all ${
                      isSystem
                        ? "bg-slate-800/40 border-slate-700 text-slate-400"
                        : isIncoming
                        ? "bg-emerald-950/20 border-emerald-500/30 text-emerald-200"
                        : isPing
                        ? "bg-amber-950/20 border-amber-500/30 text-amber-200"
                        : "bg-purple-950/20 border-purple-500/30 text-purple-200"
                    }`}
                  >
                    {/* Packet Top Header */}
                    <div className="flex items-center justify-between text-[11px] mb-1 opacity-80">
                      <div className="flex items-center gap-2">
                        {isIncoming && (
                          <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold flex items-center gap-0.5">
                            <ArrowDownLeft className="w-3 h-3" /> INBOUND
                          </span>
                        )}
                        {!isIncoming && !isSystem && (
                          <span className="px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-400 font-bold flex items-center gap-0.5">
                            <ArrowUpRight className="w-3 h-3" /> OUTBOUND
                          </span>
                        )}
                        {isSystem && (
                          <span className="px-1.5 py-0.5 rounded bg-slate-700 text-slate-300 font-bold">
                            SYSTEM
                          </span>
                        )}
                        <span>{new Date(pkt.timestamp).toLocaleTimeString()}.{String(pkt.timestamp % 1000).padStart(3, "0")}</span>
                        <span className="text-[10px] text-slate-400">{pkt.sizeBytes} bytes</span>
                        {pkt.latencyMs !== undefined && (
                          <span className="px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 text-[10px] flex items-center gap-0.5 font-sans font-semibold">
                            <Clock className="w-2.5 h-2.5" /> {pkt.latencyMs}ms ping
                          </span>
                        )}
                      </div>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(pkt.payload);
                          showToast("Copied packet payload!");
                        }}
                        className="text-slate-400 hover:text-white"
                        title="Copy payload"
                      >
                        <Copy className="w-3 h-3" />
                      </button>
                    </div>

                    {/* Packet Payload Body */}
                    <pre className="overflow-x-auto whitespace-pre-wrap text-[11px] leading-relaxed">
                      {pkt.payload}
                    </pre>
                  </div>
                );
              })
            )}
            <div ref={packetsEndRef} />
          </div>
        </div>

        {/* Right Pane: Message Composer & Controls */}
        <div className={`w-full md:w-96 flex flex-col h-full overflow-y-auto p-4 space-y-4 shrink-0 ${theme === "dark" ? "bg-slate-900/30" : "bg-slate-50"}`}>
          {/* Live Ping Stats Card */}
          <div className={`p-3 rounded-xl border ${theme === "dark" ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"}`}>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-cyan-400" />
              Latency & Stream Health
            </h3>
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="p-2 rounded bg-slate-800/60">
                <span className="text-[10px] text-slate-400 block">Avg Latency</span>
                <span className="font-mono font-bold text-emerald-400">{pingStats.avg}ms</span>
              </div>
              <div className="p-2 rounded bg-slate-800/60">
                <span className="text-[10px] text-slate-400 block">Min / Max</span>
                <span className="font-mono font-bold text-cyan-400">{pingStats.min}/{pingStats.max}ms</span>
              </div>
              <div className="p-2 rounded bg-slate-800/60">
                <span className="text-[10px] text-slate-400 block">Packets</span>
                <span className="font-mono font-bold text-purple-400">{packets.length}</span>
              </div>
            </div>
          </div>

          {/* Quick Payload Presets */}
          <div className={`p-3 rounded-xl border space-y-2 ${theme === "dark" ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"}`}>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              Quick Presets
            </h3>
            <div className="grid grid-cols-2 gap-1.5 text-xs">
              <button
                onClick={() => setOutgoingPayload(JSON.stringify({ type: "ping", timestamp: Date.now() }, null, 2))}
                className="p-1.5 rounded text-left border border-slate-700 bg-slate-800/60 hover:bg-slate-800 text-slate-300 text-[11px]"
              >
                Heartbeat Ping
              </button>
              <button
                onClick={() => setOutgoingPayload(JSON.stringify({ type: "subscribe", channel: "market_depth", symbol: "BTC-USD" }, null, 2))}
                className="p-1.5 rounded text-left border border-slate-700 bg-slate-800/60 hover:bg-slate-800 text-slate-300 text-[11px]"
              >
                Subscribe Channel
              </button>
              <button
                onClick={() => setOutgoingPayload(JSON.stringify({ type: "chat", author: "RemixDev", message: "Live connection verified!" }, null, 2))}
                className="p-1.5 rounded text-left border border-slate-700 bg-slate-800/60 hover:bg-slate-800 text-slate-300 text-[11px]"
              >
                Chat Message
              </button>
              <button
                onClick={() => setOutgoingPayload(JSON.stringify({ action: "authenticate", token: "tok_secure_sandbox_auth" }, null, 2))}
                className="p-1.5 rounded text-left border border-slate-700 bg-slate-800/60 hover:bg-slate-800 text-slate-300 text-[11px]"
              >
                Auth Handshake
              </button>
            </div>
          </div>

          {/* Message Dispatcher Editor */}
          <div className={`p-3 rounded-xl border space-y-2 flex-1 flex flex-col ${theme === "dark" ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"}`}>
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Send className="w-3.5 h-3.5 text-purple-400" />
                Outgoing Frame Composer
              </h3>
              <span className="text-[10px] text-slate-500 font-mono">JSON / Plaintext</span>
            </div>
            <textarea
              value={outgoingPayload}
              onChange={e => setOutgoingPayload(e.target.value)}
              rows={7}
              placeholder="{\n  // Packet message payload\n}"
              className={`w-full p-2.5 font-mono text-xs rounded-lg border outline-none ${
                theme === "dark" ? "bg-slate-950 border-slate-800 text-purple-300 focus:border-purple-500" : "bg-slate-50 border-slate-300 text-slate-900 focus:border-purple-500"
              }`}
            />
            <button
              onClick={handleSendPacket}
              disabled={connectionStatus !== "connected"}
              className="w-full py-2 rounded-lg font-semibold text-xs bg-purple-600 hover:bg-purple-500 text-white flex items-center justify-center gap-2 shadow-md shadow-purple-600/30 transition-all disabled:opacity-40"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send Packet Frame</span>
            </button>
          </div>

          {/* Automated Repeat Dispatcher */}
          <div className={`p-3 rounded-xl border space-y-2 ${theme === "dark" ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"}`}>
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                Auto-Heartbeat Pinger
              </span>
              {autoIntervalMs > 0 && (
                <span className="text-amber-400 font-bold animate-pulse text-[11px]">
                  ACTIVE ({autoIntervalMs}ms)
                </span>
              )}
            </div>
            <div className="grid grid-cols-3 gap-1.5 text-xs">
              <button
                onClick={() => toggleAutoInterval(1000)}
                className={`py-1 rounded font-medium border text-[11px] ${
                  autoIntervalMs === 1000 ? "bg-amber-500 text-black border-amber-400 font-bold" : "bg-slate-800 border-slate-700 text-slate-300"
                }`}
              >
                Every 1s
              </button>
              <button
                onClick={() => toggleAutoInterval(3000)}
                className={`py-1 rounded font-medium border text-[11px] ${
                  autoIntervalMs === 3000 ? "bg-amber-500 text-black border-amber-400 font-bold" : "bg-slate-800 border-slate-700 text-slate-300"
                }`}
              >
                Every 3s
              </button>
              <button
                onClick={() => toggleAutoInterval(0)}
                className={`py-1 rounded font-medium border text-[11px] ${
                  autoIntervalMs === 0 ? "bg-slate-700 text-slate-400 border-slate-600" : "bg-rose-600 text-white border-rose-500"
                }`}
              >
                Stop
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RealtimeStreamTesterAgent;
