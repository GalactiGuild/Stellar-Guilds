import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../../prisma/prisma.service';
import { GUILD_ROLES_KEY } from '../decorators/guild-roles.decorator';

@Injectable()
export class GuildRoleGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles =
      this.reflector.get<string[]>(GUILD_ROLES_KEY, context.getHandler()) ||
      this.reflector.get<string[]>(GUILD_ROLES_KEY, context.getClass());
    if (!requiredRoles || requiredRoles.length === 0) return true;

    const req = context.switchToHttp().getRequest();
    const user = req.user;
    const guildId =
      req.params?.id || req.params?.guildId || (req.body && req.body.guildId);

    if (!user) return false;
    if (!guildId) throw new ForbiddenException('Guild id missing');

    const membership = await this.prisma.guildMembership.findUnique({
      where: { userId_guildId: { userId: user.userId, guildId } },
    });
    if (!membership) throw new ForbiddenException('Not a member of the guild');

    if (!requiredRoles.includes(membership.role))
      throw new ForbiddenException('Insufficient guild role');

    return true;
  }
}
