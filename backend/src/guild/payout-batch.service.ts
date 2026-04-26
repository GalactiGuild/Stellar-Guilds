import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export enum BatchStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
}

@Injectable()
export class PayoutBatchService {
  constructor(private prisma: PrismaService) {}

  async updateBatchStatus(
    batchId: string,
    status: BatchStatus | string,
    error?: string,
  ) {
    const batch = await this.prisma.payoutBatch.findUnique({
      where: { id: batchId },
    });

    if (!batch) {
      throw new NotFoundException('Payout batch not found');
    }

    // Ensure that a batch cannot move from SUCCESS back to PROCESSING
    if (
      batch.status === BatchStatus.SUCCESS &&
      status === BatchStatus.PROCESSING
    ) {
      throw new BadRequestException(
        'Cannot move batch from SUCCESS back to PROCESSING',
      );
    }

    const data: any = { status };

    // Record any error messages in a dedicated failureReason field if the status is FAILED
    if (status === BatchStatus.FAILED && error) {
      data.failureReason = error;
    }

    return this.prisma.payoutBatch.update({
      where: { id: batchId },
      data,
    });
  }
}
