import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { ReputationService } from '../reputation/reputation.service';
import { UpdateNotificationPreferencesDto } from './dto/notification-preferences.dto';

describe('UserController - Notification Preferences', () => {
  let controller: UserController;
  let userService: UserService;

  const mockUserService = {
    updateNotificationPreferences: jest.fn(),
    getNotificationPreferences: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: mockUserService,
        },
        {
          provide: ReputationService,
          useValue: {
            getReputationHistory: jest.fn(),
            addReputationPoints: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<UserController>(UserController);
    userService = module.get<UserService>(UserService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('PATCH /users/me/notifications', () => {
    it('should update notification preferences successfully', async () => {
      const request = { user: { userId: 'user-123' } };
      const updateDto: UpdateNotificationPreferencesDto = {
        emailOnBounty: false,
        weeklyDigest: false,
      };

      const mockResponse = {
        message: 'Notification preferences updated successfully',
        preferences: {
          emailOnBounty: false,
          emailOnMention: true,
          weeklyDigest: false,
        },
      };

      mockUserService.updateNotificationPreferences.mockResolvedValue(
        mockResponse,
      );

      const result = await controller.updateNotificationPreferences(
        request,
        updateDto,
      );

      expect(result).toEqual(mockResponse);
      expect(userService.updateNotificationPreferences).toHaveBeenCalledWith(
        'user-123',
        updateDto,
      );
    });
  });

  describe('GET /users/me/notifications', () => {
    it('should get notification preferences successfully', async () => {
      const request = { user: { userId: 'user-123' } };

      const mockResponse = {
        preferences: {
          emailOnBounty: true,
          emailOnMention: false,
          weeklyDigest: true,
        },
      };

      mockUserService.getNotificationPreferences.mockResolvedValue(
        mockResponse,
      );

      const result = await controller.getNotificationPreferences(request);

      expect(result).toEqual(mockResponse);
      expect(userService.getNotificationPreferences).toHaveBeenCalledWith(
        'user-123',
      );
    });
  });
});
