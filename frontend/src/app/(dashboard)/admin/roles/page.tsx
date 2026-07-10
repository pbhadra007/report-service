"use client";

import { useMemo, useState } from "react";
import {
  Eye,
  Pencil,
  Copy,
  Lock,
  Unlock,
  Trash2,
  Plus,
  KeyRound,
  FileStack,
  Users2,
  Upload,
  Download,
  ChevronDown,
  X,
  Search,
  CheckCircle2,
  PauseCircle,
  User,
  ArrowUp,
  ArrowDown,
  SlidersHorizontal,
  FileSpreadsheet,
} from "lucide-react";
import { ROLE_PERMISSIONS, type ReportAccessScope, type RolePermissions } from "@/config/roles.config";
import type { Role } from "@/types";
import { cn } from "@/lib/utils";

const ROLE_ENTRIES = Object.entries(ROLE_PERMISSIONS) as [Role, RolePermissions][];

const ASSIGNED_USERS: Record<Role, number> = {
  SYSTEM_ADMIN: 2,
  IT_OPERATIONS: 5,
  MD_CEO: 1,
  CFO_FINANCE_HEAD: 1,
  COMPLIANCE_OFFICER: 3,
  INTERNAL_AUDITOR: 2,
  CREDIT_HEAD: 1,
  TREASURY_HEAD: 0,
  BRANCH_MANAGER: 12,
  RELATIONSHIP_MANAGER: 25,
};

const ROLE_CREATED: Record<Role, string> = {
  SYSTEM_ADMIN: "15-May-26",
  IT_OPERATIONS: "14-May-26",
  MD_CEO: "01-Jan-26",
  CFO_FINANCE_HEAD: "02-Jan-26",
  COMPLIANCE_OFFICER: "20-Feb-26",
  INTERNAL_AUDITOR: "21-Feb-26",
  CREDIT_HEAD: "10-Mar-26",
  TREASURY_HEAD: "11-Mar-26",
  BRANCH_MANAGER: "12-May-26",
  RELATIONSHIP_MANAGER: "13-May-26",
};

const ROLE_BRANCHES: Record<Role, string[]> = {
  SYSTEM_ADMIN: ["Dhaka Main"],
  IT_OPERATIONS: ["Dhaka Main"],
  MD_CEO: ["Dhaka Main"],
  CFO_FINANCE_HEAD: ["Dhaka Main"],
  COMPLIANCE_OFFICER: ["Dhaka Main", "Chattogram"],
  INTERNAL_AUDITOR: ["Dhaka Main"],
  CREDIT_HEAD: ["Dhaka Main"],
  TREASURY_HEAD: ["Dhaka Main"],
  BRANCH_MANAGER: ["Dhaka Main", "Chattogram", "Sylhet", "Khulna", "Rajshahi", "Barishal"],
  RELATIONSHIP_MANAGER: ["Dhaka Main", "Chattogram", "Sylhet", "Khulna", "Rajshahi", "Barishal"],
};

const ROLE_DEPARTMENT: Record<Role, string> = {
  SYSTEM_ADMIN: "IT & Operations",
  IT_OPERATIONS: "IT & Operations",
  MD_CEO: "Executive",
  CFO_FINANCE_HEAD: "Finance",
  COMPLIANCE_OFFICER: "Compliance",
  INTERNAL_AUDITOR: "Compliance",
  CREDIT_HEAD: "Credit",
  TREASURY_HEAD: "Treasury",
  BRANCH_MANAGER: "Branch Operations",
  RELATIONSHIP_MANAGER: "Branch Operations",
};

const BRANCHES = Array.from(new Set(Object.values(ROLE_BRANCHES).flat())).sort();
const DEPARTMENTS = Array.from(new Set(Object.values(ROLE_DEPARTMENT))).sort();
const STATUS_OPTIONS = ["Active", "Inactive"];
const ROLE_TYPE_OPTIONS = ["System", "Custom"];
const SORT_OPTIONS = ["Name (A-Z)", "Name (Z-A)", "Most Users", "Fewest Users"];
const DASHBOARD_ACCESS_OPTIONS: ReportAccessScope[] = ["FULL", "SYSTEM", "EXECUTIVE", "SCOPED", "NONE"];
const ADMIN_ACCESS_OPTIONS = ["Admin", "Standard"];

const ACCESS_SCOPE_STYLES: Record<ReportAccessScope, { dot: string; pill: string }> = {
  FULL: { dot: "bg-green-500", pill: "border-green-200 bg-green-50 text-green-700" },
  SYSTEM: { dot: "bg-blue-500", pill: "border-blue-200 bg-blue-50 text-blue-700" },
  EXECUTIVE: { dot: "bg-purple-500", pill: "border-purple-200 bg-purple-50 text-purple-700" },
  SCOPED: { dot: "bg-amber-500", pill: "border-amber-200 bg-amber-50 text-amber-700" },
  NONE: { dot: "bg-gray-400", pill: "border-gray-200 bg-gray-50 text-gray-500" },
};

const inputClass =
  "w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-700 outline-none " +
  "focus:outline-none focus:ring-2 focus:ring-[#232B2B] focus:border-transparent placeholder:text-gray-300 " +
  "transition-all duration-200";
const selectClass =
  "w-full appearance-none cursor-pointer rounded-xl border border-gray-200 bg-white py-2.5 pl-3 pr-9 text-sm text-gray-700 " +
  "outline-none focus:outline-none focus:ring-2 focus:ring-[#232B2B] focus:border-transparent transition-all duration-200";
const labelClass = "mb-1.5 block text-xs font-medium uppercase tracking-wide text-gray-500";
const actionButtonClass = "rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600";

function formatRoleLabel(role: Role): string {
  return role
    .split("_")
    .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
    .join(" ");
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

function SelectField({
  id,
  label,
  value,
  onChange,
  options,
  placeholder,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
  placeholder?: string;
}): React.JSX.Element {
  return (
    <div>
      <label htmlFor={id} className={labelClass}>
        {label}
      </label>
      <div className="relative">
        <select id={id} className={selectClass} value={value} onChange={(event) => onChange(event.target.value)}>
          <option value="">{placeholder ?? `All ${label.toLowerCase()}`}</option>
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
      </div>
    </div>
  );
}

function MiniSparkline({ points, color }: { points: number[]; color: string }): React.JSX.Element {
  const width = 100;
  const height = 28;
  const max = Math.max(...points);
  const min = Math.min(...points);
  const range = max - min || 1;
  const step = width / (points.length - 1 || 1);
  const path = points
    .map((point, index) => `${index === 0 ? "M" : "L"}${index * step},${height - ((point - min) / range) * height}`)
    .join(" ");
  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="h-6 w-full" preserveAspectRatio="none">
      <path d={path} fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

interface SummaryCardData {
  icon: typeof Users2;
  label: string;
  value: number;
  caption: string;
  trend?: { percent: number; direction: "up" | "down" | "flat" };
  sparkline: number[];
  accent: string;
}

function SummaryCard({ icon: Icon, label, value, caption, trend, sparkline, accent }: SummaryCardData): React.JSX.Element {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-xl" style={{ backgroundColor: `${accent}1A` }}>
          <Icon className="h-4 w-4" style={{ color: accent }} />
        </span>
        <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">{label}</span>
      </div>

      <div className="flex items-baseline gap-2">
        <span className="text-3xl font-bold text-gray-900">{value}</span>
        {trend && trend.direction !== "flat" && (
          <span
            className={cn(
              "inline-flex items-center gap-0.5 text-xs font-semibold",
              trend.direction === "up" ? "text-green-600" : "text-gray-400",
            )}
          >
            {trend.direction === "up" ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
            {trend.percent}%
          </span>
        )}
        {trend && trend.direction === "flat" && <span className="text-xs font-semibold text-gray-400">{trend.percent}%</span>}
      </div>

      <p className="text-xs text-gray-400">{caption}</p>
      <MiniSparkline points={sparkline} color={accent} />
    </div>
  );
}

function AccessPill({ scope }: { scope: ReportAccessScope }): React.JSX.Element {
  const style = ACCESS_SCOPE_STYLES[scope];
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium", style.pill)}>
      <span className={cn("h-1.5 w-1.5 rounded-full", style.dot)} />
      {scope}
    </span>
  );
}

function AdminPill({ isAdmin }: { isAdmin: boolean }): React.JSX.Element {
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2.5 py-1 text-xs font-medium",
        isAdmin ? "bg-[#FFE6F4] text-[#ED017F]" : "bg-gray-100 text-gray-500",
      )}
    >
      {isAdmin ? "Yes" : "No"}
    </span>
  );
}

function TypeBadge({ isAdmin }: { isAdmin: boolean }): React.JSX.Element {
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2.5 py-1 text-xs font-medium",
        isAdmin ? "bg-blue-50 text-blue-700" : "bg-gray-100 text-gray-600",
      )}
    >
      {isAdmin ? "System" : "Custom"}
    </span>
  );
}

function StatusBadge({ status }: { status: "Active" | "Inactive" }): React.JSX.Element {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium",
        status === "Active" ? "border-green-200 bg-green-50 text-green-700" : "border-gray-200 bg-gray-50 text-gray-500",
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", status === "Active" ? "bg-green-500" : "bg-gray-400")} />
      {status}
    </span>
  );
}

function ExportFormatPills({ formats }: { formats: RolePermissions["exportFormats"] }): React.JSX.Element {
  return (
    <div className="flex flex-wrap gap-1">
      {formats.map((format) => (
        <span key={format} className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium uppercase text-gray-500">
          {format}
        </span>
      ))}
    </div>
  );
}

interface DonutSegment {
  label: string;
  value: number;
  color: string;
}

function DonutChart({ segments, total }: { segments: DonutSegment[]; total: number }): React.JSX.Element {
  const size = 160;
  const strokeWidth = 22;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  const arcs = segments.reduce<{ segment: DonutSegment; dash: number; offset: number }[]>((acc, segment) => {
    const cumulative = acc.reduce((sum, arc) => sum + arc.dash / circumference, 0);
    const fraction = total === 0 ? 0 : segment.value / total;
    acc.push({ segment, dash: fraction * circumference, offset: cumulative * circumference });
    return acc;
  }, []);

  return (
    <div className="relative flex items-center justify-center">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#F3F4F6" strokeWidth={strokeWidth} />
        {arcs.map(({ segment, dash, offset }) =>
          segment.value === 0 || total === 0 ? null : (
            <circle
              key={segment.label}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke={segment.color}
              strokeWidth={strokeWidth}
              strokeDasharray={`${dash} ${circumference - dash}`}
              strokeDashoffset={-offset}
            />
          ),
        )}
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-2xl font-bold text-gray-900">{total}</span>
        <span className="text-xs text-gray-400">Total</span>
      </div>
    </div>
  );
}

function RoleDetailModal({
  role,
  permissions,
  onClose,
}: {
  role: Role;
  permissions: RolePermissions;
  onClose: () => void;
}): React.JSX.Element {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative flex w-full max-w-md flex-col rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <h2 className="text-sm font-semibold text-gray-800">{formatRoleLabel(role)}</h2>
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
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className={labelClass}>Dashboard</p>
              <AccessPill scope={permissions.dashboard} />
            </div>
            <div>
              <p className={labelClass}>Reports</p>
              <AccessPill scope={permissions.reports} />
            </div>
            <div>
              <p className={labelClass}>Regulatory</p>
              <AccessPill scope={permissions.regulatory} />
            </div>
            <div>
              <p className={labelClass}>Audit</p>
              <AccessPill scope={permissions.audit} />
            </div>
          </div>

          <div>
            <p className={labelClass}>Export Formats</p>
            <ExportFormatPills formats={permissions.exportFormats} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className={labelClass}>Admin Access</p>
              <AdminPill isAdmin={permissions.admin} />
            </div>
            <div>
              <p className={labelClass}>Dynamic Report Builder</p>
              <AdminPill isAdmin={permissions.dynamicReportBuilder} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface RoleActionsProps {
  role: Role;
  isLocked: boolean;
  onView: (role: Role) => void;
  onEdit: (role: Role) => void;
  onDuplicate: (role: Role) => void;
  onToggleLock: (role: Role) => void;
  onDelete: (role: Role) => void;
}

function RoleActions({ role, isLocked, onView, onEdit, onDuplicate, onToggleLock, onDelete }: RoleActionsProps): React.JSX.Element {
  return (
    <div className="flex items-center gap-1">
      <button type="button" onClick={() => onView(role)} aria-label="View role" className={actionButtonClass}>
        <Eye className="h-4 w-4" />
      </button>
      <button type="button" onClick={() => onEdit(role)} aria-label="Edit role" className={actionButtonClass}>
        <Pencil className="h-4 w-4" />
      </button>
      <button type="button" onClick={() => onDuplicate(role)} aria-label="Duplicate role" className={actionButtonClass}>
        <Copy className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={() => onToggleLock(role)}
        aria-label={isLocked ? "Unlock role" : "Lock role"}
        className={actionButtonClass}
      >
        {isLocked ? <Unlock className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
      </button>
      <button
        type="button"
        onClick={() => onDelete(role)}
        aria-label="Delete role"
        className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}

export default function AdminRolesPage(): React.JSX.Element {
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [selectedRoles, setSelectedRoles] = useState<Set<Role>>(new Set());
  const [lockedRoles, setLockedRoles] = useState<Set<Role>>(new Set());
  const [viewMode, setViewMode] = useState<"table" | "card">("table");
  const [bulkAction, setBulkAction] = useState("");
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [roleTypeFilter, setRoleTypeFilter] = useState("");
  const [sortBy, setSortBy] = useState("");
  const [branchFilter, setBranchFilter] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("");
  const [dashboardFilter, setDashboardFilter] = useState("");
  const [adminFilter, setAdminFilter] = useState("");
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  const segments = useMemo<DonutSegment[]>(() => {
    const systemCount = ROLE_ENTRIES.filter(([, permissions]) => permissions.admin).length;
    const nonAdminRoles = ROLE_ENTRIES.filter(([, permissions]) => !permissions.admin);
    const activeCount = nonAdminRoles.filter(([role]) => ASSIGNED_USERS[role] > 0).length;
    const inactiveCount = nonAdminRoles.filter(([role]) => ASSIGNED_USERS[role] === 0).length;
    return [
      { label: "Active", value: activeCount, color: "#22C55E" },
      { label: "Inactive", value: inactiveCount, color: "#9CA3AF" },
      { label: "System", value: systemCount, color: "#3B82F6" },
      { label: "Draft", value: 0, color: "#D1D5DB" },
    ];
  }, []);

  const totalRoles = ROLE_ENTRIES.length;
  const activeCount = segments[0].value;
  const inactiveCount = segments[1].value;
  const systemCount = segments[2].value;
  const assignedUsersTotal = ROLE_ENTRIES.reduce((sum, [role]) => sum + ASSIGNED_USERS[role], 0);
  const percentOf = (value: number): number => (totalRoles > 0 ? Math.round((value / totalRoles) * 100) : 0);

  const summaryCards: SummaryCardData[] = [
    { icon: Users2, label: "Total Roles", value: totalRoles, caption: "All roles", sparkline: [7, 8, 8, 9, 9, totalRoles], accent: "#232B2B" },
    {
      icon: CheckCircle2,
      label: "Active Roles",
      value: activeCount,
      caption: "Currently Active",
      trend: { percent: percentOf(activeCount), direction: "up" },
      sparkline: [5, 6, 6, 7, 8, activeCount],
      accent: "#22C55E",
    },
    {
      icon: PauseCircle,
      label: "Inactive Roles",
      value: inactiveCount,
      caption: "Temporarily Inactive",
      trend: { percent: percentOf(inactiveCount), direction: "down" },
      sparkline: [3, 3, 2, 2, 1, inactiveCount],
      accent: "#9CA3AF",
    },
    {
      icon: Lock,
      label: "System Roles",
      value: systemCount,
      caption: "Protected Roles",
      trend: { percent: percentOf(systemCount), direction: "flat" },
      sparkline: [1, 1, 1, 1, 1, systemCount],
      accent: "#3B82F6",
    },
    {
      icon: User,
      label: "Assigned Users",
      value: assignedUsersTotal,
      caption: "Across all roles",
      sparkline: [38, 42, 45, 48, 50, assignedUsersTotal],
      accent: "#7C3AED",
    },
  ];

  const filteredRoles = useMemo(() => {
    const query = search.trim().toLowerCase();
    const matches = ROLE_ENTRIES.filter(([role, permissions]) => {
      const status = ASSIGNED_USERS[role] > 0 ? "Active" : "Inactive";
      const roleType = permissions.admin ? "System" : "Custom";
      const matchesSearch = !query || formatRoleLabel(role).toLowerCase().includes(query);
      const matchesStatus = !statusFilter || status === statusFilter;
      const matchesRoleType = !roleTypeFilter || roleType === roleTypeFilter;
      const matchesBranch = !branchFilter || ROLE_BRANCHES[role].includes(branchFilter);
      const matchesDepartment = !departmentFilter || ROLE_DEPARTMENT[role] === departmentFilter;
      const matchesDashboard = !dashboardFilter || permissions.dashboard === dashboardFilter;
      const matchesAdmin = !adminFilter || (adminFilter === "Admin" ? permissions.admin : !permissions.admin);
      return (
        matchesSearch &&
        matchesStatus &&
        matchesRoleType &&
        matchesBranch &&
        matchesDepartment &&
        matchesDashboard &&
        matchesAdmin
      );
    });

    const sorted = [...matches];
    if (sortBy === "Name (A-Z)") sorted.sort((a, b) => formatRoleLabel(a[0]).localeCompare(formatRoleLabel(b[0])));
    if (sortBy === "Name (Z-A)") sorted.sort((a, b) => formatRoleLabel(b[0]).localeCompare(formatRoleLabel(a[0])));
    if (sortBy === "Most Users") sorted.sort((a, b) => ASSIGNED_USERS[b[0]] - ASSIGNED_USERS[a[0]]);
    if (sortBy === "Fewest Users") sorted.sort((a, b) => ASSIGNED_USERS[a[0]] - ASSIGNED_USERS[b[0]]);
    return sorted;
  }, [search, statusFilter, roleTypeFilter, branchFilter, departmentFilter, dashboardFilter, adminFilter, sortBy]);

  const handleResetFilters = (): void => {
    setSearch("");
    setStatusFilter("");
    setRoleTypeFilter("");
    setSortBy("");
    setBranchFilter("");
    setDepartmentFilter("");
    setDashboardFilter("");
    setAdminFilter("");
  };

  const allSelected = selectedRoles.size > 0 && selectedRoles.size === filteredRoles.length;

  const toggleSelectAll = (): void => {
    setSelectedRoles(allSelected ? new Set() : new Set(filteredRoles.map(([role]) => role)));
  };

  const toggleSelectRole = (role: Role): void => {
    setSelectedRoles((prev) => {
      const next = new Set(prev);
      if (next.has(role)) next.delete(role);
      else next.add(role);
      return next;
    });
  };

  const handleToggleLock = (role: Role): void => {
    setLockedRoles((prev) => {
      const next = new Set(prev);
      if (next.has(role)) next.delete(role);
      else next.add(role);
      return next;
    });
  };

  const exportRoles = (roles: [Role, RolePermissions][]): void => {
    const header = ["Role Name", "Type", "Users", "Status", "Created"];
    const rows = roles.map(([role, permissions]) => [
      formatRoleLabel(role),
      permissions.admin ? "System" : "Custom",
      String(ASSIGNED_USERS[role]),
      ASSIGNED_USERS[role] > 0 ? "Active" : "Inactive",
      ROLE_CREATED[role],
    ]);
    downloadCsv("roles.csv", [header, ...rows]);
  };

  const handleBulkAction = (value: string): void => {
    setBulkAction("");
    if (!value) return;
    const selected = ROLE_ENTRIES.filter(([role]) => selectedRoles.has(role));
    if (selected.length === 0) {
      setActionMessage("Select at least one role first.");
      return;
    }
    if (value === "Export Selected") {
      exportRoles(selected);
      setActionMessage(`Exported ${selected.length} role(s).`);
      return;
    }
    setActionMessage(`${value} for ${selected.length} role(s) isn't supported yet.`);
  };

  const quickActions = [
    {
      label: "Create New Role",
      icon: Plus,
      onClick: () => setActionMessage("Creating custom roles isn't supported yet — roles are a fixed system list."),
    },
    { label: "Permission Matrix", icon: KeyRound, onClick: () => setActionMessage("Permission Matrix view is coming soon.") },
    { label: "Role Templates", icon: FileStack, onClick: () => setActionMessage("Role Templates is coming soon.") },
    { label: "Bulk Assign Users", icon: Users2, onClick: () => setActionMessage("Bulk Assign Users is coming soon.") },
    {
      label: "Import Roles",
      icon: Upload,
      onClick: () => setActionMessage("Importing roles isn't supported yet — roles are a fixed system list."),
    },
    { label: "Export Roles", icon: Download, onClick: () => exportRoles(ROLE_ENTRIES) },
  ];

  const handleExportExcel = (): void => {
    exportRoles(filteredRoles);
    setActionMessage(`Exported ${filteredRoles.length} role(s).`);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Role Management</h1>
          <p className="text-sm text-gray-400">{ROLE_ENTRIES.length} system roles</p>
        </div>
        <button
          type="button"
          onClick={() => setActionMessage("Creating custom roles isn't supported yet — roles are a fixed system list.")}
          className="inline-flex items-center gap-2 rounded-xl border border-transparent bg-[#232B2B] px-6 py-2.5
                    text-sm font-semibold text-white transition-all duration-200 hover:border-[#232B2B]
                    hover:bg-white hover:text-[#232B2B]"
        >
          <Plus className="h-4 w-4" />
          Create Role
        </button>
      </div>

      {actionMessage && <p className="text-sm font-medium text-gray-600">{actionMessage}</p>}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {summaryCards.map((card) => (
          <SummaryCard key={card.label} {...card} />
        ))}
      </div>

      <div className="rounded-2xl border border-gray-100 bg-white shadow-sm">
        <div className="border-b border-gray-100 px-5 py-4">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-500">Search &amp; Filters</h2>
        </div>
        <div className="p-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-6">
            <div>
              <label htmlFor="search" className={labelClass}>
                Search Role
              </label>
              <div className="relative">
                <Search className="pointer-events-none absolute inset-y-0 left-3.5 my-auto h-4 w-4 text-gray-400" />
                <input
                  id="search"
                  type="text"
                  placeholder="Search by role name..."
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  className={cn(inputClass, "pl-10")}
                />
              </div>
            </div>

            <SelectField id="statusFilter" label="Status" value={statusFilter} onChange={setStatusFilter} options={STATUS_OPTIONS} />
            <SelectField
              id="roleTypeFilter"
              label="Role Type"
              value={roleTypeFilter}
              onChange={setRoleTypeFilter}
              options={ROLE_TYPE_OPTIONS}
            />
            <SelectField
              id="sortBy"
              label="Sort By"
              value={sortBy}
              onChange={setSortBy}
              options={SORT_OPTIONS}
              placeholder="Default order"
            />
            <SelectField id="branchFilter" label="Branch" value={branchFilter} onChange={setBranchFilter} options={BRANCHES} />
            <SelectField
              id="departmentFilter"
              label="Department"
              value={departmentFilter}
              onChange={setDepartmentFilter}
              options={DEPARTMENTS}
            />
          </div>

          {showAdvancedFilters && (
            <div className="mt-4 grid grid-cols-1 gap-4 border-t border-gray-100 pt-4 sm:grid-cols-2">
              <SelectField
                id="dashboardFilter"
                label="Dashboard Access"
                value={dashboardFilter}
                onChange={setDashboardFilter}
                options={DASHBOARD_ACCESS_OPTIONS}
              />
              <SelectField
                id="adminFilter"
                label="Admin Access"
                value={adminFilter}
                onChange={setAdminFilter}
                options={ADMIN_ACCESS_OPTIONS}
              />
            </div>
          )}

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <button
              type="button"
              onClick={handleResetFilters}
              className="text-sm font-medium text-gray-500 transition-colors hover:text-gray-700"
            >
              Reset Filters
            </button>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setShowAdvancedFilters((prev) => !prev)}
                className={cn(
                  "inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-medium transition-colors",
                  showAdvancedFilters
                    ? "border-[#232B2B] bg-[#232B2B] text-white"
                    : "border-gray-200 text-gray-600 hover:bg-gray-50",
                )}
              >
                <SlidersHorizontal className="h-4 w-4" />
                Advanced Filters
              </button>
              <button
                type="button"
                onClick={handleExportExcel}
                className="inline-flex items-center gap-2 rounded-xl border border-transparent bg-[#232B2B] px-5 py-2
                          text-sm font-semibold text-white transition-all duration-200 hover:border-[#232B2B]
                          hover:bg-white hover:text-[#232B2B]"
              >
                <FileSpreadsheet className="h-4 w-4" />
                Export Excel
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[320px_1fr]">
        <div className="flex flex-col gap-6">
          <div className="rounded-2xl border border-gray-100 bg-white shadow-sm">
            <div className="border-b border-gray-100 px-5 py-4">
              <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-500">Role Overview</h2>
            </div>
            <div className="flex flex-col items-center gap-5 px-5 py-6">
              <DonutChart segments={segments} total={ROLE_ENTRIES.length} />
              <ul className="flex w-full flex-col gap-2 text-sm">
                {segments.map((segment) => (
                  <li key={segment.label} className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-gray-600">
                      <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: segment.color }} />
                      {segment.label}
                    </span>
                    <span className="font-medium text-gray-800">
                      {segment.value}
                      {ROLE_ENTRIES.length > 0 ? ` (${Math.round((segment.value / ROLE_ENTRIES.length) * 100)}%)` : ""}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-100 bg-white shadow-sm">
            <div className="border-b border-gray-100 px-5 py-4">
              <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-500">Quick Actions</h2>
            </div>
            <div className="flex flex-col p-2">
              {quickActions.map((action) => (
                <button
                  key={action.label}
                  type="button"
                  onClick={action.onClick}
                  className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-800"
                >
                  <action.icon className="h-4 w-4 text-gray-400" />
                  {action.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-500">Role List</h2>
            <span className="text-xs text-gray-400">
              Showing {filteredRoles.length} of {ROLE_ENTRIES.length} roles
            </span>
          </div>

          {viewMode === "table" ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="w-10 px-4 py-3">
                      <input
                        type="checkbox"
                        checked={allSelected}
                        onChange={toggleSelectAll}
                        className="h-4 w-4 rounded border-gray-300 text-[#232B2B] focus:ring-[#232B2B]"
                      />
                    </th>
                    <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-gray-400">Role Name</th>
                    <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-gray-400">Type</th>
                    <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-gray-400">Users</th>
                    <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-gray-400">Status</th>
                    <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-gray-400">Created</th>
                    <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-gray-400">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRoles.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-4 py-6 text-center text-sm text-gray-400">
                        No roles found.
                      </td>
                    </tr>
                  )}
                  {filteredRoles.map(([role, permissions], index) => (
                    <tr key={role} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={selectedRoles.has(role)}
                          onChange={() => toggleSelectRole(role)}
                          className="h-4 w-4 rounded border-gray-300 text-[#232B2B] focus:ring-[#232B2B]"
                        />
                      </td>
                      <td className="px-4 py-3 font-bold text-gray-800">{formatRoleLabel(role)}</td>
                      <td className="px-4 py-3">
                        <TypeBadge isAdmin={permissions.admin} />
                      </td>
                      <td className="px-4 py-3 text-gray-600">{ASSIGNED_USERS[role]}</td>
                      <td className="px-4 py-3">
                        <StatusBadge status={ASSIGNED_USERS[role] > 0 ? "Active" : "Inactive"} />
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500">{ROLE_CREATED[role]}</td>
                      <td className="px-4 py-3">
                        <RoleActions
                          role={role}
                          isLocked={lockedRoles.has(role)}
                          onView={setSelectedRole}
                          onEdit={(r) => setActionMessage(`Editing "${formatRoleLabel(r)}" isn't supported yet.`)}
                          onDuplicate={(r) => setActionMessage(`Duplicating "${formatRoleLabel(r)}" isn't supported yet.`)}
                          onToggleLock={handleToggleLock}
                          onDelete={(r) => setActionMessage(`"${formatRoleLabel(r)}" is a system-defined role and can't be deleted.`)}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-2">
              {filteredRoles.length === 0 && <p className="col-span-full py-6 text-center text-sm text-gray-400">No roles found.</p>}
              {filteredRoles.map(([role, permissions]) => (
                <div key={role} className="flex flex-col gap-3 rounded-2xl border border-gray-100 p-5 shadow-sm">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={selectedRoles.has(role)}
                        onChange={() => toggleSelectRole(role)}
                        className="h-4 w-4 rounded border-gray-300 text-[#232B2B] focus:ring-[#232B2B]"
                      />
                      <span className="font-bold text-gray-800">{formatRoleLabel(role)}</span>
                    </div>
                    <TypeBadge isAdmin={permissions.admin} />
                  </div>

                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{ASSIGNED_USERS[role]} users</span>
                    <StatusBadge status={ASSIGNED_USERS[role] > 0 ? "Active" : "Inactive"} />
                  </div>

                  <p className="text-xs text-gray-400">Created {ROLE_CREATED[role]}</p>

                  <div className="flex items-center justify-end border-t border-gray-100 pt-3">
                    <RoleActions
                      role={role}
                      isLocked={lockedRoles.has(role)}
                      onView={setSelectedRole}
                      onEdit={(r) => setActionMessage(`Editing "${formatRoleLabel(r)}" isn't supported yet.`)}
                      onDuplicate={(r) => setActionMessage(`Duplicating "${formatRoleLabel(r)}" isn't supported yet.`)}
                      onToggleLock={handleToggleLock}
                      onDelete={(r) => setActionMessage(`"${formatRoleLabel(r)}" is a system-defined role and can't be deleted.`)}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 px-5 py-4">
            <div className="relative w-56">
              <select
                value={bulkAction}
                onChange={(event) => handleBulkAction(event.target.value)}
                className={selectClass}
              >
                <option value="">Bulk Actions</option>
                <option value="Activate Selected">Activate Selected</option>
                <option value="Deactivate Selected">Deactivate Selected</option>
                <option value="Export Selected">Export Selected</option>
                <option value="Delete Selected">Delete Selected</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            </div>

            <div className="flex items-center gap-4 text-sm text-gray-600">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={viewMode === "table"}
                  onChange={() => setViewMode("table")}
                  className="h-4 w-4 rounded border-gray-300 text-[#232B2B] focus:ring-[#232B2B]"
                />
                Table View
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={viewMode === "card"}
                  onChange={() => setViewMode("card")}
                  className="h-4 w-4 rounded border-gray-300 text-[#232B2B] focus:ring-[#232B2B]"
                />
                Card View
              </label>
            </div>
          </div>
        </div>
      </div>

      <footer className="text-center text-xs text-gray-400">© 2026 - Business Transformation, IPDC Finance Limited</footer>

      {selectedRole && (
        <RoleDetailModal role={selectedRole} permissions={ROLE_PERMISSIONS[selectedRole]} onClose={() => setSelectedRole(null)} />
      )}
    </div>
  );
}
