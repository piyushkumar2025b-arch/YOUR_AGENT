import React, { useState } from "react";
import { 
  Github, Key, GitBranch, UploadCloud, DownloadCloud, Check, AlertCircle, RefreshCw, ExternalLink, ShieldCheck 
} from "lucide-react";
import { GitHubSyncConfig, VirtualFile } from "../types";

interface GitHubSyncProps {
  files: VirtualFile[];
  onImportFiles: (importedFiles: VirtualFile[]) => void;
  theme: "light" | "dark";
  onAddLog: (type: any, msg: string) => void;
}

export const GitHubSync: React.FC<GitHubSyncProps> = ({
  files,
  onImportFiles,
  theme,
  onAddLog
}) => {
  const [config, setConfig] = useState<GitHubSyncConfig>(() => {
    const saved = localStorage.getItem("github_sync_config");
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    return { token: "", repoOwner: "", repoName: "", branch: "main" };
  });

  const [commitMessage, setCommitMessage] = useState<string>("Sync workspace files via AI Studio Code Agent");
  const [isTesting, setIsTesting] = useState<boolean>(false);
  const [isPushing, setIsPushing] = useState<boolean>(false);
  const [isPulling, setIsPulling] = useState<boolean>(false);
  const [statusMsg, setStatusMsg] = useState<{ type: "success" | "error" | "info"; text: string } | null>(null);
  const [userInfo, setUserInfo] = useState<any | null>(null);

  const saveConfig = (newCfg: GitHubSyncConfig) => {
    setConfig(newCfg);
    localStorage.setItem("github_sync_config", JSON.stringify(newCfg));
  };

  const [userRepos, setUserRepos] = useState<any[]>([]);

  // Route GitHub API calls through backend proxy
  const githubProxy = async (path: string, method = "GET", body?: any) => {
    return await fetch("/api/github/proxy", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        path,
        method,
        body,
        token: config.token
      })
    });
  };

  // Test GitHub PAT Token connection & fetch user's real repos
  const handleTestConnection = async () => {
    if (!config.token.trim()) {
      setStatusMsg({ type: "error", text: "Please enter a valid GitHub Personal Access Token (PAT)." });
      return;
    }

    setIsTesting(true);
    setStatusMsg({ type: "info", text: "Authenticating through secure backend proxy..." });

    try {
      const res = await githubProxy("user");

      if (res.ok) {
        const user = await res.json();
        setUserInfo(user);
        
        // Auto set owner if empty
        if (!config.repoOwner) {
          saveConfig({ ...config, repoOwner: user.login });
        }

        // Fetch user's real repositories
        const reposRes = await githubProxy("user/repos?sort=updated&per_page=30");
        if (reposRes.ok) {
          const repoList = await reposRes.json();
          setUserRepos(repoList);
          if (repoList.length > 0 && !config.repoName) {
            saveConfig({ ...config, repoOwner: user.login, repoName: repoList[0].name });
          }
        }

        setStatusMsg({ type: "success", text: `Connected successfully as @${user.login} (${user.name || "GitHub User"})` });
        onAddLog("info", `GitHub API connected for @${user.login}`);
      } else {
        const err = await res.json();
        setStatusMsg({ type: "error", text: `GitHub Auth Failed: ${err.message || "Invalid Token"}` });
      }
    } catch (err: any) {
      setStatusMsg({ type: "error", text: `Connection error: ${err.message}` });
    } finally {
      setIsTesting(false);
    }
  };

  // Launch GitHub OAuth Popup
  const handleOAuthConnect = async () => {
    try {
      const res = await fetch(`/api/auth/github/url?redirectUri=${encodeURIComponent(window.location.origin + "/auth/callback")}`);
      const data = await res.json();
      if (data.configured && data.url) {
        window.open(data.url, "github_oauth", "width=600,height=700");
      } else {
        setStatusMsg({
          type: "info",
          text: data.message || "OAuth client not configured. Use Personal Access Token (PAT) below for instant access!"
        });
      }
    } catch (err: any) {
      setStatusMsg({ type: "error", text: "OAuth initiate error: " + err.message });
    }
  };

  // Push virtual workspace files directly into GitHub Repo via backend proxy
  const handlePushToGitHub = async () => {
    if (!config.token || !config.repoOwner || !config.repoName) {
      setStatusMsg({ type: "error", text: "GitHub Token, Owner, and Repo Name are required." });
      return;
    }

    setIsPushing(true);
    setStatusMsg({ type: "info", text: `Committing ${files.length} workspace files to ${config.repoOwner}/${config.repoName}...` });

    try {
      let updatedCount = 0;
      for (const file of files) {
        const filePath = file.path.startsWith("/") ? file.path.slice(1) : file.path;
        const ghPath = `repos/${config.repoOwner}/${config.repoName}/contents/${filePath}`;

        // Get existing file SHA if updating
        let sha: string | undefined = undefined;
        try {
          const getRes = await githubProxy(`${ghPath}?ref=${config.branch}`);
          if (getRes.ok) {
            const fileData = await getRes.json();
            sha = fileData.sha;
          }
        } catch {}

        // Encode content to Base64
        const contentBase64 = btoa(unescape(encodeURIComponent(file.content)));

        const bodyData: any = {
          message: `${commitMessage} (${filePath})`,
          content: contentBase64,
          branch: config.branch
        };
        if (sha) bodyData.sha = sha;

        const putRes = await githubProxy(ghPath, "PUT", bodyData);

        if (putRes.status === 422) {
          throw new Error(`Branch "${config.branch}" does not exist in the repository. Create it on GitHub first, or change the branch name in settings.`);
        }
        if (!putRes.ok) {
          throw new Error(`GitHub API error: ${putRes.status}`);
        }
        updatedCount++;
      }

      const now = new Date().toLocaleString();
      saveConfig({ ...config, lastSyncedAt: now });
      setStatusMsg({ type: "success", text: `Successfully pushed ${updatedCount} files to GitHub repository ${config.repoOwner}/${config.repoName}!` });
      onAddLog("info", `Pushed ${updatedCount} files to GitHub ${config.repoOwner}/${config.repoName}`);

    } catch (err: any) {
      setStatusMsg({ type: "error", text: `Failed to push: ${err.message}` });
    } finally {
      setIsPushing(false);
    }
  };

  // Pull / Import files from GitHub Repo via backend proxy
  const handlePullFromGitHub = async () => {
    if (!config.repoOwner || !config.repoName) {
      setStatusMsg({ type: "error", text: "Repo Owner and Repo Name are required to pull files." });
      return;
    }

    setIsPulling(true);
    setStatusMsg({ type: "info", text: "Fetching repository tree from GitHub via backend proxy..." });

    try {
      const res = await githubProxy(`repos/${config.repoOwner}/${config.repoName}/git/trees/${config.branch}?recursive=1`);

      if (!res.ok) {
        throw new Error(`Failed to fetch repo tree (HTTP ${res.status})`);
      }

      const data = await res.json();
      const items = data.tree || [];
      const fileItems = items.filter((item: any) => item.type === "blob" && !item.path.startsWith(".git/"));

      const importedFiles: VirtualFile[] = [];

      for (const item of fileItems.slice(0, 30)) {
        try {
          const contentRes = await githubProxy(`repos/${config.repoOwner}/${config.repoName}/contents/${item.path}?ref=${config.branch}`);
          if (contentRes.ok) {
            const fileJson = await contentRes.json();
            if (fileJson.content) {
              const decoded = decodeURIComponent(escape(atob(fileJson.content.replace(/\n/g, ""))));
              importedFiles.push({
                path: item.path,
                content: decoded,
                language: item.path.endsWith(".ts") ? "typescript" : "javascript",
                isUserCreated: true
              });
            }
          }
        } catch {}
      }

      if (importedFiles.length > 0) {
        onImportFiles(importedFiles);
        setStatusMsg({ type: "success", text: `Successfully imported ${importedFiles.length} files from GitHub!` });
        onAddLog("info", `Imported ${importedFiles.length} files from GitHub repo`);
      } else {
        setStatusMsg({ type: "error", text: "No compatible files found in repo." });
      }

    } catch (err: any) {
      setStatusMsg({ type: "error", text: `Pull error: ${err.message}` });
    } finally {
      setIsPulling(false);
    }
  };

  return (
    <div className={`h-full w-full flex-1 flex flex-col overflow-y-auto p-6 ${theme === "dark" ? "bg-[#121214] text-zinc-100" : "bg-slate-50 text-slate-800"}`}>
      
      {/* HEADER */}
      <div className="flex items-center gap-3 mb-6 shrink-0">
        <div className="p-2.5 bg-slate-900 text-white rounded-xl shadow-md">
          <Github className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-base font-bold flex items-center gap-2">
            GitHub Direct Sync & Deployment
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 font-mono border border-indigo-200">
              PAT Authenticated
            </span>
          </h2>
          <p className="text-xs text-slate-400">Sync, push, and pull workspace files directly to GitHub repositories using Personal Access Tokens</p>
        </div>
      </div>

      {/* CONFIG & ACTIONS FORM */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 w-full min-h-0">
        
        {/* LEFT 6 COLS: CREDENTIALS */}
        <div className={`lg:col-span-6 col-span-12 p-5 rounded-2xl border space-y-4 shadow-xs ${
          theme === "dark" ? "bg-zinc-900 border-zinc-800" : "bg-white border-slate-200"
        }`}>
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Key className="w-4 h-4 text-indigo-500" /> GitHub Personal Access Token (PAT)
          </h3>

          <div>
            <label className="text-[11px] font-semibold text-slate-500 mb-1 block">GitHub Token (ghp_...)</label>
            <input
              type="password"
              value={config.token}
              onChange={(e) => saveConfig({ ...config, token: e.target.value })}
              placeholder="ghp_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
              className="w-full bg-slate-100 dark:bg-zinc-800 text-slate-800 dark:text-zinc-200 border border-slate-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-xs font-mono focus:outline-none focus:border-indigo-500"
            />
          </div>

          {userRepos.length > 0 && (
            <div>
              <label className="text-[11px] font-semibold text-indigo-400 mb-1 block">Select Real GitHub Repository</label>
              <select
                onChange={(e) => {
                  const selectedName = e.target.value;
                  const found = userRepos.find((r) => r.name === selectedName);
                  if (found) {
                    saveConfig({
                      ...config,
                      repoOwner: found.owner.login,
                      repoName: found.name,
                      branch: found.default_branch || "main"
                    });
                  }
                }}
                value={config.repoName}
                className="w-full bg-indigo-500/10 dark:bg-indigo-950/40 text-indigo-300 border border-indigo-500/30 rounded-lg px-3 py-2 text-xs font-mono focus:outline-none"
              >
                {userRepos.map((r) => (
                  <option key={r.id} value={r.name} className="bg-zinc-900 text-white">
                    {r.full_name} ({r.private ? "Private" : "Public"})
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-semibold text-slate-500 mb-1 block">Repository Owner</label>
              <input
                type="text"
                value={config.repoOwner}
                onChange={(e) => saveConfig({ ...config, repoOwner: e.target.value })}
                placeholder="e.g. octocat"
                className="w-full bg-slate-100 dark:bg-zinc-800 text-slate-800 dark:text-zinc-200 border border-slate-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-slate-500 mb-1 block">Repository Name</label>
              <input
                type="text"
                value={config.repoName}
                onChange={(e) => saveConfig({ ...config, repoName: e.target.value })}
                placeholder="e.g. my-app"
                className="w-full bg-slate-100 dark:bg-zinc-800 text-slate-800 dark:text-zinc-200 border border-slate-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-500 mb-1 block">Branch</label>
            <input
              type="text"
              value={config.branch}
              onChange={(e) => saveConfig({ ...config, branch: e.target.value })}
              placeholder="main"
              className="w-full bg-slate-100 dark:bg-zinc-800 text-slate-800 dark:text-zinc-200 border border-slate-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-xs font-mono focus:outline-none focus:border-indigo-500"
            />
          </div>

          <button
            onClick={handleTestConnection}
            disabled={isTesting}
            className="w-full bg-slate-900 hover:bg-slate-800 text-white py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            {isTesting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4 text-emerald-400" />}
            Verify GitHub Connection
          </button>

          {userInfo && (
            <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-3">
              <img src={userInfo.avatar_url} alt="GitHub Avatar" className="w-8 h-8 rounded-full" />
              <div>
                <p className="font-bold">{userInfo.name || userInfo.login}</p>
                <p className="text-[10px] text-emerald-600 dark:text-emerald-400">@{userInfo.login} • {userInfo.public_repos} Repos</p>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT 6 COLS: PUSH / PULL ACTIONS & STATUS */}
        <div className={`lg:col-span-6 col-span-12 p-5 rounded-2xl border space-y-4 shadow-xs flex flex-col ${
          theme === "dark" ? "bg-zinc-900 border-zinc-800" : "bg-white border-slate-200"
        }`}>
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <GitBranch className="w-4 h-4 text-emerald-500" /> Push / Pull Operations
          </h3>

          <div>
            <label className="text-[11px] font-semibold text-slate-500 mb-1 block">Commit Message</label>
            <input
              type="text"
              value={commitMessage}
              onChange={(e) => setCommitMessage(e.target.value)}
              className="w-full bg-slate-100 dark:bg-zinc-800 text-slate-800 dark:text-zinc-200 border border-slate-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-xs focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              onClick={handlePushToGitHub}
              disabled={isPushing}
              className="bg-emerald-600 hover:bg-emerald-500 text-white p-3 rounded-xl text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer flex flex-col items-center gap-1.5 justify-center"
            >
              {isPushing ? <RefreshCw className="w-5 h-5 animate-spin" /> : <UploadCloud className="w-5 h-5" />}
              <span>Push Workspace ({files.length} Files)</span>
            </button>

            <button
              onClick={handlePullFromGitHub}
              disabled={isPulling}
              className="bg-indigo-600 hover:bg-indigo-500 text-white p-3 rounded-xl text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer flex flex-col items-center gap-1.5 justify-center"
            >
              {isPulling ? <RefreshCw className="w-5 h-5 animate-spin" /> : <DownloadCloud className="w-5 h-5" />}
              <span>Pull Repo Files</span>
            </button>
          </div>

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

          {config.lastSyncedAt && (
            <p className="text-[10px] text-slate-400 font-mono mt-auto">
              Last synced: {config.lastSyncedAt}
            </p>
          )}
        </div>

      </div>
    </div>
  );
};
