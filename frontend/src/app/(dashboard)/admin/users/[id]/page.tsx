"use client";

import { use } from "react";
import Link from "next/link";
import { ArrowLeft, UserCog } from "lucide-react";

export interface AdminEditUserPageProps {
  params: Promise<{ id: string }>;
}

export default function AdminEditUserPage({ params }: AdminEditUserPageProps): React.JSX.Element {
  const { id } = use(params);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <Link
          href="/admin"
          aria-label="Back to User Management"
          className="rounded-xl p-2 transition-colors hover:bg-gray-100"
        >
          <ArrowLeft className="h-4 w-4 text-gray-500" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-gray-800">Edit User</h1>
          <p className="text-sm text-gray-400">User ID: {id}</p>
        </div>
      </div>

      <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-gray-100 bg-white p-12 text-center shadow-sm">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#FFF0F9]">
          <UserCog className="h-6 w-6 text-[#ED017F]" />
        </div>
        <p className="text-sm font-semibold text-gray-800">User editing coming soon</p>
        <p className="max-w-sm text-xs text-gray-400">
          The ability to edit an existing user&apos;s details and security policy will be available here in a future release.
        </p>
      </div>

      <footer className="text-center text-xs text-gray-400">© 2026 - Business Transformation, IPDC Finance Limited</footer>
    </div>
  );
}
