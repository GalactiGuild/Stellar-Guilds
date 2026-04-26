import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SearchService {
  constructor(private readonly prisma: PrismaService) {}

  async unifiedSearch(query: string) {
    const searchQuery = `%${query.toLowerCase()}%`;

    // Search across Guilds, Bounties, and Users concurrently
    const [guilds, bounties, users] = await Promise.all([
      this.searchGuilds(searchQuery),
      this.searchBounties(searchQuery),
      this.searchUsers(searchQuery),
    ]);

    return {
      guilds,
      bounties,
      users,
    };
  }

  private async searchGuilds(query: string) {
    return this.prisma.guild.findMany({
      where: {
        AND: [
          { isActive: true },
          {
            OR: [
              { name: { contains: query, mode: 'insensitive' } },
              { description: { contains: query, mode: 'insensitive' } },
            ],
          },
        ],
      },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        avatarUrl: true,
        memberCount: true,
        createdAt: true,
      },
      take: 5,
      orderBy: [{ memberCount: 'desc' }, { createdAt: 'desc' }],
    });
  }

  private async searchBounties(query: string) {
    return this.prisma.bounty.findMany({
      where: {
        AND: [
          { deletedAt: null },
          {
            OR: [
              { title: { contains: query, mode: 'insensitive' } },
              { description: { contains: query, mode: 'insensitive' } },
            ],
          },
        ],
      },
      select: {
        id: true,
        title: true,
        description: true,
        rewardAmount: true,
        rewardToken: true,
        status: true,
        deadline: true,
        createdAt: true,
        guild: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        creator: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      take: 5,
      orderBy: [{ createdAt: 'desc' }],
    });
  }

  private async searchUsers(query: string) {
    return this.prisma.user.findMany({
      where: {
        AND: [
          { isActive: true },
          {
            OR: [
              { username: { contains: query, mode: 'insensitive' } },
              { firstName: { contains: query, mode: 'insensitive' } },
              { lastName: { contains: query, mode: 'insensitive' } },
              { bio: { contains: query, mode: 'insensitive' } },
            ],
          },
        ],
      },
      select: {
        id: true,
        username: true,
        firstName: true,
        lastName: true,
        bio: true,
        avatarUrl: true,
        role: true,
        xp: true,
        createdAt: true,
      },
      take: 5,
      orderBy: [{ xp: 'desc' }, { createdAt: 'desc' }],
    });
  }
}
