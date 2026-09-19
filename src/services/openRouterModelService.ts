import { fetchWithAuth } from "../utils/apiAuth";

// Dynamic OpenRouter Model Cache and Fallback Provider
let cachedFreeModels: string[] = [];
let lastFetchTime = 0;
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

const STATIC_FALLBACK_MODELS = [
  "liquid/lfm-2.5-2.6b:free",
  "nex-agi/nex-n2.5-mini:free",
  "nex-agi/nex-n2.5-pro:free",
  "poolside/laguna-s-2.1:free",
  "cohere/north-mini-code:free",
  "thinkingmachines/inkling:free",
  "nvidia/nemotron-3.5-lightning:free",
  "poolside/laguna-xs-2.1:free"
];

export async function getActiveFreeModels(userAuthHeader?: string): Promise<string[]> {
  const now = Date.now();
  if (cachedFreeModels.length > 0 && now - lastFetchTime < CACHE_TTL_MS) {
    return cachedFreeModels;
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => {
      try {
        controller.abort("Model fetch timeout");
      } catch {}
    }, 4000);

    const userKey = userAuthHeader && userAuthHeader.startsWith("Bearer ")
      ? userAuthHeader.replace("Bearer ", "").trim()
      : undefined;

    const res = await fetchWithAuth("/api/openrouter/models", {
      signal: controller.signal
    }, userKey);

    clearTimeout(timeout);

    if (res.ok) {
      const data = await res.json().catch(() => null);
      if (Array.isArray(data?.data)) {
        const liveFree = data.data
          .filter((m: any) => m?.id && (m.id.endsWith(":free") || m.pricing?.prompt === "0"))
          .map((m: any) => m.id);

        if (liveFree.length > 0) {
          cachedFreeModels = liveFree;
          lastFetchTime = now;
          return cachedFreeModels;
        }
      }
    }
  } catch (e) {
    // Non-blocking silent fallback to curated static list
  }

  if (cachedFreeModels.length === 0) {
    cachedFreeModels = [...STATIC_FALLBACK_MODELS];
  }
  return cachedFreeModels;
}
