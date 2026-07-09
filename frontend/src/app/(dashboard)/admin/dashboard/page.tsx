"use client";

import Image from "next/image";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { isToday } from "date-fns";
import { Users, UserCheck, FileText, LogIn, UserPlus, Share2, ClipboardList, Settings } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { fetchAdminUsers } from "@/features/admin/api";
import { fetchAuditLogs } from "@/features/audit/api";
import { REPORT_CATALOGUE } from "@/config/reports.config";

interface StatCardProps {
  icon: typeof Users;
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

interface QuickActionProps {
  href: string;
  icon: typeof Users;
  title: string;
  description: string;
}

function QuickAction({ href, icon: Icon, title, description }: QuickActionProps): React.JSX.Element {
  return (
    <Link
      href={href}
      className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5
                hover:shadow-md hover:border-[#ED017F]
                transition-all duration-200 cursor-pointer group"
    >
      <div className="w-10 h-10 rounded-xl bg-[#FFF0F9] flex items-center
                      justify-center mb-3 group-hover:bg-[#ED017F] transition-colors">
        <Icon className="w-5 h-5 text-[#ED017F] group-hover:text-white" />
      </div>
      <h3 className="font-semibold text-gray-800 text-sm">{title}</h3>
      <p className="text-xs text-gray-400 mt-0.5">{description}</p>
    </Link>
  );
}

export default function AdminDashboardPage(): React.JSX.Element {
  const { user } = useAuth();

  const usersQuery = useQuery({
    queryKey: ["admin", "users"],
    queryFn: fetchAdminUsers,
  });

  const auditQuery = useQuery({
    queryKey: ["audit", "logs", "recent"],
    queryFn: () => fetchAuditLogs({ page: 0, pageSize: 100 }),
  });

  const totalUsers = usersQuery.data?.length;
  const activeUsers = usersQuery.data?.filter((adminUser) => adminUser.active).length;
  const recentLogins = auditQuery.data?.content.filter(
    (entry) => entry.action === "LOGIN" && isToday(new Date(entry.timestamp)),
  ).length;

  const statValue = (value: number | undefined, isError: boolean): string => {
    if (isError) return "—";
    if (value === undefined) return "…";
    return String(value);
  };

  return (
    <div className="grid gap-4">
      <div className="col-span-full bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Welcome back, {user?.name ?? "Admin"}! 👋</h1>
          <p className="text-sm text-gray-400">Here&apos;s your system summary for today.</p>
        </div>
        <Image src="/images/ipdc-logo.png" alt="IPDC" width={150} height={74} className="h-10 w-auto object-contain opacity-20" />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={Users}
          iconBg="bg-blue-50"
          iconColor="text-blue-500"
          label="Total Users"
          value={statValue(totalUsers, usersQuery.isError)}
          sub="registered accounts"
        />
        <StatCard
          icon={UserCheck}
          iconBg="bg-green-50"
          iconColor="text-green-500"
          label="Active Users"
          value={statValue(activeUsers, usersQuery.isError)}
          sub="currently enabled"
        />
        <StatCard
          icon={FileText}
          iconBg="bg-purple-50"
          iconColor="text-purple-500"
          label="Total Reports"
          value={String(REPORT_CATALOGUE.length)}
          sub="in the catalogue"
        />
        <StatCard
          icon={LogIn}
          iconBg="bg-amber-50"
          iconColor="text-amber-600"
          label="Recent Logins Today"
          value={statValue(recentLogins, auditQuery.isError)}
          sub="sign-ins today"
        />
      </div>

      <div className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold text-gray-600">Quick Actions</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <QuickAction
            href="/admin/users/new"
            icon={UserPlus}
            title="Create New User"
            description="Provision a new report service account"
          />
          <QuickAction
            href="/admin/report-access"
            icon={Share2}
            title="Manage Report Access"
            description="Assign or revoke per-user report access"
          />
          <QuickAction
            href="/audit"
            icon={ClipboardList}
            title="View Audit Logs"
            description="Review recent system and user activity"
          />
          <QuickAction
            href="/admin/reports"
            icon={Settings}
            title="Report Management"
            description="Manage the report catalogue and access"
          />
        </div>
      </div>
    </div>
  );
}
