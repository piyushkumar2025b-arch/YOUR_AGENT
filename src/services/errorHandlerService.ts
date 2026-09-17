export type ErrorSeverity = "fatal" | "error" | "warning" | "info";
export type ErrorCategory = "API" | "UI" | "Network" | "Runtime" | "System" | "Storage";

export interface SystemErrorEntry {
  id: string;
  timestamp: string;
  message: string;
  category: ErrorCategory;
  severity: ErrorSeverity;
  stack?: string;
  source?: string;
  metadata?: Record<string, any>;
  resolved?: boolean;
}

type ErrorListener = (errors: SystemErrorEntry[]) => void;

class ErrorHandlerService {
  private errors: SystemErrorEntry[] = [];
  private listeners: Set<ErrorListener> = new Set();
  private maxLogs = 50;
  private storageKey = "vibe_system_error_logs_v1";

  constructor() {
    this.loadFromStorage();
    this.initGlobalListeners();
  }

  private loadFromStorage() {
    try {
      const saved = localStorage.getItem(this.storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          // Filter out any stale/persisted abort errors from previous sessions
          this.errors = parsed.filter(e => {
            const m = (e.message || "").toLowerCase();
            return !(
              m.includes("abort") ||
              m.includes("signal is aborted") ||
              m.includes("the user aborted a request")
            );
          });
        }
      }
    } catch {
      this.errors = [];
    }
  }

  private saveToStorage() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.errors.slice(0, this.maxLogs)));
    } catch {
      // Storage full or unavailable
    }
  }

  private initGlobalListeners() {
    if (typeof window === "undefined") return;

    const isAbortError = (err: any, msg: string) => {
      const lowerMsg = String(msg || "").toLowerCase();
      const errName = (err && typeof err === "object" && "name" in err) ? String(err.name || "") : (typeof err === "string" ? err : "");
      const errCode = (err && typeof err === "object" && "code" in err) ? err.code : 0;
      return (
        errName === "AbortError" ||
        errCode === 20 ||
        lowerMsg.includes("aborterror") ||
        lowerMsg.includes("abort") ||
        lowerMsg.includes("signal is aborted") ||
        lowerMsg.includes("the user aborted a request") ||
        lowerMsg.includes("canceled") ||
        lowerMsg.includes("cancelled")
      );
    };

    // Capture uncaught JavaScript runtime errors
    window.addEventListener("error", (event: ErrorEvent) => {
      const msg = event.message || (event.error && (event.error.message || event.error.name)) || "";
      if (isAbortError(event.error, msg)) {
        return;
      }

      this.logError({
        message: event.message || "Uncaught JavaScript exception",
        category: "Runtime",
        severity: "error",
        source: event.filename ? `${event.filename}:${event.lineno}:${event.colno}` : "window.onerror",
        stack: event.error?.stack
      });
    });

    // Capture unhandled promise rejections (async/API failures)
    window.addEventListener("unhandledrejection", (event: PromiseRejectionEvent) => {
      const reason = event.reason;
      let message = "Unhandled Promise Rejection";
      let stack: string | undefined;

      if (reason instanceof Error) {
        message = reason.message;
        stack = reason.stack;
      } else if (typeof reason === "string") {
        message = reason;
      } else if (reason && typeof reason === "object") {
        message = (reason as any)?.message || JSON.stringify(reason);
      }

      // Ignore intentional cancellations and aborts (e.g. AbortController / user navigation / timeout cleanups)
      if (isAbortError(reason, message)) {
        return;
      }

      this.logError({
        message,
        category: "API",
        severity: "error",
        source: "unhandledrejection",
        stack
      });
    });
  }

  public logError(params: {
    message: string;
    category?: ErrorCategory;
    severity?: ErrorSeverity;
    source?: string;
    stack?: string;
    metadata?: Record<string, any>;
  }): SystemErrorEntry {
    const rawMessage = params.message || "Unknown error occurred";

    // Suppress benign abort/cancellation notifications from polluting system error toast/modal
    const isAbort =
      rawMessage.toLowerCase().includes("abort") ||
      rawMessage.toLowerCase().includes("aborterror") ||
      rawMessage.toLowerCase().includes("signal is aborted") ||
      rawMessage.toLowerCase().includes("the user aborted a request") ||
      rawMessage.toLowerCase().includes("canceled") ||
      rawMessage.toLowerCase().includes("cancelled") ||
      Boolean(params.metadata?.isAbort) ||
      params.metadata?.name === "AbortError";

    if (isAbort) {
      return {
        id: `suppressed_${Date.now()}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        message: rawMessage,
        category: "API",
        severity: "info",
        source: params.source || "AbortController",
        resolved: true
      };
    }

    const entry: SystemErrorEntry = {
      id: `err_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      message: params.message || "Unknown error occurred",
      category: params.category || "Runtime",
      severity: params.severity || "error",
      source: params.source || "System",
      stack: params.stack,
      metadata: params.metadata,
      resolved: false
    };

    // Prepend to top of errors list
    this.errors = [entry, ...this.errors].slice(0, this.maxLogs);
    this.saveToStorage();
    this.notifyListeners();

    // Log to standard console without throwing recursion
    console.warn(`[ErrorHandlerService] [${entry.category}] (${entry.severity.toUpperCase()}):`, entry.message);

    return entry;
  }

  public getErrors(): SystemErrorEntry[] {
    return [...this.errors];
  }

  public markAsResolved(id: string) {
    this.errors = this.errors.map(err => err.id === id ? { ...err, resolved: true } : err);
    this.saveToStorage();
    this.notifyListeners();
  }

  public clearAll() {
    this.errors = [];
    try {
      localStorage.removeItem(this.storageKey);
    } catch {
      // Ignore
    }
    this.notifyListeners();
  }

  public subscribe(listener: ErrorListener): () => void {
    this.listeners.add(listener);
    listener(this.getErrors());
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifyListeners() {
    const current = this.getErrors();
    this.listeners.forEach(fn => fn(current));
  }

  /**
   * Helper wrapper to safely execute async functions with automatic logging and fallback
   */
  public async safeAsyncCall<T>(
    fn: () => Promise<T>,
    fallbackValue: T,
    category: ErrorCategory = "API",
    contextName: string = "AsyncOperation"
  ): Promise<T> {
    try {
      return await fn();
    } catch (err: any) {
      this.logError({
        message: `${contextName} failed: ${err?.message || String(err)}`,
        category,
        severity: "error",
        source: contextName,
        stack: err?.stack,
        metadata: { errorObj: err }
      });
      return fallbackValue;
    }
  }

  /**
   * Helper fetch with timeout and error capture
   */
  public async safeFetch(
    url: string,
    options: RequestInit = {},
    timeoutMs: number = 10000
  ): Promise<Response> {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal
      });
      clearTimeout(id);

      if (!response.ok) {
        this.logError({
          message: `HTTP ${response.status} (${response.statusText}) while requesting ${url}`,
          category: "Network",
          severity: response.status >= 500 ? "error" : "warning",
          source: "safeFetch",
          metadata: { url, status: response.status }
        });
      }

      return response;
    } catch (err: any) {
      clearTimeout(id);
      const isAbort =
        err?.name === "AbortError" ||
        err?.code === 20 ||
        (err?.message || "").toLowerCase().includes("abort") ||
        controller.signal.aborted;

      if (!isAbort) {
        this.logError({
          message: `Network fetch error for ${url}: ${err?.message || "Unknown error"}`,
          category: "Network",
          severity: "error",
          source: "safeFetch",
          metadata: { url, isAbort: false }
        });
        throw err;
      }
      return new Response(JSON.stringify({ error: "Request aborted or timed out", aborted: true }), {
        status: 499,
        headers: { "Content-Type": "application/json" }
      });
    }
  }
}

export const errorHandler = new ErrorHandlerService();
