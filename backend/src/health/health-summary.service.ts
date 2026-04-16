import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { WinstonLogger } from '../logger/winston.logger';

interface HealthSummary {
  timestamp: string;
  metrics: {
    totalUsers: number;
    newUsersToday: number;
    totalGuilds: number;
    activeGuilds: number;
    totalBounties: number;
    openBounties: number;
    completedBountiesToday: number;
    totalPayouts: number;
    payoutsToday: number;
  };
}

@Injectable()
export class HealthSummaryService {
  private readonly logger: WinstonLogger;

  constructor(private readonly prisma: PrismaService) {
    this.logger = new WinstonLogger('HealthSummary');
  }

  @Cron(CronExpression.EVERY_DAY_AT_11PM)
  async generateDailySummary(): Promise<HealthSummary> {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const summary: HealthSummary = {
      timestamp: new Date().toISOString(),
      metrics: {
        totalUsers: await this.prisma.user.count(),
        newUsersToday: await this.prisma.user.count({
          where: { createdAt: { gte: startOfDay } },
        }),
        totalGuilds: await this.prisma.guild.count(),
        activeGuilds: await this.prisma.guild.count({
          where: { deletedAt: null },
        }),
        totalBounties: await this.prisma.bounty.count(),
        openBounties: await this.prisma.bounty.count({
          where: { status: 'OPEN', deletedAt: null },
        }),
        completedBountiesToday: await this.prisma.bounty.count({
          where: {
            status: 'COMPLETED',
            updatedAt: { gte: startOfDay },
          },
        }),
        totalPayouts: await this.prisma.bountyPayout.count(),
        payoutsToday: await this.prisma.bountyPayout.count({
          where: { createdAt: { gte: startOfDay } },
        }),
      },
    };

    this.logger.log(JSON.stringify(summary), 'DailyHealthSummary');

    return summary;
  }
}
