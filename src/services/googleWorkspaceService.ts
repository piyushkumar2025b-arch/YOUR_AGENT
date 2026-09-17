/**
 * Google Workspace & Multimodal Services Integration
 * High-performance, zero-overhead client for Google Sheets, Google Docs,
 * Google Tasks, Gemini Vision, and Native Speech Synthesis.
 */

import { auth } from "./firebaseConfig";
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { VirtualFile } from "../types";

export interface ExtractedTodo {
  id: string;
  filePath: string;
  line: number;
  text: string;
  type: "TODO" | "FIXME" | "BUG";
}

export interface ExportResult {
  success: boolean;
  type: "google_api" | "fallback_download" | "clipboard";
  url?: string;
  message: string;
  itemsCount?: number;
}

// In-memory token cache to prevent redundant auth popups
let cachedWorkspaceToken: string | null = null;

/**
 * Requests OAuth access token with Google Workspace scopes
 */
export async function getGoogleWorkspaceAccessToken(): Promise<string | null> {
  if (cachedWorkspaceToken) return cachedWorkspaceToken;

  try {
    const provider = new GoogleAuthProvider();
    provider.addScope("https://www.googleapis.com/auth/spreadsheets");
    provider.addScope("https://www.googleapis.com/auth/documents");
    provider.addScope("https://www.googleapis.com/auth/tasks");
    provider.addScope("https://www.googleapis.com/auth/drive.file");

    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (credential?.accessToken) {
      cachedWorkspaceToken = credential.accessToken;
      return cachedWorkspaceToken;
    }
  } catch (err: any) {
    console.warn("Google Workspace Sign-In skipped or closed:", err?.message || err);
  }
  return null;
}

/**
 * Triggers an instant download of CSV data as a zero-latency fallback
 */
export function downloadCsvFallback(filename: string, rows: (string | number)[][]): ExportResult {
  const csvContent = rows
    .map((row) =>
      row
        .map((val) => `"${String(val).replace(/"/g, '""')}"`)
        .join(",")
    )
    .join("\r\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", filename.endsWith(".csv") ? filename : `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  return {
    success: true,
    type: "fallback_download",
    message: `Downloaded local CSV export: ${filename}`,
    itemsCount: rows.length - 1
  };
}

/**
 * Triggers an instant download of text/markdown as a document fallback
 */
export function downloadDocFallback(filename: string, content: string): ExportResult {
  const blob = new Blob([content], { type: "text/markdown;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", filename.endsWith(".md") ? filename : `${filename}.md`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  return {
    success: true,
    type: "fallback_download",
    message: `Downloaded local Architecture Doc: ${filename}`,
    itemsCount: 1
  };
}

/**
 * Export Workspace File Inventory to Google Sheets
 */
export async function exportFilesToGoogleSheets(
  files: VirtualFile[],
  tokenOverride?: string
): Promise<ExportResult> {
  const rows: (string | number)[][] = [
    ["File Path", "File Name", "Size (Bytes)", "Lines of Code", "File Extension", "Last Modified"]
  ];

  const now = new Date().toLocaleString();
  files.forEach((f) => {
    const fileName = f.path.split("/").pop() || f.path;
    const lines = (f.content || "").split("\n").length;
    const bytes = new Blob([f.content || ""]).size;
    const ext = fileName.includes(".") ? fileName.split(".").pop() || "" : "file";
    rows.push([f.path, fileName, bytes, lines, ext, now]);
  });

  const token = tokenOverride || (await getGoogleWorkspaceAccessToken());

  if (!token) {
    return downloadCsvFallback(`workspace_inventory_${Date.now()}.csv`, rows);
  }

  try {
    // 1. Create a new Spreadsheet via Google Sheets API v4
    const createRes = await fetch("https://sheets.googleapis.com/v4/spreadsheets", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        properties: {
          title: `Project Workspace Inventory (${new Date().toLocaleDateString()})`
        },
        sheets: [
          {
            properties: {
              title: "Files Manifest",
              gridProperties: { rowCount: rows.length + 10, columnCount: 8 }
            }
          }
        ]
      })
    });

    if (!createRes.ok) {
      console.warn("Sheets API create failed, falling back to CSV download");
      return downloadCsvFallback(`workspace_inventory_${Date.now()}.csv`, rows);
    }

    const sheetData = await createRes.json();
    const spreadsheetId = sheetData.spreadsheetId;
    const spreadsheetUrl = sheetData.spreadsheetUrl;

    // 2. Append the rows
    await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Files Manifest!A1:append?valueInputOption=USER_ENTERED`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          values: rows
        })
      }
    );

    return {
      success: true,
      type: "google_api",
      url: spreadsheetUrl,
      message: "Spreadsheet created in Google Sheets!",
      itemsCount: files.length
    };
  } catch (err: any) {
    console.warn("Google Sheets API error, fallback to CSV:", err?.message);
    return downloadCsvFallback(`workspace_inventory_${Date.now()}.csv`, rows);
  }
}

/**
 * Export System API Benchmark Telemetry to Google Sheets
 */
export async function exportApiBenchmarksToSheets(
  endpoints: any[],
  tokenOverride?: string
): Promise<ExportResult> {
  const rows: (string | number)[][] = [
    ["API Name", "Category", "HTTP Method", "Status", "Status Code", "Latency (ms)", "Endpoint URL", "Tested At"]
  ];

  endpoints.forEach((ep) => {
    rows.push([
      ep.name || ep.id,
      ep.category || "service",
      ep.method || "GET",
      ep.status || "healthy",
      ep.statusCode || 200,
      ep.latencyMs || 0,
      ep.endpoint || "",
      ep.lastTested || new Date().toLocaleTimeString()
    ]);
  });

  const token = tokenOverride || (await getGoogleWorkspaceAccessToken());

  if (!token) {
    return downloadCsvFallback(`api_benchmark_telemetry_${Date.now()}.csv`, rows);
  }

  try {
    const createRes = await fetch("https://sheets.googleapis.com/v4/spreadsheets", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        properties: {
          title: `API Health & Performance Telemetry (${new Date().toLocaleDateString()})`
        }
      })
    });

    if (!createRes.ok) {
      return downloadCsvFallback(`api_benchmark_telemetry_${Date.now()}.csv`, rows);
    }

    const sheetData = await createRes.json();
    const spreadsheetId = sheetData.spreadsheetId;
    const spreadsheetUrl = sheetData.spreadsheetUrl;

    await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Sheet1!A1:append?valueInputOption=USER_ENTERED`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          values: rows
        })
      }
    );

    return {
      success: true,
      type: "google_api",
      url: spreadsheetUrl,
      message: "Telemetry exported to Google Sheets!",
      itemsCount: endpoints.length
    };
  } catch {
    return downloadCsvFallback(`api_benchmark_telemetry_${Date.now()}.csv`, rows);
  }
}

/**
 * Scans workspace files for inline TODO, FIXME, BUG tags
 */
export function extractWorkspaceTodos(files: VirtualFile[]): ExtractedTodo[] {
  const todos: ExtractedTodo[] = [];
  const todoRegex = /\b(TODO|FIXME|BUG)\b[:\s]*(.*)/i;

  files.forEach((file) => {
    if (!file.content) return;
    const lines = file.content.split("\n");
    lines.forEach((lineText, idx) => {
      const match = lineText.match(todoRegex);
      if (match) {
        const typeStr = match[1].toUpperCase();
        todos.push({
          id: `${file.path}:${idx + 1}`,
          filePath: file.path,
          line: idx + 1,
          type: typeStr === "BUG" ? "BUG" : typeStr === "FIXME" ? "FIXME" : "TODO",
          text: match[2]?.trim() || lineText.trim()
        });
      }
    });
  });

  return todos;
}

/**
 * Sync extracted TODOs into Google Tasks
 */
export async function syncTodosToGoogleTasks(
  todos: ExtractedTodo[],
  tokenOverride?: string
): Promise<ExportResult> {
  const token = tokenOverride || (await getGoogleWorkspaceAccessToken());

  if (!token) {
    // Clipboard fallback
    const summary = todos.map((t) => `[${t.type}] ${t.filePath}:${t.line} - ${t.text}`).join("\n");
    try {
      await navigator.clipboard.writeText(summary);
      return {
        success: true,
        type: "clipboard",
        message: "Google Tasks OAuth offline: Copied tasks checklist to clipboard!",
        itemsCount: todos.length
      };
    } catch {
      return {
        success: false,
        type: "clipboard",
        message: "Could not access clipboard or Google Tasks.",
        itemsCount: 0
      };
    }
  }

  let createdCount = 0;
  try {
    for (const todo of todos.slice(0, 10)) {
      const res = await fetch("https://tasks.googleapis.com/tasks/v1/lists/@default/tasks", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          title: `[${todo.type}] ${todo.text.slice(0, 80)}`,
          notes: `File: ${todo.filePath} (Line ${todo.line})\nCreated via Google AI Studio Workspace Agent.`
        })
      });
      if (res.ok) createdCount++;
    }

    return {
      success: true,
      type: "google_api",
      url: "https://tasks.google.com",
      message: `Created ${createdCount} items in your primary Google Tasks list!`,
      itemsCount: createdCount
    };
  } catch (err: any) {
    return {
      success: false,
      type: "google_api",
      message: `Tasks sync error: ${err?.message}`,
      itemsCount: createdCount
    };
  }
}

/**
 * Zero-latency browser speech synthesis for audio walkthroughs
 */
export function speakCodeWalkthrough(
  text: string,
  onStart?: () => void,
  onEnd?: () => void
): { stop: () => void } {
  if (!("speechSynthesis" in window)) {
    console.warn("Web Speech API is not supported in this browser.");
    return { stop: () => {} };
  }

  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 1.05;
  utterance.pitch = 1.0;

  // Prefer high quality English voices if available
  const voices = window.speechSynthesis.getVoices();
  const naturalVoice = voices.find(
    (v) =>
      v.lang.startsWith("en") &&
      (v.name.includes("Google") || v.name.includes("Natural") || v.name.includes("Samantha"))
  );
  if (naturalVoice) {
    utterance.voice = naturalVoice;
  }

  if (onStart) utterance.onstart = onStart;
  if (onEnd) utterance.onend = onEnd;
  utterance.onerror = () => onEnd && onEnd();

  window.speechSynthesis.speak(utterance);

  return {
    stop: () => {
      window.speechSynthesis.cancel();
      if (onEnd) onEnd();
    }
  };
}
