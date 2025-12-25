"use client";

interface UkraineMapSVGProps {
  alertedRegions: string[];
  hoveredRegion?: string | null;
  selectedRegion?: string | null;
  onRegionHover?: (regionId: string | null) => void;
  onRegionClick?: (regionId: string) => void;
}

// Corrected SVG paths for Ukrainian regions matching real geography
// Reference: https://simplemaps.com/svg/country/ua
// Coordinate system: viewBox 0 0 700 660, approximate real geography
const REGION_PATHS: Record<string, string> = {
  // Northwest Ukraine
  volyn: "M95,85 L125,72 L158,78 L175,95 L170,115 L148,128 L115,125 L92,110 Z",
  rivne:
    "M148,128 L170,115 L175,95 L205,88 L235,95 L238,118 L225,138 L195,145 L162,138 Z",

  // West Ukraine
  lviv: "M68,128 L92,110 L115,125 L148,128 L162,138 L158,168 L135,182 L105,175 L78,158 Z",
  ternopil: "M158,168 L162,138 L195,145 L210,158 L205,185 L178,198 L155,188 Z",
  "ivano-frankivsk":
    "M105,175 L135,182 L158,168 L155,188 L145,215 L118,225 L95,205 L88,185 Z",
  zakarpattia:
    "M52,195 L72,180 L88,185 L95,205 L118,225 L108,255 L78,265 L52,248 L42,218 Z",
  chernivtsi: "M145,215 L168,212 L188,235 L175,262 L148,258 L132,238 Z",

  // Central-West Ukraine
  khmelnytskyi:
    "M195,145 L225,138 L255,145 L262,172 L248,198 L218,205 L195,195 L205,185 L210,158 Z",
  vinnytsia:
    "M218,205 L248,198 L278,205 L295,235 L282,268 L248,275 L218,258 L205,228 Z",
  zhytomyr:
    "M238,118 L275,108 L315,115 L335,138 L328,168 L295,182 L262,172 L255,145 Z",

  // North Ukraine
  "kyiv-oblast":
    "M315,115 L355,105 L398,115 L415,142 L405,175 L372,188 L335,178 L328,168 L335,138 Z",
  "kyiv-city": "M358,148 L375,142 L385,155 L378,168 L362,172 L352,162 Z",
  chernihiv:
    "M398,115 L355,105 L368,72 L412,55 L465,62 L488,92 L478,132 L442,148 L415,142 Z",
  sumy: "M478,132 L488,92 L542,75 L595,95 L592,142 L555,165 L512,155 L485,148 Z",

  // Central Ukraine
  cherkasy:
    "M335,178 L372,188 L405,175 L422,195 L415,232 L378,252 L342,245 L322,215 L295,205 L295,182 Z",
  poltava:
    "M422,195 L442,175 L485,165 L525,178 L538,215 L522,258 L478,272 L442,258 L428,228 Z",
  kirovohrad:
    "M295,235 L322,215 L342,245 L378,252 L402,278 L388,318 L352,332 L308,322 L278,288 L282,268 Z",

  // East Ukraine
  kharkiv:
    "M525,178 L555,165 L592,142 L628,155 L655,198 L645,258 L602,285 L558,272 L538,232 Z",
  luhansk:
    "M628,155 L668,138 L712,155 L738,202 L728,268 L688,308 L645,295 L618,262 L628,228 L645,258 L655,198 Z",
  donetsk:
    "M558,272 L602,285 L645,295 L688,308 L695,358 L655,398 L602,388 L558,355 L535,318 L538,288 Z",
  dnipro:
    "M442,258 L478,272 L522,258 L538,288 L535,318 L558,355 L545,398 L498,415 L452,395 L428,348 L402,302 L402,278 Z",
  zaporizhzhia:
    "M452,395 L498,415 L545,398 L568,442 L538,488 L485,498 L438,468 L428,428 Z",

  // South Ukraine
  odesa:
    "M175,262 L205,252 L248,275 L282,288 L308,322 L328,365 L318,408 L278,442 L218,458 L162,438 L138,388 L152,318 Z",
  mykolaiv:
    "M308,322 L352,332 L388,318 L402,348 L428,375 L415,415 L372,428 L328,412 L305,375 L318,348 Z",
  kherson:
    "M372,428 L415,415 L428,428 L438,468 L485,498 L468,542 L412,562 L355,542 L322,498 L328,455 Z",

  // Crimea (occupied)
  crimea:
    "M412,562 L468,542 L528,548 L582,572 L612,612 L578,645 L518,658 L455,648 L408,625 L388,592 L395,568 Z",
  sevastopol: "M388,592 L408,625 L392,642 L368,632 L372,608 Z",
};

export default function UkraineMapSVG({
  alertedRegions,
  hoveredRegion,
  selectedRegion,
  onRegionHover,
  onRegionClick,
}: UkraineMapSVGProps) {
  const getRegionClass = (regionId: string) => {
    const isAlert = alertedRegions.includes(regionId);
    const isHovered = hoveredRegion === regionId;

    if (isHovered) {
      return `region-path ${isAlert ? "region-path-alert-hover" : "region-path-safe-hover"}`;
    }
    return `region-path ${isAlert ? "region-path-alert" : "region-path-safe"}`;
  };

  return (
    <svg
      viewBox="0 20 780 680"
      className="h-full max-h-[450px] w-full"
      style={{ filter: "drop-shadow(0 0 10px rgba(0, 255, 0, 0.25))" }}
    >
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

      {/* Ukraine outline background glow */}
      <g opacity="0.15">
        {Object.entries(REGION_PATHS).map(([regionId, pathData]) => (
          <path
            key={`bg-${regionId}`}
            d={pathData}
            fill="var(--pipboy-green)"
            stroke="none"
            style={{ filter: "blur(8px)" }}
          />
        ))}
      </g>

      {/* Render all regions */}
      <g filter="url(#glow)">
        {Object.entries(REGION_PATHS).map(([regionId, pathData]) => (
          <path
            key={regionId}
            id={regionId}
            d={pathData}
            className={getRegionClass(regionId)}
            onMouseEnter={() => onRegionHover?.(regionId)}
            onMouseLeave={() => onRegionHover?.(null)}
            onClick={() => {
              // Only call onRegionClick if not already selected (to avoid closing the info panel)
              if (selectedRegion !== regionId) {
                onRegionClick?.(regionId);
              }
            }}
          >
            <title>{regionId}</title>
          </path>
        ))}
      </g>
    </svg>
  );
}
