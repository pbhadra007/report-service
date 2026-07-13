"use client";

import { Fragment, useMemo, useState } from "react";
import {
  KeyRound,
  CheckCircle2,
  PauseCircle,
  Lock,
  Package,
  Plus,
  ChevronLeft,
  ChevronRight,
  Search,
  ArrowUp,
  ArrowDown,
  SlidersHorizontal,
  FileSpreadsheet,
  Check,
  X,
  RefreshCw,
  Eye,
  Users2,
  UserCheck,
  GitBranch,
  Building2,
  Settings2,
  Mail,
  Bell,
  ShieldCheck,
  History,
  MonitorSmartphone,
  Activity,
  Download,
  Upload,
  LayoutDashboard,
  Shield,
  FileStack,
  CreditCard,
  Zap,
} from "lucide-react";
import type { Role } from "@/types";
import { CustomSelect } from "@/components/common/CustomSelect";
import { cn } from "@/lib/utils";

type PermissionStatus = "Active" | "Inactive" | "Restricted";
type ResourceType = "Record" | "Data Transfer" | "Workflow" | "Access Control";
type PermissionType = "System" | "Custom";
type Environment = "Production" | "Staging" | "Development";
type PermissionScope = "System" | "Module" | "Resource" | "Action";

interface PermissionEntry {
  id: string;
  module: string;
  action: string;
  status: PermissionStatus;
  resourceType: ResourceType;
  permissionType: PermissionType;
  environment: Environment;
  ownerRole: Role;
  scope: PermissionScope;
}

const PERMISSION_MODULES = [
  "Dashboard",
  "Reports",
  "Regulatory",
  "Audit Logs",
  "User Management",
  "Role Management",
  "Permission Management",
  "Branch Management",
  "Department Management",
  "Report Management",
  "Report Access",
  "System Settings",
  "SMTP Configuration",
  "Notification Settings",
  "Password Policy",
  "Login History",
  "Session Management",
  "User Activity Report",
  "Export Center",
  "Import Center",
  "API Keys",
  "Webhooks",
  "Billing & Licensing",
];

const PERMISSION_ACTIONS = ["View", "Create", "Edit", "Delete", "Export", "Import", "Approve", "Assign"];

const ACTION_RESOURCE_TYPE: Record<string, ResourceType> = {
  View: "Record",
  Create: "Record",
  Edit: "Record",
  Delete: "Record",
  Export: "Data Transfer",
  Import: "Data Transfer",
  Approve: "Workflow",
  Assign: "Access Control",
};

const SYSTEM_MODULES = new Set([
  "Audit Logs",
  "System Settings",
  "SMTP Configuration",
  "Password Policy",
  "Login History",
  "Session Management",
  "API Keys",
  "Webhooks",
  "Billing & Licensing",
]);

const MODULE_OWNER_ROLE: Record<string, Role> = {
  Dashboard: "SYSTEM_ADMIN",
  Reports: "CFO_FINANCE_HEAD",
  Regulatory: "COMPLIANCE_OFFICER",
  "Audit Logs": "INTERNAL_AUDITOR",
  "User Management": "SYSTEM_ADMIN",
  "Role Management": "SYSTEM_ADMIN",
  "Permission Management": "SYSTEM_ADMIN",
  "Branch Management": "BRANCH_MANAGER",
  "Department Management": "SYSTEM_ADMIN",
  "Report Management": "CFO_FINANCE_HEAD",
  "Report Access": "SYSTEM_ADMIN",
  "System Settings": "IT_OPERATIONS",
  "SMTP Configuration": "IT_OPERATIONS",
  "Notification Settings": "IT_OPERATIONS",
  "Password Policy": "IT_OPERATIONS",
  "Login History": "INTERNAL_AUDITOR",
  "Session Management": "IT_OPERATIONS",
  "User Activity Report": "INTERNAL_AUDITOR",
  "Export Center": "CFO_FINANCE_HEAD",
  "Import Center": "IT_OPERATIONS",
  "API Keys": "IT_OPERATIONS",
  Webhooks: "IT_OPERATIONS",
  "Billing & Licensing": "TREASURY_HEAD",
};

const MODULE_ICON: Record<string, typeof KeyRound> = {
  Dashboard: LayoutDashboard,
  Reports: FileStack,
  Regulatory: Shield,
  "Audit Logs": History,
  "User Management": Users2,
  "Role Management": UserCheck,
  "Permission Management": KeyRound,
  "Branch Management": GitBranch,
  "Department Management": Building2,
  "Report Management": FileStack,
  "Report Access": KeyRound,
  "System Settings": Settings2,
  "SMTP Configuration": Mail,
  "Notification Settings": Bell,
  "Password Policy": ShieldCheck,
  "Login History": History,
  "Session Management": MonitorSmartphone,
  "User Activity Report": Activity,
  "Export Center": Download,
  "Import Center": Upload,
  "API Keys": KeyRound,
  Webhooks: Zap,
  "Billing & Licensing": CreditCard,
};

const PERMISSIONS: PermissionEntry[] = PERMISSION_MODULES.flatMap((module, moduleIndex) =>
  PERMISSION_ACTIONS.map((action, actionIndex) => {
    const index = moduleIndex * PERMISSION_ACTIONS.length + actionIndex;
    const bucket = index % 10;
    const status: PermissionStatus = bucket === 9 ? "Restricted" : bucket === 8 ? "Inactive" : "Active";
    const environment: Environment = bucket === 9 ? "Development" : bucket >= 7 ? "Staging" : "Production";
    const scope: PermissionScope = bucket === 8 ? "System" : bucket === 9 ? "Action" : bucket >= 5 ? "Resource" : "Module";
    return {
      id: `${module}-${action}`.toLowerCase().replace(/\s+/g, "-"),
      module,
      action,
      status,
      resourceType: ACTION_RESOURCE_TYPE[action],
      permissionType: SYSTEM_MODULES.has(module) ? "System" : "Custom",
      environment,
      ownerRole: MODULE_OWNER_ROLE[module],
      scope,
    };
  }),
);

function formatRoleLabel(role: Role): string {
  return role
    .split("_")
    .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
    .join(" ");
}

function permissionLabel(permission: PermissionEntry): string {
  return `${permission.action} ${permission.module}`;
}

function permissionCode(permission: PermissionEntry): string {
  return `${permission.module}_${permission.action}`.toUpperCase().replace(/[^A-Z]+/g, "_");
}

const ROLE_OPTIONS = Array.from(new Set(Object.values(MODULE_OWNER_ROLE))).map((role) => formatRoleLabel(role));
const RESOURCE_TYPE_OPTIONS: ResourceType[] = ["Record", "Data Transfer", "Workflow", "Access Control"];
const PERMISSION_TYPE_OPTIONS: PermissionType[] = ["System", "Custom"];
const ENVIRONMENT_OPTIONS: Environment[] = ["Production", "Staging", "Development"];
const STATUS_OPTIONS: PermissionStatus[] = ["Active", "Inactive", "Restricted"];
const SORT_OPTIONS = ["Module (A-Z)", "Module (Z-A)", "Most Restricted First", "Most Active First"];
const ROWS_PER_PAGE = 10;

const STATUS_STYLES: Record<PermissionStatus, { dot: string; pill: string }> = {
  Active: { dot: "bg-green-500", pill: "border-green-200 bg-green-50 text-green-700" },
  Inactive: { dot: "bg-gray-400", pill: "border-gray-200 bg-gray-50 text-gray-500" },
  Restricted: { dot: "bg-amber-500", pill: "border-amber-200 bg-amber-50 text-amber-700" },
};

const SCOPE_COLORS: Record<PermissionScope, string> = {
  System: "#3B82F6",
  Module: "#22C55E",
  Resource: "#F59E0B",
  Action: "#7C3AED",
};

const inputClass =
  "w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-700 outline-none " +
  "focus:outline-none focus:ring-2 focus:ring-[#232B2B] focus:border-transparent placeholder:text-gray-300 " +
  "transition-all duration-200";
const labelClass = "mb-1.5 block text-xs font-medium uppercase tracking-wide text-gray-500";
const panelHeaderClass = "border-b border-gray-100 px-5 py-4";
const panelTitleClass = "text-xs font-semibold uppercase tracking-widest text-gray-500";

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

function StatusPill({ status }: { status: PermissionStatus }): React.JSX.Element {
  const style = STATUS_STYLES[status];
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium", style.pill)}>
      <span className={cn("h-1.5 w-1.5 rounded-full", style.dot)} />
      {status}
    </span>
  );
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
      <CustomSelect id={id} value={value} onChange={onChange} options={options} placeholder={placeholder ?? `All ${label.toLowerCase()}`} />
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
  icon: typeof KeyRound;
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

type MatrixAccess = "allowed" | "denied" | "readonly";

interface MatrixPermission {
  name: string;
  access: Record<string, MatrixAccess>;
}

interface MatrixModule {
  module: string;
  permissions: MatrixPermission[];
}

const MATRIX_ROLES = ["SysAdmin", "BranchMgr", "LoanOfficer", "Teller", "Auditor", "Viewer"];

const PERMISSION_MATRIX: MatrixModule[] = [
  {
    module: "Administration",
    permissions: [
      {
        name: "Create User",
        access: { SysAdmin: "allowed", BranchMgr: "allowed", LoanOfficer: "allowed", Teller: "allowed", Auditor: "allowed", Viewer: "denied" },
      },
      {
        name: "Edit User",
        access: { SysAdmin: "allowed", BranchMgr: "allowed", LoanOfficer: "allowed", Teller: "denied", Auditor: "allowed", Viewer: "readonly" },
      },
      {
        name: "Delete User",
        access: { SysAdmin: "allowed", BranchMgr: "denied", LoanOfficer: "denied", Teller: "denied", Auditor: "denied", Viewer: "denied" },
      },
    ],
  },
  {
    module: "User Management",
    permissions: [
      {
        name: "Add User",
        access: { SysAdmin: "allowed", BranchMgr: "allowed", LoanOfficer: "allowed", Teller: "allowed", Auditor: "allowed", Viewer: "denied" },
      },
      {
        name: "Reset Password",
        access: { SysAdmin: "allowed", BranchMgr: "allowed", LoanOfficer: "allowed", Teller: "denied", Auditor: "denied", Viewer: "denied" },
      },
    ],
  },
  {
    module: "Loan Management",
    permissions: [
      {
        name: "Loan Approval",
        access: { SysAdmin: "allowed", BranchMgr: "allowed", LoanOfficer: "allowed", Teller: "denied", Auditor: "allowed", Viewer: "denied" },
      },
      {
        name: "Loan Reject",
        access: { SysAdmin: "allowed", BranchMgr: "allowed", LoanOfficer: "allowed", Teller: "denied", Auditor: "allowed", Viewer: "denied" },
      },
    ],
  },
];

const MATRIX_MODULE_OPTIONS = PERMISSION_MATRIX.map((group) => group.module);

function MatrixAccessIcon({ access }: { access: MatrixAccess }): React.JSX.Element {
  if (access === "allowed") {
    return (
      <span className="inline-flex h-5 w-5 items-center justify-center rounded-full border-2 border-green-500">
        <Check className="h-3.5 w-3.5 text-green-600" strokeWidth={3} />
      </span>
    );
  }
  if (access === "readonly") {
    return <span className="inline-block h-2.5 w-2.5 rounded-full border-2 border-gray-400" />;
  }
  return (
    <span className="inline-flex h-5 w-5 items-center justify-center rounded-full border-2 border-red-400">
      <X className="h-3.5 w-3.5 text-red-500" strokeWidth={3} />
    </span>
  );
}

export default function AdminPermissionsPage(): React.JSX.Element {
  const [search, setSearch] = useState("");
  const [moduleFilter, setModuleFilter] = useState("");
  const [resourceFilter, setResourceFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [permissionTypeFilter, setPermissionTypeFilter] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [environmentFilter, setEnvironmentFilter] = useState("");
  const [sortBy, setSortBy] = useState("");
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const [matrixRoleFilter, setMatrixRoleFilter] = useState("");
  const [matrixModuleFilter, setMatrixModuleFilter] = useState("");
  const [matrixView, setMatrixView] = useState<"matrix" | "list">("matrix");

  const [showAllModules, setShowAllModules] = useState(false);
  const [statusOverrides, setStatusOverrides] = useState<Record<string, PermissionStatus>>({});
  const [page, setPage] = useState(1);
  const [drawerPermission, setDrawerPermission] = useState<PermissionEntry | null>(null);

  const totalPermissions = PERMISSIONS.length;
  const activeCount = PERMISSIONS.filter((permission) => permission.status === "Active").length;
  const inactiveCount = PERMISSIONS.filter((permission) => permission.status === "Inactive").length;
  const restrictedCount = PERMISSIONS.filter((permission) => permission.status === "Restricted").length;
  const customCount = PERMISSIONS.filter((permission) => permission.permissionType === "Custom").length;
  const moduleCount = PERMISSION_MODULES.length;
  const percentOf = (value: number): number =>
    totalPermissions > 0 ? Math.round((value / totalPermissions) * 1000) / 10 : 0;

  const summaryCards: SummaryCardData[] = [
    {
      icon: KeyRound,
      label: "Total Permissions",
      value: totalPermissions,
      caption: "All Permissions",
      sparkline: [150, 165, 172, 180, 188, totalPermissions],
      accent: "#232B2B",
    },
    {
      icon: CheckCircle2,
      label: "Active",
      value: activeCount,
      caption: "Enabled",
      trend: { percent: percentOf(activeCount), direction: "up" },
      sparkline: [120, 128, 135, 140, 148, activeCount],
      accent: "#22C55E",
    },
    {
      icon: PauseCircle,
      label: "Inactive",
      value: inactiveCount,
      caption: "Disabled",
      trend: { percent: percentOf(inactiveCount), direction: "down" },
      sparkline: [26, 24, 22, 21, 20, inactiveCount],
      accent: "#9CA3AF",
    },
    {
      icon: Lock,
      label: "Restricted",
      value: restrictedCount,
      caption: "System Protected",
      trend: { percent: percentOf(restrictedCount), direction: "flat" },
      sparkline: [18, 18, 19, 19, 20, restrictedCount],
      accent: "#F59E0B",
    },
    {
      icon: Package,
      label: "Modules",
      value: moduleCount,
      caption: "Total Modules",
      sparkline: [18, 19, 20, 22, 23, moduleCount],
      accent: "#7C3AED",
    },
  ];

  const scopeSegments: DonutSegment[] = (["System", "Module", "Resource", "Action"] as PermissionScope[]).map((scope) => ({
    label: scope,
    value: PERMISSIONS.filter((permission) => permission.scope === scope).length,
    color: SCOPE_COLORS[scope],
  }));

  const filteredPermissions = useMemo(() => {
    const query = search.trim().toLowerCase();
    const matches = PERMISSIONS.filter((permission) => {
      const matchesSearch =
        !query || permission.module.toLowerCase().includes(query) || permission.action.toLowerCase().includes(query);
      const matchesModule = !moduleFilter || permission.module === moduleFilter;
      const matchesResource = !resourceFilter || permission.resourceType === resourceFilter;
      const status = statusOverrides[permission.id] ?? permission.status;
      const matchesStatus = !statusFilter || status === statusFilter;
      const matchesType = !permissionTypeFilter || permission.permissionType === permissionTypeFilter;
      const matchesRole = !roleFilter || formatRoleLabel(permission.ownerRole) === roleFilter;
      const matchesEnvironment = !environmentFilter || permission.environment === environmentFilter;
      return (
        matchesSearch &&
        matchesModule &&
        matchesResource &&
        matchesStatus &&
        matchesType &&
        matchesRole &&
        matchesEnvironment
      );
    });

    const sorted = [...matches];
    if (sortBy === "Module (A-Z)") sorted.sort((a, b) => a.module.localeCompare(b.module));
    if (sortBy === "Module (Z-A)") sorted.sort((a, b) => b.module.localeCompare(a.module));
    if (sortBy === "Most Restricted First") sorted.sort((a, b) => Number(b.status === "Restricted") - Number(a.status === "Restricted"));
    if (sortBy === "Most Active First") sorted.sort((a, b) => Number(b.status === "Active") - Number(a.status === "Active"));
    if (!sortBy) sorted.sort((a, b) => a.module.localeCompare(b.module) || a.action.localeCompare(b.action));
    return sorted;
  }, [search, moduleFilter, resourceFilter, statusFilter, permissionTypeFilter, roleFilter, environmentFilter, sortBy, statusOverrides]);

  const filterSignature = [
    search,
    moduleFilter,
    resourceFilter,
    statusFilter,
    permissionTypeFilter,
    roleFilter,
    environmentFilter,
    sortBy,
  ].join("|");
  const [prevFilterSignature, setPrevFilterSignature] = useState(filterSignature);
  if (filterSignature !== prevFilterSignature) {
    setPrevFilterSignature(filterSignature);
    setPage(1);
  }

  const totalPages = Math.max(1, Math.ceil(filteredPermissions.length / ROWS_PER_PAGE));
  const clampedPage = Math.min(page, totalPages);
  const startIndex = (clampedPage - 1) * ROWS_PER_PAGE;
  const pagePermissions = filteredPermissions.slice(startIndex, startIndex + ROWS_PER_PAGE);
  const pageNumbers = getPageNumbers(clampedPage, totalPages);

  const handleResetFilters = (): void => {
    setSearch("");
    setModuleFilter("");
    setResourceFilter("");
    setStatusFilter("");
    setPermissionTypeFilter("");
    setRoleFilter("");
    setEnvironmentFilter("");
    setSortBy("");
  };

  const exportPermissions = (permissions: PermissionEntry[]): void => {
    const header = ["Module", "Action", "Status", "Resource Type", "Permission Type", "Owner Role", "Environment"];
    const rows = permissions.map((permission) => [
      permission.module,
      permission.action,
      statusOverrides[permission.id] ?? permission.status,
      permission.resourceType,
      permission.permissionType,
      formatRoleLabel(permission.ownerRole),
      permission.environment,
    ]);
    downloadCsv("permissions.csv", [header, ...rows]);
  };

  const handleExportPermissions = (): void => {
    exportPermissions(filteredPermissions);
    setActionMessage(`Exported ${filteredPermissions.length} permission(s).`);
  };

  const scrollToId = (id: string): void => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const quickActions = [
    {
      label: "Create Permission",
      icon: Plus,
      onClick: () =>
        setActionMessage("Creating custom permissions isn't supported yet — permissions are derived from the fixed role model."),
    },
    { label: "Permission Groups", icon: Users2, onClick: () => scrollToId("permission-groups") },
    { label: "Permission Matrix", icon: KeyRound, onClick: () => scrollToId("permission-matrix") },
    { label: "Bulk Import Permissions", icon: Upload, onClick: () => setActionMessage("Bulk import isn't supported yet.") },
    { label: "Export Permissions", icon: Download, onClick: () => exportPermissions(PERMISSIONS) },
    { label: "Permission Templates", icon: FileStack, onClick: () => setActionMessage("Permission Templates is coming soon.") },
  ];

  const topModules = useMemo(
    () =>
      PERMISSION_MODULES.map((module) => ({
        module,
        total: PERMISSIONS.filter((permission) => permission.module === module).length,
        active: PERMISSIONS.filter((permission) => permission.module === module && permission.status === "Active").length,
      })).sort((a, b) => b.active - a.active),
    [],
  );
  const visibleModules = showAllModules ? topModules : topModules.slice(0, 8);

  const permissionGroups: { label: string; status: "Active" | "Locked"; icon: typeof Lock; onClick: () => void }[] = [
    {
      label: "System Permissions",
      status: "Active",
      icon: Lock,
      onClick: () => {
        setPermissionTypeFilter("System");
        scrollToId("permission-table");
      },
    },
    {
      label: "Module Permissions",
      status: "Active",
      icon: Package,
      onClick: () => setActionMessage("Module Permissions grouping is coming soon."),
    },
    {
      label: "Custom Permissions",
      status: "Active",
      icon: Settings2,
      onClick: () => {
        setPermissionTypeFilter("Custom");
        scrollToId("permission-table");
      },
    },
    {
      label: "Restricted Group",
      status: "Locked",
      icon: ShieldCheck,
      onClick: () => {
        setStatusFilter("Restricted");
        scrollToId("permission-table");
      },
    },
    {
      label: "Branch Permissions",
      status: "Active",
      icon: GitBranch,
      onClick: () => setActionMessage("Branch Permissions grouping is coming soon."),
    },
  ];

  const matrixModules = PERMISSION_MATRIX.filter((group) => !matrixModuleFilter || group.module === matrixModuleFilter);
  const matrixRoles = matrixRoleFilter ? [matrixRoleFilter] : MATRIX_ROLES;

  const openDrawer = (permission: PermissionEntry): void => setDrawerPermission(permission);

  const handleDrawerToggleStatus = (): void => {
    if (!drawerPermission) return;
    const current = statusOverrides[drawerPermission.id] ?? drawerPermission.status;
    const next: PermissionStatus = current === "Inactive" ? "Active" : "Inactive";
    setStatusOverrides((prev) => ({ ...prev, [drawerPermission.id]: next }));
    setActionMessage(`"${permissionLabel(drawerPermission)}" is now ${next}.`);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Permission Management</h1>
          <p className="text-sm text-gray-400">
            {totalPermissions} permissions across {moduleCount} modules
          </p>
        </div>
        <button
          type="button"
          onClick={() =>
            setActionMessage("Creating custom permissions isn't supported yet — permissions are derived from the fixed role model.")
          }
          className="inline-flex items-center gap-2 rounded-full border border-[#ED017F] bg-[#ED017F] px-6 py-2.5
                    text-sm font-semibold text-white transition-all duration-200
                    hover:bg-white hover:text-[#ED017F]"
        >
          <Plus className="h-4 w-4" />
          Create Permission
        </button>
      </div>

      {actionMessage && <p className="text-sm font-medium text-gray-600">{actionMessage}</p>}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {summaryCards.map((card) => (
          <SummaryCard key={card.label} {...card} />
        ))}
      </div>

      <div className="rounded-2xl border border-gray-100 bg-white shadow-sm">
        <div className={panelHeaderClass}>
          <h2 className={panelTitleClass}>Search &amp; Filters</h2>
        </div>
        <div className="p-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-7">
            <div>
              <label htmlFor="search" className={labelClass}>
                Search Permission
              </label>
              <div className="relative">
                <Search className="pointer-events-none absolute inset-y-0 left-3.5 my-auto h-4 w-4 text-gray-400" />
                <input
                  id="search"
                  type="text"
                  placeholder="Search module or permission..."
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  className={cn(inputClass, "pl-10")}
                />
              </div>
            </div>

            <SelectField id="moduleFilter" label="Module" value={moduleFilter} onChange={setModuleFilter} options={PERMISSION_MODULES} />
            <SelectField
              id="resourceFilter"
              label="Resource"
              value={resourceFilter}
              onChange={setResourceFilter}
              options={RESOURCE_TYPE_OPTIONS}
            />
            <SelectField id="statusFilter" label="Status" value={statusFilter} onChange={setStatusFilter} options={STATUS_OPTIONS} />
            <SelectField
              id="permissionTypeFilter"
              label="Permission Type"
              value={permissionTypeFilter}
              onChange={setPermissionTypeFilter}
              options={PERMISSION_TYPE_OPTIONS}
            />
            <SelectField id="roleFilter" label="Role" value={roleFilter} onChange={setRoleFilter} options={ROLE_OPTIONS} />
            <SelectField
              id="environmentFilter"
              label="Environment"
              value={environmentFilter}
              onChange={setEnvironmentFilter}
              options={ENVIRONMENT_OPTIONS}
            />
          </div>

          {showAdvancedFilters && (
            <div className="mt-4 grid grid-cols-1 gap-4 border-t border-gray-100 pt-4 sm:grid-cols-2">
              <SelectField id="sortBy" label="Sort By" value={sortBy} onChange={setSortBy} options={SORT_OPTIONS} placeholder="Default order" />
            </div>
          )}

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <button
              type="button"
              onClick={handleResetFilters}
              className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-5 py-2 text-sm
                        font-medium text-gray-500 transition-colors hover:bg-gray-50 hover:text-gray-700"
            >
              Reset Filters
            </button>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setShowAdvancedFilters((prev) => !prev)}
                className={cn(
                  "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors",
                  showAdvancedFilters
                    ? "border-[#ED017F] bg-[#ED017F] text-white"
                    : "border-gray-200 text-gray-600 hover:bg-gray-50",
                )}
              >
                <SlidersHorizontal className="h-4 w-4" />
                Advanced Filters
              </button>
              <button
                type="button"
                onClick={handleExportPermissions}
                className="inline-flex items-center gap-2 rounded-full border border-[#ED017F] bg-[#ED017F] px-5 py-2
                          text-sm font-semibold text-white transition-all duration-200
                          hover:bg-white hover:text-[#ED017F]"
              >
                <FileSpreadsheet className="h-4 w-4" />
                Export Permissions
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[320px_1fr]">
        <div className="flex flex-col gap-6">
          <div className="rounded-2xl border border-gray-100 bg-white shadow-sm">
            <div className={panelHeaderClass}>
              <h2 className={panelTitleClass}>Permission Overview</h2>
            </div>
            <div className="flex flex-col items-center gap-5 px-5 py-6">
              <DonutChart segments={scopeSegments} total={totalPermissions} />
              <ul className="flex w-full flex-col gap-2 text-sm">
                {scopeSegments.map((segment) => (
                  <li key={segment.label} className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-gray-600">
                      <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: segment.color }} />
                      {segment.label}
                    </span>
                    <span className="font-medium text-gray-800">
                      {segment.value}
                      {totalPermissions > 0 ? ` (${Math.round((segment.value / totalPermissions) * 100)}%)` : ""}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div id="permission-groups-anchor" className="rounded-2xl border border-gray-100 bg-white shadow-sm">
            <div className={panelHeaderClass}>
              <h2 className={panelTitleClass}>Quick Actions</h2>
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

        <div id="permission-matrix" className="rounded-2xl border border-gray-100 bg-white shadow-sm">
          <div className={panelHeaderClass}>
            <h2 className={panelTitleClass}>Permission Matrix</h2>
          </div>
          <div className="flex flex-wrap items-center gap-4 border-b border-gray-100 px-5 py-4">
            <div className="w-48">
              <SelectField id="matrixRole" label="Role" value={matrixRoleFilter} onChange={setMatrixRoleFilter} options={MATRIX_ROLES} placeholder="All Roles" />
            </div>
            <div className="w-56">
              <SelectField
                id="matrixModule"
                label="Module"
                value={matrixModuleFilter}
                onChange={setMatrixModuleFilter}
                options={MATRIX_MODULE_OPTIONS}
                placeholder="All Modules"
              />
            </div>
            <label className="mt-5 flex items-center gap-2 text-sm text-gray-600">
              <input
                type="checkbox"
                checked={matrixView === "matrix"}
                onChange={() => setMatrixView("matrix")}
                className="h-4 w-4 rounded border-gray-300 text-[#232B2B] focus:ring-[#232B2B]"
              />
              Matrix View
            </label>
            <label className="mt-5 flex items-center gap-2 text-sm text-gray-600">
              <input
                type="checkbox"
                checked={matrixView === "list"}
                onChange={() => setMatrixView("list")}
                className="h-4 w-4 rounded border-gray-300 text-[#232B2B] focus:ring-[#232B2B]"
              />
              List View
            </label>
            <button
              type="button"
              onClick={() => setActionMessage("Matrix refreshed.")}
              className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 transition-colors hover:text-gray-700"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Refresh
            </button>
          </div>

          {matrixView === "matrix" ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-gray-400">Module / Permission</th>
                    {matrixRoles.map((role) => (
                      <th key={role} className="px-3 py-3 text-center text-xs font-medium uppercase tracking-wide text-gray-400">
                        {role}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {matrixModules.map((group) => (
                    <Fragment key={group.module}>
                      <tr className="bg-gray-50">
                        <td colSpan={matrixRoles.length + 1} className="px-4 py-2 text-xs font-bold uppercase tracking-wide text-gray-500">
                          {group.module}
                        </td>
                      </tr>
                      {group.permissions.map((permission) => (
                        <tr key={`${group.module}-${permission.name}`} className="border-b border-gray-50">
                          <td className="px-4 py-2.5 pl-8 text-gray-700">{permission.name}</td>
                          {matrixRoles.map((role) => (
                            <td key={role} className="px-3 py-2.5 text-center">
                              <span className="inline-flex items-center justify-center">
                                <MatrixAccessIcon access={permission.access[role]} />
                              </span>
                            </td>
                          ))}
                        </tr>
                      ))}
                    </Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="flex flex-col divide-y divide-gray-50 px-5">
              {matrixModules.flatMap((group) =>
                group.permissions.map((permission) => {
                  const allowedRoles = matrixRoles.filter((role) => permission.access[role] === "allowed");
                  return (
                    <div key={`${group.module}-${permission.name}`} className="flex items-center justify-between py-3 text-sm">
                      <div className="flex flex-col">
                        <span className="font-medium text-gray-800">{permission.name}</span>
                        <span className="text-xs text-gray-400">{group.module}</span>
                      </div>
                      <span className="text-xs text-gray-500">
                        {allowedRoles.length > 0 ? allowedRoles.join(", ") : "No roles allowed"}
                      </span>
                    </div>
                  );
                }),
              )}
            </div>
          )}

          <div className="border-t border-gray-100 px-5 py-3 text-xs text-gray-400">
            Legend:
            <span className="ml-2 inline-flex items-center gap-1.5">
              <MatrixAccessIcon access="allowed" /> Allowed
            </span>
            <span className="ml-3 inline-flex items-center gap-1.5">
              <MatrixAccessIcon access="denied" /> Denied
            </span>
            <span className="ml-3 inline-flex items-center gap-1.5">
              <MatrixAccessIcon access="readonly" /> Read Only
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-gray-100 bg-white shadow-sm">
          <div className={panelHeaderClass}>
            <h2 className={panelTitleClass}>Permission Modules</h2>
          </div>
          <div className="flex flex-col p-2">
            {visibleModules.map(({ module, total }) => {
              const Icon = MODULE_ICON[module] ?? Package;
              return (
                <button
                  key={module}
                  type="button"
                  onClick={() => {
                    setModuleFilter(module);
                    scrollToId("permission-table");
                  }}
                  className="flex items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-800"
                >
                  <span className="flex items-center gap-2.5">
                    <Icon className="h-4 w-4 text-gray-400" />
                    {module}
                  </span>
                  <span className="text-xs text-gray-400">({total})</span>
                </button>
              );
            })}
          </div>
          <div className="border-t border-gray-100 p-3">
            <button
              type="button"
              onClick={() => setShowAllModules((prev) => !prev)}
              className="w-full rounded-xl px-3 py-2 text-center text-sm font-medium text-[#ED017F] transition-colors hover:bg-gray-50"
            >
              {showAllModules ? "Show Fewer Modules" : "View All Modules"}
            </button>
          </div>
        </div>

        <div id="permission-groups" className="rounded-2xl border border-gray-100 bg-white shadow-sm">
          <div className={panelHeaderClass}>
            <h2 className={panelTitleClass}>Permission Groups</h2>
          </div>
          <div className="flex flex-col p-2">
            {permissionGroups.map((group) => (
              <button
                key={group.label}
                type="button"
                onClick={group.onClick}
                className="flex items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-800"
              >
                <span className="flex items-center gap-2.5">
                  <group.icon className="h-4 w-4 text-gray-400" />
                  {group.label}
                </span>
                <span
                  className={cn(
                    "inline-flex rounded-full px-2.5 py-1 text-xs font-medium",
                    group.status === "Active" ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-500",
                  )}
                >
                  {group.status}
                </span>
              </button>
            ))}
          </div>
          <div className="border-t border-gray-100 p-3">
            <button
              type="button"
              onClick={() => setActionMessage("Manage Groups is coming soon.")}
              className="w-full rounded-xl px-3 py-2 text-center text-sm font-medium text-[#ED017F] transition-colors hover:bg-gray-50"
            >
              Manage Groups
            </button>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white shadow-sm">
          <div className={panelHeaderClass}>
            <h2 className={panelTitleClass}>Permission Summary</h2>
          </div>
          <div className="flex flex-col gap-2 p-5 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-gray-500">Total Permissions</span>
              <span className="font-semibold text-gray-800">{totalPermissions}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-500">Active Permissions</span>
              <span className="font-semibold text-gray-800">{activeCount}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-500">Inactive Permissions</span>
              <span className="font-semibold text-gray-800">{inactiveCount}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-500">Restricted Permissions</span>
              <span className="font-semibold text-gray-800">{restrictedCount}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-500">Custom Permissions</span>
              <span className="font-semibold text-gray-800">{customCount}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-500">Last Updated</span>
              <span className="font-semibold text-gray-800">Today</span>
            </div>
          </div>
          <div className="border-t border-gray-100 p-3">
            <button
              type="button"
              onClick={() => setActionMessage("Full summary report is coming soon.")}
              className="w-full rounded-xl px-3 py-2 text-center text-sm font-medium text-[#ED017F] transition-colors hover:bg-gray-50"
            >
              View Full Summary
            </button>
          </div>
        </div>
      </div>

      <div id="permission-table" className="rounded-2xl border border-gray-100 bg-white shadow-sm">
        <div className={panelHeaderClass}>
          <h2 className={panelTitleClass}>All Permissions</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-gray-400">Permission</th>
                <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-gray-400">Module</th>
                <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-gray-400">Type</th>
                <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-gray-400">Role</th>
                <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-gray-400">Environment</th>
                <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-gray-400">Status</th>
                <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody>
              {pagePermissions.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-6 text-center text-sm text-gray-400">
                    No permissions found.
                  </td>
                </tr>
              )}
              {pagePermissions.map((permission, index) => {
                const status = statusOverrides[permission.id] ?? permission.status;
                return (
                  <tr key={permission.id} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                    <td className="px-4 py-3 font-medium text-gray-800">{permissionLabel(permission)}</td>
                    <td className="px-4 py-3 text-gray-600">{permission.module}</td>
                    <td className="px-4 py-3 text-gray-600">{permission.permissionType}</td>
                    <td className="px-4 py-3 text-gray-600">{formatRoleLabel(permission.ownerRole)}</td>
                    <td className="px-4 py-3 text-gray-600">{permission.environment}</td>
                    <td className="px-4 py-3">
                      <StatusPill status={status} />
                    </td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => openDrawer(permission)}
                        aria-label="View permission details"
                        className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 px-5 py-4">
          <p className="text-sm text-gray-500">
            Showing {filteredPermissions.length === 0 ? 0 : startIndex + 1}–{Math.min(startIndex + ROWS_PER_PAGE, filteredPermissions.length)} of{" "}
            {filteredPermissions.length} Permissions
          </p>

          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled={clampedPage === 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="rounded-full p-1.5 text-gray-400 transition-colors hover:bg-gray-100 disabled:pointer-events-none disabled:opacity-40"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            {pageNumbers.map((pageNumber, index) =>
              pageNumber === "..." ? (
                <span key={`ellipsis-${index}`} className="px-2 text-sm text-gray-400">
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
              className="rounded-full p-1.5 text-gray-400 transition-colors hover:bg-gray-100 disabled:pointer-events-none disabled:opacity-40"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {drawerPermission && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/40" onClick={() => setDrawerPermission(null)} />
          <div className="absolute inset-y-0 right-0 flex w-full max-w-md flex-col bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
              <h2 className="text-sm font-semibold text-gray-800">Permission Details</h2>
              <button
                type="button"
                onClick={() => setDrawerPermission(null)}
                aria-label="Close"
                className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-5">
              <dl className="flex flex-col gap-3 text-sm">
                {[
                  ["Permission Name", permissionLabel(drawerPermission)],
                  ["Permission Code", permissionCode(drawerPermission)],
                  ["Module", drawerPermission.module],
                  ["Resource", drawerPermission.resourceType],
                  ["Action", drawerPermission.action],
                  ["Type", `${drawerPermission.permissionType} Permission`],
                  [
                    "Assigned Roles",
                    Array.from(new Set([formatRoleLabel("SYSTEM_ADMIN"), formatRoleLabel(drawerPermission.ownerRole)])).join(", "),
                  ],
                  ["Created By", "Administrator"],
                  ["Created Date", "15-May-2026"],
                  ["Last Updated", "Today"],
                  ["Audit Trail", `${drawerPermission.action.length + drawerPermission.module.length} Changes`],
                ].map(([label, value]) => (
                  <div key={label} className="flex items-center justify-between gap-3 border-b border-gray-50 pb-3">
                    <dt className="text-xs font-medium uppercase tracking-wide text-gray-400">{label}</dt>
                    <dd className="text-right font-medium text-gray-800">{value}</dd>
                  </div>
                ))}
                <div className="flex items-center justify-between gap-3 pb-3">
                  <dt className="text-xs font-medium uppercase tracking-wide text-gray-400">Status</dt>
                  <dd>
                    <StatusPill status={statusOverrides[drawerPermission.id] ?? drawerPermission.status} />
                  </dd>
                </div>
              </dl>
            </div>

            <div className="flex flex-wrap gap-2 border-t border-gray-100 px-6 py-4">
              <button
                type="button"
                onClick={() => setActionMessage(`Editing "${permissionLabel(drawerPermission)}" isn't supported yet.`)}
                className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50"
              >
                Edit
              </button>
              <button
                type="button"
                onClick={() => setActionMessage(`Cloning "${permissionLabel(drawerPermission)}" isn't supported yet.`)}
                className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50"
              >
                Clone
              </button>
              <button
                type="button"
                onClick={handleDrawerToggleStatus}
                className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50"
              >
                {(statusOverrides[drawerPermission.id] ?? drawerPermission.status) === "Inactive" ? "Enable" : "Disable"}
              </button>
              <button
                type="button"
                onClick={() =>
                  setActionMessage(`"${permissionLabel(drawerPermission)}" is derived from the fixed role model and can't be deleted.`)
                }
                className="rounded-xl border border-red-200 px-4 py-2 text-sm font-medium text-red-500 transition-colors hover:bg-red-50"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
