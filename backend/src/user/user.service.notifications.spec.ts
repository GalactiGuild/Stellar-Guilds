import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import { UpdateNotificationPreferencesDto } from './dto/notification-preferences.dto';
import { NotFoundException } from '@nestjs/common';

describe('UserService - Notification Preferences', () => {
  let service: UserService;
  let prisma: PrismaService;

  const mockUser = {
    id: 'user-123',
    email: 'test@example.com',
    username: 'testuser',
    notificationSettings: {
      emailOnBounty: true,
      emailOnMention: true,
      weeklyDigest: true,
    },
  };

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  };

  const mockStorageService = {};

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: StorageService,
          useValue: mockStorageService,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('updateNotificationPreferences', () => {
    it('should update notification preferences successfully', async () => {
      const updateDto: UpdateNotificationPreferencesDto = {
        emailOnBounty: false,
        weeklyDigest: false,
      };

      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.user.update.mockResolvedValue({
        id: mockUser.id,
        notificationSettings: {
          emailOnBounty: false,
          emailOnMention: true,
          weeklyDigest: false,
        },
      });

      const result = await service.updateNotificationPreferences(
        mockUser.id,
        updateDto,
      );

      expect(result.message).toEqual(
        'Notification preferences updated successfully',
      );
      expect(result.preferences.emailOnBounty).toBe(false);
      expect(result.preferences.emailOnMention).toBe(true);
      expect(result.preferences.weeklyDigest).toBe(false);
      expect(mockPrismaService.user.update).toHaveBeenCalledWith({
        where: { id: mockUser.id },
        data: {
          notificationSettings: {
            emailOnBounty: false,
            emailOnMention: true,
            weeklyDigest: false,
          },
        },
        select: {
          id: true,
          notificationSettings: true,
        },
      });
    });

    it('should throw NotFoundException if user not found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(
        service.updateNotificationPreferences('non-existent', {
          emailOnBounty: false,
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should use default settings if user has no notificationSettings', async () => {
      const userWithoutSettings = {
        ...mockUser,
        notificationSettings: null,
      };

      mockPrismaService.user.findUnique.mockResolvedValue(userWithoutSettings);
      mockPrismaService.user.update.mockResolvedValue({
        id: mockUser.id,
        notificationSettings: {
          emailOnBounty: false,
          emailOnMention: true,
          weeklyDigest: true,
        },
      });

      const result = await service.updateNotificationPreferences(mockUser.id, {
        emailOnBounty: false,
      });

      expect(result.preferences.emailOnMention).toBe(true);
      expect(result.preferences.weeklyDigest).toBe(true);
    });
  });

  describe('getNotificationPreferences', () => {
    it('should return user notification preferences', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.getNotificationPreferences(mockUser.id);

      expect(result.preferences).toEqual(mockUser.notificationSettings);
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: mockUser.id },
        select: { notificationSettings: true },
      });
    });

    it('should return default settings if user has no notificationSettings', async () => {
      const userWithoutSettings = {
        ...mockUser,
        notificationSettings: null,
      };

      mockPrismaService.user.findUnique.mockResolvedValue(userWithoutSettings);

      const result = await service.getNotificationPreferences(mockUser.id);

      expect(result.preferences).toEqual({
        emailOnBounty: true,
        emailOnMention: true,
        weeklyDigest: true,
      });
    });

    it('should throw NotFoundException if user not found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(
        service.getNotificationPreferences('non-existent'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('shouldSendEmail', () => {
    it('should return true if user has enabled the notification type', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.shouldSendEmail(
        mockUser.id,
        'emailOnBounty',
      );

      expect(result).toBe(true);
    });

    it('should return false if user has disabled the notification type', async () => {
      const userWithDisabledBounty = {
        ...mockUser,
        notificationSettings: {
          emailOnBounty: false,
          emailOnMention: true,
          weeklyDigest: true,
        },
      };

      mockPrismaService.user.findUnique.mockResolvedValue(
        userWithDisabledBounty,
      );

      const result = await service.shouldSendEmail(
        mockUser.id,
        'emailOnBounty',
      );

      expect(result).toBe(false);
    });

    it('should return true if user has no notificationSettings (default)', async () => {
      const userWithoutSettings = {
        ...mockUser,
        notificationSettings: null,
      };

      mockPrismaService.user.findUnique.mockResolvedValue(userWithoutSettings);

      const result = await service.shouldSendEmail(
        mockUser.id,
        'emailOnBounty',
      );

      expect(result).toBe(true);
    });

    it('should return true on error (graceful degradation)', async () => {
      mockPrismaService.user.findUnique.mockRejectedValue(
        new Error('Database error'),
      );

      const result = await service.shouldSendEmail(
        mockUser.id,
        'emailOnBounty',
      );

      expect(result).toBe(true);
    });
  });

  describe('getDefaultNotificationSettings', () => {
    it('should return default notification settings', () => {
      const settings = service.getDefaultNotificationSettings();

      expect(settings).toEqual({
        emailOnBounty: true,
        emailOnMention: true,
        weeklyDigest: true,
      });
    });
  });
});
