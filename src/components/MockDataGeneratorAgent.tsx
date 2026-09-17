import React, { useState } from "react";
import {
  Users,
  Code2,
  Copy,
  Check,
  RefreshCw,
  Sparkles,
  Database,
  FileCode,
  Layers,
  Bot,
  Zap,
  Download
} from "lucide-react";

interface MockDataGeneratorAgentProps {
  apiKey?: string;
  selectedModel?: string;
  theme: "light" | "dark";
  onAddLog?: (type: string, msg: string) => void;
}

export const MockDataGeneratorAgent: React.FC<MockDataGeneratorAgentProps> = ({
  apiKey,
  selectedModel = "google/gemini-2.5-flash",
  theme,
  onAddLog
}) => {
  const [dataCount, setDataCount] = useState<number>(5);
  const [generatedUsers, setGeneratedUsers] = useState<any[]>([]);
  const [jsonPayload, setJsonPayload] = useState<string>("");
  const [sqlPayload, setSqlPayload] = useState<string>("");
  const [tsInterface, setTsInterface] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [copiedType, setCopiedType] = useState<string>("");

  React.useEffect(() => {
    handleFetchRandomUsers();
  }, []);

  const handleFetchRandomUsers = async () => {
    setIsLoading(true);
    if (onAddLog) onAddLog("agent", `Generating ${dataCount} realistic user personas & API schemas from RandomUser API...`);

    try {
      const res = await fetch(`https://randomuser.me/api/?results=${dataCount}`);
      let results: any[] = [];
      if (res.ok) {
        const data = await res.json();
        results = data.results || [];
      }
      
      if (!results.length) {
        // High quality fallback user mock dataset
        results = [
          { name: { first: "Sarah", last: "Connor" }, email: "sarah.connor@example.com", login: { uuid: "u-101", username: "sarahc" }, location: { country: "United States", city: "Los Angeles" }, picture: { medium: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150" } },
          { name: { first: "David", last: "Kim" }, email: "david.kim@example.com", login: { uuid: "u-102", username: "dkim" }, location: { country: "Canada", city: "Vancouver" }, picture: { medium: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150" } },
          { name: { first: "Elena", last: "Rostova" }, email: "elena.r@example.com", login: { uuid: "u-103", username: "elenar" }, location: { country: "Germany", city: "Berlin" }, picture: { medium: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150" } }
        ];
      }
      
      setGeneratedUsers(results);

      // Map into clean developer object
      const cleanUsers = results.map((u: any, index: number) => ({
        id: index + 1,
        uuid: u.login.uuid,
        name: `${u.name.first} ${u.name.last}`,
        email: u.email,
        username: u.login.username,
        role: index % 2 === 0 ? "Developer" : "Product Manager",
        country: u.location.country,
        city: u.location.city,
        avatar: u.picture.medium
      }));

      setJsonPayload(JSON.stringify(cleanUsers, null, 2));

      // Generate SQL Inserts
      const sql = `INSERT INTO users (id, uuid, full_name, email, role, country)\nVALUES\n` +
        cleanUsers.map((u: any) => `  ('${u.id}', '${u.uuid}', '${u.name.replace("'", "''")}', '${u.email}', '${u.role}', '${u.country}')`).join(",\n") + ";";
      setSqlPayload(sql);

      // Generate TypeScript Interface
      const ts = `export interface UserProfile {\n  id: number;\n  uuid: string;\n  name: string;\n  email: string;\n  username: string;\n  role: 'Developer' | 'Product Manager' | 'Designer';\n  country: string;\n  city: string;\n  avatar: string;\n}`;
      setTsInterface(ts);

      if (onAddLog) onAddLog("success", `Generated ${results.length} developer test profiles & SQL/TS payloads!`);
    } catch (e) {
      if (onAddLog) onAddLog("error", "Failed to fetch random users.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    setTimeout(() => setCopiedType(""), 2000);
  };

  return (
    <div className={`w-full min-h-full flex flex-col p-4 md:p-6 transition-colors duration-200 ${
      theme === "dark" ? "bg-zinc-950 text-white" : "bg-slate-50 text-slate-900"
    }`}>
      {/* Banner Header */}
      <div className={`p-5 rounded-2xl border mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm ${
        theme === "dark" ? "bg-gradient-to-r from-zinc-900 via-rose-950/40 to-zinc-900 border-zinc-800" : "bg-white border-slate-200"
      }`}>
        <div className="flex items-center gap-3.5">
          <div className="p-3 rounded-2xl bg-gradient-to-br from-rose-500 to-pink-600 text-white shadow-md">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight">Mock API Data & User Persona Generator Agent</h1>
              <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-rose-500/15 text-rose-400 border border-rose-500/30">
                Live RandomUser REST API
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Generate realistic user profiles, JSON API mocks, SQL database seeds, & TypeScript types instantly!
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={dataCount}
            onChange={(e) => setDataCount(Number(e.target.value))}
            className={`px-3 py-2 rounded-2xl text-xs font-bold border outline-none ${
              theme === "dark" ? "bg-zinc-950 border-zinc-800 text-white" : "bg-slate-50 border-slate-200"
            }`}
          >
            <option value={3}>3 Users</option>
            <option value={5}>5 Users</option>
            <option value={10}>10 Users</option>
          </select>

          <button
            onClick={handleFetchRandomUsers}
            disabled={isLoading}
            className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-400 text-white font-extrabold text-xs flex items-center gap-2 shadow-lg shadow-rose-500/20 cursor-pointer disabled:opacity-50 shrink-0"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
            Generate Payload
          </button>
        </div>
      </div>

      {generatedUsers.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* User Cards (5 cols) */}
          <div className="lg:col-span-5 flex flex-col gap-3">
            <div className={`p-4 rounded-2xl border space-y-3 ${
              theme === "dark" ? "bg-zinc-900 border-zinc-800" : "bg-white border-slate-200"
            }`}>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Generated Personas ({generatedUsers.length})
              </h3>

              <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1">
                {generatedUsers.map((u, i) => (
                  <div key={i} className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center gap-3">
                    <img src={u.picture.medium} alt="Avatar" className="w-10 h-10 rounded-full border border-zinc-700" />
                    <div>
                      <h4 className="text-xs font-bold text-white">{u.name.first} {u.name.last}</h4>
                      <p className="text-[11px] text-slate-400 font-mono">{u.email}</p>
                      <span className="text-[10px] text-rose-400 font-semibold">{u.location.city}, {u.location.country}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* JSON / SQL / TS Code Exports (7 cols) */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            <div className={`p-5 rounded-2xl border space-y-4 shadow-sm ${
              theme === "dark" ? "bg-zinc-900 border-zinc-800" : "bg-white border-slate-200"
            }`}>
              {/* JSON Payload Export */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-400 uppercase flex items-center gap-1.5">
                    <Code2 className="w-3.5 h-3.5 text-rose-400" /> JSON Mock Payload
                  </h4>
                  <button
                    onClick={() => handleCopy(jsonPayload, "json")}
                    className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-bold text-slate-300 flex items-center gap-1 cursor-pointer"
                  >
                    {copiedType === "json" ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    {copiedType === "json" ? "Copied" : "Copy JSON"}
                  </button>
                </div>
                <pre className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 text-[11px] font-mono text-emerald-400 overflow-x-auto max-h-40">
                  {jsonPayload}
                </pre>
              </div>

              {/* SQL Payload Export */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-400 uppercase flex items-center gap-1.5">
                    <Database className="w-3.5 h-3.5 text-rose-400" /> SQL Seed Statement
                  </h4>
                  <button
                    onClick={() => handleCopy(sqlPayload, "sql")}
                    className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-bold text-slate-300 flex items-center gap-1 cursor-pointer"
                  >
                    {copiedType === "sql" ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    {copiedType === "sql" ? "Copied" : "Copy SQL"}
                  </button>
                </div>
                <pre className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 text-[11px] font-mono text-sky-400 overflow-x-auto max-h-32">
                  {sqlPayload}
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
