import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Simology Manager caught error:', error, errorInfo);
  }

  private handleReset = () => {
    try {
      localStorage.clear();
    } catch (e) {}
    window.location.reload();
  };

  private handleReload = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6 font-sans">
          <div className="max-w-xl w-full bg-slate-900 border-2 border-amber-500/80 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
              <span className="text-3xl">⚠️</span>
              <div>
                <h1 className="text-lg sm:text-xl font-extrabold text-amber-300">
                  Simology Manager Recovery System
                </h1>
                <p className="text-xs text-slate-400">
                  A display or cache synchronization issue occurred.
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              If an older saved household state caused an issue, click below to start fresh:
            </p>

            <div className="flex flex-wrap gap-3 pt-2">
              <button
                onClick={this.handleReload}
                className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold rounded-xl shadow cursor-pointer transition-all active:scale-95"
              >
                🔄 Reload Page
              </button>
              <button
                onClick={this.handleReset}
                className="px-4 py-2 bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-400 hover:to-rose-400 text-slate-950 text-xs font-black rounded-xl shadow cursor-pointer transition-all active:scale-95"
              >
                🧹 Reset Cache & Clean Start
              </button>
            </div>

            {this.state.error && (
              <pre className="mt-4 p-3 bg-slate-950 rounded-lg overflow-x-auto text-[10px] text-rose-300 border border-slate-800">
                {this.state.error.message || String(this.state.error)}
              </pre>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
