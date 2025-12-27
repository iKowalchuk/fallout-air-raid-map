"use client";

import { useState } from "react";
import type { Region } from "@/schemas";

interface MobileRegionDrawerProps {
  regions: Region[];
  alertedRegions: string[];
  hoveredRegion: string | null;
  selectedRegion: string | null;
  onRegionHover: (regionId: string | null) => void;
  onRegionClick: (regionId: string) => void;
}

export default function MobileRegionDrawer({
  regions,
  alertedRegions,
  hoveredRegion,
  selectedRegion,
  onRegionHover,
  onRegionClick,
}: MobileRegionDrawerProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const alertedCount = alertedRegions.length;
  const safeCount = regions.length - alertedCount;

  // Sort regions: alerted first
  const sortedRegions = [...regions].sort((a, b) => {
    const aAlerted = alertedRegions.includes(a.id);
    const bAlerted = alertedRegions.includes(b.id);
    if (aAlerted && !bAlerted) return -1;
    if (!aAlerted && bAlerted) return 1;
    return 0;
  });

  return (
    <div className="md:hidden">
      {/* Collapsed bar */}
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="mobile-drawer-toggle w-full"
        aria-expanded={isExpanded}
        aria-controls="mobile-region-list"
        aria-label={`Список регіонів. ${alertedCount} під тривогою, ${safeCount} безпечно`}
      >
        <div className="flex items-center justify-between px-4 py-2">
          <div className="flex items-center gap-3">
            <span className="glow-text font-[family-name:var(--font-pipboy)] text-sm">
              REGIONS
            </span>
            <div className="flex items-center gap-2 text-xs">
              {alertedCount > 0 && (
                <span className="region-badge region-badge-alert">
                  {alertedCount} тривога
                </span>
              )}
              <span className="region-badge region-badge-safe">
                {safeCount} безпечно
              </span>
            </div>
          </div>
          <span
            className={`drawer-arrow ${isExpanded ? "expanded" : ""}`}
            aria-hidden="true"
          >
            ▼
          </span>
        </div>
      </button>

      {/* Expanded drawer */}
      <section
        id="mobile-region-list"
        className={`mobile-drawer ${isExpanded ? "expanded" : ""}`}
        aria-label="Список регіонів"
      >
        <div className="mobile-drawer-content">
          <div className="grid grid-cols-2 gap-1 p-2">
            {sortedRegions.map((region) => {
              const isAlert = alertedRegions.includes(region.id);
              const isHovered = hoveredRegion === region.id;

              return (
                <button
                  type="button"
                  key={region.id}
                  className={`mobile-region-item ${isAlert ? "alert" : ""} ${isHovered ? "hovered" : ""}`}
                  onTouchStart={() => onRegionHover(region.id)}
                  onTouchEnd={() => onRegionHover(null)}
                  onClick={() => {
                    // Only call onRegionClick if not already selected (to avoid closing the info panel)
                    if (selectedRegion !== region.id) {
                      onRegionClick(region.id);
                    }
                    setIsExpanded(false);
                  }}
                  aria-label={`${region.nameUa}${isAlert ? ", повітряна тривога" : ", безпечно"}`}
                  aria-pressed={isHovered}
                >
                  <div
                    className={`mobile-region-indicator ${isAlert ? "alert" : ""}`}
                    aria-hidden="true"
                  />
                  <span
                    className={`truncate font-[family-name:var(--font-pipboy)] text-xs ${
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
        </div>
      </section>
    </div>
  );
}
