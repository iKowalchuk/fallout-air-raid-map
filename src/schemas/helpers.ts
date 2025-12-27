import type { ApiAlertType } from "./alerts-api";
import type { AlertType } from "./alerts-internal";
import {
  AlertsApiResponseSchema,
  AlertTypeSchema,
  HistoryApiResponseSchema,
} from "./alerts-internal";

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

export function isValidAlertType(type: string): type is AlertType {
  return AlertTypeSchema.safeParse(type).success;
}

export function parseAlertsResponse(
  data: unknown,
): ReturnType<typeof AlertsApiResponseSchema.safeParse> {
  return AlertsApiResponseSchema.safeParse(data);
}

export function parseHistoryResponse(
  data: unknown,
): ReturnType<typeof HistoryApiResponseSchema.safeParse> {
  return HistoryApiResponseSchema.safeParse(data);
}
