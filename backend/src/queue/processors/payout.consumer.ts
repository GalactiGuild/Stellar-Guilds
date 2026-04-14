import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { QUEUE_NAMES } from '../queue.constants';
import { PayoutJobData } from '../queue.interfaces';
import { PrismaService } from '../../prisma/prisma.service';

@Processor(QUEUE_NAMES.BOUNTY_PAYOUTS, {
  concurrency: 3,
})
export class PayoutConsumer extends WorkerHost {
  private readonly logger = new Logger(PayoutConsumer.name);

  constructor(private prisma: PrismaService) {
    super();
  }

  async process(job: Job<PayoutJobData>): Promise<void> {
    const { bountyId, approvedAddresses } = job.data;

    this.logger.log(
      `[PayoutConsumer] Processing payout for bounty ${bountyId} to ${approvedAddresses.length} addresses`,
    );

    // Simulate processing signatures (2-second sleep as specified)
    await this.simulateSignatureProcessing(bountyId, approvedAddresses);

    // Update bounty status to COMPLETED after successful payout
    try {
      await this.prisma.bounty.update({
        where: { id: bountyId },
        data: { status: 'COMPLETED' },
      });
      this.logger.log(
        `[PayoutConsumer] Bounty ${bountyId} status updated to COMPLETED`,
      );
    } catch (err: any) {
      this.logger.warn(
        `[PayoutConsumer] Could not update bounty ${bountyId} status: ${err.message}`,
      );
    }

    this.logger.log(`[PayoutConsumer] Payout job ${job.id} completed`);
  }

  private async simulateSignatureProcessing(
    bountyId: string,
    addresses: string[],
  ): Promise<void> {
    // Simulate multi-signature coordination / heavy calculations
    const processingTime = 2000;
    this.logger.debug(
      `[PayoutConsumer] Simulating signature processing for ${bountyId} (${processingTime}ms)`,
    );
    await new Promise((resolve) => setTimeout(resolve, processingTime));

    this.logger.debug(
      `[PayoutConsumer] Signatures processed for bounty ${bountyId}, addresses: ${addresses.join(', ')}`,
    );
  }

  @OnWorkerEvent('active')
  onActive(job: Job<PayoutJobData>) {
    this.logger.debug(`[PayoutConsumer] Job ${job.id} is now active`);
  }

  @OnWorkerEvent('completed')
  onCompleted(job: Job<PayoutJobData>) {
    this.logger.debug(`[PayoutConsumer] Job ${job.id} has completed`);
  }

  @OnQueueFailed()
  onFailed(job: Job<PayoutJobData>, error: Error) {
    this.logger.error(
      `[PayoutConsumer] Job ${job.id} failed: ${error.message}`,
    );

    // Update local Database status back to FAILED on queue failure
    if (job?.data?.bountyId) {
      this.prisma.bounty
        .update({
          where: { id: job.data.bountyId },
          data: { status: 'FAILED' },
        })
        .catch((err) => {
          this.logger.error(
            `[PayoutConsumer] Failed to update bounty status to FAILED: ${err.message}`,
          );
        });
    }
  }
}
