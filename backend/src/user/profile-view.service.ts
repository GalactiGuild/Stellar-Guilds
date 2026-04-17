import { Injectable, Logger } from '@nestjs/common';
import { RedisService } from '../redis/redis.service';

const VIEW_COUNT_KEY_PREFIX = 'profile:views:';
const RATE_LIMIT_KEY_PREFIX = 'profile:viewed:';
const RATE_LIMIT_TTL_SECONDS = 300; // 5 minutes cooldown per viewer per profile

@Injectable()
export class ProfileViewService {
  private readonly logger = new Logger(ProfileViewService.name);

  constructor(private readonly redisService: RedisService) {}

  /**
   * Record a profile view with rate limiting.
   * Returns true if the view was counted, false if rate-limited.
   *
   * @param profileUserId - The user whose profile is being viewed
   * @param viewerId - The viewer's user ID, or IP-based identifier for anonymous users
   */
  async recordView(profileUserId: string, viewerId: string): Promise<boolean> {
    const rateLimitKey = `${RATE_LIMIT_KEY_PREFIX}${profileUserId}:${viewerId}`;

    try {
      // Check rate limit: if key exists, the viewer already viewed recently
      const alreadyViewed = await this.redisService.exists(rateLimitKey);
      if (alreadyViewed) {
        return false;
      }

      // Increment the view count
      const viewCountKey = `${VIEW_COUNT_KEY_PREFIX}${profileUserId}`;
      await this.redisService.incr(viewCountKey);

      // Set the rate limit key with TTL to prevent double-counting
      await this.redisService.setex(rateLimitKey, RATE_LIMIT_TTL_SECONDS, '1');

      return true;
    } catch (error: any) {
      this.logger.warn(
        `Failed to record profile view for ${profileUserId}: ${error?.message ?? 'unknown error'}`,
      );
      return false;
    }
  }

  /**
   * Get the current view count for a user profile.
   * Returns 0 if no views recorded yet.
   */
  async getViewCount(profileUserId: string): Promise<number> {
    const viewCountKey = `${VIEW_COUNT_KEY_PREFIX}${profileUserId}`;

    try {
      const count = await this.redisService.get(viewCountKey);
      return count ? parseInt(count, 10) : 0;
    } catch (error: any) {
      this.logger.warn(
        `Failed to get profile view count for ${profileUserId}: ${error?.message ?? 'unknown error'}`,
      );
      return 0;
    }
  }

  /**
   * Get view counts for multiple user profiles in bulk.
   */
  async getViewCounts(profileUserIds: string[]): Promise<Map<string, number>> {
    const result = new Map<string, number>();

    try {
      const promises = profileUserIds.map(async (userId) => {
        const count = await this.getViewCount(userId);
        return { userId, count };
      });

      const results = await Promise.all(promises);
      for (const { userId, count } of results) {
        result.set(userId, count);
      }
    } catch (error: any) {
      this.logger.warn(
        `Failed to get bulk profile view counts: ${error?.message ?? 'unknown error'}`,
      );
    }

    return result;
  }
}
