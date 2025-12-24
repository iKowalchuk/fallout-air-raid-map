import { NextResponse } from "next/server";
import { uidToProjectRegionId, OCCUPIED_REGIONS } from "@/data/regionMapping";
import {
  AlertsInUaActiveResponseSchema,
  mapAlertType,
  type AlertType,
  type AlertsApiResponse,
} from "@/schemas";
import { POLLING_CONFIG } from "@/config/polling";

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

    // Filter only oblast-level alerts and transform to project format
    const alerts = apiData.alerts
      .filter((alert) => alert.location_type === "oblast")
      .map((alert) => {
        const projectRegionId = uidToProjectRegionId(alert.location_uid);
        if (!projectRegionId) return null;

        return {
          regionId: projectRegionId,
          isActive: alert.finished_at === null,
          alertType: mapAlertType(alert.alert_type),
          startTime: alert.started_at || null,
        };
      })
      .filter((alert): alert is NonNullable<typeof alert> => alert !== null);

    // Get set of regions that already have alerts
    const alertedRegionIds = new Set(alerts.map((a) => a.regionId));

    // Add occupied territories that don't already have alerts from API
    const occupiedAlerts = OCCUPIED_REGIONS.filter(
      (regionId) => !alertedRegionIds.has(regionId),
    ).map((regionId) => ({
      regionId,
      isActive: true,
      alertType: "air_raid" as AlertType,
      startTime: null,
    }));

    const allAlerts = [...alerts, ...occupiedAlerts];

    const responseData: AlertsApiResponse = {
      alerts: allAlerts,
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
