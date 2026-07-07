import { useQuery } from "@tanstack/react-query";
import { fetchUserReportAccess } from "@/features/reports/api";

export interface UseReportAccessResult {
  accessibleReportIds: number[];
  isLoading: boolean;
  hasAccess: (reportId: number) => boolean;
}

export function useReportAccess(): UseReportAccessResult {
  const { data, isLoading } = useQuery({
    queryKey: ["reports", "access"],
    queryFn: fetchUserReportAccess,
  });

  const accessibleReportIds = data?.reportIds ?? [];

  return {
    accessibleReportIds,
    isLoading,
    hasAccess: (reportId) => accessibleReportIds.includes(reportId),
  };
}
