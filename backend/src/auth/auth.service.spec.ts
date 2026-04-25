import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { TokenBlacklistService } from './services/token-blacklist.service';
import * as ethers from 'ethers';
import {
  UnauthorizedException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';

jest.mock('bcrypt');
jest.mock('ethers');

import * as bcrypt from 'bcrypt';

describe('AuthService', () => {
  let service: AuthService;
  let jwtService: JwtService;
  let prisma: PrismaService;
  let configService: ConfigService;

  const mockUser = {
    id: '123',
    email: 'test@example.com',
    username: 'testuser',
    password: 'hashedpassword',
    walletAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f1e2f0',
    firstName: 'Test',
    lastName: 'User',
    isActive: true,
    role: 'USER',
    refreshToken: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    lastLoginAt: null,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
            verify: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              const config: Record<string, string> = {
                JWT_SECRET: 'test-secret',
                REFRESH_TOKEN_SECRET: 'test-refresh-secret',
                JWT_EXPIRY: '15m',
                REFRESH_TOKEN_EXPIRY: '7d',
              };
              return config[key];
            }),
          },
        },
        {
          provide: PrismaService,
          useValue: {
            user: {
              findUnique: jest.fn(),
              findFirst: jest.fn(),
              create: jest.fn(),
              update: jest.fn(),
            },
          },
        },
        {
          provide: TokenBlacklistService,
          useValue: {
            add: jest.fn(),
            isBlacklisted: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jwtService = module.get<JwtService>(JwtService);
    prisma = module.get<PrismaService>(PrismaService);
    configService = module.get<ConfigService>(ConfigService);
  });

  describe('register', () => {
    it('should successfully register a new user', async () => {
      const registerDto = {
        email: 'newuser@example.com',
        username: 'newuser',
        password: 'Password123',
        firstName: 'New',
        lastName: 'User',
        walletAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f1e2f0',
      };

      jest.spyOn(prisma.user, 'findFirst').mockResolvedValue(null);
      jest.spyOn(prisma.user, 'create').mockResolvedValue({
        ...mockUser,
        email: registerDto.email,
        username: registerDto.username,
      } as any);
      jest.spyOn(prisma.user, 'update').mockResolvedValue(mockUser as any);
      jest.spyOn(jwtService, 'sign').mockReturnValue('token');

      const result = await service.register(registerDto);

      expect(result.accessToken).toBeDefined();
      expect(result.refreshToken).toBeDefined();
      expect(result.user).toBeDefined();
      expect(prisma.user.findFirst).toHaveBeenCalled();
      expect(prisma.user.create).toHaveBeenCalled();
    });

    it('should throw ConflictException if user already exists', async () => {
      const registerDto = {
        email: 'test@example.com',
        username: 'testuser',
        password: 'Password123',
        firstName: 'Test',
        lastName: 'User',
      };

      jest.spyOn(prisma.user, 'findFirst').mockResolvedValue(mockUser as any);

      await expect(service.register(registerDto)).rejects.toThrow(
        ConflictException,
      );
    });

    it('should throw BadRequestException for invalid wallet address', async () => {
      const registerDto = {
        email: 'newuser@example.com',
        username: 'newuser',
        password: 'Password123',
        firstName: 'New',
        lastName: 'User',
        walletAddress: 'invalid-address',
      };

      jest.spyOn(prisma.user, 'findFirst').mockResolvedValue(null);

      await expect(service.register(registerDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('login', () => {
    it('should successfully login user with valid credentials', async () => {
      const loginDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(mockUser as any);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      jest.spyOn(prisma.user, 'update').mockResolvedValue(mockUser as any);
      jest.spyOn(jwtService, 'sign').mockReturnValue('token');

      const result = await service.login(loginDto);

      expect(result.accessToken).toBeDefined();
      expect(result.refreshToken).toBeDefined();
      expect(result.user).toBeDefined();
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: loginDto.email },
      });
    });

    it('should throw UnauthorizedException for non-existent user', async () => {
      const loginDto = {
        email: 'nonexistent@example.com',
        password: 'password123',
      };

      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException for invalid password', async () => {
      const loginDto = {
        email: 'test@example.com',
        password: 'wrongpassword',
      };

      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(mockUser as any);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('walletAuth', () => {
    it('should successfully authenticate with valid wallet signature', async () => {
      const walletAuthDto = {
        walletAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f1e2f0',
        message: 'Sign this message',
        signature: '0x...',
      };

      (ethers.verifyMessage as jest.Mock).mockReturnValue(
        walletAuthDto.walletAddress,
      );
      jest.spyOn(prisma.user, 'findFirst').mockResolvedValue(mockUser as any);
      jest.spyOn(prisma.user, 'update').mockResolvedValue(mockUser as any);
      jest.spyOn(jwtService, 'sign').mockReturnValue('token');

      const result = await service.walletAuth(walletAuthDto);

      expect(result.accessToken).toBeDefined();
      expect(result.refreshToken).toBeDefined();
      expect(result.user.walletAddress).toEqual(walletAuthDto.walletAddress);
    });

    it('should throw UnauthorizedException for invalid signature', async () => {
      const walletAuthDto = {
        walletAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f1e2f0',
        message: 'Sign this message',
        signature: '0x...',
      };

      (ethers.verifyMessage as jest.Mock).mockReturnValue(
        '0x0000000000000000000000000000000000000000',
      );

      await expect(service.walletAuth(walletAuthDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should create new user if wallet does not exist', async () => {
      const walletAuthDto = {
        walletAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f1e2f0',
        message: 'Sign this message',
        signature: '0x...',
      };

      (ethers.verifyMessage as jest.Mock).mockReturnValue(
        walletAuthDto.walletAddress,
      );
      jest.spyOn(prisma.user, 'findFirst').mockResolvedValue(null);
      jest.spyOn(prisma.user, 'create').mockResolvedValue(mockUser as any);
      jest.spyOn(prisma.user, 'update').mockResolvedValue(mockUser as any);
      jest.spyOn(jwtService, 'sign').mockReturnValue('token');

      const result = await service.walletAuth(walletAuthDto);

      expect(result.accessToken).toBeDefined();
      expect(prisma.user.create).toHaveBeenCalled();
    });
  });

  describe('refreshToken', () => {
    it('should successfully refresh access token', async () => {
      const refreshTokenDto = {
        refreshToken: 'valid-refresh-token',
      };

      const payload = {
        sub: '123',
        email: 'test@example.com',
        walletAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f1e2f0',
      };

      const userWithRefreshToken = {
        ...mockUser,
        refreshToken: 'valid-refresh-token',
      };

      jest.spyOn(jwtService, 'verify').mockReturnValue(payload as any);
      jest
        .spyOn(prisma.user, 'findUnique')
        .mockResolvedValue(userWithRefreshToken as any);
      jest.spyOn(prisma.user, 'update').mockResolvedValue(mockUser as any);
      jest.spyOn(jwtService, 'sign').mockReturnValue('new-token');

      const result = await service.refreshToken(refreshTokenDto);

      expect(result.accessToken).toBeDefined();
      expect(result.refreshToken).toBeDefined();
    });

    it('should throw UnauthorizedException for invalid refresh token', async () => {
      const refreshTokenDto = {
        refreshToken: 'invalid-refresh-token',
      };

      jest.spyOn(jwtService, 'verify').mockImplementation(() => {
        throw new Error('Invalid token');
      });

      await expect(service.refreshToken(refreshTokenDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('logout', () => {
    it('should successfully logout user', async () => {
      const mockToken = 'test-access-token';
      jest.spyOn(prisma.user, 'update').mockResolvedValue(mockUser as any);
      jest.spyOn(service['tokenBlacklistService'], 'add').mockResolvedValue(undefined);

      const result = await service.logout('123', mockToken);

      expect(result.message).toEqual('Logged out successfully');
      expect(service['tokenBlacklistService'].add).toHaveBeenCalledWith(mockToken);
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: '123' },
        data: { refreshToken: null },
      });
    });
  });

  describe('getCurrentUser', () => {
    it('should return current user', async () => {
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(mockUser as any);

      const result = await service.getCurrentUser('123');

      expect(result).toBeDefined();
      expect(result.email).toEqual(mockUser.email);
    });

    it('should throw UnauthorizedException if user not found', async () => {
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(null);

      await expect(service.getCurrentUser('123')).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});
