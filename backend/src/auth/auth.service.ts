import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
  ConflictException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { TokenBlacklistService } from './services/token-blacklist.service';
import { RedisService } from '../common/services/redis.service';
import * as bcrypt from 'bcrypt';
import { ethers } from 'ethers';
import { randomUUID } from 'crypto';
import { AppUnauthorizedException } from '../common/exceptions/custom-http.exceptions';
import { StellarErrorCode } from '../common/errors/stellar-error-code.enum';
import {
  RegisterDto,
  LoginDto,
  WalletAuthDto,
  RefreshTokenDto,
} from './dto/auth.dto';

@Injectable()
export class AuthService {
  private readonly jwtSecret: string;
  private readonly refreshTokenSecret: string;
  private readonly jwtAccessExpiration: string | number;
  private readonly jwtRefreshExpiration: string | number;
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
    private prisma: PrismaService,
    private tokenBlacklistService: TokenBlacklistService,
    private redisService: RedisService,
  ) {
    this.jwtSecret =
      this.configService.get<string>('JWT_SECRET') || 'your-secret-key';
    this.refreshTokenSecret =
      this.configService.get<string>('REFRESH_TOKEN_SECRET') ||
      'your-refresh-secret-key';
    this.jwtAccessExpiration =
      this.configService.get<string | number>('JWT_ACCESS_EXPIRATION') || '15m';
    this.jwtRefreshExpiration =
      this.configService.get<string | number>('JWT_REFRESH_EXPIRATION') || '7d';
  }

  /**
   * Register a new user with email and password
   */
  async register(registerDto: RegisterDto) {
    const { email, username, password, firstName, lastName, walletAddress } =
      registerDto;

    // Check if user already exists
    const existingUser = await this.prisma.user.findFirst({
      where: {
        OR: [{ email }, { username }],
      },
    });

    if (existingUser) {
      throw new ConflictException(
        'User with this email or username already exists',
      );
    }

    // Validate wallet address if provided
    if (walletAddress && !this.isValidWalletAddress(walletAddress)) {
      throw new BadRequestException('Invalid wallet address');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user with default notification settings
    const user = await this.prisma.user.create({
      data: {
        email,
        username,
        password: hashedPassword,
        firstName,
        lastName,
        ...(walletAddress && { walletAddress }),
        notificationSettings: {
          emailOnBounty: true,
          emailOnMention: true,
          weeklyDigest: true,
        },
      },
    });

    // Generate tokens
    const { accessToken, refreshToken } = await this.generateTokens(
      user.id,
      user.email,
      user.walletAddress || undefined,
      user.role,
    );

    // Save refresh token to database
    await this.prisma.user.update({
      where: { id: user.id },
      data: { refreshToken },
    });

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        walletAddress: user.walletAddress || undefined,
      },
    };
  }

  /**
   * Login user with email and password
   */
  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    // Find user
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new AppUnauthorizedException('Invalid email or password', {
        errorCode: StellarErrorCode.UNAUTHORIZED,
      });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new AppUnauthorizedException('Invalid email or password', {
        errorCode: StellarErrorCode.UNAUTHORIZED,
      });
    }

    // Update last login
    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    // Generate tokens
    const { accessToken, refreshToken } = await this.generateTokens(
      user.id,
      user.email,
      user.walletAddress || undefined,
      user.role,
    );

    // Save refresh token to database
    await this.prisma.user.update({
      where: { id: user.id },
      data: { refreshToken },
    });

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        walletAddress: user.walletAddress || undefined,
      },
    };
  }

  /**
   * Authenticate user using wallet signature (Web3)
   */
  async walletAuth(walletAuthDto: WalletAuthDto) {
    const { walletAddress, message, signature } = walletAuthDto;

    // Validate wallet address format
    if (!this.isValidWalletAddress(walletAddress)) {
      throw new BadRequestException('Invalid wallet address');
    }

    // Verify signature
    const signerAddress = await this.verifySignature(message, signature);
    if (signerAddress.toLowerCase() !== walletAddress.toLowerCase()) {
      throw new AppUnauthorizedException('Invalid signature', {
        errorCode: StellarErrorCode.UNAUTHORIZED,
      });
    }

    // Find or create user
    let user = await this.prisma.user.findFirst({
      where: { walletAddress },
    });

    if (!user) {
      // Create new user with wallet
      const username = `user_${walletAddress.slice(-6).toLowerCase()}`;
      user = await this.prisma.user.create({
        data: {
          email: `${username}@wallet.local`,
          username,
          password: await bcrypt.hash(Math.random().toString(), 10), // Random password for wallet users
          firstName: 'Wallet',
          lastName: 'User',
          walletAddress,
          notificationSettings: {
            emailOnBounty: true,
            emailOnMention: true,
            weeklyDigest: true,
          },
        },
      });
    }

    // Update last login
    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    // Generate tokens
    const { accessToken, refreshToken } = await this.generateTokens(
      user.id,
      user.email,
      user.walletAddress || undefined,
      user.role,
    );

    // Save refresh token to database
    await this.prisma.user.update({
      where: { id: user.id },
      data: { refreshToken },
    });

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        walletAddress: user.walletAddress || undefined,
      },
    };
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshToken(refreshTokenDto: RefreshTokenDto) {
    const { refreshToken } = refreshTokenDto;

    try {
      await this.trackRefreshAttempt(refreshToken);

      // Verify refresh token
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.refreshTokenSecret,
      });

      // Find user and verify refresh token
      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
      });

      if (!user || user.refreshToken !== refreshToken) {
        throw new AppUnauthorizedException('Invalid refresh token', {
          errorCode: StellarErrorCode.UNAUTHORIZED,
        });
      }

      // Generate new tokens
      const { accessToken, refreshToken: newRefreshToken } =
        await this.generateTokens(
          user.id,
          user.email,
          user.walletAddress || undefined,
          user.role,
        );

      // Save new refresh token
      await this.prisma.user.update({
        where: { id: user.id },
        data: { refreshToken: newRefreshToken },
      });

      return {
        accessToken,
        refreshToken: newRefreshToken,
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          walletAddress: user.walletAddress || undefined,
        },
      };
    } catch (error) {
      throw new AppUnauthorizedException('Invalid refresh token', {
        errorCode: StellarErrorCode.UNAUTHORIZED,
      });
    }
  }

  private async trackRefreshAttempt(refreshToken: string) {
    const decoded = this.jwtService.decode(refreshToken);
    const trackerId = decoded?.sub ?? 'anonymous';
    const key = `auth:refresh:attempts:${trackerId}`;
    const current = await this.redisService.get(key);
    const nextCount = (current ? Number(current) : 0) + 1;
    await this.redisService.set(key, String(nextCount), 60 * 60 * 24);

    if (nextCount >= 20) {
      this.logger.warn(`Suspicious Refresh Activity for user ${trackerId}`);
    }
  }

  /**
   * Logout user by invalidating refresh token and blacklisting access token
   */
  async logout(userId: string, accessToken: string) {
    // Blacklist the current access token
    await this.tokenBlacklistService.add(accessToken);

    // Clear the refresh token from database
    await this.prisma.user.update({
      where: { id: userId },
      data: { refreshToken: null },
    });

    return { message: 'Logged out successfully' };
  }

  /**
   * Generate access and refresh tokens
   */
  private async generateTokens(
    userId: string,
    email: string,
    walletAddress?: string,
    role?: string,
  ) {
    const payload = {
      sub: userId,
      email,
      role: role || 'USER',
      ...(walletAddress && { walletAddress }),
    };

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: this.jwtAccessExpiration,
    } as any);

    const refreshToken = this.jwtService.sign(payload, {
      secret: this.refreshTokenSecret,
      expiresIn: this.jwtRefreshExpiration,
    } as any);

    return { accessToken, refreshToken };
  }

  /**
   * Verify wallet signature using ethers.js
   */
  private verifySignature(message: string, signature: string): string {
    try {
      const signerAddress = ethers.verifyMessage(message, signature);
      return signerAddress;
    } catch (error) {
      throw new UnauthorizedException('Invalid signature');
    }
  }

  /**
   * Validate Ethereum wallet address format
   */
  private isValidWalletAddress(address: string): boolean {
    return /^0x[a-fA-F0-9]{40}$/.test(address);
  }

  /**
   * Get current user by ID
   */
  async getCurrentUser(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        username: true,
        firstName: true,
        lastName: true,
        walletAddress: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new AppUnauthorizedException('User not found', {
        errorCode: StellarErrorCode.UNAUTHORIZED,
      });
    }

    return user;
  }

  /**
   * Generate a mock 2FA secret for setup
   */
  async generate2faSecret(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const secret = randomUUID()
      .replace(/-/g, '')
      .substring(0, 16)
      .toUpperCase();

    // In a real implementation we might store this as 'pending' but here we just return it
    return {
      secret,
      otpAuthUrl: `otpauth://totp/StellarGuilds:${user.email}?secret=${secret}&issuer=StellarGuilds`,
    };
  }

  /**
   * Enable 2FA for a user after verifying a code
   */
  async enable2fa(userId: string, code: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    // Mock verification: accept '123456' as valid for setup
    if (code !== '123456') {
      throw new BadRequestException('Invalid 2FA code');
    }

    // Generate a permanent secret (mocked)
    const secret = randomUUID().replace(/-/g, '').substring(0, 32);

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        twoFactorSecret: secret, // In production, this should be encrypted
        isTwoFactorEnabled: true,
      },
    });

    return { message: '2FA enabled successfully' };
  }

  /**
   * Verify 2FA code (mocked)
   */
  async verify2fa(userId: string, code: string): Promise<boolean> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.isTwoFactorEnabled || !user.twoFactorSecret) {
      return false;
    }

    // Mock verification: accept '123456'
    return code === '123456';
  }
}
