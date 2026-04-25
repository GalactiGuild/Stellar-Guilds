import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditTrailService } from '../common/services/audit-trail.service';
import { AppBadRequestException } from '../common/exceptions/custom-http.exceptions';
import { StellarErrorCode } from '../common/errors/stellar-error-code.enum';

interface VerificationRequest {
  guildId: string;
  bountyId: string;
  requestedAmount: number;
}

@Injectable()
export class PayoutVerificationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditTrailService: AuditTrailService,
  ) {}

  async verifyGuildPayout({
    guildId,
    bountyId,
    requestedAmount,
  }: VerificationRequest): Promise<void> {
    const bounty = await this.prisma.bounty.findUnique({
      where: { id: bountyId },
      select: { id: true, rewardAmount: true },
    });

    if (!bounty) {
      throw new AppBadRequestException('Cannot verify payout: bounty not found', {
        errorCode: StellarErrorCode.NOT_FOUND,
      });
    }

    const expectedAmount = Number(bounty.rewardAmount);
    if (requestedAmount !== expectedAmount) {
      this.auditTrailService.record('PAYOUT_VERIFICATION_FAILED_AMOUNT_MISMATCH', {
        guildId,
        bountyId,
        requestedAmount,
        expectedAmount,
      });

      throw new AppBadRequestException(
        `Payout verification failed: requested amount ${requestedAmount} does not match configured bounty amount ${expectedAmount}.`,
        { errorCode: StellarErrorCode.PAYOUT_AMOUNT_MISMATCH },
      );
    }

    const guildBalance = await this.fetchGuildBalance(guildId);

    if (guildBalance < requestedAmount) {
      this.auditTrailService.record('PAYOUT_VERIFICATION_FAILED_INSUFFICIENT_FUNDS', {
        guildId,
        bountyId,
        requestedAmount,
        guildBalance,
      });

      throw new AppBadRequestException(
        `Payout verification failed: guild balance ${guildBalance} is lower than requested amount ${requestedAmount}.`,
        { errorCode: StellarErrorCode.INSUFFICIENT_FUNDS },
      );
    }

    this.auditTrailService.record('PAYOUT_VERIFICATION_PASSED', {
      guildId,
      bountyId,
      requestedAmount,
      guildBalance,
    });
  }

  private async fetchGuildBalance(guildId: string): Promise<number> {
    const horizonBaseUrl =
      process.env.MOCK_HORIZON_URL ?? 'http://localhost:4000/mock-horizon';
    const response = await fetch(
      `${horizonBaseUrl}/accounts/${guildId}/balance`,
      {
        method: 'GET',
      },
    );

    if (!response.ok) {
      throw new AppBadRequestException(
        `Payout verification failed: could not fetch guild balance from Horizon mock endpoint (status ${response.status}).`,
      );
    }

    const payload = (await response.json()) as { balance?: number | string };
    const parsedBalance = Number(payload.balance);

    if (!Number.isFinite(parsedBalance)) {
      throw new AppBadRequestException(
        'Payout verification failed: invalid balance response from Horizon mock endpoint.',
      );
    }

    return parsedBalance;
  }
}
