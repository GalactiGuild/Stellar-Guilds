import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('UserService', () => {
  let service: UserService;
  let prisma: {
    user: {
      findUnique: jest.Mock;
      update: jest.Mock;
    };
  };
  let storageService: {
    uploadFile: jest.Mock;
    deleteFile: jest.Mock;
  };

  beforeEach(async () => {
    prisma = {
      user: {
        findUnique: jest.fn(),
        update: jest.fn(),
      },
    };
    storageService = {
      uploadFile: jest.fn(),
      deleteFile: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        { provide: PrismaService, useValue: prisma },
        { provide: StorageService, useValue: storageService },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('uploads avatar and replaces an existing stored file', async () => {
    prisma.user.findUnique.mockResolvedValue({
      id: 'user-1',
      avatarUrl: 'http://localhost:3000/uploads/old-avatar.png',
    });
    storageService.uploadFile.mockResolvedValue(
      'http://localhost:3000/uploads/new-avatar.png',
    );
    prisma.user.update.mockResolvedValue({
      id: 'user-1',
      avatarUrl: 'http://localhost:3000/uploads/new-avatar.png',
    });

    const result = await service.updateAvatar('user-1', {
      buffer: Buffer.from('avatar'),
      originalname: 'avatar.png',
    });

    expect(storageService.uploadFile).toHaveBeenCalledWith(
      expect.any(Buffer),
      'avatar.png',
    );
    expect(storageService.deleteFile).toHaveBeenCalledWith(
      'http://localhost:3000/uploads/old-avatar.png',
    );
    expect(result.avatarUrl).toBe(
      'http://localhost:3000/uploads/new-avatar.png',
    );
  });

  it('throws when updating avatar for a missing user', async () => {
    prisma.user.findUnique.mockResolvedValue(null);

    await expect(
      service.updateAvatar('missing-user', {
        buffer: Buffer.from('avatar'),
        originalname: 'avatar.png',
      }),
    ).rejects.toThrow(NotFoundException);
  });

  describe('getUserProfile', () => {
    it('returns user profile without sensitive fields', async () => {
      const mockUser = {
        id: 'user-1',
        username: 'johndoe',
        firstName: 'John',
        lastName: 'Doe',
        bio: 'Hello world',
        location: 'Lagos',
        avatarUrl: 'http://example.com/avatar.png',
        profileBio: 'Profile bio',
        profileUrl: 'http://example.com/profile',
        discordHandle: 'johndoe#1234',
        twitterHandle: '@johndoe',
        githubHandle: 'johndoe',
        createdAt: new Date('2024-01-01'),
        role: 'USER',
      };
      prisma.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.getUserProfile('user-1');

      expect(result).toEqual(mockUser);
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        select: {
          id: true,
          username: true,
          firstName: true,
          lastName: true,
          bio: true,
          location: true,
          avatarUrl: true,
          profileBio: true,
          profileUrl: true,
          discordHandle: true,
          twitterHandle: true,
          githubHandle: true,
          createdAt: true,
          role: true,
        },
      });
      // Ensure sensitive fields are not in the result
      expect(result).not.toHaveProperty('password');
      expect(result).not.toHaveProperty('email');
      expect(result).not.toHaveProperty('refreshToken');
      expect(result).not.toHaveProperty('walletAddress');
    });

    it('throws NotFoundException when user does not exist', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(service.getUserProfile('non-existent-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('updateUserProfile', () => {
    it('patches a single field without overwriting others', async () => {
      prisma.user.findUnique.mockResolvedValue({
        id: 'user-1',
        username: 'johndoe',
      });
      prisma.user.update.mockResolvedValue({
        id: 'user-1',
        username: 'johndoe',
        firstName: 'John',
        lastName: 'Doe',
        bio: 'Updated bio',
        location: 'Lagos',
        avatarUrl: null,
        profileBio: null,
        profileUrl: null,
        discordHandle: null,
        twitterHandle: '@johndoe',
        githubHandle: 'johndoe',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-02'),
        role: 'USER',
      });

      const result = await service.updateUserProfile('user-1', {
        bio: 'Updated bio',
      });

      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        data: { bio: 'Updated bio' },
        select: {
          id: true,
          username: true,
          firstName: true,
          lastName: true,
          bio: true,
          location: true,
          avatarUrl: true,
          profileBio: true,
          profileUrl: true,
          discordHandle: true,
          twitterHandle: true,
          githubHandle: true,
          hasCompletionBonus: true,
          xp: true,
          createdAt: true,
          updatedAt: true,
          role: true,
        },
      });
      expect(result.bio).toBe('Updated bio');
    });
  });

  describe('linkDiscord', () => {
    it('successfully links a Discord account to user', async () => {
      const mockCode = 'mock_oauth_code_12345';

      // No existing user with this Discord ID
      prisma.user.findUnique
        .mockResolvedValueOnce(null) // Check for existing Discord ID
        .mockResolvedValueOnce({ id: 'user-1', discordId: null }); // Current user

      prisma.user.update.mockResolvedValue({
        id: 'user-1',
        discordId: 'discord_12345',
        username: 'johndoe',
        walletAddress: '0x1234567890abcdef',
      });

      const result = await service.linkDiscord('user-1', { code: mockCode });

      expect(result.message).toBe(
        'Discord account successfully linked to your Stellar wallet',
      );
      expect(result.discordId).toBe('discord_12345');
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        data: { discordId: 'discord_12345' },
        select: {
          id: true,
          discordId: true,
          username: true,
          walletAddress: true,
        },
      });
    });

    it('throws BadRequestException if Discord ID is already linked to another user', async () => {
      const mockCode = 'mock_oauth_code_12345';

      // Another user already has this Discord ID
      prisma.user.findUnique
        .mockResolvedValueOnce({
          id: 'user-2',
          discordId: 'discord_12345',
        })
        .mockResolvedValueOnce({ id: 'user-1', discordId: null });

      await expect(
        service.linkDiscord('user-1', { code: mockCode }),
      ).rejects.toThrow(
        'This Discord account is already linked to another Stellar wallet',
      );
    });

    it('throws BadRequestException if user already has a different Discord ID linked', async () => {
      const mockCode = 'mock_oauth_code_67890';

      // No existing user with this new Discord ID
      prisma.user.findUnique
        .mockResolvedValueOnce(null) // Check for existing Discord ID
        .mockResolvedValueOnce({ id: 'user-1', discordId: 'discord_12345' }); // Current user with different Discord ID

      await expect(
        service.linkDiscord('user-1', { code: mockCode }),
      ).rejects.toThrow(BadRequestException);
    });

    it('throws NotFoundException if user does not exist', async () => {
      const mockCode = 'mock_oauth_code_12345';

      prisma.user.findUnique
        .mockResolvedValueOnce(null) // Check for existing Discord ID
        .mockResolvedValueOnce(null); // Current user not found

      await expect(
        service.linkDiscord('non-existent-user', { code: mockCode }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('unlinkDiscord', () => {
    it('successfully unlinks a Discord account from user', async () => {
      prisma.user.findUnique.mockResolvedValueOnce({
        id: 'user-1',
        discordId: 'discord_12345',
      });

      prisma.user.update.mockResolvedValue({
        id: 'user-1',
        discordId: null,
      });

      const result = await service.unlinkDiscord('user-1');

      expect(result.message).toBe(
        'Discord account successfully unlinked from your Stellar wallet',
      );
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        data: { discordId: null },
      });
    });

    it('throws BadRequestException if no Discord account is linked', async () => {
      prisma.user.findUnique.mockResolvedValueOnce({
        id: 'user-1',
        discordId: null,
      });

      await expect(service.unlinkDiscord('user-1')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('throws NotFoundException if user does not exist', async () => {
      prisma.user.findUnique.mockResolvedValueOnce(null);

      await expect(service.unlinkDiscord('non-existent-user')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getDiscordLinkStatus', () => {
    it('returns linked status when Discord ID is present', async () => {
      prisma.user.findUnique.mockResolvedValueOnce({
        id: 'user-1',
        discordId: 'discord_12345',
      });

      const result = await service.getDiscordLinkStatus('user-1');

      expect(result).toEqual({
        isLinked: true,
        discordId: 'discord_12345',
      });
    });

    it('returns unlinked status when Discord ID is null', async () => {
      prisma.user.findUnique.mockResolvedValueOnce({
        id: 'user-1',
        discordId: null,
      });

      const result = await service.getDiscordLinkStatus('user-1');

      expect(result).toEqual({
        isLinked: false,
        discordId: null,
      });
    });

    it('throws NotFoundException if user does not exist', async () => {
      prisma.user.findUnique.mockResolvedValueOnce(null);

      await expect(
        service.getDiscordLinkStatus('non-existent-user'),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
