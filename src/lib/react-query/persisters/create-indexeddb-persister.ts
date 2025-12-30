import type {
  PersistedClient,
  Persister,
} from "@tanstack/react-query-persist-client";
import { del, get, set } from "idb-keyval";
import { dateAwareSerializer } from "@/lib/react-query/serializers/date-aware-serializer";

const CACHE_KEY = "fallout-air-raid-cache";

/**
 * Extended Persister interface with flush capability for lifecycle events.
 */
export interface EnhancedPersister extends Persister {
  /**
   * Immediately flushes any pending writes to IndexedDB.
   * Waits for any in-progress write to complete first.
   * Used by lifecycle hooks to ensure data is persisted before tab suspension.
   */
  flush: () => Promise<void>;
}

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
 * - Flush method for lifecycle-based persistence (mobile Safari)
 */
export function createIndexedDBPersister(): EnhancedPersister | null {
  if (typeof window === "undefined") {
    return null;
  }

  if (!("indexedDB" in window)) {
    console.warn(
      "[QueryPersister] IndexedDB not supported, cache will not persist",
    );
    return null;
  }

  // Track pending write for flush capability
  let pendingWrite: string | null = null;
  let currentWritePromise: Promise<void> | null = null;

  /**
   * Executes the actual write to IndexedDB.
   * Returns a promise that resolves when the write completes.
   */
  async function executeWrite(): Promise<void> {
    if (pendingWrite === null) {
      return;
    }

    const dataToWrite = pendingWrite;
    pendingWrite = null;

    try {
      await set(CACHE_KEY, dataToWrite);
    } catch (error) {
      console.error("[QueryPersister] Failed to write cache:", error);
      // Don't restore failed data - next write will have latest state
    }

    // Process any writes that were queued during this write
    if (pendingWrite !== null) {
      await executeWrite();
    }
  }

  /**
   * Starts a write operation, ensuring only one runs at a time.
   * Returns the promise for the current write operation.
   */
  function startWrite(): Promise<void> {
    if (currentWritePromise === null) {
      currentWritePromise = executeWrite().finally(() => {
        currentWritePromise = null;
      });
    }
    return currentWritePromise;
  }

  return {
    persistClient: async (client: PersistedClient) => {
      try {
        const serialized = dateAwareSerializer.serialize(client);
        pendingWrite = serialized;
        await startWrite();
      } catch (error) {
        console.error("[QueryPersister] Failed to queue cache write:", error);
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

    flush: async () => {
      // Wait for any in-progress write to complete first
      if (currentWritePromise !== null) {
        await currentWritePromise;
      }

      // Then flush any pending data
      if (pendingWrite !== null) {
        await startWrite();
      }
    },
  };
}
