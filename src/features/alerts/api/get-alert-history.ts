import { useQuery } from "@tanstack/react-query";
import { transformHistoryResponse } from "../schemas";
import { POLLING_CONFIG } from "../utils";
import { alertsApiClient } from "./alerts-api-client";
import { alertsQueryKeys } from "./query-keys";

// Hook with automatic transformation
export function useAlertHistoryQuery() {
  return useQuery({
    queryKey: alertsQueryKeys.history(),
    queryFn: () => alertsApiClient.getAlertHistory(),
    staleTime: POLLING_CONFIG.HISTORY_STALE_TIME_MS,
    refetchInterval: POLLING_CONFIG.HISTORY_INTERVAL_MS,
    refetchIntervalInBackground: false, // Pause when tab inactive
    select: transformHistoryResponse,
  });
}
