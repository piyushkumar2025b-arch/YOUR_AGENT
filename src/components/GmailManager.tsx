import React, { useState, useEffect, useCallback } from "react";
import {
  Mail,
  Paperclip,
  Download,
  Send,
  Search,
  CheckCircle2,
  FileText,
  Image as ImageIcon,
  Sparkles,
  Inbox,
  SendHorizontal,
  File,
  X,
  Plus,
  RefreshCw,
  LogOut,
  AlertCircle,
  KeyRound,
  Check,
  ShieldCheck
} from "lucide-react";
import {
  googleSignIn,
  listEmails,
  sendEmail,
  getAttachmentData,
  GmailMessageSummary,
  GmailAttachmentInfo
} from "../gmailService";
import { sanitizeHtml } from "../utils/security";

interface GmailManagerProps {
  theme: "light" | "dark";
  apiKey?: string;
  onGoogleSignIn?: () => Promise<any>;
  userEmail?: string;
  accessToken?: string;
  onTokenUpdate?: (token: string, user: any) => void;
}

export const GmailManager: React.FC<GmailManagerProps> = ({
  theme,
  apiKey,
  onGoogleSignIn,
  userEmail = "",
  accessToken: propToken = "",
  onTokenUpdate
}) => {
  // Auth & Token State
  const [currentToken, setCurrentToken] = useState<string>(propToken);
  const [currentUserEmail, setCurrentUserEmail] = useState<string>(userEmail);
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [manualTokenInput, setManualTokenInput] = useState<string>("");
  const [showManualToken, setShowManualToken] = useState<boolean>(false);
  const [showGcpGuide, setShowGcpGuide] = useState<boolean>(false);

  // Email Data State - REAL ONLY, NO MOCK DATA
  const [emails, setEmails] = useState<GmailMessageSummary[]>([]);
  const [selectedEmail, setSelectedEmail] = useState<GmailMessageSummary | null>(null);
  const [isLoadingEmails, setIsLoadingEmails] = useState<boolean>(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedFolder, setSelectedFolder] = useState<"inbox" | "sent">("inbox");
  const [onlyAttachmentsFilter, setOnlyAttachmentsFilter] = useState<boolean>(false);

  // Attachment Downloading State
  const [downloadingAttId, setDownloadingAttId] = useState<string | null>(null);

  // Compose Modal State
  const [isComposing, setIsComposing] = useState<boolean>(false);
  const [composeTo, setComposeTo] = useState<string>("");
  const [composeSubject, setComposeSubject] = useState<string>("");
  const [composeBody, setComposeBody] = useState<string>("");
  const [isSending, setIsSending] = useState<boolean>(false);
  const [sendStatus, setSendStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // AI Reply State
  const [aiReplying, setAiReplying] = useState<boolean>(false);

  // Update current token if props update
  useEffect(() => {
    if (propToken) {
      setCurrentToken(propToken);
    }
  }, [propToken]);

  useEffect(() => {
    if (userEmail) {
      setCurrentUserEmail(userEmail);
    }
  }, [userEmail]);

  // Load real emails from Gmail API
  const loadRealEmails = useCallback(async (tokenToUse: string, query: string = "") => {
    if (!tokenToUse) return;
    setIsLoadingEmails(true);
    setFetchError(null);

    try {
      // Build search query for folder
      let fullQuery = query;
      if (selectedFolder === "sent") {
        fullQuery = fullQuery ? `in:sent ${fullQuery}` : "in:sent";
      }

      let tokenToFetch = tokenToUse;
      // Refresh token if it may have expired (tokens last ~3600s; refresh if stored >50min ago)
      const tokenTimestamp = Number(localStorage.getItem("gmail_token_timestamp") || 0);
      if (Date.now() - tokenTimestamp > 50 * 60 * 1000) {
        try {
          const refreshed = await import("../gmailService").then(m => m.googleSignIn());
          if (refreshed?.accessToken) {
            tokenToFetch = refreshed.accessToken;
            setCurrentToken(tokenToFetch);
            localStorage.setItem("gmail_token_timestamp", String(Date.now()));
          }
        } catch {
          // silent — use existing token and let the API call surface the real error
        }
      }
      const fetched = await listEmails(tokenToFetch, fullQuery);
      setEmails(fetched);
      if (fetched.length > 0) {
        setSelectedEmail(prev => {
          if (prev && fetched.some(m => m.id === prev.id)) {
            return fetched.find(m => m.id === prev.id) || fetched[0];
          }
          return fetched[0];
        });
      } else {
        setSelectedEmail(null);
      }
    } catch (err: any) {
      console.error("Error fetching real Gmail emails:", err);
      const msg = err?.message || "Failed to fetch emails from Gmail API.";
      if (msg.includes("401") || msg.includes("UNAUTHENTICATED") || msg.includes("invalid_token")) {
        setFetchError("Google session expired or unauthorized. Please click 'Sign In with Gmail' to connect.");
        setCurrentToken("");
      } else {
        setFetchError(msg);
      }
    } finally {
      setIsLoadingEmails(false);
    }
  }, [selectedFolder]);

  // Auto fetch emails whenever token or folder changes
  useEffect(() => {
    if (currentToken) {
      loadRealEmails(currentToken, searchQuery);
    }
  }, [currentToken, selectedFolder, loadRealEmails]);

  // Trigger Google Sign In
  const handleSignIn = async () => {
    setIsConnecting(true);
    setFetchError(null);
    try {
      const signInFn = onGoogleSignIn || googleSignIn;
      const res = await signInFn();
      if (res && res.accessToken) {
        setCurrentToken(res.accessToken);
        if (res.user?.email) {
          setCurrentUserEmail(res.user.email);
        }
        if (onTokenUpdate) {
          onTokenUpdate(res.accessToken, res.user);
        }
        // Immediately load real inbox
        await loadRealEmails(res.accessToken, searchQuery);
      }
    } catch (err: any) {
      console.error("Sign in failed:", err);
      const errMsg = err?.message || String(err);
      if (errMsg.includes("403") || errMsg.includes("access_denied") || errMsg.includes("verification process")) {
        setFetchError("Google OAuth 403: The Google Cloud app is currently in 'Testing Mode'. To allow any Google user, Publish the App in Google Cloud Console, or paste a Google Access Token directly below.");
        setShowGcpGuide(true);
        setShowManualToken(true);
      } else {
        setFetchError(errMsg || "Sign in failed. Please ensure popups are allowed.");
      }
    } finally {
      setIsConnecting(false);
    }
  };

  const handleManualTokenConnect = async () => {
    if (!manualTokenInput.trim()) return;
    const cleanToken = manualTokenInput.trim();
    setIsConnecting(true);
    setFetchError(null);
    try {
      setCurrentToken(cleanToken);
      setCurrentUserEmail("Authorized Google User");
      if (onTokenUpdate) {
        onTokenUpdate(cleanToken, { email: "Authorized Google User" });
      }
      await loadRealEmails(cleanToken, searchQuery);
    } catch (err: any) {
      setFetchError(`Manual Token Connection Error: ${err?.message || "Invalid or expired token"}`);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = () => {
    setCurrentToken("");
    setEmails([]);
    setSelectedEmail(null);
    setFetchError(null);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentToken) {
      loadRealEmails(currentToken, searchQuery);
    }
  };

  // Real Attachment Downloader
  const handleDownloadAttachment = async (attachment: GmailAttachmentInfo) => {
    if (!selectedEmail || !currentToken || !attachment.attachmentId) {
      setSendStatus({ type: "error", message: "Attachment ID unavailable or expired." });
      return;
    }

    setDownloadingAttId(attachment.id);
    try {
      const result = await getAttachmentData(currentToken, selectedEmail.id, attachment.attachmentId);
      if (!result || !result.data) {
        throw new Error("No data returned for attachment");
      }

      // Convert base64url string to Blob
      const base64 = result.data.replace(/-/g, "+").replace(/_/g, "/");
      const binaryStr = atob(base64);
      const bytes = new Uint8Array(binaryStr.length);
      for (let i = 0; i < binaryStr.length; i++) {
        bytes[i] = binaryStr.charCodeAt(i);
      }

      const blob = new Blob([bytes], { type: attachment.mimeType || "application/octet-stream" });
      const downloadUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = attachment.filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(downloadUrl);
      setSendStatus({ type: "success", message: `Downloaded ${attachment.filename}` });
    } catch (err: any) {
      console.warn("Failed to download attachment:", err);
      setSendStatus({ type: "error", message: `Failed to download attachment: ${err?.message || "Error"}` });
    } finally {
      setDownloadingAttId(null);
    }
  };

  // Real Send Email
  const handleSendEmail = async () => {
    if (!composeTo.trim()) {
      setSendStatus({ type: "error", message: "Recipient email is required." });
      return;
    }
    if (!composeSubject.trim()) {
      setSendStatus({ type: "error", message: "Subject is required." });
      return;
    }
    if (!currentToken) {
      setSendStatus({ type: "error", message: "You must be signed in with Gmail to send emails." });
      return;
    }

    setIsSending(true);
    setSendStatus(null);

    try {
      await sendEmail(currentToken, composeTo.trim(), composeSubject.trim(), composeBody);
      setSendStatus({ type: "success", message: "Email sent successfully via Gmail API!" });
      setTimeout(() => {
        setIsComposing(false);
        setComposeTo("");
        setComposeSubject("");
        setComposeBody("");
        setSendStatus(null);
        // Refresh sent items if viewing sent
        if (selectedFolder === "sent") {
          loadRealEmails(currentToken, searchQuery);
        }
      }, 1200);
    } catch (err: any) {
      console.error("Failed to send email:", err);
      setSendStatus({ type: "error", message: err?.message || "Failed to send email via Gmail API." });
    } finally {
      setIsSending(false);
    }
  };

  // Generate AI Reply using Gemini API
  const handleGenerateAIReply = async () => {
    if (!selectedEmail) return;
    setAiReplying(true);

    try {
      const res = await fetch("/api/openrouter/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": apiKey ? `Bearer ${apiKey}` : ""
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            {
              role: "system",
              content: "You are an executive AI assistant. Draft a concise, professional reply to the following email."
            },
            {
              role: "user",
              content: `Original Subject: ${selectedEmail.subject}\nFrom: ${selectedEmail.from}\nBody: ${selectedEmail.body}`
            }
          ]
        })
      });

      if (res.ok) {
        const json = await res.json();
        const replyText = json.choices?.[0]?.message?.content || "";
        setIsComposing(true);
        setComposeTo(extractEmailAddress(selectedEmail.from));
        setComposeSubject(`Re: ${selectedEmail.subject.replace(/^Re:\s*/i, "")}`);
        setComposeBody(replyText);
      } else {
        throw new Error("AI Reply service unavailable");
      }
    } catch (err) {
      console.warn("Falling back to draft template:", err);
      setIsComposing(true);
      setComposeTo(extractEmailAddress(selectedEmail.from));
      setComposeSubject(`Re: ${selectedEmail.subject.replace(/^Re:\s*/i, "")}`);
      setComposeBody(`Thank you for your email regarding "${selectedEmail.subject}".\n\nI have received your message and will review it promptly.\n\nBest regards,`);
    } finally {
      setAiReplying(false);
    }
  };

  // Helper to parse email address from "Name <email@domain.com>"
  const extractEmailAddress = (fromHeader: string): string => {
    const match = fromHeader.match(/<([^>]+)>/);
    return match ? match[1] : fromHeader;
  };

  // Filtered list
  const filteredEmails = emails.filter(e => {
    if (onlyAttachmentsFilter) {
      return e.attachments && e.attachments.length > 0;
    }
    return true;
  });

  return (
    <div className={`h-full w-full flex-1 flex flex-col overflow-hidden ${theme === "dark" ? "bg-[#0d0e12] text-zinc-100" : "bg-slate-50 text-slate-800"}`}>
      {/* TOP HEADER */}
      <div className={`p-4 border-b flex flex-wrap items-center justify-between gap-3 shrink-0 ${
        theme === "dark" ? "border-zinc-800 bg-zinc-900/90" : "border-slate-200 bg-white"
      }`}>
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-rose-500/10 text-rose-500 rounded-2xl border border-rose-500/20 shadow-sm">
            <Mail className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h2 className="text-sm font-bold tracking-tight flex items-center gap-2">
              Gmail Inbox & Workspace Hub
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" /> Live OAuth 2.0
              </span>
            </h2>
            <p className="text-[11px] text-slate-400">Direct integration with official Google Gmail REST API — 100% Real Inbox & Real Attachments</p>
          </div>
        </div>

        {/* AUTH CONTROLS */}
        <div className="flex items-center gap-2 flex-wrap">
          {currentToken ? (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono font-bold">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span className="truncate max-w-[220px]">{currentUserEmail || "Connected User"}</span>
              </div>

              <button
                onClick={() => loadRealEmails(currentToken, searchQuery)}
                disabled={isLoadingEmails}
                className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold transition-all border border-zinc-700 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                title="Refresh Gmail inbox"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoadingEmails ? "animate-spin" : ""}`} />
                <span className="hidden sm:inline">Refresh</span>
              </button>

              <button
                onClick={handleDisconnect}
                className="p-1.5 rounded-xl bg-zinc-800 hover:bg-rose-500/20 hover:text-rose-400 text-zinc-400 text-xs transition-all cursor-pointer"
                title="Disconnect Google Account"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={handleSignIn}
              disabled={isConnecting}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-rose-600 via-red-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white text-xs font-bold transition-all shadow-lg shadow-rose-600/20 flex items-center gap-2 cursor-pointer border border-rose-400/30"
            >
              <svg className="w-4 h-4 bg-white rounded-full p-0.5 shrink-0" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span>{isConnecting ? "Connecting Google Account..." : "Sign in with Gmail"}</span>
            </button>
          )}

          <button
            onClick={() => setIsComposing(true)}
            disabled={!currentToken}
            className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 disabled:opacity-40 text-white text-xs font-bold transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Compose</span>
          </button>
        </div>
      </div>

      {/* ERROR NOTICE */}
      {fetchError && (
        <div className="bg-rose-500/10 border-b border-rose-500/20 p-3 px-5 flex items-center justify-between text-xs text-rose-400">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{fetchError}</span>
          </div>
          <button
            onClick={handleSignIn}
            className="px-3 py-1 rounded-lg bg-rose-600 text-white text-[11px] font-bold hover:bg-rose-500 cursor-pointer shrink-0"
          >
            Authenticate
          </button>
        </div>
      )}

      {/* MAIN VIEW GRID */}
      {!currentToken ? (
        /* SIGN IN PROMPT STATE */
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-5 overflow-y-auto max-w-xl mx-auto">
          <div className="p-4 rounded-3xl bg-rose-500/10 text-rose-500 border border-rose-500/20 shadow-xl">
            <KeyRound className="w-10 h-10" />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-bold text-white">Connect Your Google Gmail Account</h3>
            <p className="text-xs text-slate-400 leading-relaxed max-w-md mx-auto">
              Authenticate via Google OAuth to access real inbox emails, read bodies, download attachments, and send emails directly.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3">
            <button
              onClick={handleSignIn}
              disabled={isConnecting}
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-rose-600 via-red-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white text-xs font-bold transition-all shadow-xl shadow-rose-600/30 flex items-center gap-2.5 cursor-pointer border border-rose-400/30"
            >
              <svg className="w-5 h-5 bg-white rounded-full p-0.5 shrink-0" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span>{isConnecting ? "Connecting Google..." : "Sign in with Google"}</span>
            </button>

            <button
              onClick={() => setShowManualToken(!showManualToken)}
              className="px-4 py-3 rounded-2xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white text-xs font-semibold transition-all border border-zinc-700 cursor-pointer flex items-center gap-2"
            >
              <KeyRound className="w-4 h-4 text-amber-400" />
              <span>Paste Access Token</span>
            </button>
          </div>

          {/* MANUAL TOKEN EXPANDABLE INPUT */}
          {showManualToken && (
            <div className="w-full bg-zinc-900/90 border border-amber-500/30 rounded-2xl p-4 text-left space-y-3 shadow-2xl mt-2 animate-fadeIn">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4" /> Direct Google OAuth Token
                </span>
                <span className="text-[10px] text-zinc-400">Bypasses 403 test account restriction</span>
              </div>
              <p className="text-[11px] text-zinc-400 leading-normal">
                Paste a Google OAuth Access Token (from OAuth Playground or Google Cloud CLI) to connect instantly without needing Google approval for test users:
              </p>
              <div className="flex items-center gap-2">
                <input
                  type="password"
                  placeholder="ya29.a0A..."
                  value={manualTokenInput}
                  onChange={(e) => setManualTokenInput(e.target.value)}
                  className="flex-1 px-3 py-2 bg-black/60 border border-zinc-700 rounded-xl text-xs text-white font-mono focus:outline-none focus:border-amber-500"
                />
                <button
                  onClick={handleManualTokenConnect}
                  disabled={!manualTokenInput.trim() || isConnecting}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition-all cursor-pointer shrink-0"
                >
                  Connect Token
                </button>
              </div>
              <div className="text-[10px] text-zinc-500 flex items-center justify-between pt-1">
                <span>Tip: Get a token in 10s at <a href="https://developers.google.com/oauthplayground/" target="_blank" rel="noopener noreferrer" className="text-amber-400 underline">Google OAuth Playground</a></span>
              </div>
            </div>
          )}

          {/* GOOGLE CLOUD OAUTH 403 HELP / PUBLISH GUIDE */}
          <div className="w-full text-left bg-zinc-900/60 border border-zinc-800 rounded-2xl p-4 space-y-2 mt-4">
            <button
              onClick={() => setShowGcpGuide(!showGcpGuide)}
              className="w-full flex items-center justify-between text-xs font-bold text-zinc-300 hover:text-white cursor-pointer"
            >
              <span className="flex items-center gap-1.5 text-rose-400">
                <AlertCircle className="w-4 h-4" /> Facing 'Error 403: access_denied'? Click for Fix
              </span>
              <span className="text-xs font-mono">{showGcpGuide ? "▲ Hide" : "▼ Show Fix"}</span>
            </button>

            {showGcpGuide && (
              <div className="text-[11px] text-zinc-400 space-y-2 pt-2 border-t border-zinc-800/80 leading-relaxed">
                <p className="font-semibold text-zinc-200">
                  Why Google shows Error 403 (unverified app):
                </p>
                <ol className="list-decimal list-inside space-y-1.5 text-zinc-300">
                  <li>Go to your <a href="https://console.cloud.google.com/apis/credentials/consent" target="_blank" rel="noopener noreferrer" className="text-rose-400 underline">Google Cloud Console &gt; OAuth Consent Screen</a>.</li>
                  <li>Under <strong>Publishing status</strong>, click <strong>PUBLISH APP</strong> (or add your Gmail email to the <em>Test Users</em> section).</li>
                  <li>Or simply use the <strong>Paste Access Token</strong> option above to bypass the Google prompt immediately!</li>
                </ol>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* SIGNED IN: REAL INBOX & EMAIL DETAIL */
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
          {/* Left Column: Folders & List */}
          <div className="lg:col-span-5 border-r border-zinc-800/80 flex flex-col overflow-hidden">
            {/* Search & Tabs */}
            <div className="p-3 border-b border-zinc-800/60 space-y-2">
              <div className="flex items-center gap-1 bg-zinc-900 p-1 rounded-xl text-xs font-bold">
                <button
                  onClick={() => setSelectedFolder("inbox")}
                  className={`flex-1 py-1 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    selectedFolder === "inbox" ? "bg-rose-600 text-white shadow-sm" : "text-slate-400 hover:text-white"
                  }`}
                >
                  <Inbox className="w-3.5 h-3.5" />
                  Inbox
                </button>
                <button
                  onClick={() => setSelectedFolder("sent")}
                  className={`flex-1 py-1 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    selectedFolder === "sent" ? "bg-rose-600 text-white shadow-sm" : "text-slate-400 hover:text-white"
                  }`}
                >
                  <SendHorizontal className="w-3.5 h-3.5" />
                  Sent
                </button>
              </div>

              <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search real Gmail messages..."
                    className="w-full py-1.5 pl-7 pr-2 text-xs rounded-xl bg-zinc-900 border border-zinc-800 text-white placeholder-zinc-500 focus:outline-none focus:border-rose-500"
                  />
                  <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2 top-2.5" />
                </div>

                <button
                  type="submit"
                  disabled={isLoadingEmails}
                  className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-bold text-white border border-zinc-700 cursor-pointer"
                >
                  Search
                </button>

                <button
                  type="button"
                  onClick={() => setOnlyAttachmentsFilter(prev => !prev)}
                  className={`p-1.5 rounded-xl border text-xs font-bold cursor-pointer transition-all ${
                    onlyAttachmentsFilter ? "bg-rose-500/20 text-rose-400 border-rose-500/30" : "bg-zinc-900 text-slate-400 border-zinc-800"
                  }`}
                  title="Filter messages with attachments"
                >
                  <Paperclip className="w-4 h-4" />
                </button>
              </form>
            </div>

            {/* Email Message List */}
            <div className="flex-1 overflow-y-auto divide-y divide-zinc-800/40 custom-scrollbar">
              {isLoadingEmails ? (
                <div className="p-8 text-center text-xs text-slate-400 space-y-2 flex flex-col items-center">
                  <RefreshCw className="w-6 h-6 animate-spin text-rose-500" />
                  <p>Fetching real messages from Gmail API...</p>
                </div>
              ) : filteredEmails.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-500 space-y-1">
                  <Mail className="w-8 h-8 mx-auto opacity-30" />
                  <p className="font-semibold text-slate-400">No emails found</p>
                  <p className="text-[11px]">Your Gmail inbox query returned no messages.</p>
                </div>
              ) : (
                filteredEmails.map((email) => {
                  const isSelected = selectedEmail?.id === email.id;
                  return (
                    <div
                      key={email.id}
                      onClick={() => setSelectedEmail(email)}
                      className={`p-3.5 cursor-pointer transition-all space-y-1 ${
                        isSelected ? "bg-rose-600/15 border-l-4 border-rose-500" : "hover:bg-zinc-800/40"
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs font-bold">
                        <span className="text-slate-200 truncate max-w-[200px]">
                          {email.from}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono shrink-0">{email.date}</span>
                      </div>

                      <div className="text-xs font-semibold text-white truncate">{email.subject}</div>
                      <div className="text-[11px] text-slate-400 line-clamp-1">{email.snippet}</div>

                      {email.attachments && email.attachments.length > 0 && (
                        <div className="pt-1 flex items-center gap-1.5">
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center gap-1">
                            <Paperclip className="w-3 h-3" />
                            {email.attachments.length} Attachment(s)
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Right Column: Email Detail & Attachments */}
          <div className="lg:col-span-7 flex flex-col h-full overflow-hidden bg-zinc-950/60 p-5 space-y-4">
            {selectedEmail ? (
              <>
                {/* Email Header Info */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800 pb-3">
                  <div className="space-y-0.5 min-w-0">
                    <h3 className="text-base font-bold text-white break-words">{selectedEmail.subject}</h3>
                    <div className="text-xs text-slate-400 truncate">
                      From: <span className="text-rose-400 font-semibold">{selectedEmail.from}</span>
                    </div>
                    {selectedEmail.to && (
                      <div className="text-[11px] text-slate-500 truncate">
                        To: {selectedEmail.to}
                      </div>
                    )}
                  </div>

                  <button
                    onClick={handleGenerateAIReply}
                    disabled={aiReplying}
                    className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md cursor-pointer disabled:opacity-50 shrink-0"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    {aiReplying ? "Drafting Reply..." : "AI Smart Reply"}
                  </button>
                </div>

                {/* Email Body Content */}
                <div className="flex-1 overflow-y-auto p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800 text-xs leading-relaxed text-slate-200 font-sans custom-scrollbar">
                  {selectedEmail.isHtml ? (
                    <div
                      className="prose prose-invert max-w-none text-xs"
                      dangerouslySetInnerHTML={{ __html: sanitizeHtml(selectedEmail.body) }}
                    />
                  ) : (
                    <p className="whitespace-pre-wrap">{selectedEmail.body}</p>
                  )}
                </div>

                {/* Real Attachments Download Section */}
                {selectedEmail.attachments && selectedEmail.attachments.length > 0 && (
                  <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-rose-400 flex items-center gap-1.5">
                        <Paperclip className="w-4 h-4" />
                        Gmail Attachments ({selectedEmail.attachments.length})
                      </span>
                      <span className="text-[10px] text-slate-400">Downloads actual file via Gmail API</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {selectedEmail.attachments.map((att) => (
                        <div
                          key={att.id}
                          className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-between gap-2"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            {att.mimeType.startsWith("image/") ? (
                              <ImageIcon className="w-4 h-4 text-emerald-400 shrink-0" />
                            ) : att.mimeType.includes("json") || att.mimeType.includes("javascript") || att.mimeType.includes("code") ? (
                              <File className="w-4 h-4 text-amber-400 shrink-0" />
                            ) : (
                              <FileText className="w-4 h-4 text-rose-400 shrink-0" />
                            )}
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-white truncate">{att.filename}</p>
                              <p className="text-[10px] font-mono text-slate-400">
                                {att.size ? `${Math.round(att.size / 1024)} KB` : "File"}
                              </p>
                            </div>
                          </div>

                          <button
                            onClick={() => handleDownloadAttachment(att)}
                            disabled={downloadingAttId === att.id}
                            className="p-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white cursor-pointer shadow-sm disabled:opacity-50 flex items-center gap-1 text-xs font-bold shrink-0"
                            title="Download real file from Gmail"
                          >
                            <Download className={`w-3.5 h-3.5 ${downloadingAttId === att.id ? "animate-bounce" : ""}`} />
                            <span className="hidden sm:inline">
                              {downloadingAttId === att.id ? "Fetching..." : "Download"}
                            </span>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-500 space-y-2">
                <Mail className="w-12 h-12 opacity-30" />
                <p className="text-xs">Select an email to view real message contents & attachments</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* COMPOSE EMAIL MODAL */}
      {isComposing && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-xl rounded-2xl bg-zinc-900 border border-zinc-800 text-white p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="text-sm font-bold flex items-center gap-2 text-rose-400">
                <Send className="w-4 h-4" /> Compose Gmail Message
              </h3>
              <button
                onClick={() => setIsComposing(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {sendStatus && (
              <div className={`p-3 rounded-xl text-xs font-bold flex items-center gap-2 ${
                sendStatus.type === "success" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
              }`}>
                {sendStatus.type === "success" ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                <span>{sendStatus.message}</span>
              </div>
            )}

            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-400">To:</label>
                <input
                  type="email"
                  value={composeTo}
                  onChange={(e) => setComposeTo(e.target.value)}
                  placeholder="recipient@example.com"
                  className="w-full mt-1 p-2.5 text-xs rounded-xl bg-zinc-950 border border-zinc-800 text-white focus:outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-400">Subject:</label>
                <input
                  type="text"
                  value={composeSubject}
                  onChange={(e) => setComposeSubject(e.target.value)}
                  placeholder="Email subject..."
                  className="w-full mt-1 p-2.5 text-xs rounded-xl bg-zinc-950 border border-zinc-800 text-white focus:outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-400">Message Body:</label>
                <textarea
                  value={composeBody}
                  onChange={(e) => setComposeBody(e.target.value)}
                  rows={6}
                  placeholder="Write your email body..."
                  className="w-full mt-1 p-2.5 text-xs rounded-xl bg-zinc-950 border border-zinc-800 text-white focus:outline-none focus:border-rose-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-[10px] text-slate-500 font-mono">
                Sent directly via Google Gmail API
              </span>

              <button
                onClick={handleSendEmail}
                disabled={isSending}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-md"
              >
                <Send className={`w-4 h-4 ${isSending ? "animate-pulse" : ""}`} />
                <span>{isSending ? "Sending..." : "Send Email"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
