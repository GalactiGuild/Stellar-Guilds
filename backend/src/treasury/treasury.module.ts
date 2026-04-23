import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { QUEUE_NAMES } from '../queue/queue.constants';
import { TreasuryService } from './treasury.service';
import { TreasuryEventProcessor } from './treasury-event.processor';

@Module({
  imports: [
    BullModule.registerQueue({
      name: QUEUE_NAMES.ON_CHAIN_EVENTS,
    }),
  ],
  providers: [TreasuryService, TreasuryEventProcessor],
  exports: [TreasuryService],
})
export class TreasuryModule {}
