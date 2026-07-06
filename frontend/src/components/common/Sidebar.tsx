"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { PROTECTED_ROUTES } from "@/config/routes.config";
import { useUiStore } from "@/store/uiStore";
import { cn } from "@/lib/utils";

export function Sidebar(): React.JSX.Element {
  const { user } = useAuth();
  const pathname = usePathname();
  const collapsed = useUiStore((state) => state.sidebarCollapsed);

  const visibleRoutes = user
    ? PROTECTED_ROUTES.filter((route) => route.allowedRoles.includes(user.role))
    : [];

  return (
    <nav
      className={cn(
        "h-full shrink-0 border-r border-border bg-background transition-all",
        collapsed ? "w-16" : "w-56",
      )}
    >
      <ul className="flex flex-col gap-1 p-2">
        {visibleRoutes.map((route) => {
          const isActive = pathname.startsWith(route.path);
          return (
            <li key={route.path}>
              <Link
                href={route.path}
                className={cn(
                  "block rounded-md px-3 py-2 text-sm font-medium",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-foreground hover:bg-muted",
                )}
              >
                {collapsed ? route.label.slice(0, 1) : route.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
