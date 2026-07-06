"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchAuditLogs } from "@/features/audit/api";
import { DEFAULT_PAGE_SIZE } from "@/lib/constants";
import { formatDateTime } from "@/lib/utils";

export default function AuditPage(): React.JSX.Element {
  const [page, setPage] = useState(0);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["audit", "logs", page],
    queryFn: () => fetchAuditLogs({ page, pageSize: DEFAULT_PAGE_SIZE }),
  });

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-semibold text-foreground">Audit Log</h1>

      {isLoading && <p className="text-sm text-muted-foreground">Loading audit logs...</p>}
      {isError && <p className="text-sm text-destructive">Failed to load audit logs.</p>}

      {data && (
        <>
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-border text-left text-muted-foreground">
                <th className="px-3 py-2">Timestamp</th>
                <th className="px-3 py-2">Actor</th>
                <th className="px-3 py-2">Action</th>
                <th className="px-3 py-2">Entity</th>
                <th className="px-3 py-2">Detail</th>
              </tr>
            </thead>
            <tbody>
              {data.content.map((entry) => (
                <tr key={entry.id} className="border-b border-border">
                  <td className="px-3 py-2 text-foreground">{formatDateTime(entry.timestamp)}</td>
                  <td className="px-3 py-2 text-foreground">{entry.actorEmail}</td>
                  <td className="px-3 py-2 text-foreground">{entry.action}</td>
                  <td className="px-3 py-2 text-foreground">{entry.entity}</td>
                  <td className="px-3 py-2 text-foreground">{entry.detail}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>
              Page {data.page + 1} of {Math.max(data.totalPages, 1)}
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={page === 0}
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                className="rounded-md border border-input px-3 py-1.5 disabled:opacity-60"
              >
                Previous
              </button>
              <button
                type="button"
                disabled={page + 1 >= data.totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="rounded-md border border-input px-3 py-1.5 disabled:opacity-60"
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
