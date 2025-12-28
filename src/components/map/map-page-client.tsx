"use client";

import { DataSourceIndicator } from "@/components/common/data-source-indicator";
import { ErrorBoundary } from "@/components/common/error-boundary";
import UkraineMap from "@/components/map/ukraine-map";
import { useAlerts, usePrefetchData } from "@/features/alerts";

export default function MapPageClient() {
  const { alertedRegionIds, source } = useAlerts();

  // Prefetch history data in background to keep cache warm
  // This prevents loader when navigating to INFO page
  usePrefetchData();

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
