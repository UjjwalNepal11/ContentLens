import React, {
  useEffect,
  useMemo,
  useState,
  useCallback,
  useRef,
} from "react";
import { useSearchParams, usePathname } from "next/navigation";
import {
  AnalysisHistoryItem,
  AnalysisHistoryFilters,
  FilterState,
  ApiResponse,
  ApiError,
} from "./types";
import { useAnalysisHistoryStore, useSettingsStore } from "./store";

const getTimestamp = (item: AnalysisHistoryItem): number => {
  const ts = item.timestamp;
  if (ts instanceof Date) {
    return ts.getTime();
  }
    return new Date(ts).getTime();
};

export function useFilteredAndSortedHistory(
  history: AnalysisHistoryItem[],
  filters: AnalysisHistoryFilters,
) {
  return useMemo(() => {
    const filtered = history.filter((item: AnalysisHistoryItem) => {
      const matchesSearch =
        filters.search === "" ||
        item.text.toLowerCase().includes(filters.search.toLowerCase()) ||
        item.analysis.toLowerCase().includes(filters.search.toLowerCase()) ||
        (item.fileName &&
          item.fileName.toLowerCase().includes(filters.search.toLowerCase()));

      const matchesCategory =
        filters.category === "" ||
        filters.category === "all" ||
        (item.analysisType &&
          item.analysisType.toLowerCase() === filters.category.toLowerCase()) ||
        item.categories.some((cat: string) =>
          cat.toLowerCase() === filters.category.toLowerCase(),
        );

      return matchesSearch && matchesCategory;
    });

    filtered.sort((a: AnalysisHistoryItem, b: AnalysisHistoryItem) => {
      let comparison = 0;
      if (filters.sortBy === "timestamp") {
        comparison = getTimestamp(a) - getTimestamp(b);
      } else if (filters.sortBy === "confidence") {
        comparison = a.confidence - b.confidence;
      }

      return filters.sortOrder === "asc" ? comparison : -comparison;
    });

    return filtered;
  }, [history, filters]);
}

export function useAnalysisHistoryActions(
  setSelectedAnalysis: (item: AnalysisHistoryItem | null) => void,
  setIsModalOpen: (open: boolean) => void,
) {
  const handleViewDetails = (item: AnalysisHistoryItem) => {
    setSelectedAnalysis(item);
    setIsModalOpen(true);
  };

  const handleRemoveAnalysis = (id: string) => {
    useAnalysisHistoryStore.getState().removeAnalysis(id);
  };

  return {
    handleViewDetails,
    handleRemoveAnalysis,
  };
}

export function useModal(initialOpen: boolean = false) {
  const [isOpen, setIsOpen] = useState(initialOpen);

  const open = () => setIsOpen(true);
  const close = () => setIsOpen(false);
  const toggle = () => setIsOpen((prev: boolean) => !prev);

  return {
    isOpen,
    open,
    close,
    toggle,
  };
}

export function useFilters(initialFilters: Partial<FilterState> = {}) {
  const [filters, setFilters] = useState<FilterState>({
    search: "",
    category: "",
    sortBy: "timestamp",
    sortOrder: "desc",
    ...initialFilters,
  });

  const updateFilters = useCallback((partialFilters: Partial<FilterState>) => {
    setFilters((prev) => ({ ...prev, ...partialFilters }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters({
      search: "",
      category: "",
      sortBy: "timestamp",
      sortOrder: "desc",
    });
  }, []);

  return {
    filters,
    updateFilters,
    resetFilters,
  };
}

export function useApi<T>() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);

  const execute = useCallback(
    async (
      apiCall: () => Promise<ApiResponse<T>>,
      onSuccess?: (data: T) => void,
      onError?: (error: ApiError) => void,
    ) => {
      setLoading(true);
      setError(null);

      try {
        const response = await apiCall();

        if (response.success && response.data) {
          onSuccess?.(response.data);
        } else {
          const apiError: ApiError = {
            code: "API_ERROR",
            message: response.error || "An error occurred",
            statusCode: 500,
          };
          setError(apiError);
          onError?.(apiError);
        }
      } catch (err) {
        const apiError: ApiError = {
          code: "NETWORK_ERROR",
          message: err instanceof Error ? err.message : "Network error",
          statusCode: 0,
        };
        setError(apiError);
        onError?.(apiError);
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  return {
    loading,
    error,
    execute,
  };
}

export function useSearchURL() {
  const searchParams = useSearchParams();

  const searchQuery = searchParams.get("q") || "";
  const analysisId = searchParams.get("analysis") || "";

  return {
    searchQuery,
    analysisId,
  };
}

const SCROLL_POSITION_KEY = "scroll_positions";

function normalizePathname(pathname: string): string {
    if (pathname.length > 1 && pathname.endsWith("/")) {
    return pathname.slice(0, -1);
  }
  return pathname;
}

function getSessionScrollPosition(pathname: string): number {
  if (typeof window === "undefined") return 0;
  try {
    const normalizedPathname = normalizePathname(pathname);
    const stored = sessionStorage.getItem(SCROLL_POSITION_KEY);
    if (stored) {
      const positions = JSON.parse(stored);
            return positions[normalizedPathname] || positions[pathname] || 0;
    }
  } catch (e) {
    console.error("[ScrollRestore] Failed to read from sessionStorage:", e);
  }
  return 0;
}

function setSessionScrollPosition(pathname: string, position: number): void {
  if (typeof window === "undefined") return;
  try {
    const normalizedPathname = normalizePathname(pathname);
    const stored = sessionStorage.getItem(SCROLL_POSITION_KEY);
    const positions = stored ? JSON.parse(stored) : {};
    positions[normalizedPathname] = position;
        if (normalizedPathname !== pathname) {
      positions[pathname] = position;
    }
    sessionStorage.setItem(SCROLL_POSITION_KEY, JSON.stringify(positions));
  } catch (e) {
    console.error("[ScrollRestore] Failed to save to sessionStorage:", e);
  }
}

export function useScrollRestore() {
  const pathname = usePathname();
  const normalizedPathname = normalizePathname(pathname);
  const { setScrollPosition, _hasHydrated } = useSettingsStore();
  const isRestored = useRef(false);
  const targetPositionRef = useRef<number | null>(null);
  const lastScrollPos = useRef(0);
    const currentWindowPathRef = useRef(typeof window !== "undefined" ? window.location.pathname : "");

    useEffect(() => {
    isRestored.current = false;
    targetPositionRef.current = null;
    if (typeof window !== "undefined") {
      currentWindowPathRef.current = window.location.pathname;
    }
  }, [normalizedPathname]);

    useEffect(() => {
        if (typeof window !== 'undefined' && 'scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }

        if (isRestored.current) return;

    const restoreScroll = () => {
                  let targetPosition = targetPositionRef.current;

      if (targetPosition === null || targetPosition === 0) {
        const sessionPosition = getSessionScrollPosition(normalizedPathname);
        const dbPosition = _hasHydrated
          ? useSettingsStore.getState().getScrollPosition(normalizedPathname)
          : 0;

        targetPosition = sessionPosition || dbPosition;

                if (targetPosition > 0) {
          targetPositionRef.current = targetPosition;
        }
      }

      if (targetPosition > 0) {
                if (Math.abs(window.scrollY - targetPosition) < 50) {
          isRestored.current = true;
          return true;
        }

                window.scrollTo(0, targetPosition);

                if (Math.abs(window.scrollY - targetPosition) < 50) {
          console.log(
            "[ScrollRestore] Restored position:",
            targetPosition,
            "for path:",
            normalizedPathname
          );
          isRestored.current = true;
          return true;
        }
      }
      else {
                isRestored.current = true;
      }
      return false;
    };

        restoreScroll();

        const observer = new ResizeObserver(() => {
      if (!isRestored.current) {
        restoreScroll();
      }
    });

    if (document.body) {
      observer.observe(document.body);
    }

        const timeouts = [
      setTimeout(restoreScroll, 100),
      setTimeout(restoreScroll, 300),
      setTimeout(restoreScroll, 600),
      setTimeout(restoreScroll, 1000),
      setTimeout(restoreScroll, 2000),
    ];

    return () => {
      observer.disconnect();
      timeouts.forEach(clearTimeout);
    };
  }, [normalizedPathname, _hasHydrated]);

    useEffect(() => {
        if (typeof window === "undefined") return;

        lastScrollPos.current = window.scrollY;

        let scrollTimeout: NodeJS.Timeout;
    const handleScroll = () => {
            if (window.location.pathname !== currentWindowPathRef.current) {
        return;
      }

      lastScrollPos.current = window.scrollY;

            clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
                        if (!isRestored.current && targetPositionRef.current && targetPositionRef.current > 0) {
          if (window.scrollY < 50) {
            return;
          }
        }

                setSessionScrollPosition(normalizedPathname, window.scrollY);
                setScrollPosition(normalizedPathname, window.scrollY);
      }, 100);
    };

        const handlePageHide = () => {
      setSessionScrollPosition(normalizedPathname, window.scrollY);
      setScrollPosition(normalizedPathname, window.scrollY);
    };

        const handleBeforeUnload = () => {
      setSessionScrollPosition(normalizedPathname, window.scrollY);
      setScrollPosition(normalizedPathname, window.scrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("pagehide", handlePageHide);
    window.addEventListener("beforeunload", handleBeforeUnload);

        return () => {
      clearTimeout(scrollTimeout);

                        const currentScroll = window.scrollY;
      const posToSave = currentScroll > 0 ? currentScroll : lastScrollPos.current;

                  if (!isRestored.current && targetPositionRef.current && targetPositionRef.current > 0 && posToSave < 50) {
               } else {
         setSessionScrollPosition(normalizedPathname, posToSave);
         setScrollPosition(normalizedPathname, posToSave);
      }

      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("pagehide", handlePageHide);
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [normalizedPathname, setScrollPosition]);
}
