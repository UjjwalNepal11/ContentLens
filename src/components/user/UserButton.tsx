"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { useUser } from "@clerk/nextjs";
import Image from "next/image";
import { UserDropdown } from "@/components/user/UserDropdown";
import { KeyboardShortcutsHelp } from "@/components/KeyboardShortcutsHelp";

export function UserButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(() => {
    if (typeof window !== "undefined") {
      return true;
    }
    return false;
  });
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false);
  const [isBrowser, setIsBrowser] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { user, isLoaded } = useUser();

  useEffect(() => {
        setIsMounted(true);
    setIsBrowser(true);
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen]);

  if (!isMounted || !isLoaded) {
    return (
      <div className="h-9 w-9 rounded-full bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
    );
  }

  const avatarUrl = user?.imageUrl;
  const firstName = user?.firstName || "";
  const lastName = user?.lastName || "";
  const initials =
    firstName || lastName
      ? `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
      : user?.emailAddresses[0]?.emailAddress?.charAt(0).toUpperCase() || "?";

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="true"
        className="relative flex h-9 w-9 items-center justify-center rounded-full transition-all duration-200 hover:ring-2 hover:ring-zinc-400 hover:ring-offset-2 hover:ring-offset-background dark:hover:ring-zinc-600 dark:hover:ring-offset-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-400 focus:ring-offset-2 focus:ring-offset-background active:scale-95"
      >
        {avatarUrl ? (
          <Image
            src={avatarUrl}
            alt={user?.fullName || "User profile"}
            fill
            className="rounded-full object-cover"
          />
        ) : (
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-zinc-100 text-zinc-600 text-sm font-medium dark:bg-zinc-800 dark:text-zinc-300">
            {initials}
          </div>
        )}
      </button>

      {}
      <div
        className={`absolute left-1/2 top-full -translate-x-1/2 transition-all duration-200 ease-out ${
          isOpen
            ? "opacity-100 translate-y-0"
            : "opacity-0 -translate-y-1 pointer-events-none"
        }`}
      >
        <div className="h-2 w-2 rotate-45 border-l border-t border-zinc-200 bg-white dark:border-zinc-700 dark:bg-zinc-800 shadow-sm" />
      </div>

      {isOpen && (
        <UserDropdown
          onClose={() => setIsOpen(false)}
          onOpenKeyboardShortcuts={() => setShowKeyboardShortcuts(true)}
        />
      )}

      {showKeyboardShortcuts && isBrowser && createPortal(
        <KeyboardShortcutsHelp
          isOpen={showKeyboardShortcuts}
          onClose={() => setShowKeyboardShortcuts(false)}
        />,
        document.body
      )}
    </div>
  );
}
