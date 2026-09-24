import React, { useState, useMemo } from "react";
import {
  Play,
  RotateCw,
  Copy,
  Check,
  Code2,
  Database,
  History,
  Send,
  Layers,
  Search,
  Sparkles,
  Zap,
  Info,
  ExternalLink,
  ChevronRight,
  ChevronDown
} from "lucide-react";
import { fetchWithAuth } from "../utils/apiAuth";

interface GraphQLExplorerStudioAgentProps {
  apiKey?: string;
  theme?: "light" | "dark" | string;
  onAddLog?: (type: string, message: string) => void;
}

interface PresetEndpoint {
  id: string;
  name: string;
  url: string;
  defaultQuery: string;
  defaultVariables: string;
  description: string;
}

const PRESET_ENDPOINTS: PresetEndpoint[] = [
  {
    id: "countries",
    name: "Countries GraphQL",
    url: "https://countries.trevorblades.com/graphql",
    description: "Global continents, countries, capitals, languages & currencies",
    defaultQuery: `query GetCountriesWithLanguages {
  countries(filter: { continent: { eq: "EU" } }) {
    code
    name
    capital
    currency
    emoji
    languages {
      name
      code
    }
  }
}`,
    defaultVariables: "{}"
  },
  {
    id: "rickandmorty",
    name: "Rick & Morty API",
    url: "https://rickandmortyapi.com/graphql",
    description: "Multiverse characters, episodes, locations and status",
    defaultQuery: `query GetCharacters($status: String) {
  characters(page: 1, filter: { status: $status }) {
    info {
      count
      pages
    }
    results {
      id
      name
      status
      species
      gender
      origin {
        name
      }
    }
  }
}`,
    defaultVariables: JSON.stringify({ status: "Alive" }, null, 2)
  },
  {
    id: "spacex",
    name: "SpaceX Land API",
    url: "https://spacex-production.up.railway.app/",
    description: "SpaceX rocket missions, launch sites and payloads",
    defaultQuery: `query GetSpaceXLaunches {
  launchesPast(limit: 5) {
    mission_name
    launch_date_local
    launch_site {
      site_name_long
    }
    rocket {
      rocket_name
      rocket_type
    }
  }
}`,
    defaultVariables: "{}"
  },
  {
    id: "github",
    name: "GitHub GraphQL API",
    url: "https://api.github.com/graphql",
    description: "GitHub repositories, PRs, issues and viewer profile (requires token)",
    defaultQuery: `query GetViewerRepositories {
  viewer {
    login
    name
    bio
    repositories(first: 5, orderBy: {field: UPDATED_AT, direction: DESC}) {
      nodes {
        name
        description
        stargazerCount
        forkCount
      }
    }
  }
}`,
    defaultVariables: "{}"
  }
];

const INTROSPECTION_QUERY = `query IntrospectSchema {
  __schema {
    queryType { name }
    mutationType { name }
    types {
      name
      kind
      description
    }
  }
}`;

export const GraphQLExplorerStudioAgent: React.FC<GraphQLExplorerStudioAgentProps> = ({
  apiKey,
  theme = "dark",
  onAddLog
}) => {
  const isDark = theme !== "light";

  const [endpointUrl, setEndpointUrl] = useState(PRESET_ENDPOINTS[0].url);
  const [query, setQuery] = useState(PRESET_ENDPOINTS[0].defaultQuery);
  const [variables, setVariables] = useState(PRESET_ENDPOINTS[0].defaultVariables);
  const [headersJson, setHeadersJson] = useState(`{\n  "Content-Type": "application/json"\n}`);

  const [activeBottomTab, setActiveBottomTab] = useState<"variables" | "headers">("variables");
  const [isLoading, setIsLoading] = useState(false);
  const [responseResult, setResponseResult] = useState<any>(null);
  const [stats, setStats] = useState<{ status: number; timeMs: number; sizeBytes: number } | null>(null);
  const [copiedResponse, setCopiedResponse] = useState(false);
  const [history, setHistory] = useState<Array<{ id: string; url: string; query: string; time: string; ok: boolean }>>([]);

  // Introspection & Schema types
  const [schemaTypes, setSchemaTypes] = useState<any[]>([]);
  const [searchSchema, setSearchSchema] = useState("");
  const [isIntrospecting, setIsIntrospecting] = useState(false);

  // Switch preset endpoint
  const handleSelectPreset = (preset: PresetEndpoint) => {
    setEndpointUrl(preset.url);
    setQuery(preset.defaultQuery);
    setVariables(preset.defaultVariables);
  };

  // Run GraphQL Query
  const handleExecuteQuery = async () => {
    if (!endpointUrl.trim()) return;

    setIsLoading(true);
    setResponseResult(null);
    const startTime = performance.now();

    let parsedVariables = {};
    if (variables.trim()) {
      try {
        parsedVariables = JSON.parse(variables);
      } catch (e: any) {
        setResponseResult({ error: `Syntax Error in Variables JSON: ${e.message}` });
        setIsLoading(false);
        return;
      }
    }

    let parsedHeaders: Record<string, string> = {
      "Content-Type": "application/json",
      "User-Agent": "RemixStudio-GraphQLExplorer/1.0"
    };

    if (headersJson.trim()) {
      try {
        const customH = JSON.parse(headersJson);
        parsedHeaders = { ...parsedHeaders, ...customH };
      } catch (e: any) {
        setResponseResult({ error: `Syntax Error in Headers JSON: ${e.message}` });
        setIsLoading(false);
        return;
      }
    }

    try {
      const payload = {
        query: query.trim(),
        variables: Object.keys(parsedVariables).length > 0 ? parsedVariables : undefined
      };

      const res = await fetchWithAuth("/api/http-client/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: endpointUrl.trim(),
          method: "POST",
          headers: parsedHeaders,
          body: JSON.stringify(payload)
        })
      });

      const data = await res.json();
      const elapsed = Math.round(performance.now() - startTime);

      if (data.error && !data.data) {
        setResponseResult({ error: data.error });
        setStats({ status: res.status, timeMs: elapsed, sizeBytes: 0 });
        setHistory(prev => [{ id: Math.random().toString(), url: endpointUrl, query, time: new Date().toLocaleTimeString(), ok: false }, ...prev.slice(0, 9)]);
      } else {
        const bodyContent = data.data || data;
        setResponseResult(bodyContent);
        const str = JSON.stringify(bodyContent);
        setStats({
          status: data.status || 200,
          timeMs: data.timeMs || elapsed,
          sizeBytes: str.length
        });
        setHistory(prev => [{ id: Math.random().toString(), url: endpointUrl, query, time: new Date().toLocaleTimeString(), ok: true }, ...prev.slice(0, 9)]);
      }

      if (onAddLog) {
        onAddLog("exec", `Executed GraphQL query on ${endpointUrl}`);
      }
    } catch (err: any) {
      const elapsed = Math.round(performance.now() - startTime);
      setResponseResult({ error: err.message || "Failed to execute GraphQL query" });
      setStats({ status: 500, timeMs: elapsed, sizeBytes: 0 });
    } finally {
      setIsLoading(false);
    }
  };

  // Run Introspection Query
  const handleIntrospect = async () => {
    setIsIntrospecting(true);
    setQuery(INTROSPECTION_QUERY);
    setVariables("{}");

    try {
      const res = await fetchWithAuth("/api/http-client/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: endpointUrl.trim(),
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query: INTROSPECTION_QUERY })
        })
      });
      const resData = await res.json();
      const gqlData = resData.data || resData;
      setResponseResult(gqlData);

      if (gqlData && gqlData.data && gqlData.data.__schema && gqlData.data.__schema.types) {
        setSchemaTypes(gqlData.data.__schema.types);
      }
    } catch {
      // ignore
    } finally {
      setIsIntrospecting(false);
    }
  };

  const copyResponse = () => {
    if (!responseResult) return;
    navigator.clipboard.writeText(JSON.stringify(responseResult, null, 2));
    setCopiedResponse(true);
    setTimeout(() => setCopiedResponse(false), 2000);
  };

  const filteredTypes = useMemo(() => {
    if (!searchSchema.trim()) return schemaTypes;
    const q = searchSchema.toLowerCase();
    return schemaTypes.filter(t => t.name && t.name.toLowerCase().includes(q));
  }, [schemaTypes, searchSchema]);

  return (
    <div className={`w-full h-full flex flex-col overflow-hidden ${isDark ? "bg-[#0e0e12] text-white" : "bg-slate-50 text-slate-900"}`}>
      {/* Studio Header */}
      <div className={`px-5 py-3.5 border-b flex items-center justify-between shrink-0 ${isDark ? "border-zinc-800 bg-[#131317]" : "border-slate-200 bg-white"}`}>
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-pink-600 text-white shadow-md">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold tracking-tight">GraphQL Explorer & Playground</h1>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-mono font-bold bg-pink-500/20 text-pink-400 border border-pink-500/30">
                SSRF-Protected
              </span>
            </div>
            <p className={`text-xs ${isDark ? "text-zinc-400" : "text-slate-500"}`}>
              Interactive query runner, variables manager, and schema introspection inspector.
            </p>
          </div>
        </div>

        {/* Quick presets */}
        <div className="flex items-center gap-1.5 overflow-x-auto">
          {PRESET_ENDPOINTS.map((preset) => (
            <button
              key={preset.id}
              onClick={() => handleSelectPreset(preset)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                endpointUrl === preset.url
                  ? "bg-pink-600 border-pink-500 text-white shadow-xs"
                  : isDark
                  ? "border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:text-white hover:bg-zinc-800"
                  : "border-slate-200 bg-white text-slate-700 hover:bg-slate-100"
              }`}
              title={preset.description}
            >
              {preset.name}
            </button>
          ))}
        </div>
      </div>

      {/* Target URL & Controls Bar */}
      <div className={`px-4 py-2.5 border-b flex items-center gap-2 shrink-0 ${isDark ? "border-zinc-800 bg-[#15151a]" : "border-slate-200 bg-slate-100"}`}>
        <span className="text-xs font-bold font-mono px-2 py-1 rounded bg-pink-500/20 text-pink-400 border border-pink-500/30 shrink-0">
          POST
        </span>
        <input
          type="text"
          value={endpointUrl}
          onChange={(e) => setEndpointUrl(e.target.value)}
          placeholder="https://api.example.com/graphql"
          className={`flex-1 min-w-0 text-xs px-3 py-1.5 rounded-lg border font-mono focus:outline-none ${
            isDark ? "bg-zinc-900 border-zinc-700 text-white focus:border-pink-500" : "bg-white border-slate-300 text-slate-900 focus:border-pink-500"
          }`}
        />

        <button
          onClick={handleExecuteQuery}
          disabled={isLoading}
          className="px-4 py-1.5 rounded-lg bg-pink-600 hover:bg-pink-500 disabled:opacity-50 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-pink-600/20 transition-all cursor-pointer shrink-0"
        >
          {isLoading ? <RotateCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5 fill-current" />}
          <span>{isLoading ? "Querying..." : "Execute Query"}</span>
        </button>

        <button
          onClick={handleIntrospect}
          disabled={isIntrospecting}
          className={`px-3 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 ${
            isDark ? "border-zinc-700 bg-zinc-800 text-zinc-300 hover:text-white" : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
          }`}
          title="Run __schema introspection query"
        >
          <Layers className="w-3.5 h-3.5 text-pink-400" />
          <span>Introspect</span>
        </button>
      </div>

      {/* Main Dual-Pane Workspace */}
      <div className="flex-1 flex min-h-0 overflow-hidden">
        {/* Left: Query & Variables Editor */}
        <div className="flex-1 flex flex-col border-r border-zinc-800 min-w-0 min-h-0">
          {/* Query Pane Header */}
          <div className={`px-4 py-2 border-b flex items-center justify-between text-xs font-semibold shrink-0 ${
            isDark ? "border-zinc-800 bg-[#121216] text-zinc-300" : "border-slate-200 bg-white text-slate-700"
          }`}>
            <span className="flex items-center gap-1.5">
              <Code2 className="w-3.5 h-3.5 text-pink-400" />
              <span>GraphQL Query / Mutation</span>
            </span>
            <span className="text-[10px] font-mono text-zinc-500">Operation Body</span>
          </div>

          {/* Query Textarea */}
          <div className="flex-1 min-h-0 p-3 overflow-hidden">
            <textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              spellCheck={false}
              className={`w-full h-full p-3 font-mono text-xs rounded-xl border resize-none focus:outline-none ${
                isDark ? "bg-[#0b0b0e] border-zinc-800 text-zinc-100 focus:border-pink-500" : "bg-white border-slate-200 text-slate-900 focus:border-pink-500"
              }`}
            />
          </div>

          {/* Bottom Tabs: Variables & Headers */}
          <div className="h-44 border-t border-zinc-800 flex flex-col shrink-0">
            <div className={`px-4 pt-1.5 border-b flex items-center gap-2 shrink-0 ${
              isDark ? "border-zinc-800 bg-[#121216]" : "border-slate-200 bg-slate-100"
            }`}>
              <button
                onClick={() => setActiveBottomTab("variables")}
                className={`px-3 py-1.5 rounded-t-lg text-xs font-semibold cursor-pointer ${
                  activeBottomTab === "variables"
                    ? (isDark ? "bg-[#0b0b0e] text-pink-400 border-t-2 border-pink-500" : "bg-white text-pink-600 border-t-2 border-pink-600")
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                Query Variables (JSON)
              </button>
              <button
                onClick={() => setActiveBottomTab("headers")}
                className={`px-3 py-1.5 rounded-t-lg text-xs font-semibold cursor-pointer ${
                  activeBottomTab === "headers"
                    ? (isDark ? "bg-[#0b0b0e] text-pink-400 border-t-2 border-pink-500" : "bg-white text-pink-600 border-t-2 border-pink-600")
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                HTTP Headers (JSON)
              </button>
            </div>

            <div className="flex-1 p-2.5 overflow-hidden">
              {activeBottomTab === "variables" ? (
                <textarea
                  value={variables}
                  onChange={(e) => setVariables(e.target.value)}
                  placeholder={'{\n  "key": "value"\n}'}
                  spellCheck={false}
                  className={`w-full h-full p-2.5 font-mono text-xs rounded-lg border resize-none focus:outline-none ${
                    isDark ? "bg-[#0b0b0e] border-zinc-800 text-zinc-200" : "bg-white border-slate-200 text-slate-800"
                  }`}
                />
              ) : (
                <textarea
                  value={headersJson}
                  onChange={(e) => setHeadersJson(e.target.value)}
                  placeholder={'{\n  "Authorization": "Bearer token"\n}'}
                  spellCheck={false}
                  className={`w-full h-full p-2.5 font-mono text-xs rounded-lg border resize-none focus:outline-none ${
                    isDark ? "bg-[#0b0b0e] border-zinc-800 text-zinc-200" : "bg-white border-slate-200 text-slate-800"
                  }`}
                />
              )}
            </div>
          </div>
        </div>

        {/* Right: Response Visualizer & History */}
        <div className="flex-1 flex flex-col min-w-0 min-h-0">
          {/* Response Pane Header */}
          <div className={`px-4 py-2 border-b flex items-center justify-between text-xs font-semibold shrink-0 ${
            isDark ? "border-zinc-800 bg-[#121216] text-zinc-300" : "border-slate-200 bg-white text-slate-700"
          }`}>
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5 text-pink-400" />
                <span>JSON Response</span>
              </span>

              {stats && (
                <div className="flex items-center gap-2 font-mono text-[11px]">
                  <span className={`px-1.5 py-0.2 rounded font-bold ${stats.status === 200 ? "bg-emerald-500/20 text-emerald-300" : "bg-rose-500/20 text-rose-300"}`}>
                    {stats.status}
                  </span>
                  <span className="text-zinc-400">{stats.timeMs}ms</span>
                  <span className="text-zinc-400">{stats.sizeBytes} B</span>
                </div>
              )}
            </div>

            {responseResult && (
              <button
                onClick={copyResponse}
                className={`flex items-center gap-1 px-2 py-0.5 rounded border text-[11px] font-semibold transition-colors cursor-pointer ${
                  isDark ? "border-zinc-700 bg-zinc-800 hover:text-white" : "border-slate-300 bg-slate-100 hover:bg-slate-200"
                }`}
              >
                {copiedResponse ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedResponse ? "Copied" : "Copy JSON"}</span>
              </button>
            )}
          </div>

          {/* Response Viewer */}
          <div className="flex-1 p-3 overflow-auto font-mono text-xs">
            {isLoading ? (
              <div className="h-full flex flex-col items-center justify-center text-zinc-400 gap-3">
                <RotateCw className="w-8 h-8 animate-spin text-pink-500" />
                <p className="text-xs">Executing query against remote GraphQL engine...</p>
              </div>
            ) : responseResult ? (
              <pre className={`p-4 rounded-xl border leading-relaxed overflow-x-auto whitespace-pre ${
                isDark ? "bg-[#0b0b0e] border-zinc-800 text-zinc-200" : "bg-white border-slate-200 text-slate-900"
              }`}>
                <code>{JSON.stringify(responseResult, null, 2)}</code>
              </pre>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-zinc-500 gap-2 text-center p-6">
                <Sparkles className="w-10 h-10 opacity-30 text-pink-400" />
                <p className="text-xs font-semibold text-zinc-400">No Query Executed Yet</p>
                <p className="text-[11px] max-w-sm text-zinc-500">
                  Select a preset endpoint above or write your own GraphQL query, then click <strong>Execute Query</strong> to view the structured JSON response.
                </p>
              </div>
            )}
          </div>

          {/* Schema Introspection Summary Drawer */}
          {schemaTypes.length > 0 && (
            <div className="h-44 border-t border-zinc-800 flex flex-col shrink-0 bg-[#0e0e12]">
              <div className="px-3 py-1.5 border-b border-zinc-800 flex items-center justify-between text-xs">
                <span className="font-bold text-pink-400 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5" /> Schema Types ({filteredTypes.length})
                </span>
                <input
                  type="text"
                  value={searchSchema}
                  onChange={(e) => setSearchSchema(e.target.value)}
                  placeholder="Filter types..."
                  className="px-2 py-0.5 rounded text-[11px] bg-zinc-900 border border-zinc-700 text-white focus:outline-none"
                />
              </div>
              <div className="flex-1 p-2 overflow-y-auto space-y-1 text-[11px] font-mono">
                {filteredTypes.map((type, idx) => (
                  <div key={idx} className="flex items-center justify-between p-1 rounded hover:bg-zinc-800/60">
                    <span className="font-semibold text-zinc-200">{type.name}</span>
                    <span className="text-[10px] text-zinc-400 px-1 rounded bg-zinc-800">{type.kind}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
export default GraphQLExplorerStudioAgent;
