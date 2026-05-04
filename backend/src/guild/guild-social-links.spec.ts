import 'reflect-metadata';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { UpdateGuildSocialLinksDto } from './dto/update-guild-social-links.dto';
import { GuildService } from './guild.service';

describe('Guild social links', () => {
  it('validates supported social links with URLs', async () => {
    const dto = plainToInstance(UpdateGuildSocialLinksDto, {
      socialLinks: {
        website: 'https://example.com',
        twitter: 'https://x.com/example',
        discordServerId: '1234567890',
      },
    });

    await expect(validate(dto)).resolves.toHaveLength(0);
  });

  it('rejects invalid social link URLs', async () => {
    const dto = plainToInstance(UpdateGuildSocialLinksDto, {
      socialLinks: { website: 'example.com/no-protocol' },
    });

    const errors = await validate(dto);
    expect(errors).toHaveLength(1);
  });

  it('updates only the socialLinks JSON field after permission check', async () => {
    const prisma = {
      guild: {
        findUnique: jest.fn().mockResolvedValue({ id: 'guild-1', ownerId: 'owner-1' }),
        update: jest.fn().mockResolvedValue({
          id: 'guild-1',
          socialLinks: { website: 'https://example.com' },
        }),
      },
      guildMembership: { findUnique: jest.fn() },
    } as any;

    const service = new GuildService(prisma, {} as any, {} as any);

    const result = await service.updateGuildSocialLinks(
      'guild-1',
      { website: 'https://example.com' },
      'owner-1',
    );

    expect(result.socialLinks.website).toBe('https://example.com');
    expect(prisma.guild.update).toHaveBeenCalledWith({
      where: { id: 'guild-1' },
      data: { socialLinks: { website: 'https://example.com' } },
      select: { id: true, socialLinks: true },
    });
  });
});
