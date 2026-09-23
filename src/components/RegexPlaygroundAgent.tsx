import React, { useState, useMemo, useCallback } from "react";
import {
  Regex as RegexIcon,
  Play,
  Sparkles,
  Copy,
  Check,
  Code2,
  BookOpen,
  Info,
  Layers,
  ChevronRight,
  HelpCircle,
  RefreshCw
} from "lucide-react";

interface RegexPlaygroundAgentProps {
  apiKey?: string;
  selectedModel?: string;
  theme?: "light" | "dark" | string;
  onAddLog?: (type: string, message: string, path?: string) => void;
}

interface RegexPreset {
  name: string;
  pattern: string;
  flags: string;
  description: string;
  sampleText: string;
}

const REGEX_PRESETS: RegexPreset[] = [
  {
    name: "Email Address (RFC 5322)",
    pattern: "[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\\.[a-zA-Z0-9-]+)*",
    flags: "g",
    description: "Standard RFC 5322 compliant email address validator.",
    sampleText: "Contact us at support@example.com, dev.team@company.org, or invalid-email@."
  },
  {
    name: "HTTP / HTTPS URL",
    pattern: "https?:\\/\\/(?:www\\.)?[-a-zA-Z0-9@:%._\\+~#=]{1,256}\\.[a-zA-Z0-9()]{1,6}\\b(?:[-a-zA-Z0-9()@:%_\\+.~#?&\\/=]*)",
    flags: "gi",
    description: "Matches web URLs with domain, port, query params and fragments.",
    sampleText: "Browse https://github.com/facebook/react or test http://localhost:3000/api/v1?user=123."
  },
  {
    name: "IPv4 Address",
    pattern: "\\b(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\b",
    flags: "g",
    description: "Strict IPv4 address validator (0.0.0.0 to 255.255.255.255).",
    sampleText: "Server router IPs: 192.168.1.1 and 10.0.0.254, but not 999.12.34.56."
  },
  {
    name: "Semantic Versioning (SemVer)",
    pattern: "v?(0|[1-9]\\d*)\\.(0|[1-9]\\d*)\\.(0|[1-9]\\d*)(?:-((?:0|[1-9]\\d*|\\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\\.(?:0|[1-9]\\d*|\\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\\+([0-9a-zA-Z-]+(?:\\.[0-9a-zA-Z-]+)*))?",
    flags: "g",
    description: "Validates semantic version numbers (e.g. v1.2.3-beta.1+build.100).",
    sampleText: "Releases: v1.0.0, 2.4.15-alpha.2, 3.0.0-rc.1+20130313144700."
  },
  {
    name: "ISO 8601 Date (YYYY-MM-DD)",
    pattern: "\\b\\d{4}-(?:0[1-9]|1[0-2])-(?:0[1-9]|[12]\\d|3[01])\\b",
    flags: "g",
    description: "Standard calendar date format.",
    sampleText: "Created on 2026-09-23 and expiring on 2027-12-31."
  },
  {
    name: "Hex Color Code",
    pattern: "#(?:[0-9a-fA-F]{3,4}){1,2}\\b",
    flags: "gi",
    description: "Matches 3, 4, 6, or 8-digit hexadecimal colors.",
    sampleText: "Palette: #fff, #1e1e20, #6366f1ee, and background #000."
  },
  {
    name: "JSON Web Token (JWT)",
    pattern: "eyJ[a-zA-Z0-9_-]+\\.eyJ[a-zA-Z0-9_-]+\\.[a-zA-Z0-9_-]+",
    flags: "g",
    description: "Matches header.payload.signature structure of standard JWTs.",
    sampleText: "Bearer eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.dozG4m1e_nomatch"
  }
];

export const RegexPlaygroundAgent: React.FC<RegexPlaygroundAgentProps> = ({
  apiKey = "",
  selectedModel = "google/gemini-2.5-flash",
  theme = "dark",
  onAddLog
}) => {
  const isDark = theme !== "light";

  const [pattern, setPattern] = useState<string>("([a-zA-Z0-9._%+-]+)@([a-zA-Z0-9.-]+\\.[a-zA-Z]{2,})");
  const [flags, setFlags] = useState<{ g: boolean; i: boolean; m: boolean; s: boolean; u: boolean }>({
    g: true,
    i: true,
    m: false,
    s: false,
    u: true
  });
  const [testText, setTestText] = useState<string>(
    "Hello developers! Reach us at contact@ai-studio.dev, team_lead+project@matrix.org, or alert-bot@sub.cloud.io."
  );
  const [aiPrompt, setAiPrompt] = useState<string>("");
  const [isAiGenerating, setIsAiGenerating] = useState<boolean>(false);
  const [aiExplanation, setAiExplanation] = useState<string | null>(null);
  const [activeCodeLang, setActiveCodeLang] = useState<"javascript" | "python" | "go" | "rust" | "java" | "bash">("javascript");
  const [copiedCode, setCopiedCode] = useState<boolean>(false);

  // Active flags string
  const flagsString = useMemo(() => {
    let str = "";
    if (flags.g) str += "g";
    if (flags.i) str += "i";
    if (flags.m) str += "m";
    if (flags.s) str += "s";
    if (flags.u) str += "u";
    return str;
  }, [flags]);

  // Compiled regex evaluation
  const evaluation = useMemo(() => {
    if (!pattern) return { regex: null, error: null, matches: [] };
    try {
      const reg = new RegExp(pattern, flagsString);
      const matches: { index: number; fullMatch: string; groups: string[]; length: number }[] = [];

      if (flags.g) {
        let match: RegExpExecArray | null;
        let guard = 0;
        while ((match = reg.exec(testText)) !== null && guard < 500) {
          guard++;
          matches.push({
            index: match.index,
            fullMatch: match[0],
            groups: match.slice(1),
            length: match[0].length
          });
          if (match[0].length === 0) reg.lastIndex++;
        }
      } else {
        const match = reg.exec(testText);
        if (match) {
          matches.push({
            index: match.index,
            fullMatch: match[0],
            groups: match.slice(1),
            length: match[0].length
          });
        }
      }

      return { regex: reg, error: null, matches };
    } catch (err: any) {
      return { regex: null, error: err?.message || "Invalid regular expression", matches: [] };
    }
  }, [pattern, flagsString, testText, flags.g]);

  // Highlighted Match Text
  const renderedHighlightedText = useMemo(() => {
    if (!evaluation.regex || evaluation.matches.length === 0) {
      return testText;
    }

    const segments: React.ReactNode[] = [];
    let lastIndex = 0;

    evaluation.matches.forEach((m, idx) => {
      // Unmatched prefix
      if (m.index > lastIndex) {
        segments.push(testText.substring(lastIndex, m.index));
      }
      // Highlighted match
      segments.push(
        <mark
          key={`match-${idx}`}
          className="bg-amber-400/30 text-amber-200 border-b-2 border-amber-400 font-semibold rounded px-0.5"
          title={`Match #${idx + 1}: ${m.fullMatch} (Groups: ${m.groups.join(", ")})`}
        >
          {m.fullMatch}
        </mark>
      );
      lastIndex = m.index + m.length;
    });

    if (lastIndex < testText.length) {
      segments.push(testText.substring(lastIndex));
    }

    return segments;
  }, [testText, evaluation.matches, evaluation.regex]);

  // AI Regex Generator & Explainer
  const handleAiAction = async (actionType: "generate" | "explain") => {
    setIsAiGenerating(true);
    try {
      const promptContent =
        actionType === "generate"
          ? `Generate an optimal, robust regular expression for this requirement: "${aiPrompt}".
Provide:
1. The exact regex pattern.
2. The recommended flags (e.g. g, i, m).
3. A 2-sentence explanation of how it works.
Output in JSON format with fields: {"pattern": string, "flags": string, "explanation": string}.`
          : `Explain this regular expression token by token in plain English: /${pattern}/${flagsString}.
Provide a clean step-by-step breakdown of anchors, character classes, quantifiers, and capture groups.`;

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
              content: "You are an expert compiler and regular expressions specialist. Provide high-accuracy, concise answers."
            },
            {
              role: "user",
              content: promptContent
            }
          ]
        })
      });

      if (response.ok) {
        const data = await response.json();
        const content = data.choices?.[0]?.message?.content || "";

        if (actionType === "generate") {
          try {
            const cleanJson = content.replace(/```json\n|```/g, "").trim();
            const parsed = JSON.parse(cleanJson);
            if (parsed.pattern) {
              setPattern(parsed.pattern);
              if (parsed.flags) {
                setFlags({
                  g: parsed.flags.includes("g"),
                  i: parsed.flags.includes("i"),
                  m: parsed.flags.includes("m"),
                  s: parsed.flags.includes("s"),
                  u: parsed.flags.includes("u")
                });
              }
              setAiExplanation(parsed.explanation || "Regex generated from requirement.");
            }
          } catch {
            setAiExplanation(content);
          }
        } else {
          setAiExplanation(content);
        }

        if (onAddLog) {
          onAddLog("analyze", `Regex Agent ${actionType} completed for /${pattern}/`);
        }
      }
    } catch (err: any) {
      setAiExplanation(`AI Agent error: ${err?.message || "Request failed"}`);
    } finally {
      setIsAiGenerating(false);
    }
  };

  // Multi-Language Code Snippet Generator
  const generatedCodeSnippet = useMemo(() => {
    const escaped = pattern.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
    switch (activeCodeLang) {
      case "javascript":
        return `// JavaScript / TypeScript Regex
const regex = /${pattern}/${flagsString};
const text = \`${testText.replace(/`/g, "\\`")}\`;

let match;
while ((match = regex.exec(text)) !== null) {
  console.log("Found match:", match[0], "at index", match.index);
  console.log("Capture groups:", match.slice(1));
}`;
      case "python":
        return `# Python 3 Regex Implementation
import re

pattern = r"${pattern}"
flags = ${flags.i ? "re.IGNORECASE | " : ""}${flags.m ? "re.MULTILINE | " : ""}0
text = """${testText}"""

matches = re.finditer(pattern, text, flags)
for match in matches:
    print(f"Match: {match.group(0)} at {match.span()}")
    print(f"Groups: {match.groups()}")`;
      case "go":
        return `// Go (Golang) Regex
package main

import (
  "fmt"
  "regexp"
)

func main() {
  re := regexp.MustCompile(\`${pattern}\`)
  text := \`${testText}\`

  matches := re.FindAllStringSubmatch(text, -1)
  for _, m := range matches {
    fmt.Printf("Match: %s, Groups: %v\\n", m[0], m[1:])
  }
}`;
      case "rust":
        return `// Rust Regex (regex crate)
use regex::Regex;

fn main() {
    let re = Regex::new(r"${pattern}").unwrap();
    let text = "${testText.replace(/"/g, '\\"')}";

    for cap in re.captures_iter(text) {
        println!("Match: {}", &cap[0]);
    }
}`;
      case "java":
        return `// Java Regex Pattern
import java.util.regex.*;

public class RegexRunner {
    public static void main(String[] args) {
        Pattern pattern = Pattern.compile("${escaped}"${flags.i ? ", Pattern.CASE_INSENSITIVE" : ""});
        Matcher matcher = pattern.matcher("${testText.replace(/"/g, '\\"')}");

        while (matcher.find()) {
            System.out.println("Match: " + matcher.group() + " at " + matcher.start());
        }
    }
}`;
      case "bash":
        return `# Bash (grep -P / PCRE)
text="${testText.replace(/"/g, '\\"')}"
echo "$text" | grep -P${flags.i ? "i" : ""}o '${pattern}'`;
    }
  }, [pattern, flagsString, flags, testText, activeCodeLang]);

  return (
    <div className={`w-full h-full flex flex-col font-sans select-none overflow-hidden ${
      isDark ? "bg-[#141416] text-white" : "bg-slate-50 text-slate-800"
    }`}>
      {/* Top Header */}
      <div className={`p-4 border-b flex flex-wrap items-center justify-between gap-3 shrink-0 ${
        isDark ? "border-zinc-800 bg-[#18181b]" : "border-slate-200 bg-white"
      }`}>
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-purple-600/20 text-purple-400 border border-purple-500/30">
            <RegexIcon className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <h2 className="text-sm font-bold flex items-center gap-2">
              Interactive Regex Visualizer & AI Explainer
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                Live Engine
              </span>
            </h2>
            <p className={`text-xs ${isDark ? "text-zinc-400" : "text-slate-500"}`}>
              Real-time regex matching, capture group inspector, AI pattern generator & multi-language code export.
            </p>
          </div>
        </div>

        {/* Preset Selector */}
        <div className="flex items-center gap-2">
          <span className={`text-xs ${isDark ? "text-zinc-400" : "text-slate-500"}`}>Preset:</span>
          <select
            onChange={(e) => {
              const preset = REGEX_PRESETS.find(p => p.name === e.target.value);
              if (preset) {
                setPattern(preset.pattern);
                setFlags({
                  g: preset.flags.includes("g"),
                  i: preset.flags.includes("i"),
                  m: preset.flags.includes("m"),
                  s: preset.flags.includes("s"),
                  u: preset.flags.includes("u")
                });
                setTestText(preset.sampleText);
              }
            }}
            className={`px-3 py-1.5 text-xs rounded-lg font-mono border focus:outline-none cursor-pointer ${
              isDark ? "bg-zinc-800 border-zinc-700 text-white" : "bg-slate-100 border-slate-300 text-slate-800"
            }`}
          >
            <option value="">Load Preset Pattern...</option>
            {REGEX_PRESETS.map(p => (
              <option key={p.name} value={p.name}>{p.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Body */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden min-h-0">
        {/* Left Side: Pattern & Live Match Workspace */}
        <div className={`flex-1 flex flex-col p-4 overflow-y-auto space-y-4 border-r min-h-0 ${
          isDark ? "border-zinc-800" : "border-slate-200"
        }`}>
          {/* Regex Pattern Input Card */}
          <div className={`p-4 rounded-xl border space-y-3 ${
            isDark ? "bg-[#1a1a1d] border-zinc-800" : "bg-white border-slate-200 shadow-xs"
          }`}>
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-purple-400 flex items-center gap-1.5">
                <RegexIcon className="w-3.5 h-3.5" />
                Regular Expression Pattern
              </label>
              <div className="flex items-center gap-1.5">
                {(["g", "i", "m", "s", "u"] as const).map(flagKey => (
                  <button
                    key={flagKey}
                    type="button"
                    onClick={() => setFlags(prev => ({ ...prev, [flagKey]: !prev[flagKey] }))}
                    className={`px-2 py-0.5 rounded text-xs font-mono font-bold cursor-pointer transition-colors ${
                      flags[flagKey]
                        ? "bg-purple-600 text-white shadow-xs"
                        : isDark ? "bg-zinc-800 text-zinc-400 hover:text-white" : "bg-slate-100 text-slate-500 hover:text-slate-800"
                    }`}
                    title={`Flag /${flagKey}/`}
                  >
                    {flagKey}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-lg font-mono text-purple-400">/</span>
              <input
                type="text"
                value={pattern}
                onChange={(e) => setPattern(e.target.value)}
                placeholder="Enter regex pattern..."
                className={`flex-1 px-3 py-2 text-sm font-mono rounded-lg border outline-none transition-colors ${
                  isDark
                    ? "bg-[#111113] border-zinc-700 text-purple-200 focus:border-purple-500"
                    : "bg-slate-50 border-slate-300 text-purple-900 focus:border-purple-500"
                }`}
              />
              <span className="text-lg font-mono text-purple-400">/{flagsString}</span>
            </div>

            {evaluation.error && (
              <p className="text-xs text-rose-400 font-mono flex items-center gap-1">
                <Info className="w-3.5 h-3.5 shrink-0" />
                {evaluation.error}
              </p>
            )}
          </div>

          {/* Test Text & Highlight Box */}
          <div className={`p-4 rounded-xl border space-y-3 flex-1 flex flex-col min-h-64 ${
            isDark ? "bg-[#1a1a1d] border-zinc-800" : "bg-white border-slate-200 shadow-xs"
          }`}>
            <div className="flex items-center justify-between">
              <label className={`text-xs font-bold uppercase tracking-wider ${isDark ? "text-zinc-400" : "text-slate-500"}`}>
                Test String & Live Highlight
              </label>
              <span className={`text-xs font-mono px-2 py-0.5 rounded ${
                evaluation.matches.length > 0
                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                  : "bg-zinc-800 text-zinc-400"
              }`}>
                {evaluation.matches.length} {evaluation.matches.length === 1 ? "Match" : "Matches"}
              </span>
            </div>

            <textarea
              value={testText}
              onChange={(e) => setTestText(e.target.value)}
              rows={4}
              placeholder="Paste or type test string here..."
              className={`w-full p-3 text-xs font-mono rounded-lg border outline-none resize-y transition-colors ${
                isDark
                  ? "bg-[#111113] border-zinc-700 text-white focus:border-purple-500"
                  : "bg-slate-50 border-slate-300 text-slate-800 focus:border-purple-500"
              }`}
            />

            {/* Visual Match Preview */}
            <div className="flex-1 flex flex-col">
              <span className={`text-[10px] font-mono font-semibold uppercase mb-1 ${isDark ? "text-zinc-400" : "text-slate-500"}`}>
                Match Visualizer:
              </span>
              <div className={`p-3 rounded-lg border font-mono text-xs overflow-y-auto leading-relaxed whitespace-pre-wrap ${
                isDark ? "bg-[#111113] border-zinc-800 text-zinc-300" : "bg-slate-50 border-slate-200 text-slate-700"
              }`}>
                {renderedHighlightedText}
              </div>
            </div>
          </div>

          {/* Match & Groups Inspector Table */}
          {evaluation.matches.length > 0 && (
            <div className={`p-4 rounded-xl border space-y-2.5 ${
              isDark ? "bg-[#1a1a1d] border-zinc-800" : "bg-white border-slate-200 shadow-xs"
            }`}>
              <h4 className="text-xs font-bold uppercase tracking-wider text-purple-400 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5" />
                Capture Groups Inspector
              </h4>
              <div className="overflow-x-auto max-h-48">
                <table className="w-full text-left text-xs font-mono">
                  <thead>
                    <tr className={`border-b ${isDark ? "border-zinc-800 text-zinc-400" : "border-slate-200 text-slate-500"}`}>
                      <th className="py-1 px-2">#</th>
                      <th className="py-1 px-2">Match Value</th>
                      <th className="py-1 px-2">Range</th>
                      <th className="py-1 px-2">Captured Groups</th>
                    </tr>
                  </thead>
                  <tbody>
                    {evaluation.matches.map((m, idx) => (
                      <tr key={idx} className={`border-b ${isDark ? "border-zinc-800/50 hover:bg-zinc-800/30" : "border-slate-100 hover:bg-slate-50"}`}>
                        <td className="py-1 px-2 text-purple-400 font-bold">{idx + 1}</td>
                        <td className="py-1 px-2 text-amber-300 font-semibold">{m.fullMatch}</td>
                        <td className="py-1 px-2 opacity-70">[{m.index} - {m.index + m.length}]</td>
                        <td className="py-1 px-2 text-emerald-400">
                          {m.groups.length > 0 ? m.groups.map((g, gi) => `$${gi + 1}: "${g}"`).join(", ") : "None"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Right Side: AI Assistant & Multi-Language Code Exporter */}
        <div className={`w-full md:w-96 lg:w-[480px] flex flex-col shrink-0 min-h-0 border-l ${
          isDark ? "bg-[#18181b] border-zinc-800" : "bg-white border-slate-200"
        }`}>
          {/* AI Generator Panel */}
          <div className={`p-4 border-b space-y-3 ${isDark ? "border-zinc-800" : "border-slate-200"}`}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold flex items-center gap-1.5 text-purple-400">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                AI Regex Generator & Explainer
              </span>
              <button
                onClick={() => handleAiAction("explain")}
                disabled={isAiGenerating || !pattern}
                className="text-[11px] font-medium text-purple-400 hover:underline cursor-pointer disabled:opacity-50"
              >
                Explain Pattern
              </button>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                placeholder="e.g. Match all markdown links or extract domain..."
                className={`flex-1 px-3 py-1.5 text-xs rounded-lg border outline-none font-sans ${
                  isDark
                    ? "bg-[#111113] border-zinc-700 text-white placeholder-zinc-500 focus:border-purple-500"
                    : "bg-slate-50 border-slate-300 text-slate-800 placeholder-slate-400 focus:border-purple-500"
                }`}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && aiPrompt.trim()) handleAiAction("generate");
                }}
              />
              <button
                onClick={() => handleAiAction("generate")}
                disabled={isAiGenerating || !aiPrompt.trim()}
                className="px-3 py-1.5 rounded-lg text-xs font-bold bg-purple-600 hover:bg-purple-500 text-white transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-1"
              >
                {isAiGenerating ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                Generate
              </button>
            </div>

            {aiExplanation && (
              <div className={`p-3 rounded-lg border text-xs leading-relaxed whitespace-pre-wrap max-h-48 overflow-y-auto ${
                isDark ? "bg-purple-950/20 border-purple-800/40 text-purple-200" : "bg-purple-50 border-purple-200 text-purple-950"
              }`}>
                {aiExplanation}
              </div>
            )}
          </div>

          {/* Multi-Language Code Generator */}
          <div className="flex-1 flex flex-col p-4 overflow-hidden min-h-0">
            <div className="flex items-center justify-between mb-2">
              <span className={`text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${isDark ? "text-zinc-300" : "text-slate-700"}`}>
                <Code2 className="w-3.5 h-3.5 text-indigo-400" />
                Code Exporter
              </span>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(generatedCodeSnippet);
                  setCopiedCode(true);
                  setTimeout(() => setCopiedCode(false), 2000);
                }}
                className={`flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-mono cursor-pointer border ${
                  isDark ? "border-zinc-700 hover:bg-zinc-800 text-zinc-300" : "border-slate-300 hover:bg-slate-100 text-slate-700"
                }`}
              >
                {copiedCode ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                {copiedCode ? "Copied" : "Copy Code"}
              </button>
            </div>

            {/* Language tabs */}
            <div className="flex flex-wrap gap-1 mb-2">
              {(["javascript", "python", "go", "rust", "java", "bash"] as const).map(lang => (
                <button
                  key={lang}
                  onClick={() => setActiveCodeLang(lang)}
                  className={`px-2 py-0.5 rounded text-[10px] font-mono capitalize cursor-pointer transition-colors ${
                    activeCodeLang === lang
                      ? "bg-indigo-600 text-white font-bold"
                      : isDark ? "bg-zinc-800 text-zinc-400 hover:text-white" : "bg-slate-100 text-slate-600 hover:text-slate-900"
                  }`}
                >
                  {lang}
                </button>
              ))}
            </div>

            {/* Snippet box */}
            <pre className={`flex-1 p-3 rounded-lg border font-mono text-xs overflow-x-auto overflow-y-auto ${
              isDark ? "bg-[#111113] border-zinc-800 text-emerald-300" : "bg-slate-50 border-slate-200 text-emerald-800"
            }`}>
              {generatedCodeSnippet}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegexPlaygroundAgent;
