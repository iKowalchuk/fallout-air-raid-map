"use client";

import { useMemo } from "react";
import { DataSourceIndicator } from "@/components/common/data-source-indicator";
import { ErrorBoundary } from "@/components/common/error-boundary";
import AlertStatus from "@/components/info/alert-status";
import MessageLog from "@/components/info/message-log";
import TimelineBar from "@/components/info/timeline-bar";
import { getRegionById } from "@/data/regions";
import { useAlertHistory, useAlerts } from "@/features/alerts";

export default function InfoPageClient() {
  const {
    alerts,
    alertCount,
    isLoading: alertsLoading,
    source: alertsSource,
  } = useAlerts();
  const {
    messages: historyMessages,
    isLoading: historyLoading,
    source: historySource,
    cacheStatus,
  } = useAlertHistory();
  const isAlertActive = alertCount > 0;

  // Combine history messages with current active alerts
  const messages = useMemo(() => {
    // Create alert_start messages from current active alerts
    const activeAlertMessages = alerts
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

    // Merge with history, avoiding duplicates
    const activeIds = new Set(activeAlertMessages.map((m) => m.regionId));
    const filteredHistory = historyMessages.filter((m) => {
      // Keep if not an active alert_start for the same region
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

    return [...activeAlertMessages, ...filteredHistory].sort(
      (a, b) => b.timestamp.getTime() - a.timestamp.getTime(),
    );
  }, [alerts, historyMessages]);

  // Use history source when available, fallback to alerts
  const source = historySource || alertsSource;

  if (alertsLoading || historyLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="loading-container">
          <div className="loading-spinner" />
          <span className="glow-text mt-4 font-[family-name:var(--font-pipboy)] text-lg">
            ЗАВАНТАЖЕННЯ ДАНИХ...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in relative flex h-full flex-col">
      {/* Data source indicator - absolute position */}
      <div className="absolute top-0 right-0 z-10">
        <div className="flex items-center gap-2 font-[family-name:var(--font-pipboy)] text-xs">
          <DataSourceIndicator source={source} />
        </div>
      </div>

      <ErrorBoundary>
        {/* Alert status */}
        <AlertStatus isActive={isAlertActive} alertCount={alertCount} />

        <MessageLog messages={messages} cacheStatus={cacheStatus} />
        <TimelineBar messages={messages} />
      </ErrorBoundary>
    </div>
  );
}
