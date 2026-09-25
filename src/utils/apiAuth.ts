// API Authentication and Session Header Utilities
export function getAuthToken(): string {
  if (typeof window === "undefined") return "";
  return localStorage.getItem("app_auth_token") || "";
}

export function setAuthToken(token: string): void {
  if (typeof window === "undefined") return;
  if (token) {
    localStorage.setItem("app_auth_token", token);
  } else {
    localStorage.removeItem("app_auth_token");
  }
}

let inFlightSessionPromise: Promise<string> | null = null;

export async function ensureSessionToken(): Promise<string> {
  const existing = getAuthToken();
  if (existing && existing.startsWith("token.")) {
    return existing;
  }

  if (inFlightSessionPromise) {
    return inFlightSessionPromise;
  }

  inFlightSessionPromise = (async () => {
    try {
      const res = await fetch("/api/auth/guest-session", { method: "POST" });
      if (res.ok) {
        const data = await res.json().catch(() => null);
        if (data?.token) {
          setAuthToken(data.token);
          return data.token;
        }
      }
    } catch (err) {
      console.debug("Failed to acquire guest session token:", err);
    } finally {
      inFlightSessionPromise = null;
    }
    const current = getAuthToken();
    if (!current) {
      const fallbackToken = `token.usr_guest_${Math.random().toString(36).substring(2, 10)}`;
      setAuthToken(fallbackToken);
      return fallbackToken;
    }
    return current;
  })();

  return inFlightSessionPromise;
}

export function getAuthHeaders(userApiKey?: string): Record<string, string> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json"
  };

  if (token) {
    headers["X-Session-Id"] = token;
  }

  if (userApiKey && userApiKey.trim()) {
    headers["Authorization"] = `Bearer ${userApiKey.trim()}`;
    headers["X-OpenRouter-Key"] = userApiKey.trim();
  } else if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  return headers;
}

export async function fetchWithAuth(
  url: string,
  options: RequestInit = {},
  userApiKey?: string
): Promise<Response> {
  // If the request signal is already aborted, return immediately without invoking window.fetch
  if (options.signal?.aborted) {
    return new Response(JSON.stringify({ error: "Request aborted", aborted: true }), {
      status: 499,
      headers: { "Content-Type": "application/json" }
    });
  }

  const sessionToken = await ensureSessionToken().catch(() => "");

  // Check again after awaiting session token in case signal aborted in the interim
  if (options.signal?.aborted) {
    return new Response(JSON.stringify({ error: "Request aborted", aborted: true }), {
      status: 499,
      headers: { "Content-Type": "application/json" }
    });
  }

  const authHeaders = getAuthHeaders(userApiKey);
  if (sessionToken && !authHeaders["X-Session-Id"]) {
    authHeaders["X-Session-Id"] = sessionToken;
  }

  const mergedHeaders = {
    ...authHeaders,
    ...(options.headers as Record<string, string> || {})
  };

  try {
    return await fetch(url, {
      ...options,
      headers: mergedHeaders
    });
  } catch (err: any) {
    const isAbort =
      Boolean(options.signal?.aborted) ||
      err?.name === "AbortError" ||
      err?.name === "CanceledError" ||
      err?.code === 20 ||
      (err?.message && String(err.message).toLowerCase().includes("abort")) ||
      (err?.message && String(err.message).toLowerCase().includes("signal is aborted"));

    if (isAbort) {
      return new Response(JSON.stringify({ error: "Request aborted", aborted: true }), {
        status: 499,
        headers: { "Content-Type": "application/json" }
      });
    }

    // Convert network "Failed to fetch" into a 503 response to avoid uncaught client exceptions
    if (err?.message && String(err.message).toLowerCase().includes("failed to fetch")) {
      return new Response(JSON.stringify({ error: "Network fetch failed", failed: true }), {
        status: 503,
        headers: { "Content-Type": "application/json" }
      });
    }

    throw err;
  }
}

export function installGlobalFetchInterceptor(): void {
  // Trigger background token acquisition immediately without mutating window.fetch
  ensureSessionToken().catch(() => {});
}

