import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SocialService {
  constructor(private readonly prisma: PrismaService) {}

  async getFeedForUser(userId: string) {
    // placeholder implementation returning empty array
    return [];
  }

  /**
   * Follow a user. Idempotent — returns existing record if already following.
   */
  async followUser(followerId: string, followingId: string) {
    if (followerId === followingId) {
      throw new BadRequestException('Cannot follow yourself');
    }

    // Verify target user exists
    const target = await this.prisma.user.findUnique({
      where: { id: followingId },
      select: { id: true },
    });
    if (!target) {
      throw new NotFoundException('User not found');
    }

    // Upsert: return existing follow relation if it exists, create otherwise
    const follow = await this.prisma.follow.upsert({
      where: {
        followerId_followingId: { followerId, followingId },
      },
      create: { followerId, followingId },
      update: {}, // no-op if already exists
    });

    return { success: true, follow };
  }

  /**
   * Unfollow a user.
   */
  async unfollowUser(followerId: string, followingId: string) {
    if (followerId === followingId) {
      throw new BadRequestException('Cannot unfollow yourself');
    }

    try {
      await this.prisma.follow.delete({
        where: {
          followerId_followingId: { followerId, followingId },
        },
      });
      return { success: true };
    } catch (err: any) {
      if (err.code === 'P2025') {
        throw new NotFoundException('Not following this user');
      }
      throw err;
    }
  }

  /**
   * Check if follower is following target user.
   */
  async isFollowing(followerId: string, followingId: string): Promise<boolean> {
    const follow = await this.prisma.follow.findUnique({
      where: {
        followerId_followingId: { followerId, followingId },
      },
      select: { id: true },
    });
    return !!follow;
  }

  /**
   * Get followers list for a user.
   */
  async getFollowers(userId: string, page = 0, size = 20) {
    const [items, total] = await Promise.all([
      this.prisma.follow.findMany({
        where: { followingId: userId },
        include: { follower: { select: { id: true, username: true, avatarUrl: true } } },
        skip: page * size,
        take: size,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.follow.count({ where: { followingId: userId } }),
    ]);
    return { items: items.map((f) => f.follower), total, page, size };
  }

  /**
   * Get following list for a user.
   */
  async getFollowing(userId: string, page = 0, size = 20) {
    const [items, total] = await Promise.all([
      this.prisma.follow.findMany({
        where: { followerId: userId },
        include: { following: { select: { id: true, username: true, avatarUrl: true } } },
        skip: page * size,
        take: size,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.follow.count({ where: { followerId: userId } }),
    ]);
    return { items: items.map((f) => f.following), total, page, size };
  }
}
