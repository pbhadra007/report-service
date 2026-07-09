"use client";

import { useAuth } from "@/hooks/useAuth";

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  const initials = parts.length > 1 ? `${parts[0][0]}${parts[parts.length - 1][0]}` : parts[0]?.slice(0, 2);
  return (initials ?? "").toUpperCase();
}

interface ProfileFieldProps {
  label: string;
  value: string;
}

function ProfileField({ label, value }: ProfileFieldProps): React.JSX.Element {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-gray-500">{label}</p>
      <p className="mt-1 text-sm font-medium text-gray-800">{value}</p>
    </div>
  );
}

export default function ProfilePage(): React.JSX.Element {
  const { user, isLoading } = useAuth();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-bold text-gray-800">Profile</h1>
        <p className="text-sm text-gray-400">Your account details.</p>
      </div>

      {isLoading && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <p className="text-sm text-gray-400">Loading profile...</p>
        </div>
      )}

      {!isLoading && !user && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <p className="text-sm font-medium text-red-600">No active session.</p>
        </div>
      )}

      {!isLoading && user && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center gap-4 border-b border-gray-100 pb-6">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-[#ED017F] text-xl font-semibold text-white">
              {getInitials(user.name)}
            </div>
            <div>
              <p className="text-lg font-semibold text-gray-800">{user.name}</p>
              <p className="text-sm text-gray-400">{user.designation ?? user.role.replace(/_/g, " ")}</p>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
            <ProfileField label="Employee ID" value={user.employeeId ?? "—"} />
            <ProfileField label="Email" value={user.email} />
            <ProfileField label="Role" value={user.role.replace(/_/g, " ")} />
            <ProfileField label="Branch" value={user.branchId ?? "—"} />
            <ProfileField label="Admin Access" value={user.isAdmin ? "Yes" : "No"} />
          </div>
        </div>
      )}

      <footer className="text-center text-xs text-gray-400">© 2026 - Business Transformation, IPDC Finance Limited</footer>
    </div>
  );
}
