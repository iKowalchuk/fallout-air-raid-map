// External API schemas (alerts.in.ua)
export {
  AlertsInUaActiveResponseSchema,
  type AlertsInUaAlert,
  AlertsInUaHistoryResponseSchema,
  type ApiAlertType,
} from "./external";

// Internal schemas
export {
  type AlertsApiResponse,
  AlertsApiResponseSchema,
  type AlertType,
  type HistoryApiResponse,
  HistoryApiResponseSchema,
  type MessageType,
} from "./internal";

// Transformers
export {
  type ClientAlertMessage,
  type ClientCacheStatus,
  type LocalAlertState,
  mapAlertType,
  type TransformedActiveAlerts,
  type TransformedHistory,
  transformActiveAlertsResponse,
  transformHistoryResponse,
} from "./transformers";
