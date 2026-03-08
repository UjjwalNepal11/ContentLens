"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
      <div className="text-center space-y-6 max-w-md mx-auto px-4">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100">
            Something went wrong
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            We encountered an unexpected error. Please try again.
          </p>
        </div>

        <div className="space-y-4">
          <Button onClick={reset} className="w-full">
            Try Again
          </Button>
          <Button
            variant="outline"
            onClick={() => (window.location.href = "/dashboard")}
            className="w-full"
          >
            Go to Dashboard
          </Button>
        </div>

        {process.env.NODE_ENV === "development" && (
          <details className="text-left bg-slate-100 dark:bg-slate-800 p-4 rounded-lg">
            <summary className="cursor-pointer font-medium">
              Error Details
            </summary>
            <pre className="mt-2 text-sm text-red-600 dark:text-red-400 whitespace-pre-wrap">
              {error.message}
            </pre>
          </details>
        )}
      </div>
    </div>
  );
}
