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

export interface AdminUserDetail {
  id: string;
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

export async function fetchAdminUserById(id: string): Promise<AdminUserDetail> {
  const response = await apiClient.get<AdminUserDetail>(`/admin/users/${id}`);
  return response.data;
}

export async function updateAdminUser(id: string, payload: CreateUserPayload): Promise<AdminUser> {
  const response = await apiClient.put<AdminUser>(`/admin/users/${id}`, payload);
  return response.data;
}

export async function resetAdminUserPassword(id: string): Promise<void> {
  await apiClient.post(`/admin/users/${id}/reset-password`);
}

export async function toggleAdminUserLock(id: string): Promise<AdminUser> {
  const response = await apiClient.post<AdminUser>(`/admin/users/${id}/toggle-lock`);
  return response.data;
}

export async function deactivateAdminUser(id: string): Promise<AdminUser> {
  const response = await apiClient.post<AdminUser>(`/admin/users/${id}/deactivate`);
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
