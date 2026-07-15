"use client";

import { useState } from "react";
import { format } from "date-fns";
import {
  Mail,
  ShieldCheck,
  Clock3,
  CheckCircle2,
  XCircle,
  Server,
  User,
  Settings2,
  Eye,
  EyeOff,
  Save,
  Send,
} from "lucide-react";
import { Breadcrumb } from "@/components/common/Breadcrumb";
import { CustomSelect } from "@/components/common/CustomSelect";
import { Toggle } from "@/components/common/Toggle";
import { cn } from "@/lib/utils";

const MOCK_SMTP_STATUS = {
  active: true,
  tlsEnabled: true,
};

const inputClass =
  "w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-700 outline-none " +
  "focus:outline-none focus:ring-2 focus:ring-[#232B2B] focus:border-transparent placeholder:text-gray-300 " +
  "transition-all duration-200";
const labelClass = "mb-1.5 block text-xs font-medium uppercase tracking-wide text-gray-500";

interface StatusCardData {
  icon: typeof Mail;
  label: string;
  value: string;
  caption: string;
  accent: string;
  dotColor?: string;
  statusIcon?: typeof CheckCircle2;
}

function StatusCard({ icon: Icon, label, value, caption, accent, dotColor, statusIcon: StatusIcon }: StatusCardData): React.JSX.Element {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-gray-100 bg-white p-5 shadow-md">
      <div className="flex items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-xl" style={{ backgroundColor: `${accent}1A` }}>
          <Icon className="h-4 w-4" style={{ color: accent }} />
        </span>
        <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">{label}</span>
      </div>

      <div className="flex items-center gap-2">
        {dotColor && <span className={cn("h-2.5 w-2.5 shrink-0 rounded-full", dotColor)} />}
        {StatusIcon && <StatusIcon className="h-5 w-5 shrink-0" style={{ color: accent }} />}
        <span className="text-2xl font-bold text-gray-900">{value}</span>
      </div>

      <p className="text-xs text-gray-400">{caption}</p>
    </div>
  );
}

function ColumnHeader({ icon: Icon, title }: { icon: typeof Server; title: string }): React.JSX.Element {
  return (
    <div className="flex items-center gap-2">
      <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-gray-100">
        <Icon className="h-4 w-4 text-gray-600" />
      </span>
      <h3 className="text-sm font-semibold text-gray-800">{title}</h3>
    </div>
  );
}

export default function AdminSmtpPage(): React.JSX.Element {
  const [smtpHost, setSmtpHost] = useState("smtp.office365.com");
  const [smtpPort, setSmtpPort] = useState(587);
  const [encryption, setEncryption] = useState("TLS");
  const [authEnabled, setAuthEnabled] = useState(true);
  const [timeoutSeconds, setTimeoutSeconds] = useState(30);

  const [emailAddress, setEmailAddress] = useState("noreply@ipdc.com.bd");
  const [username, setUsername] = useState("smtp-user");
  const [password, setPassword] = useState("smtp-secret-pass");
  const [showPassword, setShowPassword] = useState(false);

  const [senderName, setSenderName] = useState("IPDC Finance");
  const [replyToEmail, setReplyToEmail] = useState("support@ipdc.com.bd");
  const [signature, setSignature] = useState("Business Transformation Team");

  const [testRecipient, setTestRecipient] = useState("");
  const [testSubject, setTestSubject] = useState("SMTP Test Email");
  const [testMessage, setTestMessage] = useState(
    "This is a test email to verify your SMTP configuration is working correctly.",
  );

  const [lastTestAt, setLastTestAt] = useState("11-Jul-26, 02:45 PM");
  const [lastTestPassed, setLastTestPassed] = useState(true);

  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const statusCards: StatusCardData[] = [
    {
      icon: Mail,
      label: "SMTP Status",
      value: MOCK_SMTP_STATUS.active ? "Active" : "Inactive",
      caption: "Outgoing mail server connection",
      accent: MOCK_SMTP_STATUS.active ? "#22C55E" : "#9CA3AF",
      dotColor: MOCK_SMTP_STATUS.active ? "bg-green-500" : "bg-gray-400",
    },
    {
      icon: ShieldCheck,
      label: "Encryption",
      value: MOCK_SMTP_STATUS.tlsEnabled ? "TLS Enabled" : "TLS Disabled",
      caption: "Connection security",
      accent: MOCK_SMTP_STATUS.tlsEnabled ? "#3B82F6" : "#EF4444",
      dotColor: MOCK_SMTP_STATUS.tlsEnabled ? "bg-blue-500" : "bg-red-500",
    },
    {
      icon: Clock3,
      label: "Last Test",
      value: lastTestAt,
      caption: lastTestPassed ? "Test completed successfully" : "Test failed — check credentials",
      accent: lastTestPassed ? "#22C55E" : "#EF4444",
      statusIcon: lastTestPassed ? CheckCircle2 : XCircle,
    },
  ];

  const handleSave = (): void => {
    setActionMessage("SMTP configuration saved.");
  };

  const handleSendTestEmail = (): void => {
    if (!testRecipient.trim()) return;
    setLastTestAt(format(new Date(), "dd-MMM-yy, hh:mm a"));
    setLastTestPassed(true);
    setActionMessage(`Test email sent to ${testRecipient}.`);
  };

  return (
    <div className="flex flex-col gap-6">
      <Breadcrumb items={[{ label: "Administration", href: "/admin/dashboard" }, { label: "SMTP Configuration" }]} />

      <div>
        <h1 className="text-xl font-bold text-gray-800">SMTP Configuration</h1>
        <p className="text-sm text-gray-400">Configure the outgoing mail server used for notifications.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {statusCards.map((card) => (
          <StatusCard key={card.label} {...card} />
        ))}
      </div>

      {actionMessage && <p className="text-sm font-medium text-gray-600">{actionMessage}</p>}

      <div className="rounded-2xl border border-gray-100 bg-white shadow-md">
        <div className="border-b border-gray-100 px-5 py-4">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-500">SMTP Settings</h2>
        </div>

        <div className="grid grid-cols-1 gap-8 p-5 lg:grid-cols-3">
          <div className="flex flex-col gap-4">
            <ColumnHeader icon={Server} title="SMTP Server Configuration" />

            <div>
              <label htmlFor="smtpHost" className={labelClass}>
                SMTP Host
              </label>
              <input
                id="smtpHost"
                type="text"
                value={smtpHost}
                onChange={(event) => setSmtpHost(event.target.value)}
                className={inputClass}
              />
            </div>

            <div>
              <label htmlFor="smtpPort" className={labelClass}>
                SMTP Port
              </label>
              <input
                id="smtpPort"
                type="number"
                value={smtpPort}
                onChange={(event) => setSmtpPort(Number(event.target.value))}
                className={inputClass}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="encryption" className={labelClass}>
                  Encryption
                </label>
                <CustomSelect id="encryption" value={encryption} onChange={setEncryption} options={["TLS", "SSL", "None"]} />
              </div>

              <div>
                <p className={labelClass}>Authentication</p>
                <div className="flex h-[42px] items-center">
                  <Toggle label="Enabled" checked={authEnabled} onChange={setAuthEnabled} activeClassName="bg-[#ED017F]" />
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="timeout" className={labelClass}>
                Timeout
              </label>
              <div className="flex items-center overflow-hidden rounded-xl border border-gray-200 bg-white transition-all duration-200 focus-within:ring-2 focus-within:ring-[#232B2B]">
                <input
                  id="timeout"
                  type="number"
                  value={timeoutSeconds}
                  onChange={(event) => setTimeoutSeconds(Number(event.target.value))}
                  className="w-full border-0 bg-transparent px-4 py-2.5 text-sm text-gray-700 outline-none"
                />
                <span className="shrink-0 border-l border-gray-200 bg-gray-50 px-3 py-2.5 text-xs font-medium text-gray-500">
                  Seconds
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <ColumnHeader icon={User} title="Email Account" />

            <div>
              <label htmlFor="emailAddress" className={labelClass}>
                Email Address
              </label>
              <input
                id="emailAddress"
                type="text"
                value={emailAddress}
                onChange={(event) => setEmailAddress(event.target.value)}
                className={inputClass}
              />
            </div>

            <div>
              <label htmlFor="smtpUsername" className={labelClass}>
                Username
              </label>
              <input
                id="smtpUsername"
                type="text"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                className={inputClass}
              />
            </div>

            <div>
              <label htmlFor="smtpPassword" className={labelClass}>
                Password
              </label>
              <div className="relative">
                <input
                  id="smtpPassword"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className={cn(inputClass, "pr-11")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-600">
              <input
                type="checkbox"
                checked={showPassword}
                onChange={(event) => setShowPassword(event.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-[#232B2B] focus:ring-[#232B2B]"
              />
              Show Password
            </label>
          </div>

          <div className="flex flex-col gap-4">
            <ColumnHeader icon={Settings2} title="Default Email Settings" />

            <div>
              <label htmlFor="senderName" className={labelClass}>
                Sender Name
              </label>
              <input
                id="senderName"
                type="text"
                value={senderName}
                onChange={(event) => setSenderName(event.target.value)}
                className={inputClass}
              />
            </div>

            <div>
              <label htmlFor="replyToEmail" className={labelClass}>
                Reply-To Email
              </label>
              <input
                id="replyToEmail"
                type="text"
                value={replyToEmail}
                onChange={(event) => setReplyToEmail(event.target.value)}
                className={inputClass}
              />
            </div>

            <div>
              <label htmlFor="signature" className={labelClass}>
                Default Signature
              </label>
              <textarea
                id="signature"
                rows={4}
                value={signature}
                onChange={(event) => setSignature(event.target.value)}
                className={cn(inputClass, "resize-none")}
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end border-t border-gray-100 px-5 py-4">
          <button
            type="button"
            onClick={handleSave}
            className="inline-flex items-center gap-2 rounded-full border border-[#ED017F] bg-[#ED017F] px-6 py-2.5
                      text-sm font-semibold text-white transition-all duration-200
                      hover:bg-white hover:text-[#ED017F]"
          >
            <Save className="h-4 w-4" />
            Save Configuration
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-100 bg-white shadow-md">
        <div className="border-b border-gray-100 px-5 py-4">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-500">Test Email</h2>
          <p className="mt-1 text-xs text-gray-400">Send a test email to verify your SMTP configuration.</p>
        </div>

        <div className="flex flex-col gap-4 p-5">
          <div>
            <label htmlFor="testRecipient" className={labelClass}>
              Recipient
            </label>
            <input
              id="testRecipient"
              type="email"
              value={testRecipient}
              onChange={(event) => setTestRecipient(event.target.value)}
              placeholder="you@example.com"
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="testSubject" className={labelClass}>
              Subject
            </label>
            <input
              id="testSubject"
              type="text"
              value={testSubject}
              onChange={(event) => setTestSubject(event.target.value)}
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="testMessage" className={labelClass}>
              Message
            </label>
            <textarea
              id="testMessage"
              rows={5}
              value={testMessage}
              onChange={(event) => setTestMessage(event.target.value)}
              className={cn(inputClass, "resize-none")}
            />
          </div>
        </div>

        <div className="flex justify-end border-t border-gray-100 px-5 py-4">
          <button
            type="button"
            onClick={handleSendTestEmail}
            disabled={!testRecipient.trim()}
            className="inline-flex items-center gap-2 rounded-full border border-[#ED017F] bg-[#ED017F] px-6 py-2.5
                      text-sm font-semibold text-white transition-all duration-200
                      hover:bg-white hover:text-[#ED017F] disabled:pointer-events-none disabled:opacity-40"
          >
            <Send className="h-4 w-4" />
            Send Test Email
          </button>
        </div>
      </div>
    </div>
  );
}