"use client";

import { useEffect, useRef, useState } from "react";
import { Bell, ChevronDown, UserCircle, LogOut } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { useAuth } from "@/hooks/useAuth";
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

export function Header(): React.JSX.Element {
  const { user } = useAuth();
  const pathname = usePathname();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isProfileOpen) return;
    const handleClickOutside = (event: MouseEvent): void => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isProfileOpen]);

  useEffect(() => {
    setIsProfileOpen(false);
  }, [pathname]);

  return (
    <header className="sticky top-0 z-10 flex h-[60px] w-full shrink-0 items-center justify-between border-b border-gray-100 bg-white px-6">
      <h1 className="text-lg font-semibold text-gray-800">{getPageTitle(pathname)}</h1>

      {user && (
        <div className="flex items-center gap-4">
          <button type="button" aria-label="Notifications" className="relative p-2 rounded-xl hover:bg-gray-100 transition-colors">
            <Bell className="h-5 w-5 text-gray-400" />
          </button>

          <div className="h-6 w-px bg-gray-100" />

          <div ref={profileRef} className="relative">
            <button
              type="button"
              onClick={() => setIsProfileOpen((prev) => !prev)}
              aria-expanded={isProfileOpen}
              className="flex items-center gap-2.5 rounded-xl py-1.5 pl-1.5 pr-2 transition-colors hover:bg-gray-50"
            >
              <div className="hidden text-right sm:block">
                <p className="text-sm font-medium text-gray-700">{user.name}</p>
                <p className="text-xs text-gray-400">{user.designation ?? user.employeeId}</p>
              </div>
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#ED017F] text-xs font-semibold text-white">
                {getInitials(user.name)}
              </div>
              <ChevronDown className={cn("h-4 w-4 text-gray-400 transition-transform", isProfileOpen && "rotate-180")} />
            </button>

            {isProfileOpen && (
              <div className="absolute right-0 top-full z-20 w-48 pt-2">
                <div className="overflow-hidden rounded-xl border border-gray-100 bg-white py-1.5 shadow-lg">
                  <Link
                    href={user.isAdmin ? "/admin/profile" : "/profile"}
                    onClick={() => setIsProfileOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
                  >
                    <UserCircle className="h-4 w-4 text-gray-400" />
                    Profile
                  </Link>
                  <button
                    type="button"
                    onClick={() => signOut({ callbackUrl: "/login" })}
                    className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm font-medium text-gray-700 transition-colors hover:bg-red-50 hover:text-red-500"
                  >
                    <LogOut className="h-4 w-4 text-gray-400" />
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
