import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import { NotFoundException } from '@nestjs/common';

describe('UserService (GDPR Deletion)', () => {
  let service: UserService;
  let prisma: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: PrismaService,
          useValue: {
            user: {
              findUnique: jest.fn(),
              update: jest.fn(),
            },
            apiKey: {
              deleteMany: jest.fn(),
            },
          },
        },
        { provide: StorageService, useValue: {} },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    prisma = module.get(PrismaService);
  });

  it('should scrub all personal data and soft-delete user', async () => {
    const userId = 'user-123';
    prisma.user.findUnique.mockResolvedValue({
      id: userId,
      email: 'test@example.com',
    });

    await service.deleteMe(userId);

    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: userId },
      data: expect.objectContaining({
        firstName: 'Deleted',
        lastName: 'User',
        bio: null,
        avatarUrl: null,
        profileBio: null,
        profileUrl: null,
        discordHandle: null,
        twitterHandle: null,
        githubHandle: null,
        backgroundCid: null,
        isActive: false,
        refreshToken: null,
      }),
    });

    expect(prisma.user.update.mock.calls[0][0].data.deletedAt).toBeInstanceOf(
      Date,
    );
    expect(prisma.user.update.mock.calls[0][0].data.username).toContain(
      'deleted_user_',
    );
    expect(prisma.apiKey.deleteMany).toHaveBeenCalledWith({
      where: { userId },
    });
  });

  it('should throw NotFoundException if user is missing', async () => {
    prisma.user.findUnique.mockResolvedValue(null);
    await expect(service.deleteMe('gone')).rejects.toThrow(NotFoundException);
  });
});
