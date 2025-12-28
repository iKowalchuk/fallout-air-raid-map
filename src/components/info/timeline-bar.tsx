"use client";

import { useEffect, useMemo, useState } from "react";
import {
  type AlertMessage,
  calculateTodayAlertPeriods,
  convertToTimelinePeriods,
  type TimelinePeriod,
} from "@/utils/alert-periods";
import TimelineModal from "./timeline-modal";

interface TimelineBarProps {
  messages: AlertMessage[];
}

// Pre-computed constants to avoid re-allocation on every render
const GRID_LINES = Array.from({ length: 24 }, (_, i) => i);
const HOUR_LABELS = [
  "00:00",
  "04:00",
  "08:00",
  "12:00",
  "16:00",
  "20:00",
  "24:00",
];

export default function TimelineBar({ messages }: TimelineBarProps) {
  const [currentPosition, setCurrentPosition] = useState(0);
  const [hoveredPeriod, setHoveredPeriod] = useState<TimelinePeriod | null>(
    null,
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState<string | undefined>(
    undefined,
  );

  useEffect(() => {
    const updatePosition = () => {
      const now = new Date();
      setCurrentPosition(
        ((now.getHours() * 60 + now.getMinutes()) / (24 * 60)) * 100,
      );
    };

    updatePosition();
    const interval = setInterval(updatePosition, 60000);
    return () => clearInterval(interval);
  }, []);

  // Calculate alert periods for today using shared utility
  const alertPeriods = useMemo<TimelinePeriod[]>(() => {
    const periods = calculateTodayAlertPeriods(messages);
    return convertToTimelinePeriods(periods);
  }, [messages]);

  return (
    <div className="mt-1 border-t border-[var(--pipboy-green-dark)] pt-1 sm:mt-4 sm:pt-3">
      {/* Timeline header */}
      <div className="mb-0.5 sm:mb-2">
        <span className="glow-text font-[family-name:var(--font-pipboy)] text-[10px] opacity-70 sm:text-xs">
          ▸ TODAY&apos;S TIMELINE
        </span>
      </div>

      <div className="relative">
        {/* Timeline background */}
        <section
          className="timeline-bar-enhanced relative h-5 overflow-hidden rounded sm:h-7 md:h-6"
          aria-label="Часова шкала тривог за сьогодні"
        >
          {/* Grid lines - using pre-computed constant */}
          {GRID_LINES.map((position) => (
            <div
              key={`grid-${position}`}
              className="absolute top-0 bottom-0 w-px bg-[var(--pipboy-green-dark)] opacity-30"
              style={{ left: `${(position / 24) * 100}%` }}
              aria-hidden="true"
            />
          ))}

          {/* Alert periods - render active (red) first, then inactive (green) on top */}
          {/* Using semantic button elements for accessibility */}
          {alertPeriods
            .filter((p) => p.isActive)
            .map((period) => (
              <button
                type="button"
                key={`active-${period.regionName}-${period.start}`}
                aria-label={`Активна тривога: ${period.regionName}`}
                className={`alert-period-active absolute top-1 bottom-1 cursor-pointer rounded-sm border-0 p-0 transition-all duration-200 ${hoveredPeriod === period ? "scale-y-110 opacity-100" : "opacity-80"}`}
                style={{
                  left: `${period.start}%`,
                  width: `${Math.max(period.end - period.start, 0.5)}%`,
                }}
                onMouseEnter={() => setHoveredPeriod(period)}
                onMouseLeave={() => setHoveredPeriod(null)}
                onClick={() => {
                  setSelectedRegion(period.regionName);
                  setIsModalOpen(true);
                }}
              />
            ))}
          {alertPeriods
            .filter((p) => !p.isActive)
            .map((period) => (
              <button
                type="button"
                key={`inactive-${period.regionName}-${period.start}`}
                aria-label={`Завершена тривога: ${period.regionName}`}
                className={`alert-period absolute top-1 bottom-1 cursor-pointer rounded-sm border-0 p-0 transition-all duration-200 ${hoveredPeriod === period ? "scale-y-110 opacity-100" : "opacity-80"}`}
                style={{
                  left: `${period.start}%`,
                  width: `${Math.max(period.end - period.start, 0.5)}%`,
                }}
                onMouseEnter={() => setHoveredPeriod(period)}
                onMouseLeave={() => setHoveredPeriod(null)}
                onClick={() => {
                  setSelectedRegion(period.regionName);
                  setIsModalOpen(true);
                }}
              />
            ))}

          {/* Current time marker */}
          <div
            className="timeline-marker-enhanced"
            style={{ left: `${currentPosition}%` }}
          >
            <div className="timeline-marker-dot" />
          </div>

          {/* Scan line effect */}
          <div className="timeline-scanline" />
        </section>

        {/* Time labels - using pre-computed constant */}
        <div className="glow-text mt-0.5 flex justify-between font-[family-name:var(--font-pipboy)] text-[8px] sm:mt-1 sm:text-[10px] md:text-xs">
          {HOUR_LABELS.map((hour) => (
            <span key={hour} className="opacity-70">
              {hour}
            </span>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="mt-1 flex gap-2 font-[family-name:var(--font-pipboy)] text-[8px] sm:mt-2 sm:gap-4 sm:text-[10px]">
        <div className="flex items-center gap-1">
          <span
            className="inline-block h-1.5 w-2 rounded-sm sm:h-2 sm:w-3"
            style={{
              backgroundColor: "var(--pipboy-green-dim)",
              boxShadow: "none",
            }}
          />
          <span className="text-[var(--pipboy-green)] opacity-50">
            Завершені
          </span>
        </div>
        <div className="flex items-center gap-1">
          <span
            className="inline-block h-1.5 w-2 rounded-sm sm:h-2 sm:w-3"
            style={{
              backgroundColor: "var(--pipboy-alert-red)",
              boxShadow: "0 0 4px var(--pipboy-alert-red)",
            }}
          />
          <span className="text-[var(--pipboy-alert-red)] opacity-70">
            Активні
          </span>
        </div>
        <div className="flex items-center gap-1">
          <span
            className="inline-block h-1.5 w-[2px] sm:h-2"
            style={{
              backgroundColor: "var(--pipboy-amber)",
              boxShadow: "0 0 4px var(--pipboy-amber)",
            }}
          />
          <span className="text-[var(--pipboy-amber)] opacity-50">Зараз</span>
        </div>
      </div>

      {/* Timeline Modal */}
      <TimelineModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        messages={messages}
        initialRegion={selectedRegion}
      />
    </div>
  );
}
