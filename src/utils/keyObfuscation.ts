/**
 * Client-Side Key Storage & Masking Utilities (BUG-006 & BUG-V3-014)
 *
 * Security Model & Threat Model Boundaries:
 * 1. Primary Secret Storage: Production secrets (OPENROUTER_API_KEY, GEMINI_API_KEY, SESSION_SECRET)
 *    are maintained exclusively in server-side environment variables and never sent to clients.
 * 2. Client-Provided Keys: When an end-user provides their personal OpenRouter key in the UI,
 *    this utility provides client-side obfuscation in localStorage.
 *    WARNING (BUG-V3-014): Obfuscation in localStorage is NOT cryptographic hardware-backed encryption.
 *    Browser localStorage is accessible to any script running within the same origin. Obfuscation
 *    serves strictly to prevent casual shoulder-surfing, accidental screen-share exposure, and raw
 *    string scraping in DevTools. Keys stored in the browser must be treated as client-accessible.
 * 3. Validation: OpenRouter API keys are verified to start with "sk-or-".
 */

const STORAGE_KEY = "openrouter_api_key";

function getOriginSalt(): string {
  if (typeof window !== "undefined" && window.location?.origin) {
    return window.location.origin + "_ais_openrouter_salt_2026";
  }
  return "ais_openrouter_salt_default_2026";
}

/**
 * Validates whether the provided string is a valid non-empty OpenRouter API key format.
 */
export function isValidOpenRouterKey(key: string): boolean {
  if (!key || typeof key !== "string") return false;
  const trimmed = key.trim();
  return trimmed.startsWith("sk-or-") && trimmed.length > 10;
}

/**
 * Obfuscates a key using a simple XOR cipher against the origin salt.
 * Prefix with 'obf:' to identify obfuscated values.
 */
export function obfuscateKey(key: string): string {
  if (!key) return "";
  const salt = getOriginSalt();
  let xored = "";
  for (let i = 0; i < key.length; i++) {
    const code = key.charCodeAt(i) ^ salt.charCodeAt(i % salt.length);
    xored += String.fromCharCode(code);
  }
  try {
    return "obf:" + btoa(xored);
  } catch {
    return key;
  }
}

/**
 * Deobfuscates a previously obfuscated key.
 * Backwards-compatible: if string doesn't start with 'obf:', returns original value.
 */
export function deobfuscateKey(stored: string): string {
  if (!stored) return "";
  if (!stored.startsWith("obf:")) {
    return stored;
  }
  try {
    const raw = atob(stored.slice(4));
    const salt = getOriginSalt();
    let original = "";
    for (let i = 0; i < raw.length; i++) {
      const code = raw.charCodeAt(i) ^ salt.charCodeAt(i % salt.length);
      original += String.fromCharCode(code);
    }
    return original;
  } catch {
    return stored;
  }
}

/**
 * Retrieves the stored OpenRouter API key, migrating plaintext legacy keys on the fly.
 */
export function getStoredOpenRouterKey(): string {
  if (typeof window === "undefined" || !window.localStorage) return "";
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return "";

  // If stored in plain text, migrate to obfuscated format
  if (!raw.startsWith("obf:")) {
    const deobfuscated = raw;
    if (deobfuscated) {
      localStorage.setItem(STORAGE_KEY, obfuscateKey(deobfuscated));
    }
    return deobfuscated;
  }

  return deobfuscateKey(raw);
}

/**
 * Stores the OpenRouter API key obfuscated in localStorage.
 */
export function setStoredOpenRouterKey(key: string): void {
  if (typeof window === "undefined" || !window.localStorage) return;
  const trimmed = key.trim();
  if (!trimmed) {
    localStorage.removeItem(STORAGE_KEY);
    return;
  }
  localStorage.setItem(STORAGE_KEY, obfuscateKey(trimmed));
}

/**
 * Removes the stored key from localStorage.
 */
export function removeStoredOpenRouterKey(): void {
  if (typeof window === "undefined" || !window.localStorage) return;
  localStorage.removeItem(STORAGE_KEY);
}
