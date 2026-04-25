import { Injectable } from '@nestjs/common';
import {
  ThrottlerGuard,
  ThrottlerStorage,
  InjectThrottlerOptions,
  InjectThrottlerStorage,
} from '@nestjs/throttler';
import type { ThrottlerModuleOptions } from '@nestjs/throttler';
import { JwtService } from '@nestjs/jwt';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RefreshThrottlerGuard extends ThrottlerGuard {
  constructor(
    @InjectThrottlerOptions()
    protected readonly options: ThrottlerModuleOptions,
    @InjectThrottlerStorage()
    protected readonly storageService: ThrottlerStorage,
    protected readonly reflector: Reflector,
    private readonly jwtService: JwtService,
  ) {
    super(options, storageService, reflector);
  }

  protected async getTracker(req: Record<string, any>): Promise<string> {
    const refreshToken = req?.body?.refreshToken as string | undefined;
    if (!refreshToken) {
      return req.ip;
    }

    try {
      const decoded = this.jwtService.decode(refreshToken) as
        | { sub?: string }
        | null;
      if (decoded?.sub) {
        return `refresh-user:${decoded.sub}`;
      }
    } catch {
      // Keep fallback behavior for malformed tokens.
    }

    return req.ip;
  }
}
