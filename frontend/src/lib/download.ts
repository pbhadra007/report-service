import { saveAs } from "file-saver";
import { apiClient } from "@/lib/apiClient";
import type { ExportFormat } from "@/types";

const MIME_TYPES: Record<ExportFormat, string> = {
  xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  pdf: "application/pdf",
  csv: "text/csv",
};

export async function downloadReportExport(
  reportId: string,
  format: ExportFormat,
  fileName: string,
): Promise<void> {
  const response = await apiClient.get(`/reports/${reportId}/export`, {
    params: { format },
    responseType: "blob",
  });

  const blob = new Blob([response.data], { type: MIME_TYPES[format] });
  saveAs(blob, `${fileName}.${format}`);
}