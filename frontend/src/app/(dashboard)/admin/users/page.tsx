"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import {
  Search,
  UserPlus,
  Eye,
  Pencil,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  Table2,
  LayoutGrid,
} from "lucide-react";
import { CustomSelect } from "@/components/common/CustomSelect";
import { cn } from "@/lib/utils";

type UserRole = "Admin" | "Manager" | "Editor" | "Analyst" | "Viewer";
type UserStatus = "Active" | "Locked" | "Inactive";

interface MockUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  branch: string;
  status: UserStatus;
  lastLogin: string;
}

const MOCK_USERS: MockUser[] = [
  { id: "1", name: "Ayesha Siddiqua", email: "ayesha.siddiqua@ipdc.com.bd", role: "Admin", branch: "Dhaka Main", status: "Active", lastLogin: "2026-07-10 09:14" },
  { id: "2", name: "Tanvir Ahmed", email: "tanvir.ahmed@ipdc.com.bd", role: "Manager", branch: "Chattogram", status: "Active", lastLogin: "2026-07-09 16:42" },
  { id: "3", name: "Rashed Khan", email: "rashed.khan@ipdc.com.bd", role: "Viewer", branch: "Sylhet", status: "Locked", lastLogin: "2026-06-28 11:05" },
  { id: "4", name: "Nusrat Jahan", email: "nusrat.jahan@ipdc.com.bd", role: "Editor", branch: "Dhaka Main", status: "Active", lastLogin: "2026-07-10 08:02" },
  { id: "5", name: "Kamrul Hasan", email: "kamrul.hasan@ipdc.com.bd", role: "Analyst", branch: "Khulna", status: "Inactive", lastLogin: "2026-05-12 10:30" },
  { id: "6", name: "Farhana Akter", email: "farhana.akter@ipdc.com.bd", role: "Manager", branch: "Rajshahi", status: "Active", lastLogin: "2026-07-08 14:20" },
  { id: "7", name: "Shakil Ahmed", email: "shakil.ahmed@ipdc.com.bd", role: "Viewer", branch: "Dhaka Main", status: "Active", lastLogin: "2026-07-01 09:55" },
  { id: "8", name: "Mahmudul Hasan", email: "mahmudul.hasan@ipdc.com.bd", role: "Admin", branch: "Barishal", status: "Active", lastLogin: "2026-07-10 07:48" },
  { id: "9", name: "Ismat Jahan", email: "ismat.jahan@ipdc.com.bd", role: "Editor", branch: "Chattogram", status: "Locked", lastLogin: "2026-06-15 13:11" },
  { id: "10", name: "Rafiqul Islam", email: "rafiqul.islam@ipdc.com.bd", role: "Analyst", branch: "Sylhet", status: "Active", lastLogin: "Never" },
];

const ROLES: UserRole[] = ["Admin", "Manager", "Editor", "Analyst", "Viewer"];
const STATUSES: UserStatus[] = ["Active", "Locked", "Inactive"];
const BRANCHES = Array.from(new Set(MOCK_USERS.map((user) => user.branch))).sort();
const PAGE_SIZE = 10;
const AVATAR_COLORS = ["#ED017F", "#232B2B", "#2563EB", "#059669", "#D97706", "#7C3AED"];

const ROLE_BADGE_STYLES: Record<UserRole, string> = {
  Admin: "bg-[#FFE6F4] text-[#ED017F]",
  Manager: "bg-blue-50 text-blue-700",
  Editor: "bg-purple-50 text-purple-700",
  Analyst: "bg-amber-50 text-amber-700",
  Viewer: "bg-gray-100 text-gray-600",
};

const STATUS_STYLES: Record<UserStatus, { dot: string; pill: string }> = {
  Active: { dot: "bg-green-500", pill: "border-green-200 bg-green-50 text-green-700" },
  Locked: { dot: "bg-red-500", pill: "border-red-200 bg-red-50 text-red-700" },
  Inactive: { dot: "bg-gray-400", pill: "border-gray-200 bg-gray-50 text-gray-500" },
};

const inputClass =
  "w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-700 outline-none " +
  "focus:outline-none focus:ring-2 focus:ring-[#232B2B] focus:border-transparent placeholder:text-gray-300 " +
  "transition-all duration-200";
const labelClass = "mb-1.5 block text-xs font-medium uppercase tracking-wide text-gray-500";

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  return parts.length > 1 ? `${parts[0][0]}${parts[1][0]}`.toUpperCase() : parts[0]?.slice(0, 2).toUpperCase();
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

function SelectField({
  id,
  label,
  value,
  onChange,
  options,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
}): React.JSX.Element {
  return (
    <div>
      <label htmlFor={id} className={labelClass}>
        {label}
      </label>
      <CustomSelect id={id} value={value} onChange={onChange} options={options} placeholder={`All ${label.toLowerCase()}`} />
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
    <svg viewBox={`0 0 ${width} ${height}`} className="mt-3 h-6 w-full" preserveAspectRatio="none">
      <path d={path} fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function StatCard({
  value,
  label,
  sparkline,
  accent,
}: {
  value: number;
  label: string;
  sparkline: number[];
  accent: string;
}): React.JSX.Element {
  return (
    <div className="flex min-h-[100px] flex-col items-center justify-center rounded-2xl border border-gray-100 bg-white p-6 text-center shadow-sm">
      <span className="text-3xl font-bold text-gray-900">{value}</span>
      <span className="mt-1 text-sm text-gray-500">{label}</span>
      <MiniSparkline points={sparkline} color={accent} />
    </div>
  );
}

type UserAction = "reset-password" | "toggle-lock" | "deactivate";

interface UserActionsMenuProps {
  user: MockUser;
  onAction: (action: UserAction, user: MockUser) => void;
}

function UserActionsMenu({ user, onAction }: UserActionsMenuProps): React.JSX.Element {
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState<{ top: number; right: number } | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    function updatePosition(): void {
      const rect = buttonRef.current?.getBoundingClientRect();
      if (!rect) return;
      setPosition({ top: rect.bottom + 4, right: window.innerWidth - rect.right });
    }

    function handleClickOutside(event: MouseEvent): void {
      const target = event.target as Node;
      if (
        buttonRef.current &&
        !buttonRef.current.contains(target) &&
        menuRef.current &&
        !menuRef.current.contains(target)
      ) {
        setOpen(false);
      }
    }

    function handleScroll(): void {
      setOpen(false);
    }

    updatePosition();
    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("scroll", handleScroll, true);
    window.addEventListener("resize", updatePosition);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("scroll", handleScroll, true);
      window.removeEventListener("resize", updatePosition);
    };
  }, [open]);

  const menuItemClass = "block w-full rounded-lg px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50";

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-label="More actions"
        className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
      >
        <MoreVertical className="h-4 w-4" />
      </button>

      {open &&
        position &&
        createPortal(
          <div
            ref={menuRef}
            style={{ position: "fixed", top: position.top, right: position.right }}
            className="z-50 w-48 rounded-xl border border-gray-100 bg-white p-1.5 shadow-lg"
          >
            <Link href={`/admin/users/${user.id}`} className={menuItemClass} onClick={() => setOpen(false)}>
              View Details
            </Link>
            <Link href={`/admin/users/${user.id}`} className={menuItemClass} onClick={() => setOpen(false)}>
              Edit User
            </Link>
            <button
              type="button"
              className={menuItemClass}
              onClick={() => {
                setOpen(false);
                onAction("reset-password", user);
              }}
            >
              Reset Password
            </button>
            <button
              type="button"
              className={menuItemClass}
              onClick={() => {
                setOpen(false);
                onAction("toggle-lock", user);
              }}
            >
              Lock / Unlock User
            </button>
            <button
              type="button"
              className="block w-full rounded-lg px-3 py-2 text-left text-sm text-red-500 hover:bg-red-50"
              onClick={() => {
                setOpen(false);
                onAction("deactivate", user);
              }}
            >
              Deactivate User
            </button>
          </div>,
          document.body,
        )}
    </>
  );
}

function RowActions({ user, onAction }: UserActionsMenuProps): React.JSX.Element {
  return (
    <div className="flex items-center gap-1">
      <Link
        href={`/admin/users/${user.id}`}
        aria-label="View user"
        className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
      >
        <Eye className="h-4 w-4" />
      </Link>
      <Link
        href={`/admin/users/${user.id}`}
        aria-label="Edit user"
        className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
      >
        <Pencil className="h-4 w-4" />
      </Link>
      <UserActionsMenu user={user} onAction={onAction} />
    </div>
  );
}

export default function AdminUsersPage(): React.JSX.Element {
  const [users, setUsers] = useState<MockUser[]>(MOCK_USERS);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [branchFilter, setBranchFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [viewMode, setViewMode] = useState<"table" | "card">("table");
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const filterKey = `${search}|${roleFilter}|${branchFilter}|${statusFilter}`;
  const [prevFilterKey, setPrevFilterKey] = useState(filterKey);
  if (filterKey !== prevFilterKey) {
    setPrevFilterKey(filterKey);
    setPage(1);
  }

  const filteredUsers = useMemo(() => {
    const query = search.trim().toLowerCase();
    return users.filter((user) => {
      const matchesRole = !roleFilter || user.role === roleFilter;
      const matchesBranch = !branchFilter || user.branch === branchFilter;
      const matchesStatus = !statusFilter || user.status === statusFilter;
      const matchesSearch =
        !query || user.name.toLowerCase().includes(query) || user.email.toLowerCase().includes(query);
      return matchesRole && matchesBranch && matchesStatus && matchesSearch;
    });
  }, [users, search, roleFilter, branchFilter, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / PAGE_SIZE));
  const clampedPage = Math.min(page, totalPages);
  const startIndex = (clampedPage - 1) * PAGE_SIZE;
  const pageUsers = filteredUsers.slice(startIndex, startIndex + PAGE_SIZE);
  const pageNumbers = getPageNumbers(clampedPage, totalPages);

  const handleAction = (action: UserAction, user: MockUser): void => {
    if (action === "reset-password") {
      setActionMessage(`Password reset email sent to ${user.email}.`);
      return;
    }
    if (action === "toggle-lock") {
      const nextStatus: UserStatus = user.status === "Locked" ? "Active" : "Locked";
      setUsers((prev) => prev.map((u) => (u.id === user.id ? { ...u, status: nextStatus } : u)));
      setActionMessage(`${user.name} is now ${nextStatus === "Locked" ? "locked" : "unlocked"}.`);
      return;
    }
    setUsers((prev) => prev.map((u) => (u.id === user.id ? { ...u, status: "Inactive" } : u)));
    setActionMessage(`${user.name} has been deactivated.`);
  };

  const handleResetFilters = (): void => {
    setSearch("");
    setRoleFilter("");
    setBranchFilter("");
    setStatusFilter("");
  };

  const handleExport = (): void => {
    const header = ["Name", "Email", "Role", "Branch", "Status", "Last Login"];
    const rows = filteredUsers.map((user) => [user.name, user.email, user.role, user.branch, user.status, user.lastLogin]);
    const csv = [header, ...rows].map((row) => row.map((cell) => `"${cell}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "users.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-800">User Management</h1>
          <p className="text-sm text-gray-400">{users.length} registered users</p>
        </div>
        <Link
          href="/admin/users/new"
          className="inline-flex items-center gap-2 rounded-full border border-[#ED017F] bg-[#ED017F] px-6 py-2.5
                    text-sm font-semibold text-white transition-all duration-200
                    hover:bg-white hover:text-[#ED017F]"
        >
          <UserPlus className="h-4 w-4" />
          Create User
        </Link>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <StatCard
          value={users.length}
          label="Total Users"
          sparkline={[7, 8, 8, 9, 9, users.length]}
          accent="#232B2B"
        />
        <StatCard
          value={users.filter((user) => user.status === "Active").length}
          label="Active Users"
          sparkline={[6, 6, 7, 7, 8, users.filter((user) => user.status === "Active").length]}
          accent="#22C55E"
        />
        <StatCard
          value={users.filter((user) => user.status === "Locked").length}
          label="Locked Users"
          sparkline={[0, 1, 1, 2, 1, users.filter((user) => user.status === "Locked").length]}
          accent="#EF4444"
        />
      </div>

      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <div className="grid grid-cols-4 gap-4">
          <div>
            <label htmlFor="search" className={labelClass}>
              Search
            </label>
            <div className="relative">
              <Search className="pointer-events-none absolute inset-y-0 left-3.5 my-auto h-4 w-4 text-gray-400" />
              <input
                id="search"
                type="text"
                placeholder="Search by name or email..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-700
                          outline-none transition-all duration-200 placeholder:text-gray-300
                          focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#232B2B]"
              />
            </div>
          </div>

          <SelectField id="roleFilter" label="Role" value={roleFilter} onChange={setRoleFilter} options={ROLES} />
          <SelectField id="branchFilter" label="Branch" value={branchFilter} onChange={setBranchFilter} options={BRANCHES} />
          <SelectField id="statusFilter" label="Status" value={statusFilter} onChange={setStatusFilter} options={STATUSES} />
        </div>

        <div className="mt-4 flex items-center justify-between">
          <button
            type="button"
            onClick={handleResetFilters}
            className="text-sm font-medium text-gray-500 transition-colors hover:text-gray-700"
          >
            Reset Filters
          </button>
          <button
            type="button"
            onClick={handleExport}
            className="inline-flex items-center gap-2 rounded-full border border-[#ED017F] bg-[#ED017F] px-5 py-2
                      text-sm font-semibold text-white transition-all duration-200
                      hover:bg-white hover:text-[#ED017F]"
          >
            Export Users
          </button>
        </div>
      </div>

      {actionMessage && <p className="text-sm font-medium text-green-700">{actionMessage}</p>}

      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-400">
          Showing {filteredUsers.length === 0 ? 0 : startIndex + 1} to {Math.min(startIndex + PAGE_SIZE, filteredUsers.length)} of{" "}
          {filteredUsers.length} users
        </p>
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
            onClick={() => setViewMode("card")}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
              viewMode === "card" ? "bg-[#ED017F] text-white" : "text-gray-500 hover:bg-gray-100",
            )}
          >
            <LayoutGrid className="h-3.5 w-3.5" />
            Card View
          </button>
        </div>
      </div>

      {viewMode === "table" ? (
        <div className="overflow-x-auto rounded-2xl border border-gray-100 bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-white">
                <th className="w-10 px-4 py-3">
                  <input type="checkbox" className="h-4 w-4 rounded border-gray-300 text-[#232B2B] focus:ring-[#232B2B]" />
                </th>
                <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-gray-400">User</th>
                <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-gray-400">Role</th>
                <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-gray-400">Branch</th>
                <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-gray-400">Status</th>
                <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-gray-400">Last Login</th>
                <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody>
              {pageUsers.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-6 text-center text-sm text-gray-400">
                    No users found.
                  </td>
                </tr>
              )}
              {pageUsers.map((user, index) => (
                <tr key={user.id} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                  <td className="px-4 py-3">
                    <input type="checkbox" className="h-4 w-4 rounded border-gray-300 text-[#232B2B] focus:ring-[#232B2B]" />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white"
                        style={{ backgroundColor: getAvatarColor(startIndex + index) }}
                      >
                        {getInitials(user.name)}
                      </div>
                      <div className="flex flex-col overflow-hidden">
                        <span className="truncate font-medium text-gray-800">{user.name}</span>
                        <span className="truncate text-xs text-gray-400">{user.email}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={cn("inline-flex rounded-full px-2.5 py-1 text-xs font-medium", ROLE_BADGE_STYLES[user.role])}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{user.branch}</td>
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium",
                        STATUS_STYLES[user.status].pill,
                      )}
                    >
                      <span className={cn("h-1.5 w-1.5 rounded-full", STATUS_STYLES[user.status].dot)} />
                      {user.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500">{user.lastLogin}</td>
                  <td className="px-4 py-3">
                    <RowActions user={user} onAction={handleAction} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {pageUsers.length === 0 && (
            <p className="col-span-full py-6 text-center text-sm text-gray-400">No users found.</p>
          )}
          {pageUsers.map((user, index) => (
            <div key={user.id} className="flex flex-col gap-3 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <div
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white"
                  style={{ backgroundColor: getAvatarColor(startIndex + index) }}
                >
                  {getInitials(user.name)}
                </div>
                <div className="flex flex-col overflow-hidden">
                  <span className="truncate font-medium text-gray-800">{user.name}</span>
                  <span className="truncate text-xs text-gray-400">{user.email}</span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <span className={cn("inline-flex rounded-full px-2.5 py-1 text-xs font-medium", ROLE_BADGE_STYLES[user.role])}>
                  {user.role}
                </span>
                <span
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium",
                    STATUS_STYLES[user.status].pill,
                  )}
                >
                  <span className={cn("h-1.5 w-1.5 rounded-full", STATUS_STYLES[user.status].dot)} />
                  {user.status}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>{user.branch}</span>
                <span>{user.lastLogin}</span>
              </div>

              <div className="flex items-center justify-end border-t border-gray-100 pt-3">
                <RowActions user={user} onAction={handleAction} />
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center justify-center rounded-2xl border border-gray-100 bg-white px-4 py-3 shadow-sm">
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

      <footer className="text-center text-xs text-gray-400">© 2026 - Business Transformation, IPDC Finance Limited</footer>
    </div>
  );
}
