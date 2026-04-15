import { Module } from '@nestjs/common';
import { BountyExpirationService } from './bounty-expiration.service';

@Module({
  providers: [BountyExpirationService],
})
export class BountyModule {}