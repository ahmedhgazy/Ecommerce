import { Injectable, signal } from '@angular/core';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
}

interface CacheStats {
  hits: number;
  misses: number;
  size: number;
}

@Injectable({
  providedIn: 'root'
})
export class CacheService {
  private cache = new Map<string, CacheEntry<any>>();
  private readonly maxEntries = 100; // LRU limit
  private readonly accessOrder: string[] = []; // For LRU tracking

  // Observable stats for debugging
  stats = signal<CacheStats>({ hits: 0, misses: 0, size: 0 });

  /**
   * Get cached value if exists and not expired
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);

    if (!entry) {
      this.updateStats('miss');
      return null;
    }

    // Check if expired
    if (Date.now() > entry.timestamp + entry.ttl) {
      this.delete(key);
      this.updateStats('miss');
      return null;
    }

    // Update LRU order
    this.updateAccessOrder(key);
    this.updateStats('hit');

    return entry.data as T;
  }

  /**
   * Set cache entry with TTL
   */
  set<T>(key: string, data: T, ttlMs: number): void {
    // Evict if at capacity
    if (this.cache.size >= this.maxEntries && !this.cache.has(key)) {
      this.evictLRU();
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttlMs
    });

    this.updateAccessOrder(key);
    this.updateStats('size');
  }

  /**
   * Check if key exists and is not expired
   */
  has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;

    if (Date.now() > entry.timestamp + entry.ttl) {
      this.delete(key);
      return false;
    }

    return true;
  }

  /**
   * Delete specific cache entry
   */
  delete(key: string): boolean {
    const deleted = this.cache.delete(key);
    if (deleted) {
      const idx = this.accessOrder.indexOf(key);
      if (idx > -1) this.accessOrder.splice(idx, 1);
      this.updateStats('size');
    }
    return deleted;
  }

  /**
   * Clear all cache entries matching a pattern
   * @param pattern - String pattern to match (e.g., '/products' clears all product-related cache)
   */
  invalidatePattern(pattern: string): number {
    let count = 0;
    const keysToDelete: string[] = [];

    this.cache.forEach((_, key) => {
      if (key.includes(pattern)) {
        keysToDelete.push(key);
      }
    });

    keysToDelete.forEach(key => {
      this.delete(key);
      count++;
    });

    if (count > 0) {
      console.log(`[Cache] Invalidated ${count} entries matching "${pattern}"`);
    }

    return count;
  }

  /**
   * Clear entire cache
   */
  clear(): void {
    this.cache.clear();
    this.accessOrder.length = 0;
    this.updateStats('size');
    console.log('[Cache] Cleared all entries');
  }

  /**
   * Get cache size
   */
  get size(): number {
    return this.cache.size;
  }

  /**
   * Remove expired entries (garbage collection)
   */
  cleanExpired(): number {
    let count = 0;
    const now = Date.now();
    const keysToDelete: string[] = [];

    this.cache.forEach((entry, key) => {
      if (now > entry.timestamp + entry.ttl) {
        keysToDelete.push(key);
      }
    });

    keysToDelete.forEach(key => {
      this.delete(key);
      count++;
    });

    return count;
  }

  // ===== Private Methods =====

  private updateAccessOrder(key: string): void {
    const idx = this.accessOrder.indexOf(key);
    if (idx > -1) {
      this.accessOrder.splice(idx, 1);
    }
    this.accessOrder.push(key); // Most recently used at end
  }

  private evictLRU(): void {
    if (this.accessOrder.length > 0) {
      const lruKey = this.accessOrder.shift()!;
      this.cache.delete(lruKey);
      console.log(`[Cache] LRU evicted: ${lruKey}`);
    }
  }

  private updateStats(type: 'hit' | 'miss' | 'size'): void {
    this.stats.update(s => ({
      hits: type === 'hit' ? s.hits + 1 : s.hits,
      misses: type === 'miss' ? s.misses + 1 : s.misses,
      size: this.cache.size
    }));
  }
}
