import { Injectable } from '@nestjs/common';
import { ReputationReason } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ReputationEventService {
  constructor(private readonly prisma: PrismaService) {}

  async addReputationEvent(
    userId: string,
    amount: number,
    reason: ReputationReason,
    linkedBountyId?: string,
  ) {
    return this.prisma.reputationEvent.create({
      data: { userId, amount, reason, linkedBountyId },
    });
  }

  async getEventsByUser(userId: string) {
    return this.prisma.reputationEvent.findMany({
      where: { userId },
      orderBy: { timestamp: 'desc' },
    });
  }
}
