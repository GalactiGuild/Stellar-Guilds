import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ThrottlerStorage } from '@nestjs/throttler';
import { ThrottlerStorageRecord } from '@nestjs/throttler/dist/throttler-storage-record.interface';
import Redis from 'ioredis';

type MemoryBucket = {
  hits: number[];
  blockedUntil: number;
};

export class RedisThrottlerStorage implements ThrottlerStorage {
  private readonly logger = new Logger(RedisThrottlerStorage.name);
  private readonly memoryBuckets = new Map<string, MemoryBucket>();
  private readonly redis?: Redis;

  constructor(private readonly configService: ConfigService) {
    const redisEnabled = this.configService.get<string>('THROTTLE_REDIS_ENABLED', 'false') === 'true';

    if (redisEnabled) {
      this.redis = new Redis({
        host: this.configService.get<string>('REDIS_HOST', 'localhost'),
        port: this.configService.get<number>('REDIS_PORT', 6379),
        password: this.configService.get<string>('REDIS_PASSWORD'),
        username: this.configService.get<string>('REDIS_USERNAME'),
        db: this.configService.get<number>('REDIS_DB', 0),
        lazyConnect: true,
        maxRetriesPerRequest: 1,
      });

      this.redis.on('error', (error) => {
        this.logger.warn(`Redis throttler unavailable, falling back to memory: ${error.message}`);
      });
    }
  }

  async increment(
    key: string,
    ttl: number,
    limit: number,
    blockDuration: number,
    throttlerName: string,
  ): Promise<ThrottlerStorageRecord> {
    if (this.redis) {
      try {
        return await this.incrementRedis(key, ttl, limit, blockDuration, throttlerName);
      } catch (error) {
        this.logger.warn(
          `Redis throttler increment failed, falling back to memory: ${
            error instanceof Error ? error.message : 'unknown error'
          }`,
        );
      }
    }

    return this.incrementMemory(key, ttl, limit, blockDuration);
  }

  private async incrementRedis(
    key: string,
    ttl: number,
    limit: number,
    blockDuration: number,
    throttlerName: string,
  ): Promise<ThrottlerStorageRecord> {
    const now = Date.now();
    const hitsKey = `throttle:${throttlerName}:${key}:hits`;
    const blockKey = `throttle:${throttlerName}:${key}:blocked`;

    if (this.redis!.status === 'wait') {
      await this.redis!.connect();
    }

    const blockedUntilRaw = await this.redis!.get(blockKey);
    const blockedUntil = Number(blockedUntilRaw ?? 0);

    if (blockedUntil > now) {
      return {
        totalHits: limit + 1,
        timeToExpire: Math.ceil(ttl / 1000),
        isBlocked: true,
        timeToBlockExpire: Math.ceil((blockedUntil - now) / 1000),
      };
    }

    const windowStart = now - ttl;
    await this.redis!
      .multi()
      .zremrangebyscore(hitsKey, 0, windowStart)
      .zadd(hitsKey, now, `${now}:${Math.random()}`)
      .pexpire(hitsKey, ttl)
      .exec();

    const totalHits = await this.redis!.zcard(hitsKey);
    const isBlocked = totalHits > limit;

    if (isBlocked) {
      const blockedUntilNext = now + blockDuration;
      await this.redis!.psetex(blockKey, blockDuration, String(blockedUntilNext));
      return {
        totalHits,
        timeToExpire: Math.ceil(ttl / 1000),
        isBlocked: true,
        timeToBlockExpire: Math.ceil(blockDuration / 1000),
      };
    }

    return {
      totalHits,
      timeToExpire: Math.ceil(ttl / 1000),
      isBlocked: false,
      timeToBlockExpire: 0,
    };
  }

  private incrementMemory(
    key: string,
    ttl: number,
    limit: number,
    blockDuration: number,
  ): ThrottlerStorageRecord {
    const now = Date.now();
    const bucket = this.memoryBuckets.get(key) ?? { hits: [], blockedUntil: 0 };

    if (bucket.blockedUntil > now) {
      return {
        totalHits: bucket.hits.length,
        timeToExpire: Math.ceil(ttl / 1000),
        isBlocked: true,
        timeToBlockExpire: Math.ceil((bucket.blockedUntil - now) / 1000),
      };
    }

    bucket.hits = bucket.hits.filter((timestamp) => timestamp > now - ttl);
    bucket.hits.push(now);

    const isBlocked = bucket.hits.length > limit;
    if (isBlocked) {
      bucket.blockedUntil = now + blockDuration;
    }

    this.memoryBuckets.set(key, bucket);

    return {
      totalHits: bucket.hits.length,
      timeToExpire: Math.ceil(ttl / 1000),
      isBlocked,
      timeToBlockExpire: isBlocked ? Math.ceil(blockDuration / 1000) : 0,
    };
  }
}
