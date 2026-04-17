import { Injectable, OnModuleDestroy, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private readonly client: Redis;

  constructor(private configService: ConfigService) {
    const host = this.configService.get<string>('REDIS_HOST', 'localhost');
    const port = this.configService.get<number>('REDIS_PORT', 6379);
    const password = this.configService.get<string>('REDIS_PASSWORD');
    const username = this.configService.get<string>('REDIS_USERNAME');
    const db = this.configService.get<number>('REDIS_DB', 0);

    this.client = new Redis({
      host,
      port,
      password,
      username,
      db,
      maxRetriesPerRequest: 3,
      retryStrategy(times: number) {
        const delay = Math.min(times * 200, 2000);
        return delay;
      },
    });

    this.client.on('connect', () => {
      this.logger.log(`Redis connected to ${host}:${port}`);
    });

    this.client.on('error', (err) => {
      this.logger.error(`Redis connection error: ${err.message}`);
    });
  }

  getClient(): Redis {
    return this.client;
  }

  /**
   * Increment a key and return the new value.
   */
  async incr(key: string): Promise<number> {
    return this.client.incr(key);
  }

  /**
   * Set a key with an expiration in seconds.
   */
  async setex(key: string, seconds: number, value: string): Promise<string> {
    return this.client.setex(key, seconds, value);
  }

  /**
   * Get a key's value.
   */
  async get(key: string): Promise<string | null> {
    return this.client.get(key);
  }

  /**
   * Check if a key exists.
   */
  async exists(key: string): Promise<number> {
    return this.client.exists(key);
  }

  /**
   * Delete a key.
   */
  async del(key: string): Promise<number> {
    return this.client.del(key);
  }

  async onModuleDestroy() {
    await this.client.quit();
  }
}
