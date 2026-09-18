import React from "react";

/**
 * Robust lazy import wrapper with automatic retry for chunk load errors
 * (e.g. when deployment updates change chunk hashes from BK-9xNbq to new hash).
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
        // Brief backoff before re-attempting dynamic chunk load
        await new Promise((resolve) => setTimeout(resolve, 800));
        const module = await factory();
        if (namedExport && (module as any)[namedExport]) {
          return { default: (module as any)[namedExport] };
        }
        return (module as any).default ? (module as { default: T }) : { default: module as unknown as T };
      } catch (retryError) {
        console.error("[safeLazy] Persistent chunk load failure:", retryError);
        // Return a benign silent fallback component to avoid crashing the whole view
        const FallbackComponent: React.FC<any> = () => null;
        return { default: FallbackComponent as unknown as T };
      }
    }
  });
}
