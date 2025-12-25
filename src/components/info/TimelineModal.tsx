"use client";

import { useEffect, useCallback, useMemo } from "react";
import {
  calculateTodayAlertPeriods,
  convertToTimelinePeriods,
  type AlertMessage,
  type TimelinePeriod,
} from "@/utils/alertPeriods";

interface TimelineModalProps {
  isOpen: boolean;
  onClose: () => void;
  messages: AlertMessage[];
  initialRegion?: string;
}

export default function TimelineModal({
  isOpen,
  onClose,
  messages,
  initialRegion,
}: TimelineModalProps) {
  // Close on escape key
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose],
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, handleKeyDown]);

  // Group periods by regionName
  const periodsByRegion = useMemo(() => {
    const periods = calculateTodayAlertPeriods(messages);
    const timelinePeriods = convertToTimelinePeriods(periods);

    const grouped = new Map<string, TimelinePeriod[]>();
    for (const period of timelinePeriods) {
      const existing = grouped.get(period.regionName) || [];
      existing.push(period);
      grouped.set(period.regionName, existing);
    }

    // Sort by region name, but put initialRegion first
    const entries = Array.from(grouped.entries());
    if (initialRegion) {
      entries.sort((a, b) => {
        if (a[0] === initialRegion) return -1;
        if (b[0] === initialRegion) return 1;
        return a[0].localeCompare(b[0], "uk");
      });
    } else {
      entries.sort((a, b) => a[0].localeCompare(b[0], "uk"));
    }

    return entries;
  }, [messages, initialRegion]);

  // Time labels
  const hours = [];
  for (let i = 0; i <= 24; i += 4) {
    hours.push(i.toString().padStart(2, "0") + ":00");
  }

  // Current time position
  const now = new Date();
  const currentPosition =
    ((now.getHours() * 60 + now.getMinutes()) / (24 * 60)) * 100;

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >

      {/* Modal content */}
      <div
        className="timeline-modal relative z-10 w-full max-w-2xl max-h-[60vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal frame - Pip-Boy style */}
        <div className="pipboy-modal-frame">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[var(--pipboy-green-dark)] px-3 py-2">
            <div className="flex items-center gap-2">
              <span className="glow-text-bright font-[family-name:var(--font-pipboy)] text-xs tracking-wider">
                ◈ ТАЙМЛАЙН ТРИВОГ
              </span>
            </div>
            <button
              onClick={onClose}
              className="glow-text font-[family-name:var(--font-pipboy)] text-[10px] tracking-wider opacity-70 transition-all hover:opacity-100 hover:text-[var(--pipboy-alert-red)]"
            >
              [ESC]
            </button>
          </div>

          {/* Timeline content */}
          <div className="overflow-y-auto max-h-[40vh] p-3">
            {periodsByRegion.length === 0 ? (
              <div className="flex items-center justify-center py-12">
                <span className="glow-text font-[family-name:var(--font-pipboy)] text-sm opacity-50">
                  Немає тривог за сьогодні
                </span>
              </div>
            ) : (
              <div className="space-y-1">
                {periodsByRegion.map(([regionName, periods]) => {
                  const hasActive = periods.some((p) => p.isActive);
                  const isSelected = regionName === initialRegion;
                  return (
                    <div
                      key={regionName}
                      className={`timeline-row group border ${
                        isSelected
                          ? "border-[var(--pipboy-green)] bg-[var(--pipboy-green)]/10"
                          : "border-[var(--pipboy-green-dark)]/30"
                      }`}
                    >
                      {/* Region label */}
                      <div className="flex items-center gap-1.5 min-w-[140px] max-w-[140px]">
                        {hasActive && (
                          <span className="status-dot-alert h-1.5 w-1.5 flex-shrink-0 rounded-full" />
                        )}
                        <span
                          className={`font-[family-name:var(--font-pipboy)] text-[10px] truncate ${
                            hasActive
                              ? "glow-text-red text-[var(--pipboy-alert-red)]"
                              : "glow-text opacity-70"
                          }`}
                          title={regionName}
                        >
                          {regionName}
                        </span>
                      </div>

                      {/* Timeline bar */}
                      <div className="timeline-bar-enhanced relative flex-1 h-5 rounded overflow-hidden">
                        {/* Grid lines */}
                        {[...Array(24)].map((_, i) => (
                          <div
                            key={i}
                            className="absolute top-0 bottom-0 w-px bg-[var(--pipboy-green-dark)] opacity-30"
                            style={{ left: `${(i / 24) * 100}%` }}
                          />
                        ))}

                        {/* Alert periods - render active (red) first, then inactive (green) on top */}
                        {periods
                          .filter((p) => p.isActive)
                          .map((period, i) => (
                            <div
                              key={`active-${i}`}
                              className="absolute top-1 bottom-1 rounded-sm transition-all alert-period-active"
                              style={{
                                left: `${period.start}%`,
                                width: `${Math.max(period.end - period.start, 0.5)}%`,
                              }}
                              title="Активна"
                            />
                          ))}
                        {periods
                          .filter((p) => !p.isActive)
                          .map((period, i) => (
                            <div
                              key={`inactive-${i}`}
                              className="absolute top-1 bottom-1 rounded-sm transition-all alert-period"
                              style={{
                                left: `${period.start}%`,
                                width: `${Math.max(period.end - period.start, 0.5)}%`,
                              }}
                              title="Завершена"
                            />
                          ))}

                        {/* Current time marker */}
                        <div
                          className="timeline-marker-enhanced"
                          style={{ left: `${currentPosition}%` }}
                        >
                          <div className="timeline-marker-dot" />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer with time labels */}
          <div className="border-t border-[var(--pipboy-green-dark)] px-3 py-2">
            <div className="flex items-center gap-2">
              <div className="min-w-[140px] max-w-[140px]" />
              <div className="flex-1 flex justify-between">
                {hours.map((hour) => (
                  <span
                    key={hour}
                    className="glow-text font-[family-name:var(--font-pipboy)] text-[10px] opacity-50"
                  >
                    {hour}
                  </span>
                ))}
              </div>
            </div>

            {/* Legend */}
            <div className="mt-2 flex items-center justify-center gap-4">
              <div className="flex items-center gap-1.5">
                <span
                  className="inline-block h-2 w-3 rounded-sm"
                  style={{ backgroundColor: "var(--pipboy-green-dim)" }}
                />
                <span className="font-[family-name:var(--font-pipboy)] text-[10px] text-[var(--pipboy-green)] opacity-50">
                  Завершені
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span
                  className="inline-block h-2 w-3 rounded-sm"
                  style={{
                    backgroundColor: "var(--pipboy-alert-red)",
                    boxShadow: "0 0 4px var(--pipboy-alert-red)",
                  }}
                />
                <span className="font-[family-name:var(--font-pipboy)] text-[10px] text-[var(--pipboy-alert-red)] opacity-70">
                  Активні
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span
                  className="inline-block h-2 w-px"
                  style={{
                    backgroundColor: "var(--pipboy-amber)",
                    boxShadow: "0 0 4px var(--pipboy-amber)",
                  }}
                />
                <span className="font-[family-name:var(--font-pipboy)] text-[10px] text-[var(--pipboy-amber)] opacity-50">
                  Зараз
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Scan line effect overlay */}
        <div className="pointer-events-none absolute inset-0 rounded-lg overflow-hidden">
          <div className="modal-scanline" />
        </div>
      </div>
    </div>
  );
}
