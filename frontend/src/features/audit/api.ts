import { apiClient } from "@/lib/apiClient";
import type { PaginatedResponse } from "@/types";

export type AuditLogStatus = "SUCCESS" | "FAILED";

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  userEmail: string;
  userName?: string;
  action: string;
  report?: string;
  ipAddress: string;
  status: AuditLogStatus;
}

export const AUDIT_ACTION_TYPES = [
  "LOGIN",
  "LOGOUT",
  "GENERATE_REPORT",
  "CREATE_USER",
  "UPDATE_USER",
  "UPDATE_REPORT_ACCESS",
  "UPDATE_SETTINGS",
] as const;

export interface AuditLogQuery {
  page: number;
  pageSize: number;
  from?: string;
  to?: string;
  userEmail?: string;
  action?: string;
  search?: string;
}

export async function fetchAuditLogs(query: AuditLogQuery): Promise<PaginatedResponse<AuditLogEntry>> {
  const response = await apiClient.get<PaginatedResponse<AuditLogEntry>>("/audit/logs", {
    params: query,
  });
  return response.data;
}
