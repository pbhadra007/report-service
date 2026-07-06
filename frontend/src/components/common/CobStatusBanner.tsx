"use client";

import { useCobStatus } from "@/hooks/useCobStatus";
import { formatDateTime } from "@/lib/utils";
import { cn } from "@/lib/utils";

export function CobStatusBanner(): React.JSX.Element {
  const { cobStatus, isLoading, isError } = useCobStatus();

  if (isLoading && !cobStatus) {
    return (
      <div className="w-full border-b border-border bg-muted px-4 py-2 text-sm text-muted-foreground">
        Checking COB status...
      </div>
    );
  }

  if (isError || !cobStatus) {
    return (
      <div className="w-full border-b border-border bg-destructive/10 px-4 py-2 text-sm font-medium text-destructive">
        COB data load failed — contact IT
      </div>
    );
  }

  const statusStyles: Record<string, string> = {
    FRESH: "bg-green-50 text-green-800 dark:bg-green-950 dark:text-green-300",
    LOADING: "bg-amber-50 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
    FAILED: "bg-red-50 text-red-800 dark:bg-red-950 dark:text-red-300",
  };

  const statusText: Record<string, string> = {
    FRESH: `Data as of: ${cobStatus.cobDate} — Last loaded: ${formatDateTime(cobStatus.lastLoadedAt)}`,
    LOADING: "COB data loading in progress...",
    FAILED: "COB data load failed — contact IT",
  };

  return (
    <div
      className={cn(
        "w-full border-b border-border px-4 py-2 text-sm font-medium",
        statusStyles[cobStatus.status],
      )}
    >
      {statusText[cobStatus.status]}
    </div>
  );
}
