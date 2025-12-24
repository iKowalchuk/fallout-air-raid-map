"use client";

import AlertStatus from "@/components/info/AlertStatus";
import BatteryStatus from "@/components/info/BatteryStatus";
import MessageLog from "@/components/info/MessageLog";
import TimelineBar from "@/components/info/TimelineBar";
import { useAlerts } from "@/hooks/useAlerts";
import { MOCK_MESSAGES } from "@/data/mockMessages";

export default function InfoPageClient() {
  const { alertCount, isLoading, source, lastUpdate } = useAlerts();
  const isAlertActive = alertCount > 0;

  // Using mock messages for now
  // TODO: Add real-time messages via API in the future
  const sortedMessages = [...MOCK_MESSAGES].sort(
    (a, b) => b.timestamp.getTime() - a.timestamp.getTime()
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <span className="text-lg font-[family-name:var(--font-pipboy)] glow-text animate-pulse">
          ЗАВАНТАЖЕННЯ ДАНИХ...
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Data source and last update indicator */}
      <div className="flex justify-between items-start mb-2">
        <AlertStatus isActive={isAlertActive} alertCount={alertCount} />
        <div className="text-xs font-[family-name:var(--font-pipboy)] opacity-50 text-right shrink-0">
          {source === "api" ? (
            <span className="glow-text">● LIVE</span>
          ) : (
            <span className="glow-text-red">● DEMO</span>
          )}
          {lastUpdate && (
            <div className="mt-1">
              {lastUpdate.toLocaleTimeString("uk-UA", {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
              })}
            </div>
          )}
        </div>
      </div>

      <BatteryStatus />
      <MessageLog messages={sortedMessages} />
      <TimelineBar />
    </div>
  );
}
