import 'reflect-metadata';
import { validate } from 'class-validator';
import { UpdateGuildSocialsDto } from './update-guild-socials.dto';

describe('UpdateGuildSocialsDto', () => {
  it('accepts valid optional social URLs', async () => {
    const dto = new UpdateGuildSocialsDto();
    dto.website = 'https://example.org';
    dto.twitter = 'https://twitter.com/stellarorg';
    dto.discord = 'https://discord.gg/stellar';

    const errors = await validate(dto);

    expect(errors).toHaveLength(0);
  });

  it('rejects malformed social URLs', async () => {
    const dto = new UpdateGuildSocialsDto();
    dto.website = 'example.org';
    dto.twitter = 'not-a-url';
    dto.discord = 'discord.gg/stellar';

    const errors = await validate(dto);

    expect(errors).toHaveLength(3);
  });
});
