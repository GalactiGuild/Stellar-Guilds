import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles =
      this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
        context.getHandler(),
        context.getClass(),
      ]);

    // No roles required → allow
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();

    if (!user) {
      throw new ForbiddenException('Authentication required');
    }

    // Check if user has any of the required roles
    // Supports both string[] and comma-separated string
    const userRoles = Array.isArray(user.roles)
      ? user.roles
      : (user.roles?.split(',').map((r: string) => r.trim()) ?? []);

    const hasRole = requiredRoles.some((role) =>
      userRoles.includes(role),
    );

    if (!hasRole) {
      throw new ForbiddenException(
        `Insufficient permissions. Required role(s): ${requiredRoles.join(', ')}`,
      );
    }

    return true;
  }
}
