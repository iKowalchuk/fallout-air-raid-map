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
 * Calculate alert periods from messages
 * Matches alert_start with corresponding alert_end for the same region
 */
function calculateAlertPeriods(messages: AlertMessage[]): AlertPeriod[] {
  const now = new Date();
  const alertStarts = messages.filter((m) => m.type === "alert_start");
  const alertEnds = messages.filter((m) => m.type === "alert_end");

  return alertStarts.map((start) => {
    const startTime = toDate(start.timestamp);
    const matchingEnd = alertEnds.find(
      (end) =>
        end.regionName === start.regionName &&
        toDate(end.timestamp) > startTime,
    );

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
 */
function filterTodayMessages(messages: AlertMessage[]): AlertMessage[] {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return messages.filter((m) => toDate(m.timestamp) >= todayStart);
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
