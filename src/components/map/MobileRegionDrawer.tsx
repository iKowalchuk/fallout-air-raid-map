"use client";

import { useState, useEffect, useCallback } from "react";
import type { Region } from "@/schemas";

interface MobileRegionDrawerProps {
  regions: Region[];
  alertedRegions: string[];
  hoveredRegion: string | null;
  selectedRegion: string | null;
  onRegionHover: (regionId: string | null) => void;
  onRegionClick: (regionId: string) => void;
  onDrawerToggle?: (isExpanded: boolean) => void;
}

export default function MobileRegionDrawer({
  regions,
  alertedRegions,
  hoveredRegion,
  selectedRegion,
  onRegionHover,
  onRegionClick,
  onDrawerToggle,
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

  // Close drawer on escape key
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape" && isExpanded) {
        setIsExpanded(false);
      }
    },
    [isExpanded],
  );

  useEffect(() => {
    if (isExpanded) {
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isExpanded, handleKeyDown]);

  return (
    <div className="absolute inset-x-0 bottom-0 z-20 md:hidden">
      {/* Backdrop overlay when expanded */}
      {isExpanded && (
        <div
          className="fixed inset-0 z-10 bg-black/40 backdrop-blur-[2px]"
          onClick={() => {
            onRegionHover(null);
            setIsExpanded(false);
            onDrawerToggle?.(false);
          }}
          aria-hidden="true"
        />
      )}

      {/* Drawer container */}
      <div className="relative z-20">
        {/* Collapsed bar / Toggle button */}
        <button
          onClick={() => {
            const newExpanded = !isExpanded;
            setIsExpanded(newExpanded);
            onDrawerToggle?.(newExpanded);
          }}
          className="mobile-drawer-toggle w-full"
          aria-expanded={isExpanded}
          aria-controls="mobile-region-list"
          aria-label={`Список регіонів. ${alertedCount} під тривогою, ${safeCount} безпечно`}
        >
          <div className="flex items-center justify-between px-2 py-1.5 sm:px-3 sm:py-2">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="glow-text font-[family-name:var(--font-pipboy)] text-[10px] sm:text-sm">
                REGIONS
              </span>
              <div className="flex items-center gap-1 text-[9px] sm:gap-2 sm:text-xs">
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
              className="text-[10px] text-[var(--pipboy-green)] sm:text-xs"
              aria-hidden="true"
            >
              {isExpanded ? "▼" : "▲"}
            </span>
          </div>
        </button>

        {/* Expanded drawer - overlay style */}
        <div
          id="mobile-region-list"
          className={`mobile-drawer-overlay ${isExpanded ? "expanded" : ""}`}
          role="region"
          aria-label="Список регіонів"
          onMouseEnter={(e) => e.stopPropagation()}
          onTouchStart={(e) => e.stopPropagation()}
        >
          <div className="mobile-drawer-content">
            <div className="grid grid-cols-2 gap-1 p-2">
              {sortedRegions.map((region) => {
                const isAlert = alertedRegions.includes(region.id);
                const isHovered = hoveredRegion === region.id;
                const isSelected = selectedRegion === region.id;
                const isHighlighted = isHovered || isSelected;

                return (
                  <button
                    key={region.id}
                    className={`mobile-region-item ${isAlert ? "alert" : ""} ${isHighlighted ? "hovered" : ""}`}
                    onClick={() => {
                      // Clear any previous hover before selecting
                      onRegionHover(null);
                      onRegionClick(region.id);
                      setIsExpanded(false);
                      onDrawerToggle?.(false);
                    }}
                    aria-label={`${region.nameUa}${isAlert ? ", повітряна тривога" : ", безпечно"}`}
                    aria-pressed={isHighlighted}
                  >
                    <div
                      className={`mobile-region-indicator ${isAlert ? "alert" : ""}`}
                      aria-hidden="true"
                    />
                    <span
                      className={`truncate font-[family-name:var(--font-pipboy)] text-[10px] sm:text-xs ${
                        isAlert
                          ? isHighlighted
                            ? "glow-text-red-bright"
                            : "glow-text-red"
                          : isHighlighted
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
        </div>
      </div>
    </div>
  );
}
