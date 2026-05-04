import { ConfigService } from '@nestjs/config';
import { RedisThrottlerStorage } from './redis-throttler.storage';

describe('RedisThrottlerStorage', () => {
  const configService = {
    get: jest.fn((key: string, defaultValue?: unknown) => {
      if (key === 'THROTTLE_REDIS_ENABLED') return 'false';
      return defaultValue;
    }),
  } as unknown as ConfigService;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('allows requests while they are within the limit', async () => {
    const storage = new RedisThrottlerStorage(configService);

    const first = await storage.increment('user:1', 60000, 2, 60000, 'default');
    const second = await storage.increment('user:1', 60000, 2, 60000, 'default');

    expect(first.isBlocked).toBe(false);
    expect(first.totalHits).toBe(1);
    expect(second.isBlocked).toBe(false);
    expect(second.totalHits).toBe(2);
  });

  it('blocks rapid requests after the configured limit', async () => {
    const storage = new RedisThrottlerStorage(configService);

    await storage.increment('user:2', 60000, 2, 30000, 'default');
    await storage.increment('user:2', 60000, 2, 30000, 'default');
    const blocked = await storage.increment('user:2', 60000, 2, 30000, 'default');

    expect(blocked.isBlocked).toBe(true);
    expect(blocked.totalHits).toBe(3);
    expect(blocked.timeToBlockExpire).toBeGreaterThan(0);
  });

  it('keeps separate buckets per tracker key', async () => {
    const storage = new RedisThrottlerStorage(configService);

    await storage.increment('ip:1', 60000, 1, 30000, 'default');
    const separateTracker = await storage.increment('ip:2', 60000, 1, 30000, 'default');

    expect(separateTracker.isBlocked).toBe(false);
    expect(separateTracker.totalHits).toBe(1);
  });
});
