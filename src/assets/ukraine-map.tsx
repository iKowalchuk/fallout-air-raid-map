"use client";

interface UkraineMapSVGProps {
  alertedRegions: string[];
  hoveredRegion?: string | null;
  onRegionHover?: (regionId: string | null) => void;
  onRegionClick?: (regionId: string) => void;
}

// More realistic SVG paths for Ukrainian regions
const REGION_PATHS: Record<string, string> = {
  // Western Ukraine
  "volyn": "M85,95 L105,78 L135,72 L165,82 L170,100 L158,115 L135,120 L105,118 L88,108 Z",
  "rivne": "M135,120 L158,115 L170,100 L198,95 L215,108 L210,135 L185,148 L158,145 L140,135 Z",
  "lviv": "M72,118 L88,108 L105,118 L135,120 L140,135 L130,165 L108,175 L82,168 L68,145 Z",
  "ternopil": "M130,165 L140,135 L158,145 L168,155 L165,180 L145,192 L122,185 Z",
  "ivano-frankivsk": "M108,175 L122,185 L145,192 L142,218 L115,228 L92,215 L88,192 Z",
  "zakarpattia": "M55,208 L72,195 L88,192 L92,215 L115,228 L108,258 L75,265 L48,245 L42,222 Z",
  "chernivtsi": "M142,218 L165,222 L178,248 L162,272 L132,268 L118,245 L128,228 Z",

  // Central-Western Ukraine
  "zhytomyr": "M185,148 L210,135 L245,125 L278,138 L275,168 L248,182 L218,178 L195,165 Z",
  "khmelnytskyi": "M158,145 L185,148 L195,165 L218,178 L215,208 L188,222 L165,215 L165,180 L168,155 Z",
  "vinnytsia": "M215,208 L218,178 L248,182 L275,188 L278,218 L265,245 L232,252 L205,238 Z",

  // Kyiv region
  "kyiv-oblast": "M275,168 L278,138 L312,128 L345,138 L342,172 L315,185 L285,182 Z",
  "kyiv-city": "M305,155 L318,148 L328,158 L322,172 L308,175 L298,165 Z",

  // Northern Ukraine
  "chernihiv": "M345,138 L312,128 L325,98 L365,78 L405,82 L428,108 L418,145 L385,155 L355,148 Z",
  "sumy": "M418,145 L428,108 L478,92 L518,108 L512,148 L475,165 L438,158 Z",

  // Central Ukraine
  "poltava": "M355,175 L385,155 L418,145 L438,158 L455,188 L445,225 L408,238 L375,228 L362,198 Z",
  "cherkasy": "M285,182 L315,185 L342,172 L355,175 L362,198 L355,232 L318,248 L288,238 L278,215 Z",
  "kirovohrad": "M278,215 L288,238 L318,248 L355,232 L365,268 L342,298 L298,295 L268,268 L265,245 Z",

  // Eastern Ukraine
  "kharkiv": "M455,188 L475,165 L512,148 L548,158 L572,195 L562,248 L518,275 L478,258 L458,228 Z",
  "luhansk": "M548,158 L585,142 L628,158 L652,198 L645,258 L608,292 L568,282 L548,248 L562,248 L572,195 Z",
  "donetsk": "M478,258 L518,275 L562,248 L568,282 L608,292 L615,338 L578,375 L528,368 L488,338 L468,298 Z",
  "dnipro": "M408,238 L445,225 L458,228 L478,258 L488,338 L528,368 L518,398 L468,408 L422,388 L398,338 L385,285 L365,268 Z",
  "zaporizhzhia": "M422,388 L468,408 L518,398 L535,438 L508,478 L452,488 L408,458 L398,418 Z",

  // Southern Ukraine
  "mykolaiv": "M268,268 L298,295 L342,298 L365,268 L385,285 L398,338 L378,378 L335,398 L292,378 L262,338 L255,298 Z",
  "odesa": "M162,272 L178,248 L200,258 L232,252 L255,298 L262,338 L292,378 L282,418 L248,448 L195,458 L148,438 L132,388 L145,325 Z",
  "kherson": "M335,398 L378,378 L398,338 L398,418 L408,458 L452,488 L438,528 L385,548 L332,528 L305,488 L298,438 Z",

  // Crimea (occupied territory)
  "crimea": "M385,548 L438,528 L495,535 L548,555 L575,590 L545,620 L490,635 L430,625 L385,605 L365,575 L370,555 Z",
  "sevastopol": "M365,575 L385,605 L370,620 L350,610 L355,590 Z",
};

export default function UkraineMapSVG({
  alertedRegions,
  hoveredRegion,
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
      viewBox="0 0 700 660"
      className="w-full h-full max-h-[450px]"
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
            onClick={() => onRegionClick?.(regionId)}
          >
            <title>{regionId}</title>
          </path>
        ))}
      </g>
    </svg>
  );
}
