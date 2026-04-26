import { GuildBulkInviteService } from './guild-bulk-invite.service';
import { PrismaService } from '../prisma/prisma.service';

const mockPrisma = {
  user: {
    findFirst: jest.fn(),
  },
  guildMembership: {
    findUnique: jest.fn(),
    create: jest.fn(),
  },
};

describe('GuildBulkInviteService', () => {
  let service: GuildBulkInviteService;

  beforeEach(() => {
    service = new GuildBulkInviteService(
      mockPrisma as unknown as PrismaService,
    );
    jest.clearAllMocks();
  });

  describe('parseAddresses', () => {
    it('parses a simple CSV with one address per row', () => {
      const csv = Buffer.from(
        'GBZXN7PIRZGNMHGA7MUUUF4GWPY5AYPGK6TBJDDF4CVLHIRLQZPVSWAA\nGCEZWJFAEWE5ZNXOKBAFZPOMRPD5OJ7FXNZ6FGGXOMG6H5FPBKRHVEC\n',
      );

      const addresses = service.parseAddresses(csv);

      expect(addresses).toHaveLength(2);
      expect(addresses[0]).toBe(
        'GBZXN7PIRZGNMHGA7MUUUF4GWPY5AYPGK6TBJDDF4CVLHIRLQZPVSWAA',
      );
    });

    it('skips header row with address label', () => {
      const csv = Buffer.from(
        'address\nGBZXN7PIRZGNMHGA7MUUUF4GWPY5AYPGK6TBJDDF4CVLHIRLQZPVSWAA\n',
      );

      const addresses = service.parseAddresses(csv);

      expect(addresses).toHaveLength(1);
    });

    it('skips empty lines', () => {
      const csv = Buffer.from(
        'GBZXN7PIRZGNMHGA7MUUUF4GWPY5AYPGK6TBJDDF4CVLHIRLQZPVSWAA\n\nGCEZWJFAEWE5ZNXOKBAFZPOMRPD5OJ7FXNZ6FGGXOMG6H5FPBKRHVEC\n',
      );

      const addresses = service.parseAddresses(csv);

      expect(addresses).toHaveLength(2);
    });

    it('returns empty array for empty CSV', () => {
      const csv = Buffer.from('');
      const addresses = service.parseAddresses(csv);
      expect(addresses).toHaveLength(0);
    });
  });

  describe('processBulkInvite', () => {
    const validAddress =
      'GBZXN7PIRZGNMHGA7MUUUF4GWPY5AYPGK6TBJDDF4CVLHIRLQZPVSWAA';
    const invalidAddress = 'not-a-stellar-address';

    it('skips invalid stellar addresses', async () => {
      const csv = Buffer.from(invalidAddress);

      const result = await service.processBulkInvite('guild-1', 'user-1', csv);

      expect(result.skipped).toBe(1);
      expect(result.invited).toBe(0);
      expect(result.details.skipped[0].reason).toContain('Invalid');
    });

    it('skips address when no user found', async () => {
      mockPrisma.user.findFirst.mockResolvedValueOnce(null);

      const csv = Buffer.from(validAddress);

      const result = await service.processBulkInvite('guild-1', 'user-1', csv);

      expect(result.skipped).toBe(1);
      expect(result.details.skipped[0].reason).toContain('No user found');
    });

    it('skips address when user is already a member', async () => {
      mockPrisma.user.findFirst.mockResolvedValueOnce({ id: 'user-2' });
      mockPrisma.guildMembership.findUnique.mockResolvedValueOnce({
        id: 'membership-1',
      });

      const csv = Buffer.from(validAddress);

      const result = await service.processBulkInvite('guild-1', 'user-1', csv);

      expect(result.skipped).toBe(1);
      expect(result.details.skipped[0].reason).toContain('Already a member');
    });

    it('successfully invites valid address', async () => {
      mockPrisma.user.findFirst.mockResolvedValueOnce({ id: 'user-2' });
      mockPrisma.guildMembership.findUnique.mockResolvedValueOnce(null);
      mockPrisma.guildMembership.create.mockResolvedValueOnce({
        id: 'membership-1',
      });

      const csv = Buffer.from(validAddress);

      const result = await service.processBulkInvite('guild-1', 'user-1', csv);

      expect(result.invited).toBe(1);
      expect(result.skipped).toBe(0);
      expect(result.summary).toContain('Invited 1 users');
    });

    it('returns correct summary message', async () => {
      mockPrisma.user.findFirst.mockResolvedValueOnce({ id: 'user-2' });
      mockPrisma.guildMembership.findUnique.mockResolvedValueOnce(null);
      mockPrisma.guildMembership.create.mockResolvedValueOnce({});

      const csv = Buffer.from(`${validAddress}\n${invalidAddress}`);

      const result = await service.processBulkInvite('guild-1', 'user-1', csv);

      expect(result.summary).toBe(
        'Invited 1 users, 1 invalid addresses skipped',
      );
    });
  });
});
