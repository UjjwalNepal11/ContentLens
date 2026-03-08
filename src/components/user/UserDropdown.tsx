"use client";

import { useRef, useState } from "react";
import { useUser, useClerk } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Settings,
  LogOut,
  AlertTriangle,
  Keyboard,
  HelpCircle,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface UserDropdownProps {
  onClose: () => void;
  onOpenKeyboardShortcuts?: () => void;
}

export function UserDropdown({ onClose, onOpenKeyboardShortcuts }: UserDropdownProps) {
  const { user } = useUser();
  const { signOut } = useClerk();
  const pathname = usePathname();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleSignOut = async () => {
    await signOut({ redirectUrl: "/" });
    onClose();
  };

  const handleKeyboardShortcutsClick = () => {
    onClose();
    onOpenKeyboardShortcuts?.();
  };

  if (!user) {
    return null;
  }

  const avatarUrl = user.imageUrl;
  const fullName = user.fullName || "";
  const email = user.emailAddresses[0]?.emailAddress || "";

  const menuItems = [
    { icon: Settings, label: "Settings", href: `/settings?returnTo=${encodeURIComponent(pathname)}` },
  ];

  const secondaryMenuItems = [
    {
      icon: Keyboard,
      label: "Keyboard Shortcuts",
      description: "View all shortcuts",
      onClick: handleKeyboardShortcutsClick
    },
    {
      icon: HelpCircle,
      label: "Help & Support",
      description: "Get help or contact us",
      href: "/support"
    },
  ];

  return (
    <div
      ref={dropdownRef}
      className="absolute right-0 top-full mt-2 w-64 rounded-xl border border-zinc-200/50 bg-white shadow-xl dark:border-zinc-800/50 dark:bg-zinc-900 z-50 overflow-hidden animate-scaleIn"
      role="menu"
    >
      {}
      <div className="bg-gradient-to-b from-zinc-50 to-white dark:from-zinc-800/50 dark:to-zinc-900 p-4">
        <div className="flex items-center gap-3">
          {avatarUrl ? (
            <div className="relative flex-shrink-0">
              <div className="h-11 w-11 overflow-hidden rounded-full ring-2 ring-white dark:ring-zinc-700 transition-all duration-300 hover:ring-4 hover:ring-cyan-500/30 hover:scale-105">
                <Image
                  src={avatarUrl}
                  alt={fullName || "User"}
                  width={44}
                  height={44}
                  className="h-full w-full object-cover"
                />
              </div>
              {}
              <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-green-500 dark:border-zinc-800" />
            </div>
          ) : (
            <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-zinc-100 to-zinc-200 dark:from-zinc-700 dark:to-zinc-800 transition-all duration-300 hover:scale-105 hover:shadow-lg">
              <span className="text-sm font-semibold text-zinc-600 dark:text-zinc-300">
                {fullName
                  ? fullName.charAt(0).toUpperCase()
                  : email.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
          <div className="flex min-w-0 flex-col animate-fadeInUp">
            {fullName && (
              <span className="truncate text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                {fullName}
              </span>
            )}
            <span className="truncate text-xs text-zinc-500 dark:text-zinc-400">
              {email}
            </span>
            <span className="mt-0.5 truncate text-[10px] font-medium text-zinc-400 dark:text-zinc-500">
              Free Plan
            </span>
          </div>
        </div>
      </div>

      {}
      <div className="relative h-px bg-gradient-to-r from-transparent via-zinc-200 dark:via-zinc-700 to-transparent" />

      {}
      <div className="p-1.5">
        {menuItems.map((item, index) => (
          <Link
            key={item.href}
            href={item.href}
            className="group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-zinc-600 transition-all duration-200 hover:bg-gradient-to-r hover:from-cyan-50 hover:to-violet-50 hover:text-cyan-700 hover:scale-[1.02] dark:text-zinc-400 dark:hover:bg-gradient-to-r dark:hover:from-cyan-950/30 dark:hover:to-violet-950/30 dark:hover:text-cyan-300 animate-fadeInUp"
            role="menuitem"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-500/10 to-violet-500/10 text-zinc-500 transition-all duration-200 group-hover:from-cyan-500/20 group-hover:to-violet-500/20 group-hover:text-cyan-600 group-hover:scale-110 dark:group-hover:text-cyan-400">
              <item.icon className="h-4 w-4 transition-transform duration-200 group-hover:rotate-12" />
            </div>
            <div className="flex flex-col items-start">
              <span className="font-medium">{item.label}</span>
              <span className="text-[10px] text-zinc-400 dark:text-zinc-500">
                Manage settings
              </span>
            </div>
          </Link>
        ))}
      </div>

      {}
      <div className="mx-4 my-1 h-px bg-gradient-to-r from-transparent via-zinc-200 dark:via-zinc-700 to-transparent" />

      {}
      <div className="p-1.5">
        {secondaryMenuItems.map((item, index) => (
          item.href ? (
            <Link
              key={item.label}
              href={item.href}
              className="group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-zinc-600 transition-all duration-200 hover:bg-gradient-to-r hover:from-cyan-50 hover:to-violet-50 hover:text-cyan-700 dark:text-zinc-400 dark:hover:bg-gradient-to-r dark:hover:from-cyan-950/30 dark:hover:to-violet-950/30 dark:hover:text-cyan-300 animate-fadeInUp"
              role="menuitem"
              style={{ animationDelay: `${(index + 1) * 50}ms` }}
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-500/10 to-violet-500/10 text-zinc-500 transition-all duration-200 group-hover:from-cyan-500/20 group-hover:to-violet-500/20 group-hover:text-cyan-600 group-hover:scale-110 dark:group-hover:text-cyan-400">
                <item.icon className="h-4 w-4 transition-transform duration-200 group-hover:rotate-12" />
              </div>
              <div className="flex flex-1 flex-col items-start">
                <span className="font-medium">{item.label}</span>
                <span className="text-[10px] text-zinc-400 dark:text-zinc-500">
                  {item.description}
                </span>
              </div>
              <ChevronRight className="h-4 w-4 text-zinc-300 opacity-0 transition-all duration-200 group-hover:opacity-100 group-hover:text-cyan-500 group-hover:translate-x-1 dark:text-zinc-600" />
            </Link>
          ) : (
            <button
              key={item.label}
              onClick={item.onClick}
              className="group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-zinc-600 transition-all duration-200 hover:bg-gradient-to-r hover:from-cyan-50 hover:to-violet-50 hover:text-cyan-700 dark:text-zinc-400 dark:hover:bg-gradient-to-r dark:hover:from-cyan-950/30 dark:hover:to-violet-950/30 dark:hover:text-cyan-300 animate-fadeInUp"
              role="menuitem"
              style={{ animationDelay: `${(index + 1) * 50}ms` }}
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-500/10 to-violet-500/10 text-zinc-500 transition-all duration-200 group-hover:from-cyan-500/20 group-hover:to-violet-500/20 group-hover:text-cyan-600 group-hover:scale-110 dark:group-hover:text-cyan-400">
                <item.icon className="h-4 w-4 transition-transform duration-200 group-hover:rotate-12" />
              </div>
              <div className="flex flex-1 flex-col items-start">
                <span className="font-medium">{item.label}</span>
                <span className="text-[10px] text-zinc-400 dark:text-zinc-500">
                  {item.description}
                </span>
              </div>
              <ChevronRight className="h-4 w-4 text-zinc-300 opacity-0 transition-all duration-200 group-hover:opacity-100 group-hover:text-cyan-500 group-hover:translate-x-1 dark:text-zinc-600" />
            </button>
          )
        ))}
      </div>

      {}
      <div className="mx-4 my-1 h-px bg-zinc-100 dark:bg-zinc-800" />

      {}
      <div className="p-1.5">
        {!showLogoutConfirm ? (
          <button
            onClick={() => setShowLogoutConfirm(true)}
            className="group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-red-600 transition-all duration-200 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30 animate-fadeInUp"
            role="menuitem"
            style={{ animationDelay: `150ms` }}
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-50 text-red-500 transition-all duration-200 group-hover:bg-red-100 group-hover:text-red-600 group-hover:scale-110 dark:bg-red-950/30 dark:text-red-400 dark:group-hover:bg-red-950/50 dark:group-hover:text-red-300">
              <LogOut className="h-4 w-4 transition-transform duration-200 group-hover:-translate-x-0.5" />
            </div>
            <div className="flex flex-col items-start">
              <span className="font-medium">Log out</span>
              <span className="text-[10px] text-red-400/70 dark:text-red-500/70">
                Sign out of your account
              </span>
            </div>
          </button>
        ) : (
          <div className="rounded-lg bg-red-50 dark:bg-red-950/20 p-3 animate-scaleIn">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400 animate-bounce" />
              <span className="text-sm font-medium text-red-600 dark:text-red-400">
                Log out?
              </span>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 transition-all duration-200 hover:scale-105"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleSignOut}
                className="flex-1 transition-all duration-200 hover:scale-105"
              >
                Log out
              </Button>
            </div>
          </div>
        )}
      </div>

      {}
      <div className="border-t border-zinc-100 bg-zinc-50/50 px-4 py-2 dark:border-zinc-800 dark:bg-zinc-800/30">
        <p className="text-center text-[10px] text-zinc-400 dark:text-zinc-500">
          Manage your account
        </p>
      </div>
    </div>
  );
}
