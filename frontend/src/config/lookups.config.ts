export const EMPLOYEE_TYPES = ["FTE", "OTS", "ITN", "CONTRACT", "INTERN"] as const;
export type EmployeeType = (typeof EMPLOYEE_TYPES)[number];

export interface LookupOption {
  value: string;
  label: string;
}

export const DEPARTMENTS: LookupOption[] = [
  { value: "retail-banking", label: "Retail Banking" },
  { value: "corporate-sme", label: "Corporate & SME Banking" },
  { value: "treasury", label: "Treasury" },
  { value: "finance-accounts", label: "Finance & Accounts" },
  { value: "credit-risk", label: "Credit Risk Management" },
  { value: "compliance", label: "Compliance" },
  { value: "internal-audit", label: "Internal Control & Audit" },
  { value: "it", label: "Information Technology" },
  { value: "hr", label: "Human Resources" },
  { value: "business-transformation", label: "Business Transformation" },
  { value: "operations", label: "Operations" },
  { value: "legal-recovery", label: "Legal & Recovery" },
];

export const DESIGNATIONS: LookupOption[] = [
  { value: "officer", label: "Officer" },
  { value: "senior-officer", label: "Senior Officer" },
  { value: "assistant-manager", label: "Assistant Manager" },
  { value: "deputy-manager", label: "Deputy Manager" },
  { value: "manager", label: "Manager" },
  { value: "senior-manager", label: "Senior Manager" },
  { value: "avp", label: "Assistant Vice President" },
  { value: "vp", label: "Vice President" },
  { value: "svp", label: "Senior Vice President" },
  { value: "head-of-department", label: "Head of Department" },
  { value: "system-administrator", label: "System Administrator" },
];

export const BRANCHES: LookupOption[] = [
  { value: "dhaka-gulshan", label: "Dhaka - Gulshan" },
  { value: "dhaka-motijheel", label: "Dhaka - Motijheel" },
  { value: "dhaka-uttara", label: "Dhaka - Uttara" },
  { value: "chattogram", label: "Chattogram" },
  { value: "sylhet", label: "Sylhet" },
  { value: "khulna", label: "Khulna" },
  { value: "rajshahi", label: "Rajshahi" },
  { value: "barishal", label: "Barishal" },
  { value: "rangpur", label: "Rangpur" },
  { value: "mymensingh", label: "Mymensingh" },
  { value: "comilla", label: "Comilla" },
  { value: "bogura", label: "Bogura" },
];

export const COST_CENTERS: LookupOption[] = [
  { value: "cc-001", label: "CC-001 · Retail Banking" },
  { value: "cc-002", label: "CC-002 · Corporate & SME" },
  { value: "cc-003", label: "CC-003 · Treasury" },
  { value: "cc-004", label: "CC-004 · Finance & Accounts" },
  { value: "cc-005", label: "CC-005 · Information Technology" },
  { value: "cc-006", label: "CC-006 · Human Resources" },
  { value: "cc-007", label: "CC-007 · Compliance" },
  { value: "cc-008", label: "CC-008 · Operations" },
];
