import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ReputationDecayService {
  private readonly logger = new Logger(ReputationDecayService.name);
  private readonly DECAY_PERCENTAGE = 0.05; // 5% decay
  private readonly INACTIVITY_DAYS = 180; // 6 months

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Monthly cron job that runs on the 1st of every month at midnight
   * to reduce reputation for inactive users
   */
  @Cron('0 0 1 * *')
  async handleReputationDecay(): Promise<void> {
    this.logger.log('Starting monthly reputation decay process...');
    
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - this.INACTIVITY_DAYS);

      // Find users who haven't logged in for over 180 days
      const inactiveUsers = await this.prisma.user.findMany({
        where: {
          lastLoginAt: {
            lt: cutoffDate,
          },
          isActive: true,
        },
        include: {
          reputationEntries: {
            select: {
              points: true,
            },
          },
        },
      });

      this.logger.log(`Found ${inactiveUsers.length} inactive users for reputation decay`);

      for (const user of inactiveUsers) {
        await this.processUserReputationDecay(user);
      }

      this.logger.log('Reputation decay process completed successfully');
    } catch (error) {
      this.logger.error(
        'Error during reputation decay process:',
        error instanceof Error ? error.message : String(error),
      );
      throw error;
    }
  }

  /**
   * Process reputation decay for a single user
   */
  private async processUserReputationDecay(user: {
    id: string;
    email: string;
    username: string;
    reputationEntries: { points: number }[];
  }): Promise<void> {
    try {
      // Calculate current total reputation
      const currentReputation = user.reputationEntries.reduce(
        (total, entry) => total + entry.points,
        0
      );

      if (currentReputation <= 0) {
        this.logger.debug(`User ${user.username} has no reputation to decay`);
        return;
      }

      // Calculate decay amount (5% of current reputation)
      const decayAmount = Math.floor(currentReputation * this.DECAY_PERCENTAGE);
      const newReputation = Math.max(0, currentReputation - decayAmount);

      if (decayAmount === 0) {
        this.logger.debug(`User ${user.username} reputation too low to decay`);
        return;
      }

      // Record the decay event
      await this.prisma.reputationEntry.create({
        data: {
          userId: user.id,
          points: -decayAmount,
          reason: 'REPUTATION_DECAY',
          metadata: {
            previousTotal: currentReputation,
            newTotal: newReputation,
            decayPercentage: this.DECAY_PERCENTAGE,
            inactivityDays: this.INACTIVITY_DAYS,
            processedAt: new Date().toISOString(),
          },
        },
      });

      this.logger.log(
        `Decayed ${decayAmount} reputation from user ${user.username} (${user.email}). ` +
        `Total: ${currentReputation} → ${newReputation}`
      );
    } catch (error) {
      this.logger.error(
        `Failed to process reputation decay for user ${user.username}:`,
        error instanceof Error ? error.message : String(error),
      );
    }
  }

  /**
   * Get statistics about reputation decay (for monitoring/health checks)
   */
  async getDecayStatistics(): Promise<{
    totalInactiveUsers: number;
    usersWithReputation: number;
    averageReputation: number;
  }> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - this.INACTIVITY_DAYS);

    const inactiveUsers = await this.prisma.user.findMany({
      where: {
        lastLoginAt: {
          lt: cutoffDate,
        },
        isActive: true,
      },
      include: {
        reputationEntries: {
          select: {
            points: true,
          },
        },
      },
    });

    const usersWithReputation = inactiveUsers.filter(
      (user: any) => user.reputationEntries.length > 0
    );

    const totalReputation = usersWithReputation.reduce(
      (sum: number, user: any) => sum + user.reputationEntries.reduce((total: number, entry: any) => total + entry.points, 0),
      0
    );

    return {
      totalInactiveUsers: inactiveUsers.length,
      usersWithReputation: usersWithReputation.length,
      averageReputation: usersWithReputation.length > 0 ? Math.floor(totalReputation / usersWithReputation.length) : 0,
    };
  }
}
