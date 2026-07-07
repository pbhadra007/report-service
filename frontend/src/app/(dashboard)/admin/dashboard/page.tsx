"use client";

import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";

export default function AdminDashboardPage(): React.JSX.Element {
  const { user } = useAuth();

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
        <h1 className="text-xl font-semibold text-gray-800">Welcome back, {user?.name ?? "Admin"}!</h1>
        <p className="text-sm text-gray-500">Manage users and report access from the Administration section.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Link
          href="/admin"
          className="flex flex-col gap-2 rounded-xl border border-gray-100 bg-white p-4 shadow-sm transition hover:border-ipdc-pink hover:shadow-md"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-ipdc-pink-50 text-lg text-ipdc-pink">
            👥
          </span>
          <p className="text-sm font-semibold text-gray-800">User Management</p>
          <p className="text-xs text-gray-400">View and manage IPDC report service users</p>
        </Link>
      </div>
    </div>
  );
}
