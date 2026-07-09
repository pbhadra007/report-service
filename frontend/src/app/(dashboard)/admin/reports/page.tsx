"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { createColumnHelper, flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { Search, ArrowRight } from "lucide-react";
import { REPORT_CATALOGUE, REPORT_CATEGORIES, getCategoryById, type ReportDefinition } from "@/config/reports.config";
import { cn } from "@/lib/utils";

const inputClass =
  "w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-700 outline-none " +
  "focus:outline-none focus:ring-2 focus:ring-[#232B2B] focus:border-transparent placeholder:text-gray-300 " +
  "transition-all duration-200";
const selectClass = cn(inputClass, "appearance-none cursor-pointer");
const labelClass = "mb-1.5 block text-xs font-medium uppercase tracking-wide text-gray-500";

const columnHelper = createColumnHelper<ReportDefinition>();

export default function AdminReportManagementPage(): React.JSX.Element {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");

  const filteredReports = useMemo(() => {
    const query = search.trim().toLowerCase();
    return REPORT_CATALOGUE.filter((report) => {
      const matchesCategory = !categoryFilter || report.category === categoryFilter;
      const matchesSearch =
        !query || report.name.toLowerCase().includes(query) || String(report.reportId).includes(query);
      return matchesCategory && matchesSearch;
    });
  }, [search, categoryFilter]);

  const columns = useMemo(
    () => [
      columnHelper.accessor("reportId", {
        header: "Report ID",
        cell: (info) => <span className="text-gray-500">#{info.getValue()}</span>,
      }),
      columnHelper.accessor("name", {
        header: "Report Name",
        cell: (info) => <span className="font-medium text-gray-800">{info.getValue()}</span>,
      }),
      columnHelper.accessor("category", {
        header: "Category",
        cell: (info) => {
          const category = getCategoryById(info.getValue());
          return (
            <span className="inline-flex items-center gap-1.5 text-gray-600">
              <span className="text-base leading-none">{category?.icon}</span>
              {category?.label ?? info.getValue()}
            </span>
          );
        },
      }),
      columnHelper.accessor("params", {
        header: "Parameters",
        cell: (info) => (
          <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600">
            {info.getValue().length} field{info.getValue().length === 1 ? "" : "s"}
          </span>
        ),
      }),
      columnHelper.display({
        id: "view",
        header: "",
        cell: (info) => (
          <Link
            href={`/reports/${info.row.original.category}/${info.row.original.reportId}`}
            className="inline-flex items-center gap-1 text-xs font-medium text-[#ED017F] hover:underline"
          >
            View
            <ArrowRight className="h-3 w-3" />
          </Link>
        ),
      }),
    ],
    [],
  );

  const table = useReactTable({
    data: filteredReports,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-bold text-gray-800">Report Management</h1>
        <p className="text-sm text-gray-400">
          {REPORT_CATALOGUE.length} reports across {REPORT_CATEGORIES.length} categories.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="sm:col-span-2">
            <label htmlFor="search" className={labelClass}>
              Search
            </label>
            <div className="relative">
              <Search className="pointer-events-none absolute inset-y-0 left-3.5 my-auto h-4 w-4 text-gray-400" />
              <input
                id="search"
                type="text"
                placeholder="Search by report name or ID..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-700
                          outline-none focus:outline-none focus:ring-2 focus:ring-[#232B2B] focus:border-transparent
                          placeholder:text-gray-300 transition-all duration-200"
              />
            </div>
          </div>

          <div>
            <label htmlFor="categoryFilter" className={labelClass}>
              Category
            </label>
            <select
              id="categoryFilter"
              className={selectClass}
              value={categoryFilter}
              onChange={(event) => setCategoryFilter(event.target.value)}
            >
              <option value="">All categories</option>
              {REPORT_CATEGORIES.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <p className="mt-4 text-xs text-gray-400">
          Showing {filteredReports.length} of {REPORT_CATALOGUE.length} reports
        </p>

        <div className="mt-4 max-h-[32rem] overflow-y-auto rounded-xl border border-gray-100">
          <table className="w-full text-left text-sm">
            <thead className="sticky top-0">
              <tr className="border-b border-gray-100 bg-white">
                {table.getFlatHeaders().map((header) => (
                  <th key={header.id} className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-gray-400">
                    {flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredReports.length === 0 && (
                <tr>
                  <td colSpan={columns.length} className="px-4 py-6 text-center text-sm text-gray-400">
                    No reports found.
                  </td>
                </tr>
              )}
              {table.getRowModel().rows.map((row, index) => (
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
      </div>

      <footer className="text-center text-xs text-gray-400">© 2026 - Business Transformation, IPDC Finance Limited</footer>
    </div>
  );
}
