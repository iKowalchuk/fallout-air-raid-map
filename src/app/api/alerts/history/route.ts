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

const API_BASE_URL = process.env.ALERTS_API_URL || "";
const API_TOKEN = process.env.ALERTS_API_TOKEN || "";

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

let lastFetchTime = 0;
let fetchQueue: number[] = [];

// Initialization state tracking with Promise-based lock to prevent race conditions
interface InitializationState {
  isComplete: boolean;
  completedCount: number;
  totalCount: number;
  initPromise: Promise<void> | null;
}

const allUids = getAllUids();

const initState: InitializationState = {
  isComplete: false,
  completedCount: 0,
  totalCount: allUids.length,
  initPromise: null,
};

// Minimum regions to fetch before responding (25% threshold)
const MIN_INIT_REGIONS = Math.ceil(allUids.length * 0.25);

// Fetch history for a single region
async function fetchRegionHistory(uid: number): Promise<AlertsInUaAlert[]> {
  const response = await fetch(
    `${API_BASE_URL}/v1/regions/${uid}/alerts/month_ago.json`,
    {
      headers: {
        Authorization: `Bearer ${API_TOKEN}`,
      },
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

// Internal initialization logic (separated for Promise-based lock pattern)
async function performInitialization(): Promise<void> {
  // Build queue of regions needing data
  fetchQueue = allUids.filter((uid) => !historyCache.has(uid));

  // Fetch minimum number of regions synchronously
  const minFetchCount = Math.min(MIN_INIT_REGIONS, fetchQueue.length);

  for (let i = 0; i < minFetchCount; i++) {
    const uid = fetchQueue.shift();
    if (!uid) break;

    try {
      const alerts = await fetchRegionHistory(uid);
      historyCache.set(uid, alerts);
      lastFetchTime = Date.now();
      initState.completedCount++;

      // Rate limiting between requests
      if (i < minFetchCount - 1) {
        await new Promise((resolve) =>
          setTimeout(resolve, POLLING_CONFIG.HISTORY_MIN_FETCH_INTERVAL_MS),
        );
      }
    } catch (error) {
      console.error(`Failed to fetch history for region ${uid}:`, error);
      const attempts = retryCount.get(uid) ?? 0;

      if (attempts < POLLING_CONFIG.MAX_RETRY_ATTEMPTS) {
        retryCount.set(uid, attempts + 1);
        fetchQueue.push(uid); // Re-queue
      }
    }
  }

  initState.isComplete = initState.completedCount >= MIN_INIT_REGIONS;
}

// Initialize and fetch minimum regions before responding
// Uses Promise-based lock to prevent race conditions with concurrent requests
async function ensureInitialization(): Promise<void> {
  // Already initialized
  if (initState.isComplete) {
    return;
  }

  // If initialization is in progress, wait for it to complete
  if (initState.initPromise) {
    await initState.initPromise;
    return;
  }

  // Start initialization and store the Promise for concurrent callers
  initState.initPromise = performInitialization();

  try {
    await initState.initPromise;
  } finally {
    // Clear the Promise after completion (allows re-init if needed)
    initState.initPromise = null;
  }
}

// Try to fetch one region from the queue (respecting rate limits)
async function tryFetchNextRegion(): Promise<void> {
  if (fetchQueue.length === 0) return;
  if (Date.now() - lastFetchTime < POLLING_CONFIG.HISTORY_MIN_FETCH_INTERVAL_MS)
    return;

  const uid = fetchQueue.shift();
  if (!uid) return;

  try {
    const alerts = await fetchRegionHistory(uid);
    historyCache.set(uid, alerts);
    lastFetchTime = Date.now();
    retryCount.delete(uid);
  } catch (error) {
    console.error(`Failed to fetch history for region ${uid}:`, error);

    const attempts = retryCount.get(uid) ?? 0;
    if (attempts < POLLING_CONFIG.MAX_RETRY_ATTEMPTS) {
      retryCount.set(uid, attempts + 1);
      fetchQueue.push(uid);
    } else {
      console.warn(
        `Skipping region ${uid} after ${POLLING_CONFIG.MAX_RETRY_ATTEMPTS} failed attempts`,
      );
      retryCount.delete(uid);
    }
  }
}

// Check for stale cache entries and queue for refresh
function queueStaleEntriesForRefresh(): void {
  const staleUids = allUids.filter((uid) => !historyCache.has(uid));

  // Add stale UIDs to queue if not already present
  for (const uid of staleUids) {
    if (!fetchQueue.includes(uid)) {
      fetchQueue.push(uid);
    }
  }
}

export async function GET() {
  // Validate API configuration
  if (!API_BASE_URL) {
    console.error("ALERTS_API_URL is not configured");
    return NextResponse.json(
      { error: "ALERTS_API_URL is not configured" },
      { status: 500 },
    );
  }

  if (!API_TOKEN) {
    console.error("ALERTS_API_TOKEN is not configured");
    return NextResponse.json(
      { error: "ALERTS_API_TOKEN is not configured" },
      { status: 500 },
    );
  }

  // CRITICAL FIX: Wait for minimum initialization before responding
  await ensureInitialization();

  // Check for stale entries and queue for refresh
  queueStaleEntriesForRefresh();

  // Try to fetch next region in background (rate-limited)
  tryFetchNextRegion().catch(console.error);

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

  const responseData: HistoryApiResponse = {
    messages: allMessages.slice(0, 500).map((msg) => ({
      ...msg,
      timestamp: msg.timestamp.toISOString(),
    })),
    source: "api",
    lastUpdate: new Date().toISOString(),
    cacheStatus: {
      cachedRegions: cachedRegions.length,
      pendingRegions: fetchQueue.length,
    },
  };

  const response = NextResponse.json(responseData);
  response.headers.set("Cache-Control", "public, max-age=30");

  return response;
}
