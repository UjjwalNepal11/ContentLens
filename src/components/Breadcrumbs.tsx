"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";
import { cn } from "@/lib/utils";

interface BreadcrumbsProps {
  className?: string;
}

export function Breadcrumbs({ className }: BreadcrumbsProps) {
  const pathname = usePathname();
  const pathSegments = pathname.split("/").filter(Boolean);

  const breadcrumbs = pathSegments.map((segment, index) => {
    const href = "/" + pathSegments.slice(0, index + 1).join("/");
    const label = segment.charAt(0).toUpperCase() + segment.slice(1);
    return { href, label };
  });

  return (
    <nav
      className={cn(
        "flex items-center space-x-2 text-sm",
        className,
      )}
      aria-label="Breadcrumb"
    >
      <Link href="/dashboard" className="flex items-center text-muted-foreground hover:text-foreground transition-colors">
        <Home size={16} />
      </Link>
      {breadcrumbs.map((crumb, index) => (
        <div key={crumb.href} className="flex items-center">
          <ChevronRight size={16} className="text-muted-foreground/50" />
          {index === breadcrumbs.length - 1 ? (
            <span className="ml-2 font-medium text-foreground bg-gradient-to-r from-cyan-500 to-violet-500 bg-clip-text text-transparent">
              {crumb.label}
            </span>
          ) : (
            <Link href={crumb.href} className="ml-2 text-muted-foreground hover:text-foreground transition-colors">
              {crumb.label}
            </Link>
          )}
        </div>
      ))}
    </nav>
  );
}
