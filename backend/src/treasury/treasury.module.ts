import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { QUEUE_NAMES } from '../queue/queue.constants';
import { TreasuryService } from './treasury.service';
import { TreasuryEventProcessor } from './treasury-event.processor';
import { PayoutReportService } from './payout-report.service';
import { PayoutVerificationService } from './payout-verification.service';
import { AuditTrailService } from '../common/services/audit-trail.service';

@Module({
  imports: [
    BullModule.registerQueue({
      name: QUEUE_NAMES.ON_CHAIN_EVENTS,
    }),
  ],
  providers: [
    TreasuryService,
    TreasuryEventProcessor,
    PayoutReportService,
    PayoutVerificationService,
    AuditTrailService,
  ],
  exports: [TreasuryService, PayoutReportService, PayoutVerificationService],
})
export class TreasuryModule {}
