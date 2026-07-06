import { memo } from "react";
import { formatNumber } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { KpiMetric } from "@/types";

export interface KpiCardProps {
  metric: KpiMetric;
}

function KpiCardImpl({ metric }: KpiCardProps): React.JSX.Element {
  const isPositive = (metric.changePercent ?? 0) >= 0;

  return (
    <div className="flex flex-col gap-2 rounded-lg border border-border bg-background p-4">
      <p className="text-sm font-medium text-muted-foreground">{metric.label}</p>
      <p className="text-2xl font-semibold text-foreground">
        {formatNumber(metric.value)}
        {metric.unit && <span className="ml-1 text-sm font-normal text-muted-foreground">{metric.unit}</span>}
      </p>
      {metric.changePercent !== undefined && (
        <p
          className={cn(
            "text-xs font-medium",
            isPositive ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400",
          )}
        >
          {isPositive ? "+" : ""}
          {metric.changePercent.toFixed(1)}%
        </p>
      )}
    </div>
  );
}

export const KpiCard = memo(KpiCardImpl);
