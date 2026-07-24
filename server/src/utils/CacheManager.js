/**
 * CacheManager.js
 * In-Memory TTL Cache Engine with Hit/Miss Metrics & Eviction Strategy.
 * High-performance caching for Public Verification, Scope Resolutions, and Preferences.
 */

class CacheManager {
  constructor(defaultTTLMs = 60000) {
    this.cache = new Map();
    this.defaultTTLMs = defaultTTLMs;
    this.stats = {
      hits: 0,
      misses: 0,
      keysCount: 0,
    };
  }

  /**
   * Set cache entry
   */
  set(key, value, ttlMs = this.defaultTTLMs) {
    const expiresAt = Date.now() + ttlMs;
    this.cache.set(key, { value, expiresAt });
    this.stats.keysCount = this.cache.size;
  }

  /**
   * Get cache entry
   */
  get(key) {
    const entry = this.cache.get(key);
    if (!entry) {
      this.stats.misses++;
      return null;
    }

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      this.stats.keysCount = this.cache.size;
      this.stats.misses++;
      return null;
    }

    this.stats.hits++;
    return entry.value;
  }

  /**
   * Delete single key
   */
  del(key) {
    this.cache.delete(key);
    this.stats.keysCount = this.cache.size;
  }

  /**
   * Clear all keys matching a prefix
   */
  clearPrefix(prefix) {
    for (const key of this.cache.keys()) {
      if (key.startsWith(prefix)) {
        this.cache.delete(key);
      }
    }
    this.stats.keysCount = this.cache.size;
  }

  /**
   * Clear entire cache
   */
  clear() {
    this.cache.clear();
    this.stats.keysCount = 0;
  }

  /**
   * Get operational metrics
   */
  getMetrics() {
    const totalRequests = this.stats.hits + this.stats.misses;
    const hitRatio = totalRequests > 0 ? (this.stats.hits / totalRequests) * 100 : 100;
    return {
      hits: this.stats.hits,
      misses: this.stats.misses,
      hitRatioPercent: parseFloat(hitRatio.toFixed(2)),
      activeKeysCount: this.cache.size,
    };
  }
}

module.exports = new CacheManager();
