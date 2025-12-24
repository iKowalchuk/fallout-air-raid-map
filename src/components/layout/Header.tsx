"use client";

import Link from "next/link";
import { useState, useEffect, useSyncExternalStore } from "react";
import { formatTime, formatDate, getWarDay } from "@/utils/dateFormatting";

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
    <header className="border-b border-[var(--pipboy-green-dark)] px-4 py-3 md:px-6">
      {/* Top row: Logo and Navigation */}
      <div className="mb-2 flex items-center justify-between">
        <h1 className="glow-text-bright font-[family-name:var(--font-pipboy)] text-xl tracking-wider md:text-2xl">
          VAULT-TEC UA
        </h1>

        <nav className="flex gap-4 font-[family-name:var(--font-pipboy)] text-base md:gap-6 md:text-lg">
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
      </div>

      {/* Bottom row: Clock, Date, War Day, Alert Counter */}
      <div className="flex items-center justify-between font-[family-name:var(--font-pipboy)] text-xs md:text-sm">
        <div className="flex items-center gap-4 md:gap-6">
          {/* Live Clock */}
          <div className="flex items-center gap-2">
            <span className="glow-text opacity-70">TIME:</span>
            <span className="glow-text-bright min-w-[70px] font-mono tracking-widest">
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
        </div>

        {/* Alert Counter */}
        {alertCount > 0 && (
          <div className="alert-counter flex items-center gap-2">
            <div className="alert-indicator" />
            <span className="glow-text-red-bright">
              {alertCount} {alertCount === 1 ? "REGION" : "REGIONS"} UNDER ALERT
            </span>
          </div>
        )}
      </div>
    </header>
  );
}
