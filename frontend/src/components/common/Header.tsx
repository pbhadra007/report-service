"use client";

import { Bell } from "lucide-react";
import { usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { getCategoryById, getReportById } from "@/config/reports.config";

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  const initials = parts.length > 1 ? `${parts[0][0]}${parts[parts.length - 1][0]}` : parts[0]?.slice(0, 2);
  return (initials ?? "").toUpperCase();
}

function getPageTitle(pathname: string): string {
  const segments = pathname.split("/").filter(Boolean);

  if (segments[0] === "reports" && segments[1]) {
    const category = getCategoryById(segments[1]);
    if (segments[2]) {
      const report = getReportById(Number(segments[2]));
      if (report) return report.name;
    }
    if (category) return `${category.label} Reports`;
  }

  if (segments[0] === "admin") return "Administration";
  if (segments[0] === "dashboard" || segments.length === 0) return "Dashboard";

  const [last] = segments.slice(-1);
  return last ? last.charAt(0).toUpperCase() + last.slice(1) : "Dashboard";
}

export function Header(): React.JSX.Element {
  const { user } = useAuth();
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-10 flex h-[60px] w-full shrink-0 items-center justify-between border-b border-gray-100 bg-white px-6">
      <h1 className="text-lg font-semibold text-gray-800">{getPageTitle(pathname)}</h1>

      {user && (
        <div className="flex items-center gap-4">
          <button type="button" aria-label="Notifications" className="relative p-2 rounded-xl hover:bg-gray-100 transition-colors">
            <Bell className="h-5 w-5 text-gray-400" />
          </button>

          <div className="h-6 w-px bg-gray-100" />

          <div className="flex items-center gap-2.5">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-medium text-gray-700">{user.name}</p>
              <p className="text-xs text-gray-400">{user.designation ?? user.employeeId}</p>
            </div>
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#ED017F] text-xs font-semibold text-white">
              {getInitials(user.name)}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
