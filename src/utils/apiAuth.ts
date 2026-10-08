// API Authentication and Session Header Utilities (BUG-P0-002)
// Bearer tokens are kept in memory only; browser sessions rely on HttpOnly cookie transport
let inMemorySessionToken = "";

export function getAuthToken(): string {
  if (inMemorySessionToken && inMemorySessionToken.startsWith("token.")) {
    return inMemorySessionToken;
  }
  return inMemorySessionToken;
}

export function setAuthToken(token: string): void {
  inMemorySessionToken = token || "";
  if (typeof window !== "undefined") {
    try {
      // Ensure no session tokens leak into JavaScript-accessible web storage
      sessionStorage.removeItem("app_auth_token");
      localStorage.removeItem("app_auth_token");
    } catch {}
  }
}

let inFlightSessionPromise: Promise<string> | null = null;

export async function ensureSessionToken(): Promise<string> {
  if (inMemorySessionToken && inMemorySessionToken.startsWith("token.")) {
    return inMemorySessionToken;
  }

  if (inFlightSessionPromise) {
    return inFlightSessionPromise;
  }

  inFlightSessionPromise = (async () => {
    const origin = typeof window !== "undefined" && window.location ? "" : "http://127.0.0.1:3000";

    // 1. BUG-AUTH-001: First attempt to recover existing authenticated session from server cookie
    try {
      const meRes = await fetch(`${origin}/api/auth/me`, {
        method: "GET",
        credentials: "include"
      });
      if (meRes.ok) {
        const meData = await meRes.json().catch(() => null);
        if (meData?.authenticated && meData?.token) {
          setAuthToken(meData.token);
          return meData.token;
        }
      }
    } catch {
      // Ignore network errors when probing /api/auth/me
    }

    // 2. Only mint a guest session if no authenticated session exists
    try {
      const res = await fetch(`${origin}/api/auth/guest-session`, {
        method: "POST",
        credentials: "include"
      });
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
    return inMemorySessionToken;
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

  const targetUrl = (url.startsWith("/") && typeof window === "undefined")
    ? `http://127.0.0.1:3000${url}`
    : url;

  try {
    const resp = await fetch(targetUrl, {
      ...options,
      credentials: options.credentials || "include",
      headers: mergedHeaders
    });

    // If session expired (401), do not silently downgrade authenticated accounts to guest (BUG-007)
    if (resp.status === 401 && !userApiKey && !url.includes("/api/auth/")) {
      if (inMemorySessionToken && !inMemorySessionToken.includes("usr_guest_")) {
        setAuthToken("");
        return resp;
      }
      setAuthToken("");
      const freshToken = await ensureSessionToken().catch(() => "");
      if (freshToken) {
        const retryHeaders = getAuthHeaders();
        return await fetch(targetUrl, {
          ...options,
          credentials: options.credentials || "include",
          headers: {
            ...retryHeaders,
            ...((options.headers as Record<string, string>) || {})
          }
        });
      }
    }

    return resp;
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

