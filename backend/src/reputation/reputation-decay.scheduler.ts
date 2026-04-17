import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { QUEUE_NAMES } from '../queue/queue.constants';
import { ReputationDecayJobData } from '../queue/queue.interfaces';

/**
 * Default configuration for reputation decay.
 */
const INACTIVITY_DAYS = 180;
const DECAY_PERCENTAGE = 5;

@Injectable()
export class ReputationDecayScheduler {
  private readonly logger = new Logger(ReputationDecayScheduler.name);

  constructor(
    @InjectQueue(QUEUE_NAMES.REPUTATION_DECAY)
    private readonly reputationDecayQueue: Queue,
  ) {}

  /**
   * Runs at midnight on the first day of every month.
   * Enqueues a reputation-decay job for the BullMQ processor.
   */
  @Cron(CronExpression.EVERY_1ST_DAY_OF_MONTH_AT_MIDNIGHT)
  async scheduleDecayJob(): Promise<void> {
    const data: ReputationDecayJobData = {
      triggeredAt: new Date(),
      inactivityDays: INACTIVITY_DAYS,
      decayPercentage: DECAY_PERCENTAGE,
    };

    const job = await this.reputationDecayQueue.add(
      'monthly-reputation-decay',
      data,
      {
        attempts: 3,
        backoff: { type: 'exponential', delay: 5000 },
        removeOnComplete: { age: 7 * 24 * 3600 },
        removeOnFail: { age: 7 * 24 * 3600 },
      },
    );

    this.logger.log(
      `Enqueued reputation decay job ${job.id} (inactivity=${INACTIVITY_DAYS}d, decay=${DECAY_PERCENTAGE}%)`,
    );
  }
}
