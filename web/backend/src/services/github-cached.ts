/**
 * Cached GitHub Service
 * Wraps GitHub service with in-memory caching to reduce API calls
 * Uses LRU cache with bounded size to prevent memory leaks
 */

import { GitHubService, createGitHubService } from './github';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  accessCount: number;
}

export class CachedGitHubService implements GitHubService {
  private readonly githubService: GitHubService;
  private readonly cache: Map<string, CacheEntry<any>>;
  private readonly cacheTTL: number;
  private readonly maxCacheSize: number;

  constructor(githubToken?: string, cacheTTLMinutes: number = 5, maxCacheSize: number = 1000) {
    this.githubService = createGitHubService(githubToken);
    this.cache = new Map();
    this.cacheTTL = cacheTTLMinutes * 60 * 1000; // Convert to milliseconds
    this.maxCacheSize = maxCacheSize;
  }

  /**
   * Get contribution count for today (with caching)
   */
  async getContributionsToday(username: string): Promise<number> {
    const cacheKey = `contributions:${username}:${this.getTodayKey()}`;
    
    const cached = this.getFromCache<number>(cacheKey);
    if (cached !== null) {
      return cached;
    }

    const contributions = await this.githubService.getContributionsToday(username);
    this.setCache(cacheKey, contributions);
    
    return contributions;
  }

  /**
   * Get current streak (with caching)
   */
  async getCurrentStreak(username: string): Promise<number> {
    const cacheKey = `streak:${username}:${this.getTodayKey()}`;
    
    const cached = this.getFromCache<number>(cacheKey);
    if (cached !== null) {
      return cached;
    }

    const streak = await this.githubService.getCurrentStreak(username);
    this.setCache(cacheKey, streak);
    
    return streak;
  }

  /**
   * Get data from cache if not expired
   */
  private getFromCache<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }

    const now = Date.now();
    if (now - entry.timestamp > this.cacheTTL) {
      this.cache.delete(key);
      return null;
    }

    // Update access count for LRU
    entry.accessCount++;

    return entry.data as T;
  }

  /**
   * Set data in cache with LRU eviction
   */
  private setCache<T>(key: string, data: T): void {
    // If cache is full, evict the least recently used entry
    if (this.cache.size >= this.maxCacheSize) {
      this.evictLRU();
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      accessCount: 1,
    });
  }

  /**
   * Evict least recently used cache entry
   */
  private evictLRU(): void {
    let lruKey: string | null = null;
    let minAccessCount = Infinity;

    // Find entry with lowest access count
    for (const [key, entry] of this.cache.entries()) {
      if (entry.accessCount < minAccessCount) {
        minAccessCount = entry.accessCount;
        lruKey = key;
      }
    }

    if (lruKey) {
      this.cache.delete(lruKey);
    }
  }

  /**
   * Get today's date key for cache
   */
  private getTodayKey(): string {
    return new Date().toISOString().split('T')[0];
  }

  /**
   * Clear all cache
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Clear expired cache entries
   */
  clearExpiredCache(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > this.cacheTTL) {
        this.cache.delete(key);
      }
    }
  }
}

/**
 * Create cached GitHub service instance
 * @param githubToken - Optional GitHub personal access token
 * @param cacheTTLMinutes - Cache TTL in minutes (default: 5)
 */
export function createCachedGitHubService(
  githubToken?: string,
  cacheTTLMinutes: number = 5
): GitHubService {
  return new CachedGitHubService(githubToken, cacheTTLMinutes);
}
