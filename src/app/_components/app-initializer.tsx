"use client";

import { useIsRestoring } from "@tanstack/react-query";
import { type ReactNode, useEffect } from "react";
import { AppInitializationLoader } from "@/components/common/loader";
import { useActiveAlerts, useAlertHistoryQuery } from "@/features/alerts";
import { useAppInitializationContext } from "@/providers/app-initialization-provider";

interface AppInitializerProps {
  children: ReactNode;
  /**
   * Specifies what data this page requires:
   * - 'alerts': Only active alerts (MAP page)
   * - 'messages': Both alerts and history (INFO page)
   */
  requiredData: "alerts" | "messages";
}

/**
 * Wrapper component that handles app initialization state.
 * Shows a global loader only on cold start (first load with no cache).
 * Subsequent navigation between pages is instant (uses cache).
 *
 * Uses useIsRestoring() to wait for IndexedDB cache restoration before
 * checking data availability, preventing race conditions where queries
 * would fetch from API before cached data is restored.
 *
 * Lives in app layer to maintain unidirectional code flow: shared → features → app
 */
export function AppInitializer({
  children,
  requiredData,
}: AppInitializerProps) {
  const { isInitialized, markAsInitialized } = useAppInitializationContext();

  // Wait for IndexedDB cache restoration to complete before checking data
  const isRestoring = useIsRestoring();

  // Use React Query hooks - they handle reactivity internally
  const alertsQuery = useActiveAlerts();
  const historyQuery = useAlertHistoryQuery();

  // Determine if queries have successfully loaded data.
  // Check for `data !== undefined` to handle prefetched/cached data that
  // may not have status "success" yet during hydration
  const alertsReady =
    alertsQuery.status === "success" || alertsQuery.data !== undefined;
  const historyReady =
    historyQuery.status === "success" || historyQuery.data !== undefined;

  // Calculate if we have required data based on page needs
  // Also require cache restoration to be complete to avoid race conditions
  const hasRequiredData =
    !isRestoring &&
    (requiredData === "alerts" ? alertsReady : alertsReady && historyReady);

  // Mark as initialized when required data is loaded
  useEffect(() => {
    if (!isInitialized && hasRequiredData) {
      markAsInitialized();
    }
  }, [isInitialized, hasRequiredData, markAsInitialized]);

  // Show global loader only on cold start (first app load).
  // Once initialized, skip the loader - pages handle their own loading states.
  // This ensures instant navigation between pages after initial load.
  if (isInitialized) {
    return <>{children}</>;
  }

  // On cold start, wait for cache restoration and required data before showing content
  if (!hasRequiredData) {
    return <AppInitializationLoader />;
  }

  return <>{children}</>;
}
