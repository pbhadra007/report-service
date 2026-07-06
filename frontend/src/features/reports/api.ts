import { apiClient } from "@/lib/apiClient";
import type { ReportFilterParams, ReportResult, ReportSummary } from "@/features/reports/types";

export async function fetchReportCatalogue(): Promise<ReportSummary[]> {
  const response = await apiClient.get<ReportSummary[]>("/reports");
  return response.data;
}

export async function generateReport(
  reportId: string,
  filters: ReportFilterParams,
): Promise<ReportResult> {
  const response = await apiClient.post<ReportResult>(`/reports/${reportId}/generate`, filters);
  return response.data;
}
