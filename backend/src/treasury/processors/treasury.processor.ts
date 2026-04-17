import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { TreasuryMonitorService } from '../treasury-monitor.service';
import { QUEUE_NAMES } from '../../queue/queue.constants';

export interface TreasuryCheckJobData {
  triggeredAt: Date;
}

@Processor(QUEUE_NAMES.TREASURY_MONITOR)
export class TreasuryProcessor extends WorkerHost {
  private readonly logger = new Logger(TreasuryProcessor.name);

  constructor(private readonly treasuryMonitor: TreasuryMonitorService) {
    super();
  }

  async process(job: Job<TreasuryCheckJobData>): Promise<void> {
    this.logger.log(
      `Processing treasury check job ${job.id} triggered at ${job.data.triggeredAt}`,
    );

    try {
      const alerts = await this.treasuryMonitor.checkAllGuilds();
      
      this.logger.log(
        `Treasury check completed. ${alerts.length} alerts triggered.`,
      );
    } catch (error) {
      this.logger.error(
        `Treasury check job ${job.id} failed: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw error;
    }
  }

  @OnWorkerEvent('active')
  onActive(job: Job<TreasuryCheckJobData>) {
    this.logger.debug(`Treasury check job ${job.id} is now active`);
  }

  @OnWorkerEvent('completed')
  onCompleted(job: Job<TreasuryCheckJobData>) {
    this.logger.log(`Treasury check job ${job.id} completed successfully`);
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job<TreasuryCheckJobData>, error: Error) {
    this.logger.error(
      `Treasury check job ${job.id} failed: ${error.message}`,
    );
  }
}
