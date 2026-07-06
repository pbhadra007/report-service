"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchSchedules } from "@/features/schedule/api";

export default function SchedulePage(): React.JSX.Element {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["schedule", "list"],
    queryFn: fetchSchedules,
  });

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-semibold text-foreground">Scheduled Reports</h1>

      {isLoading && <p className="text-sm text-muted-foreground">Loading schedules...</p>}
      {isError && <p className="text-sm text-destructive">Failed to load scheduled reports.</p>}

      {data && (
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-border text-left text-muted-foreground">
              <th className="px-3 py-2">Report</th>
              <th className="px-3 py-2">Schedule</th>
              <th className="px-3 py-2">Recipients</th>
              <th className="px-3 py-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {data.map((schedule) => (
              <tr key={schedule.id} className="border-b border-border">
                <td className="px-3 py-2 text-foreground">{schedule.reportName}</td>
                <td className="px-3 py-2 font-mono text-xs text-foreground">
                  {schedule.cronExpression}
                </td>
                <td className="px-3 py-2 text-foreground">{schedule.recipients.join(", ")}</td>
                <td className="px-3 py-2 text-foreground">
                  {schedule.active ? "Active" : "Paused"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
