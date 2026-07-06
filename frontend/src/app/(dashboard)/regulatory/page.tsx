"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchRegulatoryReturns } from "@/features/regulatory/api";
import { formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";

const STATUS_STYLES: Record<string, string> = {
  PENDING: "text-amber-600 dark:text-amber-400",
  SUBMITTED: "text-green-600 dark:text-green-400",
  OVERDUE: "text-red-600 dark:text-red-400",
};

export default function RegulatoryPage(): React.JSX.Element {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["regulatory", "returns"],
    queryFn: fetchRegulatoryReturns,
  });

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-semibold text-foreground">Bangladesh Bank Regulatory Returns</h1>

      {isLoading && <p className="text-sm text-muted-foreground">Loading returns...</p>}
      {isError && <p className="text-sm text-destructive">Failed to load regulatory returns.</p>}

      {data && (
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-border text-left text-muted-foreground">
              <th className="px-3 py-2">Return</th>
              <th className="px-3 py-2">Frequency</th>
              <th className="px-3 py-2">Due date</th>
              <th className="px-3 py-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {data.map((ret) => (
              <tr key={ret.id} className="border-b border-border">
                <td className="px-3 py-2 text-foreground">{ret.name}</td>
                <td className="px-3 py-2 text-foreground">{ret.frequency}</td>
                <td className="px-3 py-2 text-foreground">{formatDate(ret.dueDate)}</td>
                <td className={cn("px-3 py-2 font-medium", STATUS_STYLES[ret.status])}>
                  {ret.status}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
