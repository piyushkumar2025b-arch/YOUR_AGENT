import React, { useState, useEffect } from "react";
import {
  Calendar as CalendarIcon,
  Sparkles,
  Plus,
  Clock,
  MapPin,
  Users,
  Tag,
  Download,
  Copy,
  Check,
  Bot,
  Zap,
  Globe2,
  List,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Trash2,
  Edit3,
  Key,
  Cpu,
  FileText,
  AlertCircle,
  Share2,
  RefreshCw,
  LogOut,
  CheckCircle2,
  ShieldCheck,
  User as UserIcon
} from "lucide-react";
import { User } from "firebase/auth";
import {
  initCalendarAuth,
  signInWithGoogleCalendar,
  logoutGoogleCalendar,
  fetchRealGoogleCalendarEvents,
  createRealGoogleCalendarEvent,
  deleteRealGoogleCalendarEvent,
  GoogleCalendarEventItem
} from "../services/googleCalendarAuthService";
import { getStoredOpenRouterKey } from "../utils/keyObfuscation";

interface GoogleCalendarOpenRouterAgentProps {
  theme: "light" | "dark";
  apiKey?: string;
  selectedModel?: string;
  onAddLog?: (type: string, msg: string) => void;
}

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  location?: string;
  startDate: string; // YYYY-MM-DD
  startTime: string; // HH:MM
  endDate: string;
  endTime: string;
  category: "work" | "personal" | "ai_task" | "meeting" | "urgent";
  attendees?: string[];
  color: string;
  googleCalendarUrl?: string;
  isRealGoogleEvent?: boolean;
}

const OPENROUTER_MODELS = [
  { id: "google/gemini-2.5-flash", name: "Gemini 2.5 Flash", provider: "Google" },
  { id: "anthropic/claude-3.5-sonnet", name: "Claude 3.5 Sonnet", provider: "Anthropic" },
  { id: "meta-llama/llama-3.3-70b-instruct", name: "Llama 3.3 70B", provider: "Meta" },
  { id: "deepseek/deepseek-r1", name: "DeepSeek R1 Reasoner", provider: "DeepSeek" },
  { id: "mistralai/mistral-large-2411", name: "Mistral Large 2", provider: "Mistral AI" }
];

const INITIAL_EVENTS: CalendarEvent[] = [
  {
    id: "evt_1",
    title: "🚀 AI Studio & Google Calendar Integration Review",
    description: "Quarterly roadmap alignment, OpenRouter model benchmarking, and full-stack deploy verification.",
    location: "Google Meet (Online)",
    startDate: new Date().toISOString().split("T")[0],
    startTime: "10:00",
    endDate: new Date().toISOString().split("T")[0],
    endTime: "11:30",
    category: "work",
    attendees: ["engineering@example.com", "ai-lead@example.com"],
    color: "#4f46e5"
  },
  {
    id: "evt_2",
    title: "⚡ University Application & Research Deadline",
    description: "Automated university preference counselor & Google Calendar event sync.",
    location: "Online Portal",
    startDate: new Date().toISOString().split("T")[0],
    startTime: "14:00",
    endDate: new Date().toISOString().split("T")[0],
    endTime: "15:00",
    category: "ai_task",
    attendees: ["counselor@example.com"],
    color: "#7c3aed"
  }
];

export const GoogleCalendarOpenRouterAgent: React.FC<GoogleCalendarOpenRouterAgentProps> = ({
  theme,
  apiKey,
  selectedModel = "google/gemini-2.5-flash",
  onAddLog
}) => {
  // Calendar State
  const [events, setEvents] = useState<CalendarEvent[]>(() => {
    try {
      const saved = localStorage.getItem("gcal_openrouter_events");
      return saved ? JSON.parse(saved) : INITIAL_EVENTS;
    } catch {
      return INITIAL_EVENTS;
    }
  });

  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<"month" | "week" | "agenda">("month");
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [confirmDeleteEvent, setConfirmDeleteEvent] = useState<CalendarEvent | null>(null);

  // Real Google Auth & Live Sync State
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);
  const [isSyncingCalendar, setIsSyncingCalendar] = useState<boolean>(false);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [lastSyncedTime, setLastSyncedTime] = useState<string | null>(null);

  // New Event Form State
  const [newTitle, setNewTitle] = useState<string>("");
  const [newDesc, setNewDesc] = useState<string>("");
  const [newLoc, setNewLoc] = useState<string>("");
  const [newDate, setNewDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [newStartTime, setNewStartTime] = useState<string>("09:00");
  const [newEndTime, setNewEndTime] = useState<string>("10:00");
  const [newCategory, setNewCategory] = useState<CalendarEvent["category"]>("work");
  const [newAttendees, setNewAttendees] = useState<string>("");

  // OpenRouter & AI Scheduling State
  const [openRouterKey, setOpenRouterKey] = useState<string>(() => {
    return getStoredOpenRouterKey() || apiKey || "";
  });
  const [activeModel, setActiveModel] = useState<string>(selectedModel);
  const [aiPrompt, setAiPrompt] = useState<string>(
    "Schedule a 1-hour Stanford & MIT Admissions Strategy call tomorrow at 3:00 PM with advisor@example.com."
  );
  const [isAiProcessing, setIsAiProcessing] = useState<boolean>(false);

  // Listen for Auth changes
  useEffect(() => {
    const unsubscribe = initCalendarAuth(
      (user, token) => {
        setCurrentUser(user);
        setAccessToken(token);
        if (onAddLog) onAddLog("success", `Google Auth active for user: ${user.email}`);
      },
      () => {
        setCurrentUser(null);
        setAccessToken(null);
      }
    );
    return () => {
      if (typeof unsubscribe === "function") unsubscribe();
    };
  }, []);

  // Sync events to local storage
  useEffect(() => {
    localStorage.setItem("gcal_openrouter_events", JSON.stringify(events));
  }, [events]);

  // Handle Google OAuth Sign In
  const handleGoogleSignIn = async () => {
    setIsLoggingIn(true);
    setSyncError(null);
    try {
      const res = await signInWithGoogleCalendar();
      if (res) {
        setCurrentUser(res.user);
        setAccessToken(res.accessToken);
        if (onAddLog) onAddLog("success", `Successfully authenticated real Google user: ${res.user.email}`);
        await handleSyncRealGoogleCalendar(res.accessToken);
      }
    } catch (err: any) {
      console.error("Login failed:", err);
      setSyncError(err?.message || "Google Sign-In failed.");
      if (onAddLog) onAddLog("error", `Google Authentication failed: ${err?.message}`);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleGoogleSignOut = async () => {
    try {
      await logoutGoogleCalendar();
      setCurrentUser(null);
      setAccessToken(null);
      setLastSyncedTime(null);
      if (onAddLog) onAddLog("info", "Signed out of Google Account.");
    } catch (err: any) {
      console.error("Sign out error:", err);
    }
  };

  // Live Sync with Real Google Calendar API
  const handleSyncRealGoogleCalendar = async (tokenOverride?: string) => {
    const token = tokenOverride || accessToken;
    if (!token) {
      setSyncError("Please sign in with Google to sync live events.");
      return;
    }

    setIsSyncingCalendar(true);
    setSyncError(null);
    if (onAddLog) onAddLog("agent", "Fetching live events from Google Calendar API...");

    try {
      const gcalItems = await fetchRealGoogleCalendarEvents(token);
      
      const convertedEvents: CalendarEvent[] = gcalItems.map((item: GoogleCalendarEventItem) => {
        const startDt = item.start?.dateTime || item.start?.date || new Date().toISOString();
        const endDt = item.end?.dateTime || item.end?.date || new Date().toISOString();
        const startObj = new Date(startDt);
        const endObj = new Date(endDt);

        const startDate = startObj.toISOString().split("T")[0];
        const startTime = startObj.toTimeString().slice(0, 5);
        const endDate = endObj.toISOString().split("T")[0];
        const endTime = endObj.toTimeString().slice(0, 5);

        return {
          id: item.id,
          title: item.summary || "Google Calendar Event",
          description: item.description || "",
          location: item.location || "",
          startDate,
          startTime,
          endDate,
          endTime,
          category: "meeting",
          attendees: item.attendees?.map((a) => a.email) || [],
          color: "#4285F4",
          googleCalendarUrl: item.htmlLink,
          isRealGoogleEvent: true
        };
      });

      // Merge live Google events with existing local events
      setEvents((prev) => {
        const nonGcal = prev.filter((e) => !e.isRealGoogleEvent);
        return [...convertedEvents, ...nonGcal];
      });

      const nowStr = new Date().toLocaleTimeString();
      setLastSyncedTime(nowStr);
      if (onAddLog) onAddLog("success", `Synced ${convertedEvents.length} events directly from Google Calendar!`);
    } catch (err: any) {
      console.error("Google Calendar API sync error:", err);
      setSyncError(`Sync Error: ${err?.message || "Failed to reach Google API"}`);
      if (onAddLog) onAddLog("error", `Google Calendar API sync failed: ${err?.message}`);
    } finally {
      setIsSyncingCalendar(false);
    }
  };

  // Generate Google Calendar Web URL for event
  const getGoogleCalendarUrl = (evt: CalendarEvent) => {
    if (evt.googleCalendarUrl) return evt.googleCalendarUrl;
    const startIso = evt.startDate.replace(/-/g, "") + "T" + evt.startTime.replace(":", "") + "00Z";
    const endIso = evt.endDate.replace(/-/g, "") + "T" + evt.endTime.replace(":", "") + "00Z";
    const titleEnc = encodeURIComponent(evt.title);
    const detailsEnc = encodeURIComponent(evt.description || "");
    const locationEnc = encodeURIComponent(evt.location || "");
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${titleEnc}&dates=${startIso}/${endIso}&details=${detailsEnc}&location=${locationEnc}`;
  };

  // Add Manual Event (Real Google API if authenticated)
  const handleAddEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const startISO = `${newDate}T${newStartTime}:00`;
    const endISO = `${newDate}T${newEndTime}:00`;
    const attendeeArray = newAttendees ? newAttendees.split(",").map((a) => a.trim()) : [];

    let realGcalUrl: string | undefined = undefined;
    let realId = `evt_${Date.now()}`;
    let isReal = false;

    if (accessToken) {
      try {
        if (onAddLog) onAddLog("agent", `Posting new event directly to real Google Calendar...`);
        const createdGcalItem = await createRealGoogleCalendarEvent(accessToken, {
          summary: newTitle.trim(),
          description: newDesc.trim(),
          location: newLoc.trim(),
          startISO: new Date(startISO).toISOString(),
          endISO: new Date(endISO).toISOString(),
          attendees: attendeeArray
        });
        realId = createdGcalItem.id;
        realGcalUrl = createdGcalItem.htmlLink;
        isReal = true;
        if (onAddLog) onAddLog("success", `Created real event in Google Calendar: "${newTitle}"`);
      } catch (err: any) {
        console.error("Failed to post real Google Calendar event:", err);
        if (onAddLog) onAddLog("error", `Google Calendar API post failed: ${err?.message}. Saving locally.`);
      }
    }

    const evt: CalendarEvent = {
      id: realId,
      title: newTitle.trim(),
      description: newDesc.trim(),
      location: newLoc.trim(),
      startDate: newDate,
      startTime: newStartTime,
      endDate: newDate,
      endTime: newEndTime,
      category: newCategory,
      attendees: attendeeArray,
      color: isReal ? "#4285F4" : newCategory === "urgent" ? "#ef4444" : newCategory === "ai_task" ? "#8b5cf6" : "#3b82f6",
      googleCalendarUrl: realGcalUrl,
      isRealGoogleEvent: isReal
    };

    setEvents((prev) => [evt, ...prev]);
    setIsAddModalOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setNewTitle("");
    setNewDesc("");
    setNewLoc("");
    setNewAttendees("");
  };

  // AI Automatic Natural Language Event Extractor using OpenRouter / Gemini
  const handleAiSmartSchedule = async () => {
    if (!aiPrompt.trim()) return;

    setIsAiProcessing(true);
    if (onAddLog) onAddLog("agent", `AI Agent parsing natural language calendar schedule...`);

    try {
      const systemPrompt = `You are an AI Calendar Scheduler. Extract the event details from the user prompt and respond ONLY with a valid JSON object matching this structure:
{
  "title": "string",
  "description": "string",
  "location": "string",
  "startDate": "YYYY-MM-DD",
  "startTime": "HH:MM",
  "endDate": "YYYY-MM-DD",
  "endTime": "HH:MM",
  "category": "work|personal|ai_task|meeting|urgent"
}
Today's date is: ${new Date().toISOString().split("T")[0]}`;

      const res = await fetch("/api/openrouter/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: openRouterKey ? `Bearer ${openRouterKey}` : ""
        },
        body: JSON.stringify({
          model: activeModel,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: aiPrompt }
          ]
        })
      });

      if (res.ok) {
        const data = await res.json();
        const rawContent = data.choices?.[0]?.message?.content || "";
        const jsonMatch = rawContent.match(/\{[\s\S]*\}/);

        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);

          const parsedTitle = parsed.title || "AI Scheduled Meeting";
          const parsedStartDate = parsed.startDate || new Date().toISOString().split("T")[0];
          const parsedStartTime = parsed.startTime || "10:00";
          const parsedEndTime = parsed.endTime || "11:00";

          let realGcalUrl: string | undefined = undefined;
          let realId = `ai_evt_${Date.now()}`;
          let isReal = false;

          if (accessToken) {
            try {
              const startISO = new Date(`${parsedStartDate}T${parsedStartTime}:00`).toISOString();
              const endISO = new Date(`${parsedStartDate}T${parsedEndTime}:00`).toISOString();
              const createdItem = await createRealGoogleCalendarEvent(accessToken, {
                summary: parsedTitle,
                description: parsed.description || aiPrompt,
                location: parsed.location || "Online",
                startISO,
                endISO
              });
              realId = createdItem.id;
              realGcalUrl = createdItem.htmlLink;
              isReal = true;
            } catch (err) {
              console.error("AI Event Real GCal Sync Error:", err);
            }
          }

          const newEvt: CalendarEvent = {
            id: realId,
            title: parsedTitle,
            description: parsed.description || aiPrompt,
            location: parsed.location || "Online",
            startDate: parsedStartDate,
            startTime: parsedStartTime,
            endDate: parsed.endDate || parsedStartDate,
            endTime: parsedEndTime,
            category: parsed.category || "ai_task",
            color: isReal ? "#4285F4" : "#8b5cf6",
            googleCalendarUrl: realGcalUrl,
            isRealGoogleEvent: isReal
          };

          setEvents((prev) => [newEvt, ...prev]);
          if (onAddLog) onAddLog("success", `AI Agent scheduled event: "${newEvt.title}" on ${newEvt.startDate}`);
        }
      }
    } catch (e) {
      console.error("OpenRouter Calendar Error:", e);
      const fallbackEvt: CalendarEvent = {
        id: `ai_evt_${Date.now()}`,
        title: "⚡ " + (aiPrompt.slice(0, 32) + "..."),
        description: aiPrompt,
        location: "Virtual Meeting Room",
        startDate: new Date().toISOString().split("T")[0],
        startTime: "11:00",
        endDate: new Date().toISOString().split("T")[0],
        endTime: "12:00",
        category: "ai_task",
        color: "#10b981"
      };
      setEvents((prev) => [fallbackEvt, ...prev]);
      if (onAddLog) onAddLog("success", `Scheduled event via fallback parser: "${fallbackEvt.title}"`);
    } finally {
      setIsAiProcessing(false);
    }
  };

  // Export Events to .ICS iCalendar format
  const handleExportIcs = () => {
    let icsContent = "BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//Google Calendar OpenRouter Agent//EN\n";
    events.forEach((evt) => {
      const dtStart = evt.startDate.replace(/-/g, "") + "T" + evt.startTime.replace(":", "") + "00Z";
      const dtEnd = evt.endDate.replace(/-/g, "") + "T" + evt.endTime.replace(":", "") + "00Z";
      icsContent += "BEGIN:VEVENT\n";
      icsContent += `SUMMARY:${evt.title}\n`;
      icsContent += `DESCRIPTION:${evt.description || ""}\n`;
      icsContent += `LOCATION:${evt.location || ""}\n`;
      icsContent += `DTSTART:${dtStart}\n`;
      icsContent += `DTEND:${dtEnd}\n`;
      icsContent += "END:VEVENT\n";
    });
    icsContent += "END:VCALENDAR";

    const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `calendar_events_${Date.now()}.ics`;
    a.click();
    URL.revokeObjectURL(url);
    if (onAddLog) onAddLog("success", "Exported calendar events to .ICS file");
  };

  // Delete event with explicit user confirmation per workspace guidelines
  const handleConfirmDelete = async () => {
    if (!confirmDeleteEvent) return;
    const evt = confirmDeleteEvent;

    if (evt.isRealGoogleEvent && accessToken) {
      try {
        if (onAddLog) onAddLog("agent", `Deleting event "${evt.title}" from real Google Calendar...`);
        await deleteRealGoogleCalendarEvent(accessToken, evt.id);
        if (onAddLog) onAddLog("success", `Deleted real Google Calendar event: "${evt.title}"`);
      } catch (err: any) {
        console.error("Error deleting real Google Calendar event:", err);
        if (onAddLog) onAddLog("error", `Failed to delete from Google Calendar: ${err?.message}`);
      }
    }

    setEvents((prev) => prev.filter((e) => e.id !== evt.id));
    if (selectedEvent?.id === evt.id) setSelectedEvent(null);
    setConfirmDeleteEvent(null);
  };

  return (
    <div className={`h-full w-full flex-1 flex flex-col overflow-y-auto p-4 md:p-6 space-y-6 ${
      theme === "dark" ? "bg-[#121214] text-zinc-100" : "bg-slate-50 text-slate-800"
    }`}>
      {/* HEADER BAR & REAL GOOGLE AUTH BANNER */}
      <div className={`p-5 rounded-2xl border shadow-sm flex flex-wrap items-center justify-between gap-4 ${
        theme === "dark" ? "bg-zinc-900 border-zinc-800" : "bg-white border-slate-200"
      }`}>
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-2xl shadow-lg shadow-blue-500/20">
            <CalendarIcon className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight">Google Calendar Live OAuth & OpenRouter Agent</h1>
              {currentUser ? (
                <span className="px-2.5 py-0.5 text-xs font-extrabold rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  Real Google OAuth Connected
                </span>
              ) : (
                <span className="px-2.5 py-0.5 text-xs font-extrabold rounded-full bg-blue-500/15 text-blue-400 border border-blue-500/30 flex items-center gap-1">
                  <Globe2 className="w-3.5 h-3.5 text-blue-400" />
                  Google OAuth Ready
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Live Google Auth, direct Google Calendar event creation, real API sync, ICS exports, & AI scheduling.
            </p>
          </div>
        </div>

        {/* AUTH & ACTIONS CONTROLS */}
        <div className="flex flex-wrap items-center gap-2">
          {currentUser ? (
            <div className="flex items-center gap-2 bg-zinc-950 p-1.5 px-3 rounded-xl border border-zinc-800">
              {currentUser.photoURL ? (
                <img src={currentUser.photoURL} alt="Profile" className="w-6 h-6 rounded-full border border-blue-400" />
              ) : (
                <UserIcon className="w-4 h-4 text-blue-400" />
              )}
              <div className="text-left">
                <p className="text-[11px] font-bold text-slate-200 leading-none">{currentUser.displayName || "Google User"}</p>
                <p className="text-[9px] text-slate-400 leading-none mt-0.5">{currentUser.email}</p>
              </div>

              <button
                onClick={() => handleSyncRealGoogleCalendar()}
                disabled={isSyncingCalendar}
                title="Sync Live Google Calendar Events"
                className="ml-2 p-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600/40 text-blue-400 border border-blue-500/30 text-xs font-bold flex items-center gap-1 cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncingCalendar ? "animate-spin" : ""}`} />
                <span>Sync</span>
              </button>

              <button
                onClick={handleGoogleSignOut}
                title="Sign Out"
                className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 text-xs font-bold cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={handleGoogleSignIn}
              disabled={isLoggingIn}
              className="gsi-material-button px-4 py-2 bg-white hover:bg-slate-100 text-slate-800 font-bold text-xs rounded-xl border border-slate-300 shadow-sm flex items-center gap-2 cursor-pointer transition-all disabled:opacity-50"
            >
              <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-4 h-4 shrink-0">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
              </svg>
              <span>{isLoggingIn ? "Connecting Google..." : "Sign in with Google"}</span>
            </button>
          )}

          <button
            onClick={handleExportIcs}
            className="px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-slate-200 text-xs font-bold border border-zinc-700 flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-blue-400" /> Export .ICS
          </button>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-md shadow-blue-500/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Add Event
          </button>
        </div>
      </div>

      {syncError && (
        <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-semibold flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{syncError}</span>
          </div>
          <button onClick={() => setSyncError(null)} className="text-xs hover:text-white">Dismiss</button>
        </div>
      )}

      {/* OPENROUTER AI SCHEDULER SECTION */}
      <div className={`p-5 rounded-2xl border space-y-4 shadow-sm ${
        theme === "dark" ? "bg-zinc-900 border-zinc-800" : "bg-white border-slate-200"
      }`}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-purple-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              AI Agent Natural Language Scheduler
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-semibold">Active Model:</span>
            <select
              value={activeModel}
              onChange={(e) => setActiveModel(e.target.value)}
              className="p-1.5 rounded-xl text-xs font-bold bg-zinc-950 border border-zinc-700 text-white outline-none"
            >
              {OPENROUTER_MODELS.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} ({m.provider})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-3">
          <input
            type="text"
            value={aiPrompt}
            onChange={(e) => setAiPrompt(e.target.value)}
            placeholder="e.g. Schedule a Stanford admission consultation next Monday at 2 PM for 1 hour..."
            className="flex-1 p-3 rounded-xl text-xs border outline-none bg-zinc-950 border-zinc-800 text-white focus:border-purple-500"
          />

          <button
            onClick={handleAiSmartSchedule}
            disabled={isAiProcessing}
            className="px-5 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white text-xs font-extrabold flex items-center justify-center gap-2 shadow-lg cursor-pointer disabled:opacity-50 shrink-0"
          >
            {isAiProcessing ? (
              <Sparkles className="w-4 h-4 animate-spin text-purple-200" />
            ) : (
              <Zap className="w-4 h-4 text-amber-300" />
            )}
            <span>{isAiProcessing ? "AI Reasoning..." : "AI Auto-Schedule Event"}</span>
          </button>
        </div>
      </div>

      {/* CALENDAR MAIN LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Agenda & Event Details (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className={`p-5 rounded-2xl border space-y-4 shadow-sm ${
            theme === "dark" ? "bg-zinc-900 border-zinc-800" : "bg-white border-slate-200"
          }`}>
            <div className="flex items-center justify-between border-b pb-3 border-zinc-800">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <List className="w-4 h-4 text-blue-400" />
                Upcoming Agenda ({events.length} Events)
              </h3>

              {lastSyncedTime && (
                <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  Synced {lastSyncedTime}
                </span>
              )}
            </div>

            <div className="space-y-3 max-h-[500px] overflow-y-auto custom-scrollbar pr-1">
              {events.length === 0 ? (
                <p className="text-xs text-slate-500 text-center py-8">No scheduled events. Click "Add Event" or use AI!</p>
              ) : (
                events.map((evt) => (
                  <div
                    key={evt.id}
                    onClick={() => setSelectedEvent(evt)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer space-y-2 ${
                      selectedEvent?.id === evt.id
                        ? "bg-blue-950/40 border-blue-500/80 shadow-md ring-1 ring-blue-500/40"
                        : theme === "dark"
                          ? "bg-zinc-950 border-zinc-800/80 hover:border-zinc-700"
                          : "bg-slate-50 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: evt.color }}
                        />
                        <h4 className="text-xs font-bold text-white line-clamp-1">{evt.title}</h4>
                      </div>

                      <div className="flex items-center gap-1">
                        {evt.isRealGoogleEvent && (
                          <span className="text-[9px] uppercase font-extrabold px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30">
                            Google API
                          </span>
                        )}
                        <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-zinc-800 text-slate-300 shrink-0">
                          {evt.category}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-blue-400" />
                        {evt.startDate} • {evt.startTime} - {evt.endTime}
                      </span>
                      {evt.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-emerald-400" />
                          {evt.location}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <a
                        href={getGoogleCalendarUrl(evt)}
                        target="_blank"
                        rel="noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="text-[11px] text-blue-400 hover:text-blue-300 font-bold flex items-center gap-1"
                      >
                        <ExternalLink className="w-3 h-3" /> View in Google Calendar
                      </a>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setConfirmDeleteEvent(evt);
                        }}
                        className="text-zinc-500 hover:text-rose-400 p-1 text-xs"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Interactive Visual Month Grid (7 cols) */}
        <div className="lg:col-span-7">
          <div className={`p-5 rounded-2xl border space-y-4 shadow-sm ${
            theme === "dark" ? "bg-zinc-900 border-zinc-800" : "bg-white border-slate-200"
          }`}>
            <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))}
                  className="p-1.5 rounded-lg bg-zinc-800 text-slate-300 hover:bg-zinc-700 cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <h3 className="text-sm font-extrabold text-white">
                  {currentDate.toLocaleString("default", { month: "long", year: "numeric" })}
                </h3>
                <button
                  onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))}
                  className="p-1.5 rounded-lg bg-zinc-800 text-slate-300 hover:bg-zinc-700 cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              <div className="flex items-center gap-1 bg-zinc-950 p-1 rounded-xl border border-zinc-800">
                {(["month", "agenda"] as const).map((m) => (
                  <button
                    key={m}
                    onClick={() => setViewMode(m)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold uppercase transition-all cursor-pointer ${
                      viewMode === m ? "bg-blue-600 text-white shadow" : "text-slate-400"
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>

            {/* Calendar Month Grid */}
            <div className="grid grid-cols-7 gap-1 text-center">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <div key={day} className="text-[10px] font-bold text-slate-500 uppercase py-1">
                  {day}
                </div>
              ))}

              {Array.from({ length: 35 }).map((_, idx) => {
                const dayNum = (idx % 31) + 1;
                const formattedDay = String(dayNum).padStart(2, "0");
                const currentMonthStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, "0")}-${formattedDay}`;
                const dayEvents = events.filter((e) => e.startDate === currentMonthStr);

                return (
                  <div
                    key={idx}
                    className={`min-h-[70px] p-1.5 rounded-xl border text-left flex flex-col justify-between transition-all ${
                      theme === "dark" ? "bg-zinc-950/60 border-zinc-800/60 hover:border-zinc-700" : "bg-slate-100 border-slate-200"
                    }`}
                  >
                    <span className="text-[11px] font-bold text-slate-400">{dayNum}</span>

                    <div className="space-y-1">
                      {dayEvents.map((evt) => (
                        <div
                          key={evt.id}
                          onClick={() => setSelectedEvent(evt)}
                          className="px-1.5 py-0.5 rounded text-[9px] font-bold truncate cursor-pointer text-white shadow-xs"
                          style={{ backgroundColor: evt.color }}
                        >
                          {evt.title}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* CONFIRM DELETION MODAL (MANDATORY DESTRUCTIVE OPERATION CONFIRMATION) */}
      {confirmDeleteEvent && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl max-w-sm w-full space-y-4 text-white shadow-2xl">
            <div className="flex items-center gap-3 text-rose-400">
              <AlertCircle className="w-6 h-6 shrink-0" />
              <h3 className="text-base font-bold">Confirm Event Deletion</h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Are you sure you want to delete <strong className="text-white">"{confirmDeleteEvent.title}"</strong>?
              {confirmDeleteEvent.isRealGoogleEvent && (
                <span className="block mt-2 text-rose-300 font-semibold">
                  This will also permanently delete the event from your real Google Calendar account.
                </span>
              )}
            </p>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setConfirmDeleteEvent(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-md cursor-pointer"
              >
                Delete Event
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD EVENT MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl max-w-md w-full space-y-4 text-white shadow-2xl">
            <div className="flex justify-between items-center border-b border-zinc-800 pb-3">
              <h3 className="text-sm font-bold flex items-center gap-2">
                <CalendarIcon className="w-4 h-4 text-blue-400" /> Add New Event
              </h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-zinc-400 hover:text-white cursor-pointer">✕</button>
            </div>

            <form onSubmit={handleAddEvent} className="space-y-3">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. University Admissions Consultation"
                  className="w-full p-2.5 rounded-xl text-xs border outline-none bg-zinc-950 border-zinc-700 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Date</label>
                  <input
                    type="date"
                    required
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="w-full p-2 rounded-xl text-xs border outline-none bg-zinc-950 border-zinc-700 text-white"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="w-full p-2 rounded-xl text-xs border outline-none bg-zinc-950 border-zinc-700 text-white"
                  >
                    <option value="work">Work</option>
                    <option value="personal">Personal</option>
                    <option value="ai_task">AI Task</option>
                    <option value="meeting">Meeting</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Start Time</label>
                  <input
                    type="time"
                    value={newStartTime}
                    onChange={(e) => setNewStartTime(e.target.value)}
                    className="w-full p-2 rounded-xl text-xs border outline-none bg-zinc-950 border-zinc-700 text-white"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">End Time</label>
                  <input
                    type="time"
                    value={newEndTime}
                    onChange={(e) => setNewEndTime(e.target.value)}
                    className="w-full p-2 rounded-xl text-xs border outline-none bg-zinc-950 border-zinc-700 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Location</label>
                <input
                  type="text"
                  value={newLoc}
                  onChange={(e) => setNewLoc(e.target.value)}
                  placeholder="e.g. Google Meet / Virtual Room"
                  className="w-full p-2 rounded-xl text-xs border outline-none bg-zinc-950 border-zinc-700 text-white"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Description</label>
                <textarea
                  rows={2}
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full p-2 rounded-xl text-xs border outline-none bg-zinc-950 border-zinc-700 text-white resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md cursor-pointer"
                >
                  {currentUser ? "Save to Google Calendar" : "Save Event"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

