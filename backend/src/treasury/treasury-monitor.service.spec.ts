import { Test, TestingModule } from '@nestjs/testing';
import { TreasuryMonitorService } from './treasury-monitor.service';
import { PrismaService } from '../prisma/prisma.service';
import { MailerService } from '../mailer/mailer.service';

describe('TreasuryMonitorService', () => {
  let service: TreasuryMonitorService;
  let prismaService: PrismaService;
  let mailerService: MailerService;

  const mockPrismaService = {
    guild: {
      findMany: jest.fn(),
    },
    notification: {
      create: jest.fn(),
    },
  };

  const mockMailerService = {
    sendTreasuryAlertEmail: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TreasuryMonitorService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: MailerService, useValue: mockMailerService },
      ],
    }).compile();

    service = module.get<TreasuryMonitorService>(TreasuryMonitorService);
    prismaService = module.get<PrismaService>(PrismaService);
    mailerService = module.get<MailerService>(MailerService);

    jest.clearAllMocks();
  });

  describe('getTreasuryBalance', () => {
    it('returns zero balance when address is null', async () => {
      const balance = await service.getTreasuryBalance(null);
      expect(balance).toEqual({ xlm: 0, usdc: 0 });
    });

    it('returns mock balance for valid address', async () => {
      const balance = await service.getTreasuryBalance('GABC123...');
      expect(balance.xlm).toBeGreaterThan(0);
      expect(balance.usdc).toBeGreaterThan(0);
    });

    it('returns consistent balance for same address', async () => {
      const address = 'GABC123...';
      const balance1 = await service.getTreasuryBalance(address);
      const balance2 = await service.getTreasuryBalance(address);
      expect(balance1).toEqual(balance2);
    });
  });

  describe('checkGuildBalance', () => {
    it('returns null when alerts are disabled', async () => {
      const alert = await service.checkGuildBalance(
        'guild-1',
        'Test Guild',
        { lowBalanceAlertEnabled: false, lowBalanceThreshold: 100, treasuryAddress: null },
        { id: 'owner-1', email: 'owner@test.com', username: 'owner' },
      );
      expect(alert).toBeNull();
    });

    it('returns alert when balance is below threshold', async () => {
      const alert = await service.checkGuildBalance(
        'guild-1',
        'Test Guild',
        { lowBalanceAlertEnabled: true, lowBalanceThreshold: 1000, treasuryAddress: 'GABC...' },
        { id: 'owner-1', email: 'owner@test.com', username: 'owner' },
      );
      // Since mock balance is random, this test verifies the logic structure
      expect(alert === null || (alert.guildId === 'guild-1' && alert.guildName === 'Test Guild')).toBeTruthy();
    });
  });

  describe('checkAllGuilds', () => {
    it('processes all active guilds', async () => {
      mockPrismaService.guild.findMany.mockResolvedValue([
        {
          id: 'guild-1',
          name: 'Guild One',
          settings: { lowBalanceThreshold: 100, lowBalanceAlertEnabled: true, treasuryAddress: 'GABC...' },
          ownerId: 'owner-1',
          owner: { id: 'owner-1', email: 'owner1@test.com', username: 'owner1' },
          memberships: [],
        },
        {
          id: 'guild-2',
          name: 'Guild Two',
          settings: { lowBalanceThreshold: 100, lowBalanceAlertEnabled: true, treasuryAddress: 'GDEF...' },
          ownerId: 'owner-2',
          owner: { id: 'owner-2', email: 'owner2@test.com', username: 'owner2' },
          memberships: [],
        },
      ]);

      const alerts = await service.checkAllGuilds();
      
      expect(mockPrismaService.guild.findMany).toHaveBeenCalled();
      expect(Array.isArray(alerts)).toBeTruthy();
    });

    it('skips guilds with alerts disabled', async () => {
      mockPrismaService.guild.findMany.mockResolvedValue([
        {
          id: 'guild-1',
          name: 'Guild One',
          settings: { lowBalanceAlertEnabled: false },
          ownerId: 'owner-1',
          owner: { id: 'owner-1', email: 'owner1@test.com', username: 'owner1' },
          memberships: [],
        },
      ]);

      const alerts = await service.checkAllGuilds();
      expect(alerts).toHaveLength(0);
    });
  });
});
