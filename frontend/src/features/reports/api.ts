import { apiClient } from "@/lib/apiClient";
import { REPORT_CATALOGUE } from "@/config/reports.config";
import type { ReportGenerationParams, ReportOutputFormat, UserReportAccess } from "@/features/reports/types";

// Mocked pending backend integration (Phase 2): grants the active session
// access to every catalogued report so permission-based filtering can be
// exercised end-to-end before GET /users/me/report-access exists.
export async function fetchUserReportAccess(): Promise<UserReportAccess> {
  return {
    userId: "mock-user-1",
    reportIds: REPORT_CATALOGUE.map((r) => r.reportId),
  };
}

export async function generateReport(
  reportId: number,
  params: ReportGenerationParams,
  format: ReportOutputFormat,
): Promise<Blob> {
  const response = await apiClient.post<Blob>(
    `/reports/${reportId}/generate`,
    { ...params, format },
    { responseType: "blob" },
  );
  return response.data;
}
