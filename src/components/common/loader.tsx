"use client";

import { useEffect, useState } from "react";

/**
 * Vault-Tec styled loader with terminal boot sequence aesthetic
 */
function VaultTecLoader({
  variant = "full",
}: {
  variant?: "full" | "compact";
}) {
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState("");
  const [showCursor, setShowCursor] = useState(true);

  const bootSequence = [
    "VAULT-TEC SYSTEMS INITIALIZING...",
    "ЗАВАНТАЖЕННЯ БАЗИ ДАНИХ...",
    "СИНХРОНІЗАЦІЯ З СУПУТНИКОМ...",
    "ПЕРЕВІРКА СИГНАЛУ ТРИВОГИ...",
    "СИСТЕМА ГОТОВА",
  ];

  useEffect(() => {
    // Progress animation
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) return 100;
        // Accelerate towards the end
        const increment = prev < 60 ? 3 : prev < 85 ? 5 : 8;
        return Math.min(prev + increment, 100);
      });
    }, 80);

    return () => clearInterval(progressInterval);
  }, []);

  useEffect(() => {
    // Status text based on progress
    const index = Math.min(Math.floor(progress / 25), bootSequence.length - 1);
    setStatusText(bootSequence[index]);
  }, [progress]);

  useEffect(() => {
    // Blinking cursor
    const cursorInterval = setInterval(() => {
      setShowCursor((prev) => !prev);
    }, 530);

    return () => clearInterval(cursorInterval);
  }, []);

  const segments = 20;
  const filledSegments = Math.floor((progress / 100) * segments);

  if (variant === "compact") {
    return (
      <CompactLoader
        progress={progress}
        filledSegments={filledSegments}
        segments={segments}
      />
    );
  }

  return (
    <div className="flex h-full flex-col items-center justify-center gap-6 p-4">
      {/* Vault Boy ASCII Art */}
      <div className="vault-boy-loader select-none">
        <pre className="glow-text font-mono text-[8px] leading-[1.1] sm:text-[10px]">
          {`
      _______________
     /               \\
    |  .-'''''-.    |
    | /  .----.  \\   |
    ||  /      \\  |  |
    ||  | (•)(•)|  |  |
    ||  \\  __  /  |  |
    | \\  '----'  /   |
    |  '-......-'    |
    |    \\    /      |
    |     \\||/       |
    |      ||        |
    |     /||\\       |
    |    / || \\      |
    |___/  ||  \\_____|
         _||_
        |____|
`}
        </pre>
      </div>

      {/* Terminal frame */}
      <div className="loader-terminal w-full max-w-sm">
        {/* Terminal header */}
        <div className="flex items-center justify-between border-b border-pipboy-green-dark px-3 py-1">
          <span className="font-[family-name:var(--font-pipboy)] text-[10px] text-pipboy-green-dim">
            VAULT-TEC TERMINAL v4.2.7
          </span>
          <div className="flex gap-1">
            <div className="h-2 w-2 rounded-full bg-pipboy-green-dark" />
            <div className="h-2 w-2 rounded-full bg-pipboy-green-dim" />
            <div className="h-2 w-2 rounded-full bg-pipboy-green" />
          </div>
        </div>

        {/* Terminal content */}
        <div className="p-4">
          {/* Progress bar */}
          <div className="mb-4">
            <div className="mb-2 flex justify-between font-[family-name:var(--font-pipboy)] text-xs">
              <span className="text-pipboy-green-dim">ПРОГРЕС</span>
              <span className="glow-text tabular-nums">{progress}%</span>
            </div>
            <div className="loader-progress-bar flex gap-[2px]">
              {Array.from({ length: segments }).map((_, i) => {
                const segmentKey = `segment-${i}`;
                const isFilled = i < filledSegments;
                const isActive = i === filledSegments && progress < 100;
                return (
                  <div
                    key={segmentKey}
                    className={`loader-segment h-4 flex-1 ${
                      isFilled
                        ? "loader-segment-filled"
                        : isActive
                          ? "loader-segment-active"
                          : "loader-segment-empty"
                    }`}
                  />
                );
              })}
            </div>
          </div>

          {/* Status text */}
          <div className="loader-status min-h-[1.5em] font-[family-name:var(--font-pipboy)] text-xs">
            <span className="text-pipboy-green-dim">&gt; </span>
            <span className="glow-text">
              {statusText}
              <span
                className={`ml-0.5 inline-block h-3 w-1.5 bg-pipboy-green align-middle ${
                  showCursor ? "opacity-100" : "opacity-0"
                }`}
              />
            </span>
          </div>
        </div>

        {/* Scanline effect */}
        <div className="loader-scanline" />
      </div>

      {/* Bottom radiation warning */}
      <div className="flex items-center gap-2 text-pipboy-green-dim">
        <span className="radiation-symbol text-lg">☢</span>
        <span className="font-[family-name:var(--font-pipboy)] text-[10px] tracking-wider">
          ЗАЧЕКАЙТЕ, БУДЬ ЛАСКА
        </span>
        <span className="radiation-symbol text-lg">☢</span>
      </div>
    </div>
  );
}

/**
 * Compact loader for smaller spaces
 */
function CompactLoader({
  progress,
  filledSegments,
  segments,
}: {
  progress: number;
  filledSegments: number;
  segments: number;
}) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 p-4">
      {/* Mini Vault-Tec logo */}
      <div className="loader-vault-logo">
        <div className="relative flex h-16 w-16 items-center justify-center">
          <div className="loader-ring" />
          <div className="loader-ring-inner" />
          <span className="glow-text-bright font-[family-name:var(--font-pipboy)] text-2xl">
            V
          </span>
        </div>
      </div>

      {/* Compact progress */}
      <div className="w-full max-w-[200px]">
        <div className="loader-progress-bar flex gap-[2px]">
          {Array.from({ length: segments }).map((_, i) => {
            const segmentKey = `compact-segment-${i}`;
            const isFilled = i < filledSegments;
            const isActive = i === filledSegments && progress < 100;
            return (
              <div
                key={segmentKey}
                className={`loader-segment h-2 flex-1 ${
                  isFilled
                    ? "loader-segment-filled"
                    : isActive
                      ? "loader-segment-active"
                      : "loader-segment-empty"
                }`}
              />
            );
          })}
        </div>
        <div className="mt-2 text-center font-[family-name:var(--font-pipboy)] text-[10px] text-pipboy-green-dim">
          ЗАВАНТАЖЕННЯ...
        </div>
      </div>
    </div>
  );
}

/**
 * Info page loader with terminal aesthetic
 */
export function InfoPageLoader() {
  return (
    <div className="flex h-full flex-col gap-4 p-2">
      <VaultTecLoader variant="full" />
    </div>
  );
}

/**
 * Map page loader with radar scanning effect
 */
export function MapPageLoader() {
  const [scanAngle, setScanAngle] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setScanAngle((prev) => (prev + 3) % 360);
    }, 30);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex h-full flex-col items-center justify-center gap-6 p-4">
      {/* Radar display */}
      <div className="map-loader-radar">
        <div className="radar-container">
          {/* Grid lines */}
          <div className="radar-grid" />

          {/* Scanning beam */}
          <div
            className="radar-beam"
            style={{ transform: `rotate(${scanAngle}deg)` }}
          />

          {/* Center dot */}
          <div className="radar-center" />

          {/* Ring markers */}
          <div className="radar-ring radar-ring-1" />
          <div className="radar-ring radar-ring-2" />
          <div className="radar-ring radar-ring-3" />
        </div>
      </div>

      {/* Status text */}
      <div className="flex flex-col items-center gap-2">
        <span className="glow-text font-[family-name:var(--font-pipboy)] text-sm tracking-wider">
          СКАНУВАННЯ ТЕРИТОРІЇ
        </span>
        <div className="flex items-center gap-2">
          <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-pipboy-green" />
          <span className="font-[family-name:var(--font-pipboy)] text-[10px] text-pipboy-green-dim">
            ЗАВАНТАЖЕННЯ КАРТИ...
          </span>
          <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-pipboy-green" />
        </div>
      </div>

      {/* Coordinates display */}
      <div className="loader-coords font-mono text-[10px] text-pipboy-green-dark">
        LAT: 48.3794° N | LON: 31.1656° E
      </div>
    </div>
  );
}
