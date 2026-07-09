"use client";

import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Search, ChevronRight, ChevronsRight, ChevronsLeft, ChevronLeft } from "lucide-react";
import {
  fetchAdminUsers,
  fetchUserReportAccessByAdmin,
  updateUserReportAccess,
} from "@/features/admin/api";
import { REPORT_CATALOGUE } from "@/config/reports.config";
import type { ReportDefinition } from "@/config/reports.config";
import { cn } from "@/lib/utils";

const inputClass =
  "w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-700 outline-none " +
  "focus:outline-none focus:ring-2 focus:ring-[#232B2B] focus:border-transparent placeholder:text-gray-300 " +
  "transition-all duration-200";
const selectClass = cn(inputClass, "appearance-none cursor-pointer");
const labelClass = "mb-1.5 block text-xs font-medium uppercase tracking-wide text-gray-500";

const transferButtonClass =
  "flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 px-4 py-2 text-sm " +
  "font-medium text-gray-600 transition-all duration-200 hover:bg-[#232B2B] hover:text-white disabled:opacity-40 " +
  "disabled:pointer-events-none";

function toggleId(set: Set<number>, id: number): Set<number> {
  const next = new Set(set);
  if (next.has(id)) {
    next.delete(id);
  } else {
    next.add(id);
  }
  return next;
}

function withIds(set: Set<number>, ids: number[]): Set<number> {
  return new Set([...set, ...ids]);
}

function withoutIds(set: Set<number>, ids: number[]): Set<number> {
  const next = new Set(set);
  ids.forEach((id) => next.delete(id));
  return next;
}

interface ReportRowProps {
  report: ReportDefinition;
  checked: boolean;
  onToggle: (reportId: number) => void;
}

function ReportRow({ report, checked, onToggle }: ReportRowProps): React.JSX.Element {
  return (
    <label
      className={cn(
        "flex cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors",
        checked ? "bg-[#FFF0F9]" : "hover:bg-gray-50",
      )}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={() => onToggle(report.reportId)}
        className="rounded border-gray-300 text-[#232B2B] focus:ring-[#232B2B]"
      />
      <span className="flex-1 truncate text-gray-700">{report.name}</span>
      <span className="shrink-0 text-xs text-gray-400">#{report.reportId}</span>
    </label>
  );
}

interface ReportListPanelProps {
  title: string;
  search: string;
  onSearchChange: (value: string) => void;
  reports: ReportDefinition[];
  checked: Set<number>;
  onToggle: (reportId: number) => void;
  isLoading: boolean;
  emptyLabel: string;
}

function ReportListPanel({
  title,
  search,
  onSearchChange,
  reports,
  checked,
  onToggle,
  isLoading,
  emptyLabel,
}: ReportListPanelProps): React.JSX.Element {
  return (
    <div className="flex flex-col gap-2">
      <p className={labelClass}>{title}</p>
      <div className="relative">
        <Search className="pointer-events-none absolute inset-y-0 left-3.5 my-auto h-4 w-4 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Search reports..."
          className="w-full rounded-xl border border-gray-200 bg-white py-2 pl-10 pr-3 text-sm text-gray-700
                    outline-none focus:outline-none focus:ring-2 focus:ring-[#232B2B] focus:border-transparent
                    placeholder:text-gray-300 transition-all duration-200"
        />
      </div>
      <div className="flex max-h-96 flex-col gap-0.5 overflow-y-auto rounded-xl border border-gray-200 p-2">
        {isLoading && <p className="p-3 text-sm text-gray-400">Loading…</p>}
        {!isLoading && reports.length === 0 && <p className="p-3 text-sm text-gray-400">{emptyLabel}</p>}
        {!isLoading &&
          reports.map((report) => (
            <ReportRow key={report.reportId} report={report} checked={checked.has(report.reportId)} onToggle={onToggle} />
          ))}
      </div>
    </div>
  );
}

interface ReportAccessEditorProps {
  userId: string;
}

function ReportAccessEditor({ userId }: ReportAccessEditorProps): React.JSX.Element {
  const accessQuery = useQuery({
    queryKey: ["admin", "report-access", userId],
    queryFn: () => fetchUserReportAccessByAdmin(userId),
    retry: false,
  });

  const [searchAvailable, setSearchAvailable] = useState("");
  const [searchAssigned, setSearchAssigned] = useState("");
  const [pendingAdds, setPendingAdds] = useState<Set<number>>(new Set());
  const [pendingRemoves, setPendingRemoves] = useState<Set<number>>(new Set());
  const [checkedAvailable, setCheckedAvailable] = useState<Set<number>>(new Set());
  const [checkedAssigned, setCheckedAssigned] = useState<Set<number>>(new Set());
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");

  const assignedSet = new Set(accessQuery.data?.reportIds ?? []);
  pendingAdds.forEach((id) => assignedSet.add(id));
  pendingRemoves.forEach((id) => assignedSet.delete(id));
  const assignedIds = Array.from(assignedSet);

  const availableReports = REPORT_CATALOGUE.filter(
    (report) => !assignedSet.has(report.reportId) && report.name.toLowerCase().includes(searchAvailable.toLowerCase()),
  );
  const assignedReports = REPORT_CATALOGUE.filter(
    (report) => assignedSet.has(report.reportId) && report.name.toLowerCase().includes(searchAssigned.toLowerCase()),
  );

  const addIds = (ids: number[]): void => {
    setPendingAdds((prev) => withIds(prev, ids));
    setPendingRemoves((prev) => withoutIds(prev, ids));
  };

  const removeIds = (ids: number[]): void => {
    setPendingRemoves((prev) => withIds(prev, ids));
    setPendingAdds((prev) => withoutIds(prev, ids));
  };

  const addSelected = (): void => {
    addIds(Array.from(checkedAvailable));
    setCheckedAvailable(new Set());
  };

  const addAll = (): void => {
    addIds(availableReports.map((report) => report.reportId));
    setCheckedAvailable(new Set());
  };

  const removeSelected = (): void => {
    removeIds(Array.from(checkedAssigned));
    setCheckedAssigned(new Set());
  };

  const removeAll = (): void => {
    removeIds(assignedReports.map((report) => report.reportId));
    setCheckedAssigned(new Set());
  };

  const mutation = useMutation({
    mutationFn: () => updateUserReportAccess(userId, assignedIds),
    onSuccess: () => setStatus("success"),
    onError: () => setStatus("error"),
  });

  const handleSave = (): void => {
    setStatus("idle");
    mutation.mutate();
  };

  return (
    <>
      {accessQuery.isError && (
        <p className="mt-6 text-xs text-amber-600">
          Could not load this user&apos;s existing access — starting from an empty list.
        </p>
      )}

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <ReportListPanel
          title="Available Reports"
          search={searchAvailable}
          onSearchChange={setSearchAvailable}
          reports={availableReports}
          checked={checkedAvailable}
          onToggle={(id) => setCheckedAvailable((prev) => toggleId(prev, id))}
          isLoading={accessQuery.isLoading}
          emptyLabel="No reports found."
        />

        <div className="flex flex-row items-center justify-center gap-3 lg:flex-col">
          <button type="button" onClick={addSelected} disabled={checkedAvailable.size === 0} className={transferButtonClass}>
            <ChevronRight className="h-4 w-4" />
            Add Selected
          </button>
          <button type="button" onClick={addAll} disabled={availableReports.length === 0} className={transferButtonClass}>
            <ChevronsRight className="h-4 w-4" />
            Add All
          </button>
          <button type="button" onClick={removeAll} disabled={assignedReports.length === 0} className={transferButtonClass}>
            <ChevronsLeft className="h-4 w-4" />
            Remove All
          </button>
          <button type="button" onClick={removeSelected} disabled={checkedAssigned.size === 0} className={transferButtonClass}>
            <ChevronLeft className="h-4 w-4" />
            Remove Selected
          </button>
        </div>

        <ReportListPanel
          title="Assigned Reports"
          search={searchAssigned}
          onSearchChange={setSearchAssigned}
          reports={assignedReports}
          checked={checkedAssigned}
          onToggle={(id) => setCheckedAssigned((prev) => toggleId(prev, id))}
          isLoading={accessQuery.isLoading}
          emptyLabel="No reports assigned yet."
        />
      </div>

      {status === "success" && <p className="mt-4 text-sm font-medium text-green-700">Report access updated successfully.</p>}
      {status === "error" && (
        <p className="mt-4 text-sm font-medium text-red-600">Failed to update report access. Please try again.</p>
      )}

      <div className="mt-6 flex justify-end">
        <button
          type="button"
          onClick={handleSave}
          disabled={mutation.isPending}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#232B2B] text-white text-sm
                    font-semibold border border-transparent hover:bg-white hover:text-[#232B2B]
                    hover:border-[#232B2B] transition-all duration-200 disabled:opacity-60 disabled:pointer-events-none"
        >
          {mutation.isPending && (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
          )}
          {mutation.isPending ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </>
  );
}

export default function AdminReportAccessPage(): React.JSX.Element {
  const usersQuery = useQuery({ queryKey: ["admin", "users"], queryFn: fetchAdminUsers });
  const [selectedUserId, setSelectedUserId] = useState("");

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-bold text-gray-800">Report Access Management</h1>
        <p className="text-sm text-gray-400">Assign or revoke per-user report access.</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="project" className={labelClass}>
              Project
            </label>
            <select id="project" className={selectClass} defaultValue="report-server">
              <option value="report-server">Report Server</option>
            </select>
          </div>

          <div>
            <label htmlFor="user" className={labelClass}>
              User
            </label>
            <select
              id="user"
              className={selectClass}
              value={selectedUserId}
              onChange={(event) => setSelectedUserId(event.target.value)}
            >
              <option value="">Select user...</option>
              {usersQuery.data?.map((adminUser) => (
                <option key={adminUser.id} value={adminUser.id}>
                  {adminUser.name} ({adminUser.email})
                </option>
              ))}
            </select>
            {usersQuery.isError && <p className="mt-1 text-xs text-red-600">Unable to load users.</p>}
          </div>
        </div>

        {!selectedUserId && (
          <p className="mt-6 text-sm text-gray-400">Select a user above to manage their report access.</p>
        )}

        {selectedUserId && <ReportAccessEditor key={selectedUserId} userId={selectedUserId} />}
      </div>

      <footer className="text-center text-xs text-gray-400">© 2026 - Business Transformation, IPDC Finance Limited</footer>
    </div>
  );
}
