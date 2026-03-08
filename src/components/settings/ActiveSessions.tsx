"use client";

import { useState, useEffect } from "react";
import { useUser, useClerk } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import {
  Shield,
  Monitor,
  Smartphone,
  Tablet,
  Globe,
  Clock,
  LogOut,
  RefreshCw,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface Session {
  id: string;
  status: string;
  expireAt: string;
  lastActiveAt: string;
  deviceType: string;
  deviceBrowser: string;
  location: string;
}

export function ActiveSessions() {
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();
  const router = useRouter();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [revoking, setRevoking] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showRevokeConfirm, setShowRevokeConfirm] = useState(false);
  const [sessionToRevoke, setSessionToRevoke] = useState<string | null>(null);

  const fetchSessions = async () => {
    if (!isLoaded || !user) return;

    setIsLoading(true);
    setError(null);

    try {

      const response = await fetch("/api/sessions");
      const data = await response.json();

      if (data.success) {

        const activeSessions = data.data.filter((session: Session) => {
          const expired = isExpired(session.expireAt);
          return !expired && session.status === "active";
        });
        setSessions(activeSessions);
      } else {
        setError(data.error || "Failed to fetch sessions");
      }
    } catch (err) {
      console.error("Error fetching sessions:", err);
      setError("Failed to fetch sessions");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, [user, isLoaded]);

  const handleRevokeSession = async (sessionId: string) => {
    setRevoking(sessionId);

    const isOnlySession = sessions.length === 1;

    try {
      const response = await fetch("/api/sessions", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ sessionId }),
      });

      const data = await response.json();

      if (data.success) {

        if (isOnlySession) {
          await signOut({ redirectUrl: "/" });
        } else {

          setSessions(sessions.filter(s => s.id !== sessionId));
        }
      } else {
        setError(data.error || "Failed to revoke session");
      }
    } catch (err) {
      console.error("Error revoking session:", err);
      setError("Failed to revoke session");
    } finally {
      setRevoking(null);
    }
  };

  const getDeviceIcon = (deviceType: string) => {
    switch (deviceType?.toLowerCase()) {
      case "desktop":
        return <Monitor className="h-5 w-5" />;
      case "mobile":
        return <Smartphone className="h-5 w-5" />;
      case "tablet":
        return <Tablet className="h-5 w-5" />;
      default:
        return <Monitor className="h-5 w-5" />;
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "Unknown";
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const isExpired = (expireAt: string) => {
    if (!expireAt) return false;
    return new Date(expireAt) < new Date();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <RefreshCw className="h-6 w-6 animate-spin text-zinc-400" />
        <span className="ml-3 text-sm text-zinc-500">Loading sessions...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-sm text-red-500 mb-4">{error}</p>
        <Button variant="outline" onClick={fetchSessions}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
            Active Sessions
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Manage your active sessions across devices
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchSessions}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      {sessions.length === 0 ? (
        <div className="text-center py-8 text-zinc-500 dark:text-zinc-400">
          <Shield className="h-12 w-12 mx-auto mb-3 text-zinc-300 dark:text-zinc-600" />
          <p className="text-sm">No active sessions found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sessions.map((session) => (
            <div
              key={session.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 sm:p-4 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800/50"
            >
              <div className="flex items-start gap-3 min-w-0">
                <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-700 text-zinc-500 dark:text-zinc-400 flex-shrink-0">
                  {getDeviceIcon(session.deviceType)}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate max-w-[180px] sm:max-w-none">
                      {session.deviceType?.charAt(0).toUpperCase() + session.deviceType?.slice(1) || "Device"}
                      {" - "}
                      {session.deviceBrowser || "Browser"}
                    </p>
                    {isExpired(session.expireAt) ? (
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 flex-shrink-0">
                        <ShieldAlert className="h-3 w-3" />
                        Expired
                      </span>
                    ) : session.status === "active" ? (
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 flex-shrink-0">
                        <ShieldCheck className="h-3 w-3" />
                        Active
                      </span>
                    ) : null}
                  </div>
                  <div className="flex items-center gap-2 mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                    <Globe className="h-3 w-3 flex-shrink-0" />
                    <span className="truncate">{session.location || "Unknown location"}</span>
                  </div>
                  <div className="flex items-center gap-1 mt-1 text-xs text-zinc-400 dark:text-zinc-500">
                    <Clock className="h-3 w-3 flex-shrink-0" />
                    <span className="truncate">Last active: {formatDate(session.lastActiveAt)}</span>
                  </div>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSessionToRevoke(session.id);
                  setShowRevokeConfirm(true);
                }}
                disabled={revoking === session.id || isExpired(session.expireAt)}
                className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30 self-end sm:self-center flex-shrink-0"
              >
                {revoking === session.id ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <LogOut className="h-4 w-4" />
                )}
              </Button>
            </div>
          ))}
        </div>
      )}

      <p className="text-xs text-zinc-400 dark:text-zinc-500 pt-2">
        {sessions.length} session{sessions.length !== 1 ? "s" : ""} found
      </p>

      {}
      {showRevokeConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowRevokeConfirm(false)}
          />
          <div className="relative bg-white dark:bg-zinc-900 rounded-xl shadow-xl max-w-md w-full p-4 sm:p-6 z-10 border border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30 flex-shrink-0">
                <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Revoke Session</h3>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">This action cannot be undone</p>
              </div>
            </div>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4 sm:mb-6">
              Are you sure you want to revoke this session? The user will be signed out from this device.
            </p>
            <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setShowRevokeConfirm(false);
                  setSessionToRevoke(null);
                }}
                className="w-full sm:w-auto"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={async () => {
                  if (sessionToRevoke) {
                    await handleRevokeSession(sessionToRevoke);
                    setShowRevokeConfirm(false);
                    setSessionToRevoke(null);
                  }
                }}
                className="w-full sm:w-auto"
              >
                Revoke Session
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
