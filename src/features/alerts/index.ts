// Public API for the alerts feature

// React Query hooks (for direct usage)
export { useActiveAlerts } from "./api/get-active-alerts";
export { useAlertHistoryQuery } from "./api/get-alert-history";
// Hooks (primary exports for consumers)
export type { UseAlertHistoryResult } from "./hooks/use-alert-history";
export { type UseAlertsResult, useAlerts } from "./hooks/use-alerts";
export { type UseMessagesResult, useMessages } from "./hooks/use-messages";
export { usePrefetchData } from "./hooks/use-prefetch-data";

// Types (for all consumers)
export type {
  // API route types
  AlertsApiResponse,
  AlertsInUaAlert,
  AlertType,
  ClientAlertMessage,
  ClientCacheStatus,
  HistoryApiResponse,
  LocalAlertState,
  MessageType,
  TransformedActiveAlerts,
  TransformedHistory,
} from "./schemas";
// Validation schemas (for API routes)
// Transformers (for API routes)
export {
  AlertsInUaActiveResponseSchema,
  AlertsInUaHistoryResponseSchema,
  mapAlertType,
} from "./schemas";

// Utilities (for API routes)
export {
  type AlertData,
  getAllUids,
  getHigherPriorityAlert,
  oblastNameToProjectRegionId,
  POLLING_CONFIG,
  uidToProjectRegionId,
} from "./utils";
