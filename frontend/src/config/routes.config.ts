import type { Role } from "@/types";

export interface RouteConfig {
  path: string;
  label: string;
  allowedRoles: Role[];
}

export const PUBLIC_ROUTES: string[] = ["/login"];

export const PROTECTED_ROUTES: RouteConfig[] = [
  {
    path: "/dashboard",
    label: "Dashboard",
    allowedRoles: [
      "SYSTEM_ADMIN",
      "IT_OPERATIONS",
      "MD_CEO",
      "CFO_FINANCE_HEAD",
      "COMPLIANCE_OFFICER",
      "INTERNAL_AUDITOR",
      "CREDIT_HEAD",
      "TREASURY_HEAD",
      "BRANCH_MANAGER",
      "RELATIONSHIP_MANAGER",
    ],
  },
  {
    path: "/reports",
    label: "Reports",
    allowedRoles: [
      "SYSTEM_ADMIN",
      "IT_OPERATIONS",
      "MD_CEO",
      "CFO_FINANCE_HEAD",
      "COMPLIANCE_OFFICER",
      "INTERNAL_AUDITOR",
      "CREDIT_HEAD",
      "TREASURY_HEAD",
      "BRANCH_MANAGER",
      "RELATIONSHIP_MANAGER",
    ],
  },
  {
    path: "/regulatory",
    label: "Regulatory",
    allowedRoles: [
      "SYSTEM_ADMIN",
      "MD_CEO",
      "CFO_FINANCE_HEAD",
      "COMPLIANCE_OFFICER",
      "INTERNAL_AUDITOR",
      "CREDIT_HEAD",
      "TREASURY_HEAD",
    ],
  },
  {
    path: "/schedule",
    label: "Scheduled Reports",
    allowedRoles: [
      "SYSTEM_ADMIN",
      "IT_OPERATIONS",
      "MD_CEO",
      "CFO_FINANCE_HEAD",
      "COMPLIANCE_OFFICER",
      "INTERNAL_AUDITOR",
      "CREDIT_HEAD",
      "TREASURY_HEAD",
      "BRANCH_MANAGER",
      "RELATIONSHIP_MANAGER",
    ],
  },
  {
    path: "/audit",
    label: "Audit Log",
    allowedRoles: ["SYSTEM_ADMIN", "IT_OPERATIONS", "COMPLIANCE_OFFICER", "INTERNAL_AUDITOR"],
  },
  {
    path: "/admin",
    label: "Administration",
    allowedRoles: ["SYSTEM_ADMIN"],
  },
  {
    path: "/etl",
    label: "ETL Monitor",
    allowedRoles: ["SYSTEM_ADMIN", "IT_OPERATIONS"],
  },
  {
    path: "/profile",
    label: "Profile",
    allowedRoles: [
      "SYSTEM_ADMIN",
      "IT_OPERATIONS",
      "MD_CEO",
      "CFO_FINANCE_HEAD",
      "COMPLIANCE_OFFICER",
      "INTERNAL_AUDITOR",
      "CREDIT_HEAD",
      "TREASURY_HEAD",
      "BRANCH_MANAGER",
      "RELATIONSHIP_MANAGER",
    ],
  },
];

export function findRouteConfig(pathname: string): RouteConfig | undefined {
  return PROTECTED_ROUTES.find((route) => pathname.startsWith(route.path));
}

export function isRoleAllowedForPath(pathname: string, role: Role): boolean {
  const route = findRouteConfig(pathname);
  if (!route) return true;
  return route.allowedRoles.includes(role);
}