"use client";

import { useState } from "react";
import UkraineMapSVG from "@/assets/ukraine-map";
import RegionList from "./RegionList";
import MobileRegionDrawer from "./MobileRegionDrawer";
import RegionInfoPanel from "./RegionInfoPanel";
import {
  getLeftRegions,
  getRightRegions,
  getRegionById,
  getAllRegions,
} from "@/data/regions";

interface UkraineMapProps {
  alertedRegions: string[];
}

export default function UkraineMap({ alertedRegions }: UkraineMapProps) {
  const [hoveredRegion, setHoveredRegion] = useState<string | null>(null);
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);

  const leftRegions = getLeftRegions();
  const rightRegions = getRightRegions();
  const allRegions = getAllRegions();

  const hoveredRegionData = hoveredRegion ? getRegionById(hoveredRegion) : null;
  const selectedRegionData = selectedRegion
    ? getRegionById(selectedRegion)
    : null;

  const handleRegionClick = (regionId: string) => {
    setSelectedRegion(selectedRegion === regionId ? null : regionId);
  };

  return (
    <div className="relative flex h-full flex-col">
      {/* Hovered region tooltip */}
      <div className="mb-2 flex h-8 items-center justify-center">
        {hoveredRegionData && !selectedRegion && (
          <span
            className={`animate-fade-in font-[family-name:var(--font-pipboy)] text-lg ${
              alertedRegions.includes(hoveredRegionData.id)
                ? "glow-text-red-bright"
                : "glow-text-bright"
            }`}
          >
            {hoveredRegionData.nameUa} / {hoveredRegionData.nameEn}
          </span>
        )}
        {!hoveredRegionData && !selectedRegion && (
          <span className="glow-text font-[family-name:var(--font-pipboy)] text-sm opacity-50">
            Наведіть на регіон для інформації
          </span>
        )}
      </div>

      {/* Main map layout */}
      <div className="flex flex-1 gap-4 overflow-hidden">
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

          <UkraineMapSVG
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
          {selectedRegionData && (
            <RegionInfoPanel
              region={selectedRegionData}
              isAlerted={alertedRegions.includes(selectedRegionData.id)}
              onClose={() => setSelectedRegion(null)}
            />
          )}
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

      {/* Mobile region drawer */}
      <MobileRegionDrawer
        regions={allRegions}
        alertedRegions={alertedRegions}
        hoveredRegion={hoveredRegion}
        selectedRegion={selectedRegion}
        onRegionHover={setHoveredRegion}
        onRegionClick={handleRegionClick}
      />

      {/* Legend */}
      <div className="mt-4 flex justify-center gap-8 font-[family-name:var(--font-pipboy)] text-sm">
        <div className="flex items-center gap-2">
          <div className="legend-safe h-4 w-4 rounded bg-[var(--pipboy-green-dark)]" />
          <span className="glow-text">Безпечно</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="legend-alert h-4 w-4 rounded bg-[var(--pipboy-alert-red-dim)]" />
          <span className="glow-text-red">Тривога</span>
        </div>
      </div>
    </div>
  );
}
