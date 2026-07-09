import { apiClient } from "@/lib/apiClient";

export interface AppSettings {
  appName: string;
  supportEmail: string;
  footerText: string;
  maintenanceMode: boolean;
}

export const DEFAULT_APP_SETTINGS: AppSettings = {
  appName: "IPDC Report Service",
  supportEmail: "btteam@ipdcbd.com",
  footerText: "© 2026 - Business Transformation, IPDC Finance Limited",
  maintenanceMode: false,
};

export async function fetchAppSettings(): Promise<AppSettings> {
  const response = await apiClient.get<AppSettings>("/admin/settings");
  return response.data;
}

export async function updateAppSettings(payload: AppSettings): Promise<AppSettings> {
  const response = await apiClient.put<AppSettings>("/admin/settings", payload);
  return response.data;
}
