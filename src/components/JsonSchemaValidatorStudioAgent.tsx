import React, { useState, useMemo, useEffect } from "react";
import {
  FileJson,
  CheckCircle2,
  AlertTriangle,
  Copy,
  Check,
  Save,
  Code,
  Sparkles,
  RefreshCw,
  Sliders,
  Terminal,
  Zap,
  Tag,
  ShieldCheck,
  ShieldAlert,
  Play,
  RotateCcw,
  Layers,
  FileCode,
  FolderOpen
} from "lucide-react";
import { VirtualFile } from "../types";

export interface JsonSchemaValidatorStudioAgentProps {
  files?: VirtualFile[];
  theme: "light" | "dark";
  onSaveFile?: (path: string, content: string) => void;
  onAddLog?: (type: string, msg: string) => void;
}

export interface ValidationError {
  path: string;
  message: string;
  keyword: string;
  expected?: any;
  received?: any;
}

const DEFAULT_JSON_SCHEMA = JSON.stringify(
  {
    $schema: "https://json-schema.org/draft/2020-12/schema",
    title: "UserProfile",
    type: "object",
    required: ["id", "username", "email", "role", "age"],
    properties: {
      id: {
        type: "string",
        format: "uuid",
        description: "Unique account identifier"
      },
      username: {
        type: "string",
        minLength: 3,
        maxLength: 20,
        pattern: "^[a-zA-Z0-9_-]+$"
      },
      email: {
        type: "string",
        format: "email",
        description: "Primary contact email"
      },
      age: {
        type: "integer",
        minimum: 18,
        maximum: 120
      },
      role: {
        type: "string",
        enum: ["admin", "editor", "viewer", "developer"]
      },
      isActive: {
        type: "boolean",
        default: true
      },
      tags: {
        type: "array",
        items: { type: "string" },
        minItems: 1
      }
    }
  },
  null,
  2
);

const DEFAULT_JSON_INSTANCE = JSON.stringify(
  {
    id: "f47ac10b-58cc-4372-a567-0e02b2c3d479",
    username: "dev_alex",
    email: "alex.rivera@example.com",
    age: 28,
    role: "admin",
    isActive: true,
    tags: ["typescript", "fullstack", "react"]
  },
  null,
  2
);

// Lightweight JSON Schema Validator Engine
function validateJsonAgainstSchema(data: any, schema: any, path = "root"): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!schema || typeof schema !== "object") return errors;

  // Type validation
  if (schema.type) {
    const expectedType = schema.type;
    const actualType = Array.isArray(data) ? "array" : data === null ? "null" : typeof data;

    if (expectedType === "integer") {
      if (typeof data !== "number" || !Number.isInteger(data)) {
        errors.push({ path, keyword: "type", message: `Expected integer, received ${actualType}`, expected: "integer", received: actualType });
      }
    } else if (actualType !== expectedType) {
      errors.push({ path, keyword: "type", message: `Expected ${expectedType}, received ${actualType}`, expected: expectedType, received: actualType });
      return errors; // cannot check properties of wrong type
    }
  }

  // Object checks
  if (schema.type === "object" && data && typeof data === "object" && !Array.isArray(data)) {
    // Required fields
    if (Array.isArray(schema.required)) {
      schema.required.forEach((reqKey: string) => {
        if (!(reqKey in data)) {
          errors.push({
            path: `${path}.${reqKey}`,
            keyword: "required",
            message: `Missing required property "${reqKey}"`,
            expected: "defined",
            received: "undefined"
          });
        }
      });
    }

    // Properties validation
    if (schema.properties) {
      Object.keys(schema.properties).forEach(propKey => {
        if (propKey in data) {
          const subErrors = validateJsonAgainstSchema(data[propKey], schema.properties[propKey], `${path}.${propKey}`);
          errors.push(...subErrors);
        }
      });
    }
  }

  // String checks
  if (typeof data === "string") {
    if (schema.minLength !== undefined && data.length < schema.minLength) {
      errors.push({ path, keyword: "minLength", message: `String length ${data.length} is less than minimum ${schema.minLength}`, expected: schema.minLength, received: data.length });
    }
    if (schema.maxLength !== undefined && data.length > schema.maxLength) {
      errors.push({ path, keyword: "maxLength", message: `String length ${data.length} exceeds maximum ${schema.maxLength}`, expected: schema.maxLength, received: data.length });
    }
    if (schema.pattern) {
      const regex = new RegExp(schema.pattern);
      if (!regex.test(data)) {
        errors.push({ path, keyword: "pattern", message: `String does not match pattern ${schema.pattern}`, expected: schema.pattern, received: data });
      }
    }
    if (schema.format === "email") {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(data)) {
        errors.push({ path, keyword: "format", message: `Invalid email address format`, expected: "email", received: data });
      }
    }
    if (schema.format === "uuid") {
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(data)) {
        errors.push({ path, keyword: "format", message: `Invalid UUID string format`, expected: "uuid", received: data });
      }
    }
  }

  // Number checks
  if (typeof data === "number") {
    if (schema.minimum !== undefined && data < schema.minimum) {
      errors.push({ path, keyword: "minimum", message: `Value ${data} is less than minimum ${schema.minimum}`, expected: schema.minimum, received: data });
    }
    if (schema.maximum !== undefined && data > schema.maximum) {
      errors.push({ path, keyword: "maximum", message: `Value ${data} exceeds maximum ${schema.maximum}`, expected: schema.maximum, received: data });
    }
  }

  // Enum checks
  if (Array.isArray(schema.enum)) {
    if (!schema.enum.includes(data)) {
      errors.push({ path, keyword: "enum", message: `Value must be one of [${schema.enum.join(", ")}]`, expected: schema.enum, received: data });
    }
  }

  // Array checks
  if (Array.isArray(data)) {
    if (schema.minItems !== undefined && data.length < schema.minItems) {
      errors.push({ path, keyword: "minItems", message: `Array items count ${data.length} is less than minimum ${schema.minItems}`, expected: schema.minItems, received: data.length });
    }
    if (schema.items) {
      data.forEach((item, idx) => {
        const itemErrors = validateJsonAgainstSchema(item, schema.items, `${path}[${idx}]`);
        errors.push(...itemErrors);
      });
    }
  }

  return errors;
}

export const JsonSchemaValidatorStudioAgent: React.FC<JsonSchemaValidatorStudioAgentProps> = ({
  files = [],
  theme,
  onSaveFile,
  onAddLog
}) => {
  const [schemaText, setSchemaText] = useState<string>(DEFAULT_JSON_SCHEMA);
  const [instanceText, setInstanceText] = useState<string>(DEFAULT_JSON_INSTANCE);
  const [activeTab, setActiveTab] = useState<"validator" | "zod" | "ts" | "generator">("validator");
  const [selectedWorkspaceFile, setSelectedWorkspaceFile] = useState<string>("");

  const [schemaParseError, setSchemaParseError] = useState<string | null>(null);
  const [instanceParseError, setInstanceParseError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState<boolean>(false);

  // Discover JSON files from workspace
  const workspaceJsonFiles = useMemo(() => {
    return files.filter(f => f.path.endsWith(".json"));
  }, [files]);

  const handleSelectWorkspaceFile = (filePath: string) => {
    setSelectedWorkspaceFile(filePath);
    if (!filePath) return;
    const target = files.find(f => f.path === filePath);
    if (target && target.content) {
      try {
        const parsed = JSON.parse(target.content);
        setInstanceText(JSON.stringify(parsed, null, 2));
        showToast(`Loaded ${filePath} into data instance!`);
      } catch (err: any) {
        showToast(`Could not parse ${filePath}: ${err.message}`);
      }
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  // Run validation
  useEffect(() => {
    let parsedSchema: any = null;
    let parsedInstance: any = null;

    try {
      parsedSchema = JSON.parse(schemaText);
      setSchemaParseError(null);
    } catch (err: any) {
      setSchemaParseError(`Schema JSON syntax error: ${err.message}`);
      setValidationErrors([]);
      return;
    }

    try {
      parsedInstance = JSON.parse(instanceText);
      setInstanceParseError(null);
    } catch (err: any) {
      setInstanceParseError(`Data JSON syntax error: ${err.message}`);
      setValidationErrors([]);
      return;
    }

    const errs = validateJsonAgainstSchema(parsedInstance, parsedSchema);
    setValidationErrors(errs);
  }, [schemaText, instanceText]);

  // Infer Schema from Data Instance
  const handleInferSchema = () => {
    try {
      const data = JSON.parse(instanceText);
      if (typeof data !== "object" || data === null || Array.isArray(data)) {
        showToast("Inferer requires a JSON object at root.");
        return;
      }

      const properties: Record<string, any> = {};
      const required: string[] = Object.keys(data);

      Object.entries(data).forEach(([key, val]) => {
        if (typeof val === "string") {
          if (val.includes("@") && val.includes(".")) {
            properties[key] = { type: "string", format: "email" };
          } else if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val)) {
            properties[key] = { type: "string", format: "uuid" };
          } else {
            properties[key] = { type: "string" };
          }
        } else if (typeof val === "number") {
          properties[key] = { type: Number.isInteger(val) ? "integer" : "number" };
        } else if (typeof val === "boolean") {
          properties[key] = { type: "boolean" };
        } else if (Array.isArray(val)) {
          properties[key] = { type: "array", items: { type: typeof (val[0] || "string") } };
        } else {
          properties[key] = { type: "object" };
        }
      });

      const inferred = {
        $schema: "https://json-schema.org/draft/2020-12/schema",
        title: "InferredDataSchema",
        type: "object",
        required,
        properties
      };

      setSchemaText(JSON.stringify(inferred, null, 2));
      showToast("✨ Successfully inferred JSON Schema from data!");
      if (onAddLog) onAddLog("analyze", "Inferred JSON schema from sample instance.");
    } catch (err: any) {
      showToast(`Cannot infer: ${err.message}`);
    }
  };

  // Generate Synthetic Mock Data from Schema
  const handleGenerateMockData = () => {
    try {
      const schema = JSON.parse(schemaText);
      if (!schema.properties) {
        showToast("Schema does not define properties.");
        return;
      }

      const mockObj: Record<string, any> = {};
      Object.entries(schema.properties).forEach(([key, val]: [string, any]) => {
        if (val.enum && Array.isArray(val.enum)) {
          mockObj[key] = val.enum[0];
        } else if (val.type === "string") {
          if (val.format === "email") mockObj[key] = `user_${Math.floor(Math.random() * 900 + 100)}@example.com`;
          else if (val.format === "uuid") mockObj[key] = crypto.randomUUID();
          else mockObj[key] = `${key}_sample`;
        } else if (val.type === "integer" || val.type === "number") {
          mockObj[key] = val.minimum !== undefined ? val.minimum : Math.floor(Math.random() * 50 + 10);
        } else if (val.type === "boolean") {
          mockObj[key] = val.default !== undefined ? val.default : true;
        } else if (val.type === "array") {
          mockObj[key] = ["item_alpha", "item_beta"];
        }
      });

      setInstanceText(JSON.stringify(mockObj, null, 2));
      showToast("🎲 Generated synthetic mock data instance!");
    } catch (err: any) {
      showToast(`Cannot generate mock: ${err.message}`);
    }
  };

  // Generated Zod Code
  const generatedZodCode = useMemo(() => {
    try {
      const schema = JSON.parse(schemaText);
      const lines: string[] = [
        `import { z } from "zod";`,
        ``,
        `export const ${schema.title || "Data"}Schema = z.object({`
      ];

      if (schema.properties) {
        Object.entries(schema.properties).forEach(([key, val]: [string, any]) => {
          let zodType = "z.string()";
          if (val.type === "number") zodType = "z.number()";
          else if (val.type === "integer") zodType = "z.number().int()";
          else if (val.type === "boolean") zodType = "z.boolean()";
          else if (val.type === "array") zodType = "z.array(z.string())";

          if (val.format === "email") zodType += `.email()`;
          if (val.format === "uuid") zodType += `.uuid()`;
          if (val.minimum !== undefined) zodType += `.min(${val.minimum})`;
          if (val.maximum !== undefined) zodType += `.max(${val.maximum})`;
          if (val.minLength !== undefined) zodType += `.min(${val.minLength})`;
          if (val.maxLength !== undefined) zodType += `.max(${val.maxLength})`;

          const isRequired = Array.isArray(schema.required) && schema.required.includes(key);
          if (!isRequired) zodType += `.optional()`;

          lines.push(`  ${key}: ${zodType},`);
        });
      }

      lines.push(`});`, ``, `export type ${schema.title || "Data"} = z.infer<typeof ${schema.title || "Data"}Schema>;`);
      return lines.join("\n");
    } catch {
      return "// Invalid JSON Schema format";
    }
  }, [schemaText]);

  // Generated pure TypeScript Interface
  const generatedTsCode = useMemo(() => {
    try {
      const schema = JSON.parse(schemaText);
      const title = (schema.title || "Data").replace(/[^a-zA-Z0-9]/g, "");
      const lines: string[] = [
        `/**`,
        ` * TypeScript Interface Definitions`,
        ` * Auto-generated from JSON Schema (${schema.title || "Schema"})`,
        ` */`,
        ``,
        `export interface ${title} {`
      ];

      if (schema.properties) {
        Object.entries(schema.properties).forEach(([key, val]: [string, any]) => {
          let tsType = "string";
          if (val.type === "number" || val.type === "integer") tsType = "number";
          else if (val.type === "boolean") tsType = "boolean";
          else if (val.type === "array") {
            const itemType = val.items && val.items.type ? (val.items.type === "number" || val.items.type === "integer" ? "number" : val.items.type === "boolean" ? "boolean" : "string") : "any";
            tsType = `${itemType}[]`;
          } else if (val.enum && Array.isArray(val.enum)) {
            tsType = val.enum.map((e: any) => JSON.stringify(e)).join(" | ");
          } else if (val.type === "object") {
            tsType = "Record<string, any>";
          }

          const isRequired = Array.isArray(schema.required) && schema.required.includes(key);
          const optionalFlag = isRequired ? "" : "?";
          if (val.description) {
            lines.push(`  /** ${val.description} */`);
          }
          lines.push(`  ${key}${optionalFlag}: ${tsType};`);
        });
      }

      lines.push(`}`);
      return lines.join("\n");
    } catch {
      return "// Invalid JSON Schema format";
    }
  }, [schemaText]);

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
        <div className="absolute top-4 right-6 z-50 px-4 py-2 bg-emerald-600 text-white text-xs font-semibold rounded-lg shadow-xl border border-emerald-400/40 flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-200">
          <CheckCircle2 className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Bar */}
      <div className={`px-5 py-3 border-b flex flex-wrap items-center justify-between gap-4 ${theme === "dark" ? "bg-slate-900/90 border-slate-800" : "bg-white border-slate-200"}`}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20 text-white">
            <FileJson className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold tracking-tight">JSON Schema Architect & Validator</h1>
              <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                Draft 2020-12 & Zod
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              Live schema validation engine, automatic schema inference, synthetic mock generator & Zod exporter
            </p>
          </div>
        </div>

        {/* Global Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Workspace JSON Loader */}
          {workspaceJsonFiles.length > 0 && (
            <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs ${
              theme === "dark" ? "bg-slate-800/80 border-slate-700 text-slate-200" : "bg-slate-100 border-slate-300 text-slate-800"
            }`}>
              <FolderOpen className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <select
                value={selectedWorkspaceFile}
                onChange={(e) => handleSelectWorkspaceFile(e.target.value)}
                className="bg-transparent text-xs focus:outline-none cursor-pointer max-w-[150px] truncate"
              >
                <option value="" className={theme === "dark" ? "bg-slate-900 text-slate-400" : "bg-white text-slate-500"}>
                  Workspace JSON...
                </option>
                {workspaceJsonFiles.map(f => (
                  <option key={f.path} value={f.path} className={theme === "dark" ? "bg-slate-900 text-slate-200" : "bg-white text-slate-800"}>
                    {f.path}
                  </option>
                ))}
              </select>
            </div>
          )}

          <button
            onClick={handleInferSchema}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg flex items-center gap-1.5 transition-all shadow-sm ${
              theme === "dark"
                ? "bg-slate-800 hover:bg-slate-700 text-emerald-300 border border-emerald-500/30"
                : "bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-300"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>Infer Schema from Data</span>
          </button>

          <button
            onClick={handleGenerateMockData}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg flex items-center gap-1.5 border transition-all ${
              theme === "dark"
                ? "bg-slate-800 hover:bg-slate-700 text-cyan-300 border-cyan-500/30"
                : "bg-cyan-50 hover:bg-cyan-100 text-cyan-800 border-cyan-300"
            }`}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Generate Mock</span>
          </button>

          {onSaveFile && (
            <>
              <button
                onClick={() => {
                  onSaveFile("src/schemas/schema.json", schemaText);
                  showToast("Saved src/schemas/schema.json!");
                  if (onAddLog) onAddLog("create", "Saved src/schemas/schema.json.");
                }}
                className={`px-2.5 py-1.5 text-xs font-medium rounded-lg border flex items-center gap-1.5 transition-all ${
                  theme === "dark" ? "border-slate-700 hover:bg-slate-800 text-slate-200" : "border-slate-300 hover:bg-slate-100 text-slate-700"
                }`}
                title="Save schema.json to workspace"
              >
                <Save className="w-3.5 h-3.5 text-amber-400" />
                <span>Save schema.json</span>
              </button>
              <button
                onClick={() => {
                  const saveTarget = selectedWorkspaceFile || "public/data.json";
                  onSaveFile(saveTarget, instanceText);
                  showToast(`Saved ${saveTarget}!`);
                  if (onAddLog) onAddLog("create", `Saved JSON data to ${saveTarget}.`);
                }}
                className="px-2.5 py-1.5 text-xs font-medium rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-1.5 shadow-md shadow-emerald-600/20 transition-all"
                title="Save validated JSON data"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save JSON Data</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Sub-header Navigation Bar */}
      <div className={`px-5 py-2 border-b flex items-center justify-between gap-4 text-xs ${theme === "dark" ? "bg-slate-900/50 border-slate-800" : "bg-slate-100/70 border-slate-200"}`}>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setActiveTab("validator")}
            className={`px-3 py-1.5 rounded-md font-medium flex items-center gap-1.5 transition-colors ${
              activeTab === "validator"
                ? theme === "dark" ? "bg-slate-800 text-white shadow-sm" : "bg-white text-slate-900 shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Live Dual-Pane Validator</span>
          </button>
          <button
            onClick={() => setActiveTab("zod")}
            className={`px-3 py-1.5 rounded-md font-medium flex items-center gap-1.5 transition-colors ${
              activeTab === "zod"
                ? theme === "dark" ? "bg-slate-800 text-white shadow-sm" : "bg-white text-slate-900 shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Code className="w-3.5 h-3.5 text-cyan-400" />
            <span>Zod TypeScript Schemas</span>
          </button>
          <button
            onClick={() => setActiveTab("ts")}
            className={`px-3 py-1.5 rounded-md font-medium flex items-center gap-1.5 transition-colors ${
              activeTab === "ts"
                ? theme === "dark" ? "bg-slate-800 text-white shadow-sm" : "bg-white text-slate-900 shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <FileCode className="w-3.5 h-3.5 text-amber-400" />
            <span>TypeScript Interfaces</span>
          </button>
        </div>

        {/* Validation Status Indicator */}
        <div className="flex items-center gap-2">
          {schemaParseError || instanceParseError ? (
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5" /> Syntax Error
            </span>
          ) : validationErrors.length === 0 ? (
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
              <Check className="w-3.5 h-3.5" /> 100% Schema Valid
            </span>
          ) : (
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5" /> {validationErrors.length} Violations
            </span>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* VIEW 1: LIVE DUAL-PANE VALIDATOR */}
        {activeTab === "validator" && (
          <div className="flex-1 flex flex-col md:flex-row h-full overflow-hidden">
            {/* Left: JSON Schema Editor */}
            <div className={`w-full md:w-1/2 flex flex-col border-r h-full p-4 space-y-3 ${theme === "dark" ? "border-slate-800" : "border-slate-200"}`}>
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  JSON Schema Specification
                </h3>
                <span className="text-[10px] text-slate-500 font-mono">Draft 2020-12</span>
              </div>
              <textarea
                value={schemaText}
                onChange={e => setSchemaText(e.target.value)}
                rows={18}
                className={`w-full flex-1 p-3 font-mono text-xs rounded-xl border outline-none ${
                  theme === "dark" ? "bg-slate-900 border-slate-800 text-emerald-300" : "bg-slate-50 border-slate-300 text-emerald-800"
                }`}
              />
              {schemaParseError && (
                <div className="p-2 rounded bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs">
                  {schemaParseError}
                </div>
              )}
            </div>

            {/* Right: Data Instance & Validation Feedback */}
            <div className="w-full md:w-1/2 flex flex-col h-full p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Data Instance to Validate
                </h3>
                <span className="text-[10px] text-slate-500 font-mono">JSON</span>
              </div>
              <textarea
                value={instanceText}
                onChange={e => setInstanceText(e.target.value)}
                rows={12}
                className={`w-full flex-1 p-3 font-mono text-xs rounded-xl border outline-none ${
                  theme === "dark" ? "bg-slate-900 border-slate-800 text-cyan-300" : "bg-slate-50 border-slate-300 text-cyan-800"
                }`}
              />
              {instanceParseError && (
                <div className="p-2 rounded bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs">
                  {instanceParseError}
                </div>
              )}

              {/* Validation Output Banner */}
              <div className={`p-3 rounded-xl border space-y-1.5 max-h-48 overflow-y-auto ${theme === "dark" ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"}`}>
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-400 uppercase tracking-wider">Validation Errors</span>
                  <span className="font-mono text-[11px] text-slate-500">{validationErrors.length} found</span>
                </div>
                {validationErrors.length === 0 ? (
                  <div className="text-xs text-emerald-400 font-semibold flex items-center gap-1.5 py-1">
                    <CheckCircle2 className="w-4 h-4" /> All constraint validations passed!
                  </div>
                ) : (
                  <div className="space-y-1">
                    {validationErrors.map((err, idx) => (
                      <div key={idx} className="p-2 rounded bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300 font-mono">
                        <span className="font-bold text-rose-400">[{err.path}]</span> {err.message}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* VIEW 2: ZOD CODE */}
        {activeTab === "zod" && (
          <div className="flex-1 flex flex-col h-full overflow-hidden p-5">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="text-sm font-bold">Generated Zod TypeScript Schema (src/schemas/validation.ts)</h2>
                <p className="text-xs text-slate-400">Type-safe schema parser with inferred TypeScript types</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleCopy(generatedZodCode, "Zod Schemas")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border flex items-center gap-1.5 ${
                    theme === "dark" ? "bg-slate-800 border-slate-700 text-slate-200" : "bg-white border-slate-300 text-slate-800"
                  }`}
                >
                  <Copy className="w-3.5 h-3.5" /> Copy Code
                </button>
                {onSaveFile && (
                  <button
                    onClick={() => {
                      onSaveFile("src/schemas/validation.ts", generatedZodCode);
                      showToast("Saved src/schemas/validation.ts!");
                    }}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-1.5 shadow"
                  >
                    <Save className="w-3.5 h-3.5" /> Save to Workspace
                  </button>
                )}
              </div>
            </div>
            <pre className={`flex-1 p-4 rounded-xl font-mono text-xs overflow-auto border ${
              theme === "dark" ? "bg-slate-900 border-slate-800 text-emerald-300" : "bg-slate-100 border-slate-300 text-slate-800"
            }`}>
              {generatedZodCode}
            </pre>
          </div>
        )}

        {/* VIEW 3: TYPESCRIPT INTERFACE */}
        {activeTab === "ts" && (
          <div className="flex-1 flex flex-col h-full overflow-hidden p-5">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="text-sm font-bold flex items-center gap-2">
                  <FileCode className="w-4 h-4 text-amber-400" />
                  Generated TypeScript Interfaces (src/types/schema.d.ts)
                </h2>
                <p className="text-xs text-slate-400">Zero-dependency TypeScript typings inferred directly from JSON Schema definitions</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleCopy(generatedTsCode, "TypeScript Interfaces")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border flex items-center gap-1.5 ${
                    theme === "dark" ? "bg-slate-800 border-slate-700 text-slate-200" : "bg-white border-slate-300 text-slate-800"
                  }`}
                >
                  <Copy className="w-3.5 h-3.5" /> Copy Code
                </button>
                {onSaveFile && (
                  <button
                    onClick={() => {
                      onSaveFile("src/types/schema.d.ts", generatedTsCode);
                      showToast("Saved src/types/schema.d.ts!");
                      if (onAddLog) onAddLog("create", "Saved src/types/schema.d.ts interface definitions.");
                    }}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium bg-amber-600 hover:bg-amber-500 text-white flex items-center gap-1.5 shadow"
                  >
                    <Save className="w-3.5 h-3.5" /> Save src/types/schema.d.ts
                  </button>
                )}
              </div>
            </div>
            <pre className={`flex-1 p-4 rounded-xl font-mono text-xs overflow-auto border ${
              theme === "dark" ? "bg-slate-900 border-slate-800 text-amber-300" : "bg-slate-100 border-slate-300 text-amber-900"
            }`}>
              {generatedTsCode}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default JsonSchemaValidatorStudioAgent;
