import { z } from "zod";

// === Константи для API alerts.in.ua ===
export const API_ALERT_TYPES = [
  "air_raid",
  "artillery_shelling",
  "urban_fights",
  "chemical",
  "nuclear",
] as const;

// === Константи для внутрішнього використання ===
export const INTERNAL_ALERT_TYPES = [
  "air_raid",
  "uav",
  "missile",
  "artillery",
  "chemical",
  "nuclear",
  "urban_fights",
] as const;

export const LOCATION_TYPES = [
  "oblast",
  "raion",
  "hromada",
  "city",
  "unknown",
] as const;

export const MESSAGE_TYPES = [
  "alert_start",
  "alert_end",
  "uav_detected",
  "missile_detected",
  "info",
] as const;

// === Branded Types для type-safety ===
export const LocationUidSchema = z.string().brand<"LocationUid">();

export const AlertIdSchema = z.number().brand<"AlertId">();

// === DateTime валідація ===
// API може повертати дати з або без timezone offset
export const ISODateTimeSchema = z
  .string()
  .refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid datetime string",
  });
export const NullableISODateTimeSchema = ISODateTimeSchema.nullable();
