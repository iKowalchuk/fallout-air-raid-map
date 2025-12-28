"use client";

import { useState } from "react";
import {
  getAllRegions,
  getLeftRegions,
  getRegionById,
  getRightRegions,
} from "@/data/regions";
import { UkraineMapGeoJSON } from "@/features/map";
import MobileRegionDrawer from "./mobile-region-drawer";
import RegionInfoPanel from "./region-info-panel";
import RegionList from "./region-list";

interface UkraineMapProps {
  alertedRegions: string[];
}

export default function UkraineMap({ alertedRegions }: UkraineMapProps) {
  const [hoveredRegion, setHoveredRegion] = useState<string | null>(null);
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [isDrawerExpanded, setIsDrawerExpanded] = useState(false);

  const leftRegions = getLeftRegions();
  const rightRegions = getRightRegions();
  const allRegions = getAllRegions();

  const selectedRegionData = selectedRegion
    ? getRegionById(selectedRegion)
    : null;

  const hoveredRegionData = hoveredRegion ? getRegionById(hoveredRegion) : null;

  // Region to display in header: hovered takes priority over selected
  const displayRegionData = hoveredRegionData || selectedRegionData;
  const displayRegionId = hoveredRegion || selectedRegion;

  // Show modal only when region is selected AND drawer is closed
  const showRegionPanel = selectedRegionData && !isDrawerExpanded;

  const handleRegionClick = (regionId: string) => {
    // Always select the clicked region (don't toggle off on same click)
    // Region is deselected only when closing the modal
    setSelectedRegion(regionId);
    // Clear hover to avoid two highlighted regions
    setHoveredRegion(null);
  };

  return (
    <div className="relative flex h-full flex-col">
      {/* Region name tooltip - shows hovered or selected region */}
      <div className="mt-2 mb-1 flex h-6 items-center justify-center sm:mt-0 sm:mb-2 sm:h-8">
        {/* Show region name on hover or selection */}
        {displayRegionData && displayRegionId && (
          <span
            key={displayRegionId}
            className={`animate-fade-in font-[family-name:var(--font-pipboy)] text-sm sm:text-lg ${
              alertedRegions.includes(displayRegionData.id)
                ? "glow-text-red-bright"
                : "glow-text-bright"
            }`}
          >
            {displayRegionData.nameUa} / {displayRegionData.nameEn}
          </span>
        )}
        {/* Placeholder text - different for mobile (touch) vs desktop (hover) */}
        {!displayRegionData && (
          <>
            <span className="glow-text block font-[family-name:var(--font-pipboy)] text-xs opacity-50 sm:hidden">
              Натисніть на регіон для інформації
            </span>
            <span className="glow-text hidden font-[family-name:var(--font-pipboy)] text-sm opacity-50 sm:block">
              Наведіть на регіон для інформації
            </span>
          </>
        )}
      </div>

      {/* Main map layout */}
      <div className="relative flex flex-1 gap-4 overflow-hidden">
        {/* Left region list - hidden on mobile */}
        <div className="region-list-container hidden w-48 shrink-0 overflow-y-auto md:block">
          <RegionList
            regions={leftRegions}
            alertedRegions={alertedRegions}
            hoveredRegion={hoveredRegion}
            selectedRegion={selectedRegion}
            onRegionHover={setHoveredRegion}
            onRegionClick={handleRegionClick}
          />
        </div>

        {/* Map SVG with radar overlay */}
        <div className="map-container relative flex flex-1 items-center justify-center">
          {/* Radar scan effect */}
          <div className="radar-overlay" />

          <UkraineMapGeoJSON
            alertedRegions={alertedRegions}
            hoveredRegion={hoveredRegion}
            selectedRegion={selectedRegion}
            onRegionHover={setHoveredRegion}
            onRegionClick={handleRegionClick}
          />

          {/* Pulse waves from alerted regions indicator */}
          {alertedRegions.length > 0 && (
            <div className="alert-pulse-indicator">
              <div className="pulse-ring" />
              <div className="pulse-ring delay-1" />
              <div className="pulse-ring delay-2" />
            </div>
          )}

          {/* Region info panel - centered relative to map */}
          {/* Hide when drawer is expanded so they don't overlap */}
          {showRegionPanel && (
            <RegionInfoPanel
              region={selectedRegionData}
              isAlerted={alertedRegions.includes(selectedRegionData.id)}
              onClose={() => {
                setSelectedRegion(null);
                setHoveredRegion(null);
              }}
            />
          )}

          {/* Mobile region drawer - overlay inside map container */}
          <MobileRegionDrawer
            regions={allRegions}
            alertedRegions={alertedRegions}
            hoveredRegion={hoveredRegion}
            selectedRegion={selectedRegion}
            onRegionHover={setHoveredRegion}
            onRegionClick={handleRegionClick}
            onDrawerToggle={(expanded) => {
              setIsDrawerExpanded(expanded);
              if (expanded) {
                // Clear hover when drawer opens
                setHoveredRegion(null);
              }
            }}
          />
        </div>

        {/* Right region list - hidden on mobile */}
        <div className="region-list-container hidden w-48 shrink-0 overflow-y-auto md:block">
          <RegionList
            regions={rightRegions}
            alertedRegions={alertedRegions}
            hoveredRegion={hoveredRegion}
            selectedRegion={selectedRegion}
            onRegionHover={setHoveredRegion}
            onRegionClick={handleRegionClick}
          />
        </div>
      </div>

      {/* Legend - hidden on mobile (shown in MobileRegionDrawer instead) */}
      <div className="mt-4 hidden justify-center gap-8 font-[family-name:var(--font-pipboy)] text-sm sm:flex">
        <div className="flex items-center gap-2">
          <div className="legend-safe h-4 w-4 shrink-0 -translate-y-0.5 rounded-[2px] bg-[var(--pipboy-green-dark)]" />
          <span className="glow-text leading-none">Безпечно</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="legend-alert h-4 w-4 shrink-0 -translate-y-0.5 rounded-[2px] bg-[var(--pipboy-alert-red-dim)]" />
          <span className="glow-text-red leading-none">Тривога</span>
        </div>
      </div>
    </div>
  );
}
