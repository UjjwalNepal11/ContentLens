"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  BarChart3,
  History,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  collapsed?: boolean;
  setCollapsed?: (collapsed: boolean) => void;
  onNavigate?: () => void;
  className?: string;
}

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
  { name: "History", href: "/dashboard/history", icon: History },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
];

export function Sidebar({ collapsed = false, setCollapsed, onNavigate, className }: SidebarProps) {
  const [isHovered, setIsHovered] = useState(false);
  const pathname = usePathname();

  const isActive = (href: string) => {
    return pathname === href || pathname.startsWith(href + "/");
  };

  return (
    <div
      className={cn(
        "flex flex-col h-full bg-sidebar text-sidebar-foreground border-r border-sidebar-border transition-all duration-300 ease-in-out overflow-visible",
        collapsed ? "w-16" : "w-64",
        className,
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {}
      <div className="relative flex items-center justify-between p-4 border-b border-sidebar-border">
        {!collapsed && (
          <div className="flex items-center space-x-2 animate-fadeIn">
            <Image
              src="/favicon.ico"
              alt="Logo"
              width={32}
              height={32}
              className="w-8 h-8 rounded-full object-cover"
            />
            <span className="text-lg font-bold text-sidebar-foreground">
              ContentLens
            </span>
          </div>
        )}
        {collapsed && !isHovered && (
          <div className="flex items-center justify-center w-8 h-8 mx-auto transition-all duration-300 hover:scale-110">
            <Image
              src="/favicon.ico"
              alt="Logo"
              width={32}
              height={32}
              className="w-8 h-8 rounded-full object-cover"
            />
          </div>
        )}
        {collapsed && isHovered && setCollapsed && (
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="flex items-center justify-center w-8 h-8 mx-auto bg-primary rounded-lg hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring transition-all duration-300 hover:scale-110"
            aria-label="Expand sidebar"
          >
            <ChevronRight size={18} className="text-primary-foreground transition-transform duration-300" />
          </button>
        )}
        {!collapsed && setCollapsed && (
          <button
            onClick={() => setCollapsed(!collapsed)}
            className={cn(
              "p-1.5 rounded-md hover:bg-accent focus:outline-none focus:ring-2 focus:ring-ring transition-all duration-200 hover:scale-110 ml-auto"
            )}
            aria-label="Collapse sidebar"
          >
            <ChevronLeft size={18} className="text-sidebar-foreground transition-transform duration-300" />
          </button>
        )}
      </div>

      {}
      <nav className="flex-1 p-3 space-y-1">
        {navigation.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.name}
              href={item.href}
              prefetch
              onClick={() => onNavigate && onNavigate()}
              className={cn(
                "flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 hover:scale-105 relative overflow-hidden group",
                active
                  ? "bg-gradient-to-r from-cyan-100 to-violet-100 text-cyan-700 dark:text-cyan-300 dark:from-cyan-900/30 dark:to-violet-900/30"
                  : "text-sidebar-foreground/70 hover:bg-accent hover:text-accent-foreground",
                collapsed && "justify-center px-2"
              )}
              title={collapsed ? item.name : undefined}
            >
              {active && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-cyan-500 to-violet-500 rounded-r-full animate-expandWidth" />
              )}
              <item.icon
                size={20}
                className={cn(
                  "transition-all duration-200 flex-shrink-0",
                  active ? "text-cyan-700 dark:text-cyan-300" : "text-sidebar-foreground/70 group-hover:text-foreground"
                )}
              />
              {!collapsed && <span className="ml-3 animate-fadeIn">{item.name}</span>}
            </Link>
          );
        })}
      </nav>

      {}
      {!collapsed && (
        <div className="p-4 border-t border-sidebar-border animate-fadeIn">
          <p className="text-xs text-muted-foreground text-center">
            &copy; {new Date().getFullYear()} ContentLens. All rights reserved.
          </p>
        </div>
      )}
    </div>
  );
}
