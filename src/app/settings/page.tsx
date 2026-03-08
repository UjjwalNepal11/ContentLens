"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useUser, useClerk } from "@clerk/nextjs";
import Image from "next/image";
import { UserProfileSection } from "@/components/settings/UserProfileSection";
import { AccountStatusSection } from "@/components/settings/AccountStatusSection";
import { useNotificationStore, useAnalysisHistoryStore, useActivityTrackerStore } from "@/lib/store";
import { useSessionAnalysisStore } from "@/lib/session-store";
import { Button } from "@/components/ui/button";
import {
  Bell,
  BellOff,
  Trash2,
  AlertTriangle,
  User,
  Palette,
  Shield,
  Database,
  ChevronRight,
  X,
  Moon,
  Sun,
  Monitor,
  Trash
} from "lucide-react";
import { useState, Suspense } from "react";
import { useTheme } from "next-themes";
import { ChangePasswordModal } from "@/components/settings/ChangePasswordModal";
import { ActiveSessions } from "@/components/settings/ActiveSessions";
import { EmailManagementSection } from "@/components/settings/EmailManagementSection";
import { ConnectedAccountsSection } from "@/components/settings/ConnectedAccountsSection";

export const dynamic = 'force-dynamic';

function SettingsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();
  const { isNotificationsEnabled, toggleNotifications } = useNotificationStore();
  const { clearHistory } = useAnalysisHistoryStore();
  const { clearActivities } = useActivityTrackerStore();
  const { clearSessions } = useSessionAnalysisStore();
  const { theme, setTheme } = useTheme();

  const getInitialTab = () => {
    const tab = searchParams.get("tab");
    return tab || "account";
  };

  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [clearMessage, setClearMessage] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [activeTab, setActiveTab] = useState(getInitialTab);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    const url = new URL(window.location.href);
    url.searchParams.set("tab", tabId);
    window.history.pushState({}, "", url.toString());
  };

  const handleClearAllData = () => {
    clearHistory();
    clearActivities();
    clearSessions();
    setShowClearConfirm(false);
    setClearMessage(true);
    setTimeout(() => setClearMessage(false), 3000);
  };

  const handleDeleteAccount = async () => {
    if (!user) return;
    setIsDeleting(true);
    try {
      await user.delete();
      await signOut({ redirectUrl: "/" });
    } catch (error) {
      console.error("Error deleting account:", error);
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-[400px] p-4">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="h-16 w-16 rounded-full bg-zinc-200 dark:bg-zinc-800" />
          <div className="h-4 w-32 bg-zinc-200 dark:bg-zinc-800 rounded" />
        </div>
      </div>
    );
  }

  const avatarUrl = user?.imageUrl;
  const fullName = user?.fullName || "";
  const email = user?.primaryEmailAddress?.emailAddress || "";

  const tabs = [
    { id: "account", label: "Account", icon: User },
    { id: "appearance", label: "Appearance", icon: Palette },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "privacy", label: "Security", icon: Shield },
    { id: "data", label: "Data", icon: Database },
  ];

  const themeOptions = [
    { value: "light", label: "Light", icon: Sun },
    { value: "dark", label: "Dark", icon: Moon },
    { value: "system", label: "System", icon: Monitor },
  ];

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <div className="max-w-6xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-8">
        {}
        <div className="mb-4 sm:mb-8 animate-fadeInDown">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 sm:gap-4">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Settings
              </h1>
            </div>
            <button
              onClick={() => router.push(searchParams.get("returnTo") || "/dashboard")}
              className="flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors"
            >
              <X className="h-4 w-4 sm:h-5 sm:w-5 text-zinc-600 dark:text-zinc-400" />
            </button>
          </div>
          <p className="text-zinc-500 dark:text-zinc-400 mt-1 sm:mt-2 text-sm">
            Manage your account preferences
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
          <div className="lg:hidden overflow-x-auto pb-2 -mx-3 px-3">
            <div className="flex gap-2 min-w-max">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                    activeTab === tab.id
                      ? "bg-blue-600 text-white"
                      : "bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700"
                  }`}
                >
                  <tab.icon className="h-4 w-4" />
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="hidden lg:block lg:w-64 shrink-0">
            <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden sticky top-8">
              <div className="p-4 border-b border-zinc-200 dark:border-zinc-800">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full overflow-hidden bg-zinc-100 dark:bg-zinc-800">
                    {avatarUrl ? (
                      <Image src={avatarUrl} alt={fullName} width={40} height={40} className="object-cover" />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-zinc-500 font-medium">
                        {fullName ? fullName.charAt(0).toUpperCase() : email.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate">
                      {fullName || "User"}
                    </p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">
                      {email}
                    </p>
                  </div>
                </div>
              </div>

              <nav className="p-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => handleTabChange(tab.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      activeTab === tab.id
                        ? "bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400"
                        : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                    }`}
                  >
                    <tab.icon className="h-4 w-4" />
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>
          </div>

          <div className="flex-1">
            {activeTab === "account" && (
              <div className="space-y-4 sm:space-y-6">
                <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
                  <div className="p-4 sm:p-6">
                    <UserProfileSection />
                  </div>
                </div>

                <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
                  <div className="p-4 sm:p-6">
                    <EmailManagementSection />
                  </div>
                </div>

                <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
                  <div className="p-4 sm:p-6">
                    <ConnectedAccountsSection />
                  </div>
                </div>

                <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
                  <div className="p-4 sm:p-6">
                    <AccountStatusSection />
                  </div>
                </div>
              </div>
            )}

            {activeTab === "appearance" && (
              <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
                <div className="px-4 sm:px-6 py-4 border-b border-zinc-200 dark:border-zinc-800">
                  <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Appearance</h2>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">Customize how the application looks</p>
                </div>
                <div className="p-4 sm:p-6">
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Theme</label>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-3">Select your preferred color theme</p>
                      <div className="grid grid-cols-3 gap-2 sm:gap-3">
                        {themeOptions.map((option) => (
                          <button
                            key={option.value}
                            onClick={() => setTheme(option.value)}
                            className={`flex flex-col items-center gap-2 p-3 sm:p-4 rounded-xl border-2 transition-all ${
                              theme === option.value
                                ? "border-blue-500 bg-blue-50 dark:bg-blue-950/30"
                                : "border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600"
                            }`}
                          >
                            <option.icon className={`h-5 w-5 sm:h-6 sm:w-6 ${theme === option.value ? "text-blue-500" : "text-zinc-500"}`} />
                            <span className={`text-xs sm:text-sm font-medium ${theme === option.value ? "text-blue-600 dark:text-blue-400" : "text-zinc-600 dark:text-zinc-400"}`}>
                              {option.label}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "notifications" && (
              <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
                <div className="px-4 sm:px-6 py-4 border-b border-zinc-200 dark:border-zinc-800">
                  <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Notifications</h2>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">Manage your notification preferences</p>
                </div>
                <div className="p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-zinc-200 dark:border-zinc-700">
                    <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                      <div className={`p-2 rounded-lg flex-shrink-0 ${isNotificationsEnabled ? "bg-blue-100 dark:bg-blue-950" : "bg-zinc-100 dark:bg-zinc-800"}`}>
                        {isNotificationsEnabled ? (
                          <Bell className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        ) : (
                          <BellOff className="h-5 w-5 text-zinc-500" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Push Notifications</p>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400">Receive notifications about your analysis results</p>
                      </div>
                    </div>
                    <button
                      onClick={toggleNotifications}
                      className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 ${isNotificationsEnabled ? "bg-blue-600" : "bg-zinc-300 dark:bg-zinc-600"}`}
                    >
                      <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${isNotificationsEnabled ? "left-6" : "left-1"}`} />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "privacy" && (
              <div className="space-y-4 sm:space-y-6">
                <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
                  <div className="px-4 sm:px-6 py-4 border-b border-zinc-200 dark:border-zinc-800">
                    <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Privacy & Security</h2>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">Manage your account security</p>
                  </div>
                  <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
                    <button
                      onClick={() => setShowPasswordModal(true)}
                      className="w-full flex items-center justify-between p-3 sm:p-4 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                    >
                      <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                        <Shield className="h-5 w-5 text-zinc-400 flex-shrink-0" />
                        <div className="text-left min-w-0">
                          <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Password</p>
                          <p className="text-xs text-zinc-500 dark:text-zinc-400">Change your password</p>
                        </div>
                      </div>
                      <ChevronRight className="h-5 w-5 text-zinc-400 flex-shrink-0" />
                    </button>

                    <div className="p-3 sm:p-4">
                      <ActiveSessions />
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-zinc-900 rounded-xl border border-red-200 dark:border-red-900 overflow-hidden">
                  <div className="px-4 sm:px-6 py-4 border-b border-red-200 dark:border-red-900">
                    <h2 className="text-lg font-semibold text-red-600 dark:text-red-400">Danger Zone</h2>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">Irreversible actions for your account</p>
                  </div>
                  <div className="p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Delete Account</p>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400">
                          Permanently remove your account and all of its data. This action cannot be undone.
                        </p>
                      </div>
                      {showDeleteConfirm ? (
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <Button
                            variant="outline"
                            onClick={() => setShowDeleteConfirm(false)}
                            disabled={isDeleting}
                            size="sm"
                          >
                            Cancel
                          </Button>
                          <Button
                            variant="destructive"
                            onClick={handleDeleteAccount}
                            disabled={isDeleting}
                            size="sm"
                          >
                            {isDeleting ? "Deleting..." : "Confirm Delete"}
                          </Button>
                        </div>
                      ) : (
                        <Button
                          variant="destructive"
                          onClick={() => setShowDeleteConfirm(true)}
                          size="sm"
                          className="flex-shrink-0"
                        >
                          <Trash className="mr-1.5 h-3.5 w-3.5" />
                          Delete
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "data" && (
              <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
                <div className="px-4 sm:px-6 py-4 border-b border-zinc-200 dark:border-zinc-800">
                  <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Data Management</h2>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">Manage your data and storage</p>
                </div>
                <div className="p-4 sm:p-6 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-zinc-200 dark:border-zinc-700">
                    <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                      <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-950 flex-shrink-0">
                        <Database className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Clear All Data</p>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400">Permanently delete all analysis history and analytics data</p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => setShowClearConfirm(true)}
                      className="flex items-center gap-1.5 text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 flex-shrink-0 text-sm"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Clear Data
                    </Button>
                  </div>
                  {clearMessage && (
                    <p className="text-sm text-green-600 dark:text-green-400 p-3 sm:p-4 bg-green-50 dark:bg-green-950/30 rounded-lg">
                      All data has been cleared successfully
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {showClearConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowClearConfirm(false)}
          />
          <div className="relative bg-white dark:bg-zinc-900 rounded-xl shadow-xl max-w-md w-full p-4 sm:p-6 z-10 border border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30 flex-shrink-0">
                <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Clear All Data</h3>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">This action cannot be undone</p>
              </div>
            </div>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">
              Are you sure you want to clear all your data? This will permanently delete:
            </p>
            <ul className="text-sm text-zinc-600 dark:text-zinc-400 mb-4 sm:mb-6 list-disc list-inside space-y-1">
              <li>All analysis history records</li>
              <li>All analytics and activity data</li>
            </ul>
            <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3">
              <Button
                variant="outline"
                onClick={() => setShowClearConfirm(false)}
                className="w-full sm:w-auto"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleClearAllData}
                className="w-full sm:w-auto"
              >
                Clear All Data
              </Button>
            </div>
          </div>
        </div>
      )}

      <ChangePasswordModal
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
      />
    </div>
  );
}

export default function SettingsPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[400px] p-4">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="h-16 w-16 rounded-full bg-zinc-200 dark:bg-zinc-800" />
          <div className="h-4 w-32 bg-zinc-200 dark:bg-zinc-800 rounded" />
        </div>
      </div>
    }>
      <SettingsContent />
    </Suspense>
  );
}
