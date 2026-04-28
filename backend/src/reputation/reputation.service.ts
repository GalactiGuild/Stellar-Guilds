import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { CreateReputationDto } from './dto/create-reputation.dto';
import { UpdateReputationDto } from './dto/update-reputation.dto';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../common/services/redis.service';
import { Cron, CronExpression } from '@nestjs/schedule';

export interface ReputationEvent {
  id: string;
  userId: string;
  points: number;
  reason: string;
  createdAt: Date;
}

function mockEvents(userId: string): ReputationEvent[] {
  return Array.from({ length: 100 }, (_, i) => ({
    id: `evt-${i + 1}`,
    userId,
    points: Math.floor(Math.random() * 50) + 1,
    reason: `Task #${i + 1} completed`,
    createdAt: new Date(Date.now() - i * 3_600_000),
  }));
}

@Injectable()
export class ReputationService implements OnModuleInit {
  private readonly logger = new Logger(ReputationService.name);
  private readonly LEADERBOARD_KEY = 'global_leaderboard';

  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  async onModuleInit() {
    // We could recalculate on startup if needed, but cron handles it.
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async recalculateLeaderboard() {
    this.logger.log('Recalculating global leaderboard cache...');
    const aggregations = await this.prisma.reputationEntry.groupBy({
      by: ['userId'],
      _sum: { points: true },
    });

    // Clear the current leaderboard
    await this.redis.del(this.LEADERBOARD_KEY);

    // Repopulate
    for (const agg of aggregations) {
      const score = agg._sum.points || 0;
      await this.redis.zadd(this.LEADERBOARD_KEY, score, agg.userId);
    }
    this.logger.log(
      `Leaderboard recalculated for ${aggregations.length} users.`,
    );
  }

  async updateUserReputationInRedis(userId: string) {
    const sum = await this.prisma.reputationEntry.aggregate({
      where: { userId },
      _sum: { points: true },
    });
    const score = sum._sum.points || 0;
    await this.redis.zadd(this.LEADERBOARD_KEY, score, userId);
  }

  async addReputationEvent(data: {
    userId: string;
    amount: number;
    reason: string;
    linkedBountyId?: string;
  }) {
    return this.prisma.reputationEntry.create({ data });
  }

  async getReputationEvents(userId: string) {
    return this.prisma.reputationEntry.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(createReputationDto: CreateReputationDto) {
    const entry = await this.prisma.reputationEntry.create({
      data: {
        userId: createReputationDto.userId,
        points: createReputationDto.points,
        reason: createReputationDto.reason,
      },
    });
    await this.updateUserReputationInRedis(entry.userId);
    return entry;
  }

  async getLeaderboard(limit = 50) {
    try {
      // O(log N) retrieval from Redis
      const topUserIds = await this.redis.zrevrange(
        this.LEADERBOARD_KEY,
        0,
        limit - 1,
      );
      if (topUserIds && topUserIds.length > 0) {
        // Fetch user details from Postgres
        const users = await this.prisma.user.findMany({
          where: { id: { in: topUserIds } },
          select: { id: true, username: true, avatarUrl: true },
        });

        // Sort users based on Redis ranking order
        const sortedUsers = topUserIds
          .map((id: string) => users.find((u: any) => u.id === id))
          .filter(Boolean);

        return { source: 'redis', data: sortedUsers };
      }
    } catch (error) {
      this.logger.error(
        'Redis leaderboard fetch failed, falling back to Postgres',
        error,
      );
    }

    // Fallback: slow O(N log N) query via Postgres grouping
    this.logger.warn('Serving leaderboard from Postgres fallback');
    const aggregations = await this.prisma.reputationEntry.groupBy({
      by: ['userId'],
      _sum: { points: true },
      orderBy: { _sum: { points: 'desc' } },
      take: limit,
    });

    const userIds = aggregations.map((a: any) => a.userId);
    const users = await this.prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, username: true, avatarUrl: true },
    });

    const sortedUsers = userIds
      .map((id: string) => users.find((u: any) => u.id === id))
      .filter(Boolean);

    return { source: 'postgres', data: sortedUsers };
  }

  findAll() {
    return `This action returns all reputation`;
  }

  findOne(id: number) {
    return `This action returns a #${id} reputation`;
  }

  update(id: number, updateReputationDto: UpdateReputationDto) {
    return `This action updates a #${id} reputation`;
  }

  remove(id: number) {
    return `This action removes a #${id} reputation`;
  }

  getReputationHistory(
    userId: string,
    limit = 20,
    cursor?: string,
  ): { data: ReputationEvent[]; nextCursor: string | null; hasMore: boolean } {
    const all = mockEvents(userId);
    let startIndex = 0;
    if (cursor) {
      const idx = all.findIndex((e) => e.id === cursor);
      startIndex = idx === -1 ? 0 : idx + 1;
    }
    const slice = all.slice(startIndex, startIndex + limit);
    const hasMore = startIndex + limit < all.length;
    return {
      data: slice,
      nextCursor: hasMore ? slice[slice.length - 1].id : null,
      hasMore,
    };
  }
}
