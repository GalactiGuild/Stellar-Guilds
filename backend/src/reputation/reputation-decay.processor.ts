import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { QUEUE_NAMES } from '../queue/queue.constants';
import { ReputationDecayJobData } from '../queue/queue.interfaces';
import { ReputationDecayService } from './reputation-decay.service';

@Processor(QUEUE_NAMES.REPUTATION_DECAY, {
  concurrency: 1,
})
export class ReputationDecayProcessor extends WorkerHost {
  private readonly logger = new Logger(ReputationDecayProcessor.name);

  constructor(
    private readonly reputationDecayService: ReputationDecayService,
  ) {
    super();
  }

  async process(job: Job<ReputationDecayJobData>): Promise<{
    processedCount: number;
    totalDecayed: number;
  }> {
    this.logger.log(
      `Processing reputation decay job ${job.id} with data: ${JSON.stringify(job.data)}`,
    );

    const result = await this.reputationDecayService.processDecay(job.data);

    this.logger.log(
      `Reputation decay job ${job.id} completed: ${result.processedCount} users processed, ${result.totalDecayed} reputation decayed`,
    );

    return result;
  }

  @OnWorkerEvent('active')
  onActive(job: Job<ReputationDecayJobData>) {
    this.logger.debug(`Reputation decay job ${job.id} is now active`);
  }

  @OnWorkerEvent('completed')
  onCompleted(job: Job<ReputationDecayJobData>) {
    this.logger.debug(`Reputation decay job ${job.id} has completed`);
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job<ReputationDecayJobData>, error: Error) {
    this.logger.error(
      `Reputation decay job ${job.id} failed: ${error.message}`,
    );
  }
}
