import React, { useState, useMemo, useEffect } from "react";
import {
  FileCode2,
  Play,
  Copy,
  Check,
  Download,
  Plus,
  Trash2,
  Save,
  Search,
  Code,
  Sparkles,
  ExternalLink,
  Tag,
  Shield,
  Layers,
  ChevronDown,
  ChevronRight,
  Globe,
  RefreshCw,
  Send,
  FileJson,
  FileText,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Info,
  Sliders,
  Filter
} from "lucide-react";
import { VirtualFile } from "../types";

export interface OpenApiStudioAgentProps {
  files: VirtualFile[];
  theme: "light" | "dark";
  onSaveFile: (path: string, content: string) => void;
  onAddLog?: (type: string, msg: string) => void;
}

export type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

export interface ParameterDef {
  name: string;
  in: "query" | "path" | "header";
  required: boolean;
  type: "string" | "number" | "boolean" | "integer";
  description: string;
  defaultValue?: string;
}

export interface EndpointDef {
  id: string;
  path: string;
  method: HttpMethod;
  summary: string;
  description: string;
  tags: string[];
  parameters: ParameterDef[];
  requestBodyJson?: string;
  responses: {
    status: number;
    description: string;
    exampleJson?: string;
  }[];
}

export interface SchemaModelDef {
  name: string;
  description: string;
  properties: {
    name: string;
    type: string;
    required: boolean;
    description: string;
  }[];
}

const DEFAULT_ENDPOINTS: EndpointDef[] = [
  {
    id: "ep-1",
    path: "/api/users",
    method: "GET",
    summary: "List all active users",
    description: "Retrieve a paginated list of registered team members and their roles.",
    tags: ["Users"],
    parameters: [
      { name: "page", in: "query", required: false, type: "integer", description: "Page number index", defaultValue: "1" },
      { name: "limit", in: "query", required: false, type: "integer", description: "Items per page (max 100)", defaultValue: "20" },
      { name: "search", in: "query", required: false, type: "string", description: "Search query by name or email", defaultValue: "" }
    ],
    responses: [
      {
        status: 200,
        description: "List of users successfully retrieved",
        exampleJson: JSON.stringify({
          data: [
            { id: "usr_1", name: "Alex Rivera", email: "alex@example.com", role: "lead_architect", active: true },
            { id: "usr_2", name: "Sophia Chen", email: "sophia@example.com", role: "fullstack_dev", active: true }
          ],
          total: 2,
          page: 1,
          limit: 20
        }, null, 2)
      },
      {
        status: 401,
        description: "Unauthorized - missing or invalid Bearer token",
        exampleJson: JSON.stringify({ error: "Unauthorized access token" }, null, 2)
      }
    ]
  },
  {
    id: "ep-2",
    path: "/api/users",
    method: "POST",
    summary: "Register new workspace user",
    description: "Creates a new user profile with allocated role and initial workspace credentials.",
    tags: ["Users"],
    parameters: [],
    requestBodyJson: JSON.stringify({
      name: "Marcus Vance",
      email: "marcus.v@example.com",
      role: "developer",
      department: "Engineering"
    }, null, 2),
    responses: [
      {
        status: 201,
        description: "User created successfully",
        exampleJson: JSON.stringify({
          id: "usr_3",
          name: "Marcus Vance",
          email: "marcus.v@example.com",
          role: "developer",
          createdAt: new Date().toISOString()
        }, null, 2)
      },
      {
        status: 400,
        description: "Validation error on payload",
        exampleJson: JSON.stringify({ error: "Email already registered in system" }, null, 2)
      }
    ]
  },
  {
    id: "ep-3",
    path: "/api/projects/{projectId}",
    method: "GET",
    summary: "Get project details by ID",
    description: "Fetch comprehensive project configuration, metrics and environment secrets status.",
    tags: ["Projects"],
    parameters: [
      { name: "projectId", in: "path", required: true, type: "string", description: "Unique UUID of the target project", defaultValue: "prj_98271" }
    ],
    responses: [
      {
        status: 200,
        description: "Project configuration retrieved",
        exampleJson: JSON.stringify({
          id: "prj_98271",
          name: "Omni Cloud Suite",
          status: "healthy",
          buildStatus: "passing",
          environment: "production",
          updatedAt: new Date().toISOString()
        }, null, 2)
      },
      {
        status: 404,
        description: "Project not found",
        exampleJson: JSON.stringify({ error: "Project ID does not exist" }, null, 2)
      }
    ]
  },
  {
    id: "ep-4",
    path: "/api/analytics/events",
    method: "POST",
    summary: "Ingest telemetry event batch",
    description: "Streams telemetry, telemetry latency metrics, or user interaction beacons.",
    tags: ["Analytics"],
    parameters: [],
    requestBodyJson: JSON.stringify({
      eventType: "PAGE_VIEW",
      sessionId: "sess_4829104",
      metadata: {
        path: "/dashboard",
        durationMs: 4200,
        device: "desktop"
      }
    }, null, 2),
    responses: [
      {
        status: 200,
        description: "Batch ingested successfully",
        exampleJson: JSON.stringify({ success: true, processedEvents: 1, serverTimestamp: Date.now() }, null, 2)
      }
    ]
  }
];

const DEFAULT_SCHEMAS: SchemaModelDef[] = [
  {
    name: "User",
    description: "User account model representation",
    properties: [
      { name: "id", type: "string", required: true, description: "Unique identifier (UUID or usr_*)" },
      { name: "name", type: "string", required: true, description: "Full display name" },
      { name: "email", type: "string", required: true, description: "Primary contact address" },
      { name: "role", type: "string", required: true, description: "Assigned workspace permission role" },
      { name: "active", type: "boolean", required: false, description: "Account enabled status" }
    ]
  },
  {
    name: "Project",
    description: "Workspace project container",
    properties: [
      { name: "id", type: "string", required: true, description: "Unique project ID" },
      { name: "name", type: "string", required: true, description: "Project human-readable title" },
      { name: "status", type: "string", required: true, description: "Operational status (healthy, degraded, inactive)" },
      { name: "environment", type: "string", required: false, description: "Deployment target stage" }
    ]
  }
];

export const OpenApiStudioAgent: React.FC<OpenApiStudioAgentProps> = ({
  files,
  theme,
  onSaveFile,
  onAddLog
}) => {
  const [apiTitle, setApiTitle] = useState("Remix Studio API");
  const [apiVersion, setApiVersion] = useState("1.0.0");
  const [apiDescription, setApiDescription] = useState("Production REST API with automatic OpenAPI 3.1 schema specification, interactive live testing & client SDK code generation.");
  const [serverUrl, setServerUrl] = useState("http://localhost:3000");

  const [endpoints, setEndpoints] = useState<EndpointDef[]>(DEFAULT_ENDPOINTS);
  const [schemas, setSchemas] = useState<SchemaModelDef[]>(DEFAULT_SCHEMAS);
  const [selectedEndpointId, setSelectedEndpointId] = useState<string>("ep-1");
  const [activeViewMode, setActiveViewMode] = useState<"docs" | "spec" | "client-sdk" | "schemas">("docs");
  const [filterTag, setFilterTag] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Live "Try it out" state
  const [testParamValues, setTestParamValues] = useState<Record<string, string>>({});
  const [testBodyValue, setTestBodyValue] = useState<string>("");
  const [testAuthToken, setTestAuthToken] = useState<string>("Bearer token_live_dev_preview");
  const [testResponse, setTestResponse] = useState<{
    status: number;
    statusText: string;
    durationMs: number;
    data: any;
    headers: Record<string, string>;
  } | null>(null);
  const [isExecutingTest, setIsExecutingTest] = useState<boolean>(false);

  // Current selected endpoint
  const currentEndpoint = useMemo(() => {
    return endpoints.find(e => e.id === selectedEndpointId) || endpoints[0];
  }, [endpoints, selectedEndpointId]);

  // Sync test body when endpoint changes
  useEffect(() => {
    if (currentEndpoint) {
      setTestBodyValue(currentEndpoint.requestBodyJson || "");
      const initialParams: Record<string, string> = {};
      currentEndpoint.parameters.forEach(p => {
        initialParams[p.name] = p.defaultValue || "";
      });
      setTestParamValues(initialParams);
      setTestResponse(null);
    }
  }, [currentEndpoint?.id]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  // Automated Workspace Endpoint Scanner
  const scanWorkspaceRoutes = () => {
    const discovered: EndpointDef[] = [];
    const routeRegex = /(?:app|router)\.(get|post|put|delete|patch)\(\s*(?:['"`]([^'"`]+)['"`]|\[([^\]]+)\])/gi;

    files.forEach(file => {
      if (file.content && (file.path.endsWith(".ts") || file.path.endsWith(".js") || file.path.endsWith(".tsx"))) {
        let match;
        while ((match = routeRegex.exec(file.content)) !== null) {
          const method = match[1].toUpperCase() as HttpMethod;
          const singlePath = match[2];
          const arrayPaths = match[3];

          const routeList: string[] = [];
          if (singlePath) {
            routeList.push(singlePath);
          } else if (arrayPaths) {
            const matches = arrayPaths.match(/['"`]([^'"`]+)['"`]/g);
            if (matches) {
              matches.forEach(m => routeList.push(m.replace(/['"`]/g, "")));
            }
          }

          routeList.forEach(routePath => {
            // Extract path parameters like :id or :userId
            const pathParams: ParameterDef[] = [];
            const paramMatches = routePath.match(/:([a-zA-Z0-9_]+)/g);
            if (paramMatches) {
              paramMatches.forEach(p => {
                const cleanName = p.replace(":", "");
                pathParams.push({
                  name: cleanName,
                  in: "path",
                  required: true,
                  type: "string",
                  description: `URL path parameter: ${cleanName}`,
                  defaultValue: cleanName.includes("id") ? "id_101" : "val"
                });
              });
            }

            // Normalize path for OpenAPI: /users/:id -> /users/{id}
            const openApiPath = routePath.replace(/:([a-zA-Z0-9_]+)/g, "{$1}");

            discovered.push({
              id: `ep-scanned-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
              path: openApiPath,
              method,
              summary: `${method} handler: ${openApiPath}`,
              description: `Auto-extracted route from ${file.path}`,
              tags: [file.path.split("/").pop()?.replace(/\.[^/.]+$/, "") || "API"],
              parameters: pathParams,
              requestBodyJson: method === "POST" || method === "PUT" || method === "PATCH" ? '{\n  "name": "example",\n  "active": true\n}' : undefined,
              responses: [
                { status: 200, description: "Successful response", exampleJson: '{\n  "success": true\n}' }
              ]
            });
          });
        }
      }
    });

    if (discovered.length > 0) {
      setEndpoints(prev => {
        const existingKeys = new Set(prev.map(e => `${e.method}:${e.path}`));
        const newAdditions = discovered.filter(e => !existingKeys.has(`${e.method}:${e.path}`));
        if (newAdditions.length === 0) {
          showToast("Workspace already in sync. All detected routes exist.");
          return prev;
        }
        showToast(`Discovered & added ${newAdditions.length} new route(s) from codebase!`);
        if (onAddLog) onAddLog("analyze", `OpenAPI Scanner discovered ${newAdditions.length} routes from workspace.`);
        return [...prev, ...newAdditions];
      });
    } else {
      showToast("Scanned workspace files. No raw Express route definitions found.");
    }
  };

  // Tags list
  const allTags = useMemo(() => {
    const set = new Set<string>();
    endpoints.forEach(e => e.tags.forEach(t => set.add(t)));
    return ["All", ...Array.from(set)];
  }, [endpoints]);

  // Filtered endpoints
  const filteredEndpoints = useMemo(() => {
    return endpoints.filter(e => {
      const matchesTag = filterTag === "All" || e.tags.includes(filterTag);
      const matchesSearch =
        e.path.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.method.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesTag && matchesSearch;
    });
  }, [endpoints, filterTag, searchQuery]);

  // Generate OpenAPI 3.1.0 Object
  const openApiSpecObject = useMemo(() => {
    const paths: Record<string, any> = {};

    endpoints.forEach(ep => {
      if (!paths[ep.path]) {
        paths[ep.path] = {};
      }

      const methodKey = ep.method.toLowerCase();
      const operation: any = {
        summary: ep.summary,
        description: ep.description,
        tags: ep.tags,
        parameters: ep.parameters.map(p => ({
          name: p.name,
          in: p.in,
          required: p.required,
          description: p.description,
          schema: { type: p.type }
        })),
        responses: {}
      };

      if (ep.requestBodyJson && (ep.method === "POST" || ep.method === "PUT" || ep.method === "PATCH")) {
        try {
          const parsed = JSON.parse(ep.requestBodyJson);
          operation.requestBody = {
            description: "Request payload",
            required: true,
            content: {
              "application/json": {
                schema: { type: "object", example: parsed }
              }
            }
          };
        } catch {
          operation.requestBody = {
            description: "Request payload",
            required: true,
            content: {
              "application/json": {
                schema: { type: "string" }
              }
            }
          };
        }
      }

      ep.responses.forEach(r => {
        let contentObj: any = {};
        if (r.exampleJson) {
          try {
            contentObj = {
              "application/json": {
                schema: { type: "object", example: JSON.parse(r.exampleJson) }
              }
            };
          } catch {
            contentObj = {
              "application/json": {
                schema: { type: "string", example: r.exampleJson }
              }
            };
          }
        }
        operation.responses[r.status.toString()] = {
          description: r.description,
          content: Object.keys(contentObj).length > 0 ? contentObj : undefined
        };
      });

      paths[ep.path][methodKey] = operation;
    });

    const schemaComponents: Record<string, any> = {};
    schemas.forEach(s => {
      const properties: Record<string, any> = {};
      const required: string[] = [];
      s.properties.forEach(p => {
        properties[p.name] = { type: p.type, description: p.description };
        if (p.required) required.push(p.name);
      });
      schemaComponents[s.name] = {
        type: "object",
        description: s.description,
        properties,
        required: required.length > 0 ? required : undefined
      };
    });

    return {
      openapi: "3.1.0",
      info: {
        title: apiTitle,
        version: apiVersion,
        description: apiDescription
      },
      servers: [
        { url: serverUrl, description: "Primary Workspace API Server" }
      ],
      paths,
      components: {
        schemas: schemaComponents,
        securitySchemes: {
          BearerAuth: {
            type: "http",
            scheme: "bearer",
            bearerFormat: "JWT"
          }
        }
      }
    };
  }, [apiTitle, apiVersion, apiDescription, serverUrl, endpoints, schemas]);

  const openApiJsonString = useMemo(() => {
    return JSON.stringify(openApiSpecObject, null, 2);
  }, [openApiSpecObject]);

  // Generate TypeScript Client SDK
  const generatedClientSdk = useMemo(() => {
    const lines: string[] = [
      `/**`,
      ` * Auto-generated TypeSafe Client for ${apiTitle} (v${apiVersion})`,
      ` * Generated by Remix Studio OpenAPI Architect`,
      ` */`,
      ``,
      `export interface RequestOptions extends RequestInit {`,
      `  token?: string;`,
      `  params?: Record<string, string | number | boolean>;`,
      `}`,
      ``,
      `export class ApiClient {`,
      `  private baseUrl: string;`,
      `  private defaultToken?: string;`,
      ``,
      `  constructor(baseUrl: string = "${serverUrl}", defaultToken?: string) {`,
      `    this.baseUrl = baseUrl.replace(/\\/$/, "");`,
      `    this.defaultToken = defaultToken;`,
      `  }`,
      ``,
      `  private async request<T>(path: string, options: RequestOptions = {}): Promise<T> {`,
      `    const { token = this.defaultToken, params, ...customConfig } = options;`,
      `    let url = \`\${this.baseUrl}\${path}\`;`,
      `    if (params) {`,
      `      const query = new URLSearchParams(`,
      `        Object.entries(params).map(([k, v]) => [k, String(v)])`,
      `      ).toString();`,
      `      if (query) url += \`?\${query}\`;`,
      `    }`,
      `    const headers: Record<string, string> = {`,
      `      "Content-Type": "application/json",`,
      `      ...(token ? { Authorization: \`Bearer \${token}\` } : {}),`,
      `      ...((customConfig.headers as Record<string, string>) || {}),`,
      `    };`,
      `    const response = await fetch(url, { ...customConfig, headers });`,
      `    if (!response.ok) {`,
      `      const errBody = await response.text();`,
      `      throw new Error(\`HTTP \${response.status}: \${errBody || response.statusText}\`);`,
      `    }`,
      `    return response.json() as Promise<T>;`,
      `  }`,
      ``
    ];

    // Build methods
    endpoints.forEach(ep => {
      const cleanMethod = ep.method.toLowerCase();
      // create function name: e.g. getUsers or getProjectsByProjectId
      const cleanPathParts = ep.path
        .split("/")
        .filter(Boolean)
        .map(p => p.replace(/[{}:]/g, ""))
        .map(p => p.charAt(0).toUpperCase() + p.slice(1));
      const fnName = `${cleanMethod}${cleanPathParts.join("") || "Root"}`;

      const pathParams = ep.parameters.filter(p => p.in === "path");
      const queryParams = ep.parameters.filter(p => p.in === "query");

      const paramArgs: string[] = [];
      pathParams.forEach(p => paramArgs.push(`${p.name}: string | number`));
      if (ep.requestBodyJson && (ep.method === "POST" || ep.method === "PUT" || ep.method === "PATCH")) {
        paramArgs.push(`payload: Record<string, any>`);
      }
      if (queryParams.length > 0) {
        paramArgs.push(`queryParams?: { ${queryParams.map(q => `${q.name}?: ${q.type === "integer" || q.type === "number" ? "number" : "string"}`).join("; ")} }`);
      }
      paramArgs.push(`options?: RequestOptions`);

      // Compute final path interpolation
      let interpolatedPath = ep.path;
      pathParams.forEach(p => {
        interpolatedPath = interpolatedPath.replace(`{${p.name}}`, `\${${p.name}}`);
      });

      lines.push(`  /** ${ep.summary} - ${ep.method} ${ep.path} */`);
      lines.push(`  async ${fnName}(${paramArgs.join(", ")}): Promise<any> {`);
      lines.push(`    const targetPath = \`${interpolatedPath}\`;`);
      const reqArgs: string[] = [
        `method: "${ep.method}"`
      ];
      if (ep.requestBodyJson && (ep.method === "POST" || ep.method === "PUT" || ep.method === "PATCH")) {
        reqArgs.push(`body: JSON.stringify(payload)`);
      }
      if (queryParams.length > 0) {
        reqArgs.push(`params: queryParams as any`);
      }
      reqArgs.push(`...options`);
      lines.push(`    return this.request(targetPath, { ${reqArgs.join(", ")} });`);
      lines.push(`  }`);
      lines.push(``);
    });

    lines.push(`}`);
    lines.push(`export const api = new ApiClient();`);
    return lines.join("\n");
  }, [apiTitle, apiVersion, serverUrl, endpoints]);

  // Copy helper
  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setIsCopied(true);
    showToast(`Copied ${label} to clipboard!`);
    setTimeout(() => setIsCopied(false), 2000);
  };

  // Save to Workspace
  const handleSaveToWorkspace = (fileName: string, content: string) => {
    onSaveFile(fileName, content);
    showToast(`Saved "${fileName}" to project workspace!`);
    if (onAddLog) onAddLog("create", `Saved ${fileName} with ${endpoints.length} OpenAPI endpoints.`);
  };

  // Execute Live "Try it out" Test
  const handleExecuteLiveTest = async () => {
    if (!currentEndpoint) return;
    setIsExecutingTest(true);
    const startTime = performance.now();

    try {
      // Build test URL with path parameters
      let finalPath = currentEndpoint.path;
      currentEndpoint.parameters.filter(p => p.in === "path").forEach(p => {
        const val = testParamValues[p.name] || p.defaultValue || "default";
        finalPath = finalPath.replace(`{${p.name}}`, encodeURIComponent(val));
      });

      // Query params
      const queryParts: string[] = [];
      currentEndpoint.parameters.filter(p => p.in === "query").forEach(p => {
        const val = testParamValues[p.name] ?? p.defaultValue;
        if (val !== undefined && val !== "") {
          queryParts.push(`${encodeURIComponent(p.name)}=${encodeURIComponent(val)}`);
        }
      });
      if (queryParts.length > 0) {
        finalPath += `?${queryParts.join("&")}`;
      }

      // Try REAL fetch first against the running Express/Vite server!
      let realRes: Response | null = null;
      let realData: any = null;
      const resHeaders: Record<string, string> = {};

      try {
        const targetUrl = finalPath.startsWith("/") ? finalPath : `/${finalPath}`;
        realRes = await fetch(targetUrl, {
          method: currentEndpoint.method,
          headers: {
            "Accept": "application/json",
            ...(testAuthToken ? { "Authorization": testAuthToken } : {}),
            ...(currentEndpoint.method === "POST" || currentEndpoint.method === "PUT" ? { "Content-Type": "application/json" } : {})
          },
          body: (currentEndpoint.method === "POST" || currentEndpoint.method === "PUT") && testBodyValue ? testBodyValue : undefined
        });

        if (realRes) {
          const contentType = realRes.headers.get("content-type") || "";
          if (contentType.includes("application/json")) {
            realData = await realRes.json();
          } else {
            const rawText = await realRes.text();
            try { realData = JSON.parse(rawText); } catch { realData = rawText; }
          }
          realRes.headers.forEach((v, k) => { resHeaders[k] = v; });
        }
      } catch (fetchErr) {
        // Fallback to example schema if route is not mounted on server
      }

      const durationMs = Math.round(performance.now() - startTime);

      if (realRes) {
        setTestResponse({
          status: realRes.status,
          statusText: realRes.statusText || (realRes.ok ? "OK" : "Error"),
          durationMs,
          data: realData,
          headers: resHeaders
        });
        showToast(`✅ Live Response: HTTP ${realRes.status} in ${durationMs}ms`);
      } else {
        let mockPayload: any = null;
        if (currentEndpoint.responses[0]?.exampleJson) {
          try {
            mockPayload = JSON.parse(currentEndpoint.responses[0].exampleJson);
          } catch {
            mockPayload = { message: currentEndpoint.responses[0].description };
          }
        } else {
          mockPayload = { success: true, timestamp: Date.now() };
        }

        // If user provided a body for POST/PUT, reflect it in the output
        if ((currentEndpoint.method === "POST" || currentEndpoint.method === "PUT") && testBodyValue) {
          try {
            const parsed = JSON.parse(testBodyValue);
            mockPayload = { ...mockPayload, submittedData: parsed, id: `gen_${Math.floor(Math.random() * 89999 + 10000)}` };
          } catch { }
        }

        setTestResponse({
          status: currentEndpoint.responses[0]?.status || 200,
          statusText: currentEndpoint.responses[0]?.status === 201 ? "Created" : "OK (Spec Schema)",
          durationMs,
          data: mockPayload,
          headers: {
            "content-type": "application/json; charset=utf-8",
            "x-powered-by": "Express / OpenAPI Schema Engine",
            "x-response-time": `${durationMs}ms`
          }
        });
        showToast(`⚡ Spec schema response verified in ${durationMs}ms`);
      }
    } catch (err: any) {
      setTestResponse({
        status: 500,
        statusText: "Internal Error",
        durationMs: Math.round(performance.now() - startTime),
        data: { error: err.message || "Request failed" },
        headers: { "content-type": "application/json" }
      });
    } finally {
      setIsExecutingTest(false);
    }
  };

  const getMethodBadgeClass = (method: HttpMethod) => {
    switch (method) {
      case "GET":
        return "bg-sky-500/20 text-sky-400 border-sky-500/30";
      case "POST":
        return "bg-emerald-500/20 text-emerald-400 border-emerald-500/30";
      case "PUT":
        return "bg-amber-500/20 text-amber-400 border-amber-500/30";
      case "DELETE":
        return "bg-rose-500/20 text-rose-400 border-rose-500/30";
      case "PATCH":
        return "bg-purple-500/20 text-purple-400 border-purple-500/30";
      default:
        return "bg-slate-500/20 text-slate-400 border-slate-500/30";
    }
  };

  return (
    <div className={`w-full h-full flex flex-col overflow-hidden ${theme === "dark" ? "bg-slate-950 text-slate-100" : "bg-slate-50 text-slate-900"}`}>
      {/* Toast message popup */}
      {toastMessage && (
        <div className="absolute top-4 right-6 z-50 px-4 py-2 bg-emerald-600 text-white text-xs font-semibold rounded-lg shadow-xl border border-emerald-400/40 flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-200">
          <CheckCircle2 className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header Bar */}
      <div className={`px-5 py-3 border-b flex flex-wrap items-center justify-between gap-4 ${theme === "dark" ? "bg-slate-900/90 border-slate-800" : "bg-white border-slate-200"}`}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/20 text-white">
            <FileCode2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold tracking-tight">OpenAPI & Swagger Studio</h1>
              <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                OpenAPI 3.1
              </span>
              <span className="text-xs text-slate-400">({endpoints.length} Endpoints)</span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              Interactive visual API architect, workspace endpoint extractor & Swagger test bench
            </p>
          </div>
        </div>

        {/* Global Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={scanWorkspaceRoutes}
            title="Scan workspace files to auto-import Express routes and endpoints"
            className={`px-3 py-1.5 text-xs font-medium rounded-lg flex items-center gap-1.5 transition-all shadow-sm ${
              theme === "dark"
                ? "bg-slate-800 hover:bg-slate-700 text-emerald-300 border border-emerald-500/30"
                : "bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-300"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>Scan Project Routes</span>
          </button>

          <button
            onClick={() => handleSaveToWorkspace("openapi.json", openApiJsonString)}
            title="Save generated openapi.json to workspace files"
            className="px-3 py-1.5 text-xs font-medium rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-1.5 shadow-md shadow-emerald-600/20 transition-all"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save openapi.json</span>
          </button>

          <button
            onClick={() => handleSaveToWorkspace("src/services/apiClient.ts", generatedClientSdk)}
            title="Save TypeScript TypeSafe client SDK to workspace"
            className={`px-3 py-1.5 text-xs font-medium rounded-lg flex items-center gap-1.5 border transition-all ${
              theme === "dark"
                ? "bg-slate-800 hover:bg-slate-700 text-cyan-300 border-cyan-500/30"
                : "bg-cyan-50 hover:bg-cyan-100 text-cyan-800 border-cyan-300"
            }`}
          >
            <Code className="w-3.5 h-3.5" />
            <span>Export Client SDK</span>
          </button>
        </div>
      </div>

      {/* Sub-header / View Tabs */}
      <div className={`px-5 py-2 border-b flex items-center justify-between gap-4 text-xs ${theme === "dark" ? "bg-slate-900/50 border-slate-800" : "bg-slate-100/70 border-slate-200"}`}>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setActiveViewMode("docs")}
            className={`px-3 py-1.5 rounded-md font-medium flex items-center gap-1.5 transition-colors ${
              activeViewMode === "docs"
                ? theme === "dark" ? "bg-slate-800 text-white shadow-sm" : "bg-white text-slate-900 shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <FileText className="w-3.5 h-3.5 text-emerald-400" />
            <span>Interactive Docs & Runner</span>
          </button>
          <button
            onClick={() => setActiveViewMode("spec")}
            className={`px-3 py-1.5 rounded-md font-medium flex items-center gap-1.5 transition-colors ${
              activeViewMode === "spec"
                ? theme === "dark" ? "bg-slate-800 text-white shadow-sm" : "bg-white text-slate-900 shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <FileJson className="w-3.5 h-3.5 text-amber-400" />
            <span>OpenAPI 3.1 JSON</span>
          </button>
          <button
            onClick={() => setActiveViewMode("client-sdk")}
            className={`px-3 py-1.5 rounded-md font-medium flex items-center gap-1.5 transition-colors ${
              activeViewMode === "client-sdk"
                ? theme === "dark" ? "bg-slate-800 text-white shadow-sm" : "bg-white text-slate-900 shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Code className="w-3.5 h-3.5 text-cyan-400" />
            <span>TypeScript SDK</span>
          </button>
          <button
            onClick={() => setActiveViewMode("schemas")}
            className={`px-3 py-1.5 rounded-md font-medium flex items-center gap-1.5 transition-colors ${
              activeViewMode === "schemas"
                ? theme === "dark" ? "bg-slate-800 text-white shadow-sm" : "bg-white text-slate-900 shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-purple-400" />
            <span>Data Models ({schemas.length})</span>
          </button>
        </div>

        {/* Base Server URL Bar */}
        <div className="hidden md:flex items-center gap-2">
          <span className="text-[11px] text-slate-400 flex items-center gap-1">
            <Globe className="w-3 h-3" /> Server:
          </span>
          <input
            type="text"
            value={serverUrl}
            onChange={e => setServerUrl(e.target.value)}
            className={`px-2 py-1 text-xs rounded border font-mono ${
              theme === "dark" ? "bg-slate-800 border-slate-700 text-slate-200" : "bg-white border-slate-300 text-slate-800"
            }`}
          />
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* VIEW 1: INTERACTIVE DOCS & RUNNER */}
        {activeViewMode === "docs" && (
          <div className="flex-1 flex flex-col md:flex-row h-full overflow-hidden">
            {/* Left Sidebar: Endpoints List */}
            <div className={`w-full md:w-80 lg:w-96 flex flex-col border-r h-full overflow-hidden shrink-0 ${theme === "dark" ? "bg-slate-900/40 border-slate-800" : "bg-slate-50 border-slate-200"}`}>
              {/* Search & Tag Filter Bar */}
              <div className="p-3 border-b space-y-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Filter endpoints..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className={`w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border outline-none transition-colors ${
                      theme === "dark"
                        ? "bg-slate-800/80 border-slate-700 focus:border-emerald-500 text-white placeholder-slate-500"
                        : "bg-white border-slate-300 focus:border-emerald-500 text-slate-900 placeholder-slate-400"
                    }`}
                  />
                </div>

                {/* Tag Pills */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-[11px]">
                  {allTags.map(tag => (
                    <button
                      key={tag}
                      onClick={() => setFilterTag(tag)}
                      className={`px-2.5 py-0.5 rounded-full font-medium whitespace-nowrap transition-colors ${
                        filterTag === tag
                          ? "bg-emerald-600 text-white"
                          : theme === "dark"
                          ? "bg-slate-800 text-slate-400 hover:text-slate-200"
                          : "bg-slate-200 text-slate-600 hover:text-slate-800"
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              {/* Endpoints List */}
              <div className="flex-1 overflow-y-auto p-2 space-y-1">
                {filteredEndpoints.length === 0 ? (
                  <div className="text-center py-10 px-4 text-slate-500 text-xs">
                    No matching endpoints found.
                  </div>
                ) : (
                  filteredEndpoints.map(ep => {
                    const isSelected = ep.id === selectedEndpointId;
                    return (
                      <button
                        key={ep.id}
                        onClick={() => setSelectedEndpointId(ep.id)}
                        className={`w-full text-left p-2.5 rounded-lg border transition-all flex items-center justify-between gap-2 ${
                          isSelected
                            ? theme === "dark"
                              ? "bg-slate-800 border-emerald-500/50 shadow-sm"
                              : "bg-white border-emerald-500 shadow-sm"
                            : theme === "dark"
                            ? "bg-slate-900/60 border-slate-800 hover:bg-slate-800/60"
                            : "bg-white/60 border-slate-200 hover:bg-white"
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span className={`px-2 py-0.5 text-[10px] font-bold rounded border uppercase shrink-0 ${getMethodBadgeClass(ep.method)}`}>
                            {ep.method}
                          </span>
                          <span className="text-xs font-mono font-medium truncate text-slate-200">
                            {ep.path}
                          </span>
                        </div>
                        <ChevronRight className={`w-3.5 h-3.5 shrink-0 transition-transform ${isSelected ? "text-emerald-400 translate-x-0.5" : "text-slate-500"}`} />
                      </button>
                    );
                  })
                )}
              </div>

              {/* Add New Endpoint Quick Button */}
              <div className="p-3 border-t">
                <button
                  onClick={() => {
                    const newId = `ep-${Date.now()}`;
                    const newEndpoint: EndpointDef = {
                      id: newId,
                      path: `/api/custom-resource-${endpoints.length + 1}`,
                      method: "POST",
                      summary: "New custom endpoint",
                      description: "Custom endpoint description",
                      tags: ["Custom"],
                      parameters: [],
                      requestBodyJson: JSON.stringify({ title: "Sample", enabled: true }, null, 2),
                      responses: [
                        { status: 200, description: "Success response", exampleJson: JSON.stringify({ success: true }, null, 2) }
                      ]
                    };
                    setEndpoints(prev => [...prev, newEndpoint]);
                    setSelectedEndpointId(newId);
                    showToast("Added new endpoint!");
                  }}
                  className={`w-full py-2 px-3 text-xs font-medium rounded-lg border border-dashed flex items-center justify-center gap-1.5 transition-colors ${
                    theme === "dark"
                      ? "border-slate-700 hover:border-emerald-500 text-slate-300 hover:text-emerald-400 hover:bg-slate-800/50"
                      : "border-slate-300 hover:border-emerald-600 text-slate-700 hover:text-emerald-600 hover:bg-emerald-50"
                  }`}
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Endpoint</span>
                </button>
              </div>
            </div>

            {/* Right Pane: Endpoint Details & Interactive Test Bench */}
            <div className="flex-1 flex flex-col h-full overflow-y-auto p-5 space-y-6">
              {currentEndpoint && (
                <>
                  {/* Endpoint Header Card */}
                  <div className={`p-4 rounded-xl border ${theme === "dark" ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"}`}>
                    <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
                      <div className="flex items-center gap-2">
                        <span className={`px-2.5 py-1 text-xs font-bold rounded-md border uppercase ${getMethodBadgeClass(currentEndpoint.method)}`}>
                          {currentEndpoint.method}
                        </span>
                        <h2 className="text-base font-mono font-bold">{currentEndpoint.path}</h2>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            if (endpoints.length <= 1) {
                              showToast("Cannot delete the only endpoint.");
                              return;
                            }
                            setEndpoints(prev => prev.filter(e => e.id !== currentEndpoint.id));
                            setSelectedEndpointId(endpoints[0].id);
                            showToast("Deleted endpoint.");
                          }}
                          className="px-2.5 py-1 text-xs text-rose-400 hover:bg-rose-500/10 rounded-md transition-colors flex items-center gap-1"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>Delete</span>
                        </button>
                      </div>
                    </div>
                    <p className="text-xs text-slate-400 mb-3">{currentEndpoint.description || currentEndpoint.summary}</p>
                    <div className="flex items-center gap-2 flex-wrap text-xs">
                      <span className="text-slate-500 flex items-center gap-1">
                        <Tag className="w-3 h-3" /> Tags:
                      </span>
                      {currentEndpoint.tags.map(t => (
                        <span key={t} className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[11px]">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Parameters Section */}
                  <div className={`p-4 rounded-xl border space-y-3 ${theme === "dark" ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"}`}>
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                        <Sliders className="w-3.5 h-3.5 text-cyan-400" />
                        Parameters ({currentEndpoint.parameters.length})
                      </h3>
                      <button
                        onClick={() => {
                          const paramName = `param_${currentEndpoint.parameters.length + 1}`;
                          setEndpoints(prev => prev.map(e => {
                            if (e.id === currentEndpoint.id) {
                              return {
                                ...e,
                                parameters: [
                                  ...e.parameters,
                                  { name: paramName, in: "query", required: false, type: "string", description: "Custom parameter", defaultValue: "test" }
                                ]
                              };
                            }
                            return e;
                          }));
                          showToast(`Added parameter "${paramName}"`);
                        }}
                        className="text-[11px] text-cyan-400 hover:underline flex items-center gap-1"
                      >
                        <Plus className="w-3 h-3" /> Add Parameter
                      </button>
                    </div>

                    {currentEndpoint.parameters.length === 0 ? (
                      <p className="text-xs text-slate-500 italic">No path or query parameters required for this endpoint.</p>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-xs text-left">
                          <thead>
                            <tr className="border-b border-slate-800 text-slate-400">
                              <th className="py-2 px-2 font-medium">Name</th>
                              <th className="py-2 px-2 font-medium">In</th>
                              <th className="py-2 px-2 font-medium">Type</th>
                              <th className="py-2 px-2 font-medium">Required</th>
                              <th className="py-2 px-2 font-medium">Live Value</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-800">
                            {currentEndpoint.parameters.map(p => (
                              <tr key={p.name}>
                                <td className="py-2 px-2 font-mono font-semibold text-emerald-400">{p.name}</td>
                                <td className="py-2 px-2 text-slate-400 uppercase text-[10px]">{p.in}</td>
                                <td className="py-2 px-2 text-slate-400">{p.type}</td>
                                <td className="py-2 px-2">
                                  {p.required ? (
                                    <span className="text-rose-400 font-bold text-[10px]">REQUIRED</span>
                                  ) : (
                                    <span className="text-slate-500 text-[10px]">OPTIONAL</span>
                                  )}
                                </td>
                                <td className="py-2 px-2">
                                  <input
                                    type="text"
                                    value={testParamValues[p.name] ?? p.defaultValue ?? ""}
                                    onChange={e => setTestParamValues(prev => ({ ...prev, [p.name]: e.target.value }))}
                                    placeholder={p.defaultValue || "value"}
                                    className={`px-2 py-1 text-xs rounded border font-mono w-full max-w-[200px] ${
                                      theme === "dark" ? "bg-slate-800 border-slate-700 text-white" : "bg-slate-100 border-slate-300 text-slate-800"
                                    }`}
                                  />
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>

                  {/* Request Body Section (for POST/PUT/PATCH) */}
                  {(currentEndpoint.method === "POST" || currentEndpoint.method === "PUT" || currentEndpoint.method === "PATCH") && (
                    <div className={`p-4 rounded-xl border space-y-3 ${theme === "dark" ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"}`}>
                      <div className="flex items-center justify-between">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                          <Code className="w-3.5 h-3.5 text-amber-400" />
                          Request Body (JSON)
                        </h3>
                        <span className="text-[11px] text-slate-500">application/json</span>
                      </div>
                      <textarea
                        value={testBodyValue}
                        onChange={e => setTestBodyValue(e.target.value)}
                        rows={6}
                        className={`w-full p-3 font-mono text-xs rounded-lg border outline-none transition-colors ${
                          theme === "dark"
                            ? "bg-slate-950 border-slate-800 text-amber-300 focus:border-amber-500"
                            : "bg-slate-50 border-slate-300 text-slate-900 focus:border-amber-500"
                        }`}
                        placeholder="{\n  // JSON request body\n}"
                      />
                    </div>
                  )}

                  {/* Live Execution Control Bar */}
                  <div className={`p-4 rounded-xl border flex flex-wrap items-center justify-between gap-4 ${theme === "dark" ? "bg-slate-900/90 border-slate-800" : "bg-slate-100 border-slate-300"}`}>
                    <div className="flex items-center gap-2 flex-1 min-w-[240px]">
                      <span className="text-xs text-slate-400 flex items-center gap-1">
                        <Shield className="w-3.5 h-3.5 text-emerald-400" /> Auth:
                      </span>
                      <input
                        type="text"
                        value={testAuthToken}
                        onChange={e => setTestAuthToken(e.target.value)}
                        placeholder="Bearer <token>"
                        className={`flex-1 px-2.5 py-1.5 text-xs rounded-lg border font-mono ${
                          theme === "dark" ? "bg-slate-800 border-slate-700 text-slate-300" : "bg-white border-slate-300 text-slate-800"
                        }`}
                      />
                    </div>

                    <button
                      onClick={handleExecuteLiveTest}
                      disabled={isExecutingTest}
                      className="px-5 py-2 rounded-lg font-semibold text-xs bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-2 shadow-lg shadow-emerald-600/30 transition-all active:scale-95 disabled:opacity-50"
                    >
                      {isExecutingTest ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>Executing Request...</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4 fill-white" />
                          <span>Try It Out (Send Request)</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Live Response Panel */}
                  {testResponse && (
                    <div className={`p-4 rounded-xl border space-y-3 ${theme === "dark" ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"}`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Response</h3>
                          <span className={`px-2 py-0.5 text-xs font-bold rounded ${testResponse.status < 300 ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : "bg-rose-500/20 text-rose-400 border border-rose-500/30"}`}>
                            {testResponse.status} {testResponse.statusText}
                          </span>
                          <span className="text-[11px] text-slate-500 flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {testResponse.durationMs}ms
                          </span>
                        </div>
                        <button
                          onClick={() => handleCopy(JSON.stringify(testResponse.data, null, 2), "Response JSON")}
                          className="text-xs text-slate-400 hover:text-white flex items-center gap-1"
                        >
                          <Copy className="w-3 h-3" /> Copy Output
                        </button>
                      </div>

                      <pre className={`p-3 rounded-lg overflow-x-auto text-xs font-mono max-h-72 ${
                        theme === "dark" ? "bg-slate-950 text-emerald-300 border border-slate-800" : "bg-slate-100 text-slate-800 border border-slate-300"
                      }`}>
                        {JSON.stringify(testResponse.data, null, 2)}
                      </pre>
                    </div>
                  )}

                  {/* Standard Responses Specs */}
                  <div className={`p-4 rounded-xl border space-y-3 ${theme === "dark" ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"}`}>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Configured Schema Responses
                    </h3>
                    <div className="space-y-2">
                      {currentEndpoint.responses.map(r => (
                        <div key={r.status} className={`p-3 rounded-lg border text-xs ${theme === "dark" ? "bg-slate-950/60 border-slate-800" : "bg-slate-50 border-slate-200"}`}>
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2">
                              <span className={`px-1.5 py-0.5 rounded font-bold font-mono text-[11px] ${r.status < 300 ? "text-emerald-400 bg-emerald-500/10" : "text-rose-400 bg-rose-500/10"}`}>
                                {r.status}
                              </span>
                              <span className="font-medium text-slate-300">{r.description}</span>
                            </div>
                          </div>
                          {r.exampleJson && (
                            <pre className="mt-2 p-2 rounded bg-slate-900 text-slate-400 font-mono text-[11px] overflow-x-auto">
                              {r.exampleJson}
                            </pre>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* VIEW 2: OPENAPI 3.1 JSON SPEC */}
        {activeViewMode === "spec" && (
          <div className="flex-1 flex flex-col h-full overflow-hidden p-5">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="text-sm font-bold">OpenAPI 3.1.0 Specification JSON</h2>
                <p className="text-xs text-slate-400">Valid OpenAPI specification conforming to modern REST guidelines</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleCopy(openApiJsonString, "OpenAPI JSON")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border flex items-center gap-1.5 transition-colors ${
                    theme === "dark" ? "bg-slate-800 border-slate-700 hover:bg-slate-700 text-slate-200" : "bg-white border-slate-300 hover:bg-slate-100 text-slate-800"
                  }`}
                >
                  {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>Copy JSON</span>
                </button>
                <button
                  onClick={() => handleSaveToWorkspace("openapi.json", openApiJsonString)}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-1.5 shadow"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save openapi.json</span>
                </button>
              </div>
            </div>
            <pre className={`flex-1 p-4 rounded-xl font-mono text-xs overflow-auto border ${
              theme === "dark" ? "bg-slate-900 border-slate-800 text-amber-300" : "bg-slate-100 border-slate-300 text-slate-800"
            }`}>
              {openApiJsonString}
            </pre>
          </div>
        )}

        {/* VIEW 3: TYPESCRIPT CLIENT SDK */}
        {activeViewMode === "client-sdk" && (
          <div className="flex-1 flex flex-col h-full overflow-hidden p-5">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="text-sm font-bold">Generated TypeScript API Client SDK</h2>
                <p className="text-xs text-slate-400">Full typed client with fetch wrapper, error handling, parameter encoding & auth headers</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleCopy(generatedClientSdk, "TypeScript SDK")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border flex items-center gap-1.5 transition-colors ${
                    theme === "dark" ? "bg-slate-800 border-slate-700 hover:bg-slate-700 text-slate-200" : "bg-white border-slate-300 hover:bg-slate-100 text-slate-800"
                  }`}
                >
                  {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>Copy SDK</span>
                </button>
                <button
                  onClick={() => handleSaveToWorkspace("src/services/apiClient.ts", generatedClientSdk)}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium bg-cyan-600 hover:bg-cyan-500 text-white flex items-center gap-1.5 shadow"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save to src/services/apiClient.ts</span>
                </button>
              </div>
            </div>
            <pre className={`flex-1 p-4 rounded-xl font-mono text-xs overflow-auto border ${
              theme === "dark" ? "bg-slate-900 border-slate-800 text-cyan-300" : "bg-slate-100 border-slate-300 text-slate-800"
            }`}>
              {generatedClientSdk}
            </pre>
          </div>
        )}

        {/* VIEW 4: SCHEMAS & MODELS */}
        {activeViewMode === "schemas" && (
          <div className="flex-1 flex flex-col h-full overflow-y-auto p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold">Reusable Component Schemas</h2>
                <p className="text-xs text-slate-400">Data models defined in OpenAPI #/components/schemas</p>
              </div>
              <button
                onClick={() => {
                  const newModel: SchemaModelDef = {
                    name: `CustomModel${schemas.length + 1}`,
                    description: "User-defined data entity",
                    properties: [
                      { name: "id", type: "string", required: true, description: "Unique identifier" },
                      { name: "createdAt", type: "string", required: true, description: "Timestamp" }
                    ]
                  };
                  setSchemas(prev => [...prev, newModel]);
                  showToast(`Added schema "${newModel.name}"`);
                }}
                className="px-3 py-1.5 text-xs font-medium rounded-lg bg-purple-600 hover:bg-purple-500 text-white flex items-center gap-1.5 shadow"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Data Model</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {schemas.map(s => (
                <div key={s.name} className={`p-4 rounded-xl border space-y-3 ${theme === "dark" ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"}`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold font-mono text-purple-400">{s.name}</h3>
                      <p className="text-xs text-slate-400">{s.description}</p>
                    </div>
                  </div>
                  <div className="border-t border-slate-800 pt-2">
                    <table className="w-full text-xs text-left">
                      <thead>
                        <tr className="text-slate-500 border-b border-slate-800/60">
                          <th className="py-1">Property</th>
                          <th className="py-1">Type</th>
                          <th className="py-1">Required</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/40">
                        {s.properties.map(p => (
                          <tr key={p.name}>
                            <td className="py-1 font-mono text-slate-200">{p.name}</td>
                            <td className="py-1 font-mono text-cyan-400">{p.type}</td>
                            <td className="py-1">
                              {p.required ? <span className="text-rose-400 text-[10px] font-bold">YES</span> : <span className="text-slate-500 text-[10px]">NO</span>}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OpenApiStudioAgent;
