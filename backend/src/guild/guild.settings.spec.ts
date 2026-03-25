import {
  validateAndNormalizeSettings,
  DEFAULT_GUILD_SETTINGS,
} from './guild.settings';
import { BadRequestException } from '@nestjs/common';

describe('Guild settings validation', () => {
  it('returns defaults when input is null', () => {
    const out = validateAndNormalizeSettings(null);
    expect(out).toEqual(DEFAULT_GUILD_SETTINGS);
  });

  it('validates visibility and merges values', () => {
    const input = { visibility: 'private', requireApproval: true };
    const out = validateAndNormalizeSettings(input);
    expect(out.visibility).toBe('private');
    expect(out.requireApproval).toBe(true);
    // other defaults remain
    expect(out.discoverable).toBe(DEFAULT_GUILD_SETTINGS.discoverable);
  });

  it('throws on invalid visibility', () => {
    expect(() =>
      validateAndNormalizeSettings({ visibility: 'invalid' }),
    ).toThrow(BadRequestException);
  });

  it('throws on invalid maxMembers type', () => {
    expect(() => validateAndNormalizeSettings({ maxMembers: -1 })).toThrow(
      BadRequestException,
    );
  });
});
