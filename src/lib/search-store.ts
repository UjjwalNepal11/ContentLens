import { create } from "zustand";
import { AnalysisHistoryItem } from "./types";

interface SearchState {
  isSearchOpen: boolean;
  searchQuery: string;
  searchResults: AnalysisHistoryItem[];
  _isSearching: boolean;
  setSearchOpen: (open: boolean) => void;
  setSearchQuery: (query: string) => void;
  performSearch: (query: string) => Promise<void>;
  clearSearch: () => void;
}

export const useSearchStore = create<SearchState>((set) => ({
  isSearchOpen: false,
  searchQuery: "",
  searchResults: [],
  _isSearching: false,

  setSearchOpen: (open) => set({ isSearchOpen: open }),

  setSearchQuery: (query) => set({ searchQuery: query }),

  performSearch: async (query) => {
    if (!query.trim()) {
      set({ searchResults: [], searchQuery: query });
      return;
    }

    set({ searchQuery: query, _isSearching: true });

    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(query)}&limit=20`);
      const result = await response.json();

      if (result.success && result.data) {
        const searchResults: AnalysisHistoryItem[] = result.data.map((item: { id: string; text: string; analysis: string; confidence: number; categories?: string[]; timestamp: string; analysisType?: string; fileName?: string }) => ({
          id: item.id,
          text: item.text,
          analysis: item.analysis,
          confidence: item.confidence,
          categories: item.categories || [],
          timestamp: new Date(item.timestamp),
          analysisType: item.analysisType || 'general',
          fileName: item.fileName,
        }));

        set({ searchResults, _isSearching: false });
        console.log(`[Search] Found ${searchResults.length} results for "${query}"`);
      } else {
        set({ searchResults: [], _isSearching: false });
      }
    } catch (error) {
      console.error("[Search] Failed to search:", error);
      set({ searchResults: [], _isSearching: false });
    }
  },

  clearSearch: () => set({ searchQuery: "", searchResults: [], isSearchOpen: false }),
}));
