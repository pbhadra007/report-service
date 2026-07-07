"use client";

import { useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { useReportAccess } from "@/hooks/useReportAccess";
import { useCobStatus } from "@/hooks/useCobStatus";
import { REPORT_CATEGORIES, getReportsByCategory } from "@/config/reports.config";
import { formatDateTime } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string;
  tone?: "default" | "success" | "danger";
}

function StatCard({ label, value, tone = "default" }: StatCardProps): React.JSX.Element {
  return (
    <div className="flex flex-col gap-2 rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
      <p className="text-xs font-medium uppercase tracking-wide text-gray-400">{label}</p>
      <p
        className={cn(
          "text-xl font-semibold",
          tone === "success" && "text-green-600",
          tone === "danger" && "text-red-600",
          tone === "default" && "text-gray-800",
        )}
      >
        {value}
      </p>
    </div>
  );
}

export default function DashboardPage(): React.JSX.Element {
  const { user } = useAuth();
  const { accessibleReportIds } = useReportAccess();
  const { cobStatus, isError } = useCobStatus();
  const lastLogin = useMemo(() => formatDateTime(new Date()), []);

  const categoryOverview = REPORT_CATEGORIES.map((category) => ({
    ...category,
    count: getReportsByCategory(category.id).filter((report) => accessibleReportIds.includes(report.reportId)).length,
  })).filter((category) => category.count > 0);

  const cobTone = isError || !cobStatus ? "danger" : cobStatus.status === "FRESH" ? "success" : "default";
  const cobValue = isError || !cobStatus ? "Failed" : cobStatus.status.charAt(0) + cobStatus.status.slice(1).toLowerCase();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4 rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
        <Image src="/images/ipdc-logo.png" alt="IPDC" width={56} height={56} className="h-14 w-14 object-contain" />
        <div>
          <h1 className="text-xl font-semibold text-gray-800">Welcome back, {user?.name ?? "there"}!</h1>
          <p className="text-sm text-gray-500">Here&apos;s what&apos;s happening with your reports today.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Reports Available" value={String(accessibleReportIds.length)} />
        <StatCard label="Last Report Generated" value="Never" />
        <StatCard label="Last Login" value={lastLogin} />
        <StatCard label="COB Status" value={cobValue} tone={cobTone} />
      </div>

      <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
        <h2 className="text-sm font-semibold text-gray-600">Your Recent Reports</h2>
        <p className="mt-3 text-sm text-gray-400">
          No reports generated yet — browse categories from the sidebar.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold text-gray-600">Report Categories</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {categoryOverview.map((category) => (
            <Link
              key={category.id}
              href={`/reports/${category.id}`}
              className="flex flex-col gap-2 rounded-xl border border-gray-100 bg-white p-4 shadow-sm transition hover:border-ipdc-pink hover:shadow-md"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-ipdc-pink-50 text-lg text-ipdc-pink">
                {category.icon}
              </span>
              <p className="text-sm font-semibold text-gray-800">{category.label}</p>
              <p className="text-xs text-gray-400">{category.count} report{category.count === 1 ? "" : "s"}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
