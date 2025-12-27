import { type NextRequest, NextResponse } from "next/server";
import {
  type AlertsApiResponse,
  AlertsInUaActiveResponseSchema,
  getHigherPriorityAlert,
  mapAlertType,
  oblastNameToProjectRegionId,
  POLLING_CONFIG,
  uidToProjectRegionId,
} from "@/features/alerts";

const API_BASE_URL = process.env.ALERTS_API_URL || "";
const API_TOKEN = process.env.ALERTS_API_TOKEN || "";

// Cache entry with Last-Modified tracking
interface CacheEntry {
  data: AlertsApiResponse;
  timestamp: number;
  lastModified: string | null;
}

let cache: CacheEntry | null = null;

export async function GET(request: NextRequest) {
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

  const clientIfModifiedSince = request.headers.get("If-Modified-Since");

  // Check cache freshness
  if (
    cache &&
    Date.now() - cache.timestamp < POLLING_CONFIG.ALERTS_CACHE_TTL_MS
  ) {
    // If client has up-to-date data, return 304
    if (clientIfModifiedSince && cache.lastModified === clientIfModifiedSince) {
      return new NextResponse(null, { status: 304 });
    }

    const response = NextResponse.json(cache.data);
    if (cache.lastModified) {
      response.headers.set("Last-Modified", cache.lastModified);
    }
    response.headers.set(
      "Cache-Control",
      `public, max-age=${Math.floor(POLLING_CONFIG.ALERTS_CACHE_TTL_MS / 1000)}`,
    );
    return response;
  }

  try {
    const headers: HeadersInit = {
      Authorization: `Bearer ${API_TOKEN}`,
    };

    // Forward If-Modified-Since to upstream if we have cached data
    if (cache?.lastModified) {
      headers["If-Modified-Since"] = cache.lastModified;
    }

    const upstreamResponse = await fetch(
      `${API_BASE_URL}/v1/alerts/active.json`,
      { headers },
    );

    // Handle 304 from upstream
    if (upstreamResponse.status === 304 && cache) {
      cache.timestamp = Date.now();
      const response = NextResponse.json(cache.data);
      if (cache.lastModified) {
        response.headers.set("Last-Modified", cache.lastModified);
      }
      response.headers.set(
        "Cache-Control",
        `public, max-age=${Math.floor(POLLING_CONFIG.ALERTS_CACHE_TTL_MS / 1000)}`,
      );
      return response;
    }

    if (!upstreamResponse.ok) {
      throw new Error(`API error: ${upstreamResponse.status}`);
    }

    const rawData = await upstreamResponse.json();

    // Validate API response with zod
    const parseResult = AlertsInUaActiveResponseSchema.safeParse(rawData);
    if (!parseResult.success) {
      console.error("Invalid API response:", parseResult.error.issues);
      throw new Error("Invalid API response format");
    }

    const apiData = parseResult.data;

    // Aggregate all active alerts to oblast level with priority-based selection
    const oblastAlerts = new Map<
      string,
      { alertType: string; startTime: string | null }
    >();

    for (const alert of apiData.alerts) {
      // Only active alerts (finished_at === null)
      if (alert.finished_at !== null) continue;

      // Determine project region ID
      let projectRegionId: string | null = null;

      if (alert.location_type === "oblast") {
        projectRegionId = uidToProjectRegionId(alert.location_uid);
      } else {
        projectRegionId = oblastNameToProjectRegionId(alert.location_oblast);
      }

      if (!projectRegionId) continue;

      const candidateAlert = {
        alertType: alert.alert_type,
        startTime: alert.started_at || null,
      };

      // CRITICAL FIX: Use priority-based aggregation instead of first-wins
      // Priority: nuclear > chemical > artillery > urban_fights > air_raid
      const existing = oblastAlerts.get(projectRegionId);

      if (!existing) {
        oblastAlerts.set(projectRegionId, candidateAlert);
      } else {
        // Compare and keep higher priority alert
        const higherPriority = getHigherPriorityAlert(existing, candidateAlert);
        oblastAlerts.set(projectRegionId, higherPriority);
      }
    }

    // Convert Map to alerts array
    const alerts = Array.from(oblastAlerts.entries()).map(
      ([regionId, data]) => ({
        regionId,
        isActive: true,
        alertType: mapAlertType(data.alertType),
        startTime: data.startTime,
      }),
    );

    const responseData: AlertsApiResponse = {
      alerts,
      source: "api",
      lastUpdate: apiData.meta?.last_updated_at || new Date().toISOString(),
    };

    // Update cache
    const lastModified = upstreamResponse.headers.get("Last-Modified");
    cache = {
      data: responseData,
      timestamp: Date.now(),
      lastModified,
    };

    const response = NextResponse.json(responseData);
    if (lastModified) {
      response.headers.set("Last-Modified", lastModified);
    }
    response.headers.set(
      "Cache-Control",
      `public, max-age=${Math.floor(POLLING_CONFIG.ALERTS_CACHE_TTL_MS / 1000)}`,
    );

    return response;
  } catch (error) {
    console.error("Failed to fetch from alerts.in.ua API:", error);

    // If we have cached data, return it even if expired
    if (cache) {
      const response = NextResponse.json({
        ...cache.data,
        source: "cache",
        error: "API unavailable, using cached data",
      } satisfies AlertsApiResponse);
      if (cache.lastModified) {
        response.headers.set("Last-Modified", cache.lastModified);
      }
      return response;
    }

    // No cached data available - return empty response
    return NextResponse.json({
      alerts: [],
      source: "cache",
      lastUpdate: new Date().toISOString(),
      error: "Failed to fetch alerts and no cached data available",
    } satisfies AlertsApiResponse);
  }
}
