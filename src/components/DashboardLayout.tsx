"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Sidebar } from "@/components/Sidebar";
import { Navbar } from "@/components/Navbar";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { AccountActivityHandler } from "@/components/AccountActivityHandler";
import { KeyboardShortcutsHelp } from "@/components/KeyboardShortcutsHelp";
import { useSidebarStore, useSettingsStore } from "@/lib/store";
import { isInputElement } from "@/lib/keyboard-shortcuts";
import { cn } from "@/lib/utils";

interface DashboardLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export function DashboardLayout({ children, className }: DashboardLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showShortcutsHelp, setShowShortcutsHelp] = useState(false);
  const sequenceRef = useRef<string[]>([]);
  const sequenceTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { sidebarCollapsed, setSidebarCollapsed } = useSidebarStore();
  const { theme, setTheme } = useSettingsStore();

    const handleNavigate = () => {
    setSidebarOpen(false);
  };

    const toggleTheme = useCallback(() => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
        document.documentElement.classList.remove("light", "dark");
    document.documentElement.classList.add(newTheme);
  }, [theme, setTheme]);

    const handleKeyDown = useCallback((event: KeyboardEvent) => {
        const target = event.target as HTMLElement;
    const inInput = isInputElement(target);

        const allowInInput = ["/", "k", "b", "m"].includes(event.key.toLowerCase()) &&
      (event.metaKey || event.ctrlKey);

        const allowSlashInInput = event.key === "/" && !event.shiftKey;

    if (inInput && !allowInInput && !allowSlashInInput) {
            sequenceRef.current = [];
      return;
    }

        if (event.key === "Escape") {
      if (showShortcutsHelp) {
        setShowShortcutsHelp(false);
        return;
      }
            return;
    }

        if ((event.key === "?" || (event.key === "/" && event.shiftKey)) && !inInput) {
      event.preventDefault();
      setShowShortcutsHelp(true);
      return;
    }

        if (event.key === "/" && !event.shiftKey) {
      event.preventDefault();
            const searchInput = document.querySelector('input[type="search"]') as HTMLInputElement;
      if (searchInput) {
        searchInput.focus();
      }
      return;
    }

        if ((event.key === "k" || event.key === "K") && (event.metaKey || event.ctrlKey)) {
      event.preventDefault();
      const searchInput = document.querySelector('input[type="search"]') as HTMLInputElement;
      if (searchInput) {
        searchInput.focus();
      }
      return;
    }

        if ((event.key === "b" || event.key === "B") && (event.metaKey || event.ctrlKey)) {
      event.preventDefault();
      setSidebarCollapsed(!sidebarCollapsed);
      return;
    }

        if ((event.key === "m" || event.key === "M") && !event.metaKey && !event.ctrlKey && !inInput) {
      event.preventDefault();
      toggleTheme();
      return;
    }

        if (event.key === "g" && !event.shiftKey && !event.ctrlKey && !event.metaKey && !inInput) {
      event.preventDefault();

            sequenceRef.current = ["g"];

            if (sequenceTimeoutRef.current) {
        clearTimeout(sequenceTimeoutRef.current);
      }
      sequenceTimeoutRef.current = setTimeout(() => {
        sequenceRef.current = [];
      }, 1000);

      return;
    }

        if (sequenceRef.current.length > 0 && sequenceRef.current[0] === "g") {
      const navRoutes: Record<string, string> = {
        d: "/dashboard",
        h: "/dashboard/history",
        a: "/dashboard/analytics",
        s: "/dashboard/settings",
      };

      const action = navRoutes[event.key.toLowerCase()];
      if (action) {
        event.preventDefault();
        router.push(action);
        sequenceRef.current = [];
        if (sequenceTimeoutRef.current) {
          clearTimeout(sequenceTimeoutRef.current);
        }
        return;
      }

            sequenceRef.current = [];
      if (sequenceTimeoutRef.current) {
        clearTimeout(sequenceTimeoutRef.current);
      }
    }
  }, [showShortcutsHelp, sidebarCollapsed, setSidebarCollapsed, router, toggleTheme]);

    useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      if (sequenceTimeoutRef.current) {
        clearTimeout(sequenceTimeoutRef.current);
      }
    };
  }, [handleKeyDown]);

    const isDashboardPage = pathname === "/dashboard";

  return (
    <AccountActivityHandler>
      <div className={cn("min-h-screen bg-background", className)}>
        {}
        <div className="hidden md:flex">
          <Sidebar
            collapsed={sidebarCollapsed}
            setCollapsed={setSidebarCollapsed}
            onNavigate={handleNavigate}
            className="fixed inset-y-0 left-0 z-50"
          />
         <div className={cn("flex-1 transition-all duration-300", sidebarCollapsed ? "ml-16" : "ml-64")}>
           <Navbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} showDownloadButton={isDashboardPage} />
             <main className="p-6">
              <Breadcrumbs className="mb-6" />
              {children}
            </main>
          </div>
        </div>

        {}
        <div className="md:hidden flex flex-col min-h-screen">
          {}
          {sidebarOpen && (
            <div
              className="fixed inset-0 z-40 bg-black/50"
              onClick={() => setSidebarOpen(false)}
            />
          )}

          {}
          {sidebarOpen && (
            <div className="fixed inset-y-0 left-0 z-50 w-64 shadow-lg h-full">
              <Sidebar
                className="h-full"
                onNavigate={handleNavigate}
              />
            </div>
          )}

          <Navbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} showDownloadButton={isDashboardPage} />
          <main className="flex-1 p-4 sm:p-6 overflow-hidden">
            <Breadcrumbs className="mb-4" />
            {children}
          </main>
        </div>

        {}
        <KeyboardShortcutsHelp
          isOpen={showShortcutsHelp}
          onClose={() => setShowShortcutsHelp(false)}
        />
      </div>
    </AccountActivityHandler>
  );
}
