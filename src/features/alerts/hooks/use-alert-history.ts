"use client";

import { useAlertHistoryQuery } from "../api/get-alert-history";
import type { ClientAlertMessage, ClientCacheStatus } from "../schemas";

export interface UseAlertHistoryResult {
  messages: ClientAlertMessage[];
  isLoading: boolean;
  error: string | null;
  source: "api" | "cache" | null;
  lastUpdate: Date | null;
  cacheStatus: ClientCacheStatus | null;
  refetch: () => void;
}

// Convenience wrapper that maintains backward compatibility with the old hook
export function useAlertHistory(): UseAlertHistoryResult {
  const { data, isLoading, error, refetch } = useAlertHistoryQuery();

  return {
    messages: data?.messages ?? [],
    isLoading,
    error: error?.message ?? null,
    source: data?.source ?? null,
    lastUpdate: data?.lastUpdate ?? null,
    cacheStatus: data?.cacheStatus ?? null,
    refetch,
  };
}
