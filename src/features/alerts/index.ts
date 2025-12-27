// Public API for the alerts feature

// Hooks (primary exports for consumers)
export { type UseAlertHistoryResult } from "./hooks/use-alert-history";
export { type UseAlertsResult, useAlerts } from "./hooks/use-alerts";
export { type UseMessagesResult, useMessages } from "./hooks/use-messages";

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
