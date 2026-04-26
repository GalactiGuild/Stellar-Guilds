import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

// ── Mock Redis store ──────────────────────────────────────────────────────────
// In production, replace with an injected Redis/ioredis client.
const viewCounts = new Map<string, number>(); // user_views:{id}
const ipCooldowns = new Map<string, number>(); // ip:{ip}:{id} -> expiry timestamp

const HOUR_MS = 60 * 60 * 1000;

function viewKey(userId: string) {
  return `user_views:${userId}`;
}

function cooldownKey(ip: string, userId: string) {
  return `ip:${ip}:${userId}`;
}

// ── Service ───────────────────────────────────────────────────────────────────

@Injectable()
export class ProfileViewCounterService {
  private readonly logger = new Logger(ProfileViewCounterService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Increment the Redis view counter for a user profile.
   * A single IP can only increment once per hour.
   */
  async recordView(userId: string, ip: string): Promise<void> {
    const ck = cooldownKey(ip, userId);
    const now = Date.now();
    const expiry = ipCooldowns.get(ck) ?? 0;

    if (now < expiry) {
      return; // IP already counted within the last hour
    }

    ipCooldowns.set(ck, now + HOUR_MS);
    const vk = viewKey(userId);
    viewCounts.set(vk, (viewCounts.get(vk) ?? 0) + 1);
  }

  /**
   * Get the current in-memory view count for a user.
   */
  getViewCount(userId: string): number {
    return viewCounts.get(viewKey(userId)) ?? 0;
  }

  /**
   * Sync all in-memory view counts back to Postgres.
   * Intended to be called by a scheduled job every 24 hours.
   */
  async syncViewsToDB(): Promise<void> {
    const updates: Promise<unknown>[] = [];

    for (const [key, count] of viewCounts.entries()) {
      if (!key.startsWith('user_views:')) continue;
      const userId = key.slice('user_views:'.length);
      updates.push(
        this.prisma.user
          .update({
            where: { id: userId },
            data: { totalViews: { increment: count } },
          })
          .then(() => viewCounts.set(key, 0))
          .catch((err: unknown) =>
            this.logger.error(`Failed to sync views for user ${userId}`, err),
          ),
      );
    }

    await Promise.all(updates);
    this.logger.log(
      `Synced view counts for ${updates.length} user(s) to Postgres`,
    );
  }
}
