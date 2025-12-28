"use client";

import { useMemo } from "react";
import { getRegionById, isRegionAlerted } from "@/data/regions";
import { useCanHover } from "@/hooks/use-can-hover";
import { useUkraineGeoJSON } from "../api";
import {
  geoJSONToSVGPath,
  mapRegionNameToId,
  ukraineProjection,
} from "../utils";

interface UkraineMapGeoJSONProps {
  alertedRegions: string[];
  hoveredRegion?: string | null;
  selectedRegion?: string | null;
  onRegionHover?: (regionId: string | null) => void;
  onRegionClick?: (regionId: string) => void;
}

export default function UkraineMapGeoJSON(props: UkraineMapGeoJSONProps) {
  const {
    alertedRegions,
    hoveredRegion,
    selectedRegion,
    onRegionHover,
    onRegionClick,
  } = props;
  const { data: geoJSON, isLoading, isError } = useUkraineGeoJSON();
  const canHover = useCanHover();

  // Pre-compute SVG paths from GeoJSON features
  const regionPaths = useMemo(() => {
    if (!geoJSON) return null;

    const paths: Array<{
      id: string;
      path: string;
    }> = [];

    for (const feature of geoJSON.features) {
      const regionId = mapRegionNameToId(feature.properties.region);
      if (!regionId) {
        console.warn(`Unknown region: ${feature.properties.region}`);
        continue;
      }

      const pathData = geoJSONToSVGPath(feature.geometry, ukraineProjection);
      if (!pathData) continue;

      paths.push({
        id: regionId,
        path: pathData,
      });
    }

    return paths;
  }, [geoJSON]);

  const getRegionClass = (regionId: string) => {
    const isAlert = isRegionAlerted(regionId, alertedRegions);
    const isHovered = hoveredRegion === regionId;
    const isSelected = selectedRegion === regionId;

    let classes = "region-path";

    // Highlight region if hovered or selected
    if (isHovered || isSelected) {
      classes += ` ${isAlert ? "region-path-alert-hover" : "region-path-safe-hover"}`;
    } else {
      classes += ` ${isAlert ? "region-path-alert" : "region-path-safe"}`;
    }

    return classes;
  };

  // Don't render anything until GeoJSON is loaded
  // Global loader handles the loading state
  if (isLoading || isError || !regionPaths) {
    return null;
  }

  return (
    <svg
      viewBox="0 20 780 680"
      className="h-full max-h-[450px] w-full"
      style={{ filter: "drop-shadow(0 0 10px rgba(0, 255, 0, 0.25))" }}
      role="img"
      aria-label="Карта України з регіонами"
    >
      <title>Карта України з регіонами</title>

      {/* Glow filter */}
      <defs>
        <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="2" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Background glow */}
      <g opacity="0.15">
        {regionPaths.map(({ id, path }) => (
          <path
            key={`bg-${id}`}
            d={path}
            fill="var(--pipboy-green)"
            stroke="none"
            style={{ filter: "blur(8px)" }}
          />
        ))}
      </g>

      {/* Render all regions */}
      <g filter="url(#glow)">
        {regionPaths.map(({ id, path }) => {
          const regionData = getRegionById(id);
          const regionName = regionData?.nameUa || id;
          const isAlert = isRegionAlerted(id, alertedRegions);
          const statusText = isAlert ? "повітряна тривога" : "безпечно";

          return (
            // biome-ignore lint/a11y/useSemanticElements: SVG path elements cannot be replaced with semantic HTML elements
            <path
              key={id}
              id={id}
              d={path}
              className={getRegionClass(id)}
              role="button"
              aria-label={`${regionName}, ${statusText}`}
              tabIndex={0}
              onMouseEnter={canHover ? () => onRegionHover?.(id) : undefined}
              onMouseLeave={canHover ? () => onRegionHover?.(null) : undefined}
              onTouchStart={(e) => {
                e.preventDefault();
                onRegionClick?.(id);
              }}
              onClick={() => {
                onRegionClick?.(id);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onRegionClick?.(id);
                }
              }}
            >
              <title>{regionName}</title>
            </path>
          );
        })}
      </g>

      {/* Render hovered/selected region on top for full border visibility */}
      {(hoveredRegion || selectedRegion) && (
        <g filter="url(#glow)">
          {regionPaths
            .filter(({ id }) => id === hoveredRegion || id === selectedRegion)
            .map(({ id, path }) => (
              <path
                key={`overlay-${id}`}
                d={path}
                className={getRegionClass(id)}
                style={{ pointerEvents: "none" }}
              />
            ))}
        </g>
      )}
    </svg>
  );
}
