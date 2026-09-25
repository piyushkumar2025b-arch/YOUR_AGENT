import React, { useState, useMemo } from "react";
import {
  GitBranch,
  GitCommit as GitCommitIcon,
  GitMerge,
  GitPullRequest,
  Plus,
  Trash2,
  Save,
  Copy,
  Check,
  CheckCircle2,
  Clock,
  Sparkles,
  Terminal,
  FileCode,
  Tag,
  User,
  Search,
  Filter,
  ArrowRight,
  RotateCcw,
  CheckCheck
} from "lucide-react";
import { VirtualFile } from "../types";

export interface GitBranchGraphStudioAgentProps {
  files: VirtualFile[];
  theme: "light" | "dark";
  onSaveFile?: (path: string, content: string) => void;
  onAddLog?: (type: string, msg: string) => void;
}

export interface GitCommit {
  hash: string;
  shortHash: string;
  branch: string;
  parentHashes: string[];
  author: string;
  email: string;
  timestamp: number;
  message: string;
  type: "feat" | "fix" | "refactor" | "perf" | "chore" | "merge" | "docs";
  filesChanged: string[];
  fileSnapshots?: Record<string, string>;
}

const DEFAULT_COMMITS: GitCommit[] = [
  {
    hash: "a1b2c3d4e5f60718293a4b5c6d7e8f9012345678",
    shortHash: "a1b2c3d",
    branch: "main",
    parentHashes: [],
    author: "Alex Rivera",
    email: "alex@remixstudio.dev",
    timestamp: Date.now() - 3600000 * 24 * 4,
    message: "feat: initial repository bootstrap with Vite & Express",
    type: "feat",
    filesChanged: ["package.json", "src/App.tsx", "vite.config.ts"]
  },
  {
    hash: "b2c3d4e5f60718293a4b5c6d7e8f90123456789a",
    shortHash: "b2c3d4e",
    branch: "main",
    parentHashes: ["a1b2c3d4e5f60718293a4b5c6d7e8f9012345678"],
    author: "Alex Rivera",
    email: "alex@remixstudio.dev",
    timestamp: Date.now() - 3600000 * 24 * 3,
    message: "chore: configure Tailwind CSS v4 styling tokens",
    type: "chore",
    filesChanged: ["src/index.css", "src/theme.css"]
  },
  {
    hash: "c3d4e5f60718293a4b5c6d7e8f90123456789ab1",
    shortHash: "c3d4e5f",
    branch: "feature/auth-jwt",
    parentHashes: ["b2c3d4e5f60718293a4b5c6d7e8f90123456789a"],
    author: "Sophia Chen",
    email: "sophia@remixstudio.dev",
    timestamp: Date.now() - 3600000 * 24 * 2,
    message: "feat(auth): implement WebCrypto JWT session verification",
    type: "feat",
    filesChanged: ["src/utils/cryptoAuth.ts", "src/services/apiClient.ts"]
  },
  {
    hash: "d4e5f60718293a4b5c6d7e8f90123456789ab1c2",
    shortHash: "d4e5f60",
    branch: "feature/auth-jwt",
    parentHashes: ["c3d4e5f60718293a4b5c6d7e8f90123456789ab1"],
    author: "Sophia Chen",
    email: "sophia@remixstudio.dev",
    timestamp: Date.now() - 3600000 * 18,
    message: "fix(auth): handle expired token claims gracefully",
    type: "fix",
    filesChanged: ["src/utils/cryptoAuth.ts"]
  },
  {
    hash: "e5f60718293a4b5c6d7e8f90123456789ab1c2d3",
    shortHash: "e5f6071",
    branch: "main",
    parentHashes: [
      "b2c3d4e5f60718293a4b5c6d7e8f90123456789a",
      "d4e5f60718293a4b5c6d7e8f90123456789ab1c2"
    ],
    author: "Alex Rivera",
    email: "alex@remixstudio.dev",
    timestamp: Date.now() - 3600000 * 8,
    message: "merge: merge branch 'feature/auth-jwt' into main",
    type: "merge",
    filesChanged: ["src/utils/cryptoAuth.ts", "src/services/apiClient.ts"]
  },
  {
    hash: "f60718293a4b5c6d7e8f90123456789ab1c2d3e4",
    shortHash: "f607182",
    branch: "main",
    parentHashes: ["e5f60718293a4b5c6d7e8f90123456789ab1c2d3"],
    author: "Alex Rivera",
    email: "alex@remixstudio.dev",
    timestamp: Date.now() - 3600000 * 2,
    message: "perf(build): enable multi-stage layer caching in containerfile",
    type: "perf",
    filesChanged: ["Dockerfile", "docker-compose.yml"]
  }
];

async function calculateGitSha1(content: string): Promise<string> {
  const encoder = new TextEncoder();
  const buffer = await crypto.subtle.digest("SHA-1", encoder.encode(content));
  return Array.from(new Uint8Array(buffer)).map(b => b.toString(16).padStart(2, "0")).join("");
}

export const GitBranchGraphStudioAgent: React.FC<GitBranchGraphStudioAgentProps> = ({
  files,
  theme,
  onSaveFile,
  onAddLog
}) => {
  const [commits, setCommits] = useState<GitCommit[]>(DEFAULT_COMMITS);
  const [activeBranch, setActiveBranch] = useState<string>("main");
  const [branches, setBranches] = useState<string[]>(["main", "feature/auth-jwt", "dev"]);
  const [selectedCommitHash, setSelectedCommitHash] = useState<string>("f60718293a4b5c6d7e8f90123456789ab1c2d3e4");

  // Real Workspace Staged Files
  const [stagedFiles, setStagedFiles] = useState<string[]>(() => files.map(f => f.path));
  const [inspectingFilePath, setInspectingFilePath] = useState<string | null>(null);

  // Commit Creator State
  const [commitType, setCommitType] = useState<GitCommit["type"]>("feat");
  const [commitScope, setCommitScope] = useState<string>("core");
  const [commitDesc, setCommitDesc] = useState<string>("update workspace application logic");
  const [commitAuthor, setCommitAuthor] = useState<string>("Developer");

  // New Branch State
  const [newBranchName, setNewBranchName] = useState<string>("");
  const [activeTab, setActiveTab] = useState<"graph" | "commit" | "changelog" | "shell">("graph");

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState<boolean>(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const selectedCommit = useMemo(() => {
    return commits.find(c => c.hash === selectedCommitHash) || commits[commits.length - 1];
  }, [commits, selectedCommitHash]);

  // Branch Color Map
  const getBranchColor = (branch: string) => {
    if (branch === "main" || branch === "master") return { bg: "bg-blue-500", text: "text-blue-400", border: "border-blue-500/40", hex: "#3b82f6" };
    if (branch.startsWith("feature/")) return { bg: "bg-emerald-500", text: "text-emerald-400", border: "border-emerald-500/40", hex: "#10b981" };
    if (branch === "dev" || branch === "develop") return { bg: "bg-purple-500", text: "text-purple-400", border: "border-purple-500/40", hex: "#a855f7" };
    if (branch.startsWith("hotfix/")) return { bg: "bg-rose-500", text: "text-rose-400", border: "border-rose-500/40", hex: "#f43f5e" };
    return { bg: "bg-amber-500", text: "text-amber-400", border: "border-amber-500/40", hex: "#f59e0b" };
  };

  // Commit Type Badges
  const getTypeBadgeClass = (type: GitCommit["type"]) => {
    switch (type) {
      case "feat":
        return "bg-emerald-500/20 text-emerald-300 border-emerald-500/30";
      case "fix":
        return "bg-rose-500/20 text-rose-300 border-rose-500/30";
      case "perf":
        return "bg-cyan-500/20 text-cyan-300 border-cyan-500/30";
      case "refactor":
        return "bg-purple-500/20 text-purple-300 border-purple-500/30";
      case "merge":
        return "bg-blue-500/20 text-blue-300 border-blue-500/30";
      default:
        return "bg-slate-500/20 text-slate-300 border-slate-500/30";
    }
  };

  // Handle Real Commit Creation
  const handleCreateCommit = async () => {
    if (!commitDesc.trim()) return;

    const fullMessage = `${commitType}${commitScope ? `(${commitScope})` : ""}: ${commitDesc.trim()}`;
    const branchCommits = commits.filter(c => c.branch === activeBranch);
    const parentHash = branchCommits.length > 0 ? branchCommits[branchCommits.length - 1].hash : commits[commits.length - 1].hash;

    // Snapshot of staged files
    const snapshot: Record<string, string> = {};
    const effectiveFiles = stagedFiles.length > 0 ? stagedFiles : files.map(f => f.path);
    files.forEach(f => {
      if (effectiveFiles.includes(f.path)) {
        snapshot[f.path] = f.content || "";
      }
    });

    const commitRawContent = `commit\nparent ${parentHash}\nauthor ${commitAuthor} <${commitAuthor.toLowerCase().replace(/\s+/g, ".")}@example.com> ${Date.now()}\n\n${fullMessage}\nfiles:\n${effectiveFiles.join("\n")}`;
    const fullHash = await calculateGitSha1(commitRawContent);
    const shortHash = fullHash.substring(0, 7);

    const newCommit: GitCommit = {
      hash: fullHash,
      shortHash,
      branch: activeBranch,
      parentHashes: [parentHash],
      author: commitAuthor,
      email: `${commitAuthor.toLowerCase().replace(/\s+/g, ".")}@example.com`,
      timestamp: Date.now(),
      message: fullMessage,
      type: commitType,
      filesChanged: effectiveFiles,
      fileSnapshots: snapshot
    };

    setCommits(prev => [...prev, newCommit]);
    setSelectedCommitHash(fullHash);
    setCommitDesc("");
    showToast(`✅ Created commit ${shortHash} with ${effectiveFiles.length} files!`);
    if (onAddLog) onAddLog("commit", `Git commit on [${activeBranch}]: ${fullMessage} (${shortHash})`);
  };

  // Restore workspace files to a specific commit snapshot
  const handleRestoreCommit = (commit: GitCommit) => {
    if (!commit.fileSnapshots || !onSaveFile) {
      showToast("No file snapshot available for this historical commit.");
      return;
    }
    const paths = Object.keys(commit.fileSnapshots);
    paths.forEach(p => {
      onSaveFile(p, commit.fileSnapshots![p]);
    });
    showToast(`🎉 Restored workspace to commit ${commit.shortHash} (${paths.length} files)!`);
    if (onAddLog) onAddLog("checkout", `Restored workspace files from git commit ${commit.shortHash}`);
  };

  // Create New Branch
  const handleCreateBranch = () => {
    if (!newBranchName.trim()) return;
    const clean = newBranchName.trim().replace(/\s+/g, "-");
    if (!branches.includes(clean)) {
      setBranches(prev => [...prev, clean]);
      setActiveBranch(clean);
      setNewBranchName("");
      showToast(`Created & switched to branch "${clean}"!`);
      if (onAddLog) onAddLog("branch", `Created new branch "${clean}"`);
    } else {
      showToast(`Branch "${clean}" already exists.`);
    }
  };

  // Merge Branch into Active Branch
  const handleMergeBranch = (sourceBranch: string) => {
    if (sourceBranch === activeBranch) {
      showToast("Cannot merge branch into itself.");
      return;
    }

    const hashBytes = crypto.getRandomValues(new Uint8Array(20));
    const fullHash = Array.from(hashBytes).map(b => b.toString(16).padStart(2, "0")).join("");
    const shortHash = fullHash.substring(0, 7);

    const targetBranchLatest = commits.filter(c => c.branch === activeBranch).slice(-1)[0]?.hash || commits[commits.length - 1].hash;
    const sourceBranchLatest = commits.filter(c => c.branch === sourceBranch).slice(-1)[0]?.hash || targetBranchLatest;

    const mergeCommit: GitCommit = {
      hash: fullHash,
      shortHash,
      branch: activeBranch,
      parentHashes: [targetBranchLatest, sourceBranchLatest],
      author: commitAuthor,
      email: `${commitAuthor.toLowerCase().replace(/\s+/g, ".")}@example.com`,
      timestamp: Date.now(),
      message: `merge: merge branch '${sourceBranch}' into ${activeBranch}`,
      type: "merge",
      filesChanged: ["src/App.tsx", "package.json"]
    };

    setCommits(prev => [...prev, mergeCommit]);
    setSelectedCommitHash(fullHash);
    showToast(`Merged '${sourceBranch}' into '${activeBranch}'!`);
    if (onAddLog) onAddLog("merge", `Merged branch ${sourceBranch} into ${activeBranch}`);
  };

  // Generated Markdown Changelog
  const generatedChangelog = useMemo(() => {
    const lines: string[] = [
      `# Changelog`,
      ``,
      `All notable changes to this project are documented in this file.`,
      ``,
      `## [Unreleased] - ${new Date().toISOString().split("T")[0]}`,
      ``
    ];

    const feats = commits.filter(c => c.type === "feat");
    const fixes = commits.filter(c => c.type === "fix");
    const perfs = commits.filter(c => c.type === "perf");
    const others = commits.filter(c => c.type !== "feat" && c.type !== "fix" && c.type !== "perf");

    if (feats.length > 0) {
      lines.push(`### 🚀 Features`);
      feats.forEach(c => lines.push(`- **${c.shortHash}** ${c.message} (${c.author})`));
      lines.push(``);
    }

    if (fixes.length > 0) {
      lines.push(`### 🐛 Bug Fixes`);
      fixes.forEach(c => lines.push(`- **${c.shortHash}** ${c.message} (${c.author})`));
      lines.push(``);
    }

    if (perfs.length > 0) {
      lines.push(`### ⚡ Performance & Optimization`);
      perfs.forEach(c => lines.push(`- **${c.shortHash}** ${c.message} (${c.author})`));
      lines.push(``);
    }

    if (others.length > 0) {
      lines.push(`### 🔧 Maintenance & Chores`);
      others.forEach(c => lines.push(`- **${c.shortHash}** ${c.message} (${c.author})`));
      lines.push(``);
    }

    return lines.join("\n");
  }, [commits]);

  // Generated Shell Commands to Replicate Tree
  const generatedShellScript = useMemo(() => {
    const lines: string[] = [
      `#!/usr/bin/env bash`,
      `# Git Tree Replication Script`,
      `# Generated by Remix Studio Git Branch Architect`,
      ``,
      `set -e`,
      `git init`,
      `git config user.name "${commitAuthor}"`,
      `git config user.email "alex@remixstudio.dev"`,
      ``
    ];

    commits.forEach(c => {
      if (c.type === "merge" && c.parentHashes.length > 1) {
        lines.push(`# Merge Commit`);
        lines.push(`git checkout ${c.branch}`);
        lines.push(`git merge --no-ff -m "${c.message}"`);
      } else {
        lines.push(`git checkout -B ${c.branch}`);
        lines.push(`git commit --allow-empty -m "${c.message}"`);
      }
      lines.push(``);
    });

    lines.push(`echo "Git repository structure configured successfully!"`);
    return lines.join("\n");
  }, [commits, commitAuthor]);

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
        <div className="absolute top-4 right-6 z-50 px-4 py-2 bg-blue-600 text-white text-xs font-semibold rounded-lg shadow-xl border border-blue-400/40 flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-200">
          <CheckCircle2 className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Bar */}
      <div className={`px-5 py-3 border-b flex flex-wrap items-center justify-between gap-4 ${theme === "dark" ? "bg-slate-900/90 border-slate-800" : "bg-white border-slate-200"}`}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20 text-white">
            <GitBranch className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold tracking-tight">Git Branch Graph & Commit Architect</h1>
              <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
                GitLens Suite
              </span>
              <span className="text-xs text-slate-400">({commits.length} Commits, {branches.length} Branches)</span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              Interactive visual branch tree, conventional commit manager, merge simulator & changelog generator
            </p>
          </div>
        </div>

        {/* Global Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          {onSaveFile && (
            <button
              onClick={() => {
                onSaveFile("CHANGELOG.md", generatedChangelog);
                showToast("Saved CHANGELOG.md to project workspace!");
                if (onAddLog) onAddLog("create", "Saved CHANGELOG.md from Git history.");
              }}
              className="px-3 py-1.5 text-xs font-medium rounded-lg bg-blue-600 hover:bg-blue-500 text-white flex items-center gap-1.5 shadow-md shadow-blue-600/20 transition-all"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save CHANGELOG.md</span>
            </button>
          )}

          <button
            onClick={() => handleCopy(generatedChangelog, "Changelog")}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg border flex items-center gap-1.5 transition-all ${
              theme === "dark" ? "bg-slate-800 border-slate-700 hover:bg-slate-700 text-slate-200" : "bg-white border-slate-300 hover:bg-slate-100 text-slate-800"
            }`}
          >
            {isCopied ? <Check className="w-3.5 h-3.5 text-blue-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>Export Changelog</span>
          </button>
        </div>
      </div>

      {/* Sub-header Navigation Bar */}
      <div className={`px-5 py-2 border-b flex items-center justify-between gap-4 text-xs ${theme === "dark" ? "bg-slate-900/50 border-slate-800" : "bg-slate-100/70 border-slate-200"}`}>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setActiveTab("graph")}
            className={`px-3 py-1.5 rounded-md font-medium flex items-center gap-1.5 transition-colors ${
              activeTab === "graph"
                ? theme === "dark" ? "bg-slate-800 text-white shadow-sm" : "bg-white text-slate-900 shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <GitCommitIcon className="w-3.5 h-3.5 text-blue-400" />
            <span>Interactive Commit Graph</span>
          </button>
          <button
            onClick={() => setActiveTab("commit")}
            className={`px-3 py-1.5 rounded-md font-medium flex items-center gap-1.5 transition-colors ${
              activeTab === "commit"
                ? theme === "dark" ? "bg-slate-800 text-white shadow-sm" : "bg-white text-slate-900 shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Plus className="w-3.5 h-3.5 text-emerald-400" />
            <span>Conventional Commit Creator</span>
          </button>
          <button
            onClick={() => setActiveTab("changelog")}
            className={`px-3 py-1.5 rounded-md font-medium flex items-center gap-1.5 transition-colors ${
              activeTab === "changelog"
                ? theme === "dark" ? "bg-slate-800 text-white shadow-sm" : "bg-white text-slate-900 shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <FileCode className="w-3.5 h-3.5 text-purple-400" />
            <span>CHANGELOG.md</span>
          </button>
          <button
            onClick={() => setActiveTab("shell")}
            className={`px-3 py-1.5 rounded-md font-medium flex items-center gap-1.5 transition-colors ${
              activeTab === "shell"
                ? theme === "dark" ? "bg-slate-800 text-white shadow-sm" : "bg-white text-slate-900 shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Terminal className="w-3.5 h-3.5 text-amber-400" />
            <span>Git Setup Script</span>
          </button>
        </div>

        {/* Active Branch Badge & Selector */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-slate-400 flex items-center gap-1">
            <GitBranch className="w-3 h-3 text-blue-400" /> Current Branch:
          </span>
          <select
            value={activeBranch}
            onChange={e => {
              setActiveBranch(e.target.value);
              showToast(`Switched active branch to "${e.target.value}"`);
            }}
            className={`px-2 py-1 text-xs rounded border font-mono font-bold ${
              theme === "dark" ? "bg-slate-800 border-slate-700 text-blue-400" : "bg-white border-slate-300 text-blue-700"
            }`}
          >
            {branches.map(b => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* VIEW 1: INTERACTIVE COMMIT GRAPH */}
        {activeTab === "graph" && (
          <div className="flex-1 flex flex-col md:flex-row h-full overflow-hidden">
            {/* Left Column: Visual Commit Tree Table */}
            <div className={`w-full md:w-7/12 flex flex-col border-r h-full overflow-y-auto ${theme === "dark" ? "border-slate-800" : "border-slate-200"}`}>
              <div className="p-3 border-b flex items-center justify-between text-xs text-slate-400 font-semibold uppercase tracking-wider">
                <span>Commit History Timeline</span>
                <span>Branch & Hash</span>
              </div>

              <div className="divide-y divide-slate-800/60 p-2 space-y-1">
                {commits.slice().reverse().map((commit, idx) => {
                  const isSelected = commit.hash === selectedCommitHash;
                  const bStyle = getBranchColor(commit.branch);

                  return (
                    <div
                      key={commit.hash}
                      onClick={() => setSelectedCommitHash(commit.hash)}
                      className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                        isSelected
                          ? "bg-slate-800/90 border-blue-500/70 shadow-sm"
                          : theme === "dark"
                          ? "bg-slate-900/60 border-slate-800 hover:bg-slate-800/40"
                          : "bg-white border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      <div className="flex items-start gap-3 min-w-0">
                        {/* Visual Node */}
                        <div className="flex flex-col items-center pt-1">
                          <div className={`w-3.5 h-3.5 rounded-full ${bStyle.bg} ring-4 ring-slate-900 shrink-0`} />
                          {idx !== commits.length - 1 && (
                            <div className="w-0.5 h-8 bg-slate-700 my-0.5" />
                          )}
                        </div>

                        <div className="min-w-0 space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={`px-2 py-0.2 rounded text-[10px] font-bold uppercase border ${getTypeBadgeClass(commit.type)}`}>
                              {commit.type}
                            </span>
                            <span className="text-xs font-semibold text-slate-200 truncate">
                              {commit.message}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-[10px] text-slate-400">
                            <span className="flex items-center gap-1">
                              <User className="w-3 h-3 text-slate-500" /> {commit.author}
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3 text-slate-500" /> {new Date(commit.timestamp).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="text-right shrink-0 space-y-1">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${bStyle.border} ${bStyle.text}`}>
                          {commit.branch}
                        </span>
                        <div className="font-mono text-[10px] text-slate-500 select-all">
                          {commit.shortHash}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right Column: Selected Commit Inspector & Branch Manager */}
            <div className="w-full md:w-5/12 flex flex-col h-full overflow-y-auto p-5 space-y-5">
              {/* Selected Commit Card */}
              {selectedCommit && (
                <div className={`p-4 rounded-xl border space-y-3 ${theme === "dark" ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"}`}>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Commit Inspection
                    </span>
                    <span className="font-mono text-xs text-blue-400 font-bold">
                      {selectedCommit.shortHash}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-100 leading-snug">
                    {selectedCommit.message}
                  </h3>

                  <div className="text-xs space-y-1 text-slate-400 pt-2 border-t border-slate-800">
                    <div className="flex justify-between">
                      <span>Author:</span>
                      <span className="text-slate-200 font-medium">{selectedCommit.author}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Branch:</span>
                      <span className="font-mono text-blue-400 font-semibold">{selectedCommit.branch}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Full Hash:</span>
                      <span className="font-mono text-[10px] text-slate-400 truncate max-w-[180px] select-all">{selectedCommit.hash}</span>
                    </div>
                  </div>

                  {/* Changed Files & Snapshots */}
                  <div className="space-y-1.5 pt-2 border-t border-slate-800">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-slate-400 uppercase">Changed Files ({selectedCommit.filesChanged.length})</span>
                      {selectedCommit.fileSnapshots && onSaveFile && (
                        <button
                          onClick={() => handleRestoreCommit(selectedCommit)}
                          className="px-2 py-0.5 text-[10px] font-bold rounded bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-1 shadow-xs"
                          title="Restore all files in this commit into your workspace"
                        >
                          <RotateCcw className="w-3 h-3" /> Restore Workspace
                        </button>
                      )}
                    </div>
                    <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
                      {selectedCommit.filesChanged.map(f => (
                        <div
                          key={f}
                          onClick={() => setInspectingFilePath(inspectingFilePath === f ? null : f)}
                          className={`px-2.5 py-1.5 rounded cursor-pointer transition-all flex items-center justify-between text-[11px] font-mono ${
                            inspectingFilePath === f
                              ? "bg-blue-600/30 text-blue-300 border border-blue-500/40"
                              : "bg-slate-800/60 hover:bg-slate-800 text-slate-300"
                          }`}
                        >
                          <span className="truncate">{f}</span>
                          {selectedCommit.fileSnapshots && selectedCommit.fileSnapshots[f] && (
                            <span className="text-[9px] px-1 py-0.5 rounded bg-blue-500/20 text-blue-400">Preview</span>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Inspected File Preview */}
                    {inspectingFilePath && selectedCommit.fileSnapshots && selectedCommit.fileSnapshots[inspectingFilePath] && (
                      <div className="mt-2 p-2.5 rounded bg-slate-950 border border-slate-800 text-[10px] font-mono max-h-40 overflow-y-auto">
                        <div className="flex items-center justify-between pb-1 border-b border-slate-800 mb-1 text-slate-400 font-bold">
                          <span>{inspectingFilePath}</span>
                          {onSaveFile && (
                            <button
                              onClick={() => {
                                onSaveFile(inspectingFilePath, selectedCommit.fileSnapshots![inspectingFilePath]);
                                showToast(`Restored ${inspectingFilePath}`);
                              }}
                              className="text-emerald-400 hover:underline"
                            >
                              Restore this file
                            </button>
                          )}
                        </div>
                        <pre className="text-slate-300 whitespace-pre-wrap leading-relaxed">
                          {selectedCommit.fileSnapshots[inspectingFilePath].slice(0, 1500)}
                          {selectedCommit.fileSnapshots[inspectingFilePath].length > 1500 ? "\n... (truncated)" : ""}
                        </pre>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Branch Operations Card */}
              <div className={`p-4 rounded-xl border space-y-4 ${theme === "dark" ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"}`}>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <GitBranch className="w-3.5 h-3.5 text-blue-400" />
                  Branch Management
                </h3>

                {/* Create Branch */}
                <div className="space-y-1.5 text-xs">
                  <label className="text-slate-400 block font-semibold">Create New Branch from HEAD</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="e.g. feature/oauth-sync"
                      value={newBranchName}
                      onChange={e => setNewBranchName(e.target.value)}
                      className={`flex-1 px-3 py-1.5 rounded-lg border font-mono text-xs ${
                        theme === "dark" ? "bg-slate-800 border-slate-700 text-white" : "bg-slate-100 border-slate-300 text-slate-800"
                      }`}
                    />
                    <button
                      onClick={handleCreateBranch}
                      className="px-3 py-1.5 rounded-lg font-semibold bg-blue-600 hover:bg-blue-500 text-white flex items-center gap-1 shadow"
                    >
                      <Plus className="w-3.5 h-3.5" /> Create
                    </button>
                  </div>
                </div>

                {/* Merge Branch into Current */}
                <div className="space-y-1.5 text-xs pt-2 border-t border-slate-800">
                  <label className="text-slate-400 block font-semibold">Merge another branch into '{activeBranch}'</label>
                  <div className="flex gap-2">
                    <select
                      id="merge-select"
                      className={`flex-1 px-2.5 py-1.5 rounded-lg border font-mono text-xs ${
                        theme === "dark" ? "bg-slate-800 border-slate-700 text-slate-300" : "bg-white border-slate-300 text-slate-800"
                      }`}
                    >
                      {branches
                        .filter(b => b !== activeBranch)
                        .map(b => (
                          <option key={b} value={b}>
                            {b}
                          </option>
                        ))}
                    </select>
                    <button
                      onClick={() => {
                        const selectEl = document.getElementById("merge-select") as HTMLSelectElement;
                        if (selectEl?.value) handleMergeBranch(selectEl.value);
                      }}
                      className="px-3 py-1.5 rounded-lg font-semibold bg-purple-600 hover:bg-purple-500 text-white flex items-center gap-1 shadow"
                    >
                      <GitMerge className="w-3.5 h-3.5" /> Merge
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* VIEW 2: CONVENTIONAL COMMIT CREATOR */}
        {activeTab === "commit" && (
          <div className="flex-1 flex flex-col h-full overflow-y-auto p-5 space-y-5 max-w-2xl">
            <div>
              <h2 className="text-sm font-bold">Conventional Commit Builder</h2>
              <p className="text-xs text-slate-400">Generate structured, changelog-ready commits adhering to Conventional Commits 1.0.0</p>
            </div>

            <div className={`p-5 rounded-xl border space-y-4 ${theme === "dark" ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"}`}>
              {/* Type & Scope */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="text-slate-400 block mb-1 font-semibold">Commit Type</label>
                  <select
                    value={commitType}
                    onChange={e => setCommitType(e.target.value as any)}
                    className={`w-full px-3 py-1.5 rounded-lg border font-mono ${
                      theme === "dark" ? "bg-slate-800 border-slate-700 text-white" : "bg-slate-100 border-slate-300 text-slate-800"
                    }`}
                  >
                    <option value="feat">feat (New feature)</option>
                    <option value="fix">fix (Bug fix)</option>
                    <option value="perf">perf (Performance boost)</option>
                    <option value="refactor">refactor (Code restructuring)</option>
                    <option value="chore">chore (Maintenance / dependencies)</option>
                    <option value="docs">docs (Documentation changes)</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-400 block mb-1 font-semibold">Scope (optional)</label>
                  <input
                    type="text"
                    value={commitScope}
                    onChange={e => setCommitScope(e.target.value)}
                    placeholder="e.g. auth, api, ui"
                    className={`w-full px-3 py-1.5 rounded-lg border font-mono ${
                      theme === "dark" ? "bg-slate-800 border-slate-700 text-white" : "bg-slate-100 border-slate-300 text-slate-800"
                    }`}
                  />
                </div>
              </div>

              {/* Message Description */}
              <div className="text-xs">
                <label className="text-slate-400 block mb-1 font-semibold">Short Description (imperative mood)</label>
                <input
                  type="text"
                  value={commitDesc}
                  onChange={e => setCommitDesc(e.target.value)}
                  placeholder="e.g. add support for OAuth PKCE token exchange"
                  className={`w-full px-3 py-2 rounded-lg border font-medium ${
                    theme === "dark" ? "bg-slate-800 border-slate-700 text-white" : "bg-slate-100 border-slate-300 text-slate-800"
                  }`}
                />
              </div>

              {/* Workspace File Staging Checklist */}
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <label className="text-slate-400 font-semibold flex items-center gap-1.5">
                    <span>Stage Files for this Commit</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 font-bold">
                      {stagedFiles.length}/{files.length} Staged
                    </span>
                  </label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setStagedFiles(files.map(f => f.path))}
                      className="text-[10px] text-blue-400 hover:underline"
                    >
                      Stage All
                    </button>
                    <button
                      type="button"
                      onClick={() => setStagedFiles([])}
                      className="text-[10px] text-slate-500 hover:underline"
                    >
                      Unstage All
                    </button>
                  </div>
                </div>

                <div className="max-h-36 overflow-y-auto border border-slate-800 rounded-lg p-2 space-y-1 bg-slate-950/50">
                  {files.map(file => {
                    const isStaged = stagedFiles.includes(file.path);
                    return (
                      <label
                        key={file.path}
                        className="flex items-center gap-2 p-1 rounded hover:bg-slate-800/50 cursor-pointer font-mono text-[11px]"
                      >
                        <input
                          type="checkbox"
                          checked={isStaged}
                          onChange={e => {
                            if (e.target.checked) {
                              setStagedFiles(prev => [...prev, file.path]);
                            } else {
                              setStagedFiles(prev => prev.filter(p => p !== file.path));
                            }
                          }}
                          className="rounded border-slate-700 text-blue-500 focus:ring-0"
                        />
                        <span className={isStaged ? "text-slate-200" : "text-slate-500"}>{file.path}</span>
                        <span className="text-[10px] text-slate-600 ml-auto">{file.content?.length || 0} bytes</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Live Preview */}
              <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800 font-mono text-xs text-blue-400">
                <span className="text-slate-500 block text-[10px] mb-1">Generated Commit Message:</span>
                {commitType}{commitScope ? `(${commitScope})` : ""}: {commitDesc || "..."}
              </div>

              <button
                onClick={handleCreateCommit}
                className="w-full py-2.5 rounded-lg font-semibold text-xs bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center gap-2 shadow"
              >
                <GitCommitIcon className="w-4 h-4" />
                <span>Commit {stagedFiles.length} files to '{activeBranch}' Branch</span>
              </button>
            </div>
          </div>
        )}

        {/* VIEW 3: CHANGELOG.MD */}
        {activeTab === "changelog" && (
          <div className="flex-1 flex flex-col h-full overflow-hidden p-5">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="text-sm font-bold">Generated Project Changelog (CHANGELOG.md)</h2>
                <p className="text-xs text-slate-400">Categorized by conventional commit types</p>
              </div>
              <div className="flex items-center gap-2">
                {onSaveFile && (
                  <button
                    onClick={() => {
                      onSaveFile("CHANGELOG.md", generatedChangelog);
                      showToast("Saved CHANGELOG.md to workspace!");
                      if (onAddLog) onAddLog("create", "Saved CHANGELOG.md to workspace.");
                    }}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium bg-purple-600 hover:bg-purple-500 text-white flex items-center gap-1.5 shadow"
                  >
                    <Save className="w-3.5 h-3.5" /> Save to Workspace
                  </button>
                )}
                <button
                  onClick={() => handleCopy(generatedChangelog, "Changelog")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border flex items-center gap-1.5 ${
                    theme === "dark" ? "bg-slate-800 border-slate-700 text-slate-200" : "bg-white border-slate-300 text-slate-800"
                  }`}
                >
                  <Copy className="w-3.5 h-3.5" /> Copy Markdown
                </button>
              </div>
            </div>
            <pre className={`flex-1 p-4 rounded-xl font-mono text-xs overflow-auto border ${
              theme === "dark" ? "bg-slate-900 border-slate-800 text-purple-300" : "bg-slate-100 border-slate-300 text-slate-800"
            }`}>
              {generatedChangelog}
            </pre>
          </div>
        )}

        {/* VIEW 4: SHELL REPLICATION SCRIPT */}
        {activeTab === "shell" && (
          <div className="flex-1 flex flex-col h-full overflow-hidden p-5">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="text-sm font-bold">Git Bash Replication Script (setup-git.sh)</h2>
                <p className="text-xs text-slate-400">Run this script locally to reconstruct this branch history</p>
              </div>
              <button
                onClick={() => handleCopy(generatedShellScript, "Shell Script")}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border flex items-center gap-1.5 ${
                  theme === "dark" ? "bg-slate-800 border-slate-700 text-slate-200" : "bg-white border-slate-300 text-slate-800"
                }`}
              >
                <Copy className="w-3.5 h-3.5" /> Copy Script
              </button>
            </div>
            <pre className={`flex-1 p-4 rounded-xl font-mono text-xs overflow-auto border ${
              theme === "dark" ? "bg-slate-900 border-slate-800 text-amber-300" : "bg-slate-100 border-slate-300 text-slate-800"
            }`}>
              {generatedShellScript}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default GitBranchGraphStudioAgent;
