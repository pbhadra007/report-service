"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchEtlPipelineJobs } from "@/features/etl/api";
import { formatDateTime } from "@/lib/utils";
import { cn } from "@/lib/utils";

const STATUS_STYLES: Record<string, string> = {
  PENDING: "text-muted-foreground",
  RUNNING: "text-amber-600 dark:text-amber-400",
  SUCCESS: "text-green-600 dark:text-green-400",
  FAILED: "text-red-600 dark:text-red-400",
};

export default function EtlMonitorPage(): React.JSX.Element {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["etl", "jobs"],
    queryFn: fetchEtlPipelineJobs,
    refetchInterval: 30 * 1000,
  });

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-semibold text-foreground">COB Pipeline Status Monitor</h1>

      {isLoading && <p className="text-sm text-muted-foreground">Loading pipeline jobs...</p>}
      {isError && <p className="text-sm text-destructive">Failed to load pipeline jobs.</p>}

      {data && (
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-border text-left text-muted-foreground">
              <th className="px-3 py-2">Job</th>
              <th className="px-3 py-2">Status</th>
              <th className="px-3 py-2">Started</th>
              <th className="px-3 py-2">Finished</th>
            </tr>
          </thead>
          <tbody>
            {data.map((job) => (
              <tr key={job.id} className="border-b border-border">
                <td className="px-3 py-2 text-foreground">{job.name}</td>
                <td className={cn("px-3 py-2 font-medium", STATUS_STYLES[job.status])}>
                  {job.status}
                </td>
                <td className="px-3 py-2 text-foreground">{formatDateTime(job.startedAt)}</td>
                <td className="px-3 py-2 text-foreground">
                  {job.finishedAt ? formatDateTime(job.finishedAt) : "-"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
