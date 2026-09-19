import React from "react";

const RELOAD_STORAGE_KEY = "vibe_app_chunk_reload_timestamp";

/**
 * Robust lazy import wrapper with automatic retry and stale-chunk reload recovery.
 * Handles dynamic chunk hash changes across deployments without breaking UI.
 */
export function safeLazy<T extends React.ComponentType<any>>(
  factory: () => Promise<{ default: T } | { [key: string]: any }>,
  namedExport?: string
): React.LazyExoticComponent<T> {
  return React.lazy(async () => {
    try {
      const module = await factory();
      if (namedExport && (module as any)[namedExport]) {
        return { default: (module as any)[namedExport] };
      }
      return (module as any).default ? (module as { default: T }) : { default: module as unknown as T };
    } catch (err: any) {
      console.warn("[safeLazy] Initial chunk load failed, retrying once...", err?.message || err);
      try {
        await new Promise((resolve) => setTimeout(resolve, 500));
        const module = await factory();
        if (namedExport && (module as any)[namedExport]) {
          return { default: (module as any)[namedExport] };
        }
        return (module as any).default ? (module as { default: T }) : { default: module as unknown as T };
      } catch (retryError: any) {
        console.error("[safeLazy] Persistent chunk load failure:", retryError);

        const errMsg = String(retryError?.message || "");
        const isStaleChunk =
          errMsg.includes("dynamically imported module") ||
          errMsg.includes("Importing a module script failed") ||
          errMsg.includes("Loading chunk");

        if (typeof window !== "undefined" && isStaleChunk) {
          try {
            const lastReload = Number(sessionStorage.getItem(RELOAD_STORAGE_KEY) || 0);
            const now = Date.now();
            if (now - lastReload > 15000) {
              sessionStorage.setItem(RELOAD_STORAGE_KEY, String(now));
              console.warn("[safeLazy] Reloading application to refresh stale chunk asset references...");
              window.location.reload();
              return new Promise(() => {});
            }
          } catch {}
        }

        // Return a benign silent fallback component to avoid crashing the whole view
        const FallbackComponent: React.FC<any> = () => null;
        return { default: FallbackComponent as unknown as T };
      }
    }
  });
}
