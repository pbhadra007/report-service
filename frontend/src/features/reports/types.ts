import type { ReportCategory } from "@/types";

export interface ReportSummary {
  id: string;
  name: string;
  category: ReportCategory;
  lastGeneratedAt: string | null;
  exportFormats: Array<"xlsx" | "pdf" | "csv">;
}

export interface ReportFilterParams {
  cobDate?: string;
  dateFrom?: string;
  dateTo?: string;
  branchId?: string;
  productId?: string;
  sector?: string;
  currency?: string;
}

export interface ReportColumn {
  key: string;
  label: string;
}

export interface ReportRow {
  [key: string]: string | number | null;
}

export interface ReportResult {
  id: string;
  name: string;
  columns: ReportColumn[];
  rows: ReportRow[];
  generatedAt: string;
}
