"use client";

import { useMemo, useState } from "react";
import {
  Building2,
  Landmark,
  Users2,
  Plus,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Search,
  ArrowUp,
  ArrowDown,
  SlidersHorizontal,
  FileSpreadsheet,
  Eye,
  Pencil,
  Wallet,
  Trash2,
  X,
  Table2,
  ListTree,
} from "lucide-react";
import { CustomSelect } from "@/components/common/CustomSelect";
import { cn } from "@/lib/utils";

type DeptStatus = "Active" | "Inactive";

interface Department {
  code: string;
  name: string;
  division: string;
  head: string;
  employees: number;
  status: DeptStatus;
  budget: number;
  costCenter: string;
  officeLocation: string;
  branchCoverage: string;
  activeProjects: number;
  kpiScore: number;
  lastReview: string;
}

const DIVISIONS = ["Business", "Operations", "Support", "Risk & Compliance", "Finance & Treasury", "Human Capital"];

const DIVISION_TOTALS: Record<string, number> = {
  Business: 10,
  Operations: 9,
  Support: 8,
  "Risk & Compliance": 7,
  "Finance & Treasury": 7,
  "Human Capital": 7,
};

const DIVISION_EXTRA_NAMES: Record<string, string[]> = {
  Business: ["Branch Sales", "SME Banking", "Trade Finance", "Wealth Management", "Digital Banking", "Card Services", "Deposit Products", "Customer Relations"],
  Operations: ["Credit Operations", "Compliance Monitoring", "Collections", "Documentation", "Settlement", "Reconciliation", "Process Improvement"],
  Support: ["Human Resources", "Finance & Accounts", "Legal Affairs", "Facilities", "Procurement", "Marketing", "Customer Support"],
  "Risk & Compliance": ["Credit Risk", "Market Risk", "Operational Risk", "AML Compliance", "Regulatory Affairs", "Internal Audit", "Fraud Prevention"],
  "Finance & Treasury": ["Treasury Operations", "Financial Planning", "Tax & Accounting", "Investor Relations", "Budget Control", "Asset Liability Management", "Financial Reporting"],
  "Human Capital": ["Talent Acquisition", "Learning & Development", "Compensation & Benefits", "Employee Relations", "HR Operations", "Organizational Development", "HR Analytics"],
};

const NAMED_DEPARTMENTS: Record<string, { name: string; head: string; employees: number; budget: number }[]> = {
  Business: [
    { name: "Retail Banking", head: "Mohammad Arif", employees: 245, budget: 40 },
    { name: "Corporate Banking", head: "Farhana Islam", employees: 186, budget: 52 },
  ],
  Operations: [
    { name: "Loan Operations", head: "Rashed Karim", employees: 152, budget: 18 },
    { name: "Risk Management", head: "Sharmin Akter", employees: 98, budget: 10 },
  ],
  Support: [{ name: "IT Services", head: "Imran Hossain", employees: 120, budget: 30 }],
};

const HEAD_POOL = [
  "Nasrin Sultana",
  "Kabir Hossain",
  "Ruma Chowdhury",
  "Aminul Islam",
  "Shirin Akhter",
  "Faruk Ahmed",
  "Tania Rahman",
  "Zahid Hasan",
  "Mitu Begum",
  "Anisur Rahman",
  "Kohinoor Begum",
  "Delwar Hossain",
];

const OFFICE_LOCATIONS = ["Head Office", "Regional Office", "Branch Office"];
const BRANCH_COVERAGE = ["All Branches", "Dhaka Branches", "Regional Branches", "N/A"];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function reviewDate(index: number): string {
  const day = (index % 27) + 1;
  const month = MONTHS[index % 12];
  return `${String(day).padStart(2, "0")}-${month}-2026`;
}

let sequence = 0;
function nextDepartmentCode(): string {
  sequence += 1;
  return `DEP${String(sequence).padStart(3, "0")}`;
}

const DEPARTMENTS: Department[] = DIVISIONS.flatMap((division, divisionIndex) => {
  const named = (NAMED_DEPARTMENTS[division] ?? []).map((entry) => ({ ...entry, generated: false }));
  const extraNeeded = DIVISION_TOTALS[division] - named.length;
  const extraNames = DIVISION_EXTRA_NAMES[division];
  const generated = Array.from({ length: extraNeeded }, (_, i) => ({
    name: extraNames[i % extraNames.length],
    head: HEAD_POOL[(divisionIndex * 8 + i) % HEAD_POOL.length],
    employees: 20 + ((divisionIndex * 8 + i) * 7) % 80,
    budget: 3 + ((divisionIndex * 8 + i) * 2) % 15,
    generated: true,
  }));

  return [...named, ...generated].map((entry, i) => {
    const globalIndex = divisionIndex * 10 + i;
    const code = nextDepartmentCode();
    const status: DeptStatus = globalIndex % 12 === 11 ? "Inactive" : "Active";
    const isLoanOperations = entry.name === "Loan Operations";
    return {
      code,
      name: entry.name,
      division,
      head: entry.head,
      employees: entry.employees,
      status,
      budget: entry.budget,
      costCenter: isLoanOperations ? "CC-2103" : `CC-${2000 + globalIndex * 17}`,
      officeLocation: isLoanOperations ? "Head Office" : OFFICE_LOCATIONS[globalIndex % OFFICE_LOCATIONS.length],
      branchCoverage: isLoanOperations ? "All Branches" : BRANCH_COVERAGE[globalIndex % BRANCH_COVERAGE.length],
      activeProjects: isLoanOperations ? 8 : 1 + (globalIndex % 10),
      kpiScore: isLoanOperations ? 94 : 75 + (globalIndex % 20),
      lastReview: isLoanOperations ? "12-Jun-2026" : reviewDate(globalIndex),
    };
  });
});

const HEAD_OPTIONS = Array.from(new Set(DEPARTMENTS.map((department) => department.head))).sort();
const DEPARTMENT_NAME_OPTIONS = DEPARTMENTS.map((department) => department.name).sort();
const COST_CENTER_OPTIONS = Array.from(new Set(DEPARTMENTS.map((department) => department.costCenter))).sort();
const STATUS_OPTIONS: DeptStatus[] = ["Active", "Inactive"];
const SORT_OPTIONS = ["Name (A-Z)", "Name (Z-A)", "Most Employees", "Fewest Employees", "Highest Budget", "Lowest Budget"];
const ROWS_PER_PAGE_OPTIONS = [5, 10, 25, 50];

const inputClass =
  "w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-700 outline-none " +
  "focus:outline-none focus:ring-2 focus:ring-[#232B2B] focus:border-transparent placeholder:text-gray-300 " +
  "transition-all duration-200";
const selectClass =
  "w-full appearance-none cursor-pointer rounded-xl border border-gray-200 bg-white py-2.5 pl-3 pr-9 text-sm text-gray-700 " +
  "outline-none focus:outline-none focus:ring-2 focus:ring-[#232B2B] focus:border-transparent transition-all duration-200";
const labelClass = "mb-1.5 block text-xs font-medium uppercase tracking-wide text-gray-500";
const panelHeaderClass = "border-b border-gray-100 px-5 py-4";
const panelTitleClass = "text-xs font-semibold uppercase tracking-widest text-gray-500";
const actionButtonClass = "rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600";

function formatBudget(budget: number): string {
  return `BDT ${budget}M`;
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

function StatusPill({ status }: { status: DeptStatus }): React.JSX.Element {
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
  icon: typeof Building2;
  label: string;
  value: number | string;
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

function DepartmentDetailDrawer({
  department,
  onClose,
  onAction,
}: {
  department: Department;
  onClose: () => void;
  onAction: (label: string) => void;
}): React.JSX.Element {
  const rows: [string, string][] = [
    ["Department Code", department.code],
    ["Department Name", department.name],
    ["Division", department.division],
    ["Department Head", department.head],
    ["Cost Center", department.costCenter],
    ["Employees", String(department.employees)],
    ["Budget", `${formatBudget(department.budget)} (${department.budget} Million)`],
    ["Office Location", department.officeLocation],
    ["Branch Coverage", department.branchCoverage],
    ["Projects", `${department.activeProjects} Active`],
    ["KPI Score", `${department.kpiScore}%`],
    ["Last Review", department.lastReview],
  ];

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="absolute inset-y-0 right-0 flex w-full max-w-md flex-col bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <h2 className="text-sm font-semibold text-gray-800">Department Details</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          <dl className="flex flex-col gap-3 text-sm">
            {rows.map(([label, value]) => (
              <div key={label} className="flex items-center justify-between gap-3 border-b border-gray-50 pb-3">
                <dt className="text-xs font-medium uppercase tracking-wide text-gray-400">{label}</dt>
                <dd className="text-right font-medium text-gray-800">{value}</dd>
              </div>
            ))}
            <div className="flex items-center justify-between gap-3">
              <dt className="text-xs font-medium uppercase tracking-wide text-gray-400">Status</dt>
              <dd>
                <StatusPill status={department.status} />
              </dd>
            </div>
          </dl>
        </div>

        <div className="flex flex-wrap gap-2 border-t border-gray-100 px-6 py-4">
          {["Edit", "Transfer Head", "Budget", "Archive"].map((action) => (
            <button
              key={action}
              type="button"
              onClick={() => onAction(action)}
              className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50"
            >
              {action}
            </button>
          ))}
          <button
            type="button"
            onClick={() => onAction("Delete")}
            className="rounded-xl border border-red-200 px-4 py-2 text-sm font-medium text-red-500 transition-colors hover:bg-red-50"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminDepartmentsPage(): React.JSX.Element {
  const [search, setSearch] = useState("");
  const [divisionFilter, setDivisionFilter] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [headFilter, setHeadFilter] = useState("");
  const [costCenterFilter, setCostCenterFilter] = useState("");
  const [sortBy, setSortBy] = useState("");
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const [viewMode, setViewMode] = useState<"table" | "tree">("table");
  const [bulkAction, setBulkAction] = useState("");
  const [selectedDepartments, setSelectedDepartments] = useState<Set<string>>(new Set());
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const totalDepartments = DEPARTMENTS.length;
  const totalEmployees = DEPARTMENTS.reduce((sum, department) => sum + department.employees, 0);

  const summaryCards: SummaryCardData[] = [
    {
      icon: Building2,
      label: "Total Departments",
      value: totalDepartments,
      caption: "All Departments",
      sparkline: [38, 40, 43, 45, 46, totalDepartments],
      accent: "#232B2B",
    },
    {
      icon: Landmark,
      label: "Divisions",
      value: DIVISIONS.length,
      caption: "Organization Units",
      sparkline: [4, 5, 5, 6, 6, DIVISIONS.length],
      accent: "#3B82F6",
    },
    {
      icon: Users2,
      label: "Employees",
      value: totalEmployees.toLocaleString(),
      caption: "Across Departments",
      sparkline: [1000, 1080, 1150, 1200, 1230, totalEmployees],
      accent: "#7C3AED",
    },
  ];

  const divisionColors: Record<string, string> = {
    Business: "#3B82F6",
    Operations: "#22C55E",
    Support: "#F59E0B",
    "Risk & Compliance": "#EF4444",
    "Finance & Treasury": "#7C3AED",
    "Human Capital": "#EC4899",
  };
  const divisionSegments: DonutSegment[] = DIVISIONS.map((division) => ({
    label: division,
    value: DEPARTMENTS.filter((department) => department.division === division).length,
    color: divisionColors[division],
  }));

  const filteredDepartments = useMemo(() => {
    const query = search.trim().toLowerCase();
    const matches = DEPARTMENTS.filter((department) => {
      const matchesSearch = !query || department.name.toLowerCase().includes(query) || department.code.toLowerCase().includes(query);
      const matchesDivision = !divisionFilter || department.division === divisionFilter;
      const matchesDepartment = !departmentFilter || department.name === departmentFilter;
      const matchesStatus = !statusFilter || department.status === statusFilter;
      const matchesHead = !headFilter || department.head === headFilter;
      const matchesCostCenter = !costCenterFilter || department.costCenter === costCenterFilter;
      return matchesSearch && matchesDivision && matchesDepartment && matchesStatus && matchesHead && matchesCostCenter;
    });

    const sorted = [...matches];
    if (sortBy === "Name (A-Z)") sorted.sort((a, b) => a.name.localeCompare(b.name));
    if (sortBy === "Name (Z-A)") sorted.sort((a, b) => b.name.localeCompare(a.name));
    if (sortBy === "Most Employees") sorted.sort((a, b) => b.employees - a.employees);
    if (sortBy === "Fewest Employees") sorted.sort((a, b) => a.employees - b.employees);
    if (sortBy === "Highest Budget") sorted.sort((a, b) => b.budget - a.budget);
    if (sortBy === "Lowest Budget") sorted.sort((a, b) => a.budget - b.budget);
    return sorted;
  }, [search, divisionFilter, departmentFilter, statusFilter, headFilter, costCenterFilter, sortBy]);

  const filterSignature = [search, divisionFilter, departmentFilter, statusFilter, headFilter, costCenterFilter, sortBy, rowsPerPage].join(
    "|",
  );
  const [prevFilterSignature, setPrevFilterSignature] = useState(filterSignature);
  if (filterSignature !== prevFilterSignature) {
    setPrevFilterSignature(filterSignature);
    setPage(1);
  }

  const totalPages = Math.max(1, Math.ceil(filteredDepartments.length / rowsPerPage));
  const clampedPage = Math.min(page, totalPages);
  const startIndex = (clampedPage - 1) * rowsPerPage;
  const pageDepartments = filteredDepartments.slice(startIndex, startIndex + rowsPerPage);
  const pageNumbers = getPageNumbers(clampedPage, totalPages);

  const handleResetFilters = (): void => {
    setSearch("");
    setDivisionFilter("");
    setDepartmentFilter("");
    setStatusFilter("");
    setHeadFilter("");
    setCostCenterFilter("");
    setSortBy("");
  };

  const exportDepartments = (departments: Department[]): void => {
    const header = ["Code", "Department", "Division", "Head", "Employees", "Status", "Budget", "Cost Center"];
    const rows = departments.map((department) => [
      department.code,
      department.name,
      department.division,
      department.head,
      String(department.employees),
      department.status,
      formatBudget(department.budget),
      department.costCenter,
    ]);
    downloadCsv("departments.csv", [header, ...rows]);
  };

  const handleExportDepartments = (): void => {
    exportDepartments(filteredDepartments);
    setActionMessage(`Exported ${filteredDepartments.length} department(s).`);
  };

  const allSelected = pageDepartments.length > 0 && pageDepartments.every((department) => selectedDepartments.has(department.code));
  const toggleSelectAll = (): void => {
    setSelectedDepartments((prev) => {
      const next = new Set(prev);
      if (allSelected) pageDepartments.forEach((department) => next.delete(department.code));
      else pageDepartments.forEach((department) => next.add(department.code));
      return next;
    });
  };
  const toggleSelectDepartment = (code: string): void => {
    setSelectedDepartments((prev) => {
      const next = new Set(prev);
      if (next.has(code)) next.delete(code);
      else next.add(code);
      return next;
    });
  };

  const handleBulkAction = (value: string): void => {
    setBulkAction("");
    if (!value) return;
    const selected = DEPARTMENTS.filter((department) => selectedDepartments.has(department.code));
    if (selected.length === 0) {
      setActionMessage("Select at least one department first.");
      return;
    }
    if (value === "Export Selected") {
      exportDepartments(selected);
      setActionMessage(`Exported ${selected.length} department(s).`);
      return;
    }
    setActionMessage(`${value} for ${selected.length} department(s) isn't supported yet.`);
  };

  const handleDrawerAction = (action: string): void => {
    if (!selectedDepartment) return;
    if (action === "Delete") {
      setActionMessage(`"${selectedDepartment.name}" is derived from a fixed dataset and can't be deleted.`);
      return;
    }
    setActionMessage(`${action} for "${selectedDepartment.name}" isn't supported yet.`);
  };

  const rowActionMessage = (action: string, department: Department): void =>
    setActionMessage(`${action} for "${department.name}" isn't supported yet.`);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Department Management</h1>
          <p className="text-sm text-gray-400">
            {totalDepartments} departments across {DIVISIONS.length} divisions
          </p>
        </div>
        <button
          type="button"
          onClick={() =>
            setActionMessage("Creating departments isn't supported yet — department data is derived from a fixed dataset.")
          }
          className="inline-flex items-center gap-2 rounded-full border border-[#ED017F] bg-[#ED017F] px-6 py-2.5
                    text-sm font-semibold text-white transition-all duration-200
                    hover:bg-white hover:text-[#ED017F]"
        >
          <Plus className="h-4 w-4" />
          Create Department
        </button>
      </div>

      {actionMessage && <p className="text-sm font-medium text-gray-600">{actionMessage}</p>}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {summaryCards.map((card) => (
          <SummaryCard key={card.label} {...card} />
        ))}
      </div>

      <div className="rounded-2xl border border-gray-100 bg-white shadow-sm">
        <div className={panelHeaderClass}>
          <h2 className={panelTitleClass}>Search &amp; Filters</h2>
        </div>
        <div className="p-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-6">
            <div>
              <label htmlFor="search" className={labelClass}>
                Search Department
              </label>
              <div className="relative">
                <Search className="pointer-events-none absolute inset-y-0 left-3.5 my-auto h-4 w-4 text-gray-400" />
                <input
                  id="search"
                  type="text"
                  placeholder="Search by name or code..."
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  className={cn(inputClass, "pl-10")}
                />
              </div>
            </div>

            <SelectField id="divisionFilter" label="Division" value={divisionFilter} onChange={setDivisionFilter} options={DIVISIONS} />
            <SelectField
              id="departmentFilter"
              label="Department"
              value={departmentFilter}
              onChange={setDepartmentFilter}
              options={DEPARTMENT_NAME_OPTIONS}
            />
            <SelectField id="statusFilter" label="Status" value={statusFilter} onChange={setStatusFilter} options={STATUS_OPTIONS} />
            <SelectField id="headFilter" label="Head" value={headFilter} onChange={setHeadFilter} options={HEAD_OPTIONS} />
            <SelectField
              id="costCenterFilter"
              label="Cost Center"
              value={costCenterFilter}
              onChange={setCostCenterFilter}
              options={COST_CENTER_OPTIONS}
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
                onClick={handleExportDepartments}
                className="inline-flex items-center gap-2 rounded-full border border-[#ED017F] bg-[#ED017F] px-5 py-2
                          text-sm font-semibold text-white transition-all duration-200
                          hover:bg-white hover:text-[#ED017F]"
              >
                <FileSpreadsheet className="h-4 w-4" />
                Export Departments
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[320px_1fr]">
        <div className="rounded-2xl border border-gray-100 bg-white shadow-sm">
          <div className={panelHeaderClass}>
            <h2 className={panelTitleClass}>Department Overview</h2>
          </div>
          <div className="flex flex-col items-center gap-5 px-5 py-6">
            <DonutChart segments={divisionSegments} total={totalDepartments} />
            <ul className="flex w-full flex-col gap-2 text-sm">
              {divisionSegments.map((segment) => (
                <li key={segment.label} className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-gray-600">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: segment.color }} />
                    {segment.label}
                  </span>
                  <span className="font-medium text-gray-800">{segment.value}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div id="department-directory" className="rounded-2xl border border-gray-100 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
            <h2 className={panelTitleClass}>Department Directory</h2>
            <span className="text-xs text-gray-400">
              Showing {filteredDepartments.length} of {totalDepartments} departments
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
                    <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-gray-400">Code</th>
                    <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-gray-400">Department</th>
                    <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-gray-400">Division</th>
                    <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-gray-400">Head</th>
                    <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-gray-400">Employees</th>
                    <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-gray-400">Status</th>
                    <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-gray-400">Budget</th>
                    <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-gray-400">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pageDepartments.length === 0 && (
                    <tr>
                      <td colSpan={9} className="px-4 py-6 text-center text-sm text-gray-400">
                        No departments found.
                      </td>
                    </tr>
                  )}
                  {pageDepartments.map((department, index) => (
                    <tr key={department.code} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={selectedDepartments.has(department.code)}
                          onChange={() => toggleSelectDepartment(department.code)}
                          className="h-4 w-4 rounded border-gray-300 text-[#232B2B] focus:ring-[#232B2B]"
                        />
                      </td>
                      <td className="px-4 py-3 font-medium text-gray-800">{department.code}</td>
                      <td className="px-4 py-3 text-gray-700">{department.name}</td>
                      <td className="px-4 py-3 text-gray-600">{department.division}</td>
                      <td className="px-4 py-3 text-gray-600">{department.head}</td>
                      <td className="px-4 py-3 text-gray-600">{department.employees}</td>
                      <td className="px-4 py-3">
                        <StatusPill status={department.status} />
                      </td>
                      <td className="px-4 py-3 text-gray-600">{formatBudget(department.budget)}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-0.5">
                          <button
                            type="button"
                            onClick={() => setSelectedDepartment(department)}
                            aria-label="View department"
                            className={actionButtonClass}
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => rowActionMessage("Editing", department)}
                            aria-label="Edit department"
                            className={actionButtonClass}
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => rowActionMessage("Staff management", department)}
                            aria-label="Manage staff"
                            className={actionButtonClass}
                          >
                            <Users2 className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => rowActionMessage("Budget management", department)}
                            aria-label="Manage budget"
                            className={actionButtonClass}
                          >
                            <Wallet className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              setActionMessage(`"${department.name}" is derived from a fixed dataset and can't be deleted.`)
                            }
                            aria-label="Delete department"
                            className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="flex flex-col gap-4 p-5">
              {pageDepartments.length === 0 && <p className="py-6 text-center text-sm text-gray-400">No departments found.</p>}
              {DIVISIONS.filter((division) => pageDepartments.some((department) => department.division === division)).map((division) => (
                <div key={division} className="rounded-xl border border-gray-100">
                  <div className="flex items-center justify-between bg-gray-50 px-4 py-2.5">
                    <span className="text-xs font-bold uppercase tracking-wide text-gray-500">{division}</span>
                    <span className="text-xs text-gray-400">
                      {pageDepartments.filter((department) => department.division === division).length} department(s)
                    </span>
                  </div>
                  <ul className="flex flex-col divide-y divide-gray-50">
                    {pageDepartments
                      .filter((department) => department.division === division)
                      .map((department) => (
                        <li key={department.code} className="flex items-center justify-between px-4 py-2.5 text-sm">
                          <div className="flex flex-col">
                            <span className="font-medium text-gray-800">{department.name}</span>
                            <span className="text-xs text-gray-400">
                              {department.code} · {department.head}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <StatusPill status={department.status} />
                            <button
                              type="button"
                              onClick={() => setSelectedDepartment(department)}
                              aria-label="View department"
                              className={actionButtonClass}
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                          </div>
                        </li>
                      ))}
                  </ul>
                </div>
              ))}
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 px-5 py-4">
            <div className="w-56">
              <CustomSelect
                id="bulkAction"
                value={bulkAction}
                onChange={handleBulkAction}
                options={["Activate Selected", "Deactivate Selected", "Export Selected", "Delete Selected"]}
                placeholder="Bulk Actions"
              />
            </div>

            <div className="inline-flex rounded-full border border-gray-200 bg-white p-1">
              <button
                type="button"
                onClick={() => setViewMode("table")}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
                  viewMode === "table" ? "bg-[#ED017F] text-white" : "text-gray-500 hover:bg-gray-100",
                )}
              >
                <Table2 className="h-3.5 w-3.5" />
                Table View
              </button>
              <button
                type="button"
                onClick={() => setViewMode("tree")}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
                  viewMode === "tree" ? "bg-[#ED017F] text-white" : "text-gray-500 hover:bg-gray-100",
                )}
              >
                <ListTree className="h-3.5 w-3.5" />
                Tree View
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 px-5 py-4">
            <p className="text-sm text-gray-500">
              Showing {filteredDepartments.length === 0 ? 0 : startIndex + 1}–
              {Math.min(startIndex + rowsPerPage, filteredDepartments.length)} of {filteredDepartments.length} departments
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

            <div className="flex items-center gap-2 text-sm text-gray-500">
              <span>Rows Per Page</span>
              <div className="relative">
                <select
                  value={rowsPerPage}
                  onChange={(event) => setRowsPerPage(Number(event.target.value))}
                  className="appearance-none rounded-lg border border-gray-200 bg-white py-1.5 pl-3 pr-8 text-sm text-gray-700 outline-none focus:outline-none focus:ring-2 focus:ring-[#232B2B]"
                >
                  {ROWS_PER_PAGE_OPTIONS.map((size) => (
                    <option key={size} value={size}>
                      {size}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {selectedDepartment && (
        <DepartmentDetailDrawer
          department={selectedDepartment}
          onClose={() => setSelectedDepartment(null)}
          onAction={handleDrawerAction}
        />
      )}
    </div>
  );
}
