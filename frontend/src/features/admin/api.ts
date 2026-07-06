import { apiClient } from "@/lib/apiClient";
import type { Role } from "@/types";

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  branchId?: string;
  active: boolean;
}

export async function fetchAdminUsers(): Promise<AdminUser[]> {
  const response = await apiClient.get<AdminUser[]>("/admin/users");
  return response.data;
}
