"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQueries, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Search,
  GripVertical,
  Mail,
  IdCard,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ChevronDown,
  Save,
  CheckCircle2,
  XCircle,
  Info,
} from "lucide-react";
import {
  fetchAdminUsers,
  fetchAdminUserById,
  fetchUserReportAccessByAdmin,
  updateUserReportAccess,
} from "@/features/admin/api";
import { REPORT_CATALOGUE, REPORT_CATEGORIES, getCategoryById, type ReportCategoryId } from "@/config/reports.config";
import { Breadcrumb } from "@/components/common/Breadcrumb";
import { CustomSelect } from "@/components/common/CustomSelect";
import { cn } from "@/lib/utils";

const ROWS_PER_PAGE = 10;

const CATEGORY_STYLES: Record<ReportCategoryId, string> = {
  loan: "bg-amber-50 text-amber-700",
  treasury: "bg-blue-50 text-blue-700",
  deposit: "bg-emerald-50 text-emerald-700",
  other: "bg-gray-100 text-gray-600",
  finance: "bg-purple-50 text-purple-700",
  "balance-certificate": "bg-rose-50 text-rose-700",
  summary: "bg-indigo-50 text-indigo-700",
  crb: "bg-cyan-50 text-cyan-700",
};

const inputClass =
  "w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-700 outline-none " +
  "focus:outline-none focus:ring-2 focus:ring-[#232B2B] focus:border-transparent placeholder:text-gray-300 " +
  "transition-all duration-200";
const selectClass = cn(inputClass, "appearance-none cursor-pointer pr-9");
const labelClass = "mb-1.5 block text-xs font-medium uppercase tracking-wide text-gray-500";
const transferButtonBaseClass =
  "flex w-32 shrink-0 items-center justify-center gap-2 rounded-full border px-3 py-2.5 text-xs font-semibold " +
  "transition-all duration-200 active:scale-95";
const transferButtonActiveClass = "border-[#ED017F] bg-[#ED017F] text-white hover:bg-white hover:text-[#ED017F]";
const transferButtonInactiveClass = "cursor-not-allowed border-gray-200 bg-gray-50 text-gray-400";

function TransferButton({
  icon: Icon,
  label,
  onClick,
  enabled,
}: {
  icon: typeof ChevronRight;
  label: string;
  onClick: () => void;
  enabled: boolean;
}): React.JSX.Element {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!enabled}
      className={cn(transferButtonBaseClass, enabled ? transferButtonActiveClass : transferButtonInactiveClass)}
    >
      <Icon className="h-4 w-4" />
      {label}
    </button>
  );
}
const reportBoxClass = "flex h-[28rem] flex-col gap-1 overflow-y-auto rounded-xl border border-gray-200 p-2";

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

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  const initials = parts.length > 1 ? `${parts[0][0]}${parts[parts.length - 1][0]}` : parts[0]?.slice(0, 2);
  return (initials ?? "").toUpperCase();
}

interface ToastState {
  type: "success" | "error" | "info";
  message: string;
}

const TOAST_STYLES: Record<ToastState["type"], { className: string; icon: typeof CheckCircle2 }> = {
  success: { className: "border-green-200 bg-green-50 text-green-700", icon: CheckCircle2 },
  error: { className: "border-red-200 bg-red-50 text-red-700", icon: XCircle },
  info: { className: "border-blue-200 bg-blue-50 text-blue-700", icon: Info },
};

interface PendingChanges {
  add: Set<number>;
  remove: Set<number>;
}

interface AssignedRow {
  reportId: number;
  status: "persisted" | "pending-add" | "pending-remove";
}

export default function AdminReportAccessPage(): React.JSX.Element {
  const queryClient = useQueryClient();

  const usersQuery = useQuery({ queryKey: ["admin", "users"], queryFn: fetchAdminUsers });
  const users = useMemo(() => usersQuery.data ?? [], [usersQuery.data]);

  const detailQueries = useQueries({
    queries: users.map((user) => ({
      queryKey: ["admin", "users", user.id],
      queryFn: () => fetchAdminUserById(user.id),
      staleTime: 5 * 60 * 1000,
    })),
  });

  const accessQueries = useQueries({
    queries: users.map((user) => ({
      queryKey: ["admin", "report-access", user.id],
      queryFn: () => fetchUserReportAccessByAdmin(user.id),
      retry: false,
      staleTime: 60 * 1000,
    })),
  });

  const employeeIdByUserId = useMemo(() => {
    const map = new Map<string, string | undefined>();
    users.forEach((user, index) => map.set(user.id, detailQueries[index]?.data?.employeeId));
    return map;
  }, [users, detailQueries]);

  const accessByUserId = useMemo(() => {
    const map = new Map<string, number[]>();
    users.forEach((user, index) => map.set(user.id, accessQueries[index]?.data?.reportIds ?? []));
    return map;
  }, [users, accessQueries]);

  const [reportSearch, setReportSearch] = useState("");
  const [reportTypeFilter, setReportTypeFilter] = useState("");
  const [reportPage, setReportPage] = useState(1);
  const [userSearch, setUserSearch] = useState("");
  const [assignedSearch, setAssignedSearch] = useState("");
  const [isUserPickerOpen, setIsUserPickerOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedAvailableIds, setSelectedAvailableIds] = useState<Set<number>>(new Set());
  const [selectedAssignedIds, setSelectedAssignedIds] = useState<Set<number>>(new Set());
  const [pendingByUser, setPendingByUser] = useState<Record<string, PendingChanges>>({});
  const [draggedReportId, setDraggedReportId] = useState<number | null>(null);
  const [isDragOverAssigned, setIsDragOverAssigned] = useState(false);
  const [toast, setToast] = useState<ToastState | null>(null);

  const userPickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent): void {
      if (userPickerRef.current && !userPickerRef.current.contains(event.target as Node)) {
        setIsUserPickerOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectUser = (userId: string): void => {
    setSelectedUserId((prev) => (prev === userId ? null : userId));
    setSelectedAvailableIds(new Set());
    setSelectedAssignedIds(new Set());
    setIsUserPickerOpen(false);
    setUserSearch("");
  };

  const clearUserSelection = (): void => {
    setSelectedUserId(null);
    setSelectedAvailableIds(new Set());
    setSelectedAssignedIds(new Set());
    setUserSearch("");
  };

  const effectiveAssignedSet = useMemo(() => {
    if (!selectedUserId) return new Set<number>();
    const persisted = accessByUserId.get(selectedUserId) ?? [];
    const pending = pendingByUser[selectedUserId] ?? { add: new Set<number>(), remove: new Set<number>() };
    const set = new Set(persisted);
    pending.add.forEach((id) => set.add(id));
    pending.remove.forEach((id) => set.delete(id));
    return set;
  }, [selectedUserId, accessByUserId, pendingByUser]);

  const assignedRows = useMemo<AssignedRow[]>(() => {
    if (!selectedUserId) return [];
    const persisted = accessByUserId.get(selectedUserId) ?? [];
    const pending = pendingByUser[selectedUserId] ?? { add: new Set<number>(), remove: new Set<number>() };
    const rows: AssignedRow[] = persisted.map((id) => ({
      reportId: id,
      status: pending.remove.has(id) ? "pending-remove" : "persisted",
    }));
    pending.add.forEach((id) => {
      if (!persisted.includes(id)) rows.push({ reportId: id, status: "pending-add" });
    });
    return rows;
  }, [selectedUserId, accessByUserId, pendingByUser]);

  const filteredAssignedRows = useMemo(() => {
    const query = assignedSearch.trim().toLowerCase();
    if (!query) return assignedRows;
    return assignedRows.filter(({ reportId }) => {
      const report = REPORT_CATALOGUE.find((r) => r.reportId === reportId);
      return report && (report.name.toLowerCase().includes(query) || String(report.reportId).includes(query));
    });
  }, [assignedRows, assignedSearch]);

  const filteredReports = useMemo(() => {
    const query = reportSearch.trim().toLowerCase();
    return REPORT_CATALOGUE.filter((report) => {
      const matchesType = !reportTypeFilter || report.category === reportTypeFilter;
      const matchesSearch =
        !query || report.name.toLowerCase().includes(query) || String(report.reportId).includes(query);
      const isAvailable = !selectedUserId || !effectiveAssignedSet.has(report.reportId);
      return matchesType && matchesSearch && isAvailable;
    });
  }, [reportSearch, reportTypeFilter, selectedUserId, effectiveAssignedSet]);

  const reportFilterSignature = `${reportSearch}|${reportTypeFilter}|${selectedUserId ?? ""}`;
  const [prevReportFilterSignature, setPrevReportFilterSignature] = useState(reportFilterSignature);
  if (reportFilterSignature !== prevReportFilterSignature) {
    setPrevReportFilterSignature(reportFilterSignature);
    setReportPage(1);
  }

  const totalReportPages = Math.max(1, Math.ceil(filteredReports.length / ROWS_PER_PAGE));
  const clampedReportPage = Math.min(reportPage, totalReportPages);
  const reportStartIndex = (clampedReportPage - 1) * ROWS_PER_PAGE;
  const pageReports = filteredReports.slice(reportStartIndex, reportStartIndex + ROWS_PER_PAGE);
  const reportPageNumbers = getPageNumbers(clampedReportPage, totalReportPages);

  const filteredUsers = useMemo(() => {
    const query = userSearch.trim().toLowerCase();
    if (!query) return users;
    return users.filter((user) => {
      const employeeId = employeeIdByUserId.get(user.id) ?? "";
      return (
        user.name.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query) ||
        employeeId.toLowerCase().includes(query)
      );
    });
  }, [users, userSearch, employeeIdByUserId]);

  const selectedUser = users.find((u) => u.id === selectedUserId) ?? null;

  const pendingEntries = useMemo(
    () => Object.entries(pendingByUser).filter(([, changes]) => changes.add.size > 0 || changes.remove.size > 0),
    [pendingByUser],
  );
  const totalPendingCount = pendingEntries.reduce((sum, [, changes]) => sum + changes.add.size + changes.remove.size, 0);

  const toggleAvailableSelected = (reportId: number): void => {
    setSelectedAvailableIds((prev) => {
      const next = new Set(prev);
      if (next.has(reportId)) next.delete(reportId);
      else next.add(reportId);
      return next;
    });
  };

  const toggleAssignedSelected = (reportId: number): void => {
    setSelectedAssignedIds((prev) => {
      const next = new Set(prev);
      if (next.has(reportId)) next.delete(reportId);
      else next.add(reportId);
      return next;
    });
  };

  const allAvailableSelected = filteredReports.length > 0 && selectedAvailableIds.size === filteredReports.length;
  const toggleSelectAllAvailable = (): void => {
    setSelectedAvailableIds(allAvailableSelected ? new Set() : new Set(filteredReports.map((r) => r.reportId)));
  };

  const allAssignedSelected = filteredAssignedRows.length > 0 && selectedAssignedIds.size === filteredAssignedRows.length;
  const toggleSelectAllAssigned = (): void => {
    setSelectedAssignedIds(allAssignedSelected ? new Set() : new Set(filteredAssignedRows.map((r) => r.reportId)));
  };

  const stageAdd = (userId: string, reportIds: number[]): void => {
    const user = users.find((u) => u.id === userId);
    if (!user || reportIds.length === 0) return;
    const persisted = accessByUserId.get(userId) ?? [];

    setPendingByUser((prev) => {
      const current = prev[userId] ?? { add: new Set<number>(), remove: new Set<number>() };
      const nextAdd = new Set(current.add);
      const nextRemove = new Set(current.remove);
      reportIds.forEach((id) => {
        if (nextRemove.has(id)) {
          nextRemove.delete(id);
        } else if (!persisted.includes(id) && !nextAdd.has(id)) {
          nextAdd.add(id);
        }
      });
      return { ...prev, [userId]: { add: nextAdd, remove: nextRemove } };
    });

    setToast({
      type: "info",
      message: `Staged ${reportIds.length} report${reportIds.length === 1 ? "" : "s"} for ${user.name}. Click Save Access to apply.`,
    });
  };

  const stageRemove = (userId: string, reportIds: number[]): void => {
    const user = users.find((u) => u.id === userId);
    if (!user || reportIds.length === 0) return;
    const persisted = accessByUserId.get(userId) ?? [];

    setPendingByUser((prev) => {
      const current = prev[userId] ?? { add: new Set<number>(), remove: new Set<number>() };
      const nextAdd = new Set(current.add);
      const nextRemove = new Set(current.remove);
      reportIds.forEach((id) => {
        if (nextAdd.has(id)) {
          nextAdd.delete(id);
        } else if (persisted.includes(id)) {
          nextRemove.add(id);
        }
      });
      return { ...prev, [userId]: { add: nextAdd, remove: nextRemove } };
    });

    setToast({
      type: "info",
      message: `Marked ${reportIds.length} report${reportIds.length === 1 ? "" : "s"} for removal from ${user.name}. Click Save Access to apply.`,
    });
  };

  const handleAdd = (): void => {
    if (!selectedUserId || selectedAvailableIds.size === 0) return;
    stageAdd(selectedUserId, Array.from(selectedAvailableIds));
    setSelectedAvailableIds(new Set());
  };

  const handleAddAll = (): void => {
    if (!selectedUserId || filteredReports.length === 0) return;
    stageAdd(
      selectedUserId,
      filteredReports.map((r) => r.reportId),
    );
    setSelectedAvailableIds(new Set());
  };

  const handleRemove = (): void => {
    if (!selectedUserId || selectedAssignedIds.size === 0) return;
    stageRemove(selectedUserId, Array.from(selectedAssignedIds));
    setSelectedAssignedIds(new Set());
  };

  const handleRemoveAll = (): void => {
    if (!selectedUserId || filteredAssignedRows.length === 0) return;
    stageRemove(
      selectedUserId,
      filteredAssignedRows.map((r) => r.reportId),
    );
    setSelectedAssignedIds(new Set());
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      await Promise.all(
        pendingEntries.map(([userId, changes]) => {
          const persisted = accessByUserId.get(userId) ?? [];
          const finalIds = persisted.filter((id) => !changes.remove.has(id)).concat(Array.from(changes.add));
          return updateUserReportAccess(userId, finalIds);
        }),
      );
    },
    onSuccess: () => {
      pendingEntries.forEach(([userId]) => queryClient.invalidateQueries({ queryKey: ["admin", "report-access", userId] }));
      setToast({ type: "success", message: `Saved ${totalPendingCount} report access change${totalPendingCount === 1 ? "" : "s"}.` });
      setPendingByUser({});
    },
    onError: () => {
      setToast({ type: "error", message: "Failed to save changes. Please try again." });
    },
  });

  const handleReportDragStart = (event: React.DragEvent<HTMLDivElement>, reportId: number): void => {
    event.dataTransfer.setData("text/plain", String(reportId));
    event.dataTransfer.effectAllowed = "copy";
    setDraggedReportId(reportId);
  };

  const handleReportDragEnd = (): void => {
    setDraggedReportId(null);
    setIsDragOverAssigned(false);
  };

  const handleAssignedDragOver = (event: React.DragEvent<HTMLDivElement>): void => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "copy";
    setIsDragOverAssigned(true);
  };

  const handleAssignedDrop = (event: React.DragEvent<HTMLDivElement>): void => {
    event.preventDefault();
    setIsDragOverAssigned(false);
    const raw = event.dataTransfer.getData("text/plain");
    const reportId = raw ? Number(raw) : draggedReportId;
    setDraggedReportId(null);
    if (!reportId) return;
    if (!selectedUserId) {
      setToast({ type: "error", message: "Select a user before assigning a report." });
      return;
    }
    stageAdd(selectedUserId, [reportId]);
  };

  return (
    <div className="flex flex-col gap-6">
      <Breadcrumb items={[{ label: "Administration", href: "/admin/dashboard" }, { label: "Report Access" }]} />

      <div>
        <h1 className="text-xl font-bold text-gray-800">Report Access Management</h1>
        <p className="text-sm text-gray-400">Grant reports to users based on their access requirements.</p>
      </div>

      {toast &&
        (() => {
          const style = TOAST_STYLES[toast.type];
          const ToastIcon = style.icon;
          return (
            <div className={cn("flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium", style.className)}>
              <ToastIcon className="h-4 w-4 shrink-0" />
              {toast.message}
            </div>
          );
        })()}

      <div className="rounded-2xl border border-gray-100 bg-white shadow-sm">
        <div className="border-b border-gray-100 px-5 py-4">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-500">Grant Access to User</h2>
          <p className="mt-1 text-xs text-gray-400">
            Select a user, then check reports and use the arrows (or drag-and-drop) to stage access. Nothing is saved until
            you click Save Access.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 border-b border-gray-100 p-5 sm:grid-cols-2">
          <div>
            <label htmlFor="project" className={labelClass}>
              Project
            </label>
            <div className="relative">
              <select id="project" className={selectClass} defaultValue="report-server">
                <option value="report-server">Report Server</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            </div>
          </div>

          <div ref={userPickerRef} className="relative">
            <label className={labelClass}>User</label>
            <div className="relative">
              <Search className="pointer-events-none absolute inset-y-0 left-3.5 my-auto h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={isUserPickerOpen ? userSearch : (selectedUser?.name ?? "")}
                onFocus={() => {
                  setIsUserPickerOpen(true);
                  setUserSearch("");
                }}
                onChange={(event) => setUserSearch(event.target.value)}
                placeholder="Search by name, employee ID, or email..."
                className={cn(inputClass, "pl-10 pr-9")}
              />
              <ChevronDown
                className={cn(
                  "pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 transition-transform",
                  isUserPickerOpen && "rotate-180",
                )}
              />
            </div>

            {isUserPickerOpen && (
              <div className="absolute z-20 mt-1 flex max-h-64 w-full flex-col gap-1 overflow-y-auto rounded-xl border border-gray-200 bg-white p-2 shadow-lg">
                {usersQuery.isLoading && <p className="p-3 text-sm text-gray-400">Loading users…</p>}
                {usersQuery.isError && <p className="p-3 text-sm text-red-600">Unable to load users.</p>}
                {!usersQuery.isLoading && filteredUsers.length === 0 && (
                  <p className="p-3 text-sm text-gray-400">No users found.</p>
                )}
                {filteredUsers.map((user) => {
                  const employeeId = employeeIdByUserId.get(user.id);
                  const assignedCount = (accessByUserId.get(user.id) ?? []).length;
                  const isSelected = selectedUserId === user.id;
                  return (
                    <button
                      key={user.id}
                      type="button"
                      onClick={() => selectUser(user.id)}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-2.5 py-2 text-left transition-colors",
                        isSelected ? "bg-[#FFF0F9] ring-1 ring-[#ED017F]" : "hover:bg-gray-50",
                      )}
                    >
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#232B2B] text-[11px] font-semibold text-white">
                        {getInitials(user.name)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="flex items-center gap-1.5 truncate text-sm font-medium text-gray-800">
                          {user.name}
                          {isSelected && <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-[#ED017F]" />}
                        </p>
                        <div className="flex flex-wrap items-center gap-x-3 text-xs text-gray-400">
                          <span className="inline-flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {user.email}
                          </span>
                          {employeeId && (
                            <span className="inline-flex items-center gap-1">
                              <IdCard className="h-3 w-3" />
                              {employeeId}
                            </span>
                          )}
                        </div>
                      </div>
                      <span className="shrink-0 rounded-full bg-gray-100 px-2.5 py-1 text-[11px] font-medium text-gray-500">
                        {assignedCount} report{assignedCount === 1 ? "" : "s"}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}

            {selectedUser && !isUserPickerOpen && (
              <button
                type="button"
                onClick={clearUserSelection}
                className="mt-1.5 text-xs font-medium text-gray-400 hover:text-gray-600"
              >
                Clear selection
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 p-5 lg:grid-cols-[1fr_auto_1fr]">
          <div className="flex flex-col gap-3">
            <p className={labelClass}>
              {selectedUserId ? "Available Reports" : "All Reports"} ({filteredReports.length})
            </p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="relative">
                <Search className="pointer-events-none absolute inset-y-0 left-3.5 my-auto h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={reportSearch}
                  onChange={(event) => setReportSearch(event.target.value)}
                  placeholder="Search by name or ID..."
                  className={cn(inputClass, "pl-10 py-2")}
                />
              </div>
              <CustomSelect
                value={reportTypeFilter}
                onChange={setReportTypeFilter}
                placeholder="All report types"
                options={REPORT_CATEGORIES.map((category) => ({ value: category.id, label: category.label }))}
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="flex cursor-pointer items-center gap-2 text-xs font-medium text-gray-500">
                <input
                  type="checkbox"
                  checked={allAvailableSelected}
                  onChange={toggleSelectAllAvailable}
                  disabled={filteredReports.length === 0}
                  className="h-4 w-4 rounded border-gray-300 text-[#232B2B] focus:ring-[#232B2B]"
                />
                Select all
              </label>
              {selectedAvailableIds.size > 0 && (
                <span className="text-xs text-gray-400">{selectedAvailableIds.size} selected</span>
              )}
            </div>

            <div className={reportBoxClass}>
              {pageReports.length === 0 && (
                <p className="p-3 text-sm text-gray-400">
                  {selectedUserId ? "All matching reports are already assigned to this user." : "No reports found."}
                </p>
              )}
              {pageReports.map((report) => {
                const category = getCategoryById(report.category);
                const isChecked = selectedAvailableIds.has(report.reportId);
                return (
                  <div
                    key={report.reportId}
                    draggable
                    onDragStart={(event) => handleReportDragStart(event, report.reportId)}
                    onDragEnd={handleReportDragEnd}
                    className={cn(
                      "flex cursor-grab items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors active:cursor-grabbing",
                      draggedReportId === report.reportId ? "opacity-40" : isChecked ? "bg-[#FFF0F9]" : "hover:bg-gray-50",
                    )}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggleAvailableSelected(report.reportId)}
                      className="h-4 w-4 shrink-0 rounded border-gray-300 text-[#232B2B] focus:ring-[#232B2B]"
                    />
                    <GripVertical className="h-4 w-4 shrink-0 text-gray-300" />
                    <span className="shrink-0 text-xs text-gray-400">#{report.reportId}</span>
                    <span className="flex-1 truncate text-gray-700">{report.name}</span>
                    <span
                      className={cn(
                        "shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium",
                        CATEGORY_STYLES[report.category],
                      )}
                    >
                      {category?.label ?? report.category}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-xs text-gray-400">
                Showing {filteredReports.length === 0 ? 0 : reportStartIndex + 1}–
                {Math.min(reportStartIndex + ROWS_PER_PAGE, filteredReports.length)} of {filteredReports.length} reports
              </p>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  disabled={clampedReportPage === 1}
                  onClick={() => setReportPage((p) => Math.max(1, p - 1))}
                  className="rounded-full p-1.5 text-gray-400 transition-colors hover:bg-gray-100 disabled:pointer-events-none disabled:opacity-40"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                {reportPageNumbers.map((pageNumber, index) =>
                  pageNumber === "..." ? (
                    <span key={`ellipsis-${index}`} className="px-1.5 text-xs text-gray-400">
                      ...
                    </span>
                  ) : (
                    <button
                      key={pageNumber}
                      type="button"
                      onClick={() => setReportPage(pageNumber)}
                      className={cn(
                        "h-7 w-7 rounded-full text-xs font-medium transition-colors",
                        pageNumber === clampedReportPage ? "bg-[#ED017F] text-white" : "text-gray-600 hover:bg-gray-100",
                      )}
                    >
                      {pageNumber}
                    </button>
                  ),
                )}
                <button
                  type="button"
                  disabled={clampedReportPage === totalReportPages}
                  onClick={() => setReportPage((p) => Math.min(totalReportPages, p + 1))}
                  className="rounded-full p-1.5 text-gray-400 transition-colors hover:bg-gray-100 disabled:pointer-events-none disabled:opacity-40"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          <div className="flex flex-row items-center justify-center gap-2 py-2 lg:h-full lg:flex-col lg:justify-center lg:py-0">
            <TransferButton
              icon={ChevronRight}
              label="Add"
              onClick={handleAdd}
              enabled={Boolean(selectedUserId) && selectedAvailableIds.size > 0}
            />
            <TransferButton
              icon={ChevronsRight}
              label="Add All"
              onClick={handleAddAll}
              enabled={Boolean(selectedUserId) && filteredReports.length > 0}
            />
            <TransferButton
              icon={ChevronLeft}
              label="Remove"
              onClick={handleRemove}
              enabled={Boolean(selectedUserId) && selectedAssignedIds.size > 0}
            />
            <TransferButton
              icon={ChevronsLeft}
              label="Remove All"
              onClick={handleRemoveAll}
              enabled={Boolean(selectedUserId) && filteredAssignedRows.length > 0}
            />
          </div>

          <div className="flex flex-col gap-3">
            <p className={labelClass}>
              Selected Reports ({assignedRows.length}){selectedUser ? ` — ${selectedUser.name}` : ""}
            </p>
            <div className="relative">
              <Search className="pointer-events-none absolute inset-y-0 left-3.5 my-auto h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={assignedSearch}
                onChange={(event) => setAssignedSearch(event.target.value)}
                placeholder="Search selected reports..."
                disabled={!selectedUserId}
                className={cn(inputClass, "pl-10 py-2", "disabled:cursor-not-allowed disabled:opacity-50")}
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="flex cursor-pointer items-center gap-2 text-xs font-medium text-gray-500">
                <input
                  type="checkbox"
                  checked={allAssignedSelected}
                  onChange={toggleSelectAllAssigned}
                  disabled={filteredAssignedRows.length === 0}
                  className="h-4 w-4 rounded border-gray-300 text-[#232B2B] focus:ring-[#232B2B]"
                />
                Select all
              </label>
              {selectedAssignedIds.size > 0 && (
                <span className="text-xs text-gray-400">{selectedAssignedIds.size} selected</span>
              )}
            </div>

            <div
              onDragOver={handleAssignedDragOver}
              onDragLeave={() => setIsDragOverAssigned(false)}
              onDrop={handleAssignedDrop}
              className={cn(reportBoxClass, "transition-colors", isDragOverAssigned ? "border-[#ED017F] bg-[#FFF0F9]" : "")}
            >
              {!selectedUserId && (
                <p className="p-3 text-sm text-gray-400">Select a user above to view and manage their report access.</p>
              )}
              {selectedUserId && filteredAssignedRows.length === 0 && (
                <p className="p-3 text-sm text-gray-400">
                  {assignedRows.length === 0 ? "No reports assigned yet." : "No selected reports match your search."}
                </p>
              )}
              {selectedUserId &&
                filteredAssignedRows.map(({ reportId, status }) => {
                  const report = REPORT_CATALOGUE.find((r) => r.reportId === reportId);
                  if (!report) return null;
                  const category = getCategoryById(report.category);
                  const isChecked = selectedAssignedIds.has(reportId);
                  return (
                    <div
                      key={reportId}
                      className={cn(
                        "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors",
                        status === "pending-remove"
                          ? "bg-red-50"
                          : status === "pending-add"
                            ? "bg-amber-50"
                            : isChecked
                              ? "bg-[#FFF0F9]"
                              : "hover:bg-gray-50",
                      )}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleAssignedSelected(reportId)}
                        className="h-4 w-4 shrink-0 rounded border-gray-300 text-[#232B2B] focus:ring-[#232B2B]"
                      />
                      <span className="shrink-0 text-xs text-gray-400">#{report.reportId}</span>
                      <span
                        className={cn(
                          "flex-1 truncate",
                          status === "pending-remove" ? "text-red-600 line-through" : "text-gray-700",
                        )}
                      >
                        {report.name}
                      </span>
                      {status === "pending-add" && (
                        <span className="shrink-0 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-medium text-amber-700">
                          Pending add
                        </span>
                      )}
                      {status === "pending-remove" && (
                        <span className="shrink-0 rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-medium text-red-600">
                          Pending removal
                        </span>
                      )}
                      <span
                        className={cn(
                          "shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium",
                          CATEGORY_STYLES[report.category],
                        )}
                      >
                        {category?.label ?? report.category}
                      </span>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 px-5 py-4">
          <p className="inline-flex items-center gap-2 text-sm text-gray-500">
            <Info className="h-4 w-4 shrink-0 text-gray-400" />
            Changes will be applied to the selected user immediately.
          </p>
          <button
            type="button"
            onClick={() => saveMutation.mutate()}
            disabled={totalPendingCount === 0 || saveMutation.isPending}
            className={cn(
              "inline-flex items-center gap-2 rounded-full border px-6 py-2.5 text-sm font-semibold transition-all duration-200",
              totalPendingCount === 0 || saveMutation.isPending
                ? "cursor-not-allowed border-gray-200 bg-gray-50 text-gray-400"
                : "border-[#ED017F] bg-[#ED017F] text-white hover:bg-white hover:text-[#ED017F]",
            )}
          >
            {saveMutation.isPending ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {saveMutation.isPending ? "Saving..." : "Save Access"}
          </button>
        </div>
      </div>

      <footer className="text-center text-xs text-gray-400">© 2026 - Business Transformation, IPDC Finance Limited</footer>
    </div>
  );
}
