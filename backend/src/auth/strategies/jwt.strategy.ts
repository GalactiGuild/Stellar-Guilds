import { Injectable, ForbiddenException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';

interface JwtPayload {
  sub: string;
  email: string;
  role?: string;
  walletAddress?: string;
  iat?: number;
  exp?: number;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET') || 'your-secret-key',
    });
  }

  async validate(payload: JwtPayload) {
    // Check if user is banned
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      select: { banned: true },
    });

    if (user?.banned) {
      throw new ForbiddenException('Your account has been banned');
    }

    return {
      userId: payload.sub,
      email: payload.email,
      role: payload.role || 'USER',
      walletAddress: payload.walletAddress,
    };
  }
}
