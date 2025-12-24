"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { AlertState } from "@/types";

interface AlertsApiResponse {
  alerts: Array<{
    regionId: string;
    isActive: boolean;
    alertType: string;
    startTime: string | null;
  }>;
  source: "api" | "mock";
  lastUpdate: string;
  error?: string;
}

interface UseAlertsResult {
  alerts: AlertState[];
  alertedRegionIds: string[];
  alertCount: number;
  isLoading: boolean;
  error: string | null;
  source: "api" | "mock" | null;
  lastUpdate: Date | null;
  refresh: () => Promise<void>;
}

const POLLING_INTERVAL = 30000; // 30 seconds
const SSE_RECONNECT_DELAY = 5000; // 5 seconds

export function useAlerts(): UseAlertsResult {
  const [alerts, setAlerts] = useState<AlertState[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [source, setSource] = useState<"api" | "mock" | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const eventSourceRef = useRef<EventSource | null>(null);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch alerts via HTTP
  const fetchAlerts = useCallback(async () => {
    try {
      const response = await fetch("/api/alerts");
      if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
      }

      const data: AlertsApiResponse = await response.json();

      const transformedAlerts: AlertState[] = data.alerts.map((alert) => ({
        regionId: alert.regionId,
        isActive: alert.isActive,
        alertType: alert.alertType as AlertState["alertType"],
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

  // Connect to SSE
  const connectSSE = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    const eventSource = new EventSource("/api/alerts/stream");
    eventSourceRef.current = eventSource;

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        if (data.error) {
          console.warn("SSE error:", data.error);
          return;
        }

        // Update state for specific region
        setAlerts((prevAlerts) => {
          const existingIndex = prevAlerts.findIndex(
            (a) => a.regionId === data.regionId
          );

          const updatedAlert: AlertState = {
            regionId: data.regionId,
            isActive: data.isActive,
            alertType: data.alertType,
            startTime: data.startTime ? new Date(data.startTime) : null,
          };

          if (existingIndex >= 0) {
            // Update existing alert
            const newAlerts = [...prevAlerts];
            if (data.isActive) {
              newAlerts[existingIndex] = updatedAlert;
            } else {
              // Remove alert if inactive
              newAlerts.splice(existingIndex, 1);
            }
            return newAlerts;
          } else if (data.isActive) {
            // Add new alert
            return [...prevAlerts, updatedAlert];
          }

          return prevAlerts;
        });

        setLastUpdate(new Date());
      } catch {
        console.error("Failed to parse SSE event");
      }
    };

    eventSource.onerror = () => {
      console.warn("SSE connection error, reconnecting...");
      eventSource.close();
      eventSourceRef.current = null;

      // Reconnect after delay
      setTimeout(connectSSE, SSE_RECONNECT_DELAY);
    };

    eventSource.onopen = () => {
      console.log("SSE connected");
      setSource("api");
    };
  }, []);

  // Initial load
  useEffect(() => {
    fetchAlerts();

    // Try to connect to SSE
    connectSSE();

    // Fallback polling if SSE doesn't work
    pollingIntervalRef.current = setInterval(fetchAlerts, POLLING_INTERVAL);

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, [fetchAlerts, connectSSE]);

  // Computed values
  const alertedRegionIds = alerts.filter((a) => a.isActive).map((a) => a.regionId);
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
