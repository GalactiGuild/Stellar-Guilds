import { Test, TestingModule } from '@nestjs/testing';
import { TreasuryService } from './treasury.service';
import { PrismaService } from '../prisma/prisma.service';

describe('TreasuryService', () => {
  let service: TreasuryService;
  let prisma: PrismaService;

  const mockPrismaService = {
    treasuryTransaction: {
      findUnique: jest.fn(),
      create: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TreasuryService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<TreasuryService>(TreasuryService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('recordTreasuryTransfer', () => {
    const mockEvent = {
      guildId: 'guild-123',
      amount: '100.50',
      asset: 'STELLAR',
      fromAddress: '0x1234567890abcdef',
      toAddress: '0xfedcba0987654321',
      txHash: '0xabc123def456',
      timestamp: '2024-01-01T00:00:00Z',
    };

    it('should record a new treasury transfer', async () => {
      mockPrismaService.treasuryTransaction.findUnique.mockResolvedValue(null);
      mockPrismaService.treasuryTransaction.create.mockResolvedValue({
        id: 'tx-1',
        ...mockEvent,
        timestamp: new Date(mockEvent.timestamp),
        createdAt: new Date(),
      });

      const result = await service.recordTreasuryTransfer(mockEvent);

      expect(prisma.treasuryTransaction.findUnique).toHaveBeenCalledWith({
        where: { txHash: mockEvent.txHash },
      });
      expect(prisma.treasuryTransaction.create).toHaveBeenCalledWith({
        data: {
          guildId: mockEvent.guildId,
          amount: mockEvent.amount,
          asset: mockEvent.asset,
          fromAddress: mockEvent.fromAddress,
          toAddress: mockEvent.toAddress,
          txHash: mockEvent.txHash,
          timestamp: new Date(mockEvent.timestamp),
        },
      });
      expect(result).toBeDefined();
    });

    it('should handle duplicate txHash gracefully (idempotency)', async () => {
      // Reset mocks to ensure clean test
      jest.clearAllMocks();

      const existingTransaction = {
        id: 'tx-existing',
        ...mockEvent,
        timestamp: new Date(mockEvent.timestamp),
        createdAt: new Date(),
      };

      mockPrismaService.treasuryTransaction.findUnique.mockResolvedValue(
        existingTransaction,
      );

      const result = await service.recordTreasuryTransfer(mockEvent);

      expect(
        mockPrismaService.treasuryTransaction.findUnique,
      ).toHaveBeenCalledWith({
        where: { txHash: mockEvent.txHash },
      });
      expect(
        mockPrismaService.treasuryTransaction.create,
      ).not.toHaveBeenCalled();
      expect(result).toEqual(existingTransaction);
    });
  });

  describe('getGuildTransactions', () => {
    it('should return paginated transactions for a guild', async () => {
      const mockTransactions = [
        { id: 'tx-1', guildId: 'guild-123', amount: '100', asset: 'STELLAR' },
        { id: 'tx-2', guildId: 'guild-123', amount: '200', asset: 'STELLAR' },
      ];

      mockPrismaService.treasuryTransaction.findMany.mockResolvedValue(
        mockTransactions,
      );
      mockPrismaService.treasuryTransaction.count.mockResolvedValue(2);

      const result = await service.getGuildTransactions('guild-123', 0, 10);

      expect(result.data).toEqual(mockTransactions);
      expect(result.total).toBe(2);
      expect(result.skip).toBe(0);
      expect(result.take).toBe(10);
    });
  });
});
