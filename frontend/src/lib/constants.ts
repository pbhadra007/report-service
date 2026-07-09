export const API_BASE_URL: string =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080/api/v1";

export const APP_ENV: string = process.env.NEXT_PUBLIC_APP_ENV ?? "dev";

export const REPORT_STALE_TIME_MS = 5 * 60 * 1000;

export const DEFAULT_PAGE_SIZE = 25;

export const APP_NAME = "IPDC Report Service";