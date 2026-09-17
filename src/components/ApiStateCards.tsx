import React from "react";

// 1. Spinner — shown while loading
export function Spinner() {
  return (
    <div 
      role="status" 
      aria-label="Loading"
      className="animate-spin w-6 h-6 border-2 border-sky-500 rounded-full border-t-transparent mx-auto" 
    />
  );
}

// 2. ErrorCard — shown on failure, never breaks layout
export function ErrorCard({ message }: { message: string }) {
  return (
    <div className="text-xs text-red-400 bg-zinc-900/90 rounded p-3 border border-red-900/60 shadow-sm flex items-center gap-2">
      <span className="text-amber-400">⚠</span>
      <span>{message || "Data unavailable"}</span>
    </div>
  );
}

// 3. EmptyCard — shown when API returns nothing
export function EmptyCard({ label }: { label: string }) {
  return (
    <div className="text-xs text-zinc-500 text-center py-6">
      No {label} data right now
    </div>
  );
}
