"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Shield,
  Users2,
  UserCheck,
  Lock,
  GitBranch,
  Building2,
  FileStack,
  KeyRound,
  Settings2,
  Mail,
  Bell,
  ShieldCheck,
  History,
  ScrollText,
  ChevronsDown,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  X,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useReportAccess } from "@/hooks/useReportAccess";
import { REPORT_CATEGORIES, getReportsByCategory } from "@/config/reports.config";
import { cn } from "@/lib/utils";

interface AdminNavItem {
  path: string;
  label: string;
  icon: typeof Users2;
}

interface AdminNavGroup {
  label: string;
  items: AdminNavItem[];
}

interface MobilePrimaryItem {
  path: string;
  label: string;
  icon: React.ReactNode;
}

const ADMIN_NAV_GROUPS: AdminNavGroup[] = [
  {
    label: "Manage",
    items: [
      { path: "/admin/users", label: "User Management", icon: Users2 },
      { path: "/admin/roles", label: "Role Management", icon: UserCheck },
      { path: "/admin/permissions", label: "Permission Management", icon: Lock },
      { path: "/admin/branches", label: "Branch Management", icon: GitBranch },
      { path: "/admin/departments", label: "Department Management", icon: Building2 },
    ],
  },
  {
    label: "Reports",
    items: [
      { path: "/admin/reports", label: "Report Management", icon: FileStack },
      { path: "/admin/report-access", label: "Report Access", icon: KeyRound },
    ],
  },
  {
    label: "System",
    items: [
      { path: "/admin/settings", label: "System Settings", icon: Settings2 },
      { path: "/admin/smtp", label: "SMTP Configuration", icon: Mail },
      { path: "/admin/notifications", label: "Notification Settings", icon: Bell },
    ],
  },
  {
    label: "Security",
    items: [
      { path: "/admin/password-policy", label: "Password Policy", icon: ShieldCheck },
      { path: "/admin/login-history", label: "Login History", icon: History },
    ],
  },
  {
    label: "Logs",
    items: [
      { path: "/admin/audit", label: "Audit Logs", icon: ScrollText },
    ],
  },
];

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  const initials = parts.length > 1 ? `${parts[0][0]}${parts[parts.length - 1][0]}` : parts[0]?.slice(0, 2);
  return (initials ?? "").toUpperCase();
}

function isItemActive(pathname: string, path: string): boolean {
  return pathname === path || pathname.startsWith(`${path}/`);
}

export function Sidebar(): React.JSX.Element {
  const { user } = useAuth();
  const pathname = usePathname();
  const { accessibleReportIds } = useReportAccess();

  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({ [ADMIN_NAV_GROUPS[0].label]: true });
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const [prevPathname, setPrevPathname] = useState(pathname);
  if (pathname !== prevPathname) {
    setPrevPathname(pathname);
    const activeGroup = ADMIN_NAV_GROUPS.find((group) => group.items.some((item) => isItemActive(pathname, item.path)));
    if (activeGroup) {
      setOpenGroups((prev) => ({ ...prev, [activeGroup.label]: true }));
    }
    setIsMoreOpen(false);
  }

  const reportCategories = REPORT_CATEGORIES.filter((category) =>
    getReportsByCategory(category.id).some((report) => accessibleReportIds.includes(report.reportId)),
  );

  const dashboardPath = user?.isAdmin ? "/admin/dashboard" : "/dashboard";

  const mobilePrimaryItems: MobilePrimaryItem[] = user?.isAdmin
    ? [
        { path: "/admin/dashboard", label: "Dashboard", icon: <LayoutDashboard className="h-5 w-5" /> },
        { path: "/admin/users", label: "Users", icon: <Users2 className="h-5 w-5" /> },
        { path: "/admin/reports", label: "Reports", icon: <FileStack className="h-5 w-5" /> },
        { path: "/admin/settings", label: "Settings", icon: <Settings2 className="h-5 w-5" /> },
      ]
    : [
        { path: "/dashboard", label: "Dashboard", icon: <LayoutDashboard className="h-5 w-5" /> },
        ...reportCategories.slice(0, 3).map((category) => ({
          path: `/reports/${category.id}`,
          label: category.label,
          icon: <span className="text-lg leading-none">{category.icon}</span>,
        })),
      ];

  function renderNavBody(collapsed: boolean): React.JSX.Element {
    return (
      <>
        <ul className={cn("flex flex-col gap-1", collapsed ? "px-2" : "px-3")}>
          <li>
            <Link
              href={dashboardPath}
              onClick={() => setIsMoreOpen(false)}
              title={collapsed ? "Dashboard" : undefined}
              className={cn(
                "flex items-center gap-2.5 rounded-xl py-2.5 text-sm font-medium transition-colors",
                collapsed ? "justify-center px-2" : "px-3",
                pathname === dashboardPath ? "bg-[#232B2B] text-white" : "text-gray-600 hover:bg-gray-100",
              )}
            >
              <LayoutDashboard className="h-4 w-4 shrink-0" />
              {!collapsed && "Dashboard"}
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
                    onClick={() => setIsMoreOpen(false)}
                    title={collapsed ? category.label : undefined}
                    className={cn(
                      "flex items-center gap-2.5 rounded-xl py-2.5 text-sm font-medium transition-colors",
                      collapsed ? "justify-center px-2" : "px-3",
                      isActive ? "bg-[#232B2B] text-white" : "text-gray-600 hover:bg-gray-100",
                    )}
                  >
                    <span className="text-base leading-none">{category.icon}</span>
                    {!collapsed && category.label}
                  </Link>
                </li>
              );
            })}
        </ul>

        {user?.isAdmin && (
          <>
            <div className="mx-4 my-3 border-t border-gray-100" />

            <div className={cn("flex items-center gap-2 py-2 mb-1", collapsed ? "justify-center px-2" : "px-4")}>
              <Shield className="w-4 h-4 text-[#ED017F]" />
              {!collapsed && <span className="text-sm font-bold text-gray-800">Administration</span>}
            </div>

            {collapsed ? (
              <ul className="flex flex-col gap-1 px-2">
                {ADMIN_NAV_GROUPS.flatMap((group) => group.items).map((item) => {
                  const isActive = isItemActive(pathname, item.path);
                  const Icon = item.icon;
                  return (
                    <li key={item.path}>
                      <Link
                        href={item.path}
                        title={item.label}
                        onClick={() => setIsMoreOpen(false)}
                        className={cn(
                          "flex items-center justify-center rounded-xl px-2 py-2.5 text-sm font-medium transition-all",
                          isActive ? "bg-[#232B2B] text-white" : "text-gray-600 hover:bg-gray-100 hover:text-gray-800",
                        )}
                      >
                        <Icon className="w-4 h-4 flex-shrink-0" />
                      </Link>
                    </li>
                  );
                })}
              </ul>
            ) : (
              ADMIN_NAV_GROUPS.map((group, index) => {
                const isOpen = Boolean(openGroups[group.label]);
                return (
                  <div key={group.label}>
                    {index > 0 && <div className="mx-4 my-3 border-t border-gray-100" />}
                    <button
                      type="button"
                      onClick={() => setOpenGroups((prev) => ({ ...prev, [group.label]: !prev[group.label] }))}
                      className="flex w-full items-center justify-between px-4 py-1 mb-1 text-xs font-semibold uppercase tracking-widest text-gray-400 transition-colors hover:text-gray-600"
                    >
                      <span>{group.label}</span>
                      <ChevronsDown className={cn("h-3.5 w-3.5 shrink-0 transition-transform", isOpen && "rotate-180")} />
                    </button>

                    {isOpen && (
                      <ul className="flex flex-col gap-1 px-1">
                        {group.items.map((item) => {
                          const isActive = isItemActive(pathname, item.path);
                          const Icon = item.icon;
                          return (
                            <li key={item.path}>
                              <Link
                                href={item.path}
                                onClick={() => setIsMoreOpen(false)}
                                className={cn(
                                  "flex items-center gap-3 px-3 py-2.5 mx-1 rounded-xl text-sm font-medium transition-all",
                                  isActive
                                    ? "bg-[#232B2B] text-white"
                                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-800",
                                )}
                              >
                                <Icon className="w-4 h-4 flex-shrink-0" />
                                {item.label}
                              </Link>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </div>
                );
              })
            )}
          </>
        )}
      </>
    );
  }

  return (
    <>
      {/* Desktop sidebar */}
      <div
        className={cn(
          "relative hidden h-full shrink-0 transition-[width] duration-200 lg:flex",
          isCollapsed ? "w-[76px]" : "w-[288px]",
        )}
      >
        <nav className="flex h-full w-full flex-col overflow-y-auto border-r border-[#E5E7EB] bg-white shadow-[2px_0_8px_rgba(0,0,0,0.06)]">
          <div
            className={cn(
              "flex items-center py-6",
              isCollapsed ? "justify-center px-2" : "justify-between px-5",
            )}
          >
            {!isCollapsed && (
              <Image src="/images/ipdc-logo.png" alt="IPDC" width={150} height={74} className="h-12 w-auto object-contain" priority />
            )}
            <button
              type="button"
              onClick={() => setIsCollapsed((prev) => !prev)}
              aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-[#E5E7EB] bg-white text-gray-400 shadow-sm transition-colors hover:text-gray-600"
            >
              {isCollapsed ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronLeft className="h-3.5 w-3.5" />}
            </button>
          </div>

          {user && !user.isAdmin && (
            <div className={cn("flex flex-col gap-2 border-t border-[#E5E7EB] py-4", isCollapsed ? "items-center px-2" : "px-5")}>
              <div className={cn("flex items-center gap-3", isCollapsed && "flex-col gap-1")}>
                <div
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#ED017F] text-sm font-semibold text-white"
                  title={isCollapsed ? user.name : undefined}
                >
                  {getInitials(user.name)}
                </div>
                {!isCollapsed && (
                  <div className="flex flex-col overflow-hidden">
                    <p className="truncate text-sm font-semibold text-gray-800">{user.name}</p>
                    <p className="truncate text-xs text-gray-400">{user.employeeId}</p>
                  </div>
                )}
              </div>
              {!isCollapsed && (
                <span className="inline-flex w-fit items-center rounded-full bg-[#FFE6F4] px-2.5 py-1 text-xs font-medium text-[#ED017F]">
                  {user.designation ?? user.role.replace(/_/g, " ")}
                </span>
              )}
            </div>
          )}

          <div className="flex flex-1 flex-col gap-1 border-t border-[#E5E7EB] py-4">{renderNavBody(isCollapsed)}</div>
        </nav>
      </div>

      {/* Mobile bottom nav */}
      <nav
        className="fixed inset-x-0 bottom-0 z-40 flex items-stretch justify-around border-t border-[#E5E7EB] bg-white px-1 shadow-[0_-2px_8px_rgba(0,0,0,0.06)] lg:hidden"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        {mobilePrimaryItems.map((item) => {
          const isActive = isItemActive(pathname, item.path);
          return (
            <Link
              key={item.path}
              href={item.path}
              className={cn(
                "flex flex-1 flex-col items-center justify-center gap-0.5 px-1 py-2 text-[10px] font-medium transition-colors",
                isActive ? "text-[#ED017F]" : "text-gray-500",
              )}
            >
              {item.icon}
              <span className="max-w-[4.5rem] truncate">{item.label}</span>
            </Link>
          );
        })}
        <button
          type="button"
          onClick={() => setIsMoreOpen(true)}
          className="flex flex-1 flex-col items-center justify-center gap-0.5 px-1 py-2 text-[10px] font-medium text-gray-500 transition-colors"
        >
          <MoreHorizontal className="h-5 w-5" />
          More
        </button>
      </nav>

      {/* Mobile "More" sheet */}
      {isMoreOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setIsMoreOpen(false)} />
          <div className="absolute inset-x-0 bottom-0 flex max-h-[80vh] flex-col rounded-t-2xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-[#E5E7EB] px-5 py-4">
              <span className="text-sm font-semibold text-gray-800">Menu</span>
              <button
                type="button"
                onClick={() => setIsMoreOpen(false)}
                aria-label="Close menu"
                className="rounded-lg p-1.5 text-gray-500 transition-colors hover:bg-gray-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto py-4" style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
              {renderNavBody(false)}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
