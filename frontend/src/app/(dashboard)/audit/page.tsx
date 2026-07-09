"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { createColumnHelper, flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { saveAs } from "file-saver";
import { Download, Search } from "lucide-react";
import { fetchAuditLogs, AUDIT_ACTION_TYPES, type AuditLogEntry, type AuditLogStatus } from "@/features/audit/api";
import { fetchAdminUsers } from "@/features/admin/api";
import { DEFAULT_PAGE_SIZE } from "@/lib/constants";
import { formatDateTime } from "@/lib/utils";
import { cn } from "@/lib/utils";

const inputClass =
  "w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-700 outline-none " +
  "focus:outline-none focus:ring-2 focus:ring-[#232B2B] focus:border-transparent placeholder:text-gray-300 " +
  "transition-all duration-200";
const selectClass = cn(inputClass, "appearance-none cursor-pointer");
const labelClass = "mb-1.5 block text-xs font-medium uppercase tracking-wide text-gray-500";

function StatusBadge({ status }: { status: AuditLogStatus }): React.JSX.Element {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium",
        status === "SUCCESS" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600",
      )}
    >
      {status === "SUCCESS" ? "Success" : "Failed"}
    </span>
  );
}

function escapeCsvValue(value: string): string {
  if (/[",\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function buildCsv(rows: AuditLogEntry[]): string {
  const header = ["Timestamp", "User", "Action", "Report", "IP Address", "Status"];
  const lines = rows.map((row) =>
    [formatDateTime(row.timestamp), row.userName ?? row.userEmail, row.action, row.report ?? "", row.ipAddress, row.status]
      .map(escapeCsvValue)
      .join(","),
  );
  return [header.join(","), ...lines].join("\n");
}

const columnHelper = createColumnHelper<AuditLogEntry>();

export default function AuditPage(): React.JSX.Element {
  const [page, setPage] = useState(0);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [actionType, setActionType] = useState("");
  const [search, setSearch] = useState("");

  const usersQuery = useQuery({ queryKey: ["admin", "users"], queryFn: fetchAdminUsers });

  const auditQuery = useQuery({
    queryKey: ["audit", "logs", { page, fromDate, toDate, userEmail, actionType, search }],
    queryFn: () =>
      fetchAuditLogs({
        page,
        pageSize: DEFAULT_PAGE_SIZE,
        from: fromDate || undefined,
        to: toDate || undefined,
        userEmail: userEmail || undefined,
        action: actionType || undefined,
        search: search || undefined,
      }),
  });

  const rows = useMemo(() => auditQuery.data?.content ?? [], [auditQuery.data]);

  const columns = useMemo(
    () => [
      columnHelper.accessor("timestamp", {
        header: "Timestamp",
        cell: (info) => formatDateTime(info.getValue()),
      }),
      columnHelper.display({
        id: "user",
        header: "User",
        cell: (info) => info.row.original.userName ?? info.row.original.userEmail,
      }),
      columnHelper.accessor("action", {
        header: "Action",
        cell: (info) => info.getValue().replace(/_/g, " "),
      }),
      columnHelper.accessor("report", {
        header: "Report",
        cell: (info) => info.getValue() ?? "—",
      }),
      columnHelper.accessor("ipAddress", {
        header: "IP Address",
      }),
      columnHelper.accessor("status", {
        header: "Status",
        cell: (info) => <StatusBadge status={info.getValue()} />,
      }),
    ],
    [],
  );

  const table = useReactTable({
    data: rows,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const handleExport = (): void => {
    if (rows.length === 0) return;
    const csv = buildCsv(rows);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, `audit-log-page-${page + 1}.csv`);
  };

  const totalPages = auditQuery.data ? Math.max(auditQuery.data.totalPages, 1) : 1;

  return (
    <div className="flex flex-col gap-6">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-800">Audit Log</h1>
          <button
            type="button"
            onClick={handleExport}
            disabled={rows.length === 0}
            className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm
                      font-medium text-gray-700 transition-all duration-200 hover:border-gray-300 hover:bg-gray-50
                      disabled:opacity-40 disabled:pointer-events-none"
          >
            <Download className="h-4 w-4" />
            Export CSV
          </button>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <label className={labelClass}>Date Range</label>
            <div className="flex items-center gap-2">
              <input
                type="date"
                aria-label="From date"
                value={fromDate}
                onChange={(event) => {
                  setPage(0);
                  setFromDate(event.target.value);
                }}
                className={inputClass}
              />
              <span className="text-gray-300">–</span>
              <input
                type="date"
                aria-label="To date"
                value={toDate}
                onChange={(event) => {
                  setPage(0);
                  setToDate(event.target.value);
                }}
                className={inputClass}
              />
            </div>
          </div>

          <div>
            <label htmlFor="userFilter" className={labelClass}>
              User
            </label>
            <select
              id="userFilter"
              className={selectClass}
              value={userEmail}
              onChange={(event) => {
                setPage(0);
                setUserEmail(event.target.value);
              }}
            >
              <option value="">All users</option>
              {usersQuery.data?.map((adminUser) => (
                <option key={adminUser.id} value={adminUser.email}>
                  {adminUser.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="actionFilter" className={labelClass}>
              Action Type
            </label>
            <select
              id="actionFilter"
              className={selectClass}
              value={actionType}
              onChange={(event) => {
                setPage(0);
                setActionType(event.target.value);
              }}
            >
              <option value="">All actions</option>
              {AUDIT_ACTION_TYPES.map((action) => (
                <option key={action} value={action}>
                  {action.replace(/_/g, " ")}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="search" className={labelClass}>
              Search
            </label>
            <div className="relative">
              <Search className="pointer-events-none absolute inset-y-0 left-3.5 my-auto h-4 w-4 text-gray-400" />
              <input
                id="search"
                type="text"
                placeholder="Search audit log..."
                value={search}
                onChange={(event) => {
                  setPage(0);
                  setSearch(event.target.value);
                }}
                className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-10 pr-3 text-sm text-gray-700
                          outline-none focus:outline-none focus:ring-2 focus:ring-[#232B2B] focus:border-transparent
                          placeholder:text-gray-300 transition-all duration-200"
              />
            </div>
          </div>
        </div>

        <div className="mt-6 overflow-x-auto rounded-xl border border-gray-100">
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
              {auditQuery.isLoading && (
                <tr>
                  <td colSpan={columns.length} className="px-4 py-6 text-center text-sm text-gray-400">
                    Loading audit logs...
                  </td>
                </tr>
              )}
              {auditQuery.isError && (
                <tr>
                  <td colSpan={columns.length} className="px-4 py-6 text-center text-sm text-red-600">
                    Failed to load audit logs.
                  </td>
                </tr>
              )}
              {!auditQuery.isLoading && !auditQuery.isError && rows.length === 0 && (
                <tr>
                  <td colSpan={columns.length} className="px-4 py-6 text-center text-sm text-gray-400">
                    No audit log entries found.
                  </td>
                </tr>
              )}
              {!auditQuery.isLoading &&
                !auditQuery.isError &&
                table.getRowModel().rows.map((row, index) => (
                  <tr key={row.id} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-4 py-3 text-gray-700">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
          <span>
            Page {(auditQuery.data?.page ?? 0) + 1} of {totalPages}
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={page === 0}
              onClick={() => setPage((prev) => Math.max(0, prev - 1))}
              className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600
                        transition-all duration-200 hover:border-gray-300 hover:bg-gray-50 disabled:opacity-40 disabled:pointer-events-none"
            >
              Previous
            </button>
            <button
              type="button"
              disabled={!auditQuery.data || page + 1 >= auditQuery.data.totalPages}
              onClick={() => setPage((prev) => prev + 1)}
              className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600
                        transition-all duration-200 hover:border-gray-300 hover:bg-gray-50 disabled:opacity-40 disabled:pointer-events-none"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      <footer className="text-center text-xs text-gray-400">© 2026 - Business Transformation, IPDC Finance Limited</footer>
    </div>
  );
}
