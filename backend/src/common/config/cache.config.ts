import { CacheModuleOptions, CacheStore } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-redis-yet';
import { redisStore as redisIoStore } from 'cache-manager-ioredis';

/**
 * Cache configuration factory for NestJS CacheModule.
 *
 * Uses Redis as the backing store (shares existing REDIS_URL).
 * Falls back to in-memory cache when Redis is not configured (dev mode).
 *
 * TTL defaults:
 *   - Guilds leaderboard: 60s
 *   - Bounties list: 30s
 *   - General: 300s (5 min)
 */
export async function getCacheConfig(): Promise<CacheModuleOptions> {
  const redisUrl = process.env.REDIS_URL;

  if (!redisUrl || process.env.QUEUE_DISABLED === 'true') {
    // Dev / no-Redis fallback: in-memory cache
    return {
      ttl: 5 * 1000, // 5 seconds default
      max: 100,       // max cached items
      isGlobal: true,
    };
  }

  // Production: Redis-backed cache
  let store: CacheStore;

  try {
    store = await redisStore({
      url: redisUrl,
      ttl: 60 * 1000, // default 60s
      isGlobal: true,
    });
  } catch {
    // Fallback to ioredis if primary driver unavailable
    store = await redisIoStore({
      url: redisUrl,
      ttl: 60 * 1000,
      isGlobal: true,
    });
  }

  return {
    store,
    isGlobal: true,
    ttl: 60 * 1000,
  };
}

/** Predefined TTL constants (in seconds) */
export const CACHE_TTL = {
  GUILD_LEADERBOARD: 60,    // 1 minute — high-demand, changes rarely
  BOUNTIES_LIST: 30,        // 30 seconds — moderate churn
  GUILD_DETAILS: 120,       // 2 minutes
  USER_PROFILE: 300,        // 5 minutes
  DEFAULT: 300,             // 5 minutes fallback
} as const;
