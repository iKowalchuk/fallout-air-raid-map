import { NextResponse } from "next/server";
import {
  type AlertsInUaAlert,
  AlertsInUaHistoryResponseSchema,
  getAllUids,
  type HistoryApiResponse,
  type MessageType,
  oblastNameToProjectRegionId,
  POLLING_CONFIG,
  uidToProjectRegionId,
} from "@/features/alerts";
import { LRUCacheManager } from "@/lib/cache/lru-cache-manager";
import { safeParseDate } from "@/lib/date-validation";
import { serverEnv } from "@/lib/env";
import { fetchWithTimeout } from "@/lib/fetch-with-timeout";

const API_BASE_URL = serverEnv.ALERTS_API_URL;
const API_TOKEN = serverEnv.ALERTS_API_TOKEN;

interface AlertMessage {
  id: string;
  timestamp: Date;
  regionId: string;
  regionName: string;
  type: MessageType;
  message: string;
}

// LRU cache for history data with TTL and max size
const historyCache = new LRUCacheManager<number, AlertsInUaAlert[]>({
  maxSize: 35, // 27 regions + 8 buffer
  ttlMs: POLLING_CONFIG.HISTORY_CACHE_TTL_MS,
  cleanupIntervalMs: 30 * 60 * 1000, // Cleanup every 30 min
});

// LRU cache for retry counts
const retryCount = new LRUCacheManager<number, number>({
  maxSize: 27,
  ttlMs: 60 * 60 * 1000, // 1 hour TTL for retry counts
  cleanupIntervalMs: 15 * 60 * 1000, // Cleanup every 15 min
});

const allUids = getAllUids();

// Background fetch state
let isBackgroundFetchStarted = false;

// Fetch history for a single region
async function fetchRegionHistory(uid: number): Promise<AlertsInUaAlert[]> {
  const response = await fetchWithTimeout(
    `${API_BASE_URL}/v1/regions/${uid}/alerts/month_ago.json`,
    {
      headers: {
        Authorization: `Bearer ${API_TOKEN}`,
      },
      timeoutMs: 15_000, // 15s timeout for history (can be slower)
    },
  );

  if (!response.ok) {
    throw new Error(`History API error: ${response.status}`);
  }

  const rawData = await response.json();

  // Validate with zod
  const parseResult = AlertsInUaHistoryResponseSchema.safeParse(rawData);
  if (!parseResult.success) {
    console.error(
      `Invalid history response for region ${uid}:`,
      parseResult.error.issues,
    );
    return [];
  }

  return parseResult.data.alerts || [];
}

// Transform API alert to message format
function alertToMessages(alert: AlertsInUaAlert): AlertMessage[] {
  // Determine project region ID
  let projectRegionId: string | null = null;

  if (alert.location_type === "oblast") {
    projectRegionId = uidToProjectRegionId(alert.location_uid);
  } else {
    projectRegionId = oblastNameToProjectRegionId(alert.location_oblast);
  }

  if (!projectRegionId) return [];

  const regionName = alert.location_title;
  const messages: AlertMessage[] = [];

  // Alert start message - with safe date parsing
  if (alert.started_at) {
    const startDate = safeParseDate(alert.started_at);
    if (startDate) {
      messages.push({
        id: `${alert.id}-start`,
        timestamp: startDate,
        regionId: projectRegionId,
        regionName,
        type: "alert_start",
        message: "Повітряна тривога!",
      });
    }
  }

  // Alert end message (only if alert has ended) - with safe date parsing
  if (alert.finished_at) {
    const endDate = safeParseDate(alert.finished_at);
    if (endDate) {
      messages.push({
        id: `${alert.id}-end`,
        timestamp: endDate,
        regionId: projectRegionId,
        regionName,
        type: "alert_end",
        message: "Відбій тривоги",
      });
    }
  }

  return messages;
}

// Background fetch logic - fetches all regions with rate limiting
async function performBackgroundFetch(): Promise<void> {
  console.log("[history] Starting background fetch for all regions");

  // Build queue of regions needing data
  const regionsToFetch = allUids.filter((uid) => !historyCache.has(uid));

  for (const uid of regionsToFetch) {
    // Check if already cached (might have been fetched by another request)
    if (historyCache.has(uid)) continue;

    try {
      const alerts = await fetchRegionHistory(uid);
      historyCache.set(uid, alerts);
      console.log(
        `[history] Cached region ${uid}, total cached: ${allUids.filter((u) => historyCache.has(u)).length}/${allUids.length}`,
      );

      // Rate limiting between requests (required by API)
      await new Promise((resolve) =>
        setTimeout(resolve, POLLING_CONFIG.HISTORY_MIN_FETCH_INTERVAL_MS),
      );
    } catch (error) {
      console.error(`[history] Failed to fetch region ${uid}:`, error);
      const attempts = retryCount.get(uid) ?? 0;

      if (attempts < POLLING_CONFIG.MAX_RETRY_ATTEMPTS) {
        retryCount.set(uid, attempts + 1);
      }
    }
  }

  console.log("[history] Background fetch complete");
}

// Start background fetch if not already running (non-blocking)
function startBackgroundFetchIfNeeded(): void {
  if (isBackgroundFetchStarted) return;

  isBackgroundFetchStarted = true;

  // Check if all regions are cached
  const uncachedCount = allUids.filter((uid) => !historyCache.has(uid)).length;
  if (uncachedCount === 0) {
    console.log("[history] All regions already cached");
    return;
  }

  console.log(
    `[history] Starting background fetch for ${uncachedCount} regions`,
  );
  performBackgroundFetch().catch((error) => {
    console.error("[history] Background fetch error:", error);
  });
}

export async function GET() {
  // Environment validation happens at module load via serverEnv
  // This check handles the development fallback case
  if (!serverEnv.isValid) {
    console.error("Environment variables are not properly configured");
    return NextResponse.json(
      { error: "Server configuration error" },
      { status: 500 },
    );
  }

  // Start background fetch if needed (non-blocking)
  startBackgroundFetchIfNeeded();

  // Collect all cached history using valid keys from LRU cache
  const allMessages: AlertMessage[] = [];
  const cachedRegions = allUids.filter((uid) => historyCache.has(uid));

  for (const uid of cachedRegions) {
    const alerts = historyCache.get(uid);
    if (!alerts || !Array.isArray(alerts)) continue;

    for (const alert of alerts) {
      const messages = alertToMessages(alert);
      allMessages.push(...messages);
    }
  }

  // Sort by timestamp descending (newest first)
  allMessages.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

  const pendingRegions = allUids.length - cachedRegions.length;

  const responseData: HistoryApiResponse = {
    messages: allMessages.slice(0, 500).map((msg) => ({
      ...msg,
      timestamp: msg.timestamp.toISOString(),
    })),
    source: "api",
    lastUpdate: new Date().toISOString(),
    cacheStatus: {
      cachedRegions: cachedRegions.length,
      pendingRegions,
    },
  };

  const response = NextResponse.json(responseData);

  // Short cache time so client gets updates as more regions are fetched
  response.headers.set("Cache-Control", "public, max-age=10");

  return response;
}
