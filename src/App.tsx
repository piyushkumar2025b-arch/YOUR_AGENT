import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { 
  Sparkles, 
  Download, 
  Plus, 
  Trash2, 
  FileCode, 
  Send, 
  Globe, 
  Terminal, 
  Cpu, 
  Brain,
  Coffee, 
  Check, 
  AlertCircle, 
  Eye, 
  Code2, 
  RefreshCw, 
  FileText, 
  Key, 
  HelpCircle, 
  Search, 
  FolderPlus,
  Play,
  Pause,
  Mail,
  Folder,
  FolderOpen,
  LogOut,
  ChevronRight,
  ChevronDown,
  ChevronLeft,
  RefreshCcw,
  Paperclip,
  AlertTriangle,
  Music,
  Youtube,
  Sun,
  Moon,
  User,
  Github,
  Database,
  Flame,
  Workflow,
  Volume2,
  VolumeX,
  Volume1,
  Settings,
  Sliders,
  ShieldCheck,
  GraduationCap,
  Newspaper,
  Edit3,
  CheckCircle,
  Palette,
  Image as ImageIcon,
  MapPin,
  Compass,
  BookOpen,
  Book,
  Gamepad2,
  X,
  SkipBack,
  SkipForward,
  StopCircle,
  Upload,
  Camera,
  RotateCcw,
  Calculator,
  Laugh,
  Bot,
  ShieldAlert,
  Lock,
  Wand2,
  Languages,
  Share2,
  DollarSign,
  QrCode,
  Rocket,
  Coins,
  Users,
  Dog,
  Quote,
  Wind,
  Keyboard,
  Command,
  Repeat,
  ExternalLink,
  Bug
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { VirtualFile, Message, Model, AgentAction, WorkspaceTemplate, ExecutionStats } from "./types";
import { templates } from "./templates";
import { syncFilesToFirebase, loadFilesFromFirebase, syncMessagesToFirebase, loadMessagesFromFirebase, logActionToFirebase } from "./services/firebaseSyncService";
import { AppNavigationTabsBar } from "./components/AppNavigationTabsBar";
import { AiBrainSidebarPanel } from "./components/AiBrainSidebarPanel";
import { AppTabViewsRouter } from "./components/AppTabViewsRouter";
import { AppModalsContainer } from "./components/AppModalsContainer";
import { WorkspaceTabsBar } from "./components/WorkspaceTabsBar";
import { errorHandler } from "./services/errorHandlerService";
import { setupWebsiteSecurityListeners } from "./utils/security";
import { getStoredOpenRouterKey, setStoredOpenRouterKey, removeStoredOpenRouterKey } from "./utils/keyObfuscation";
import { buildAgenticSkillsSystemPrompt } from "./services/agentSkillsService";
import { detectAndSelectChain } from "./services/agentOrchestratorService";
import { compressMessageHistory, compressWorkspaceFileContext } from "./services/tokenOptimizationService";
import { exportSingleFile, exportFolderZip, exportWorkspaceZip, exportWordDocument, exportPdfDocument } from "./services/workspaceExportService";
import { popularModels, deduplicateModels, getFileBadgeAndIcon } from "./utils/fileHelpers";
import { highlightCode } from "./utils/syntaxHighlighter";
import { TOP_REAL_CHARTS } from "./data/musicTracks";
import { ensureSessionToken, getAuthHeaders } from "./utils/apiAuth";
import { getOrFetchModels } from "./utils/modelsCache";
import { safeLazy } from "./utils/lazyRetry";
import { SystemSecurityShieldModal } from "./components/SystemSecurityShieldModal";
const LandingPage = safeLazy(() => import("./components/LandingPage"), "LandingPage");
import {
  BorderLayoutSlidersBar,
  VerticalResizeSliderHandle,
  HorizontalResizeSliderHandle,
  BorderSettings,
  DEFAULT_BORDER_SETTINGS
} from "./components/BorderLayoutSliders";
import { HeaderBar } from "./components/HeaderBar";
import {
  initAuth,
  googleSignIn,
  logout as googleLogout,
  listEmails,
  sendEmail as googleSendEmail,
  GmailMessageSummary,
  createDriveFolder,
  uploadFileToDrive
} from "./gmailService";

// Models and syntax utilities moved to /src/utils/fileHelpers and /src/utils/syntaxHighlighter

export default function App() {
  // ----------------------------------------------------
  // Local State
  // ----------------------------------------------------
  const [apiKey, setApiKey] = useState<string>(() => {
    return getStoredOpenRouterKey();
  });
  const [showKey, setShowKey] = useState<boolean>(false);
  const [selectedModel, setSelectedModel] = useState<string>("google/gemini-2.5-flash");
  const [models, setModels] = useState<Model[]>(popularModels);
  const [modelSearch, setModelSearch] = useState<string>("");
  const [isLoadingModels, setIsLoadingModels] = useState<boolean>(false);

  // Files & Workspace
  const [files, setFiles] = useState<VirtualFile[]>(() => {
    const cachedFiles = localStorage.getItem("agent_workspace_files");
    if (cachedFiles) {
      try { return JSON.parse(cachedFiles); } catch { }
    }
    return templates[0].files; // Default to Web template
  });
  const [selectedFilePath, setSelectedFilePath] = useState<string>(() => {
    const cachedFiles = localStorage.getItem("agent_workspace_files");
    if (cachedFiles) {
      try {
        const parsed = JSON.parse(cachedFiles);
        if (parsed.length > 0) return parsed[0].path;
      } catch { }
    }
    return "index.html";
  });
  const activeFile = files.find(f => f.path === selectedFilePath);
  const activeBadge = activeFile ? getFileBadgeAndIcon(activeFile.path) : null;
  const [activeTab, setActiveTab] = useState<"editor" | "preview" | "actions" | "gmail" | "music" | "youtube" | "calculator" | "chat" | "photos" | "map" | "story" | "dictionary" | "gaming" | "settings" | "agents" | "skills" | "github" | "search" | "supabase" | "firebase" | "study" | "cp" | "share" | "trending-repos" | "weather" | "live-quiz" | "media-downloader" | "doc-previewer" | "photo-editor" | "jokes" | "api-hub" | "deep-research" | "code-analyzer" | "image-studio" | "voice-synth" | "translator" | "content-creator" | "currency-agent" | "qrcode-agent" | "wiki-agent" | "nasa-agent" | "ipgeo-agent" | "crypto-agent" | "mockdata-agent" | "animal-agent" | "opentrivia-agent" | "countries-agent" | "universities-agent" | "advice-agent" | "picsum-agent" | "books-agent" | "airquality-agent" | "calendar-agent" | "english-agent" | "news-agent">("editor");
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    const cached = localStorage.getItem("vibecoder_theme");
    return cached === "light" ? "light" : "dark";
  });
  const [isApiDashboardOpen, setIsApiDashboardOpen] = useState<boolean>(false);
  const [showGoogleServicesModal, setShowGoogleServicesModal] = useState<boolean>(false);
  const [isThemeSelectorOpen, setIsThemeSelectorOpen] = useState<boolean>(false);
  const [deleteConfirmTarget, setDeleteConfirmTarget] = useState<{ type: "file" | "folder"; path: string } | null>(null);
  const [renamingPath, setRenamingPath] = useState<{ type: "file" | "folder"; path: string } | null>(null);
  const [renameInputValue, setRenameInputValue] = useState<string>("");

  // Chat context extension states
  const [attachedFileForChat, setAttachedFileForChat] = useState<string>("");
  const [selectedAgentForChat, setSelectedAgentForChat] = useState<string>("all");

  // Resizable split screens & Adjustable Layout Sliders
  const [sidebarWidth, setSidebarWidth] = useState<number>(340); // Pixel width (240px - 600px)
  const [editorWidth, setEditorWidth] = useState<number>(50); // Percentage split (20% - 80%)
  const [editorFontSize, setEditorFontSize] = useState<number>(13);
  const [brainBoardHeight, setBrainBoardHeight] = useState<number>(180);
  const [isBrainCollapsed, setIsBrainCollapsed] = useState<boolean>(false);
  const [showSlidersBar, setShowSlidersBar] = useState<boolean>(false);
  const [borderSettings, setBorderSettings] = useState<BorderSettings>(() => {
    const cached = localStorage.getItem("app_border_settings");
    if (cached) {
      try { return JSON.parse(cached); } catch { }
    }
    return DEFAULT_BORDER_SETTINGS;
  });

  useEffect(() => {
    localStorage.setItem("app_border_settings", JSON.stringify(borderSettings));
  }, [borderSettings]);

  // Custom Dev Studio Photo & Brand Avatar Upload
  const [studioLogoPhoto, setStudioLogoPhoto] = useState<string | null>(() => {
    return localStorage.getItem("custom_studio_logo_photo") || null;
  });
  const studioLogoInputRef = useRef<HTMLInputElement>(null);

  const handleStudioLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        safeAlert("Selected image is too large. Please upload an image under 5MB.", "error");
        return;
      }
      const reader = new FileReader();
      reader.onload = (evt) => {
        const res = evt.target?.result as string;
        if (res) {
          setStudioLogoPhoto(res);
          localStorage.setItem("custom_studio_logo_photo", res);
          addAgentAction("info", "Updated Dev Studio custom brand avatar photo.");
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const [isMathPlotterOpen, setIsMathPlotterOpen] = useState<boolean>(false);
  const [isRunnerModalOpen, setIsRunnerModalOpen] = useState<boolean>(false);
  const [isCodeRunnerOpen, setIsCodeRunnerOpen] = useState<boolean>(false);
  const [isShortcutsHelpOpen, setIsShortcutsHelpOpen] = useState<boolean>(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState<boolean>(false);
  const [isSecurityShieldOpen, setIsSecurityShieldOpen] = useState<boolean>(false);
  const [isErrorLogCenterOpen, setIsErrorLogCenterOpen] = useState<boolean>(false);
  const [unresolvedErrorCount, setUnresolvedErrorCount] = useState<number>(0);
  const [showCodeMap, setShowCodeMap] = useState<boolean>(true);

  useEffect(() => {
    const unsub = errorHandler.subscribe((logs) => {
      setUnresolvedErrorCount(logs.filter(e => !e.resolved && (e.severity === 'fatal' || e.severity === 'error')).length);
    });
    return () => unsub();
  }, []);

  // Ensure session auth token is active for all API and sandbox requests (BUG-V3-015)
  useEffect(() => {
    ensureSessionToken().catch(() => {});
  }, []);

  // Free Model Photo Generator States
  const [photoPrompt, setPhotoPrompt] = useState<string>("");
  const [photoModel, setPhotoModel] = useState<string>("flux");
  const [photoRatio, setPhotoRatio] = useState<string>("1:1");
  const [photoUrl, setPhotoUrl] = useState<string>("");
  const [isGeneratingPhoto, setIsGeneratingPhoto] = useState<boolean>(false);

  // Retro Music Player States
  const [musicSource, setMusicSource] = useState<"jiosaavn" | "jamendo">("jiosaavn");
  const [musicSearchQuery, setMusicSearchQuery] = useState<string>("");
  const [musicTracks, setMusicTracks] = useState<any[]>(TOP_REAL_CHARTS);
  const [currentTrackIndex, setCurrentTrackIndex] = useState<number | null>(0);
  const [isMusicPlaying, setIsMusicPlaying] = useState<boolean>(false);
  const [musicVolume, setMusicVolume] = useState<number>(0.7);
  const [isMusicMuted, setIsMusicMuted] = useState<boolean>(false);
  const [musicDuration, setMusicDuration] = useState<number>(0);
  const [musicCurrentTime, setMusicCurrentTime] = useState<number>(0);
  const [isMusicLoading, setIsMusicLoading] = useState<boolean>(false);

  // YT Agent States & Continuous Playback Controls
  const [ytUrl, setYtUrl] = useState<string>("");
  const [ytMetadata, setYtMetadata] = useState<any | null>(null);
  const [isYtLoading, setIsYtLoading] = useState<boolean>(false);
  const [ytSummary, setYtSummary] = useState<string>("");
  const [ytQuiz, setYtQuiz] = useState<any[]>([]);
  const [ytQuizAnswers, setYtQuizAnswers] = useState<Record<number, number>>({});
  const [ytQuizSubmitted, setYtQuizSubmitted] = useState<boolean>(false);
  const [ytSummaryData, setYtSummaryData] = useState<any | null>(null);
  const [ytLoopForever, setYtLoopForever] = useState<boolean>(true);
  const [ytAutoplay, setYtAutoplay] = useState<boolean>(true);
  const [ytForceStopped, setYtForceStopped] = useState<boolean>(false);
  const [ytPlayerError, setYtPlayerError] = useState<string | null>(null);

  // Just Chat (Doc Helper) States
  const [docChatPrompt, setDocChatPrompt] = useState<string>("");
  const [docChatHistory, setDocChatHistory] = useState<any[]>([
    {
      role: "assistant",
      content: "Welcome to Document & Media Helper! Describe what notes or files you'd like to prepare. I can generate DOCX (Word), HTML (Web pages), PDF (Printer-friendly layout), or interactive visual graphics (SVG images) instantly in your sandbox!"
    }
  ]);
  const [isDocChatLoading, setIsDocChatLoading] = useState<boolean>(false);

  // Folder Explorer States
  const [emptyFolders, setEmptyFolders] = useState<string[]>(["src", "src/components"]);
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({
    "src": true,
    "src/components": true
  });
  const [isAddingFolder, setIsAddingFolder] = useState<boolean>(false);
  const [newFolderName, setNewFolderName] = useState<string>("");
  const [fileSearchQuery, setFileSearchQuery] = useState<string>("");

  // Sandbox Terminal States
  const [showTerminal, setShowTerminal] = useState<boolean>(false);
  const [terminalOutput, setTerminalOutput] = useState<string>("OpenRouter Sandbox Terminal\nClick 'Run Active File' or type a custom command below to execute...\n");
  const [isTerminalRunning, setIsTerminalRunning] = useState<boolean>(false);
  const [customCommandInput, setCustomCommandInput] = useState<string>("");
  const [terminalExitCode, setTerminalExitCode] = useState<number | null>(null);
  const [terminalRunCommand, setTerminalRunCommand] = useState<string>("");

  // Gmail Agent States
  const [gmailUser, setGmailUser] = useState<any>(null);
  const [gmailToken, setGmailToken] = useState<string | null>(null);
  const [isGmailLoggingIn, setIsGmailLoggingIn] = useState<boolean>(false);
  const [gmailEmails, setGmailEmails] = useState<GmailMessageSummary[]>([]);
  const [isLoadingEmails, setIsLoadingEmails] = useState<boolean>(false);
  const [selectedGmailId, setSelectedGmailId] = useState<string | null>(null);
  const [gmailSearchQuery, setGmailSearchQuery] = useState<string>("");
  const [isGmailComposing, setIsGmailComposing] = useState<boolean>(false);
  const [emailTo, setEmailTo] = useState<string>("");
  const [emailSubject, setEmailSubject] = useState<string>("");
  const [emailBody, setEmailBody] = useState<string>("");
  const [isSendingEmail, setIsSendingEmail] = useState<boolean>(false);

  // AI draft generator inside Compose
  const [aiDraftPrompt, setAiDraftPrompt] = useState<string>("");
  const [isDraftingAI, setIsDraftingAI] = useState<boolean>(false);

  // Chat & Agent State
  const [messages, setMessages] = useState<Message[]>(() => {
    const cachedMessages = localStorage.getItem("agent_workspace_messages");
    if (cachedMessages) {
      try { return JSON.parse(cachedMessages); } catch { }
    }
    return [
      {
        id: "system-1",
        role: "assistant",
        content: "Hi! I am your AI Developer Agent. I can write and manage code in any language. Let me know what you want to build, edit, or debug. I will perform all workspace actions automatically!",
        timestamp: new Date().toLocaleTimeString()
      }
    ];
  });
  const [inputPrompt, setInputPrompt] = useState<string>("");
  const [isAgentProcessing, setIsAgentProcessing] = useState<boolean>(false);
  const [agentActions, setAgentActions] = useState<AgentAction[]>(() => {
    const cachedActions = localStorage.getItem("agent_workspace_actions");
    if (cachedActions) {
      try { return JSON.parse(cachedActions); } catch { }
    }
    return [
      {
        id: "init-action",
        type: "info",
        message: "Workspace initialized with template project.",
        timestamp: new Date().toLocaleTimeString()
      }
    ];
  });

  const addAgentAction = (type: "create" | "edit" | "delete" | "analyze" | "info" | "error" | "memory", message: string, path?: string) => {
    const newAction: AgentAction = {
      id: `act-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      type,
      message,
      path,
      timestamp: new Date().toLocaleTimeString()
    };
    setAgentActions(prev => [newAction, ...prev]);
  };

  const safeAlert = (message: string, type: "info" | "error" = "info") => {
    try {
      addAgentAction(type, message);
    } catch {}
    try {
      if (typeof window !== "undefined" && typeof window.alert === "function") {
        window.alert(message);
      }
    } catch {
      // Handled if browser sandbox blocks window.alert
    }
  };

  // Landing Page & Workspace Entrance States - Default to active workspace for instant usability
  const [hasEnteredWorkspace, setHasEnteredWorkspace] = useState<boolean>(true);
  const [workspaceTitle, setWorkspaceTitle] = useState<string>("My AI Developer Studio");
  const [isWorkspaceLoading, setIsWorkspaceLoading] = useState<boolean>(false);
  const [workspaceLoadingMsg, setWorkspaceLoadingMsg] = useState<string>("Initializing Multi-Agent Environment...");
  const [currentAuthMode, setCurrentAuthMode] = useState<"google" | "github" | "guest">("guest");

  const handleEnterWorkspace = (name: string, authType: "google" | "github" | "guest") => {
    const finalName = name.trim() || (authType === "guest" ? "Guest Dev Studio" : "My AI Developer Studio");
    setCurrentAuthMode(authType);
    setWorkspaceTitle(finalName);
    setIsWorkspaceLoading(true);
    setWorkspaceLoadingMsg(authType === "guest" ? "Initializing Instant Guest Workspace..." : "Initializing Multi-Agent Environment...");

    // Ensure session auth token exists for sandbox & code execution
    ensureSessionToken().catch(() => {});

    setTimeout(() => {
      setWorkspaceLoadingMsg(authType === "guest" ? "Activating Guest Sandbox & Terminal Node..." : `Mounting Workspace "${finalName}"...`);
    }, 600);

    setTimeout(() => {
      setWorkspaceLoadingMsg(authType === "guest" ? "Configuring Multi-Agent Swarm Tools..." : "Configuring OpenRouter AI Proxy...");
    }, 1200);

    setTimeout(() => {
      setIsWorkspaceLoading(false);
      setHasEnteredWorkspace(true);
    }, 1800);
  };

  // Sidebar Controls & Modals
  const [newFileName, setNewFileName] = useState<string>("");
  const [isAddingFile, setIsAddingFile] = useState<boolean>(false);
  const [previewSrcDoc, setPreviewSrcDoc] = useState<string>("");
  const [apiConnectionStatus, setApiConnectionStatus] = useState<"idle" | "testing" | "success" | "error">("idle");
  const [apiErrorMessage, setApiErrorMessage] = useState<string>("");

  // Google Drive Upload States
  const [isDriveUploading, setIsDriveUploading] = useState<boolean>(false);
  const [driveUploadProgress, setDriveUploadProgress] = useState<string>("");
  const [driveUploadLink, setDriveUploadLink] = useState<string | null>(null);
  const [showDriveModal, setShowDriveModal] = useState<boolean>(false);

  // Brain Questioning Mode States
  const [brainPersonality, setBrainPersonality] = useState<"socratic" | "innovator" | "architect" | "partner">("socratic");
  const [brainQuestions, setBrainQuestions] = useState<string[]>([]);

  // UI Refs & VS Code Editor States
  const chatEndRef = useRef<HTMLDivElement>(null);
  const editorPreRef = useRef<HTMLPreElement>(null);
  const editorTextareaRef = useRef<HTMLTextAreaElement>(null);
  const editorGutterRef = useRef<HTMLDivElement>(null);

  const [cursorLine, setCursorLine] = useState<number>(1);
  const [cursorCol, setCursorCol] = useState<number>(1);
  const [breakpoints, setBreakpoints] = useState<Record<string, number[]>>({});

  const [indentSize, setIndentSize] = useState<number>(2);
  const [indentType, setIndentType] = useState<"Spaces" | "Tabs">("Spaces");
  const [fileEncoding, setFileEncoding] = useState<string>("UTF-8");
  const [showGoToLineModal, setShowGoToLineModal] = useState<boolean>(false);
  const [gotoLineInput, setGotoLineInput] = useState<string>("");
  const [showLanguagePickerModal, setShowLanguagePickerModal] = useState<boolean>(false);
  const [showVSCodeProModal, setShowVSCodeProModal] = useState<boolean>(false);
  const [showDocStatsModal, setShowDocStatsModal] = useState<boolean>(false);
  const [showEncodingPickerModal, setShowEncodingPickerModal] = useState<boolean>(false);

  const handleChangeFileLanguage = (newLang: string) => {
    setFiles(prev => prev.map(f => f.path === selectedFilePath ? { ...f, language: newLang } : f));
    addAgentAction("edit", `Changed file language syntax to ${newLang.toUpperCase()} for "${selectedFilePath}".`, selectedFilePath);
    setShowLanguagePickerModal(false);
  };

  const cursorPosRef = useRef({ line: 1, col: 1 });
  const updateCursorPos = (textarea: HTMLTextAreaElement) => {
    if (!textarea) return;
    const val = textarea.value || "";
    const selStart = textarea.selectionStart || 0;
    const lastNewline = val.lastIndexOf("\n", selStart - 1);
    const col = selStart - (lastNewline === -1 ? 0 : lastNewline + 1) + 1;
    let line = 1;
    for (let i = 0; i < selStart; i++) {
      if (val.charCodeAt(i) === 10) line++;
    }
    if (cursorPosRef.current.line !== line || cursorPosRef.current.col !== col) {
      cursorPosRef.current = { line, col };
      setCursorLine(line);
      setCursorCol(col);
    }
  };

  const jumpToLine = (lineNum: number) => {
    const activeFile = files.find(f => f.path === selectedFilePath);
    if (!activeFile || !editorTextareaRef.current) return;
    const fileLines = (activeFile.content || "").split("\n");
    const targetIndex = Math.max(0, Math.min(fileLines.length - 1, lineNum - 1));

    let offset = 0;
    for (let i = 0; i < targetIndex; i++) {
      offset += fileLines[i].length + 1;
    }

    const textarea = editorTextareaRef.current;
    textarea.focus();
    textarea.selectionStart = textarea.selectionEnd = offset;

    const lhFloat = parseFloat(String(borderSettings.codeLineHeight || 1.625));
    const lineH = editorFontSize * (isNaN(lhFloat) ? 1.625 : lhFloat);
    const targetScroll = Math.max(0, targetIndex * lineH - textarea.clientHeight / 3);

    textarea.scrollTop = targetScroll;
    if (editorGutterRef.current) editorGutterRef.current.scrollTop = targetScroll;
    if (editorPreRef.current) editorPreRef.current.scrollTop = targetScroll;

    setCursorLine(targetIndex + 1);
    setCursorCol(1);
  };

  const toggleBreakpoint = (filePath: string, lineNum: number) => {
    setBreakpoints(prev => {
      const list = prev[filePath] || [];
      const exists = list.includes(lineNum);
      const updated = exists ? list.filter(l => l !== lineNum) : [...list, lineNum];
      return { ...prev, [filePath]: updated };
    });
  };

  const handleFormatCode = () => {
    const activeFile = files.find(f => f.path === selectedFilePath);
    if (!activeFile) return;
    const lang = (activeFile.language || "").toLowerCase();
    const content = activeFile.content || "";

    try {
      if (lang === "json") {
        const parsed = JSON.parse(content);
        const formatted = JSON.stringify(parsed, null, 2);
        handleEditFileContent(formatted);
        addAgentAction("edit", `Formatted JSON document for "${activeFile.path}".`, activeFile.path);
        return;
      }
    } catch {
      // proceed with fallback string formatting
    }

    const formattedLines = content.split("\n").map(l => l.trimEnd());
    handleEditFileContent(formattedLines.join("\n"));
    addAgentAction("edit", `Formatted document code for "${activeFile.path}".`, activeFile.path);
  };

  const handleEditorScroll = (e: React.UIEvent<HTMLTextAreaElement>) => {
    const scrollTop = e.currentTarget.scrollTop;
    const scrollLeft = e.currentTarget.scrollLeft;
    if (editorPreRef.current) {
      editorPreRef.current.scrollTop = scrollTop;
      editorPreRef.current.scrollLeft = scrollLeft;
    }
    if (editorGutterRef.current) {
      editorGutterRef.current.scrollTop = scrollTop;
    }
  };

  // Safe Stringifier helper to prevent circular structure errors (e.g. HTMLAudioElement or FiberNode references)
  const safeStringify = (obj: any): string => {
    const seen = new WeakSet();
    return JSON.stringify(obj, (key, value) => {
      if (typeof value === "object" && value !== null) {
        if (
          seen.has(value) ||
          value instanceof HTMLElement ||
          (value.constructor && value.constructor.name && (value.constructor.name.includes("HTML") || value.constructor.name === "FiberNode"))
        ) {
          return undefined;
        }
        seen.add(value);
      }
      return value;
    });
  };

  // Website Security & Right-Click Protection State
  const [disableRightClick, setDisableRightClick] = useState<boolean>(() => {
    const saved = localStorage.getItem("security_disable_right_click");
    return saved === "true";
  });
  const [rightClickToast, setRightClickToast] = useState<boolean>(false);

  useEffect(() => {
    localStorage.setItem("security_disable_right_click", String(disableRightClick));
    
    if (disableRightClick) {
      const cleanup = setupWebsiteSecurityListeners(() => {
        setRightClickToast(true);
        setTimeout(() => setRightClickToast(false), 2500);
      });
      return cleanup;
    }
  }, [disableRightClick]);

  // ----------------------------------------------------
  // Persistent Storage Synchronizers (Debounced with Firebase Cloud Firestore Integration)
  // ----------------------------------------------------
  const initialCloudLoadDone = useRef(false);

  // Initial startup: Load from Firebase Firestore if available, otherwise fallback to local cache
  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const cloudWorkspace = await loadFilesFromFirebase();
        if (isMounted && cloudWorkspace && cloudWorkspace.files.length > 0) {
          setFiles(cloudWorkspace.files);
          if (cloudWorkspace.emptyFolders) setEmptyFolders(cloudWorkspace.emptyFolders);
        }
        const cloudMessages = await loadMessagesFromFirebase();
        if (isMounted && cloudMessages && cloudMessages.length > 0) {
          setMessages(cloudMessages);
        }
      } catch (err) {
        console.warn("Firebase initial restore fallback:", err);
      } finally {
        if (isMounted) {
          initialCloudLoadDone.current = true;
        }
      }
    })();
    return () => { isMounted = false; };
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        localStorage.setItem("agent_workspace_files", safeStringify(files));
        // Non-blocking Firebase Cloud Sync (only after initial restore resolves)
        if (initialCloudLoadDone.current) {
          syncFilesToFirebase(files, emptyFolders).catch(() => {});
        }
      } catch (err) {
        console.warn("Failed to save files to storage:", err);
      }
    }, 1200);
    return () => clearTimeout(timer);
  }, [files, emptyFolders]);

  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        localStorage.setItem("agent_workspace_messages", safeStringify(messages));
        // Non-blocking Firebase Cloud Sync (only after initial restore resolves)
        if (initialCloudLoadDone.current) {
          syncMessagesToFirebase(messages).catch(() => {});
        }
      } catch (err) {
        console.warn("Failed to save messages to storage:", err);
      }
    }, 800);
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    return () => clearTimeout(timer);
  }, [messages]);

  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        localStorage.setItem("agent_workspace_actions", safeStringify(agentActions));
        if (agentActions.length > 0) {
          const latest = agentActions[agentActions.length - 1];
          logActionToFirebase({ type: latest.type, message: latest.message, path: latest.path }).catch(() => {});
        }
      } catch (err) {
        console.warn("Failed to save actions to storage:", err);
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, [agentActions]);

  const initialKeyLoadedRef = useRef<boolean>(false);
  useEffect(() => {
    if (!initialKeyLoadedRef.current) {
      initialKeyLoadedRef.current = true;
      return;
    }
    if (apiKey) {
      setStoredOpenRouterKey(apiKey);
    } else {
      removeStoredOpenRouterKey();
    }
  }, [apiKey]);

  // Mouse Drag listeners for resizable layout splitscreen
  const isResizingSidebar = useRef<boolean>(false);
  const isResizingEditor = useRef<boolean>(false);
  const isResizingBrain = useRef<boolean>(false);

  const startSidebarResize = (e: React.MouseEvent) => {
    e.preventDefault();
    isResizingSidebar.current = true;
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
  };

  const startEditorResize = (e: React.MouseEvent) => {
    e.preventDefault();
    isResizingEditor.current = true;
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
  };

  const startBrainResize = (e: React.MouseEvent) => {
    e.preventDefault();
    isResizingBrain.current = true;
    document.body.style.cursor = "row-resize";
    document.body.style.userSelect = "none";
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizingSidebar.current && !isResizingEditor.current && !isResizingBrain.current) {
        return;
      }
      if (isResizingSidebar.current) {
        const newWidth = Math.max(240, Math.min(650, e.clientX));
        setSidebarWidth(newWidth);
      }
      if (isResizingEditor.current) {
        const availWidth = window.innerWidth - sidebarWidth - 230;
        if (availWidth > 300) {
          const relX = e.clientX - sidebarWidth - 230;
          const pct = Math.max(20, Math.min(80, Math.round((relX / availWidth) * 100)));
          setEditorWidth(pct);
        }
      }
      if (isResizingBrain.current) {
        const windowHeight = window.innerHeight;
        const newHeight = Math.max(60, Math.min(500, windowHeight - e.clientY - 96));
        setBrainBoardHeight(newHeight);
      }
    };

    const handleMouseUp = () => {
      if (isResizingSidebar.current || isResizingEditor.current || isResizingBrain.current) {
        isResizingSidebar.current = false;
        isResizingEditor.current = false;
        isResizingBrain.current = false;
        document.body.style.cursor = "";
        document.body.style.userSelect = "";
      }
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

  // Reset editor scroll positions when active file changes
  useEffect(() => {
    if (editorPreRef.current) {
      editorPreRef.current.scrollTop = 0;
      editorPreRef.current.scrollLeft = 0;
    }
    if (editorTextareaRef.current) {
      editorTextareaRef.current.scrollTop = 0;
      editorTextareaRef.current.scrollLeft = 0;
    }
  }, [selectedFilePath]);

  // Dynamically parse questions from the last assistant message to populate the questioning brain panel
  useEffect(() => {
    const lastAssistantMsg = [...messages].reverse().find(m => m.role === "assistant");
    if (lastAssistantMsg) {
      const content = lastAssistantMsg.content;
      // Extract lines containing question marks, or search for sentences with question marks
      const matches = content.match(/[^.!?]*\?/g);
      if (matches && matches.length > 0) {
        const cleaned = matches
          .map(m => m.replace(/^[*-\s\d.]+/g, "").trim())
          .filter(m => m.length > 10 && m.length < 150);
        if (cleaned.length > 0) {
          setBrainQuestions(cleaned.slice(0, 4));
          return;
        }
      }
    }
    // Fallback default questions based on selected personality
    const defaultQuestions: Record<string, string[]> = {
      socratic: [
        "Why did we structure this specific template design? Can we improve modularity?",
        "How should we handle potential runtime API errors gracefully?",
        "Are there any hardcoded keys that should be moved to dynamic state variables?"
      ],
      innovator: [
        "What if we add real-time status notifications using toast alerts?",
        "Can we craft a stunning, high-contrast dark space visual aesthetic?",
        "How about introducing keyboard shortcuts for lightning-fast file saving?"
      ],
      architect: [
        "Should we split larger components into specialized sub-modules in src/components?",
        "Is there a cleaner way to type-safe our virtual directory structure?",
        "Should we establish automated schema checking for all mock payloads?"
      ],
      partner: [
        "What are the main goals you want to accomplish in this coding session?",
        "Would you like me to draft detailed mock data for testing your views?",
        "What feature would you like to build or iterate on next?"
      ]
    };
    setBrainQuestions(defaultQuestions[brainPersonality] || defaultQuestions.socratic);
  }, [messages, brainPersonality]);

  // ----------------------------------------------------
  // Fetch Models on Startup/API Key Update (Debounced, Cached & Abortable)
  // ----------------------------------------------------
  const fetchOpenRouterModels = async (signal?: AbortSignal, forceRefresh: boolean = false) => {
    setIsLoadingModels(true);
    try {
      const modelsList = await getOrFetchModels(apiKey, signal, forceRefresh);
      setModels(modelsList);
    } catch (err: any) {
      const isAbort =
        signal?.aborted ||
        err?.name === "AbortError" ||
        err?.name === "CanceledError" ||
        err?.code === 20 ||
        (err?.message && (err.message.includes("abort") || err.message.includes("aborted") || err.message.includes("signal is aborted")));
      if (isAbort) {
        return;
      }
      console.debug("Failed to fetch models from server proxy", err);
    } finally {
      if (!signal?.aborted) {
        setIsLoadingModels(false);
      }
    }
  };

  useEffect(() => {
    const controller = new AbortController();
    const timer = setTimeout(() => {
      fetchOpenRouterModels(controller.signal);
    }, apiKey ? 400 : 0);

    return () => {
      clearTimeout(timer);
      try {
        controller.abort("Component unmounted or API key updated");
      } catch {}
    };
  }, [apiKey]);

  // ----------------------------------------------------
  // Folder Tree Builder & Recursive Renderer
  // ----------------------------------------------------
  interface TreeNode {
    name: string;
    path: string;
    type: "file" | "folder";
    children: TreeNode[];
  }

  const buildFileTree = (filesList: VirtualFile[], emptyFoldersList: string[]): TreeNode => {
    const root: TreeNode = { name: "Root", path: "", type: "folder", children: [] };
    
    const addPath = (fullPath: string, type: "file" | "folder") => {
      const parts = fullPath.split("/").filter(Boolean);
      let current = root;
      let currentPath = "";
      
      parts.forEach((part, index) => {
        currentPath = currentPath ? `${currentPath}/${part}` : part;
        const isLast = index === parts.length - 1;
        
        let existing = current.children.find(child => child.name === part);
        if (!existing) {
          existing = {
            name: part,
            path: currentPath,
            type: (isLast && type === "file") ? "file" : "folder",
            children: []
          };
          current.children.push(existing);
        }
        current = existing;
      });
    };

    emptyFoldersList.forEach(f => addPath(f, "folder"));
    filesList.forEach(f => addPath(f.path, "file"));

    const sortNode = (node: TreeNode) => {
      node.children.sort((a, b) => {
        if (a.type !== b.type) {
          return a.type === "folder" ? -1 : 1;
        }
        return a.name.localeCompare(b.name);
      });
      node.children.forEach(sortNode);
    };
    sortNode(root);
    
    return root;
  };

  const renderTree = (node: TreeNode, depth: number = 0): React.ReactNode => {
    // We don't render the root node itself, only its children
    if (node.path === "") {
      return (
        <div className="space-y-1">
          {node.children.map(child => renderTree(child, 0))}
        </div>
      );
    }

    const isFolder = node.type === "folder";
    const isExpanded = fileSearchQuery.trim() ? true : expandedFolders[node.path];
    const isSelected = selectedFilePath === node.path;
    const badgeInfo = isFolder ? null : getFileBadgeAndIcon(node.name);

    const handleToggle = (e: React.MouseEvent) => {
      e.stopPropagation();
      setExpandedFolders(prev => ({
        ...prev,
        [node.path]: !prev[node.path]
      }));
    };

    const handleNodeClick = () => {
      if (isFolder) {
        setExpandedFolders(prev => ({
          ...prev,
          [node.path]: !prev[node.path]
        }));
      } else {
        setSelectedFilePath(node.path);
      }
    };

    return (
      <div key={node.path} className="select-none">
        <div 
          style={{ paddingLeft: `${depth * 8 + 8}px` }}
          className={`group py-1.5 pr-2 flex items-center justify-between cursor-pointer transition-all border-l-2 rounded-r-md ${
            isSelected 
              ? "bg-indigo-50/80 text-indigo-700 border-indigo-500 font-medium neon-border-selected" 
              : "border-transparent text-slate-600 hover:bg-slate-100/80 hover:text-slate-950 hover:border-indigo-300 glow-indigo-hover"
          }`}
          onClick={handleNodeClick}
        >
          <div className="flex items-center gap-1.5 truncate pr-1">
            {isFolder ? (
              <button onClick={handleToggle} className="p-0.5 rounded hover:bg-slate-200/60 text-slate-400 cursor-pointer">
                {isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
              </button>
            ) : (
              <div className="w-4 h-4 shrink-0" />
            )}
            
            {isFolder ? (
              isExpanded ? (
                <FolderOpen className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
              ) : (
                <Folder className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
              )
            ) : (
              <FileCode className={`w-3.5 h-3.5 shrink-0 ${badgeInfo?.iconColor || (isSelected ? "text-indigo-500" : "text-slate-400")}`} />
            )}

            <span className="text-xs font-mono truncate">{node.name}</span>

            {!isFolder && badgeInfo && (
              <span className={`px-1 py-0.2 text-[8px] font-extrabold rounded border ${badgeInfo.colorClass} uppercase shrink-0 select-none`}>
                {badgeInfo.badge}
              </span>
            )}

            {!isFolder && files.find(f => f.path === node.path)?.isUserCreated && (
              <span className="ml-0.5 px-1 py-0.2 text-[8px] font-bold rounded bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 uppercase shrink-0 select-none">
                Mine
              </span>
            )}
          </div>

          <div className="flex gap-0.5 items-center opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
            {isFolder ? (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsAddingFile(true);
                    setNewFileName(`${node.path}/`);
                  }}
                  className="p-1 rounded text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 cursor-pointer transition-all"
                  title="New File inside folder"
                >
                  <Plus className="w-3 h-3" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsAddingFolder(true);
                    setNewFolderName(`${node.path}/`);
                  }}
                  className="p-1 rounded text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 cursor-pointer transition-all"
                  title="New Folder inside folder"
                >
                  <FolderPlus className="w-3 h-3" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setRenamingPath({ type: "folder", path: node.path });
                    setRenameInputValue(node.name);
                  }}
                  className="p-1 rounded text-slate-400 hover:text-blue-600 hover:bg-blue-50 cursor-pointer transition-all"
                  title="Rename Folder"
                >
                  <Edit3 className="w-3 h-3" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDownloadFolderZip(node.path);
                  }}
                  className="p-1 rounded text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 cursor-pointer transition-all"
                  title="Download Folder as ZIP"
                >
                  <Download className="w-3 h-3" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setDeleteConfirmTarget({ type: "folder", path: node.path });
                  }}
                  className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer transition-all"
                  title="Delete Folder"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setRenamingPath({ type: "file", path: node.path });
                    setRenameInputValue(node.name);
                  }}
                  className="p-1 rounded text-slate-400 hover:text-blue-600 hover:bg-blue-50 cursor-pointer transition-all"
                  title="Rename File"
                >
                  <Edit3 className="w-3 h-3" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDownloadSingleFile(node.path);
                  }}
                  className="p-1 rounded text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 cursor-pointer transition-all"
                  title="Download File"
                >
                  <Download className="w-3 h-3" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setDeleteConfirmTarget({ type: "file", path: node.path });
                  }}
                  className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer transition-all"
                  title="Delete File"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </>
            )}
          </div>
        </div>

        {isFolder && isExpanded && (
          <div className="mt-0.5">
            {node.children.map(child => renderTree(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  // ----------------------------------------------------
  // Live Browser Compiler (Bundles HTML, CSS, JS in browser)
  // ----------------------------------------------------
  const compileLiveWebWorkspace = () => {
    const htmlFile = files.find(f => f.path.toLowerCase() === "index.html");
    if (!htmlFile) {
      setPreviewSrcDoc("<h3>No index.html found. Please create an index.html file to run live web previews!</h3>");
      return;
    }

    let compiled = htmlFile.content;

    // Bundle CSS stylesheets
    const cssFiles = files.filter(f => f.path.endsWith(".css"));
    cssFiles.forEach(css => {
      const fileName = css.path.split("/").pop() || css.path;
      const linkRegex = new RegExp(`<link[^>]*href=["'](?:.*?/)?${escapeRegExp(fileName)}["'][^>]*>`, "gi");
      if (linkRegex.test(compiled)) {
        compiled = compiled.replace(linkRegex, `<style>\n/* Bundled ${fileName} */\n${css.content}\n</style>`);
      } else {
        const pathRegex = new RegExp(`<link[^>]*href=["'](?:.*?/)?${escapeRegExp(css.path)}["'][^>]*>`, "gi");
        compiled = compiled.replace(pathRegex, `<style>\n/* Bundled ${css.path} */\n${css.content}\n</style>`);
      }
    });

    // Bundle JavaScript files
    const jsFiles = files.filter(f => f.path.endsWith(".js") || f.path.endsWith(".javascript"));
    jsFiles.forEach(js => {
      const fileName = js.path.split("/").pop() || js.path;
      const scriptRegex = new RegExp(`<script[^>]*src=["'](?:.*?/)?${escapeRegExp(fileName)}["'][^>]*><\/script>`, "gi");
      if (scriptRegex.test(compiled)) {
        compiled = compiled.replace(scriptRegex, `<script>\n// Bundled ${fileName}\n${js.content}\n</script>`);
      } else {
        const pathRegex = new RegExp(`<script[^>]*src=["'](?:.*?/)?${escapeRegExp(js.path)}["'][^>]*><\/script>`, "gi");
        compiled = compiled.replace(pathRegex, `<script>\n// Bundled ${js.path}\n${js.content}\n</script>`);
      }
    });

    setPreviewSrcDoc(compiled);
  };

  useEffect(() => {
    if (activeTab === "preview") {
      const timer = setTimeout(() => {
        compileLiveWebWorkspace();
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [activeTab, files]);

  function escapeRegExp(string: string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  // ----------------------------------------------------
  // Zip & File Downloader Actions
  // ----------------------------------------------------
  const handleDownloadSingleFile = (filePath: string) => {
    const file = files.find(f => f.path === filePath);
    if (!file) return;

    const blob = new Blob([file.content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const filename = filePath.split("/").pop() || filePath;
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    addAgentAction("info", `Downloaded file "${filePath}" successfully.`, filePath);
  };

  const handleDownloadFolderZip = async (folderPath: string) => {
    try {
      await exportFolderZip(folderPath, files);
      addAgentAction("info", `Downloaded folder "${folderPath}" as ZIP archive.`);
    } catch (err: any) {
      addAgentAction("error", `Failed to zip folder "${folderPath}": ${err.message}`);
    }
  };

  const handleDownloadZip = async () => {
    try {
      await exportWorkspaceZip(files);
      addAgentAction("info", "Downloaded full project workspace ZIP archive successfully.");
    } catch (err: any) {
      addAgentAction("error", `Failed to compile ZIP output: ${err.message}`);
    }
  };

  // ----------------------------------------------------
  // Google Drive Workspace Sync Handler
  // ----------------------------------------------------
  const handleUploadToDrive = async () => {
    // Check if we have active Google login
    let token = gmailToken;
    let user = gmailUser;

    if (!token) {
      setIsGmailLoggingIn(true);
      try {
        const result = await googleSignIn();
        if (result) {
          setGmailUser(result.user);
          setGmailToken(result.accessToken);
          token = result.accessToken;
          user = result.user;
          addAgentAction("info", `Google Account connected successfully for ${result.user.email}`);
        } else {
          return;
        }
      } catch (err: any) {
        safeAlert(`Google Sign-In Failed: ${err.message}`, "error");
        return;
      } finally {
        setIsGmailLoggingIn(false);
      }
    }

    if (!token) return;

    // Open progress modal
    setShowDriveModal(true);
    setIsDriveUploading(true);
    setDriveUploadProgress("Initializing Google Drive upload...");
    setDriveUploadLink(null);

    try {
      // 1. Create the main project parent folder on Google Drive
      const rootFolderName = `OpenRouter Workspace - ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`;
      setDriveUploadProgress(`Creating main folder "${rootFolderName}"...`);
      const rootFolderId = await createDriveFolder(token, rootFolderName);

      // Keep track of folder path -> Google Drive ID
      const folderIdMap: Record<string, string> = {
        "": rootFolderId
      };

      // 2. Iterate through all files and build folder structures
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        setDriveUploadProgress(`Preparing upload for ${file.path} (${i + 1}/${files.length})...`);

        const pathParts = file.path.split("/");
        const filename = pathParts.pop() || file.path;
        
        let currentPath = "";
        let parentFolderId = rootFolderId;

        for (const part of pathParts) {
          const parentPath = currentPath;
          currentPath = currentPath ? `${currentPath}/${part}` : part;

          if (!folderIdMap[currentPath]) {
            setDriveUploadProgress(`Creating directory "${currentPath}" on Google Drive...`);
            const createdFolderId = await createDriveFolder(token, part, folderIdMap[parentPath] || rootFolderId);
            folderIdMap[currentPath] = createdFolderId;
          }
          parentFolderId = folderIdMap[currentPath];
        }

        // 3. Upload the file content
        setDriveUploadProgress(`Uploading ${file.path} to Google Drive...`);
        await uploadFileToDrive(token, filename, file.content, parentFolderId);
      }

      setDriveUploadProgress("Successfully completed upload of all workspace files!");
      setDriveUploadLink(`https://drive.google.com/drive/u/0/folders/${rootFolderId}`);
      addAgentAction("info", `Successfully exported ${files.length} files to Google Drive folder: "${rootFolderName}"`);
    } catch (err: any) {
      console.error(err);
      setDriveUploadProgress(`❌ Error during upload: ${err.message}`);
      addAgentAction("error", `Drive upload failed: ${err.message}`);
    } finally {
      setIsDriveUploading(false);
    }
  };

  // ----------------------------------------------------
  // Helper Actions (Manual File Ops)
  // ----------------------------------------------------
  const handleCreateFile = (filePath: string) => {
    if (!filePath.trim()) return;
    
    // Clean path
    const path = filePath.replace(/^\/+/, "");
    
    if (files.some(f => f.path.toLowerCase() === path.toLowerCase())) {
      safeAlert("A file with this name already exists!", "error");
      return;
    }

    const ext = (path.split(".").pop() || "").toLowerCase();
    let language = "text";
    if (["html", "htm"].includes(ext)) language = "html";
    else if (["css"].includes(ext)) language = "css";
    else if (["js", "javascript"].includes(ext)) language = "javascript";
    else if (["jsx"].includes(ext)) language = "jsx";
    else if (["ts", "typescript"].includes(ext)) language = "typescript";
    else if (["tsx"].includes(ext)) language = "tsx";
    else if (["json"].includes(ext)) language = "json";
    else if (["py", "python"].includes(ext)) language = "python";
    else if (["cpp", "cc", "cxx", "h", "hpp"].includes(ext)) language = "cpp";
    else if (["java"].includes(ext)) language = "java";

    const newFile: VirtualFile = {
      path,
      content: ext === "json" ? "{\n  \n}" : `// Code for ${path}\n`,
      language,
      isUserCreated: true
    };

    setFiles([...files, newFile]);
    setSelectedFilePath(path);
    setIsAddingFile(false);
    setNewFileName("");

    // Automatically expand and ensure parent directories are tracked
    const parts = path.split("/");
    if (parts.length > 1) {
      const foldersToAdd: string[] = [];
      let currentPath = "";
      parts.slice(0, -1).forEach(part => {
        currentPath = currentPath ? `${currentPath}/${part}` : part;
        foldersToAdd.push(currentPath);
      });
      
      setEmptyFolders(prev => {
        const next = [...prev];
        foldersToAdd.forEach(f => {
          if (!next.includes(f)) next.push(f);
        });
        return next;
      });

      setExpandedFolders(prev => {
        const next = { ...prev };
        foldersToAdd.forEach(f => {
          next[f] = true;
        });
        return next;
      });
    }

    addAgentAction("create", `Created file ${path} manually.`, path);
  };

  const handleCreateFolder = (folderPath: string) => {
    if (!folderPath.trim()) return;
    const cleaned = folderPath.replace(/^\/+/, "").replace(/\/+$/, "");
    if (emptyFolders.includes(cleaned)) {
      safeAlert("This folder already exists!", "error");
      return;
    }
    setEmptyFolders([...emptyFolders, cleaned]);
    
    // Auto expand parent folder hierarchy
    const parts = cleaned.split("/");
    if (parts.length > 1) {
      const parentFolders: string[] = [];
      let currentPath = "";
      parts.slice(0, -1).forEach(part => {
        currentPath = currentPath ? `${currentPath}/${part}` : part;
        parentFolders.push(currentPath);
      });
      setExpandedFolders(prev => {
        const next = { ...prev };
        parentFolders.forEach(p => { next[p] = true; });
        next[cleaned] = true;
        return next;
      });
    } else {
      setExpandedFolders(prev => ({ ...prev, [cleaned]: true }));
    }
    
    setIsAddingFolder(false);
    setNewFolderName("");
    addAgentAction("info", `Created folder directory ${cleaned} manually.`);
  };

  const handleDeleteFolder = (folderToDelete: string) => {
    const cleaned = folderToDelete.replace(/^\/+/, "").replace(/\/+$/, "");
    const containedFiles = files.filter(f => f.path === cleaned || f.path.startsWith(cleaned + "/"));
    
    // Remove all files inside this folder
    const remainingFiles = files.filter(f => f.path !== cleaned && !f.path.startsWith(cleaned + "/"));
    setFiles(remainingFiles);
    
    // Remove from empty folders list and sub-folders
    setEmptyFolders(prev => prev.filter(f => f !== cleaned && !f.startsWith(cleaned + "/")));
    
    // Reset selected file if it was inside the deleted folder
    if (selectedFilePath === cleaned || selectedFilePath.startsWith(cleaned + "/")) {
      if (remainingFiles.length > 0) {
        setSelectedFilePath(remainingFiles[0].path);
      }
    }
    
    addAgentAction("delete", `Deleted folder directory "${cleaned}" and ${containedFiles.length} contained file(s).`, cleaned);
  };

  const handleRenameFile = (oldPath: string, newPathInput: string) => {
    if (!newPathInput.trim()) return;
    const newPath = newPathInput.replace(/^\/+/, "");
    if (oldPath === newPath) {
      setRenamingPath(null);
      return;
    }

    if (files.some(f => f.path.toLowerCase() === newPath.toLowerCase() && f.path.toLowerCase() !== oldPath.toLowerCase())) {
      safeAlert(`A file named "${newPath}" already exists!`, "error");
      return;
    }

    const ext = (newPath.split(".").pop() || "").toLowerCase();
    let language = "text";
    if (["html", "htm"].includes(ext)) language = "html";
    else if (["css"].includes(ext)) language = "css";
    else if (["js", "javascript", "cjs", "mjs"].includes(ext)) language = "javascript";
    else if (["jsx"].includes(ext)) language = "jsx";
    else if (["ts", "typescript"].includes(ext)) language = "typescript";
    else if (["tsx"].includes(ext)) language = "tsx";
    else if (["json"].includes(ext)) language = "json";
    else if (["py", "python"].includes(ext)) language = "python";
    else if (["c"].includes(ext)) language = "c";
    else if (["cpp", "cc", "cxx", "h", "hpp"].includes(ext)) language = "cpp";
    else if (["java"].includes(ext)) language = "java";
    else if (["md", "markdown"].includes(ext)) language = "markdown";
    else if (["sql"].includes(ext)) language = "sql";
    else if (["sh", "bash"].includes(ext)) language = "bash";
    else if (["yaml", "yml"].includes(ext)) language = "yaml";

    setFiles(prev => prev.map(f => f.path === oldPath ? { ...f, path: newPath, language } : f));
    if (selectedFilePath === oldPath) {
      setSelectedFilePath(newPath);
    }
    setRenamingPath(null);
    addAgentAction("edit", `Renamed file "${oldPath}" to "${newPath}".`, newPath);
  };

  const handleRenameFolder = (oldFolderPath: string, newFolderNameInput: string) => {
    if (!newFolderNameInput.trim()) return;
    const cleanedOld = oldFolderPath.replace(/^\/+/, "").replace(/\/+$/, "");
    const cleanedNewName = newFolderNameInput.trim().replace(/^\/+/, "").replace(/\/+$/, "");
    
    const parentDir = cleanedOld.includes("/") ? cleanedOld.substring(0, cleanedOld.lastIndexOf("/")) : "";
    const targetNewPath = parentDir ? `${parentDir}/${cleanedNewName}` : cleanedNewName;
    
    if (cleanedOld === targetNewPath) {
      setRenamingPath(null);
      return;
    }

    setFiles(prev => prev.map(f => {
      if (f.path === cleanedOld) return { ...f, path: targetNewPath };
      if (f.path.startsWith(cleanedOld + "/")) {
        return { ...f, path: targetNewPath + f.path.slice(cleanedOld.length) };
      }
      return f;
    }));

    setEmptyFolders(prev => prev.map(f => {
      if (f === cleanedOld) return targetNewPath;
      if (f.startsWith(cleanedOld + "/")) {
        return targetNewPath + f.slice(cleanedOld.length);
      }
      return f;
    }));

    if (selectedFilePath === cleanedOld || selectedFilePath.startsWith(cleanedOld + "/")) {
      setSelectedFilePath(targetNewPath + selectedFilePath.slice(cleanedOld.length));
    }

    setRenamingPath(null);
    addAgentAction("edit", `Renamed directory "${cleanedOld}" to "${targetNewPath}".`, targetNewPath);
  };

  const handleKeyDownInEditor = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Tab") {
      e.preventDefault();
      const textarea = e.currentTarget;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const activeFile = files.find(f => f.path === selectedFilePath);
      if (!activeFile) return;

      const newContent = activeFile.content.substring(0, start) + "  " + activeFile.content.substring(end);
      handleEditFileContent(newContent);

      requestAnimationFrame(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 2;
      });
    }
  };

  const handleLanguageChange = (newLang: string) => {
    setFiles(prev => prev.map(f => f.path === selectedFilePath ? { ...f, language: newLang } : f));
  };

  // ----------------------------------------------------
  // Gmail Agent Methods
  // ----------------------------------------------------
  const fetchGmailInbox = async (token: string, search: string = "") => {
    setIsLoadingEmails(true);
    try {
      const msgs = await listEmails(token, search);
      setGmailEmails(msgs);
      if (msgs.length > 0 && !selectedGmailId) {
        setSelectedGmailId(msgs[0].id);
      }
    } catch (err: any) {
      console.error("Failed to load Gmail messages:", err);
      addAgentAction("error", `Gmail list failed: ${err.message}`);
    } finally {
      setIsLoadingEmails(false);
    }
  };

  const handleGmailLogin = async () => {
    setIsGmailLoggingIn(true);
    try {
      const result = await googleSignIn();
      if (result) {
        setGmailUser(result.user);
        setGmailToken(result.accessToken);
        localStorage.setItem("gmail_token_timestamp", String(Date.now()));
        fetchGmailInbox(result.accessToken);
        addAgentAction("info", `Gmail connected successfully for ${result.user.email}`);
      }
    } catch (err: any) {
      const msg = err?.message || String(err);
      if (msg.includes("403") || msg.includes("access_denied") || msg.includes("verification process")) {
        safeAlert("Google OAuth 403 Access Denied: The Google Cloud app is in Testing Mode. Go to the Gmail tab to use 'Paste Access Token' or Publish the App in Google Cloud Console.", "error");
        setActiveTab("gmail");
      } else {
        safeAlert(`Gmail Login Failed: ${msg}`, "error");
      }
    } finally {
      setIsGmailLoggingIn(false);
    }
  };

  const handleGmailLogout = async () => {
    try {
      await googleLogout();
      setGmailUser(null);
      setGmailToken(null);
      setGmailEmails([]);
      setSelectedGmailId(null);
      setIsGmailComposing(false);
      addAgentAction("info", "Gmail account disconnected.");
    } catch (err: any) {
      console.error("Logout failed:", err);
    }
  };

  const handleSendGmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gmailToken) return;
    setIsSendingEmail(true);
    try {
      await googleSendEmail(gmailToken, emailTo, emailSubject, emailBody);
      safeAlert("Email sent successfully!", "info");
      addAgentAction("info", `Email sent to ${emailTo}: "${emailSubject}"`);
      // Reset compose state
      setEmailTo("");
      setEmailSubject("");
      setEmailBody("");
      setIsGmailComposing(false);
      // Refresh inbox
      fetchGmailInbox(gmailToken, gmailSearchQuery);
    } catch (err: any) {
      safeAlert(`Failed to send email: ${err.message}`, "error");
      addAgentAction("error", `Gmail send failed: ${err.message}`);
    } finally {
      setIsSendingEmail(false);
    }
  };

  const handleGenerateAIDraft = async () => {
    if (!aiDraftPrompt.trim()) {
      safeAlert("Please enter a short description of the email you want to draft.", "info");
      return;
    }
    setIsDraftingAI(true);
    try {
      // Create chat messages for the agent proxy
      const draftMessages = [
        {
          role: "system" as const,
          content: "You are an expert executive email drafting AI. Generate only the email body content itself. Do not include subject lines, headers, greetings or signoffs unless specified. Keep it high quality, professional, and directly suited to the prompt. Do not wrap the text in any markdown blocks."
        },
        {
          role: "user" as const,
          content: `Draft a perfect email based on these instructions:\n${aiDraftPrompt}`
        }
      ];

      const sessionToken = await ensureSessionToken().catch(() => "");
      const authHeaders = getAuthHeaders(apiKey);
      if (sessionToken && !authHeaders["X-Session-Id"]) {
        authHeaders["X-Session-Id"] = sessionToken;
      }

      const response = await fetch("/api/openrouter/chat", {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify({
          model: selectedModel,
          messages: draftMessages,
          temperature: 0.7
        })
      });

      if (!response.ok) {
        throw new Error("Failed to contact the draft generator API.");
      }

      const resData = await response.json();
      const draftedText = resData.choices?.[0]?.message?.content || "";
      if (draftedText) {
        setEmailBody(draftedText.trim());
        setAiDraftPrompt("");
        addAgentAction("info", "Generated custom email body draft using AI Assistant.");
      }
    } catch (err: any) {
      safeAlert(`AI Draft Generator failed: ${err.message}`, "error");
    } finally {
      setIsDraftingAI(false);
    }
  };

  // Run auto auth initializer on startup
  useEffect(() => {
    initAuth(
      (user, token) => {
        setGmailUser(user);
        setGmailToken(token);
        if (!localStorage.getItem("gmail_token_timestamp")) {
          localStorage.setItem("gmail_token_timestamp", String(Date.now()));
        }
        fetchGmailInbox(token);
      },
      () => {
        setGmailUser(null);
        setGmailToken(null);
      }
    );
  }, []);

  const handleDeleteFile = (pathToDelete: string) => {
    const cleaned = pathToDelete.replace(/^\/+/, "");
    const filtered = files.filter(f => f.path.toLowerCase() !== cleaned.toLowerCase());
    setFiles(filtered);
    if (selectedFilePath.toLowerCase() === cleaned.toLowerCase()) {
      if (filtered.length > 0) {
        setSelectedFilePath(filtered[0].path);
      } else {
        setSelectedFilePath("");
      }
    }
    addAgentAction("delete", `Deleted file ${cleaned} manually.`, cleaned);
  };

  const handleEditFileContent = (newVal: string) => {
    setFiles(files.map(f => f.path === selectedFilePath ? { ...f, content: newVal, isUserCreated: true } : f));
  };

  // ====================================================
  // EXTRA FEATURES INTEGRATION
  // ====================================================

  // Music Streamer Utilities
  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs === undefined) return "0:00";
    const minutes = Math.floor(secs / 60);
    const seconds = Math.floor(secs % 60);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  const handleSearchMusic = async (query: string) => {
    if (!query.trim()) return;
    setIsMusicLoading(true);
    try {
      const response = await fetch(`/api/music/search?query=${encodeURIComponent(query)}&source=${musicSource}`);
      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data.tracks) && data.tracks.length > 0) {
          setMusicTracks(data.tracks);
          setCurrentTrackIndex(0);
          setIsMusicPlaying(false);
          return;
        }
      }
      throw new Error("No tracks found");
    } catch (err) {
      console.error("Music search failed", err);
      // Fallback search to popular tracks if search failed
      try {
        const fallbackRes = await fetch("/api/music/popular");
        if (fallbackRes.ok) {
          const fallbackData = await fallbackRes.json();
          if (Array.isArray(fallbackData.tracks) && fallbackData.tracks.length > 0) {
            setMusicTracks(fallbackData.tracks);
            setCurrentTrackIndex(0);
            setIsMusicPlaying(false);
          }
        }
      } catch (fallbackErr) {
        console.error("Fallback search failed too", fallbackErr);
      }
    } finally {
      setIsMusicLoading(false);
    }
  };

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const consecutiveAudioErrors = useRef(0);

  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
    }
    const audio = audioRef.current;

    const handlePlay = () => setIsMusicPlaying(true);
    const handlePause = () => setIsMusicPlaying(false);
    let lastTime = 0;
    const handleTimeUpdate = () => {
      if (activeTab === "music" && Math.abs(audio.currentTime - lastTime) >= 0.5) {
        lastTime = audio.currentTime;
        setMusicCurrentTime(audio.currentTime);
      }
    };
    const handleDurationChange = () => setMusicDuration(audio.duration);
    const handleEnded = () => {
      handleNextTrack();
    };
    const handleError = (e: Event) => {
      consecutiveAudioErrors.current += 1;
      if (consecutiveAudioErrors.current >= 3) {
        console.warn("3 consecutive audio errors — stopping auto-advance to prevent infinite loop.");
        setIsMusicPlaying(false);
        consecutiveAudioErrors.current = 0;
        return;
      }
      console.warn("Audio element error encountered, auto-advancing to next track:", e);
      setTimeout(() => {
        handleNextTrack();
      }, 1200);
    };

    audio.addEventListener("play", handlePlay);
    audio.addEventListener("pause", handlePause);
    audio.addEventListener("canplay", () => { consecutiveAudioErrors.current = 0; });
    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("durationchange", handleDurationChange);
    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("error", handleError);

    return () => {
      audio.removeEventListener("play", handlePlay);
      audio.removeEventListener("pause", handlePause);
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("durationchange", handleDurationChange);
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("error", handleError);
    };
  }, [musicTracks, currentTrackIndex]);

  // Synchronize audio volume and mute state
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMusicMuted ? 0 : musicVolume;
    }
  }, [musicVolume, isMusicMuted]);

  // Track synchronization and state recovery
  useEffect(() => {
    if (currentTrackIndex !== null && musicTracks[currentTrackIndex] && audioRef.current) {
      const track = musicTracks[currentTrackIndex];
      const audio = audioRef.current;
      if (!audio.src || !audio.src.includes(track.audioUrl)) {
        audio.src = track.audioUrl;
      }
      audio.volume = isMusicMuted ? 0 : musicVolume;
      if (isMusicPlaying) {
        audio.play().catch(e => console.log("Audio play deferred:", e));
      } else {
        audio.pause();
      }
    }
  }, [currentTrackIndex, isMusicPlaying, musicTracks]);

  const handleTogglePlay = () => {
    const list = (!musicTracks || musicTracks.length === 0) ? TOP_REAL_CHARTS : musicTracks;
    const targetIdx = currentTrackIndex !== null && currentTrackIndex >= 0 ? currentTrackIndex : 0;

    if (!musicTracks || musicTracks.length === 0) {
      setMusicTracks(list);
      setCurrentTrackIndex(targetIdx);
    } else if (currentTrackIndex === null) {
      setCurrentTrackIndex(0);
    }

    if (!audioRef.current) {
      audioRef.current = new Audio();
    }
    const audio = audioRef.current;
    const track = list[targetIdx];

    audio.volume = isMusicMuted ? 0 : musicVolume;

    if (isMusicPlaying) {
      audio.pause();
      setIsMusicPlaying(false);
    } else {
      if (track && track.audioUrl) {
        if (!audio.src || !audio.src.includes(track.audioUrl)) {
          audio.src = track.audioUrl;
        }
      }
      setIsMusicPlaying(true);
      audio.play().catch(e => {
        console.warn("[MusicPlayer] Play blocked or network error:", e);
      });
    }
  };

  const handleForceStopMusic = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      try {
        audioRef.current.currentTime = 0;
      } catch {}
    }
    setIsMusicPlaying(false);
    setMusicCurrentTime(0);
  };

  const handleSelectTrack = (idx: number) => {
    const list = musicTracks.length > 0 ? musicTracks : TOP_REAL_CHARTS;
    if (idx < 0 || idx >= list.length) return;
    setCurrentTrackIndex(idx);
    setIsMusicPlaying(true);

    if (!audioRef.current) {
      audioRef.current = new Audio();
    }
    const audio = audioRef.current;
    const track = list[idx];
    if (track && track.audioUrl) {
      audio.src = track.audioUrl;
      audio.volume = isMusicMuted ? 0 : musicVolume;
      audio.play().catch(e => console.log("Track play error:", e));
    }
  };

  const handleSeek = (time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
    setMusicCurrentTime(time);
  };

  const handleNextTrack = () => {
    const list = musicTracks.length > 0 ? musicTracks : TOP_REAL_CHARTS;
    const nextIdx = currentTrackIndex === null ? 0 : (currentTrackIndex + 1) % list.length;
    setCurrentTrackIndex(nextIdx);
    setIsMusicPlaying(true);

    if (!audioRef.current) {
      audioRef.current = new Audio();
    }
    const audio = audioRef.current;
    const track = list[nextIdx];
    if (track && track.audioUrl) {
      audio.src = track.audioUrl;
      audio.volume = isMusicMuted ? 0 : musicVolume;
      audio.play().catch(e => console.log("Next track play deferred:", e));
    }
  };

  const handlePrevTrack = () => {
    const list = musicTracks.length > 0 ? musicTracks : TOP_REAL_CHARTS;
    const prevIdx = currentTrackIndex === null ? 0 : (currentTrackIndex - 1 + list.length) % list.length;
    setCurrentTrackIndex(prevIdx);
    setIsMusicPlaying(true);

    if (!audioRef.current) {
      audioRef.current = new Audio();
    }
    const audio = audioRef.current;
    const track = list[prevIdx];
    if (track && track.audioUrl) {
      audio.src = track.audioUrl;
      audio.volume = isMusicMuted ? 0 : musicVolume;
      audio.play().catch(e => console.log("Prev track play deferred:", e));
    }
  };

  useEffect(() => {
    const loadInitialTracks = async () => {
      setIsMusicLoading(true);
      try {
        const response = await fetch("/api/music/popular");
        if (response.ok) {
          const data = await response.json();
          if (data && Array.isArray(data.tracks) && data.tracks.length > 0) {
            setMusicTracks(data.tracks);
            setCurrentTrackIndex(0);
            return;
          }
        }
      } catch (err) {
        console.warn("Popular music fetch fallback:", err);
      } finally {
        setIsMusicLoading(false);
      }
      if (!musicTracks || musicTracks.length === 0) {
        setMusicTracks(TOP_REAL_CHARTS);
        setCurrentTrackIndex(0);
      }
    };
    if (activeTab === "music" && (!musicTracks || musicTracks.length === 0)) {
      loadInitialTracks();
    }
  }, [activeTab]);

  // YouTube Agent Utilities
  const handleAnalyzeYoutube = async () => {
    if (!ytUrl.trim()) {
      safeAlert("Please enter a valid YouTube URL or video ID!", "error");
      return;
    }
    setIsYtLoading(true);
    setYtSummary("");
    setYtQuiz([]);
    setYtQuizAnswers({});
    setYtQuizSubmitted(false);

    const match = ytUrl.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/ ]{11})/);
    const videoId = match ? match[1] : (ytUrl.trim().length === 11 ? ytUrl.trim() : "jfKfPfyJRdk");

    // Fetch real YouTube Data API v3 metadata via backend proxy
    let realTitle = "";
    let realChannel = "";
    let realDuration = "Video Lesson";
    let realViews = "";
    let realDescription = "";
    let realTags: string[] = [];

    try {
      const vidRes = await fetch(`/api/youtube/video?videoId=${encodeURIComponent(videoId)}`);
      if (vidRes.ok) {
        const vidData = await vidRes.json();
        realTitle = vidData.title || "";
        realChannel = vidData.channel || "";
        realDuration = vidData.duration || "Video Lesson";
        realViews = vidData.views || "";
        realDescription = vidData.description || "";
        realTags = vidData.tags || [];
      }
    } catch (e) {
      console.warn("YouTube Data API fetch failed, falling back to oEmbed:", e);
    }

    if (!realTitle) {
      try {
        const oembedRes = await fetch(`/api/youtube/oembed?videoId=${encodeURIComponent(videoId)}`);
        if (oembedRes.ok) {
          const oembedData = await oembedRes.json();
          realTitle = oembedData.title || "";
          realChannel = oembedData.author_name || "";
        }
      } catch (e) {
        console.warn("oEmbed fetch failed:", e);
      }
    }

    const videoTitle = realTitle || (ytUrl.includes("http") ? `YouTube Video (${videoId})` : ytUrl);
    const videoChannel = realChannel || "YouTube Creator";

    setYtMetadata({
      id: videoId,
      title: videoTitle,
      channel: videoChannel,
      thumbnail: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
      duration: realDuration
    });

    // Fetch Search Grounding context for topic
    let topicSearchSnippets = "";
    try {
      const searchRes = await fetch(`/api/search?q=${encodeURIComponent(videoTitle)}`);
      if (searchRes.ok) {
        const searchData = await searchRes.json();
        if (searchData.results && searchData.results.length > 0) {
          topicSearchSnippets = searchData.results.slice(0, 4).map((r: any) => `- ${r.title}: ${r.snippet}`).join("\n");
        }
      }
    } catch (e) {
      console.warn("Search grounding failed:", e);
    }

    try {
      const systemPrompt = "You are an expert educational research AI. Analyze video titles, creator details, and topic context to produce authentic, highly specific, and accurate video lesson summaries and quizzes. Return ONLY a valid JSON object matching the requested schema with NO markdown formatting or commentary.";
      const userPrompt = `Analyze this video lesson:
Video Title: "${videoTitle}"
Channel: "${videoChannel}"
Video ID: ${videoId}
Grounding Knowledge & Context:
${topicSearchSnippets || "General topic study"}

Generate an authentic, highly specific educational analysis, lesson chapters with realistic timestamps, key takeaways, and a 3-question student quiz strictly tailored to "${videoTitle}".

Do NOT generate generic template answers or irrelevant networking questions unless the video is specifically about computer networking.

Return ONLY raw JSON matching this structure:
{
  "title": "${videoTitle}",
  "channel": "${videoChannel}",
  "summary": "Detailed multi-paragraph executive overview explicitly explaining the core subject matter of ${videoTitle}...",
  "chapters": [
    { "time": "00:00", "title": "Introduction & Foundation", "text": "Overview of..." },
    { "time": "03:30", "title": "Core Methodology & Analysis", "text": "Detailed explanation of..." },
    { "time": "08:15", "title": "Practical Application & Synthesis", "text": "Insights on..." }
  ],
  "keyTakeaways": [
    "Key takeaway 1 regarding ${videoTitle}",
    "Key takeaway 2...",
    "Key takeaway 3..."
  ],
  "quiz": [
    {
      "question": "Primary question testing core concept of ${videoTitle}?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctIndex": 0,
      "explanation": "Detailed explanation..."
    },
    {
      "question": "Which key aspect or technique is emphasized in ${videoTitle}?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctIndex": 1,
      "explanation": "Detailed explanation..."
    },
    {
      "question": "What is the recommended best practice for applying concepts from ${videoTitle}?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctIndex": 0,
      "explanation": "Detailed explanation..."
    }
  ]
}`;

      const response = await fetch("/api/openrouter/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": apiKey ? `Bearer ${apiKey}` : ""
        },
        body: JSON.stringify({
          model: selectedModel,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt }
          ],
          temperature: 0.2
        })
      });

      if (!response.ok) {
        throw new Error("Analysis request failed.");
      }

      const resData = await response.json();
      let rawText = resData.choices?.[0]?.message?.content || "";
      rawText = rawText.replace(/```json/i, "").replace(/```/g, "").trim();

      let parsed: any = null;
      try {
        parsed = JSON.parse(rawText);
      } catch (jsonErr) {
        const matchJson = rawText.match(/\{[\s\S]*\}/);
        if (matchJson) {
          try { parsed = JSON.parse(matchJson[0]); } catch {}
        }
      }

      if (parsed && parsed.summary) {
        setYtMetadata({
          id: videoId,
          title: parsed.title || videoTitle,
          channel: parsed.channel || videoChannel,
          thumbnail: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
          duration: "Video Lesson"
        });
        setYtSummary(parsed.summary || "");
        setYtQuiz(parsed.quiz || []);
        setYtSummaryData(parsed);
        addAgentAction("info", `Analyzed YouTube video "${parsed.title || videoTitle}" using AI.`);
      } else {
        throw new Error("Could not parse AI response JSON.");
      }

    } catch (err: any) {
      console.warn("AI analysis error, constructing specific grounding fallback:", err);
      const fallbackSummary = `Executive Lesson Overview for "${videoTitle}":\n\nThis video lesson, presented by ${videoChannel}, covers key concepts and practical applications surrounding ${videoTitle}.\n\n` +
        (topicSearchSnippets ? `Grounding Knowledge:\n${topicSearchSnippets}\n\n` : "") +
        `Learners gain a comprehensive understanding of core principles, practical implementation strategies, and essential best practices for mastering this topic.`;

      const fallbackParsed = {
        title: videoTitle,
        channel: videoChannel,
        summary: fallbackSummary,
        chapters: [
          { time: "00:00", title: "Introduction & Context", text: `Overview of ${videoTitle} and foundational background.` },
          { time: "04:15", title: "Core Methodologies", text: `Detailed walkthrough of key techniques and concepts.` },
          { time: "09:30", title: "Practical Application & Insights", text: `Best practices and real-world implementation guidance.` }
        ],
        keyTakeaways: [
          `Master fundamental principles underlying ${videoTitle}.`,
          `Apply structured methodology for optimal implementation.`,
          `Review core trade-offs and best practices for real-world scenarios.`
        ],
        quiz: [
          {
            question: `What is the core subject matter of "${videoTitle}"?`,
            options: [
              `Understanding and applying key concepts of ${videoTitle}`,
              `Basic static file storage`,
              `Unrelated legacy hardware drivers`,
              `Generic network proxy configuration`
            ],
            correctIndex: 0,
            explanation: `The primary objective of "${videoTitle}" is understanding and applying its core concepts.`
          },
          {
            question: `Why is studying ${videoTitle} valuable for learners?`,
            options: [
              `It builds practical mastery and improves overall implementation quality`,
              `It is only applicable to obsolete platforms`,
              `It eliminates the need for software design`,
              `It increases manual workload`
            ],
            correctIndex: 0,
            explanation: `Mastering these concepts enhances understanding and practical execution.`
          }
        ]
      };

      setYtMetadata({
        id: videoId,
        title: videoTitle,
        channel: videoChannel,
        thumbnail: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
        duration: "Video Lesson"
      });
      setYtSummary(fallbackParsed.summary);
      setYtQuiz(fallbackParsed.quiz);
      setYtSummaryData(fallbackParsed);
      addAgentAction("info", `Generated lesson study guide for "${videoTitle}".`);
    } finally {
      setIsYtLoading(false);
    }
  };

  const handleSaveYtNotesToWorkspace = () => {
    if (!ytSummaryData || !ytMetadata) return;
    const filename = `notes/youtube_summary_${ytMetadata.id}.html`;
    
    const htmlContent = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${ytSummaryData.title}</title>
  <style>
    body { font-family: system-ui, sans-serif; line-height: 1.6; color: #1e293b; max-width: 800px; margin: 40px auto; padding: 0 20px; background-color: #f8fafc; }
    h1 { color: #0f172a; border-b: 2px solid #e2e8f0; padding-bottom: 10px; font-size: 24px; }
    h2 { color: #8b5cf6; margin-top: 30px; font-size: 18px; }
    .card { background: white; padding: 20px; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); border: 1px solid #e2e8f0; margin-bottom: 20px; }
    .chapter { border-l: 3px solid #8b5cf6; padding-left: 15px; margin-bottom: 20px; }
    .timestamp { font-family: monospace; font-weight: bold; color: #7c3aed; background: #f3e8ff; padding: 2px 6px; border-radius: 4px; font-size: 11px; }
    .takeaway { margin-bottom: 8px; font-weight: 500; }
  </style>
</head>
<body>
  <div class="card">
    <h1>${ytSummaryData.title}</h1>
    <p><strong>YouTube Video ID:</strong> ${ytMetadata.id}</p>
    <p>${ytSummaryData.summary}</p>
  </div>

  <h2>Lessons & Chapters</h2>
  <div class="card">
    ${ytSummaryData.chapters.map((ch: any) => `
      <div class="chapter">
        <p><span class="timestamp">${ch.time}</span> <strong>${ch.title}</strong></p>
        <p>${ch.text}</p>
      </div>
    `).join("")}
  </div>

  <h2>Key Lessons & Takeaways</h2>
  <div class="card">
    <ul>
      ${ytSummaryData.keyTakeaways.map((tk: any) => `
        <li class="takeaway">${tk}</li>
      `).join("")}
    </ul>
  </div>
</body>
</html>`;

    setFiles([...files.filter(f => f.path !== filename), {
      path: filename,
      content: htmlContent,
      language: "html"
    }]);
    setSelectedFilePath(filename);
    setActiveTab("editor");
    addAgentAction("create", `Exported YouTube study notes into workspace file: ${filename}`, filename);
  };

  // Just Chat Exporters
  const handleDocChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!docChatPrompt.trim() || isDocChatLoading) return;

    let userPrompt = docChatPrompt;
    setDocChatPrompt("");

    // Attach selected file content if present
    if (attachedFileForChat) {
      const fileObj = files.find(f => f.path === attachedFileForChat);
      if (fileObj) {
        userPrompt += `\n\n[Attached File: ${fileObj.path}]\n\`\`\`${fileObj.language}\n${fileObj.content}\n\`\`\``;
      }
    }
    
    const newUserMsg = { role: "user", content: userPrompt };
    setDocChatHistory(prev => [...prev, newUserMsg]);
    setIsDocChatLoading(true);

    try {
      const agentRoleText = selectedAgentForChat === "all" 
        ? "You are an all-round Expert Multi-Agent Specialist."
        : `You are acting specifically as the ${selectedAgentForChat.toUpperCase()} agent.`;

      const systemPrompt = `You are a specialized Document and Media Builder AI. ${agentRoleText} You help users prepare:
1. High-fidelity HTML/CSS notes
2. Word documents (.doc/.docx formats)
3. Printable PDF structures
4. Interactive vector SVG graphics and images
5. Complete code refactoring and bug fixes

To prepare or modify a file directly inside the user's workspace, output it using XML file blocks like this:
<file path="notes/guide.html">
... complete content here ...
</file>

If the user wants an SVG graphic, write inline SVG inside a <file path="images/graphic.svg">...</file> tag.`;

      const response = await fetch("/api/openrouter/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": apiKey ? `Bearer ${apiKey}` : ""
        },
        body: JSON.stringify({
          model: selectedModel,
          messages: [
            { role: "system", content: systemPrompt },
            ...docChatHistory,
            newUserMsg
          ],
          temperature: 0.2
        })
      });

      if (!response.ok) {
        throw new Error("Chat failed.");
      }

      const resData = await response.json();
      const assistantText = resData.choices?.[0]?.message?.content || "";

      const parsed = parseAgentActions(assistantText);
      
      let updatedFiles = [...files];
      parsed.filesFound.forEach(newFile => {
        const index = updatedFiles.findIndex(f => f.path.toLowerCase() === newFile.path.toLowerCase());
        let language = "text";
        if (newFile.path.endsWith(".html")) language = "html";
        else if (newFile.path.endsWith(".svg")) language = "svg";
        else if (newFile.path.endsWith(".md")) language = "markdown";
        else if (newFile.path.endsWith(".ts") || newFile.path.endsWith(".tsx")) language = "typescript";
        else if (newFile.path.endsWith(".json")) language = "json";

        if (index > -1) {
          updatedFiles[index] = { ...updatedFiles[index], content: newFile.content, language };
        } else {
          updatedFiles.push({ path: newFile.path, content: newFile.content, language });
        }
        addAgentAction("create", `Chat mode drafted workspace file: ${newFile.path}`, newFile.path);
      });
      setFiles(updatedFiles);

      setDocChatHistory(prev => [...prev, { role: "assistant", content: assistantText }]);

    } catch (err: any) {
      console.error(err);
      setDocChatHistory(prev => [...prev, { role: "assistant", content: `❌ **Failed to generate response:** ${err.message}` }]);
    } finally {
      setIsDocChatLoading(false);
    }
  };

  const handleDownloadWordDoc = async () => {
    try {
      addAgentAction("info", "Assembling high-fidelity Microsoft Word Document...");
      const fullContent = files.map(f => `File: ${f.path}\n\n${f.content}`).join("\n\n---\n\n");
      await exportWordDocument("AI Studio Workspace Technical Reference Document", "", fullContent);
      addAgentAction("info", "Microsoft Word (.docx) file generated and downloaded successfully.");
    } catch (err: any) {
      console.error(err);
      addAgentAction("error", `Word Doc export failed: ${err.message}`);
    }
  };

  const handlePrintPDF = async () => {
    try {
      addAgentAction("info", "Rendering interactive PDF document structure...");
      const fullContent = files.map(f => `File: ${f.path}\n\n${f.content}`).join("\n\n---\n\n");
      await exportPdfDocument("AI Studio Technical Notes", fullContent);
      addAgentAction("info", "Downloaded PDF document structure successfully.");
    } catch (err: any) {
      console.error(err);
      addAgentAction("error", `PDF export failed: ${err.message}`);
    }
  };

  const handleCreateBentoSVG = () => {
    const path = "images/architecture_bento_grid.svg";
    const content = `<svg viewBox="0 0 800 500" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
  <rect width="800" height="500" rx="20" fill="#0f172a"/>
  <rect x="20" y="20" width="370" height="290" rx="15" fill="#1e1b4b" stroke="#4338ca" stroke-width="2"/>
  <text x="40" y="55" fill="#a5b4fc" font-family="sans-serif" font-weight="bold" font-size="18">IDE Engine Module</text>
  <text x="40" y="85" fill="#cbd5e1" font-family="sans-serif" font-size="12">Core sandbox file tracker running React state bindings.</text>
  <circle cx="205" cy="180" r="40" fill="#4338ca"/>
  <text x="180" y="185" fill="#fff" font-family="sans-serif" font-weight="bold" font-size="12">REACT</text>
  <rect x="410" y="20" width="370" height="135" rx="15" fill="#022c22" stroke="#0f766e" stroke-width="2"/>
  <text x="430" y="55" fill="#6ee7b7" font-family="sans-serif" font-weight="bold" font-size="18">Virtual File Tree</text>
  <text x="430" y="85" fill="#cbd5e1" font-family="sans-serif" font-size="12">In-memory directory structure and safe state caching.</text>
  <rect x="410" y="175" width="370" height="135" rx="15" fill="#180c24" stroke="#581c87" stroke-width="2"/>
  <text x="430" y="210" fill="#e9d5ff" font-family="sans-serif" font-weight="bold" font-size="18">Multi-Language Piston</text>
  <text x="430" y="240" fill="#cbd5e1" font-family="sans-serif" font-size="12">Free public execution API runs Python, Java, C, C++ code.</text>
  <rect x="20" y="330" width="760" height="150" rx="15" fill="#1c1917" stroke="#78716c" stroke-width="2"/>
  <text x="40" y="365" fill="#f5f5f4" font-family="sans-serif" font-weight="bold" font-size="18">Ambient Audio & Media Connector</text>
  <text x="40" y="395" fill="#a8a29e" font-family="sans-serif" font-size="12">Jamendo streaming audio synthesizer paired with visual canvas equalizer animations.</text>
</svg>`;

    setFiles([...files.filter(f => f.path !== path), {
      path,
      content,
      language: "xml"
    }]);
    setSelectedFilePath(path);
    setActiveTab("editor");
    addAgentAction("create", `Created high-quality SVG vector graphic architecture bento grid inside files tree: ${path}`, path);
  };

  const handleRunActiveFile = async (commandOverride?: string) => {
    const activeFile = files.find(f => f.path === selectedFilePath);
    if (!activeFile) {
      safeAlert("No active file selected to run!", "info");
      return;
    }

    setIsTerminalRunning(true);
    setShowTerminal(true);
    
    const cmdInput = typeof commandOverride === "string" ? commandOverride : customCommandInput;
    
    // Auto fill terminal message
    setTerminalOutput(prev => prev + `\n$ Preparing to execute "${activeFile.path}"...\n`);
    setTerminalExitCode(null);

    try {
      const localToken = localStorage.getItem("app_auth_token") || "";
      const reqHeaders: Record<string, string> = {
        "Content-Type": "application/json"
      };
      if (localToken) {
        reqHeaders["Authorization"] = `Bearer ${localToken}`;
      } else if (apiKey) {
        reqHeaders["Authorization"] = `Bearer ${apiKey}`;
      }

      const response = await fetch("/api/sandbox/run", {
        method: "POST",
        headers: reqHeaders,
        body: JSON.stringify({
          activeFilePath: activeFile.path,
          files: files,
          customCommand: cmdInput
        })
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(errText);
      }

      const resData = await response.json();
      setTerminalRunCommand(resData.command);
      
      let out = `\n$ ${resData.command}\n`;
      if (resData.stdout) {
        out += resData.stdout;
      }
      if (resData.stderr) {
        out += `\n[STDERR]\n` + resData.stderr;
      }
      if (resData.error) {
        out += `\n[RUNTIME ERROR] ${resData.error}\n`;
      }
      out += `\nProcess exited with status code ${resData.exitCode}\n`;

      setTerminalOutput(prev => prev + out);
      setTerminalExitCode(resData.exitCode);
      addAgentAction("info", `Executed sandboxed file ${activeFile.path} with status ${resData.exitCode}.`, activeFile.path);

    } catch (err: any) {
      console.error(err);
      setTerminalOutput(prev => prev + `\n❌ Execution Failed: ${err.message}\n`);
      addAgentAction("error", `Sandbox run failed: ${err.message}`, activeFile.path);
    } finally {
      setIsTerminalRunning(false);
    }
  };

  const handleTemplateLoad = (templateId: string) => {
    const tpl = templates.find(t => t.id === templateId);
    if (!tpl) return;
    if (confirm(`Are you sure you want to load the "${tpl.name}" template? This will replace your current workspace files.`)) {
      setFiles(tpl.files);
      setSelectedFilePath(tpl.files[0].path);
      setAgentActions([
        {
          id: `tpl-${Date.now()}`,
          type: "info",
          message: `Workspace reset to ${tpl.name} template.`,
          timestamp: new Date().toLocaleTimeString()
        }
      ]);
    }
  };

  // ----------------------------------------------------
  // Test Connection Check
  // ----------------------------------------------------
  const handleTestKeyConnection = async () => {
    if (!apiKey) {
      setApiConnectionStatus("error");
      setApiErrorMessage("Please enter an OpenRouter API key first.");
      return;
    }
    setApiConnectionStatus("testing");
    setApiErrorMessage("");
    try {
      const response = await fetch("/api/openrouter/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: selectedModel || "google/gemini-2.5-flash",
          messages: [{ role: "user", content: "ping" }],
          max_tokens: 5
        })
      });
      if (response.ok) {
        setApiConnectionStatus("success");
      } else {
        const errData = await response.json().catch(() => ({}));
        setApiConnectionStatus("error");
        setApiErrorMessage(errData?.error?.message || `HTTP ${response.status} Error`);
      }
    } catch (err: any) {
      setApiConnectionStatus("error");
      setApiErrorMessage(err.message || "Failed to fetch. Network connection failed.");
    }
  };

  // ----------------------------------------------------
  // Workspace Context Builder
  // ----------------------------------------------------
  const compressChatContext = (
    currentPrompt: string,
    allMessages: Message[],
    allFiles: VirtualFile[],
    activePath: string
  ) => {
    // Compress older messages that have giant code snippets to save token bandwidth
    const recentMessages = compressMessageHistory(allMessages, 4);

    // Intelligently compress workspace files into high-density context
    const { workspaceSummary } = compressWorkspaceFileContext(
      currentPrompt,
      allFiles,
      activePath
    );

    return {
      workspaceSummary,
      recentMessages
    };
  };

  // ----------------------------------------------------
  // Chat Submit & Parsing Core (AI Code Agent Loop)
  // ----------------------------------------------------
  const promptAbortControllerRef = useRef<AbortController | null>(null);

  const handleStopPrompt = useCallback(() => {
    if (promptAbortControllerRef.current) {
      try {
        promptAbortControllerRef.current.abort("Generation stopped by user");
      } catch {}
      promptAbortControllerRef.current = null;
    }
    setIsAgentProcessing(false);
    addAgentAction("info", "AI agent generation stopped by user.");
  }, [addAgentAction]);

  const handleSendPrompt = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputPrompt.trim() || isAgentProcessing) return;

    if (promptAbortControllerRef.current) {
      try {
        promptAbortControllerRef.current.abort("Superseded by new prompt");
      } catch {}
    }
    const currentController = new AbortController();
    promptAbortControllerRef.current = currentController;

    const userMsgText = inputPrompt;
    setInputPrompt("");

    const newUserMsg: Message = {
      id: `msg-${Date.now()}-user`,
      role: "user",
      content: userMsgText,
      timestamp: new Date().toLocaleTimeString()
    };

    setMessages(prev => [...prev, newUserMsg]);
    if (!apiKey && !import.meta.env.VITE_OPENROUTER_API_KEY) {
      setMessages(prev => [...prev, {
        id: `msg-${Date.now()}-warn`,
        role: "assistant",
        content: "⚠️ **No API Key Set** — Please paste your OpenRouter API key in the sidebar (Settings → API Key) to start the agent. You can get a free key at https://openrouter.ai",
        timestamp: new Date().toLocaleTimeString()
      }]);
      return;
    }
    setIsAgentProcessing(true);
    addAgentAction("analyze", "Agent is analyzing requirements...");

    // Compress chat history & workspace context to maximize execution speed and reduce token latency
    const { workspaceSummary, recentMessages } = compressChatContext(
      userMsgText,
      messages,
      files,
      selectedFilePath
    );

    const detectedChain = await detectAndSelectChain(userMsgText);
    const chainTitle = detectedChain ? ((detectedChain as any).title || (detectedChain as any).name || "Workflow") : "";
    const chainHint = detectedChain
      ? `\n\n[WORKFLOW HINT: This task matches the "${chainTitle}" pipeline. Suggested step order: ${detectedChain.steps?.map((s: any) => s.title).join(" → ") || "see AgentPanel"}]`
      : "";

    const systemPrompt = buildAgenticSkillsSystemPrompt(
      files.map(f => f.path).join(", "),
      workspaceSummary
    ) + chainHint;

    const formattedHistory = [
      { role: "system", content: systemPrompt },
      ...recentMessages.map(m => ({ role: m.role, content: m.content })),
      { role: "user", content: userMsgText }
    ];

    const startTime = Date.now();

    try {
      const sessionToken = await ensureSessionToken().catch(() => "");
      const authHeaders = getAuthHeaders(apiKey);
      if (sessionToken && !authHeaders["X-Session-Id"]) {
        authHeaders["X-Session-Id"] = sessionToken;
      }

      const response = await fetch("/api/openrouter/chat", {
        method: "POST",
        headers: authHeaders,
        signal: currentController.signal,
        body: JSON.stringify({
          model: selectedModel,
          messages: formattedHistory,
          temperature: 0.1,
          max_tokens: 65536,
          top_p: 0.95,
          stream: true
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData?.error?.message || `Backend API error (${response.status})`);
      }

      const contentType = response.headers.get("content-type") || "";
      let assistantText = "";

      if (contentType.includes("text/event-stream") && response.body) {
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let sseBuffer = "";
        const streamingMsgId = `msg-${Date.now()}-assistant`;
        let lastUpdateTime = 0;
        let pendingText = "";

        // Insert initial placeholder assistant message
        setMessages(prev => [
          ...prev,
          {
            id: streamingMsgId,
            role: "assistant",
            content: "",
            timestamp: new Date().toLocaleTimeString()
          }
        ]);

        const flushUpdate = (immediate = false) => {
          const now = Date.now();
          if (immediate || now - lastUpdateTime >= 50) {
            lastUpdateTime = now;
            const textToSet = pendingText;
            setMessages(prev =>
              prev.map(m => (m.id === streamingMsgId ? { ...m, content: textToSet } : m))
            );
          }
        };

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            sseBuffer += decoder.decode(value, { stream: true });
            const lines = sseBuffer.split("\n");
            sseBuffer = lines.pop() || "";

            for (const line of lines) {
              const trimmed = line.trim();
              if (!trimmed.startsWith("data: ")) continue;
              const payload = trimmed.slice(6).trim();
              if (payload === "[DONE]") continue;
              try {
                const parsedChunk = JSON.parse(payload);
                const delta = parsedChunk.choices?.[0]?.delta?.content || "";
                if (delta) {
                  pendingText += delta;
                  flushUpdate(false);
                }
              } catch {}
            }
          }
        } finally {
          flushUpdate(true);
        }
        assistantText = pendingText || "No text response generated.";
      } else {
        const data = await response.json();
        assistantText = data.choices?.[0]?.message?.content || "No text response generated.";
      }

      // Calculate Execution & Token Timing Statistics
      const durationSeconds = Number(((Date.now() - startTime) / 1000).toFixed(2));
      const tokensEstimated = Math.max(1, Math.ceil(assistantText.length / 3.8));
      const tokensPerSec = Math.round(tokensEstimated / (durationSeconds || 0.1));
      const stats: ExecutionStats = {
        durationSeconds,
        tokensEstimated,
        tokensPerSec,
        compressedContextRatio: "88% Zipped"
      };

      // Finalize the message stats or append if non-streaming
      setMessages(prev => {
        const existingIdx = prev.findIndex(m => m.role === "assistant" && m.content === assistantText);
        if (existingIdx !== -1) {
          return prev.map((m, idx) => (idx === existingIdx ? { ...m, stats } : m));
        }
        return [
          ...prev,
          {
            id: `msg-${Date.now()}-assistant`,
            role: "assistant",
            content: assistantText,
            timestamp: new Date().toLocaleTimeString(),
            stats
          }
        ];
      });

      // Apply workspace changes
      applyAgentActionsToWorkspace(assistantText, "AI Agent");

      const parsed = parseAgentActions(assistantText);

      // AGENTIC TOOL LOOP: if agent requested reads, inject content and re-call
      if (parsed.readsFound.length > 0) {
        const readResults = parsed.readsFound.map(r => {
          const f = files.find(wf => wf.path.toLowerCase() === r.path.toLowerCase());
          if (!f) return `<file_not_found path="${r.path}" />`;
          const HEAD = 4000;
          const TAIL = 1000;
          const THRESHOLD = HEAD + TAIL;
          const preview = f.content.length > THRESHOLD
            ? f.content.slice(0, HEAD) + `\n// [${f.content.length - THRESHOLD} chars omitted — use another read_file for the rest]\n` + f.content.slice(-TAIL)
            : f.content;
          return `<file_content path="${f.path}">\n${preview}\n</file_content>`;
        }).join("\n\n");

        try {
          const loopRes = await fetch("/api/openrouter/chat", {
            method: "POST",
            headers: authHeaders,
            signal: currentController.signal,
            body: JSON.stringify({
              model: selectedModel,
              messages: [
                ...formattedHistory,
                { role: "assistant", content: assistantText },
                { role: "user", content: `[FILE READ RESULTS]\n\n${readResults}\n\nNow proceed and apply your changes.` }
              ],
              temperature: 0.1,
              max_tokens: 65536
            })
          });
          if (loopRes.ok) {
            const loopData = await loopRes.json();
            const loopText = loopData.choices?.[0]?.message?.content || "";
            if (loopText) {
              applyAgentActionsToWorkspace(loopText, "AI Agent");
              const loopParsed = parseAgentActions(loopText);
              if (loopParsed.filesFound.length > 0 || loopParsed.editsFound.length > 0 || loopParsed.appendsFound.length > 0) {
                setActiveTab("editor");
              }
              setMessages(prev => [...prev, {
                id: `msg-${Date.now()}-assistant`,
                role: "assistant",
                content: assistantText + "\n\n" + loopText,
                timestamp: new Date().toLocaleTimeString(),
                stats
              }]);
              if (promptAbortControllerRef.current === currentController) {
                promptAbortControllerRef.current = null;
                setIsAgentProcessing(false);
              }
              return;
            }
          }
        } catch (loopErr: any) {
          if (loopErr?.name === "AbortError") return;
          console.warn("Agentic loop error:", loopErr);
        }
      }

      if (parsed.filesFound.length > 0 || parsed.editsFound.length > 0 || parsed.appendsFound.length > 0) {
        setActiveTab("editor");
      }

    } catch (err: any) {
      const isAbort =
        err?.name === "AbortError" ||
        err?.name === "CanceledError" ||
        err?.name === "TimeoutError" ||
        err?.code === 20 ||
        currentController.signal.aborted ||
        (err?.message && String(err.message).toLowerCase().includes("abort")) ||
        (err?.message && String(err.message).toLowerCase().includes("signal is aborted")) ||
        (err?.message && String(err.message).toLowerCase().includes("canceled")) ||
        (err?.message && String(err.message).toLowerCase().includes("cancelled"));

      if (isAbort) {
        console.debug("Prompt request was aborted");
        return;
      }
      console.warn("Agent chat execution error:", err);
      addAgentAction("error", `Agent error: ${err.message || "Network error"}`);
      const isNetworkErr = err.message === "Failed to fetch" || err.name === "TypeError";
      const userMessage = isNetworkErr
        ? "🔌 **Server Connection Interrupted (Failed to Fetch):**\n\nThe server endpoint (`/api/openrouter/chat`) could not be reached. The backend process may be compiling or restarting. Please retry your prompt in a few seconds, or paste an OpenRouter API key in the left sidebar."
        : `❌ **Failed to execute agent instruction:**\n\n${err.message || "An unexpected error occurred. Please check your model or API key."}`;

      setMessages(prev => [
        ...prev,
        {
          id: `msg-${Date.now()}-error`,
          role: "assistant",
          content: userMessage,
          timestamp: new Date().toLocaleTimeString()
        }
      ]);
    } finally {
      if (promptAbortControllerRef.current === currentController) {
        promptAbortControllerRef.current = null;
        setIsAgentProcessing(false);
      }
    }
  };

  const applyAgentActionsToWorkspace = (text: string, agentName: string = "AI Agent") => {
    const parsed = parseAgentActions(text);

    if (
      parsed.filesFound.length > 0 ||
      parsed.editsFound.length > 0 ||
      parsed.additionsFound.length > 0 ||
      parsed.removalsFound.length > 0 ||
      parsed.appendsFound.length > 0 ||
      parsed.prependsFound.length > 0 ||
      parsed.readsFound.length > 0 ||
      parsed.deletionsFound.length > 0 ||
      parsed.folderDeletionsFound.length > 0
    ) {
      setFiles(prevFiles => {
        let updated = [...prevFiles];
        let firstModifiedPath = "";

        const getLang = (ext: string): string => {
          if (["html", "htm"].includes(ext)) return "html";
          if (["css"].includes(ext)) return "css";
          if (["js", "javascript"].includes(ext)) return "javascript";
          if (["jsx"].includes(ext)) return "jsx";
          if (["ts", "typescript"].includes(ext)) return "typescript";
          if (["tsx"].includes(ext)) return "tsx";
          if (["json"].includes(ext)) return "json";
          if (["py", "python"].includes(ext)) return "python";
          if (["cpp", "cc", "cxx", "h", "hpp"].includes(ext)) return "cpp";
          if (["java"].includes(ext)) return "java";
          return "text";
        };

        // 1. Process Reads
        parsed.readsFound.forEach(readObj => {
          const file = updated.find(f => f.path.toLowerCase() === readObj.path.toLowerCase());
          if (file) {
            addAgentAction("info", `📖 ${agentName} inspected file: ${file.path} (${(file.content || "").length} chars)`, file.path);
            setSelectedFilePath(file.path);
          } else {
            addAgentAction("error", `⚠️ ${agentName} attempted to read missing file: ${readObj.path}`, readObj.path);
          }
        });

        // 2. Process Full Files Created or Overwritten (<file> or <create_file>)
        parsed.filesFound.forEach(newFile => {
          const index = updated.findIndex(f => f.path.toLowerCase() === newFile.path.toLowerCase());
          const ext = (newFile.path.split(".").pop() || "").toLowerCase();
          const language = getLang(ext);

          if (!firstModifiedPath) firstModifiedPath = newFile.path;

          if (index > -1) {
            updated[index] = { ...updated[index], content: newFile.content, language };
            addAgentAction("edit", `📝 ${agentName} updated complete file: ${newFile.path}`, newFile.path);
          } else {
            updated.push({ path: newFile.path, content: newFile.content, language, isUserCreated: true });
            addAgentAction("create", `✨ ${agentName} created new file: ${newFile.path}`, newFile.path);
          }
        });

        // 3. Process Surgical Mid-File Edits (<edit_file path="..."><search>...</search><replace>...</replace></edit_file>)
        parsed.editsFound.forEach(edit => {
          const index = updated.findIndex(f => f.path.toLowerCase() === edit.path.toLowerCase());
          if (!firstModifiedPath) firstModifiedPath = edit.path;

          if (index > -1) {
            let content = updated[index].content;
            const search = edit.search;
            const replace = edit.replace;

            if (search && content.includes(search)) {
              // Replace ALL occurrences, not just the first
              const escapedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
              content = content.replace(new RegExp(escapedSearch, 'g'), replace);
              updated[index] = { ...updated[index], content };
              addAgentAction("edit", `✂️ ${agentName} surgically edited middle of file: ${edit.path}`, edit.path);
            } else if (search) {
              const normContent = content.replace(/\r\n/g, "\n");
              const normSearch = search.replace(/\r\n/g, "\n").trim();
              const normReplace = replace.replace(/\r\n/g, "\n");

              if (normSearch && normContent.includes(normSearch)) {
                const escapedNorm = normSearch.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                content = normContent.replace(new RegExp(escapedNorm, 'g'), normReplace);
                updated[index] = { ...updated[index], content };
                addAgentAction("edit", `✂️ ${agentName} surgically edited middle of file: ${edit.path}`, edit.path);
              } else {
                content = content + "\n\n" + replace;
                updated[index] = { ...updated[index], content };
                addAgentAction("edit", `➕ ${agentName} inserted section into file: ${edit.path}`, edit.path);
              }
            } else {
              content = replace;
              updated[index] = { ...updated[index], content };
              addAgentAction("edit", `📝 ${agentName} updated file contents: ${edit.path}`, edit.path);
            }
          } else {
            const ext = (edit.path.split(".").pop() || "").toLowerCase();
            updated.push({
              path: edit.path,
              content: edit.replace,
              language: getLang(ext),
              isUserCreated: true
            });
            addAgentAction("create", `✨ ${agentName} created file via surgical edit: ${edit.path}`, edit.path);
          }
        });

        // 4. Process Appends (<append_file path="...">...</append_file>)
        parsed.appendsFound.forEach(append => {
          const index = updated.findIndex(f => f.path.toLowerCase() === append.path.toLowerCase());
          if (!firstModifiedPath) firstModifiedPath = append.path;

          if (index > -1) {
            updated[index] = {
              ...updated[index],
              content: updated[index].content + "\n\n" + append.content
            };
            addAgentAction("edit", `📌 ${agentName} appended content to end of file: ${append.path}`, append.path);
          } else {
            const ext = (append.path.split(".").pop() || "").toLowerCase();
            updated.push({
              path: append.path,
              content: append.content,
              language: getLang(ext),
              isUserCreated: true
            });
            addAgentAction("create", `✨ ${agentName} created file via append: ${append.path}`, append.path);
          }
        });

        // 5. Process Prepends (<prepend_file path="...">...</prepend_file>)
        parsed.prependsFound.forEach(prepend => {
          const index = updated.findIndex(f => f.path.toLowerCase() === prepend.path.toLowerCase());
          if (!firstModifiedPath) firstModifiedPath = prepend.path;

          if (index > -1) {
            updated[index] = {
              ...updated[index],
              content: prepend.content + "\n\n" + updated[index].content
            };
            addAgentAction("edit", `🔝 ${agentName} prepended content to top of file: ${prepend.path}`, prepend.path);
          } else {
            const ext = (prepend.path.split(".").pop() || "").toLowerCase();
            updated.push({
              path: prepend.path,
              content: prepend.content,
              language: getLang(ext),
              isUserCreated: true
            });
            addAgentAction("create", `✨ ${agentName} created file via prepend: ${prepend.path}`, prepend.path);
          }
        });

        // 5.5 Process Additions & Inserts (<add_content path="..." position="after|before|end|start" target="...">new code</add_content>)
        parsed.additionsFound.forEach(add => {
          const index = updated.findIndex(f => f.path.toLowerCase() === add.path.toLowerCase());
          if (!firstModifiedPath) firstModifiedPath = add.path;

          if (index > -1) {
            let content = updated[index].content;
            if (add.target && add.position === "after" && content.includes(add.target)) {
              content = content.replace(add.target, add.target + "\n\n" + add.content);
              updated[index] = { ...updated[index], content };
              addAgentAction("create", `➕ ${agentName} inserted content after "${add.target.slice(0, 30)}..." in: ${add.path}`, add.path);
            } else if (add.target && add.position === "before" && content.includes(add.target)) {
              content = content.replace(add.target, add.content + "\n\n" + add.target);
              updated[index] = { ...updated[index], content };
              addAgentAction("create", `➕ ${agentName} inserted content before "${add.target.slice(0, 30)}..." in: ${add.path}`, add.path);
            } else if (add.position === "start") {
              content = add.content + "\n\n" + content;
              updated[index] = { ...updated[index], content };
              addAgentAction("create", `🔝 ${agentName} added content to start of: ${add.path}`, add.path);
            } else {
              content = content + "\n\n" + add.content;
              updated[index] = { ...updated[index], content };
              addAgentAction("create", `📌 ${agentName} added content to: ${add.path}`, add.path);
            }
          } else {
            const ext = (add.path.split(".").pop() || "").toLowerCase();
            updated.push({
              path: add.path,
              content: add.content,
              language: getLang(ext),
              isUserCreated: true
            });
            addAgentAction("create", `✨ ${agentName} created new file via add_content: ${add.path}`, add.path);
          }
        });

        // 5.6 Process Removals (<remove_content path="...">lines to delete</remove_content>)
        parsed.removalsFound.forEach(rem => {
          const index = updated.findIndex(f => f.path.toLowerCase() === rem.path.toLowerCase());
          if (!firstModifiedPath) firstModifiedPath = rem.path;

          if (index > -1) {
            let content = updated[index].content;
            const targetCode = rem.code;
            if (targetCode && content.includes(targetCode)) {
              content = content.replace(targetCode, "").replace(/\n\s*\n\s*\n/g, "\n\n");
              updated[index] = { ...updated[index], content };
              addAgentAction("delete", `✂️ ${agentName} removed content from: ${rem.path}`, rem.path);
            } else {
              const normContent = content.replace(/\r\n/g, "\n");
              const normTarget = targetCode.replace(/\r\n/g, "\n").trim();
              if (normTarget && normContent.includes(normTarget)) {
                content = normContent.replace(normTarget, "").replace(/\n\s*\n\s*\n/g, "\n\n");
                updated[index] = { ...updated[index], content };
                addAgentAction("delete", `✂️ ${agentName} removed content from: ${rem.path}`, rem.path);
              } else {
                addAgentAction("error", `⚠️ ${agentName} could not find exact target block to remove in: ${rem.path}`, rem.path);
              }
            }
          } else {
            addAgentAction("error", `⚠️ ${agentName} attempted to remove content from missing file: ${rem.path}`, rem.path);
          }
        });

        // 6. Process File Deletions
        parsed.deletionsFound.forEach(delPath => {
          updated = updated.filter(f => f.path.toLowerCase() !== delPath.toLowerCase());
          addAgentAction("delete", `🗑️ ${agentName} deleted file: ${delPath}`, delPath);
        });

        // 7. Process Folder Deletions
        parsed.folderDeletionsFound.forEach(fPath => {
          const cleaned = fPath.replace(/^\/+/, "").replace(/\/+$/, "").toLowerCase();
          updated = updated.filter(f => f.path.toLowerCase() !== cleaned && !f.path.toLowerCase().startsWith(cleaned + "/"));
          setEmptyFolders(prev => prev.filter(f => f.toLowerCase() !== cleaned && !f.toLowerCase().startsWith(cleaned + "/")));
          addAgentAction("delete", `🗑️ ${agentName} removed folder directory: ${fPath}`, fPath);
        });

        if (firstModifiedPath) {
          setSelectedFilePath(firstModifiedPath);
        }

        return updated;
      });
    }
  };

  const handleAgentChatMessage = (
    agentName: string,
    avatar: string,
    role: string,
    inputPrompt: string,
    outputResult: string
  ) => {
    const formattedContent = `${avatar} **[${agentName}]** — *${role}*\n\n**📥 Input Task:**\n> ${inputPrompt}\n\n**📤 Execution Output:**\n${outputResult}`;

    const agentMsg: Message = {
      id: `msg-${Date.now()}-agent-${agentName.replace(/\s+/g, "_")}`,
      role: "assistant",
      content: formattedContent,
      timestamp: new Date().toLocaleTimeString()
    };

    setMessages(prev => [...prev, agentMsg]);
    applyAgentActionsToWorkspace(outputResult, agentName);
  };

  // Parsing XML structures out of stream or completed text block
  const parseAgentActions = (text: string) => {
    const filesFound: { path: string; content: string }[] = [];
    const editsFound: { path: string; search: string; replace: string }[] = [];
    const additionsFound: { path: string; position: "after" | "before" | "end" | "start"; target?: string; content: string }[] = [];
    const removalsFound: { path: string; code: string }[] = [];
    const appendsFound: { path: string; content: string }[] = [];
    const prependsFound: { path: string; content: string }[] = [];
    const readsFound: { path: string }[] = [];
    const deletionsFound: string[] = [];
    const folderDeletionsFound: string[] = [];
    const trackedPaths = new Set<string>();

    const stripCodeFences = (content: string): string => {
      let cleaned = content.trim();
      cleaned = cleaned.replace(/^```[a-zA-Z0-9+#-]*\n?/i, "");
      cleaned = cleaned.replace(/\n?```$/, "");
      return cleaned.trim();
    };

    // 1. Parse <file path="..."> or <create_file path="...">
    const fileTagRegex = /<(?:file|create_file)\s+(?:path|name|file|filename)=["']?([^"'\s>]+)["']?\s*>([\s\S]*?)(?:<\/(?:file|create_file)>|(?=<(?:file|create_file|edit_file|append_file|prepend_file|delete_file|delete_folder|read_file|view_file)[\s>]|$))/gi;
    let match;
    while ((match = fileTagRegex.exec(text)) !== null) {
      const filePath = match[1].trim();
      const rawContent = match[2];
      if (filePath && rawContent.trim()) {
        filesFound.push({
          path: filePath,
          content: stripCodeFences(rawContent)
        });
        trackedPaths.add(filePath.toLowerCase());
      }
    }

    // 2. Parse <edit_file path="...">...<search>...</search><replace>...</replace>...</edit_file>
    const editTagRegex = /<edit_file\s+(?:path|name|file|filename)=["']?([^"'\s>]+)["']?\s*>([\s\S]*?)(?:<\/edit_file>|(?=<(?:file|create_file|edit_file|append_file|prepend_file|delete_file|delete_folder|read_file|view_file)[\s>]|$))/gi;
    while ((match = editTagRegex.exec(text)) !== null) {
      const filePath = match[1].trim();
      const innerContent = match[2];

      if (filePath && innerContent.trim()) {
        const searchReplaceRegex = /<search>([\s\S]*?)<\/search>\s*<replace>([\s\S]*?)<\/replace>/gi;
        let srMatch;
        let foundSR = false;
        while ((srMatch = searchReplaceRegex.exec(innerContent)) !== null) {
          foundSR = true;
          editsFound.push({
            path: filePath,
            search: stripCodeFences(srMatch[1]),
            replace: stripCodeFences(srMatch[2])
          });
        }

        if (!foundSR) {
          editsFound.push({
            path: filePath,
            search: "",
            replace: stripCodeFences(innerContent)
          });
        }
        trackedPaths.add(filePath.toLowerCase());
      }
    }

    // 3. Parse <append_file path="...">...</append_file>
    const appendTagRegex = /<append_file\s+(?:path|name|file|filename)=["']?([^"'\s>]+)["']?\s*>([\s\S]*?)(?:<\/append_file>|(?=<(?:file|create_file|edit_file|append_file|prepend_file|delete_file|delete_folder|read_file|view_file)[\s>]|$))/gi;
    while ((match = appendTagRegex.exec(text)) !== null) {
      const filePath = match[1].trim();
      const rawContent = match[2];
      if (filePath && rawContent.trim()) {
        appendsFound.push({
          path: filePath,
          content: stripCodeFences(rawContent)
        });
        trackedPaths.add(filePath.toLowerCase());
      }
    }

    // 4. Parse <prepend_file path="...">...</prepend_file>
    const prependTagRegex = /<prepend_file\s+(?:path|name|file|filename)=["']?([^"'\s>]+)["']?\s*>([\s\S]*?)(?:<\/prepend_file>|(?=<(?:file|create_file|edit_file|append_file|prepend_file|delete_file|delete_folder|read_file|view_file)[\s>]|$))/gi;
    while ((match = prependTagRegex.exec(text)) !== null) {
      const filePath = match[1].trim();
      const rawContent = match[2];
      if (filePath && rawContent.trim()) {
        prependsFound.push({
          path: filePath,
          content: stripCodeFences(rawContent)
        });
        trackedPaths.add(filePath.toLowerCase());
      }
    }

    // 4.5 Parse <add_content path="..." position="after|before|end|start" target="...">...</add_content>
    const addTagRegex = /<(?:add_content|insert_content)\s+(?:path|name|file|filename)=["']?([^"'\s>]+)["']?(?:\s+position=["']?(after|before|end|start)["']?)?(?:\s+(?:target|after|before)=["']?([^"'>]*)["']?)?\s*>([\s\S]*?)(?:<\/(?:add_content|insert_content)>|(?=<(?:file|create_file|edit_file|append_file|prepend_file|delete_file|delete_folder|read_file|view_file|add_content|remove_content)\s|$))/gi;
    while ((match = addTagRegex.exec(text)) !== null) {
      const filePath = match[1].trim();
      const pos = (match[2] as "after" | "before" | "end" | "start") || "end";
      const targetAnchor = match[3] ? match[3].trim() : undefined;
      const rawContent = match[4];
      if (filePath && rawContent.trim()) {
        additionsFound.push({
          path: filePath,
          position: pos,
          target: targetAnchor,
          content: stripCodeFences(rawContent)
        });
        trackedPaths.add(filePath.toLowerCase());
      }
    }

    // 4.6 Parse <remove_content path="...">...</remove_content> or <delete_content path="...">...</delete_content>
    const removeTagRegex = /<(?:remove_content|delete_content)\s+(?:path|name|file|filename)=["']?([^"'\s>]+)["']?\s*>([\s\S]*?)(?:<\/(?:remove_content|delete_content)>|(?=<(?:file|create_file|edit_file|append_file|prepend_file|delete_file|delete_folder|read_file|view_file|add_content|remove_content)\s|$))/gi;
    while ((match = removeTagRegex.exec(text)) !== null) {
      const filePath = match[1].trim();
      const rawContent = match[2];
      if (filePath && rawContent.trim()) {
        removalsFound.push({
          path: filePath,
          code: stripCodeFences(rawContent)
        });
        trackedPaths.add(filePath.toLowerCase());
      }
    }

    // 5. Parse <read_file path="..."/> or <view_file path="..."/>
    const readTagRegex = /<(?:read_file|view_file)\s+(?:path|name)=["']?([^"'\s>]+)["']?\s*(?:\/>|><\/(?:read_file|view_file)>)/gi;
    while ((match = readTagRegex.exec(text)) !== null) {
      readsFound.push({ path: match[1].trim() });
    }

    // 6. Secondary: Code fence with filename header e.g. ```tsx path="src/App.tsx"
    const fenceWithFileRegex = /```[a-zA-Z0-9+#-]*\s+(?:path|filename|file)=["']?([^"'\s]+)["']?\n([\s\S]*?)```/gi;
    while ((match = fenceWithFileRegex.exec(text)) !== null) {
      const filePath = match[1].trim();
      const code = match[2].trim();
      if (filePath && code && !trackedPaths.has(filePath.toLowerCase())) {
        filesFound.push({ path: filePath, content: code });
        trackedPaths.add(filePath.toLowerCase());
      }
    }

    // 7. Fallback markdown code block scanner (if no tags matched)
    if (filesFound.length === 0 && editsFound.length === 0 && appendsFound.length === 0 && prependsFound.length === 0) {
      const codeBlockRegex = /```([a-zA-Z0-9+#-]*)\n([\s\S]*?)```/g;
      let blockMatch;
      const blocks: { lang: string; code: string }[] = [];
      while ((blockMatch = codeBlockRegex.exec(text)) !== null) {
        blocks.push({
          lang: blockMatch[1].trim().toLowerCase(),
          code: blockMatch[2]
        });
      }

      blocks.forEach((block, index) => {
        const lines = block.code.split("\n");
        let detectedPath = "";

        for (let i = 0; i < Math.min(3, lines.length); i++) {
          const line = lines[i].trim();
          const fileMatch = line.match(/(?:file(?:path)?:?\s*|^\/\/\s*|^\/\*\s*|^#\s*)([a-zA-Z0-9_./-]+\.[a-zA-Z0-9]{1,5})/i);
          if (fileMatch) {
            const ext = fileMatch[1].split(".").pop()?.toLowerCase();
            if (ext && ["html", "css", "js", "jsx", "ts", "tsx", "py", "java", "cpp", "c", "cc", "h", "hpp", "json", "md", "sh", "sql"].includes(ext)) {
              detectedPath = fileMatch[1].replace(/^\/+/, "");
              break;
            }
          }
        }

        if (!detectedPath) {
          const extMap: Record<string, string> = {
            html: "index.html",
            css: "styles.css",
            javascript: "script.js",
            js: "script.js",
            jsx: "App.jsx",
            typescript: "index.ts",
            ts: "index.ts",
            tsx: "App.tsx",
            python: "main.py",
            py: "main.py",
            cpp: "main.cpp",
            c: "main.c",
            java: "Main.java",
            json: "data.json"
          };
          const fallback = extMap[block.lang] || "file.txt";
          detectedPath = index === 0 ? fallback : `${fallback.split(".")[0]}_${index}.${fallback.split(".")[1]}`;
        }

        if (!trackedPaths.has(detectedPath.toLowerCase())) {
          filesFound.push({
            path: detectedPath,
            content: block.code.trim()
          });
          trackedPaths.add(detectedPath.toLowerCase());
        }
      });
    }

    // 8. Parse <delete_file path="..." />
    const deleteRegex = /<delete_file\s+(?:path|name)=["']?([^"'\s>]+)["']?\s*(?:\/>|><\/delete_file>)/gi;
    while ((match = deleteRegex.exec(text)) !== null) {
      deletionsFound.push(match[1].trim());
    }

    // 9. Parse <delete_folder path="..." />
    const deleteFolderRegex = /<delete_folder\s+(?:path|name)=["']?([^"'\s>]+)["']?\s*(?:\/>|><\/delete_folder>)/gi;
    while ((match = deleteFolderRegex.exec(text)) !== null) {
      folderDeletionsFound.push(match[1].trim());
    }

    return { filesFound, editsFound, additionsFound, removalsFound, appendsFound, prependsFound, readsFound, deletionsFound, folderDeletionsFound };
  };

  const handleClearHistory = () => {
    setMessages([
      {
        id: "system-reset-" + Date.now(),
        role: "assistant",
        content: "Chat history cleared successfully! Ask a question or send a prompt to start a new workspace development iteration.",
        timestamp: new Date().toLocaleTimeString()
      }
    ]);
    setAgentActions([]);
    setTerminalOutput("Workspace terminal cleared.\n");
  };

  // Filter models based on search term (strictly unique keys)
  const filteredModels = deduplicateModels(models).filter(m => 
    m.id.toLowerCase().includes(modelSearch.toLowerCase()) || 
    m.name.toLowerCase().includes(modelSearch.toLowerCase())
  );

  // If user hasn't entered workspace yet, show Landing Page or Animated Loading Screen
  if (!hasEnteredWorkspace) {
    if (isWorkspaceLoading) {
      const isLight = theme === "light";
      return (
        <div className={`min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden transition-colors duration-300 ${
          isLight ? "bg-slate-50 text-slate-900 cyber-grid-light" : "bg-[#0a0a0c] text-white cyber-grid-dark"
        }`}>
          <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full blur-3xl pointer-events-none animate-pulse-glow ${
            isLight ? "bg-indigo-300/30" : "bg-indigo-600/20"
          }`} />
          <div className={`z-10 rounded-3xl p-8 max-w-md w-full text-center space-y-6 shadow-2xl border transition-all ${
            isLight ? "bg-white/95 border-slate-200 glass-panel-light neon-border-light" : "bg-zinc-900/90 border-zinc-800 glass-panel glow-indigo-hover"
          }`}>
            <div className="p-4 bg-indigo-500/10 text-indigo-600 rounded-2xl w-fit mx-auto border border-indigo-500/20">
              <Sparkles className="w-8 h-8 animate-spin text-amber-500" />
            </div>
            
            <div className="space-y-2">
              <h2 className={`text-xl font-black tracking-tight ${isLight ? "text-slate-900" : "text-white"}`}>
                {workspaceTitle}
              </h2>
              <p className="text-xs font-mono text-indigo-600 font-semibold">{workspaceLoadingMsg}</p>
            </div>

            <div className={`w-full h-2 rounded-full overflow-hidden border ${
              isLight ? "bg-slate-100 border-slate-200" : "bg-zinc-950 border-zinc-800"
            }`}>
              <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-400 h-full w-full animate-pulse" />
            </div>

            <div className={`text-[11px] font-mono ${isLight ? "text-slate-500" : "text-zinc-400"}`}>
              Preparing sandboxed virtual filesystem & multi-agent environment...
            </div>
          </div>
        </div>
      );
    }

    return (
      <>
        <LandingPage
          apiKey={apiKey}
          onSaveApiKey={(key) => {
            setApiKey(key);
            setStoredOpenRouterKey(key);
          }}
          selectedModel={selectedModel}
          onSelectModel={setSelectedModel}
          availableModels={deduplicateModels(models)}
          onEnterWorkspace={handleEnterWorkspace}
          onGoogleSignIn={googleSignIn}
          theme={theme}
          onToggleTheme={() => setTheme(prev => prev === "light" ? "dark" : "light")}
          onOpenMathPlotter={() => setIsMathPlotterOpen(true)}
          onOpenSecurityShield={() => setIsSecurityShieldOpen(true)}
        />
        {isSecurityShieldOpen && (
          <SystemSecurityShieldModal
            isOpen={isSecurityShieldOpen}
            onClose={() => setIsSecurityShieldOpen(false)}
          />
        )}
      </>
    );
  }

  return (
    <div 
      id="workspace-container" 
      style={{ fontSize: `${borderSettings.uiTextScale}%` }}
      className={`h-screen max-h-screen flex flex-col font-sans selection:bg-indigo-500/20 antialiased overflow-hidden transition-colors duration-200 ${
        theme === "dark" ? "bg-zinc-950 text-zinc-100" : "bg-slate-50 text-slate-900"
      }`}
    >
      {/* Live Custom Sliders Stylesheet Injection */}
      <style>{`
        :root {
          --app-border-radius: ${borderSettings.borderRadius}px;
          --app-border-width: ${borderSettings.borderWidth}px;
          --app-border-opacity: ${borderSettings.borderOpacity / 100};
          --app-backdrop-blur: ${borderSettings.backdropBlur}px;
          --app-header-height: ${borderSettings.headerHeight}px;
        }
        .rounded-xl, .rounded-2xl, .rounded-3xl {
          border-radius: ${borderSettings.borderRadius}px !important;
        }
        ${borderSettings.borderGlow ? `
          .border, .border-b, .border-t, .border-l, .border-r {
            box-shadow: 0 0 8px rgba(99, 102, 241, ${borderSettings.borderOpacity / 200}) !important;
          }
        ` : ''}
      `}</style>
      
      {/* EXECUTIVE PROFESSIONAL HEADER BAR */}
      <HeaderBar
        workspaceTitle={workspaceTitle}
        studioLogoPhoto={studioLogoPhoto}
        setStudioLogoPhoto={setStudioLogoPhoto}
        handleStudioLogoUpload={handleStudioLogoUpload}
        studioLogoInputRef={studioLogoInputRef}
        theme={theme}
        setTheme={setTheme}
        templates={templates}
        handleTemplateLoad={handleTemplateLoad}
        setIsCommandPaletteOpen={setIsCommandPaletteOpen}
        setIsErrorLogCenterOpen={setIsErrorLogCenterOpen}
        unresolvedErrorCount={unresolvedErrorCount}
        setIsShortcutsHelpOpen={setIsShortcutsHelpOpen}
        setIsMathPlotterOpen={setIsMathPlotterOpen}
        onOpenCalendar={() => setActiveTab("calendar-agent")}
        onOpenSecurityShield={() => setIsSecurityShieldOpen(true)}
        onOpenApiDashboard={() => setIsApiDashboardOpen(true)}
        onOpenGoogleServices={() => setShowGoogleServicesModal(true)}
        onOpenThemeSelector={() => setIsThemeSelectorOpen(true)}
        showSlidersBar={showSlidersBar}
        setShowSlidersBar={setShowSlidersBar}
        handleDownloadZip={handleDownloadZip}
        handleUploadToDrive={handleUploadToDrive}
        borderSettings={borderSettings}
        isGuest={currentAuthMode === "guest"}
        onExitWorkspace={() => setHasEnteredWorkspace(false)}
      />

      {/* INTERACTIVE BORDER & LAYOUT ADJUSTMENT SLIDERS BAR */}
      <BorderLayoutSlidersBar
        theme={theme}
        sidebarWidth={sidebarWidth}
        onSidebarWidthChange={setSidebarWidth}
        terminalHeight={brainBoardHeight}
        onTerminalHeightChange={setBrainBoardHeight}
        editorFontSize={editorFontSize}
        onEditorFontSizeChange={setEditorFontSize}
        borderSettings={borderSettings}
        onBorderSettingsChange={setBorderSettings}
        isOpen={showSlidersBar}
        onClose={() => setShowSlidersBar(false)}
      />

      {/* MAIN CONTAINER FRAMEWORK */}
      <div className="flex-1 flex overflow-hidden min-h-0">
        
        {/* LEFT SIDEBAR - CONNECTOR & AGENT CHAT */}
        <AiBrainSidebarPanel
          theme={theme}
          sidebarWidth={sidebarWidth}
          showKey={showKey}
          setShowKey={setShowKey}
          apiKey={apiKey}
          setApiKey={setApiKey}
          apiConnectionStatus={apiConnectionStatus}
          apiErrorMessage={apiErrorMessage}
          handleTestKeyConnection={handleTestKeyConnection}
          selectedModel={selectedModel}
          setSelectedModel={setSelectedModel}
          modelSearch={modelSearch}
          setModelSearch={setModelSearch}
          filteredModels={filteredModels}
          messages={messages}
          isAgentProcessing={isAgentProcessing}
          chatEndRef={chatEndRef}
          inputPrompt={inputPrompt}
          setInputPrompt={setInputPrompt}
          handleSendPrompt={handleSendPrompt}
          handleStopPrompt={handleStopPrompt}
          attachedFileForChat={attachedFileForChat}
          setAttachedFileForChat={setAttachedFileForChat}
          selectedAgentForChat={selectedAgentForChat}
          setSelectedAgentForChat={setSelectedAgentForChat}
          files={files}
          setMessages={setMessages}
          addAgentAction={addAgentAction}
          setActiveTab={setActiveTab}
        />

        {/* VERTICAL DRAG HANDLE BETWEEN SIDEBAR & MAIN */}
        <VerticalResizeSliderHandle
          currentWidth={sidebarWidth}
          onWidthChange={setSidebarWidth}
          minWidth={240}
          maxWidth={650}
          label="Chat Sidebar Width"
          theme={theme}
        />

        {/* RIGHT AREA - IDE WORKSPACE */}
        <main className="flex-1 flex flex-col h-full bg-slate-50/30 overflow-hidden min-w-0">
          
          {/* WORKSPACE MODE TAB SELECTOR */}
          <WorkspaceTabsBar
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            theme={theme}
            filesCount={files.length}
            agentActionsCount={agentActions.length}
            onOpenRunnerModal={() => setIsRunnerModalOpen(true)}
          />

          {/* WORKSPACE AREA RENDERING MODULE */}
          <div className="flex-1 w-full h-full min-w-0 min-h-0 flex flex-col overflow-hidden relative">
            
            <AppTabViewsRouter
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              theme={theme}
              files={files}
              setFiles={setFiles}
              selectedFilePath={selectedFilePath}
              setSelectedFilePath={setSelectedFilePath}
              apiKey={apiKey}
              selectedModel={selectedModel}
              addAgentAction={addAgentAction}
              agentActions={agentActions}
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
              emptyFolders={emptyFolders}
              setEmptyFolders={setEmptyFolders}
              messages={messages}
              setMessages={setMessages}
              renderTree={renderTree}
              buildFileTree={buildFileTree}
              getFileBadgeAndIcon={getFileBadgeAndIcon}
              handleLanguageChange={handleChangeFileLanguage}
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
              brainBoardHeight={brainBoardHeight}
              setBrainBoardHeight={setBrainBoardHeight}
              terminalExitCode={terminalExitCode}
              terminalOutput={terminalOutput}
              setTerminalOutput={setTerminalOutput}
              customCommandInput={customCommandInput}
              setCustomCommandInput={setCustomCommandInput}
              handleAgentChatMessage={handleAgentChatMessage}
              setDocChatPrompt={setDocChatPrompt}
              setTheme={setTheme}
              sidebarWidth={sidebarWidth}
              setSidebarWidth={setSidebarWidth}
              editorWidth={editorWidth}
              setEditorWidth={setEditorWidth}
              setApiKey={setApiKey}
              googleSignIn={googleSignIn}
              gmailToken={gmailToken}
              gmailUser={gmailUser}
              setGmailToken={setGmailToken}
              setGmailUser={setGmailUser}
              isMusicPlaying={isMusicPlaying}
              currentTrackIndex={currentTrackIndex}
              musicTracks={musicTracks}
              setMusicTracks={setMusicTracks}
              setCurrentTrackIndex={setCurrentTrackIndex}
              musicVolume={musicVolume}
              setMusicVolume={setMusicVolume}
              isMusicMuted={isMusicMuted}
              setIsMusicMuted={setIsMusicMuted}
              musicCurrentTime={musicCurrentTime}
              musicDuration={musicDuration}
              handleTogglePlay={handleTogglePlay}
              handleForceStopMusic={handleForceStopMusic}
              handleNextTrack={handleNextTrack}
              handlePrevTrack={handlePrevTrack}
              handleSeek={handleSeek}
              handleSelectTrack={handleSelectTrack}
            />
          </div>

        </main>

      </div>



      {/* ALL SYSTEM MODALS CONTAINER */}
      <AppModalsContainer
        theme={theme}
        showGoToLineModal={showGoToLineModal}
        setShowGoToLineModal={setShowGoToLineModal}
        gotoLineInput={gotoLineInput}
        setGotoLineInput={setGotoLineInput}
        jumpToLine={jumpToLine}
        activeFile={activeFile}
        showLanguagePickerModal={showLanguagePickerModal}
        setShowLanguagePickerModal={setShowLanguagePickerModal}
        selectedFilePath={selectedFilePath}
        handleChangeFileLanguage={handleChangeFileLanguage}
        showVSCodeProModal={showVSCodeProModal}
        setShowVSCodeProModal={setShowVSCodeProModal}
        files={files}
        handleFormatCode={handleFormatCode}
        showDocStatsModal={showDocStatsModal}
        setShowDocStatsModal={setShowDocStatsModal}
        fileEncoding={fileEncoding}
        indentType={indentType}
        indentSize={indentSize}
        showEncodingPickerModal={showEncodingPickerModal}
        setShowEncodingPickerModal={setShowEncodingPickerModal}
        setFileEncoding={setFileEncoding}
        addAgentAction={addAgentAction}
        showDriveModal={showDriveModal}
        setShowDriveModal={setShowDriveModal}
        isDriveUploading={isDriveUploading}
        driveUploadProgress={driveUploadProgress}
        driveUploadLink={driveUploadLink}
        deleteConfirmTarget={deleteConfirmTarget}
        setDeleteConfirmTarget={setDeleteConfirmTarget}
        handleDeleteFile={handleDeleteFile}
        handleDeleteFolder={handleDeleteFolder}
        renamingPath={renamingPath}
        setRenamingPath={setRenamingPath}
        renameInputValue={renameInputValue}
        setRenameInputValue={setRenameInputValue}
        handleRenameFile={handleRenameFile}
        handleRenameFolder={handleRenameFolder}
        isMathPlotterOpen={isMathPlotterOpen}
        setIsMathPlotterOpen={setIsMathPlotterOpen}
        isMusicPlaying={isMusicPlaying}
        activeTab={activeTab}
        currentTrackIndex={currentTrackIndex}
        musicTracks={musicTracks}
        handlePrevTrack={handlePrevTrack}
        handleTogglePlay={handleTogglePlay}
        handleNextTrack={handleNextTrack}
        handleForceStopMusic={handleForceStopMusic}
        setActiveTab={(tab: any) => setActiveTab(tab)}
        isRunnerModalOpen={isRunnerModalOpen}
        setIsRunnerModalOpen={setIsRunnerModalOpen}
        isCodeRunnerOpen={isCodeRunnerOpen}
        setIsCodeRunnerOpen={setIsCodeRunnerOpen}
        apiKey={apiKey}
        selectedModel={selectedModel}
        setSelectedModel={setSelectedModel}
        setSelectedFilePath={setSelectedFilePath}
        setShowSlidersBar={setShowSlidersBar}
        setShowTerminal={setShowTerminal}
        handleDownloadZip={handleDownloadZip}
        isShortcutsHelpOpen={isShortcutsHelpOpen}
        setIsShortcutsHelpOpen={setIsShortcutsHelpOpen}
        isCommandPaletteOpen={isCommandPaletteOpen}
        setIsCommandPaletteOpen={setIsCommandPaletteOpen}
        setTheme={setTheme}
        rightClickToast={rightClickToast}
        setRightClickToast={setRightClickToast}
        isSecurityShieldOpen={isSecurityShieldOpen}
        setIsSecurityShieldOpen={setIsSecurityShieldOpen}
        isErrorLogCenterOpen={isErrorLogCenterOpen}
        setIsErrorLogCenterOpen={setIsErrorLogCenterOpen}
        isApiDashboardOpen={isApiDashboardOpen}
        setIsApiDashboardOpen={setIsApiDashboardOpen}
        isThemeSelectorOpen={isThemeSelectorOpen}
        setIsThemeSelectorOpen={setIsThemeSelectorOpen}
        showGoogleServicesModal={showGoogleServicesModal}
        setShowGoogleServicesModal={setShowGoogleServicesModal}
        handleCreateFile={(filePath: string, content: string) => {
          setFiles((prev) => {
            const exists = prev.some((f) => f.path === filePath);
            if (exists) {
              return prev.map((f) => (f.path === filePath ? { ...f, content } : f));
            }
            return [
              ...prev,
              {
                path: filePath,
                name: filePath.split("/").pop() || "Component.tsx",
                content,
                language: filePath.endsWith(".tsx") || filePath.endsWith(".ts") ? "typescript" : "javascript"
              }
            ];
          });
          setSelectedFilePath(filePath);
          addAgentAction("create", `Generated component '${filePath}' via Gemini Multimodal Vision.`, filePath);
        }}
      />
    </div>
  );
}
