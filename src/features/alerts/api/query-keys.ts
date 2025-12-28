// Type-safe query keys factory following TanStack Query best practices
export const alertsQueryKeys = {
  all: ["alerts"] as const,

  // Active alerts
  active: () => [...alertsQueryKeys.all, "active"] as const,

  // Alert history
  history: () => [...alertsQueryKeys.all, "history"] as const,

  // Individual region history (for future use)
  regionHistory: (regionId: string) =>
    [...alertsQueryKeys.history(), regionId] as const,
} as const;
