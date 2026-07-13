"use client";

import { useMemo, useState } from "react";
import { format } from "date-fns";
import {
  ClipboardList,
  CheckSquare,
  AlertTriangle,
  Users2,
  Download,
  Filter,
  Search,
  Eye,
  X,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";
import { CustomSelect } from "@/components/common/CustomSelect";
import { BentoDatePicker } from "@/components/common/BentoDatePicker";
import { cn } from "@/lib/utils";

type AuditActionType =
  | "Create"
  | "Update"
  | "Delete"
  | "Login"
  | "Logout"
  | "Export"
  | "Approve"
  | "Reject"
  | "Permission Change";
type AuditStatus = "Success" | "Failed" | "Warning";
type StatusFilterValue = AuditStatus | "All";

interface AuditLogRecord {
  id: number;
  timestamp: Date;
  userName: string;
  userId: string;
  action: AuditActionType;
  module: string;
  description: string;
  ipAddress: string;
  status: AuditStatus;
  userAgent: string;
}

interface StatCardData {
  icon: typeof ClipboardList;
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

const STAT_CARDS: StatCardData[] = [
  { icon: ClipboardList, label: "Total Logs", value: "12,458", caption: "This Month", accent: "#6366F1", sparkline: [8, 9, 7, 10, 11, 10, 12] },
  {
    icon: CheckSquare,
    label: "Successful Actions",
    value: "11,245",
    caption: "90.3% of total",
    accent: "#22C55E",
    sparkline: [7, 8, 7, 9, 10, 9, 11],
  },
  {
    icon: AlertTriangle,
    label: "Failed Actions",
    value: "1,213",
    caption: "9.7% of total",
    accent: "#F97316",
    sparkline: [3, 2, 3, 2, 1, 2, 1],
  },
  { icon: Users2, label: "Active Users", value: "342", caption: "Performed actions", accent: "#3B82F6", sparkline: [5, 6, 6, 7, 7, 8, 8] },
];

const ACTION_TYPES: AuditActionType[] = [
  "Create",
  "Update",
  "Delete",
  "Login",
  "Logout",
  "Export",
  "Approve",
  "Reject",
  "Permission Change",
];

const ACTION_STYLES: Record<AuditActionType, string> = {
  Create: "bg-green-50 text-green-700",
  Update: "bg-blue-50 text-blue-700",
  Delete: "bg-red-50 text-red-700",
  Login: "bg-indigo-50 text-indigo-700",
  Logout: "bg-gray-100 text-gray-600",
  Export: "bg-purple-50 text-purple-700",
  Approve: "bg-emerald-50 text-emerald-700",
  Reject: "bg-rose-50 text-rose-700",
  "Permission Change": "bg-amber-50 text-amber-700",
};

const PEOPLE = [
  { name: "Ayesha Siddiqua", userId: "IPDC-1042" },
  { name: "Tanvir Ahmed", userId: "IPDC-1108" },
  { name: "Rashed Khan", userId: "IPDC-1173" },
  { name: "Nusrat Jahan", userId: "IPDC-1029" },
  { name: "Kamrul Hasan", userId: "IPDC-1256" },
  { name: "Farhana Akter", userId: "IPDC-1301" },
  { name: "Shakil Ahmed", userId: "IPDC-1345" },
  { name: "Mahmudul Hasan", userId: "IPDC-0001" },
  { name: "Ismat Jahan", userId: "IPDC-1412" },
  { name: "Rafiqul Islam", userId: "IPDC-1458" },
];

const LOG_TEMPLATES: { action: AuditActionType; module: string; description: string; userAgent: string }[] = [
  {
    action: "Login",
    module: "Authentication",
    description: "User logged in successfully from a new device",
    userAgent: "Chrome 125.0 (Windows 11)",
  },
  {
    action: "Logout",
    module: "Authentication",
    description: "User logged out of the active session",
    userAgent: "Safari 17.4 (macOS Sonoma)",
  },
  {
    action: "Create",
    module: "User Management",
    description: "Created a new user account for the Branch Operations team",
    userAgent: "Edge 124.0 (Windows 10)",
  },
  {
    action: "Update",
    module: "Role Management",
    description: "Updated permission scope for the Branch Manager role",
    userAgent: "Chrome 125.0 (Windows 11)",
  },
  {
    action: "Delete",
    module: "Reports",
    description: "Deleted report template #245 - Loan Portfolio Summary",
    userAgent: "Chrome Mobile 125.0 (Android 14)",
  },
  {
    action: "Export",
    module: "Reports",
    description: "Exported Loan Portfolio Report to Excel format",
    userAgent: "Safari 17.4 (macOS Sonoma)",
  },
  {
    action: "Approve",
    module: "Loan",
    description: "Approved a pending loan disbursement request",
    userAgent: "Chrome 125.0 (Windows 11)",
  },
  {
    action: "Reject",
    module: "Branch",
    description: "Rejected an access request from an unrecognized IP address",
    userAgent: "Firefox 126.0 (Ubuntu 24.04)",
  },
  {
    action: "Permission Change",
    module: "Role Management",
    description: "Changed dashboard access scope for the Compliance Officer role",
    userAgent: "Edge 124.0 (Windows 10)",
  },
];

const TIMESTAMP_BASE = new Date(2026, 5, 12, 8, 0);

const AUDIT_LOGS: AuditLogRecord[] = Array.from({ length: 20 }, (_, i) => {
  const person = PEOPLE[i % PEOPLE.length];
  const template = LOG_TEMPLATES[i % LOG_TEMPLATES.length];
  const status: AuditStatus = i % 10 === 3 ? "Failed" : i % 10 === 8 ? "Warning" : "Success";
  const timestamp = new Date(TIMESTAMP_BASE.getTime() + i * 53 * 60 * 1000);
  return {
    id: i + 1,
    timestamp,
    userName: person.name,
    userId: person.userId,
    action: template.action,
    module: template.module,
    description: template.description,
    ipAddress: `203.${112 + (i % 40)}.${(i * 7) % 255}.${(i * 13) % 255}`,
    status,
    userAgent: template.userAgent,
  };
});

const AVATAR_COLORS = ["#ED017F", "#232B2B", "#2563EB", "#059669", "#D97706", "#7C3AED"];

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  const initials = parts.length > 1 ? `${parts[0][0]}${parts[parts.length - 1][0]}` : parts[0]?.slice(0, 2);
  return (initials ?? "").toUpperCase();
}

function getAvatarColor(index: number): string {
  return AVATAR_COLORS[index % AVATAR_COLORS.length];
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

function ActionBadge({ action }: { action: AuditActionType }): React.JSX.Element {
  return <span className={cn("inline-flex rounded-full px-2.5 py-1 text-xs font-medium", ACTION_STYLES[action])}>{action}</span>;
}

function StatusBadge({ status }: { status: AuditStatus }): React.JSX.Element {
  const styles: Record<AuditStatus, string> = {
    Success: "border-green-200 bg-green-50 text-green-700",
    Failed: "border-red-200 bg-red-50 text-red-700",
    Warning: "border-orange-200 bg-orange-50 text-orange-600",
  };
  const dots: Record<AuditStatus, string> = {
    Success: "bg-green-500",
    Failed: "bg-red-500",
    Warning: "bg-orange-500",
  };
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium", styles[status])}>
      <span className={cn("h-1.5 w-1.5 rounded-full", dots[status])} />
      {status}
    </span>
  );
}

function LogDetailModal({ record, onClose }: { record: AuditLogRecord; onClose: () => void }): React.JSX.Element {
  const fields: { label: string; value: React.ReactNode }[] = [
    { label: "Log ID", value: `#${record.id}` },
    { label: "Timestamp", value: format(record.timestamp, "dd MMM yyyy, hh:mm a") },
    { label: "User", value: `${record.userName} (${record.userId})` },
    { label: "Action", value: <ActionBadge action={record.action} /> },
    { label: "Module", value: record.module },
    { label: "Description", value: record.description },
    { label: "IP Address", value: record.ipAddress },
    { label: "Status", value: <StatusBadge status={record.status} /> },
    { label: "User Agent", value: record.userAgent },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative flex w-full max-w-lg flex-col rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <h2 className="text-sm font-semibold text-gray-800">Audit Log #{record.id}</h2>
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

const STATUS_PILLS: StatusFilterValue[] = ["All", "Success", "Failed", "Warning"];

export default function AdminAuditLogPage(): React.JSX.Element {
  const [showFilters, setShowFilters] = useState(false);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [userSearch, setUserSearch] = useState("");
  const [actionTypeFilter, setActionTypeFilter] = useState<AuditActionType | "">("");
  const [statusFilter, setStatusFilter] = useState<StatusFilterValue>("All");
  const [tableSearch, setTableSearch] = useState("");

  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [page, setPage] = useState(1);
  const [selectedRecord, setSelectedRecord] = useState<AuditLogRecord | null>(null);

  const handleResetFilters = (): void => {
    setDateFrom("");
    setDateTo("");
    setUserSearch("");
    setActionTypeFilter("");
    setStatusFilter("All");
  };

  const filteredLogs = useMemo(() => {
    const query = tableSearch.trim().toLowerCase();
    const userQuery = userSearch.trim().toLowerCase();
    const fromTime = dateFrom ? new Date(`${dateFrom}T00:00:00`).getTime() : null;
    const toTime = dateTo ? new Date(`${dateTo}T23:59:59`).getTime() : null;

    return AUDIT_LOGS.filter((log) => {
      const matchesSearch =
        !query ||
        log.userName.toLowerCase().includes(query) ||
        log.userId.toLowerCase().includes(query) ||
        log.description.toLowerCase().includes(query) ||
        log.ipAddress.includes(query);
      const matchesUser = !userQuery || log.userName.toLowerCase().includes(userQuery);
      const matchesAction = !actionTypeFilter || log.action === actionTypeFilter;
      const matchesStatus = statusFilter === "All" || log.status === statusFilter;
      const matchesFrom = fromTime === null || log.timestamp.getTime() >= fromTime;
      const matchesTo = toTime === null || log.timestamp.getTime() <= toTime;
      return matchesSearch && matchesUser && matchesAction && matchesStatus && matchesFrom && matchesTo;
    });
  }, [tableSearch, userSearch, actionTypeFilter, statusFilter, dateFrom, dateTo]);

  const filterSignature = [tableSearch, userSearch, actionTypeFilter, statusFilter, dateFrom, dateTo, rowsPerPage].join("|");
  const [prevFilterSignature, setPrevFilterSignature] = useState(filterSignature);
  if (filterSignature !== prevFilterSignature) {
    setPrevFilterSignature(filterSignature);
    setPage(1);
  }

  const totalPages = Math.max(1, Math.ceil(filteredLogs.length / rowsPerPage));
  const clampedPage = Math.min(page, totalPages);
  const startIndex = (clampedPage - 1) * rowsPerPage;
  const pageLogs = filteredLogs.slice(startIndex, startIndex + rowsPerPage);
  const pageNumbers = getPageNumbers(clampedPage, totalPages);

  const handleExport = (): void => {
    const header = ["#", "Timestamp", "User", "User ID", "Action", "Module", "Description", "IP Address", "Status", "User Agent"];
    const rows = filteredLogs.map((log) => [
      String(log.id),
      format(log.timestamp, "dd MMM yyyy hh:mm a"),
      log.userName,
      log.userId,
      log.action,
      log.module,
      log.description,
      log.ipAddress,
      log.status,
      log.userAgent,
    ]);
    downloadCsv("audit-log.csv", [header, ...rows]);
  };

  const columnCount = 9;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm">
          <span className="text-gray-400">System Settings</span>
          <ChevronRight className="h-3.5 w-3.5 text-gray-300" />
          <span className="font-semibold text-gray-800">Audit Log</span>
        </nav>

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
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
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
              <label htmlFor="userSearch" className={labelClass}>
                User
              </label>
              <div className="relative">
                <Search className="pointer-events-none absolute inset-y-0 left-3.5 my-auto h-4 w-4 text-gray-400" />
                <input
                  id="userSearch"
                  type="text"
                  placeholder="Search by user name..."
                  value={userSearch}
                  onChange={(event) => setUserSearch(event.target.value)}
                  className={cn(inputClass, "pl-10")}
                />
              </div>
            </div>
            <div>
              <label htmlFor="actionTypeFilter" className={labelClass}>
                Action Type
              </label>
              <CustomSelect
                id="actionTypeFilter"
                value={actionTypeFilter}
                onChange={(value) => setActionTypeFilter(value as AuditActionType | "")}
                placeholder="All action types"
                options={ACTION_TYPES}
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
                  { value: "Warning", label: "Warning" },
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
            <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-500">Audit Log</h2>
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
              placeholder="Search logs..."
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
                <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-gray-400">User</th>
                <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-gray-400">Action</th>
                <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-gray-400">Module</th>
                <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-gray-400">Description</th>
                <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-gray-400">IP Address</th>
                <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-gray-400">Status</th>
                <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody>
              {pageLogs.length === 0 && (
                <tr>
                  <td colSpan={columnCount} className="px-4 py-12 text-center">
                    <div className="flex flex-col items-center gap-2 text-gray-400">
                      <Search className="h-6 w-6" />
                      <p className="text-sm">No audit logs found</p>
                    </div>
                  </td>
                </tr>
              )}
              {pageLogs.map((log, index) => (
                <tr key={log.id} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                  <td className="px-4 py-3 text-gray-500">{startIndex + index + 1}</td>
                  <td className="px-4 py-3 text-gray-600">
                    <p>{format(log.timestamp, "dd MMM yyyy")}</p>
                    <p className="text-xs text-gray-400">{format(log.timestamp, "hh:mm a")}</p>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white"
                        style={{ backgroundColor: getAvatarColor(startIndex + index) }}
                      >
                        {getInitials(log.userName)}
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">{log.userName}</p>
                        <p className="text-xs text-gray-400">{log.userId}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <ActionBadge action={log.action} />
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600">{log.module}</span>
                  </td>
                  <td className="max-w-[220px] px-4 py-3">
                    <p className="truncate text-gray-600" title={log.description}>
                      {log.description}
                    </p>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{log.ipAddress}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={log.status} />
                  </td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => setSelectedRecord(log)}
                      aria-label="View log details"
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

      {selectedRecord && <LogDetailModal record={selectedRecord} onClose={() => setSelectedRecord(null)} />}
    </div>
  );
}
