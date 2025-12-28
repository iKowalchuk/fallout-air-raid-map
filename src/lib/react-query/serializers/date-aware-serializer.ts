import { safeParseDate } from "@/lib/date-validation";

/**
 * Custom serializer for React Query cache persistence.
 * Handles Date objects by converting to/from ISO strings with marker objects.
 *
 * Uses a marker pattern ({ __DATE__: "..." }) to distinguish Date strings
 * from regular strings during deserialization.
 */

const DATE_MARKER = "__DATE__";

interface SerializedDate {
  [DATE_MARKER]: string;
}

function isSerializedDate(value: unknown): value is SerializedDate {
  return (
    typeof value === "object" &&
    value !== null &&
    DATE_MARKER in value &&
    typeof (value as SerializedDate)[DATE_MARKER] === "string"
  );
}

/**
 * Serializes cache data, converting Date objects to marked ISO strings.
 * Uses JSON.stringify with a replacer function for deep transformation.
 */
function serialize(value: unknown): string {
  return JSON.stringify(value, (_, val: unknown) => {
    if (val instanceof Date) {
      return { [DATE_MARKER]: val.toISOString() };
    }
    return val;
  });
}

/**
 * Deserializes cache data, restoring Date objects from marked strings.
 * Uses JSON.parse with a reviver function for deep transformation.
 */
function deserialize(value: string): unknown {
  return JSON.parse(value, (_, val: unknown) => {
    if (isSerializedDate(val)) {
      return safeParseDate(val[DATE_MARKER]);
    }
    return val;
  });
}

export const dateAwareSerializer = {
  serialize,
  deserialize,
};
