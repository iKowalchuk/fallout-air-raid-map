import { NextResponse } from "next/server";
import { POLLING_CONFIG } from "@/config/polling";
import {
  oblastNameToProjectRegionId,
  uidToProjectRegionId,
} from "@/data/region-mapping";
import {
  type AlertsApiResponse,
  AlertsInUaActiveResponseSchema,
  mapAlertType,
} from "@/schemas";

const API_BASE_URL = process.env.ALERTS_API_URL || "";
const API_TOKEN = process.env.ALERTS_API_TOKEN || "";

// Response caching to avoid rate limits
let cachedData: { data: AlertsApiResponse; timestamp: number } | null = null;

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

  // Check cache
  if (
    cachedData &&
    Date.now() - cachedData.timestamp < POLLING_CONFIG.ALERTS_CACHE_TTL_MS
  ) {
    return NextResponse.json(cachedData.data);
  }

  try {
    const response = await fetch(`${API_BASE_URL}/v1/alerts/active.json`, {
      headers: {
        Authorization: `Bearer ${API_TOKEN}`,
      },
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const rawData = await response.json();

    // Validate API response with zod
    const parseResult = AlertsInUaActiveResponseSchema.safeParse(rawData);
    if (!parseResult.success) {
      console.error("Invalid API response:", parseResult.error.issues);
      throw new Error("Invalid API response format");
    }

    const apiData = parseResult.data;

    // Aggregate all active alerts to oblast level using oblast name
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
        // For oblast-level records, use location_uid directly
        projectRegionId = uidToProjectRegionId(alert.location_uid);
      } else {
        // For sub-oblast records (hromada, raion, city), use location_oblast name
        projectRegionId = oblastNameToProjectRegionId(alert.location_oblast);
      }

      if (!projectRegionId) continue;

      // Store the first (oldest) alert for the oblast
      if (!oblastAlerts.has(projectRegionId)) {
        oblastAlerts.set(projectRegionId, {
          alertType: alert.alert_type,
          startTime: alert.started_at || null,
        });
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
    cachedData = {
      data: responseData,
      timestamp: Date.now(),
    };

    return NextResponse.json(responseData);
  } catch (error) {
    console.error("Failed to fetch from alerts.in.ua API:", error);

    // If we have cached data, return it even if expired
    if (cachedData) {
      return NextResponse.json({
        ...cachedData.data,
        source: "cache",
        error: "API unavailable, using cached data",
      } satisfies AlertsApiResponse);
    }

    // No cached data available - return empty response with cache source
    return NextResponse.json({
      alerts: [],
      source: "cache",
      lastUpdate: new Date().toISOString(),
      error: "Failed to fetch alerts and no cached data available",
    } satisfies AlertsApiResponse);
  }
}
