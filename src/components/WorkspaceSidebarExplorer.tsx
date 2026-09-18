import React, { useMemo, memo } from "react";
import {
  FileCode,
  Plus,
  FolderPlus,
  Search,
  X
} from "lucide-react";
import { VirtualFile } from "../types";

interface WorkspaceSidebarExplorerProps {
  theme: "light" | "dark" | string;
  isAddingFile: boolean;
  setIsAddingFile: React.Dispatch<React.SetStateAction<boolean>>;
  isAddingFolder: boolean;
  setIsAddingFolder: React.Dispatch<React.SetStateAction<boolean>>;
  newFileName: string;
  setNewFileName: React.Dispatch<React.SetStateAction<string>>;
  newFolderName: string;
  setNewFolderName: React.Dispatch<React.SetStateAction<string>>;
  handleCreateFile: (path: string) => void;
  handleCreateFolder: (path: string) => void;
  fileSearchQuery: string;
  setFileSearchQuery: React.Dispatch<React.SetStateAction<string>>;
  files: VirtualFile[];
  emptyFolders: string[];
  renderTree: (tree: any) => React.ReactNode;
  buildFileTree: (files: VirtualFile[], emptyFolders: string[]) => any;
}

export const WorkspaceSidebarExplorer: React.FC<WorkspaceSidebarExplorerProps> = memo(({
  theme,
  isAddingFile,
  setIsAddingFile,
  isAddingFolder,
  setIsAddingFolder,
  newFileName,
  setNewFileName,
  newFolderName,
  setNewFolderName,
  handleCreateFile,
  handleCreateFolder,
  fileSearchQuery,
  setFileSearchQuery,
  files,
  emptyFolders,
  renderTree,
  buildFileTree
}) => {
  const isDark = theme !== "light";

  const deferredQuery = React.useDeferredValue(fileSearchQuery);
  const query = deferredQuery.trim().toLowerCase();
  const filteredFiles = useMemo(() => {
    return query
      ? files.filter(f => f.path.toLowerCase().includes(query))
      : files;
  }, [files, query]);

  const filteredEmptyFolders = useMemo(() => {
    return query
      ? emptyFolders.filter(f => f.toLowerCase().includes(query))
      : emptyFolders;
  }, [emptyFolders, query]);

  const builtTree = useMemo(() => {
    return buildFileTree(filteredFiles, filteredEmptyFolders);
  }, [buildFileTree, filteredFiles, filteredEmptyFolders]);

  return (
    <div className={`w-[230px] border-r flex flex-col h-full shrink-0 ${
      isDark ? "border-zinc-800 bg-[#18181b] text-zinc-200" : "border-slate-200 bg-white text-slate-800"
    }`}>
      {/* Explorer Header */}
      <div className={`p-3 border-b flex items-center justify-between shrink-0 ${
        isDark ? "border-zinc-800 bg-[#121214]" : "border-slate-100 bg-slate-50"
      }`}>
        <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400 flex items-center gap-1">
          <FileCode className="w-3.5 h-3.5 text-indigo-500" />
          Workspace Tree
        </span>
        <div className="flex gap-1">
          <button
            onClick={() => {
              setIsAddingFile(!isAddingFile);
              setIsAddingFolder(false);
              setNewFileName("");
            }}
            className={`p-1 rounded border cursor-pointer transition-all ${
              isAddingFile
                ? "bg-indigo-500/10 border-indigo-500/30 text-indigo-400"
                : (isDark ? "bg-zinc-800 border-zinc-700 text-zinc-300 hover:bg-zinc-700" : "bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200")
            }`}
            title="New File"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => {
              setIsAddingFolder(!isAddingFolder);
              setIsAddingFile(false);
              setNewFolderName("");
            }}
            className={`p-1 rounded border cursor-pointer transition-all ${
              isAddingFolder
                ? "bg-indigo-500/10 border-indigo-500/30 text-indigo-400"
                : (isDark ? "bg-zinc-800 border-zinc-700 text-zinc-300 hover:bg-zinc-700" : "bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200")
            }`}
            title="New Folder"
          >
            <FolderPlus className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Persistent Search Bar for Explorer Tree */}
      <div className={`p-2 border-b shrink-0 ${
        isDark ? "border-zinc-800 bg-[#121214]" : "border-slate-100 bg-slate-50"
      }`}>
        <div className="relative flex items-center">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 pointer-events-none" />
          <input
            type="text"
            value={fileSearchQuery}
            onChange={(e) => setFileSearchQuery(e.target.value)}
            placeholder="Search files by name..."
            className={`w-full border rounded-lg pl-8 pr-7 py-1 text-xs font-mono transition-all focus:outline-none ${
              isDark
                ? "bg-zinc-900 border-zinc-700 text-zinc-100 placeholder-zinc-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30"
                : "bg-white border-slate-200 text-slate-800 placeholder-slate-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30"
            }`}
          />
          {fileSearchQuery && (
            <button
              onClick={() => setFileSearchQuery("")}
              className="absolute right-2 p-0.5 rounded text-slate-400 hover:text-white hover:bg-zinc-700 cursor-pointer transition-all"
              title="Clear search"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* Add file form inline toggle */}
      {isAddingFile && (
        <div className={`p-2 border-b shrink-0 ${
          isDark ? "border-zinc-800 bg-[#121214]" : "border-slate-200 bg-slate-50"
        }`}>
          <div className="text-[10px] text-slate-400 font-semibold mb-1 uppercase">Create File</div>
          <input
            type="text"
            value={newFileName}
            onChange={(e) => setNewFileName(e.target.value)}
            placeholder="components/Header.jsx"
            className={`w-full border rounded px-2 py-1 text-xs font-mono mb-2 focus:outline-none ${
              isDark ? "bg-zinc-900 border-zinc-700 text-zinc-100 placeholder-zinc-500 focus:border-indigo-500" : "bg-white border-slate-200 text-slate-800 placeholder-slate-400 focus:border-indigo-500"
            }`}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleCreateFile(newFileName);
            }}
          />
          <div className="flex gap-1">
            <button
              onClick={() => handleCreateFile(newFileName)}
              className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-semibold py-1 rounded cursor-pointer"
            >
              Create
            </button>
            <button
              onClick={() => {
                setIsAddingFile(false);
                setNewFileName("");
              }}
              className={`flex-1 text-[10px] font-medium py-1 rounded cursor-pointer ${
                isDark ? "bg-zinc-800 hover:bg-zinc-700 text-zinc-300" : "bg-slate-200 hover:bg-slate-300 text-slate-600"
              }`}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Add folder form inline toggle */}
      {isAddingFolder && (
        <div className={`p-2 border-b shrink-0 ${
          isDark ? "border-zinc-800 bg-[#121214]" : "border-slate-200 bg-slate-50"
        }`}>
          <div className="text-[10px] text-slate-400 font-semibold mb-1 uppercase">Create Folder</div>
          <input
            type="text"
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            placeholder="src/utils"
            className={`w-full border rounded px-2 py-1 text-xs font-mono mb-2 focus:outline-none ${
              isDark ? "bg-zinc-900 border-zinc-700 text-zinc-100 placeholder-zinc-500 focus:border-indigo-500" : "bg-white border-slate-200 text-slate-800 placeholder-slate-400 focus:border-indigo-500"
            }`}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleCreateFolder(newFolderName);
            }}
          />
          <div className="flex gap-1">
            <button
              onClick={() => handleCreateFolder(newFolderName)}
              className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-semibold py-1 rounded cursor-pointer"
            >
              Create
            </button>
            <button
              onClick={() => {
                setIsAddingFolder(false);
                setNewFolderName("");
              }}
              className={`flex-1 text-[10px] font-medium py-1 rounded cursor-pointer ${
                isDark ? "bg-zinc-800 hover:bg-zinc-700 text-zinc-300" : "bg-slate-200 hover:bg-slate-300 text-slate-600"
              }`}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* File Lists */}
      <div className="flex-1 overflow-y-auto py-2">
        {(() => {
          if (query && filteredFiles.length === 0 && filteredEmptyFolders.length === 0) {
            return (
              <div className="p-4 text-center space-y-2">
                <p className="text-xs text-slate-400 font-medium">No files matching "{fileSearchQuery}"</p>
                <button
                  onClick={() => setFileSearchQuery("")}
                  className="text-[10px] text-indigo-400 hover:underline cursor-pointer"
                >
                  Clear filter
                </button>
              </div>
            );
          }

          return renderTree(builtTree);
        })()}
      </div>
    </div>
  );
});

WorkspaceSidebarExplorer.displayName = "WorkspaceSidebarExplorer";
