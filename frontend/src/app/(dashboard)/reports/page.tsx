"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { Search, Eye, FileStack, FolderKanban, ChevronLeft, ChevronRight } from "lucide-react";
import { REPORT_CATALOGUE, REPORT_CATEGORIES, getCategoryById, type ReportCategoryId } from "@/config/reports.config";
import { useReportAccess } from "@/hooks/useReportAccess";
import { Breadcrumb } from "@/components/common/Breadcrumb";
import { CustomSelect } from "@/components/common/CustomSelect";
import { cn } from "@/lib/utils";

const ROWS_PER_PAGE = 10;
const LAST_GENERATED_REFERENCE = new Date(2026, 6, 11);

function getLastGeneratedDate(reportId: number): string {
  const dayOffset = reportId % 45;
  const date = new Date(LAST_GENERATED_REFERENCE);
  date.setDate(date.getDate() - dayOffset);
  return format(date, "dd-MMM-yy");
}

const labelClass = "mb-1.5 block text-xs font-medium uppercase tracking-wide text-gray-500";

const CATEGORY_STYLES: Record<ReportCategoryId, string> = {
  loan: "bg-amber-50 text-amber-700",
  treasury: "bg-blue-50 text-blue-700",
  deposit: "bg-emerald-50 text-emerald-700",
  other: "bg-gray-100 text-gray-600",
  finance: "bg-purple-50 text-purple-700",
  "balance-certificate": "bg-rose-50 text-rose-700",
  summary: "bg-indigo-50 text-indigo-700",
  crb: "bg-cyan-50 text-cyan-700",
};

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
    <div className="flex flex-col gap-3 rounded-2xl border border-gray-100 bg-white p-5 shadow-md">
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

export default function AllReportsPage(): React.JSX.Element {
  const [searchId, setSearchId] = useState("");
  const [searchName, setSearchName] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [page, setPage] = useState(1);
  const { accessibleReportIds, isLoading } = useReportAccess();

  const accessibleReports = useMemo(
    () => REPORT_CATALOGUE.filter((report) => accessibleReportIds.includes(report.reportId)),
    [accessibleReportIds],
  );

  const accessibleCategoryCount = useMemo(
    () => new Set(accessibleReports.map((report) => report.category)).size,
    [accessibleReports],
  );

  const summaryCards: SummaryCardData[] = [
    {
      icon: FileStack,
      label: "Total Reports",
      value: accessibleReports.length,
      caption: "Available to you",
      sparkline: [12, 14, 15, 17, 18, accessibleReports.length],
      accent: "#232B2B",
    },
    {
      icon: FolderKanban,
      label: "Report Categories",
      value: accessibleCategoryCount,
      caption: "Across your access",
      sparkline: [3, 3, 4, 4, 5, accessibleCategoryCount],
      accent: "#ED017F",
    },
  ];

  const filteredReports = useMemo(() => {
    const idQuery = searchId.trim().toLowerCase();
    const nameQuery = searchName.trim().toLowerCase();
    return accessibleReports.filter((report) => {
      const matchesCategory = !categoryFilter || report.category === categoryFilter;
      const matchesId = !idQuery || String(report.reportId).toLowerCase().includes(idQuery);
      const matchesName = !nameQuery || report.name.toLowerCase().includes(nameQuery);
      return matchesCategory && matchesId && matchesName;
    });
  }, [accessibleReports, searchId, searchName, categoryFilter]);

  const filterSignature = `${searchId}|${searchName}|${categoryFilter}`;
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

  return (
    <div className="flex flex-col gap-6">
      <Breadcrumb items={[{ label: "Dashboard", href: "/dashboard" }, { label: "All Reports" }]} />

      <div>
        <h1 className="text-xl font-bold text-gray-800">All Reports</h1>
        <p className="text-sm text-gray-400">Browse and generate reports available to you</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {summaryCards.map((card) => (
          <SummaryCard key={card.label} {...card} />
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-md p-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label htmlFor="searchId" className={labelClass}>
              Report ID
            </label>
            <div className="relative">
              <Search className="pointer-events-none absolute inset-y-0 left-3.5 my-auto h-4 w-4 text-gray-400" />
              <input
                id="searchId"
                type="text"
                placeholder="Search by report ID..."
                value={searchId}
                onChange={(event) => setSearchId(event.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-700
                          outline-none focus:outline-none focus:ring-2 focus:ring-[#232B2B] focus:border-transparent
                          placeholder:text-gray-300 transition-all duration-200"
              />
            </div>
          </div>

          <div>
            <label htmlFor="searchName" className={labelClass}>
              Report Name
            </label>
            <div className="relative">
              <Search className="pointer-events-none absolute inset-y-0 left-3.5 my-auto h-4 w-4 text-gray-400" />
              <input
                id="searchName"
                type="text"
                placeholder="Search by report name..."
                value={searchName}
                onChange={(event) => setSearchName(event.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-700
                          outline-none focus:outline-none focus:ring-2 focus:ring-[#232B2B] focus:border-transparent
                          placeholder:text-gray-300 transition-all duration-200"
              />
            </div>
          </div>

          <div>
            <label htmlFor="categoryFilter" className={labelClass}>
              Report Type
            </label>
            <CustomSelect
              id="categoryFilter"
              value={categoryFilter}
              onChange={setCategoryFilter}
              placeholder="All report types"
              options={REPORT_CATEGORIES.map((category) => ({ value: category.id, label: category.label }))}
            />
          </div>
        </div>

        <div className="mt-4 overflow-x-auto rounded-xl border border-gray-100">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-white">
                <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-gray-400">Report ID</th>
                <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-gray-400">Report Name</th>
                <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-gray-400">Category</th>
                <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-gray-400">Last Generated</th>
                <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-sm text-gray-400">
                    Loading reports...
                  </td>
                </tr>
              )}
              {!isLoading && pageReports.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-sm text-gray-400">
                    No reports found.
                  </td>
                </tr>
              )}
              {!isLoading &&
                pageReports.map((report, index) => {
                  const category = getCategoryById(report.category);
                  return (
                    <tr key={report.reportId} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                      <td className="px-4 py-3 text-gray-500">#{report.reportId}</td>
                      <td className="px-4 py-3 font-medium text-gray-800">{report.name}</td>
                      <td className="px-4 py-3">
                        <span className={cn("inline-flex rounded-full px-2.5 py-1 text-xs font-medium", CATEGORY_STYLES[report.category])}>
                          {category?.label ?? report.category}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-500">{getLastGeneratedDate(report.reportId)}</td>
                      <td className="px-4 py-3">
                        <Link
                          href={`/reports/${report.category}/${report.reportId}`}
                          aria-label={`View ${report.name}`}
                          className="inline-flex rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-[#ED017F]"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
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
              className="rounded-full p-1.5 text-gray-400 transition-colors hover:bg-gray-100 disabled:pointer-events-none disabled:opacity-40"
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
                    "h-8 w-8 rounded-full text-sm font-medium transition-colors",
                    pageNumber === clampedPage ? "bg-[#ED017F] text-white" : "text-gray-600 hover:bg-gray-100",
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
              className="rounded-full p-1.5 text-gray-400 transition-colors hover:bg-gray-100 disabled:pointer-events-none disabled:opacity-40"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
