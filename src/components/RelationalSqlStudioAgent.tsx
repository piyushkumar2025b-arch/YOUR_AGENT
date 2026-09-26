import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  Database,
  Play,
  RotateCcw,
  Sparkles,
  Download,
  Copy,
  Check,
  Table as TableIcon,
  Search,
  Filter,
  Code,
  Layers,
  FileSpreadsheet,
  AlertCircle,
  Clock,
  ChevronRight,
  ChevronDown
} from "lucide-react";
import { fetchWithAuth } from "../utils/apiAuth";
import { VirtualFile } from "../types";

interface RelationalSqlStudioAgentProps {
  files?: VirtualFile[];
  apiKey?: string;
  selectedModel?: string;
  theme?: "light" | "dark" | string;
  onAddLog?: (type: string, message: string) => void;
}

// In-Memory Database Table Shape
interface SqlTable {
  name: string;
  columns: { name: string; type: "INTEGER" | "TEXT" | "REAL" | "BOOLEAN"; isPk?: boolean }[];
  rows: Record<string, any>[];
}

// Starter Datasets
const STARTER_DATABASES: Record<string, { label: string; tables: SqlTable[] }> = {
  ecommerce: {
    label: "E-Commerce & Orders",
    tables: [
      {
        name: "customers",
        columns: [
          { name: "id", type: "INTEGER", isPk: true },
          { name: "name", type: "TEXT" },
          { name: "email", type: "TEXT" },
          { name: "city", type: "TEXT" },
          { name: "spent_total", type: "REAL" }
        ],
        rows: [
          { id: 1, name: "Alice Johnson", email: "alice@example.com", city: "San Francisco", spent_total: 1250.50 },
          { id: 2, name: "Bob Smith", email: "bob@example.com", city: "Austin", spent_total: 420.00 },
          { id: 3, name: "Carol Davis", email: "carol@example.com", city: "Seattle", spent_total: 2890.75 },
          { id: 4, name: "David Wilson", email: "david@example.com", city: "New York", spent_total: 150.25 },
          { id: 5, name: "Eva Martinez", email: "eva@example.com", city: "Denver", spent_total: 780.00 },
          { id: 6, name: "Frank Miller", email: "frank@example.com", city: "Chicago", spent_total: 940.30 },
          { id: 7, name: "Grace Lee", email: "grace@example.com", city: "San Francisco", spent_total: 3100.00 }
        ]
      },
      {
        name: "products",
        columns: [
          { name: "id", type: "INTEGER", isPk: true },
          { name: "title", type: "TEXT" },
          { name: "category", type: "TEXT" },
          { name: "price", type: "REAL" },
          { name: "stock", type: "INTEGER" }
        ],
        rows: [
          { id: 101, title: "Wireless Noise-Canceling Headphones", category: "Electronics", price: 199.99, stock: 45 },
          { id: 102, title: "Mechanical Gaming Keyboard RGB", category: "Electronics", price: 89.50, stock: 120 },
          { id: 103, title: "Ergonomic Office Chair Mesh", category: "Furniture", price: 349.00, stock: 15 },
          { id: 104, title: "Stainless Steel Insulated Bottle 1L", category: "Kitchen", price: 24.95, stock: 200 },
          { id: 105, title: "Ultra-Wide 34-Inch Curved Monitor", category: "Electronics", price: 499.99, stock: 8 },
          { id: 106, title: "Bamboo Standing Desk Converter", category: "Furniture", price: 149.00, stock: 32 }
        ]
      },
      {
        name: "orders",
        columns: [
          { name: "id", type: "INTEGER", isPk: true },
          { name: "customer_id", type: "INTEGER" },
          { name: "product_id", type: "INTEGER" },
          { name: "quantity", type: "INTEGER" },
          { name: "status", type: "TEXT" },
          { name: "created_at", type: "TEXT" }
        ],
        rows: [
          { id: 1001, customer_id: 1, product_id: 101, quantity: 1, status: "completed", created_at: "2026-09-10" },
          { id: 1002, customer_id: 3, product_id: 105, quantity: 2, status: "completed", created_at: "2026-09-12" },
          { id: 1003, customer_id: 2, product_id: 102, quantity: 1, status: "shipped", created_at: "2026-09-15" },
          { id: 1004, customer_id: 7, product_id: 103, quantity: 1, status: "processing", created_at: "2026-09-18" },
          { id: 1005, customer_id: 5, product_id: 104, quantity: 4, status: "completed", created_at: "2026-09-20" },
          { id: 1006, customer_id: 1, product_id: 106, quantity: 1, status: "processing", created_at: "2026-09-22" }
        ]
      }
    ]
  },
  dev_workspace: {
    label: "Dev Team & Issues",
    tables: [
      {
        name: "developers",
        columns: [
          { name: "id", type: "INTEGER", isPk: true },
          { name: "handle", type: "TEXT" },
          { name: "role", type: "TEXT" },
          { name: "experience_years", type: "INTEGER" }
        ],
        rows: [
          { id: 1, handle: "alex_coder", role: "Frontend Lead", experience_years: 6 },
          { id: 2, handle: "dev_priya", role: "Fullstack Engineer", experience_years: 4 },
          { id: 3, handle: "sam_devops", role: "DevOps Architect", experience_years: 8 },
          { id: 4, handle: "marcus_backend", role: "Systems Engineer", experience_years: 5 }
        ]
      },
      {
        name: "tasks",
        columns: [
          { name: "id", type: "INTEGER", isPk: true },
          { name: "title", type: "TEXT" },
          { name: "assignee_id", type: "INTEGER" },
          { name: "priority", type: "TEXT" },
          { name: "status", type: "TEXT" }
        ],
        rows: [
          { id: 501, title: "Optimize WebGL Canvas rendering loop", assignee_id: 1, priority: "high", status: "in_progress" },
          { id: 502, title: "Implement Firestore ABAC security validation", assignee_id: 2, priority: "critical", status: "completed" },
          { id: 503, title: "Configure Docker multi-stage build cache", assignee_id: 3, priority: "medium", status: "completed" },
          { id: 504, title: "Refactor REST proxy endpoint SSRF guards", assignee_id: 4, priority: "critical", status: "in_progress" },
          { id: 505, title: "Add unit tests for syntax highlighter", assignee_id: 2, priority: "low", status: "backlog" }
        ]
      }
    ]
  }
};

const PRESET_QUERIES = [
  {
    name: "All Customers ordered by total spent",
    sql: "SELECT * FROM customers WHERE spent_total > 500 ORDER BY spent_total DESC LIMIT 10;"
  },
  {
    name: "Products low on stock (< 30)",
    sql: "SELECT title, category, price, stock FROM products WHERE stock < 30 ORDER BY stock ASC;"
  },
  {
    name: "Completed Orders with details",
    sql: "SELECT id, customer_id, product_id, quantity, status FROM orders WHERE status = 'completed';"
  },
  {
    name: "Customers in San Francisco",
    sql: "SELECT name, email, spent_total FROM customers WHERE city = 'San Francisco';"
  }
];

export const RelationalSqlStudioAgent: React.FC<RelationalSqlStudioAgentProps> = ({
  files = [],
  apiKey = "",
  selectedModel = "gemini-2.5-flash",
  theme = "dark",
  onAddLog
}) => {
  const isDark = theme !== "light";

  const allDatabases = useMemo(() => {
    const list: Record<string, { label: string; tables: SqlTable[] }> = {
      ...STARTER_DATABASES
    };
    if (files && files.length > 0) {
      const workspaceTables: SqlTable[] = [
        {
          name: "workspace_files",
          columns: [
            { name: "id", type: "INTEGER", isPk: true },
            { name: "path", type: "TEXT" },
            { name: "language", type: "TEXT" },
            { name: "size_bytes", type: "INTEGER" },
            { name: "is_user_created", type: "BOOLEAN" }
          ],
          rows: files.map((f, idx) => ({
            id: idx + 1,
            path: f.path,
            language: f.language || f.path.split(".").pop() || "txt",
            size_bytes: f.content ? f.content.length : 0,
            is_user_created: Boolean(f.isUserCreated)
          }))
        }
      ];

      const pkgFile = files.find(f => f.path === "package.json");
      if (pkgFile && pkgFile.content) {
        try {
          const pkgJson = JSON.parse(pkgFile.content);
          const deps = { ...(pkgJson.dependencies || {}), ...(pkgJson.devDependencies || {}) };
          const depRows = Object.entries(deps).map(([name, ver], idx) => ({
            id: idx + 1,
            name,
            version: String(ver),
            is_dev: Boolean(pkgJson.devDependencies?.[name])
          }));

          workspaceTables.push({
            name: "package_dependencies",
            columns: [
              { name: "id", type: "INTEGER", isPk: true },
              { name: "name", type: "TEXT" },
              { name: "version", type: "TEXT" },
              { name: "is_dev", type: "BOOLEAN" }
            ],
            rows: depRows
          });
        } catch {}
      }

      list["workspace"] = {
        label: `Project Workspace Files (${files.length} files)`,
        tables: workspaceTables
      };
    }
    return list;
  }, [files]);

  const initialKey = files && files.length > 0 ? "workspace" : "ecommerce";
  const [activeDbKey, setActiveDbKey] = useState<string>(initialKey);
  const [database, setDatabase] = useState<SqlTable[]>(() => {
    if (!files || files.length === 0) {
      return JSON.parse(JSON.stringify(STARTER_DATABASES["ecommerce"].tables));
    }

    const tables: SqlTable[] = [
      {
        name: "workspace_files",
        columns: [
          { name: "id", type: "INTEGER", isPk: true },
          { name: "path", type: "TEXT" },
          { name: "language", type: "TEXT" },
          { name: "size_bytes", type: "INTEGER" },
          { name: "is_user_created", type: "BOOLEAN" }
        ],
        rows: files.map((f, idx) => ({
          id: idx + 1,
          path: f.path,
          language: f.language || f.path.split(".").pop() || "txt",
          size_bytes: f.content ? f.content.length : 0,
          is_user_created: Boolean(f.isUserCreated)
        }))
      }
    ];

    const pkgFile = files.find(f => f.path === "package.json");
    if (pkgFile && pkgFile.content) {
      try {
        const pkgJson = JSON.parse(pkgFile.content);
        const deps = { ...(pkgJson.dependencies || {}), ...(pkgJson.devDependencies || {}) };
        const depRows = Object.entries(deps).map(([name, ver], idx) => ({
          id: idx + 1,
          name,
          version: String(ver),
          is_dev: Boolean(pkgJson.devDependencies?.[name])
        }));

        tables.push({
          name: "package_dependencies",
          columns: [
            { name: "id", type: "INTEGER", isPk: true },
            { name: "name", type: "TEXT" },
            { name: "version", type: "TEXT" },
            { name: "is_dev", type: "BOOLEAN" }
          ],
          rows: depRows
        });
      } catch {}
    }

    return tables;
  });

  const [sqlQuery, setSqlQuery] = useState<string>(() =>
    files && files.length > 0
      ? "SELECT path, language, size_bytes FROM workspace_files WHERE size_bytes > 50 ORDER BY size_bytes DESC LIMIT 15;"
      : "SELECT * FROM customers WHERE spent_total > 400 ORDER BY spent_total DESC LIMIT 10;"
  );

  // Execution Results
  const [queryColumns, setQueryColumns] = useState<string[]>([]);
  const [queryRows, setQueryRows] = useState<Record<string, any>[]>([]);
  const [queryError, setQueryError] = useState<string | null>(null);
  const [executionTimeMs, setExecutionTimeMs] = useState<number | null>(null);
  const [affectedMessage, setAffectedMessage] = useState<string | null>(null);
  const [resultFilter, setResultFilter] = useState<string>("");

  // AI SQL Prompt
  const [aiPrompt, setAiPrompt] = useState<string>("");
  const [isAiGenerating, setIsAiGenerating] = useState<boolean>(false);
  const [aiExplanation, setAiExplanation] = useState<string | null>(null);

  // Copied indicator
  const [isCopied, setIsCopied] = useState<boolean>(false);

  // Switch Starter Database
  const handleSwitchDb = (key: string) => {
    setActiveDbKey(key);
    const target = allDatabases[key];
    if (!target) return;
    const newTables = JSON.parse(JSON.stringify(target.tables));
    setDatabase(newTables);
    if (newTables[0]) {
      setSqlQuery(
        key === "workspace"
          ? "SELECT path, language, size_bytes FROM workspace_files ORDER BY size_bytes DESC LIMIT 15;"
          : `SELECT * FROM ${newTables[0].name} LIMIT 20;`
      );
    }
    setQueryColumns([]);
    setQueryRows([]);
    setQueryError(null);
    setAffectedMessage(null);
  };

  // Reset database to seed
  const handleResetDb = () => {
    const target = allDatabases[activeDbKey];
    if (!target) return;
    const seed = JSON.parse(JSON.stringify(target.tables));
    setDatabase(seed);
    setAffectedMessage("Database reset to original seed data.");
    setQueryError(null);
  };

  // Run the SQL Query using an interactive client-side SQL processor
  const executeQuery = () => {
    const trimmed = sqlQuery.trim();
    if (!trimmed) return;

    setQueryError(null);
    setAffectedMessage(null);
    const startTime = performance.now();

    try {
      // 1. SELECT query parsing (with optional JOIN support)
      const selectMatch = trimmed.match(/^SELECT\s+(.+?)\s+FROM\s+([a-zA-Z0-9_]+)(?:\s+(?:(LEFT|INNER)\s+)?JOIN\s+([a-zA-Z0-9_]+)\s+ON\s+([a-zA-Z0-9_.]+)\s*=\s*([a-zA-Z0-9_.]+))?(.*)$/i);
      if (selectMatch) {
        const fieldsRaw = selectMatch[1].trim();
        const primaryTable = selectMatch[2].trim().toLowerCase();
        const isJoined = Boolean(selectMatch[4]);
        const joinType = (selectMatch[3] || "INNER").toUpperCase();
        const joinedTable = selectMatch[4] ? selectMatch[4].trim().toLowerCase() : "";
        const joinLeft = selectMatch[5] ? selectMatch[5].trim() : "";
        const joinRight = selectMatch[6] ? selectMatch[6].trim() : "";
        const rest = selectMatch[7].trim();

        const table = database.find(t => t.name.toLowerCase() === primaryTable);
        if (!table) {
          throw new Error(`Table '${primaryTable}' does not exist in active database.`);
        }

        let combinedRows: Record<string, any>[] = [];

        if (isJoined) {
          const secondTable = database.find(t => t.name.toLowerCase() === joinedTable);
          if (!secondTable) {
            throw new Error(`Joined table '${joinedTable}' does not exist.`);
          }

          // Parse join condition columns
          const cleanCol = (colStr: string) => {
            const parts = colStr.split(".");
            return parts[parts.length - 1];
          };
          const leftCol = cleanCol(joinLeft);
          const rightCol = cleanCol(joinRight);

          table.rows.forEach(pRow => {
            const matches = secondTable.rows.filter(sRow => {
              return String(pRow[leftCol] ?? pRow[rightCol]) === String(sRow[rightCol] ?? sRow[leftCol]);
            });

            if (matches.length > 0) {
              matches.forEach(mRow => {
                combinedRows.push({ ...pRow, ...mRow });
              });
            } else if (joinType === "LEFT") {
              combinedRows.push({ ...pRow });
            }
          });
        } else {
          combinedRows = [...table.rows];
        }

        // Parse WHERE clause
        const whereMatch = rest.match(/WHERE\s+(.+?)(ORDER\s+BY|LIMIT|;|$)/i);
        if (whereMatch) {
          const condition = whereMatch[1].trim();
          combinedRows = combinedRows.filter(row => {
            return evaluateSimpleCondition(condition, row);
          });
        }

        // Parse ORDER BY
        const orderMatch = rest.match(/ORDER\s+BY\s+([a-zA-Z0-9_]+)(\s+ASC|\s+DESC)?/i);
        if (orderMatch) {
          const orderCol = orderMatch[1].trim();
          const isDesc = (orderMatch[2] || "").trim().toUpperCase() === "DESC";

          combinedRows.sort((a, b) => {
            const valA = a[orderCol];
            const valB = b[orderCol];
            if (valA === valB) return 0;
            if (valA == null) return 1;
            if (valB == null) return -1;
            return isDesc ? (valA < valB ? 1 : -1) : (valA > valB ? 1 : -1);
          });
        }

        // Parse LIMIT
        const limitMatch = rest.match(/LIMIT\s+(\d+)/i);
        if (limitMatch) {
          const limitNum = parseInt(limitMatch[1], 10);
          if (!isNaN(limitNum)) {
            combinedRows = combinedRows.slice(0, limitNum);
          }
        }

        // Determine Columns
        let finalCols: string[] = [];
        if (fieldsRaw === "*") {
          finalCols = Object.keys(combinedRows[0] || (table.columns.reduce((acc, c) => ({ ...acc, [c.name]: 1 }), {})));
        } else {
          finalCols = fieldsRaw.split(",").map(f => {
            const raw = f.trim().replace(/^[`'"]|[`'"]$/g, "");
            return raw.includes(".") ? raw.split(".").pop()! : raw;
          });
        }

        setQueryColumns(finalCols);
        setQueryRows(combinedRows);
        setExecutionTimeMs(Math.round(performance.now() - startTime));
        setAffectedMessage(`Retrieved ${combinedRows.length} rows.`);

        if (onAddLog) {
          onAddLog("sql_exec", `Executed SELECT on '${primaryTable}' -> ${combinedRows.length} rows`);
        }
        return;
      }

      // 2. INSERT INTO query
      const insertMatch = trimmed.match(/^INSERT\s+INTO\s+([a-zA-Z0-9_]+)\s*\((.+?)\)\s*VALUES\s*\((.+?)\)/i);
      if (insertMatch) {
        const tableName = insertMatch[1].trim().toLowerCase();
        const cols = insertMatch[2].split(",").map(c => c.trim().replace(/^[`'"]|[`'"]$/g, ""));
        const vals = insertMatch[3].split(",").map(v => {
          const raw = v.trim();
          if (/^['"].*['"]$/.test(raw)) return raw.slice(1, -1);
          if (!isNaN(Number(raw))) return Number(raw);
          return raw;
        });

        const table = database.find(t => t.name.toLowerCase() === tableName);
        if (!table) throw new Error(`Table '${tableName}' does not exist.`);

        const newRow: Record<string, any> = {};
        cols.forEach((col, idx) => {
          newRow[col] = vals[idx] !== undefined ? vals[idx] : null;
        });

        table.rows.push(newRow);
        setDatabase([...database]);
        setAffectedMessage(`1 row inserted into '${tableName}'.`);
        setQueryColumns(table.columns.map(c => c.name));
        setQueryRows([newRow]);
        setExecutionTimeMs(Math.round(performance.now() - startTime));
        return;
      }

      // 3. UPDATE query
      const updateMatch = trimmed.match(/^UPDATE\s+([a-zA-Z0-9_]+)\s+SET\s+(.+?)(?:\s+WHERE\s+(.+?))?(;|$)/i);
      if (updateMatch) {
        const tableName = updateMatch[1].trim().toLowerCase();
        const setClause = updateMatch[2].trim();
        const condition = updateMatch[3] ? updateMatch[3].trim() : "";

        const table = database.find(t => t.name.toLowerCase() === tableName);
        if (!table) throw new Error(`Table '${tableName}' does not exist.`);

        // Parse setters (e.g. col1 = 'val', col2 = 10)
        const assignments: { col: string; val: any }[] = [];
        const rawSets = setClause.split(",");
        for (const item of rawSets) {
          const [c, ...vParts] = item.split("=");
          if (c && vParts.length > 0) {
            const rawV = vParts.join("=").trim();
            let parsedVal: any = rawV;
            if (/^['"].*['"]$/.test(rawV)) parsedVal = rawV.slice(1, -1);
            else if (!isNaN(Number(rawV))) parsedVal = Number(rawV);
            else if (rawV.toLowerCase() === "true") parsedVal = true;
            else if (rawV.toLowerCase() === "false") parsedVal = false;
            else if (rawV.toLowerCase() === "null") parsedVal = null;
            assignments.push({ col: c.trim(), val: parsedVal });
          }
        }

        let updatedCount = 0;
        table.rows.forEach(row => {
          if (!condition || evaluateSimpleCondition(condition, row)) {
            assignments.forEach(a => {
              row[a.col] = a.val;
            });
            updatedCount++;
          }
        });

        setDatabase([...database]);
        setAffectedMessage(`Updated ${updatedCount} rows in '${tableName}'.`);
        setQueryColumns(table.columns.map(c => c.name));
        setQueryRows(table.rows);
        setExecutionTimeMs(Math.round(performance.now() - startTime));
        return;
      }

      // 4. CREATE TABLE query
      const createMatch = trimmed.match(/^CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?([a-zA-Z0-9_]+)\s*\((.+?)\)/is);
      if (createMatch) {
        const tableName = createMatch[1].trim().toLowerCase();
        if (database.some(t => t.name.toLowerCase() === tableName)) {
          throw new Error(`Table '${tableName}' already exists.`);
        }

        const colDefs = createMatch[2].split(",").map(c => c.trim()).filter(Boolean);
        const parsedCols: SqlTable["columns"] = [];

        colDefs.forEach(def => {
          const parts = def.split(/\s+/).filter(Boolean);
          if (parts.length >= 2) {
            const colName = parts[0].replace(/^[`'"]|[`'"]$/g, "");
            const rawType = parts[1].toUpperCase();
            let type: "INTEGER" | "TEXT" | "REAL" | "BOOLEAN" = "TEXT";
            if (rawType.includes("INT") || rawType.includes("SERIAL")) type = "INTEGER";
            else if (rawType.includes("REAL") || rawType.includes("FLOAT") || rawType.includes("DECIMAL") || rawType.includes("NUMERIC")) type = "REAL";
            else if (rawType.includes("BOOL")) type = "BOOLEAN";

            const isPk = def.toUpperCase().includes("PRIMARY KEY");
            parsedCols.push({ name: colName, type, isPk });
          }
        });

        const newTable: SqlTable = {
          name: tableName,
          columns: parsedCols,
          rows: []
        };

        setDatabase(prev => [...prev, newTable]);
        setAffectedMessage(`Table '${tableName}' created successfully with ${parsedCols.length} columns.`);
        setQueryColumns(parsedCols.map(c => c.name));
        setQueryRows([]);
        setExecutionTimeMs(Math.round(performance.now() - startTime));
        return;
      }

      // 5. DROP TABLE query
      const dropMatch = trimmed.match(/^DROP\s+TABLE\s+(?:IF\s+EXISTS\s+)?([a-zA-Z0-9_]+)/i);
      if (dropMatch) {
        const tableName = dropMatch[1].trim().toLowerCase();
        const exists = database.some(t => t.name.toLowerCase() === tableName);
        if (!exists) {
          throw new Error(`Table '${tableName}' does not exist.`);
        }

        setDatabase(prev => prev.filter(t => t.name.toLowerCase() !== tableName));
        setAffectedMessage(`Table '${tableName}' dropped.`);
        setQueryColumns([]);
        setQueryRows([]);
        setExecutionTimeMs(Math.round(performance.now() - startTime));
        return;
      }

      // 6. DELETE FROM query
      const deleteMatch = trimmed.match(/^DELETE\s+FROM\s+([a-zA-Z0-9_]+)(\s+WHERE\s+(.+?))?(;|$)/i);
      if (deleteMatch) {
        const tableName = deleteMatch[1].trim().toLowerCase();
        const condition = deleteMatch[3] ? deleteMatch[3].trim() : "";

        const table = database.find(t => t.name.toLowerCase() === tableName);
        if (!table) throw new Error(`Table '${tableName}' does not exist.`);

        const initialCount = table.rows.length;
        if (condition) {
          table.rows = table.rows.filter(row => !evaluateSimpleCondition(condition, row));
        } else {
          table.rows = [];
        }

        const deletedCount = initialCount - table.rows.length;
        setDatabase([...database]);
        setAffectedMessage(`${deletedCount} rows deleted from '${tableName}'.`);
        setQueryColumns([]);
        setQueryRows([]);
        setExecutionTimeMs(Math.round(performance.now() - startTime));
        return;
      }

      throw new Error("Syntax error: Currently supports SELECT (with optional JOIN), INSERT, UPDATE, DELETE, CREATE TABLE, and DROP TABLE.");
    } catch (err: any) {
      setQueryError(err?.message || "Failed to execute SQL statement.");
      setQueryColumns([]);
      setQueryRows([]);
    }
  };

  // Helper condition evaluator for WHERE expressions
  const evaluateSimpleCondition = (expr: string, row: Record<string, any>): boolean => {
    try {
      const match = expr.match(/([a-zA-Z0-9_]+)\s*(=|!=|>=|<=|>|<|LIKE)\s*(.+)/i);
      if (!match) return true;

      const col = match[1].trim();
      const op = match[2].trim().toUpperCase();
      let expectedRaw = match[3].trim().replace(/;$/, "");

      let expected: any = expectedRaw;
      if (/^['"].*['"]$/.test(expectedRaw)) {
        expected = expectedRaw.slice(1, -1);
      } else if (!isNaN(Number(expectedRaw))) {
        expected = Number(expectedRaw);
      }

      const val = row[col];

      if (op === "=") return String(val).toLowerCase() === String(expected).toLowerCase();
      if (op === "!=") return String(val).toLowerCase() !== String(expected).toLowerCase();
      if (op === ">") return Number(val) > Number(expected);
      if (op === "<") return Number(val) < Number(expected);
      if (op === ">=") return Number(val) >= Number(expected);
      if (op === "<=") return Number(val) <= Number(expected);
      if (op === "LIKE") {
        const pattern = String(expected).replace(/%/g, ".*");
        return new RegExp(`^${pattern}$`, "i").test(String(val));
      }
      return true;
    } catch {
      return true;
    }
  };

  // AI SQL Query Generator
  const generateSqlWithAi = async () => {
    if (!aiPrompt.trim()) return;
    setIsAiGenerating(true);
    setAiExplanation(null);

    const schemaSummary = database.map(t => 
      `${t.name} (${t.columns.map(c => `${c.name} ${c.type}${c.isPk ? " PK" : ""}`).join(", ")})`
    ).join("\n");

    const promptText = `You are an expert SQL engineer. Given this database schema:
${schemaSummary}

Write a standard SQL query for: "${aiPrompt.trim()}"
Return your response strictly in this format:
\`\`\`sql
YOUR_SQL_QUERY_HERE
\`\`\`
Explanation: One short sentence explaining how it works.`;

    try {
      const res = await fetchWithAuth(
        "/api/openrouter/chat",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: [
              { role: "system", content: "You generate concise, valid SQL queries matching the provided table schema." },
              { role: "user", content: promptText }
            ],
            model: selectedModel || "google/gemini-2.5-flash",
            apiKey
          })
        },
        apiKey
      );

      const data = await res.json();
      const reply = data.choices?.[0]?.message?.content || "";

      const sqlMatch = reply.match(/```(?:sql)?\s*([\s\S]+?)\s*```/i);
      if (sqlMatch) {
        const cleanQuery = sqlMatch[1].trim();
        setSqlQuery(cleanQuery);
      } else {
        setSqlQuery(reply.split("\n")[0].trim());
      }

      const explMatch = reply.match(/Explanation:\s*(.+)/i);
      if (explMatch) {
        setAiExplanation(explMatch[1].trim());
      }

      if (onAddLog) {
        onAddLog("ai_sql", `Generated SQL for: "${aiPrompt}"`);
      }
    } catch (err: any) {
      setAiExplanation("AI generation unavailable. Please write or select a query.");
    } finally {
      setIsAiGenerating(false);
    }
  };

  // Filtered Rows
  const displayedRows = useMemo(() => {
    if (!resultFilter.trim()) return queryRows;
    const term = resultFilter.toLowerCase();
    return queryRows.filter(row =>
      Object.values(row).some(v => String(v).toLowerCase().includes(term))
    );
  }, [queryRows, resultFilter]);

  // Export to CSV
  const exportToCsv = () => {
    if (queryColumns.length === 0 || queryRows.length === 0) return;
    const header = queryColumns.join(",");
    const rows = queryRows.map(r => queryColumns.map(c => `"${String(r[c] ?? "").replace(/"/g, '""')}"`).join(","));
    const csvContent = "data:text/csv;charset=utf-8," + [header, ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `sql_result_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export to JSON
  const exportToJson = () => {
    if (queryRows.length === 0) return;
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(queryRows, null, 2));
    const link = document.createElement("a");
    link.setAttribute("href", dataStr);
    link.setAttribute("download", `sql_result_${Date.now()}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Copy Query
  const copyQuery = () => {
    navigator.clipboard.writeText(sqlQuery);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className={`w-full h-full flex flex-col overflow-hidden font-sans select-none ${
      isDark ? "bg-[#0b0c10] text-zinc-200" : "bg-slate-50 text-slate-800"
    }`}>
      {/* Top Header */}
      <div className={`px-4 py-2.5 flex items-center justify-between border-b shrink-0 ${
        isDark ? "bg-[#11131a] border-zinc-800" : "bg-white border-slate-200"
      }`}>
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-gradient-to-br from-emerald-500/20 to-teal-500/20 text-emerald-400 border border-emerald-500/30">
            <Database className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <h1 className="text-xs font-bold tracking-wide flex items-center gap-2">
              SQL Studio & Relational Sandbox
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                SQLite Engine
              </span>
            </h1>
            <p className="text-[10px] text-zinc-500">Run interactive SQL queries, inspect table schemas & generate queries with AI</p>
          </div>
        </div>

        {/* Database Selector & Reset */}
        <div className="flex items-center gap-2">
          <select
            value={activeDbKey}
            onChange={(e) => handleSwitchDb(e.target.value)}
            className={`text-xs px-2.5 py-1 rounded-md border outline-none cursor-pointer ${
              isDark ? "bg-zinc-900 border-zinc-700 text-zinc-200" : "bg-slate-100 border-slate-300 text-slate-700"
            }`}
          >
            {Object.entries(allDatabases).map(([k, v]) => (
              <option key={k} value={k}>{v.label}</option>
            ))}
          </select>

          <button
            onClick={handleResetDb}
            className={`flex items-center gap-1 px-2.5 py-1 text-xs rounded-md border transition-all cursor-pointer ${
              isDark ? "bg-zinc-900/60 border-zinc-700 hover:text-white" : "bg-slate-100 border-slate-300 hover:bg-slate-200"
            }`}
            title="Reset tables to seed state"
          >
            <RotateCcw className="w-3 h-3 text-zinc-400" />
            <span className="hidden sm:inline">Reset Data</span>
          </button>
        </div>
      </div>

      {/* Main Split Layout */}
      <div className="flex-1 flex flex-col lg:flex-row min-h-0 overflow-hidden">
        {/* Left Sidebar: Schema Explorer */}
        <div className={`w-full lg:w-64 border-r flex flex-col shrink-0 overflow-hidden ${
          isDark ? "bg-[#0e1017] border-zinc-800" : "bg-slate-100/60 border-slate-200"
        }`}>
          <div className="p-3 border-b flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
              <TableIcon className="w-3.5 h-3.5 text-emerald-400" /> Tables ({database.length})
            </span>
          </div>

          <div className="flex-1 overflow-y-auto p-2 flex flex-col gap-2">
            {database.map(table => (
              <div
                key={table.name}
                className={`p-2.5 rounded-lg border transition-all ${
                  isDark ? "bg-zinc-900/40 border-zinc-800/80 hover:border-zinc-700" : "bg-white border-slate-200 hover:border-slate-300"
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <button
                    onClick={() => setSqlQuery(`SELECT * FROM ${table.name} LIMIT 20;`)}
                    className="font-mono text-xs font-bold text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
                    title="Click to generate SELECT query"
                  >
                    <span>{table.name}</span>
                  </button>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 font-mono">
                    {table.rows.length} rows
                  </span>
                </div>

                <div className="flex flex-col gap-0.5 mt-1 border-t border-zinc-800/40 pt-1">
                  {table.columns.map(col => (
                    <div key={col.name} className="flex items-center justify-between text-[11px] text-zinc-400 font-mono">
                      <span className={col.isPk ? "text-amber-400 font-bold" : ""}>
                        {col.isPk ? "🔑 " : ""}{col.name}
                      </span>
                      <span className="text-[10px] text-zinc-500">{col.type}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Quick Presets */}
          <div className="p-2 border-t border-zinc-800/80">
            <span className="text-[10px] uppercase font-bold text-zinc-400 block mb-1">Quick Queries:</span>
            <div className="flex flex-col gap-1">
              {PRESET_QUERIES.map(q => (
                <button
                  key={q.name}
                  onClick={() => setSqlQuery(q.sql)}
                  className={`text-left text-[11px] p-1.5 rounded truncate transition-all cursor-pointer ${
                    isDark ? "text-zinc-400 hover:text-white hover:bg-zinc-800" : "text-slate-600 hover:bg-slate-200"
                  }`}
                  title={q.sql}
                >
                  ⚡ {q.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Section: Query Console & Results Grid */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* AI SQL Assistant Bar */}
          <div className={`p-2.5 border-b flex items-center gap-2 ${
            isDark ? "bg-[#12141d] border-zinc-800" : "bg-white border-slate-200"
          }`}>
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
            <input
              type="text"
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && generateSqlWithAi()}
              placeholder="Ask AI to write a query (e.g. 'Customers who spent over $500 ordered by spend')..."
              className={`flex-1 px-3 py-1.5 text-xs rounded-md border outline-none ${
                isDark ? "bg-[#181a24] border-zinc-700 text-zinc-200 focus:border-amber-400" : "bg-slate-50 border-slate-300 focus:border-amber-400"
              }`}
            />
            <button
              onClick={generateSqlWithAi}
              disabled={isAiGenerating || !aiPrompt.trim()}
              className={`px-3 py-1.5 rounded-md text-xs font-bold flex items-center gap-1 text-white transition-all cursor-pointer shrink-0 ${
                isAiGenerating || !aiPrompt.trim()
                  ? "bg-zinc-600 opacity-60 cursor-not-allowed"
                  : "bg-amber-600 hover:bg-amber-500 active:scale-95"
              }`}
            >
              {isAiGenerating ? "Generating..." : "Generate SQL"}
            </button>
          </div>

          {aiExplanation && (
            <div className="px-4 py-1.5 bg-amber-500/10 border-b border-amber-500/20 text-amber-300 text-[11px] flex items-center gap-1.5">
              <span>💡 {aiExplanation}</span>
            </div>
          )}

          {/* SQL Editor Area */}
          <div className={`p-3 border-b flex flex-col gap-2 shrink-0 ${
            isDark ? "bg-[#10121a] border-zinc-800" : "bg-slate-100/40 border-slate-200"
          }`}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-zinc-400">SQL Query Console:</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={copyQuery}
                  className="flex items-center gap-1 text-[11px] text-zinc-400 hover:text-white cursor-pointer"
                  title="Copy SQL Query"
                >
                  {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{isCopied ? "Copied" : "Copy"}</span>
                </button>
                <button
                  onClick={executeQuery}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/30 transition-all cursor-pointer active:scale-95"
                  title="Shortcut: Ctrl+Enter"
                >
                  <Play className="w-3.5 h-3.5 fill-current" /> Run Query
                </button>
              </div>
            </div>

            <textarea
              value={sqlQuery}
              onChange={(e) => setSqlQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
                  e.preventDefault();
                  executeQuery();
                }
              }}
              rows={3}
              placeholder="Enter SQL statement (e.g. SELECT * FROM customers WHERE ...)"
              className={`w-full p-2.5 font-mono text-xs rounded-lg border outline-none resize-y leading-relaxed ${
                isDark
                  ? "bg-[#161822] border-zinc-700 text-emerald-300 focus:border-emerald-500"
                  : "bg-white border-slate-300 text-slate-800 focus:border-emerald-500"
              }`}
            />
          </div>

          {/* Execution Status Bar */}
          <div className={`px-4 py-2 border-b shrink-0 flex items-center justify-between ${
            isDark ? "bg-[#13151f] border-zinc-800" : "bg-white border-slate-200"
          }`}>
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">Query Results</span>

              {executionTimeMs !== null && (
                <span className="flex items-center gap-1 text-[11px] font-mono text-zinc-400">
                  <Clock className="w-3 h-3 text-zinc-500" /> {executionTimeMs}ms
                </span>
              )}

              {affectedMessage && (
                <span className="text-[11px] text-emerald-400 font-medium">
                  {affectedMessage}
                </span>
              )}
            </div>

            {/* Filter and Export buttons */}
            <div className="flex items-center gap-2">
              {queryRows.length > 0 && (
                <>
                  <div className="relative">
                    <Search className="w-3 h-3 absolute left-2 top-2 text-zinc-500" />
                    <input
                      type="text"
                      value={resultFilter}
                      onChange={(e) => setResultFilter(e.target.value)}
                      placeholder="Filter results..."
                      className={`text-xs pl-7 pr-2 py-1 rounded border outline-none ${
                        isDark ? "bg-zinc-900 border-zinc-700 text-zinc-200" : "bg-slate-100 border-slate-300"
                      }`}
                    />
                  </div>

                  <button
                    onClick={exportToCsv}
                    className="flex items-center gap-1 px-2 py-1 text-[11px] font-medium rounded border border-zinc-700 hover:text-white cursor-pointer"
                    title="Export to CSV"
                  >
                    <Download className="w-3 h-3" /> CSV
                  </button>

                  <button
                    onClick={exportToJson}
                    className="flex items-center gap-1 px-2 py-1 text-[11px] font-medium rounded border border-zinc-700 hover:text-white cursor-pointer"
                    title="Export to JSON"
                  >
                    <Download className="w-3 h-3" /> JSON
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Results Table View */}
          <div className="flex-1 p-3 overflow-auto">
            {queryError ? (
              <div className="p-4 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
                <div>
                  <div className="font-bold mb-1">SQL Execution Error</div>
                  <div className="font-mono text-[11px]">{queryError}</div>
                </div>
              </div>
            ) : queryColumns.length > 0 ? (
              <div className="border border-zinc-800 rounded-lg overflow-hidden">
                <table className="w-full text-left font-mono text-xs border-collapse">
                  <thead>
                    <tr className={isDark ? "bg-zinc-900 text-zinc-300" : "bg-slate-200 text-slate-800"}>
                      <th className="p-2 border-b border-r border-zinc-800 w-12 text-center text-zinc-500">#</th>
                      {queryColumns.map(col => (
                        <th key={col} className="p-2 border-b border-r border-zinc-800 font-bold">
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {displayedRows.map((row, idx) => (
                      <tr
                        key={idx}
                        className={`transition-colors ${
                          idx % 2 === 0
                            ? (isDark ? "bg-[#11131a]" : "bg-white")
                            : (isDark ? "bg-[#141620]" : "bg-slate-50")
                        } hover:bg-emerald-500/10`}
                      >
                        <td className="p-2 border-b border-r border-zinc-800/60 text-center text-zinc-500 text-[10px]">
                          {idx + 1}
                        </td>
                        {queryColumns.map(col => (
                          <td key={col} className="p-2 border-b border-r border-zinc-800/60 select-text truncate max-w-xs">
                            {row[col] !== undefined && row[col] !== null ? String(row[col]) : <span className="text-zinc-600 italic">null</span>}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center gap-2 text-zinc-500">
                <Database className="w-8 h-8 text-zinc-600" />
                <p className="text-xs">No query executed yet. Enter an SQL command and click "Run Query" (or Ctrl+Enter).</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RelationalSqlStudioAgent;
