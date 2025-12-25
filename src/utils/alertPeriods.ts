// Centralized alert period calculation utilities

export interface AlertMessage {
  id: string;
  timestamp: Date;
  regionId: string;
  regionName: string;
  type:
    | "alert_start"
    | "alert_end"
    | "uav_detected"
    | "missile_detected"
    | "info";
  message: string;
}

export interface AlertPeriod {
  startTime: Date;
  endTime: Date | null; // null means ongoing
  regionId: string;
  regionName: string;
  durationMs: number;
  isActive: boolean;
}

export interface TimelinePeriod {
  start: number; // percentage (0-100)
  end: number; // percentage (0-100)
  regionName: string;
  isActive: boolean;
}

/**
 * Helper to get timestamp as Date object (defined before usage)
 */
function toDate(timestamp: Date | string): Date {
  return timestamp instanceof Date ? timestamp : new Date(timestamp);
}

/**
 * Extract base alert ID from message ID
 * Message IDs are formatted as "{alertId}-start" or "{alertId}-end"
 * Active alerts have format "active-{regionId}"
 */
function getBaseAlertId(messageId: string): string {
  return messageId.replace(/-start$/, "").replace(/-end$/, "");
}

/**
 * Calculate alert periods from messages
 * Matches alert_start with corresponding alert_end by alert ID or region
 */
function calculateAlertPeriods(messages: AlertMessage[]): AlertPeriod[] {
  const now = new Date();
  const alertStarts = messages.filter((m) => m.type === "alert_start");
  const alertEnds = messages.filter((m) => m.type === "alert_end");

  // Track used alert_end IDs to avoid double-matching
  const usedEndIds = new Set<string>();

  return alertStarts.map((start) => {
    const startTime = toDate(start.timestamp);
    const baseId = getBaseAlertId(start.id);
    const isActiveAlert = start.id.startsWith("active-");

    let matchingEnd: AlertMessage | undefined;

    if (isActiveAlert) {
      // For active alerts (id: "active-regionId"), find the most recent alert_end
      // for the same region that happened AFTER the start time
      matchingEnd = alertEnds
        .filter(
          (end) =>
            !usedEndIds.has(end.id) &&
            end.regionId === start.regionId &&
            toDate(end.timestamp) > startTime,
        )
        .sort(
          (a, b) =>
            toDate(a.timestamp).getTime() - toDate(b.timestamp).getTime(),
        )[0]; // Get the earliest end after start
    } else {
      // For history messages, match by alert ID
      matchingEnd = alertEnds.find(
        (end) => !usedEndIds.has(end.id) && getBaseAlertId(end.id) === baseId,
      );
    }

    if (matchingEnd) {
      usedEndIds.add(matchingEnd.id);
    }

    const endTime = matchingEnd ? toDate(matchingEnd.timestamp) : null;
    const effectiveEndTime = endTime || now;
    const durationMs = effectiveEndTime.getTime() - startTime.getTime();

    return {
      startTime,
      endTime,
      regionId: start.regionId,
      regionName: start.regionName,
      durationMs,
      isActive: !matchingEnd,
    };
  });
}

/**
 * Filter messages to only include today's messages
 * Only shows alerts that STARTED today (after 00:00)
 */
function filterTodayMessages(messages: AlertMessage[]): AlertMessage[] {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  // Only include messages from today
  return messages.filter((msg) => toDate(msg.timestamp) >= todayStart);
}

/**
 * Calculate today's alert periods
 */
export function calculateTodayAlertPeriods(
  messages: AlertMessage[],
): AlertPeriod[] {
  const todayMessages = filterTodayMessages(messages);
  return calculateAlertPeriods(todayMessages);
}

/**
 * Convert alert periods to timeline format (percentages for 24h display)
 */
export function convertToTimelinePeriods(
  periods: AlertPeriod[],
): TimelinePeriod[] {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const dayMs = 24 * 60 * 60 * 1000;

  return periods.map((period) => {
    const startMs = period.startTime.getTime() - todayStart.getTime();
    const endMs = period.endTime
      ? period.endTime.getTime() - todayStart.getTime()
      : now.getTime() - todayStart.getTime();

    return {
      start: Math.max((startMs / dayMs) * 100, 0),
      end: Math.min((endMs / dayMs) * 100, 100),
      regionName: period.regionName,
      isActive: period.isActive,
    };
  });
}
