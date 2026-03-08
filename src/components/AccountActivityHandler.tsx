"use client";

import { useEffect, useRef } from "react";
import { useAuth, useUser } from "@clerk/nextjs";
import { notifySignIn, useAnalysisHistoryStore, useActivityTrackerStore, useSettingsStore, useNotificationStore } from "@/lib/store";

interface AccountActivityHandlerProps {
  children: React.ReactNode;
}

export function AccountActivityHandler({ children }: AccountActivityHandlerProps) {
  const { isLoaded, userId } = useAuth();
  const { user, isLoaded: isUserLoaded } = useUser();
  const hasNotifiedRef = useRef(false);
  const hasLoadedFromDbRef = useRef(false);

  useEffect(() => {
    if (!isLoaded || !isUserLoaded || !userId) return;

    const lastSessionTime = sessionStorage.getItem("last_session_time");
    const currentTime = Date.now().toString();

    const isNewSession = !lastSessionTime || (currentTime && parseInt(currentTime) - parseInt(lastSessionTime) > 30 * 60 * 1000);

    if (isNewSession) {

      if (!hasLoadedFromDbRef.current) {
        setTimeout(async () => {

          await useSettingsStore.getState().loadFromDatabase();

          await useNotificationStore.getState().loadFromDatabase();

          await useAnalysisHistoryStore.getState().loadFromDatabase();

          await useActivityTrackerStore.getState().loadFromDatabase();
          hasLoadedFromDbRef.current = true;
        }, 500);
      }

      const email = user?.primaryEmailAddress?.emailAddress;

      setTimeout(() => {
        notifySignIn(email);
        hasNotifiedRef.current = true;
      }, 500);

      sessionStorage.setItem("last_session_time", currentTime);
    } else if (!hasLoadedFromDbRef.current) {

      setTimeout(async () => {
        await useSettingsStore.getState().loadFromDatabase();
        await useNotificationStore.getState().loadFromDatabase();
        await useAnalysisHistoryStore.getState().loadFromDatabase();
        await useActivityTrackerStore.getState().loadFromDatabase();
        hasLoadedFromDbRef.current = true;
      }, 500);
    }

    localStorage.setItem("has_visited_dashboard", "true");
  }, [isLoaded, isUserLoaded, userId, user]);

  useEffect(() => {
    if (!isLoaded || !userId) return;

    const interval = setInterval(() => {
      useNotificationStore.getState().loadFromDatabase();
    }, 30000);

    return () => clearInterval(interval);
  }, [isLoaded, userId]);

  return <>{children}</>;
}
