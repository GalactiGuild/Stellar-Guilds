import { BadRequestException } from '@nestjs/common';

export type GuildSettings = {
  visibility?: 'public' | 'private' | 'unlisted';
  requireApproval?: boolean; // joining requires approval
  discoverable?: boolean; // shows up in search
  maxMembers?: number | null;
  // Treasury settings
  lowBalanceThreshold?: number; // XLM threshold for low balance alerts
  lowBalanceAlertEnabled?: boolean; // whether low balance alerts are enabled
  treasuryAddress?: string; // Stellar treasury account address (mocked)
};

export const DEFAULT_GUILD_SETTINGS: Required<GuildSettings> = {
  visibility: 'public',
  requireApproval: false,
  discoverable: true,
  maxMembers: null,
  lowBalanceThreshold: 100, // Default: alert when balance drops below 100 XLM
  lowBalanceAlertEnabled: true,
  treasuryAddress: null as any,
};

export function validateAndNormalizeSettings(
  input: any,
): Required<GuildSettings> {
  if (input == null) return { ...DEFAULT_GUILD_SETTINGS };
  if (typeof input !== 'object')
    throw new BadRequestException('Invalid settings format');

  const out: any = { ...DEFAULT_GUILD_SETTINGS };

  if ('visibility' in input) {
    if (!['public', 'private', 'unlisted'].includes(input.visibility))
      throw new BadRequestException('Invalid visibility setting');
    out.visibility = input.visibility;
  }

  if ('requireApproval' in input) {
    if (typeof input.requireApproval !== 'boolean')
      throw new BadRequestException('requireApproval must be boolean');
    out.requireApproval = input.requireApproval;
  }

  if ('discoverable' in input) {
    if (typeof input.discoverable !== 'boolean')
      throw new BadRequestException('discoverable must be boolean');
    out.discoverable = input.discoverable;
  }

  if ('maxMembers' in input) {
    if (
      input.maxMembers !== null &&
      (typeof input.maxMembers !== 'number' || input.maxMembers < 1)
    )
      throw new BadRequestException(
        'maxMembers must be a positive number or null',
      );
    out.maxMembers = input.maxMembers;
  }

  // Treasury settings validation
  if ('lowBalanceThreshold' in input) {
    if (
      typeof input.lowBalanceThreshold !== 'number' ||
      input.lowBalanceThreshold < 0
    )
      throw new BadRequestException(
        'lowBalanceThreshold must be a non-negative number',
      );
    out.lowBalanceThreshold = input.lowBalanceThreshold;
  }

  if ('lowBalanceAlertEnabled' in input) {
    if (typeof input.lowBalanceAlertEnabled !== 'boolean')
      throw new BadRequestException('lowBalanceAlertEnabled must be boolean');
    out.lowBalanceAlertEnabled = input.lowBalanceAlertEnabled;
  }

  if ('treasuryAddress' in input) {
    if (input.treasuryAddress !== null && typeof input.treasuryAddress !== 'string')
      throw new BadRequestException('treasuryAddress must be a string or null');
    out.treasuryAddress = input.treasuryAddress;
  }

  return out;
}
