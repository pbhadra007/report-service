"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { createColumnHelper, flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { fetchSchedules, type ScheduledReport } from "@/features/schedule/api";
import { cn } from "@/lib/utils";

const columnHelper = createColumnHelper<ScheduledReport>();

export default function SchedulePage(): React.JSX.Element {
  const scheduleQuery = useQuery({ queryKey: ["schedule", "list"], queryFn: fetchSchedules });
  const rows = scheduleQuery.data ?? [];

  const columns = useMemo(
    () => [
      columnHelper.accessor("reportName", {
        header: "Report",
        cell: (info) => <span className="font-medium text-gray-800">{info.getValue()}</span>,
      }),
      columnHelper.accessor("cronExpression", {
        header: "Schedule",
        cell: (info) => <span className="font-mono text-xs text-gray-600">{info.getValue()}</span>,
      }),
      columnHelper.accessor("recipients", {
        header: "Recipients",
        cell: (info) => <span className="text-gray-600">{info.getValue().join(", ")}</span>,
      }),
      columnHelper.accessor("active", {
        header: "Status",
        cell: (info) => (
          <span
            className={cn(
              "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium",
              info.getValue() ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-500",
            )}
          >
            {info.getValue() ? "Active" : "Paused"}
          </span>
        ),
      }),
    ],
    [],
  );

  const table = useReactTable({
    data: rows,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-bold text-gray-800">Scheduled Reports</h1>
        <p className="text-sm text-gray-400">
          {scheduleQuery.isLoading ? "Loading schedules…" : `${rows.length} scheduled reports`}
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="overflow-x-auto rounded-xl border border-gray-100">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-white">
                {table.getFlatHeaders().map((header) => (
                  <th key={header.id} className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-gray-400">
                    {flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {scheduleQuery.isLoading && (
                <tr>
                  <td colSpan={columns.length} className="px-4 py-6 text-center text-sm text-gray-400">
                    Loading schedules...
                  </td>
                </tr>
              )}
              {scheduleQuery.isError && (
                <tr>
                  <td colSpan={columns.length} className="px-4 py-6 text-center text-sm text-red-600">
                    Failed to load scheduled reports.
                  </td>
                </tr>
              )}
              {!scheduleQuery.isLoading && !scheduleQuery.isError && rows.length === 0 && (
                <tr>
                  <td colSpan={columns.length} className="px-4 py-6 text-center text-sm text-gray-400">
                    No scheduled reports yet.
                  </td>
                </tr>
              )}
              {!scheduleQuery.isLoading &&
                !scheduleQuery.isError &&
                table.getRowModel().rows.map((row, index) => (
                  <tr key={row.id} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-4 py-3">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}