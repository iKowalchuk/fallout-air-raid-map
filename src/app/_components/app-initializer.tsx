"use client";

import { type ReactNode, useEffect } from "react";
import { AppInitializationLoader } from "@/components/common/loader";
import { useAppInitialization } from "@/features/alerts";
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
  const { isInitializing, hasRequiredData } =
    useAppInitialization(requiredData);

  // Mark as initialized when required data is loaded
  useEffect(() => {
    if (!isInitialized && hasRequiredData) {
      markAsInitialized();
    }
  }, [isInitialized, hasRequiredData, markAsInitialized]);

  // Show loader only if:
  // 1. App has never been initialized (cold start), AND
  // 2. Required data is currently loading
  const shouldShowLoader = !isInitialized && isInitializing;

  if (shouldShowLoader) {
    return <AppInitializationLoader />;
  }

  return <>{children}</>;
}
