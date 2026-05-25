/**
 * Lightweight in-memory cache with TTL support.
 * Designed for single-process use; upgrade to Redis for multi-process/cluster.
 */
class MemoryCache {
  constructor() {
    this.store = new Map();
    // Periodic cleanup of expired entries every 60 seconds
    this._cleanupInterval = setInterval(() => this._cleanup(), 60_000);
    if (this._cleanupInterval.unref) this._cleanupInterval.unref();
  }

  /**
   * Get a cached value by key.
   * @param {string} key
   * @returns {*} cached value or undefined
   */
  get(key) {
    const entry = this.store.get(key);
    if (!entry) return undefined;
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return undefined;
    }
    return entry.value;
  }

  /**
   * Set a cached value with TTL.
   * @param {string} key
   * @param {*} value
   * @param {number} ttlSeconds - Time to live in seconds
   */
  set(key, value, ttlSeconds = 60) {
    this.store.set(key, {
      value,
      expiresAt: Date.now() + ttlSeconds * 1000,
    });
  }

  /**
   * Delete a specific key.
   * @param {string} key
   */
  del(key) {
    this.store.delete(key);
  }

  /**
   * Invalidate all keys matching a prefix.
   * @param {string} prefix
   */
  invalidatePrefix(prefix) {
    for (const key of this.store.keys()) {
      if (key.startsWith(prefix)) this.store.delete(key);
    }
  }

  /** Clear the entire cache. */
  clear() {
    this.store.clear();
  }

  /** Remove expired entries. */
  _cleanup() {
    const now = Date.now();
    for (const [key, entry] of this.store) {
      if (now > entry.expiresAt) this.store.delete(key);
    }
  }

  /** Graceful shutdown — stop the cleanup timer. */
  destroy() {
    clearInterval(this._cleanupInterval);
    this.store.clear();
  }
}

export const cache = new MemoryCache();
export default cache;
