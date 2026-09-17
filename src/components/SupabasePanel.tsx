import React, { useState, useEffect } from "react";
import { 
  Database, Key, Check, AlertCircle, RefreshCw, Table, UploadCloud, ShieldCheck, Plus, HardDrive 
} from "lucide-react";
import { createClient } from "@supabase/supabase-js";
import { SupabaseConfig, VirtualFile } from "../types";

interface SupabasePanelProps {
  files: VirtualFile[];
  theme: "light" | "dark";
  onAddLog: (type: any, msg: string) => void;
}

export const SupabasePanel: React.FC<SupabasePanelProps> = ({
  files,
  theme,
  onAddLog
}) => {
  const [config, setConfig] = useState<SupabaseConfig>(() => {
    const saved = localStorage.getItem("supabase_config");
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    return { url: "", anonKey: "", isConnected: false };
  });

  const [isTesting, setIsTesting] = useState<boolean>(false);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [statusMsg, setStatusMsg] = useState<{ type: "success" | "error" | "info"; text: string } | null>(null);
  const [tableData, setTableData] = useState<any[]>([]);
  const [tableName, setTableName] = useState<string>("workspace_files");

  const saveConfig = (newCfg: SupabaseConfig) => {
    setConfig(newCfg);
    localStorage.setItem("supabase_config", JSON.stringify(newCfg));
  };

  // Test Supabase Connection using @supabase/supabase-js
  const handleTestConnection = async () => {
    if (!config.url.trim() || !config.anonKey.trim()) {
      setStatusMsg({ type: "error", text: "Both Supabase URL and Anon Key are required." });
      return;
    }

    setIsTesting(true);
    setStatusMsg({ type: "info", text: "Connecting to Supabase Cloud database..." });

    try {
      const supabase = createClient(config.url, config.anonKey);
      // Attempt a lightweight ping query
      const { data, error } = await supabase.from(tableName).select("count", { count: "exact", head: true });

      if (error && !error.message.includes("relation") && !error.message.includes("does not exist")) {
        throw error;
      }

      saveConfig({ ...config, isConnected: true });
      setStatusMsg({ type: "success", text: "Successfully connected to Supabase Cloud Postgres database!" });
      onAddLog("info", "Connected to Supabase Cloud Database");

    } catch (err: any) {
      saveConfig({ ...config, isConnected: false });
      setStatusMsg({ type: "error", text: `Supabase Connection Failed: ${err.message}` });
    } finally {
      setIsTesting(false);
    }
  };

  // Sync workspace files to Supabase
  const handleSyncToSupabase = async () => {
    if (!config.url || !config.anonKey) {
      setStatusMsg({ type: "error", text: "Please configure Supabase URL and Anon Key first." });
      return;
    }

    setIsSyncing(true);
    setStatusMsg({ type: "info", text: `Uploading ${files.length} workspace files to Supabase table '${tableName}'...` });

    try {
      const supabase = createClient(config.url, config.anonKey);

      const records = files.map(f => ({
        path: f.path,
        content: f.content,
        updated_at: new Date().toISOString()
      }));

      const { data, error } = await supabase.from(tableName).upsert(records, { onConflict: "path" });

      if (error) {
        throw error;
      }

      setStatusMsg({ type: "success", text: `Synced ${files.length} workspace files to Supabase table '${tableName}'!` });
      onAddLog("info", `Synced ${files.length} workspace files to Supabase table '${tableName}'`);

    } catch (err: any) {
      setStatusMsg({ type: "error", text: `Sync failed: ${err.message}. Ensure table '${tableName}' exists in Supabase schema.` });
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className={`h-full w-full flex-1 flex flex-col overflow-y-auto p-6 ${theme === "dark" ? "bg-[#121214] text-zinc-100" : "bg-slate-50 text-slate-800"}`}>
      
      {/* HEADER */}
      <div className="flex items-center gap-3 mb-6 shrink-0">
        <div className="p-2.5 bg-emerald-600 text-white rounded-xl shadow-md">
          <Database className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-base font-bold flex items-center gap-2">
            Supabase Cloud Database Integration
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono border ${
              config.isConnected 
                ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-200" 
                : "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300 border-amber-200"
            }`}>
              {config.isConnected ? "Connected" : "Not Connected"}
            </span>
          </h2>
          <p className="text-xs text-slate-400">Connect your Supabase project to persist workspace snapshots, user data, and agent states</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 w-full min-h-0">
        
        {/* LEFT 6 COLS: CREDENTIALS */}
        <div className={`lg:col-span-6 col-span-12 p-5 rounded-2xl border space-y-4 shadow-xs ${
          theme === "dark" ? "bg-zinc-900 border-zinc-800" : "bg-white border-slate-200"
        }`}>
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Key className="w-4 h-4 text-emerald-500" /> Supabase Connection Keys
          </h3>

          <div>
            <label className="text-[11px] font-semibold text-slate-500 mb-1 block">Supabase Project URL</label>
            <input
              type="text"
              value={config.url}
              onChange={(e) => saveConfig({ ...config, url: e.target.value })}
              placeholder="https://xyzcompany.supabase.co"
              className="w-full bg-slate-100 dark:bg-zinc-800 text-slate-800 dark:text-zinc-200 border border-slate-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-xs font-mono focus:outline-none"
            />
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-500 mb-1 block">Supabase Anon Key</label>
            <input
              type="password"
              value={config.anonKey}
              onChange={(e) => saveConfig({ ...config, anonKey: e.target.value })}
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
              className="w-full bg-slate-100 dark:bg-zinc-800 text-slate-800 dark:text-zinc-200 border border-slate-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-xs font-mono focus:outline-none"
            />
          </div>

          <button
            onClick={handleTestConnection}
            disabled={isTesting}
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 shadow-md"
          >
            {isTesting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
            Test Supabase Connection
          </button>
        </div>

        {/* RIGHT 6 COLS: DATABASE PERSISTENCE */}
        <div className={`lg:col-span-6 col-span-12 p-5 rounded-2xl border space-y-4 shadow-xs flex flex-col ${
          theme === "dark" ? "bg-zinc-900 border-zinc-800" : "bg-white border-slate-200"
        }`}>
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Table className="w-4 h-4 text-emerald-500" /> Sync Workspace Data
          </h3>

          <div>
            <label className="text-[11px] font-semibold text-slate-500 mb-1 block">Database Table Name</label>
            <input
              type="text"
              value={tableName}
              onChange={(e) => setTableName(e.target.value)}
              placeholder="workspace_files"
              className="w-full bg-slate-100 dark:bg-zinc-800 text-slate-800 dark:text-zinc-200 border border-slate-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-xs font-mono focus:outline-none"
            />
          </div>

          <button
            onClick={handleSyncToSupabase}
            disabled={isSyncing}
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-3 rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer flex items-center justify-center gap-2"
          >
            {isSyncing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <UploadCloud className="w-4 h-4" />}
            Sync Workspace Files ({files.length}) to Supabase
          </button>

          {statusMsg && (
            <div className={`p-3 rounded-xl text-xs border ${
              statusMsg.type === "success" 
                ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 text-emerald-700 dark:text-emerald-300" 
                : statusMsg.type === "error"
                ? "bg-rose-50 dark:bg-rose-950/40 border-rose-200 text-rose-700 dark:text-rose-300"
                : "bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200 text-indigo-700 dark:text-indigo-300"
            }`}>
              {statusMsg.text}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
