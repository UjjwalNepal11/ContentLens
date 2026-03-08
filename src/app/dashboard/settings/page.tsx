"use client";

import { ThemeToggle } from "@/components/settings/ThemeToggle";
import { UserProfileSection } from "@/components/settings/UserProfileSection";
import { AccountStatusSection } from "@/components/settings/AccountStatusSection";
import { LogoutSection } from "@/components/settings/LogoutSection";
import { DeleteAccountSection } from "@/components/settings/DeleteAccountSection";
import { useNotificationStore, useAnalysisHistoryStore, useActivityTrackerStore } from "@/lib/store";
import { useSessionAnalysisStore } from "@/lib/session-store";
import { Button } from "@/components/ui/button";
import { Bell, BellOff, Trash2, AlertTriangle } from "lucide-react";
import { useState } from "react";

export const dynamic = 'force-dynamic';

export default function SettingsPage() {
  const { isNotificationsEnabled, toggleNotifications } = useNotificationStore();
  const { clearHistory } = useAnalysisHistoryStore();
  const { clearActivities } = useActivityTrackerStore();
  const { clearSessions } = useSessionAnalysisStore();

    const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [clearMessage, setClearMessage] = useState("");

    const handleClearAllData = () => {
    clearHistory();
    clearActivities();
    clearSessions();
    setShowClearConfirm(false);
    setClearMessage("All data has been cleared successfully");
    setTimeout(() => setClearMessage(""), 3000);
  };

  return (
    <div className="space-y-6 px-4 sm:px-6 lg:px-8">
      {}
      <div className="mb-8 animate-fadeInDown">
        <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent inline-block">
          Settings
        </h1>
        <p className="text-muted-foreground mt-2">
          Manage your account preferences and settings
        </p>
      </div>

      <div className="space-y-8">
        {}
        <div className="p-6 border rounded-xl bg-card hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-cyan-500/10 to-violet-500/10 rounded-full -mr-10 -mt-10 transition-transform group-hover:scale-150"></div>
          <h2 className="text-xl font-semibold text-foreground mb-4 relative">Appearance</h2>
          <div className="flex items-center justify-between relative">
            <span className="text-sm font-medium text-foreground">Theme:</span>
            <ThemeToggle />
          </div>
        </div>

        {}
        <div className="p-6 border rounded-xl bg-card hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-cyan-500/10 to-violet-500/10 rounded-full -mr-10 -mt-10 transition-transform group-hover:scale-150"></div>
          <h2 className="text-xl font-semibold text-foreground mb-4 relative">Notifications</h2>
          <div className="flex items-center justify-between relative">
            <div className="flex items-center gap-3">
              {isNotificationsEnabled ? (
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500/20 to-violet-500/20 flex items-center justify-center">
                  <Bell className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
                </div>
              ) : (
                <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                  <BellOff className="h-5 w-5 text-muted-foreground" />
                </div>
              )}
              <div>
                <p className="text-sm font-medium text-foreground">Push Notifications</p>
                <p className="text-xs text-muted-foreground">
                  Receive notifications about your analysis results
                </p>
              </div>
            </div>
            <Button
              variant={isNotificationsEnabled ? "default" : "outline"}
              size="sm"
              onClick={toggleNotifications}
              className={isNotificationsEnabled ? "bg-gradient-to-r from-cyan-500 to-violet-500 hover:from-cyan-600 hover:to-violet-600" : ""}
            >
              {isNotificationsEnabled ? "Enabled" : "Disabled"}
            </Button>
          </div>
        </div>

        {}
        <div className="p-6 border rounded-xl bg-card hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-amber-500/10 to-rose-500/10 rounded-full -mr-10 -mt-10 transition-transform group-hover:scale-150"></div>
          <h2 className="text-xl font-semibold text-foreground mb-4 relative">Data Management</h2>
          <div className="space-y-4 relative">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">Clear All Data</p>
                <p className="text-xs text-muted-foreground">
                  Permanently delete all analysis history and analytics data
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowClearConfirm(true)}
                className="flex items-center gap-2 text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-950"
              >
                <Trash2 className="h-4 w-4" />
                Clear Data
              </Button>
            </div>
            {clearMessage && (
              <p className="text-sm text-green-600 dark:text-green-400">{clearMessage}</p>
            )}
          </div>
        </div>

        {}
        <UserProfileSection />

        {}
        <AccountStatusSection />

        {}
        <LogoutSection />
        <DeleteAccountSection/>
      </div>

      {}
      {showClearConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {}
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowClearConfirm(false)}
          />

          {}
          <div className="relative bg-white dark:bg-card rounded-lg shadow-xl max-w-md w-full mx-4 p-6 z-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
                <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-foreground">Clear All Data</h3>
                <p className="text-sm text-muted-foreground">This action cannot be undone</p>
              </div>
            </div>

            <p className="text-sm text-gray-600 dark:text-muted-foreground mb-6">
              Are you sure you want to clear all your data? This will permanently delete:
            </p>
            <ul className="text-sm text-gray-600 dark:text-muted-foreground mb-6 list-disc list-inside">
              <li>All analysis history records</li>
              <li>All analytics and activity data</li>
            </ul>

            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setShowClearConfirm(false)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleClearAllData}
              >
                Clear All Data
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
