import React, { useState, useEffect, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

export const ErrorBoundary: React.FC<Props> = ({ children }) => {
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      setError(event.error || new Error(event.message));
    };
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      setError(new Error(event.reason?.message || String(event.reason)));
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 max-w-lg w-full shadow-xl border border-slate-200 text-center space-y-6">
          <div className="w-16 h-16 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
            <AlertTriangle className="w-8 h-8" />
          </div>
          
          <div className="space-y-2">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Something went wrong</h1>
            <p className="text-sm text-slate-600">
              The application encountered an unexpected runtime error. We've caught it to prevent a blank screen.
            </p>
          </div>

          <div className="bg-slate-900 text-red-400 p-4 rounded-xl text-left text-xs font-mono overflow-auto max-h-40 border border-slate-800">
            <p className="font-bold">{error.toString()}</p>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={() => {
                try {
                  localStorage.clear();
                } catch {
                  // ignore
                }
                window.location.reload();
              }}
              className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold py-3 px-4 rounded-xl text-sm transition-colors cursor-pointer"
            >
              Clear Data & Reload
            </button>
            <button
              onClick={() => window.location.reload()}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-4 rounded-xl text-sm shadow-lg shadow-emerald-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              Reload Page
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
