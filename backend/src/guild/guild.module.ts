import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { GuildController } from './guild.controller';
import { GuildService } from './guild.service';
import { GuildBulkInviteService } from './guild-bulk-invite.service';
import { GuildInvitationCleanupService } from './guild-invitation-cleanup.service';
import { PayoutBatchService } from './payout-batch.service';
import { ApplicationService } from './application.service';
import { PrismaModule } from '../prisma/prisma.module';
import { MailerModule } from '../mailer/mailer.module';
import { StorageModule } from '../storage/storage.module';

@Module({
  imports: [ScheduleModule.forRoot(), PrismaModule, MailerModule, StorageModule],
  controllers: [GuildController],
  providers: [GuildService, GuildBulkInviteService, ApplicationService, GuildInvitationCleanupService],
  exports: [GuildService, ApplicationService],
  providers: [
    GuildService,
    GuildBulkInviteService,
    PayoutBatchService,
    ApplicationService,
  ],
  exports: [GuildService, PayoutBatchService, ApplicationService],
})
export class GuildModule {}
