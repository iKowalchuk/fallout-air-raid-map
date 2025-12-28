import type { z } from "zod";
import {
  type AlertsApiResponse,
  AlertsApiResponseSchema,
  type HistoryApiResponse,
  HistoryApiResponseSchema,
} from "../schemas";

// API base path (proxied through Next.js API routes)
const ALERTS_API_BASE = "/api/alerts";

// Custom error class for API errors
class AlertsApiError extends Error {
  constructor(
    message: string,
    public readonly status?: number,
    public readonly code?: string,
  ) {
    super(message);
    this.name = "AlertsApiError";
  }
}

// Shared fetch wrapper with Zod validation
async function fetchWithValidation<T>(
  url: string,
  schema: z.ZodSchema<T>,
  options?: RequestInit,
): Promise<T> {
  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });

  if (!response.ok) {
    throw new AlertsApiError(`HTTP error: ${response.status}`, response.status);
  }

  const data: unknown = await response.json();
  const result = schema.safeParse(data);

  if (!result.success) {
    console.error("API validation error:", result.error.issues);
    throw new AlertsApiError(
      "Invalid API response format",
      undefined,
      "VALIDATION_ERROR",
    );
  }

  return result.data;
}

// Alerts API client
export const alertsApiClient = {
  // Fetch active alerts
  getActiveAlerts: (): Promise<AlertsApiResponse> =>
    fetchWithValidation(ALERTS_API_BASE, AlertsApiResponseSchema),

  // Fetch alert history
  getAlertHistory: (): Promise<HistoryApiResponse> =>
    fetchWithValidation(`${ALERTS_API_BASE}/history`, HistoryApiResponseSchema),
};
