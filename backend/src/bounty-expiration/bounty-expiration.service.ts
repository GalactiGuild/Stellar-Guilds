import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BountyExpirationService {
  private readonly logger = new Logger(BountyExpirationService.name);

  constructor(private prisma: PrismaService) {}

  @Cron(CronExpression.EVERY_10_MINUTES)
  async handleExpiredBounties() {
    try {
      const now = new Date();
      
      // Find bounties that are OPEN and expired
      const expiredBounties = await this.prisma.bounty.findMany({
        where: {
          status: 'OPEN',
          expiresAt: {
            lt: now,
          },
        },
      });

      if (expiredBounties.length === 0) {
        this.logger.log('No expired bounties found');
        return;
      }

      // Update each expired bounty to EXPIRED status
      const updateResults = await Promise.all(
        expiredBounties.map((bounty) =>
          this.prisma.bounty.update({
            where: { id: bounty.id },
            data: { status: 'EXPIRED' },
          })
        )
      );

      this.logger.log(`Processed ${updateResults.length} expired bounties`);
      return updateResults;
    } catch (error) {
      this.logger.error(`Failed to process expired bounties: ${error}`);
      throw error;
    }
  }
}