"use client";

import Link from "next/link";
import { useEffect, useState, useSyncExternalStore } from "react";
import { formatDate, formatTime, getWarDay } from "@/utils/date-formatting";

interface HeaderProps {
  activeTab: "info" | "map";
  alertCount?: number;
}

// Custom hook for client-side time with hydration safety
function useClientTime() {
  const [time, setTime] = useState<Date | null>(null);

  useEffect(() => {
    // Trigger first update immediately via setTimeout (linter-compliant)
    const initialTimer = setTimeout(() => setTime(new Date()), 0);
    // Continue updating every second
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => {
      clearTimeout(initialTimer);
      clearInterval(timer);
    };
  }, []);

  return time;
}

// Hydration hook using useSyncExternalStore (linter-compliant)
const emptySubscribe = () => () => {};

function useHydrated() {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );
}

export default function Header({ activeTab, alertCount = 0 }: HeaderProps) {
  const time = useClientTime();
  const isHydrated = useHydrated();
  const warDay = isHydrated ? getWarDay() : 0;

  return (
    <header className="flex items-center justify-between border-b border-[var(--pipboy-green-dark)] px-2 py-1 sm:px-4 sm:py-3 md:px-6">
      {/* Left side: Logo and Info */}
      <div className="flex flex-col gap-0.5 sm:gap-1">
        <h1 className="glow-text-bright font-[family-name:var(--font-pipboy)] text-sm tracking-wider sm:text-xl md:text-2xl">
          VAULT-TEC UA
        </h1>

        {/* Info row: Clock, Date, War Day */}
        <div className="flex items-center gap-2 font-[family-name:var(--font-pipboy)] text-[9px] sm:gap-4 sm:text-xs md:gap-6 md:text-sm">
          {/* Live Clock */}
          <div className="flex items-center gap-1 sm:gap-2">
            <span className="glow-text opacity-70">TIME:</span>
            <span className="glow-text-bright min-w-[55px] font-mono tracking-widest sm:min-w-[70px]">
              {time ? formatTime(time) : "--:--:--"}
            </span>
          </div>

          {/* Date */}
          <div className="hidden items-center gap-2 sm:flex">
            <span className="glow-text opacity-70">DATE:</span>
            <span className="glow-text">
              {time ? formatDate(time) : "--.--.----"}
            </span>
          </div>

          {/* War Day Counter */}
          <div className="hidden items-center gap-2 md:flex">
            <span className="glow-text-red opacity-70">WAR DAY:</span>
            <span className="glow-text-red-bright war-day-counter">
              {warDay || "---"}
            </span>
          </div>

          {/* Alert Counter */}
          {alertCount > 0 && (
            <div className="alert-counter hidden items-center gap-2 sm:flex">
              <div className="alert-indicator" />
              <span className="glow-text-red-bright">
                {alertCount} {alertCount === 1 ? "REGION" : "REGIONS"}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Right side: Navigation - vertically centered */}
      <nav className="flex items-center gap-2 font-[family-name:var(--font-pipboy)] text-xs sm:gap-4 sm:text-base md:gap-6 md:text-lg">
        <Link
          href="/info"
          className={`nav-tab ${activeTab === "info" ? "nav-tab-active" : ""}`}
        >
          INFO
        </Link>
        <Link
          href="/map"
          className={`nav-tab ${activeTab === "map" ? "nav-tab-active" : ""}`}
        >
          MAP
        </Link>
      </nav>
    </header>
  );
}
