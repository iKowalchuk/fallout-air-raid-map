import { safeParseDate } from "@/lib/date-validation";
import type { ApiAlertType } from "./external";
import {
  type AlertsApiResponse,
  type AlertType,
  AlertTypeSchema,
  type HistoryApiResponse,
  type MessageType,
} from "./internal";

// === Type Mapping (API -> Internal) ===
const ALERT_TYPE_MAP: Record<ApiAlertType, AlertType> = {
  air_raid: "air_raid",
  artillery_shelling: "artillery",
  urban_fights: "urban_fights",
  chemical: "chemical",
  nuclear: "nuclear",
};

export function mapAlertType(apiType: string): AlertType {
  return ALERT_TYPE_MAP[apiType as ApiAlertType] ?? "air_raid";
}

function isValidAlertType(type: string): type is AlertType {
  return AlertTypeSchema.safeParse(type).success;
}

// === Client-side Alert State (with Date objects) ===
export interface LocalAlertState {
  regionId: string;
  isActive: boolean;
  alertType: AlertType;
  startTime: Date | null;
}

// === Transformed Active Alerts Response ===
export interface TransformedActiveAlerts {
  alerts: LocalAlertState[];
  alertedRegionIds: string[];
  alertCount: number;
  source: "api" | "cache";
  lastUpdate: Date;
  error?: string;
}

export function transformActiveAlertsResponse(
  data: AlertsApiResponse,
): TransformedActiveAlerts {
  const alerts: LocalAlertState[] = data.alerts.map((alert) => ({
    regionId: alert.regionId,
    isActive: alert.isActive,
    alertType: isValidAlertType(alert.alertType) ? alert.alertType : "air_raid",
    startTime: safeParseDate(alert.startTime),
  }));

  const alertedRegionIds = alerts
    .filter((a) => a.isActive)
    .map((a) => a.regionId);

  return {
    alerts,
    alertedRegionIds,
    alertCount: alertedRegionIds.length,
    source: data.source,
    lastUpdate: safeParseDate(data.lastUpdate) ?? new Date(),
    error: data.error,
  };
}

// === Client Alert Message (with Date timestamp) ===
export interface ClientAlertMessage {
  id: string;
  timestamp: Date;
  regionId: string;
  regionName: string;
  type: MessageType;
  message: string;
}

// === Client Cache Status ===
export interface ClientCacheStatus {
  cachedRegions: number;
  pendingRegions: number;
  totalRegions: number;
  isComplete: boolean;
}

// === Transformed History Response ===
export interface TransformedHistory {
  messages: ClientAlertMessage[];
  source: "api" | "cache";
  lastUpdate: Date;
  cacheStatus: ClientCacheStatus | null;
}

const VALID_MESSAGE_TYPES: MessageType[] = [
  "alert_start",
  "alert_end",
  "uav_detected",
  "missile_detected",
  "info",
];

function isValidMessageType(type: string): type is MessageType {
  return VALID_MESSAGE_TYPES.includes(type as MessageType);
}

export function transformHistoryResponse(
  data: HistoryApiResponse,
): TransformedHistory {
  const messages: ClientAlertMessage[] = data.messages
    .map((msg) => {
      const timestamp = safeParseDate(msg.timestamp);
      // Skip messages with invalid timestamps
      if (!timestamp) return null;

      return {
        id: msg.id,
        timestamp,
        regionId: msg.regionId,
        regionName: msg.regionName,
        type: isValidMessageType(msg.type) ? msg.type : "info",
        message: msg.message,
      };
    })
    .filter((msg): msg is ClientAlertMessage => msg !== null);

  const cacheStatus: ClientCacheStatus | null = data.cacheStatus
    ? {
        cachedRegions: data.cacheStatus.cachedRegions,
        pendingRegions: data.cacheStatus.pendingRegions,
        totalRegions:
          data.cacheStatus.cachedRegions + data.cacheStatus.pendingRegions,
        isComplete: data.cacheStatus.pendingRegions === 0,
      }
    : null;

  return {
    messages,
    source: data.source,
    lastUpdate: safeParseDate(data.lastUpdate) ?? new Date(),
    cacheStatus,
  };
}
