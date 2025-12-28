"use client";

import { useActiveAlerts } from "../api/get-active-alerts";
import type { LocalAlertState } from "../schemas";

export interface UseAlertsResult {
  alerts: LocalAlertState[];
  alertedRegionIds: string[];
  alertCount: number;
  isLoading: boolean;
  /** Whether data exists (from cache or API) */
  hasData: boolean;
  error: string | null;
  source: "api" | "cache" | null;
  lastUpdate: Date | null;
  refresh: () => Promise<unknown>;
}

// Convenience wrapper that maintains backward compatibility with the old hook
export function useAlerts(): UseAlertsResult {
  const { data, isLoading, error, refetch } = useActiveAlerts();

  return {
    alerts: data?.alerts ?? [],
    alertedRegionIds: data?.alertedRegionIds ?? [],
    alertCount: data?.alertCount ?? 0,
    isLoading,
    hasData: data !== undefined,
    error: error?.message ?? data?.error ?? null,
    source: data?.source ?? null,
    lastUpdate: data?.lastUpdate ?? null,
    refresh: refetch,
  };
}
