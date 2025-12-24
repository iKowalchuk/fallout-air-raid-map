import { AlertState } from "@/types";

// Mock active alerts - simulating current situation
export const MOCK_ALERTS: AlertState[] = [
  { regionId: "kharkiv", isActive: true, alertType: "air_raid", startTime: new Date() },
  { regionId: "donetsk", isActive: true, alertType: "air_raid", startTime: new Date() },
  { regionId: "luhansk", isActive: true, alertType: "air_raid", startTime: new Date() },
  { regionId: "zaporizhzhia", isActive: true, alertType: "uav", startTime: new Date() },
  { regionId: "dnipro", isActive: true, alertType: "uav", startTime: new Date() },
  { regionId: "kherson", isActive: true, alertType: "missile", startTime: new Date() },
  { regionId: "mykolaiv", isActive: true, alertType: "uav", startTime: new Date() },
  { regionId: "odesa", isActive: true, alertType: "uav", startTime: new Date() },
  { regionId: "poltava", isActive: true, alertType: "air_raid", startTime: new Date() },
  { regionId: "sumy", isActive: true, alertType: "air_raid", startTime: new Date() },
  { regionId: "chernihiv", isActive: true, alertType: "uav", startTime: new Date() },
  { regionId: "kyiv-city", isActive: true, alertType: "missile", startTime: new Date() },
  { regionId: "kyiv-oblast", isActive: true, alertType: "missile", startTime: new Date() },
  // Occupied territories - permanent alert
  { regionId: "crimea", isActive: true, alertType: "air_raid", startTime: null },
  { regionId: "sevastopol", isActive: true, alertType: "air_raid", startTime: null },
];

export function getInitialAlertMap(): Map<string, AlertState> {
  const map = new Map<string, AlertState>();
  MOCK_ALERTS.forEach(alert => map.set(alert.regionId, alert));
  return map;
}

export function isRegionAlert(regionId: string): boolean {
  return MOCK_ALERTS.some(alert => alert.regionId === regionId && alert.isActive);
}

export function getAlertedRegionIds(): string[] {
  return MOCK_ALERTS.filter(a => a.isActive).map(a => a.regionId);
}

export function countActiveAlerts(): number {
  return MOCK_ALERTS.filter(a => a.isActive).length;
}
