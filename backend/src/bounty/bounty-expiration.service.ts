import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';

enum BountyStatus {
  OPEN = 'OPEN',
  CLAIMED = 'CLAIMED',
  UNDER_REVIEW = 'UNDER_REVIEW',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  EXPIRED = 'EXPIRED',
}

interface Bounty {
  id: string;
  status: BountyStatus;
  expiresAt: Date;
  title: string;
}

@Injectable()
export class BountyExpirationService {
  private readonly logger = new Logger(BountyExpirationService.name);
  private mockBounties: Bounty[] = [
    {
      id: '1',
      status: BountyStatus.OPEN,
      expiresAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // Expired yesterday
      title: 'Fix authentication bug',
    },
    {
      id: '2',
      status: BountyStatus.OPEN,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // Expires tomorrow
      title: 'Add new feature',
    },
    {
      id: '3',
      status: BountyStatus.OPEN,
      expiresAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // Expired 2 days ago
      title: 'Update documentation',
    },
    {
      id: '4',
      status: BountyStatus.COMPLETED,
      expiresAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // Expired but already completed
      title: 'Write tests',
    },
  ];

  @Cron('*/10 * * * *') // Run every 10 minutes
  async handleBountyExpiration() {
    this.logger.log('Starting bounty expiration check...');
    
    const now = new Date();
    const expiredBounties = this.findExpiredBounties(now);
    
    let processedCount = 0;
    
    for (const bounty of expiredBounties) {
      await this.expireBounty(bounty.id);
      processedCount++;
      this.logger.log(`Expired bounty: ${bounty.id} - ${bounty.title}`);
    }
    
    this.logger.log(`Processed ${processedCount} expired bounties`);
  }

  private findExpiredBounties(now: Date): Bounty[] {
    return this.mockBounties.filter(
      bounty => bounty.status === BountyStatus.OPEN && bounty.expiresAt < now
    );
  }

  private async expireBounty(bountyId: string): Promise<void> {
    // Mock database update
    const bounty = this.mockBounties.find(b => b.id === bountyId);
    if (bounty) {
      bounty.status = BountyStatus.EXPIRED;
    }
    
    // Simulate async database operation
    return new Promise(resolve => {
      setTimeout(resolve, 10);
    });
  }

  // Method for testing purposes to get current bounties state
  getMockBounties(): Bounty[] {
    return this.mockBounties;
  }

  // Method for testing to manually trigger expiration check
  async triggerExpirationCheck(): Promise<void> {
    await this.handleBountyExpiration();
  }
}