import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import { ProfileViewService } from './profile-view.service';
import { NotFoundException } from '@nestjs/common';

describe('UserService', () => {
  let service: UserService;
  let prisma: {
    user: {
      findUnique: jest.Mock;
      findMany: jest.Mock;
      count: jest.Mock;
      update: jest.Mock;
    };
  };
  let storageService: {
    uploadFile: jest.Mock;
    deleteFile: jest.Mock;
  };
  let profileViewService: {
    getViewCount: jest.Mock;
  };

  beforeEach(async () => {
    prisma = {
      user: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
        count: jest.fn(),
        update: jest.fn(),
      },
    };
    storageService = {
      uploadFile: jest.fn(),
      deleteFile: jest.fn(),
    };
    profileViewService = {
      getViewCount: jest.fn().mockResolvedValue(0),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        { provide: PrismaService, useValue: prisma },
        { provide: StorageService, useValue: storageService },
        { provide: ProfileViewService, useValue: profileViewService },
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
    expect(result.avatarUrl).toBe('http://localhost:3000/uploads/new-avatar.png');
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

      expect(result).toEqual({ ...mockUser, profileViewCount: 0 });
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
          createdAt: true,
          updatedAt: true,
          role: true,
        },
      });
      expect(result.bio).toBe('Updated bio');
    });
  });

  describe('searchUsers', () => {
    it('filters users by technical tags using hasSome', async () => {
      const mockUsers = [
        {
          id: 'user-1',
          username: 'rustdev',
          firstName: 'Alice',
          lastName: 'Smith',
          bio: null,
          location: null,
          avatarUrl: null,
          profileBio: null,
          profileUrl: null,
          discordHandle: null,
          twitterHandle: null,
          githubHandle: null,
          technicalTags: ['rust', 'wasm'],
          createdAt: new Date('2024-01-01'),
          role: 'USER',
        },
      ];
      prisma.user.findMany.mockResolvedValue(mockUsers);
      prisma.user.count.mockResolvedValue(1);

      const result = await service.searchUsers({ tags: ['rust'] });

      expect(prisma.user.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            technicalTags: { hasSome: ['rust'] },
          },
        }),
      );
      expect(result.data).toHaveLength(1);
      expect(result.data[0].technicalTags).toContain('rust');
      expect(result.total).toBe(1);
    });

    it('returns users matching any of the provided tags', async () => {
      prisma.user.findMany.mockResolvedValue([
        { id: 'user-1', username: 'dev1', technicalTags: ['rust'] },
        { id: 'user-2', username: 'dev2', technicalTags: ['nextjs'] },
      ]);
      prisma.user.count.mockResolvedValue(2);

      const result = await service.searchUsers({
        tags: ['rust', 'nextjs'],
      });

      expect(prisma.user.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            technicalTags: { hasSome: ['rust', 'nextjs'] },
          },
        }),
      );
      expect(result.total).toBe(2);
    });

    it('does not filter by tags when tags param is empty', async () => {
      prisma.user.findMany.mockResolvedValue([]);
      prisma.user.count.mockResolvedValue(0);

      await service.searchUsers({ tags: [] });

      expect(prisma.user.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {},
        }),
      );
    });

    it('does not filter by tags when tags param is undefined', async () => {
      prisma.user.findMany.mockResolvedValue([]);
      prisma.user.count.mockResolvedValue(0);

      await service.searchUsers({});

      expect(prisma.user.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {},
        }),
      );
    });

    it('combines tags filter with query filter', async () => {
      prisma.user.findMany.mockResolvedValue([]);
      prisma.user.count.mockResolvedValue(0);

      await service.searchUsers({ query: 'alice', tags: ['rust'] });

      expect(prisma.user.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: expect.any(Array),
            technicalTags: { hasSome: ['rust'] },
          }),
        }),
      );
    });
  });
});
