"use client";

import { use, useMemo, useState } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Search } from "lucide-react";
import { getCategoryById, getReportsByCategory } from "@/config/reports.config";
import { useReportAccess } from "@/hooks/useReportAccess";
import { Breadcrumb } from "@/components/common/Breadcrumb";
import { CATEGORY_ICON_STYLES } from "@/lib/categoryIcons";

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

  const iconStyle = CATEGORY_ICON_STYLES[category.id];

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
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-gray-100 bg-white p-12 text-center shadow-md">
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
              className="bg-white rounded-2xl border border-gray-100 shadow-md p-5
                        hover:shadow-md hover:border-[#ED017F]
                        transition-all duration-200 group"
            >
              <div className={`flex h-9 w-9 items-center justify-center rounded-xl mb-3 ${iconStyle.iconBg}`}>
                <iconStyle.icon className={`h-4.5 w-4.5 ${iconStyle.iconColor}`} />
              </div>
              <h3 className="font-semibold text-gray-800 text-sm">{report.name}</h3>
              <p className="text-xs text-gray-400 mt-0.5">Report ID: {report.reportId}</p>
              <Link
                href={`/reports/${category.id}/${report.reportId}`}
                className="mt-4 flex w-full items-center justify-center py-2 rounded-full border border-[#ED017F] bg-white
                          text-[#ED017F] text-xs font-medium hover:bg-[#ED017F] hover:text-white
                          transition-all duration-200"
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
