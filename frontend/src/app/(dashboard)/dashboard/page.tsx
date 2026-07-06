"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";
import { KpiCard } from "@/components/dashboard/KpiCard";
import type { KpiMetric } from "@/types";

async function fetchKpis(): Promise<KpiMetric[]> {
  const response = await apiClient.get<KpiMetric[]>("/dashboard/kpis");
  return response.data;
}

export default function DashboardPage(): React.JSX.Element {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["dashboard", "kpis"],
    queryFn: fetchKpis,
  });

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-semibold text-foreground">Executive Dashboard</h1>

      {isLoading && <p className="text-sm text-muted-foreground">Loading KPIs...</p>}
      {isError && <p className="text-sm text-destructive">Failed to load KPI data.</p>}

      {data && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {data.map((metric) => (
            <KpiCard key={metric.id} metric={metric} />
          ))}
        </div>
      )}
    </div>
  );
}
