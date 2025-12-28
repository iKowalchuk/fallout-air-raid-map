"use client";

import { useAlertHistory } from "./use-alert-history";
import { useAlerts } from "./use-alerts";

export interface UseAppInitializationResult {
  /** True when required data is loading without cached data */
  isInitializing: boolean;
  /** Whether required data exists (from cache or API) */
  hasRequiredData: boolean;
}

/**
 * Determines if the app is in initial loading state for required data.
 * Returns true when required data is loading without cached data.
 *
 * @param requiredData - What data is needed: 'alerts' or 'messages' (alerts + history)
 */
export function useAppInitialization(
  requiredData: "alerts" | "messages",
): UseAppInitializationResult {
  const { isLoading: alertsLoading, hasData: hasAlerts } = useAlerts();
  const { isLoading: historyLoading, hasData: hasHistory } = useAlertHistory();

  // Determine what's initializing based on requirements
  let isInitializing: boolean;
  let hasRequiredData: boolean;

  if (requiredData === "alerts") {
    // MAP page only needs alerts
    isInitializing = alertsLoading && !hasAlerts;
    hasRequiredData = hasAlerts;
  } else {
    // INFO page needs both alerts and history
    isInitializing =
      (alertsLoading && !hasAlerts) || (historyLoading && !hasHistory);
    hasRequiredData = hasAlerts && hasHistory;
  }

  return {
    isInitializing,
    hasRequiredData,
  };
}
