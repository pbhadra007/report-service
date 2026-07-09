"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { createColumnHelper, flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { fetchRegulatoryReturns, type RegulatoryReturn } from "@/features/regulatory/api";
import { formatDate, cn } from "@/lib/utils";

const STATUS_STYLES: Record<RegulatoryReturn["status"], string> = {
  PENDING: "bg-amber-50 text-amber-600",
  SUBMITTED: "bg-green-50 text-green-700",
  OVERDUE: "bg-red-50 text-red-600",
};

const columnHelper = createColumnHelper<RegulatoryReturn>();

export default function RegulatoryPage(): React.JSX.Element {
  const regulatoryQuery = useQuery({ queryKey: ["regulatory", "returns"], queryFn: fetchRegulatoryReturns });
  const rows = regulatoryQuery.data ?? [];

  const columns = useMemo(
    () => [
      columnHelper.accessor("name", {
        header: "Return",
        cell: (info) => <span className="font-medium text-gray-800">{info.getValue()}</span>,
      }),
      columnHelper.accessor("frequency", {
        header: "Frequency",
        cell: (info) => <span className="text-gray-600">{info.getValue()}</span>,
      }),
      columnHelper.accessor("dueDate", {
        header: "Due Date",
        cell: (info) => <span className="text-gray-600">{formatDate(info.getValue())}</span>,
      }),
      columnHelper.accessor("status", {
        header: "Status",
        cell: (info) => (
          <span className={cn("inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium", STATUS_STYLES[info.getValue()])}>
            {info.getValue().charAt(0) + info.getValue().slice(1).toLowerCase()}
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
        <h1 className="text-xl font-bold text-gray-800">Bangladesh Bank Regulatory Returns</h1>
        <p className="text-sm text-gray-400">
          {regulatoryQuery.isLoading ? "Loading returns…" : `${rows.length} regulatory returns`}
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
              {regulatoryQuery.isLoading && (
                <tr>
                  <td colSpan={columns.length} className="px-4 py-6 text-center text-sm text-gray-400">
                    Loading returns...
                  </td>
                </tr>
              )}
              {regulatoryQuery.isError && (
                <tr>
                  <td colSpan={columns.length} className="px-4 py-6 text-center text-sm text-red-600">
                    Failed to load regulatory returns.
                  </td>
                </tr>
              )}
              {!regulatoryQuery.isLoading && !regulatoryQuery.isError && rows.length === 0 && (
                <tr>
                  <td colSpan={columns.length} className="px-4 py-6 text-center text-sm text-gray-400">
                    No regulatory returns found.
                  </td>
                </tr>
              )}
              {!regulatoryQuery.isLoading &&
                !regulatoryQuery.isError &&
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

      <footer className="text-center text-xs text-gray-400">© 2026 - Business Transformation, IPDC Finance Limited</footer>
    </div>
  );
}
