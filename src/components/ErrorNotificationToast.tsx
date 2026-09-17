import React, { useState, useEffect } from "react";
import { ShieldAlert, AlertTriangle, X, Bug, ArrowRight } from "lucide-react";
import { errorHandler, SystemErrorEntry } from "../services/errorHandlerService";

interface Props {
  onOpenErrorConsole: () => void;
}

export const ErrorNotificationToast: React.FC<Props> = ({ onOpenErrorConsole }) => {
  const [latestError, setLatestError] = useState<SystemErrorEntry | null>(null);
  const [visible, setVisible] = useState<boolean>(false);

  useEffect(() => {
    let lastSeenId: string | null = null;

    const unsubscribe = errorHandler.subscribe((logs) => {
      if (logs.length > 0) {
        const newest = logs[0];
        // Only show toast for fresh unhandled errors/fatal errors that haven't been dismissed
        if (newest.id !== lastSeenId && !newest.resolved && (newest.severity === "fatal" || newest.severity === "error")) {
          lastSeenId = newest.id;
          setLatestError(newest);
          setVisible(true);

          // Auto hide after 7 seconds
          const timer = setTimeout(() => {
            setVisible(false);
          }, 7000);
          return () => clearTimeout(timer);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  if (!visible || !latestError) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-sm w-full bg-zinc-950 border border-rose-500/40 rounded-2xl shadow-2xl p-4 text-white animate-in slide-in-from-bottom-5 duration-300">
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-xl bg-rose-500/20 border border-rose-500/30 text-rose-400 flex items-center justify-center shrink-0 mt-0.5">
          <ShieldAlert className="w-5 h-5 animate-pulse" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1">
            <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
              {latestError.category} {latestError.severity}
            </span>
            <button
              onClick={() => setVisible(false)}
              className="text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="text-xs font-mono font-medium text-slate-100 line-clamp-2 leading-snug">
            {latestError.message}
          </p>

          <div className="mt-2.5 flex items-center justify-between">
            <span className="text-[10px] font-mono text-slate-400">
              {latestError.timestamp}
            </span>

            <button
              onClick={() => {
                setVisible(false);
                onOpenErrorConsole();
              }}
              className="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer"
            >
              <span>View Logs</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
