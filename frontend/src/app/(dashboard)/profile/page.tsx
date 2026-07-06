"use client";

import { useAuth } from "@/hooks/useAuth";

export default function ProfilePage(): React.JSX.Element {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Loading profile...</p>;
  }

  if (!user) {
    return <p className="text-sm text-destructive">No active session.</p>;
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-semibold text-foreground">Profile</h1>

      <div className="flex max-w-md flex-col gap-3 rounded-lg border border-border bg-background p-4">
        <div>
          <p className="text-xs font-medium text-muted-foreground">Name</p>
          <p className="text-sm text-foreground">{user.name}</p>
        </div>
        <div>
          <p className="text-xs font-medium text-muted-foreground">Email</p>
          <p className="text-sm text-foreground">{user.email}</p>
        </div>
        <div>
          <p className="text-xs font-medium text-muted-foreground">Role</p>
          <p className="text-sm text-foreground">{user.role.replace(/_/g, " ")}</p>
        </div>
        {user.branchId && (
          <div>
            <p className="text-xs font-medium text-muted-foreground">Branch</p>
            <p className="text-sm text-foreground">{user.branchId}</p>
          </div>
        )}
      </div>
    </div>
  );
}
