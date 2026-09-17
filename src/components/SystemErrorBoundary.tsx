import React, { Component, ErrorInfo, ReactNode } from "react";
import { ShieldAlert, RefreshCw, AlertTriangle, Copy, Check, Home, Bug } from "lucide-react";
import { errorHandler } from "../services/errorHandlerService";

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  copied: boolean;
  showDetails: boolean;
}

export class SystemErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
    copied: false,
    showDetails: false,
  };

  public static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("SystemErrorBoundary caught an unhandled rendering error:", error, errorInfo);
    this.setState({ errorInfo });
    errorHandler.logError({
      message: error.message || "React UI rendering exception trapped",
      category: "UI",
      severity: "fatal",
      source: "SystemErrorBoundary",
      stack: errorInfo.componentStack || error.stack
    });
  }

  private handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      copied: false,
      showDetails: false,
    });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  private handleReload = () => {
    window.location.reload();
  };

  private copyDiagnostics = () => {
    const text = `Error: ${this.state.error?.toString()}\nComponent Stack:\n${this.state.errorInfo?.componentStack || "N/A"}`;
    navigator.clipboard.writeText(text);
    this.setState({ copied: true });
    setTimeout(() => this.setState({ copied: false }), 2000);
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[400px] w-full p-6 my-4 rounded-2xl bg-gradient-to-b from-slate-900 to-zinc-950 border border-red-500/30 text-white shadow-2xl flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 mb-4 shadow-inner">
            <ShieldAlert className="w-8 h-8 animate-pulse" />
          </div>

          <h2 className="text-xl font-bold text-slate-100 mb-2 flex items-center gap-2">
            <span>{this.props.fallbackTitle || "System Protection Intercepted UI Exception"}</span>
          </h2>

          <p className="text-sm text-slate-400 max-w-md mb-6 leading-relaxed">
            An unexpected visual rendering issue was safely trapped by System Safeguard. Your session state remains secure.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 mb-6">
            <button
              onClick={this.handleReset}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-all shadow-lg shadow-indigo-600/20 flex items-center gap-2 active:scale-95"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Recover Component</span>
            </button>

            <button
              onClick={this.handleReload}
              className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-medium transition-all border border-slate-700 flex items-center gap-2 active:scale-95"
            >
              <Home className="w-4 h-4" />
              <span>Reload Workspace</span>
            </button>

            <button
              onClick={() => this.setState((prev) => ({ showDetails: !prev.showDetails }))}
              className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 text-xs font-mono transition-all border border-slate-800 flex items-center gap-2"
            >
              <Bug className="w-3.5 h-3.5" />
              <span>{this.state.showDetails ? "Hide Stack" : "Diagnostics"}</span>
            </button>
          </div>

          {this.state.showDetails && (
            <div className="w-full max-w-2xl bg-slate-950/80 border border-slate-800 rounded-xl p-4 text-left font-mono text-xs text-red-300 overflow-x-auto relative">
              <button
                onClick={this.copyDiagnostics}
                className="absolute top-3 right-3 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] flex items-center gap-1.5 transition-colors"
              >
                {this.state.copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{this.state.copied ? "Copied" : "Copy Stack"}</span>
              </button>
              <div className="font-bold text-red-400 mb-1">{this.state.error?.toString()}</div>
              <pre className="text-slate-400 whitespace-pre-wrap text-[11px] leading-tight max-h-40 overflow-y-auto">
                {this.state.errorInfo?.componentStack || "No stack trace recorded."}
              </pre>
            </div>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}
