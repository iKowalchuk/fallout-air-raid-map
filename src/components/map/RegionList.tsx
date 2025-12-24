"use client";

import type { Region } from "@/schemas";

interface RegionListProps {
  regions: Region[];
  alertedRegions: string[];
  hoveredRegion: string | null;
  onRegionHover: (regionId: string | null) => void;
  onRegionClick?: (regionId: string) => void;
}

export default function RegionList({
  regions,
  alertedRegions,
  hoveredRegion,
  onRegionHover,
  onRegionClick,
}: RegionListProps) {
  return (
    <div
      className="space-y-0.5 overflow-hidden pl-2 font-[family-name:var(--font-pipboy)] text-xs md:text-sm"
      role="list"
      aria-label="Список регіонів України"
    >
      {regions.map((region, index) => {
        const isAlert = alertedRegions.includes(region.id);
        const isHovered = hoveredRegion === region.id;

        return (
          <button
            key={region.id}
            className={`region-list-item-enhanced flex w-full cursor-pointer items-center gap-2 text-left ${
              isHovered ? "hovered" : ""
            } ${isAlert ? "alert" : ""}`}
            onMouseEnter={() => onRegionHover(region.id)}
            onMouseLeave={() => onRegionHover(null)}
            onClick={() => onRegionClick?.(region.id)}
            style={{ animationDelay: `${index * 0.02}s` }}
            role="listitem"
            aria-label={`${region.nameUa}${isAlert ? ", повітряна тривога" : ", безпечно"}`}
            aria-current={isHovered ? "true" : undefined}
          >
            <div
              className={`region-indicator-enhanced ${
                isAlert ? "alert" : "safe"
              }`}
              aria-hidden="true"
            />
            <span
              className={`truncate transition-all duration-200 ${
                isAlert
                  ? isHovered
                    ? "glow-text-red-bright"
                    : "glow-text-red"
                  : isHovered
                    ? "glow-text-bright"
                    : "glow-text"
              }`}
            >
              {region.nameUa}
            </span>
          </button>
        );
      })}
    </div>
  );
}
