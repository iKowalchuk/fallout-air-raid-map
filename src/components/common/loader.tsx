"use client";

import { useEffect, useState } from "react";

/** Loading stage with technical detail */
interface LoadingMessage {
  stage: string;
  detail: string;
}

/** Loading messages for INFO page */
const infoLoadingMessages: LoadingMessage[] = [
  { stage: "ІНІЦІАЛІЗАЦІЯ", detail: "Завантаження ядра системи..." },
  { stage: "ПІДКЛЮЧЕННЯ", detail: "Встановлення з'єднання з сервером..." },
  { stage: "СИНХРОНІЗАЦІЯ", detail: "Отримання даних тривог..." },
  { stage: "ОБРОБКА", detail: "Аналіз регіональних даних..." },
  { stage: "ГОТОВО", detail: "Система готова до роботи" },
];

/** Loading messages for MAP page */
const mapLoadingMessages: LoadingMessage[] = [
  { stage: "ІНІЦІАЛІЗАЦІЯ", detail: "Активація картографічного модуля..." },
  { stage: "СКАНУВАННЯ", detail: "Завантаження топографічних даних..." },
  { stage: "КАЛІБРУВАННЯ", detail: "Синхронізація радарних систем..." },
  { stage: "АНАЛІЗ", detail: "Обробка сигналів тривоги..." },
  { stage: "ГОТОВО", detail: "Територія під контролем" },
];

/**
 * Unified Fallout-style loader - radar-based terminal aesthetic
 * Features animated radar, percentage progress, and dynamic status messages
 */
function FalloutLoader({ messages }: { messages: LoadingMessage[] }) {
  const [progress, setProgress] = useState(0);
  const [messageIndex, setMessageIndex] = useState(0);

  // Generate tick marks at 30-degree intervals
  const tickMarks = [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map(
    (angle) => {
      const rad = (angle * Math.PI) / 180;
      const x1 = 50 + 42 * Math.cos(rad);
      const y1 = 50 + 42 * Math.sin(rad);
      const x2 = 50 + 45 * Math.cos(rad);
      const y2 = 50 + 45 * Math.sin(rad);
      return { angle, x1, y1, x2, y2 };
    },
  );

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

  return (
    <output
      className="fallout-loader"
      aria-label={`${currentMessage.stage}: ${currentMessage.detail}`}
    >
      {/* Scanlines overlay */}
      <div className="fallout-scanlines" aria-hidden="true" />

      {/* Content */}
      <div className="fallout-loader-content">
        {/* Radar container */}
        <div className="fallout-radar-container">
          {/* Main radar SVG */}
          <svg
            viewBox="0 0 100 100"
            className="fallout-radar"
            aria-hidden="true"
          >
            {/* SVG Definitions for gradient */}
            <defs>
              <linearGradient
                id="radar-sweep-gradient"
                gradientTransform="rotate(60)"
              >
                <stop offset="0%" stopColor="#00ff00" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#00ff00" stopOpacity="0" />
              </linearGradient>
            </defs>

            {/* Concentric circles (4 rings) */}
            <circle
              cx="50"
              cy="50"
              r="45"
              className="fallout-radar-ring fallout-radar-ring-outer"
            />
            <circle cx="50" cy="50" r="34" className="fallout-radar-ring" />
            <circle cx="50" cy="50" r="23" className="fallout-radar-ring" />
            <circle
              cx="50"
              cy="50"
              r="12"
              className="fallout-radar-ring fallout-radar-ring-inner"
            />

            {/* Grid crosshairs */}
            <line
              x1="50"
              y1="5"
              x2="50"
              y2="95"
              className="fallout-radar-crosshair"
            />
            <line
              x1="5"
              y1="50"
              x2="95"
              y2="50"
              className="fallout-radar-crosshair"
            />

            {/* Diagonal crosshairs */}
            <line
              x1="14.6"
              y1="14.6"
              x2="85.4"
              y2="85.4"
              className="fallout-radar-crosshair-diagonal"
            />
            <line
              x1="85.4"
              y1="14.6"
              x2="14.6"
              y2="85.4"
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
                d="M50 50 L50 5 A45 45 0 0 1 89.5 32.5 Z"
                fill="url(#radar-sweep-gradient)"
                className="fallout-radar-sweep"
              />

              {/* Rotating scan line */}
              <line
                x1="50"
                y1="50"
                x2="50"
                y2="5"
                className="fallout-radar-scan-line"
              />
            </g>

            {/* Center dot */}
            <circle cx="50" cy="50" r="3" fill="currentColor" opacity="0.6" />
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

        {/* Progress percentage display */}
        <div className="fallout-progress-display" aria-hidden="true">
          <span className="fallout-progress-percent">
            {Math.floor(progress)}%
          </span>
        </div>

        {/* Status text with stage and detail */}
        <div className="fallout-status">
          <div className="fallout-status-stage">{currentMessage.stage}</div>
          <div className="fallout-status-detail">{currentMessage.detail}</div>
        </div>

        {/* Progress bar with percentage fill */}
        <div className="fallout-progress" aria-hidden="true">
          <div className="fallout-progress-track">
            <div
              className="fallout-progress-fill"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Bottom label */}
        <div className="fallout-label">
          <span className="fallout-label-left">VAULT-TEC</span>
          <span className="fallout-label-divider">•</span>
          <span className="fallout-label-right">TERMINAL</span>
        </div>
      </div>

      {/* Corner decorations */}
      <div className="fallout-corner fallout-corner-tl" aria-hidden="true" />
      <div className="fallout-corner fallout-corner-tr" aria-hidden="true" />
      <div className="fallout-corner fallout-corner-bl" aria-hidden="true" />
      <div className="fallout-corner fallout-corner-br" aria-hidden="true" />

      {/* Vignette */}
      <div className="fallout-vignette" aria-hidden="true" />
    </output>
  );
}

/**
 * Info page loader
 */
export function InfoPageLoader() {
  return <FalloutLoader messages={infoLoadingMessages} />;
}

/**
 * Map page loader
 */
export function MapPageLoader() {
  return <FalloutLoader messages={mapLoadingMessages} />;
}
