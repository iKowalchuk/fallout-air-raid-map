import { useQuery } from "@tanstack/react-query";
import { transformActiveAlertsResponse } from "../schemas";
import { POLLING_CONFIG } from "../utils";
import { alertsApiClient } from "./alerts-api-client";
import { alertsQueryKeys } from "./query-keys";

// Hook with automatic transformation
export function useActiveAlerts() {
  return useQuery({
    queryKey: alertsQueryKeys.active(),
    queryFn: async () => {
      return alertsApiClient.getActiveAlerts();
    },
    staleTime: POLLING_CONFIG.ALERTS_STALE_TIME_MS,
    refetchInterval: POLLING_CONFIG.ALERTS_INTERVAL_MS,
    refetchIntervalInBackground: false, // Pause when tab inactive
    select: transformActiveAlertsResponse,
  });
}
