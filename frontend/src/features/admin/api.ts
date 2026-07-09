import { apiClient } from "@/lib/apiClient";
import type { Role } from "@/types";
import type { EmployeeType } from "@/config/lookups.config";

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

export interface CreateUserPayload {
  userId: string;
  employeeId: string;
  rmCode?: string;
  name: string;
  employeeType: EmployeeType;
  mobile: string;
  email: string;
  branchCodes: string[];
  costCenterCodes: string[];
  department: string;
  designation: string;
  supervisor?: string;
  teamLeader?: string;
  password?: string;
  passwordRemainSame: boolean;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  authorizedMac?: string;
  authorizedIp?: string;
  badAttempts: number;
  forcePassChange: boolean;
  checkExpiry: boolean;
  unlockUser: boolean;
  activeUser: boolean;
}

export async function createAdminUser(payload: CreateUserPayload): Promise<AdminUser> {
  const response = await apiClient.post<AdminUser>("/admin/users", payload);
  return response.data;
}

export interface UserReportAccessSummary {
  userId: string;
  reportIds: number[];
}

export async function fetchUserReportAccessByAdmin(userId: string): Promise<UserReportAccessSummary> {
  const response = await apiClient.get<UserReportAccessSummary>(`/admin/users/${userId}/report-access`);
  return response.data;
}

export async function updateUserReportAccess(userId: string, reportIds: number[]): Promise<void> {
  await apiClient.put(`/admin/users/${userId}/report-access`, { reportIds });
}
