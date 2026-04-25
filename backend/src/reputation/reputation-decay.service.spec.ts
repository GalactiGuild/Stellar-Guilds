import { Test, TestingModule } from '@nestjs/testing';
import { ReputationDecayService } from './reputation-decay.service';
import { PrismaService } from '../prisma/prisma.service';
import { Logger } from '@nestjs/common';

describe('ReputationDecayService', () => {
  let service: ReputationDecayService;
  let prismaService: jest.Mocked<PrismaService>;
  let logger: jest.Mocked<Logger>;

  const mockUser = {
    id: 'user-1',
    email: 'test@example.com',
    username: 'testuser',
    reputationEntries: [
      { points: 100 },
      { points: 50 },
    ],
  };

  const mockUserWithNoReputation = {
    id: 'user-2',
    email: 'test2@example.com',
    username: 'testuser2',
    reputationEntries: [],
  };

  const mockUserWithLowReputation = {
    id: 'user-3',
    email: 'test3@example.com',
    username: 'testuser3',
    reputationEntries: [{ points: 10 }],
  };

  beforeEach(async () => {
    const mockPrismaService = {
      user: {
        findMany: jest.fn(),
      },
      reputationEntry: {
        create: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReputationDecayService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<ReputationDecayService>(ReputationDecayService);
    prismaService = module.get(PrismaService);
    logger = service['logger'] as jest.Mocked<Logger>;
    
    // Mock logger methods to avoid console output during tests
    jest.spyOn(logger, 'log').mockImplementation();
    jest.spyOn(logger, 'error').mockImplementation();
    jest.spyOn(logger, 'debug').mockImplementation();
    jest.spyOn(logger, 'warn').mockImplementation();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('handleReputationDecay', () => {
    it('should process inactive users with reputation', async () => {
      // Arrange
      prismaService.user.findMany.mockResolvedValue([mockUser]);
      prismaService.reputationEntry.create.mockResolvedValue({} as any);

      // Act
      await service.handleReputationDecay();

      // Assert
      expect(prismaService.user.findMany).toHaveBeenCalledWith({
        where: {
          lastLoginAt: {
            lt: expect.any(Date),
          },
          isActive: true,
        },
        include: {
          reputationEntries: {
            select: {
              points: true,
            },
          },
        },
      });

      // Calculate expected decay: 5% of 150 = 7.5 -> 7 (floor)
      expect(prismaService.reputationEntry.create).toHaveBeenCalledWith({
        data: {
          userId: 'user-1',
          points: -7,
          reason: 'REPUTATION_DECAY',
          metadata: {
            previousTotal: 150,
            newTotal: 143,
            decayPercentage: 0.05,
            inactivityDays: 180,
            processedAt: expect.any(String),
          },
        },
      });
    });

    it('should skip users with no reputation', async () => {
      // Arrange
      prismaService.user.findMany.mockResolvedValue([mockUserWithNoReputation]);

      // Act
      await service.handleReputationDecay();

      // Assert
      expect(prismaService.reputationEntry.create).not.toHaveBeenCalled();
    });

    it('should skip users with very low reputation', async () => {
      // Arrange
      prismaService.user.findMany.mockResolvedValue([mockUserWithLowReputation]);

      // Act
      await service.handleReputationDecay();

      // Assert
      expect(prismaService.reputationEntry.create).not.toHaveBeenCalled();
    });

    it('should handle multiple inactive users', async () => {
      // Arrange
      prismaService.user.findMany.mockResolvedValue([mockUser, mockUserWithLowReputation]);
      prismaService.reputationEntry.create.mockResolvedValue({} as any);

      // Act
      await service.handleReputationDecay();

      // Assert
      expect(prismaService.reputationEntry.create).toHaveBeenCalledTimes(1);
    });

    it('should handle database errors gracefully', async () => {
      // Arrange
      prismaService.user.findMany.mockRejectedValue(new Error('Database error'));

      // Act & Assert
      await expect(service.handleReputationDecay()).rejects.toThrow('Database error');
      expect(logger.error).toHaveBeenCalledWith(
        'Error during reputation decay process:',
        'Database error'
      );
    });
  });

  describe('getDecayStatistics', () => {
    it('should return statistics for inactive users', async () => {
      // Arrange
      prismaService.user.findMany.mockResolvedValue([mockUser, mockUserWithNoReputation]);

      // Act
      const stats = await service.getDecayStatistics();

      // Assert
      expect(stats).toEqual({
        totalInactiveUsers: 2,
        usersWithReputation: 1,
        averageReputation: 150, // (100 + 50) / 1
      });
    });

    it('should return zero statistics when no inactive users', async () => {
      // Arrange
      prismaService.user.findMany.mockResolvedValue([]);

      // Act
      const stats = await service.getDecayStatistics();

      // Assert
      expect(stats).toEqual({
        totalInactiveUsers: 0,
        usersWithReputation: 0,
        averageReputation: 0,
      });
    });

    it('should return zero average when users have no reputation', async () => {
      // Arrange
      prismaService.user.findMany.mockResolvedValue([mockUserWithNoReputation]);

      // Act
      const stats = await service.getDecayStatistics();

      // Assert
      expect(stats).toEqual({
        totalInactiveUsers: 1,
        usersWithReputation: 0,
        averageReputation: 0,
      });
    });
  });

  describe('processUserReputationDecay', () => {
    it('should calculate correct decay amount', async () => {
      // Arrange
      prismaService.reputationEntry.create.mockResolvedValue({} as any);

      // Act
      await service['processUserReputationDecay'](mockUser);

      // Assert
      // 5% of 150 = 7.5 -> 7 (floor)
      expect(prismaService.reputationEntry.create).toHaveBeenCalledWith({
        data: {
          userId: 'user-1',
          points: -7,
          reason: 'REPUTATION_DECAY',
          metadata: {
            previousTotal: 150,
            newTotal: 143,
            decayPercentage: 0.05,
            inactivityDays: 180,
            processedAt: expect.any(String),
          },
        },
      });
    });

    it('should never let reputation drop below zero', async () => {
      // Arrange
      const userWithMinimalReputation = {
        ...mockUser,
        reputationEntries: [{ points: 5 }],
      };
      prismaService.reputationEntry.create.mockResolvedValue({} as any);

      // Act
      await service['processUserReputationDecay'](userWithMinimalReputation);

      // Assert
      // 5% of 5 = 0.25 -> 0 (floor), so no decay should occur
      expect(prismaService.reputationEntry.create).not.toHaveBeenCalled();
    });

    it('should handle individual user processing errors', async () => {
      // Arrange
      prismaService.reputationEntry.create.mockRejectedValue(new Error('Individual error'));

      // Act
      await service['processUserReputationDecay'](mockUser);

      // Assert
      expect(logger.error).toHaveBeenCalledWith(
        'Failed to process reputation decay for user testuser:',
        'Individual error'
      );
    });
  });
});
