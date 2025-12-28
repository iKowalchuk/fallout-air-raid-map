export const POLLING_CONFIG = {
  // Active alerts polling interval (30 seconds)
  // alerts.in.ua allows 8-12 requests per minute
  ALERTS_INTERVAL_MS: 30_000,

  // History polling interval (60 seconds)
  HISTORY_INTERVAL_MS: 60_000,

  // Cache TTL for active alerts (30 seconds)
  ALERTS_CACHE_TTL_MS: 30_000,

  // Stale time for TanStack Query (slightly less than polling interval)
  ALERTS_STALE_TIME_MS: 25_000,
  HISTORY_STALE_TIME_MS: 55_000,

  // Cache TTL for history (6 hours - history doesn't change often)
  HISTORY_CACHE_TTL_MS: 6 * 60 * 60 * 1000,

  // Minimum interval between history fetches (2 req/min limit)
  HISTORY_MIN_FETCH_INTERVAL_MS: 35_000,

  // Maximum retry attempts for failed requests
  MAX_RETRY_ATTEMPTS: 3,
} as const;
