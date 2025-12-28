"use client";

import { useMemo } from "react";
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
  const { data: geoJSON, isLoading, isError, error } = useUkraineGeoJSON();

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

  // Crimea and Sevastopol are always shown as alert (red)
  const ALWAYS_ALERT_REGIONS = new Set(["crimea", "sevastopol"]);

  const getRegionClass = (regionId: string) => {
    const isAlert =
      alertedRegions.includes(regionId) || ALWAYS_ALERT_REGIONS.has(regionId);
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

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="loading-spinner" />
        <span className="glow-text ml-3 font-[family-name:var(--font-pipboy)]">
          Завантаження карти...
        </span>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-2">
        <span className="glow-text-red font-[family-name:var(--font-pipboy)]">
          Помилка завантаження карти
        </span>
        <span className="glow-text text-xs opacity-70">
          {error?.message || "Невідома помилка"}
        </span>
      </div>
    );
  }

  if (!regionPaths) {
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
        {regionPaths.map(({ id, path }) => (
          // biome-ignore lint/a11y/useSemanticElements: SVG path elements cannot be replaced with semantic HTML elements
          <path
            key={id}
            id={id}
            d={path}
            className={getRegionClass(id)}
            role="button"
            aria-label={id}
            tabIndex={0}
            onMouseEnter={() => onRegionHover?.(id)}
            onMouseLeave={() => onRegionHover?.(null)}
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
            <title>{id}</title>
          </path>
        ))}
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
