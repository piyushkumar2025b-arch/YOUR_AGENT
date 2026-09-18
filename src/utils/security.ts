/**
 * Security & Resilient Input/Fetch Utilities
 * Protects client-side against XSS, invalid inputs, network failures, and API timeout crashes.
 */

import DOMPurify from "dompurify";

// 1. String & HTML Sanitization against XSS
export function sanitizeString(input: unknown): string {
  if (typeof input !== "string") return "";
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;");
}

export function sanitizeHtml(htmlString: string): string {
  if (!htmlString || typeof htmlString !== "string") return "";
  try {
    if (typeof window !== "undefined" && DOMPurify && typeof DOMPurify.sanitize === "function") {
      return DOMPurify.sanitize(htmlString, {
        USE_PROFILES: { html: true },
        FORBID_TAGS: ["script", "iframe", "object", "embed", "base", "form"],
        FORBID_ATTR: ["onerror", "onload", "onclick", "onmouseover", "onfocus", "formaction"]
      });
    }
  } catch (e) {
    console.warn("DOMPurify sanitize failed, applying fallback", e);
  }

  // Fallback regex sanitizer
  return htmlString
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/on\w+\s*=\s*(['"]).*?\1/gi, "")
    .replace(/on\w+\s*=\s*[^>\s]+/gi, "")
    .replace(/javascript\s*:/gi, "no-javascript:");
}

export function sanitizeSvg(svgString: string): string {
  if (!svgString || typeof svgString !== "string") return "";
  try {
    if (typeof window !== "undefined" && DOMPurify && typeof DOMPurify.sanitize === "function") {
      return DOMPurify.sanitize(svgString, {
        USE_PROFILES: { svg: true, svgFilters: true },
        FORBID_TAGS: ["script", "foreignObject", "iframe", "object", "embed", "base"],
        FORBID_ATTR: ["onerror", "onload", "onclick", "onmouseover", "onfocus", "xlink:href", "formaction"]
      });
    }
  } catch (e) {
    console.warn("DOMPurify SVG sanitize failed, applying fallback", e);
  }

  return svgString
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<foreignObject\b[^>]*>[\s\S]*?<\/foreignObject>/gi, "")
    .replace(/on\w+\s*=\s*(['"]).*?\1/gi, "")
    .replace(/on\w+\s*=\s*[^>\s]+/gi, "")
    .replace(/javascript\s*:/gi, "no-javascript:");
}

// 2. Safe URL Validation
export function validateUrl(url: string, allowedProtocols = ["http:", "https:"]): boolean {
  try {
    const parsed = new URL(url);
    return allowedProtocols.includes(parsed.protocol);
  } catch {
    return false;
  }
}

// 3. Safe JSON Parsing
export function safeJsonParse<T>(jsonString: string, fallback: T): T {
  try {
    if (!jsonString) return fallback;
    return JSON.parse(jsonString) as T;
  } catch (err) {
    console.warn("Safe JSON Parse suppressed error:", err);
    return fallback;
  }
}

// 4. Resilient Fetch Wrapper with Timeout, Deduplication & Automatic Error Prevention
const inFlightRequests = new Map<string, Promise<any>>();

export interface SafeFetchOptions extends RequestInit {
  timeoutMs?: number;
  retries?: number;
  fallbackData?: any;
  dedupe?: boolean;
}

export async function safeFetch<T>(
  url: string,
  options: SafeFetchOptions = {}
): Promise<{ ok: boolean; data: T | null; error: string | null; status: number }> {
  const { timeoutMs = 8000, retries = 1, fallbackData = null, dedupe = true, ...fetchOpts } = options;

  // Deduplicate identical pending requests
  const dedupeKey = `${fetchOpts.method || "GET"}:${url}`;
  if (dedupe && inFlightRequests.has(dedupeKey)) {
    return inFlightRequests.get(dedupeKey);
  }

  const executeFetch = async () => {
    let attempt = 0;
    let lastError = "Unknown network error";

    while (attempt <= retries) {
      attempt++;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        try {
          controller.abort("Request timeout");
        } catch {}
      }, timeoutMs);

      try {
        const response = await fetch(url, {
          ...fetchOpts,
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          const errorText = await response.text().catch(() => response.statusText);
          lastError = `Server returned status ${response.status}: ${errorText.slice(0, 150)}`;
          if (attempt <= retries) continue;
          return { ok: false, data: fallbackData, error: lastError, status: response.status };
        }

        const data = await response.json().catch(() => null);
        return { ok: true, data: data as T, error: null, status: response.status };

      } catch (err: any) {
        clearTimeout(timeoutId);
        const isAbort =
          err?.name === "AbortError" ||
          err?.name === "CanceledError" ||
          err?.code === 20 ||
          (err?.message && String(err.message).toLowerCase().includes("abort")) ||
          (err?.message && String(err.message).toLowerCase().includes("signal is aborted")) ||
          controller.signal.aborted;

        if (isAbort) {
          lastError = `Request timed out after ${timeoutMs}ms`;
        } else {
          lastError = err.message || "Network request failed";
        }

        if (attempt <= retries) {
          await new Promise((res) => setTimeout(res, 300));
        }
      }
    }

    return { ok: false, data: fallbackData, error: lastError, status: 0 };
  };

  const promise = executeFetch().finally(() => {
    inFlightRequests.delete(dedupeKey);
  });

  if (dedupe) {
    inFlightRequests.set(dedupeKey, promise);
  }

  return promise;
}

// 5. Secure Storage Wrapper (Safe LocalStorage with Obfuscation & Error Suppression)
export const secureStorage = {
  getItem: <T>(key: string, fallback: T): T => {
    try {
      const item = localStorage.getItem(`sys_sec_${key}`);
      if (!item) return fallback;
      const decoded = atob(item);
      return JSON.parse(decoded) as T;
    } catch {
      return fallback;
    }
  },
  setItem: <T>(key: string, value: T): boolean => {
    try {
      const json = JSON.stringify(value);
      const encoded = btoa(json);
      localStorage.setItem(`sys_sec_${key}`, encoded);
      return true;
    } catch {
      return false;
    }
  },
  removeItem: (key: string): void => {
    try {
      localStorage.removeItem(`sys_sec_${key}`);
    } catch {}
  }
};

// 6. Productivity Debounce & Throttle Helpers
export function debounce<T extends (...args: any[]) => any>(fn: T, delayMs: number) {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  return (...args: Parameters<T>) => {
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delayMs);
  };
}

export function throttle<T extends (...args: any[]) => any>(fn: T, limitMs: number) {
  let inThrottle = false;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      fn(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limitMs);
    }
  };
}

// 7. Advanced Website Security & Right-Click Guard System
export interface SecurityProtectionOptions {
  disableRightClick?: boolean;
  disableDevToolsShortcuts?: boolean;
  disableImageDrag?: boolean;
  onWarningTriggered?: (msg: string) => void;
}

let securityOptions: SecurityProtectionOptions = {
  disableRightClick: false,
  disableDevToolsShortcuts: false,
  disableImageDrag: false
};

export function configureSecurityShield(options: Partial<SecurityProtectionOptions>) {
  securityOptions = { ...securityOptions, ...options };
}

export function getSecurityProtectionStatus(): SecurityProtectionOptions {
  return { ...securityOptions };
}

export function setupWebsiteSecurityListeners(onWarning?: (msg: string) => void): () => void {
  if (typeof window === "undefined") return () => {};

  // 1. Right Click / Context Menu Guard
  const handleContextMenu = (e: MouseEvent) => {
    if (securityOptions.disableRightClick) {
      e.preventDefault();
      e.stopPropagation();
      const warningMsg = "🔒 System Security Shield: Right-click context menu is strictly disabled for application safety.";
      if (onWarning) onWarning(warningMsg);
      if (securityOptions.onWarningTriggered) securityOptions.onWarningTriggered(warningMsg);
      return false;
    }
  };

  // 2. DevTools Shortcuts Guard (F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+Shift+C, Ctrl+U, Ctrl+S)
  const handleKeyDown = (e: KeyboardEvent) => {
    if (!securityOptions.disableDevToolsShortcuts) return;

    const key = e.key;
    const ctrlOrCmd = e.ctrlKey || e.metaKey;
    const shift = e.shiftKey;
    const alt = e.altKey;

    // F12
    const isF12 = key === "F12";
    // Ctrl+Shift+I / Cmd+Option+I
    const isInspect = (ctrlOrCmd && shift && (key === "I" || key === "i")) || (ctrlOrCmd && alt && (key === "I" || key === "i"));
    // Ctrl+Shift+J / Cmd+Option+J
    const isConsole = (ctrlOrCmd && shift && (key === "J" || key === "j")) || (ctrlOrCmd && alt && (key === "J" || key === "j"));
    // Ctrl+Shift+C / Cmd+Option+C
    const isElementSelect = (ctrlOrCmd && shift && (key === "C" || key === "c")) || (ctrlOrCmd && alt && (key === "C" || key === "c"));
    // Ctrl+U / Cmd+Option+U
    const isViewSource = ctrlOrCmd && (key === "U" || key === "u");
    // Ctrl+S / Cmd+S
    const isSavePage = ctrlOrCmd && (key === "S" || key === "s");

    if (isF12 || isInspect || isConsole || isElementSelect || isViewSource || isSavePage) {
      e.preventDefault();
      e.stopPropagation();
      const warningMsg = "🛡️ Security Shield Intercepted Developer Inspection Shortcut.";
      if (onWarning) onWarning(warningMsg);
      if (securityOptions.onWarningTriggered) securityOptions.onWarningTriggered(warningMsg);
      return false;
    }
  };

  // 3. Image Dragging Prevention Guard
  const handleDragStart = (e: DragEvent) => {
    if (securityOptions.disableImageDrag && e.target && (e.target as HTMLElement).tagName === "IMG") {
      e.preventDefault();
    }
  };

  window.addEventListener("contextmenu", handleContextMenu, { capture: true });
  window.addEventListener("keydown", handleKeyDown, { capture: true });
  window.addEventListener("dragstart", handleDragStart, { capture: true });

  return () => {
    window.removeEventListener("contextmenu", handleContextMenu, { capture: true });
    window.removeEventListener("keydown", handleKeyDown, { capture: true });
    window.removeEventListener("dragstart", handleDragStart, { capture: true });
  };
}

