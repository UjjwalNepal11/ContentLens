import { create } from "zustand";
import { AnalysisHistoryItem, AnalysisHistoryFilters, AnalysisResult } from "./types";
import { useSessionAnalysisStore } from "./session-store";

// Helper function to generate unique ID
const generateId = () => Date.now().toString() + Math.random().toString(36).substr(2, 9);

const DELETED_NOTIFICATIONS_KEY = 'deleted_notification_ids';

const loadDeletedIdsFromSession = (): Set<string> => {
  if (typeof window === 'undefined') return new Set();

  try {
    const stored = sessionStorage.getItem(DELETED_NOTIFICATIONS_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return new Set(parsed);
    }
  } catch (e) {
    console.error("[Notifications] Failed to load deletedIds from sessionStorage:", e);
  }
  return new Set();
};

const saveDeletedIdsToSession = (deletedIds: Set<string>) => {
  if (typeof window === 'undefined') return;

  try {
    const array = Array.from(deletedIds);
    sessionStorage.setItem(DELETED_NOTIFICATIONS_KEY, JSON.stringify(array));
  } catch (e) {
    console.error("[Notifications] Failed to save deletedIds to sessionStorage:", e);
  }
};

interface SettingsState {
  sidebarCollapsed: boolean;
  scrollPositions: Record<string, number>;
  theme: string;
  language: string;
  notifications: boolean;
  emailNotifications: boolean;
  autoSave: boolean;
  privacyMode: boolean;
  _hasHydrated: boolean;
  _isLoading: boolean;

  setSidebarCollapsed: (collapsed: boolean) => Promise<void>;
  setScrollPosition: (pathname: string, position: number) => Promise<void>;
  getScrollPosition: (pathname: string) => number;
  setTheme: (theme: string) => Promise<void>;
  setLanguage: (language: string) => Promise<void>;
  setNotifications: (enabled: boolean) => Promise<void>;
  setEmailNotifications: (enabled: boolean) => Promise<void>;
  setAutoSave: (enabled: boolean) => Promise<void>;
  setPrivacyMode: (enabled: boolean) => Promise<void>;
  loadFromDatabase: () => Promise<void>;
  setHasHydrated: (state: boolean) => void;
}

export const useSettingsStore = create<SettingsState>()((set, get) => ({
  sidebarCollapsed: false,
  scrollPositions: {},
  theme: "light",
  language: "en",
  notifications: true,
  emailNotifications: true,
  autoSave: true,
  privacyMode: false,
  _hasHydrated: false,
  _isLoading: false,

  loadFromDatabase: async () => {
    const state = get();
    if (state._isLoading) return;

    set({ _isLoading: true });

    try {
      const response = await fetch('/api/settings');
      const result = await response.json();

      if (result.success && result.data) {
        set({
          sidebarCollapsed: result.data.sidebarCollapsed || false,
          scrollPositions: result.data.scrollPositions || {},
          theme: result.data.theme || "light",
          language: result.data.language || "en",
          notifications: result.data.notifications !== false,
          emailNotifications: result.data.emailNotifications !== false,
          autoSave: result.data.autoSave !== false,
          privacyMode: result.data.privacyMode || false,
          _hasHydrated: true,
        });
        console.log("[Settings] Loaded from database");
      }
    } catch (error) {
      console.error("[Settings] Failed to load from database:", error);
      set({ _hasHydrated: true });
    } finally {
      set({ _isLoading: false });
    }
  },

  setSidebarCollapsed: async (collapsed) => {
    set({ sidebarCollapsed: collapsed });

    try {
      await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sidebarCollapsed: collapsed }),
      });
    } catch (error) {
      console.error("[Settings] Failed to save sidebar state:", error);
    }
  },

  setScrollPosition: async (pathname, position) => {
    const newPositions = { ...get().scrollPositions, [pathname]: position };
    set({ scrollPositions: newPositions });

    if (typeof window !== 'undefined') {
      try {
        const stored = sessionStorage.getItem('scroll_positions');
        const sessionPositions = stored ? JSON.parse(stored) : {};
        sessionPositions[pathname] = position;
        sessionStorage.setItem('scroll_positions', JSON.stringify(sessionPositions));
      } catch (e) {
        console.error("[Settings] Failed to save scroll to sessionStorage:", e);
      }
    }

    try {
      await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scrollPositions: newPositions }),
      });
    } catch (error) {
      console.error("[Settings] Failed to save scroll position:", error);
    }
  },

  getScrollPosition: (pathname) => {
    return get().scrollPositions[pathname] || 0;
  },

  setTheme: async (theme) => {
    set({ theme });
    try {
      await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ theme }),
      });
    } catch (error) {
      console.error("[Settings] Failed to save theme:", error);
    }
  },

  setLanguage: async (language) => {
    set({ language });
    try {
      await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ language }),
      });
    } catch (error) {
      console.error("[Settings] Failed to save language:", error);
    }
  },

  setNotifications: async (enabled) => {
    set({ notifications: enabled });
    try {
      await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notifications: enabled }),
      });
    } catch (error) {
      console.error("[Settings] Failed to save notifications setting:", error);
    }
  },

  setEmailNotifications: async (enabled) => {
    set({ emailNotifications: enabled });
    try {
      await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emailNotifications: enabled }),
      });
    } catch (error) {
      console.error("[Settings] Failed to save email notifications setting:", error);
    }
  },

  setAutoSave: async (enabled) => {
    set({ autoSave: enabled });
    try {
      await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ autoSave: enabled }),
      });
    } catch (error) {
      console.error("[Settings] Failed to save autoSave setting:", error);
    }
  },

  setPrivacyMode: async (enabled) => {
    set({ privacyMode: enabled });
    try {
      await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ privacyMode: enabled }),
      });
    } catch (error) {
      console.error("[Settings] Failed to save privacy mode setting:", error);
    }
  },

  setHasHydrated: (state) => set({ _hasHydrated: state }),
}));

interface Notification {
  id: string;
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  type: "info" | "success" | "warning" | "error";
}

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  isNotificationsEnabled: boolean;
  _hasHydrated: boolean;
  _isLoading: boolean;
  deletedIds: Set<string>;

  addNotification: (notification: Omit<Notification, "id" | "timestamp" | "read">) => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  removeNotification: (id: string) => Promise<void>;
  clearAllNotifications: () => Promise<void>;
  toggleNotifications: () => Promise<void>;
  loadFromDatabase: () => Promise<void>;
}

export const useNotificationStore = create<NotificationState>()((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isNotificationsEnabled: true,
  _hasHydrated: false,
  _isLoading: false,
  deletedIds: loadDeletedIdsFromSession(),

  loadFromDatabase: async () => {
    const state = get();
    if (state._isLoading) return;

    set({ _isLoading: true });

    try {
      const response = await fetch('/api/notifications');
      const result = await response.json();

      if (result.success) {
        const { deletedIds } = get();
        const notifications: Notification[] = (result.data || [])
          .map((n: any) => ({
            id: n.id,
            title: n.title,
            message: n.message,
            timestamp: new Date(n.createdAt),
            read: n.read,
            type: n.type || "info",
          }))
          .filter((n: Notification) => !deletedIds.has(n.id));

        set({
          notifications,
          unreadCount: result.unreadCount || 0,
          _hasHydrated: true,
        });
        console.log(`[Notifications] Loaded ${notifications.length} from database`);
      }
    } catch (error) {
      console.error("[Notifications] Failed to load from database:", error);
      set({ _hasHydrated: true });
    } finally {
      set({ _isLoading: false });
    }
  },

  addNotification: async (notification) => {
    const newNotification: Notification = {
      ...notification,
      id: generateId(),
      timestamp: new Date(),
      read: false,
    };

    set((state) => ({
      notifications: [newNotification, ...state.notifications],
      unreadCount: state.unreadCount + 1,
    }));

    try {
      const response = await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: notification.title,
          message: notification.message,
          type: notification.type,
        }),
      });
      const result = await response.json();

      if (result.success && result.data) {
        set((state) => ({
          notifications: state.notifications.map((n) =>
            n.id === newNotification.id ? { ...n, id: result.data.id } : n
          ),
        }));
      }
    } catch (error) {
      console.error("[Notifications] Failed to save to database:", error);
    }
  },

  markAsRead: async (id) => {
    set((state) => {
      const notification = state.notifications.find((n) => n.id === id);
      if (notification && !notification.read) {
        return {
          notifications: state.notifications.map((n) =>
            n.id === id ? { ...n, read: true } : n
          ),
          unreadCount: Math.max(0, state.unreadCount - 1),
        };
      }
      return state;
    });

    try {
      await fetch('/api/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, read: true }),
      });
    } catch (error) {
      console.error("[Notifications] Failed to mark as read:", error);
    }
  },

  markAllAsRead: async () => {
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, read: true })),
      unreadCount: 0,
    }));

    try {
      await fetch('/api/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markAllRead: true }),
      });
    } catch (error) {
      console.error("[Notifications] Failed to mark all as read:", error);
    }
  },

  removeNotification: async (id) => {
    set((state) => {
      const notification = state.notifications.find((n) => n.id === id);
      const newDeletedIds = new Set(state.deletedIds);
      newDeletedIds.add(id);
      saveDeletedIdsToSession(newDeletedIds);

      return {
        notifications: state.notifications.filter((n) => n.id !== id),
        unreadCount: notification && !notification.read
          ? Math.max(0, state.unreadCount - 1)
          : state.unreadCount,
        deletedIds: newDeletedIds,
      };
    });

    try {
      await fetch(`/api/notifications?id=${id}`, {
        method: 'DELETE',
      });
    } catch (error) {
      console.error("[Notifications] Failed to delete:", error);
    }
  },

  clearAllNotifications: async () => {
    const { notifications } = get();
    const allIds = notifications.map((n) => n.id);

    set((state) => {
      const newDeletedIds = new Set(state.deletedIds);
      allIds.forEach((id) => newDeletedIds.add(id));
      saveDeletedIdsToSession(newDeletedIds);
      return { notifications: [], unreadCount: 0, deletedIds: newDeletedIds };
    });

    try {
      await fetch('/api/notifications?clearAll=true', {
        method: 'DELETE',
      });
    } catch (error) {
      console.error("[Notifications] Failed to clear all:", error);
    }
  },

  toggleNotifications: async () => {
    const newValue = !get().isNotificationsEnabled;
    set({ isNotificationsEnabled: newValue });

    try {
      await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notifications: newValue }),
      });
    } catch (error) {
      console.error("[Notifications] Failed to toggle notifications:", error);
    }
  },
}));

interface AnalysisHistoryState {
  history: AnalysisHistoryItem[];
  filters: AnalysisHistoryFilters;
  _hasHydrated: boolean;
  _isLoading: boolean;
  _isLoadingFromDb: boolean;
  addAnalysis: (item: Omit<AnalysisHistoryItem, "id" | "timestamp">, id?: string, timestamp?: Date) => Promise<void>;
  removeAnalysis: (id: string) => Promise<void>;
  updateFilters: (filters: Partial<AnalysisHistoryFilters>) => void;
  clearHistory: () => Promise<void>;
  setHasHydrated: (state: boolean) => void;
  loadFromDatabase: () => Promise<void>;
}

export type ActivityType = "analysis" | "sign_in" | "sign_up" | "sign_out" | "search";

export interface ActivityRecord {
  id: string;
  type: ActivityType;
  timestamp: Date;
  details?: {
    analysisType?: string;
    confidence?: number;
    categories?: string[];
    textLength?: number;
  };
}

interface ActivityTrackerState {
  activities: ActivityRecord[];
  _isLoading: boolean;
  _isLoadingFromDb: boolean;
  recordActivity: (activity: Omit<ActivityRecord, "id" | "timestamp">) => Promise<void>;
  getActivitiesByDateRange: (startDate: Date, endDate: Date) => ActivityRecord[];
  getDailyUsageStats: (days: number) => { date: string; count: number; type: ActivityType }[];
  getTotalActivities: () => number;
  getActivitiesByType: (type: ActivityType) => ActivityRecord[];
  clearActivities: () => Promise<void>;
  loadFromDatabase: () => Promise<void>;
}

const defaultFilters: AnalysisHistoryFilters = {
  search: "",
  category: "",
  sortBy: "timestamp",
  sortOrder: "desc",
};

const generateTextBasedId = (text: string, categories: string[] = []) => {
  const skipWords = ['the', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'must', 'shall', 'can', 'need', 'dare', 'ought', 'used', 'to', 'of', 'in', 'for', 'on', 'with', 'at', 'by', 'from', 'as', 'into', 'through', 'during', 'before', 'after', 'above', 'below', 'between', 'under', 'again', 'further', 'then', 'once', 'here', 'there', 'when', 'where', 'why', 'how', 'all', 'each', 'few', 'more', 'most', 'other', 'some', 'such', 'no', 'nor', 'not', 'only', 'own', 'same', 'so', 'than', 'too', 'very', 'just', 'and', 'but', 'if', 'or', 'because', 'until', 'while'];

  const words = text.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/);
  let firstWord = '';
  for (const word of words) {
    if (word.length >= 2 && !skipWords.includes(word)) {
      firstWord = word;
      break;
    }
  }

  const firstCategory = categories.length > 0 ? categories[0].toLowerCase().replace(/[^a-z]/g, '').slice(0, 3) : 'gen';
  const wordPrefix = firstWord.slice(0, 3) || 'gen';
  const prefix = `${wordPrefix}-${firstCategory}`;

  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    const char = text.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  const shortHash = Math.abs(hash).toString(36).slice(-2);

  return `${prefix}${shortHash}`;
};

export const useAnalysisHistoryStore = create<AnalysisHistoryState>()(
  (set, get) => ({
    history: [],
    filters: defaultFilters,
    _hasHydrated: false,
    _isLoading: false,
    _isLoadingFromDb: false,
    setHasHydrated: (state) => set({ _hasHydrated: state }),

loadFromDatabase: async () => {
      const state = get();
      if (state._isLoadingFromDb) return;

      set({ _isLoadingFromDb: true });

      try {
        const response = await fetch('/api/history?limit=50');
        const result = await response.json();

        if (result.success && result.data) {
          const historyItems: AnalysisHistoryItem[] = result.data
            .map((item: any) => {
              // CRITICAL: Use createdAt from the database as the source of truth for when analysis was performed
              // The API returns createdAt in ISO string format from the database
              let parsedTimestamp: Date;

              const timestampValue = item.createdAt || item.timestamp;

              if (timestampValue) {

                if (typeof timestampValue === 'string') {
                  parsedTimestamp = new Date(timestampValue);
                } else if (timestampValue instanceof Date) {
                  parsedTimestamp = timestampValue;
                } else {
                  parsedTimestamp = new Date(timestampValue);
                }

                if (isNaN(parsedTimestamp.getTime())) {
                  console.warn('[History] Invalid timestamp from database:', timestampValue);
                  parsedTimestamp = new Date();
                }
              } else {
                console.warn('[History] No timestamp found, using current date');
                parsedTimestamp = new Date();
              }

              return {
                id: item.id,
                text: item.text,
                analysis: item.analysis,
                confidence: item.confidence,
                categories: item.categories || [],
                analysisType: item.analysisType || 'general',

                timestamp: parsedTimestamp,
                createdAt: parsedTimestamp,
                fullAnalysis: item.fullAnalysis as AnalysisResult | undefined,
                fileName: item.fileName,
              };
            });

          set({ history: historyItems, _hasHydrated: true });

          const timestampLogs = historyItems.map(h => {
            const ts = h.timestamp;
            return ts instanceof Date ? ts.toISOString() : (typeof ts === 'string' ? ts : String(ts));
          });
          console.log(`[History] Loaded ${historyItems.length} items from database with createdAt timestamps:`, timestampLogs);
        }
      } catch (error) {
        console.error("[History] Failed to load from database:", error);
        set({ _hasHydrated: true });
      } finally {
        set({ _isLoadingFromDb: false });
      }
    },

    addAnalysis: async (item, id?: string, timestamp?: Date) => {
      const newItem: AnalysisHistoryItem = {
        ...item,
        id: id || generateTextBasedId(item.text, item.categories),
        timestamp: timestamp ? new Date(timestamp) : new Date(),
      };

      set((state) => ({
        history: [...state.history, newItem],
      }));

      try {
        await useActivityTrackerStore.getState().recordActivity({
          type: "analysis",
          details: {
            analysisType: item.analysisType,
            confidence: item.confidence,
            categories: item.categories,
            textLength: item.text.length,
          },
        });
      } catch (error) {
        console.error("[History] Failed to record activity:", error);
      }
    },

    removeAnalysis: async (id) => {

      useSessionAnalysisStore.getState().removeSessionByAnalysisId(id);

      set((state) => ({
        history: state.history.filter((item) => item.id !== id),
      }));

      try {
        await fetch(`/api/analyses?id=${encodeURIComponent(id)}`, {
          method: 'DELETE',
        });
      } catch (error) {
        console.error("[History] Failed to delete from database:", error);
      }
    },

    updateFilters: (newFilters) => {
      set((state) => ({
        filters: { ...state.filters, ...newFilters },
      }));
    },

    clearHistory: async () => {

      useSessionAnalysisStore.getState().clearSessions();

      set({ history: [] });

      try {
        await fetch('/api/analyses?clearAll=true', {
          method: 'DELETE',
        });
      } catch (error) {
        console.error("[History] Failed to clear all from database:", error);
      }
    },
  })
);

export const notifyAnalysisSuccess = (analysisType?: string) => {
  const { addNotification, isNotificationsEnabled } = useNotificationStore.getState();

  if (!isNotificationsEnabled) return;

  const typeLabel = analysisType ? getAnalysisTypeLabel(analysisType) : 'text analysis';

  addNotification({
    title: "Analysis Complete",
    message: `Your ${typeLabel} has been completed successfully.`,
    type: "success",
  });
};

export const notifyAnalysisError = (errorMessage?: string) => {
  const { addNotification, isNotificationsEnabled } = useNotificationStore.getState();

  if (!isNotificationsEnabled) return;

  addNotification({
    title: "Analysis Failed",
    message: errorMessage || "An error occurred during analysis. Please try again.",
    type: "error",
  });
};

export const notifySignIn = (email?: string) => {
  const { addNotification, isNotificationsEnabled } = useNotificationStore.getState();

  useActivityTrackerStore.getState().recordActivity({
    type: "sign_in",
    details: { analysisType: email },
  });

  if (!isNotificationsEnabled) return;

  const displayEmail = email || 'your account';

  addNotification({
    title: "Signed In",
    message: `You have successfully signed in to ${displayEmail}.`,
    type: "info",
  });
};

export const notifySignUp = (email?: string) => {
  const { addNotification, isNotificationsEnabled } = useNotificationStore.getState();

  useActivityTrackerStore.getState().recordActivity({
    type: "sign_up",
    details: { analysisType: email },
  });

  if (!isNotificationsEnabled) return;

  const displayEmail = email || 'your account';

  addNotification({
    title: "Welcome!",
    message: `Your account ${displayEmail} has been created successfully. Get started by analyzing your first text!`,
    type: "success",
  });
};

export const notifySignOut = () => {
  const { addNotification, isNotificationsEnabled } = useNotificationStore.getState();

  useActivityTrackerStore.getState().recordActivity({
    type: "sign_out",
  });

  if (!isNotificationsEnabled) return;

  addNotification({
    title: "Signed Out",
    message: "You have been signed out successfully.",
    type: "info",
  });
};

export const backupAllData = () => {
  console.log("[Store] Data backup triggered (all data is database-backed)");
};

function getAnalysisTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    general: 'general analysis',
    sentiment: 'sentiment analysis',
    grammar: 'grammar check',
    summarization: 'text summarization',
  };
  return labels[type.toLowerCase()] || 'analysis';
}

export const useActivityTrackerStore = create<ActivityTrackerState>()(
  (set, get) => ({
    activities: [],
    _isLoading: false,
    _isLoadingFromDb: false,

    loadFromDatabase: async () => {
      const state = get();
      if (state._isLoadingFromDb) return;

      set({ _isLoadingFromDb: true });

      try {
        const response = await fetch('/api/activities');
        const result = await response.json();

        if (result.success && result.data) {
          const activityRecords: ActivityRecord[] = result.data
            .map((item: any) => ({
              id: item.id,
              type: item.type as ActivityType,
              timestamp: new Date(item.timestamp),
              details: item.details,
            }));

          set({ activities: activityRecords });
          console.log(`[Activity] Loaded ${activityRecords.length} records from database`);
        }
      } catch (error) {
        console.error("[Activity] Failed to load from database:", error);
      } finally {
        set({ _isLoadingFromDb: false });
      }
    },

    recordActivity: async (activity) => {
      const newActivity: ActivityRecord = {
        ...activity,
        id: generateId(),
        timestamp: new Date(),
      };

      set((state) => ({
        activities: [newActivity, ...state.activities],
      }));

      try {
        await fetch('/api/activities', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: activity.type,
            details: activity.details,
          }),
        });
      } catch (error) {
        console.error("[Activity] Failed to save to database:", error);
      }
    },

    getActivitiesByDateRange: (startDate: Date, endDate: Date) => {
      const { activities } = get();
      return activities.filter(
        (activity) =>
          activity.timestamp >= startDate && activity.timestamp <= endDate
      );
    },

    getDailyUsageStats: (days: number) => {
      const { activities } = get();
      const now = new Date();
      const stats: { date: string; count: number; type: ActivityType }[] = [];

      for (let i = days - 1; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        date.setHours(0, 0, 0, 0);

        const nextDate = new Date(date);
        nextDate.setDate(nextDate.getDate() + 1);

        const dayActivities = activities.filter(
          (activity) => activity.timestamp >= date && activity.timestamp < nextDate
        );

        stats.push({
          date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
          count: dayActivities.length,
          type: "analysis",
        });
      }

      return stats;
    },

    getTotalActivities: () => {
      return get().activities.length;
    },

    getActivitiesByType: (type: ActivityType) => {
      return get().activities.filter((activity) => activity.type === type);
    },

    clearActivities: async () => {
      set({ activities: [] });

      try {
        await fetch('/api/activities?clearAll=true', {
          method: 'DELETE',
        });
      } catch (error) {
        console.error("[Activity] Failed to clear all from database:", error);
      }
    },
  })
);

export const useSidebarStore = useSettingsStore;

export const useScrollPositionStore = {
  setScrollPosition: (pathname: string, position: number) =>
    useSettingsStore.getState().setScrollPosition(pathname, position),
  getScrollPosition: (pathname: string) =>
    useSettingsStore.getState().scrollPositions[pathname] || 0,
};
