import { useSyncExternalStore } from "react";

const HOVER_MEDIA_QUERY = "(hover: hover) and (pointer: fine)";

function subscribe(callback: () => void): () => void {
  const mediaQuery = window.matchMedia(HOVER_MEDIA_QUERY);
  mediaQuery.addEventListener("change", callback);
  return () => mediaQuery.removeEventListener("change", callback);
}

function getSnapshot(): boolean {
  return window.matchMedia(HOVER_MEDIA_QUERY).matches;
}

function getServerSnapshot(): boolean {
  return false;
}

/**
 * Detects if the device supports hover interactions (has a fine pointer like a mouse).
 * Uses the same media query as CSS: @media (hover: hover) and (pointer: fine)
 *
 * Returns:
 * - `true` on desktop devices with mouse
 * - `false` on touch-only devices (phones, tablets)
 * - `false` during SSR (safe default for mobile-first)
 */
export function useCanHover(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
