import { HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { of, tap } from 'rxjs';
import { CacheService } from '../services/cache.service';

/**
 * Cache configuration for different endpoint patterns
 */
interface CacheConfig {
  pattern: RegExp;
  ttl: number; // milliseconds
}

const CACHE_CONFIGS: CacheConfig[] = [
  // Categories - rarely change
  { pattern: /\/categories(\?|$)/, ttl: 10 * 60 * 1000 }, // 10 minutes

  // Product lists - moderate caching
  { pattern: /\/products\/flash-sales/, ttl: 1 * 60 * 1000 }, // 1 minute (time-sensitive)
  { pattern: /\/products\/best-selling/, ttl: 5 * 60 * 1000 }, // 5 minutes
  { pattern: /\/products\/new-arrivals/, ttl: 5 * 60 * 1000 }, // 5 minutes
  { pattern: /\/products\/\d+$/, ttl: 5 * 60 * 1000 }, // 5 minutes for individual products
  { pattern: /\/products(\?|$)/, ttl: 2 * 60 * 1000 }, // 2 minutes for product list

  // Wishlist - short cache (user-specific but beneficial to cache briefly)
  { pattern: /\/wishlist/, ttl: 30 * 1000 }, // 30 seconds
];

/**
 * Endpoints that should NEVER be cached
 */
const NO_CACHE_PATTERNS = [
  /\/auth\//,
  /\/cart/,
  /\/orders/,
  /\/payments/,
  /\/profile/,
  /\/notifications/,
];

/**
 * Get cache TTL for a URL, returns 0 if should not cache
 */
function getCacheTTL(url: string): number {
  // Check if URL matches any no-cache pattern
  for (const pattern of NO_CACHE_PATTERNS) {
    if (pattern.test(url)) {
      return 0;
    }
  }

  // Check if URL matches any cache config
  for (const config of CACHE_CONFIGS) {
    if (config.pattern.test(url)) {
      return config.ttl;
    }
  }

  return 0; // Don't cache by default
}

/**
 * Generate cache key from request
 */
function getCacheKey(url: string): string {
  return `http_cache:${url}`;
}

/**
 * HTTP Cache Interceptor
 *
 * Caches GET requests based on URL patterns with configurable TTLs.
 * Automatically invalidates related caches on mutations (POST/PUT/DELETE).
 */
export const cacheInterceptor: HttpInterceptorFn = (req, next) => {
  const cacheService = inject(CacheService);

  // Only cache GET requests
  if (req.method !== 'GET') {
    // For mutations, invalidate related caches
    if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(req.method)) {
      invalidateRelatedCaches(req.url, cacheService);
    }
    return next(req);
  }

  const ttl = getCacheTTL(req.url);

  // Don't cache if TTL is 0
  if (ttl === 0) {
    return next(req);
  }

  const cacheKey = getCacheKey(req.urlWithParams);

  // Check cache
  const cachedResponse = cacheService.get<HttpResponse<any>>(cacheKey);
  if (cachedResponse) {
    console.log(`[Cache] HIT: ${req.urlWithParams}`);
    return of(cachedResponse.clone());
  }

  // Cache miss - make request and cache response
  console.log(`[Cache] MISS: ${req.urlWithParams}`);

  return next(req).pipe(
    tap(event => {
      if (event instanceof HttpResponse && event.status === 200) {
        cacheService.set(cacheKey, event.clone(), ttl);
      }
    })
  );
};

/**
 * Invalidate caches related to a mutation URL
 */
function invalidateRelatedCaches(url: string, cacheService: CacheService): void {
  // Extract the resource type from URL (e.g., /api/products/1 -> products)
  const match = url.match(/\/api\/([^\/\?]+)/);
  if (match) {
    const resource = match[1];
    cacheService.invalidatePattern(`/${resource}`);
  }
}
