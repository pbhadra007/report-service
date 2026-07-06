import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";
import { COB_STATUS_POLL_INTERVAL_MS } from "@/lib/constants";
import { useCobStore } from "@/store/cobStore";
import type { CobStatus } from "@/types";

async function fetchCobStatus(): Promise<CobStatus> {
  const response = await apiClient.get<CobStatus>("/etl/cob-status");
  return response.data;
}

export interface UseCobStatusResult {
  cobStatus: CobStatus | undefined;
  isLoading: boolean;
  isError: boolean;
}

export function useCobStatus(): UseCobStatusResult {
  const setCobStatus = useCobStore((state) => state.setCobStatus);

  const query = useQuery({
    queryKey: ["etl", "cob-status"],
    queryFn: fetchCobStatus,
    refetchInterval: COB_STATUS_POLL_INTERVAL_MS,
  });

  useEffect(() => {
    if (query.data) {
      setCobStatus(query.data);
    }
  }, [query.data, setCobStatus]);

  return {
    cobStatus: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
  };
}
