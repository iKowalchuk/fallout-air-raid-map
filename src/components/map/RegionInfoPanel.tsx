"use client";

import type { Region } from "@/schemas";

interface RegionInfoPanelProps {
  region: Region | null;
  isAlerted: boolean;
  onClose: () => void;
}

export default function RegionInfoPanel({
  region,
  isAlerted,
  onClose,
}: RegionInfoPanelProps) {
  if (!region) return null;

  return (
    <div className="region-info-panel animate-slide-in">
      {/* Header */}
      <div className="mb-3 flex items-start justify-between">
        <div>
          <h3
            className={`font-[family-name:var(--font-pipboy)] text-lg ${
              isAlerted ? "glow-text-red-bright" : "glow-text-bright"
            }`}
          >
            {region.nameUa}
          </h3>
          <span className="glow-text text-xs opacity-60">{region.nameEn}</span>
        </div>
        <button onClick={onClose} className="close-btn" aria-label="Close">
          ×
        </button>
      </div>

      {/* Status */}
      <div className={`status-banner ${isAlerted ? "alert" : "safe"}`}>
        <div className={`status-indicator ${isAlerted ? "alert" : ""}`} />
        <span
          className={`font-[family-name:var(--font-pipboy)] text-sm ${
            isAlerted ? "glow-text-red" : "glow-text"
          }`}
        >
          {isAlerted ? "ПОВІТРЯНА ТРИВОГА" : "ВІДБІЙ ТРИВОГИ"}
        </span>
      </div>

      {/* Region info grid */}
      <div className="mt-3 grid grid-cols-2 gap-2 font-[family-name:var(--font-pipboy)] text-xs">
        <div className="info-cell">
          <span className="glow-text opacity-50">ID</span>
          <span className="glow-text">{region.id}</span>
        </div>
        <div className="info-cell">
          <span className="glow-text opacity-50">Статус</span>
          <span className={isAlerted ? "glow-text-red" : "glow-text"}>
            {isAlerted ? "Небезпечно" : "Безпечно"}
          </span>
        </div>
      </div>

      {/* Alert animation indicator */}
      {isAlerted && (
        <div className="mt-3 flex items-center gap-2">
          <div className="alert-wave" />
          <span className="glow-text-red font-[family-name:var(--font-pipboy)] text-xs opacity-70">
            Сигнал активний
          </span>
        </div>
      )}
    </div>
  );
}
