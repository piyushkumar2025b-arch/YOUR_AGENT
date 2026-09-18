import { Model } from "../types";
import { popularModels, deduplicateModels } from "./fileHelpers";
import { fetchWithAuth } from "./apiAuth";

interface CachedModelsData {
  models: Model[];
  timestamp: number;
}

let cachedModels: CachedModelsData | null = null;
const CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes TTL

export async function getOrFetchModels(
  apiKey?: string,
  signal?: AbortSignal,
  forceRefresh: boolean = false
): Promise<Model[]> {
  const now = Date.now();

  // Return cached models if still fresh and not force-refreshed
  if (!forceRefresh && cachedModels && now - cachedModels.timestamp < CACHE_TTL_MS) {
    return cachedModels.models;
  }

  try {
    const response = await fetchWithAuth(
      "/api/openrouter/models",
      { signal },
      apiKey
    );

    if (response.ok) {
      const data = await response.json();
      if (data && data.data && Array.isArray(data.data)) {
        const fetched: Model[] = data.data
          .map((m: any) => ({
            id: m.id,
            name: m.name || m.id.split("/").pop() || m.id
          }))
          .slice(0, 150);

        const combined = [...popularModels];
        fetched.forEach(f => {
          if (!combined.some(c => c.id === f.id)) {
            combined.push(f);
          }
        });

        const deduplicated = deduplicateModels(combined);
        cachedModels = {
          models: deduplicated,
          timestamp: Date.now()
        };
        return deduplicated;
      }
    }
  } catch (err: any) {
    if (
      signal?.aborted ||
      err?.name === "AbortError" ||
      err?.name === "CanceledError" ||
      (err?.message && (err.message.includes("abort") || err.message.includes("aborted")))
    ) {
      // Re-throw or ignore abort
      throw err;
    }
    console.debug("Failed to fetch models from server proxy:", err);
  }

  // Fallback to existing cached models or popular models
  if (cachedModels) {
    return cachedModels.models;
  }
  return popularModels;
}

export function clearModelsCache(): void {
  cachedModels = null;
}
