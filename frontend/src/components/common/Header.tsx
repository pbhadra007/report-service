"use client";

import { usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useCobStatus } from "@/hooks/useCobStatus";
import { getCategoryById, getReportById } from "@/config/reports.config";
import { cn } from "@/lib/utils";

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

const COB_BADGE_STYLES: Record<string, string> = {
  FRESH: "bg-green-50 text-green-700",
  LOADING: "bg-amber-50 text-amber-700",
  FAILED: "bg-red-50 text-red-700",
};

const COB_BADGE_LABELS: Record<string, string> = {
  FRESH: "COB Fresh",
  LOADING: "COB Loading",
  FAILED: "COB Failed",
};

export function Header(): React.JSX.Element {
  const { user } = useAuth();
  const pathname = usePathname();
  const { cobStatus, isLoading, isError } = useCobStatus();

  const cobBadgeClass = isError || !cobStatus ? "bg-red-50 text-red-700" : COB_BADGE_STYLES[cobStatus.status];
  const cobBadgeLabel = isLoading && !cobStatus ? "Checking COB..." : isError || !cobStatus ? "COB Failed" : COB_BADGE_LABELS[cobStatus.status];

  return (
    <header className="flex h-16 w-full items-center justify-between border-b border-[#E5E7EB] bg-white px-6">
      <h1 className="text-lg font-semibold text-gray-800">{getPageTitle(pathname)}</h1>

      {user && (
        <div className="flex items-center gap-4">
          <span className={cn("rounded-full px-2.5 py-1 text-xs font-medium", cobBadgeClass)}>{cobBadgeLabel}</span>

          <button type="button" aria-label="Notifications" className="text-gray-400 hover:text-gray-600">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-5 w-5"
            >
              <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
              <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
            </svg>
          </button>

          <div className="flex items-center gap-2.5">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-medium text-gray-800">{user.name}</p>
              <p className="text-xs text-gray-500">{user.designation ?? user.employeeId}</p>
            </div>
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-ipdc-pink text-xs font-semibold text-white">
              {getInitials(user.name)}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
