"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard,
  ShieldCheck,
  Settings,
  Users,
  FileText,
  ClipboardList,
  LogOut,
  ChevronDown,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useReportAccess } from "@/hooks/useReportAccess";
import { REPORT_CATEGORIES, getReportsByCategory } from "@/config/reports.config";
import { cn } from "@/lib/utils";

interface AdminSubItem {
  path: string;
  label: string;
  icon: typeof Settings;
}

const ADMIN_SUB_ITEMS: AdminSubItem[] = [
  { path: "/admin/settings", label: "Settings", icon: Settings },
  { path: "/admin", label: "User Management", icon: Users },
  { path: "/admin/reports", label: "Report Management", icon: FileText },
];

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  const initials = parts.length > 1 ? `${parts[0][0]}${parts[parts.length - 1][0]}` : parts[0]?.slice(0, 2);
  return (initials ?? "").toUpperCase();
}

export function Sidebar(): React.JSX.Element {
  const { user } = useAuth();
  const pathname = usePathname();
  const { accessibleReportIds } = useReportAccess();

  const isAdminSection = pathname.startsWith("/admin");
  const [isAdminOpen, setIsAdminOpen] = useState(isAdminSection);

  const reportCategories = REPORT_CATEGORIES.filter((category) =>
    getReportsByCategory(category.id).some((report) => accessibleReportIds.includes(report.reportId)),
  );

  return (
    <nav className="flex h-full w-[240px] shrink-0 flex-col overflow-y-auto border-r border-[#E5E7EB] bg-white shadow-[2px_0_8px_rgba(0,0,0,0.06)]">
      <div className="flex items-center justify-start px-5 py-6">
        <Image src="/images/ipdc-logo.png" alt="IPDC" width={150} height={74} className="h-12 w-auto object-contain" priority />
      </div>

      {user && !user.isAdmin && (
        <div className="flex flex-col gap-2 border-t border-[#E5E7EB] px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#ED017F] text-sm font-semibold text-white">
              {getInitials(user.name)}
            </div>
            <div className="flex flex-col overflow-hidden">
              <p className="truncate text-sm font-semibold text-gray-800">{user.name}</p>
              <p className="truncate text-xs text-gray-400">{user.employeeId}</p>
            </div>
          </div>
          <span className="inline-flex w-fit items-center rounded-full bg-[#FFE6F4] px-2.5 py-1 text-xs font-medium text-[#ED017F]">
            {user.designation ?? user.role.replace(/_/g, " ")}
          </span>
        </div>
      )}

      <div className="flex flex-1 flex-col gap-1 border-t border-[#E5E7EB] py-4">
        <p className="mb-1 px-5 text-[10px] font-medium uppercase tracking-widest text-gray-400">Main Menu</p>
        <ul className="flex flex-col gap-1 px-3">
          <li>
            <Link
              href="/dashboard"
              className={cn(
                "flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                pathname === "/dashboard" ? "bg-[#232B2B] text-white" : "text-gray-600 hover:bg-gray-100",
              )}
            >
              <LayoutDashboard className="h-4 w-4 shrink-0" />
              Dashboard
            </Link>
          </li>
          {!user?.isAdmin &&
            reportCategories.map((category) => {
              const path = `/reports/${category.id}`;
              const isActive = pathname.startsWith(path);
              return (
                <li key={category.id}>
                  <Link
                    href={path}
                    className={cn(
                      "flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                      isActive ? "bg-[#232B2B] text-white" : "text-gray-600 hover:bg-gray-100",
                    )}
                  >
                    <span className="text-base leading-none">{category.icon}</span>
                    {category.label}
                  </Link>
                </li>
              );
            })}
        </ul>

        {user?.isAdmin && (
          <>
            <div className="my-3 border-t border-[#E5E7EB]" />
            <p className="mb-1 px-5 text-[10px] font-medium uppercase tracking-widest text-gray-400">Administration</p>
            <div className="px-3">
              <button
                type="button"
                onClick={() => setIsAdminOpen((open) => !open)}
                className={cn(
                  "flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                  isAdminSection ? "text-gray-800" : "text-gray-600 hover:bg-gray-100",
                )}
              >
                <ShieldCheck className="h-4 w-4 shrink-0" />
                <span className="flex-1 text-left">Administration</span>
                <ChevronDown className={cn("h-4 w-4 shrink-0 transition-transform", isAdminOpen && "rotate-180")} />
              </button>

              {isAdminOpen && (
                <ul className="mt-1 flex flex-col gap-1 pl-4">
                  {ADMIN_SUB_ITEMS.map((item) => {
                    const isActive = pathname === item.path;
                    const Icon = item.icon;
                    return (
                      <li key={item.path}>
                        <Link
                          href={item.path}
                          className={cn(
                            "flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm transition-colors",
                            isActive ? "bg-[#232B2B] text-white" : "text-gray-500 hover:bg-gray-100",
                          )}
                        >
                          <Icon className="h-3.5 w-3.5 shrink-0" />
                          {item.label}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            <div className="my-3 border-t border-[#E5E7EB]" />
            <div className="px-3">
              <Link
                href="/audit"
                className={cn(
                  "flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                  pathname.startsWith("/audit") ? "bg-[#232B2B] text-white" : "text-gray-600 hover:bg-gray-100",
                )}
              >
                <ClipboardList className="h-4 w-4 shrink-0" />
                Audit Log
              </Link>
            </div>
          </>
        )}
      </div>

      <div className="border-t border-[#E5E7EB] p-3">
        <button
          type="button"
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-gray-400 transition-colors hover:text-red-400"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          Sign Out
        </button>
      </div>
    </nav>
  );
}
