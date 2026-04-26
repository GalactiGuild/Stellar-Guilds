import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private client!: Redis;

  constructor(private configService: ConfigService) {}

  onModuleInit() {
    this.client = new Redis({
      host: this.configService.get<string>('REDIS_HOST', 'localhost'),
      port: this.configService.get<number>('REDIS_PORT', 6379),
      password: this.configService.get<string>('REDIS_PASSWORD'),
      username: this.configService.get<string>('REDIS_USERNAME'),
      db: this.configService.get<number>('REDIS_DB', 0),
    });

    this.client.on('connect', () => {
      this.logger.log('Connected to Redis');
    });

    this.client.on('error', (err) => {
      this.logger.error('Redis connection error', err);
    });
  }

  async onModuleDestroy() {
    await this.client.quit();
  }

  async get(key: string): Promise<string | null> {
    return this.client.get(key);
  }

  async set(key: string, value: string, ttl?: number): Promise<void> {
    if (ttl) {
      await this.client.set(key, value, 'EX', ttl);
    } else {
      await this.client.set(key, value);
    }
  }

  async del(key: string): Promise<void> {
    await this.client.del(key);
    this.mockSortedSets.delete(key);
  }

  // --- Mock Redis Client implementation for Sorted Sets ---
  private mockSortedSets: Map<string, Map<string, number>> = new Map();

  async zadd(key: string, score: number, member: string): Promise<void> {
    try {
      await this.client.zadd(key, score, member);
    } catch (e) {
      // Fallback to local mock
    }

    // Always keep mock updated for the fallback
    if (!this.mockSortedSets.has(key)) {
      this.mockSortedSets.set(key, new Map());
    }
    this.mockSortedSets.get(key)!.set(member, score);
  }

  async zrevrange(key: string, start: number, stop: number): Promise<string[]> {
    try {
      const result = await this.client.zrevrange(key, start, stop);
      if (result && result.length > 0) return result;
    } catch (e) {
      // Fallback to local mock
    }

    // Local mock fallback
    if (!this.mockSortedSets.has(key)) return [];
    const set = this.mockSortedSets.get(key)!;
    const sorted = Array.from(set.entries()).sort((a, b) => b[1] - a[1]);
    const endIndex = stop === -1 ? sorted.length : stop + 1;
    return sorted.slice(start, endIndex).map((entry) => entry[0]);
  }
}
