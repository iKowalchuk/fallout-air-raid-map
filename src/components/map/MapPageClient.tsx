"use client";

import UkraineMap from "@/components/map/UkraineMap";
import { ErrorBoundary } from "@/components/common/ErrorBoundary";
import { DataSourceIndicator } from "@/components/common/DataSourceIndicator";
import { useAlerts } from "@/hooks/useAlerts";

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
