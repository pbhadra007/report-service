"use client";

import { signOut } from "next-auth/react";
import { useAuth } from "@/hooks/useAuth";
import { useUiStore } from "@/store/uiStore";
import { APP_NAME } from "@/lib/constants";

export function Header(): React.JSX.Element {
  const { user } = useAuth();
  const toggleSidebar = useUiStore((state) => state.toggleSidebar);

  return (
    <header className="flex h-16 w-full items-center justify-between border-b border-border bg-background px-4">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={toggleSidebar}
          aria-label="Toggle sidebar"
          className="rounded-md p-2 text-foreground hover:bg-muted"
        >
          <span className="block h-0.5 w-5 bg-current" />
          <span className="mt-1 block h-0.5 w-5 bg-current" />
          <span className="mt-1 block h-0.5 w-5 bg-current" />
        </button>
        <span className="text-sm font-semibold text-foreground">{APP_NAME}</span>
      </div>

      {user && (
        <div className="flex items-center gap-3">
          <div className="text-right text-sm">
            <p className="font-medium text-foreground">{user.name}</p>
            <p className="text-xs text-muted-foreground">{user.role.replace(/_/g, " ")}</p>
          </div>
          <button
            type="button"
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="rounded-md border border-input px-3 py-1.5 text-sm font-medium text-foreground hover:bg-muted"
          >
            Sign out
          </button>
        </div>
      )}
    </header>
  );
}
