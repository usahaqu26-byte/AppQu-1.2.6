import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Trash2, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('AppQu ErrorBoundary caught an error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleResetCache = () => {
    try {
      localStorage.removeItem('appqu_current_user_v1');
      sessionStorage.clear();
    } catch (e) {
      console.warn('Failed clearing cache:', e);
    }
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen min-h-[100dvh] w-full bg-stone-900 text-stone-100 flex flex-col items-center justify-center p-6 text-center select-none font-sans">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-4 shadow-lg">
            <AlertTriangle className="w-8 h-8" />
          </div>

          <h1 className="text-xl font-bold text-white mb-2">
            Terjadi Kendala Memuat Aplikasi
          </h1>
          <p className="text-sm text-stone-300 max-w-sm mb-6 leading-relaxed">
            Sistem mendeteksi kendala pada cache atau data awal. Silakan pilih opsi pemulihan di bawah ini.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 w-full max-w-xs mb-6">
            <button
              onClick={this.handleReload}
              className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-semibold text-sm transition-all shadow-md cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Muat Ulang</span>
            </button>
            <button
              onClick={this.handleResetCache}
              className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-stone-800 hover:bg-stone-700 active:scale-95 text-stone-200 border border-stone-700 font-semibold text-sm transition-all shadow-sm cursor-pointer"
            >
              <Trash2 className="w-4 h-4 text-red-400" />
              <span>Reset Cache</span>
            </button>
          </div>

          {this.state.error && (
            <div className="w-full max-w-md bg-stone-950/80 border border-stone-800 rounded-xl p-3 text-left">
              <p className="text-xs font-mono text-red-400 mb-1 break-all">
                {this.state.error.toString()}
              </p>
              {this.state.errorInfo && (
                <pre className="text-[10px] text-stone-500 overflow-x-auto max-h-32 mt-1">
                  {this.state.errorInfo.componentStack}
                </pre>
              )}
            </div>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}
