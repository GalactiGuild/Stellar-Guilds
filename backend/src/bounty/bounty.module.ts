import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { BountyService } from './bounty.service';
import { BountyController } from './bounty.controller';
import { BountyReminderService } from './bounty-reminder.service';
import { PrismaModule } from '../prisma/prisma.module';
import { MailerModule } from '../mailer/mailer.module';

@Module({
  imports: [ScheduleModule.forRoot(), PrismaModule, MailerModule],
  providers: [BountyService, BountyReminderService],
  controllers: [BountyController],
  exports: [BountyService],
})
export class BountyModule {}
