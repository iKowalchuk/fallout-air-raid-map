import { NextResponse } from "next/server";
import { POLLING_CONFIG } from "@/config/polling";
import {
  getAllUids,
  oblastNameToProjectRegionId,
  uidToProjectRegionId,
} from "@/data/region-mapping";
import {
  type AlertsInUaAlert,
  AlertsInUaHistoryResponseSchema,
  type HistoryApiResponse,
  type MessageType,
} from "@/schemas";

const API_BASE_URL = process.env.ALERTS_API_URL || "";
const API_TOKEN = process.env.ALERTS_API_TOKEN || "";

// Cache for history data
interface HistoryCache {
  alerts: AlertsInUaAlert[];
  timestamp: number;
}

interface AlertMessage {
  id: string;
  timestamp: Date;
  regionId: string;
  regionName: string;
  type: MessageType;
  message: string;
}

const historyCache = new Map<number, HistoryCache>();

// Retry tracking to prevent infinite queue growth
const retryCount = new Map<number, number>();

let lastFetchTime = 0;
let fetchQueue: number[] = [];
let isInitialized = false;

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
  // Determine project region ID (same logic as main alerts route)
  let projectRegionId: string | null = null;

  if (alert.location_type === "oblast") {
    // For oblast-level records, use location_uid directly
    projectRegionId = uidToProjectRegionId(alert.location_uid);
  } else {
    // For sub-oblast records (hromada, raion, city), use location_oblast name
    projectRegionId = oblastNameToProjectRegionId(alert.location_oblast);
  }

  if (!projectRegionId) return [];

  // Use original location_title for display (not oblast name)
  const regionName = alert.location_title;

  const messages: AlertMessage[] = [];

  // Alert start message
  if (alert.started_at) {
    messages.push({
      id: `${alert.id}-start`,
      timestamp: new Date(alert.started_at),
      regionId: projectRegionId,
      regionName,
      type: "alert_start",
      message: "Повітряна тривога!",
    });
  }

  // Alert end message (only if alert has ended)
  if (alert.finished_at) {
    messages.push({
      id: `${alert.id}-end`,
      timestamp: new Date(alert.finished_at),
      regionId: projectRegionId,
      regionName,
      type: "alert_end",
      message: "Відбій тривоги",
    });
  }

  return messages;
}

// Initialize fetch queue with all UIDs
function initializeFetchQueue(): void {
  if (!isInitialized) {
    fetchQueue = getAllUids().filter((uid) => {
      // Skip regions that already have fresh cache
      const cached = historyCache.get(uid);
      return (
        !cached ||
        Date.now() - cached.timestamp >= POLLING_CONFIG.HISTORY_CACHE_TTL_MS
      );
    });
    isInitialized = true;
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
    historyCache.set(uid, {
      alerts,
      timestamp: Date.now(),
    });
    lastFetchTime = Date.now();
    // Reset retry count on success
    retryCount.delete(uid);
  } catch (error) {
    console.error(`Failed to fetch history for region ${uid}:`, error);

    // Check retry count before re-queuing
    const attempts = retryCount.get(uid) || 0;
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

  // Initialize fetch queue
  initializeFetchQueue();

  // Try to fetch next region in background (rate-limited)
  tryFetchNextRegion().catch(console.error);

  // Collect all cached history
  const allMessages: AlertMessage[] = [];

  for (const [, cached] of historyCache.entries()) {
    if (!cached.alerts || !Array.isArray(cached.alerts)) continue;

    for (const alert of cached.alerts) {
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
      cachedRegions: historyCache.size,
      pendingRegions: fetchQueue.length,
    },
  };

  return NextResponse.json(responseData);
}
