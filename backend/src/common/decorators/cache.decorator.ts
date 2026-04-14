import { applyDecorators, SetMetadata, CacheTTL } from '@nestjs/common';

/** Custom metadata key for cache TTL override */
export const CACHE_TTL_META_KEY = 'cache:ttl';

/**
 * Combined decorator: sets CacheKey + custom TTL metadata.
 * Usage: @Cacheable('guilds:leaderboard', 60)
 */
export function Cacheable(key: string, ttlSeconds: number) {
  return applyDecorators(
    SetMetadata('CACHE_KEY', key),
    SetMetadata(CACHE_TTL_META_KEY, ttlSeconds),
    CacheTTL(ttlSeconds * 1000), // CacheTTL expects milliseconds
  );
}
