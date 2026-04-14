import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { ethers } from 'ethers';
import {
  RegisterDto,
  LoginDto,
  WalletAuthDto,
  RefreshTokenDto,
} from './dto/auth.dto';
import { RefreshTokenService } from './refresh-token.service';

@Injectable()
export class AuthService {
  private readonly jwtSecret: string;

  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
    private prisma: PrismaService,
    private refreshTokenService: RefreshTokenService,
  ) {
    this.jwtSecret =
      this.configService.get<string>('JWT_SECRET') || 'your-secret-key';
  }

  /**
   * Register a new user with email and password
   */
  async register(registerDto: RegisterDto) {
    const { email, username, password, firstName, lastName, walletAddress } =
      registerDto;

    const existingUser = await this.prisma.user.findFirst({
      where: { OR: [{ email }, { username }] },
    });

    if (existingUser) {
      throw new ConflictException(
        'User with this email or username already exists',
      );
    }

    if (walletAddress && !this.isValidWalletAddress(walletAddress)) {
      throw new BadRequestException('Invalid wallet address');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await this.prisma.user.create({
      data: {
        email,
        username,
        password: hashedPassword,
        firstName,
        lastName,
        ...(walletAddress && { walletAddress }),
      },
    });

    const accessToken = this.signAccessToken(user);
    const refreshToken = await this.refreshTokenService.generate(user.id);

    return { accessToken, refreshToken, user: this.sanitizeUser(user) };
  }

  /**
   * Login user with email and password
   */
  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    const accessToken = this.signAccessToken(user);
    const refreshToken = await this.refreshTokenService.generate(user.id);

    return { accessToken, refreshToken, user: this.sanitizeUser(user) };
  }

  /**
   * Authenticate using wallet signature (Web3)
   */
  async walletAuth(walletAuthDto: WalletAuthDto) {
    const { walletAddress, message, signature } = walletAuthDto;

    if (!this.isValidWalletAddress(walletAddress)) {
      throw new BadRequestException('Invalid wallet address');
    }

    const signerAddress = await this.verifySignature(message, signature);
    if (signerAddress.toLowerCase() !== walletAddress.toLowerCase()) {
      throw new UnauthorizedException('Invalid signature');
    }

    let user = await this.prisma.user.findFirst({ where: { walletAddress } });

    if (!user) {
      const username = `user_${walletAddress.slice(-6).toLowerCase()}`;
      user = await this.prisma.user.create({
        data: {
          email: `${username}@wallet.local`,
          username,
          password: await bcrypt.hash(Math.random().toString(), 10),
          firstName: 'Wallet',
          lastName: 'User',
          walletAddress,
        },
      });
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    const accessToken = this.signAccessToken(user);
    const refreshToken = await this.refreshTokenService.generate(user.id);

    return { accessToken, refreshToken, user: this.sanitizeUser(user) };
  }

  /**
   * Refresh access token using opaque refresh token (with rotation)
   *
   * Security: Each refresh issues a NEW token and INVALIDATES the old one.
   * Reusing an old token triggers a replay detection → all sessions revoked.
   */
  async refreshToken(refreshTokenDto: RefreshTokenDto) {
    const { refreshToken: rawToken } = refreshTokenDto;

    try {
      // Rotate the token — validates, invalidates old, issues new
      const { newToken, userId } =
        await this.refreshTokenService.rotate(rawToken);

      const user = await this.prisma.user.findUnique({ where: { id: userId } });
      if (!user || !user.isActive) {
        throw new UnauthorizedException('User not found or inactive');
      }

      const accessToken = this.signAccessToken(user);

      return {
        accessToken,
        refreshToken: newToken,
        user: this.sanitizeUser(user),
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) throw error;
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }

  /**
   * Logout — revoke the refresh token
   */
  async logout(userId: string, rawRefreshToken?: string) {
    if (rawRefreshToken) {
      await this.refreshTokenService.revoke(rawRefreshToken);
    }
    return { message: 'Logged out successfully' };
  }

  /* ---- Token helpers ---- */

  private signAccessToken(user: { id: string; email: string; role: string; walletAddress?: string | null }): string {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      ...(user.walletAddress && { walletAddress: user.walletAddress }),
    };

    return this.jwtService.sign(payload, {
      secret: this.jwtSecret,
      expiresIn: '15m', // 15 minutes — short-lived for security
    });
  }

  private sanitizeUser(user: { id: string; email: string; username: string; walletAddress?: string | null }) {
    return {
      id: user.id,
      email: user.email,
      username: user.username,
      walletAddress: user.walletAddress || undefined,
    };
  }

  /* ---- Wallet helpers ---- */

  private verifySignature(message: string, signature: string): string {
    try {
      return ethers.verifyMessage(message, signature);
    } catch {
      throw new UnauthorizedException('Invalid signature');
    }
  }

  private isValidWalletAddress(address: string): boolean {
    return /^0x[a-fA-F0-9]{40}$/.test(address);
  }

  /* ---- User lookup ---- */

  async getCurrentUser(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true, email: true, username: true, firstName: true,
        lastName: true, walletAddress: true, role: true,
        isActive: true, createdAt: true,
      },
    });

    if (!user) throw new UnauthorizedException('User not found');
    return user;
  }
}
