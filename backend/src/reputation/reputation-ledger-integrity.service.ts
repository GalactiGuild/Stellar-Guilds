import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ReputationLedgerIntegrityService {
  constructor(private readonly prisma: PrismaService) {}

  async verifyUserReputationSum(userId: string): Promise<{
    userId: string;
    expectedTotal: number;
    actualTotal: number;
    isValid: boolean;
  }> {
    const entries = await this.prisma.reputationEntry.findMany({
      where: { userId },
      select: { points: true },
    });

    const expectedTotal = entries.reduce(
      (sum: number, e: { points: number }) => sum + e.points,
      0,
    );

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { reputationScore: true },
    });

    const actualTotal = user?.reputationScore ?? 0;
    const isValid = expectedTotal === actualTotal;

    return { userId, expectedTotal, actualTotal, isValid };
  }

  async runFullIntegrityCheck(): Promise<{
    checked: number;
    invalid: number;
    invalidUsers: string[];
  }> {
    const users = await this.prisma.user.findMany({ select: { id: true } });
    const results = await Promise.all(
      users.map((u: { id: string }) => this.verifyUserReputationSum(u.id)),
    );
    const invalid = results.filter((r: any) => !r.isValid);
    return {
      checked: results.length,
      invalid: invalid.length,
      invalidUsers: invalid.map((r: any) => r.userId),
    };
  }
}
