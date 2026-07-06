import type { ReportCategory } from "@/types";

export interface ReportCatalogueEntry {
  id: string;
  name: string;
  category: ReportCategory;
  description: string;
}

export const REPORT_CATEGORIES: ReportCategory[] = [
  "FINANCIAL",
  "LOAN",
  "DEPOSIT",
  "TREASURY",
  "OPERATIONAL",
  "MIS",
];

export const REPORT_CATALOGUE: ReportCatalogueEntry[] = [
  {
    id: "loan-portfolio-summary",
    name: "Loan Portfolio Summary",
    category: "LOAN",
    description: "Outstanding loan portfolio broken down by branch and product.",
  },
  {
    id: "deposit-growth-trend",
    name: "Deposit Growth Trend",
    category: "DEPOSIT",
    description: "Monthly deposit growth trend across branches.",
  },
  {
    id: "treasury-position",
    name: "Treasury Position",
    category: "TREASURY",
    description: "Daily treasury position and liquidity coverage.",
  },
  {
    id: "branch-contribution",
    name: "Branch Contribution",
    category: "MIS",
    description: "Branch-wise contribution to overall profitability.",
  },
];