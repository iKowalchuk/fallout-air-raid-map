import { safeParseDate } from "@/lib/date-validation";
import type { ApiAlertType } from "../schemas/external";

/**
 * Alert severity levels (higher = more severe).
 * Used for priority-based aggregation when multiple alerts affect same region.
 */
const ALERT_SEVERITY: Record<ApiAlertType, number> = {
  nuclear: 5,
  chemical: 4,
  artillery_shelling: 3,
  urban_fights: 2,
  air_raid: 1,
};

const DEFAULT_SEVERITY = 0; // For unknown types

function getAlertSeverity(alertType: string): number {
  return ALERT_SEVERITY[alertType as ApiAlertType] ?? DEFAULT_SEVERITY;
}

export interface AlertData {
  alertType: string;
  startTime: string | null;
}

/**
 * Compare two alerts and return the higher priority one.
 * Priority rules:
 * 1. Higher severity wins
 * 2. If same severity, earlier start time wins
 * 3. If no start time, current alert wins (defensive)
 */
export function getHigherPriorityAlert(
  current: AlertData,
  candidate: AlertData,
): AlertData {
  const currentSeverity = getAlertSeverity(current.alertType);
  const candidateSeverity = getAlertSeverity(candidate.alertType);

  // Higher severity wins
  if (candidateSeverity > currentSeverity) {
    return candidate;
  }

  if (candidateSeverity < currentSeverity) {
    return current;
  }

  // Same severity - earlier start time wins
  if (current.startTime && candidate.startTime) {
    const currentTime = safeParseDate(current.startTime)?.getTime();
    const candidateTime = safeParseDate(candidate.startTime)?.getTime();

    if (currentTime && candidateTime && candidateTime < currentTime) {
      return candidate;
    }
  }

  // If candidate has time but current doesn't, candidate wins
  if (candidate.startTime && !current.startTime) {
    return candidate;
  }

  // Default: keep current
  return current;
}
