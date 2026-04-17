import { Test, TestingModule } from '@nestjs/testing';
import { ReputationDecayService } from './reputation-decay.service';
import { PrismaService } from '../prisma/prisma.service';

describe('ReputationDecayService', () => {
  let service: ReputationDecayService;
  let prismaMock: {
    user: { findMany: jest.Mock; update: jest.Mock };
    activityLog: { findFirst: jest.Mock; create: jest.Mock };
    reputationHistory: { create: jest.Mock };
    $transaction: jest.Mock;
  };

  beforeEach(async () => {
    prismaMock = {
      user: { findMany: jest.fn(), update: jest.fn() },
      activityLog: { findFirst: jest.fn(), create: jest.fn() },
      reputationHistory: { create: jest.fn() },
      $transaction: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReputationDecayService,
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();

    service = module.get<ReputationDecayService>(ReputationDecayService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const decayJobData = {
    triggeredAt: new Date(),
    inactivityDays: 180,
    decayPercentage: 5,
  };

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should skip users with recent activity', async () => {
    prismaMock.user.findMany.mockResolvedValue([
      { id: 'user-1', reputation: 100 },
    ]);
    prismaMock.activityLog.findFirst.mockResolvedValue({
      id: 'act-1',
      userId: 'user-1',
    });

    const result = await service.processDecay(decayJobData);

    expect(result.processedCount).toBe(0);
    expect(result.totalDecayed).toBe(0);
    expect(prismaMock.$transaction).not.toHaveBeenCalled();
  });

  it('should decay reputation for inactive users', async () => {
    prismaMock.user.findMany.mockResolvedValue([
      { id: 'user-1', reputation: 100 },
    ]);
    prismaMock.activityLog.findFirst.mockResolvedValue(null);
    prismaMock.$transaction.mockResolvedValue([]);

    const result = await service.processDecay(decayJobData);

    // 5% of 100 = 5
    expect(result.processedCount).toBe(1);
    expect(result.totalDecayed).toBe(5);
    expect(prismaMock.$transaction).toHaveBeenCalledTimes(1);
  });

  it('should floor reputation at zero', async () => {
    prismaMock.user.findMany.mockResolvedValue([
      { id: 'user-1', reputation: 3 },
    ]);
    prismaMock.activityLog.findFirst.mockResolvedValue(null);
    prismaMock.$transaction.mockResolvedValue([]);

    const result = await service.processDecay(decayJobData);

    // 5% of 3 = 0.15, but minimum decay is 1
    expect(result.processedCount).toBe(1);
    expect(result.totalDecayed).toBe(1);
  });

  it('should not decay users with zero reputation', async () => {
    prismaMock.user.findMany.mockResolvedValue([]);

    const result = await service.processDecay(decayJobData);

    expect(result.processedCount).toBe(0);
    expect(result.totalDecayed).toBe(0);
    expect(prismaMock.$transaction).not.toHaveBeenCalled();
  });

  it('should handle multiple users correctly', async () => {
    prismaMock.user.findMany.mockResolvedValue([
      { id: 'user-1', reputation: 200 },
      { id: 'user-2', reputation: 50 },
      { id: 'user-3', reputation: 100 },
    ]);

    // user-1 has recent activity, user-2 and user-3 do not
    prismaMock.activityLog.findFirst
      .mockResolvedValueOnce({ id: 'act-1', userId: 'user-1' })
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(null);

    prismaMock.$transaction.mockResolvedValue([]);

    const result = await service.processDecay(decayJobData);

    // user-2: 5% of 50 = 2 (floor)
    // user-3: 5% of 100 = 5
    expect(result.processedCount).toBe(2);
    expect(result.totalDecayed).toBe(7);
  });
});
