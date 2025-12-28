// === API alerts.in.ua constants ===
export const API_ALERT_TYPES = [
  "air_raid",
  "artillery_shelling",
  "urban_fights",
  "chemical",
  "nuclear",
] as const;

// === Internal alert type constants ===
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
