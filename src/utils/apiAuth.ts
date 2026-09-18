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
        const data = await res.json();
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
    return getAuthToken() || "";
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
  const sessionToken = await ensureSessionToken();
  const authHeaders = getAuthHeaders(userApiKey);
  if (sessionToken && !authHeaders["X-Session-Id"]) {
    authHeaders["X-Session-Id"] = sessionToken;
  }

  const mergedHeaders = {
    ...authHeaders,
    ...(options.headers as Record<string, string> || {})
  };

  return fetch(url, {
    ...options,
    headers: mergedHeaders
  });
}

