import { Test, TestingModule } from '@nestjs/testing';
import { DailyHealthLogService } from './daily-health-log.service';
import { PrismaService } from '../prisma/prisma.service';

describe('DailyHealthLogService', () => {
  let service: DailyHealthLogService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    $queryRaw: jest.fn().mockResolvedValue([{ '?column?': 1 }]),
    user: { count: jest.fn().mockResolvedValue(100) },
    guild: { count: jest.fn().mockResolvedValue(25) },
    bounty: { count: jest.fn().mockResolvedValue(50) },
    bountyPayout: { count: jest.fn().mockResolvedValue(5) },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DailyHealthLogService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<DailyHealthLogService>(DailyHealthLogService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should build health summary with correct structure', async () => {
    const summary = await service.buildHealthSummary();

    expect(summary).toHaveProperty('timestamp');
    expect(summary).toHaveProperty('date');
    expect(summary).toHaveProperty('database');
    expect(summary).toHaveProperty('metrics');
    expect(summary).toHaveProperty('uptime');

    expect(summary.database).toHaveProperty('status', 'connected');
    expect(summary.database).toHaveProperty('connection', 'healthy');

    expect(summary.metrics).toHaveProperty('totalUsers', 100);
    expect(summary.metrics).toHaveProperty('totalGuilds', 25);
    expect(summary.metrics).toHaveProperty('totalBounties', 50);
    expect(summary.metrics).toHaveProperty('payoutsCreatedToday', 5);

    expect(summary.uptime).toHaveProperty('seconds');
    expect(summary.uptime).toHaveProperty('formatted');
  });

  it('should handle database disconnection gracefully', async () => {
    mockPrismaService.$queryRaw.mockRejectedValueOnce(
      new Error('Connection refused'),
    );

    const summary = await service.buildHealthSummary();

    expect(summary.database.status).toBe('disconnected');
    expect(summary.database.connection).toBe('unhealthy');
  });

  it('should generate daily health summary without throwing', async () => {
    const logSpy = jest.spyOn(service['logger'], 'log');

    await expect(
      service.generateDailyHealthSummary(),
    ).resolves.not.toThrow();

    expect(logSpy).toHaveBeenCalledWith(
      'Starting daily health summary generation...',
    );
    expect(logSpy).toHaveBeenCalledWith(
      'Daily health summary generated successfully.',
    );
  });

  it('should log error when summary generation fails', async () => {
    mockPrismaService.user.count.mockRejectedValueOnce(
      new Error('DB error'),
    );

    const errorSpy = jest.spyOn(service['logger'], 'error');

    await service.generateDailyHealthSummary();

    expect(errorSpy).toHaveBeenCalled();
    expect(errorSpy.mock.calls[0][0]).toContain(
      'Failed to generate daily health summary',
    );
  });
});
