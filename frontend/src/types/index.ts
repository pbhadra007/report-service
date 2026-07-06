export type Role =
  | "SYSTEM_ADMIN"
  | "IT_OPERATIONS"
  | "MD_CEO"
  | "CFO_FINANCE_HEAD"
  | "COMPLIANCE_OFFICER"
  | "INTERNAL_AUDITOR"
  | "CREDIT_HEAD"
  | "TREASURY_HEAD"
  | "BRANCH_MANAGER"
  | "RELATIONSHIP_MANAGER";

export type ExportFormat = "xlsx" | "pdf" | "csv";

export type ReportCategory =
  | "FINANCIAL"
  | "LOAN"
  | "DEPOSIT"
  | "TREASURY"
  | "OPERATIONAL"
  | "MIS";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  branchId?: string;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  content: T[];
  page: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
}

export type CobLoadStatus = "FRESH" | "LOADING" | "FAILED";

export interface CobStatus {
  cobDate: string;
  lastLoadedAt: string;
  status: CobLoadStatus;
}

export interface KpiMetric {
  id: string;
  label: string;
  value: number;
  unit?: string;
  changePercent?: number;
}