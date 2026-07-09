"use client";

import { use, useMemo, useState } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Search } from "lucide-react";
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
    () => getReportsByCategory(category.id).filter((report) => accessibleReportIds.includes(report.reportId)),
    [category.id, accessibleReportIds],
  );

  const filteredReports = useMemo(
    () => accessibleReports.filter((report) => report.name.toLowerCase().includes(search.toLowerCase())),
    [accessibleReports, search],
  );

  return (
    <div className="flex flex-col gap-6">
      <Breadcrumb items={[{ label: "Dashboard", href: "/dashboard" }, { label: `${category.label} Reports` }]} />

      <div>
        <h1 className="text-xl font-bold text-gray-800">{category.label} Reports</h1>
        <p className="text-sm text-gray-400 mt-1">
          {isLoading
            ? "Loading…"
            : `${accessibleReports.length} report${accessibleReports.length === 1 ? "" : "s"} available`}
        </p>
      </div>

      <div className="relative w-full">
        <Search className="pointer-events-none absolute inset-y-0 left-4 my-auto h-4 w-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search reports..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-11 pr-4 text-sm text-gray-700
                    outline-none focus:outline-none focus:ring-2 focus:ring-[#232B2B] focus:border-transparent
                    placeholder:text-gray-300 transition-all duration-200"
        />
      </div>

      {isLoading && <p className="text-sm text-gray-400">Loading reports...</p>}

      {!isLoading && filteredReports.length === 0 && (
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-gray-100 bg-white p-12 text-center shadow-sm">
          <Search className="h-8 w-8 text-gray-300" />
          <p className="text-sm text-gray-400">
            {search ? `No reports found for "${search}"` : "No reports available in this category."}
          </p>
        </div>
      )}

      {!isLoading && filteredReports.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredReports.map((report) => (
            <div
              key={report.reportId}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5
                        hover:shadow-md hover:border-[#ED017F]
                        transition-all duration-200 group"
            >
              <div
                className="w-10 h-10 rounded-xl bg-[#FFF0F9] flex items-center
                          justify-center mb-3 group-hover:bg-[#ED017F] transition-colors"
              >
                <span className="text-lg leading-none">{category.icon}</span>
              </div>
              <h3 className="font-semibold text-gray-800 text-sm">{report.name}</h3>
              <p className="text-xs text-gray-400 mt-0.5">Report ID: {report.reportId}</p>
              <Link
                href={`/reports/${category.id}/${report.reportId}`}
                className="mt-4 flex w-full items-center justify-center py-2 rounded-xl bg-[#232B2B] text-white
                          text-xs font-medium hover:bg-white hover:text-[#232B2B]
                          hover:border hover:border-[#232B2B] transition-all duration-200"
              >
                Generate Report →
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
