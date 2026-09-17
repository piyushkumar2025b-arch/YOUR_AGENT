import React from "react";
import { Terminal } from "lucide-react";
import { VirtualFile, AgentAction, Message } from "../types";
import { MainEditorWorkspace } from "./MainEditorWorkspace";
import { WorkspaceSidebarExplorer } from "./WorkspaceSidebarExplorer";
const UniversalPreview = React.lazy(() => import("./UniversalPreview").then(m => ({ default: m.UniversalPreview })));
const AgentPanel = React.lazy(() => import("./AgentPanel").then(m => ({ default: m.AgentPanel })));
const StudyAgent = React.lazy(() => import("./StudyAgent").then(m => ({ default: m.StudyAgent })));
const ImageGenerator = React.lazy(() => import("./ImageGenerator").then(m => ({ default: m.ImageGenerator })));
const MapViewer = React.lazy(() => import("./MapViewer").then(m => ({ default: m.MapViewer })));
const StoryMaker = React.lazy(() => import("./StoryMaker").then(m => ({ default: m.StoryMaker })));
const Dictionary = React.lazy(() => import("./Dictionary").then(m => ({ default: m.Dictionary })));
const GamingHub = React.lazy(() => import("./GamingHub").then(m => ({ default: m.GamingHub })));
const SearchAgent = React.lazy(() => import("./SearchAgent").then(m => ({ default: m.SearchAgent })));
const GitHubSync = React.lazy(() => import("./GitHubSync").then(m => ({ default: m.GitHubSync })));
const SupabasePanel = React.lazy(() => import("./SupabasePanel").then(m => ({ default: m.SupabasePanel })));
const FirebaseDatabaseDashboard = React.lazy(() => import("./FirebaseDatabaseDashboard").then(m => ({ default: m.FirebaseDatabaseDashboard })));
const SettingsPanel = React.lazy(() => import("./SettingsPanel").then(m => ({ default: m.SettingsPanel })));
const GmailManager = React.lazy(() => import("./GmailManager").then(m => ({ default: m.GmailManager })));
const CompetitiveCodingAgent = React.lazy(() => import("./CompetitiveCodingAgent").then(m => ({ default: m.CompetitiveCodingAgent })));
const FileShareQRHub = React.lazy(() => import("./FileShareQRHub").then(m => ({ default: m.FileShareQRHub })));
const TrendingGithubRepos = React.lazy(() => import("./TrendingGithubRepos").then(m => ({ default: m.TrendingGithubRepos })));
const LiveWeatherSection = React.lazy(() => import("./LiveWeatherSection").then(m => ({ default: m.LiveWeatherSection })));
const LiveApiQuiz = React.lazy(() => import("./LiveApiQuiz").then(m => ({ default: m.LiveApiQuiz })));
const ScientificCalculator = React.lazy(() => import("./ScientificCalculator").then(m => ({ default: m.ScientificCalculator })));
const MediaAssetsDownloader = React.lazy(() => import("./MediaAssetsDownloader").then(m => ({ default: m.MediaAssetsDownloader })));
const DocumentRealPreviewer = React.lazy(() => import("./DocumentRealPreviewer").then(m => ({ default: m.DocumentRealPreviewer })));
const PhotoEditor = React.lazy(() => import("./PhotoEditor").then(m => ({ default: m.PhotoEditor })));
const LiveJokesAgent = React.lazy(() => import("./LiveJokesAgent").then(m => ({ default: m.LiveJokesAgent })));
const ApiStudioAgentHub = React.lazy(() => import("./ApiStudioAgentHub").then(m => ({ default: m.ApiStudioAgentHub })));
const DeepResearchAIAgent = React.lazy(() => import("./DeepResearchAIAgent").then(m => ({ default: m.DeepResearchAIAgent })));
const LiveCodeAnalyzerAgent = React.lazy(() => import("./LiveCodeAnalyzerAgent").then(m => ({ default: m.LiveCodeAnalyzerAgent })));
const AiImageStudioAgent = React.lazy(() => import("./AiImageStudioAgent").then(m => ({ default: m.AiImageStudioAgent })));
const AiVoiceSynthAgent = React.lazy(() => import("./AiVoiceSynthAgent").then(m => ({ default: m.AiVoiceSynthAgent })));
const AiTranslatorAgent = React.lazy(() => import("./AiTranslatorAgent").then(m => ({ default: m.AiTranslatorAgent })));
const AiContentCreatorAgent = React.lazy(() => import("./AiContentCreatorAgent").then(m => ({ default: m.AiContentCreatorAgent })));
const CurrencyFinancialAgent = React.lazy(() => import("./CurrencyFinancialAgent").then(m => ({ default: m.CurrencyFinancialAgent })));
const QrCodeBarcodeAgent = React.lazy(() => import("./QrCodeBarcodeAgent").then(m => ({ default: m.QrCodeBarcodeAgent })));
const WikipediaKnowledgeAgent = React.lazy(() => import("./WikipediaKnowledgeAgent").then(m => ({ default: m.WikipediaKnowledgeAgent })));
const NasaSpaceAgent = React.lazy(() => import("./NasaSpaceAgent").then(m => ({ default: m.NasaSpaceAgent })));
const IpGeoNetworkAgent = React.lazy(() => import("./IpGeoNetworkAgent").then(m => ({ default: m.IpGeoNetworkAgent })));
const CryptoTrackerAgent = React.lazy(() => import("./CryptoTrackerAgent").then(m => ({ default: m.CryptoTrackerAgent })));
const MockDataGeneratorAgent = React.lazy(() => import("./MockDataGeneratorAgent").then(m => ({ default: m.MockDataGeneratorAgent })));
const AnimalFactsAgent = React.lazy(() => import("./AnimalFactsAgent").then(m => ({ default: m.AnimalFactsAgent })));
const OpenTriviaAgent = React.lazy(() => import("./OpenTriviaAgent").then(m => ({ default: m.OpenTriviaAgent })));
const RestCountriesAgent = React.lazy(() => import("./RestCountriesAgent").then(m => ({ default: m.RestCountriesAgent })));
const UniversitiesAgent = React.lazy(() => import("./UniversitiesAgent").then(m => ({ default: m.UniversitiesAgent })));
const AdviceQuotesAgent = React.lazy(() => import("./AdviceQuotesAgent").then(m => ({ default: m.AdviceQuotesAgent })));
const PicsumImageGalleryAgent = React.lazy(() => import("./PicsumImageGalleryAgent").then(m => ({ default: m.PicsumImageGalleryAgent })));
const OpenLibraryBooksAgent = React.lazy(() => import("./OpenLibraryBooksAgent").then(m => ({ default: m.OpenLibraryBooksAgent })));
const AirQualitySolarAgent = React.lazy(() => import("./AirQualitySolarAgent").then(m => ({ default: m.AirQualitySolarAgent })));
const GoogleCalendarOpenRouterAgent = React.lazy(() => import("./GoogleCalendarOpenRouterAgent").then(m => ({ default: m.GoogleCalendarOpenRouterAgent })));
const EnglishLearningAgent = React.lazy(() => import("./EnglishLearningAgent").then(m => ({ default: m.EnglishLearningAgent })));
const GlobalNewsAgent = React.lazy(() => import("./GlobalNewsAgent").then(m => ({ default: m.GlobalNewsAgent })));
const EarthSpaceLiveAgent = React.lazy(() => import("./EarthSpaceLiveAgent").then(m => ({ default: m.EarthSpaceLiveAgent })));
const MusicPlayer = React.lazy(() => import("./MusicPlayer").then(m => ({ default: m.MusicPlayer })));
const YouTubeSearchPlayerAgent = React.lazy(() => import("./YouTubeSearchPlayerAgent").then(m => ({ default: m.YouTubeSearchPlayerAgent })));
const DocumentChatWorkspace = React.lazy(() => import("./DocumentChatWorkspace").then(m => ({ default: m.DocumentChatWorkspace })));

interface AppTabViewsRouterProps {
  activeTab: string;
  setActiveTab: (tab: any) => void;
  theme: "light" | "dark";
  files: VirtualFile[];
  setFiles: React.Dispatch<React.SetStateAction<VirtualFile[]>>;
  selectedFilePath: string;
  setSelectedFilePath: React.Dispatch<React.SetStateAction<string>>;
  apiKey: string;
  selectedModel: string;
  addAgentAction: (type: any, message: string, path?: string) => void;
  agentActions: AgentAction[];
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
  emptyFolders: string[];
  setEmptyFolders?: React.Dispatch<React.SetStateAction<string[]>>;
  messages?: Message[];
  setMessages?: React.Dispatch<React.SetStateAction<Message[]>>;
  renderTree: (tree: any) => React.ReactNode;
  buildFileTree: (files: VirtualFile[], emptyFolders: string[]) => any;
  getFileBadgeAndIcon: (filename: string) => { badge: string; colorClass: string };
  handleLanguageChange: (lang: string) => void;
  setRenamingPath: (target: { type: "file" | "folder"; path: string } | null) => void;
  setRenameInputValue: (val: string) => void;
  setDeleteConfirmTarget: (target: { type: "file" | "folder"; path: string } | null) => void;
  setIsCodeRunnerOpen: (open: boolean) => void;
  handleRunActiveFile: (cmd?: string) => void;
  isTerminalRunning: boolean;
  showTerminal: boolean;
  setShowTerminal: React.Dispatch<React.SetStateAction<boolean>>;
  showCodeMap: boolean;
  setShowCodeMap: React.Dispatch<React.SetStateAction<boolean>>;
  editorFontSize: number;
  setEditorFontSize: React.Dispatch<React.SetStateAction<number>>;
  borderSettings: any;
  breakpoints: Record<string, number[]>;
  toggleBreakpoint: (path: string, line: number) => void;
  cursorLine: number;
  cursorCol: number;
  jumpToLine: (line: number) => void;
  highlightCode: (code: string, language?: string) => string;
  handleEditFileContent: (val: string) => void;
  updateCursorPos: (target: HTMLTextAreaElement) => void;
  handleKeyDownInEditor: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  handleEditorScroll: (e: React.UIEvent<HTMLTextAreaElement>) => void;
  editorGutterRef: React.RefObject<HTMLDivElement>;
  editorPreRef: React.RefObject<HTMLPreElement>;
  editorTextareaRef: React.RefObject<HTMLTextAreaElement>;
  setShowVSCodeProModal: (open: boolean) => void;
  setGotoLineInput: (val: string) => void;
  setShowGoToLineModal: (open: boolean) => void;
  setShowDocStatsModal: (open: boolean) => void;
  handleFormatCode: () => void;
  setShowEncodingPickerModal: (open: boolean) => void;
  fileEncoding: string;
  indentSize: number;
  setIndentSize: (size: number) => void;
  indentType: string;
  setShowLanguagePickerModal: (open: boolean) => void;
  brainBoardHeight: number;
  setBrainBoardHeight: (h: number) => void;
  terminalExitCode: number | null;
  terminalOutput: string;
  setTerminalOutput: React.Dispatch<React.SetStateAction<string>>;
  customCommandInput: string;
  setCustomCommandInput: React.Dispatch<React.SetStateAction<string>>;
  handleAgentChatMessage: (...args: any[]) => void;
  setDocChatPrompt: React.Dispatch<React.SetStateAction<string>>;
  setTheme: (t: any) => void;
  sidebarWidth: number;
  setSidebarWidth: (w: number) => void;
  editorWidth: number;
  setEditorWidth: (w: number) => void;
  setApiKey: (k: string) => void;
  googleSignIn: () => Promise<any>;
  gmailToken: string | null;
  gmailUser: any;
  setGmailToken: (t: string | null) => void;
  setGmailUser: (u: any) => void;
  isMusicPlaying?: boolean;
  currentTrackIndex?: number | null;
  musicTracks?: any[];
  setMusicTracks?: React.Dispatch<React.SetStateAction<any[]>>;
  setCurrentTrackIndex?: React.Dispatch<React.SetStateAction<number | null>> | ((idx: number) => void);
  musicVolume?: number;
  setMusicVolume?: (vol: number) => void;
  isMusicMuted?: boolean;
  setIsMusicMuted?: (muted: boolean) => void;
  musicCurrentTime?: number;
  musicDuration?: number;
  handleTogglePlay?: () => void;
  handleForceStopMusic?: () => void;
  handleNextTrack?: () => void;
  handlePrevTrack?: () => void;
  handleSeek?: (time: number) => void;
  handleSelectTrack?: (idx: number) => void;
}

export const AppTabViewsRouter: React.FC<AppTabViewsRouterProps> = ({
  activeTab,
  setActiveTab,
  theme,
  files,
  setFiles,
  selectedFilePath,
  setSelectedFilePath,
  apiKey,
  selectedModel,
  addAgentAction,
  agentActions,
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
  emptyFolders,
  setEmptyFolders = () => {},
  messages = [],
  setMessages = () => {},
  renderTree,
  buildFileTree,
  getFileBadgeAndIcon,
  handleLanguageChange,
  setRenamingPath,
  setRenameInputValue,
  setDeleteConfirmTarget,
  setIsCodeRunnerOpen,
  handleRunActiveFile,
  isTerminalRunning,
  showTerminal,
  setShowTerminal,
  showCodeMap,
  setShowCodeMap,
  editorFontSize,
  setEditorFontSize,
  borderSettings,
  breakpoints,
  toggleBreakpoint,
  cursorLine,
  cursorCol,
  jumpToLine,
  highlightCode,
  handleEditFileContent,
  updateCursorPos,
  handleKeyDownInEditor,
  handleEditorScroll,
  editorGutterRef,
  editorPreRef,
  editorTextareaRef,
  setShowVSCodeProModal,
  setGotoLineInput,
  setShowGoToLineModal,
  setShowDocStatsModal,
  handleFormatCode,
  setShowEncodingPickerModal,
  fileEncoding,
  indentSize,
  setIndentSize,
  indentType,
  setShowLanguagePickerModal,
  brainBoardHeight,
  setBrainBoardHeight,
  terminalExitCode,
  terminalOutput,
  setTerminalOutput,
  customCommandInput,
  setCustomCommandInput,
  handleAgentChatMessage,
  setDocChatPrompt,
  setTheme,
  sidebarWidth,
  setSidebarWidth,
  editorWidth,
  setEditorWidth,
  setApiKey,
  googleSignIn,
  gmailToken,
  gmailUser,
  setGmailToken,
  setGmailUser,
  isMusicPlaying,
  currentTrackIndex,
  musicTracks,
  setMusicTracks,
  setCurrentTrackIndex,
  musicVolume,
  setMusicVolume,
  isMusicMuted,
  setIsMusicMuted,
  musicCurrentTime,
  musicDuration,
  handleTogglePlay,
  handleForceStopMusic,
  handleNextTrack,
  handlePrevTrack,
  handleSeek,
  handleSelectTrack
}) => {
  const activeFile = files.find(f => f.path === selectedFilePath);
  const activeBadge = activeFile ? getFileBadgeAndIcon(activeFile.path) : null;
  const safeTheme: "light" | "dark" = theme === "light" ? "light" : "dark";

  const handleInsertCode = (path: string, content: string) => {
    const idx = files.findIndex(f => f.path.toLowerCase() === path.toLowerCase());
    if (idx > -1) {
      const updated = [...files];
      updated[idx] = { ...updated[idx], content };
      setFiles(updated);
    } else {
      setFiles([...files, { path, content, language: "typescript" }]);
    }
    setSelectedFilePath(path);
    setActiveTab("editor");
  };

  return (
    <div className="w-full h-full flex-1 flex flex-col min-w-0 min-h-0 overflow-hidden relative">
      {/* VIEW 1: FULL WORKSPACE CODE EDITOR WITH FILE TREE */}
      {activeTab === "editor" && (
        <div className="w-full h-full flex-1 flex overflow-hidden min-w-0 min-h-0">
          <WorkspaceSidebarExplorer
            theme={theme}
            isAddingFile={isAddingFile}
            setIsAddingFile={setIsAddingFile}
            isAddingFolder={isAddingFolder}
            setIsAddingFolder={setIsAddingFolder}
            newFileName={newFileName}
            setNewFileName={setNewFileName}
            newFolderName={newFolderName}
            setNewFolderName={setNewFolderName}
            handleCreateFile={handleCreateFile}
            handleCreateFolder={handleCreateFolder}
            fileSearchQuery={fileSearchQuery}
            setFileSearchQuery={setFileSearchQuery}
            files={files}
            emptyFolders={emptyFolders}
            renderTree={renderTree}
            buildFileTree={buildFileTree}
          />
          <MainEditorWorkspace
            theme={theme}
            activeFile={activeFile}
            activeBadge={activeBadge}
            getFileBadgeAndIcon={getFileBadgeAndIcon}
            handleLanguageChange={handleLanguageChange}
            setRenamingPath={setRenamingPath}
            setRenameInputValue={setRenameInputValue}
            setDeleteConfirmTarget={setDeleteConfirmTarget}
            setIsCodeRunnerOpen={setIsCodeRunnerOpen}
            handleRunActiveFile={handleRunActiveFile}
            isTerminalRunning={isTerminalRunning}
            showTerminal={showTerminal}
            setShowTerminal={setShowTerminal}
            showCodeMap={showCodeMap}
            setShowCodeMap={setShowCodeMap}
            editorFontSize={editorFontSize}
            setEditorFontSize={setEditorFontSize}
            borderSettings={borderSettings}
            breakpoints={breakpoints}
            toggleBreakpoint={toggleBreakpoint}
            cursorLine={cursorLine}
            cursorCol={cursorCol}
            jumpToLine={jumpToLine}
            highlightCode={highlightCode}
            handleEditFileContent={handleEditFileContent}
            updateCursorPos={updateCursorPos}
            handleKeyDownInEditor={handleKeyDownInEditor}
            handleEditorScroll={handleEditorScroll}
            editorGutterRef={editorGutterRef}
            editorPreRef={editorPreRef}
            editorTextareaRef={editorTextareaRef}
            setShowVSCodeProModal={setShowVSCodeProModal}
            setGotoLineInput={setGotoLineInput}
            setShowGoToLineModal={setShowGoToLineModal}
            setShowDocStatsModal={setShowDocStatsModal}
            handleFormatCode={handleFormatCode}
            setShowEncodingPickerModal={setShowEncodingPickerModal}
            fileEncoding={fileEncoding}
            indentSize={indentSize}
            setIndentSize={setIndentSize}
            indentType={indentType}
            setShowLanguagePickerModal={setShowLanguagePickerModal}
            selectedFilePath={selectedFilePath}
            addAgentAction={addAgentAction}
            brainBoardHeight={brainBoardHeight}
            setBrainBoardHeight={setBrainBoardHeight}
            terminalExitCode={terminalExitCode}
            terminalOutput={terminalOutput}
            setTerminalOutput={setTerminalOutput}
            customCommandInput={customCommandInput}
            setCustomCommandInput={setCustomCommandInput}
          />
        </div>
      )}

      {/* LAZY PARALLEL CHUNK BOUNDARY FOR PERFORMANCE */}
      <React.Suspense
        fallback={
          <div className="flex-1 flex flex-col items-center justify-center p-12 text-center h-full min-h-[400px]">
            <div className="w-10 h-10 border-2 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin mb-4" />
            <div className="text-sm font-semibold tracking-tight text-slate-700 dark:text-zinc-200">
              Loading Module in Parallel...
            </div>
            <div className="text-xs text-slate-400 dark:text-zinc-500 mt-1 font-mono">
              Optimized lazy chunk hydration
            </div>
          </div>
        }
      >
        {/* VIEW 2: UNIVERSAL FILE & WEB PREVIEW RUNNER */}
      {activeTab === "preview" && (
        <UniversalPreview
          files={files}
          activeFilePath={selectedFilePath}
          onSelectFile={setSelectedFilePath}
          theme={theme}
          onOpenCodeRunner={() => setIsCodeRunnerOpen(true)}
        />
      )}

      {/* VIEW 2.5: MULTI-AGENT PARALLEL ECOSYSTEM WORKFLOWS */}
      {activeTab === "agents" && (
        <AgentPanel
          files={files}
          onUpdateFiles={setFiles}
          apiKey={apiKey}
          selectedModel={selectedModel}
          theme={theme}
          onAddLog={addAgentAction}
          onAgentChatMessage={handleAgentChatMessage}
        />
      )}

      {/* VIEW 2.55: STUDY AGENT */}
      {activeTab === "study" && (
        <StudyAgent
          apiKey={apiKey}
          selectedModel={selectedModel}
          theme={theme}
          onAddLog={addAgentAction}
          onInsertCode={handleInsertCode}
        />
      )}

      {/* VIEW 2.58: IMAGE GENERATOR */}
      {activeTab === "photos" && (
        <ImageGenerator
          apiKey={apiKey}
          selectedModel={selectedModel}
          theme={theme}
          onAddLog={addAgentAction}
          onInsertCode={handleInsertCode}
        />
      )}

      {/* VIEW 2.59: MAP VIEWER */}
      {activeTab === "map" && (
        <MapViewer
          apiKey={apiKey}
          selectedModel={selectedModel}
          theme={theme}
          onAddLog={addAgentAction}
          onInsertCode={handleInsertCode}
        />
      )}

      {/* VIEW 2.591: STORY MAKER */}
      {activeTab === "story" && (
        <StoryMaker
          apiKey={apiKey}
          selectedModel={selectedModel}
          theme={theme}
          onAddLog={addAgentAction}
          onInsertCode={handleInsertCode}
        />
      )}

      {/* VIEW 2.592: DICTIONARY */}
      {activeTab === "dictionary" && (
        <Dictionary
          apiKey={apiKey}
          selectedModel={selectedModel}
          theme={theme}
          onAddLog={addAgentAction}
          onInsertCode={handleInsertCode}
        />
      )}

      {/* VIEW 2.593: GAMING HUB */}
      {activeTab === "gaming" && (
        <GamingHub
          apiKey={apiKey}
          selectedModel={selectedModel}
          theme={theme}
          onAddLog={addAgentAction}
        />
      )}

      {/* VIEW 2.6: SEARCH AGENT */}
      {activeTab === "search" && (
        <SearchAgent
          files={files}
          onInsertCode={handleInsertCode}
          theme={theme}
          onSendToChat={(p) => {
            setActiveTab("chat");
            setDocChatPrompt(p);
          }}
        />
      )}

      {/* VIEW 2.7: GITHUB SYNC */}
      {activeTab === "github" && (
        <GitHubSync
          files={files}
          onImportFiles={(imp) => setFiles([...files, ...imp])}
          theme={theme}
          onAddLog={addAgentAction}
        />
      )}

      {/* VIEW 2.8: SUPABASE PANEL */}
      {activeTab === "supabase" && (
        <SupabasePanel
          files={files}
          theme={theme}
          onAddLog={addAgentAction}
        />
      )}

      {/* VIEW: FIREBASE FIRESTORE DATABASE DASHBOARD */}
      {activeTab === "firebase" && (
        <FirebaseDatabaseDashboard
          theme={theme}
          files={files}
          setFiles={setFiles}
          emptyFolders={emptyFolders}
          setEmptyFolders={setEmptyFolders}
          messages={messages}
          setMessages={setMessages}
          agentActions={agentActions}
          addAgentAction={addAgentAction}
        />
      )}

      {/* VIEW 2.9: SETTINGS PANEL */}
      {activeTab === "settings" && (
        <SettingsPanel
          theme={theme}
          onThemeChange={setTheme}
          sidebarWidth={sidebarWidth}
          onSidebarWidthChange={setSidebarWidth}
          editorWidth={editorWidth}
          onEditorWidthChange={setEditorWidth}
          editorFontSize={editorFontSize}
          onEditorFontSizeChange={setEditorFontSize}
          apiKey={apiKey}
          onApiKeyChange={setApiKey}
        />
      )}

      {/* VIEW 3: AGENT AUDIT LOG TIMELINE */}
      {activeTab === "actions" && (
        <div className={`h-full w-full flex-1 overflow-y-auto p-6 space-y-4 max-w-4xl mx-auto ${
          theme === "dark" ? "bg-[#121214] text-zinc-100" : "bg-slate-50/50 text-slate-800"
        }`}>
          <div className={`pb-2 border-b ${theme === "dark" ? "border-zinc-800" : "border-slate-200"}`}>
            <h3 className="text-sm font-bold uppercase tracking-wider flex items-center gap-1.5">
              <Terminal className="w-4 h-4 text-indigo-500" />
              Agent Audit Log Timeline
            </h3>
            <p className={`text-xs mt-1 leading-relaxed ${theme === "dark" ? "text-zinc-400" : "text-slate-500"}`}>
              Track every action taken by the OpenRouter AI Developer Agent or yourself inside the secure sandboxed virtual workspace.
            </p>
          </div>

          <div className="relative border-l border-slate-200 pl-4 ml-2.5 py-2 space-y-6">
            {agentActions.map((action) => (
              <div key={action.id} className="relative">
                <span className={`absolute -left-[23px] top-1.5 w-2.5 h-2.5 rounded-full border bg-white ${
                  action.type === "create" ? "border-emerald-500 bg-emerald-50" :
                  action.type === "edit" ? "border-indigo-500 bg-indigo-50" :
                  action.type === "delete" ? "border-rose-500 bg-rose-50" :
                  action.type === "error" ? "border-red-500 bg-red-50 animate-pulse" :
                  "border-slate-400 bg-slate-50"
                }`} />

                <div className="bg-white border border-slate-200 rounded-xl p-3.5 space-y-1.5 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className={`text-[10px] font-bold uppercase tracking-wider ${
                      action.type === "create" ? "text-emerald-600" :
                      action.type === "edit" ? "text-indigo-600" :
                      action.type === "delete" ? "text-rose-600" :
                      action.type === "error" ? "text-red-600 font-bold" :
                      "text-slate-500"
                    }`}>
                      {action.type === "create" ? "✓ FILE_CREATE" :
                       action.type === "edit" ? "⚡ FILE_MODIFIED" :
                       action.type === "delete" ? "✗ FILE_DELETED" :
                       action.type === "error" ? "⚠ ERROR_ALERT" :
                       "⚙️ SYSTEM_EVENT"}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">{action.timestamp}</span>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed font-normal">{action.message}</p>

                  {action.path && (
                    <div className="text-[10px] font-mono text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100 inline-block font-medium">
                      TARGET: {action.path}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VIEW 4: GMAIL AGENT INTEGRATION MODULE */}
      {activeTab === "gmail" && (
        <GmailManager
          theme={theme}
          apiKey={apiKey}
          onGoogleSignIn={googleSignIn}
          userEmail={gmailUser?.email || ""}
          accessToken={gmailToken}
          onTokenUpdate={(token, user) => {
            setGmailToken(token);
            setGmailUser(user);
          }}
        />
      )}

      {/* VIEW: MUSIC PLAYER / SONG PLAYER */}
      {activeTab === "music" && (
        <MusicPlayer
          theme={theme}
          globalTracks={musicTracks}
          globalCurrentIndex={currentTrackIndex !== null && currentTrackIndex !== undefined ? currentTrackIndex : 0}
          globalIsPlaying={isMusicPlaying}
          globalVolume={musicVolume}
          globalIsMuted={isMusicMuted}
          globalCurrentTime={musicCurrentTime}
          globalDuration={musicDuration}
          onTogglePlay={handleTogglePlay}
          onForceStop={handleForceStopMusic}
          onNextTrack={handleNextTrack}
          onPrevTrack={handlePrevTrack}
          onSelectTrack={handleSelectTrack || ((idx: number) => {
            if (setCurrentTrackIndex) setCurrentTrackIndex(idx);
          })}
          onSetTracks={(tracks: any) => {
            if (setMusicTracks) setMusicTracks(tracks);
          }}
          onSeek={handleSeek}
          onToggleMute={() => {
            if (setIsMusicMuted) setIsMusicMuted(!isMusicMuted);
          }}
          onVolumeChange={(vol: number) => {
            if (setMusicVolume) setMusicVolume(vol);
          }}
        />
      )}

      {/* VIEW: YOUTUBE SEARCH & PLAYER AGENT */}
      {activeTab === "youtube" && (
        <YouTubeSearchPlayerAgent
          apiKey={apiKey}
          selectedModel={selectedModel}
          theme={theme}
          onAddLog={(type, msg) => addAgentAction(type as any, msg)}
        />
      )}

      {/* VIEW: JUST CHAT & DOCUMENT WORKSPACE */}
      {activeTab === "chat" && (
        <DocumentChatWorkspace
          apiKey={apiKey}
          selectedModel={selectedModel}
          theme={safeTheme}
          files={files}
          setFiles={setFiles}
          addAgentAction={addAgentAction}
          onSelectFile={(path) => {
            setSelectedFilePath(path);
            setActiveTab("editor");
          }}
        />
      )}

      {/* VIEW 4B: COMPETITIVE CODING AGENT */}
      {activeTab === "cp" && (
        <CompetitiveCodingAgent apiKey={apiKey} theme={theme} />
      )}

      {/* VIEW 4C: FILE SHARE QR HUB */}
      {activeTab === "share" && (
        <FileShareQRHub theme={theme} />
      )}

      {/* VIEW 4D: TRENDING GITHUB REPOS */}
      {activeTab === "trending-repos" && (
        <TrendingGithubRepos />
      )}

      {/* VIEW 4E: LIVE WEATHER SECTION */}
      {activeTab === "weather" && (
        <LiveWeatherSection />
      )}

      {/* VIEW 4F: LIVE API QUIZ */}
      {activeTab === "live-quiz" && (
        <LiveApiQuiz />
      )}

      {/* VIEW 4G: SCIENTIFIC CALCULATOR */}
      {activeTab === "calculator" && (
        <ScientificCalculator />
      )}

      {/* VIEW 4H: MEDIA ASSETS DOWNLOADER */}
      {activeTab === "media-downloader" && (
        <MediaAssetsDownloader theme={theme} />
      )}

      {/* VIEW 4I: DOCUMENT REAL PREVIEWER */}
      {activeTab === "doc-previewer" && (
        <DocumentRealPreviewer files={files} theme={theme} />
      )}

      {/* VIEW 4J: PHOTO EDITOR */}
      {activeTab === "photo-editor" && (
        <PhotoEditor theme={theme} />
      )}

      {/* VIEW: LIVE JOKES */}
      {activeTab === "jokes" && (
        <div className="w-full h-full flex-1 flex flex-col min-w-0 min-h-0 overflow-y-auto">
          <LiveJokesAgent
            apiKey={apiKey}
            selectedModel={selectedModel}
            theme={theme}
            onAddLog={(type, msg) => addAgentAction(type as any, msg)}
          />
        </div>
      )}

      {/* VIEW: API STUDIO AGENTS HUB */}
      {activeTab === "api-hub" && (
        <div className="w-full h-full flex-1 flex flex-col min-w-0 min-h-0 overflow-y-auto">
          <ApiStudioAgentHub
            apiKey={apiKey}
            selectedModel={selectedModel}
            theme={theme}
            onAddLog={(type, msg) => addAgentAction(type as any, msg)}
          />
        </div>
      )}

      {/* VIEW: DEEP RESEARCH AGENT */}
      {activeTab === "deep-research" && (
        <div className="w-full h-full flex-1 flex flex-col min-w-0 min-h-0 overflow-y-auto">
          <DeepResearchAIAgent
            apiKey={apiKey}
            selectedModel={selectedModel}
            theme={theme}
            onAddLog={(type, msg) => addAgentAction(type as any, msg)}
          />
        </div>
      )}

      {/* VIEW: CODE SECURITY ANALYZER AGENT */}
      {activeTab === "code-analyzer" && (
        <div className="w-full h-full flex-1 flex flex-col min-w-0 min-h-0 overflow-y-auto">
          <LiveCodeAnalyzerAgent
            apiKey={apiKey}
            selectedModel={selectedModel}
            theme={theme}
            onAddLog={(type, msg) => addAgentAction(type as any, msg)}
          />
        </div>
      )}

      {/* VIEW: AI IMAGE STUDIO */}
      {activeTab === "image-studio" && (
        <div className="w-full h-full flex-1 flex flex-col min-w-0 min-h-0 overflow-y-auto">
          <AiImageStudioAgent
            apiKey={apiKey}
            selectedModel={selectedModel}
            theme={theme}
            onAddLog={(type, msg) => addAgentAction(type as any, msg)}
          />
        </div>
      )}

      {/* VIEW: AI VOICE SPEECH SYNTHESIZER */}
      {activeTab === "voice-synth" && (
        <div className="w-full h-full flex-1 flex flex-col min-w-0 min-h-0 overflow-y-auto">
          <AiVoiceSynthAgent
            apiKey={apiKey}
            selectedModel={selectedModel}
            theme={theme}
            onAddLog={(type, msg) => addAgentAction(type as any, msg)}
          />
        </div>
      )}

      {/* VIEW: AI TRANSLATOR */}
      {activeTab === "translator" && (
        <div className="w-full h-full flex-1 flex flex-col min-w-0 min-h-0 overflow-y-auto">
          <AiTranslatorAgent
            apiKey={apiKey}
            selectedModel={selectedModel}
            theme={theme}
            onAddLog={(type, msg) => addAgentAction(type as any, msg)}
          />
        </div>
      )}

      {/* VIEW: AI CONTENT CREATOR */}
      {activeTab === "content-creator" && (
        <div className="w-full h-full flex-1 flex flex-col min-w-0 min-h-0 overflow-y-auto">
          <AiContentCreatorAgent
            apiKey={apiKey}
            selectedModel={selectedModel}
            theme={theme}
            onAddLog={(type, msg) => addAgentAction(type as any, msg)}
          />
        </div>
      )}

      {/* VIEW: CURRENCY FINANCIAL AGENT */}
      {activeTab === "currency-agent" && (
        <div className="w-full h-full flex-1 flex flex-col min-w-0 min-h-0 overflow-y-auto">
          <CurrencyFinancialAgent
            apiKey={apiKey}
            selectedModel={selectedModel}
            theme={theme}
            onAddLog={(type, msg) => addAgentAction(type as any, msg)}
          />
        </div>
      )}

      {/* VIEW: QR CODE & BARCODE AGENT */}
      {activeTab === "qrcode-agent" && (
        <div className="w-full h-full flex-1 flex flex-col min-w-0 min-h-0 overflow-y-auto">
          <QrCodeBarcodeAgent
            apiKey={apiKey}
            selectedModel={selectedModel}
            theme={theme}
            onAddLog={(type, msg) => addAgentAction(type as any, msg)}
          />
        </div>
      )}

      {/* VIEW: WIKIPEDIA KNOWLEDGE AGENT */}
      {activeTab === "wiki-agent" && (
        <div className="w-full h-full flex-1 flex flex-col min-w-0 min-h-0 overflow-y-auto">
          <WikipediaKnowledgeAgent
            apiKey={apiKey}
            selectedModel={selectedModel}
            theme={theme}
            onAddLog={(type, msg) => addAgentAction(type as any, msg)}
          />
        </div>
      )}

      {/* VIEW: NASA SPACE AGENT */}
      {activeTab === "nasa-agent" && (
        <div className="w-full h-full flex-1 flex flex-col min-w-0 min-h-0 overflow-y-auto">
          <NasaSpaceAgent
            apiKey={apiKey}
            selectedModel={selectedModel}
            theme={theme}
            onAddLog={(type, msg) => addAgentAction(type as any, msg)}
          />
        </div>
      )}

      {/* VIEW: EARTH & ORBITAL TELEMETRY AGENT */}
      {activeTab === "earth-space-agent" && (
        <div className="w-full h-full flex-1 flex flex-col min-w-0 min-h-0 overflow-y-auto">
          <EarthSpaceLiveAgent
            apiKey={apiKey}
            selectedModel={selectedModel}
            theme={theme}
            onAddLog={(type, msg) => addAgentAction(type as any, msg)}
          />
        </div>
      )}

      {/* VIEW: IP GEOLOCATION AGENT */}
      {activeTab === "ipgeo-agent" && (
        <div className="w-full h-full flex-1 flex flex-col min-w-0 min-h-0 overflow-y-auto">
          <IpGeoNetworkAgent
            apiKey={apiKey}
            selectedModel={selectedModel}
            theme={theme}
            onAddLog={(type, msg) => addAgentAction(type as any, msg)}
          />
        </div>
      )}

      {/* VIEW: CRYPTO TRACKER AGENT */}
      {activeTab === "crypto-agent" && (
        <div className="w-full h-full flex-1 flex flex-col min-w-0 min-h-0 overflow-y-auto">
          <CryptoTrackerAgent
            apiKey={apiKey}
            selectedModel={selectedModel}
            theme={theme}
            onAddLog={(type, msg) => addAgentAction(type as any, msg)}
          />
        </div>
      )}

      {/* VIEW: MOCK DATA GENERATOR AGENT */}
      {activeTab === "mockdata-agent" && (
        <div className="w-full h-full flex-1 flex flex-col min-w-0 min-h-0 overflow-y-auto">
          <MockDataGeneratorAgent
            apiKey={apiKey}
            selectedModel={selectedModel}
            theme={theme}
            onAddLog={(type, msg) => addAgentAction(type as any, msg)}
          />
        </div>
      )}

      {/* VIEW: ANIMAL FACTS AGENT */}
      {activeTab === "animal-agent" && (
        <div className="w-full h-full flex-1 flex flex-col min-w-0 min-h-0 overflow-y-auto">
          <AnimalFactsAgent
            apiKey={apiKey}
            selectedModel={selectedModel}
            theme={theme}
            onAddLog={(type, msg) => addAgentAction(type as any, msg)}
          />
        </div>
      )}

      {/* VIEW: OPEN TRIVIA QUIZ AGENT */}
      {activeTab === "opentrivia-agent" && (
        <div className="w-full h-full flex-1 flex flex-col min-w-0 min-h-0 overflow-y-auto">
          <OpenTriviaAgent
            apiKey={apiKey}
            selectedModel={selectedModel}
            theme={theme}
            onAddLog={(type, msg) => addAgentAction(type as any, msg)}
          />
        </div>
      )}

      {/* VIEW: REST COUNTRIES AGENT */}
      {activeTab === "countries-agent" && (
        <div className="w-full h-full flex-1 flex flex-col min-w-0 min-h-0 overflow-y-auto">
          <RestCountriesAgent
            apiKey={apiKey}
            selectedModel={selectedModel}
            theme={theme}
            onAddLog={(type, msg) => addAgentAction(type as any, msg)}
          />
        </div>
      )}

      {/* VIEW: UNIVERSITIES AGENT */}
      {activeTab === "universities-agent" && (
        <div className="w-full h-full flex-1 flex flex-col min-w-0 min-h-0 overflow-y-auto">
          <UniversitiesAgent
            apiKey={apiKey}
            selectedModel={selectedModel}
            theme={theme}
            onAddLog={(type, msg) => addAgentAction(type as any, msg)}
          />
        </div>
      )}

      {/* VIEW: ADVICE QUOTES AGENT */}
      {activeTab === "advice-agent" && (
        <div className="w-full h-full flex-1 flex flex-col min-w-0 min-h-0 overflow-y-auto">
          <AdviceQuotesAgent
            apiKey={apiKey}
            selectedModel={selectedModel}
            theme={theme}
            onAddLog={(type, msg) => addAgentAction(type as any, msg)}
          />
        </div>
      )}

      {/* VIEW: PICSUM GALLERY AGENT */}
      {activeTab === "picsum-agent" && (
        <div className="w-full h-full flex-1 flex flex-col min-w-0 min-h-0 overflow-y-auto">
          <PicsumImageGalleryAgent
            apiKey={apiKey}
            selectedModel={selectedModel}
            theme={theme}
            onAddLog={(type, msg) => addAgentAction(type as any, msg)}
          />
        </div>
      )}

      {/* VIEW: OPEN LIBRARY BOOKS AGENT */}
      {activeTab === "books-agent" && (
        <div className="w-full h-full flex-1 flex flex-col min-w-0 min-h-0 overflow-y-auto">
          <OpenLibraryBooksAgent
            apiKey={apiKey}
            selectedModel={selectedModel}
            theme={theme}
            onAddLog={(type, msg) => addAgentAction(type as any, msg)}
          />
        </div>
      )}

      {/* VIEW: AIR QUALITY AGENT */}
      {activeTab === "airquality-agent" && (
        <div className="w-full h-full flex-1 flex flex-col min-w-0 min-h-0 overflow-y-auto">
          <AirQualitySolarAgent
            apiKey={apiKey}
            selectedModel={selectedModel}
            theme={theme}
            onAddLog={(type, msg) => addAgentAction(type as any, msg)}
          />
        </div>
      )}

      {/* VIEW: GOOGLE CALENDAR AGENT */}
      {activeTab === "calendar-agent" && (
        <div className="w-full h-full flex-1 flex flex-col min-w-0 min-h-0 overflow-y-auto">
          <GoogleCalendarOpenRouterAgent
            apiKey={apiKey}
            selectedModel={selectedModel}
            theme={theme}
            onAddLog={(type, msg) => addAgentAction(type as any, msg)}
          />
        </div>
      )}

      {/* VIEW: ENGLISH LEARNING AGENT */}
      {activeTab === "english-agent" && (
        <div className="w-full h-full flex-1 flex flex-col min-w-0 min-h-0 overflow-y-auto">
          <EnglishLearningAgent
            apiKey={apiKey}
            selectedModel={selectedModel}
            theme={theme}
            onAddLog={(type, msg) => addAgentAction(type as any, msg)}
          />
        </div>
      )}

      {/* VIEW: GLOBAL NEWS AGENT */}
      {activeTab === "news-agent" && (
        <div className="w-full h-full flex-1 flex flex-col min-w-0 min-h-0 overflow-y-auto">
          <GlobalNewsAgent
            apiKey={apiKey}
            selectedModel={selectedModel}
            theme={theme}
            onAddLog={(type, msg) => addAgentAction(type as any, msg)}
          />
        </div>
      )}
      </React.Suspense>
    </div>
  );
};
