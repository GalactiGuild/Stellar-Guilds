import { Test, TestingModule } from '@nestjs/testing';
import { PayoutVerificationService } from './payout-verification.service';
import { PrismaService } from '../prisma/prisma.service';
import { AuditTrailService } from '../common/services/audit-trail.service';
import { AppBadRequestException } from '../common/exceptions/custom-http.exceptions';

describe('PayoutVerificationService', () => {
  let service: PayoutVerificationService;
  const prismaMock = {
    bounty: {
      findUnique: jest.fn(),
    },
  };
  const auditTrailMock = {
    record: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PayoutVerificationService,
        { provide: PrismaService, useValue: prismaMock },
        { provide: AuditTrailService, useValue: auditTrailMock },
      ],
    }).compile();

    service = module.get(PayoutVerificationService);
    jest.clearAllMocks();
  });

  it('passes when amount matches and guild has enough balance', async () => {
    prismaMock.bounty.findUnique.mockResolvedValue({
      id: 'bounty-1',
      rewardAmount: 100,
    });
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ balance: 150 }),
    } as any);

    await expect(
      service.verifyGuildPayout({
        guildId: 'guild-1',
        bountyId: 'bounty-1',
        requestedAmount: 100,
      }),
    ).resolves.toBeUndefined();
  });

  it('rejects when requested amount mismatches bounty amount', async () => {
    prismaMock.bounty.findUnique.mockResolvedValue({
      id: 'bounty-1',
      rewardAmount: 100,
    });

    await expect(
      service.verifyGuildPayout({
        guildId: 'guild-1',
        bountyId: 'bounty-1',
        requestedAmount: 110,
      }),
    ).rejects.toThrow(AppBadRequestException);
  });
});
