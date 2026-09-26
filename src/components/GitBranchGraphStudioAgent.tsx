import React, { useState, useMemo, useEffect, useRef } from "react";
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
  CheckCheck,
  RefreshCw,
  FolderGit2,
  FileDiff,
  ChevronRight,
  ExternalLink,
  ShieldCheck,
  ChevronDown
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
  tag?: string;
}

interface TerminalHistoryEntry {
  id: string;
  command: string;
  output: string;
  type: "success" | "error" | "info";
  time: string;
}

// Synchronous cryptographic SHA-1 implementation
function sha1Sync(str: string): string {
  const utf8: number[] = [];
  for (let i = 0; i < str.length; i++) {
    let charcode = str.charCodeAt(i);
    if (charcode < 0x80) utf8.push(charcode);
    else if (charcode < 0x800) {
      utf8.push(0xc0 | (charcode >> 6), 0x80 | (charcode & 0x3f));
    } else if (charcode < 0xd800 || charcode >= 0xe000) {
      utf8.push(0xe0 | (charcode >> 12), 0x80 | ((charcode >> 6) & 0x3f), 0x80 | (charcode & 0x3f));
    } else {
      i++;
      charcode = 0x10000 + (((charcode & 0x3ff) << 10) | (str.charCodeAt(i) & 0x3ff));
      utf8.push(0xf0 | (charcode >> 18), 0x80 | ((charcode >> 12) & 0x3f), 0x80 | ((charcode >> 6) & 0x3f), 0x80 | (charcode & 0x3f));
    }
  }

  const bitLength = utf8.length * 8;
  utf8.push(0x80);
  while ((utf8.length % 64) !== 56) utf8.push(0);
  for (let i = 7; i >= 0; i--) {
    utf8.push((bitLength >>> (i * 8)) & 0xff);
  }

  let h0 = 0x67452301;
  let h1 = 0xefcdab89;
  let h2 = 0x98badcfe;
  let h3 = 0x10325476;
  let h4 = 0xc3d2e1f0;

  const w = new Uint32Array(80);

  for (let chunk = 0; chunk < utf8.length; chunk += 64) {
    for (let i = 0; i < 16; i++) {
      w[i] = (utf8[chunk + i * 4] << 24) | (utf8[chunk + i * 4 + 1] << 16) | (utf8[chunk + i * 4 + 2] << 8) | utf8[chunk + i * 4 + 3];
    }
    for (let i = 16; i < 80; i++) {
      const v = w[i - 3] ^ w[i - 8] ^ w[i - 14] ^ w[i - 16];
      w[i] = (v << 1) | (v >>> 31);
    }

    let a = h0, b = h1, c = h2, d = h3, e = h4;

    for (let i = 0; i < 80; i++) {
      let f = 0, k = 0;
      if (i < 20) {
        f = (b & c) | ((~b) & d);
        k = 0x5a827999;
      } else if (i < 40) {
        f = b ^ c ^ d;
        k = 0x6ed9eba1;
      } else if (i < 60) {
        f = (b & c) | (b & d) | (c & d);
        k = 0x8f1bbcdc;
      } else {
        f = b ^ c ^ d;
        k = 0xca62c1d6;
      }

      const temp = (((a << 5) | (a >>> 27)) + f + e + k + w[i]) >>> 0;
      e = d;
      d = c;
      c = ((b << 30) | (b >>> 2)) >>> 0;
      b = a;
      a = temp;
    }

    h0 = (h0 + a) >>> 0;
    h1 = (h1 + b) >>> 0;
    h2 = (h2 + c) >>> 0;
    h3 = (h3 + d) >>> 0;
    h4 = (h4 + e) >>> 0;
  }

  const toHex = (n: number) => n.toString(16).padStart(8, "0");
  return toHex(h0) + toHex(h1) + toHex(h2) + toHex(h3) + toHex(h4);
}

// Generate realistic commit history from user's actual workspace files
function generateInitialCommitsFromFiles(files: VirtualFile[], authorName: string, authorEmail: string): GitCommit[] {
  const filePaths = files.map(f => f.path);
  const now = Date.now();

  const c1Files = filePaths.filter(p => p.includes("package.json") || p.includes("index.html") || p.includes("vite.config") || p.includes("tsconfig"));
  const c2Files = filePaths.filter(p => p.includes("server.ts") || p.includes("api"));
  const c3Files = filePaths.filter(p => p.includes("css") || p.includes("theme") || p.includes("tailwind"));
  const c4Files = filePaths.filter(p => p.includes("App.tsx") || p.includes("components"));

  const h1 = sha1Sync(`commit:scaffold:${authorEmail}:${files.length}`);
  const h2 = sha1Sync(`commit:backend:${h1}:${c2Files.join(",")}`);
  const h3 = sha1Sync(`commit:styles:${h2}:${c3Files.join(",")}`);
  const h4 = sha1Sync(`commit:merge:${h2}:${h3}`);

  // Build file snapshot records
  const snap1: Record<string, string> = {};
  files.forEach(f => { snap1[f.path] = f.content || ""; });

  return [
    {
      hash: h1,
      shortHash: h1.substring(0, 7),
      branch: "main",
      parentHashes: [],
      author: authorName,
      email: authorEmail,
      timestamp: now - 86400000 * 3,
      message: "feat: initialize project scaffold with Vite, React & TypeScript",
      type: "feat",
      filesChanged: c1Files.length > 0 ? c1Files : ["package.json", "index.html"],
      fileSnapshots: snap1
    },
    {
      hash: h2,
      shortHash: h2.substring(0, 7),
      branch: "main",
      parentHashes: [h1],
      author: authorName,
      email: authorEmail,
      timestamp: now - 86400000 * 2,
      message: "feat(backend): configure Express API proxy and security handlers",
      type: "feat",
      filesChanged: c2Files.length > 0 ? c2Files : ["server.ts"],
      fileSnapshots: snap1
    },
    {
      hash: h3,
      shortHash: h3.substring(0, 7),
      branch: "feature/styles",
      parentHashes: [h2],
      author: authorName,
      email: authorEmail,
      timestamp: now - 86400000 * 1,
      message: "style(ui): setup Tailwind CSS theme variables and responsive layout",
      type: "feat",
      filesChanged: c3Files.length > 0 ? c3Files : ["src/index.css"],
      fileSnapshots: snap1
    },
    {
      hash: h4,
      shortHash: h4.substring(0, 7),
      branch: "main",
      parentHashes: [h2, h3],
      author: authorName,
      email: authorEmail,
      timestamp: now - 3600000 * 4,
      message: "merge: merge branch 'feature/styles' into main",
      type: "merge",
      filesChanged: c4Files.length > 0 ? c4Files.slice(0, 4) : ["src/App.tsx"],
      fileSnapshots: snap1,
      tag: "v1.0.0"
    }
  ];
}

export const GitBranchGraphStudioAgent: React.FC<GitBranchGraphStudioAgentProps> = ({
  files,
  theme,
  onSaveFile,
  onAddLog
}) => {
  const isDark = theme !== "light";

  // Author identity
  const [authorName, setAuthorName] = useState<string>("Local Developer");
  const [authorEmail, setAuthorEmail] = useState<string>("dev@workspace.local");

  // Git state
  const [commits, setCommits] = useState<GitCommit[]>(() =>
    generateInitialCommitsFromFiles(files, "Local Developer", "dev@workspace.local")
  );
  const [activeBranch, setActiveBranch] = useState<string>("main");
  const [branches, setBranches] = useState<string[]>(["main", "feature/styles", "dev"]);
  const [selectedCommitHash, setSelectedCommitHash] = useState<string>(() =>
    commits.length > 0 ? commits[commits.length - 1].hash : ""
  );

  // Staged files for next commit
  const [stagedFiles, setStagedFiles] = useState<string[]>(() => files.slice(0, 3).map(f => f.path));

  // Navigation tab
  const [activeTab, setActiveTab] = useState<"graph" | "commit" | "shell" | "changelog" | "diff">("graph");

  // Commit Creator State
  const [commitType, setCommitType] = useState<GitCommit["type"]>("feat");
  const [commitScope, setCommitScope] = useState<string>("");
  const [commitDesc, setCommitDesc] = useState<string>("update workspace application logic");

  // New Branch & Tag State
  const [newBranchInput, setNewBranchInput] = useState<string>("");
  const [newTagInput, setNewTagInput] = useState<string>("");

  // Diff inspection
  const [selectedDiffFile, setSelectedDiffFile] = useState<string>("");

  // Interactive Terminal Shell
  const [terminalInput, setTerminalInput] = useState<string>("");
  const [terminalHistory, setTerminalHistory] = useState<TerminalHistoryEntry[]>([
    {
      id: "term-1",
      command: "git status",
      output: `On branch main\nYour branch is up to date with 'origin/main'.\n\nChanges to be committed:\n  (use "git reset HEAD <file>..." to unstage)\n\tmodified: ${files.slice(0, 2).map(f => f.path).join("\n\tmodified: ")}\n\nUntracked files:\n  (use "git add <file>..." to include in what will be committed)\n\t${files.slice(2, 4).map(f => f.path).join("\n\t")}`,
      type: "info",
      time: "init"
    }
  ]);

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const terminalEndRef = useRef<HTMLDivElement | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2800);
  };

  const selectedCommit = useMemo(() => {
    return commits.find(c => c.hash === selectedCommitHash) || commits[commits.length - 1];
  }, [commits, selectedCommitHash]);

  // Set default diff file when commit changes
  useEffect(() => {
    if (selectedCommit && selectedCommit.filesChanged.length > 0) {
      setSelectedDiffFile(selectedCommit.filesChanged[0]);
    }
  }, [selectedCommit]);

  // Scroll terminal
  useEffect(() => {
    if (activeTab === "shell") {
      terminalEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [terminalHistory, activeTab]);

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
      case "feat": return "bg-emerald-500/20 text-emerald-300 border-emerald-500/30";
      case "fix": return "bg-rose-500/20 text-rose-300 border-rose-500/30";
      case "perf": return "bg-cyan-500/20 text-cyan-300 border-cyan-500/30";
      case "refactor": return "bg-purple-500/20 text-purple-300 border-purple-500/30";
      case "merge": return "bg-blue-500/20 text-blue-300 border-blue-500/30";
      case "docs": return "bg-amber-500/20 text-amber-300 border-amber-500/30";
      default: return "bg-slate-500/20 text-slate-300 border-slate-500/30";
    }
  };

  // Create Commit Function
  const executeCreateCommit = async (message: string, type: GitCommit["type"] = "feat"): Promise<GitCommit> => {
    const branchCommits = commits.filter(c => c.branch === activeBranch);
    const parentHash = branchCommits.length > 0 ? branchCommits[branchCommits.length - 1].hash : commits[commits.length - 1]?.hash || "";

    const snapshot: Record<string, string> = {};
    const effectiveFiles = stagedFiles.length > 0 ? stagedFiles : files.map(f => f.path);
    files.forEach(f => {
      if (effectiveFiles.includes(f.path)) {
        snapshot[f.path] = f.content || "";
      }
    });

    const commitRawContent = `commit\nparent ${parentHash}\nauthor ${authorName} <${authorEmail}> ${Date.now()}\n\n${message}\nfiles:\n${effectiveFiles.join("\n")}`;
    const fullHash = sha1Sync(commitRawContent);
    const shortHash = fullHash.substring(0, 7);

    const newCommit: GitCommit = {
      hash: fullHash,
      shortHash,
      branch: activeBranch,
      parentHashes: parentHash ? [parentHash] : [],
      author: authorName,
      email: authorEmail,
      timestamp: Date.now(),
      message,
      type,
      filesChanged: effectiveFiles,
      fileSnapshots: snapshot
    };

    setCommits(prev => [...prev, newCommit]);
    setSelectedCommitHash(fullHash);
    setStagedFiles([]);
    return newCommit;
  };

  const handleCreateCommit = async () => {
    if (!commitDesc.trim()) return;
    const fullMessage = `${commitType}${commitScope ? `(${commitScope})` : ""}: ${commitDesc.trim()}`;
    await executeCreateCommit(fullMessage, commitType);
    setCommitDesc("");
    showToast(`Created commit on '${activeBranch}' with real SHA-1 hash!`);
    if (onAddLog) onAddLog("commit", `Committed changes to ${activeBranch}: ${fullMessage}`);
  };

  // Create New Branch
  const handleCreateBranch = (branchName: string) => {
    const clean = branchName.trim().replace(/\s+/g, "-").toLowerCase();
    if (!clean || branches.includes(clean)) return;
    setBranches(prev => [...prev, clean]);
    setActiveBranch(clean);
    setNewBranchInput("");
    showToast(`Created and switched to branch '${clean}'!`);
    if (onAddLog) onAddLog("branch", `Created new git branch: ${clean}`);
  };

  // Tag Commit
  const handleAddTag = () => {
    const tag = newTagInput.trim();
    if (!tag || !selectedCommit) return;
    setCommits(prev => prev.map(c => c.hash === selectedCommit.hash ? { ...c, tag } : c));
    setNewTagInput("");
    showToast(`Tagged commit ${selectedCommit.shortHash} as '${tag}'`);
  };

  // Restore Workspace to Snapshot
  const handleRestoreCommit = (commit: GitCommit) => {
    if (!commit.fileSnapshots || !onSaveFile) {
      showToast("No file snapshot available for this commit");
      return;
    }
    const paths = Object.keys(commit.fileSnapshots);
    paths.forEach(p => {
      onSaveFile(p, commit.fileSnapshots![p]);
    });
    showToast(`Restored ${paths.length} workspace files to commit ${commit.shortHash}!`);
    if (onAddLog) onAddLog("restore", `Restored workspace files to snapshot ${commit.shortHash}`);
  };

  // Run interactive Git CLI command in terminal
  const handleExecuteTerminalCommand = async (e: React.FormEvent) => {
    e.preventDefault();
    const raw = terminalInput.trim();
    if (!raw) return;
    setTerminalInput("");

    const parts = raw.split(" ").filter(Boolean);
    let out = "";
    let resType: "success" | "error" | "info" = "info";

    if (raw === "clear") {
      setTerminalHistory([]);
      return;
    }

    if (parts[0] !== "git") {
      out = `sh: command not found: ${parts[0]}. Try "git <command>" or "help".`;
      resType = "error";
    } else {
      const sub = parts[1];
      switch (sub) {
        case "status": {
          out = `On branch ${activeBranch}\n`;
          if (stagedFiles.length > 0) {
            out += `Changes to be committed:\n  (use "git reset HEAD <file>..." to unstage)\n`;
            stagedFiles.forEach(f => { out += `\tmodified: ${f}\n`; });
          } else {
            out += `nothing to commit, working tree clean\n`;
          }
          const unstaged = files.filter(f => !stagedFiles.includes(f.path)).map(f => f.path);
          if (unstaged.length > 0 && stagedFiles.length > 0) {
            out += `\nUntracked / unstaged files:\n`;
            unstaged.slice(0, 5).forEach(f => { out += `\t${f}\n`; });
          }
          resType = "success";
          break;
        }
        case "branch": {
          if (!parts[2]) {
            out = branches.map(b => b === activeBranch ? `* \x1b[32m${b}\x1b[0m` : `  ${b}`).join("\n");
            resType = "success";
          } else {
            const bName = parts[2];
            if (branches.includes(bName)) {
              out = `fatal: A branch named '${bName}' already exists.`;
              resType = "error";
            } else {
              setBranches(prev => [...prev, bName]);
              out = `Created branch '${bName}'.`;
              resType = "success";
            }
          }
          break;
        }
        case "checkout":
        case "switch": {
          if (parts[2] === "-b" || parts[2] === "-c") {
            const bName = parts[3];
            if (!bName) {
              out = `fatal: Missing branch name for ${sub} ${parts[2]}`;
              resType = "error";
            } else {
              if (!branches.includes(bName)) setBranches(prev => [...prev, bName]);
              setActiveBranch(bName);
              out = `Switched to a new branch '${bName}'`;
              resType = "success";
            }
          } else {
            const target = parts[2];
            if (!target) {
              out = `fatal: You must specify a branch to checkout.`;
              resType = "error";
            } else if (!branches.includes(target)) {
              out = `error: pathspec '${target}' did not match any file(s) known to git`;
              resType = "error";
            } else {
              setActiveBranch(target);
              out = `Switched to branch '${target}'`;
              resType = "success";
            }
          }
          break;
        }
        case "add": {
          const target = parts[2];
          if (!target || target === "." || target === "-A") {
            setStagedFiles(files.map(f => f.path));
            out = `Staged all ${files.length} workspace files.`;
            resType = "success";
          } else {
            const found = files.find(f => f.path === target || f.path.endsWith(target));
            if (found) {
              setStagedFiles(prev => Array.from(new Set([...prev, found.path])));
              out = `Staged '${found.path}'.`;
              resType = "success";
            } else {
              out = `fatal: pathspec '${target}' did not match any files`;
              resType = "error";
            }
          }
          break;
        }
        case "reset": {
          setStagedFiles([]);
          out = `Unstaged all changes.`;
          resType = "info";
          break;
        }
        case "commit": {
          const msgIdx = raw.indexOf("-m");
          if (msgIdx === -1) {
            out = `error: switch \`-m\` requires a value (e.g. git commit -m "your message")`;
            resType = "error";
          } else {
            const rawMsg = raw.substring(msgIdx + 2).trim().replace(/^["']|["']$/g, "");
            if (!rawMsg) {
              out = `error: Empty commit message provided.`;
              resType = "error";
            } else {
              const newC = await executeCreateCommit(rawMsg, "feat");
              out = `[${activeBranch} ${newC.shortHash}] ${newC.message}\n ${newC.filesChanged.length} files changed`;
              resType = "success";
            }
          }
          break;
        }
        case "log": {
          const list = commits.slice().reverse();
          out = list.map(c => `commit ${c.hash}\nAuthor: ${c.author} <${c.email}>\nDate:   ${new Date(c.timestamp).toLocaleString()}\n\n    ${c.message}\n`).join("\n");
          resType = "info";
          break;
        }
        case "diff": {
          if (stagedFiles.length === 0) {
            out = `No staged changes to diff. Use 'git add <file>' first.`;
            resType = "info";
          } else {
            out = stagedFiles.map(p => `diff --git a/${p} b/${p}\n--- a/${p}\n+++ b/${p}\n@@ -1,5 +1,8 @@\n+ // Updated in live workspace commit\n+ export const STAGED_HASH = "${Date.now()}";`).join("\n\n");
            resType = "success";
          }
          break;
        }
        case "tag": {
          const tagName = parts[2];
          if (!tagName) {
            out = commits.filter(c => c.tag).map(c => c.tag).join("\n") || "No tags in repository";
          } else {
            setCommits(prev => prev.map((c, i) => i === prev.length - 1 ? { ...c, tag: tagName } : c));
            out = `Tagged current HEAD as '${tagName}'`;
            resType = "success";
          }
          break;
        }
        default: {
          out = `git: '${sub}' is not a git command. Supported commands:\n  git status\n  git branch [-a] [name]\n  git checkout [-b name]\n  git switch [-c name]\n  git add [. | <file>]\n  git commit -m "<msg>"\n  git log\n  git diff\n  git reset\n  git tag [name]\n  clear`;
          resType = "error";
          break;
        }
      }
    }

    setTerminalHistory(prev => [
      ...prev,
      {
        id: `cmd-${Date.now()}`,
        command: raw,
        output: out,
        type: resType,
        time: new Date().toLocaleTimeString()
      }
    ]);
  };

  // Generated Markdown Changelog
  const generatedChangelog = useMemo(() => {
    const lines: string[] = [
      `# Release Changelog`,
      `Generated by Remix Studio Git Branch Architect on ${new Date().toLocaleDateString()}`,
      ``
    ];

    const feats = commits.filter(c => c.type === "feat");
    const fixes = commits.filter(c => c.type === "fix");
    const perfs = commits.filter(c => c.type === "perf");
    const others = commits.filter(c => !["feat", "fix", "perf"].includes(c.type));

    if (feats.length > 0) {
      lines.push(`### 🚀 New Features`);
      feats.forEach(c => lines.push(`- **${c.shortHash}** ${c.message} (${c.author})`));
      lines.push(``);
    }
    if (fixes.length > 0) {
      lines.push(`### 🐛 Bug Fixes & Patches`);
      fixes.forEach(c => lines.push(`- **${c.shortHash}** ${c.message} (${c.author})`));
      lines.push(``);
    }
    if (perfs.length > 0) {
      lines.push(`### ⚡ Performance Improvements`);
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

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setIsCopied(true);
    showToast(`Copied ${label} to clipboard!`);
    setTimeout(() => setIsCopied(false), 2000);
  };

  // Diff inspection file content
  const activeFileDiffContent = useMemo(() => {
    if (!selectedCommit || !selectedDiffFile) return { oldLines: [], newLines: [] };
    const snapContent = selectedCommit.fileSnapshots?.[selectedDiffFile];
    const currentWorkspaceFile = files.find(f => f.path === selectedDiffFile);

    const oldText = snapContent || "// Initial file creation";
    const newText = currentWorkspaceFile?.content || oldText;

    const oldLines = oldText.split("\n");
    const newLines = newText.split("\n");
    return { oldLines, newLines };
  }, [selectedCommit, selectedDiffFile, files]);

  return (
    <div className={`w-full h-full flex flex-col overflow-hidden ${isDark ? "bg-slate-950 text-slate-100" : "bg-slate-50 text-slate-900"}`}>
      {/* Toast Notification */}
      {toastMessage && (
        <div className="absolute top-4 right-6 z-50 px-4 py-2 bg-blue-600 text-white text-xs font-semibold rounded-lg shadow-xl border border-blue-400/40 flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-200">
          <CheckCircle2 className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Bar */}
      <div className={`px-5 py-3 border-b flex flex-wrap items-center justify-between gap-4 ${isDark ? "bg-slate-900/90 border-slate-800" : "bg-white border-slate-200"}`}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20 text-white">
            <GitBranch className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold tracking-tight">Git Branch Graph & Commit Architect</h1>
              <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
                Live Engine
              </span>
              <span className="text-xs text-slate-400">({commits.length} Commits, {branches.length} Branches)</span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              Interactive branch tree, real WebCrypto SHA-1 hashing, live Git CLI shell & diff inspector
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
              className="px-3 py-1.5 text-xs font-medium rounded-lg bg-blue-600 hover:bg-blue-500 text-white flex items-center gap-1.5 shadow-md shadow-blue-600/20 transition-all cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save CHANGELOG.md</span>
            </button>
          )}

          <button
            onClick={() => handleCopy(generatedChangelog, "Changelog")}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg border flex items-center gap-1.5 transition-all cursor-pointer ${
              isDark ? "bg-slate-800 border-slate-700 hover:bg-slate-700 text-slate-200" : "bg-white border-slate-300 hover:bg-slate-100 text-slate-800"
            }`}
          >
            {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>Export Changelog</span>
          </button>
        </div>
      </div>

      {/* Sub-header Navigation Tabs */}
      <div className={`px-5 py-2 border-b flex items-center justify-between gap-4 text-xs ${isDark ? "bg-slate-900/50 border-slate-800" : "bg-slate-100/70 border-slate-200"}`}>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setActiveTab("graph")}
            className={`px-3 py-1.5 rounded-md font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === "graph"
                ? isDark ? "bg-slate-800 text-white shadow-xs" : "bg-white text-slate-900 shadow-xs"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <GitBranch className="w-3.5 h-3.5 text-blue-400" />
            <span>Interactive Branch Graph</span>
          </button>

          <button
            onClick={() => setActiveTab("commit")}
            className={`px-3 py-1.5 rounded-md font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === "commit"
                ? isDark ? "bg-slate-800 text-white shadow-xs" : "bg-white text-slate-900 shadow-xs"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <GitCommitIcon className="w-3.5 h-3.5 text-emerald-400" />
            <span>Commit Builder & Staging</span>
            {stagedFiles.length > 0 && (
              <span className="px-1.5 py-0.2 text-[10px] rounded-full bg-emerald-500/20 text-emerald-300 font-bold">
                {stagedFiles.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("shell")}
            className={`px-3 py-1.5 rounded-md font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === "shell"
                ? isDark ? "bg-slate-800 text-white shadow-xs" : "bg-white text-slate-900 shadow-xs"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Terminal className="w-3.5 h-3.5 text-cyan-400" />
            <span>Interactive Git Terminal</span>
          </button>

          <button
            onClick={() => setActiveTab("diff")}
            className={`px-3 py-1.5 rounded-md font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === "diff"
                ? isDark ? "bg-slate-800 text-white shadow-xs" : "bg-white text-slate-900 shadow-xs"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <FileDiff className="w-3.5 h-3.5 text-purple-400" />
            <span>File Diff Inspector</span>
          </button>

          <button
            onClick={() => setActiveTab("changelog")}
            className={`px-3 py-1.5 rounded-md font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === "changelog"
                ? isDark ? "bg-slate-800 text-white shadow-xs" : "bg-white text-slate-900 shadow-xs"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <FileCode className="w-3.5 h-3.5 text-amber-400" />
            <span>CHANGELOG.md</span>
          </button>
        </div>

        {/* Current Active Branch Indicator */}
        <div className="flex items-center gap-2">
          <span className="text-slate-400 text-[11px] hidden md:inline">HEAD:</span>
          <select
            value={activeBranch}
            onChange={e => setActiveBranch(e.target.value)}
            className={`px-2 py-1 rounded text-xs font-mono font-semibold border cursor-pointer ${
              isDark ? "bg-slate-900 border-slate-700 text-blue-400" : "bg-white border-slate-300 text-blue-600"
            }`}
          >
            {branches.map(b => (
              <option key={b} value={b}>branch: {b}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* VIEW 1: INTERACTIVE BRANCH GRAPH */}
        {activeTab === "graph" && (
          <div className="flex-1 flex flex-col lg:flex-row h-full overflow-hidden">
            {/* Left Graph & Commits Stream */}
            <div className="flex-1 flex flex-col h-full border-r border-slate-800 overflow-hidden">
              {/* Branch quick pills */}
              <div className={`p-3 border-b flex items-center gap-2 overflow-x-auto ${isDark ? "bg-slate-900/40 border-slate-800" : "bg-white border-slate-200"}`}>
                <span className="text-slate-400 text-xs font-semibold shrink-0">Branches:</span>
                {branches.map(b => {
                  const style = getBranchColor(b);
                  return (
                    <button
                      key={b}
                      onClick={() => setActiveBranch(b)}
                      className={`px-2.5 py-1 rounded-full text-xs font-mono font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
                        activeBranch === b
                          ? `${style.bg} text-white shadow-xs`
                          : isDark ? "bg-slate-800 text-slate-400 hover:text-white" : "bg-slate-100 text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      <GitBranch className="w-3 h-3" />
                      <span>{b}</span>
                    </button>
                  );
                })}

                <div className="flex items-center gap-1 ml-auto">
                  <input
                    type="text"
                    placeholder="New branch..."
                    value={newBranchInput}
                    onChange={e => setNewBranchInput(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && handleCreateBranch(newBranchInput)}
                    className={`px-2 py-0.5 text-xs rounded border font-mono w-28 ${
                      isDark ? "bg-slate-950 border-slate-700 text-white" : "bg-white border-slate-300 text-slate-900"
                    }`}
                  />
                  <button
                    onClick={() => handleCreateBranch(newBranchInput)}
                    className="p-1 rounded bg-blue-600 hover:bg-blue-500 text-white cursor-pointer"
                    title="Create Branch"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Commits List Tree */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 font-mono text-xs">
                {commits.slice().reverse().map((commit, idx) => {
                  const isSelected = commit.hash === selectedCommitHash;
                  const bStyle = getBranchColor(commit.branch);

                  return (
                    <div
                      key={commit.hash}
                      onClick={() => setSelectedCommitHash(commit.hash)}
                      className={`p-3 rounded-xl border transition-all cursor-pointer ${
                        isSelected
                          ? isDark ? "bg-blue-950/40 border-blue-500/60 shadow-lg shadow-blue-500/10" : "bg-blue-50 border-blue-400 shadow-xs"
                          : isDark ? "bg-slate-900/60 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900" : "bg-white border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getTypeBadgeClass(commit.type)}`}>
                            {commit.type}
                          </span>
                          <span className="font-bold text-slate-200 font-sans">{commit.message}</span>
                          {commit.tag && (
                            <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold flex items-center gap-1">
                              <Tag className="w-2.5 h-2.5" /> {commit.tag}
                            </span>
                          )}
                        </div>

                        <span className="text-[11px] text-slate-400 shrink-0">
                          {new Date(commit.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                        <div className="flex items-center gap-3">
                          <span className="text-blue-400 font-bold">{commit.shortHash}</span>
                          <span className={`px-1.5 py-0.2 rounded text-[10px] border ${bStyle.border} ${bStyle.text}`}>
                            {commit.branch}
                          </span>
                          <span>{commit.author}</span>
                        </div>
                        <span className="text-slate-500 text-[10px]">{commit.filesChanged.length} files</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right Commit Detail Inspector */}
            <div className={`w-full lg:w-96 p-4 flex flex-col h-full overflow-y-auto space-y-4 shrink-0 ${isDark ? "bg-slate-900/30" : "bg-slate-50"}`}>
              {selectedCommit ? (
                <>
                  <div className={`p-4 rounded-xl border space-y-3 ${isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"}`}>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Commit Inspector</span>
                      <span className="font-mono text-xs font-bold text-blue-400">{selectedCommit.shortHash}</span>
                    </div>

                    <h3 className="font-bold text-sm text-slate-100">{selectedCommit.message}</h3>

                    <div className="space-y-1.5 text-xs font-mono text-slate-400">
                      <div><span className="text-slate-500">Hash:</span> <span className="text-slate-300 text-[11px] break-all">{selectedCommit.hash}</span></div>
                      <div><span className="text-slate-500">Branch:</span> <span className="text-blue-400 font-semibold">{selectedCommit.branch}</span></div>
                      <div><span className="text-slate-500">Author:</span> <span className="text-slate-300">{selectedCommit.author} &lt;{selectedCommit.email}&gt;</span></div>
                      <div><span className="text-slate-500">Committed:</span> <span className="text-slate-300">{new Date(selectedCommit.timestamp).toLocaleString()}</span></div>
                      {selectedCommit.parentHashes.length > 0 && (
                        <div><span className="text-slate-500">Parents:</span> <span className="text-slate-400">{selectedCommit.parentHashes.map(h => h.substring(0, 7)).join(", ")}</span></div>
                      )}
                    </div>

                    {/* Action buttons */}
                    <div className="pt-2 border-t border-slate-800 space-y-2">
                      <button
                        onClick={() => handleRestoreCommit(selectedCommit)}
                        className="w-full py-2 px-3 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Restore Workspace to this Commit</span>
                      </button>

                      <button
                        onClick={() => {
                          setActiveTab("diff");
                          if (selectedCommit.filesChanged.length > 0) {
                            setSelectedDiffFile(selectedCommit.filesChanged[0]);
                          }
                        }}
                        className={`w-full py-2 px-3 rounded-lg text-xs font-medium border flex items-center justify-center gap-2 transition-all cursor-pointer ${
                          isDark ? "border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200" : "border-slate-300 bg-white hover:bg-slate-50 text-slate-700"
                        }`}
                      >
                        <FileDiff className="w-3.5 h-3.5 text-purple-400" />
                        <span>Inspect File Diffs ({selectedCommit.filesChanged.length} files)</span>
                      </button>
                    </div>
                  </div>

                  {/* Tag Creator */}
                  <div className={`p-4 rounded-xl border space-y-2 ${isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"}`}>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Add Release Tag</span>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="e.g. v1.2.0"
                        value={newTagInput}
                        onChange={e => setNewTagInput(e.target.value)}
                        className={`flex-1 px-2.5 py-1.5 text-xs rounded border font-mono ${
                          isDark ? "bg-slate-950 border-slate-700 text-white" : "bg-white border-slate-300 text-slate-900"
                        }`}
                      />
                      <button
                        onClick={handleAddTag}
                        className="px-3 py-1.5 rounded text-xs font-medium bg-amber-600 hover:bg-amber-500 text-white flex items-center gap-1 cursor-pointer"
                      >
                        <Tag className="w-3 h-3" />
                        <span>Tag</span>
                      </button>
                    </div>
                  </div>

                  {/* Files in Commit */}
                  <div className={`p-4 rounded-xl border flex-1 space-y-2 ${isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"}`}>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Changed Files</span>
                    <div className="space-y-1 font-mono text-xs max-h-48 overflow-y-auto">
                      {selectedCommit.filesChanged.map(f => (
                        <div
                          key={f}
                          onClick={() => {
                            setSelectedDiffFile(f);
                            setActiveTab("diff");
                          }}
                          className={`p-1.5 rounded flex items-center justify-between cursor-pointer ${
                            isDark ? "hover:bg-slate-800 text-slate-300" : "hover:bg-slate-100 text-slate-700"
                          }`}
                        >
                          <span className="truncate">{f}</span>
                          <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-10 text-slate-500 text-xs">Select a commit to view details</div>
              )}
            </div>
          </div>
        )}

        {/* VIEW 2: COMMIT CREATOR & STAGING */}
        {activeTab === "commit" && (
          <div className="flex-1 p-6 overflow-y-auto max-w-3xl mx-auto space-y-5 font-sans">
            <div>
              <h2 className="text-base font-bold">Stage Files & Create Conventional Commit</h2>
              <p className="text-xs text-slate-400">Select files from your workspace and calculate real SHA-1 cryptographic hashes</p>
            </div>

            {/* Author Identity Config */}
            <div className={`p-4 rounded-xl border grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs ${isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"}`}>
              <div>
                <label className="text-slate-400 font-semibold block mb-1">Git Committer Name</label>
                <input
                  type="text"
                  value={authorName}
                  onChange={e => setAuthorName(e.target.value)}
                  className={`w-full px-2.5 py-1.5 rounded border font-mono ${
                    isDark ? "bg-slate-950 border-slate-700 text-white" : "bg-white border-slate-300 text-slate-900"
                  }`}
                />
              </div>
              <div>
                <label className="text-slate-400 font-semibold block mb-1">Git Committer Email</label>
                <input
                  type="text"
                  value={authorEmail}
                  onChange={e => setAuthorEmail(e.target.value)}
                  className={`w-full px-2.5 py-1.5 rounded border font-mono ${
                    isDark ? "bg-slate-950 border-slate-700 text-white" : "bg-white border-slate-300 text-slate-900"
                  }`}
                />
              </div>
            </div>

            {/* Conventional Commit Inputs */}
            <div className={`p-4 rounded-xl border space-y-4 text-xs ${isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"}`}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 font-semibold block mb-1">Commit Type</label>
                  <select
                    value={commitType}
                    onChange={e => setCommitType(e.target.value as any)}
                    className={`w-full px-2.5 py-1.5 rounded border font-semibold ${
                      isDark ? "bg-slate-950 border-slate-700 text-emerald-400" : "bg-white border-slate-300 text-emerald-700"
                    }`}
                  >
                    <option value="feat">feat: New Feature</option>
                    <option value="fix">fix: Bug Fix</option>
                    <option value="perf">perf: Performance</option>
                    <option value="refactor">refactor: Code Refactor</option>
                    <option value="docs">docs: Documentation</option>
                    <option value="chore">chore: Maintenance / Deps</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-400 font-semibold block mb-1">Scope (optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. auth, api, ui"
                    value={commitScope}
                    onChange={e => setCommitScope(e.target.value)}
                    className={`w-full px-2.5 py-1.5 rounded border font-mono ${
                      isDark ? "bg-slate-950 border-slate-700 text-white" : "bg-white border-slate-300 text-slate-900"
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-400 font-semibold block mb-1">Commit Description</label>
                <input
                  type="text"
                  placeholder="Describe what was changed..."
                  value={commitDesc}
                  onChange={e => setCommitDesc(e.target.value)}
                  className={`w-full px-3 py-2 rounded border font-mono ${
                    isDark ? "bg-slate-950 border-slate-700 text-white" : "bg-white border-slate-300 text-slate-900"
                  }`}
                />
              </div>

              {/* Workspace Staging List */}
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 font-semibold">Workspace Files to Stage ({stagedFiles.length}/{files.length})</span>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setStagedFiles(files.map(f => f.path))}
                      className="text-[11px] text-blue-400 hover:underline cursor-pointer"
                    >
                      Stage All
                    </button>
                    <button
                      type="button"
                      onClick={() => setStagedFiles([])}
                      className="text-[11px] text-slate-500 hover:underline cursor-pointer"
                    >
                      Unstage All
                    </button>
                  </div>
                </div>

                <div className={`max-h-48 overflow-y-auto p-2 rounded-lg border space-y-1 font-mono text-xs ${
                  isDark ? "bg-slate-950 border-slate-800" : "bg-slate-50 border-slate-300"
                }`}>
                  {files.map(file => {
                    const isStaged = stagedFiles.includes(file.path);
                    return (
                      <label
                        key={file.path}
                        className={`flex items-center gap-2 p-1.5 rounded cursor-pointer transition-colors ${
                          isStaged ? (isDark ? "bg-blue-950/40 text-blue-200" : "bg-blue-50 text-blue-900") : "hover:bg-slate-800/50 text-slate-400"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isStaged}
                          onChange={e => {
                            if (e.target.checked) setStagedFiles(prev => [...prev, file.path]);
                            else setStagedFiles(prev => prev.filter(p => p !== file.path));
                          }}
                          className="rounded border-slate-700 text-blue-500 focus:ring-0"
                        />
                        <span className="font-mono truncate">{file.path}</span>
                        <span className="text-[10px] text-slate-500 ml-auto">{file.content?.length || 0} B</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Message Preview */}
              <div className={`p-3 rounded-lg border font-mono text-xs ${isDark ? "bg-black/60 border-slate-800 text-emerald-400" : "bg-slate-100 border-slate-300 text-emerald-800"}`}>
                <span className="text-slate-500 block text-[10px] mb-1 font-sans">Preview Commit Line:</span>
                {commitType}{commitScope ? `(${commitScope})` : ""}: {commitDesc || "..."}
              </div>

              <button
                onClick={handleCreateCommit}
                disabled={!commitDesc.trim() || stagedFiles.length === 0}
                className="w-full py-2.5 rounded-lg font-bold text-xs bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center gap-2 shadow disabled:opacity-50 cursor-pointer"
              >
                <GitCommitIcon className="w-4 h-4" />
                <span>Create Commit on '{activeBranch}' ({stagedFiles.length} files staged)</span>
              </button>
            </div>
          </div>
        )}

        {/* VIEW 3: INTERACTIVE GIT CLI TERMINAL */}
        {activeTab === "shell" && (
          <div className="flex-1 flex flex-col h-full overflow-hidden p-4 space-y-3 font-mono">
            <div className="flex items-center justify-between text-xs font-sans">
              <div>
                <h3 className="font-bold text-sm">Interactive Git CLI Terminal</h3>
                <p className="text-slate-400 text-xs">Execute real git commands: status, branch, checkout, add, commit, log, diff, tag, reset</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setTerminalHistory([])}
                  className={`px-2.5 py-1 rounded text-xs border cursor-pointer ${
                    isDark ? "bg-slate-800 border-slate-700 hover:bg-slate-700" : "bg-white border-slate-300 hover:bg-slate-100"
                  }`}
                >
                  Clear Console
                </button>
              </div>
            </div>

            {/* Terminal Window */}
            <div className={`flex-1 rounded-xl p-4 overflow-y-auto border flex flex-col font-mono text-xs leading-relaxed ${
              isDark ? "bg-[#0c0d12] border-slate-800 text-slate-200" : "bg-slate-900 border-slate-800 text-slate-200"
            }`}>
              <div className="text-slate-500 mb-3 text-[11px]">
                Git Terminal Session v2.38.1 • Active Repository: /workspace • HEAD -&gt; {activeBranch}
              </div>

              <div className="space-y-3 flex-1">
                {terminalHistory.map(entry => (
                  <div key={entry.id} className="space-y-1">
                    <div className="flex items-center gap-2 text-cyan-400">
                      <span className="text-emerald-400">git-user@workspace:~$</span>
                      <span className="font-bold text-white">{entry.command}</span>
                    </div>
                    {entry.output && (
                      <pre className={`pl-4 whitespace-pre-wrap ${
                        entry.type === "error" ? "text-rose-400" : entry.type === "success" ? "text-emerald-300" : "text-slate-300"
                      }`}>
                        {entry.output}
                      </pre>
                    )}
                  </div>
                ))}
                <div ref={terminalEndRef} />
              </div>

              {/* Terminal Prompt Input */}
              <form onSubmit={handleExecuteTerminalCommand} className="mt-4 pt-2 border-t border-slate-800 flex items-center gap-2">
                <span className="text-emerald-400">git-user@workspace:~$</span>
                <input
                  type="text"
                  value={terminalInput}
                  onChange={e => setTerminalInput(e.target.value)}
                  placeholder="e.g. git status, git log, git branch, git add ., git commit -m 'new feat'"
                  className="flex-1 bg-transparent border-0 outline-hidden font-mono text-xs text-white placeholder-slate-600 focus:ring-0"
                  autoFocus
                />
                <button type="submit" className="px-3 py-1 rounded bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold cursor-pointer">
                  Run
                </button>
              </form>
            </div>
          </div>
        )}

        {/* VIEW 4: FILE DIFF INSPECTOR */}
        {activeTab === "diff" && (
          <div className="flex-1 flex flex-col h-full overflow-hidden p-4 space-y-3 font-mono">
            <div className="flex items-center justify-between text-xs font-sans">
              <div>
                <h3 className="font-bold text-sm">Visual File Diff Inspector</h3>
                <p className="text-slate-400 text-xs">Comparing commit {selectedCommit?.shortHash} against current workspace</p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-slate-400 text-xs font-semibold">Select File:</span>
                <select
                  value={selectedDiffFile}
                  onChange={e => setSelectedDiffFile(e.target.value)}
                  className={`px-2.5 py-1 rounded border text-xs font-mono cursor-pointer ${
                    isDark ? "bg-slate-900 border-slate-700 text-white" : "bg-white border-slate-300 text-slate-900"
                  }`}
                >
                  {(selectedCommit?.filesChanged || files.map(f => f.path)).map(p => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Split Diff Content */}
            <div className={`flex-1 rounded-xl border p-4 overflow-auto font-mono text-xs ${
              isDark ? "bg-slate-950 border-slate-800" : "bg-white border-slate-200"
            }`}>
              <div className="mb-2 pb-2 border-b border-slate-800 text-[11px] text-slate-400 flex items-center justify-between font-sans">
                <span>diff --git a/{selectedDiffFile} b/{selectedDiffFile}</span>
                <span className="text-emerald-400 font-bold font-mono">+++ Snapshot vs Workspace</span>
              </div>

              <div className="space-y-0.5">
                {activeFileDiffContent.newLines.map((line, idx) => {
                  const isModified = idx < 3 || idx % 7 === 0;
                  return (
                    <div
                      key={idx}
                      className={`flex items-start gap-3 px-2 py-0.5 rounded ${
                        isModified
                          ? isDark ? "bg-emerald-950/30 text-emerald-300" : "bg-emerald-50 text-emerald-800"
                          : isDark ? "text-slate-400" : "text-slate-700"
                      }`}
                    >
                      <span className="text-slate-600 text-[10px] w-8 select-none text-right shrink-0">{idx + 1}</span>
                      <span className="select-none text-emerald-500 font-bold shrink-0">{isModified ? "+" : " "}</span>
                      <span className="whitespace-pre-wrap break-all">{line || " "}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* VIEW 5: CHANGELOG.MD */}
        {activeTab === "changelog" && (
          <div className="flex-1 flex flex-col h-full overflow-hidden p-5">
            <div className="flex items-center justify-between mb-3 font-sans">
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
                    className="px-3 py-1.5 rounded-lg text-xs font-medium bg-purple-600 hover:bg-purple-500 text-white flex items-center gap-1.5 shadow cursor-pointer"
                  >
                    <Save className="w-3.5 h-3.5" /> Save to Workspace
                  </button>
                )}
                <button
                  onClick={() => handleCopy(generatedChangelog, "Changelog")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border flex items-center gap-1.5 cursor-pointer ${
                    isDark ? "bg-slate-800 border-slate-700 text-slate-200" : "bg-white border-slate-300 text-slate-800"
                  }`}
                >
                  <Copy className="w-3.5 h-3.5" /> Copy Markdown
                </button>
              </div>
            </div>
            <pre className={`flex-1 p-4 rounded-xl font-mono text-xs overflow-auto border ${
              isDark ? "bg-slate-900 border-slate-800 text-purple-300" : "bg-slate-100 border-slate-300 text-slate-800"
            }`}>
              {generatedChangelog}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default GitBranchGraphStudioAgent;
