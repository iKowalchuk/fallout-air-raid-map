"use client";

import { Region } from "@/types";

interface RegionListProps {
  regions: Region[];
  alertedRegions: string[];
  hoveredRegion: string | null;
  onRegionHover: (regionId: string | null) => void;
}

export default function RegionList({
  regions,
  alertedRegions,
  hoveredRegion,
  onRegionHover,
}: RegionListProps) {
  return (
    <div className="space-y-1 font-[family-name:var(--font-pipboy)] text-xs md:text-sm pl-2">
      {regions.map((region) => {
        const isAlert = alertedRegions.includes(region.id);
        const isHovered = hoveredRegion === region.id;

        return (
          <div
            key={region.id}
            className="region-list-item cursor-pointer transition-colors"
            onMouseEnter={() => onRegionHover(region.id)}
            onMouseLeave={() => onRegionHover(null)}
          >
            <div
              className={`region-indicator ${
                isAlert ? "region-indicator-alert" : "region-indicator-safe"
              }`}
            />
            <span
              className={
                isAlert
                  ? "glow-text-red"
                  : isHovered
                  ? "glow-text-bright"
                  : "glow-text"
              }
            >
              {region.nameUa}
            </span>
          </div>
        );
      })}
    </div>
  );
}
