"use client";

import { useState } from "react";
import UkraineMapSVG from "@/assets/ukraine-map";
import RegionList from "./RegionList";
import { getLeftRegions, getRightRegions, getRegionById } from "@/data/regions";

interface UkraineMapProps {
  alertedRegions: string[];
}

export default function UkraineMap({ alertedRegions }: UkraineMapProps) {
  const [hoveredRegion, setHoveredRegion] = useState<string | null>(null);

  const leftRegions = getLeftRegions();
  const rightRegions = getRightRegions();

  const hoveredRegionData = hoveredRegion ? getRegionById(hoveredRegion) : null;

  return (
    <div className="flex flex-col h-full">
      {/* Hovered region tooltip */}
      <div className="h-8 mb-2 flex items-center justify-center">
        {hoveredRegionData && (
          <span
            className={`text-lg font-[family-name:var(--font-pipboy)] ${
              alertedRegions.includes(hoveredRegionData.id)
                ? "glow-text-red-bright"
                : "glow-text-bright"
            }`}
          >
            {hoveredRegionData.nameUa} / {hoveredRegionData.nameEn}
          </span>
        )}
      </div>

      {/* Main map layout */}
      <div className="flex-1 flex gap-4 overflow-hidden">
        {/* Left region list */}
        <div className="w-40 md:w-48 overflow-y-auto overflow-x-hidden shrink-0">
          <RegionList
            regions={leftRegions}
            alertedRegions={alertedRegions}
            hoveredRegion={hoveredRegion}
            onRegionHover={setHoveredRegion}
          />
        </div>

        {/* Map SVG */}
        <div className="flex-1 flex items-center justify-center">
          <UkraineMapSVG
            alertedRegions={alertedRegions}
            hoveredRegion={hoveredRegion}
            onRegionHover={setHoveredRegion}
            onRegionClick={(id) => console.log("Clicked:", id)}
          />
        </div>

        {/* Right region list */}
        <div className="w-40 md:w-48 overflow-y-auto overflow-x-hidden shrink-0">
          <RegionList
            regions={rightRegions}
            alertedRegions={alertedRegions}
            hoveredRegion={hoveredRegion}
            onRegionHover={setHoveredRegion}
          />
        </div>
      </div>

      {/* Legend */}
      <div className="mt-4 flex justify-center gap-8 text-sm font-[family-name:var(--font-pipboy)]">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-[var(--pipboy-green-dark)] rounded" />
          <span className="glow-text">Безпечно</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-[var(--pipboy-alert-red-dim)] rounded" />
          <span className="glow-text-red">Тривога</span>
        </div>
      </div>
    </div>
  );
}
