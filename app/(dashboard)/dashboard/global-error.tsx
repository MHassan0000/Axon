"use client";

import React from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  React.useEffect(() => {
    console.error("Global dashboard error:", error);
  }, [error]);

  return (
    <html>
      <body>
        <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-50 dark:bg-black p-8">
          <div className="max-w-md w-full text-center">
            <div className="mb-6 flex justify-center">
              <div className="p-4 rounded-full bg-red-100 dark:bg-red-900/30">
                <AlertTriangle className="w-12 h-12 text-red-600 dark:text-red-400" />
              </div>
            </div>

            <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">
              Critical Error
            </h1>
            <p className="text-zinc-600 dark:text-zinc-400 mb-6">
              A critical error occurred. Please refresh the page to continue.
            </p>

            {error.digest && (
              <p className="text-xs text-zinc-400 dark:text-zinc-500 mb-6 font-mono">
                Error ID: {error.digest}
              </p>
            )}

            <button
              onClick={reset}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-zinc-900 dark:bg-white text-white dark:text-black rounded-lg text-sm font-medium hover:bg-zinc-700 dark:hover:bg-zinc-200 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh Page
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
