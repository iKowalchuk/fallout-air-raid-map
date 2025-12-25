"use client";

import { useState, useEffect, useCallback } from "react";
import { parseHistoryResponse, type MessageType } from "@/schemas";
import { POLLING_CONFIG } from "@/config/polling";

// Local alert message type with Date instead of string for timestamp
interface AlertMessage {
  id: string;
  timestamp: Date;
  regionId: string;
  regionName: string;
  type: MessageType;
  message: string;
}

// Cache status for tracking region loading progress
export interface CacheStatus {
  cachedRegions: number;
  pendingRegions: number;
  totalRegions: number;
  isComplete: boolean;
}

interface UseAlertHistoryResult {
  messages: AlertMessage[];
  isLoading: boolean;
  error: string | null;
  source: "api" | "cache" | null;
  lastUpdate: Date | null;
  cacheStatus: CacheStatus | null;
  refetch: () => void;
}

// Valid message types for validation
const VALID_MESSAGE_TYPES: MessageType[] = [
  "alert_start",
  "alert_end",
  "uav_detected",
  "missile_detected",
  "info",
];

function isValidMessageType(type: string): type is MessageType {
  return VALID_MESSAGE_TYPES.includes(type as MessageType);
}

export function useAlertHistory(): UseAlertHistoryResult {
  const [messages, setMessages] = useState<AlertMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [source, setSource] = useState<"api" | "cache" | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [cacheStatus, setCacheStatus] = useState<CacheStatus | null>(null);

  const fetchHistory = useCallback(async () => {
    try {
      const response = await fetch("/api/alerts/history");
      if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
      }

      const rawData = await response.json();

      // Validate response with zod
      const parseResult = parseHistoryResponse(rawData);
      if (!parseResult.success) {
        console.error("Invalid API response:", parseResult.error.issues);
        throw new Error("Invalid API response format");
      }

      const data = parseResult.data;
      // Transform timestamps from ISO strings to Date objects with type validation
      const transformedMessages: AlertMessage[] = data.messages.map((msg) => ({
        id: msg.id,
        timestamp: new Date(msg.timestamp),
        regionId: msg.regionId,
        regionName: msg.regionName,
        type: isValidMessageType(msg.type) ? msg.type : "info",
        message: msg.message,
      }));

      setMessages(transformedMessages);
      setSource(data.source);
      setLastUpdate(new Date(data.lastUpdate));
      setError(null);
      setIsLoading(false);

      // Extract and set cache status
      if (data.cacheStatus) {
        const totalRegions =
          data.cacheStatus.cachedRegions + data.cacheStatus.pendingRegions;
        setCacheStatus({
          cachedRegions: data.cacheStatus.cachedRegions,
          pendingRegions: data.cacheStatus.pendingRegions,
          totalRegions,
          isComplete: data.cacheStatus.pendingRegions === 0,
        });
      }
    } catch (err) {
      console.error("Failed to fetch alert history:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch history");
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // Initial fetch
    fetchHistory();

    // Set up polling
    const pollInterval = setInterval(
      fetchHistory,
      POLLING_CONFIG.HISTORY_INTERVAL_MS,
    );

    return () => {
      clearInterval(pollInterval);
    };
  }, [fetchHistory]);

  return {
    messages,
    isLoading,
    error,
    source,
    lastUpdate,
    cacheStatus,
    refetch: fetchHistory,
  };
}
