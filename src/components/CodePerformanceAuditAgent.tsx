import React, { useState, useEffect, useMemo } from "react";
import {
  Activity,
  Zap,
  ShieldCheck,
  AlertTriangle,
  CheckCircle,
  FileCode,
  Download,
  RotateCcw,
  Sparkles,
  Info,
  Layers,
  Code2,
  FileWarning,
  Eye,
  Sliders
} from "lucide-react";
import { VirtualFile } from "../types";

interface CodePerformanceAuditAgentProps {
  files: VirtualFile[];
  theme?: "light" | "dark" | string;
  onAddLog?: (type: string, message: string) => void;
  onNavigateToFile?: (path: string) => void;
}

interface AuditIssue {
  id: string;
  category: "Performance" | "Quality" | "Accessibility" | "Security";
  severity: "critical" | "warning" | "info";
  filePath: string;
  line?: number;
  message: string;
  suggestion: string;
}

export const CodePerformanceAuditAgent: React.FC<CodePerformanceAuditAgentProps> = ({
  files,
  theme = "dark",
  onAddLog,
  onNavigateToFile
}) => {
  const isDark = theme === "dark";
  const [isAuditing, setIsAuditing] = useState<boolean>(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [issues, setIssues] = useState<AuditIssue[]>([]);
  const [scores, setScores] = useState<{
    performance: number;
    quality: number;
    accessibility: number;
    security: number;
  }>({ performance: 95, quality: 90, accessibility: 92, security: 98 });

  // Run audit engine
  const runAudit = () => {
    setIsAuditing(true);
    const detectedIssues: AuditIssue[] = [];

    let perfDeduction = 0;
    let qualityDeduction = 0;
    let a11yDeduction = 0;
    let secDeduction = 0;

    files.forEach(file => {
      const content = file.content || "";
      const lines = content.split("\n");

      // 1. File Size & Line count audit
      if (lines.length > 500) {
        detectedIssues.push({
          id: `perf-large-${file.path}`,
          category: "Performance",
          severity: "warning",
          filePath: file.path,
          message: `File is excessively large (${lines.length} lines).`,
          suggestion: "Consider decomposing into smaller modular components or custom hooks to improve code splitting."
        });
        perfDeduction += 4;
      }

      // 2. Embedded Base64 Check
      if (content.includes("data:image/") && content.length > 25000) {
        detectedIssues.push({
          id: `perf-base64-${file.path}`,
          category: "Performance",
          severity: "warning",
          filePath: file.path,
          message: "Large embedded Base64 image payload detected in source code.",
          suggestion: "Move heavy binary assets to separate WebP/SVG files or static assets directory."
        });
        perfDeduction += 8;
      }

      // 3. Scan line by line
      lines.forEach((line, idx) => {
        const lineNum = idx + 1;
        const trimmed = line.trim();

        // Security: Hardcoded API keys or Secrets
        if (
          !file.path.includes(".env") &&
          (trimmed.includes("sk_live_") ||
            trimmed.includes("sk-or-v1-") ||
            trimmed.includes("AIzaSy") ||
            /password\s*=\s*["'][^"']+["']/i.test(trimmed))
        ) {
          detectedIssues.push({
            id: `sec-key-${file.path}-${lineNum}`,
            category: "Security",
            severity: "critical",
            filePath: file.path,
            line: lineNum,
            message: "Potential hardcoded API key or credential literal detected.",
            suggestion: "Move secret into .env file or environment vault variables."
          });
          secDeduction += 15;
        }

        // Security: eval() or innerHTML
        if (trimmed.includes("dangerouslySetInnerHTML") || trimmed.includes("eval(")) {
          detectedIssues.push({
            id: `sec-danger-${file.path}-${lineNum}`,
            category: "Security",
            severity: "warning",
            filePath: file.path,
            line: lineNum,
            message: "Usage of dangerouslySetInnerHTML or eval detected.",
            suggestion: "Sanitize inputs with DOMPurify or use standard React JSX elements."
          });
          secDeduction += 8;
        }

        // Quality: Leftover console.log
        if (trimmed.startsWith("console.log(") && !file.path.includes("test")) {
          detectedIssues.push({
            id: `qual-log-${file.path}-${lineNum}`,
            category: "Quality",
            severity: "info",
            filePath: file.path,
            line: lineNum,
            message: "console.log left in production code.",
            suggestion: "Remove or replace with a dedicated logger service."
          });
          qualityDeduction += 2;
        }

        // Quality: Type assertion to any
        if (
          (file.path.endsWith(".ts") || file.path.endsWith(".tsx")) &&
          /:\s*any\b/.test(trimmed) &&
          !trimmed.startsWith("//")
        ) {
          detectedIssues.push({
            id: `qual-any-${file.path}-${lineNum}`,
            category: "Quality",
            severity: "info",
            filePath: file.path,
            line: lineNum,
            message: "TypeScript 'any' type annotation used.",
            suggestion: "Define a strict type interface or use 'unknown' with type guards."
          });
          qualityDeduction += 1.5;
        }

        // Accessibility: img missing alt
        if (trimmed.includes("<img") && !trimmed.includes("alt=")) {
          detectedIssues.push({
            id: `a11y-img-${file.path}-${lineNum}`,
            category: "Accessibility",
            severity: "warning",
            filePath: file.path,
            line: lineNum,
            message: "<img> tag missing required 'alt' attribute.",
            suggestion: "Add descriptive alt text or alt=\"\" if the image is purely decorative."
          });
          a11yDeduction += 5;
        }

        // Accessibility: button missing aria-label or accessible text
        if (
          trimmed.includes("<button") &&
          trimmed.includes("/>") &&
          !trimmed.includes("aria-label") &&
          !trimmed.includes("title=")
        ) {
          detectedIssues.push({
            id: `a11y-btn-${file.path}-${lineNum}`,
            category: "Accessibility",
            severity: "warning",
            filePath: file.path,
            line: lineNum,
            message: "Self-closing or icon-only <button> missing 'aria-label'.",
            suggestion: "Add aria-label=\"...\" so screen readers can announce the action."
          });
          a11yDeduction += 4;
        }
      });
    });

    // Compute scores
    setScores({
      performance: Math.max(10, Math.round(100 - perfDeduction)),
      quality: Math.max(10, Math.round(100 - qualityDeduction)),
      accessibility: Math.max(10, Math.round(100 - a11yDeduction)),
      security: Math.max(10, Math.round(100 - secDeduction))
    });

    setIssues(detectedIssues);
    setIsAuditing(false);

    if (onAddLog) {
      onAddLog("agent", `Audit completed: Scanned ${files.length} files, identified ${detectedIssues.length} optimizations.`);
    }
  };

  useEffect(() => {
    runAudit();
  }, [files]);

  const filteredIssues = useMemo(() => {
    if (selectedCategory === "All") return issues;
    return issues.filter(i => i.category === selectedCategory);
  }, [issues, selectedCategory]);

  // Export report to Markdown
  const handleExportMarkdown = () => {
    let md = `# Project Code Health & Performance Audit Report\n\n`;
    md += `**Generated**: ${new Date().toLocaleString()}\n`;
    md += `**Total Workspace Files**: ${files.length}\n`;
    md += `**Scores**:\n`;
    md += `- Performance: ${scores.performance}/100\n`;
    md += `- Code Quality: ${scores.quality}/100\n`;
    md += `- Accessibility: ${scores.accessibility}/100\n`;
    md += `- Security: ${scores.security}/100\n\n`;
    md += `## Detected Optimization Opportunities (${issues.length})\n\n`;

    issues.forEach((iss, idx) => {
      md += `### ${idx + 1}. [${iss.severity.toUpperCase()}] ${iss.message}\n`;
      md += `- **File**: \`${iss.filePath}${iss.line ? `:${iss.line}` : ""}\`\n`;
      md += `- **Category**: ${iss.category}\n`;
      md += `- **Recommendation**: ${iss.suggestion}\n\n`;
    });

    const blob = new Blob([md], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `audit-report-${Date.now()}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-emerald-400 border-emerald-500/40 bg-emerald-500/10";
    if (score >= 70) return "text-amber-400 border-amber-500/40 bg-amber-500/10";
    return "text-rose-400 border-rose-500/40 bg-rose-500/10";
  };

  return (
    <div
      className={`w-full h-full flex flex-col min-w-0 min-h-0 overflow-hidden ${
        isDark ? "bg-[#0c0d12] text-zinc-100" : "bg-slate-50 text-slate-800"
      }`}
    >
      {/* HEADER BAR */}
      <div
        className={`px-5 py-3.5 border-b flex items-center justify-between shrink-0 gap-3 ${
          isDark ? "border-zinc-800/80 bg-zinc-900/60" : "border-slate-200 bg-white"
        }`}
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold flex items-center gap-2">
              Code Health & Performance Auditor
              <span className="px-1.5 py-0.5 rounded text-[10px] font-extrabold uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                Lighthouse Grade
              </span>
            </h2>
            <p className="text-[11px] text-zinc-400">
              Static analysis engine verifying performance, security hygiene, accessibility, and clean architecture.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={runAudit}
            disabled={isAuditing}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-bold hover:bg-zinc-800 cursor-pointer transition-colors"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${isAuditing ? "animate-spin" : ""}`} />
            Re-Audit
          </button>
          <button
            onClick={handleExportMarkdown}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer shadow-md transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            Export Report
          </button>
        </div>
      </div>

      {/* METRIC GAUGES ROW */}
      <div
        className={`px-5 py-4 border-b grid grid-cols-2 md:grid-cols-4 gap-4 shrink-0 ${
          isDark ? "border-zinc-800 bg-zinc-950/40" : "border-slate-200 bg-slate-100/60"
        }`}
      >
        {/* PERFORMANCE */}
        <div
          className={`p-3.5 rounded-xl border flex items-center gap-3.5 ${
            isDark ? "bg-zinc-900/60 border-zinc-800" : "bg-white border-slate-200"
          }`}
        >
          <div
            className={`w-12 h-12 rounded-xl border flex flex-col items-center justify-center font-mono font-extrabold text-lg ${getScoreColor(
              scores.performance
            )}`}
          >
            {scores.performance}
          </div>
          <div>
            <div className="text-xs font-bold flex items-center gap-1 text-zinc-300">
              <Zap className="w-3.5 h-3.5 text-amber-400" /> Performance
            </div>
            <div className="text-[11px] text-zinc-500">File sizes & assets</div>
          </div>
        </div>

        {/* CODE QUALITY */}
        <div
          className={`p-3.5 rounded-xl border flex items-center gap-3.5 ${
            isDark ? "bg-zinc-900/60 border-zinc-800" : "bg-white border-slate-200"
          }`}
        >
          <div
            className={`w-12 h-12 rounded-xl border flex flex-col items-center justify-center font-mono font-extrabold text-lg ${getScoreColor(
              scores.quality
            )}`}
          >
            {scores.quality}
          </div>
          <div>
            <div className="text-xs font-bold flex items-center gap-1 text-zinc-300">
              <Code2 className="w-3.5 h-3.5 text-blue-400" /> Code Quality
            </div>
            <div className="text-[11px] text-zinc-500">Types & purity</div>
          </div>
        </div>

        {/* ACCESSIBILITY */}
        <div
          className={`p-3.5 rounded-xl border flex items-center gap-3.5 ${
            isDark ? "bg-zinc-900/60 border-zinc-800" : "bg-white border-slate-200"
          }`}
        >
          <div
            className={`w-12 h-12 rounded-xl border flex flex-col items-center justify-center font-mono font-extrabold text-lg ${getScoreColor(
              scores.accessibility
            )}`}
          >
            {scores.accessibility}
          </div>
          <div>
            <div className="text-xs font-bold flex items-center gap-1 text-zinc-300">
              <Eye className="w-3.5 h-3.5 text-purple-400" /> Accessibility
            </div>
            <div className="text-[11px] text-zinc-500">ARIA & semantics</div>
          </div>
        </div>

        {/* SECURITY */}
        <div
          className={`p-3.5 rounded-xl border flex items-center gap-3.5 ${
            isDark ? "bg-zinc-900/60 border-zinc-800" : "bg-white border-slate-200"
          }`}
        >
          <div
            className={`w-12 h-12 rounded-xl border flex flex-col items-center justify-center font-mono font-extrabold text-lg ${getScoreColor(
              scores.security
            )}`}
          >
            {scores.security}
          </div>
          <div>
            <div className="text-xs font-bold flex items-center gap-1 text-zinc-300">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Security
            </div>
            <div className="text-[11px] text-zinc-500">Secrets & sanitization</div>
          </div>
        </div>
      </div>

      {/* CATEGORY FILTER TABS */}
      <div
        className={`px-5 py-2.5 border-b flex items-center gap-1.5 shrink-0 ${
          isDark ? "border-zinc-800 bg-zinc-950/20" : "border-slate-200 bg-white"
        }`}
      >
        {["All", "Performance", "Quality", "Accessibility", "Security"].map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
              selectedCategory === cat
                ? "bg-zinc-800 text-white font-bold border border-zinc-700 shadow-xs"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            {cat} (
            {cat === "All"
              ? issues.length
              : issues.filter(i => i.category === cat).length}
            )
          </button>
        ))}
      </div>

      {/* ISSUES LIST */}
      <div className="flex-1 overflow-y-auto p-5 space-y-3">
        {filteredIssues.map(iss => {
          const badgeColor =
            iss.severity === "critical"
              ? "bg-rose-500/20 text-rose-400 border-rose-500/30"
              : iss.severity === "warning"
              ? "bg-amber-500/20 text-amber-400 border-amber-500/30"
              : "bg-blue-500/20 text-blue-400 border-blue-500/30";

          return (
            <div
              key={iss.id}
              className={`p-4 rounded-xl border space-y-2 transition-all ${
                isDark ? "bg-zinc-900/40 border-zinc-800 hover:bg-zinc-900/70" : "bg-white border-slate-200 hover:bg-slate-50"
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase border ${badgeColor}`}>
                    {iss.severity}
                  </span>
                  <span className="font-bold text-xs text-zinc-200">{iss.message}</span>
                </div>
                {iss.filePath && (
                  <button
                    onClick={() => onNavigateToFile && onNavigateToFile(iss.filePath)}
                    className="text-xs font-mono text-emerald-400 hover:underline flex items-center gap-1"
                  >
                    <FileCode className="w-3.5 h-3.5" />
                    {iss.filePath}{iss.line ? `:${iss.line}` : ""}
                  </button>
                )}
              </div>

              <div
                className={`p-2.5 rounded-lg border text-xs font-sans flex items-start gap-2 ${
                  isDark ? "bg-zinc-950/80 border-zinc-800/80 text-zinc-300" : "bg-slate-50 border-slate-200 text-slate-700"
                }`}
              >
                <Sparkles className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-emerald-400 mr-1.5">Optimization:</span>
                  {iss.suggestion}
                </div>
              </div>
            </div>
          );
        })}

        {filteredIssues.length === 0 && (
          <div className="text-center py-16 text-zinc-500 space-y-2">
            <CheckCircle className="w-10 h-10 mx-auto text-emerald-400 opacity-60" />
            <h4 className="text-sm font-bold text-zinc-300">Clean Bill of Health!</h4>
            <p className="text-xs text-zinc-500">
              No issues detected in this category. Your code follows best practices.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CodePerformanceAuditAgent;
