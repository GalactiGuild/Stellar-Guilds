import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ReputationDecayJobData } from '../queue/queue.interfaces';

@Injectable()
export class ReputationDecayService {
  private readonly logger = new Logger(ReputationDecayService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Process reputation decay for inactive users.
   *
   * Identifies users who have not logged any ActivityLog in the past
   * `inactivityDays` days, then subtracts `decayPercentage`% of their
   * current reputation (floored at 0) and records a REPUTATION_DECAY
   * event in both ActivityLog and ReputationHistory.
   */
  async processDecay(data: ReputationDecayJobData): Promise<{
    processedCount: number;
    totalDecayed: number;
  }> {
    const { inactivityDays, decayPercentage } = data;
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - inactivityDays);

    this.logger.log(
      `Starting reputation decay: inactivityDays=${inactivityDays}, decayPercentage=${decayPercentage}%, cutoff=${cutoffDate.toISOString()}`,
    );

    // Find all active users whose reputation > 0
    const users = await this.prisma.user.findMany({
      where: {
        isActive: true,
        reputation: { gt: 0 },
        deletedAt: null,
      },
      select: {
        id: true,
        reputation: true,
      },
    });

    let processedCount = 0;
    let totalDecayed = 0;

    for (const user of users) {
      // Check if user has any activity after the cutoff date
      const recentActivity = await this.prisma.activityLog.findFirst({
        where: {
          userId: user.id,
          createdAt: { gte: cutoffDate },
        },
      });

      // If user has recent activity, skip
      if (recentActivity) {
        continue;
      }

      // Calculate decay amount (5% of current reputation, minimum 1)
      const decayAmount = Math.max(
        1,
        Math.floor((user.reputation * decayPercentage) / 100),
      );

      const newReputation = Math.max(0, user.reputation - decayAmount);

      // Use a transaction to ensure atomicity
      await this.prisma.$transaction([
        // Update user reputation
        this.prisma.user.update({
          where: { id: user.id },
          data: { reputation: newReputation },
        }),
        // Record in reputation history
        this.prisma.reputationHistory.create({
          data: {
            userId: user.id,
            amount: -decayAmount,
            reason: 'REPUTATION_DECAY',
            metadata: {
              previousReputation: user.reputation,
              newReputation,
              decayPercentage,
              inactivityDays,
              cutoffDate: cutoffDate.toISOString(),
            },
          },
        }),
        // Record activity log event
        this.prisma.activityLog.create({
          data: {
            userId: user.id,
            type: 'REPUTATION_DECAY',
            metadata: {
              decayAmount,
              previousReputation: user.reputation,
              newReputation,
              inactivityDays,
            },
          },
        }),
      ]);

      processedCount++;
      totalDecayed += decayAmount;

      this.logger.debug(
        `Decayed ${decayAmount} reputation from user ${user.id}: ${user.reputation} -> ${newReputation}`,
      );
    }

    this.logger.log(
      `Reputation decay complete: ${processedCount} users processed, ${totalDecayed} total reputation decayed`,
    );

    return { processedCount, totalDecayed };
  }
}
