import React from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Sparkles,
  Code2,
  FileText,
  Globe,
  Check,
  RefreshCw,
  AlertTriangle,
  Edit3,
  Music,
  SkipBack,
  SkipForward,
  Pause,
  Play,
  StopCircle,
  Lock,
  ShieldCheck
} from "lucide-react";
import { VirtualFile } from "../types";
import { TouchFXOverlay } from "./TouchFXOverlay";
import { ErrorNotificationToast } from "./ErrorNotificationToast";
import { safeLazy } from "../utils/lazyRetry";
import { SystemErrorLogCenterModal } from "./SystemErrorLogCenterModal";
import { SystemSecurityShieldModal } from "./SystemSecurityShieldModal";

const MathPlotterModal = safeLazy(() => import("./MathPlotterModal"), "MathPlotterModal");
const RunnerModulesModal = safeLazy(() => import("./RunnerModulesModal"), "RunnerModulesModal");
const CodeRunnerModal = safeLazy(() => import("./CodeRunnerModal"), "CodeRunnerModal");
const KeyboardShortcutsModal = safeLazy(() => import("./KeyboardShortcutsModal"), "KeyboardShortcutsModal");
const ApiHealthDashboardModal = safeLazy(() => import("./ApiHealthDashboardModal"), "ApiHealthDashboardModal");
const ThemeSelectorModal = safeLazy(() => import("./ThemeSelectorModal"), "ThemeSelectorModal");
const GoogleWorkspaceModal = safeLazy(() => import("./GoogleWorkspaceModal"), "GoogleWorkspaceModal");

interface AppModalsContainerProps {
  theme: "light" | "dark" | string;
  showGoogleServicesModal?: boolean;
  setShowGoogleServicesModal?: (show: boolean) => void;
  handleCreateFile?: (filePath: string, content: string) => void;
  showGoToLineModal: boolean;
  setShowGoToLineModal: (show: boolean) => void;
  gotoLineInput: string;
  setGotoLineInput: (val: string) => void;
  jumpToLine: (line: number) => void;
  activeFile: VirtualFile | undefined;
  showLanguagePickerModal: boolean;
  setShowLanguagePickerModal: (show: boolean) => void;
  selectedFilePath: string;
  handleChangeFileLanguage: (lang: string) => void;
  showVSCodeProModal: boolean;
  setShowVSCodeProModal: (show: boolean) => void;
  files: VirtualFile[];
  handleFormatCode: () => void;
  showDocStatsModal: boolean;
  setShowDocStatsModal: (show: boolean) => void;
  fileEncoding: string;
  indentType: string;
  indentSize: number;
  showEncodingPickerModal: boolean;
  setShowEncodingPickerModal: (show: boolean) => void;
  setFileEncoding: (enc: string) => void;
  addAgentAction: (type: any, message: string, path?: string) => void;
  showDriveModal: boolean;
  setShowDriveModal: (show: boolean) => void;
  isDriveUploading: boolean;
  driveUploadProgress: string;
  driveUploadLink: string | null;
  deleteConfirmTarget: { type: "file" | "folder"; path: string } | null;
  setDeleteConfirmTarget: (target: { type: "file" | "folder"; path: string } | null) => void;
  handleDeleteFile: (path: string) => void;
  handleDeleteFolder: (path: string) => void;
  renamingPath: { type: "file" | "folder"; path: string } | null;
  setRenamingPath: (target: { type: "file" | "folder"; path: string } | null) => void;
  renameInputValue: string;
  setRenameInputValue: (val: string) => void;
  handleRenameFile: (oldPath: string, newPath: string) => void;
  handleRenameFolder: (oldPath: string, newPath: string) => void;
  isMathPlotterOpen: boolean;
  setIsMathPlotterOpen: (open: boolean) => void;
  isMusicPlaying: boolean;
  activeTab: string;
  currentTrackIndex: number | null;
  musicTracks: any[];
  handlePrevTrack: () => void;
  handleTogglePlay: () => void;
  handleNextTrack: () => void;
  setActiveTab: (tab: string) => void;
  handleForceStopMusic: () => void;
  isRunnerModalOpen: boolean;
  setIsRunnerModalOpen: (open: boolean) => void;
  isCodeRunnerOpen: boolean;
  setIsCodeRunnerOpen: (open: boolean) => void;
  apiKey: string;
  selectedModel: string;
  setSelectedModel: (model: string) => void;
  setSelectedFilePath: (path: string) => void;
  setShowSlidersBar: React.Dispatch<React.SetStateAction<boolean>>;
  setShowTerminal: React.Dispatch<React.SetStateAction<boolean>>;
  handleDownloadZip: () => void;
  isShortcutsHelpOpen: boolean;
  setIsShortcutsHelpOpen: (open: boolean) => void;
  isCommandPaletteOpen: boolean;
  setIsCommandPaletteOpen: (open: boolean) => void;
  setTheme: React.Dispatch<React.SetStateAction<any>>;
  rightClickToast: boolean;
  setRightClickToast: (show: boolean) => void;
  isSecurityShieldOpen: boolean;
  setIsSecurityShieldOpen: (open: boolean) => void;
  isErrorLogCenterOpen: boolean;
  setIsErrorLogCenterOpen: (open: boolean) => void;
  isApiDashboardOpen: boolean;
  setIsApiDashboardOpen: (open: boolean) => void;
  isThemeSelectorOpen: boolean;
  setIsThemeSelectorOpen: (open: boolean) => void;
}

export const AppModalsContainer: React.FC<AppModalsContainerProps> = React.memo(({
  theme,
  showGoToLineModal,
  setShowGoToLineModal,
  gotoLineInput,
  setGotoLineInput,
  jumpToLine,
  activeFile,
  showLanguagePickerModal,
  setShowLanguagePickerModal,
  selectedFilePath,
  handleChangeFileLanguage,
  showVSCodeProModal,
  setShowVSCodeProModal,
  files,
  handleFormatCode,
  showDocStatsModal,
  setShowDocStatsModal,
  fileEncoding,
  indentType,
  indentSize,
  showEncodingPickerModal,
  setShowEncodingPickerModal,
  setFileEncoding,
  addAgentAction,
  showDriveModal,
  setShowDriveModal,
  isDriveUploading,
  driveUploadProgress,
  driveUploadLink,
  deleteConfirmTarget,
  setDeleteConfirmTarget,
  handleDeleteFile,
  handleDeleteFolder,
  renamingPath,
  setRenamingPath,
  renameInputValue,
  setRenameInputValue,
  handleRenameFile,
  handleRenameFolder,
  isMathPlotterOpen,
  setIsMathPlotterOpen,
  isMusicPlaying,
  activeTab,
  currentTrackIndex,
  musicTracks,
  handlePrevTrack,
  handleTogglePlay,
  handleNextTrack,
  setActiveTab,
  handleForceStopMusic,
  isRunnerModalOpen,
  setIsRunnerModalOpen,
  isCodeRunnerOpen,
  setIsCodeRunnerOpen,
  apiKey,
  selectedModel,
  setSelectedModel,
  setSelectedFilePath,
  setShowSlidersBar,
  setShowTerminal,
  handleDownloadZip,
  isShortcutsHelpOpen,
  setIsShortcutsHelpOpen,
  isCommandPaletteOpen,
  setIsCommandPaletteOpen,
  setTheme,
  rightClickToast,
  setRightClickToast,
  isSecurityShieldOpen,
  setIsSecurityShieldOpen,
  isErrorLogCenterOpen,
  setIsErrorLogCenterOpen,
  isApiDashboardOpen,
  setIsApiDashboardOpen,
  isThemeSelectorOpen,
  setIsThemeSelectorOpen,
  showGoogleServicesModal,
  setShowGoogleServicesModal,
  handleCreateFile
}) => {
  return (
    <>
      {/* GO TO LINE MODAL */}
      <AnimatePresence>
        {showGoToLineModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-[120]">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-zinc-900 border border-zinc-800 text-white rounded-2xl shadow-2xl p-6 max-w-sm w-full mx-4 space-y-4"
            >
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                <h3 className="text-sm font-bold flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-sky-400" />
                  Go to Line / Position
                </h3>
                <button
                  onClick={() => setShowGoToLineModal(false)}
                  className="text-zinc-400 hover:text-white text-xs font-bold cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const num = parseInt(gotoLineInput);
                  if (!isNaN(num) && num > 0) {
                    jumpToLine(num);
                  }
                  setShowGoToLineModal(false);
                }}
                className="space-y-3"
              >
                <div>
                  <label className="text-xs text-zinc-400 block mb-1">
                    Enter line number (1 - {activeFile ? (activeFile.content || "").split("\n").length : 1}):
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={activeFile ? (activeFile.content || "").split("\n").length : 9999}
                    value={gotoLineInput}
                    onChange={(e) => setGotoLineInput(e.target.value)}
                    autoFocus
                    placeholder="e.g. 42"
                    className="w-full p-2.5 rounded-xl bg-zinc-950 border border-zinc-700 text-white text-sm outline-none focus:border-sky-500 font-mono"
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      jumpToLine(1);
                      setShowGoToLineModal(false);
                    }}
                    className="flex-1 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-[11px] font-bold text-zinc-300 cursor-pointer"
                  >
                    Top (Ln 1)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const total = activeFile ? (activeFile.content || "").split("\n").length : 1;
                      jumpToLine(Math.ceil(total / 2));
                      setShowGoToLineModal(false);
                    }}
                    className="flex-1 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-[11px] font-bold text-zinc-300 cursor-pointer"
                  >
                    Middle
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const total = activeFile ? (activeFile.content || "").split("\n").length : 1;
                      jumpToLine(total);
                      setShowGoToLineModal(false);
                    }}
                    className="flex-1 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-[11px] font-bold text-zinc-300 cursor-pointer"
                  >
                    End
                  </button>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold cursor-pointer transition-all shadow-md"
                >
                  Jump to Line
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* LANGUAGE PICKER MODAL */}
      <AnimatePresence>
        {showLanguagePickerModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-[120]">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-zinc-900 border border-zinc-800 text-white rounded-2xl shadow-2xl p-6 max-w-md w-full mx-4 space-y-4 max-h-[85vh] flex flex-col"
            >
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                <h3 className="text-sm font-bold flex items-center gap-2">
                  <Code2 className="w-4 h-4 text-sky-400" />
                  Select Language Mode
                </h3>
                <button
                  onClick={() => setShowLanguagePickerModal(false)}
                  className="text-zinc-400 hover:text-white text-xs font-bold cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <p className="text-xs text-zinc-400">
                Choose syntax highlighting and code formatting rules for <span className="font-mono text-sky-300">{selectedFilePath}</span>:
              </p>

              <div className="grid grid-cols-2 gap-2 overflow-y-auto p-1 max-h-72">
                {[
                  { name: "TypeScript", mode: "typescript", color: "text-blue-400" },
                  { name: "JavaScript", mode: "javascript", color: "text-amber-400" },
                  { name: "Python", mode: "python", color: "text-emerald-400" },
                  { name: "Java", mode: "java", color: "text-orange-400" },
                  { name: "HTML5", mode: "html", color: "text-rose-400" },
                  { name: "CSS3", mode: "css", color: "text-cyan-400" },
                  { name: "JSON", mode: "json", color: "text-purple-400" },
                  { name: "Markdown", mode: "markdown", color: "text-indigo-400" },
                  { name: "C++", mode: "cpp", color: "text-teal-400" },
                  { name: "PHP", mode: "php", color: "text-indigo-300" },
                  { name: "Go", mode: "go", color: "text-sky-300" },
                  { name: "Rust", mode: "rust", color: "text-orange-300" },
                  { name: "SQL", mode: "sql", color: "text-amber-300" },
                  { name: "Shell Script", mode: "shell", color: "text-emerald-300" },
                  { name: "XML", mode: "xml", color: "text-rose-300" },
                  { name: "Plain Text", mode: "text", color: "text-slate-300" }
                ].map((item) => (
                  <button
                    key={item.mode}
                    onClick={() => handleChangeFileLanguage(item.mode)}
                    className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-between cursor-pointer transition-all ${
                      activeFile?.language === item.mode
                        ? "bg-sky-600/20 border-sky-500 text-white"
                        : "bg-zinc-950 border-zinc-800 text-zinc-300 hover:bg-zinc-800 hover:border-zinc-700"
                    }`}
                  >
                    <span className={item.color}>{item.name}</span>
                    <span className="text-[10px] font-mono text-zinc-500 uppercase">{item.mode}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* VS CODE PRO DIAGNOSTICS MODAL */}
      <AnimatePresence>
        {showVSCodeProModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-[120]">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-zinc-900 border border-zinc-800 text-white rounded-2xl shadow-2xl p-6 max-w-md w-full mx-4 space-y-4"
            >
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                  <h3 className="text-sm font-bold">VS Code Pro Workspace Diagnostics</h3>
                </div>
                <button
                  onClick={() => setShowVSCodeProModal(false)}
                  className="text-zinc-400 hover:text-white text-xs font-bold cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 space-y-2">
                  <div className="flex justify-between text-zinc-400">
                    <span>Environment:</span>
                    <span className="text-emerald-400 font-mono font-bold">Cloud Run Container</span>
                  </div>
                  <div className="flex justify-between text-zinc-400">
                    <span>Language Server:</span>
                    <span className="text-sky-400 font-mono font-bold">Active (TypeScript 5.x)</span>
                  </div>
                  <div className="flex justify-between text-zinc-400">
                    <span>Active File:</span>
                    <span className="text-amber-300 font-mono truncate max-w-[200px]">{selectedFilePath}</span>
                  </div>
                  <div className="flex justify-between text-zinc-400">
                    <span>Total Project Files:</span>
                    <span className="text-indigo-400 font-mono font-bold">{files.length}</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-indigo-950/30 border border-indigo-500/30 space-y-1.5">
                  <h4 className="font-bold text-indigo-300 text-[11px] uppercase tracking-wider">Loaded Extensions & Engines</h4>
                  <ul className="text-[11px] text-zinc-300 space-y-1 list-disc list-inside">
                    <li>VS Code Dark+ Syntax Highlighter & Bracket Colorizer</li>
                    <li>Prettier-compatible Document Formatter Engine</li>
                    <li>Google GenAI Multi-Agent Copilot</li>
                    <li>Live Virtual Sandboxed Execution Runner</li>
                  </ul>
                </div>

                <div className="flex gap-2 pt-1">
                  <button
                    onClick={() => {
                      handleFormatCode();
                      setShowVSCodeProModal(false);
                    }}
                    className="flex-1 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold cursor-pointer transition-all text-center"
                  >
                    Format Code
                  </button>
                  <button
                    onClick={() => setShowVSCodeProModal(false)}
                    className="flex-1 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold cursor-pointer transition-all text-center"
                  >
                    Close Diagnostics
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* DOCUMENT STATISTICS MODAL */}
      <AnimatePresence>
        {showDocStatsModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-[120]">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-zinc-900 border border-zinc-800 text-white rounded-2xl shadow-2xl p-6 max-w-md w-full mx-4 space-y-4"
            >
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                <h3 className="text-sm font-bold flex items-center gap-2">
                  <FileText className="w-4 h-4 text-emerald-400" />
                  Document Analytics & Statistics
                </h3>
                <button
                  onClick={() => setShowDocStatsModal(false)}
                  className="text-zinc-400 hover:text-white text-xs font-bold cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {(() => {
                const text = activeFile?.content || "";
                const lines = text.split("\n");
                const words = text.trim() ? text.trim().split(/\s+/).length : 0;
                const chars = text.length;
                const charsNoSpaces = text.replace(/\s/g, "").length;
                const bytes = new Blob([text]).size;

                return (
                  <div className="space-y-3 text-xs">
                    <p className="text-zinc-400">
                      File: <span className="font-mono text-sky-300 font-bold">{selectedFilePath}</span>
                    </p>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 space-y-0.5">
                        <span className="text-[10px] text-zinc-500 uppercase font-bold">Total Lines</span>
                        <p className="text-lg font-mono font-bold text-sky-400">{lines.length}</p>
                      </div>
                      <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 space-y-0.5">
                        <span className="text-[10px] text-zinc-500 uppercase font-bold">Word Count</span>
                        <p className="text-lg font-mono font-bold text-emerald-400">{words}</p>
                      </div>
                      <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 space-y-0.5">
                        <span className="text-[10px] text-zinc-500 uppercase font-bold">Characters</span>
                        <p className="text-lg font-mono font-bold text-purple-400">{chars}</p>
                      </div>
                      <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 space-y-0.5">
                        <span className="text-[10px] text-zinc-500 uppercase font-bold">Chars (no spaces)</span>
                        <p className="text-lg font-mono font-bold text-amber-400">{charsNoSpaces}</p>
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 space-y-1 text-zinc-300 font-mono text-[11px]">
                      <div className="flex justify-between">
                        <span>File Size:</span>
                        <span className="text-white font-bold">{bytes} bytes</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Encoding:</span>
                        <span className="text-white font-bold">{fileEncoding}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Indentation:</span>
                        <span className="text-white font-bold">{indentType} ({indentSize})</span>
                      </div>
                    </div>

                    <button
                      onClick={() => setShowDocStatsModal(false)}
                      className="w-full py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold cursor-pointer transition-all"
                    >
                      Done
                    </button>
                  </div>
                );
              })()}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ENCODING PICKER MODAL */}
      <AnimatePresence>
        {showEncodingPickerModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-[120]">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-zinc-900 border border-zinc-800 text-white rounded-2xl shadow-2xl p-6 max-w-sm w-full mx-4 space-y-4"
            >
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                <h3 className="text-sm font-bold flex items-center gap-2">
                  <Globe className="w-4 h-4 text-amber-400" />
                  Select File Encoding
                </h3>
                <button
                  onClick={() => setShowEncodingPickerModal(false)}
                  className="text-zinc-400 hover:text-white text-xs font-bold cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-2">
                {["UTF-8", "UTF-16 LE", "UTF-16 BE", "ASCII / US-ASCII", "ISO-8859-1 (Latin-1)"].map((enc) => (
                  <button
                    key={enc}
                    onClick={() => {
                      setFileEncoding(enc);
                      addAgentAction("edit", `Configured character encoding to ${enc} for "${selectedFilePath}".`, selectedFilePath);
                      setShowEncodingPickerModal(false);
                    }}
                    className={`w-full p-2.5 rounded-xl border text-xs font-bold text-left flex items-center justify-between cursor-pointer transition-all ${
                      fileEncoding === enc
                        ? "bg-amber-500/20 border-amber-500 text-amber-200"
                        : "bg-zinc-950 border-zinc-800 text-zinc-300 hover:bg-zinc-800"
                    }`}
                  >
                    <span>{enc}</span>
                    {fileEncoding === enc && <Check className="w-4 h-4 text-amber-400" />}
                  </button>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* GOOGLE DRIVE UPLOAD MODAL */}
      <AnimatePresence>
        {showDriveModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-[100]">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6 max-w-md w-full mx-4 space-y-4"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  <Globe className="w-5 h-5 text-emerald-600 animate-pulse" />
                  Google Drive Export Sync
                </h3>
                {!isDriveUploading && (
                  <button
                    onClick={() => setShowDriveModal(false)}
                    className="text-slate-400 hover:text-slate-600 font-bold text-xs cursor-pointer p-1"
                  >
                    Close
                  </button>
                )}
              </div>

              <div className="space-y-3">
                {isDriveUploading ? (
                  <div className="flex items-center gap-3 bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <RefreshCw className="w-5 h-5 text-emerald-600 animate-spin shrink-0" />
                    <div className="text-xs text-slate-600 font-mono leading-normal break-all">
                      {driveUploadProgress}
                    </div>
                  </div>
                ) : driveUploadLink ? (
                  <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-xl text-xs space-y-2">
                    <p className="font-semibold flex items-center gap-1.5">
                      <Check className="w-4 h-4 text-emerald-600" />
                      All files successfully synced to Google Drive!
                    </p>
                    <p className="text-slate-600">
                      Your full virtual directory tree was recreated, and all source codes have been saved.
                    </p>
                  </div>
                ) : (
                  <div className="bg-rose-50 border border-rose-100 text-rose-800 p-4 rounded-xl text-xs">
                    {driveUploadProgress}
                  </div>
                )}

                {driveUploadLink && (
                  <a
                    href={driveUploadLink}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 px-4 rounded-xl text-xs transition-all shadow-md"
                  >
                    <Globe className="w-4 h-4" />
                    Open Folder on Google Drive
                  </a>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* FILE DELETION CONFIRMATION MODAL */}
      <AnimatePresence>
        {deleteConfirmTarget && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-[110]">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className={`rounded-2xl shadow-xl border p-6 max-w-sm w-full mx-4 space-y-4 ${
                theme === "dark" ? "bg-zinc-900 border-zinc-800 text-white" : "bg-white border-slate-200 text-slate-800"
              }`}
            >
              <div className="flex items-center gap-3 border-b pb-3 border-slate-100 dark:border-zinc-800">
                <div className="p-2 bg-rose-50 dark:bg-rose-950/30 rounded-xl text-rose-500 border border-rose-100 dark:border-rose-900/30">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <h3 className={`text-sm font-bold ${theme === "dark" ? "text-white" : "text-slate-800"}`}>
                  Confirm Deletion
                </h3>
              </div>

              <div className="space-y-2">
                <p className="text-xs text-slate-500 dark:text-zinc-400 leading-relaxed">
                  Are you absolutely sure you want to delete this {deleteConfirmTarget?.type}?
                </p>
                <div className={`border rounded-lg p-2.5 text-[11px] font-mono break-all font-medium ${
                  theme === "dark" ? "bg-zinc-950 border-zinc-850 text-rose-400" : "bg-slate-50 border-slate-200/60 text-rose-700"
                }`}>
                  {deleteConfirmTarget?.path}
                </div>
                <p className="text-[10px] text-slate-400 dark:text-zinc-500">
                  Warning: This action is permanent and cannot be undone.
                </p>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-1.5">
                <button
                  type="button"
                  onClick={() => setDeleteConfirmTarget(null)}
                  className={`px-3 py-2 rounded-lg text-xs font-semibold cursor-pointer transition-all border ${
                    theme === "dark"
                      ? "bg-zinc-800 hover:bg-zinc-700 border-zinc-700 text-zinc-300"
                      : "bg-slate-100 hover:bg-slate-200 border-slate-200/40 text-slate-600"
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (deleteConfirmTarget) {
                      if (deleteConfirmTarget.type === "file") {
                        handleDeleteFile(deleteConfirmTarget.path);
                      } else {
                        handleDeleteFolder(deleteConfirmTarget.path);
                      }
                    }
                    setDeleteConfirmTarget(null);
                  }}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-bold cursor-pointer transition-all shadow-md"
                >
                  Confirm Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* FILE & FOLDER RENAME MODAL */}
      <AnimatePresence>
        {renamingPath && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-[110]">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className={`rounded-2xl shadow-xl border p-6 max-w-sm w-full mx-4 space-y-4 ${
                theme === "dark" ? "bg-zinc-900 border-zinc-800 text-white" : "bg-white border-slate-200 text-slate-800"
              }`}
            >
              <div className="flex items-center gap-3 border-b pb-3 border-slate-100 dark:border-zinc-800">
                <div className="p-2 bg-indigo-50 dark:bg-indigo-950/30 rounded-xl text-indigo-500 border border-indigo-100 dark:border-indigo-900/30">
                  <Edit3 className="w-5 h-5" />
                </div>
                <h3 className={`text-sm font-bold ${theme === "dark" ? "text-white" : "text-slate-800"}`}>
                  Rename {renamingPath?.type === "file" ? "File" : "Folder"}
                </h3>
              </div>

              <div className="space-y-3">
                <div className="text-xs text-slate-500 dark:text-zinc-400">
                  Current path: <span className="font-mono text-indigo-500 font-semibold">{renamingPath?.path}</span>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">New Name or Path</label>
                  <input
                    type="text"
                    value={renameInputValue}
                    onChange={(e) => setRenameInputValue(e.target.value)}
                    placeholder={renamingPath?.type === "file" ? "main.c" : "src/components"}
                    autoFocus
                    className={`w-full px-3 py-2 rounded-lg text-xs font-mono border focus:outline-none ${
                      theme === "dark"
                        ? "bg-zinc-950 border-zinc-700 text-white focus:border-indigo-500"
                        : "bg-slate-50 border-slate-300 text-slate-900 focus:border-indigo-500"
                    }`}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && renamingPath) {
                        if (renamingPath.type === "file") {
                          handleRenameFile(renamingPath.path, renameInputValue);
                        } else {
                          handleRenameFolder(renamingPath.path, renameInputValue);
                        }
                      }
                    }}
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-1.5">
                <button
                  type="button"
                  onClick={() => setRenamingPath(null)}
                  className={`px-3 py-2 rounded-lg text-xs font-semibold cursor-pointer transition-all border ${
                    theme === "dark"
                      ? "bg-zinc-800 hover:bg-zinc-700 border-zinc-700 text-zinc-300"
                      : "bg-slate-100 hover:bg-slate-200 border-slate-200/40 text-slate-600"
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (renamingPath) {
                      if (renamingPath.type === "file") {
                        handleRenameFile(renamingPath.path, renameInputValue);
                      } else {
                        handleRenameFolder(renamingPath.path, renameInputValue);
                      }
                    }
                  }}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold cursor-pointer transition-all shadow-md"
                >
                  Save Rename
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MATH FUNCTIONS VISUALIZER & PLOTTER MODAL */}
      {isMathPlotterOpen && (
        <React.Suspense fallback={null}>
          <MathPlotterModal
            isOpen={isMathPlotterOpen}
            onClose={() => setIsMathPlotterOpen(false)}
            theme={theme === "light" ? "light" : "dark"}
          />
        </React.Suspense>
      )}

      {/* FLOATING PERSISTENT MINI MUSIC PLAYER BAR */}
      {isMusicPlaying && activeTab !== "music" && currentTrackIndex !== null && musicTracks[currentTrackIndex] && (
        <div className="fixed bottom-4 right-4 z-50 bg-[#121214]/95 text-white p-3 pr-4 rounded-2xl border border-violet-500/40 shadow-2xl backdrop-blur-md flex items-center gap-3.5 animate-in slide-in-from-bottom-5 max-w-md">
          <div className="relative w-11 h-11 rounded-xl overflow-hidden shrink-0 border border-white/10">
            <img
              src={musicTracks[currentTrackIndex].imageUrl}
              alt={musicTracks[currentTrackIndex].title}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover animate-spin-slow"
            />
            <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
              <Music className="w-4 h-4 text-violet-400 animate-pulse" />
            </div>
          </div>

          <div className="min-w-0 flex-1">
            <div className="text-xs font-bold truncate text-violet-300">{musicTracks[currentTrackIndex].title}</div>
            <div className="text-[10px] text-slate-400 truncate">{musicTracks[currentTrackIndex].artist}</div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={handlePrevTrack}
              className="p-1.5 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white transition-all cursor-pointer"
              title="Previous Track"
            >
              <SkipBack className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={handleTogglePlay}
              className="p-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white shadow-md transition-all cursor-pointer"
              title="Play / Pause"
            >
              {isMusicPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
            </button>

            <button
              onClick={handleNextTrack}
              className="p-1.5 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white transition-all cursor-pointer"
              title="Next Track"
            >
              <SkipForward className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => setActiveTab("music")}
              className="px-2 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-slate-200 text-[10px] font-bold transition-all cursor-pointer ml-1"
              title="Open Music Player Tab"
            >
              Open 🎵
            </button>

            <button
              onClick={handleForceStopMusic}
              className="p-1.5 rounded-lg bg-rose-600/30 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/40 transition-all cursor-pointer ml-1"
              title="Force Stop Music Playback"
            >
              <StopCircle className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* RUNNER MODULES SETUP MODAL */}
      {isRunnerModalOpen && (
        <React.Suspense fallback={null}>
          <RunnerModulesModal
            isOpen={isRunnerModalOpen}
            onClose={() => setIsRunnerModalOpen(false)}
            theme={theme === "light" ? "light" : "dark"}
          />
        </React.Suspense>
      )}

      {/* UNIVERSAL CODE FILE RUNNER MODAL */}
      {isCodeRunnerOpen && (
        <React.Suspense fallback={null}>
          <CodeRunnerModal
            isOpen={isCodeRunnerOpen}
            onClose={() => setIsCodeRunnerOpen(false)}
            files={files}
            activeFilePath={selectedFilePath}
            theme={theme === "light" ? "light" : "dark"}
            apiKey={apiKey}
            selectedModel={selectedModel}
            onSelectModel={setSelectedModel}
          />
        </React.Suspense>
      )}

      {/* GLOBAL KEYBOARD SHORTCUTS & COMMAND PALETTE SYSTEM */}
      {(isShortcutsHelpOpen || isCommandPaletteOpen) && (
        <React.Suspense fallback={null}>
          <KeyboardShortcutsModal
            files={files}
            selectedFilePath={selectedFilePath}
            onSelectFile={(path) => {
              setSelectedFilePath(path);
              setActiveTab("editor");
            }}
            onSaveActiveFile={() => {
              localStorage.setItem("agent_workspace_files", JSON.stringify(files));
              addAgentAction("info", `Saved workspace file ${selectedFilePath}`);
            }}
            activeTab={activeTab}
            onSelectTab={setActiveTab}
            theme={theme === "light" ? "light" : "dark"}
            onToggleTheme={() => setTheme((prev: any) => (prev === "light" ? "dark" : "light"))}
            onToggleTerminal={() => setShowTerminal((prev) => !prev)}
            onToggleSlidersBar={() => setShowSlidersBar((prev) => !prev)}
            onRunCode={() => setIsCodeRunnerOpen(true)}
            onDownloadZip={handleDownloadZip}
            isOpenHelpModal={isShortcutsHelpOpen}
            onCloseHelpModal={() => setIsShortcutsHelpOpen(false)}
            isOpenCommandPalette={isCommandPaletteOpen}
            onCloseCommandPalette={() => setIsCommandPaletteOpen(false)}
            onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
            onOpenHelpModal={() => setIsShortcutsHelpOpen(true)}
          />
        </React.Suspense>
      )}

      {/* GLOBAL TOUCH & CLICK RIPPLE FX OVERLAY */}
      <TouchFXOverlay theme={theme === "light" ? "light" : "dark"} soundEnabled={false} />

      {/* SECURITY PROTECTION RIGHT-CLICK DISABLING TOAST ALERT */}
      {rightClickToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-zinc-900/95 text-white border border-rose-500/40 p-4 rounded-2xl shadow-2xl backdrop-blur-md flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4 duration-200">
          <div className="p-2.5 bg-rose-500/20 text-rose-400 rounded-xl border border-rose-500/30">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-rose-400 flex items-center gap-1.5">
              <span>Security Protection Active</span>
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            </h4>
            <p className="text-[11px] text-zinc-300">Right-click context menu is disabled to protect website content & security.</p>
          </div>
          <button
            onClick={() => setRightClickToast(false)}
            className="text-zinc-500 hover:text-white p-1 rounded-lg text-xs font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* SYSTEM SECURITY SHIELD MODAL */}
      {isSecurityShieldOpen && (
        <React.Suspense fallback={null}>
          <SystemSecurityShieldModal
            isOpen={isSecurityShieldOpen}
            onClose={() => setIsSecurityShieldOpen(false)}
          />
        </React.Suspense>
      )}

      {/* SYSTEM ERROR LOG & HEALTH MONITOR MODAL */}
      {isErrorLogCenterOpen && (
        <React.Suspense fallback={null}>
          <SystemErrorLogCenterModal
            isOpen={isErrorLogCenterOpen}
            onClose={() => setIsErrorLogCenterOpen(false)}
          />
        </React.Suspense>
      )}

      {/* FLOATING ERROR TOAST NOTIFICATION DRAWER */}
      <ErrorNotificationToast
        onOpenErrorConsole={() => setIsErrorLogCenterOpen(true)}
      />

      {/* AUTOMATED API HEALTH DASHBOARD MODAL */}
      {isApiDashboardOpen && (
        <React.Suspense fallback={null}>
          <ApiHealthDashboardModal
            isOpen={isApiDashboardOpen}
            onClose={() => setIsApiDashboardOpen(false)}
            theme={theme}
          />
        </React.Suspense>
      )}

      {/* THEME SELECTOR MODAL */}
      {isThemeSelectorOpen && (
        <React.Suspense fallback={null}>
          <ThemeSelectorModal
            isOpen={isThemeSelectorOpen}
            onClose={() => setIsThemeSelectorOpen(false)}
            currentTheme={theme}
            onSelectTheme={(newTheme) => {
              setTheme(newTheme === "light" ? "light" : "dark");
              localStorage.setItem("vibecoder_theme", newTheme === "light" ? "light" : "dark");
              localStorage.setItem("vibecoder_theme_preset", newTheme);
            }}
          />
        </React.Suspense>
      )}

      {/* GOOGLE SERVICES & MULTIMODAL STUDIO MODAL */}
      {!!showGoogleServicesModal && (
        <React.Suspense fallback={null}>
          <GoogleWorkspaceModal
            isOpen={!!showGoogleServicesModal}
            onClose={() => setShowGoogleServicesModal?.(false)}
            theme={theme}
            files={files}
            onAddFile={handleCreateFile}
          />
        </React.Suspense>
      )}
    </>
  );
});
