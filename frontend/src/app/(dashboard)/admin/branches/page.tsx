"use client";

import { useMemo, useState } from "react";
import {
  Building2,
  CheckCircle2,
  PauseCircle,
  Globe,
  Users2,
  Plus,
  Upload,
  Download,
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
  MapPin,
  Settings2,
  Trash2,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

type BranchType = "HQ" | "Regional" | "Sub-Branch" | "Booth";
type BranchStatus = "Active" | "Inactive";

interface Branch {
  code: string;
  name: string;
  region: string;
  district: string;
  manager: string;
  employees: number;
  status: BranchStatus;
  type: BranchType;
  lastAudit: string;
}

const REGIONS = ["Dhaka", "Chattogram", "Khulna", "Rajshahi", "Sylhet", "Rangpur", "Barishal", "Mymensingh"];

const REGION_TOTALS: Record<string, number> = {
  Dhaka: 18,
  Chattogram: 14,
  Khulna: 10,
  Rajshahi: 9,
  Sylhet: 8,
  Rangpur: 7,
  Barishal: 6,
  Mymensingh: 5,
};

const REGION_DISTRICTS: Record<string, string[]> = {
  Dhaka: ["Dhaka", "Gazipur", "Narayanganj"],
  Chattogram: ["Chattogram", "Cox's Bazar", "Cumilla"],
  Khulna: ["Khulna", "Jessore", "Satkhira"],
  Rajshahi: ["Rajshahi", "Bogura", "Pabna"],
  Sylhet: ["Sylhet", "Moulvibazar", "Habiganj"],
  Rangpur: ["Rangpur", "Dinajpur", "Kurigram"],
  Barishal: ["Barishal", "Patuakhali", "Bhola"],
  Mymensingh: ["Mymensingh", "Jamalpur", "Netrokona"],
};

const MANAGER_POOL = [
  "John Doe",
  "Sarah Khan",
  "Rahman Ali",
  "Hasan Imam",
  "Tanvir Ahmed",
  "Nusrat Jahan",
  "Farhana Akter",
  "Kamrul Hasan",
  "Mahmudul Hasan",
  "Ismat Jahan",
  "Rafiqul Islam",
  "Ayesha Siddiqua",
  "Shakil Ahmed",
  "Rezaul Karim",
  "Nadia Islam",
  "Iqbal Hossain",
];

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function auditDate(index: number): string {
  const day = (index % 27) + 1;
  const month = MONTHS[index % 12];
  return `${String(day).padStart(2, "0")}-${month}-26`;
}

const NAMED_BRANCHES: Branch[] = [
  { code: "BR001", name: "Head Office", region: "Dhaka", district: "Dhaka", manager: "John Doe", employees: 245, status: "Active", type: "HQ", lastAudit: "02-Jun-26" },
  { code: "BR015", name: "Gulshan", region: "Dhaka", district: "Dhaka", manager: "Sarah Khan", employees: 82, status: "Active", type: "Regional", lastAudit: "18-May-26" },
  { code: "BR026", name: "Chattogram Main", region: "Chattogram", district: "Chattogram", manager: "Rahman Ali", employees: 105, status: "Active", type: "Regional", lastAudit: "30-May-26" },
  { code: "BR044", name: "Khulna", region: "Khulna", district: "Khulna", manager: "Hasan Imam", employees: 42, status: "Active", type: "Regional", lastAudit: "15-Apr-26" },
  { code: "BR078", name: "Sylhet", region: "Sylhet", district: "Sylhet", manager: "Tanvir Ahmed", employees: 38, status: "Inactive", type: "Regional", lastAudit: "11-Jan-26" },
];

const NAMED_CODES = new Set(NAMED_BRANCHES.map((branch) => branch.code));
const NAMED_PER_REGION: Record<string, number> = {};
NAMED_BRANCHES.forEach((branch) => {
  NAMED_PER_REGION[branch.region] = (NAMED_PER_REGION[branch.region] ?? 0) + 1;
});

let codeCounter = 1;
function nextCode(): string {
  codeCounter += 1;
  while (NAMED_CODES.has(`BR${String(codeCounter).padStart(3, "0")}`)) codeCounter += 1;
  return `BR${String(codeCounter).padStart(3, "0")}`;
}

const GENERATED_BRANCHES: Branch[] = REGIONS.flatMap((region, regionIndex) => {
  const remaining = REGION_TOTALS[region] - (NAMED_PER_REGION[region] ?? 0);
  const districts = REGION_DISTRICTS[region];
  return Array.from({ length: remaining }, (_, i) => {
    const globalIndex = regionIndex * 20 + i;
    const bucket = globalIndex % 10;
    const type: BranchType = bucket < 2 ? "Regional" : bucket === 9 ? "Booth" : "Sub-Branch";
    const status: BranchStatus = bucket === 8 ? "Inactive" : "Active";
    const baseEmployees = type === "Regional" ? 60 : type === "Booth" ? 6 : 18;
    const employees = baseEmployees + (globalIndex % 15);
    const typeLabel = type === "Regional" ? "Hub" : type === "Booth" ? "Booth" : "Branch";
    return {
      code: nextCode(),
      name: `${region} ${typeLabel} ${i + 1}`,
      region,
      district: districts[i % districts.length],
      manager: MANAGER_POOL[globalIndex % MANAGER_POOL.length],
      employees,
      status,
      type,
      lastAudit: auditDate(globalIndex),
    };
  });
});

const BRANCHES: Branch[] = [...NAMED_BRANCHES, ...GENERATED_BRANCHES].sort((a, b) =>
  a.code.localeCompare(b.code, undefined, { numeric: true }),
);

const MANAGER_OPTIONS = Array.from(new Set(BRANCHES.map((branch) => branch.manager))).sort();
const DISTRICT_OPTIONS = Array.from(new Set(BRANCHES.map((branch) => branch.district))).sort();
const BRANCH_TYPE_OPTIONS: BranchType[] = ["HQ", "Regional", "Sub-Branch", "Booth"];
const STATUS_OPTIONS: BranchStatus[] = ["Active", "Inactive"];
const SORT_OPTIONS = ["Name (A-Z)", "Name (Z-A)", "Most Employees", "Fewest Employees"];

const TYPE_COLORS: Record<BranchType, string> = {
  HQ: "#3B82F6",
  Regional: "#22C55E",
  "Sub-Branch": "#F59E0B",
  Booth: "#7C3AED",
};

const TYPE_BADGE_STYLES: Record<BranchType, string> = {
  HQ: "bg-blue-50 text-blue-700",
  Regional: "bg-green-50 text-green-700",
  "Sub-Branch": "bg-amber-50 text-amber-700",
  Booth: "bg-purple-50 text-purple-700",
};

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

const ROWS_PER_PAGE_OPTIONS = [5, 10, 25, 50];

function StatusPill({ status }: { status: BranchStatus }): React.JSX.Element {
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

function TypeBadge({ type }: { type: BranchType }): React.JSX.Element {
  return <span className={cn("inline-flex rounded-full px-2.5 py-1 text-xs font-medium", TYPE_BADGE_STYLES[type])}>{type}</span>;
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
  icon: typeof Building2;
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

function BranchDetailModal({ branch, onClose }: { branch: Branch; onClose: () => void }): React.JSX.Element {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative flex w-full max-w-md flex-col rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <h2 className="text-sm font-semibold text-gray-800">{branch.name}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="flex flex-col gap-3 px-6 py-5 text-sm">
          {[
            ["Branch Code", branch.code],
            ["Region", branch.region],
            ["District", branch.district],
            ["Manager", branch.manager],
            ["Employees", String(branch.employees)],
            ["Last Audit", branch.lastAudit],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-3 border-b border-gray-50 pb-3">
              <span className="text-xs font-medium uppercase tracking-wide text-gray-400">{label}</span>
              <span className="font-medium text-gray-800">{value}</span>
            </div>
          ))}
          <div className="flex items-center justify-between gap-3 pb-3">
            <span className="text-xs font-medium uppercase tracking-wide text-gray-400">Type</span>
            <TypeBadge type={branch.type} />
          </div>
          <div className="flex items-center justify-between gap-3">
            <span className="text-xs font-medium uppercase tracking-wide text-gray-400">Status</span>
            <StatusPill status={branch.status} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminBranchesPage(): React.JSX.Element {
  const [search, setSearch] = useState("");
  const [regionFilter, setRegionFilter] = useState("");
  const [districtFilter, setDistrictFilter] = useState("");
  const [branchTypeFilter, setBranchTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [managerFilter, setManagerFilter] = useState("");
  const [sortBy, setSortBy] = useState("");
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const [viewMode, setViewMode] = useState<"table" | "card">("table");
  const [bulkAction, setBulkAction] = useState("");
  const [selectedBranches, setSelectedBranches] = useState<Set<string>>(new Set());
  const [showAllRegions, setShowAllRegions] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const totalBranches = BRANCHES.length;
  const activeCount = BRANCHES.filter((branch) => branch.status === "Active").length;
  const inactiveCount = BRANCHES.filter((branch) => branch.status === "Inactive").length;
  const totalEmployees = BRANCHES.reduce((sum, branch) => sum + branch.employees, 0);
  const percentOf = (value: number): number => (totalBranches > 0 ? Math.round((value / totalBranches) * 100) : 0);

  const summaryCards: SummaryCardData[] = [
    {
      icon: Building2,
      label: "Total Branches",
      value: totalBranches,
      caption: "All Branches",
      sparkline: [60, 65, 68, 72, 75, totalBranches],
      accent: "#232B2B",
    },
    {
      icon: CheckCircle2,
      label: "Active Branches",
      value: activeCount,
      caption: "Currently Active",
      trend: { percent: percentOf(activeCount), direction: "up" },
      sparkline: [55, 58, 60, 62, 64, activeCount],
      accent: "#22C55E",
    },
    {
      icon: PauseCircle,
      label: "Inactive Branches",
      value: inactiveCount,
      caption: "Temporarily Inactive",
      trend: { percent: percentOf(inactiveCount), direction: "down" },
      sparkline: [10, 9, 8, 7, 7, inactiveCount],
      accent: "#9CA3AF",
    },
    {
      icon: Globe,
      label: "Regions",
      value: REGIONS.length,
      caption: "Operating Regions",
      sparkline: [6, 6, 7, 7, 8, REGIONS.length],
      accent: "#3B82F6",
    },
    {
      icon: Users2,
      label: "Total Employees",
      value: totalEmployees,
      caption: "Across all branches",
      sparkline: [1400, 1550, 1680, 1750, 1820, totalEmployees],
      accent: "#7C3AED",
    },
  ];

  const typeSegments: DonutSegment[] = BRANCH_TYPE_OPTIONS.map((type) => ({
    label: type,
    value: BRANCHES.filter((branch) => branch.type === type).length,
    color: TYPE_COLORS[type],
  }));

  const filteredBranches = useMemo(() => {
    const query = search.trim().toLowerCase();
    const matches = BRANCHES.filter((branch) => {
      const matchesSearch = !query || branch.name.toLowerCase().includes(query) || branch.code.toLowerCase().includes(query);
      const matchesRegion = !regionFilter || branch.region === regionFilter;
      const matchesDistrict = !districtFilter || branch.district === districtFilter;
      const matchesType = !branchTypeFilter || branch.type === branchTypeFilter;
      const matchesStatus = !statusFilter || branch.status === statusFilter;
      const matchesManager = !managerFilter || branch.manager === managerFilter;
      return matchesSearch && matchesRegion && matchesDistrict && matchesType && matchesStatus && matchesManager;
    });

    const sorted = [...matches];
    if (sortBy === "Name (A-Z)") sorted.sort((a, b) => a.name.localeCompare(b.name));
    if (sortBy === "Name (Z-A)") sorted.sort((a, b) => b.name.localeCompare(a.name));
    if (sortBy === "Most Employees") sorted.sort((a, b) => b.employees - a.employees);
    if (sortBy === "Fewest Employees") sorted.sort((a, b) => a.employees - b.employees);
    return sorted;
  }, [search, regionFilter, districtFilter, branchTypeFilter, statusFilter, managerFilter, sortBy]);

  const filterSignature = [search, regionFilter, districtFilter, branchTypeFilter, statusFilter, managerFilter, sortBy, rowsPerPage].join(
    "|",
  );
  const [prevFilterSignature, setPrevFilterSignature] = useState(filterSignature);
  if (filterSignature !== prevFilterSignature) {
    setPrevFilterSignature(filterSignature);
    setPage(1);
  }

  const totalPages = Math.max(1, Math.ceil(filteredBranches.length / rowsPerPage));
  const clampedPage = Math.min(page, totalPages);
  const startIndex = (clampedPage - 1) * rowsPerPage;
  const pageBranches = filteredBranches.slice(startIndex, startIndex + rowsPerPage);
  const pageNumbers = getPageNumbers(clampedPage, totalPages);

  const handleResetFilters = (): void => {
    setSearch("");
    setRegionFilter("");
    setDistrictFilter("");
    setBranchTypeFilter("");
    setStatusFilter("");
    setManagerFilter("");
    setSortBy("");
  };

  const exportBranches = (branches: Branch[]): void => {
    const header = ["Branch Code", "Branch Name", "Region", "District", "Type", "Manager", "Employees", "Status", "Last Audit"];
    const rows = branches.map((branch) => [
      branch.code,
      branch.name,
      branch.region,
      branch.district,
      branch.type,
      branch.manager,
      String(branch.employees),
      branch.status,
      branch.lastAudit,
    ]);
    downloadCsv("branches.csv", [header, ...rows]);
  };

  const handleExportBranches = (): void => {
    exportBranches(filteredBranches);
    setActionMessage(`Exported ${filteredBranches.length} branch(es).`);
  };

  const scrollToId = (id: string): void => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const quickActions = [
    {
      label: "Create Branch",
      icon: Plus,
      onClick: () => setActionMessage("Creating branches isn't supported yet — branch data is derived from a fixed dataset."),
    },
    { label: "Branch Locations", icon: MapPin, onClick: () => scrollToId("branch-directory") },
    { label: "Import Branches", icon: Upload, onClick: () => setActionMessage("Importing branches isn't supported yet.") },
    { label: "Export Branches", icon: Download, onClick: () => exportBranches(BRANCHES) },
  ];

  const regionCounts = useMemo(
    () =>
      REGIONS.map((region) => ({ region, count: BRANCHES.filter((branch) => branch.region === region).length })).sort(
        (a, b) => b.count - a.count,
      ),
    [],
  );
  const visibleRegions = showAllRegions ? regionCounts : regionCounts.slice(0, 6);

  const allSelected = pageBranches.length > 0 && pageBranches.every((branch) => selectedBranches.has(branch.code));
  const toggleSelectAll = (): void => {
    setSelectedBranches((prev) => {
      const next = new Set(prev);
      if (allSelected) pageBranches.forEach((branch) => next.delete(branch.code));
      else pageBranches.forEach((branch) => next.add(branch.code));
      return next;
    });
  };
  const toggleSelectBranch = (code: string): void => {
    setSelectedBranches((prev) => {
      const next = new Set(prev);
      if (next.has(code)) next.delete(code);
      else next.add(code);
      return next;
    });
  };

  const handleBulkAction = (value: string): void => {
    setBulkAction("");
    if (!value) return;
    const selected = BRANCHES.filter((branch) => selectedBranches.has(branch.code));
    if (selected.length === 0) {
      setActionMessage("Select at least one branch first.");
      return;
    }
    if (value === "Export Selected") {
      exportBranches(selected);
      setActionMessage(`Exported ${selected.length} branch(es).`);
      return;
    }
    setActionMessage(`${value} for ${selected.length} branch(es) isn't supported yet.`);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Branch Management</h1>
          <p className="text-sm text-gray-400">
            {totalBranches} branches across {REGIONS.length} regions
          </p>
        </div>
        <button
          type="button"
          onClick={() => setActionMessage("Creating branches isn't supported yet — branch data is derived from a fixed dataset.")}
          className="inline-flex items-center gap-2 rounded-xl border border-transparent bg-[#232B2B] px-6 py-2.5
                    text-sm font-semibold text-white transition-all duration-200 hover:border-[#232B2B]
                    hover:bg-white hover:text-[#232B2B]"
        >
          <Plus className="h-4 w-4" />
          Create Branch
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
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-6">
            <div>
              <label htmlFor="search" className={labelClass}>
                Search Branch
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

            <SelectField id="regionFilter" label="Region" value={regionFilter} onChange={setRegionFilter} options={REGIONS} />
            <SelectField id="districtFilter" label="District" value={districtFilter} onChange={setDistrictFilter} options={DISTRICT_OPTIONS} />
            <SelectField
              id="branchTypeFilter"
              label="Branch Type"
              value={branchTypeFilter}
              onChange={setBranchTypeFilter}
              options={BRANCH_TYPE_OPTIONS}
            />
            <SelectField id="statusFilter" label="Status" value={statusFilter} onChange={setStatusFilter} options={STATUS_OPTIONS} />
            <SelectField id="managerFilter" label="Manager" value={managerFilter} onChange={setManagerFilter} options={MANAGER_OPTIONS} />
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
                onClick={handleExportBranches}
                className="inline-flex items-center gap-2 rounded-xl border border-transparent bg-[#232B2B] px-5 py-2
                          text-sm font-semibold text-white transition-all duration-200 hover:border-[#232B2B]
                          hover:bg-white hover:text-[#232B2B]"
              >
                <FileSpreadsheet className="h-4 w-4" />
                Export Branches
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[320px_1fr]">
        <div className="rounded-2xl border border-gray-100 bg-white shadow-sm">
          <div className={panelHeaderClass}>
            <h2 className={panelTitleClass}>Branch Overview</h2>
          </div>
          <div className="flex flex-col items-center gap-5 px-5 py-6">
            <DonutChart segments={typeSegments} total={totalBranches} />
            <ul className="flex w-full flex-col gap-2 text-sm">
              {typeSegments.map((segment) => (
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

        <div id="branch-directory" className="rounded-2xl border border-gray-100 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
            <h2 className={panelTitleClass}>Branch Directory</h2>
            <span className="text-xs text-gray-400">
              Showing {filteredBranches.length} of {totalBranches} branches
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
                    <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-gray-400">Branch Code</th>
                    <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-gray-400">Branch Name</th>
                    <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-gray-400">Region</th>
                    <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-gray-400">Manager</th>
                    <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-gray-400">Status</th>
                    <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-gray-400">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pageBranches.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-4 py-6 text-center text-sm text-gray-400">
                        No branches found.
                      </td>
                    </tr>
                  )}
                  {pageBranches.map((branch, index) => (
                    <tr key={branch.code} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={selectedBranches.has(branch.code)}
                          onChange={() => toggleSelectBranch(branch.code)}
                          className="h-4 w-4 rounded border-gray-300 text-[#232B2B] focus:ring-[#232B2B]"
                        />
                      </td>
                      <td className="px-4 py-3 font-medium text-gray-800">{branch.code}</td>
                      <td className="px-4 py-3 text-gray-700">{branch.name}</td>
                      <td className="px-4 py-3 text-gray-600">{branch.region}</td>
                      <td className="px-4 py-3 text-gray-600">{branch.manager}</td>
                      <td className="px-4 py-3">
                        <StatusPill status={branch.status} />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-0.5">
                          <button
                            type="button"
                            onClick={() => setSelectedBranch(branch)}
                            aria-label="View branch"
                            className={actionButtonClass}
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setActionMessage(`Editing "${branch.name}" isn't supported yet.`)}
                            aria-label="Edit branch"
                            className={actionButtonClass}
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setActionMessage(`Location view for "${branch.name}" is coming soon.`)}
                            aria-label="View location"
                            className={actionButtonClass}
                          >
                            <MapPin className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setActionMessage(`Staff management for "${branch.name}" is coming soon.`)}
                            aria-label="Manage staff"
                            className={actionButtonClass}
                          >
                            <Users2 className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setActionMessage(`Settings for "${branch.name}" are coming soon.`)}
                            aria-label="Branch settings"
                            className={actionButtonClass}
                          >
                            <Settings2 className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setActionMessage(`"${branch.name}" is derived from a fixed dataset and can't be deleted.`)}
                            aria-label="Delete branch"
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
            <div className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-2">
              {pageBranches.length === 0 && <p className="col-span-full py-6 text-center text-sm text-gray-400">No branches found.</p>}
              {pageBranches.map((branch) => (
                <div key={branch.code} className="flex flex-col gap-3 rounded-2xl border border-gray-100 p-5 shadow-sm">
                  <div className="flex items-start justify-between">
                    <div className="flex flex-col">
                      <span className="font-bold text-gray-800">{branch.name}</span>
                      <span className="text-xs text-gray-400">{branch.code}</span>
                    </div>
                    <TypeBadge type={branch.type} />
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>
                      {branch.region} · {branch.district}
                    </span>
                    <StatusPill status={branch.status} />
                  </div>
                  <p className="text-xs text-gray-500">{branch.manager}</p>
                  <p className="text-xs text-gray-400">Last audit {branch.lastAudit}</p>
                  <div className="flex items-center justify-end gap-0.5 border-t border-gray-100 pt-3">
                    <button type="button" onClick={() => setSelectedBranch(branch)} aria-label="View branch" className={actionButtonClass}>
                      <Eye className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setActionMessage(`Editing "${branch.name}" isn't supported yet.`)}
                      aria-label="Edit branch"
                      className={actionButtonClass}
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setActionMessage(`"${branch.name}" is derived from a fixed dataset and can't be deleted.`)}
                      aria-label="Delete branch"
                      className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 px-5 py-4">
            <div className="relative w-56">
              <select value={bulkAction} onChange={(event) => handleBulkAction(event.target.value)} className={selectClass}>
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

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 px-5 py-4">
            <p className="text-sm text-gray-500">
              Showing {filteredBranches.length === 0 ? 0 : startIndex + 1}–{Math.min(startIndex + rowsPerPage, filteredBranches.length)}{" "}
              of {filteredBranches.length} branches
            </p>

            <div className="flex items-center gap-1">
              <button
                type="button"
                disabled={clampedPage === 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 disabled:pointer-events-none disabled:opacity-40"
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
                      "h-8 w-8 rounded-lg text-sm font-medium transition-colors",
                      pageNumber === clampedPage ? "bg-[#232B2B] text-white" : "text-gray-600 hover:bg-gray-100",
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
                className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 disabled:pointer-events-none disabled:opacity-40"
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

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-gray-100 bg-white shadow-sm">
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

        <div className="rounded-2xl border border-gray-100 bg-white shadow-sm">
          <div className={panelHeaderClass}>
            <h2 className={panelTitleClass}>Regional Structure</h2>
          </div>
          <div className="flex flex-col p-2">
            {visibleRegions.map(({ region, count }) => (
              <button
                key={region}
                type="button"
                onClick={() => {
                  setRegionFilter(region);
                  scrollToId("branch-directory");
                }}
                className="flex items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-800"
              >
                <span className="flex items-center gap-2.5">
                  <Globe className="h-4 w-4 text-gray-400" />
                  {region} Region
                </span>
                <span className="text-xs text-gray-400">({count})</span>
              </button>
            ))}
          </div>
          <div className="border-t border-gray-100 p-3">
            <button
              type="button"
              onClick={() => setShowAllRegions((prev) => !prev)}
              className="w-full rounded-xl px-3 py-2 text-center text-sm font-medium text-[#ED017F] transition-colors hover:bg-gray-50"
            >
              {showAllRegions ? "Show Fewer Regions" : "View All Regions"}
            </button>
          </div>
        </div>
      </div>

      <footer className="text-center text-xs text-gray-400">© 2026 - Business Transformation, IPDC Finance Limited</footer>

      {selectedBranch && <BranchDetailModal branch={selectedBranch} onClose={() => setSelectedBranch(null)} />}
    </div>
  );
}
