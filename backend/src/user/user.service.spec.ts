import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import { NotFoundException } from '@nestjs/common';

describe('UserService', () => {
  let service: UserService;
  let prisma: {
    user: {
      findUnique: jest.Mock;
      update: jest.Mock;
      findMany: jest.Mock;
      count: jest.Mock;
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
        findMany: jest.fn(),
        count: jest.fn(),
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
        technicalTags: ['rust'],
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
          technicalTags: true,
          discordHandle: true,
          twitterHandle: true,
          githubHandle: true,
          createdAt: true,
          role: true,
          _count: {
            select: {
              favoriteGuilds: true,
            },
          },
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

  describe('searchUsers', () => {
    it('filters users by tags using case-insensitive search', async () => {
      const mockUsers = [
        {
          id: 'user-1',
          username: 'rustacean',
          firstName: 'Rust',
          lastName: 'Dev',
          bio: 'Loves Rust',
          location: 'Remote',
          avatarUrl: null,
          profileBio: null,
          profileUrl: null,
          technicalTags: ['rust', 'solana'],
          discordHandle: null,
          twitterHandle: null,
          githubHandle: null,
          createdAt: new Date('2024-01-01'),
          role: 'USER',
        },
      ];

      prisma.user.findMany.mockResolvedValue(mockUsers);
      prisma.user.count.mockResolvedValue(1);

      const result = await service.searchUsers({
        tags: ['Rust'],
        skip: 0,
        take: 20,
      } as any);

      expect(prisma.user.findMany).toHaveBeenCalledWith({
        where: {
          technicalTags: { hasSome: ['rust'] },
        },
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
          technicalTags: true,
          discordHandle: true,
          twitterHandle: true,
          githubHandle: true,
          createdAt: true,
          role: true,
        },
        skip: 0,
        take: 20,
        orderBy: { createdAt: 'desc' },
      });
      expect(result.data).toEqual(mockUsers);
      expect(result.total).toBe(1);
    });
  });
});
