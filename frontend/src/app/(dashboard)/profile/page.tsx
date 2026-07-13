"use client";

import { useState } from "react";
import { Lock, Pencil, X } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  const initials = parts.length > 1 ? `${parts[0][0]}${parts[parts.length - 1][0]}` : parts[0]?.slice(0, 2);
  return (initials ?? "").toUpperCase();
}

const inputClass =
  "w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-700 outline-none " +
  "focus:outline-none focus:ring-2 focus:ring-[#232B2B] focus:border-transparent placeholder:text-gray-300 " +
  "transition-all duration-200";
const labelClass = "text-xs font-medium uppercase tracking-wide text-gray-500";

interface EditableProfile {
  name: string;
  email: string;
  designation: string;
}

function LockedField({ label, value }: { label: string; value: string }): React.JSX.Element {
  return (
    <div>
      <p className={labelClass}>{label}</p>
      <p className="mt-1 text-sm font-medium text-gray-800">{value}</p>
    </div>
  );
}

function LockedFieldWithIcon({ label, value }: { label: string; value: string }): React.JSX.Element {
  return (
    <div>
      <p className={labelClass}>{label}</p>
      <div className="mt-1 flex items-center gap-1.5">
        <Lock className="h-3.5 w-3.5 text-gray-300" />
        <p className="text-sm font-medium text-gray-500">{value}</p>
      </div>
    </div>
  );
}

export default function ProfilePage(): React.JSX.Element {
  const { user, isLoading } = useAuth();

  const [isEditing, setIsEditing] = useState(false);
  const [overrides, setOverrides] = useState<EditableProfile | null>(null);
  const [formValues, setFormValues] = useState<EditableProfile>({ name: "", email: "", designation: "" });
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const displayed: EditableProfile | null = user
    ? (overrides ?? { name: user.name, email: user.email, designation: user.designation ?? user.role.replace(/_/g, " ") })
    : null;

  const handleStartEdit = (): void => {
    if (!displayed) return;
    setFormValues(displayed);
    setActionMessage(null);
    setIsEditing(true);
  };

  const handleCancel = (): void => {
    setIsEditing(false);
  };

  const handleSave = (): void => {
    setOverrides(formValues);
    setIsEditing(false);
    setActionMessage("Profile updated for this session.");
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-bold text-gray-800">Profile</h1>
        <p className="text-sm text-gray-400">Your account details.</p>
      </div>

      {actionMessage && <p className="text-sm font-medium text-gray-600">{actionMessage}</p>}

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

      {!isLoading && user && displayed && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center justify-between gap-4 border-b border-gray-100 pb-6">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-[#ED017F] text-xl font-semibold text-white">
                {getInitials(displayed.name)}
              </div>
              <div>
                <p className="text-lg font-semibold text-gray-800">{displayed.name}</p>
                <p className="text-sm text-gray-400">{displayed.designation}</p>
              </div>
            </div>

            {!isEditing && (
              <button
                type="button"
                onClick={handleStartEdit}
                className="inline-flex items-center gap-2 rounded-xl border border-transparent bg-[#232B2B] px-5 py-2.5
                          text-sm font-semibold text-white transition-all duration-200 hover:border-[#232B2B]
                          hover:bg-white hover:text-[#232B2B]"
              >
                <Pencil className="h-4 w-4" />
                Edit Profile
              </button>
            )}
          </div>

          {!isEditing ? (
            <>
              <div className="mt-2 flex items-center gap-1.5 pt-4 text-xs font-medium text-gray-400">
                <Lock className="h-3.5 w-3.5" />
                This profile is in locked mode. Click Edit Profile to make changes.
              </div>

              <div className="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-2">
                <LockedField label="Full Name" value={displayed.name} />
                <LockedField label="Email" value={displayed.email} />
                <LockedField label="Designation" value={displayed.designation} />
                <LockedFieldWithIcon label="Employee ID" value={user.employeeId ?? "—"} />
                <LockedFieldWithIcon label="Role" value={user.role.replace(/_/g, " ")} />
                <LockedFieldWithIcon label="Branch" value={user.branchId ?? "—"} />
                <LockedFieldWithIcon label="Admin Access" value={user.isAdmin ? "Yes" : "No"} />
              </div>
            </>
          ) : (
            <div className="mt-6 flex flex-col gap-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="profileName" className={labelClass}>
                    Full Name
                  </label>
                  <input
                    id="profileName"
                    type="text"
                    value={formValues.name}
                    onChange={(event) => setFormValues((prev) => ({ ...prev, name: event.target.value }))}
                    className={`mt-1.5 ${inputClass}`}
                  />
                </div>
                <div>
                  <label htmlFor="profileEmail" className={labelClass}>
                    Email
                  </label>
                  <input
                    id="profileEmail"
                    type="email"
                    value={formValues.email}
                    onChange={(event) => setFormValues((prev) => ({ ...prev, email: event.target.value }))}
                    className={`mt-1.5 ${inputClass}`}
                  />
                </div>
                <div>
                  <label htmlFor="profileDesignation" className={labelClass}>
                    Designation
                  </label>
                  <input
                    id="profileDesignation"
                    type="text"
                    value={formValues.designation}
                    onChange={(event) => setFormValues((prev) => ({ ...prev, designation: event.target.value }))}
                    className={`mt-1.5 ${inputClass}`}
                  />
                </div>
                <LockedFieldWithIcon label="Employee ID" value={user.employeeId ?? "—"} />
                <LockedFieldWithIcon label="Role" value={user.role.replace(/_/g, " ")} />
                <LockedFieldWithIcon label="Branch" value={user.branchId ?? "—"} />
                <LockedFieldWithIcon label="Admin Access" value={user.isAdmin ? "Yes" : "No"} />
              </div>

              <div className="flex items-center justify-end gap-3 border-t border-gray-100 pt-4">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-5 py-2.5
                            text-sm font-semibold text-gray-700 transition-all duration-200 hover:bg-gray-50"
                >
                  <X className="h-4 w-4" />
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  className="inline-flex items-center gap-2 rounded-xl border border-transparent bg-[#232B2B] px-5 py-2.5
                            text-sm font-semibold text-white transition-all duration-200 hover:border-[#232B2B]
                            hover:bg-white hover:text-[#232B2B]"
                >
                  Save Changes
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}