import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as crypto from 'crypto';

/**
 * Refresh Token Service
 *
 * Manages opaque refresh tokens with rotation to prevent replay attacks.
 *
 * Security model:
 * - Tokens are random 64-byte hex strings (not JWTs)
 * - Stored hashed in the database (SHA-256)
 * - On each refresh: issue new token, invalidate old one
 * - Old token's `replacedBy` field points to new token (replay detection)
 * - If a revoked token is used again → reject all tokens in chain (possible theft)
 */
@Injectable()
export class RefreshTokenService {
  constructor(private prisma: PrismaService) {}

  /** Token byte length before hex encoding */
  private readonly TOKEN_BYTES = 32; // 64 hex chars

  /** Token TTL in seconds (7 days) */
  private readonly TOKEN_TTL = 7 * 24 * 60 * 60;

  /**
   * Generate a new opaque refresh token for a user and persist it.
   * Returns the raw token string (to be sent to client).
   */
  async generate(userId: string): Promise<string> {
    const rawToken = this.randomToken();
    const hashed = this.hash(rawToken);
    const expiresAt = new Date(Date.now() + this.TOKEN_TTL * 1000);

    await this.prisma.refreshToken.create({
      data: {
        token: hashed,
        userId,
        expiresAt,
      },
    });

    return rawToken;
  }

  /**
   * Rotate a refresh token:
   * 1. Validate the existing token
   * 2. Mark it as replaced (link to new token)
   * 3. Issue a brand new token
   * 4. Return the new token + access token payload
   *
   * This prevents replay attacks — using an old token twice triggers a security alert.
   */
  async rotate(rawToken: string): Promise<{ newToken: string; userId: string }> {
    const hashed = this.hash(rawToken);

    // Find the stored token
    const stored = await this.prisma.refreshToken.findUnique({
      where: { token: hashed },
    });

    if (!stored) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    if (stored.revokedAt) {
      // Token was already used/replaced — possible replay attack!
      // Revoke the entire chain as a security measure
      await this.revokeChain(stored);
      throw new UnauthorizedException(
        'Token reuse detected. All sessions have been revoked. Please log in again.',
        403,
      );
    }

    if (new Date() > stored.expiresAt) {
      throw new UnauthorizedException('Refresh token has expired');
    }

    // Generate new token
    const newRawToken = this.generateSync();
    const newHashed = this.hash(newRawToken);
    const newExpiresAt = new Date(Date.now() + this.TOKEN_TTL * 1000);

    // Atomically: mark old as replaced, create new one
    await this.prisma.$transaction([
      this.prisma.refreshToken.update({
        where: { id: stored.id },
        data: {
          replacedBy: newHashed,
          revokedAt: new Date(),
        },
      }),
      this.prisma.refreshToken.create({
        data: {
          token: newHashed,
          userId: stored.userId,
          expiresAt: newExpiresAt,
        },
      }),
    ]);

    return { newToken: newRawToken, userId: stored.userId };
  }

  /**
   * Revoke a specific refresh token (on logout)
   */
  async revoke(rawToken: string): Promise<void> {
    const hashed = this.hash(rawToken);
    await this.prisma.refreshToken.updateMany({
      where: { token: hashed, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  /**
   * Revoke ALL refresh tokens for a user (password change, security event)
   */
  async revokeAllForUser(userId: string): Promise<void> {
    await this.prisma.refreshToken.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  /**
   * Clean up expired tokens (call from a scheduled job)
   */
  async cleanupExpired(): Promise<number> {
    const result = await this.prisma.refreshToken.deleteMany({
      where: {
        expiresAt: { lt: new Date() },
      },
    });
    return result.count;
  }

  /* ---- Internal helpers ---- */

  private randomToken(): string {
    return crypto.randomBytes(this.TOKEN_BYTES).toString('hex');
  }

  private generateSync(): string {
    return crypto.randomBytes(this.TOKEN_BYTES).toString('hex');
  }

  private hash(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  /**
   * Revoke the entire token chain when replay is detected.
   * Follows `replacedBy` links and revokes everything.
   */
  private async revokeChain(startToken: { id: string; userId: string; replacedBy?: string | null }): Promise<void> {
    const toRevoke: string[] = [startToken.id];
    let current = startToken.replacedBy;

    while (current) {
      const next = await this.prisma.refreshToken.findUnique({
        where: { token: current },
        select: { id: true, replacedBy: true },
      });
      if (next) {
        toRevoke.push(next.id);
        current = next.replacedBy;
      } else {
        break;
      }
    }

    await this.prisma.refreshToken.updateMany({
      where: { id: { in: toRevoke } },
      data: { revokedAt: new Date() },
    });
  }
}
