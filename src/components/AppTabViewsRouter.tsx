import React from "react";
import { Terminal } from "lucide-react";
import { VirtualFile, AgentAction, Message } from "../types";
import { MainEditorWorkspace } from "./MainEditorWorkspace";
import { WorkspaceSidebarExplorer } from "./WorkspaceSidebarExplorer";
import { safeLazy } from "../utils/lazyRetry";

const UniversalPreview = safeLazy(() => import("./UniversalPreview"), "UniversalPreview");
const AgentPanel = safeLazy(() => import("./AgentPanel"), "AgentPanel");
const StudyAgent = safeLazy(() => import("./StudyAgent"), "StudyAgent");
const ImageGenerator = safeLazy(() => import("./ImageGenerator"), "ImageGenerator");
const MapViewer = safeLazy(() => import("./MapViewer"), "MapViewer");
const StoryMaker = safeLazy(() => import("./StoryMaker"), "StoryMaker");
const Dictionary = safeLazy(() => import("./Dictionary"), "Dictionary");
const GamingHub = safeLazy(() => import("./GamingHub"), "GamingHub");
const SearchAgent = safeLazy(() => import("./SearchAgent"), "SearchAgent");
const GitHubSync = safeLazy(() => import("./GitHubSync"), "GitHubSync");
const SupabasePanel = safeLazy(() => import("./SupabasePanel"), "SupabasePanel");
const FirebaseDatabaseDashboard = safeLazy(() => import("./FirebaseDatabaseDashboard"), "FirebaseDatabaseDashboard");
const SettingsPanel = safeLazy(() => import("./SettingsPanel"), "SettingsPanel");
const GmailManager = safeLazy(() => import("./GmailManager"), "GmailManager");
const CompetitiveCodingAgent = safeLazy(() => import("./CompetitiveCodingAgent"), "CompetitiveCodingAgent");
const FileShareQRHub = safeLazy(() => import("./FileShareQRHub"), "FileShareQRHub");
const TrendingGithubRepos = safeLazy(() => import("./TrendingGithubRepos"), "TrendingGithubRepos");
const LiveWeatherSection = safeLazy(() => import("./LiveWeatherSection"), "LiveWeatherSection");
const LiveApiQuiz = safeLazy(() => import("./LiveApiQuiz"), "LiveApiQuiz");
const ScientificCalculator = safeLazy(() => import("./ScientificCalculator"), "ScientificCalculator");
const MediaAssetsDownloader = safeLazy(() => import("./MediaAssetsDownloader"), "MediaAssetsDownloader");
const DocumentRealPreviewer = safeLazy(() => import("./DocumentRealPreviewer"), "DocumentRealPreviewer");
const PhotoEditor = safeLazy(() => import("./PhotoEditor"), "PhotoEditor");
const LiveJokesAgent = safeLazy(() => import("./LiveJokesAgent"), "LiveJokesAgent");
const ApiStudioAgentHub = safeLazy(() => import("./ApiStudioAgentHub"), "ApiStudioAgentHub");
const DeepResearchAIAgent = safeLazy(() => import("./DeepResearchAIAgent"), "DeepResearchAIAgent");
const LiveCodeAnalyzerAgent = safeLazy(() => import("./LiveCodeAnalyzerAgent"), "LiveCodeAnalyzerAgent");
const AiImageStudioAgent = safeLazy(() => import("./AiImageStudioAgent"), "AiImageStudioAgent");
const AiVoiceSynthAgent = safeLazy(() => import("./AiVoiceSynthAgent"), "AiVoiceSynthAgent");
const AiTranslatorAgent = safeLazy(() => import("./AiTranslatorAgent"), "AiTranslatorAgent");
const AiContentCreatorAgent = safeLazy(() => import("./AiContentCreatorAgent"), "AiContentCreatorAgent");
const CurrencyFinancialAgent = safeLazy(() => import("./CurrencyFinancialAgent"), "CurrencyFinancialAgent");
const QrCodeBarcodeAgent = safeLazy(() => import("./QrCodeBarcodeAgent"), "QrCodeBarcodeAgent");
const WikipediaKnowledgeAgent = safeLazy(() => import("./WikipediaKnowledgeAgent"), "WikipediaKnowledgeAgent");
const NasaSpaceAgent = safeLazy(() => import("./NasaSpaceAgent"), "NasaSpaceAgent");
const IpGeoNetworkAgent = safeLazy(() => import("./IpGeoNetworkAgent"), "IpGeoNetworkAgent");
const CryptoTrackerAgent = safeLazy(() => import("./CryptoTrackerAgent"), "CryptoTrackerAgent");
const MockDataGeneratorAgent = safeLazy(() => import("./MockDataGeneratorAgent"), "MockDataGeneratorAgent");
const AnimalFactsAgent = safeLazy(() => import("./AnimalFactsAgent"), "AnimalFactsAgent");
const OpenTriviaAgent = safeLazy(() => import("./OpenTriviaAgent"), "OpenTriviaAgent");
const RestCountriesAgent = safeLazy(() => import("./RestCountriesAgent"), "RestCountriesAgent");
const UniversitiesAgent = safeLazy(() => import("./UniversitiesAgent"), "UniversitiesAgent");
const AdviceQuotesAgent = safeLazy(() => import("./AdviceQuotesAgent"), "AdviceQuotesAgent");
const PicsumImageGalleryAgent = safeLazy(() => import("./PicsumImageGalleryAgent"), "PicsumImageGalleryAgent");
const OpenLibraryBooksAgent = safeLazy(() => import("./OpenLibraryBooksAgent"), "OpenLibraryBooksAgent");
const AirQualitySolarAgent = safeLazy(() => import("./AirQualitySolarAgent"), "AirQualitySolarAgent");
const GoogleCalendarOpenRouterAgent = safeLazy(() => import("./GoogleCalendarOpenRouterAgent"), "GoogleCalendarOpenRouterAgent");
const EnglishLearningAgent = safeLazy(() => import("./EnglishLearningAgent"), "EnglishLearningAgent");
const GlobalNewsAgent = safeLazy(() => import("./GlobalNewsAgent"), "GlobalNewsAgent");
const EarthSpaceLiveAgent = safeLazy(() => import("./EarthSpaceLiveAgent"), "EarthSpaceLiveAgent");
const MusicPlayer = safeLazy(() => import("./MusicPlayer"), "MusicPlayer");
const YouTubeSearchPlayerAgent = safeLazy(() => import("./YouTubeSearchPlayerAgent"), "YouTubeSearchPlayerAgent");
const DocumentChatWorkspace = safeLazy(() => import("./DocumentChatWorkspace"), "DocumentChatWorkspace");
const MusicStudioWorkstation = safeLazy(() => import("./MusicStudioWorkstation"), "MusicStudioWorkstation");
const CodeHealthDoctorAgent = safeLazy(() => import("./CodeHealthDoctorAgent"), "CodeHealthDoctorAgent");
const RegexPlaygroundAgent = safeLazy(() => import("./RegexPlaygroundAgent"), "RegexPlaygroundAgent");
const CodeDiffInspectorModal = safeLazy(() => import("./CodeDiffInspectorModal"), "CodeDiffInspectorModal");
const ApiClientStudioAgent = safeLazy(() => import("./ApiClientStudioAgent"), "ApiClientStudioAgent");
const RelationalSqlStudioAgent = safeLazy(() => import("./RelationalSqlStudioAgent"), "RelationalSqlStudioAgent");
const MockServerWebhookAgent = safeLazy(() => import("./MockServerWebhookAgent"), "MockServerWebhookAgent");
const CodePerformanceAuditAgent = safeLazy(() => import("./CodePerformanceAuditAgent"), "CodePerformanceAuditAgent");
const DockerDevContainerStudioAgent = safeLazy(() => import("./DockerDevContainerStudioAgent"), "DockerDevContainerStudioAgent");
const GraphQLExplorerStudioAgent = safeLazy(() => import("./GraphQLExplorerStudioAgent"), "GraphQLExplorerStudioAgent");
const OpenApiStudioAgent = safeLazy(() => import("./OpenApiStudioAgent"), "OpenApiStudioAgent");
const RealtimeStreamTesterAgent = safeLazy(() => import("./RealtimeStreamTesterAgent"), "RealtimeStreamTesterAgent");
const DatabaseErdStudioAgent = safeLazy(() => import("./DatabaseErdStudioAgent"), "DatabaseErdStudioAgent");
const CronSchedulerStudioAgent = safeLazy(() => import("./CronSchedulerStudioAgent"), "CronSchedulerStudioAgent");
const CicdWorkflowArchitectAgent = safeLazy(() => import("./CicdWorkflowArchitectAgent"), "CicdWorkflowArchitectAgent");
const JwtCryptoLabStudioAgent = safeLazy(() => import("./JwtCryptoLabStudioAgent"), "JwtCryptoLabStudioAgent");
const NetworkTrafficHarStudioAgent = safeLazy(() => import("./NetworkTrafficHarStudioAgent"), "NetworkTrafficHarStudioAgent");
const DesignTokensTailwindStudioAgent = safeLazy(() => import("./DesignTokensTailwindStudioAgent"), "DesignTokensTailwindStudioAgent");

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
  onOpenTimeMachine?: () => void;
  onOpenSecretsVault?: () => void;
  onOpenSnippets?: () => void;
}

export const AppTabViewsRouter: React.FC<AppTabViewsRouterProps> = React.memo(({
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
  handleSelectTrack,
  onOpenTimeMachine,
  onOpenSecretsVault,
  onOpenSnippets
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
            onOpenTimeMachine={onOpenTimeMachine}
            onOpenSecretsVault={onOpenSecretsVault}
            onOpenSnippets={onOpenSnippets}
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

      {/* VIEW: PRO AUDIO STUDIO (POLYPHONIC PIANO & 16-STEP DRUM MACHINE) */}
      {(activeTab === "music-studio" || activeTab === "piano" || activeTab === "drums") && (
        <MusicStudioWorkstation
          theme={theme}
          initialMode={activeTab === "piano" ? "piano" : activeTab === "drums" ? "drums" : "studio"}
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

      {/* VIEW: CODE HEALTH DOCTOR AGENT */}
      {activeTab === "code-doctor" && (
        <div className="w-full h-full flex-1 flex flex-col min-w-0 min-h-0 overflow-hidden">
          <CodeHealthDoctorAgent
            files={files}
            activeFile={activeFile}
            apiKey={apiKey}
            selectedModel={selectedModel}
            theme={theme}
            onApplyFix={(filePath, newCode) => {
              setFiles(prev => prev.map(f => f.path === filePath ? { ...f, content: newCode, isUserCreated: true } : f));
              addAgentAction("fix", `Applied Code Health Doctor refactoring to ${filePath}`);
            }}
            onAddLog={(type, msg) => addAgentAction(type as any, msg)}
          />
        </div>
      )}

      {/* VIEW: REGEX PLAYGROUND AGENT */}
      {activeTab === "regex-playground" && (
        <div className="w-full h-full flex-1 flex flex-col min-w-0 min-h-0 overflow-hidden">
          <RegexPlaygroundAgent
            apiKey={apiKey}
            selectedModel={selectedModel}
            theme={theme}
            onAddLog={(type, msg) => addAgentAction(type as any, msg)}
          />
        </div>
      )}

      {/* VIEW: DIFF INSPECTOR */}
      {activeTab === "diff-inspector" && (
        <div className="w-full h-full flex-1 flex flex-col min-w-0 min-h-0 overflow-hidden">
          <CodeDiffInspectorModal
            isOpen={true}
            onClose={() => setActiveTab("editor")}
            files={files}
            activeFilePath={activeFile?.path}
            theme={theme}
            onApplyDiff={(targetPath, newContent) => {
              setFiles(prev => prev.map(f => f.path === targetPath ? { ...f, content: newContent, isUserCreated: true } : f));
              addAgentAction("edit", `Applied diff patch to ${targetPath}`);
            }}
          />
        </div>
      )}

      {/* VIEW: REST & API CLIENT STUDIO */}
      {activeTab === "api-client" && (
        <div className="w-full h-full flex-1 flex flex-col min-w-0 min-h-0 overflow-hidden">
          <ApiClientStudioAgent
            apiKey={apiKey}
            theme={theme}
            onAddLog={(type, msg) => addAgentAction(type as any, msg)}
          />
        </div>
      )}

      {/* VIEW: SQL STUDIO & RELATIONAL SANDBOX */}
      {activeTab === "sql-studio" && (
        <div className="w-full h-full flex-1 flex flex-col min-w-0 min-h-0 overflow-hidden">
          <RelationalSqlStudioAgent
            apiKey={apiKey}
            selectedModel={selectedModel}
            theme={theme}
            onAddLog={(type, msg) => addAgentAction(type as any, msg)}
          />
        </div>
      )}

      {/* VIEW: MOCK API SERVER & LIVE WEBHOOK INSPECTOR */}
      {activeTab === "mock-server" && (
        <div className="w-full h-full flex-1 flex flex-col min-w-0 min-h-0 overflow-hidden">
          <MockServerWebhookAgent
            apiKey={apiKey}
            theme={theme}
            onAddLog={(type, msg) => addAgentAction(type as any, msg)}
          />
        </div>
      )}

      {/* VIEW: LIGHTHOUSE-STYLE CODE HEALTH & PERFORMANCE AUDITOR */}
      {activeTab === "perf-auditor" && (
        <div className="w-full h-full flex-1 flex flex-col min-w-0 min-h-0 overflow-hidden">
          <CodePerformanceAuditAgent
            files={files as any}
            theme={theme}
            onAddLog={(type, msg) => addAgentAction(type as any, msg)}
            onNavigateToFile={(path) => {
              setSelectedFilePath(path);
              setActiveTab("editor");
            }}
          />
        </div>
      )}

      {/* VIEW: DOCKER & DEVCONTAINER ARCHITECT STUDIO */}
      {activeTab === "docker-studio" && (
        <div className="w-full h-full flex-1 flex flex-col min-w-0 min-h-0 overflow-hidden">
          <DockerDevContainerStudioAgent
            files={files}
            theme={theme}
            onSaveFile={(path, content) => {
              setFiles(prev => {
                const exists = prev.some(f => f.path === path);
                if (exists) {
                  return prev.map(f => f.path === path ? { ...f, content, isUserCreated: true } : f);
                }
                const ext = path.split(".").pop() || "plaintext";
                return [...prev, { path, content, language: ext, isFolder: false, isUserCreated: true }];
              });
              addAgentAction("create", `Created or updated ${path} in workspace`);
            }}
            onAddLog={(type, msg) => addAgentAction(type as any, msg)}
          />
        </div>
      )}

      {/* VIEW: GRAPHQL EXPLORER & PLAYGROUND STUDIO */}
      {activeTab === "graphql-studio" && (
        <div className="w-full h-full flex-1 flex flex-col min-w-0 min-h-0 overflow-hidden">
          <GraphQLExplorerStudioAgent
            apiKey={apiKey}
            theme={theme}
            onAddLog={(type, msg) => addAgentAction(type as any, msg)}
          />
        </div>
      )}

      {/* VIEW: OPENAPI & SWAGGER SPEC STUDIO */}
      {activeTab === "openapi-studio" && (
        <div className="w-full h-full flex-1 flex flex-col min-w-0 min-h-0 overflow-hidden">
          <OpenApiStudioAgent
            files={files}
            theme={theme}
            onSaveFile={(path, content) => {
              setFiles(prev => {
                const exists = prev.some(f => f.path === path);
                if (exists) {
                  return prev.map(f => f.path === path ? { ...f, content, isUserCreated: true } : f);
                }
                const ext = path.split(".").pop() || "plaintext";
                return [...prev, { path, content, language: ext, isFolder: false, isUserCreated: true }];
              });
              addAgentAction("create", `Created or updated ${path} in workspace`);
            }}
            onAddLog={(type, msg) => addAgentAction(type as any, msg)}
          />
        </div>
      )}

      {/* VIEW: WEBSOCKET & SSE REALTIME STREAM TESTER */}
      {activeTab === "stream-tester" && (
        <div className="w-full h-full flex-1 flex flex-col min-w-0 min-h-0 overflow-hidden">
          <RealtimeStreamTesterAgent
            apiKey={apiKey}
            theme={theme}
            onSaveFile={(path, content) => {
              setFiles(prev => {
                const exists = prev.some(f => f.path === path);
                if (exists) {
                  return prev.map(f => f.path === path ? { ...f, content, isUserCreated: true } : f);
                }
                const ext = path.split(".").pop() || "plaintext";
                return [...prev, { path, content, language: ext, isFolder: false, isUserCreated: true }];
              });
              addAgentAction("create", `Created or updated ${path} in workspace`);
            }}
            onAddLog={(type, msg) => addAgentAction(type as any, msg)}
          />
        </div>
      )}

      {/* VIEW: DATABASE SCHEMA & ERD ARCHITECT */}
      {activeTab === "erd-studio" && (
        <div className="w-full h-full flex-1 flex flex-col min-w-0 min-h-0 overflow-hidden">
          <DatabaseErdStudioAgent
            files={files}
            theme={theme}
            onSaveFile={(path, content) => {
              setFiles(prev => {
                const exists = prev.some(f => f.path === path);
                if (exists) {
                  return prev.map(f => f.path === path ? { ...f, content, isUserCreated: true } : f);
                }
                const ext = path.split(".").pop() || "plaintext";
                return [...prev, { path, content, language: ext, isFolder: false, isUserCreated: true }];
              });
              addAgentAction("create", `Created or updated ${path} in workspace`);
            }}
            onAddLog={(type, msg) => addAgentAction(type as any, msg)}
          />
        </div>
      )}

      {/* VIEW: CRON & TASK SCHEDULER STUDIO */}
      {activeTab === "cron-studio" && (
        <div className="w-full h-full flex-1 flex flex-col min-w-0 min-h-0 overflow-hidden">
          <CronSchedulerStudioAgent
            theme={theme}
            onSaveFile={(path, content) => {
              setFiles(prev => {
                const exists = prev.some(f => f.path === path);
                if (exists) {
                  return prev.map(f => f.path === path ? { ...f, content, isUserCreated: true } : f);
                }
                const ext = path.split(".").pop() || "plaintext";
                return [...prev, { path, content, language: ext, isFolder: false, isUserCreated: true }];
              });
              addAgentAction("create", `Created or updated ${path} in workspace`);
            }}
            onAddLog={(type, msg) => addAgentAction(type as any, msg)}
          />
        </div>
      )}

      {/* VIEW: CI/CD & GITHUB ACTIONS ARCHITECT */}
      {activeTab === "cicd-architect" && (
        <div className="w-full h-full flex-1 flex flex-col min-w-0 min-h-0 overflow-hidden">
          <CicdWorkflowArchitectAgent
            files={files}
            theme={theme}
            onSaveFile={(path, content) => {
              setFiles(prev => {
                const exists = prev.some(f => f.path === path);
                if (exists) {
                  return prev.map(f => f.path === path ? { ...f, content, isUserCreated: true } : f);
                }
                const ext = path.split(".").pop() || "plaintext";
                return [...prev, { path, content, language: ext, isFolder: false, isUserCreated: true }];
              });
              addAgentAction("create", `Created or updated ${path} in workspace`);
            }}
            onAddLog={(type, msg) => addAgentAction(type as any, msg)}
          />
        </div>
      )}

      {/* VIEW: JWT & CRYPTO LAB STUDIO */}
      {activeTab === "jwt-lab" && (
        <div className="w-full h-full flex-1 flex flex-col min-w-0 min-h-0 overflow-hidden">
          <JwtCryptoLabStudioAgent
            theme={theme}
            onSaveFile={(path, content) => {
              setFiles(prev => {
                const exists = prev.some(f => f.path === path);
                if (exists) {
                  return prev.map(f => f.path === path ? { ...f, content, isUserCreated: true } : f);
                }
                const ext = path.split(".").pop() || "plaintext";
                return [...prev, { path, content, language: ext, isFolder: false, isUserCreated: true }];
              });
              addAgentAction("create", `Created or updated ${path} in workspace`);
            }}
            onAddLog={(type, msg) => addAgentAction(type as any, msg)}
          />
        </div>
      )}

      {/* VIEW: NETWORK TRAFFIC & HAR STUDIO */}
      {activeTab === "network-har-studio" && (
        <div className="w-full h-full flex-1 flex flex-col min-w-0 min-h-0 overflow-hidden">
          <NetworkTrafficHarStudioAgent
            theme={theme}
            onSaveFile={(path, content) => {
              setFiles(prev => {
                const exists = prev.some(f => f.path === path);
                if (exists) {
                  return prev.map(f => f.path === path ? { ...f, content, isUserCreated: true } : f);
                }
                const ext = path.split(".").pop() || "plaintext";
                return [...prev, { path, content, language: ext, isFolder: false, isUserCreated: true }];
              });
              addAgentAction("create", `Created or updated ${path} in workspace`);
            }}
            onAddLog={(type, msg) => addAgentAction(type as any, msg)}
          />
        </div>
      )}

      {/* VIEW: TAILWIND DESIGN TOKENS STUDIO */}
      {activeTab === "tailwind-tokens-studio" && (
        <div className="w-full h-full flex-1 flex flex-col min-w-0 min-h-0 overflow-hidden">
          <DesignTokensTailwindStudioAgent
            files={files}
            theme={theme}
            onSaveFile={(path, content) => {
              setFiles(prev => {
                const exists = prev.some(f => f.path === path);
                if (exists) {
                  return prev.map(f => f.path === path ? { ...f, content, isUserCreated: true } : f);
                }
                const ext = path.split(".").pop() || "plaintext";
                return [...prev, { path, content, language: ext, isFolder: false, isUserCreated: true }];
              });
              addAgentAction("create", `Created or updated ${path} in workspace`);
            }}
            onAddLog={(type, msg) => addAgentAction(type as any, msg)}
          />
        </div>
      )}
      </React.Suspense>
    </div>
  );
});
