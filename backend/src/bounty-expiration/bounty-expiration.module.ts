import { Module } from '@nestjs/common';
import { BountyExpirationService } from './bounty-expiration.service';
import { ScheduleModule } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  imports: [ScheduleModule.forRoot()],
  providers: [BountyExpirationService, PrismaService],
})
export class BountyExpirationModule {}
