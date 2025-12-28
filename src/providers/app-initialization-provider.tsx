"use client";

import { createContext, type ReactNode, useContext, useState } from "react";

interface AppInitializationContextValue {
  /** Whether the app has completed initial data load */
  isInitialized: boolean;
  /** Mark app as initialized (called when required data is loaded) */
  markAsInitialized: () => void;
}

const AppInitializationContext = createContext<
  AppInitializationContextValue | undefined
>(undefined);

interface AppInitializationProviderProps {
  children: ReactNode;
}

/**
 * Tracks whether the app has completed its initial data load.
 * Prevents showing the global loader on navigation between pages.
 * State is session-scoped (resets on hard refresh).
 */
export function AppInitializationProvider({
  children,
}: AppInitializationProviderProps) {
  const [isInitialized, setIsInitialized] = useState(false);

  const markAsInitialized = () => {
    setIsInitialized(true);
  };

  return (
    <AppInitializationContext.Provider
      value={{ isInitialized, markAsInitialized }}
    >
      {children}
    </AppInitializationContext.Provider>
  );
}

/**
 * Hook to access app initialization state.
 * Must be used within AppInitializationProvider.
 */
export function useAppInitializationContext(): AppInitializationContextValue {
  const context = useContext(AppInitializationContext);
  if (!context) {
    throw new Error(
      "useAppInitializationContext must be used within AppInitializationProvider",
    );
  }
  return context;
}
