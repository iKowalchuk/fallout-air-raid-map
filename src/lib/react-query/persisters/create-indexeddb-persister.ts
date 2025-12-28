import type {
  PersistedClient,
  Persister,
} from "@tanstack/react-query-persist-client";
import { del, get, set } from "idb-keyval";
import { dateAwareSerializer } from "@/lib/react-query/serializers/date-aware-serializer";

const CACHE_KEY = "fallout-air-raid-cache";

/**
 * Validates that the deserialized value has the required PersistedClient structure.
 */
function isValidPersistedClient(value: unknown): value is PersistedClient {
  return (
    typeof value === "object" &&
    value !== null &&
    "timestamp" in value &&
    "clientState" in value
  );
}

/**
 * Creates an IndexedDB-based persister for React Query cache.
 * Returns null on server-side or if IndexedDB is not supported.
 *
 * Features:
 * - Uses idb-keyval for simple IndexedDB access
 * - Custom Date serialization via dateAwareSerializer
 * - Graceful error handling with fallback to non-persistent mode
 */
export function createIndexedDBPersister(): Persister | null {
  if (typeof window === "undefined") {
    return null;
  }

  if (!("indexedDB" in window)) {
    console.warn(
      "[QueryPersister] IndexedDB not supported, cache will not persist",
    );
    return null;
  }

  return {
    persistClient: async (client: PersistedClient) => {
      try {
        const serialized = dateAwareSerializer.serialize(client);
        await set(CACHE_KEY, serialized);
      } catch (error) {
        console.error("[QueryPersister] Failed to persist cache:", error);
      }
    },
    restoreClient: async () => {
      try {
        const cached = await get<string>(CACHE_KEY);
        if (!cached) return undefined;

        const deserialized = dateAwareSerializer.deserialize(cached);

        if (!isValidPersistedClient(deserialized)) {
          console.warn("[QueryPersister] Invalid cache structure, clearing");
          await del(CACHE_KEY);
          return undefined;
        }

        return deserialized;
      } catch (error) {
        console.error("[QueryPersister] Failed to restore cache:", error);
        return undefined;
      }
    },
    removeClient: async () => {
      try {
        await del(CACHE_KEY);
      } catch (error) {
        console.error("[QueryPersister] Failed to remove cache:", error);
      }
    },
  };
}
