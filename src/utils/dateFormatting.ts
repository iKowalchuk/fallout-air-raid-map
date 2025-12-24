// Centralized date/time formatting utilities

/**
 * Format time as HH:MM:SS (Ukrainian locale)
 */
export function formatTime(date: Date): string {
  return date.toLocaleTimeString("uk-UA", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

/**
 * Format date as DD.MM.YYYY (Ukrainian locale)
 */
export function formatDate(date: Date): string {
  return date.toLocaleDateString("uk-UA", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

/**
 * Calculate days since war started (Feb 24, 2022)
 */
export function getWarDay(): number {
  const warStart = new Date("2022-02-24T00:00:00");
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - warStart.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}
