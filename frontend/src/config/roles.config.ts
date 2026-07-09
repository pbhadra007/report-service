import type { ExportFormat, Role } from "@/types";

export type ReportAccessScope = "FULL" | "SYSTEM" | "EXECUTIVE" | "SCOPED" | "NONE";

export interface RolePermissions {
  dashboard: ReportAccessScope;
  reports: ReportAccessScope;
  exportFormats: ExportFormat[];
  regulatory: ReportAccessScope;
  audit: ReportAccessScope;
  admin: boolean;
  dynamicReportBuilder: boolean;
}

export const ROLE_PERMISSIONS: Record<Role, RolePermissions> = {
  SYSTEM_ADMIN: {
    dashboard: "FULL",
    reports: "FULL",
    exportFormats: ["xlsx", "pdf", "csv"],
    regulatory: "FULL",
    audit: "FULL",
    admin: true,
    dynamicReportBuilder: true,
  },
  IT_OPERATIONS: {
    dashboard: "SYSTEM",
    reports: "SYSTEM",
    exportFormats: ["xlsx", "pdf", "csv"],
    regulatory: "NONE",
    audit: "FULL",
    admin: false,
    dynamicReportBuilder: false,
  },
  MD_CEO: {
    dashboard: "EXECUTIVE",
    reports: "FULL",
    exportFormats: ["pdf", "xlsx"],
    regulatory: "SCOPED",
    audit: "NONE",
    admin: false,
    dynamicReportBuilder: false,
  },
  CFO_FINANCE_HEAD: {
    dashboard: "SCOPED",
    reports: "SCOPED",
    exportFormats: ["xlsx", "pdf", "csv"],
    regulatory: "FULL",
    audit: "NONE",
    admin: false,
    dynamicReportBuilder: true,
  },
  COMPLIANCE_OFFICER: {
    dashboard: "SCOPED",
    reports: "FULL",
    exportFormats: ["xlsx", "pdf", "csv"],
    regulatory: "FULL",
    audit: "SCOPED",
    admin: false,
    dynamicReportBuilder: false,
  },
  INTERNAL_AUDITOR: {
    dashboard: "SCOPED",
    reports: "FULL",
    exportFormats: ["pdf"],
    regulatory: "FULL",
    audit: "FULL",
    admin: false,
    dynamicReportBuilder: false,
  },
  CREDIT_HEAD: {
    dashboard: "SCOPED",
    reports: "SCOPED",
    exportFormats: ["xlsx", "pdf", "csv"],
    regulatory: "SCOPED",
    audit: "NONE",
    admin: false,
    dynamicReportBuilder: false,
  },
  TREASURY_HEAD: {
    dashboard: "SCOPED",
    reports: "SCOPED",
    exportFormats: ["xlsx", "pdf", "csv"],
    regulatory: "SCOPED",
    audit: "NONE",
    admin: false,
    dynamicReportBuilder: false,
  },
  BRANCH_MANAGER: {
    dashboard: "SCOPED",
    reports: "SCOPED",
    exportFormats: ["pdf", "xlsx"],
    regulatory: "NONE",
    audit: "NONE",
    admin: false,
    dynamicReportBuilder: false,
  },
  RELATIONSHIP_MANAGER: {
    dashboard: "SCOPED",
    reports: "SCOPED",
    exportFormats: ["pdf"],
    regulatory: "NONE",
    audit: "NONE",
    admin: false,
    dynamicReportBuilder: false,
  },
};

export function getRolePermissions(role: Role): RolePermissions {
  return ROLE_PERMISSIONS[role];
}

export function canExport(role: Role, format: ExportFormat): boolean {
  return ROLE_PERMISSIONS[role].exportFormats.includes(format);
}

export function hasSectionAccess(
  role: Role,
  section: "dashboard" | "reports" | "regulatory" | "audit",
): boolean {
  return ROLE_PERMISSIONS[role][section] !== "NONE";
}