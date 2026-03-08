"use client";

import { AnalysisHistory } from "@/components/AnalysisHistory";
import { useAnalysisHistoryStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { useState } from "react";
import { useSearchURL } from "@/lib/hooks";

export const dynamic = 'force-dynamic';

export default function HistoryPage() {
  const { history: rawHistory, _hasHydrated } = useAnalysisHistoryStore();
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const { searchQuery, analysisId } = useSearchURL();

  const hasHistory = rawHistory && rawHistory.length > 0;

  return (
    <div className="space-y-6 px-4 sm:px-6 lg:px-8">
      {}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-fadeInDown">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent inline-block">
            Analysis History
          </h1>
          <p className="text-muted-foreground mt-2">
            View and manage your past analysis results
          </p>
        </div>
        <div className="flex items-center gap-2">
          {hasHistory && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowClearConfirm(true)}
              className="flex items-center gap-2 transition-all duration-200 hover:scale-105 hover:bg-red-50 hover:border-red-200 dark:hover:bg-red-950/30"
            >
              <Trash2 className="h-4 w-4 transition-transform duration-200 hover:rotate-12" />
              Clear All
            </Button>
          )}
        </div>
      </div>

      <AnalysisHistory
        showClearConfirm={showClearConfirm}
        onCloseClearConfirm={() => setShowClearConfirm(false)}
        initialSearch={searchQuery}
        initialAnalysisId={analysisId}
      />
    </div>
  );
}
