"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  FileText,
  Users2,
  UserCheck,
  ArrowUp,
  ArrowDown,
  ArrowRight,
  UserPlus,
  FileStack,
  KeyRound,
  ShieldCheck,
  LogIn,
  ClipboardList,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface StatCardProps {
  icon: typeof Users2;
  iconBg: string;
  iconColor: string;
  label: string;
  value: number;
  sub: string;
  trend: "up" | "down";
  accentColor: string;
  sparkline: number[];
}

function SparklineWave({ points, color }: { points: number[]; color: string }): React.JSX.Element {
  const width = 200;
  const height = 48;
  const max = Math.max(...points);
  const min = Math.min(...points);
  const range = max - min || 1;
  const step = width / (points.length - 1 || 1);
  const coords = points.map((point, index) => ({
    x: index * step,
    y: height - ((point - min) / range) * (height - 6) - 3,
  }));
  const linePath = coords.map((point, index) => `${index === 0 ? "M" : "L"}${point.x},${point.y}`).join(" ");
  const areaPath = `${linePath} L${width},${height} L0,${height} Z`;
  return (
    <div className="-mx-6 -mb-6 mt-4 overflow-hidden rounded-b-2xl">
      <svg viewBox={`0 0 ${width} ${height}`} className="block h-12 w-full" preserveAspectRatio="none">
        <path d={areaPath} fill={color} fillOpacity={0.12} stroke="none" />
        <path d={linePath} fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}

export function StatCard({ icon: Icon, iconBg, iconColor, label, value, sub, trend, accentColor, sparkline }: StatCardProps): React.JSX.Element {
  const trendPct = Math.round(Math.abs(((sparkline[sparkline.length - 1] - sparkline[0]) / sparkline[0]) * 100));
  const TrendIcon = trend === "up" ? ArrowUp : ArrowDown;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-md p-6 overflow-hidden">
      <div className="flex items-start justify-between">
        <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${iconBg}`}>
          <Icon className={`h-6 w-6 ${iconColor}`} />
        </div>
        <span
          className={`inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-semibold ${
            trend === "up" ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"
          }`}
        >
          <TrendIcon className="h-3 w-3" />
          {trendPct}%
        </span>
      </div>

      <p className="text-4xl font-bold text-gray-800 mt-4">{value}</p>
      <p className="font-semibold text-gray-700 mt-1">{label}</p>
      <p className="text-xs text-gray-400">{sub}</p>

      <SparklineWave points={sparkline} color={accentColor} />
    </div>
  );
}

interface QuickAccessStat {
  value: string;
  label: string;
}

interface QuickAccessCardProps {
  icon: typeof UserPlus;
  iconBg: string;
  iconColor: string;
  accentColor: string;
  title: string;
  description: string;
  stats: [QuickAccessStat, QuickAccessStat];
  actionLabel: string;
  onClick: () => void;
}

export function QuickAccessCard({
  icon: Icon,
  iconBg,
  iconColor,
  accentColor,
  title,
  description,
  stats,
  actionLabel,
  onClick,
}: QuickAccessCardProps): React.JSX.Element {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-md overflow-hidden group">
      <div className="h-1 w-full" style={{ backgroundColor: accentColor }} />
      <div className="p-6">
        <div
          className={`flex h-12 w-12 items-center justify-center rounded-2xl ${iconBg} transition-transform duration-200 group-hover:scale-110`}
        >
          <Icon className={`h-6 w-6 ${iconColor}`} />
        </div>

        <h3 className="text-base font-bold text-gray-900 mt-4">{title}</h3>
        <p className="text-sm text-gray-400 leading-relaxed mt-1">{description}</p>

        <div className="flex items-center gap-6 mt-4">
          {stats.map((stat) => (
            <div key={stat.label}>
              <p className="font-bold text-gray-900">{stat.value}</p>
              <p className="text-xs text-gray-400">{stat.label}</p>
            </div>
          ))}
        </div>

        <div className="border-b border-gray-100 mt-4" />

        <button
          type="button"
          onClick={onClick}
          className="mt-4 w-full inline-flex items-center justify-center gap-2 rounded-full
                    bg-white px-4 py-2.5 text-sm font-semibold text-[#ed017f] border border-[#ed017f]
                    transition-colors duration-200
                    hover:bg-[#ed017f] hover:text-white"
        >
          {actionLabel}
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

export default function AdminDashboardPage(): React.JSX.Element {
  const { user } = useAuth();
  const router = useRouter();

  return (
    <div className="grid gap-4">
      <div className="col-span-full bg-white rounded-2xl border border-gray-100 shadow-md p-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Welcome back, {user?.name ?? "Admin"}! 👋</h1>
          <p className="text-sm text-gray-400">Here&apos;s your system summary for today.</p>
        </div>
        <Image src="/images/ipdc-logo.png" alt="IPDC" width={150} height={74} className="h-10 w-auto object-contain opacity-20" />
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <StatCard
          icon={FileText}
          iconBg="bg-[#FFE6F4]"
          iconColor="text-[#ED017F]"
          label="Total Reports"
          value={105}
          sub="+3 this month"
          trend="up"
          accentColor="#ED017F"
          sparkline={[88, 90, 93, 95, 99, 102, 105]}
        />
        <StatCard
          icon={Users2}
          iconBg="bg-indigo-100"
          iconColor="text-indigo-600"
          label="Total Users"
          value={126}
          sub="+12 this month"
          trend="up"
          accentColor="#6366F1"
          sparkline={[98, 104, 108, 112, 116, 120, 126]}
        />
        <StatCard
          icon={UserCheck}
          iconBg="bg-green-100"
          iconColor="text-green-600"
          label="Active Users"
          value={98}
          sub="77.8% of total"
          trend="up"
          accentColor="#22C55E"
          sparkline={[72, 78, 82, 86, 90, 94, 98]}
        />
      </div>

      <div className="flex flex-col gap-3">
        <div>
          <h2 className="text-base font-bold text-gray-900">Quick Access</h2>
          <p className="text-sm text-gray-400">Common administrative tasks</p>
        </div>
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
          <QuickAccessCard
            icon={UserPlus}
            iconBg="bg-indigo-100"
            iconColor="text-indigo-600"
            accentColor="#6366f1"
            title="Create New User"
            description="Provision a new report service account"
            stats={[
              { value: "126", label: "Total" },
              { value: "12", label: "Added" },
            ]}
            actionLabel="Create User"
            onClick={() => router.push("/admin/users/new")}
          />
          <QuickAccessCard
            icon={FileStack}
            iconBg="bg-[#FFE6F4]"
            iconColor="text-[#ED017F]"
            accentColor="#ED017F"
            title="Access Reports"
            description="Browse and generate reports from the catalogue"
            stats={[
              { value: "105", label: "Total" },
              { value: "8", label: "Categories" },
            ]}
            actionLabel="View Reports"
            onClick={() => router.push("/admin/reports")}
          />
          <QuickAccessCard
            icon={KeyRound}
            iconBg="bg-green-100"
            iconColor="text-green-600"
            accentColor="#22c55e"
            title="Manage Report Access"
            description="Assign or revoke per-user report access"
            stats={[
              { value: "98", label: "Users" },
              { value: "1,890", label: "Assigned" },
            ]}
            actionLabel="Manage Access"
            onClick={() => router.push("/admin/report-access")}
          />
          <QuickAccessCard
            icon={ShieldCheck}
            iconBg="bg-purple-100"
            iconColor="text-purple-600"
            accentColor="#a855f7"
            title="Permission Management"
            description="Define roles and their assigned permissions"
            stats={[
              { value: "156", label: "Permissions" },
              { value: "24", label: "Roles" },
            ]}
            actionLabel="Manage Permissions"
            onClick={() => router.push("/admin/permissions")}
          />
          <QuickAccessCard
            icon={LogIn}
            iconBg="bg-blue-100"
            iconColor="text-blue-600"
            accentColor="#3b82f6"
            title="Login History"
            description="Track sign-ins across the system"
            stats={[
              { value: "142", label: "Today" },
              { value: "3,204", label: "This Month" },
            ]}
            actionLabel="View History"
            onClick={() => router.push("/admin/login-history")}
          />
          <QuickAccessCard
            icon={ClipboardList}
            iconBg="bg-amber-100"
            iconColor="text-amber-600"
            accentColor="#f59e0b"
            title="Audit Logs"
            description="Review recent system and user activity"
            stats={[
              { value: "89", label: "Today" },
              { value: "12,450", label: "Total" },
            ]}
            actionLabel="View Logs"
            onClick={() => router.push("/admin/audit")}
          />
        </div>
      </div>
    </div>
  );
}
