import { Test, TestingModule } from '@nestjs/testing';
import { GuildService } from './guild.service';
import { PrismaService } from '../prisma/prisma.service';
import { MailerService } from '../mailer/mailer.service';
import { StorageService } from '../storage/storage.service';

describe('GuildService (Financial Reports)', () => {
  let service: GuildService;
  let prisma: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GuildService,
        {
          provide: PrismaService,
          useValue: {
            guildPayout: {
              groupBy: jest.fn(),
            },
          },
        },
        { provide: MailerService, useValue: {} },
        { provide: StorageService, useValue: {} },
      ],
    }).compile();

    service = module.get<GuildService>(GuildService);
    prisma = module.get(PrismaService);
  });

  it('should aggregate financials correctly across 10 payouts', async () => {
    const guildId = 'test-guild-id';

    // Mock data for byAsset
    const mockByAsset = [
      { asset: 'XLM', _sum: { amount: 500 } },
      { asset: 'USDC', _sum: { amount: 200 } },
    ];

    // Mock data for byCategory
    const mockByCategory = [
      { bountyCategory: 'Development', _sum: { amount: 400 } },
      { bountyCategory: 'Design', _sum: { amount: 200 } },
      { bountyCategory: null, _sum: { amount: 100 } }, // Uncategorized
    ];

    prisma.guildPayout.groupBy.mockImplementation(({ by }: any) => {
      if (by.includes('asset')) return Promise.resolve(mockByAsset);
      if (by.includes('bountyCategory')) return Promise.resolve(mockByCategory);
      return Promise.resolve([]);
    });

    const report = await service.getFinancialReport(guildId);

    expect(report.period).toBe('last_30_days');
    expect(report.byAsset).toHaveLength(2);
    expect(report.byAsset).toContainEqual({ asset: 'XLM', total: 500 });
    expect(report.byAsset).toContainEqual({ asset: 'USDC', total: 200 });

    expect(report.byCategory).toHaveLength(3);
    expect(report.byCategory).toContainEqual({
      category: 'Development',
      total: 400,
    });
    expect(report.byCategory).toContainEqual({
      category: 'Design',
      total: 200,
    });
    expect(report.byCategory).toContainEqual({
      category: 'Uncategorized',
      total: 100,
    });

    expect(prisma.guildPayout.groupBy).toHaveBeenCalledTimes(2);
  });
});
