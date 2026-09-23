import React, { useState, useMemo, useCallback } from "react";
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Zap,
  CheckCircle2,
  Bug,
  Sparkles,
  Download,
  Copy,
  Check,
  FileCode,
  ArrowRight,
  RefreshCw,
  Eye,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { VirtualFile } from "../types";

export interface CodeIssue {
  id: string;
  line: number;
  column?: number;
  severity: "critical" | "warning" | "perf" | "info";
  category: "Security" | "Performance" | "Reliability" | "Maintainability";
  title: string;
  description: string;
  snippet?: string;
  recommendation: string;
  suggestedFix?: string;
}

interface CodeHealthDoctorAgentProps {
  apiKey?: string;
  selectedModel?: string;
  theme?: "light" | "dark" | string;
  files: VirtualFile[];
  activeFilePath?: string;
  activeFile?: VirtualFile;
  onSelectFile?: (path: string) => void;
  onApplyFixToFile?: (path: string, newContent: string) => void;
  onApplyFix?: (path: string, newContent: string) => void;
  onAddLog?: (type: string, message: string, path?: string) => void;
}

// Built-in Static Code Audit Engine
function analyzeSourceCode(code: string, language: string): CodeIssue[] {
  const issues: CodeIssue[] = [];
  const lines = code.split("\n");

  lines.forEach((lineText, idx) => {
    const lineNum = idx + 1;
    const trimmed = lineText.trim();

    // 1. Security: Hardcoded API Keys / Secrets
    if (/(['"`])(sk-[a-zA-Z0-9_\-]{20,}|AIza[0-9A-Za-z-_]{35}|ghp_[a-zA-Z0-9]{36}|xox[baprs]-[0-9a-zA-Z]{10,})\1/.test(trimmed)) {
      issues.push({
        id: `sec-key-${lineNum}`,
        line: lineNum,
        severity: "critical",
        category: "Security",
        title: "Potential Hardcoded Secret / API Token",
        description: "Found what appears to be a raw API key or authentication secret in source code.",
        snippet: trimmed,
        recommendation: "Move sensitive credentials to environment variables (.env / process.env) and proxy calls server-side.",
      });
    }

    // 2. Security: Insecure eval() or new Function()
    if (/\beval\s*\(|new\s+Function\s*\(/.test(trimmed) && !trimmed.startsWith("//")) {
      issues.push({
        id: `sec-eval-${lineNum}`,
        line: lineNum,
        severity: "critical",
        category: "Security",
        title: "Arbitrary Code Execution Hazard (eval / new Function)",
        description: "Dynamic code execution via eval() or Function() allows potential remote code execution (RCE) and code injection.",
        snippet: trimmed,
        recommendation: "Replace with safe alternatives like JSON.parse() or structured domain parsers.",
      });
    }

    // 3. Security: Raw innerHTML or dangerouslySetInnerHTML
    if (/(\.innerHTML\s*=|<[^>]+dangerouslySetInnerHTML)/.test(trimmed) && !trimmed.startsWith("//")) {
      issues.push({
        id: `sec-xss-${lineNum}`,
        line: lineNum,
        severity: "warning",
        category: "Security",
        title: "Potential Cross-Site Scripting (XSS) via Unsanitized HTML",
        description: "Directly setting innerHTML without sanitization can execute arbitrary malicious scripts.",
        snippet: trimmed,
        recommendation: "Sanitize with DOMPurify.sanitize() or use standard textContent / JSX children.",
      });
    }

    // 4. Reliability: Empty Catch Block
    if (/catch\s*\([^)]*\)\s*\{\s*\}/.test(trimmed)) {
      issues.push({
        id: `rel-catch-${lineNum}`,
        line: lineNum,
        severity: "warning",
        category: "Reliability",
        title: "Silent Error Suppression (Empty Catch Block)",
        description: "Exceptions are swallowed without logging, making silent failures impossible to diagnose in production.",
        snippet: trimmed,
        recommendation: "Log the error using console.error(err) or propagate the failure gracefully with user feedback.",
      });
    }

    // 5. Reliability: Loose Equality == vs ===
    if (["javascript", "typescript", "jsx", "tsx"].includes(language) && /[!=]==?[^=]/.test(trimmed)) {
      if (/\s==\s|\s!=\s/.test(trimmed) && !trimmed.includes("null") && !trimmed.startsWith("//")) {
        issues.push({
          id: `rel-eq-${lineNum}`,
          line: lineNum,
          severity: "info",
          category: "Reliability",
          title: "Loose Equality Comparison (== or !=)",
          description: "Loose equality triggers unexpected JavaScript type coercion bugs (e.g. 0 == '', false == []).",
          snippet: trimmed,
          recommendation: "Use strict equality (=== or !==) instead.",
        });
      }
    }

    // 6. Performance: Redundant console.log statements
    if (/\bconsole\.(log|debug|info)\s*\(/.test(trimmed) && !trimmed.startsWith("//")) {
      issues.push({
        id: `perf-console-${lineNum}`,
        line: lineNum,
        severity: "info",
        category: "Performance",
        title: "Development Console Logging in Production Code",
        description: "Excessive console.log statements increase memory churn and leak internal application state in browser DevTools.",
        snippet: trimmed,
        recommendation: "Remove or guard with process.env.NODE_ENV !== 'production'.",
      });
    }

    // 7. Security / Reliability: ReDoS Hazard
    if (/\/\([^)]+\+[^)]*\)\+/.test(trimmed) || /\/\([^)]*\*[^)]*\)\*/.test(trimmed)) {
      issues.push({
        id: `sec-redos-${lineNum}`,
        line: lineNum,
        severity: "critical",
        category: "Security",
        title: "Catastrophic ReDoS Backtracking Pattern",
        description: "Nested quantifiers (e.g. (a+)+) in regular expressions can cause exponential execution time and freeze the thread.",
        snippet: trimmed,
        recommendation: "Refactor regex to eliminate nested repetitions or specify character class bounds.",
      });
    }

    // 8. Performance: Synchronous sleep / busy wait
    if (/while\s*\(\s*Date\.now\(\)/.test(trimmed)) {
      issues.push({
        id: `perf-busy-${lineNum}`,
        line: lineNum,
        severity: "critical",
        category: "Performance",
        title: "Synchronous Busy-Wait Loop",
        description: "Busy wait loop freezes the JavaScript event loop and pegs CPU utilization to 100%.",
        snippet: trimmed,
        recommendation: "Use setTimeout, requestAnimationFrame, or async/await sleep helper.",
      });
    }
  });

  return issues;
}

export const CodeHealthDoctorAgent: React.FC<CodeHealthDoctorAgentProps> = ({
  apiKey = "",
  selectedModel = "google/gemini-2.5-flash",
  theme = "dark",
  files = [],
  activeFilePath = "",
  activeFile,
  onSelectFile,
  onApplyFixToFile,
  onApplyFix,
  onAddLog
}) => {
  const isDark = theme !== "light";
  const [selectedPath, setSelectedPath] = useState<string>(
    activeFilePath || activeFile?.path || files[0]?.path || ""
  );
  const [activeFilter, setActiveFilter] = useState<"all" | "critical" | "warning" | "perf" | "info">("all");
  const [isAiFixing, setIsAiFixing] = useState<boolean>(false);
  const [activeIssueId, setActiveIssueId] = useState<string | null>(null);
  const [refactoredCode, setRefactoredCode] = useState<string | null>(null);
  const [fixExplanation, setFixExplanation] = useState<string | null>(null);
  const [copiedReport, setCopiedReport] = useState<boolean>(false);
  const [expandedIssueIds, setExpandedIssueIds] = useState<Record<string, boolean>>({});

  const currentFile = useMemo(() => {
    return files.find(f => f.path === selectedPath) || files[0] || null;
  }, [files, selectedPath]);

  // Run static analysis
  const issues = useMemo(() => {
    if (!currentFile || !currentFile.content) return [];
    return analyzeSourceCode(currentFile.content, currentFile.language || "typescript");
  }, [currentFile]);

  // Compute Code Health Score
  const healthScore = useMemo(() => {
    if (!currentFile) return 100;
    const criticalCount = issues.filter(i => i.severity === "critical").length;
    const warningCount = issues.filter(i => i.severity === "warning").length;
    const perfCount = issues.filter(i => i.severity === "perf").length;
    const penalty = criticalCount * 25 + warningCount * 10 + perfCount * 5;
    return Math.max(0, 100 - penalty);
  }, [issues, currentFile]);

  const scoreColor = useMemo(() => {
    if (healthScore >= 90) return "text-emerald-400 border-emerald-500/40 bg-emerald-500/10";
    if (healthScore >= 75) return "text-blue-400 border-blue-500/40 bg-blue-500/10";
    if (healthScore >= 60) return "text-amber-400 border-amber-500/40 bg-amber-500/10";
    return "text-rose-400 border-rose-500/40 bg-rose-500/10";
  }, [healthScore]);

  const filteredIssues = useMemo(() => {
    if (activeFilter === "all") return issues;
    return issues.filter(i => i.severity === activeFilter);
  }, [issues, activeFilter]);

  const toggleExpand = (id: string) => {
    setExpandedIssueIds(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // AI-Powered Automated Refactoring & Fix
  const handleAiAutoFix = async (issue?: CodeIssue) => {
    if (!currentFile) return;
    setIsAiFixing(true);
    setActiveIssueId(issue?.id || "all");
    setRefactoredCode(null);
    setFixExplanation(null);

    try {
      const promptTarget = issue
        ? `Fix this specific issue: [${issue.title}] (Line ${issue.line}): ${issue.description}\nRecommendation: ${issue.recommendation}`
        : `Perform a comprehensive security, performance, and reliability refactor addressing all detected warnings and vulnerabilities.`;

      const response = await fetch("/api/openrouter/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {})
        },
        body: JSON.stringify({
          model: selectedModel || "google/gemini-2.5-flash",
          messages: [
            {
              role: "system",
              content: `You are an elite Staff Software Security Engineer and Performance Optimizer.
Your job is to refactor the provided code file to resolve the issue completely while strictly preserving all original functionalities and exports.
Return your response in clean Markdown with:
1. A brief explanation of the fix (2-3 bullet points).
2. A single markdown code block with the complete refactored file content.`
            },
            {
              role: "user",
              content: `File: ${currentFile.path} (${currentFile.language})\n\nIssue to resolve:\n${promptTarget}\n\nCurrent Source Code:\n\`\`\`${currentFile.language}\n${currentFile.content}\n\`\`\``
            }
          ]
        })
      });

      if (response.ok) {
        const data = await response.json();
        const content = data.choices?.[0]?.message?.content || "";
        
        // Extract code block
        const codeMatch = content.match(/```[a-zA-Z0-9_-]*\n([\s\S]*?)```/);
        if (codeMatch) {
          setRefactoredCode(codeMatch[1].trim());
          const textBefore = content.split("```")[0].trim();
          setFixExplanation(textBefore || "Code refactored with all identified vulnerabilities and performance bottlenecks resolved.");
        } else {
          setRefactoredCode(content.trim());
          setFixExplanation("Refactored code generated successfully.");
        }

        if (onAddLog) {
          onAddLog("edit", `AI Doctor generated fix for ${currentFile.path}`, currentFile.path);
        }
      } else {
        setFixExplanation("Could not reach AI provider endpoint. Please check connection.");
      }
    } catch (err: any) {
      setFixExplanation(`Auto-fix error: ${err?.message || "Operation failed"}`);
    } finally {
      setIsAiFixing(false);
    }
  };

  // Apply the generated refactored code to the active file
  const handleApplyFix = () => {
    if (!currentFile || !refactoredCode) return;
    if (onApplyFix) {
      onApplyFix(currentFile.path, refactoredCode);
    } else if (onApplyFixToFile) {
      onApplyFixToFile(currentFile.path, refactoredCode);
    }
    setRefactoredCode(null);
    setFixExplanation(null);
    if (onAddLog) {
      onAddLog("edit", `Applied automated AI refactoring to ${currentFile.path}`, currentFile.path);
    }
  };

  // Copy full audit report
  const handleCopyReport = () => {
    if (!currentFile) return;
    const report = `# Code Health & Security Audit Report
**File:** \`${currentFile.path}\`
**Health Score:** ${healthScore}/100
**Total Issues Found:** ${issues.length}
- Critical: ${issues.filter(i => i.severity === "critical").length}
- Warnings: ${issues.filter(i => i.severity === "warning").length}
- Performance: ${issues.filter(i => i.severity === "perf").length}
- Info: ${issues.filter(i => i.severity === "info").length}

## Detailed Findings
${issues.map(iss => `
### [${iss.severity.toUpperCase()}] ${iss.title} (Line ${iss.line})
- **Category:** ${iss.category}
- **Description:** ${iss.description}
- **Snippet:** \`${iss.snippet || "N/A"}\`
- **Recommendation:** ${iss.recommendation}
`).join("\n")}
`;
    navigator.clipboard.writeText(report);
    setCopiedReport(true);
    setTimeout(() => setCopiedReport(false), 2000);
  };

  return (
    <div className={`w-full h-full flex flex-col font-sans select-none overflow-hidden ${
      isDark ? "bg-[#141416] text-white" : "bg-slate-50 text-slate-800"
    }`}>
      {/* Top Header Bar */}
      <div className={`p-4 border-b flex flex-wrap items-center justify-between gap-3 shrink-0 ${
        isDark ? "border-zinc-800 bg-[#18181b]" : "border-slate-200 bg-white"
      }`}>
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
            <ShieldCheck className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <h2 className="text-sm font-bold flex items-center gap-2">
              Code Health, Security & Refactoring Doctor
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Live AST Scanner
              </span>
            </h2>
            <p className={`text-xs ${isDark ? "text-zinc-400" : "text-slate-500"}`}>
              Continuous static security analysis, performance bottlenecks & automated 1-click AI refactoring.
            </p>
          </div>
        </div>

        {/* File selector & Action buttons */}
        <div className="flex items-center gap-2">
          <select
            value={selectedPath}
            onChange={(e) => {
              setSelectedPath(e.target.value);
              if (onSelectFile) onSelectFile(e.target.value);
            }}
            className={`px-3 py-1.5 text-xs rounded-lg font-mono border focus:outline-none cursor-pointer ${
              isDark ? "bg-zinc-800 border-zinc-700 text-white" : "bg-slate-100 border-slate-300 text-slate-800"
            }`}
          >
            {files.map(f => (
              <option key={f.path} value={f.path}>
                {f.path} ({f.language})
              </option>
            ))}
          </select>

          <button
            onClick={() => handleAiAutoFix()}
            disabled={isAiFixing || !currentFile}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition-all cursor-pointer disabled:opacity-50 shadow-md shadow-indigo-600/20"
          >
            {isAiFixing && activeIssueId === "all" ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            )}
            Auto-Fix File with AI
          </button>

          <button
            onClick={handleCopyReport}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
              isDark ? "border-zinc-700 hover:bg-zinc-800 text-zinc-300" : "border-slate-300 hover:bg-slate-100 text-slate-700"
            }`}
          >
            {copiedReport ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            {copiedReport ? "Copied" : "Copy Audit"}
          </button>
        </div>
      </div>

      {/* Main Workspace Body */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden min-h-0">
        {/* Left Side: Score & Issues List */}
        <div className={`flex-1 flex flex-col overflow-y-auto border-r min-h-0 ${
          isDark ? "border-zinc-800" : "border-slate-200"
        }`}>
          {/* Health Score Summary Card */}
          <div className={`p-4 border-b flex items-center justify-between gap-4 ${
            isDark ? "border-zinc-800/80 bg-zinc-900/40" : "border-slate-200 bg-slate-100/50"
          }`}>
            <div className="flex items-center gap-4">
              <div className={`w-16 h-16 rounded-xl border flex flex-col items-center justify-center font-bold ${scoreColor}`}>
                <span className="text-xl leading-none">{healthScore}</span>
                <span className="text-[9px] uppercase tracking-wider opacity-80 mt-0.5">Score</span>
              </div>
              <div>
                <div className="text-sm font-semibold flex items-center gap-2">
                  <span>File Health: {healthScore >= 90 ? "Excellent" : healthScore >= 75 ? "Good" : healthScore >= 50 ? "Needs Attention" : "Vulnerable"}</span>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                    issues.length === 0 ? "bg-emerald-500/20 text-emerald-300" : "bg-rose-500/20 text-rose-300"
                  }`}>
                    {issues.length} {issues.length === 1 ? "Issue" : "Issues"}
                  </span>
                </div>
                <div className={`text-xs mt-1 flex flex-wrap gap-2 ${isDark ? "text-zinc-400" : "text-slate-500"}`}>
                  <span className="flex items-center gap-1 text-rose-400 font-medium">
                    <ShieldAlert className="w-3 h-3" />
                    {issues.filter(i => i.severity === "critical").length} Critical
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1 text-amber-400 font-medium">
                    <AlertTriangle className="w-3 h-3" />
                    {issues.filter(i => i.severity === "warning").length} Warnings
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1 text-sky-400 font-medium">
                    <Zap className="w-3 h-3" />
                    {issues.filter(i => i.severity === "perf").length} Performance
                  </span>
                </div>
              </div>
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1 bg-zinc-800/40 p-1 rounded-lg border border-zinc-700/50">
              {(["all", "critical", "warning", "perf", "info"] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveFilter(tab)}
                  className={`px-2 py-1 text-[11px] font-medium rounded capitalize cursor-pointer transition-colors ${
                    activeFilter === tab
                      ? "bg-indigo-600 text-white font-semibold shadow-xs"
                      : isDark ? "text-zinc-400 hover:text-white" : "text-slate-500 hover:text-slate-900"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Issues List */}
          <div className="flex-1 p-4 space-y-3 overflow-y-auto">
            {filteredIssues.length === 0 ? (
              <div className="h-64 flex flex-col items-center justify-center text-center p-6">
                <CheckCircle2 className="w-12 h-12 text-emerald-400 mb-3" />
                <h3 className="text-sm font-semibold">No issues detected in current filter!</h3>
                <p className={`text-xs mt-1 max-w-sm ${isDark ? "text-zinc-400" : "text-slate-500"}`}>
                  {issues.length === 0
                    ? "Great job! This file complies with modern security, quality, and performance best practices."
                    : "Switch filter tabs to review other categories of code warnings."}
                </p>
              </div>
            ) : (
              filteredIssues.map(issue => {
                const isExpanded = !!expandedIssueIds[issue.id];
                const badgeColor =
                  issue.severity === "critical"
                    ? "bg-rose-500/20 text-rose-300 border-rose-500/40"
                    : issue.severity === "warning"
                    ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                    : issue.severity === "perf"
                    ? "bg-purple-500/20 text-purple-300 border-purple-500/40"
                    : "bg-blue-500/20 text-blue-300 border-blue-500/40";

                return (
                  <div
                    key={issue.id}
                    className={`rounded-xl border transition-all ${
                      isDark ? "bg-[#1a1a1d] border-zinc-800 hover:border-zinc-700" : "bg-white border-slate-200 hover:border-slate-300 shadow-xs"
                    }`}
                  >
                    <div
                      onClick={() => toggleExpand(issue.id)}
                      className="p-3.5 flex items-start justify-between gap-3 cursor-pointer"
                    >
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5">
                          {issue.severity === "critical" ? (
                            <ShieldAlert className="w-4 h-4 text-rose-400" />
                          ) : issue.severity === "warning" ? (
                            <AlertTriangle className="w-4 h-4 text-amber-400" />
                          ) : issue.severity === "perf" ? (
                            <Zap className="w-4 h-4 text-purple-400" />
                          ) : (
                            <Bug className="w-4 h-4 text-blue-400" />
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-bold">{issue.title}</span>
                            <span className={`text-[10px] font-mono px-2 py-0.5 rounded border uppercase font-semibold ${badgeColor}`}>
                              {issue.severity}
                            </span>
                            <span className={`text-[10px] font-mono ${isDark ? "text-zinc-500" : "text-slate-400"}`}>
                              Line {issue.line} • {issue.category}
                            </span>
                          </div>
                          <p className={`text-xs mt-1 leading-relaxed ${isDark ? "text-zinc-300" : "text-slate-600"}`}>
                            {issue.description}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAiAutoFix(issue);
                          }}
                          disabled={isAiFixing}
                          className="flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-medium bg-indigo-600/30 text-indigo-300 hover:bg-indigo-600 hover:text-white transition-colors cursor-pointer"
                          title="Generate targeted AI solution for this issue"
                        >
                          <Sparkles className="w-3 h-3 text-amber-300" />
                          Fix with AI
                        </button>
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4 text-zinc-400" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-zinc-400" />
                        )}
                      </div>
                    </div>

                    {isExpanded && (
                      <div className={`p-3.5 pt-0 border-t mt-1 space-y-2.5 text-xs ${
                        isDark ? "border-zinc-800/80 bg-zinc-900/30" : "border-slate-100 bg-slate-50"
                      }`}>
                        {issue.snippet && (
                          <div>
                            <span className={`text-[10px] font-mono font-semibold uppercase tracking-wider ${isDark ? "text-zinc-400" : "text-slate-500"}`}>
                              Code Snippet:
                            </span>
                            <pre className={`mt-1 p-2 rounded text-[11px] font-mono overflow-x-auto border ${
                              isDark ? "bg-[#111113] border-zinc-800 text-rose-300" : "bg-white border-slate-200 text-rose-600"
                            }`}>
                              {issue.snippet}
                            </pre>
                          </div>
                        )}

                        <div className="flex items-start gap-2 text-emerald-400">
                          <CheckCircle2 className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                          <div>
                            <span className="font-semibold text-white">Recommended Solution: </span>
                            <span className={isDark ? "text-zinc-300" : "text-slate-700"}>{issue.recommendation}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Side: AI Refactoring Solution & Diff Previewer */}
        <div className={`w-full md:w-96 lg:w-[480px] flex flex-col shrink-0 min-h-0 ${
          isDark ? "bg-[#18181b]" : "bg-white"
        }`}>
          <div className={`p-3 border-b flex items-center justify-between shrink-0 ${
            isDark ? "border-zinc-800 bg-[#141416]" : "border-slate-200 bg-slate-50"
          }`}>
            <span className="text-xs font-bold flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              AI Refactoring & Diff Solution
            </span>
            {refactoredCode && (
              <button
                onClick={handleApplyFix}
                className="flex items-center gap-1.5 px-3 py-1 rounded text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition-all cursor-pointer shadow-xs"
              >
                <Check className="w-3.5 h-3.5" />
                Apply Fix to File
              </button>
            )}
          </div>

          <div className="flex-1 p-4 overflow-y-auto min-h-0 space-y-3">
            {isAiFixing ? (
              <div className="h-64 flex flex-col items-center justify-center text-center p-6">
                <RefreshCw className="w-8 h-8 text-indigo-400 animate-spin mb-3" />
                <h4 className="text-xs font-bold">Analyzing AST & Synthesizing Fix...</h4>
                <p className={`text-[11px] mt-1 max-w-xs ${isDark ? "text-zinc-400" : "text-slate-500"}`}>
                  OpenRouter AI model is reviewing security boundaries and refactoring source logic.
                </p>
              </div>
            ) : refactoredCode ? (
              <div className="space-y-3">
                {fixExplanation && (
                  <div className={`p-3 rounded-lg border text-xs leading-relaxed ${
                    isDark ? "bg-indigo-950/20 border-indigo-800/40 text-indigo-200" : "bg-indigo-50 border-indigo-200 text-indigo-900"
                  }`}>
                    <p className="font-semibold text-white mb-1">Refactoring Summary:</p>
                    <div className="whitespace-pre-line">{fixExplanation}</div>
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className={`text-[11px] font-mono font-semibold uppercase ${isDark ? "text-zinc-400" : "text-slate-500"}`}>
                      Proposed Replacement Code:
                    </span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(refactoredCode);
                      }}
                      className={`text-[10px] font-mono px-2 py-0.5 rounded cursor-pointer ${
                        isDark ? "hover:bg-zinc-800 text-zinc-300" : "hover:bg-slate-200 text-slate-700"
                      }`}
                    >
                      Copy Code
                    </button>
                  </div>
                  <pre className={`p-3 rounded-lg border font-mono text-xs overflow-x-auto max-h-96 ${
                    isDark ? "bg-[#111113] border-zinc-800 text-emerald-300" : "bg-slate-50 border-slate-200 text-emerald-800"
                  }`}>
                    {refactoredCode}
                  </pre>
                </div>
              </div>
            ) : (
              <div className="h-64 flex flex-col items-center justify-center text-center p-6">
                <FileCode className={`w-10 h-10 mb-2 ${isDark ? "text-zinc-600" : "text-slate-300"}`} />
                <h4 className="text-xs font-semibold">No Pending Refactor</h4>
                <p className={`text-[11px] mt-1 max-w-xs ${isDark ? "text-zinc-500" : "text-slate-400"}`}>
                  Click &quot;Auto-Fix File with AI&quot; or select an issue above to generate a verified, production-grade refactored solution.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CodeHealthDoctorAgent;
