import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { AnalysisResult } from "./types";

export interface SessionAnalysis {
  id: string;
  analysisId?: string;
  text: string;
  analysisType: string;
  fullAnalysis: AnalysisResult;
  timestamp: Date;
  fileName?: string;
}

interface SessionAnalysisState {
  sessions: SessionAnalysis[];
  isLoaded: boolean;

  addSession: (session: Omit<SessionAnalysis, "id" | "timestamp">, timestamp?: Date) => void;
  removeSession: (id: string) => void;
  removeSessionByAnalysisId: (analysisId: string) => void;
  clearSessions: () => void;
  clearAllSessions: () => void;
  loadFromSession: () => void;
}

const generateSessionId = () => {
  return "session-" + Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
};

export const useSessionAnalysisStore = create<SessionAnalysisState>()(
  persist(
    (set, get) => ({
      sessions: [],
      isLoaded: false,

      addSession: (sessionData, timestamp?: Date) => {
        const newSession: SessionAnalysis = {
          ...sessionData,
          id: generateSessionId(),
          timestamp: timestamp ? new Date(timestamp) : new Date(),
        };

        set((state) => ({
          sessions: [...state.sessions, newSession],
        }));
      },

      removeSession: (id) => {
        set((state) => ({
          sessions: state.sessions.filter((s) => s.id !== id),
        }));
      },

      removeSessionByAnalysisId: (analysisId) => {
        set((state) => ({
          sessions: state.sessions.filter((s) => s.analysisId !== analysisId),
        }));
      },

      clearSessions: () => {
        set({ sessions: [] });
      },

      clearAllSessions: () => {
        set({ sessions: [] });
      },

      loadFromSession: () => {

        set({ isLoaded: true });
      },
    }),
    {
      name: "session-analysis-storage",
      storage: createJSONStorage(() => sessionStorage),
      onRehydrateStorage: () => (state) => {

        if (state) {
          state.isLoaded = true;
        }
      },

      partialize: (state) => ({
        sessions: state.sessions,
      }),
    }
  )
);

export const restoreSessionDates = (sessions: SessionAnalysis[]): SessionAnalysis[] => {
  return sessions.map((session) => ({
    ...session,
    timestamp: new Date(session.timestamp),
  }));
};

export const clearAllSessionAnalyses = () => {
  useSessionAnalysisStore.getState().clearSessions();
};
