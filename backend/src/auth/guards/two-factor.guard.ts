import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { AuthService } from '../auth.service';

@Injectable()
export class TwoFactorGuard implements CanActivate {
  constructor(private authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || !user.userId) {
      throw new UnauthorizedException('Authentication required');
    }

    // Check if 2FA is enabled for this user
    const userFull = await this.authService.getCurrentUser(user.userId);

    // We need to check use from DB to see if 2FA is enabled
    // The getCurrentUser select doesn't include isTwoFactorEnabled currently, let's check auth.service.ts
    // Wait, I should update getCurrentUser to include isTwoFactorEnabled or use another method.

    const dbUser = await (this.authService as any).prisma.user.findUnique({
      where: { id: user.userId },
      select: { isTwoFactorEnabled: true },
    });

    if (!dbUser?.isTwoFactorEnabled) {
      return true;
    }

    const code = request.headers['x-2fa-code'];
    if (!code) {
      throw new ForbiddenException('2FA code required');
    }

    const isValid = await this.authService.verify2fa(
      user.userId,
      code as string,
    );
    if (!isValid) {
      throw new ForbiddenException('Invalid 2FA code');
    }

    return true;
  }
}
