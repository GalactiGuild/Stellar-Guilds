import { Module, OnModuleInit, Logger } from '@nestjs/common';
import { BullModule, InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { TreasuryMonitorService } from './treasury-monitor.service';
import { TreasuryProcessor } from './processors/treasury.processor';
import { PrismaModule } from '../prisma/prisma.module';
import { MailerModule } from '../mailer/mailer.module';
import { QUEUE_NAMES } from '../queue/queue.constants';

@Module({
  imports: [
    PrismaModule,
    MailerModule,
    BullModule.registerQueue({
      name: QUEUE_NAMES.TREASURY_MONITOR,
    }),
  ],
  providers: [TreasuryMonitorService, TreasuryProcessor],
  exports: [TreasuryMonitorService],
})
export class TreasuryModule implements OnModuleInit {
  private readonly logger = new Logger(TreasuryModule.name);

  constructor(
    @InjectQueue(QUEUE_NAMES.TREASURY_MONITOR)
    private readonly treasuryQueue: Queue,
  ) {}

  async onModuleInit() {
    // Schedule a daily cron job at 9:00 AM UTC
    // The cron pattern: minute hour day-of-month month day-of-week
    // '0 9 * * *' = every day at 9:00 AM UTC
    const cronExpression = process.env.TREASURY_CHECK_CRON || '0 9 * * *';

    try {
      await this.treasuryQueue.add(
        'treasury-check',
        { triggeredAt: new Date() },
        {
          repeat: {
            pattern: cronExpression,
          },
          jobId: 'treasury-daily-check', // Prevents duplicate jobs
        },
      );

      this.logger.log(
        `Treasury monitoring cron job scheduled with pattern: ${cronExpression}`,
      );
    } catch (error) {
      this.logger.warn(
        `Failed to schedule treasury cron job (Redis may not be available): ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }
}
