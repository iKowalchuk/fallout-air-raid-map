"use client";

interface DataSourceIndicatorProps {
  source: "api" | "cache" | null;
}

export function DataSourceIndicator({ source }: DataSourceIndicatorProps) {
  if (!source) {
    return null;
  }

  if (source === "api") {
    return (
      <span className="live-indicator glow-text">
        <span className="live-dot" /> LIVE
      </span>
    );
  }

  // cache mode
  return (
    <span
      className="cache-indicator glow-text"
      style={{ color: "var(--pipboy-amber)" }}
    >
      <span
        className="cache-dot"
        style={{ backgroundColor: "var(--pipboy-amber)" }}
      />{" "}
      CACHE
    </span>
  );
}
