"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { createColumnHelper, flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { Search, ArrowRight, Plus, FileStack, FolderKanban, ChevronLeft, ChevronRight } from "lucide-react";
import { REPORT_CATALOGUE, REPORT_CATEGORIES, getCategoryById, type ReportDefinition } from "@/config/reports.config";
import { Breadcrumb } from "@/components/common/Breadcrumb";
import { cn } from "@/lib/utils";

const ROWS_PER_PAGE = 10;
const LAST_GENERATED_REFERENCE = new Date(2026, 6, 11);

function getLastGeneratedDate(reportId: number): string {
  const dayOffset = reportId % 45;
  const date = new Date(LAST_GENERATED_REFERENCE);
  date.setDate(date.getDate() - dayOffset);
  return format(date, "dd-MMM-yy");
}

const inputClass =
  "w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-700 outline-none " +
  "focus:outline-none focus:ring-2 focus:ring-[#232B2B] focus:border-transparent placeholder:text-gray-300 " +
  "transition-all duration-200";
const selectClass = cn(inputClass, "appearance-none cursor-pointer");
const labelClass = "mb-1.5 block text-xs font-medium uppercase tracking-wide text-gray-500";

const columnHelper = createColumnHelper<ReportDefinition>();

function MiniSparkline({ points, color }: { points: number[]; color: string }): React.JSX.Element {
  const width = 100;
  const height = 28;
  const max = Math.max(...points);
  const min = Math.min(...points);
  const range = max - min || 1;
  const step = width / (points.length - 1 || 1);
  const path = points
    .map((point, index) => `${index === 0 ? "M" : "L"}${index * step},${height - ((point - min) / range) * height}`)
    .join(" ");
  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="h-6 w-full" preserveAspectRatio="none">
      <path d={path} fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

interface SummaryCardData {
  icon: typeof FileStack;
  label: string;
  value: number;
  caption: string;
  sparkline: number[];
  accent: string;
}

function getPageNumbers(current: number, total: number): (number | "...")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages: (number | "...")[] = [1];
  if (current > 3) pages.push("...");
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  for (let i = start; i <= end; i++) pages.push(i);
  if (current < total - 2) pages.push("...");
  pages.push(total);
  return pages;
}

function SummaryCard({ icon: Icon, label, value, caption, sparkline, accent }: SummaryCardData): React.JSX.Element {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-xl" style={{ backgroundColor: `${accent}1A` }}>
          <Icon className="h-4 w-4" style={{ color: accent }} />
        </span>
        <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">{label}</span>
      </div>

      <div className="flex items-baseline gap-2">
        <span className="text-3xl font-bold text-gray-900">{value}</span>
      </div>

      <p className="text-xs text-gray-400">{caption}</p>
      <MiniSparkline points={sparkline} color={accent} />
    </div>
  );
}

export default function AdminReportManagementPage(): React.JSX.Element {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  const summaryCards: SummaryCardData[] = [
    {
      icon: FileStack,
      label: "Total Reports",
      value: REPORT_CATALOGUE.length,
      caption: "All reports",
      sparkline: [12, 14, 15, 17, 18, REPORT_CATALOGUE.length],
      accent: "#232B2B",
    },
    {
      icon: FolderKanban,
      label: "Report Categories",
      value: REPORT_CATEGORIES.length,
      caption: "Across the catalogue",
      sparkline: [3, 3, 4, 4, 5, REPORT_CATEGORIES.length],
      accent: "#ED017F",
    },
  ];

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
      columnHelper.display({
        id: "lastGenerated",
        header: "Last Generated",
        cell: (info) => <span className="text-gray-500">{getLastGeneratedDate(info.row.original.reportId)}</span>,
      }),
      columnHelper.display({
        id: "actions",
        header: "Actions",
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

  const filterSignature = `${search}|${categoryFilter}`;
  const [prevFilterSignature, setPrevFilterSignature] = useState(filterSignature);
  if (filterSignature !== prevFilterSignature) {
    setPrevFilterSignature(filterSignature);
    setPage(1);
  }

  const totalPages = Math.max(1, Math.ceil(filteredReports.length / ROWS_PER_PAGE));
  const clampedPage = Math.min(page, totalPages);
  const startIndex = (clampedPage - 1) * ROWS_PER_PAGE;
  const pageReports = filteredReports.slice(startIndex, startIndex + ROWS_PER_PAGE);
  const pageNumbers = getPageNumbers(clampedPage, totalPages);

  const table = useReactTable({
    data: pageReports,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="flex flex-col gap-6">
      <Breadcrumb items={[{ label: "Administration", href: "/admin/dashboard" }, { label: "Reports" }]} />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Report Management</h1>
          <p className="text-sm text-gray-400">
            {REPORT_CATALOGUE.length} reports across {REPORT_CATEGORIES.length} categories.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setActionMessage("Adding new reports isn't supported yet — the catalogue is a fixed system list.")}
          className="inline-flex items-center gap-2 rounded-xl border border-transparent bg-[#232B2B] px-6 py-2.5
                    text-sm font-semibold text-white transition-all duration-200 hover:border-[#232B2B]
                    hover:bg-white hover:text-[#232B2B]"
        >
          <Plus className="h-4 w-4" />
          Add New Report
        </button>
      </div>

      {actionMessage && <p className="text-sm font-medium text-gray-600">{actionMessage}</p>}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {summaryCards.map((card) => (
          <SummaryCard key={card.label} {...card} />
        ))}
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

        <div className="mt-4 overflow-x-auto rounded-xl border border-gray-100">
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
              {pageReports.length === 0 && (
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

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-gray-500">
            Showing {filteredReports.length === 0 ? 0 : startIndex + 1}–{Math.min(startIndex + ROWS_PER_PAGE, filteredReports.length)} of{" "}
            {filteredReports.length} reports
          </p>

          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled={clampedPage === 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 disabled:pointer-events-none disabled:opacity-40"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            {pageNumbers.map((pageNumber, index) =>
              pageNumber === "..." ? (
                <span key={`ellipsis-${index}`} className="px-2 text-sm text-gray-400">
                  ...
                </span>
              ) : (
                <button
                  key={pageNumber}
                  type="button"
                  onClick={() => setPage(pageNumber)}
                  className={cn(
                    "h-8 w-8 rounded-lg text-sm font-medium transition-colors",
                    pageNumber === clampedPage ? "bg-[#232B2B] text-white" : "text-gray-600 hover:bg-gray-100",
                  )}
                >
                  {pageNumber}
                </button>
              ),
            )}
            <button
              type="button"
              disabled={clampedPage === totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 disabled:pointer-events-none disabled:opacity-40"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      <footer className="text-center text-xs text-gray-400">© 2026 - Business Transformation, IPDC Finance Limited</footer>
    </div>
  );
}
