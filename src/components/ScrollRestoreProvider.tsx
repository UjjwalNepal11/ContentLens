"use client";

import { useScrollRestore } from "@/lib/hooks";

export function ScrollRestoreProvider({ children }: { children: React.ReactNode }) {
  useScrollRestore();
  return <>{children}</>;
}
