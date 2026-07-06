import { apiClient } from "@/lib/apiClient";

export interface RegulatoryReturn {
  id: string;
  name: string;
  frequency: "DAILY" | "WEEKLY" | "MONTHLY" | "QUARTERLY";
  dueDate: string;
  status: "PENDING" | "SUBMITTED" | "OVERDUE";
}

export async function fetchRegulatoryReturns(): Promise<RegulatoryReturn[]> {
  const response = await apiClient.get<RegulatoryReturn[]>("/regulatory/returns");
  return response.data;
}
