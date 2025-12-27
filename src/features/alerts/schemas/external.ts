import { z } from "zod";
import { API_ALERT_TYPES, LOCATION_TYPES } from "./constants";

// === Branded Types for type-safety ===
const LocationUidSchema = z.string().brand<"LocationUid">();
const AlertIdSchema = z.number().brand<"AlertId">();

// === DateTime validation ===
const ISODateTimeSchema = z
  .string()
  .refine((val) => !Number.isNaN(Date.parse(val)), {
    message: "Invalid datetime string",
  });
const NullableISODateTimeSchema = ISODateTimeSchema.nullable();

// === API types ===
const ApiAlertTypeSchema = z.enum(API_ALERT_TYPES);
export type ApiAlertType = z.infer<typeof ApiAlertTypeSchema>;

const LocationTypeSchema = z.enum(LOCATION_TYPES);

// === Alert Schema (alerts.in.ua) ===
const AlertsInUaAlertSchema = z.object({
  id: AlertIdSchema.describe("Unique alert identifier"),
  location_title: z.string().min(1).describe("Location name"),
  location_type: LocationTypeSchema.describe("Location type"),
  started_at: ISODateTimeSchema.describe("Alert start time"),
  finished_at: NullableISODateTimeSchema.describe("End time (null if active)"),
  updated_at: ISODateTimeSchema.optional().describe("DB update time"),
  alert_type: ApiAlertTypeSchema.describe("Alert type"),
  location_uid: LocationUidSchema.describe("Location UID"),
  location_oblast: z.string().min(1).optional().describe("Oblast name"),
  location_oblast_uid: z.number().optional(),
  location_raion: z.string().nullable().optional().describe("Raion name"),
  notes: z.string().nullable().optional().describe("Additional notes"),
  calculated: z
    .boolean()
    .nullable()
    .optional()
    .describe("Whether end time is calculated"),
});

export type AlertsInUaAlert = z.infer<typeof AlertsInUaAlertSchema>;

// === Meta Schema ===
const MetaSchema = z.object({
  last_updated_at: ISODateTimeSchema,
  type: z.string(),
});

// === Active Alerts Response (/v1/alerts/active.json) ===
export const AlertsInUaActiveResponseSchema = z.object({
  alerts: z.array(AlertsInUaAlertSchema),
  meta: MetaSchema,
  disclaimer: z.string().optional(),
});

// === History Response (/v1/regions/{uid}/alerts/{period}.json) ===
export const AlertsInUaHistoryResponseSchema = z.object({
  alerts: z.array(AlertsInUaAlertSchema),
  meta: MetaSchema,
  disclaimer: z.string().optional(),
});
