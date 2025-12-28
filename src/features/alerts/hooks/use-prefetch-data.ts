"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { alertsApiClient } from "../api/alerts-api-client";
import { alertsQueryKeys } from "../api/query-keys";
import { POLLING_CONFIG } from "../utils";

/**
 * Prefetches alert history data in the background.
 * Used on MAP page to keep history cache warm, preventing
 * loader when navigating to INFO page.
 *
 * Runs once on mount, doesn't block rendering.
 * Note: We don't transform the response here - the query's `select`
 * option handles transformation when reading from cache.
 */
export function usePrefetchData() {
  const queryClient = useQueryClient();

  useEffect(() => {
    let cancelled = false;

    // Prefetch history data if not already cached
    void queryClient
      .prefetchQuery({
        queryKey: alertsQueryKeys.history(),
        queryFn: async () => {
          if (cancelled) return null;
          return alertsApiClient.getAlertHistory();
        },
        staleTime: POLLING_CONFIG.HISTORY_STALE_TIME_MS,
      })
      .catch((error) => {
        // Prefetch failures are non-critical, but log for debugging
        console.warn("Background prefetch failed:", error);
      });

    return () => {
      cancelled = true;
    };
  }, [queryClient]);
}
