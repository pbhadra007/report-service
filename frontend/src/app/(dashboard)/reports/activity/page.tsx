"use client";

import { useMemo, useState } from "react";
import { format } from "date-fns";
import {
  Activity,
  LogIn,
  FileStack,
  AlertTriangle,
  Download,
  Filter,
  Search,
  Eye,
  X,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  Monitor,
  Smartphone,
} from "lucide-react";
import { Breadcrumb } from "@/components/common/Breadcrumb";
import { CustomSelect } from "@/components/common/CustomSelect";
import { BentoDatePicker } from "@/components/common/BentoDatePicker";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

type ActivityType =
  | "Login"
  | "Logout"
  | "Report Viewed"
  | "Report Generated"
  | "Report Exported"
  | "Password Changed"
  | "Profile Updated";
type ActivityStatus = "Success" | "Failed";
type StatusFilterValue = ActivityStatus | "All";

interface ActivityRecord {
  id: number;
  timestamp: Date;
  type: ActivityType;
  module: string;
  description: string;
  ipAddress: string;
  device: string;
  status: ActivityStatus;
}

interface StatCardData {
  icon: typeof Activity;
  label: string;
  value: string;
  caption: string;
  accent: string;
  sparkline: number[];
}

const inputClass =
  "w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-700 outline-none " +
  "focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent placeholder:text-gray-300 " +
  "transition-all duration-200";
const labelClass = "mb-1.5 block text-xs font-medium uppercase tracking-wide text-gray-500";

const ACTIVITY_TYPES: ActivityType[] = [
  "Login",
  "Logout",
  "Report Viewed",
  "Report Generated",
  "Report Exported",
  "Password Changed",
  "Profile Updated",
];

const ACTIVITY_STYLES: Record<ActivityType, string> = {
  Login: "bg-indigo-50 text-indigo-700",
  Logout: "bg-gray-100 text-gray-600",
  "Report Viewed": "bg-blue-50 text-blue-700",
  "Report Generated": "bg-emerald-50 text-emerald-700",
  "Report Exported": "bg-purple-50 text-purple-700",
  "Password Changed": "bg-amber-50 text-amber-700",
  "Profile Updated": "bg-rose-50 text-rose-700",
};

const ACTIVITY_TEMPLATES: { type: ActivityType; module: string; description: string; device: string }[] = [
  { type: "Login", module: "Authentication", description: "Logged in successfully", device: "Desktop - Windows 11 - Chrome 125.0" },
  { type: "Report Viewed", module: "Reports", description: "Viewed Loan Portfolio Summary report", device: "Desktop - Windows 11 - Chrome 125.0" },
  { type: "Report Generated", module: "Reports", description: "Generated Branch Performance report for Q2 2026", device: "Desktop - Windows 10 - Edge 124.0" },
  { type: "Report Exported", module: "Reports", description: "Exported NPL Summary report to Excel", device: "Desktop - macOS Sonoma - Safari 17.4" },
  { type: "Report Viewed", module: "Reports", description: "Viewed Treasury Position report", device: "Mobile - Android 14 - Chrome Mobile 125.0" },
  { type: "Password Changed", module: "Profile", description: "Changed account password", device: "Desktop - Windows 11 - Chrome 125.0" },
  { type: "Profile Updated", module: "Profile", description: "Updated contact phone number", device: "Desktop - Windows 11 - Chrome 125.0" },
  { type: "Logout", module: "Authentication", description: "Logged out of the active session", device: "Desktop - Windows 11 - Chrome 125.0" },
  { type: "Login", module: "Authentication", description: "Failed login attempt - incorrect password", device: "Mobile - iOS 17.5 - Safari Mobile" },
  { type: "Report Exported", module: "Reports", description: "Exported Deposit Mobilization report to PDF", device: "Desktop - Windows 10 - Edge 124.0" },
];

const TIMESTAMP_BASE = new Date(2026, 6, 1, 9, 0);

function buildActivityRecords(): ActivityRecord[] {
  return Array.from({ length: 32 }, (_, i) => {
    const template = ACTIVITY_TEMPLATES[i % ACTIVITY_TEMPLATES.length];
    const status: ActivityStatus = template.description.includes("Failed") ? "Failed" : i % 13 === 5 ? "Failed" : "Success";
    const timestamp = new Date(TIMESTAMP_BASE.getTime() - i * 3 * 60 * 60 * 1000);
    return {
      id: i + 1,
      timestamp,
      type: template.type,
      module: template.module,
      description: template.description,
      ipAddress: `203.${112 + (i % 40)}.${(i * 7) % 255}.${(i * 13) % 255}`,
      device: template.device,
      status,
    };
  });
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

function toCsv(rows: string[][]): string {
  return rows.map((row) => row.map((cell) => `"${cell}"`).join(",")).join("\n");
}

function downloadCsv(filename: string, rows: string[][]): void {
  const blob = new Blob([toCsv(rows)], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
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
    <div className="-mx-5 -mb-5 mt-3 overflow-hidden rounded-b-2xl">
      <svg viewBox={`0 0 ${width} ${height}`} className="block h-12 w-full" preserveAspectRatio="none">
        <path d={areaPath} fill={color} fillOpacity={0.12} stroke="none" />
        <path d={linePath} fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, caption, accent, sparkline }: StatCardData): React.JSX.Element {
  return (
    <div className="flex flex-col gap-3 overflow-hidden rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-2">
        <span className="flex h-9 w-9 items-center justify-center rounded-full" style={{ backgroundColor: `${accent}1A` }}>
          <Icon className="h-4 w-4" style={{ color: accent }} />
        </span>
        <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">{label}</span>
      </div>

      <span className="text-3xl font-bold text-gray-900">{value}</span>
      <p className="text-xs text-gray-400">{caption}</p>
      <SparklineWave points={sparkline} color={accent} />
    </div>
  );
}

function ActivityBadge({ type }: { type: ActivityType }): React.JSX.Element {
  return <span className={cn("inline-flex rounded-full px-2.5 py-1 text-xs font-medium", ACTIVITY_STYLES[type])}>{type}</span>;
}

function StatusBadge({ status }: { status: ActivityStatus }): React.JSX.Element {
  const styles: Record<ActivityStatus, string> = {
    Success: "border-green-200 bg-green-50 text-green-700",
    Failed: "border-red-200 bg-red-50 text-red-700",
  };
  const dots: Record<ActivityStatus, string> = {
    Success: "bg-green-500",
    Failed: "bg-red-500",
  };
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium", styles[status])}>
      <span className={cn("h-1.5 w-1.5 rounded-full", dots[status])} />
      {status}
    </span>
  );
}

function DeviceIcon({ device }: { device: string }): React.JSX.Element {
  const Icon = device.startsWith("Mobile") ? Smartphone : Monitor;
  return <Icon className="h-4 w-4 shrink-0 text-gray-400" />;
}

function ActivityDetailModal({ record, onClose }: { record: ActivityRecord; onClose: () => void }): React.JSX.Element {
  const fields: { label: string; value: React.ReactNode }[] = [
    { label: "Activity ID", value: `#${record.id}` },
    { label: "Timestamp", value: format(record.timestamp, "dd MMM yyyy, hh:mm a") },
    { label: "Activity Type", value: <ActivityBadge type={record.type} /> },
    { label: "Module", value: record.module },
    { label: "Description", value: record.description },
    { label: "IP Address", value: record.ipAddress },
    { label: "Device", value: record.device },
    { label: "Status", value: <StatusBadge status={record.status} /> },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative flex w-full max-w-lg flex-col rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <h2 className="text-sm font-semibold text-gray-800">Activity #{record.id}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex flex-col gap-4 px-6 py-5">
          {fields.map((field) => (
            <div key={field.label}>
              <p className={labelClass}>{field.label}</p>
              <div className="text-sm text-gray-800">{field.value}</div>
            </div>
          ))}
        </div>

        <div className="flex justify-end border-t border-gray-100 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-[#ED017F] bg-[#ED017F] px-5 py-2.5 text-sm font-semibold text-white transition-all duration-200 hover:bg-white hover:text-[#ED017F]"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

const STATUS_PILLS: StatusFilterValue[] = ["All", "Success", "Failed"];

export default function ActivityReportPage(): React.JSX.Element {
  const { user } = useAuth();

  const [activityRecords] = useState<ActivityRecord[]>(() => buildActivityRecords());

  const [showFilters, setShowFilters] = useState(false);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [activityTypeFilter, setActivityTypeFilter] = useState<ActivityType | "">("");
  const [statusFilter, setStatusFilter] = useState<StatusFilterValue>("All");
  const [tableSearch, setTableSearch] = useState("");

  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [page, setPage] = useState(1);
  const [selectedRecord, setSelectedRecord] = useState<ActivityRecord | null>(null);

  const handleResetFilters = (): void => {
    setDateFrom("");
    setDateTo("");
    setActivityTypeFilter("");
    setStatusFilter("All");
  };

  const filteredRecords = useMemo(() => {
    const query = tableSearch.trim().toLowerCase();
    const fromTime = dateFrom ? new Date(`${dateFrom}T00:00:00`).getTime() : null;
    const toTime = dateTo ? new Date(`${dateTo}T23:59:59`).getTime() : null;

    return activityRecords.filter((record) => {
      const matchesSearch =
        !query ||
        record.description.toLowerCase().includes(query) ||
        record.module.toLowerCase().includes(query) ||
        record.ipAddress.includes(query);
      const matchesType = !activityTypeFilter || record.type === activityTypeFilter;
      const matchesStatus = statusFilter === "All" || record.status === statusFilter;
      const matchesFrom = fromTime === null || record.timestamp.getTime() >= fromTime;
      const matchesTo = toTime === null || record.timestamp.getTime() <= toTime;
      return matchesSearch && matchesType && matchesStatus && matchesFrom && matchesTo;
    });
  }, [activityRecords, tableSearch, activityTypeFilter, statusFilter, dateFrom, dateTo]);

  const filterSignature = [tableSearch, activityTypeFilter, statusFilter, dateFrom, dateTo, rowsPerPage].join("|");
  const [prevFilterSignature, setPrevFilterSignature] = useState(filterSignature);
  if (filterSignature !== prevFilterSignature) {
    setPrevFilterSignature(filterSignature);
    setPage(1);
  }

  const totalPages = Math.max(1, Math.ceil(filteredRecords.length / rowsPerPage));
  const clampedPage = Math.min(page, totalPages);
  const startIndex = (clampedPage - 1) * rowsPerPage;
  const pageRecords = filteredRecords.slice(startIndex, startIndex + rowsPerPage);
  const pageNumbers = getPageNumbers(clampedPage, totalPages);

  const stats = useMemo(() => {
    const total = activityRecords.length;
    const logins = activityRecords.filter((record) => record.type === "Login" && record.status === "Success").length;
    const reportActivity = activityRecords.filter((record) => record.module === "Reports").length;
    const failed = activityRecords.filter((record) => record.status === "Failed").length;
    return { total, logins, reportActivity, failed };
  }, [activityRecords]);

  const STAT_CARDS: StatCardData[] = [
    {
      icon: Activity,
      label: "Total Activities",
      value: String(stats.total),
      caption: "Last 30 days",
      accent: "#6366F1",
      sparkline: [8, 9, 7, 10, 11, 10, 12],
    },
    {
      icon: LogIn,
      label: "Successful Logins",
      value: String(stats.logins),
      caption: "This month",
      accent: "#22C55E",
      sparkline: [7, 8, 7, 9, 10, 9, 11],
    },
    {
      icon: FileStack,
      label: "Report Activity",
      value: String(stats.reportActivity),
      caption: "Viewed, generated & exported",
      accent: "#3B82F6",
      sparkline: [5, 6, 6, 7, 7, 8, 8],
    },
    {
      icon: AlertTriangle,
      label: "Failed Attempts",
      value: String(stats.failed),
      caption: "Requires attention",
      accent: "#F97316",
      sparkline: [3, 2, 3, 2, 1, 2, 1],
    },
  ];

  const handleExport = (): void => {
    const header = ["#", "Timestamp", "Activity Type", "Module", "Description", "IP Address", "Device", "Status"];
    const rows = filteredRecords.map((record) => [
      String(record.id),
      format(record.timestamp, "dd MMM yyyy hh:mm a"),
      record.type,
      record.module,
      record.description,
      record.ipAddress,
      record.device,
      record.status,
    ]);
    downloadCsv("activity-report.csv", [header, ...rows]);
  };

  const columnCount = 7;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-col gap-1">
          <Breadcrumb items={[{ label: "Dashboard", href: "/dashboard" }, { label: "Activity Report" }]} />
          <h1 className="text-xl font-bold text-gray-800">Activity Report</h1>
          <p className="text-sm text-gray-400">
            Your login history and account activity{user?.name ? ` — ${user.name}` : ""}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleExport}
            className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-5 py-2.5 text-sm
                      font-semibold text-gray-700 transition-all duration-200 hover:bg-gray-50"
          >
            <Download className="h-4 w-4" />
            Export
          </button>
          <button
            type="button"
            onClick={() => setShowFilters((prev) => !prev)}
            className="inline-flex items-center gap-2 rounded-full border border-[#ED017F] bg-[#ED017F] px-5 py-2.5
                      text-sm font-semibold text-white transition-all duration-200 hover:bg-white hover:text-[#ED017F]"
          >
            <Filter className="h-4 w-4" />
            Filters
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {STAT_CARDS.map((card) => (
          <StatCard key={card.label} {...card} />
        ))}
      </div>

      {showFilters && (
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <label htmlFor="dateFrom" className={labelClass}>
                Date From
              </label>
              <BentoDatePicker id="dateFrom" value={dateFrom} onChange={setDateFrom} />
            </div>
            <div>
              <label htmlFor="dateTo" className={labelClass}>
                Date To
              </label>
              <BentoDatePicker id="dateTo" value={dateTo} onChange={setDateTo} />
            </div>
            <div>
              <label htmlFor="activityTypeFilter" className={labelClass}>
                Activity Type
              </label>
              <CustomSelect
                id="activityTypeFilter"
                value={activityTypeFilter}
                onChange={(value) => setActivityTypeFilter(value as ActivityType | "")}
                placeholder="All activity types"
                options={ACTIVITY_TYPES}
              />
            </div>
            <div>
              <label htmlFor="statusFilter" className={labelClass}>
                Status
              </label>
              <CustomSelect
                id="statusFilter"
                value={statusFilter}
                onChange={(value) => setStatusFilter(value as StatusFilterValue)}
                options={[
                  { value: "All", label: "All statuses" },
                  { value: "Success", label: "Success" },
                  { value: "Failed", label: "Failed" },
                ]}
              />
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <button
              type="button"
              onClick={handleResetFilters}
              className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-5 py-2 text-sm
                        font-medium text-gray-500 transition-colors hover:bg-gray-50 hover:text-gray-700"
            >
              Reset Filters
            </button>
            <button
              type="button"
              onClick={() => setShowFilters(false)}
              className="inline-flex items-center gap-2 rounded-full border border-[#ED017F] bg-[#ED017F] px-5 py-2
                        text-sm font-semibold text-white transition-all duration-200 hover:bg-white hover:text-[#ED017F]"
            >
              Apply Filters
            </button>
          </div>
        </div>
      )}

      <div className="rounded-2xl border border-gray-100 bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 px-5 py-4">
          <div className="flex flex-wrap items-center gap-4">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-500">Activity Log</h2>
            <div className="flex items-center gap-1.5">
              {STATUS_PILLS.map((pill) => (
                <button
                  key={pill}
                  type="button"
                  onClick={() => setStatusFilter(pill)}
                  className={cn(
                    "rounded-full px-3 py-1 text-xs font-medium transition-colors",
                    statusFilter === pill ? "bg-[#ED017F] text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200",
                  )}
                >
                  {pill}
                </button>
              ))}
            </div>
          </div>
          <div className="relative w-64">
            <Search className="pointer-events-none absolute inset-y-0 left-3.5 my-auto h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search activity..."
              value={tableSearch}
              onChange={(event) => setTableSearch(event.target.value)}
              className={cn(inputClass, "pl-10")}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-white">
                <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-gray-400">#</th>
                <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-gray-400">Timestamp</th>
                <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-gray-400">Activity</th>
                <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-gray-400">Description</th>
                <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-gray-400">IP Address</th>
                <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-gray-400">Device</th>
                <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-gray-400">Status</th>
                <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody>
              {pageRecords.length === 0 && (
                <tr>
                  <td colSpan={columnCount + 1} className="px-4 py-12 text-center">
                    <div className="flex flex-col items-center gap-2 text-gray-400">
                      <Search className="h-6 w-6" />
                      <p className="text-sm">No activity records found</p>
                    </div>
                  </td>
                </tr>
              )}
              {pageRecords.map((record, index) => (
                <tr key={record.id} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                  <td className="px-4 py-3 text-gray-500">{startIndex + index + 1}</td>
                  <td className="px-4 py-3 text-gray-600">
                    <p>{format(record.timestamp, "dd MMM yyyy")}</p>
                    <p className="text-xs text-gray-400">{format(record.timestamp, "hh:mm a")}</p>
                  </td>
                  <td className="px-4 py-3">
                    <ActivityBadge type={record.type} />
                  </td>
                  <td className="max-w-[260px] px-4 py-3">
                    <p className="truncate text-gray-600" title={record.description}>
                      {record.description}
                    </p>
                    <p className="text-xs text-gray-400">{record.module}</p>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{record.ipAddress}</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-1.5 text-gray-600">
                      <DeviceIcon device={record.device} />
                      <span className="truncate">{record.device}</span>
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={record.status} />
                  </td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => setSelectedRecord(record)}
                      aria-label="View activity details"
                      className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 px-5 py-4">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            Show
            <div className="relative">
              <select
                value={rowsPerPage}
                onChange={(event) => setRowsPerPage(Number(event.target.value))}
                className="appearance-none rounded-lg border border-gray-200 bg-white py-1.5 pl-3 pr-8 text-sm text-gray-700 outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
            </div>
            entries
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled={clampedPage === 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              aria-label="Previous page"
              className="rounded-full p-1.5 text-gray-400 transition-colors hover:bg-gray-100 disabled:pointer-events-none disabled:opacity-40"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            {pageNumbers.map((pageNumber, index) =>
              pageNumber === "..." ? (
                <span key={`ellipsis-${index}`} className="px-1.5 text-sm text-gray-400">
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
              aria-label="Next page"
              className="rounded-full p-1.5 text-gray-400 transition-colors hover:bg-gray-100 disabled:pointer-events-none disabled:opacity-40"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {selectedRecord && <ActivityDetailModal record={selectedRecord} onClose={() => setSelectedRecord(null)} />}
    </div>
  );
}
