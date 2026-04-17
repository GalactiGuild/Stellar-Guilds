import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ScheduleModule } from '@nestjs/schedule';
import { PrismaModule } from '../prisma/prisma.module';
import { QUEUE_NAMES } from '../queue/queue.constants';
import { ReputationDecayService } from './reputation-decay.service';
import { ReputationDecayProcessor } from './reputation-decay.processor';
import { ReputationDecayScheduler } from './reputation-decay.scheduler';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    PrismaModule,
    BullModule.registerQueue({
      name: QUEUE_NAMES.REPUTATION_DECAY,
    }),
  ],
  providers: [
    ReputationDecayService,
    ReputationDecayProcessor,
    ReputationDecayScheduler,
  ],
  exports: [ReputationDecayService],
})
export class ReputationModule {}
