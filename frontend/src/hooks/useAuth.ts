import { useSession } from "next-auth/react";
import type { User } from "@/types";

export interface UseAuthResult {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export function useAuth(): UseAuthResult {
  const { data: session, status } = useSession();

  const user: User | null = session?.user
    ? {
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
        role: session.user.role,
        isAdmin: session.user.isAdmin,
        branchId: session.user.branchId,
        employeeId: session.user.employeeId,
        designation: session.user.designation,
      }
    : null;

  return {
    user,
    isAuthenticated: status === "authenticated",
    isLoading: status === "loading",
  };
}
