"use client";

import { DataSourceIndicator } from "@/components/common/data-source-indicator";
import { ErrorBoundary } from "@/components/common/error-boundary";
import { InfoPageLoader } from "@/components/common/loader";
import AlertStatus from "@/components/info/alert-status";
import MessageLog from "@/components/info/message-log";
import TimelineBar from "@/components/info/timeline-bar";
import { useMessages } from "@/features/alerts";

export default function InfoPageClient() {
  const {
    messages,
    alertCount,
    isAlertActive,
    isLoading,
    source,
    cacheStatus,
  } = useMessages();

  if (isLoading) {
    return <InfoPageLoader />;
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
