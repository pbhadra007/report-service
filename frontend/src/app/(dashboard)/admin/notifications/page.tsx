"use client";

import { useState } from "react";
import { Mail, MessageSquare, Bell, Smartphone } from "lucide-react";
import { Breadcrumb } from "@/components/common/Breadcrumb";
import { CustomSelect } from "@/components/common/CustomSelect";
import { Toggle } from "@/components/common/Toggle";

const DIGEST_OPTIONS = ["Real-time", "Daily", "Weekly", "Monthly"];
const EMAIL_FORMAT_OPTIONS = ["HTML", "Plain Text"];
const TIMEZONE_OPTIONS = ["(GMT+6) Dhaka", "(GMT+5:30) Kolkata", "(GMT+0) London", "(GMT-5) New York"];
const LANGUAGE_OPTIONS = ["English", "Bengali"];

interface ChannelData {
  icon: typeof Mail;
  title: string;
  subtitle: string;
  accent: string;
  enabled: boolean;
  onToggle: (checked: boolean) => void;
}

function ChannelRow({ icon: Icon, title, subtitle, accent, enabled, onToggle }: ChannelData): React.JSX.Element {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-gray-100 p-4">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl" style={{ backgroundColor: `${accent}1A` }}>
          <Icon className="h-5 w-5" style={{ color: accent }} />
        </span>
        <div>
          <p className="text-sm font-semibold text-gray-800">{title}</p>
          <p className="text-xs text-gray-400">{subtitle}</p>
        </div>
      </div>
      <Toggle label={title} checked={enabled} onChange={onToggle} activeClassName="bg-[#ED017F]" hideLabel />
    </div>
  );
}

interface PreferenceSelectRowProps {
  title: string;
  subtitle: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}

function PreferenceSelectRow({ title, subtitle, value, options, onChange }: PreferenceSelectRowProps): React.JSX.Element {
  return (
    <div className="flex flex-col gap-2 rounded-xl border border-gray-100 p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-gray-800">{title}</p>
        <CustomSelect value={value} onChange={onChange} options={options} className="w-44" />
      </div>
      <p className="text-xs text-gray-400">{subtitle}</p>
    </div>
  );
}

export default function AdminNotificationsPage(): React.JSX.Element {
  const [emailEnabled, setEmailEnabled] = useState(true);
  const [smsEnabled, setSmsEnabled] = useState(true);
  const [inAppEnabled, setInAppEnabled] = useState(true);
  const [pushEnabled, setPushEnabled] = useState(false);

  const [instantNotifications, setInstantNotifications] = useState(true);
  const [digestSummary, setDigestSummary] = useState("Daily");
  const [emailFormat, setEmailFormat] = useState("HTML");
  const [timezone, setTimezone] = useState("(GMT+6) Dhaka");
  const [language, setLanguage] = useState("English");

  const channels: ChannelData[] = [
    {
      icon: Mail,
      title: "Email Notifications",
      subtitle: "Receive notifications via email",
      accent: "#8B5CF6",
      enabled: emailEnabled,
      onToggle: setEmailEnabled,
    },
    {
      icon: MessageSquare,
      title: "SMS Notifications",
      subtitle: "Receive notifications via text message",
      accent: "#22C55E",
      enabled: smsEnabled,
      onToggle: setSmsEnabled,
    },
    {
      icon: Bell,
      title: "In-App Notifications",
      subtitle: "Receive notifications within the app",
      accent: "#3B82F6",
      enabled: inAppEnabled,
      onToggle: setInAppEnabled,
    },
    {
      icon: Smartphone,
      title: "Push Notifications",
      subtitle: "Receive push notifications on mobile devices",
      accent: "#F97316",
      enabled: pushEnabled,
      onToggle: setPushEnabled,
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <Breadcrumb items={[{ label: "Administration", href: "/admin/dashboard" }, { label: "Notification Settings" }]} />

      <div>
        <h1 className="text-xl font-bold text-gray-800">Notification Settings</h1>
        <p className="text-sm text-gray-400">Configure system notification preferences.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-gray-100 bg-white shadow-sm">
          <div className="border-b border-gray-100 px-5 py-4">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-500">Notification Channels</h2>
            <p className="mt-1 text-xs text-gray-400">Enable or disable notification channels</p>
          </div>
          <div className="flex flex-col gap-3 p-5">
            {channels.map((channel) => (
              <ChannelRow key={channel.title} {...channel} />
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white shadow-sm">
          <div className="border-b border-gray-100 px-5 py-4">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-500">Notification Preferences</h2>
            <p className="mt-1 text-xs text-gray-400">Configure general notification preferences</p>
          </div>
          <div className="flex flex-col gap-3 p-5">
            <div className="flex items-center justify-between gap-3 rounded-xl border border-gray-100 p-4">
              <div>
                <p className="text-sm font-semibold text-gray-800">Instant Notifications</p>
                <p className="text-xs text-gray-400">Receive notifications immediately as they occur</p>
              </div>
              <Toggle
                label="Instant Notifications"
                checked={instantNotifications}
                onChange={setInstantNotifications}
                activeClassName="bg-[#ED017F]"
                hideLabel
              />
            </div>

            <PreferenceSelectRow
              title="Digest Summary"
              subtitle="How often to receive a summary digest"
              value={digestSummary}
              options={DIGEST_OPTIONS}
              onChange={setDigestSummary}
            />
            <PreferenceSelectRow
              title="Email Format"
              subtitle="Choose the format for email notifications"
              value={emailFormat}
              options={EMAIL_FORMAT_OPTIONS}
              onChange={setEmailFormat}
            />
            <PreferenceSelectRow
              title="Timezone"
              subtitle="Used for displaying notification timestamps"
              value={timezone}
              options={TIMEZONE_OPTIONS}
              onChange={setTimezone}
            />
            <PreferenceSelectRow
              title="Language"
              subtitle="Preferred language for notification content"
              value={language}
              options={LANGUAGE_OPTIONS}
              onChange={setLanguage}
            />
          </div>
        </div>
      </div>
    </div>
  );
}