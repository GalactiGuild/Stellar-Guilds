import { Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { RedisService } from '../../common/services/redis.service';

@Injectable()
export class TokenBlacklistService {
  private readonly logger = new Logger(TokenBlacklistService.name);
  private readonly BLACKLIST_PREFIX = 'blacklist:token:';

  constructor(
    private readonly redisService: RedisService,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * Add a token to the blacklist with TTL matching token's remaining life
   * @param token - The JWT access token to blacklist
   */
  async add(token: string): Promise<void> {
    try {
      // Decode the token to get expiration time
      const decoded = this.jwtService.decode(token);

      if (!decoded || !decoded.exp) {
        this.logger.warn(
          'Cannot blacklist token: unable to decode or missing expiration',
        );
        return;
      }

      const currentTime = Math.floor(Date.now() / 1000);
      const ttl = decoded.exp - currentTime;

      // Only blacklist if token hasn't already expired
      if (ttl > 0) {
        const key = this.getBlacklistKey(token);
        await this.redisService.set(key, 'blacklisted', ttl);
        this.logger.debug(`Token blacklisted with TTL: ${ttl} seconds`);
      } else {
        this.logger.debug('Token already expired, skipping blacklist');
      }
    } catch (error) {
      this.logger.error('Failed to blacklist token', error);
    }
  }

  /**
   * Check if a token is blacklisted
   * @param token - The JWT access token to check
   * @returns true if the token is blacklisted, false otherwise
   */
  async isBlacklisted(token: string): Promise<boolean> {
    try {
      const key = this.getBlacklistKey(token);
      const result = await this.redisService.get(key);
      return result === 'blacklisted';
    } catch (error) {
      this.logger.error('Failed to check token blacklist status', error);
      // If Redis is unavailable, assume token is not blacklisted
      // This prevents blocking all requests during Redis outages
      return false;
    }
  }

  /**
   * Generate a Redis key for the token
   * Uses a hash of the token to keep keys short and consistent
   * @param token - The JWT token
   * @returns Redis key string
   */
  private getBlacklistKey(token: string): string {
    // Create a simple hash from the token to use as Redis key
    // This keeps keys short while maintaining uniqueness
    let hash = 0;
    for (let i = 0; i < token.length; i++) {
      const char = token.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return `${this.BLACKLIST_PREFIX}${Math.abs(hash).toString(36)}`;
  }
}
