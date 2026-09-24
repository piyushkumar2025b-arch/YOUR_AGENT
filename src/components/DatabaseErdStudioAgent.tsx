import React, { useState, useMemo } from "react";
import {
  Database,
  Layers,
  Key,
  Plus,
  Trash2,
  Save,
  Code,
  FileCode,
  Sparkles,
  Copy,
  Check,
  CheckCircle2,
  Search,
  ExternalLink,
  ChevronRight,
  Filter,
  Columns,
  Grid,
  Share2,
  Sliders,
  FileText
} from "lucide-react";
import { VirtualFile } from "../types";

export interface DatabaseErdStudioAgentProps {
  files: VirtualFile[];
  theme: "light" | "dark";
  onSaveFile: (path: string, content: string) => void;
  onAddLog?: (type: string, msg: string) => void;
}

export type SqlDataType =
  | "UUID"
  | "VARCHAR(255)"
  | "TEXT"
  | "INT"
  | "BIGINT"
  | "BOOLEAN"
  | "TIMESTAMP"
  | "JSONB"
  | "DECIMAL(10,2)";

export interface ColumnDef {
  id: string;
  name: string;
  type: SqlDataType;
  isPrimary: boolean;
  isNullable: boolean;
  isUnique: boolean;
  defaultValue?: string;
  foreignKey?: {
    targetTable: string;
    targetColumn: string;
    relationType: "1:1" | "1:N" | "N:1";
  };
}

export interface TableDef {
  id: string;
  name: string;
  color: string;
  comment?: string;
  columns: ColumnDef[];
}

const TEMPLATES: Record<string, { label: string; tables: TableDef[] }> = {
  ecommerce: {
    label: "E-Commerce & Orders (PostgreSQL)",
    tables: [
      {
        id: "tbl-users",
        name: "users",
        color: "emerald",
        comment: "Registered customer & admin accounts",
        columns: [
          { id: "col-u-1", name: "id", type: "UUID", isPrimary: true, isNullable: false, isUnique: true, defaultValue: "gen_random_uuid()" },
          { id: "col-u-2", name: "email", type: "VARCHAR(255)", isPrimary: false, isNullable: false, isUnique: true },
          { id: "col-u-3", name: "full_name", type: "VARCHAR(255)", isPrimary: false, isNullable: false, isUnique: false },
          { id: "col-u-4", name: "role", type: "VARCHAR(255)", isPrimary: false, isNullable: false, isUnique: false, defaultValue: "'customer'" },
          { id: "col-u-5", name: "created_at", type: "TIMESTAMP", isPrimary: false, isNullable: false, isUnique: false, defaultValue: "NOW()" }
        ]
      },
      {
        id: "tbl-products",
        name: "products",
        color: "sky",
        comment: "Inventory catalog items",
        columns: [
          { id: "col-p-1", name: "id", type: "UUID", isPrimary: true, isNullable: false, isUnique: true, defaultValue: "gen_random_uuid()" },
          { id: "col-p-2", name: "title", type: "VARCHAR(255)", isPrimary: false, isNullable: false, isUnique: false },
          { id: "col-p-3", name: "sku", type: "VARCHAR(255)", isPrimary: false, isNullable: false, isUnique: true },
          { id: "col-p-4", name: "price", type: "DECIMAL(10,2)", isPrimary: false, isNullable: false, isUnique: false },
          { id: "col-p-5", name: "stock_quantity", type: "INT", isPrimary: false, isNullable: false, isUnique: false, defaultValue: "0" },
          { id: "col-p-6", name: "metadata", type: "JSONB", isPrimary: false, isNullable: true, isUnique: false }
        ]
      },
      {
        id: "tbl-orders",
        name: "orders",
        color: "amber",
        comment: "Customer purchases and payment status",
        columns: [
          { id: "col-o-1", name: "id", type: "UUID", isPrimary: true, isNullable: false, isUnique: true, defaultValue: "gen_random_uuid()" },
          {
            id: "col-o-2",
            name: "user_id",
            type: "UUID",
            isPrimary: false,
            isNullable: false,
            isUnique: false,
            foreignKey: { targetTable: "users", targetColumn: "id", relationType: "N:1" }
          },
          { id: "col-o-3", name: "total_amount", type: "DECIMAL(10,2)", isPrimary: false, isNullable: false, isUnique: false },
          { id: "col-o-4", name: "status", type: "VARCHAR(255)", isPrimary: false, isNullable: false, isUnique: false, defaultValue: "'pending'" },
          { id: "col-o-5", name: "created_at", type: "TIMESTAMP", isPrimary: false, isNullable: false, isUnique: false, defaultValue: "NOW()" }
        ]
      },
      {
        id: "tbl-order-items",
        name: "order_items",
        color: "purple",
        comment: "Line items per order invoice",
        columns: [
          { id: "col-oi-1", name: "id", type: "UUID", isPrimary: true, isNullable: false, isUnique: true, defaultValue: "gen_random_uuid()" },
          {
            id: "col-oi-2",
            name: "order_id",
            type: "UUID",
            isPrimary: false,
            isNullable: false,
            isUnique: false,
            foreignKey: { targetTable: "orders", targetColumn: "id", relationType: "N:1" }
          },
          {
            id: "col-oi-3",
            name: "product_id",
            type: "UUID",
            isPrimary: false,
            isNullable: false,
            isUnique: false,
            foreignKey: { targetTable: "products", targetColumn: "id", relationType: "N:1" }
          },
          { id: "col-oi-4", name: "quantity", type: "INT", isPrimary: false, isNullable: false, isUnique: false, defaultValue: "1" },
          { id: "col-oi-5", name: "unit_price", type: "DECIMAL(10,2)", isPrimary: false, isNullable: false, isUnique: false }
        ]
      }
    ]
  },
  saas_rbac: {
    label: "SaaS Multi-Tenant RBAC",
    tables: [
      {
        id: "tbl-orgs",
        name: "organizations",
        color: "indigo",
        comment: "Customer workspace accounts",
        columns: [
          { id: "col-org-1", name: "id", type: "UUID", isPrimary: true, isNullable: false, isUnique: true, defaultValue: "gen_random_uuid()" },
          { id: "col-org-2", name: "name", type: "VARCHAR(255)", isPrimary: false, isNullable: false, isUnique: false },
          { id: "col-org-3", name: "slug", type: "VARCHAR(255)", isPrimary: false, isNullable: false, isUnique: true },
          { id: "col-org-4", name: "plan", type: "VARCHAR(255)", isPrimary: false, isNullable: false, isUnique: false, defaultValue: "'pro'" },
          { id: "col-org-5", name: "created_at", type: "TIMESTAMP", isPrimary: false, isNullable: false, isUnique: false, defaultValue: "NOW()" }
        ]
      },
      {
        id: "tbl-members",
        name: "organization_memberships",
        color: "teal",
        comment: "Team members & role assignments",
        columns: [
          { id: "col-m-1", name: "id", type: "UUID", isPrimary: true, isNullable: false, isUnique: true, defaultValue: "gen_random_uuid()" },
          {
            id: "col-m-2",
            name: "organization_id",
            type: "UUID",
            isPrimary: false,
            isNullable: false,
            isUnique: false,
            foreignKey: { targetTable: "organizations", targetColumn: "id", relationType: "N:1" }
          },
          { id: "col-m-3", name: "user_id", type: "UUID", isPrimary: false, isNullable: false, isUnique: false },
          { id: "col-m-4", name: "role", type: "VARCHAR(255)", isPrimary: false, isNullable: false, isUnique: false, defaultValue: "'member'" }
        ]
      },
      {
        id: "tbl-audit",
        name: "audit_logs",
        color: "rose",
        comment: "Security audit compliance ledger",
        columns: [
          { id: "col-a-1", name: "id", type: "BIGINT", isPrimary: true, isNullable: false, isUnique: true },
          {
            id: "col-a-2",
            name: "organization_id",
            type: "UUID",
            isPrimary: false,
            isNullable: false,
            isUnique: false,
            foreignKey: { targetTable: "organizations", targetColumn: "id", relationType: "N:1" }
          },
          { id: "col-a-3", name: "action", type: "VARCHAR(255)", isPrimary: false, isNullable: false, isUnique: false },
          { id: "col-a-4", name: "ip_address", type: "VARCHAR(255)", isPrimary: false, isNullable: true, isUnique: false },
          { id: "col-a-5", name: "payload", type: "JSONB", isPrimary: false, isNullable: true, isUnique: false },
          { id: "col-a-6", name: "timestamp", type: "TIMESTAMP", isPrimary: false, isNullable: false, isUnique: false, defaultValue: "NOW()" }
        ]
      }
    ]
  }
};

export const DatabaseErdStudioAgent: React.FC<DatabaseErdStudioAgentProps> = ({
  files,
  theme,
  onSaveFile,
  onAddLog
}) => {
  const [tables, setTables] = useState<TableDef[]>(TEMPLATES.ecommerce.tables);
  const [selectedTableId, setSelectedTableId] = useState<string>("tbl-users");
  const [activeView, setActiveView] = useState<"diagram" | "sql" | "drizzle" | "prisma" | "types">("diagram");
  const [searchFilter, setSearchFilter] = useState<string>("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState<boolean>(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const selectedTable = useMemo(() => {
    return tables.find(t => t.id === selectedTableId) || tables[0];
  }, [tables, selectedTableId]);

  // Workspace File Scanner for DB schemas
  const scanWorkspaceForSchemas = () => {
    const discovered: TableDef[] = [];
    const tableRegex = /CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?([a-zA-Z0-9_]+)\s*\(([\s\S]*?)\);/gi;

    files.forEach(f => {
      if (f.content && (f.path.endsWith(".sql") || f.path.endsWith(".ts") || f.path.endsWith(".js"))) {
        let match;
        while ((match = tableRegex.exec(f.content)) !== null) {
          const tableName = match[1];
          const body = match[2];
          const lines = body.split(",").map(l => l.trim()).filter(Boolean);

          const cols: ColumnDef[] = [];
          lines.forEach((line, idx) => {
            const parts = line.split(/\s+/);
            if (parts.length >= 2 && !line.toUpperCase().startsWith("PRIMARY") && !line.toUpperCase().startsWith("CONSTRAINT")) {
              const colName = parts[0].replace(/["`]/g, "");
              const rawType = parts[1].toUpperCase();
              let mappedType: SqlDataType = "VARCHAR(255)";
              if (rawType.includes("UUID")) mappedType = "UUID";
              else if (rawType.includes("INT")) mappedType = "INT";
              else if (rawType.includes("BOOL")) mappedType = "BOOLEAN";
              else if (rawType.includes("JSON")) mappedType = "JSONB";
              else if (rawType.includes("TIME")) mappedType = "TIMESTAMP";
              else if (rawType.includes("TEXT")) mappedType = "TEXT";

              cols.push({
                id: `col-${tableName}-${idx}`,
                name: colName,
                type: mappedType,
                isPrimary: line.toUpperCase().includes("PRIMARY KEY") || colName === "id",
                isNullable: !line.toUpperCase().includes("NOT NULL"),
                isUnique: line.toUpperCase().includes("UNIQUE")
              });
            }
          });

          if (cols.length > 0) {
            discovered.push({
              id: `tbl-${tableName}`,
              name: tableName,
              color: "emerald",
              comment: `Discovered from ${f.path}`,
              columns: cols
            });
          }
        }
      }
    });

    if (discovered.length > 0) {
      setTables(discovered);
      setSelectedTableId(discovered[0].id);
      showToast(`Discovered & loaded ${discovered.length} database tables from workspace!`);
      if (onAddLog) onAddLog("analyze", `ERD Architect scanned workspace and generated ${discovered.length} tables.`);
    } else {
      showToast("No raw SQL CREATE TABLE statements detected in workspace files.");
    }
  };

  // Generate SQL DDL
  const generatedSqlDdl = useMemo(() => {
    const lines: string[] = [
      `-- ========================================================`,
      `-- Database Schema Architecture`,
      `-- Generated by Remix Studio ERD Architect`,
      `-- Target Engine: PostgreSQL 15+ / Cloud SQL / Supabase`,
      `-- ========================================================`,
      ``,
      `CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`,
      ``
    ];

    tables.forEach(table => {
      lines.push(`-- Table: ${table.name}`);
      if (table.comment) lines.push(`-- Comment: ${table.comment}`);
      lines.push(`CREATE TABLE IF NOT EXISTS ${table.name} (`);

      const colDefs: string[] = [];
      table.columns.forEach(col => {
        let colStr = `    ${col.name.padEnd(20)} ${col.type}`;
        if (col.isPrimary) colStr += ` PRIMARY KEY`;
        if (!col.isNullable && !col.isPrimary) colStr += ` NOT NULL`;
        if (col.isUnique && !col.isPrimary) colStr += ` UNIQUE`;
        if (col.defaultValue) colStr += ` DEFAULT ${col.defaultValue}`;
        if (col.foreignKey) {
          colStr += ` REFERENCES ${col.foreignKey.targetTable}(${col.foreignKey.targetColumn}) ON DELETE CASCADE`;
        }
        colDefs.push(colStr);
      });

      lines.push(colDefs.join(",\n"));
      lines.push(`);`);
      lines.push(``);
    });

    return lines.join("\n");
  }, [tables]);

  // Generate Drizzle ORM Schema
  const generatedDrizzleSchema = useMemo(() => {
    const lines: string[] = [
      `import { pgTable, uuid, varchar, text, integer, boolean, timestamp, jsonb, decimal } from "drizzle-orm/pg-core";`,
      `import { relations } from "drizzle-orm";`,
      ``
    ];

    tables.forEach(table => {
      lines.push(`export const ${table.name} = pgTable("${table.name}", {`);
      table.columns.forEach(col => {
        let line = `  ${col.name}: `;
        if (col.type === "UUID") line += `uuid("${col.name}")`;
        else if (col.type === "INT") line += `integer("${col.name}")`;
        else if (col.type === "BIGINT") line += `integer("${col.name}")`;
        else if (col.type === "BOOLEAN") line += `boolean("${col.name}")`;
        else if (col.type === "TIMESTAMP") line += `timestamp("${col.name}")`;
        else if (col.type === "JSONB") line += `jsonb("${col.name}")`;
        else if (col.type.startsWith("DECIMAL")) line += `decimal("${col.name}", { precision: 10, scale: 2 })`;
        else line += `varchar("${col.name}", { length: 255 })`;

        if (col.isPrimary) line += `.primaryKey()`;
        if (!col.isNullable) line += `.notNull()`;
        if (col.defaultValue) line += `.defaultNow()`;
        if (col.foreignKey) line += `.references(() => ${col.foreignKey.targetTable}.${col.foreignKey.targetColumn})`;

        line += `,`;
        lines.push(line);
      });
      lines.push(`});`);
      lines.push(``);
    });

    return lines.join("\n");
  }, [tables]);

  // Generate TypeScript Interfaces
  const generatedTypeScriptModels = useMemo(() => {
    const lines: string[] = [
      `/**`,
      ` * TypeScript Data Entity Interfaces`,
      ` * Generated by Remix Studio ERD Architect`,
      ` */`,
      ``
    ];

    tables.forEach(table => {
      const interfaceName = table.name
        .split("_")
        .map(p => p.charAt(0).toUpperCase() + p.slice(1))
        .join("")
        .replace(/s$/, "");

      lines.push(`export interface ${interfaceName} {`);
      table.columns.forEach(col => {
        let tsType = "string";
        if (col.type === "INT" || col.type === "BIGINT" || col.type.startsWith("DECIMAL")) tsType = "number";
        else if (col.type === "BOOLEAN") tsType = "boolean";
        else if (col.type === "TIMESTAMP") tsType = "Date | string";
        else if (col.type === "JSONB") tsType = "Record<string, any>";

        lines.push(`  ${col.name}${col.isNullable ? "?" : ""}: ${tsType};`);
      });
      lines.push(`}`);
      lines.push(``);
    });

    return lines.join("\n");
  }, [tables]);

  // Copy helper
  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setIsCopied(true);
    showToast(`Copied ${label} to clipboard!`);
    setTimeout(() => setIsCopied(false), 2000);
  };

  // Add Column to Selected Table
  const handleAddColumn = () => {
    if (!selectedTable) return;
    const newColId = `col-${Date.now()}`;
    const newColName = `field_${selectedTable.columns.length + 1}`;
    setTables(prev =>
      prev.map(t => {
        if (t.id === selectedTable.id) {
          return {
            ...t,
            columns: [
              ...t.columns,
              {
                id: newColId,
                name: newColName,
                type: "VARCHAR(255)",
                isPrimary: false,
                isNullable: true,
                isUnique: false
              }
            ]
          };
        }
        return t;
      })
    );
    showToast(`Added column "${newColName}"`);
  };

  // Add Table
  const handleAddTable = () => {
    const newId = `tbl-${Date.now()}`;
    const newName = `custom_entity_${tables.length + 1}`;
    const newTable: TableDef = {
      id: newId,
      name: newName,
      color: "emerald",
      comment: "Custom entity table",
      columns: [
        { id: `c1-${Date.now()}`, name: "id", type: "UUID", isPrimary: true, isNullable: false, isUnique: true, defaultValue: "gen_random_uuid()" },
        { id: `c2-${Date.now()}`, name: "created_at", type: "TIMESTAMP", isPrimary: false, isNullable: false, isUnique: false, defaultValue: "NOW()" }
      ]
    };
    setTables(prev => [...prev, newTable]);
    setSelectedTableId(newId);
    showToast(`Created table "${newName}"!`);
  };

  return (
    <div className={`w-full h-full flex flex-col overflow-hidden ${theme === "dark" ? "bg-slate-950 text-slate-100" : "bg-slate-50 text-slate-900"}`}>
      {/* Toast Notification */}
      {toastMessage && (
        <div className="absolute top-4 right-6 z-50 px-4 py-2 bg-blue-600 text-white text-xs font-semibold rounded-lg shadow-xl border border-blue-400/40 flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-200">
          <CheckCircle2 className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Bar */}
      <div className={`px-5 py-3 border-b flex flex-wrap items-center justify-between gap-4 ${theme === "dark" ? "bg-slate-900/90 border-slate-800" : "bg-white border-slate-200"}`}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/20 text-white">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold tracking-tight">Database Schema & ERD Architect</h1>
              <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
                PostgreSQL & Drizzle
              </span>
              <span className="text-xs text-slate-400">({tables.length} Tables)</span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              Interactive visual Entity Relationship Diagram (ERD) modeler, foreign key visualizer & multi-ORM generator
            </p>
          </div>
        </div>

        {/* Global Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={scanWorkspaceForSchemas}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg flex items-center gap-1.5 transition-all shadow-sm ${
              theme === "dark"
                ? "bg-slate-800 hover:bg-slate-700 text-blue-300 border border-blue-500/30"
                : "bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-300"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            <span>Scan Project SQL</span>
          </button>

          <button
            onClick={() => {
              onSaveFile("schema.sql", generatedSqlDdl);
              showToast("Saved schema.sql to project workspace!");
              if (onAddLog) onAddLog("create", "Saved schema.sql with database migrations.");
            }}
            className="px-3 py-1.5 text-xs font-medium rounded-lg bg-blue-600 hover:bg-blue-500 text-white flex items-center gap-1.5 shadow-md shadow-blue-600/20 transition-all"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save schema.sql</span>
          </button>

          <button
            onClick={() => {
              onSaveFile("src/db/schema.ts", generatedDrizzleSchema);
              showToast("Saved src/db/schema.ts to project workspace!");
              if (onAddLog) onAddLog("create", "Saved src/db/schema.ts with Drizzle definitions.");
            }}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg flex items-center gap-1.5 border transition-all ${
              theme === "dark"
                ? "bg-slate-800 hover:bg-slate-700 text-cyan-300 border-cyan-500/30"
                : "bg-cyan-50 hover:bg-cyan-100 text-cyan-800 border-cyan-300"
            }`}
          >
            <Code className="w-3.5 h-3.5" />
            <span>Save Drizzle Schema</span>
          </button>
        </div>
      </div>

      {/* Sub-header Navigation Bar */}
      <div className={`px-5 py-2 border-b flex items-center justify-between gap-4 text-xs ${theme === "dark" ? "bg-slate-900/50 border-slate-800" : "bg-slate-100/70 border-slate-200"}`}>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setActiveView("diagram")}
            className={`px-3 py-1.5 rounded-md font-medium flex items-center gap-1.5 transition-colors ${
              activeView === "diagram"
                ? theme === "dark" ? "bg-slate-800 text-white shadow-sm" : "bg-white text-slate-900 shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Grid className="w-3.5 h-3.5 text-blue-400" />
            <span>Interactive ERD Diagram</span>
          </button>
          <button
            onClick={() => setActiveView("sql")}
            className={`px-3 py-1.5 rounded-md font-medium flex items-center gap-1.5 transition-colors ${
              activeView === "sql"
                ? theme === "dark" ? "bg-slate-800 text-white shadow-sm" : "bg-white text-slate-900 shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <FileCode className="w-3.5 h-3.5 text-emerald-400" />
            <span>PostgreSQL DDL</span>
          </button>
          <button
            onClick={() => setActiveView("drizzle")}
            className={`px-3 py-1.5 rounded-md font-medium flex items-center gap-1.5 transition-colors ${
              activeView === "drizzle"
                ? theme === "dark" ? "bg-slate-800 text-white shadow-sm" : "bg-white text-slate-900 shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Code className="w-3.5 h-3.5 text-cyan-400" />
            <span>Drizzle ORM</span>
          </button>
          <button
            onClick={() => setActiveView("types")}
            className={`px-3 py-1.5 rounded-md font-medium flex items-center gap-1.5 transition-colors ${
              activeView === "types"
                ? theme === "dark" ? "bg-slate-800 text-white shadow-sm" : "bg-white text-slate-900 shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-purple-400" />
            <span>TypeScript Types</span>
          </button>
        </div>

        {/* Templates Dropdown */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-slate-400">Template:</span>
          <select
            onChange={e => {
              const tmpl = TEMPLATES[e.target.value];
              if (tmpl) {
                setTables(tmpl.tables);
                setSelectedTableId(tmpl.tables[0].id);
                showToast(`Loaded ${tmpl.label} template!`);
              }
            }}
            className={`px-2 py-1 text-xs rounded border outline-none font-medium ${
              theme === "dark" ? "bg-slate-800 border-slate-700 text-slate-200" : "bg-white border-slate-300 text-slate-800"
            }`}
          >
            <option value="ecommerce">E-Commerce & Orders</option>
            <option value="saas_rbac">SaaS Multi-Tenant RBAC</option>
          </select>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* VIEW 1: INTERACTIVE ERD DIAGRAM */}
        {activeView === "diagram" && (
          <div className="flex-1 flex flex-col md:flex-row h-full overflow-hidden">
            {/* Left Sidebar: Tables List */}
            <div className={`w-full md:w-72 lg:w-80 flex flex-col border-r h-full overflow-hidden shrink-0 ${theme === "dark" ? "bg-slate-900/40 border-slate-800" : "bg-slate-50 border-slate-200"}`}>
              <div className="p-3 border-b space-y-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search tables..."
                    value={searchFilter}
                    onChange={e => setSearchFilter(e.target.value)}
                    className={`w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border outline-none ${
                      theme === "dark" ? "bg-slate-800 border-slate-700 text-white" : "bg-white border-slate-300 text-slate-800"
                    }`}
                  />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-2 space-y-1">
                {tables
                  .filter(t => t.name.toLowerCase().includes(searchFilter.toLowerCase()))
                  .map(t => {
                    const isSelected = t.id === selectedTableId;
                    return (
                      <button
                        key={t.id}
                        onClick={() => setSelectedTableId(t.id)}
                        className={`w-full text-left p-2.5 rounded-lg border transition-all flex items-center justify-between ${
                          isSelected
                            ? theme === "dark"
                              ? "bg-slate-800 border-blue-500/60 shadow-sm"
                              : "bg-white border-blue-500 shadow-sm"
                            : theme === "dark"
                            ? "bg-slate-900/60 border-slate-800 hover:bg-slate-800/60"
                            : "bg-white/60 border-slate-200 hover:bg-white"
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <Database className={`w-3.5 h-3.5 ${isSelected ? "text-blue-400" : "text-slate-400"}`} />
                          <span className="text-xs font-mono font-bold truncate text-slate-200">{t.name}</span>
                          <span className="text-[10px] text-slate-500">({t.columns.length})</span>
                        </div>
                        <ChevronRight className={`w-3.5 h-3.5 ${isSelected ? "text-blue-400" : "text-slate-500"}`} />
                      </button>
                    );
                  })}
              </div>

              <div className="p-3 border-t">
                <button
                  onClick={handleAddTable}
                  className={`w-full py-2 px-3 text-xs font-medium rounded-lg border border-dashed flex items-center justify-center gap-1.5 transition-colors ${
                    theme === "dark"
                      ? "border-slate-700 hover:border-blue-500 text-slate-300 hover:text-blue-400 hover:bg-slate-800/50"
                      : "border-slate-300 hover:border-blue-600 text-slate-700 hover:text-blue-600 hover:bg-blue-50"
                  }`}
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add New Table</span>
                </button>
              </div>
            </div>

            {/* Middle: Visual Schema Cards Canvas */}
            <div className="flex-1 flex flex-col h-full overflow-y-auto p-5 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-bold flex items-center gap-2">
                    <span>Visual Schema Map</span>
                    <span className="text-xs text-slate-400 font-normal">({tables.length} tables, {tables.reduce((acc, t) => acc + t.columns.length, 0)} columns)</span>
                  </h2>
                  <p className="text-xs text-slate-400">Relationships connected via Foreign Key constraints</p>
                </div>
              </div>

              {/* Grid of ERD Tables */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {tables.map(table => {
                  const isSelected = table.id === selectedTableId;
                  return (
                    <div
                      key={table.id}
                      onClick={() => setSelectedTableId(table.id)}
                      className={`rounded-xl border shadow-md transition-all cursor-pointer ${
                        isSelected
                          ? "ring-2 ring-blue-500 border-blue-500/70"
                          : "border-slate-800 hover:border-slate-700"
                      } ${theme === "dark" ? "bg-slate-900" : "bg-white"}`}
                    >
                      {/* Table Header */}
                      <div className={`px-4 py-2.5 border-b rounded-t-xl flex items-center justify-between ${theme === "dark" ? "bg-slate-800/80 border-slate-700" : "bg-slate-100 border-slate-200"}`}>
                        <div className="flex items-center gap-2">
                          <Database className="w-4 h-4 text-blue-400" />
                          <span className="font-mono font-bold text-xs text-slate-100">{table.name}</span>
                        </div>
                        {table.comment && (
                          <span className="text-[10px] text-slate-400 truncate max-w-[150px]">{table.comment}</span>
                        )}
                      </div>

                      {/* Columns List */}
                      <div className="divide-y divide-slate-800/60 p-1">
                        {table.columns.map(col => (
                          <div key={col.id} className="px-3 py-1.5 flex items-center justify-between text-xs hover:bg-slate-800/30 rounded">
                            <div className="flex items-center gap-1.5">
                              {col.isPrimary ? (
                                <Key className="w-3 h-3 text-amber-400" />
                              ) : col.foreignKey ? (
                                <Share2 className="w-3 h-3 text-cyan-400" />
                              ) : (
                                <Columns className="w-3 h-3 text-slate-500 opacity-60" />
                              )}
                              <span className={`font-mono text-[11px] ${col.isPrimary ? "font-bold text-amber-300" : "text-slate-200"}`}>
                                {col.name}
                              </span>
                            </div>

                            <div className="flex items-center gap-2">
                              <span className="font-mono text-[10px] text-slate-400">{col.type}</span>
                              {col.foreignKey && (
                                <span className="px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 text-[9px] font-mono">
                                  → {col.foreignKey.targetTable}.{col.foreignKey.targetColumn}
                                </span>
                              )}
                              {col.isNullable && (
                                <span className="text-[9px] text-slate-500">NULL</span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Selected Table Column Editor */}
              {selectedTable && (
                <div className={`p-4 rounded-xl border space-y-3 mt-4 ${theme === "dark" ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                        Editing Table: <span className="text-blue-400 font-mono">{selectedTable.name}</span>
                      </h3>
                      <span className="text-xs text-slate-500">({selectedTable.columns.length} columns)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleAddColumn}
                        className="px-2.5 py-1 text-xs font-medium rounded bg-blue-600 hover:bg-blue-500 text-white flex items-center gap-1"
                      >
                        <Plus className="w-3 h-3" /> Add Column
                      </button>
                      <button
                        onClick={() => {
                          if (tables.length <= 1) {
                            showToast("Cannot delete the only table.");
                            return;
                          }
                          setTables(prev => prev.filter(t => t.id !== selectedTable.id));
                          setSelectedTableId(tables[0].id);
                          showToast("Deleted table.");
                        }}
                        className="px-2.5 py-1 text-xs text-rose-400 hover:bg-rose-500/10 rounded transition-colors flex items-center gap-1"
                      >
                        <Trash2 className="w-3 h-3" /> Delete Table
                      </button>
                    </div>
                  </div>

                  {/* Columns Editor Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left">
                      <thead>
                        <tr className="border-b border-slate-800 text-slate-400">
                          <th className="py-2 px-2 font-medium">Column Name</th>
                          <th className="py-2 px-2 font-medium">Data Type</th>
                          <th className="py-2 px-2 font-medium">Primary Key</th>
                          <th className="py-2 px-2 font-medium">Nullable</th>
                          <th className="py-2 px-2 font-medium">Default</th>
                          <th className="py-2 px-2 font-medium">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800">
                        {selectedTable.columns.map(col => (
                          <tr key={col.id}>
                            <td className="py-2 px-2">
                              <input
                                type="text"
                                value={col.name}
                                onChange={e => {
                                  const val = e.target.value;
                                  setTables(prev =>
                                    prev.map(t =>
                                      t.id === selectedTable.id
                                        ? { ...t, columns: t.columns.map(c => (c.id === col.id ? { ...c, name: val } : c)) }
                                        : t
                                    )
                                  );
                                }}
                                className={`px-2 py-1 text-xs rounded border font-mono ${
                                  theme === "dark" ? "bg-slate-800 border-slate-700 text-white" : "bg-slate-100 border-slate-300 text-slate-800"
                                }`}
                              />
                            </td>
                            <td className="py-2 px-2">
                              <select
                                value={col.type}
                                onChange={e => {
                                  const val = e.target.value as SqlDataType;
                                  setTables(prev =>
                                    prev.map(t =>
                                      t.id === selectedTable.id
                                        ? { ...t, columns: t.columns.map(c => (c.id === col.id ? { ...c, type: val } : c)) }
                                        : t
                                    )
                                  );
                                }}
                                className={`px-2 py-1 text-xs rounded border font-mono ${
                                  theme === "dark" ? "bg-slate-800 border-slate-700 text-slate-300" : "bg-slate-100 border-slate-300 text-slate-800"
                                }`}
                              >
                                <option value="UUID">UUID</option>
                                <option value="VARCHAR(255)">VARCHAR(255)</option>
                                <option value="TEXT">TEXT</option>
                                <option value="INT">INT</option>
                                <option value="BIGINT">BIGINT</option>
                                <option value="BOOLEAN">BOOLEAN</option>
                                <option value="TIMESTAMP">TIMESTAMP</option>
                                <option value="JSONB">JSONB</option>
                                <option value="DECIMAL(10,2)">DECIMAL(10,2)</option>
                              </select>
                            </td>
                            <td className="py-2 px-2">
                              <input
                                type="checkbox"
                                checked={col.isPrimary}
                                onChange={e => {
                                  const val = e.target.checked;
                                  setTables(prev =>
                                    prev.map(t =>
                                      t.id === selectedTable.id
                                        ? { ...t, columns: t.columns.map(c => (c.id === col.id ? { ...c, isPrimary: val } : c)) }
                                        : t
                                    )
                                  );
                                }}
                                className="rounded text-blue-600 focus:ring-0"
                              />
                            </td>
                            <td className="py-2 px-2">
                              <input
                                type="checkbox"
                                checked={col.isNullable}
                                onChange={e => {
                                  const val = e.target.checked;
                                  setTables(prev =>
                                    prev.map(t =>
                                      t.id === selectedTable.id
                                        ? { ...t, columns: t.columns.map(c => (c.id === col.id ? { ...c, isNullable: val } : c)) }
                                        : t
                                    )
                                  );
                                }}
                                className="rounded text-blue-600 focus:ring-0"
                              />
                            </td>
                            <td className="py-2 px-2">
                              <input
                                type="text"
                                value={col.defaultValue || ""}
                                placeholder="e.g. NOW()"
                                onChange={e => {
                                  const val = e.target.value;
                                  setTables(prev =>
                                    prev.map(t =>
                                      t.id === selectedTable.id
                                        ? { ...t, columns: t.columns.map(c => (c.id === col.id ? { ...c, defaultValue: val } : c)) }
                                        : t
                                    )
                                  );
                                }}
                                className={`px-2 py-1 text-xs rounded border font-mono w-28 ${
                                  theme === "dark" ? "bg-slate-800 border-slate-700 text-slate-300" : "bg-slate-100 border-slate-300 text-slate-800"
                                }`}
                              />
                            </td>
                            <td className="py-2 px-2">
                              <button
                                onClick={() => {
                                  setTables(prev =>
                                    prev.map(t =>
                                      t.id === selectedTable.id
                                        ? { ...t, columns: t.columns.filter(c => c.id !== col.id) }
                                        : t
                                    )
                                  );
                                }}
                                className="text-rose-400 hover:text-rose-300"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* VIEW 2: POSTGRESQL DDL */}
        {activeView === "sql" && (
          <div className="flex-1 flex flex-col h-full overflow-hidden p-5">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="text-sm font-bold">PostgreSQL DDL Migration Script (schema.sql)</h2>
                <p className="text-xs text-slate-400">Complete SQL definitions ready to execute on PostgreSQL / Cloud SQL / Supabase</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleCopy(generatedSqlDdl, "SQL DDL")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border flex items-center gap-1.5 transition-colors ${
                    theme === "dark" ? "bg-slate-800 border-slate-700 hover:bg-slate-700 text-slate-200" : "bg-white border-slate-300 hover:bg-slate-100 text-slate-800"
                  }`}
                >
                  {isCopied ? <Check className="w-3.5 h-3.5 text-blue-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>Copy SQL</span>
                </button>
                <button
                  onClick={() => onSaveFile("schema.sql", generatedSqlDdl)}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium bg-blue-600 hover:bg-blue-500 text-white flex items-center gap-1.5 shadow"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save schema.sql</span>
                </button>
              </div>
            </div>
            <pre className={`flex-1 p-4 rounded-xl font-mono text-xs overflow-auto border ${
              theme === "dark" ? "bg-slate-900 border-slate-800 text-emerald-300" : "bg-slate-100 border-slate-300 text-slate-800"
            }`}>
              {generatedSqlDdl}
            </pre>
          </div>
        )}

        {/* VIEW 3: DRIZZLE ORM */}
        {activeView === "drizzle" && (
          <div className="flex-1 flex flex-col h-full overflow-hidden p-5">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="text-sm font-bold">Drizzle ORM Schema (src/db/schema.ts)</h2>
                <p className="text-xs text-slate-400">Type-safe PostgreSQL tables & relations for Drizzle ORM</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleCopy(generatedDrizzleSchema, "Drizzle Schema")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border flex items-center gap-1.5 transition-colors ${
                    theme === "dark" ? "bg-slate-800 border-slate-700 hover:bg-slate-700 text-slate-200" : "bg-white border-slate-300 hover:bg-slate-100 text-slate-800"
                  }`}
                >
                  {isCopied ? <Check className="w-3.5 h-3.5 text-blue-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>Copy Drizzle</span>
                </button>
                <button
                  onClick={() => onSaveFile("src/db/schema.ts", generatedDrizzleSchema)}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium bg-cyan-600 hover:bg-cyan-500 text-white flex items-center gap-1.5 shadow"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save src/db/schema.ts</span>
                </button>
              </div>
            </div>
            <pre className={`flex-1 p-4 rounded-xl font-mono text-xs overflow-auto border ${
              theme === "dark" ? "bg-slate-900 border-slate-800 text-cyan-300" : "bg-slate-100 border-slate-300 text-slate-800"
            }`}>
              {generatedDrizzleSchema}
            </pre>
          </div>
        )}

        {/* VIEW 4: TYPESCRIPT TYPES */}
        {activeView === "types" && (
          <div className="flex-1 flex flex-col h-full overflow-hidden p-5">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="text-sm font-bold">TypeScript Entity Interfaces (src/types/entities.ts)</h2>
                <p className="text-xs text-slate-400">Pure TypeScript model representations with nullability handling</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleCopy(generatedTypeScriptModels, "TypeScript Interfaces")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border flex items-center gap-1.5 transition-colors ${
                    theme === "dark" ? "bg-slate-800 border-slate-700 hover:bg-slate-700 text-slate-200" : "bg-white border-slate-300 hover:bg-slate-100 text-slate-800"
                  }`}
                >
                  {isCopied ? <Check className="w-3.5 h-3.5 text-blue-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>Copy Types</span>
                </button>
                <button
                  onClick={() => onSaveFile("src/types/entities.ts", generatedTypeScriptModels)}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium bg-purple-600 hover:bg-purple-500 text-white flex items-center gap-1.5 shadow"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save src/types/entities.ts</span>
                </button>
              </div>
            </div>
            <pre className={`flex-1 p-4 rounded-xl font-mono text-xs overflow-auto border ${
              theme === "dark" ? "bg-slate-900 border-slate-800 text-purple-300" : "bg-slate-100 border-slate-300 text-slate-800"
            }`}>
              {generatedTypeScriptModels}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default DatabaseErdStudioAgent;
