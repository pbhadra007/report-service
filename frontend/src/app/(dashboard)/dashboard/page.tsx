"use client";

import Image from "next/image";
import Link from "next/link";
import { FileText, Clock, LogIn } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useReportAccess } from "@/hooks/useReportAccess";
import { REPORT_CATEGORIES, getReportsByCategory } from "@/config/reports.config";
import { formatDate } from "@/lib/utils";

interface StatCardProps {
  icon: typeof FileText;
  iconBg: string;
  iconColor: string;
  label: string;
  value: string;
  sub: string;
}

function StatCard({ icon: Icon, iconBg, iconColor, label, value, sub }: StatCardProps): React.JSX.Element {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${iconBg}`}>
        <Icon className={`h-4.5 w-4.5 ${iconColor}`} />
      </div>
      <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mt-3">{label}</p>
      <p className="text-2xl font-bold text-gray-800 mt-1">{value}</p>
      <p className="text-xs text-gray-400 mt-1">{sub}</p>
    </div>
  );
}

export default function DashboardPage(): React.JSX.Element {
  const { user } = useAuth();
  const { accessibleReportIds } = useReportAccess();
  const now = new Date();

  const categoryOverview = REPORT_CATEGORIES.map((category) => ({
    ...category,
    count: getReportsByCategory(category.id).filter((report) => accessibleReportIds.includes(report.reportId)).length,
  })).filter((category) => category.count > 0);

  return (
    <div className="grid gap-4">
      <div className="col-span-full bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Welcome back, {user?.name ?? "there"}! 👋</h1>
          <p className="text-sm text-gray-400">Here&apos;s your report summary for today.</p>
        </div>
        <Image src="/images/ipdc-logo.png" alt="IPDC" width={150} height={74} className="h-10 w-auto object-contain opacity-20" />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          icon={FileText}
          iconBg="bg-blue-50"
          iconColor="text-blue-500"
          label="Total Reports Available"
          value={String(accessibleReportIds.length)}
          sub="across all categories"
        />
        <StatCard
          icon={Clock}
          iconBg="bg-purple-50"
          iconColor="text-purple-500"
          label="Last Report Generated"
          value="Never"
          sub="No reports yet"
        />
        <StatCard
          icon={LogIn}
          iconBg="bg-green-50"
          iconColor="text-green-500"
          label="Last Login"
          value={formatDate(now, "dd MMM yyyy")}
          sub={formatDate(now, "HH:mm")}
        />
      </div>

      <div className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold text-gray-600">Report Categories</h2>
        {categoryOverview.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center">
            <p className="text-sm font-medium text-gray-600">No reports assigned yet.</p>
            <p className="text-xs text-gray-400 mt-1">Contact the BT team at btteam@ipdcbd.com</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {categoryOverview.map((category) => (
              <Link
                key={category.id}
                href={`/reports/${category.id}`}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5
                          hover:shadow-md hover:border-[#ED017F]
                          transition-all duration-200 cursor-pointer group"
              >
                <div className="w-10 h-10 rounded-xl bg-[#FFF0F9] flex items-center
                                justify-center mb-3 group-hover:bg-[#ED017F] transition-colors">
                  <span className="text-lg leading-none">{category.icon}</span>
                </div>
                <h3 className="font-semibold text-gray-800 text-sm">{category.label}</h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  {category.count} report{category.count === 1 ? "" : "s"}
                </p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
