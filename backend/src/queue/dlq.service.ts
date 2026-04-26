import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { QUEUE_NAMES } from './queue.constants';

@Injectable()
export class DlqService {
  private readonly logger = new Logger(DlqService.name);

  constructor(
    @InjectQueue(QUEUE_NAMES.DUMMY) private dummyQueue: Queue,
    @InjectQueue(QUEUE_NAMES.EMAIL) private emailQueue: Queue,
    @InjectQueue(QUEUE_NAMES.ON_CHAIN_EVENTS) private onChainEventsQueue: Queue,
  ) {}

  private getQueue(type: string): Queue {
    switch (type) {
      case 'dummy':
        return this.dummyQueue;
      case 'email':
        return this.emailQueue;
      case 'on-chain-events':
        return this.onChainEventsQueue;
      default:
        throw new NotFoundException(`Unknown queue type: ${type}`);
    }
  }

  async listFailedJobs(type: string) {
    const queue = this.getQueue(type);
    return queue.getFailed();
  }

  async replayJob(type: string, jobId: string) {
    const queue = this.getQueue(type);
    const job = await queue.getJob(jobId);
    if (!job)
      throw new NotFoundException(`Job ${jobId} not found in ${type} queue`);

    await job.retry();
    this.logger.log(`Replayed job ${jobId} from ${type} queue`);
    return { message: 'Job replayed successfully' };
  }

  async resolveJob(type: string, jobId: string, notes: string) {
    const queue = this.getQueue(type);
    const job = await queue.getJob(jobId);
    if (!job)
      throw new NotFoundException(`Job ${jobId} not found in ${type} queue`);

    // In BullMQ, we can remove the job to "resolve" it from failed status
    await job.remove();
    this.logger.log(
      `Resolved (removed) job ${jobId} from ${type} queue. Notes: ${notes}`,
    );
    return { message: 'Job resolved and removed from DLQ' };
  }
}
