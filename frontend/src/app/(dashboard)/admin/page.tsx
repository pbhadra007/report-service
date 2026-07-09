"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createColumnHelper, flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { Search, UserPlus, MoreVertical } from "lucide-react";
import {
  fetchAdminUsers,
  resetAdminUserPassword,
  toggleAdminUserLock,
  deactivateAdminUser,
  type AdminUser,
} from "@/features/admin/api";
import { ROLE_PERMISSIONS } from "@/config/roles.config";
import { cn } from "@/lib/utils";

const ALL_ROLES = Object.keys(ROLE_PERMISSIONS) as (keyof typeof ROLE_PERMISSIONS)[];

const inputClass =
  "w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-700 outline-none " +
  "focus:outline-none focus:ring-2 focus:ring-[#232B2B] focus:border-transparent placeholder:text-gray-300 " +
  "transition-all duration-200";
const selectClass = cn(inputClass, "appearance-none cursor-pointer");
const labelClass = "mb-1.5 block text-xs font-medium uppercase tracking-wide text-gray-500";

type UserAction = "reset-password" | "toggle-lock" | "deactivate";

interface UserActionsMenuProps {
  user: AdminUser;
  onAction: (action: UserAction, user: AdminUser) => void;
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
        className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
      >
        <MoreVertical className="w-4 h-4" />
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

const columnHelper = createColumnHelper<AdminUser>();

export default function AdminPage(): React.JSX.Element {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [actionMessage, setActionMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const queryClient = useQueryClient();
  const usersQuery = useQuery({ queryKey: ["admin", "users"], queryFn: fetchAdminUsers });
  const users = usersQuery.data;

  const resetPasswordMutation = useMutation({
    mutationFn: resetAdminUserPassword,
    onSuccess: () => setActionMessage({ type: "success", text: "Password reset email sent." }),
    onError: () => setActionMessage({ type: "error", text: "Failed to reset password." }),
  });

  const toggleLockMutation = useMutation({
    mutationFn: toggleAdminUserLock,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      setActionMessage({ type: "success", text: "User lock status updated." });
    },
    onError: () => setActionMessage({ type: "error", text: "Failed to update lock status." }),
  });

  const deactivateMutation = useMutation({
    mutationFn: deactivateAdminUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      setActionMessage({ type: "success", text: "User deactivated." });
    },
    onError: () => setActionMessage({ type: "error", text: "Failed to deactivate user." }),
  });

  const handleAction = (action: UserAction, user: AdminUser): void => {
    setActionMessage(null);
    if (action === "reset-password") resetPasswordMutation.mutate(user.id);
    if (action === "toggle-lock") toggleLockMutation.mutate(user.id);
    if (action === "deactivate") deactivateMutation.mutate(user.id);
  };

  const filteredUsers = useMemo(() => {
    const query = search.trim().toLowerCase();
    return (users ?? []).filter((user) => {
      const matchesRole = !roleFilter || user.role === roleFilter;
      const matchesStatus = !statusFilter || (statusFilter === "active" ? user.active : !user.active);
      const matchesSearch =
        !query || user.name.toLowerCase().includes(query) || user.email.toLowerCase().includes(query);
      return matchesRole && matchesStatus && matchesSearch;
    });
  }, [users, search, roleFilter, statusFilter]);

  const columns = useMemo(
    () => [
      columnHelper.accessor("name", {
        header: "Name",
        cell: (info) => <span className="font-medium text-gray-800">{info.getValue()}</span>,
      }),
      columnHelper.accessor("email", {
        header: "Email",
        cell: (info) => <span className="text-gray-600">{info.getValue()}</span>,
      }),
      columnHelper.accessor("role", {
        header: "Role",
        cell: (info) => <span className="text-gray-600">{info.getValue().replace(/_/g, " ")}</span>,
      }),
      columnHelper.accessor("branchId", {
        header: "Branch",
        cell: (info) => <span className="text-gray-600">{info.getValue() ?? "—"}</span>,
      }),
      columnHelper.accessor("active", {
        header: "Status",
        cell: (info) => (
          <span
            className={cn(
              "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium",
              info.getValue() ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-500",
            )}
          >
            {info.getValue() ? "Active" : "Disabled"}
          </span>
        ),
      }),
      columnHelper.display({
        id: "actions",
        header: "Actions",
        cell: (info) => <UserActionsMenu user={info.row.original} onAction={handleAction} />,
      }),
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const table = useReactTable({
    data: filteredUsers,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-800">User Management</h1>
          <p className="text-sm text-gray-400">
            {usersQuery.isLoading ? "Loading users…" : `${users?.length ?? 0} registered users`}
          </p>
        </div>
        <Link
          href="/admin/users/new"
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#232B2B] text-white text-sm
                    font-semibold border border-transparent hover:bg-white hover:text-[#232B2B]
                    hover:border-[#232B2B] transition-all duration-200"
        >
          <UserPlus className="h-4 w-4" />
          Create User
        </Link>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
          <div className="sm:col-span-2">
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
                          outline-none focus:outline-none focus:ring-2 focus:ring-[#232B2B] focus:border-transparent
                          placeholder:text-gray-300 transition-all duration-200"
              />
            </div>
          </div>

          <div>
            <label htmlFor="roleFilter" className={labelClass}>
              Role
            </label>
            <select
              id="roleFilter"
              className={selectClass}
              value={roleFilter}
              onChange={(event) => setRoleFilter(event.target.value)}
            >
              <option value="">All roles</option>
              {ALL_ROLES.map((role) => (
                <option key={role} value={role}>
                  {role.replace(/_/g, " ")}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="statusFilter" className={labelClass}>
              Status
            </label>
            <select
              id="statusFilter"
              className={selectClass}
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
            >
              <option value="">All statuses</option>
              <option value="active">Active</option>
              <option value="disabled">Disabled</option>
            </select>
          </div>
        </div>

        <p className="mt-4 text-xs text-gray-400">
          Showing {filteredUsers.length} of {users?.length ?? 0} users
        </p>

        {actionMessage && (
          <p className={cn("mt-4 text-sm font-medium", actionMessage.type === "success" ? "text-green-700" : "text-red-600")}>
            {actionMessage.text}
          </p>
        )}

        <div className="mt-4 overflow-x-auto rounded-xl border border-gray-100">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-white">
                {table.getFlatHeaders().map((header) => (
                  <th key={header.id} className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-gray-400">
                    {flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {usersQuery.isLoading && (
                <tr>
                  <td colSpan={columns.length} className="px-4 py-6 text-center text-sm text-gray-400">
                    Loading users...
                  </td>
                </tr>
              )}
              {usersQuery.isError && (
                <tr>
                  <td colSpan={columns.length} className="px-4 py-6 text-center text-sm text-red-600">
                    Failed to load users.
                  </td>
                </tr>
              )}
              {!usersQuery.isLoading && !usersQuery.isError && filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={columns.length} className="px-4 py-6 text-center text-sm text-gray-400">
                    No users found.
                  </td>
                </tr>
              )}
              {!usersQuery.isLoading &&
                !usersQuery.isError &&
                table.getRowModel().rows.map((row, index) => (
                  <tr key={row.id} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-4 py-3">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      <footer className="text-center text-xs text-gray-400">© 2026 - Business Transformation, IPDC Finance Limited</footer>
    </div>
  );
}
