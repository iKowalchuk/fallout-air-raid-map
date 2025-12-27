"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { POLLING_CONFIG } from "@/config/polling";
import {
  type AlertType,
  isValidAlertType,
  parseAlertsResponse,
} from "@/schemas";

// Local alert state with Date instead of string for startTime
interface LocalAlertState {
  regionId: string;
  isActive: boolean;
  alertType: AlertType;
  startTime: Date | null;
}

interface UseAlertsResult {
  alerts: LocalAlertState[];
  alertedRegionIds: string[];
  alertCount: number;
  isLoading: boolean;
  error: string | null;
  source: "api" | "cache" | null;
  lastUpdate: Date | null;
  refresh: () => Promise<void>;
}

export function useAlerts(): UseAlertsResult {
  const [alerts, setAlerts] = useState<LocalAlertState[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [source, setSource] = useState<"api" | "cache" | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch alerts via HTTP
  const fetchAlerts = useCallback(async () => {
    try {
      const response = await fetch("/api/alerts");
      if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
      }

      const rawData = await response.json();

      // Validate response with zod
      const parseResult = parseAlertsResponse(rawData);
      if (!parseResult.success) {
        console.error("Invalid API response:", parseResult.error.issues);
        throw new Error("Invalid API response format");
      }

      const data = parseResult.data;
      const transformedAlerts = data.alerts.map((alert) => ({
        regionId: alert.regionId,
        isActive: alert.isActive,
        // Validate alert type with type guard
        alertType: isValidAlertType(alert.alertType)
          ? alert.alertType
          : ("air_raid" as AlertType),
        startTime: alert.startTime ? new Date(alert.startTime) : null,
      }));

      setAlerts(transformedAlerts);
      setSource(data.source);
      setLastUpdate(new Date(data.lastUpdate));
      setError(data.error || null);
      setIsLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      setIsLoading(false);
    }
  }, []);

  // Initial load and polling
  useEffect(() => {
    fetchAlerts();

    // Polling for updates (no SSE available in alerts.in.ua)
    pollingIntervalRef.current = setInterval(
      fetchAlerts,
      POLLING_CONFIG.ALERTS_INTERVAL_MS,
    );

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, [fetchAlerts]);

  // Computed values
  const alertedRegionIds = alerts
    .filter((a) => a.isActive)
    .map((a) => a.regionId);
  const alertCount = alertedRegionIds.length;

  return {
    alerts,
    alertedRegionIds,
    alertCount,
    isLoading,
    error,
    source,
    lastUpdate,
    refresh: fetchAlerts,
  };
}
