export type ReportOutputFormat = "PDF" | "XLS";

export type ReportGenerationParams = Record<string, string>;

export interface UserReportAccess {
  userId: string;
  reportIds: number[];
}
