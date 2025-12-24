import { z } from "zod";
import { INTERNAL_ALERT_TYPES, MESSAGE_TYPES } from "./common";

// === Internal Alert Types ===
export const AlertTypeSchema = z.enum(INTERNAL_ALERT_TYPES);
export type AlertType = z.infer<typeof AlertTypeSchema>;

const MessageTypeSchema = z.enum(MESSAGE_TYPES);
export type MessageType = z.infer<typeof MessageTypeSchema>;

// === Alert State (internal) ===
const AlertStateSchema = z.object({
  regionId: z.string(),
  isActive: z.boolean(),
  alertType: AlertTypeSchema,
  startTime: z.string().nullable(),
});

// === Internal API Response ===
export const AlertsApiResponseSchema = z.object({
  alerts: z.array(AlertStateSchema),
  source: z.enum(["api", "cache"]),
  lastUpdate: z.string(),
  error: z.string().optional(),
});

export type AlertsApiResponse = z.infer<typeof AlertsApiResponseSchema>;

// === Alert Message (API format - string timestamp) ===
const AlertMessageSchema = z.object({
  id: z.string(),
  timestamp: z.string(),
  regionId: z.string(),
  regionName: z.string().min(1),
  type: MessageTypeSchema,
  message: z.string(),
});

export type AlertMessage = z.infer<typeof AlertMessageSchema>;

// === Client Alert Message (Date timestamp for client-side usage) ===
export interface ClientAlertMessage extends Omit<AlertMessage, "timestamp"> {
  timestamp: Date;
}

// === History API Response ===
export const HistoryApiResponseSchema = z.object({
  messages: z.array(AlertMessageSchema),
  source: z.enum(["api", "cache"]),
  lastUpdate: z.string(),
  cacheStatus: z
    .object({
      cachedRegions: z.number(),
      pendingRegions: z.number(),
    })
    .optional(),
});

export type HistoryApiResponse = z.infer<typeof HistoryApiResponseSchema>;
