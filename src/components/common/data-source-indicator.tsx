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
    <output
      className="cache-indicator glow-text"
      style={{ color: "var(--pipboy-amber)" }}
      aria-label="Дані з кешу - можуть бути застарілими"
      title="Дані з кешу"
    >
      <span
        className="cache-dot"
        style={{ backgroundColor: "var(--pipboy-amber)" }}
        aria-hidden="true"
      />{" "}
      CACHE
    </output>
  );
}
