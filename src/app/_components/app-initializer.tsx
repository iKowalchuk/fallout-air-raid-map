"use client";

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
 * Lives in app layer to maintain unidirectional code flow: shared → features → app
 */
export function AppInitializer({
  children,
  requiredData,
}: AppInitializerProps) {
  const { isInitialized, markAsInitialized } = useAppInitializationContext();

  // Use React Query hooks - they handle reactivity internally
  const alertsQuery = useActiveAlerts();
  const historyQuery = useAlertHistoryQuery();

  // Determine loading and data states based on query success
  const alertsReady = alertsQuery.status === "success";
  const historyReady = historyQuery.status === "success";

  // Calculate if we have required data based on page needs
  const hasRequiredData =
    requiredData === "alerts" ? alertsReady : alertsReady && historyReady;

  // Calculate if we're still loading required data
  const isLoadingRequired =
    requiredData === "alerts"
      ? alertsQuery.isLoading
      : alertsQuery.isLoading || historyQuery.isLoading;

  // Mark as initialized when required data is loaded
  useEffect(() => {
    if (!isInitialized && hasRequiredData) {
      markAsInitialized();
    }
  }, [isInitialized, hasRequiredData, markAsInitialized]);

  // Show loader only on cold start (not initialized yet) AND still loading
  const shouldShowLoader = !isInitialized && isLoadingRequired;

  if (shouldShowLoader) {
    return <AppInitializationLoader />;
  }

  return <>{children}</>;
}
