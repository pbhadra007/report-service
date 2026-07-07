"use client";

import { use, useMemo, useState } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getCategoryById, getReportsByCategory } from "@/config/reports.config";
import { useReportAccess } from "@/hooks/useReportAccess";
import { Breadcrumb } from "@/components/common/Breadcrumb";

export interface ReportCategoryPageProps {
  params: Promise<{ category: string }>;
}

export default function ReportCategoryPage({ params }: ReportCategoryPageProps): React.JSX.Element {
  const { category: categorySlug } = use(params);
  const category = getCategoryById(categorySlug);
  const [search, setSearch] = useState("");
  const { accessibleReportIds, isLoading } = useReportAccess();

  if (!category) {
    notFound();
  }

  const accessibleReports = useMemo(
    () =>
      getReportsByCategory(category.id).filter(
        (report) =>
          accessibleReportIds.includes(report.reportId) &&
          report.name.toLowerCase().includes(search.toLowerCase()),
      ),
    [category.id, accessibleReportIds, search],
  );

  return (
    <div className="flex flex-col gap-6">
      <Breadcrumb items={[{ label: "Dashboard", href: "/dashboard" }, { label: `${category.label} Reports` }]} />

      <h1 className="flex items-center gap-2 text-xl font-semibold text-gray-800">
        <span className="text-2xl">{category.icon}</span>
        {category.label} Reports
      </h1>

      <div className="relative max-w-md">
        <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-4 w-4"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </span>
        <input
          type="text"
          placeholder="Search reports..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-10 pr-3 text-sm outline-none focus:border-ipdc-pink focus:ring-2 focus:ring-ipdc-pink"
        />
      </div>

      {!isLoading && (
        <p className="text-sm text-gray-500">
          Showing {accessibleReports.length} report{accessibleReports.length === 1 ? "" : "s"}
        </p>
      )}

      {isLoading && <p className="text-sm text-gray-400">Loading reports...</p>}

      {!isLoading && accessibleReports.length === 0 && (
        <p className="text-sm text-gray-400">No reports available in this category.</p>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {accessibleReports.map((report) => (
          <div
            key={report.reportId}
            className="flex flex-col gap-3 rounded-xl border border-gray-100 bg-white p-4 shadow-sm transition hover:border-ipdc-pink hover:shadow-md"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-ipdc-pink-50 text-lg text-ipdc-pink">
              {category.icon}
            </span>
            <div>
              <p className="font-semibold text-gray-800">{report.name}</p>
              <p className="text-xs text-gray-400">Report ID: {report.reportId}</p>
            </div>
            <div className="border-t border-gray-100 pt-3">
              <Link
                href={`/reports/${category.id}/${report.reportId}`}
                className="flex w-full items-center justify-center rounded-lg bg-ipdc-pink py-2 text-sm font-medium text-white hover:bg-ipdc-pink-dark"
              >
                Generate Report →
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
