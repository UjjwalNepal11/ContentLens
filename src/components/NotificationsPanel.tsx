"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import { X, Check, Bell, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNotificationStore } from "@/lib/store";
import { cn } from "@/lib/utils";

interface NotificationsPanelProps {
  isOpen: boolean;
  onClose: () => void;
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

function getNotificationIcon(type: string) {
  switch (type) {
    case "success":
      return "✅";
    case "warning":
      return "⚠️";
    case "error":
      return "❌";
    default:
      return "ℹ️";
  }
}

function SwipeableNotificationItem({
  notification,
  onMarkAsRead,
  onDelete,
  children,
}: {
  notification: { id: string; read: boolean };
  onMarkAsRead: () => void;
  onDelete: () => void;
  children: React.ReactNode;
}) {
  const [swipeX, setSwipeX] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);
  const itemRef = useRef<HTMLDivElement>(null);
  const startX = useRef(0);
  const currentX = useRef(0);

  const handleTouchStart = (e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX;
    currentX.current = startX.current;
    setIsSwiping(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isSwiping) return;
    currentX.current = e.touches[0].clientX;
    const diff = currentX.current - startX.current;

    const clampedDiff = Math.max(-100, Math.min(100, diff));
    setSwipeX(clampedDiff);
  };

  const handleTouchEnd = () => {
    if (!isSwiping) return;
    const diff = currentX.current - startX.current;

    if (diff > 60) {

      onMarkAsRead();
    } else if (diff < -60) {

      onDelete();
    }

    setSwipeX(0);
    setIsSwiping(false);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    startX.current = e.clientX;
    currentX.current = startX.current;
    setIsSwiping(true);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isSwiping) return;
    currentX.current = e.clientX;
    const diff = currentX.current - startX.current;
    const clampedDiff = Math.max(-100, Math.min(100, diff));
    setSwipeX(clampedDiff);
  };

  const handleMouseUp = () => {
    if (!isSwiping) return;
    const diff = currentX.current - startX.current;

    if (diff > 60) {
      onMarkAsRead();
    } else if (diff < -60) {
      onDelete();
    }

    setSwipeX(0);
    setIsSwiping(false);
  };

  const handleMouseLeave = () => {
    if (isSwiping) {
      setSwipeX(0);
      setIsSwiping(false);
    }
  };

  return (
    <div
      className="relative overflow-hidden rounded-lg"
      ref={itemRef}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      style={{ cursor: isSwiping ? 'grabbing' : 'grab' }}
    >
      {}
      <div className="absolute inset-0 flex">
        {}
        <div
          className={cn(
            "flex items-center justify-start pl-4 transition-opacity duration-200",
            swipeX > 0 ? "opacity-100" : "opacity-0"
          )}
        >
          <div className="bg-green-500/20 rounded-lg p-2">
            <ChevronRight className="h-5 w-5 text-green-600" />
          </div>
        </div>
        {}
        <div
          className={cn(
            "flex items-center justify-end pr-4 ml-auto transition-opacity duration-200",
            swipeX < 0 ? "opacity-100" : "opacity-0"
          )}
        >
          <div className="bg-red-500/20 rounded-lg p-2">
            <ChevronLeft className="h-5 w-5 text-red-600" />
          </div>
        </div>
      </div>

      {}
      <div
        className="transition-transform duration-150 ease-out"
        style={{ transform: `translateX(${swipeX}px)` }}
      >
        {children}
      </div>
    </div>
  );
}

export function NotificationsPanel({ isOpen, onClose }: NotificationsPanelProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    removeNotification,
  } = useNotificationStore();

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, onClose]);

  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener("keydown", handleEsc);
    }
    return () => document.removeEventListener("keydown", handleEsc);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen && isMobile) {
      const originalStyle = window.getComputedStyle(document.body).overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalStyle;
      };
    }
  }, [isOpen, isMobile]);

  useEffect(() => {
    if (isOpen && panelRef.current) {
      const focusableElements = panelRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      const firstElement = focusableElements[0] as HTMLElement;
      const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

      const handleTabKey = (e: KeyboardEvent) => {
        if (e.key === 'Tab') {
          if (e.shiftKey) {
            if (document.activeElement === firstElement) {
              e.preventDefault();
              lastElement?.focus();
            }
          } else {
            if (document.activeElement === lastElement) {
              e.preventDefault();
              firstElement?.focus();
            }
          }
        }
      };

      document.addEventListener('keydown', handleTabKey);
      firstElement?.focus();

      return () => document.removeEventListener('keydown', handleTabKey);
    }
  }, [isOpen]);

  if (!mounted) return null;

  const mobilePanelClasses = isMobile
    ? "inset-x-0 bottom-0 top-auto max-h-[85vh] rounded-t-2xl border-t border-l border-r"
    : "inset-y-0 right-0";

  return createPortal(
    <>
      {}
      <div
        className={cn(
          "fixed inset-0 z-[100] bg-black/20 backdrop-blur-sm transition-all duration-300 ease-out",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        aria-hidden="true"
      />

      {}
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="notifications-title"
        className={cn(
          "fixed z-[100] w-full sm:w-96 bg-background shadow-xl transform transition-all duration-300 ease-out flex flex-col",
          mobilePanelClasses,
          isOpen
            ? isMobile ? "translate-y-0" : "translate-x-0"
            : isMobile ? "translate-y-full" : "translate-x-full"
        )}
      >
        {}
        {isMobile && (
          <div className="flex justify-center pt-3 pb-1 animate-pulse">
            <div className="w-10 h-1.5 bg-muted-foreground/30 rounded-full" />
          </div>
        )}

        {}
        <div className={cn(
          "flex items-center justify-between p-4 border-b border-border",
          isMobile ? "px-4" : "p-4"
        )}>
          <div className="flex items-center gap-2 min-w-0">
            <Bell className="h-5 w-5 text-foreground flex-shrink-0 animate-bounce" />
            <h2
              id="notifications-title"
              className="text-lg font-semibold text-foreground truncate"
            >
              Notifications
            </h2>
            {unreadCount > 0 && (
              <span className="bg-primary/10 text-primary text-xs font-medium px-2 py-0.5 rounded-full flex-shrink-0 animate-bounceIn">
                {unreadCount} new
              </span>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            aria-label="Close notifications"
            className="flex-shrink-0 h-11 w-11 -mr-2 transition-transform duration-200 hover:scale-110 hover:rotate-90"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {}
        {notifications.length > 0 && (
          <div className={cn(
            "flex items-center justify-end bg-muted/30 border-b border-border",
            isMobile ? "px-4 py-2" : "px-4 py-2"
          )}>
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "text-xs h-9 text-muted-foreground hover:text-foreground transition-colors",
                isMobile ? "px-3" : ""
              )}
              onClick={markAllAsRead}
              disabled={unreadCount === 0}
            >
              <Check className="mr-1.5 h-3.5 w-3.5" />
              <span className="hidden sm:inline">Mark all read</span>
              <span className="sm:hidden">Mark all</span>
            </Button>
          </div>
        )}

        {}
        <div
          className={cn(
            "flex-1 overflow-y-auto overflow-x-hidden",
            isMobile ? "px-3 py-2" : "p-4",
            isMobile ? "scroll-smooth" : ""
          )}
          style={{
            WebkitOverflowScrolling: 'touch',
            overscrollBehavior: 'contain'
          }}
        >
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full min-h-[200px] text-muted-foreground space-y-4">
              <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                <Bell className="h-6 w-6 opacity-50" />
              </div>
              <p className="text-sm">No notifications yet</p>
            </div>
          ) : (
            <div className={cn("space-y-2", isMobile ? "gap-2" : "gap-3")}>
              {notifications.map((notification) => (
                <SwipeableNotificationItem
                  key={notification.id}
                  notification={notification}
                  onMarkAsRead={() => !notification.read && markAsRead(notification.id)}
                  onDelete={() => removeNotification(notification.id)}
                >
                    <div
                    className={cn(
                      "relative group flex flex-col gap-1 p-3 rounded-lg border transition-all cursor-pointer bg-card hover:shadow-md",
                      notification.read
                        ? "border-border"
                        : "border-cyan-500/30 bg-gradient-to-r from-cyan-50/50 to-violet-50/50 dark:from-cyan-950/20 dark:to-violet-950/20"
                    )}
                    onClick={() => !notification.read && markAsRead(notification.id)}
                  >
                    <div className="flex justify-between items-start gap-2">
                      <div className="flex items-center gap-2 font-medium text-sm min-w-0">
                        <span className="flex-shrink-0">{getNotificationIcon(notification.type)}</span>
                        <span className={cn(
                          "truncate",
                          !notification.read && "text-foreground"
                        )}>
                          {notification.title}
                        </span>
                      </div>
                      <button
                        className={cn(
                          "text-muted-foreground hover:text-foreground transition-colors p-1.5 -mr-1 -mt-1 rounded-md hover:bg-muted flex-shrink-0",
                          "opacity-0 group-hover:opacity-100 group-focus:opacity-100",
                          isMobile ? "opacity-100" : ""
                        )}
                        onClick={(e) => {
                          e.stopPropagation();
                          removeNotification(notification.id);
                        }}
                        aria-label="Remove notification"
                      >
                        <X size={16} />
                      </button>
                    </div>
                    <p className={cn(
                      "text-sm text-muted-foreground leading-relaxed line-clamp-2",
                      isMobile ? "line-clamp-3" : "line-clamp-2"
                    )}>
                      {notification.message}
                    </p>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-xs text-muted-foreground">
                        {formatTimeAgo(notification.timestamp)}
                      </span>
                      {!notification.read && (
                        <span className="h-2 w-2 rounded-full bg-gradient-to-r from-cyan-500 to-violet-500 flex-shrink-0 shadow-sm" />
                      )}
                    </div>
                  </div>
                </SwipeableNotificationItem>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  , document.body);
}
