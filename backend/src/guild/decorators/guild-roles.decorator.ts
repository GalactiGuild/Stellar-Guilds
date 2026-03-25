import { SetMetadata } from '@nestjs/common';

export const GUILD_ROLES_KEY = 'guildRoles';
export const GuildRoles = (...roles: string[]) =>
  SetMetadata(GUILD_ROLES_KEY, roles);
