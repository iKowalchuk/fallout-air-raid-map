"use client";

import { useEffect, useState } from "react";

/**
 * Vault-Tec "PLEASE STAND BY" loader inspired by Fallout loading screens
 * Features: Test pattern, static noise, glitch effects, Vault Boy silhouette
 */
export function InfoPageLoader() {
  const [glitchActive, setGlitchActive] = useState(false);

  useEffect(() => {
    // Random glitch effect
    const glitchInterval = setInterval(() => {
      if (Math.random() > 0.85) {
        setGlitchActive(true);
        setTimeout(() => setGlitchActive(false), 150);
      }
    }, 500);

    return () => clearInterval(glitchInterval);
  }, []);

  return (
    <div className="standby-loader">
      {/* CRT screen curvature overlay */}
      <div className="standby-crt-curve" />

      {/* Static noise layer */}
      <div className="standby-noise" />

      {/* Scanlines */}
      <div className="standby-scanlines" />

      {/* Main content */}
      <div
        className={`standby-content ${glitchActive ? "standby-glitch" : ""}`}
      >
        {/* Test pattern circles */}
        <div className="standby-test-pattern">
          <svg
            viewBox="0 0 200 200"
            className="standby-circles"
            aria-hidden="true"
          >
            {/* Outer decorative ring */}
            <circle
              cx="100"
              cy="100"
              r="95"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
              opacity="0.3"
            />
            {/* Main circles */}
            <circle
              cx="100"
              cy="100"
              r="80"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="standby-circle-outer"
            />
            <circle
              cx="100"
              cy="100"
              r="60"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              opacity="0.6"
            />
            <circle
              cx="100"
              cy="100"
              r="40"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
              opacity="0.4"
            />

            {/* Cross lines */}
            <line
              x1="100"
              y1="5"
              x2="100"
              y2="195"
              stroke="currentColor"
              strokeWidth="1"
              opacity="0.3"
            />
            <line
              x1="5"
              y1="100"
              x2="195"
              y2="100"
              stroke="currentColor"
              strokeWidth="1"
              opacity="0.3"
            />

            {/* Diagonal lines */}
            <line
              x1="30"
              y1="30"
              x2="170"
              y2="170"
              stroke="currentColor"
              strokeWidth="0.5"
              opacity="0.2"
            />
            <line
              x1="170"
              y1="30"
              x2="30"
              y2="170"
              stroke="currentColor"
              strokeWidth="0.5"
              opacity="0.2"
            />
          </svg>

          {/* Vault Boy silhouette in center */}
          <div className="standby-vault-boy">
            <svg
              viewBox="0 0 60 80"
              className="vault-boy-svg"
              aria-hidden="true"
            >
              {/* Head */}
              <ellipse cx="30" cy="18" rx="14" ry="16" fill="currentColor" />
              {/* Hair swoosh */}
              <path
                d="M20 8 Q30 2 40 8 Q38 5 30 4 Q22 5 20 8"
                fill="currentColor"
              />
              {/* Body */}
              <path
                d="M18 32 L18 50 L24 50 L24 38 L36 38 L36 50 L42 50 L42 32 Q42 28 30 28 Q18 28 18 32"
                fill="currentColor"
              />
              {/* Left arm - thumbs up */}
              <path
                d="M18 34 L8 40 L6 38 L4 40 L8 48 L12 46 L18 42"
                fill="currentColor"
              />
              {/* Thumb */}
              <ellipse cx="6" cy="36" rx="3" ry="5" fill="currentColor" />
              {/* Right arm */}
              <path d="M42 34 L50 42 L48 50 L42 44" fill="currentColor" />
              {/* Legs */}
              <rect x="22" y="50" width="6" height="20" fill="currentColor" />
              <rect x="32" y="50" width="6" height="20" fill="currentColor" />
              {/* Feet */}
              <ellipse cx="25" cy="72" rx="5" ry="3" fill="currentColor" />
              <ellipse cx="35" cy="72" rx="5" ry="3" fill="currentColor" />
            </svg>
          </div>
        </div>

        {/* PLEASE STAND BY text */}
        <div className="standby-text">
          <span className="standby-text-main">ЗАЧЕКАЙТЕ</span>
          <span className="standby-text-sub">PLEASE STAND BY</span>
        </div>

        {/* Bottom decorative elements */}
        <div className="standby-bottom">
          {/* Radiation symbol */}
          <svg
            viewBox="0 0 40 40"
            className="standby-radiation"
            aria-hidden="true"
          >
            <circle
              cx="20"
              cy="20"
              r="5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            />
            <path
              d="M20 5 A15 15 0 0 1 32.99 12.5 L20 20 Z"
              fill="currentColor"
            />
            <path
              d="M32.99 27.5 A15 15 0 0 1 7.01 27.5 L20 20 Z"
              fill="currentColor"
            />
            <path
              d="M7.01 12.5 A15 15 0 0 1 20 5 L20 20 Z"
              fill="currentColor"
            />
          </svg>

          {/* Loading bar */}
          <div className="standby-loading-bar">
            <div className="standby-loading-fill" />
          </div>

          {/* Radiation symbol */}
          <svg
            viewBox="0 0 40 40"
            className="standby-radiation"
            aria-hidden="true"
          >
            <circle
              cx="20"
              cy="20"
              r="5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            />
            <path
              d="M20 5 A15 15 0 0 1 32.99 12.5 L20 20 Z"
              fill="currentColor"
            />
            <path
              d="M32.99 27.5 A15 15 0 0 1 7.01 27.5 L20 20 Z"
              fill="currentColor"
            />
            <path
              d="M7.01 12.5 A15 15 0 0 1 20 5 L20 20 Z"
              fill="currentColor"
            />
          </svg>
        </div>

        {/* Version text */}
        <div className="standby-version">VAULT-TEC INDUSTRIES</div>
      </div>

      {/* Vignette effect */}
      <div className="standby-vignette" />
    </div>
  );
}

/**
 * Map page loader with radar scanning effect
 */
export function MapPageLoader() {
  return (
    <div className="standby-loader standby-loader-map">
      {/* CRT effects */}
      <div className="standby-crt-curve" />
      <div className="standby-noise" />
      <div className="standby-scanlines" />

      {/* Radar content */}
      <div className="standby-content">
        {/* Radar display */}
        <div className="radar-display">
          <svg viewBox="0 0 200 200" className="radar-svg" aria-hidden="true">
            {/* Background grid */}
            <defs>
              <pattern
                id="radarGrid"
                width="20"
                height="20"
                patternUnits="userSpaceOnUse"
              >
                <path
                  d="M 20 0 L 0 0 0 20"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="0.3"
                  opacity="0.3"
                />
              </pattern>
              {/* Glow filter */}
              <filter id="radarGlow">
                <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Grid background */}
            <rect width="200" height="200" fill="url(#radarGrid)" />

            {/* Concentric circles */}
            <circle
              cx="100"
              cy="100"
              r="80"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
              opacity="0.4"
            />
            <circle
              cx="100"
              cy="100"
              r="60"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
              opacity="0.3"
            />
            <circle
              cx="100"
              cy="100"
              r="40"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
              opacity="0.3"
            />
            <circle
              cx="100"
              cy="100"
              r="20"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
              opacity="0.3"
            />

            {/* Cross hairs */}
            <line
              x1="100"
              y1="10"
              x2="100"
              y2="190"
              stroke="currentColor"
              strokeWidth="0.5"
              opacity="0.4"
            />
            <line
              x1="10"
              y1="100"
              x2="190"
              y2="100"
              stroke="currentColor"
              strokeWidth="0.5"
              opacity="0.4"
            />

            {/* Scanning beam */}
            <g className="radar-beam-group" filter="url(#radarGlow)">
              <path
                d="M100 100 L100 20 A80 80 0 0 1 156.57 56.57 Z"
                fill="currentColor"
                opacity="0.3"
                className="radar-sweep"
              />
              <line
                x1="100"
                y1="100"
                x2="100"
                y2="20"
                stroke="currentColor"
                strokeWidth="2"
                className="radar-sweep"
              />
            </g>

            {/* Center point */}
            <circle
              cx="100"
              cy="100"
              r="4"
              fill="currentColor"
              filter="url(#radarGlow)"
            />

            {/* Blip points */}
            <circle
              cx="130"
              cy="70"
              r="3"
              fill="currentColor"
              className="radar-blip radar-blip-1"
            />
            <circle
              cx="60"
              cy="120"
              r="2"
              fill="currentColor"
              className="radar-blip radar-blip-2"
            />
            <circle
              cx="140"
              cy="140"
              r="2.5"
              fill="currentColor"
              className="radar-blip radar-blip-3"
            />
          </svg>
        </div>

        {/* Status text */}
        <div className="standby-text">
          <span className="standby-text-main">СКАНУВАННЯ</span>
          <span className="standby-text-sub">TERRITORY SCAN IN PROGRESS</span>
        </div>

        {/* Coordinates */}
        <div className="radar-coords">
          <span>LAT: 48.3794° N</span>
          <span className="radar-coords-divider">|</span>
          <span>LON: 31.1656° E</span>
        </div>
      </div>

      <div className="standby-vignette" />
    </div>
  );
}
