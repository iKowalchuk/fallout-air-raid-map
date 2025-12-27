"use client";

import { DataSourceIndicator } from "@/components/common/data-source-indicator";
import { ErrorBoundary } from "@/components/common/error-boundary";
import { MapPageLoader } from "@/components/common/loader";
import UkraineMap from "@/components/map/ukraine-map";
import { useAlerts } from "@/features/alerts";

export default function MapPageClient() {
  const { alertedRegionIds, isLoading, source } = useAlerts();

  if (isLoading) {
    return <MapPageLoader />;
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
