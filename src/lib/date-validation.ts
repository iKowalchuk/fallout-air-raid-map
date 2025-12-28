/**
 * Safe date parsing utility that never returns Invalid Date.
 * Returns null for invalid inputs instead of throwing or returning Invalid Date.
 * Accepts Date objects (returns them as-is if valid), strings, or null/undefined.
 */
export function safeParseDate(
  value: string | Date | null | undefined,
): Date | null {
  // Handle null/undefined
  if (value == null) return null;

  // Handle Date objects (already parsed, e.g., from cache restoration)
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }

  // Handle non-string types
  if (typeof value !== "string") return null;

  // Trim whitespace
  const trimmed = value.trim();
  if (trimmed === "") return null;

  // Attempt parsing
  const parsed = new Date(trimmed);

  // Check for Invalid Date
  if (Number.isNaN(parsed.getTime())) return null;

  return parsed;
}
