import { z } from "zod";
import {
  AlertIdSchema,
  API_ALERT_TYPES,
  ISODateTimeSchema,
  LOCATION_TYPES,
  LocationUidSchema,
  NullableISODateTimeSchema,
} from "./common";

// === Типи alerts.in.ua API ===
const ApiAlertTypeSchema = z.enum(API_ALERT_TYPES);
export type ApiAlertType = z.infer<typeof ApiAlertTypeSchema>;

const LocationTypeSchema = z.enum(LOCATION_TYPES);

// === Alert Schema (alerts.in.ua) ===
const AlertsInUaAlertSchema = z.object({
  id: AlertIdSchema.describe("Унікальний ідентифікатор тривоги"),
  location_title: z.string().min(1).describe("Назва локації"),
  location_type: LocationTypeSchema.describe("Тип локації"),
  started_at: ISODateTimeSchema.describe("Час початку тривоги"),
  finished_at: NullableISODateTimeSchema.describe(
    "Час закінчення (null якщо активна)",
  ),
  updated_at: ISODateTimeSchema.optional().describe("Час оновлення в БД"),
  alert_type: ApiAlertTypeSchema.describe("Тип тривоги"),
  location_uid: LocationUidSchema.describe("UID локації"),
  location_oblast: z.string().min(1).optional().describe("Назва області"),
  location_oblast_uid: z.number().optional(),
  location_raion: z.string().nullable().optional().describe("Назва району"),
  notes: z.string().nullable().optional().describe("Додаткові примітки"),
  calculated: z
    .boolean()
    .nullable()
    .optional()
    .describe("Чи час закінчення розрахований"),
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
