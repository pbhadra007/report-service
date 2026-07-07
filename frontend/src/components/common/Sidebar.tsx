"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { useAuth } from "@/hooks/useAuth";
import { useReportAccess } from "@/hooks/useReportAccess";
import { REPORT_CATEGORIES, getReportsByCategory } from "@/config/reports.config";
import { cn } from "@/lib/utils";

interface SidebarNavItem {
  path: string;
  label: string;
  icon: string;
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  const initials = parts.length > 1 ? `${parts[0][0]}${parts[parts.length - 1][0]}` : parts[0]?.slice(0, 2);
  return (initials ?? "").toUpperCase();
}

export function Sidebar(): React.JSX.Element {
  const { user } = useAuth();
  const pathname = usePathname();
  const { accessibleReportIds } = useReportAccess();

  const navItems: SidebarNavItem[] = user
    ? [
        { path: "/dashboard", label: "Dashboard", icon: "🏠" },
        ...REPORT_CATEGORIES.filter((category) =>
          getReportsByCategory(category.id).some((report) => accessibleReportIds.includes(report.reportId)),
        ).map((category) => ({
          path: `/reports/${category.id}`,
          label: category.label,
          icon: category.icon,
        })),
      ]
    : [];

  return (
    <nav className="flex h-full w-[260px] shrink-0 flex-col border-r border-[#E5E7EB] bg-white">
      <div className="flex flex-col">
        <div className="flex items-center px-4 py-4">
          <Image src="/images/ipdc-logo.png" alt="IPDC" width={140} height={40} className="h-10 w-auto" priority />
        </div>
        <div className="border-b border-[#E5E7EB]" />
      </div>

      {user && (
        <div className="flex flex-col gap-2 border-b border-[#E5E7EB] px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-ipdc-pink text-sm font-semibold text-white">
              {getInitials(user.name)}
            </div>
            <div className="flex flex-col overflow-hidden">
              <p className="truncate text-sm font-semibold text-gray-800">{user.name}</p>
              <p className="truncate text-xs text-gray-500">{user.designation ?? user.employeeId}</p>
            </div>
          </div>
          <span className="inline-flex w-fit items-center rounded-full bg-ipdc-pink-light px-2.5 py-1 text-xs font-medium text-ipdc-pink">
            {user.role.replace(/_/g, " ")}
          </span>
        </div>
      )}

      <div className="flex flex-1 flex-col overflow-y-auto py-4">
        <p className="mb-2 px-4 text-xs font-medium uppercase tracking-wide text-gray-400">Report Categories</p>
        <ul className="flex flex-col gap-1 px-2">
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.path);
            return (
              <li key={item.path}>
                <Link
                  href={item.path}
                  className={cn(
                    "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    isActive ? "bg-ipdc-pink text-white" : "text-gray-600 hover:bg-ipdc-pink-50 hover:text-ipdc-pink",
                  )}
                >
                  <span className="text-base leading-none">{item.icon}</span>
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="border-t border-[#E5E7EB] p-2">
        <button
          type="button"
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-gray-500 hover:text-red-500"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-4 w-4"
          >
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          Sign out
        </button>
      </div>
    </nav>
  );
}
