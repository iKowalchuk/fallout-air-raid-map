"use client";

import { useEffect, useState } from "react";

/**
 * Unified Fallout-style loader - minimal industrial terminal aesthetic
 * Used for both Info and Map pages with different status text
 */
function FalloutLoader({ statusText }: { statusText: string }) {
  const [dots, setDots] = useState("");

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? "" : `${prev}.`));
    }, 400);
    return () => clearInterval(interval);
  }, []);

  return (
    <output className="fallout-loader" aria-label={statusText}>
      {/* Scanlines overlay */}
      <div className="fallout-scanlines" aria-hidden="true" />

      {/* Content */}
      <div className="fallout-loader-content">
        {/* Radiation symbol */}
        <div className="fallout-radiation-container">
          <svg
            viewBox="0 0 100 100"
            className="fallout-radiation-symbol"
            aria-hidden="true"
          >
            {/* Outer ring */}
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              opacity="0.3"
            />
            <circle
              cx="50"
              cy="50"
              r="38"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
              opacity="0.2"
            />

            {/* Inner circle */}
            <circle
              cx="50"
              cy="50"
              r="12"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              className="fallout-inner-circle"
            />

            {/* Radiation blades */}
            <path
              d="M50 8 A42 42 0 0 1 86.36 29 L50 50 Z"
              fill="currentColor"
              className="fallout-blade"
            />
            <path
              d="M86.36 71 A42 42 0 0 1 13.64 71 L50 50 Z"
              fill="currentColor"
              className="fallout-blade"
            />
            <path
              d="M13.64 29 A42 42 0 0 1 50 8 L50 50 Z"
              fill="currentColor"
              className="fallout-blade"
            />
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

        {/* Status text */}
        <div className="fallout-status">
          <span className="fallout-status-text">{statusText}</span>
          <span className="fallout-dots" aria-hidden="true">
            {dots}
          </span>
        </div>

        {/* Progress bar */}
        <div className="fallout-progress" aria-hidden="true">
          <div className="fallout-progress-track">
            <div className="fallout-progress-fill" />
          </div>
          <div className="fallout-progress-glow" />
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
  return <FalloutLoader statusText="ЗАВАНТАЖЕННЯ ДАНИХ" />;
}

/**
 * Map page loader
 */
export function MapPageLoader() {
  return <FalloutLoader statusText="СКАНУВАННЯ ТЕРИТОРІЇ" />;
}
