import { saveAs } from "file-saver";
import type { ReportOutputFormat } from "@/features/reports/types";

const REPORT_FORMAT_MIME_TYPES: Record<ReportOutputFormat, string> = {
  PDF: "application/pdf",
  XLS: "application/vnd.ms-excel",
};

const REPORT_FORMAT_EXTENSIONS: Record<ReportOutputFormat, string> = {
  PDF: "pdf",
  XLS: "xls",
};

export function downloadReportBlob(blob: Blob, fileName: string, format: ReportOutputFormat): void {
  const typedBlob = new Blob([blob], { type: REPORT_FORMAT_MIME_TYPES[format] });
  saveAs(typedBlob, `${fileName}.${REPORT_FORMAT_EXTENSIONS[format]}`);
}
