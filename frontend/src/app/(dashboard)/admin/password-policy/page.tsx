"use client";

import { useState } from "react";
import {
  Shield,
  Lock,
  Users2,
  Ruler,
  CaseUpper,
  CaseLower,
  Hash,
  Asterisk,
  Clock3,
  RotateCcw,
  Zap,
  Timer,
  Eye,
  EyeOff,
  CheckCircle2,
  Circle,
  Save,
} from "lucide-react";
import { Breadcrumb } from "@/components/common/Breadcrumb";
import { CustomSelect } from "@/components/common/CustomSelect";
import { Toggle } from "@/components/common/Toggle";
import { cn } from "@/lib/utils";

const inputClass =
  "w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-700 outline-none " +
  "focus:outline-none focus:ring-2 focus:ring-[#232B2B] focus:border-transparent placeholder:text-gray-300 " +
  "transition-all duration-200";
const labelClass = "mb-1.5 block text-xs font-medium uppercase tracking-wide text-gray-500";
const numberInputClass =
  "w-20 shrink-0 rounded-xl border border-gray-200 bg-white px-3 py-2 text-center text-sm text-gray-700 outline-none " +
  "focus:outline-none focus:ring-2 focus:ring-[#232B2B] focus:border-transparent transition-all duration-200";

interface StatCardData {
  icon: typeof Shield;
  label: string;
  value: string;
  caption: string;
  accent: string;
  dotColor?: string;
}

function StatCard({ icon: Icon, label, value, caption, accent, dotColor }: StatCardData): React.JSX.Element {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-xl" style={{ backgroundColor: `${accent}1A` }}>
          <Icon className="h-4 w-4" style={{ color: accent }} />
        </span>
        <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">{label}</span>
      </div>

      <span className="text-3xl font-bold text-gray-900">{value}</span>

      <div className="flex items-center gap-1.5">
        {dotColor && <span className={cn("h-2 w-2 shrink-0 rounded-full", dotColor)} />}
        <span className="text-xs text-gray-400">{caption}</span>
      </div>
    </div>
  );
}

const STAT_CARDS: StatCardData[] = [
  {
    icon: Shield,
    label: "Policy Status",
    value: "Active",
    caption: "Enforced",
    accent: "#8B5CF6",
    dotColor: "bg-green-500",
  },
  {
    icon: Lock,
    label: "Password Expiry",
    value: "90 Days",
    caption: "Current Setting",
    accent: "#22C55E",
  },
  {
    icon: Users2,
    label: "Affected Users",
    value: "1,256",
    caption: "Total Users",
    accent: "#3B82F6",
  },
];

function RequirementRow({
  icon: Icon,
  accent,
  title,
  description,
  children,
}: {
  icon: typeof Ruler;
  accent: string;
  title: string;
  description: string;
  children: React.ReactNode;
}): React.JSX.Element {
  return (
    <div className="flex flex-col gap-2 rounded-xl border border-gray-100 p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl" style={{ backgroundColor: `${accent}1A` }}>
            <Icon className="h-5 w-5" style={{ color: accent }} />
          </span>
          <p className="text-sm font-semibold text-gray-800">{title}</p>
        </div>
        {children}
      </div>
      <p className="pl-[52px] text-xs text-gray-400">{description}</p>
    </div>
  );
}

function SettingRow({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}): React.JSX.Element {
  return (
    <div className="flex flex-col gap-2 rounded-xl border border-gray-100 p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-blue-600">{title}</p>
        {children}
      </div>
      <p className="text-xs text-gray-400">{description}</p>
    </div>
  );
}

function SmallSelect({ value, onChange, options }: { value: string; onChange: (value: string) => void; options: string[] }): React.JSX.Element {
  return <CustomSelect value={value} onChange={onChange} options={options} className="w-36 shrink-0" />;
}

export default function AdminPasswordPolicyPage(): React.JSX.Element {
  const [minLength, setMinLength] = useState(8);
  const [minUppercase, setMinUppercase] = useState(1);
  const [minLowercase, setMinLowercase] = useState(1);
  const [minNumbers, setMinNumbers] = useState(1);
  const [minSpecial, setMinSpecial] = useState(1);
  const [passwordExpiry, setPasswordExpiry] = useState("90 Days");
  const [preventReuse, setPreventReuse] = useState(5);
  const [accountLockout, setAccountLockout] = useState(true);
  const [maxFailedAttempts, setMaxFailedAttempts] = useState(5);
  const [lockoutDuration, setLockoutDuration] = useState("30 Minutes");

  const [requireStrong, setRequireStrong] = useState(true);
  const [allowUserChange, setAllowUserChange] = useState(true);
  const [expiryWarning, setExpiryWarning] = useState("7 Days");
  const [forceChangeFirstLogin, setForceChangeFirstLogin] = useState(false);
  const [disallowCommon, setDisallowCommon] = useState(true);
  const [disallowUsername, setDisallowUsername] = useState(true);
  const [disallowEmail, setDisallowEmail] = useState(false);
  const [twoFactorAuth, setTwoFactorAuth] = useState(false);

  const [testPassword, setTestPassword] = useState("TestPass123!");
  const [showTestPassword, setShowTestPassword] = useState(false);

  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const handleSavePolicy = (): void => {
    setActionMessage("Password policy saved.");
  };

  const strengthCriteria = [
    { label: "Minimum 8 characters", met: testPassword.length >= 8 },
    { label: "Contains uppercase letter", met: /[A-Z]/.test(testPassword) },
    { label: "Contains lowercase letter", met: /[a-z]/.test(testPassword) },
    { label: "Contains number", met: /[0-9]/.test(testPassword) },
    { label: "Contains special character", met: /[^A-Za-z0-9]/.test(testPassword) },
  ];
  const metCount = strengthCriteria.filter((c) => c.met).length;
  const strengthLabel = testPassword.length === 0 ? "—" : metCount === 5 ? "Strong" : metCount >= 3 ? "Medium" : "Weak";
  const strengthTextClass = metCount === 5 ? "text-green-600" : metCount >= 3 ? "text-amber-600" : "text-red-500";
  const strengthBarClass = metCount === 5 ? "bg-green-500" : metCount >= 3 ? "bg-amber-500" : "bg-red-500";

  return (
    <div className="flex flex-col gap-6">
      <Breadcrumb items={[{ label: "Administration", href: "/admin/dashboard" }, { label: "Password Policy" }]} />

      <div>
        <h1 className="text-xl font-bold text-gray-800">Password Policy</h1>
        <p className="text-sm text-gray-400">Configure password strength and expiry rules.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {STAT_CARDS.map((card) => (
          <StatCard key={card.label} {...card} />
        ))}
      </div>

      {actionMessage && <p className="text-sm font-medium text-gray-600">{actionMessage}</p>}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-gray-100 bg-white shadow-sm">
          <div className="border-b border-gray-100 px-5 py-4">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-500">Password Requirements</h2>
          </div>
          <div className="flex flex-col gap-3 p-5">
            <RequirementRow icon={Ruler} accent="#6366F1" title="Minimum Password Length" description="Minimum number of characters required">
              <input
                type="number"
                min={1}
                value={minLength}
                onChange={(event) => setMinLength(Number(event.target.value))}
                className={numberInputClass}
              />
            </RequirementRow>

            <RequirementRow icon={CaseUpper} accent="#3B82F6" title="Uppercase Letters (A-Z)" description="Minimum uppercase letters required">
              <input
                type="number"
                min={0}
                value={minUppercase}
                onChange={(event) => setMinUppercase(Number(event.target.value))}
                className={numberInputClass}
              />
            </RequirementRow>

            <RequirementRow icon={CaseLower} accent="#06B6D4" title="Lowercase Letters (a-z)" description="Minimum lowercase letters required">
              <input
                type="number"
                min={0}
                value={minLowercase}
                onChange={(event) => setMinLowercase(Number(event.target.value))}
                className={numberInputClass}
              />
            </RequirementRow>

            <RequirementRow icon={Hash} accent="#8B5CF6" title="Numbers (0-9)" description="Minimum numeric digits required">
              <input
                type="number"
                min={0}
                value={minNumbers}
                onChange={(event) => setMinNumbers(Number(event.target.value))}
                className={numberInputClass}
              />
            </RequirementRow>

            <RequirementRow icon={Asterisk} accent="#EC4899" title="Special Characters" description="Minimum special characters required">
              <input
                type="number"
                min={0}
                value={minSpecial}
                onChange={(event) => setMinSpecial(Number(event.target.value))}
                className={numberInputClass}
              />
            </RequirementRow>

            <RequirementRow icon={Clock3} accent="#F59E0B" title="Password Expiry" description="How often passwords must be changed">
              <SmallSelect
                value={passwordExpiry}
                onChange={setPasswordExpiry}
                options={["30 Days", "60 Days", "90 Days", "180 Days", "Never"]}
              />
            </RequirementRow>

            <RequirementRow icon={RotateCcw} accent="#14B8A6" title="Prevent Password Reuse" description="Number of previous passwords disallowed">
              <input
                type="number"
                min={0}
                value={preventReuse}
                onChange={(event) => setPreventReuse(Number(event.target.value))}
                className={numberInputClass}
              />
            </RequirementRow>

            <RequirementRow icon={Lock} accent="#EF4444" title="Account Lockout" description="Lock account after failed login attempts">
              <Toggle label="Account Lockout" checked={accountLockout} onChange={setAccountLockout} activeClassName="bg-[#ED017F]" hideLabel />
            </RequirementRow>

            <RequirementRow icon={Zap} accent="#F97316" title="Max Failed Attempts" description="Failed attempts before lockout">
              <input
                type="number"
                min={1}
                value={maxFailedAttempts}
                onChange={(event) => setMaxFailedAttempts(Number(event.target.value))}
                className={numberInputClass}
              />
            </RequirementRow>

            <RequirementRow icon={Timer} accent="#7C3AED" title="Lockout Duration" description="How long the account stays locked">
              <SmallSelect
                value={lockoutDuration}
                onChange={setLockoutDuration}
                options={["15 Minutes", "30 Minutes", "1 Hour", "24 Hours"]}
              />
            </RequirementRow>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white shadow-sm">
          <div className="border-b border-gray-100 px-5 py-4">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-500">Additional Settings</h2>
          </div>
          <div className="flex flex-col gap-3 p-5">
            <SettingRow title="Require Strong Password" description="Enforce all password complexity rules">
              <Toggle label="Require Strong Password" checked={requireStrong} onChange={setRequireStrong} activeClassName="bg-[#ED017F]" hideLabel />
            </SettingRow>

            <SettingRow title="Allow User to Change Password" description="Users can change their own password">
              <Toggle
                label="Allow User to Change Password"
                checked={allowUserChange}
                onChange={setAllowUserChange}
                activeClassName="bg-[#ED017F]"
                hideLabel
              />
            </SettingRow>

            <SettingRow title="Password Expiry Warning" description="Notify users before password expires">
              <SmallSelect value={expiryWarning} onChange={setExpiryWarning} options={["3 Days", "7 Days", "14 Days", "30 Days"]} />
            </SettingRow>

            <SettingRow title="Force Password Change on First Login" description="Require password change on first login">
              <Toggle
                label="Force Password Change on First Login"
                checked={forceChangeFirstLogin}
                onChange={setForceChangeFirstLogin}
                activeClassName="bg-[#ED017F]"
                hideLabel
              />
            </SettingRow>

            <SettingRow title="Disallow Common Passwords" description="Block passwords from common password lists">
              <Toggle
                label="Disallow Common Passwords"
                checked={disallowCommon}
                onChange={setDisallowCommon}
                activeClassName="bg-[#ED017F]"
                hideLabel
              />
            </SettingRow>

            <SettingRow title="Disallow Username in Password" description="Password cannot contain the username">
              <Toggle
                label="Disallow Username in Password"
                checked={disallowUsername}
                onChange={setDisallowUsername}
                activeClassName="bg-[#ED017F]"
                hideLabel
              />
            </SettingRow>

            <SettingRow title="Disallow Email in Password" description="Password cannot contain the email address">
              <Toggle
                label="Disallow Email in Password"
                checked={disallowEmail}
                onChange={setDisallowEmail}
                activeClassName="bg-[#ED017F]"
                hideLabel
              />
            </SettingRow>

            <SettingRow title="Two-Factor Authentication" description="Require 2FA for all users">
              <Toggle
                label="Two-Factor Authentication"
                checked={twoFactorAuth}
                onChange={setTwoFactorAuth}
                activeClassName="bg-[#ED017F]"
                hideLabel
              />
            </SettingRow>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white shadow-sm">
          <div className="border-b border-gray-100 px-5 py-4">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-500">Password Strength Preview</h2>
            <p className="mt-1 text-xs text-gray-400">Password must meet all requirements</p>
          </div>

          <div className="flex flex-col gap-4 p-5">
            <div>
              <label htmlFor="testPassword" className={labelClass}>
                Test Password
              </label>
              <div className="relative">
                <input
                  id="testPassword"
                  type={showTestPassword ? "text" : "password"}
                  value={testPassword}
                  onChange={(event) => setTestPassword(event.target.value)}
                  className={cn(inputClass, "pr-11")}
                />
                <button
                  type="button"
                  onClick={() => setShowTestPassword((prev) => !prev)}
                  aria-label={showTestPassword ? "Hide password" : "Show password"}
                  className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-400 hover:text-gray-600"
                >
                  {showTestPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <span className={labelClass}>Password Strength</span>
                <span className={cn("text-xs font-semibold", strengthTextClass)}>{strengthLabel}</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
                <div
                  className={cn("h-full rounded-full transition-all duration-300", strengthBarClass)}
                  style={{ width: `${(metCount / 5) * 100}%` }}
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              {strengthCriteria.map((criterion) => (
                <div key={criterion.label} className="flex items-center gap-2 text-sm">
                  {criterion.met ? (
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-green-500" />
                  ) : (
                    <Circle className="h-4 w-4 shrink-0 text-gray-300" />
                  )}
                  <span className={criterion.met ? "text-gray-700" : "text-gray-400"}>{criterion.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleSavePolicy}
          className="inline-flex items-center gap-2 rounded-full border border-[#ED017F] bg-[#ED017F] px-6 py-2.5
                    text-sm font-semibold text-white transition-all duration-200
                    hover:bg-white hover:text-[#ED017F]"
        >
          <Save className="h-4 w-4" />
          Save Policy
        </button>
      </div>

      <footer className="text-center text-xs text-gray-400">© 2026 - Business Transformation, IPDC Finance Limited</footer>
    </div>
  );
}
