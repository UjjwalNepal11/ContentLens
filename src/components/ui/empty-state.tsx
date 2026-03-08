import * as React from "react";
import { cn } from "@/lib/utils";

const EmptyState = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { message?: string }
>(({ className, message = "No data available", ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex flex-col items-center justify-center p-8 text-center",
      className,
    )}
    {...props}
  >
    <p className="text-muted-foreground">{message}</p>
  </div>
));
EmptyState.displayName = "EmptyState";

export { EmptyState };
