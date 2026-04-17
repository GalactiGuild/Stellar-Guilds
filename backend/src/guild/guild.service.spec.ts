import { Test, TestingModule } from '@nestjs/testing';
import { GuildService } from './guild.service';
import { PrismaService } from '../prisma/prisma.service';
import { MailerService } from '../mailer/mailer.service';
import { validateAndNormalizeSettings } from './guild.settings';
import { ConflictException } from '@nestjs/common';
import { StorageService } from '../storage/storage.service';

const mockPrisma = () => ({
  guild: {
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    count: jest.fn(),
    findMany: jest.fn(),
  },
  guildMembership: {
    create: jest.fn(),
    findUnique: jest.fn(),
    findFirst: jest.fn(),
  },
  user: { findUnique: jest.fn(), findFirst: jest.fn() },
});

const mockMailer = () => ({
  sendInviteEmail: jest.fn(),
  sendRevokeEmail: jest.fn(),
});

describe('GuildService (settings integration)', () => {
  let service: GuildService;
  let prisma: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GuildService,
        { provide: PrismaService, useFactory: mockPrisma },
        { provide: MailerService, useFactory: mockMailer },
        {
          provide: StorageService,
          useValue: { uploadFile: jest.fn(), deleteFile: jest.fn() },
        },
      ],
    }).compile();

    service = module.get<GuildService>(GuildService);
    prisma = module.get(PrismaService);
  });

  it('creates guild with normalized settings', async () => {
    prisma.guild.findUnique.mockResolvedValue(null);
    prisma.guild.create.mockImplementation(({ data }: any) =>
      Promise.resolve({ ...data, id: 'g1' }),
    );

    const dto: any = {
      name: 'Test Guild',
      settings: { visibility: 'private' },
    };
    const res = await service.createGuild(dto, 'owner1');
    expect(prisma.guild.findUnique).toHaveBeenCalled();
    expect(prisma.guild.create).toHaveBeenCalled();
    expect(res.settings.visibility).toBe('private');
    expect(res.id).toBe('g1');
  });

  it('throws conflict when slug exists', async () => {
    prisma.guild.findUnique.mockResolvedValue({ id: 'existing' });
    await expect(
      service.createGuild({ name: 'X', slug: 'existing' }, 'owner'),
    ).rejects.toThrow(ConflictException);
  });

  it('merges settings on update', async () => {
    const guildId = 'g-1';
    prisma.guild.findUnique.mockResolvedValue({
      id: guildId,
      settings: { visibility: 'public', requireApproval: false },
    });
    prisma.guild.update.mockImplementation(({ where, data }: any) =>
      Promise.resolve({ id: where.id, ...data }),
    );
    prisma.guildMembership.findUnique.mockResolvedValue({ role: 'OWNER' });

    const updated = await service.updateGuild(
      guildId,
      { settings: { requireApproval: true } } as any,
      'owner1',
    );
    expect(updated.settings.requireApproval).toBe(true);
  });

  it('searches only discoverable guilds', async () => {
    prisma.guild.findMany.mockResolvedValue([{ id: 'g1', name: 'G1' }]);
    prisma.guild.count.mockResolvedValue(1);

    const res = await service.searchGuilds('G', 0, 10);
    expect(res.items.length).toBe(1);

    const calledWhere = prisma.guild.findMany.mock.calls[0][0].where;
    if (calledWhere.AND) {
      expect(calledWhere.AND).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            settings: { path: ['discoverable'], equals: true },
          }),
        ]),
      );
    } else {
      expect(calledWhere).toEqual(
        expect.objectContaining({
          settings: { path: ['discoverable'], equals: true },
        }),
      );
    }
  });

  it('getGuild includes active member and open bounty counts', async () => {
    const guildData = {
      id: 'guild-1',
      name: 'Test Guild',
      slug: 'test-guild',
      memberships: [],
      _count: {
        memberships: 5,
        bounties: 3,
      },
    };
    prisma.guild.findUnique.mockResolvedValue(guildData);

    const result = await service.getGuild('guild-1');

    expect(prisma.guild.findUnique).toHaveBeenCalledWith({
      where: { id: 'guild-1' },
      include: {
        memberships: { include: { user: true } },
        _count: {
          select: {
            memberships: {
              where: { status: 'APPROVED' },
            },
            bounties: {
              where: { status: 'OPEN' },
            },
          },
        },
      },
    });
    expect(result._count.memberships).toBe(5);
    expect(result._count.bounties).toBe(3);
  });

  it('getBySlug includes active member and open bounty counts', async () => {
    const guildData = {
      id: 'guild-1',
      slug: 'test-guild',
      name: 'Test Guild',
      memberships: [],
      _count: {
        memberships: 8,
        bounties: 2,
      },
    };
    prisma.guild.findUnique.mockResolvedValue(guildData);

    const result = await service.getBySlug('test-guild');

    expect(prisma.guild.findUnique).toHaveBeenCalledWith({
      where: { slug: 'test-guild' },
      include: {
        memberships: { include: { user: true } },
        _count: {
          select: {
            memberships: {
              where: { status: 'APPROVED' },
            },
            bounties: {
              where: { status: 'OPEN' },
            },
          },
        },
      },
    });
    expect(result._count.memberships).toBe(8);
    expect(result._count.bounties).toBe(2);
  });

  describe('bulkInviteMembers', () => {
    it('invites valid users from CSV', async () => {
      prisma.guild.findUnique.mockResolvedValue({ id: 'g1', name: 'Test Guild' });
      prisma.guildMembership.findUnique
        .mockResolvedValueOnce({ role: 'OWNER' }) // ensureManagePermission
        .mockResolvedValueOnce(null); // existing membership check
      prisma.user.findFirst.mockResolvedValue({ id: 'u1', email: 'a@test.com' });
      prisma.guildMembership.create.mockResolvedValue({ id: 'm1' });

      const csv = Buffer.from('a@test.com\nb@test.com\n');
      prisma.user.findFirst
        .mockResolvedValueOnce({ id: 'u1', email: 'a@test.com' })
        .mockResolvedValueOnce(null); // user not found
      prisma.guildMembership.findUnique
        .mockResolvedValueOnce({ role: 'OWNER' }) // ensureManagePermission
        .mockResolvedValueOnce(null) // no existing membership for u1
        .mockResolvedValueOnce({ role: 'OWNER' }); // ensureManagePermission called again? No — it's called once

      const result = await service.bulkInviteMembers('g1', csv, 'admin1');
      expect(result.invited).toBe(1);
      expect(result.skipped).toBe(1);
      expect(result.message).toContain('Invited 1 users');
      expect(result.message).toContain('1 invalid addresses skipped');
    });

    it('skips users already in guild', async () => {
      prisma.guild.findUnique.mockResolvedValue({ id: 'g1', name: 'Test Guild' });
      prisma.guildMembership.findUnique.mockResolvedValue({ role: 'OWNER' });
      prisma.user.findFirst.mockResolvedValue({ id: 'u1', email: 'a@test.com' });
      // Existing membership
      prisma.guildMembership.findUnique
        .mockResolvedValueOnce({ role: 'OWNER' }) // ensureManagePermission
        .mockResolvedValueOnce({ status: 'APPROVED' }); // existing membership

      const csv = Buffer.from('a@test.com\n');
      const result = await service.bulkInviteMembers('g1', csv, 'admin1');
      expect(result.invited).toBe(0);
      expect(result.skipped).toBe(1);
      expect(result.details[0].reason).toContain('Already approved');
    });

    it('rejects empty CSV', async () => {
      prisma.guild.findUnique.mockResolvedValue({ id: 'g1', name: 'Test Guild' });
      prisma.guildMembership.findUnique.mockResolvedValue({ role: 'OWNER' });

      const csv = Buffer.from('\n\n');
      await expect(
        service.bulkInviteMembers('g1', csv, 'admin1'),
      ).rejects.toThrow('CSV file is empty or has no valid rows');
    });

    it('rejects invalid CSV', async () => {
      prisma.guild.findUnique.mockResolvedValue({ id: 'g1', name: 'Test Guild' });
      prisma.guildMembership.findUnique.mockResolvedValue({ role: 'OWNER' });

      const csv = Buffer.from('"unclosed quote');
      await expect(
        service.bulkInviteMembers('g1', csv, 'admin1'),
      ).rejects.toThrow('Invalid CSV file');
    });
  });
});
