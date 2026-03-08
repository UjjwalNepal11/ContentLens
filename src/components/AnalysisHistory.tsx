"use client";

import { AnalysisHistoryFiltersComponent } from "@/components/AnalysisHistoryFilters";
import { AnalysisDetailModal } from "@/components/AnalysisDetailModal";
import { AnalysisHistoryList } from "./AnalysisHistoryList";
import { EmptyState } from "@/components/ui/empty-state";
import {
  useFilteredAndSortedHistory,
  useAnalysisHistoryActions,
} from "../lib/hooks";
import { useAnalysisHistoryStore } from "@/lib/store";
import { useState, useMemo, useEffect } from "react";
import { AnalysisHistoryItem, FilterState } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";

interface AnalysisHistoryProps {
  showClearConfirm?: boolean;
  onCloseClearConfirm?: () => void;
  initialSearch?: string;
  initialAnalysisId?: string;
}

function restoreDates(value: unknown): unknown {
  if (value === null || value === undefined) {
    return value;
  }
  if (value instanceof Date) {
    return value;
  }
  if (typeof value === 'string') {
        if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(value)) {
      return new Date(value);
    }
    return value;
  }
  if (Array.isArray(value)) {
    return value.map(item => restoreDates(item));
  }
  if (typeof value === 'object') {
    const result: Record<string, unknown> = {};
    for (const key in value) {
      result[key] = restoreDates((value as Record<string, unknown>)[key]);
    }
    return result;
  }
  return value;
}

const FILTERS_STORAGE_KEY = 'analysis_history_filters';

function getSavedFilters(): FilterState | null {
  if (typeof window === 'undefined') return null;
  try {
    const saved = localStorage.getItem(FILTERS_STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved) as FilterState;
    }
  } catch (e) {
    console.error('[AnalysisHistory] Failed to load filters from localStorage:', e);
  }
  return null;
}

function saveFilters(filters: FilterState): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(FILTERS_STORAGE_KEY, JSON.stringify(filters));
  } catch (e) {
    console.error('[AnalysisHistory] Failed to save filters to localStorage:', e);
  }
}

export function AnalysisHistory({ showClearConfirm: externalShowClearConfirm, onCloseClearConfirm, initialSearch = "", initialAnalysisId = "" }: AnalysisHistoryProps) {

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

    const [filters, setFilters] = useState<FilterState>(() => {
        const savedFilters = getSavedFilters();
    if (savedFilters) {
      return {
        ...savedFilters,
        search: initialSearch || savedFilters.search,       };
    }
    return {
      search: initialSearch,
      category: "",
      sortBy: "timestamp",
      sortOrder: "desc",
    };
  });

    const [internalShowClearConfirm, setInternalShowClearConfirm] = useState(false);
  const [clearMessage, setClearMessage] = useState("");

    const [selectedAnalysis, setSelectedAnalysis] = useState<AnalysisHistoryItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

    const { history: rawHistory, _hasHydrated, clearHistory, loadFromDatabase } = useAnalysisHistoryStore();

    useEffect(() => {
    loadFromDatabase();
  }, [loadFromDatabase]);

          const history = useMemo(() => {
        if (!rawHistory) return [];
    const restored = restoreDates(rawHistory) as AnalysisHistoryItem[];

        return restored.map(item => {
            let parsedTimestamp: Date;
      if (item.timestamp instanceof Date && !isNaN(item.timestamp.getTime())) {
        parsedTimestamp = item.timestamp;
      } else if (typeof item.timestamp === 'string') {
        parsedTimestamp = new Date(item.timestamp);
                if (isNaN(parsedTimestamp.getTime())) {
          console.warn('[AnalysisHistory] Invalid timestamp string:', item.timestamp);
          parsedTimestamp = new Date();
        }
      } else if (typeof item.timestamp === 'number') {
        parsedTimestamp = new Date(item.timestamp);
      } else {
        console.warn('[AnalysisHistory] Missing timestamp, using current date');
        parsedTimestamp = new Date();
      }

      return {
        ...item,
        timestamp: parsedTimestamp
      };
    });
  }, [rawHistory, _hasHydrated]);

  const filteredHistory = useFilteredAndSortedHistory(history, filters);
  const { handleViewDetails, handleRemoveAnalysis } = useAnalysisHistoryActions(
    setSelectedAnalysis,
    setIsModalOpen,
  );

      useEffect(() => {
        if (!_hasHydrated) return;

    if (initialAnalysisId) {
      const foundItem = history.find((item) => item.id === initialAnalysisId);
      if (foundItem) {
        setSelectedAnalysis(foundItem);
        setIsModalOpen(true);
      } else if (history.length > 0) {
                        const timer = setTimeout(() => {
          const retryItem = history.find((item) => item.id === initialAnalysisId);
          if (retryItem) {
            setSelectedAnalysis(retryItem);
            setIsModalOpen(true);
          }
        }, 100);
        return () => clearTimeout(timer);
      }
    }
  }, [initialAnalysisId, history, _hasHydrated]);

    const showClearConfirm = externalShowClearConfirm !== undefined ? externalShowClearConfirm : internalShowClearConfirm;
  const handleCloseClearConfirm = externalShowClearConfirm !== undefined
    ? () => onCloseClearConfirm?.()
    : (value: boolean) => setInternalShowClearConfirm(value);

    const updateFilters = (partialFilters: Partial<FilterState>) => {
    setFilters((prev) => {
      const newFilters = { ...prev, ...partialFilters };
            saveFilters(newFilters);
      return newFilters;
    });
  };

    const handleClearHistory = () => {
    clearHistory();
    handleCloseClearConfirm(false);
    setClearMessage("Analysis history has been cleared");
    setTimeout(() => setClearMessage(""), 3000);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
        if (initialAnalysisId || searchParams.has("analysis")) {
      const params = new URLSearchParams(searchParams.toString());
      params.delete("analysis");
      const newSearch = params.toString();
      router.replace(newSearch ? `${pathname}?${newSearch}` : pathname, { scroll: false });
    }
  };

    if (!_hasHydrated) {
    return (
      <div className="bg-white dark:bg-card p-6 rounded-lg shadow">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-foreground">
            Analysis History
          </h2>
        </div>
        <div className="animate-pulse space-y-4">
          <div className="h-32 bg-gray-200 dark:bg-gray-800 rounded-md"></div>
          <div className="h-32 bg-gray-200 dark:bg-gray-800 rounded-md"></div>
          <div className="h-32 bg-gray-200 dark:bg-gray-800 rounded-md"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-card p-6 rounded-lg shadow">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-foreground">
          Analysis History
        </h2>
        <div className="flex items-center gap-2">
          {clearMessage && (
            <span className="text-sm text-green-600 dark:text-green-400 mr-2">{clearMessage}</span>
          )}
          <AnalysisHistoryFiltersComponent
            filters={filters}
            onUpdateFilters={updateFilters}
          />
        </div>
      </div>

      {}
      {showClearConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {}
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => handleCloseClearConfirm(false)}
          />

          {}
          <div className="relative bg-white dark:bg-card rounded-lg shadow-xl max-w-md w-full mx-4 p-6 z-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
                <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-foreground">Clear Analysis History</h3>
                <p className="text-sm text-muted-foreground">This action cannot be undone</p>
              </div>
            </div>

            <p className="text-sm text-gray-600 dark:text-muted-foreground mb-6">
              Are you sure you want to clear all analysis history? This will permanently delete all your past analysis results. Analytics data will remain intact.
            </p>

            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => handleCloseClearConfirm(false)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleClearHistory}
              >
                Clear History
              </Button>
            </div>
          </div>
        </div>
      )}

      {filteredHistory.length === 0 ? (
        <EmptyState message="No analysis history found. Start by analyzing some text!" />
      ) : (
        <AnalysisHistoryList
          items={filteredHistory}
          onViewDetails={handleViewDetails}
          onRemove={handleRemoveAnalysis}
        />
      )}

      {selectedAnalysis && (
        <AnalysisDetailModal
          item={selectedAnalysis}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
}
