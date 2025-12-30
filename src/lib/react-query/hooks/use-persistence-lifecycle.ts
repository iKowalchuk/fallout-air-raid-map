"use client";

import { useEffect, useRef } from "react";
import type { EnhancedPersister } from "@/lib/react-query/persisters/create-indexeddb-persister";
import {
  type ThrottledAsyncFunction,
  throttlePromise,
} from "@/lib/react-query/utils/throttle-promise";

interface UsePersistenceLifecycleOptions {
  /**
   * The enhanced persister with flush capability.
   * If null, the hook does nothing.
   */
  persister: EnhancedPersister | null;

  /**
   * Throttle delay in milliseconds for visibility change events.
   * Prevents excessive writes when user rapidly switches tabs.
   * @default 2000
   */
  throttleMs?: number;

  /**
   * Whether lifecycle persistence is enabled.
   * @default true
   */
  enabled?: boolean;
}

/**
 * Hook that triggers cache persistence on page lifecycle events.
 *
 * Handles:
 * - visibilitychange: When tab becomes hidden (throttled)
 * - pagehide: Before page navigation/unload (immediate)
 * - freeze: Page Lifecycle API - tab suspended (immediate, Safari 14+)
 *
 * This is critical for mobile Safari which aggressively unloads background tabs.
 * By persisting on visibility change, we ensure data is saved before iOS suspends the page.
 *
 * Note: Browser lifecycle events are asynchronous and browsers may not wait for
 * async operations to complete during pagehide/freeze. While we do our best to
 * persist data, there's no guarantee in edge cases where the browser terminates
 * the page immediately.
 */
export function usePersistenceLifecycle({
  persister,
  throttleMs = 2000,
  enabled = true,
}: UsePersistenceLifecycleOptions): void {
  // Store throttled function in ref to preserve identity across renders
  const throttledFlushRef = useRef<ThrottledAsyncFunction<void> | null>(null);

  useEffect(() => {
    // Skip if disabled, no persister, or server-side
    if (!enabled || !persister || typeof window === "undefined") {
      return;
    }

    // Cancel any existing throttled function before creating new one
    throttledFlushRef.current?.cancel();

    // Create throttled flush function
    throttledFlushRef.current = throttlePromise(
      () => persister.flush(),
      throttleMs,
    );

    /**
     * Handler for visibility change events.
     * Throttled to prevent excessive writes during rapid tab switching.
     */
    function handleVisibilityChange(): void {
      if (document.visibilityState === "hidden") {
        void throttledFlushRef.current?.();
      }
    }

    /**
     * Handler for page hide events.
     * Executes immediately without throttling - this is the last chance to persist.
     */
    function handlePageHide(): void {
      // Use flush to bypass throttle - this is critical
      void throttledFlushRef.current?.flush();
    }

    /**
     * Handler for page freeze events (Page Lifecycle API).
     * Executes immediately - the browser is about to suspend the page.
     */
    function handleFreeze(): void {
      void throttledFlushRef.current?.flush();
    }

    // Register event listeners
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("pagehide", handlePageHide);

    // freeze event is part of Page Lifecycle API (Safari 14+, Chrome 68+)
    // Use feature detection since it's not universally supported
    if ("onfreeze" in document) {
      document.addEventListener("freeze", handleFreeze);
    }

    // Cleanup
    return () => {
      // Cancel any pending throttled calls
      throttledFlushRef.current?.cancel();
      throttledFlushRef.current = null;

      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("pagehide", handlePageHide);

      if ("onfreeze" in document) {
        document.removeEventListener("freeze", handleFreeze);
      }
    };
  }, [persister, throttleMs, enabled]);
}
