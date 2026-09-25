import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import { SystemErrorBoundary } from './components/SystemErrorBoundary';
import { installGlobalFetchInterceptor } from './utils/apiAuth';
import './index.css';

// Early top-level suppression for benign cancellations and temporary network disconnects
if (typeof window !== "undefined") {
  const isBenign = (name?: string, msg?: string) => {
    const combined = (String(name || "") + " " + String(msg || "")).toLowerCase();
    return (
      combined.includes("abort") ||
      combined.includes("signal is aborted") ||
      combined.includes("failed to fetch") ||
      combined.includes("network request failed")
    );
  };

  window.addEventListener("unhandledrejection", (event: PromiseRejectionEvent) => {
    const reason = event.reason;
    const msg = reason?.message || (typeof reason === "string" ? reason : "");
    const name = reason?.name;
    if (isBenign(name, msg)) {
      try {
        event.preventDefault();
        event.stopImmediatePropagation?.();
      } catch {}
    }
  }, { capture: true });

  window.addEventListener("error", (event: ErrorEvent) => {
    const msg = event.message || event.error?.message;
    const name = event.error?.name;
    if (isBenign(name, msg)) {
      try {
        event.preventDefault();
        event.stopImmediatePropagation?.();
      } catch {}
    }
  }, { capture: true });
}

// Ensure global session authorization and abort resilience
installGlobalFetchInterceptor();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <SystemErrorBoundary fallbackTitle="Global System Safeguard Intercepted UI Exception">
      <App />
    </SystemErrorBoundary>
  </StrictMode>,
);
