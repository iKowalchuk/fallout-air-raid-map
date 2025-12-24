"use client";

import { useState, useMemo, useEffect } from "react";
import {
  calculateTodayAlertPeriods,
  convertToTimelinePeriods,
  type AlertMessage,
  type TimelinePeriod,
} from "@/utils/alertPeriods";

interface TimelineBarProps {
  messages: AlertMessage[];
}

export default function TimelineBar({ messages }: TimelineBarProps) {
  const [currentPosition, setCurrentPosition] = useState(0);
  const [hoveredPeriod, setHoveredPeriod] = useState<TimelinePeriod | null>(
    null,
  );

  // Generate time labels for the timeline (last 24 hours)
  const hours = [];
  for (let i = 0; i <= 24; i += 4) {
    hours.push(i.toString().padStart(2, "0") + ":00");
  }

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
    <div className="mt-4 border-t border-[var(--pipboy-green-dark)] pt-3">
      {/* Timeline header */}
      <div className="mb-2 flex items-center justify-between">
        <span className="glow-text font-[family-name:var(--font-pipboy)] text-xs opacity-70">
          ▸ TODAY&apos;S TIMELINE
        </span>
        {hoveredPeriod && (
          <span
            className={`font-[family-name:var(--font-pipboy)] text-xs ${
              hoveredPeriod.isActive ? "glow-text-red-bright" : "glow-text"
            }`}
          >
            {hoveredPeriod.regionName}{" "}
            {hoveredPeriod.isActive ? "(ACTIVE)" : ""}
          </span>
        )}
      </div>

      <div className="relative">
        {/* Timeline background */}
        <div className="timeline-bar-enhanced relative h-6 overflow-hidden rounded">
          {/* Grid lines */}
          {[...Array(24)].map((_, i) => (
            <div
              key={i}
              className="absolute top-0 bottom-0 w-px bg-[var(--pipboy-green-dark)] opacity-30"
              style={{ left: `${(i / 24) * 100}%` }}
            />
          ))}

          {/* Alert periods */}
          {alertPeriods.map((period, i) => (
            <div
              key={i}
              className={`absolute top-1 bottom-1 cursor-pointer rounded-sm transition-all duration-200 ${
                period.isActive ? "alert-period-active" : "alert-period"
              } ${hoveredPeriod === period ? "scale-y-110 opacity-100" : "opacity-80"}`}
              style={{
                left: `${period.start}%`,
                width: `${Math.max(period.end - period.start, 0.5)}%`,
              }}
              onMouseEnter={() => setHoveredPeriod(period)}
              onMouseLeave={() => setHoveredPeriod(null)}
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
        </div>

        {/* Time labels */}
        <div className="glow-text mt-1 flex justify-between font-[family-name:var(--font-pipboy)] text-[10px] md:text-xs">
          {hours.map((hour) => (
            <span key={hour} className="opacity-70">
              {hour}
            </span>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="mt-2 flex gap-4 font-[family-name:var(--font-pipboy)] text-[10px]">
        <div className="flex items-center gap-1.5">
          <span
            className="inline-block h-2 w-3 rounded-sm"
            style={{
              backgroundColor: "var(--pipboy-green-dim)",
              boxShadow: "none",
            }}
          />
          <span className="text-[var(--pipboy-green)] opacity-50">
            Завершені тривоги
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
          <span className="text-[var(--pipboy-alert-red)] opacity-70">
            Активні
          </span>
        </div>
      </div>
    </div>
  );
}
