"use client";

import { isRegionAlerted } from "@/data/regions";
import type { Region } from "@/schemas";

interface RegionListProps {
  regions: Region[];
  alertedRegions: string[];
  hoveredRegion: string | null;
  selectedRegion: string | null;
  onRegionHover: (regionId: string | null) => void;
  onRegionClick?: (regionId: string) => void;
}

export default function RegionList({
  regions,
  alertedRegions,
  hoveredRegion,
  selectedRegion,
  onRegionHover,
  onRegionClick,
}: RegionListProps) {
  return (
    <ul
      className="space-y-0.5 overflow-hidden pl-2 font-[family-name:var(--font-pipboy)] text-xs md:text-sm"
      aria-label="Список регіонів України"
    >
      {regions.map((region, index) => {
        const isAlert = isRegionAlerted(region.id, alertedRegions);
        const isHovered = hoveredRegion === region.id;

        const isSelected = selectedRegion === region.id;

        return (
          <li key={region.id}>
            <button
              type="button"
              className={`region-list-item-enhanced flex w-full cursor-pointer items-center gap-2.5 text-left ${
                isHovered ? "hovered" : ""
              } ${isAlert ? "alert" : ""} ${isSelected ? "selected" : ""}`}
              onMouseEnter={() => onRegionHover(region.id)}
              onMouseLeave={() => onRegionHover(null)}
              onClick={() => {
                // Always trigger click - consistent with mobile behavior
                onRegionClick?.(region.id);
              }}
              style={{ animationDelay: `${index * 0.03}s` }}
              aria-label={`${region.nameUa}${isAlert ? ", повітряна тривога" : ", безпечно"}`}
              aria-current={isHovered || isSelected ? "true" : undefined}
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
          </li>
        );
      })}
    </ul>
  );
}
