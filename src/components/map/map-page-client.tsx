"use client";

import { DataSourceIndicator } from "@/components/common/data-source-indicator";
import { ErrorBoundary } from "@/components/common/error-boundary";
import UkraineMap from "@/components/map/ukraine-map";
import { useAlerts } from "@/features/alerts";

export default function MapPageClient() {
  const { alertedRegionIds, isLoading, source } = useAlerts();

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <span className="glow-text animate-pulse font-[family-name:var(--font-pipboy)] text-lg">
          ЗАВАНТАЖЕННЯ ДАНИХ...
        </span>
      </div>
    );
  }

  return (
    <div className="relative flex h-full flex-col">
      {/* Data source indicator - absolute position */}
      <div className="absolute top-0 right-0 z-10">
        <div className="flex items-center gap-2 font-[family-name:var(--font-pipboy)] text-xs">
          <DataSourceIndicator source={source} />
        </div>
      </div>

      <ErrorBoundary>
        <UkraineMap alertedRegions={alertedRegionIds} />
      </ErrorBoundary>
    </div>
  );
}
