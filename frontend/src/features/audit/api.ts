import { apiClient } from "@/lib/apiClient";
import type { PaginatedResponse } from "@/types";

export interface AuditLogEntry {
  id: string;
  actorEmail: string;
  action: string;
  entity: string;
  timestamp: string;
  detail: string;
}

export interface AuditLogQuery {
  page: number;
  pageSize: number;
}

export async function fetchAuditLogs(
  query: AuditLogQuery,
): Promise<PaginatedResponse<AuditLogEntry>> {
  const response = await apiClient.get<PaginatedResponse<AuditLogEntry>>("/audit/logs", {
    params: query,
  });
  return response.data;
}
