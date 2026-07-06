import { apiClient } from "@/lib/apiClient";
import type { CobStatus } from "@/types";

export interface EtlPipelineJob {
  id: string;
  name: string;
  status: "PENDING" | "RUNNING" | "SUCCESS" | "FAILED";
  startedAt: string;
  finishedAt: string | null;
}

export async function fetchCobStatus(): Promise<CobStatus> {
  const response = await apiClient.get<CobStatus>("/etl/cob-status");
  return response.data;
}

export async function fetchEtlPipelineJobs(): Promise<EtlPipelineJob[]> {
  const response = await apiClient.get<EtlPipelineJob[]>("/etl/jobs");
  return response.data;
}
