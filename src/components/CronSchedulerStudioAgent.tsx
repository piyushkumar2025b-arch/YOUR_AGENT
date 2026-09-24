import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  Clock,
  Play,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  Save,
  Plus,
  Trash2,
  Code,
  Calendar,
  Sparkles,
  Sliders,
  Activity,
  Terminal,
  RefreshCw,
  Zap,
  Tag,
  Layers,
  ChevronRight,
  Flame,
  FileCode
} from "lucide-react";

export interface CronSchedulerStudioAgentProps {
  theme: "light" | "dark";
  onSaveFile?: (path: string, content: string) => void;
  onAddLog?: (type: string, msg: string) => void;
}

export interface ScheduledTask {
  id: string;
  name: string;
  cronExpr: string;
  description: string;
  handlerName: string;
  status: "idle" | "running" | "success" | "failed";
  lastRunAt?: number;
  durationMs?: number;
  runCount: number;
}

const DEFAULT_TASKS: ScheduledTask[] = [
  {
    id: "task-1",
    name: "Database Snapshot Backup",
    cronExpr: "0 2 * * *",
    description: "Generates compressed PostgreSQL WAL archive & uploads to secure cloud bucket",
    handlerName: "executeDatabaseBackup",
    status: "idle",
    runCount: 14,
    lastRunAt: Date.now() - 3600000 * 5,
    durationMs: 420
  },
  {
    id: "task-2",
    name: "Session Cache & Token Purge",
    cronExpr: "*/15 * * * *",
    description: "Clears expired OAuth tokens, unverified signups and stale Redis sessions",
    handlerName: "purgeExpiredSessions",
    status: "idle",
    runCount: 88,
    lastRunAt: Date.now() - 60000 * 8,
    durationMs: 110
  },
  {
    id: "task-3",
    name: "Stripe Billing & Invoice Sync",
    cronExpr: "0 * * * *",
    description: "Reconciles subscription tiers, metered usage limits and webhook retries",
    handlerName: "reconcileStripeBilling",
    status: "idle",
    runCount: 24,
    lastRunAt: Date.now() - 3600000,
    durationMs: 680
  },
  {
    id: "task-4",
    name: "Security Vulnerability AST Audit",
    cronExpr: "0 0 * * 0",
    description: "Scans project packages for known CVEs and outdated transitive dependencies",
    handlerName: "runSecurityScan",
    status: "idle",
    runCount: 3,
    lastRunAt: Date.now() - 3600000 * 24 * 3,
    durationMs: 1450
  }
];

const PRESETS = [
  { label: "Every minute", expr: "* * * * *", desc: "Runs at the start of every minute" },
  { label: "Every 5 minutes", expr: "*/5 * * * *", desc: "Runs every 5 minutes (:00, :05, :10...)" },
  { label: "Every 15 minutes", expr: "*/15 * * * *", desc: "Runs every 15 minutes (:00, :15, :30, :45)" },
  { label: "Hourly (:00)", expr: "0 * * * *", desc: "Runs at minute 0 of every hour" },
  { label: "Daily at midnight", expr: "0 0 * * *", desc: "Runs every day at 00:00 UTC" },
  { label: "Daily at 9:00 AM", expr: "0 9 * * *", desc: "Runs every morning at 09:00 UTC" },
  { label: "Weekly on Sunday", expr: "0 0 * * 0", desc: "Runs every Sunday at midnight" },
  { label: "Monthly on 1st", expr: "0 0 1 * *", desc: "Runs at 00:00 on day 1 of every month" },
  { label: "Weekdays at 6:00 PM", expr: "0 18 * * 1-5", desc: "Runs Mon-Fri at 18:00 UTC" }
];

// Helper to translate cron expression to human English
function translateCronToEnglish(cron: string): string {
  const parts = cron.trim().split(/\s+/);
  if (parts.length !== 5) return "Invalid cron format (must be 5 segments)";

  const [min, hour, dom, mon, dow] = parts;

  if (cron === "* * * * *") return "Every minute, every hour, every day";
  if (cron === "*/5 * * * *") return "Every 5 minutes";
  if (cron === "*/15 * * * *") return "Every 15 minutes";
  if (cron === "0 * * * *") return "At the start of every hour (minute 0)";
  if (cron === "0 0 * * *") return "At midnight (00:00) every day";
  if (cron === "0 0 1 * *") return "At 00:00 on the 1st day of every month";
  if (cron === "0 0 * * 0") return "At 00:00 every Sunday";

  let desc = "At ";
  if (min === "*") desc += "every minute";
  else if (min.startsWith("*/")) desc += `every ${min.replace("*/", "")} minutes`;
  else desc += `minute ${min}`;

  if (hour !== "*") {
    if (hour.startsWith("*/")) desc += ` of every ${hour.replace("*/", "")} hours`;
    else desc += ` of hour ${hour.padStart(2, "0")}:00`;
  }

  if (dom !== "*") desc += ` on day-of-month ${dom}`;
  if (mon !== "*") desc += ` in month ${mon}`;
  if (dow !== "*") {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    if (dow === "1-5") desc += ` (Monday through Friday)`;
    else if (dow === "0" || dow === "7") desc += ` on Sunday`;
    else {
      const dayNum = parseInt(dow, 10);
      if (!isNaN(dayNum) && days[dayNum]) desc += ` on ${days[dayNum]}`;
      else desc += ` on day-of-week ${dow}`;
    }
  }

  return desc;
}

// Compute next 5 forecast trigger dates
function calculateNextRuns(cron: string, count: number = 5): Date[] {
  const dates: Date[] = [];
  const parts = cron.trim().split(/\s+/);
  if (parts.length !== 5) return dates;

  const now = new Date();
  let candidate = new Date(now.getTime() + 60000);
  candidate.setSeconds(0, 0);

  // Simplified next-date finder
  for (let i = 0; i < 2000 && dates.length < count; i++) {
    const min = candidate.getMinutes();
    const hour = candidate.getHours();
    const dom = candidate.getDate();
    const mon = candidate.getMonth() + 1;
    const dow = candidate.getDay();

    const matchMin = parts[0] === "*" || (parts[0].startsWith("*/") && min % parseInt(parts[0].replace("*/", ""), 10) === 0) || parts[0] === String(min);
    const matchHour = parts[1] === "*" || (parts[1].startsWith("*/") && hour % parseInt(parts[1].replace("*/", ""), 10) === 0) || parts[1] === String(hour);
    const matchDom = parts[2] === "*" || parts[2] === String(dom);
    const matchMon = parts[3] === "*" || parts[3] === String(mon);
    const matchDow = parts[4] === "*" || parts[4] === String(dow) || (parts[4] === "1-5" && dow >= 1 && dow <= 5);

    if (matchMin && matchHour && matchDom && matchMon && matchDow) {
      dates.push(new Date(candidate.getTime()));
    }
    candidate = new Date(candidate.getTime() + 60000);
  }

  return dates;
}

export const CronSchedulerStudioAgent: React.FC<CronSchedulerStudioAgentProps> = ({
  theme,
  onSaveFile,
  onAddLog
}) => {
  const [tasks, setTasks] = useState<ScheduledTask[]>(DEFAULT_TASKS);
  const [selectedTaskId, setSelectedTaskId] = useState<string>("task-1");
  const [activeTab, setActiveTab] = useState<"builder" | "tasks" | "code" | "logs">("builder");

  // Current active cron expression being tested/built
  const [cronInput, setCronInput] = useState<string>("0 2 * * *");
  const [humanTranslation, setHumanTranslation] = useState<string>("At 02:00 every day");

  // Segments builder
  const [minuteSeg, setMinuteSeg] = useState<string>("0");
  const [hourSeg, setHourSeg] = useState<string>("2");
  const [domSeg, setDomSeg] = useState<string>("*");
  const [monthSeg, setMonthSeg] = useState<string>("*");
  const [dowSeg, setDowSeg] = useState<string>("*");

  // Logs stream
  const [executionLogs, setExecutionLogs] = useState<{ id: string; time: string; taskName: string; status: "success" | "failed"; durationMs: number; message: string }[]>([
    {
      id: "l-1",
      time: new Date(Date.now() - 3600000).toLocaleTimeString(),
      taskName: "Database Snapshot Backup",
      status: "success",
      durationMs: 420,
      message: "Created WAL dump backup-2026-09.tar.gz (48.2 MB)"
    },
    {
      id: "l-2",
      time: new Date(Date.now() - 1800000).toLocaleTimeString(),
      taskName: "Session Cache & Token Purge",
      status: "success",
      durationMs: 95,
      message: "Purged 34 expired redis tokens"
    }
  ]);

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState<boolean>(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  // Sync cron segments
  const updateCronFromSegments = (min: string, hr: string, dom: string, mon: string, dow: string) => {
    const expr = `${min} ${hr} ${dom} ${mon} ${dow}`;
    setCronInput(expr);
    setHumanTranslation(translateCronToEnglish(expr));
  };

  // When selected task changes
  useEffect(() => {
    const task = tasks.find(t => t.id === selectedTaskId);
    if (task) {
      setCronInput(task.cronExpr);
      setHumanTranslation(translateCronToEnglish(task.cronExpr));
      const parts = task.cronExpr.split(/\s+/);
      if (parts.length === 5) {
        setMinuteSeg(parts[0]);
        setHourSeg(parts[1]);
        setDomSeg(parts[2]);
        setMonthSeg(parts[3]);
        setDowSeg(parts[4]);
      }
    }
  }, [selectedTaskId]);

  // Compute forecast
  const nextRuns = useMemo(() => {
    return calculateNextRuns(cronInput, 6);
  }, [cronInput]);

  // Execute Simulated Task Run
  const handleRunTaskNow = (task: ScheduledTask) => {
    setTasks(prev => prev.map(t => (t.id === task.id ? { ...t, status: "running" } : t)));
    showToast(`⚡ Triggered task "${task.name}"...`);

    const startTime = performance.now();
    setTimeout(() => {
      const durationMs = Math.round(performance.now() - startTime + 80 + Math.random() * 180);
      setTasks(prev =>
        prev.map(t =>
          t.id === task.id
            ? { ...t, status: "success", lastRunAt: Date.now(), durationMs, runCount: t.runCount + 1 }
            : t
        )
      );

      setExecutionLogs(prev => [
        {
          id: `log-${Date.now()}`,
          time: new Date().toLocaleTimeString(),
          taskName: task.name,
          status: "success",
          durationMs,
          message: `Executed handler ${task.handlerName}() with exit code 0`
        },
        ...prev
      ]);

      showToast(`Completed "${task.name}" in ${durationMs}ms`);
      if (onAddLog) onAddLog("execute", `Cron task ${task.name} executed successfully (${durationMs}ms).`);
    }, 400);
  };

  // Generated Node.js node-cron code
  const generatedNodeCronCode = useMemo(() => {
    const lines: string[] = [
      `/**`,
      ` * Production Background Cron Scheduler (node-cron)`,
      ` * Generated by Remix Studio Cron Architect`,
      ` */`,
      `import cron from "node-cron";`,
      ``,
      `export interface CronJobHandle {`,
      `  name: string;`,
      `  cronExpr: string;`,
      `  stop: () => void;`,
      `}`,
      ``,
      `export function initBackgroundCronJobs(): CronJobHandle[] {`,
      `  console.log("🕒 Initializing Background Cron Task Scheduler...");`,
      `  const jobs: CronJobHandle[] = [];`,
      ``
    ];

    tasks.forEach(t => {
      lines.push(`  // Task: ${t.name}`);
      lines.push(`  // Schedule: ${t.cronExpr} (${translateCronToEnglish(t.cronExpr)})`);
      lines.push(`  const job_${t.id.replace(/-/g, "_")} = cron.schedule("${t.cronExpr}", async () => {`);
      lines.push(`    const startTime = performance.now();`);
      lines.push(`    console.log(\`[CRON] Starting job: ${t.name}\`);`);
      lines.push(`    try {`);
      lines.push(`      await ${t.handlerName}();`);
      lines.push(`      const duration = Math.round(performance.now() - startTime);`);
      lines.push(`      console.log(\`[CRON] Completed: ${t.name} in \${duration}ms\`);`);
      lines.push(`    } catch (err: any) {`);
      lines.push(`      console.error(\`[CRON] Error in ${t.name}:\`, err.message);`);
      lines.push(`    }`);
      lines.push(`  });`);
      lines.push(`  jobs.push({ name: "${t.name}", cronExpr: "${t.cronExpr}", stop: () => job_${t.id.replace(/-/g, "_")}.stop() });`);
      lines.push(``);
    });

    lines.push(`  return jobs;`);
    lines.push(`}`);
    lines.push(``);

    // Handlers
    tasks.forEach(t => {
      lines.push(`async function ${t.handlerName}(): Promise<void> {`);
      lines.push(`  // ${t.description}`);
      lines.push(`  console.log("Executing ${t.handlerName}...");`);
      lines.push(`}`);
      lines.push(``);
    });

    return lines.join("\n");
  }, [tasks]);

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
        <div className="absolute top-4 right-6 z-50 px-4 py-2 bg-amber-600 text-white text-xs font-semibold rounded-lg shadow-xl border border-amber-400/40 flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-200">
          <CheckCircle2 className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Bar */}
      <div className={`px-5 py-3 border-b flex flex-wrap items-center justify-between gap-4 ${theme === "dark" ? "bg-slate-900/90 border-slate-800" : "bg-white border-slate-200"}`}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/20 text-white">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold tracking-tight">Cron & Task Scheduler Studio</h1>
              <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
                Scheduler Engine
              </span>
              <span className="text-xs text-slate-400">({tasks.length} Active Jobs)</span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              Interactive cron expression architect, natural English translator, schedule forecaster & runner sandbox
            </p>
          </div>
        </div>

        {/* Global Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          {onSaveFile && (
            <button
              onClick={() => {
                onSaveFile("src/services/cronScheduler.ts", generatedNodeCronCode);
                showToast("Saved cronScheduler.ts to workspace!");
                if (onAddLog) onAddLog("create", "Saved src/services/cronScheduler.ts with node-cron tasks.");
              }}
              className="px-3 py-1.5 text-xs font-medium rounded-lg bg-amber-600 hover:bg-amber-500 text-white flex items-center gap-1.5 shadow-md shadow-amber-600/20 transition-all"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Scheduler to Project</span>
            </button>
          )}

          <button
            onClick={() => handleCopy(generatedNodeCronCode, "Cron Code")}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg border flex items-center gap-1.5 transition-all ${
              theme === "dark" ? "bg-slate-800 border-slate-700 hover:bg-slate-700 text-slate-200" : "bg-white border-slate-300 hover:bg-slate-100 text-slate-800"
            }`}
          >
            {isCopied ? <Check className="w-3.5 h-3.5 text-amber-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>Copy Code</span>
          </button>
        </div>
      </div>

      {/* Sub-header Navigation Tabs */}
      <div className={`px-5 py-2 border-b flex items-center justify-between gap-4 text-xs ${theme === "dark" ? "bg-slate-900/50 border-slate-800" : "bg-slate-100/70 border-slate-200"}`}>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setActiveTab("builder")}
            className={`px-3 py-1.5 rounded-md font-medium flex items-center gap-1.5 transition-colors ${
              activeTab === "builder"
                ? theme === "dark" ? "bg-slate-800 text-white shadow-sm" : "bg-white text-slate-900 shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Sliders className="w-3.5 h-3.5 text-amber-400" />
            <span>Cron Expression Builder</span>
          </button>
          <button
            onClick={() => setActiveTab("tasks")}
            className={`px-3 py-1.5 rounded-md font-medium flex items-center gap-1.5 transition-colors ${
              activeTab === "tasks"
                ? theme === "dark" ? "bg-slate-800 text-white shadow-sm" : "bg-white text-slate-900 shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-cyan-400" />
            <span>Task Sandbox ({tasks.length})</span>
          </button>
          <button
            onClick={() => setActiveTab("code")}
            className={`px-3 py-1.5 rounded-md font-medium flex items-center gap-1.5 transition-colors ${
              activeTab === "code"
                ? theme === "dark" ? "bg-slate-800 text-white shadow-sm" : "bg-white text-slate-900 shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Code className="w-3.5 h-3.5 text-emerald-400" />
            <span>TypeScript Worker</span>
          </button>
          <button
            onClick={() => setActiveTab("logs")}
            className={`px-3 py-1.5 rounded-md font-medium flex items-center gap-1.5 transition-colors ${
              activeTab === "logs"
                ? theme === "dark" ? "bg-slate-800 text-white shadow-sm" : "bg-white text-slate-900 shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Terminal className="w-3.5 h-3.5 text-purple-400" />
            <span>Execution Logs ({executionLogs.length})</span>
          </button>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-xs">
          <span className="text-slate-400">Current Expression:</span>
          <span className="font-mono font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
            {cronInput}
          </span>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* VIEW 1: VISUAL CRON BUILDER */}
        {activeTab === "builder" && (
          <div className="flex-1 flex flex-col md:flex-row h-full overflow-hidden">
            {/* Left Column: Preset Palettes */}
            <div className={`w-full md:w-80 lg:w-96 flex flex-col border-r h-full overflow-y-auto p-4 space-y-4 shrink-0 ${theme === "dark" ? "bg-slate-900/40 border-slate-800" : "bg-slate-50 border-slate-200"}`}>
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  Common Schedule Presets
                </h3>
                <div className="space-y-1.5">
                  {PRESETS.map(p => (
                    <button
                      key={p.expr}
                      onClick={() => {
                        setCronInput(p.expr);
                        setHumanTranslation(p.desc);
                        const parts = p.expr.split(/\s+/);
                        setMinuteSeg(parts[0]);
                        setHourSeg(parts[1]);
                        setDomSeg(parts[2]);
                        setMonthSeg(parts[3]);
                        setDowSeg(parts[4]);
                        showToast(`Loaded preset "${p.label}"`);
                      }}
                      className={`w-full text-left p-2.5 rounded-lg border transition-all ${
                        cronInput === p.expr
                          ? "bg-amber-500/20 border-amber-500/50 text-amber-200 shadow-sm"
                          : theme === "dark"
                          ? "bg-slate-800/40 border-slate-700/60 hover:bg-slate-800 text-slate-300"
                          : "bg-white border-slate-200 hover:bg-slate-100 text-slate-700"
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs font-medium mb-0.5">
                        <span>{p.label}</span>
                        <code className="px-1.5 py-0.2 rounded bg-slate-800 text-[10px] font-mono text-amber-400 border border-slate-700">
                          {p.expr}
                        </code>
                      </div>
                      <p className="text-[11px] text-slate-400">{p.desc}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column: Visual Expression Builder & Next Runs */}
            <div className="flex-1 flex flex-col h-full overflow-y-auto p-5 space-y-6">
              {/* Human Translation Banner */}
              <div className={`p-4 rounded-xl border flex items-center gap-3 ${theme === "dark" ? "bg-amber-950/20 border-amber-500/30 text-amber-200" : "bg-amber-50 border-amber-300 text-amber-900"}`}>
                <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center shrink-0">
                  <Zap className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <h3 className="text-sm font-bold tracking-tight">Plain-English Schedule Translation</h3>
                  <p className="text-xs opacity-90 mt-0.5 font-medium">{humanTranslation}</p>
                </div>
              </div>

              {/* 5 Segments Interactive Controls */}
              <div className={`p-5 rounded-xl border space-y-4 ${theme === "dark" ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"}`}>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Standard 5-Field Cron Segments
                </h3>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  {/* Minute */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300 block">1. Minute (0-59)</label>
                    <input
                      type="text"
                      value={minuteSeg}
                      onChange={e => {
                        setMinuteSeg(e.target.value);
                        updateCronFromSegments(e.target.value, hourSeg, domSeg, monthSeg, dowSeg);
                      }}
                      className={`w-full px-2.5 py-1.5 text-xs rounded-lg border font-mono font-bold text-center ${
                        theme === "dark" ? "bg-slate-800 border-slate-700 text-amber-400" : "bg-slate-100 border-slate-300 text-amber-700"
                      }`}
                    />
                    <span className="text-[10px] text-slate-500 block text-center">* or */5 or 0,15,30</span>
                  </div>

                  {/* Hour */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300 block">2. Hour (0-23)</label>
                    <input
                      type="text"
                      value={hourSeg}
                      onChange={e => {
                        setHourSeg(e.target.value);
                        updateCronFromSegments(minuteSeg, e.target.value, domSeg, monthSeg, dowSeg);
                      }}
                      className={`w-full px-2.5 py-1.5 text-xs rounded-lg border font-mono font-bold text-center ${
                        theme === "dark" ? "bg-slate-800 border-slate-700 text-amber-400" : "bg-slate-100 border-slate-300 text-amber-700"
                      }`}
                    />
                    <span className="text-[10px] text-slate-500 block text-center">* or 0 or 9-17</span>
                  </div>

                  {/* Day of Month */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300 block">3. Day (1-31)</label>
                    <input
                      type="text"
                      value={domSeg}
                      onChange={e => {
                        setDomSeg(e.target.value);
                        updateCronFromSegments(minuteSeg, hourSeg, e.target.value, monthSeg, dowSeg);
                      }}
                      className={`w-full px-2.5 py-1.5 text-xs rounded-lg border font-mono font-bold text-center ${
                        theme === "dark" ? "bg-slate-800 border-slate-700 text-amber-400" : "bg-slate-100 border-slate-300 text-amber-700"
                      }`}
                    />
                    <span className="text-[10px] text-slate-500 block text-center">* or 1 or 15</span>
                  </div>

                  {/* Month */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300 block">4. Month (1-12)</label>
                    <input
                      type="text"
                      value={monthSeg}
                      onChange={e => {
                        setMonthSeg(e.target.value);
                        updateCronFromSegments(minuteSeg, hourSeg, domSeg, e.target.value, dowSeg);
                      }}
                      className={`w-full px-2.5 py-1.5 text-xs rounded-lg border font-mono font-bold text-center ${
                        theme === "dark" ? "bg-slate-800 border-slate-700 text-amber-400" : "bg-slate-100 border-slate-300 text-amber-700"
                      }`}
                    />
                    <span className="text-[10px] text-slate-500 block text-center">* or 1-12</span>
                  </div>

                  {/* Day of Week */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300 block">5. Day Week (0-6)</label>
                    <input
                      type="text"
                      value={dowSeg}
                      onChange={e => {
                        setDowSeg(e.target.value);
                        updateCronFromSegments(minuteSeg, hourSeg, domSeg, monthSeg, e.target.value);
                      }}
                      className={`w-full px-2.5 py-1.5 text-xs rounded-lg border font-mono font-bold text-center ${
                        theme === "dark" ? "bg-slate-800 border-slate-700 text-amber-400" : "bg-slate-100 border-slate-300 text-amber-700"
                      }`}
                    />
                    <span className="text-[10px] text-slate-500 block text-center">* or 0=Sun or 1-5</span>
                  </div>
                </div>
              </div>

              {/* Next Runs Timeline Forecaster */}
              <div className={`p-5 rounded-xl border space-y-3 ${theme === "dark" ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"}`}>
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                    Upcoming Execution Schedule Forecast (Next 6 Triggers)
                  </h3>
                  <span className="text-[11px] text-slate-500">UTC Timeline</span>
                </div>

                <div className="space-y-2">
                  {nextRuns.length === 0 ? (
                    <p className="text-xs text-slate-500 italic">No future executions found within lookahead window.</p>
                  ) : (
                    nextRuns.map((date, idx) => (
                      <div
                        key={idx}
                        className={`p-2.5 rounded-lg border flex items-center justify-between text-xs font-mono ${
                          idx === 0
                            ? "bg-amber-500/10 border-amber-500/30 text-amber-300"
                            : theme === "dark"
                            ? "bg-slate-950/60 border-slate-800 text-slate-300"
                            : "bg-slate-50 border-slate-200 text-slate-700"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center text-[10px] font-bold text-slate-400">
                            {idx + 1}
                          </span>
                          <span className="font-semibold">{date.toUTCString()}</span>
                        </div>
                        <span className="text-[11px] opacity-75">
                          {idx === 0 ? "⚡ NEXT RUN" : `Trigger #${idx + 1}`}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* VIEW 2: TASK SANDBOX */}
        {activeTab === "tasks" && (
          <div className="flex-1 flex flex-col h-full overflow-y-auto p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold">Scheduled Job Sandbox ({tasks.length})</h2>
                <p className="text-xs text-slate-400">Manage background tasks and trigger immediate test executions</p>
              </div>
              <button
                onClick={() => {
                  const newTask: ScheduledTask = {
                    id: `task-${Date.now()}`,
                    name: `Custom Scheduled Job ${tasks.length + 1}`,
                    cronExpr: "0 * * * *",
                    description: "User-defined scheduled task runner",
                    handlerName: `handleCustomJob${tasks.length + 1}`,
                    status: "idle",
                    runCount: 0
                  };
                  setTasks(prev => [...prev, newTask]);
                  showToast("Added new scheduled task!");
                }}
                className="px-3 py-1.5 text-xs font-medium rounded-lg bg-amber-600 hover:bg-amber-500 text-white flex items-center gap-1.5 shadow"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Task</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {tasks.map(t => (
                <div key={t.id} className={`p-4 rounded-xl border space-y-3 ${theme === "dark" ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"}`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-amber-400">{t.name}</h3>
                      <p className="text-xs text-slate-400">{t.description}</p>
                    </div>
                    <span className="px-2 py-0.5 rounded font-mono text-[11px] bg-slate-800 text-amber-300 border border-slate-700">
                      {t.cronExpr}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs">
                    <div className="space-y-0.5">
                      <span className="text-[11px] text-slate-400 block">Handler: <code className="text-cyan-400">{t.handlerName}()</code></span>
                      <span className="text-[11px] text-slate-500 block">Executions: {t.runCount} runs {t.durationMs ? `(${t.durationMs}ms)` : ""}</span>
                    </div>

                    <button
                      onClick={() => handleRunTaskNow(t)}
                      disabled={t.status === "running"}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-1.5 shadow disabled:opacity-50"
                    >
                      {t.status === "running" ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Running...</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-3.5 h-3.5 fill-white" />
                          <span>Run Now</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* VIEW 3: TYPESCRIPT WORKER CODE */}
        {activeTab === "code" && (
          <div className="flex-1 flex flex-col h-full overflow-hidden p-5">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="text-sm font-bold">Production Node.js Worker (src/services/cronScheduler.ts)</h2>
                <p className="text-xs text-slate-400">Complete background task runner using node-cron with error handling</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleCopy(generatedNodeCronCode, "Worker Code")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border flex items-center gap-1.5 transition-colors ${
                    theme === "dark" ? "bg-slate-800 border-slate-700 hover:bg-slate-700 text-slate-200" : "bg-white border-slate-300 hover:bg-slate-100 text-slate-800"
                  }`}
                >
                  {isCopied ? <Check className="w-3.5 h-3.5 text-amber-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>Copy Code</span>
                </button>
                {onSaveFile && (
                  <button
                    onClick={() => onSaveFile("src/services/cronScheduler.ts", generatedNodeCronCode)}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium bg-amber-600 hover:bg-amber-500 text-white flex items-center gap-1.5 shadow"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Save src/services/cronScheduler.ts</span>
                  </button>
                )}
              </div>
            </div>
            <pre className={`flex-1 p-4 rounded-xl font-mono text-xs overflow-auto border ${
              theme === "dark" ? "bg-slate-900 border-slate-800 text-amber-300" : "bg-slate-100 border-slate-300 text-slate-800"
            }`}>
              {generatedNodeCronCode}
            </pre>
          </div>
        )}

        {/* VIEW 4: EXECUTION LOGS */}
        {activeTab === "logs" && (
          <div className="flex-1 flex flex-col h-full overflow-hidden p-5">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="text-sm font-bold">Realtime Cron Execution Logs</h2>
                <p className="text-xs text-slate-400">System event timeline of background tasks</p>
              </div>
              <button
                onClick={() => setExecutionLogs([])}
                className="px-2.5 py-1 text-xs text-slate-400 hover:text-rose-400 flex items-center gap-1"
              >
                <Trash2 className="w-3 h-3" /> Clear Logs
              </button>
            </div>
            <div className={`flex-1 p-3 rounded-xl border overflow-y-auto space-y-2 font-mono text-xs ${
              theme === "dark" ? "bg-slate-900 border-slate-800" : "bg-slate-100 border-slate-300"
            }`}>
              {executionLogs.length === 0 ? (
                <div className="text-center py-16 text-slate-500">No task execution logs recorded yet.</div>
              ) : (
                executionLogs.map(l => (
                  <div key={l.id} className="p-2 rounded bg-slate-950/60 border border-slate-800/80 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-emerald-400 font-bold">[SUCCESS]</span>
                      <span className="text-slate-400">{l.time}</span>
                      <span className="text-amber-300 font-semibold">{l.taskName}:</span>
                      <span className="text-slate-300">{l.message}</span>
                    </div>
                    <span className="text-cyan-400 text-[11px]">{l.durationMs}ms</span>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CronSchedulerStudioAgent;
