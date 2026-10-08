import crypto from "crypto";
import fs from "fs";
import path from "path";
import express from "express";

export const SESSION_COOKIE = "remix_session";

// Cryptographically Secure Session Secret
const configuredSecret = process.env.SESSION_SECRET?.trim();

let SESSION_SECRET: string = configuredSecret && configuredSecret.length >= 32 ? configuredSecret : "";

if (!SESSION_SECRET) {
  const secretPath = path.join(process.cwd(), ".data", "session_secret.key");
  try {
    if (fs.existsSync(secretPath)) {
      const persisted = fs.readFileSync(secretPath, "utf8").trim();
      if (persisted.length >= 32) {
        SESSION_SECRET = persisted;
      }
    }
  } catch {}

  if (!SESSION_SECRET) {
    try {
      fs.mkdirSync(path.dirname(secretPath), { recursive: true });
      // Generate 64 cryptographically secure random bytes (128-char hex string)
      SESSION_SECRET = crypto.randomBytes(64).toString("hex");
      fs.writeFileSync(secretPath, SESSION_SECRET, { mode: 0o600 });
    } catch {
      // In-memory fallback if filesystem is read-only
      SESSION_SECRET = crypto.randomBytes(64).toString("hex");
    }
  }
}

// In-memory revocation map with TTL expiration backed by durable storage (BUG-P0-003)
const REVOCATION_FILE = path.join(process.cwd(), ".data", "revoked_sessions.json");
const revokedSessions = new Map<string, number>();

function loadRevokedSessions(): void {
  try {
    if (fs.existsSync(REVOCATION_FILE)) {
      const data = JSON.parse(fs.readFileSync(REVOCATION_FILE, "utf8"));
      const now = Date.now();
      if (data && typeof data === "object") {
        for (const [id, expiry] of Object.entries(data)) {
          if (typeof expiry === "number" && expiry > now) {
            revokedSessions.set(id, expiry);
          }
        }
      }
    }
  } catch {}
}
loadRevokedSessions();

// BUG-022: Asynchronous, debounced persistence for session revocations to prevent event-loop blocking
let revocationPersistTimer: NodeJS.Timeout | null = null;
function persistRevokedSessionsAsync(): void {
  if (revocationPersistTimer) return;
  revocationPersistTimer = setTimeout(async () => {
    revocationPersistTimer = null;
    try {
      const dataDir = path.dirname(REVOCATION_FILE);
      if (!fs.existsSync(dataDir)) {
        await fs.promises.mkdir(dataDir, { recursive: true });
      }
      const obj: Record<string, number> = {};
      for (const [id, exp] of revokedSessions.entries()) {
        obj[id] = exp;
      }
      await fs.promises.writeFile(REVOCATION_FILE, JSON.stringify(obj), "utf8");
    } catch {}
  }, 100);
}

export function revokeSession(identifier: string): void {
  if (identifier) {
    // Retain revocation record for 24 hours (session tokens expire naturally after 24 hours)
    revokedSessions.set(identifier, Date.now() + 24 * 60 * 60 * 1000);
    persistRevokedSessionsAsync();
  }
}

export function isSessionRevoked(identifier: string): boolean {
  if (!identifier) return false;
  const expiry = revokedSessions.get(identifier);
  if (!expiry) return false;
  if (Date.now() > expiry) {
    revokedSessions.delete(identifier);
    return false;
  }
  return true;
}

export function pruneRevokedSessions(): void {
  const now = Date.now();
  let changed = false;
  for (const [id, expiry] of revokedSessions.entries()) {
    if (now > expiry) {
      revokedSessions.delete(id);
      changed = true;
    }
  }
  if (changed) {
    persistRevokedSessionsAsync();
  }
}
setInterval(pruneRevokedSessions, 10 * 60 * 1000).unref();

export function generateUserToken(userId: string): string {
  const timestamp = Date.now().toString();
  const sessionId = crypto.randomBytes(12).toString("hex");
  const payload = `${userId}:${sessionId}:${timestamp}`;
  const signature = crypto
    .createHmac("sha256", SESSION_SECRET)
    .update(payload)
    .digest("hex")
    .slice(0, 32);
  return `token.${userId}.${sessionId}.${timestamp}.${signature}`;
}

export function verifyUserToken(token: string): { valid: boolean; userId: string | null; sessionId?: string } {
  if (!token || typeof token !== "string" || !token.startsWith("token.")) {
    return { valid: false, userId: null };
  }

  if (isSessionRevoked(token)) {
    return { valid: false, userId: null };
  }

  const parts = token.split(".");
  // BUG-P2-015: Strictly enforce current 5-part tokens with verifiable sessionId and revocation tracking
  if (parts.length === 5) {
    const [, userId, sessionId, timestampStr, providedSig] = parts;
    if (isSessionRevoked(sessionId)) {
      return { valid: false, userId: null };
    }
    const timestamp = parseInt(timestampStr, 10);
    const now = Date.now();
    const age = now - timestamp;
    if (isNaN(timestamp) || age < -60000 || age > 24 * 60 * 60 * 1000) {
      return { valid: false, userId: null };
    }
    const expectedSig = crypto
      .createHmac("sha256", SESSION_SECRET)
      .update(`${userId}:${sessionId}:${timestampStr}`)
      .digest("hex")
      .slice(0, 32);

    try {
      const match = crypto.timingSafeEqual(
        Buffer.from(providedSig, "utf8"),
        Buffer.from(expectedSig, "utf8")
      );
      if (!match) return { valid: false, userId: null };
      return { valid: true, userId, sessionId };
    } catch {
      return { valid: false, userId: null };
    }
  }

  return { valid: false, userId: null };
}

export function parseCookieHeader(header?: string): Record<string, string> {
  if (!header || typeof header !== "string") return {};
  const output: Record<string, string> = {};
  for (const part of header.split(";")) {
    const index = part.indexOf("=");
    if (index <= 0) continue;
    const key = part.slice(0, index).trim();
    const value = part.slice(index + 1).trim();
    try {
      output[key] = decodeURIComponent(value);
    } catch {
      output[key] = value;
    }
  }
  return output;
}

export function setSessionCookie(res: express.Response, token: string): void {
  // BUG-P2-014: Enable Secure attribute if in production, behind HTTPS proxy, or if request is secure
  const isHttps = process.env.NODE_ENV === "production" || process.env.COOKIE_SECURE === "true" || (res.req as any)?.secure || (res.req as any)?.headers?.["x-forwarded-proto"] === "https";
  const secure = isHttps ? "; Secure" : "";
  res.setHeader(
    "Set-Cookie",
    `${SESSION_COOKIE}=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Lax${secure}`
  );
}

export function clearSessionCookie(res: express.Response): void {
  const isHttps = process.env.NODE_ENV === "production" || process.env.COOKIE_SECURE === "true" || (res.req as any)?.secure || (res.req as any)?.headers?.["x-forwarded-proto"] === "https";
  const secure = isHttps ? "; Secure" : "";
  res.setHeader(
    "Set-Cookie",
    `${SESSION_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${secure}`
  );
}

export function getBearerValue(value: unknown): string {
  if (typeof value !== "string") return "";
  return value.replace(/^Bearer\s+/i, "").trim();
}

export function getVerifiedSessionUserId(req: express.Request): string | null {
  // 1. Check HttpOnly cookie
  const cookies = parseCookieHeader(req.headers.cookie);
  const cookieToken = cookies[SESSION_COOKIE];
  if (cookieToken) {
    const verified = verifyUserToken(cookieToken);
    if (verified.valid && verified.userId) return verified.userId;
  }

  // 2. Check Authorization header
  const authHeader = req.headers.authorization;
  if (authHeader) {
    const token = getBearerValue(authHeader);
    if (token.startsWith("token.")) {
      const verified = verifyUserToken(token);
      if (verified.valid && verified.userId) return verified.userId;
    }
  }

  // 3. Check X-Session-Id header
  const sessionHeader = req.headers["x-session-id"];
  if (typeof sessionHeader === "string") {
    const token = getBearerValue(sessionHeader);
    if (token.startsWith("token.")) {
      const verified = verifyUserToken(token);
      if (verified.valid && verified.userId) return verified.userId;
    }
  }

  return null;
}

export function getVerifiedOpenRouterKey(req: express.Request): string | null {
  const xKey = req.headers["x-openrouter-key"] || req.headers["x-api-key"];
  if (typeof xKey === "string") {
    const key = xKey.trim();
    if (/^sk-or-[A-Za-z0-9_-]{16,}$/.test(key)) return key;
  }

  const auth = req.headers.authorization;
  if (typeof auth === "string") {
    const clean = getBearerValue(auth);
    if (/^sk-or-[A-Za-z0-9_-]{16,}$/.test(clean)) return clean;
  }

  return null;
}

export type Principal =
  | { kind: "session"; userId: string }
  | { kind: "openrouter-key"; key: string };

export function getPrincipal(req: express.Request): Principal | null {
  const userId = getVerifiedSessionUserId(req);
  if (userId) return { kind: "session", userId };

  const providerKey = getVerifiedOpenRouterKey(req);
  if (providerKey) return { kind: "openrouter-key", key: providerKey };

  return null;
}

export function requireSession(
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) {
  const userId = getVerifiedSessionUserId(req);
  if (!userId) {
    return res.status(401).json({
      ok: false,
      error: "Authentication required: A valid session token or session cookie is required."
    });
  }

  (req as any).userId = userId;
  return next();
}

export function requireSessionOrOpenRouterKey(
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) {
  const principal = getPrincipal(req);
  if (!principal) {
    return res.status(401).json({
      ok: false,
      error: "Authentication required: Please provide an active session token or valid OpenRouter API key."
    });
  }

  (req as any).principal = principal;
  if (principal.kind === "session") {
    (req as any).userId = principal.userId;
  }
  return next();
}

export { SESSION_SECRET };
