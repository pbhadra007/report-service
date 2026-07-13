"use client";

import { useMemo, useState } from "react";
import { format, differenceInMinutes } from "date-fns";
import {
  LogIn,
  ShieldCheck,
  ShieldAlert,
  Users2,
  Download,
  Filter,
  Monitor,
  Smartphone,
  Tablet,
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

type DeviceType = "Desktop" | "Mobile" | "Tablet";
type LoginStatus = "Success" | "Failed" | "Locked";
type SortField = "user" | "employeeId" | "loginTime" | "logoutTime" | "duration" | "ipAddress" | "device" | "browser" | "status";
type SortDir = "asc" | "desc";

interface LoginRecord {
  id: number;
  name: string;
  email: string;
  employeeId: string;
  loginTime: Date;
  logoutTime: Date | null;
  ipAddress: string;
  deviceType: DeviceType;
  deviceOs: string;
  browser: string;
  status: LoginStatus;
}

interface StatCardData {
  icon: typeof LogIn;
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
  { icon: LogIn, label: "Total Logins", value: "1,256", caption: "This Month", accent: "#6366F1", sparkline: [8, 9, 7, 10, 11, 10, 12] },
  {
    icon: ShieldCheck,
    label: "Successful Logins",
    value: "1,144",
    caption: "90.9% of total logins",
    accent: "#22C55E",
    sparkline: [7, 8, 7, 9, 10, 9, 11],
  },
  {
    icon: ShieldAlert,
    label: "Failed Logins",
    value: "112",
    caption: "8.9% of total logins",
    accent: "#F97316",
    sparkline: [3, 2, 3, 2, 1, 2, 1],
  },
  { icon: Users2, label: "Unique Users", value: "342", caption: "Active this month", accent: "#3B82F6", sparkline: [5, 6, 6, 7, 7, 8, 8] },
];

const PEOPLE = [
  { name: "Ayesha Siddiqua", employeeId: "IPDC-1042" },
  { name: "Tanvir Ahmed", employeeId: "IPDC-1108" },
  { name: "Rashed Khan", employeeId: "IPDC-1173" },
  { name: "Nusrat Jahan", employeeId: "IPDC-1029" },
  { name: "Kamrul Hasan", employeeId: "IPDC-1256" },
  { name: "Farhana Akter", employeeId: "IPDC-1301" },
  { name: "Shakil Ahmed", employeeId: "IPDC-1345" },
  { name: "Mahmudul Hasan", employeeId: "IPDC-0001" },
  { name: "Ismat Jahan", employeeId: "IPDC-1412" },
  { name: "Rafiqul Islam", employeeId: "IPDC-1458" },
];

const DEVICE_POOL: { type: DeviceType; os: string; browser: string }[] = [
  { type: "Desktop", os: "Windows 11", browser: "Chrome 125.0" },
  { type: "Desktop", os: "macOS Sonoma", browser: "Safari 17.4" },
  { type: "Mobile", os: "Android 14", browser: "Chrome Mobile 125.0" },
  { type: "Mobile", os: "iOS 17.5", browser: "Safari Mobile" },
  { type: "Tablet", os: "iPadOS 17.5", browser: "Safari Mobile" },
  { type: "Desktop", os: "Windows 10", browser: "Edge 124.0" },
];

const LOGIN_TIME_BASE = new Date(2026, 5, 12, 8, 0);

function toEmail(name: string): string {
  return `${name.toLowerCase().replace(/\s+/g, ".")}@ipdc.com.bd`;
}

const LOGIN_RECORDS: LoginRecord[] = Array.from({ length: 20 }, (_, i) => {
  const person = PEOPLE[i % PEOPLE.length];
  const device = DEVICE_POOL[i % DEVICE_POOL.length];
  const status: LoginStatus = i % 10 === 3 ? "Failed" : i % 10 === 8 ? "Locked" : "Success";
  const loginTime = new Date(LOGIN_TIME_BASE.getTime() + i * 47 * 60 * 1000);
  const hasLogout = status === "Success" && i % 4 !== 0;
  const logoutTime = hasLogout ? new Date(loginTime.getTime() + (((i % 6) + 1) * 35 * 60 * 1000)) : null;
  return {
    id: i + 1,
    name: person.name,
    email: toEmail(person.name),
    employeeId: person.employeeId,
    loginTime,
    logoutTime,
    ipAddress: `203.${112 + (i % 40)}.${(i * 7) % 255}.${(i * 13) % 255}`,
    deviceType: device.type,
    deviceOs: device.os,
    browser: device.browser,
    status,
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

function getDurationMinutes(record: LoginRecord): number {
  if (record.status !== "Success") return -1;
  if (!record.logoutTime) return Number.MAX_SAFE_INTEGER;
  return differenceInMinutes(record.logoutTime, record.loginTime);
}

function formatDuration(record: LoginRecord): string {
  if (record.status !== "Success") return "-";
  if (!record.logoutTime) return "Active";
  const totalMinutes = differenceInMinutes(record.logoutTime, record.loginTime);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours === 0) return `${minutes}m`;
  return minutes === 0 ? `${hours}h` : `${hours}h ${minutes}m`;
}

function compareRecords(a: LoginRecord, b: LoginRecord, field: SortField): number {
  switch (field) {
    case "user":
      return a.name.localeCompare(b.name);
    case "employeeId":
      return a.employeeId.localeCompare(b.employeeId);
    case "loginTime":
      return a.loginTime.getTime() - b.loginTime.getTime();
    case "logoutTime":
      return (a.logoutTime?.getTime() ?? Number.MAX_SAFE_INTEGER) - (b.logoutTime?.getTime() ?? Number.MAX_SAFE_INTEGER);
    case "duration":
      return getDurationMinutes(a) - getDurationMinutes(b);
    case "ipAddress":
      return a.ipAddress.localeCompare(b.ipAddress);
    case "device":
      return a.deviceOs.localeCompare(b.deviceOs);
    case "browser":
      return a.browser.localeCompare(b.browser);
    case "status":
      return a.status.localeCompare(b.status);
    default:
      return 0;
  }
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

function StatusBadge({ status }: { status: LoginStatus }): React.JSX.Element {
  const styles: Record<LoginStatus, string> = {
    Success: "border-green-200 bg-green-50 text-green-700",
    Failed: "border-red-200 bg-red-50 text-red-700",
    Locked: "border-amber-200 bg-amber-50 text-amber-600",
  };
  const dots: Record<LoginStatus, string> = {
    Success: "bg-green-500",
    Failed: "bg-red-500",
    Locked: "bg-amber-500",
  };
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium", styles[status])}>
      <span className={cn("h-1.5 w-1.5 rounded-full", dots[status])} />
      {status}
    </span>
  );
}

function DeviceIcon({ type }: { type: DeviceType }): React.JSX.Element {
  const Icon = type === "Desktop" ? Monitor : type === "Mobile" ? Smartphone : Tablet;
  return <Icon className="h-4 w-4 text-gray-400" />;
}

function SortableTh({
  label,
  field,
  activeField,
  dir,
  onSort,
}: {
  label: string;
  field: SortField;
  activeField: SortField;
  dir: SortDir;
  onSort: (field: SortField) => void;
}): React.JSX.Element {
  const isActive = field === activeField;
  return (
    <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-gray-400">
      <button
        type="button"
        onClick={() => onSort(field)}
        className={cn("inline-flex items-center gap-1 transition-colors hover:text-gray-600", isActive && "text-gray-700")}
      >
        {label}
        <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", isActive ? "opacity-100" : "opacity-30", isActive && dir === "asc" && "rotate-180")} />
      </button>
    </th>
  );
}

function LoginDetailModal({ record, onClose }: { record: LoginRecord; onClose: () => void }): React.JSX.Element {
  const fields: { label: string; value: string }[] = [
    { label: "Employee ID", value: record.employeeId },
    { label: "User", value: `${record.name} (${record.email})` },
    { label: "Login Time", value: format(record.loginTime, "dd MMM yyyy, hh:mm a") },
    { label: "Logout Time", value: record.logoutTime ? format(record.logoutTime, "dd MMM yyyy, hh:mm a") : "Active" },
    { label: "Duration", value: formatDuration(record) },
    { label: "IP Address", value: record.ipAddress },
    { label: "Device", value: `${record.deviceType} - ${record.deviceOs}` },
    { label: "Browser", value: record.browser },
    { label: "Status", value: record.status },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative flex w-full max-w-lg flex-col rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <h2 className="text-sm font-semibold text-gray-800">Login Record #{record.id}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4 px-6 py-5">
          {fields.map((field) => (
            <div key={field.label}>
              <p className={labelClass}>{field.label}</p>
              <p className="text-sm text-gray-800">{field.value}</p>
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

export default function AdminLoginHistoryPage(): React.JSX.Element {
  const [showFilters, setShowFilters] = useState(false);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [userSearch, setUserSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<LoginStatus | "">("");
  const [ipSearch, setIpSearch] = useState("");
  const [tableSearch, setTableSearch] = useState("");

  const [sortField, setSortField] = useState<SortField>("loginTime");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [page, setPage] = useState(1);
  const [selectedRecord, setSelectedRecord] = useState<LoginRecord | null>(null);

  const handleSort = (field: SortField): void => {
    if (sortField === field) {
      setSortDir((dir) => (dir === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir("asc");
    }
  };

  const handleResetFilters = (): void => {
    setDateFrom("");
    setDateTo("");
    setUserSearch("");
    setStatusFilter("");
    setIpSearch("");
  };

  const filteredRecords = useMemo(() => {
    const query = tableSearch.trim().toLowerCase();
    const userQuery = userSearch.trim().toLowerCase();
    const ipQuery = ipSearch.trim().toLowerCase();
    const fromTime = dateFrom ? new Date(`${dateFrom}T00:00:00`).getTime() : null;
    const toTime = dateTo ? new Date(`${dateTo}T23:59:59`).getTime() : null;

    const matches = LOGIN_RECORDS.filter((record) => {
      const matchesSearch =
        !query ||
        record.name.toLowerCase().includes(query) ||
        record.email.toLowerCase().includes(query) ||
        record.employeeId.toLowerCase().includes(query) ||
        record.ipAddress.includes(query);
      const matchesUser = !userQuery || record.name.toLowerCase().includes(userQuery);
      const matchesStatus = !statusFilter || record.status === statusFilter;
      const matchesIp = !ipQuery || record.ipAddress.toLowerCase().includes(ipQuery);
      const matchesFrom = fromTime === null || record.loginTime.getTime() >= fromTime;
      const matchesTo = toTime === null || record.loginTime.getTime() <= toTime;
      return matchesSearch && matchesUser && matchesStatus && matchesIp && matchesFrom && matchesTo;
    });

    return [...matches].sort((a, b) => compareRecords(a, b, sortField) * (sortDir === "asc" ? 1 : -1));
  }, [tableSearch, userSearch, statusFilter, ipSearch, dateFrom, dateTo, sortField, sortDir]);

  const filterSignature = [tableSearch, userSearch, statusFilter, ipSearch, dateFrom, dateTo, rowsPerPage].join("|");
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

  const handleExport = (): void => {
    const header = ["#", "Name", "Email", "Employee ID", "Login Time", "Logout Time", "Duration", "IP Address", "Device", "Browser", "Status"];
    const rows = filteredRecords.map((record) => [
      String(record.id),
      record.name,
      record.email,
      record.employeeId,
      format(record.loginTime, "dd MMM yyyy hh:mm a"),
      record.logoutTime ? format(record.logoutTime, "dd MMM yyyy hh:mm a") : "Active",
      formatDuration(record),
      record.ipAddress,
      `${record.deviceType} - ${record.deviceOs}`,
      record.browser,
      record.status,
    ]);
    downloadCsv("login-history.csv", [header, ...rows]);
  };

  const columnCount = 11;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm">
          <span className="text-gray-400">System Settings</span>
          <ChevronRight className="h-3.5 w-3.5 text-gray-300" />
          <span className="font-semibold text-gray-800">Login History</span>
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
              <label htmlFor="statusFilter" className={labelClass}>
                Status
              </label>
              <CustomSelect
                id="statusFilter"
                value={statusFilter}
                onChange={(value) => setStatusFilter(value as LoginStatus | "")}
                placeholder="All statuses"
                options={["Success", "Failed", "Locked"]}
              />
            </div>
            <div>
              <label htmlFor="ipSearch" className={labelClass}>
                IP Address
              </label>
              <input
                id="ipSearch"
                type="text"
                placeholder="Search by IP address..."
                value={ipSearch}
                onChange={(event) => setIpSearch(event.target.value)}
                className={inputClass}
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
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-500">Login History</h2>
            <p className="mt-1 text-xs text-gray-400">{filteredRecords.length} records</p>
          </div>
          <div className="relative w-64">
            <Search className="pointer-events-none absolute inset-y-0 left-3.5 my-auto h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search records..."
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
                <SortableTh label="User" field="user" activeField={sortField} dir={sortDir} onSort={handleSort} />
                <SortableTh label="Employee ID" field="employeeId" activeField={sortField} dir={sortDir} onSort={handleSort} />
                <SortableTh label="Login Time" field="loginTime" activeField={sortField} dir={sortDir} onSort={handleSort} />
                <SortableTh label="Logout Time" field="logoutTime" activeField={sortField} dir={sortDir} onSort={handleSort} />
                <SortableTh label="Duration" field="duration" activeField={sortField} dir={sortDir} onSort={handleSort} />
                <SortableTh label="IP Address" field="ipAddress" activeField={sortField} dir={sortDir} onSort={handleSort} />
                <SortableTh label="Device" field="device" activeField={sortField} dir={sortDir} onSort={handleSort} />
                <SortableTh label="Browser" field="browser" activeField={sortField} dir={sortDir} onSort={handleSort} />
                <SortableTh label="Status" field="status" activeField={sortField} dir={sortDir} onSort={handleSort} />
                <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody>
              {pageRecords.length === 0 && (
                <tr>
                  <td colSpan={columnCount} className="px-4 py-12 text-center">
                    <div className="flex flex-col items-center gap-2 text-gray-400">
                      <Search className="h-6 w-6" />
                      <p className="text-sm">No login records found</p>
                    </div>
                  </td>
                </tr>
              )}
              {pageRecords.map((record, index) => (
                <tr key={record.id} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                  <td className="px-4 py-3 text-gray-500">{startIndex + index + 1}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white"
                        style={{ backgroundColor: getAvatarColor(startIndex + index) }}
                      >
                        {getInitials(record.name)}
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">{record.name}</p>
                        <p className="text-xs text-gray-400">{record.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{record.employeeId}</td>
                  <td className="px-4 py-3 text-gray-600">
                    <p>{format(record.loginTime, "dd MMM yyyy")}</p>
                    <p className="text-xs text-gray-400">{format(record.loginTime, "hh:mm a")}</p>
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {record.logoutTime ? (
                      <>
                        <p>{format(record.logoutTime, "dd MMM yyyy")}</p>
                        <p className="text-xs text-gray-400">{format(record.logoutTime, "hh:mm a")}</p>
                      </>
                    ) : record.status === "Success" ? (
                      <span className="font-medium text-green-600">Active</span>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {formatDuration(record) === "Active" ? <span className="font-medium text-green-600">Active</span> : formatDuration(record)}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{record.ipAddress}</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-1.5 text-gray-600">
                      <DeviceIcon type={record.deviceType} />
                      {record.deviceOs}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{record.browser}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={record.status} />
                  </td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => setSelectedRecord(record)}
                      aria-label="View login record"
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

      {selectedRecord && <LoginDetailModal record={selectedRecord} onClose={() => setSelectedRecord(null)} />}
    </div>
  );
}
