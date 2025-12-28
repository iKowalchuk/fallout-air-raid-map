"use client";

import { useEffect, useMemo, useState } from "react";

/** Loading stage with technical detail */
interface LoadingMessage {
  stage: string;
  detail: string;
}

/** Loading messages for app initialization */
const appInitializationMessages: LoadingMessage[] = [
  { stage: "ЗАПУСК", detail: "Ініціалізація терміналу Vault-Tec..." },
  { stage: "ПІДКЛЮЧЕННЯ", detail: "Встановлення захищеного каналу..." },
  { stage: "СИНХРОНІЗАЦІЯ", detail: "Завантаження даних тривог України..." },
  { stage: "КАЛІБРУВАННЯ", detail: "Налаштування радарних систем..." },
  { stage: "АКТИВОВАНО", detail: "Система моніторингу готова" },
];

/** Blip positions in polar coordinates */
const BLIP_POSITIONS = [
  { angle: 55, radius: 32 }, // 20% - NE
  { angle: 145, radius: 26 }, // 40% - SE
  { angle: 215, radius: 36 }, // 60% - SW
  { angle: 305, radius: 24 }, // 80% - NW
  { angle: 10, radius: 30 }, // 100% - N
];

/** Progress thresholds for blips */
const BLIP_THRESHOLDS = [20, 40, 60, 80, 100];

/** Generate SVG arc path for progress segment */
function generateArcPath(
  index: number,
  total: number,
  radius: number,
  cx: number,
  cy: number,
): string {
  const gapAngle = 3;
  const segmentAngle = (360 - gapAngle * total) / total;
  const startAngle = index * (segmentAngle + gapAngle) - 90;
  const endAngle = startAngle + segmentAngle;

  const startRad = (startAngle * Math.PI) / 180;
  const endRad = (endAngle * Math.PI) / 180;

  const x1 = cx + radius * Math.cos(startRad);
  const y1 = cy + radius * Math.sin(startRad);
  const x2 = cx + radius * Math.cos(endRad);
  const y2 = cy + radius * Math.sin(endRad);

  const largeArc = segmentAngle > 180 ? 1 : 0;

  return `M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}`;
}

/** Convert polar to cartesian coordinates */
function polarToCartesian(
  angle: number,
  radius: number,
  cx: number,
  cy: number,
): { x: number; y: number } {
  const rad = ((angle - 90) * Math.PI) / 180;
  return {
    x: cx + radius * Math.cos(rad),
    y: cy + radius * Math.sin(rad),
  };
}

/**
 * Redesigned Fallout-style loader - THREAT DETECTION TERMINAL
 * Features: Integrated progress ring, progressive blips, dynamic scan speed
 */
function FalloutLoader({ messages }: { messages: LoadingMessage[] }) {
  const [progress, setProgress] = useState(0);
  const [messageIndex, setMessageIndex] = useState(0);

  // Calculate active elements based on progress
  const activeSegments = Math.floor(progress / 10);
  const activeBlips = BLIP_THRESHOLDS.filter((t) => progress >= t).length;

  // Dynamic scan speed based on progress
  const scanDuration = useMemo(() => {
    if (progress >= 80) return "1.5s";
    if (progress >= 50) return "2s";
    return "3s";
  }, [progress]);

  // Generate tick marks at 30-degree intervals
  const tickMarks = useMemo(() => {
    return [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map(
      (angle) => {
        const rad = (angle * Math.PI) / 180;
        const x1 = 50 + 38 * Math.cos(rad);
        const y1 = 50 + 38 * Math.sin(rad);
        const x2 = 50 + 42 * Math.cos(rad);
        const y2 = 50 + 42 * Math.sin(rad);
        return { angle, x1, y1, x2, y2 };
      },
    );
  }, []);

  // Generate progress ring segments with stable keys
  const progressSegments = useMemo(() => {
    return Array.from({ length: 10 }, (_, i) => ({
      id: `segment-${i}`,
      path: generateArcPath(i, 10, 46, 50, 50),
      isActive: i < activeSegments,
      isCurrent: i === activeSegments - 1 || (i === 0 && activeSegments === 0),
    }));
  }, [activeSegments]);

  // Generate blip positions with stable keys
  const blips = useMemo(() => {
    return BLIP_POSITIONS.map((pos, i) => ({
      id: `blip-${i}`,
      ...polarToCartesian(pos.angle, pos.radius, 50, 50),
      isActive: i < activeBlips,
    }));
  }, [activeBlips]);

  // Fake progress from 0 to 100 with variable speed
  useEffect(() => {
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) return 100;
        // Variable increment for realistic feel
        const increment = Math.random() * 2.5 + 0.5;
        return Math.min(prev + increment, 100);
      });
    }, 80);

    return () => clearInterval(progressInterval);
  }, []);

  // Update message based on progress thresholds
  useEffect(() => {
    const thresholds = [0, 20, 45, 70, 95];
    let index = 0;
    for (let i = thresholds.length - 1; i >= 0; i--) {
      if (progress >= thresholds[i]) {
        index = i;
        break;
      }
    }
    setMessageIndex(Math.min(index, messages.length - 1));
  }, [progress, messages.length]);

  const currentMessage = messages[messageIndex];
  const isComplete = progress >= 100;

  return (
    <output
      className={`fallout-loader ${isComplete ? "fallout-loader-complete" : ""}`}
      aria-label={`${currentMessage.stage}: ${currentMessage.detail}`}
      role="progressbar"
      aria-valuenow={Math.floor(progress)}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      {/* Scanlines overlay */}
      <div className="fallout-scanlines" aria-hidden="true" />

      {/* CRT glitch effect */}
      <div className="fallout-crt-glitch" aria-hidden="true" />

      {/* Content */}
      <div className="fallout-loader-content">
        {/* Radar container */}
        <div className="fallout-radar-container">
          {/* Main radar SVG */}
          <svg
            viewBox="0 0 100 100"
            className="fallout-radar"
            aria-hidden="true"
            style={{ "--scan-duration": scanDuration } as React.CSSProperties}
          >
            {/* SVG Definitions */}
            <defs>
              {/* Gradient for sweep */}
              <linearGradient
                id="radar-sweep-gradient"
                gradientTransform="rotate(60)"
              >
                <stop offset="0%" stopColor="#00ff00" stopOpacity="0.5" />
                <stop offset="100%" stopColor="#00ff00" stopOpacity="0" />
              </linearGradient>

              {/* Glow filter for active elements */}
              <filter
                id="glow-filter"
                x="-50%"
                y="-50%"
                width="200%"
                height="200%"
              >
                <feGaussianBlur stdDeviation="1.5" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>

              {/* Strong glow for blips */}
              <filter
                id="blip-glow"
                x="-100%"
                y="-100%"
                width="300%"
                height="300%"
              >
                <feGaussianBlur stdDeviation="2" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Progress ring segments (outer) */}
            <g className="fallout-progress-ring">
              {progressSegments.map((seg) => (
                <path
                  key={seg.id}
                  d={seg.path}
                  className={`fallout-progress-segment ${
                    seg.isActive ? "fallout-progress-segment-active" : ""
                  } ${seg.isCurrent && seg.isActive ? "fallout-progress-segment-current" : ""}`}
                />
              ))}
            </g>

            {/* Concentric circles (3 rings) */}
            <circle
              cx="50"
              cy="50"
              r="42"
              className="fallout-radar-ring fallout-radar-ring-outer"
            />
            <circle cx="50" cy="50" r="30" className="fallout-radar-ring" />
            <circle cx="50" cy="50" r="18" className="fallout-radar-ring" />

            {/* Grid crosshairs */}
            <line
              x1="50"
              y1="8"
              x2="50"
              y2="92"
              className="fallout-radar-crosshair"
            />
            <line
              x1="8"
              y1="50"
              x2="92"
              y2="50"
              className="fallout-radar-crosshair"
            />

            {/* Diagonal crosshairs */}
            <line
              x1="17"
              y1="17"
              x2="83"
              y2="83"
              className="fallout-radar-crosshair-diagonal"
            />
            <line
              x1="83"
              y1="17"
              x2="17"
              y2="83"
              className="fallout-radar-crosshair-diagonal"
            />

            {/* Tick marks on outer ring */}
            <g className="fallout-radar-ticks">
              {tickMarks.map((tick) => (
                <line
                  key={tick.angle}
                  x1={tick.x1}
                  y1={tick.y1}
                  x2={tick.x2}
                  y2={tick.y2}
                  className="fallout-radar-tick"
                />
              ))}
            </g>

            {/* Animated scan group - sweep and line rotate together */}
            <g className="fallout-radar-scan-group">
              {/* Sweep gradient (triangular path trailing the scan line) */}
              <path
                d="M50 50 L50 8 A42 42 0 0 1 86 33 Z"
                fill="url(#radar-sweep-gradient)"
                className="fallout-radar-sweep"
              />

              {/* Rotating scan line */}
              <line
                x1="50"
                y1="50"
                x2="50"
                y2="8"
                className="fallout-radar-scan-line"
              />
            </g>

            {/* Progressive blips */}
            <g className="fallout-radar-blips">
              {blips.map((blip) => (
                <g key={blip.id}>
                  {/* Outer glow ring */}
                  <circle
                    cx={blip.x}
                    cy={blip.y}
                    r="4"
                    className={`fallout-radar-blip-ring ${
                      blip.isActive ? "fallout-radar-blip-ring-active" : ""
                    }`}
                  />
                  {/* Inner blip dot */}
                  <circle
                    cx={blip.x}
                    cy={blip.y}
                    r="2"
                    className={`fallout-radar-blip ${
                      blip.isActive ? "fallout-radar-blip-active" : ""
                    }`}
                  />
                </g>
              ))}
            </g>

            {/* Center dot */}
            <circle cx="50" cy="50" r="3" className="fallout-radar-center" />
          </svg>

          {/* Pulse rings */}
          <div
            className="fallout-pulse-ring fallout-pulse-1"
            aria-hidden="true"
          />
          <div
            className="fallout-pulse-ring fallout-pulse-2"
            aria-hidden="true"
          />
        </div>

        {/* Status text with stage and detail */}
        <div className="fallout-status">
          <div className="fallout-status-stage">{currentMessage.stage}</div>
          <div className="fallout-status-detail">{currentMessage.detail}</div>
        </div>

        {/* Terminal footer */}
        <div className="fallout-terminal-footer">
          <span className="fallout-terminal-line" aria-hidden="true" />
          <span className="fallout-terminal-text">VAULT-TEC SYSTEMS</span>
          <span className="fallout-terminal-line" aria-hidden="true" />
        </div>
      </div>

      {/* Border frame */}
      <div className="fallout-border-frame" aria-hidden="true">
        <div className="fallout-border-corner fallout-border-corner-tl" />
        <div className="fallout-border-corner fallout-border-corner-tr" />
        <div className="fallout-border-corner fallout-border-corner-bl" />
        <div className="fallout-border-corner fallout-border-corner-br" />
      </div>

      {/* Vignette */}
      <div className="fallout-vignette" aria-hidden="true" />
    </output>
  );
}

/**
 * App initialization loader - shown on first load when no data is cached
 */
export function AppInitializationLoader() {
  return <FalloutLoader messages={appInitializationMessages} />;
}
