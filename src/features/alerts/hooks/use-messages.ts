"use client";

import { useMemo } from "react";
import { getRegionById } from "@/data/regions";
import type {
  ClientAlertMessage,
  ClientCacheStatus,
  LocalAlertState,
} from "../schemas";
import { useAlertHistory } from "./use-alert-history";
import { useAlerts } from "./use-alerts";

export interface UseMessagesResult {
  /** Combined and deduplicated messages from active alerts and history */
  messages: ClientAlertMessage[];
  /** Number of currently active alerts */
  alertCount: number;
  /** Whether there's at least one active alert */
  isAlertActive: boolean;
  /** Loading state for either alerts or history */
  isLoading: boolean;
  /** Whether any data exists (from cache or API) */
  hasData: boolean;
  /** Data source - "api" or "cache" */
  source: "api" | "cache" | null;
  /** Cache status for history data */
  cacheStatus: ClientCacheStatus | null;
  /** Current active alerts */
  alerts: LocalAlertState[];
}

/**
 * Merges active alerts with history messages, avoiding duplicates.
 * Active alerts take precedence over history for the same region+timestamp.
 */
function mergeAndDeduplicateMessages(
  alerts: LocalAlertState[],
  historyMessages: ClientAlertMessage[],
): ClientAlertMessage[] {
  // Create alert_start messages from current active alerts
  const activeAlertMessages: ClientAlertMessage[] = alerts
    .filter((alert) => alert.isActive && alert.startTime)
    .map((alert) => {
      const region = getRegionById(alert.regionId);
      return {
        id: `active-${alert.regionId}`,
        timestamp: alert.startTime || new Date(),
        regionId: alert.regionId,
        regionName: region?.nameUa || alert.regionId,
        type: "alert_start" as const,
        message: "Повітряна тривога!",
      };
    });

  // Build a set of active region IDs for quick lookup
  const activeIds = new Set(activeAlertMessages.map((m) => m.regionId));

  // Filter history to avoid duplicates with active alerts
  const filteredHistory = historyMessages.filter((m) => {
    // Keep if not an alert_start for the same region
    if (m.type !== "alert_start") return true;
    if (!activeIds.has(m.regionId)) return true;

    // Check if this is the same alert by comparing timestamps
    const activeAlert = activeAlertMessages.find(
      (a) => a.regionId === m.regionId,
    );
    if (!activeAlert) return true;

    // If timestamps are within 1 minute, consider them the same alert
    const timeDiff = Math.abs(
      activeAlert.timestamp.getTime() - m.timestamp.getTime(),
    );
    return timeDiff > 60000;
  });

  // Combine and sort by timestamp descending (newest first)
  return [...activeAlertMessages, ...filteredHistory].sort(
    (a, b) => b.timestamp.getTime() - a.timestamp.getTime(),
  );
}

/**
 * Combined hook for fetching and merging alert messages.
 * Handles deduplication of active alerts with historical data.
 */
export function useMessages(): UseMessagesResult {
  const {
    alerts,
    alertCount,
    source: alertsSource,
    hasData: alertsHasData,
  } = useAlerts();

  const {
    messages: historyMessages,
    source: historySource,
    cacheStatus,
    hasData: historyHasData,
  } = useAlertHistory();

  const messages = useMemo(
    () => mergeAndDeduplicateMessages(alerts, historyMessages),
    [alerts, historyMessages],
  );

  // Use history source when available, fallback to alerts source
  const source = historySource || alertsSource;

  // Data is available if either alerts or history has data
  const hasData = alertsHasData || historyHasData;

  // Both data sources must be loaded before we can determine if there are messages
  // This prevents showing EmptyState while history is still loading
  const allDataLoaded = alertsHasData && historyHasData;

  // Show loading only when:
  // 1. Not all data sources have loaded yet, AND
  // 2. We have no messages to show
  // This prevents both skeleton and empty state flashing after global loader
  const isInitialLoading = !allDataLoaded && messages.length === 0;

  return {
    messages,
    alertCount,
    isAlertActive: alertCount > 0,
    isLoading: isInitialLoading,
    hasData,
    source,
    cacheStatus,
    alerts,
  };
}
