"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchAdminUsers } from "@/features/admin/api";

export default function AdminPage(): React.JSX.Element {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["admin", "users"],
    queryFn: fetchAdminUsers,
  });

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-semibold text-foreground">User Management</h1>

      {isLoading && <p className="text-sm text-muted-foreground">Loading users...</p>}
      {isError && <p className="text-sm text-destructive">Failed to load users.</p>}

      {data && (
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-border text-left text-muted-foreground">
              <th className="px-3 py-2">Name</th>
              <th className="px-3 py-2">Email</th>
              <th className="px-3 py-2">Role</th>
              <th className="px-3 py-2">Branch</th>
              <th className="px-3 py-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {data.map((adminUser) => (
              <tr key={adminUser.id} className="border-b border-border">
                <td className="px-3 py-2 text-foreground">{adminUser.name}</td>
                <td className="px-3 py-2 text-foreground">{adminUser.email}</td>
                <td className="px-3 py-2 text-foreground">
                  {adminUser.role.replace(/_/g, " ")}
                </td>
                <td className="px-3 py-2 text-foreground">{adminUser.branchId ?? "-"}</td>
                <td className="px-3 py-2 text-foreground">
                  {adminUser.active ? "Active" : "Disabled"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
