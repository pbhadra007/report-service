"use client";

import { useEffect, useState } from "react";
import { format, parseISO } from "date-fns";
import {
  Camera,
  Mail,
  Phone,
  MapPin,
  Pencil,
  UserCircle,
  ShieldCheck,
  IdCard,
  Calendar,
  CalendarDays,
  ChevronDown,
  X,
  Check,
  Eye,
  EyeOff,
} from "lucide-react";
import { Breadcrumb } from "@/components/common/Breadcrumb";
import { useAuth } from "@/hooks/useAuth";
import type { User } from "@/types";
import { cn } from "@/lib/utils";

interface ProfileFields {
  fullName: string;
  dateOfBirth: string;
  branch: string;
  department: string;
  designation: string;
  seniority: string;
  supervisor: string;
  teamLeader: string;
  phone: string;
  address: string;
  email: string;
}

function buildProfileFromUser(user: User): ProfileFields {
  return {
    fullName: user.name,
    dateOfBirth: "1990-01-01",
    branch: user.branchId ?? "Unassigned",
    department: "Branch Operations",
    designation: user.designation ?? user.role.replace(/_/g, " "),
    seniority: "Officer",
    supervisor: "—",
    teamLeader: "—",
    phone: "01700000000",
    address: "—",
    email: user.email,
  };
}

const BRANCH_OPTIONS = ["Dhaka Main", "Chattogram", "Sylhet", "Khulna", "Rajshahi", "Barishal", "Unassigned"];
const DEPARTMENT_OPTIONS = ["IT & Operations", "Executive", "Finance", "Compliance", "Credit", "Treasury", "Branch Operations"];
const SENIORITY_OPTIONS = [
  "Intern",
  "Trainee",
  "Junior Officer",
  "Officer",
  "Senior Officer",
  "Assistant Manager",
  "Manager",
  "Senior Manager",
  "Assistant Vice President",
  "Vice President",
  "Senior Vice President",
  "Executive Vice President",
];

const inputClass =
  "w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-700 outline-none " +
  "focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent placeholder:text-gray-300 " +
  "transition-all duration-200";
const modalInputClass =
  "w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-700 outline-none " +
  "focus:outline-none focus:ring-2 focus:ring-[#ED017F] focus:border-transparent placeholder:text-gray-300 " +
  "transition-all duration-200";
const modalSelectClass = cn(modalInputClass, "appearance-none cursor-pointer pr-9");
const labelClass = "text-xs font-medium uppercase tracking-wide text-gray-500";

function formatDob(iso: string): string {
  try {
    return format(parseISO(iso), "dd MMM yyyy");
  } catch {
    return iso;
  }
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  const initials = parts.length > 1 ? `${parts[0][0]}${parts[parts.length - 1][0]}` : parts[0]?.slice(0, 2);
  return (initials ?? "").toUpperCase();
}

function HeroField({ label, value }: { label: string; value: string }): React.JSX.Element {
  return (
    <div>
      <p className="text-xs text-gray-400">{label}</p>
      <p className="text-sm font-bold text-gray-800">{value}</p>
    </div>
  );
}

interface PersonalRowProps {
  icon: typeof UserCircle;
  label: string;
  value: string;
  multiline?: boolean;
}

function PersonalRow({ icon: Icon, label, value, multiline }: PersonalRowProps): React.JSX.Element {
  return (
    <div className="flex items-start gap-3 border-t border-gray-50 py-3 first:border-t-0 first:pt-0">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gray-50">
        <Icon className="h-4 w-4 text-gray-400" />
      </span>
      <span className="w-36 shrink-0 pt-1.5 text-sm text-gray-500">{label}</span>
      <p className={cn("flex-1 pt-1 text-sm font-medium text-gray-800", multiline && "whitespace-pre-line")}>{value}</p>
    </div>
  );
}

interface ModalSelectProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
}

function ModalSelect({ id, label, value, onChange, options }: ModalSelectProps): React.JSX.Element {
  const resolvedOptions = options.includes(value) ? options : [value, ...options];
  return (
    <div>
      <label htmlFor={id} className={labelClass}>
        {label}
      </label>
      <div className="relative mt-1.5">
        <select id={id} value={value} onChange={(event) => onChange(event.target.value)} className={modalSelectClass}>
          {resolvedOptions.map((option) => (
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

interface ModalTextFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
}

function ModalTextField({ id, label, value, onChange }: ModalTextFieldProps): React.JSX.Element {
  return (
    <div>
      <label htmlFor={id} className={labelClass}>
        {label}
      </label>
      <input id={id} value={value} onChange={(event) => onChange(event.target.value)} className={cn(modalInputClass, "mt-1.5")} />
    </div>
  );
}

interface EditProfileModalProps {
  profile: ProfileFields;
  onClose: () => void;
  onSave: (profile: ProfileFields) => void;
}

function EditProfileModal({ profile, onClose, onSave }: EditProfileModalProps): React.JSX.Element {
  const [values, setValues] = useState<ProfileFields>(profile);

  const update = <K extends keyof ProfileFields>(key: K, value: ProfileFields[K]): void => {
    setValues((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative flex max-h-[90vh] w-full max-w-xl flex-col rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <h2 className="text-sm font-semibold text-gray-800">Edit Profile</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-full p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4 overflow-y-auto px-6 py-5 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <ModalTextField id="editFullName" label="Full Name" value={values.fullName} onChange={(v) => update("fullName", v)} />
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="editDob" className={labelClass}>
              Date of Birth
            </label>
            <div className="relative mt-1.5">
              <input
                id="editDob"
                type="date"
                value={values.dateOfBirth}
                onChange={(event) => update("dateOfBirth", event.target.value)}
                className={cn(
                  modalInputClass,
                  "pr-11",
                  "[&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:inset-0 [&::-webkit-calendar-picker-indicator]:opacity-0",
                )}
              />
              <CalendarDays className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#ED017F]" />
            </div>
          </div>

          <ModalSelect id="editBranch" label="Branch" value={values.branch} onChange={(v) => update("branch", v)} options={BRANCH_OPTIONS} />
          <ModalSelect
            id="editDepartment"
            label="Department"
            value={values.department}
            onChange={(v) => update("department", v)}
            options={DEPARTMENT_OPTIONS}
          />

          <ModalTextField id="editDesignation" label="Designation" value={values.designation} onChange={(v) => update("designation", v)} />

          <ModalSelect
            id="editSeniority"
            label="Seniority"
            value={values.seniority}
            onChange={(v) => update("seniority", v)}
            options={SENIORITY_OPTIONS}
          />
          <ModalTextField id="editSupervisor" label="Supervisor" value={values.supervisor} onChange={(v) => update("supervisor", v)} />

          <ModalTextField id="editTeamLeader" label="Team Leader" value={values.teamLeader} onChange={(v) => update("teamLeader", v)} />
          <div>
            <label htmlFor="editPhone" className={labelClass}>
              Phone
            </label>
            <div className="mt-1.5 flex items-center overflow-hidden rounded-xl border border-gray-200 bg-white pl-4 pr-1 focus-within:ring-2 focus-within:ring-[#ED017F]">
              <span className="select-none whitespace-nowrap text-sm font-medium text-gray-400">+88</span>
              <input
                id="editPhone"
                type="text"
                value={values.phone}
                onChange={(event) => update("phone", event.target.value)}
                className="min-w-0 flex-1 bg-transparent py-2.5 pl-1 pr-3 text-sm text-gray-700 outline-none"
              />
            </div>
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="editAddress" className={labelClass}>
              Address
            </label>
            <textarea
              id="editAddress"
              value={values.address}
              onChange={(event) => update("address", event.target.value)}
              rows={3}
              className={cn(modalInputClass, "mt-1.5 resize-none")}
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 border-t border-gray-100 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-gray-200 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => onSave(values)}
            className="rounded-full border border-[#ED017F] bg-[#ED017F] px-5 py-2.5 text-sm font-semibold text-white transition-all duration-200 hover:bg-white hover:text-[#ED017F]"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}

const PASSWORD_CRITERIA = [
  { label: "Minimum 8 characters", test: (value: string) => value.length >= 8 },
  { label: "Contains uppercase letter", test: (value: string) => /[A-Z]/.test(value) },
  { label: "Contains lowercase letter", test: (value: string) => /[a-z]/.test(value) },
  { label: "Contains number", test: (value: string) => /[0-9]/.test(value) },
  { label: "Contains special character", test: (value: string) => /[^A-Za-z0-9]/.test(value) },
];

interface PasswordFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  visible: boolean;
  onToggleVisible: () => void;
  error?: string;
}

function PasswordField({ id, label, value, onChange, visible, onToggleVisible, error }: PasswordFieldProps): React.JSX.Element {
  return (
    <div>
      <label htmlFor={id} className={labelClass}>
        {label}
      </label>
      <div className="relative mt-1.5">
        <input
          id={id}
          type={visible ? "text" : "password"}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className={cn(inputClass, "pr-11", error && "border-red-500 focus:ring-red-500")}
        />
        <button
          type="button"
          onClick={onToggleVisible}
          aria-label={visible ? "Hide password" : "Show password"}
          className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-400 hover:text-gray-600"
        >
          {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}

interface ChangePasswordModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

function ChangePasswordModal({ onClose, onSuccess }: ChangePasswordModalProps): React.JSX.Element {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors] = useState<{ current?: string; new?: string; confirm?: string }>({});

  const metCount = PASSWORD_CRITERIA.filter((criterion) => criterion.test(newPassword)).length;
  const strengthLabel = newPassword.length === 0 ? "—" : metCount === 5 ? "Strong" : metCount >= 3 ? "Medium" : "Weak";
  const strengthTextClass = metCount === 5 ? "text-green-600" : metCount >= 3 ? "text-amber-600" : "text-red-500";
  const strengthBarClass = metCount === 5 ? "bg-green-500" : metCount >= 3 ? "bg-amber-500" : "bg-red-500";

  const handleSubmit = (): void => {
    const nextErrors: { current?: string; new?: string; confirm?: string } = {};
    if (!currentPassword) nextErrors.current = "Current password is required";
    if (metCount < 5) nextErrors.new = "Password does not meet the minimum requirements";
    if (!confirmPassword || confirmPassword !== newPassword) nextErrors.confirm = "Passwords do not match";

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length === 0) {
      onSuccess();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative flex w-full max-w-lg flex-col rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <h2 className="text-sm font-semibold text-gray-800">Change Password</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-full p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex flex-col gap-4 px-6 py-5">
          <PasswordField
            id="currentPassword"
            label="Current Password"
            value={currentPassword}
            onChange={setCurrentPassword}
            visible={showCurrent}
            onToggleVisible={() => setShowCurrent((prev) => !prev)}
            error={errors.current}
          />
          <PasswordField
            id="newPassword"
            label="New Password"
            value={newPassword}
            onChange={setNewPassword}
            visible={showNew}
            onToggleVisible={() => setShowNew((prev) => !prev)}
            error={errors.new}
          />

          <div>
            <div className="flex items-center justify-between">
              <span className={labelClass}>Password Strength</span>
              <span className={cn("text-xs font-semibold", strengthTextClass)}>{strengthLabel}</span>
            </div>
            <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
              <div
                className={cn("h-full rounded-full transition-all duration-300", strengthBarClass)}
                style={{ width: `${(metCount / PASSWORD_CRITERIA.length) * 100}%` }}
              />
            </div>

            <ul className="mt-2.5 grid grid-cols-1 gap-1.5 sm:grid-cols-2">
              {PASSWORD_CRITERIA.map((criterion) => {
                const met = criterion.test(newPassword);
                return (
                  <li key={criterion.label} className={cn("flex items-center gap-1.5 text-xs", met ? "text-green-600" : "text-gray-400")}>
                    {met ? <Check className="h-3.5 w-3.5 shrink-0" /> : <X className="h-3.5 w-3.5 shrink-0" />}
                    {criterion.label}
                  </li>
                );
              })}
            </ul>
          </div>

          <PasswordField
            id="confirmPassword"
            label="Confirm New Password"
            value={confirmPassword}
            onChange={setConfirmPassword}
            visible={showConfirm}
            onToggleVisible={() => setShowConfirm((prev) => !prev)}
            error={errors.confirm}
          />
        </div>

        <div className="flex justify-end gap-3 border-t border-gray-100 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-gray-200 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="rounded-full border border-[#ED017F] bg-[#ED017F] px-5 py-2.5 text-sm font-semibold text-white transition-all duration-200 hover:bg-white hover:text-[#ED017F]"
          >
            Update Password
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ProfilePage(): React.JSX.Element {
  const { user, isLoading } = useAuth();

  const [profile, setProfile] = useState<ProfileFields | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [lastPasswordChange, setLastPasswordChange] = useState("20 May 2026, 09:15 AM");

  useEffect(() => {
    if (user && !profile) {
      setProfile(buildProfileFromUser(user));
    }
  }, [user, profile]);

  const handleSaveProfile = (values: ProfileFields): void => {
    setProfile(values);
    setShowEditModal(false);
    setActionMessage("Profile updated for this session.");
  };

  const handlePasswordSuccess = (): void => {
    setShowPasswordModal(false);
    setLastPasswordChange("13 Jul 2026, 03:45 PM");
    setActionMessage("Password changed successfully.");
  };

  return (
    <div className="flex flex-col gap-6">
      <Breadcrumb items={[{ label: "Dashboard", href: "/dashboard" }, { label: "Profile" }]} />

      <div>
        <h1 className="text-xl font-bold text-gray-800">Profile</h1>
        <p className="text-sm text-gray-400">Manage your personal information and account security.</p>
      </div>

      {actionMessage && <p className="text-sm font-medium text-gray-600">{actionMessage}</p>}

      {isLoading && (
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <p className="text-sm text-gray-400">Loading profile...</p>
        </div>
      )}

      {!isLoading && !user && (
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-red-600">No active session.</p>
        </div>
      )}

      {!isLoading && user && profile && (
        <>
          <div className="relative rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <button
              type="button"
              onClick={() => setShowEditModal(true)}
              className="absolute right-6 top-6 inline-flex items-center gap-2 rounded-full border border-[#ED017F] bg-[#ED017F] px-5 py-2.5
                        text-sm font-semibold text-white transition-all duration-200
                        hover:bg-white hover:text-[#ED017F]"
            >
              <Pencil className="h-4 w-4" />
              Edit Profile
            </button>

            <div className="flex flex-col divide-y divide-gray-100 lg:flex-row lg:divide-x lg:divide-y-0 lg:pr-40">
              <div className="flex flex-col gap-3 pb-6 lg:w-[30%] lg:pb-0 lg:pr-6">
                <div className="relative h-24 w-24">
                  <div className="flex h-24 w-24 items-center justify-center rounded-full bg-indigo-500 text-3xl font-bold text-white ring-4 ring-indigo-100">
                    {getInitials(profile.fullName)}
                  </div>
                  <button
                    type="button"
                    aria-label="Change avatar"
                    className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500 shadow-sm transition-colors hover:text-gray-700"
                  >
                    <Camera className="h-4 w-4" />
                  </button>
                </div>

                <div>
                  <p className="text-xl font-bold text-gray-800">{profile.fullName}</p>
                  <span className="mt-1 inline-flex rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600">
                    {profile.designation}
                  </span>
                </div>

                <div className="flex flex-col gap-1.5 text-sm text-gray-600">
                  <span className="inline-flex items-center gap-2">
                    <Mail className="h-4 w-4 text-gray-400" />
                    {profile.email}
                  </span>
                  <span className="inline-flex items-center gap-2">
                    <Phone className="h-4 w-4 text-gray-400" />
                    +88{profile.phone}
                  </span>
                  <span className="inline-flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    {profile.branch}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-green-200 bg-green-50 px-2.5 py-1 text-xs font-medium text-green-700">
                    <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                    Active
                  </span>
                  <span className="text-xs text-gray-400">Last login: 12 Jun 2026, 10:30 AM</span>
                </div>
              </div>

              <div className="flex flex-col gap-4 py-6 lg:flex-1 lg:px-6 lg:py-0">
                <HeroField label="Employee ID" value={user.employeeId ?? "—"} />
                <HeroField label="User ID" value={user.id} />
                <HeroField label="Role" value={user.role.replace(/_/g, " ")} />
              </div>

              <div className="flex flex-col gap-4 py-6 lg:flex-1 lg:px-6 lg:py-0">
                <HeroField label="Branch" value={profile.branch} />
                <HeroField label="Department" value={profile.department} />
                <HeroField label="Designation" value={profile.designation} />
              </div>

              <div className="flex flex-col gap-4 pt-6 lg:flex-1 lg:pl-6 lg:pt-0">
                <HeroField label="Seniority" value={profile.seniority} />
                <HeroField label="Supervisor" value={profile.supervisor} />
                <HeroField label="Team Leader" value={profile.teamLeader} />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            <div className="rounded-2xl border border-gray-100 bg-white shadow-sm">
              <div className="flex items-center gap-2.5 border-b border-gray-100 px-5 py-4">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#FFE6F4]">
                  <UserCircle className="h-4 w-4 text-[#ED017F]" />
                </span>
                <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-500">Personal Information</h2>
              </div>

              <div className="flex flex-col px-5 py-2">
                <PersonalRow icon={IdCard} label="Full Name" value={profile.fullName} />
                <PersonalRow icon={Calendar} label="Date of Birth" value={formatDob(profile.dateOfBirth)} />
                <PersonalRow icon={MapPin} label="Address" value={profile.address} multiline />
                <PersonalRow icon={Phone} label="Phone" value={`+88${profile.phone}`} />
                <PersonalRow icon={Mail} label="Email" value={profile.email} />
              </div>
            </div>

            <div className="rounded-2xl border border-gray-100 bg-white shadow-sm">
              <div className="flex items-center gap-2.5 border-b border-gray-100 px-5 py-4">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-green-50">
                  <ShieldCheck className="h-4 w-4 text-green-600" />
                </span>
                <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-500">Account Security</h2>
              </div>

              <div className="flex flex-col gap-4 p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className={labelClass}>Password</p>
                    <p className="mt-1 text-sm font-medium text-gray-800">••••••••••</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowPasswordModal(true)}
                    className="rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50"
                  >
                    Change
                  </button>
                </div>

                <div className="flex items-center justify-between border-t border-gray-50 pt-4">
                  <div>
                    <p className={labelClass}>Two-Factor Authentication</p>
                    <span className="mt-1 inline-flex items-center gap-1.5 rounded-full border border-green-200 bg-green-50 px-2.5 py-1 text-xs font-medium text-green-700">
                      <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                      Enabled
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActionMessage("Managing two-factor authentication isn't supported yet.")}
                    className="rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50"
                  >
                    Manage
                  </button>
                </div>

                <div className="border-t border-gray-50 pt-4">
                  <p className={labelClass}>Last Password Change</p>
                  <p className="mt-1 text-sm font-medium text-gray-800">{lastPasswordChange}</p>
                </div>

                <div className="border-t border-gray-50 pt-4">
                  <p className={labelClass}>Password Expires On</p>
                  <p className="mt-1 text-sm font-medium text-gray-800">20 Aug 2026, 09:15 AM</p>
                </div>

                <div className="border-t border-gray-50 pt-4">
                  <p className={labelClass}>Login Sessions</p>
                  <p className="mt-1 text-sm font-medium text-gray-800">2 Active Sessions</p>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {showEditModal && profile && (
        <EditProfileModal profile={profile} onClose={() => setShowEditModal(false)} onSave={handleSaveProfile} />
      )}
      {showPasswordModal && <ChangePasswordModal onClose={() => setShowPasswordModal(false)} onSuccess={handlePasswordSuccess} />}
    </div>
  );
}
