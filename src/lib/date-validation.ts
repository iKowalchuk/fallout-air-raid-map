/**
 * Safe date parsing utility that never returns Invalid Date.
 * Returns null for invalid inputs instead of throwing or returning Invalid Date.
 */
export function safeParseDate(
  dateString: string | null | undefined,
): Date | null {
  // Handle null/undefined
  if (dateString == null) return null;

  // Handle non-string types
  if (typeof dateString !== "string") return null;

  // Trim whitespace
  const trimmed = dateString.trim();
  if (trimmed === "") return null;

  // Attempt parsing
  const parsed = new Date(trimmed);

  // Check for Invalid Date
  if (Number.isNaN(parsed.getTime())) return null;

  return parsed;
}
