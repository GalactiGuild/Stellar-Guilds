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

  // Treasury settings tests
  it('validates and sets lowBalanceThreshold', () => {
    const input = { lowBalanceThreshold: 50 };
    const out = validateAndNormalizeSettings(input);
    expect(out.lowBalanceThreshold).toBe(50);
  });

  it('uses default lowBalanceThreshold when not provided', () => {
    const out = validateAndNormalizeSettings({});
    expect(out.lowBalanceThreshold).toBe(DEFAULT_GUILD_SETTINGS.lowBalanceThreshold);
  });

  it('throws on negative lowBalanceThreshold', () => {
    expect(() =>
      validateAndNormalizeSettings({ lowBalanceThreshold: -10 }),
    ).toThrow(BadRequestException);
  });

  it('throws on non-numeric lowBalanceThreshold', () => {
    expect(() =>
      validateAndNormalizeSettings({ lowBalanceThreshold: 'abc' }),
    ).toThrow(BadRequestException);
  });

  it('validates lowBalanceAlertEnabled', () => {
    const input = { lowBalanceAlertEnabled: false };
    const out = validateAndNormalizeSettings(input);
    expect(out.lowBalanceAlertEnabled).toBe(false);
  });

  it('throws on non-boolean lowBalanceAlertEnabled', () => {
    expect(() =>
      validateAndNormalizeSettings({ lowBalanceAlertEnabled: 'true' }),
    ).toThrow(BadRequestException);
  });

  it('validates treasuryAddress', () => {
    const input = { treasuryAddress: 'GABC123...' };
    const out = validateAndNormalizeSettings(input);
    expect(out.treasuryAddress).toBe('GABC123...');
  });

  it('allows null treasuryAddress', () => {
    const input = { treasuryAddress: null };
    const out = validateAndNormalizeSettings(input);
    expect(out.treasuryAddress).toBeNull();
  });

  it('validates all treasury settings together', () => {
    const input = {
      lowBalanceThreshold: 200,
      lowBalanceAlertEnabled: true,
      treasuryAddress: 'GDEFGHI...',
    };
    const out = validateAndNormalizeSettings(input);
    expect(out.lowBalanceThreshold).toBe(200);
    expect(out.lowBalanceAlertEnabled).toBe(true);
    expect(out.treasuryAddress).toBe('GDEFGHI...');
  });
});
