// Report catalogue for IPDC Report Service.
//
// Parameter lists are frontend placeholder defaults derived from the common
// fields observed across the legacy report server, applied per category.
// Reports called out explicitly in the workflow spec (Loan Sheet, Deposit
// Sheet, Disbursement Report) use their confirmed field list. The backend
// (Phase 2) is the source of truth for each report's real parameter set.

export type ReportCategoryId =
  | "loan"
  | "treasury"
  | "deposit"
  | "other"
  | "finance"
  | "balance-certificate"
  | "summary"
  | "crb";

export interface ReportCategoryDefinition {
  id: ReportCategoryId;
  label: string;
  icon: string;
}

export const REPORT_CATEGORIES: ReportCategoryDefinition[] = [
  { id: "loan", label: "Loan", icon: "💰" },
  { id: "treasury", label: "Treasury Report", icon: "🏦" },
  { id: "deposit", label: "Deposit", icon: "💳" },
  { id: "other", label: "Other Reports", icon: "📋" },
  { id: "finance", label: "Finance Report", icon: "📊" },
  { id: "balance-certificate", label: "Balance Certificate", icon: "📜" },
  { id: "summary", label: "Summary Report", icon: "📈" },
  { id: "crb", label: "IPDC CRB", icon: "🗂️" },
];

export type ReportParamKey =
  | "asOnDate"
  | "branchCode"
  | "arrangementNo"
  | "t24AccountNo"
  | "buAccountNo"
  | "center"
  | "rmCode";

export interface ReportParamFieldDefinition {
  key: ReportParamKey;
  label: string;
  type: "date" | "text";
  placeholder?: string;
}

export const REPORT_PARAM_FIELDS: Record<ReportParamKey, ReportParamFieldDefinition> = {
  asOnDate: { key: "asOnDate", label: "As On Date (Last Working Day)", type: "date" },
  branchCode: { key: "branchCode", label: "Branch Code (00XX)", type: "text", placeholder: "00XX" },
  arrangementNo: { key: "arrangementNo", label: "Arrangement No", type: "text" },
  t24AccountNo: { key: "t24AccountNo", label: "T24 Account No", type: "text" },
  buAccountNo: { key: "buAccountNo", label: "BU Account No", type: "text" },
  center: { key: "center", label: "Center", type: "text" },
  rmCode: { key: "rmCode", label: "RM Code", type: "text" },
};

export interface ReportDefinition {
  reportId: number;
  name: string;
  category: ReportCategoryId;
  params: ReportParamKey[];
}

const DEFAULT_PARAMS_BY_CATEGORY: Record<ReportCategoryId, ReportParamKey[]> = {
  loan: ["asOnDate", "branchCode", "arrangementNo", "t24AccountNo"],
  treasury: ["asOnDate"],
  deposit: ["asOnDate", "branchCode", "t24AccountNo"],
  other: ["asOnDate", "branchCode"],
  finance: ["asOnDate", "branchCode"],
  "balance-certificate": ["asOnDate", "t24AccountNo"],
  summary: ["asOnDate", "branchCode"],
  crb: ["asOnDate"],
};

let nextPlaceholderId = 9001;

function report(
  reportId: number | null,
  name: string,
  category: ReportCategoryId,
  params?: ReportParamKey[],
): ReportDefinition {
  return {
    reportId: reportId ?? nextPlaceholderId++,
    name,
    category,
    params: params ?? DEFAULT_PARAMS_BY_CATEGORY[category],
  };
}

export const REPORT_CATALOGUE: ReportDefinition[] = [
  // LOAN
  report(1001, "Loan Sheet", "loan", [
    "asOnDate",
    "branchCode",
    "arrangementNo",
    "t24AccountNo",
    "buAccountNo",
    "center",
    "rmCode",
  ]),
  report(1079, "Disbursement Report", "loan", ["asOnDate", "branchCode"]),
  report(1080, "Recovery Report", "loan"),
  report(1095, "Loan Tax Certificate Final", "loan", ["asOnDate", "t24AccountNo"]),
  report(1077, "Balance Certificate (Loan)", "loan", ["asOnDate", "t24AccountNo"]),
  report(1088, "Loan Sheet (MME)", "loan"),
  report(1017, "Remaining PDC (Retail)", "loan"),
  report(1091, "Lien Report (D to L)", "loan"),
  report(1016, "EMI Reminder (Retail)", "loan"),
  report(1092, "Lien Report (L to D)", "loan"),
  report(1093, "Lien Report (M)", "loan"),
  report(1021, "New Disbursement", "loan"),
  report(1023, "Loan Recovery", "loan"),
  report(1084, "Deposit Payable Report", "loan"),
  report(1024, "Interest Suspense Adjustment", "loan"),
  report(1036, "Arr Bill OR OS", "loan"),
  report(1073, "Customer Contact Info (Retail)", "loan"),
  report(1037, "Arr Bill Payment", "loan"),
  report(1082, "Early Settlement Report", "loan"),
  report(1085, "Eligible Security Report", "loan"),
  report(null, "SF Data Report", "loan"),
  report(null, "Retail New Disbursement Report", "loan"),
  report(null, "Loan SI Report", "loan"),
  report(null, "NBR Loan Report", "loan"),

  // TREASURY REPORT
  report(null, "Daily Fund Position", "treasury"),

  // DEPOSIT
  report(1002, "Deposit Sheet", "deposit", ["asOnDate"]),
  report(1078, "Deposit Tax Certificate", "deposit", ["asOnDate", "t24AccountNo"]),
  report(1018, "Renewed & Encashed (Retail)", "deposit"),
  report(1019, "Deposit Mix (Retail)", "deposit"),
  report(1022, "New Deposit", "deposit"),
  report(1074, "Portfolio (Priority)", "deposit"),
  report(1048, "Lien Accounts", "deposit"),
  report(1081, "Early Encashment Report", "deposit"),
  report(1098, "Deposit Welcome Letter", "deposit", ["asOnDate", "t24AccountNo"]),
  report(1087, "Customer Statement - Deposit", "deposit", ["asOnDate", "t24AccountNo"]),
  report(1097, "Deposit Renewal Letter", "deposit", ["asOnDate", "t24AccountNo"]),
  report(1099, "Deposit Thanks Letter", "deposit", ["asOnDate", "t24AccountNo"]),
  report(1110, "Deposit Sheet", "deposit", ["asOnDate"]),
  report(1111, "Deposit SI Report", "deposit"),
  report(1113, "Deposit Print Address Report", "deposit"),
  report(1115, "NBR Deposit Report", "deposit"),

  // OTHER REPORTS
  report(1004, "STMT Entry List", "other"),
  report(1089, "Line Wise STMT", "other"),
  report(1015, "Account Wise Contact (Retail)", "other"),
  report(1090, "Line Wise SPEC", "other"),
  report(1030, "Arrangement Exception", "other"),
  report(1042, "Contact Address Mentioned in Account (Retail)", "other"),
  report(1043, "Customer Static Information", "other"),
  report(1049, "PDC Report", "other"),
  report(1072, "Customer Static Information (OPS)", "other"),
  report(1050, "MME Customer Report", "other"),
  report(1051, "MME Shareholder Report", "other"),
  report(1052, "Customer Role Report", "other"),
  report(1053, "Customer Shareholder Report", "other"),
  report(1054, "CWGF Report", "other"),
  report(1064, "SMS History", "other"),
  report(1100, "Line Wise CATEG", "other"),
  report(1066, "Daily SMS Report", "other"),
  report(1068, "SMS Summary", "other"),
  report(1070, "SMS Event", "other"),
  report(1086, "Counter Party Limit Report", "other"),
  report(1071, "T24 User Log", "other"),
  report(1096, "Customer Payment Report", "other"),
  report(1105, "PEP and Risk Score Report", "other"),
  report(1106, "Deposit Encashment Of Retails", "other"),
  report(1107, "Deposit Inflow Of Retail", "other"),
  report(1117, "All Scheduled SMS Report", "other"),
  report(null, "ALL SMS FROM SHIRI", "other"),

  // FINANCE REPORT
  report(1005, "Internal Account Balance", "finance"),
  report(1011, "Balance Sheet GL", "finance", ["asOnDate"]),
  report(1020, "GL Line Balance", "finance"),
  report(1027, "Loan GL Balance (ISS)", "finance"),
  report(1028, "Income Statement (PL)", "finance", ["asOnDate"]),
  report(1034, "ISS Report (Deposit)", "finance"),
  report(1035, "ISS Report (Loan)", "finance"),
  report(1031, "Branch Wise GL Balances", "finance"),
  report(1032, "Branch Wise PL Balances", "finance"),
  report(1033, "Center Wise BS Balances", "finance", ["asOnDate", "center"]),
  report(1094, "Rate Change Monitor", "finance"),
  report(1012, "Account Wise Transaction", "finance", ["asOnDate", "t24AccountNo"]),
  report(1013, "Cost Center Wise PL Balance", "finance"),
  report(1038, "Bank Account Transaction", "finance", ["asOnDate", "t24AccountNo"]),
  report(1040, "FIT Account Transactions - Lending", "finance"),
  report(1041, "FIT Account Transactions - Deposit", "finance"),
  report(1044, "FIT Account Transactions - CWGF", "finance"),
  report(1045, "FIT Account Transactions - DANA", "finance"),
  report(1046, "FIT Account Transactions - Treasury Deposit", "finance"),
  report(1047, "FIT Account Transactions - Treasury Loan", "finance"),
  report(1069, "Account Wise PL Balance", "finance"),
  report(1102, "Recorded Cash Transaction", "finance"),
  report(1103, "Center and Product Wise GL Average Balance Report", "finance"),

  // BALANCE CERTIFICATE
  report(1006, "Loan Certificate", "balance-certificate"),
  report(1007, "Individual Deposit Certificate", "balance-certificate"),
  report(1008, "Organizational Deposit Certificate", "balance-certificate"),
  report(1029, "Loan Closure Certificate (CWGF)", "balance-certificate"),
  report(1065, "Loan Closure Certificate 2 (CWGF)", "balance-certificate"),

  // SUMMARY REPORT
  report(1009, "Branch Wise Portfolio (IPDC)", "summary"),
  report(1010, "Branch Wise Portfolio (Retail)", "summary"),
  report(1014, "New Business Report-1 (Retail)", "summary"),
  report(1039, "New Business Report-2 (Retail)", "summary"),
  report(1025, "Loan Portfolio (Product, Center & Branch)", "summary", ["asOnDate", "branchCode", "center"]),
  report(1026, "Deposit Portfolio (Product, Center & Branch)", "summary", ["asOnDate", "branchCode", "center"]),
  report(1067, "Product Wise Portfolio (Retail)", "summary"),
  report(1109, "Bangladesh Bank Report", "summary", ["asOnDate"]),

  // IPDC CRB
  report(1101, "IPDC.CRB.BS", "crb"),
];

export function getReportsByCategory(category: ReportCategoryId): ReportDefinition[] {
  return REPORT_CATALOGUE.filter((r) => r.category === category);
}

export function getReportById(reportId: number): ReportDefinition | undefined {
  return REPORT_CATALOGUE.find((r) => r.reportId === reportId);
}

export function getCategoryById(id: string): ReportCategoryDefinition | undefined {
  return REPORT_CATEGORIES.find((c) => c.id === id);
}
