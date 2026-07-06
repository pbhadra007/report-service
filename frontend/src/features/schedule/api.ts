import { apiClient } from "@/lib/apiClient";

export interface ScheduledReport {
  id: string;
  reportId: string;
  reportName: string;
  cronExpression: string;
  recipients: string[];
  active: boolean;
}

export interface CreateScheduleInput {
  reportId: string;
  cronExpression: string;
  recipients: string[];
}

export async function fetchSchedules(): Promise<ScheduledReport[]> {
  const response = await apiClient.get<ScheduledReport[]>("/schedule");
  return response.data;
}

export async function createSchedule(input: CreateScheduleInput): Promise<ScheduledReport> {
  const response = await apiClient.post<ScheduledReport>("/schedule", input);
  return response.data;
}
