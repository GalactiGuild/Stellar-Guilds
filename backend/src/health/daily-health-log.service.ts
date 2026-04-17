import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';

export interface DailyHealthSummary {
  timestamp: string;
  date: string;
  database: {
    status: string;
    connection: string;
  };
  metrics: {
    totalUsers: number;
    totalGuilds: number;
    totalBounties: number;
    payoutsCreatedToday: number;
    bountiesCreatedToday: number;
    usersCreatedToday: number;
  };
  uptime: {
    seconds: number;
    formatted: string;
  };
}

@Injectable()
export class DailyHealthLogService {
  private readonly logger = new Logger(DailyHealthLogService.name);

  constructor(private readonly prismaService: PrismaService) {}

  /**
   * Runs daily at 11:59 PM to log a comprehensive health summary.
   * Aggregates key metrics and logs them as an Audit event.
   */
  @Cron(CronExpression.EVERY_DAY_AT_11PM)
  async generateDailyHealthSummary(): Promise<void> {
    this.logger.log('Starting daily health summary generation...');

    try {
      const summary = await this.buildHealthSummary();

      // Log the formatted JSON summary as an Audit event
      this.logger.log(
        JSON.stringify(summary, null, 2),
        'Audit',
      );

      this.logger.log('Daily health summary generated successfully.');
    } catch (error) {
      this.logger.error(
        `Failed to generate daily health summary: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error instanceof Error ? error.stack : undefined,
      );
    }
  }

  /**
   * Builds the health summary by aggregating metrics from the database.
   */
  async buildHealthSummary(): Promise<DailyHealthSummary> {
    const now = new Date();
    const startOfDay = new Date(now);
    startOfDay.setHours(0, 0, 0, 0);

    const uptime = process.uptime();
    const hours = Math.floor(uptime / 3600);
    const minutes = Math.floor((uptime % 3600) / 60);
    const seconds = Math.floor(uptime % 60);

    // Check database connectivity
    let dbStatus = 'connected';
    try {
      await this.prismaService.$queryRaw`SELECT 1`;
    } catch {
      dbStatus = 'disconnected';
    }

    // Aggregate metrics
    const [
      totalUsers,
      totalGuilds,
      totalBounties,
      payoutsCreatedToday,
      bountiesCreatedToday,
      usersCreatedToday,
    ] = await Promise.all([
      this.prismaService.user.count(),
      this.prismaService.guild.count(),
      this.prismaService.bounty.count(),
      this.prismaService.bountyPayout.count({
        where: { createdAt: { gte: startOfDay } },
      }),
      this.prismaService.bounty.count({
        where: { createdAt: { gte: startOfDay } },
      }),
      this.prismaService.user.count({
        where: { createdAt: { gte: startOfDay } },
      }),
    ]);

    return {
      timestamp: now.toISOString(),
      date: now.toISOString().split('T')[0],
      database: {
        status: dbStatus,
        connection: dbStatus === 'connected' ? 'healthy' : 'unhealthy',
      },
      metrics: {
        totalUsers,
        totalGuilds,
        totalBounties,
        payoutsCreatedToday,
        bountiesCreatedToday,
        usersCreatedToday,
      },
      uptime: {
        seconds: Math.floor(uptime),
        formatted: `${hours}h ${minutes}m ${seconds}s`,
      },
    };
  }
}
