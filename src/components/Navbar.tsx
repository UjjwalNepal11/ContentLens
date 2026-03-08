"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Menu, Bell, Search, X, FileText as FileTextIcon } from "lucide-react";
import { UserButton } from "@/components/user/UserButton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "@/components/settings/ThemeToggle";
import { cn } from "@/lib/utils";
import { useNotificationStore, useAnalysisHistoryStore, useActivityTrackerStore } from "@/lib/store";
import { useSearchStore } from "@/lib/search-store";
import { DownloadPDFButton } from "@/components/dashboard/DownloadPDFButton";
import { NotificationsPanel } from "@/components/NotificationsPanel";

interface NavbarProps {
  title?: string;
  onMenuClick?: () => void;
  className?: string;
  showDownloadButton?: boolean;
}

function formatTimeAgo(date: Date | string | number): string {
  const now = new Date();
  let dateObj: Date;

  if (date instanceof Date) {
    dateObj = date;
  } else if (typeof date === 'string' || typeof date === 'number') {
    dateObj = new Date(date);
  } else {
    return "Unknown";
  }

  const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return "Just now";
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  } else {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days} day${days > 1 ? "s" : ""} ago`;
  }
}

export function Navbar({ title = "ContentLens Dashboard", onMenuClick, className, showDownloadButton = false }: NavbarProps) {
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [showResults, setShowResults] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const mobileSearchRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const closeNotifications = useCallback(() => setIsNotificationsOpen(false), []);

  const {
    unreadCount,
    isNotificationsEnabled,
  } = useNotificationStore();

  const { history } = useAnalysisHistoryStore();
  const { setSearchQuery } = useSearchStore();

    const searchResults = searchInput.length > 0
    ? history.filter((item) =>
        item.text.toLowerCase().includes(searchInput.toLowerCase()) ||
        item.fileName?.toLowerCase().includes(searchInput.toLowerCase()) ||
        item.analysis.toLowerCase().includes(searchInput.toLowerCase()) ||
        item.categories.some((cat) => cat.toLowerCase().includes(searchInput.toLowerCase()))
      ).slice(0, 5)
    : [];

    useEffect(() => {
    function handleClickOutside(event: MouseEvent | TouchEvent) {
      const target = event.target as Node;

      if (searchRef.current && !searchRef.current.contains(target)) {
        setShowResults(false);
      }
      if (mobileSearchRef.current && !mobileSearchRef.current.contains(target)) {
        setIsMobileSearchOpen(false);
      }
    }

        document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchend", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchend", handleClickOutside);
    };
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInput(e.target.value);
    setShowResults(e.target.value.length > 0);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      useActivityTrackerStore.getState().recordActivity({
        type: "search",
        details: { analysisType: searchInput },
      });

      setSearchQuery(searchInput);
      router.push("/dashboard/history");
      setShowResults(false);
      setSearchInput("");
    }
  };

  const handleResultClick = (id: string) => {
    useActivityTrackerStore.getState().recordActivity({
      type: "search",
      details: { analysisType: searchInput },
    });

    setSearchQuery(searchInput);
    router.push(`/dashboard/history?analysis=${id}`);
    setShowResults(false);
    setSearchInput("");
  };

  const handleViewAllClick = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    useActivityTrackerStore.getState().recordActivity({
      type: "search",
      details: { analysisType: searchInput },
    });
    setSearchQuery(searchInput);
    router.push("/dashboard/history");
    setShowResults(false);
    setSearchInput("");
  };

  return (
    <header
      className={cn(
        "sticky top-0 z-50 bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60 border-b border-border px-4 py-3 flex items-center justify-between shadow-sm transition-all duration-300",
        className,
      )}
    >
      <div className="flex items-center gap-4">
        {onMenuClick && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onMenuClick}
            className={isMobileSearchOpen ? "hidden" : "md:hidden transition-transform duration-200 hover:scale-110"}
            aria-label="Toggle menu"
          >
            <Menu size={20} />
          </Button>
        )}

        <h1 className={`text-lg font-semibold text-foreground ${isMobileSearchOpen ? "hidden" : ""} ${onMenuClick ? "md:block" : ""}`}>
          {title}
        </h1>

        {}
        {isMobileSearchOpen && (
          <div className="flex-1 md:hidden relative animate-slideInFromRight" ref={mobileSearchRef}>
            <form onSubmit={handleSearchSubmit} className="flex items-center">
              <div className="relative w-full">
                <Input
                  id="mobile-search-input"
                  type="search"
                  placeholder="Search analyses..."
                  value={searchInput}
                  onChange={handleSearchChange}
                  onFocus={() => searchInput.length > 0 && setShowResults(true)}
                  className="pr-20 w-full bg-background border-input transition-all duration-300 focus:ring-2 focus:ring-primary"
                  autoFocus
                />
                <Button
                  type="submit"
                  variant="ghost"
                  size="icon"
                  className="absolute right-8 top-0 h-full transition-transform duration-200 hover:scale-110"
                  aria-label="Search"
                >
                  <Search size={20} />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full transition-all duration-200 hover:scale-110"
                  onClick={() => {
                    setIsMobileSearchOpen(false);
                    setSearchInput("");
                    setShowResults(false);
                  }}
                  aria-label="Close search"
                >
                  <X size={20} />
                </Button>
              </div>
            </form>

            {}
            {showResults && searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-background border border-border rounded-lg shadow-xl max-h-96 overflow-y-auto z-[60]">
                {searchResults.map((result) => (
                  <div
                    key={result.id}
                    onClick={() => handleResultClick(result.id)}
                    onTouchEnd={(e: React.TouchEvent) => {
                      e.preventDefault();
                      handleResultClick(result.id);
                    }}
                    className="w-full text-left px-4 py-3 hover:bg-gradient-to-r hover:from-cyan-50 hover:to-violet-50 dark:hover:from-cyan-950/30 dark:hover:to-violet-950/30 border-b border-border last:border-b-0 transition-all cursor-pointer"
                    role="button"
                    tabIndex={0}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-violet-500 flex items-center justify-center flex-shrink-0">
                        <FileTextIcon size={14} className="text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{result.fileName || result.text}</p>
                        <p className="text-xs text-muted-foreground line-clamp-1">{result.analysis}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-muted-foreground">
                            {formatTimeAgo(result.timestamp)}
                          </span>
                          <span className="text-xs bg-gradient-to-r from-cyan-500 to-violet-500 text-white px-2 py-0.5 rounded-full font-medium">
                            {(result.confidence * 100).toFixed(0)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {}
                <button
                  type="button"
                  onClick={handleViewAllClick}
                  onTouchEnd={handleViewAllClick}
                  className="w-full text-center py-3 text-sm font-medium text-cyan-600 hover:text-cyan-700 hover:bg-gradient-to-r hover:from-cyan-50 hover:to-violet-50 border-t border-border cursor-pointer"
                >
                  View all results
                </button>
              </div>
            )}

            {}
            {showResults && searchInput.length > 0 && searchResults.length === 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-background border border-border rounded-md shadow-lg p-4 z-50">
                <p className="text-sm text-muted-foreground text-center">No results found for "{searchInput}"</p>
              </div>
            )}
          </div>
        )}

        {}
        <div className="hidden md:block relative ml-6" ref={searchRef}>
          <form onSubmit={handleSearchSubmit} className="flex items-center">
            <div className="relative w-full">
              <Input
                id="desktop-search-input"
                type="search"
                placeholder="Search analyses..."
                value={searchInput}
                onChange={handleSearchChange}
                onFocus={() => searchInput.length > 0 && setShowResults(true)}
                className="w-72 bg-background border-input transition-all duration-300 focus:ring-2 focus:ring-primary focus:scale-105"
              />
            </div>
          </form>

          {}
          {showResults && searchResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-background border border-border rounded-lg shadow-xl max-h-96 overflow-y-auto z-50">
              {searchResults.map((result) => (
                <div
                  key={result.id}
                  onClick={() => handleResultClick(result.id)}
                  className="w-full text-left px-4 py-3 hover:bg-gradient-to-r hover:from-cyan-50 hover:to-violet-50 dark:hover:from-cyan-950/30 dark:hover:to-violet-950/30 border-b border-border last:border-b-0 transition-all cursor-pointer"
                  role="button"
                  tabIndex={0}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-violet-500 flex items-center justify-center flex-shrink-0">
                      <FileTextIcon size={14} className="text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{result.fileName || result.text}</p>
                      <p className="text-xs text-muted-foreground line-clamp-1">{result.analysis}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-muted-foreground">
                          {formatTimeAgo(result.timestamp)}
                        </span>
                        <span className="text-xs bg-gradient-to-r from-cyan-500 to-violet-500 text-white px-2 py-0.5 rounded-full font-medium">
                          {(result.confidence * 100).toFixed(0)}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {}
              <button
                type="button"
                onClick={handleViewAllClick}
                onTouchEnd={handleViewAllClick}
                className="w-full text-center py-3 text-sm font-medium text-cyan-600 hover:text-cyan-700 hover:bg-gradient-to-r hover:from-cyan-50 hover:to-violet-50 border-t border-border cursor-pointer"
              >
                View all results
              </button>
            </div>
          )}

          {}
          {showResults && searchInput.length > 0 && searchResults.length === 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-background border border-border rounded-md shadow-lg p-4 z-50">
              <p className="text-sm text-muted-foreground text-center">No results found for "{searchInput}"</p>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className={`md:hidden mr-2 ${isMobileSearchOpen ? "hidden" : ""}`}>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Search"
            onClick={() => setIsMobileSearchOpen(true)}
            className="transition-transform duration-200 hover:scale-110"
          >
            <Search size={20} />
          </Button>
        </div>

        {isNotificationsEnabled && (
          <>
            <Button
              variant="ghost"
              size="icon"
              className="relative transition-transform duration-200 hover:scale-110"
              aria-label="Notifications"
              onClick={() => setIsNotificationsOpen(true)}
              suppressHydrationWarning
            >
              <Bell size={20} className={unreadCount > 0 ? "animate-bellRing" : ""} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center font-medium animate-pulse">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </Button>
            <NotificationsPanel
              isOpen={isNotificationsOpen}
              onClose={closeNotifications}
            />
          </>
        )}

       {showDownloadButton && <DownloadPDFButton />}

        <ThemeToggle />

        <UserButton />
      </div>
    </header>
  );
}
