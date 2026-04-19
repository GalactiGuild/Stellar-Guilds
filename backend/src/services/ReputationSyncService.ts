import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class ReputationSyncService {
  private readonly logger = new Logger(ReputationSyncService.name);
  private mockRedis: Record<string, number> = {};

  @Cron(CronExpression.EVERY_HOUR)
  async syncUserReputation() {
    this.logger.log('Starting user reputation synchronization...');

    // Mock query for completed bounties
    const mockBounties = this.getMockCompletedBounties();

    // Aggregate reputation
    const reputationMap = this.aggregateReputation(mockBounties);

    // Store in mock Redis
    for (const [userId, score] of Object.entries(reputationMap)) {
      this.mockRedis[userId] = score;
    }

    this.logger.log(`Successfully synchronized reputation for ${Object.keys(reputationMap).length} users`);
  }

  private getMockCompletedBounties(): Array<{ userId: string; bountyType: 'standard' | 'massive' }> {
    // Mock data - in real app this would query the database
    return [
      { userId: 'user1', bountyType: 'standard' },
      { userId: 'user2', bountyType: 'massive' },
      { userId: 'user1', bountyType: 'standard' },
      { userId: 'user3', bountyType: 'standard' },
    ];
  }

  private aggregateReputation(bounties: Array<{ userId: string; bountyType: 'standard' | 'massive' }>): Record<string, number> {
    const reputation: Record<string, number> = {};

    for (const bounty of bounties) {
      const points = bounty.bountyType === 'massive' ? 50 : 10;
      reputation[bounty.userId] = (reputation[bounty.userId] || 0) + points;
    }

    return reputation;
  }

  // For testing purposes
  getMockRedis() {
    return this.mockRedis;
  }
}