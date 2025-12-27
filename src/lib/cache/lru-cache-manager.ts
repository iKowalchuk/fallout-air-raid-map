/**
 * LRU Cache Manager with TTL support and automatic cleanup.
 * Edge runtime compatible (in-memory only, no external dependencies).
 */

export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  lastAccessed: number;
}

export interface LRUCacheConfig {
  maxSize: number;
  ttlMs: number;
  cleanupIntervalMs?: number;
}

export class LRUCacheManager<K extends string | number, V> {
  private cache: Map<K, CacheEntry<V>>;
  private config: Required<LRUCacheConfig>;
  private cleanupTimer: ReturnType<typeof setInterval> | null = null;

  constructor(config: LRUCacheConfig) {
    this.cache = new Map();
    this.config = {
      ...config,
      cleanupIntervalMs: config.cleanupIntervalMs ?? 5 * 60 * 1000, // 5 min default
    };

    this.startCleanupTimer();
  }

  set(key: K, value: V): void {
    const now = Date.now();

    // Evict LRU entry if at capacity
    if (this.cache.size >= this.config.maxSize && !this.cache.has(key)) {
      this.evictLRU();
    }

    this.cache.set(key, {
      data: value,
      timestamp: now,
      lastAccessed: now,
    });
  }

  get(key: K): V | null {
    const entry = this.cache.get(key);

    if (!entry) return null;

    // Check TTL
    const age = Date.now() - entry.timestamp;
    if (age >= this.config.ttlMs) {
      this.cache.delete(key);
      return null;
    }

    // Update access time for LRU
    entry.lastAccessed = Date.now();

    return entry.data;
  }

  has(key: K): boolean {
    return this.get(key) !== null;
  }

  delete(key: K): boolean {
    return this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    return this.cache.size;
  }

  /**
   * Get all keys that have valid (non-expired) entries.
   */
  getValidKeys(): K[] {
    const now = Date.now();
    const validKeys: K[] = [];

    for (const [key, entry] of this.cache.entries()) {
      const age = now - entry.timestamp;
      if (age < this.config.ttlMs) {
        validKeys.push(key);
      }
    }

    return validKeys;
  }

  /**
   * Get keys that have expired but are still in cache.
   */
  getStaleKeys(): K[] {
    const now = Date.now();
    const staleKeys: K[] = [];

    for (const [key, entry] of this.cache.entries()) {
      const age = now - entry.timestamp;
      if (age >= this.config.ttlMs) {
        staleKeys.push(key);
      }
    }

    return staleKeys;
  }

  private evictLRU(): void {
    let oldestKey: K | null = null;
    let oldestAccess = Number.POSITIVE_INFINITY;

    for (const [key, entry] of this.cache.entries()) {
      if (entry.lastAccessed < oldestAccess) {
        oldestAccess = entry.lastAccessed;
        oldestKey = key;
      }
    }

    if (oldestKey !== null) {
      this.cache.delete(oldestKey);
    }
  }

  private startCleanupTimer(): void {
    if (this.cleanupTimer) return;

    this.cleanupTimer = setInterval(() => {
      this.cleanup();
    }, this.config.cleanupIntervalMs);

    // Prevent timer from keeping process alive in Node
    if (typeof this.cleanupTimer === "object" && "unref" in this.cleanupTimer) {
      this.cleanupTimer.unref();
    }
  }

  private cleanup(): void {
    const staleKeys = this.getStaleKeys();
    for (const key of staleKeys) {
      this.cache.delete(key);
    }
  }

  destroy(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = null;
    }
    this.cache.clear();
  }
}
