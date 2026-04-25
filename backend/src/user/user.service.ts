import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import {
  CreateUserDto,
  UpdateUserDto,
  ChangePasswordDto,
  SearchUserDto,
  AssignRoleDto,
  UserRole,
} from './dto/user.dto';
import { UpdateNotificationPreferencesDto } from './dto/notification-preferences.dto';
import * as bcrypt from 'bcrypt';
import { ProfileUtil } from '../common/utils/profile.util';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(
    private prisma: PrismaService,
    private storageService: StorageService,
  ) { }

  /**
   * Get user by ID with public profile information
   */
  async getUserProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
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
        _count: {
          select: {
            favoriteGuilds: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  /**
   * Get user details (sensitive info - admin/self only)
   */
  async getUserDetails(
    userId: string,
    requesterId: string,
    requesterRole: UserRole,
  ) {
    if (userId !== requesterId && requesterRole !== UserRole.ADMIN) {
      throw new ForbiddenException(
        'You do not have permission to view this user details',
      );
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
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
        walletAddress: true,
        role: true,
        isActive: true,
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            favoriteGuilds: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  /**
   * Update user profile
   */
  async updateUserProfile(userId: string, updateDto: UpdateUserDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: {
        ...(updateDto.firstName && { firstName: updateDto.firstName }),
        ...(updateDto.lastName && { lastName: updateDto.lastName }),
        ...(updateDto.bio !== undefined && { bio: updateDto.bio }),
        ...(updateDto.location !== undefined && {
          location: updateDto.location,
        }),
        ...(updateDto.profileBio !== undefined && {
          profileBio: updateDto.profileBio,
        }),
        ...(updateDto.profileUrl !== undefined && {
          profileUrl: updateDto.profileUrl,
        }),
        ...(updateDto.discordHandle !== undefined && {
          discordHandle: updateDto.discordHandle,
        }),
        ...(updateDto.twitterHandle !== undefined && {
          twitterHandle: updateDto.twitterHandle,
        }),
        ...(updateDto.githubHandle !== undefined && {
          githubHandle: updateDto.githubHandle,
        }),
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
        discordHandle: true,
        twitterHandle: true,
        githubHandle: true,
        createdAt: true,
        updatedAt: true,
        role: true,
        hasCompletionBonus: true,
        xp: true,
      },
    });

    // Check profile completeness and award XP bonus if applicable
    await this.checkAndAwardCompletionBonus(userId, updated);

    return updated;
  }

  /**
   * Check if user has completed their profile and award XP bonus
   */
  private async checkAndAwardCompletionBonus(userId: string, user: any) {
    // Skip if user already received the bonus
    if (user.hasCompletionBonus) {
      return;
    }

    // Calculate profile completeness
    const completeness = ProfileUtil.calculateCompleteness({
      firstName: user.firstName,
      lastName: user.lastName,
      bio: user.bio,
      location: user.location,
      profileBio: user.profileBio,
      profileUrl: user.profileUrl,
      discordHandle: user.discordHandle,
      twitterHandle: user.twitterHandle,
      githubHandle: user.githubHandle,
      avatarUrl: user.avatarUrl,
      backgroundCid: user.backgroundCid,
    });

    // Award 50 XP if profile is 100% complete
    if (completeness === 100) {
      this.logger.log(
        `User ${userId} achieved 100% profile completeness. Awarding 50 XP bonus.`,
      );

      await this.prisma.$transaction(async (tx: any) => {
        // Update user XP and mark bonus as received
        await tx.user.update({
          where: { id: userId },
          data: {
            xp: { increment: 50 },
            hasCompletionBonus: true,
          },
        });

        // Log the reward in reputation history (notifications table)
        await tx.notification.create({
          data: {
            userId,
            message:
              '🎉 Congratulations! You earned 50 XP for completing your profile!',
            type: 'PROFILE_COMPLETION_BONUS',
            metadata: {
              xpAwarded: 50,
              completeness,
            },
          },
        });
      });
    }
  }

  /**
   * Change user password
   */
  async changePassword(userId: string, changePasswordDto: ChangePasswordDto) {
    const { currentPassword, newPassword, confirmPassword } = changePasswordDto;

    // Validate password confirmation
    if (newPassword !== confirmPassword) {
      throw new BadRequestException('Passwords do not match');
    }

    // Prevent same password
    if (currentPassword === newPassword) {
      throw new BadRequestException(
        'New password must be different from current password',
      );
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(
      currentPassword,
      user.password,
    );
    if (!isPasswordValid) {
      throw new BadRequestException('Current password is incorrect');
    }

    // Hash and update new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await this.prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    return { message: 'Password changed successfully' };
  }

  /**
   * Add a guild to user's favorites
   */
  async addFavoriteGuild(userId: string, guildId: string) {
    const guild = await this.prisma.guild.findUnique({
      where: { id: guildId },
    });

    if (!guild) {
      throw new NotFoundException('Guild not found');
    }

    try {
      const favorite = await this.prisma.userFavoriteGuild.create({
        data: {
          userId,
          guildId,
        },
      });
      return favorite;
    } catch (err: any) {
      if (err.code === 'P2002') {
        throw new BadRequestException('Guild is already in your favorites');
      }
      throw err;
    }
  }

  /**
   * Remove a guild from user's favorites
   */
  async removeFavoriteGuild(userId: string, guildId: string) {
    try {
      await this.prisma.userFavoriteGuild.delete({
        where: {
          userId_guildId: {
            userId,
            guildId,
          },
        },
      });
      return { message: 'Removed from favorites' };
    } catch (err: any) {
      if (err.code === 'P2025') {
        throw new NotFoundException('Favorite not found');
      }
      throw err;
    }
  }

  /**
   * Update user avatar URL
   */
  async updateAvatar(
    userId: string,
    file: { buffer: Buffer; originalname: string },
  ) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const avatarUrl = await this.storageService.uploadFile(
      file.buffer,
      file.originalname,
    );

    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: { avatarUrl },
      select: {
        id: true,
        avatarUrl: true,
      },
    });

    if (user.avatarUrl) {
      try {
        await this.storageService.deleteFile(user.avatarUrl);
      } catch (error: any) {
        this.logger.warn(
          `Failed to delete previous avatar for user ${userId}: ${error?.message ?? 'unknown error'}`,
        );
      }
    }

    return updated;
  }

  /**
   * Update user background image CID
   */
  async updateBackground(userId: string, backgroundCid: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: { backgroundCid },
      select: {
        id: true,
        backgroundCid: true,
      },
    });

    return updated;
  }

  /**
   * Search and filter users (paginated)
   */
  async searchUsers(searchDto: SearchUserDto) {
    const { query, role, isActive, skip = 0, take = 20 } = searchDto;

    // Build where clause
    const where: any = {};

    if (query) {
      where.OR = [
        { username: { contains: query, mode: 'insensitive' } },
        { email: { contains: query, mode: 'insensitive' } },
        { firstName: { contains: query, mode: 'insensitive' } },
        { lastName: { contains: query, mode: 'insensitive' } },
      ];
    }

    if (role) {
      where.role = role;
    }

    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
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
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      data: users,
      total,
      skip,
      take,
    };
  }

  /**
   * Get users by role
   */
  async getUsersByRole(role: UserRole, skip = 0, take = 20) {
    const users = await this.prisma.user.findMany({
      where: { role },
      select: {
        id: true,
        username: true,
        firstName: true,
        lastName: true,
        bio: true,
        location: true,
        avatarUrl: true,
        createdAt: true,
        role: true,
      },
      skip,
      take,
      orderBy: { createdAt: 'desc' },
    });

    const total = await this.prisma.user.count({ where: { role } });

    return {
      data: users,
      total,
      skip,
      take,
    };
  }

  /**
   * Assign role to user (admin only)
   */
  async assignRole(userId: string, assignRoleDto: AssignRoleDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: { role: assignRoleDto.role },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
      },
    });

    return updated;
  }

  /**
   * GDPR-compliant profile deletion (soft-delete and scrubbing)
   */
  async deleteMe(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // 1. Scrub personal information
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        firstName: 'Deleted',
        lastName: 'User',
        username: `deleted_user_${userId.substring(0, 8)}`,
        email: `deleted_${userId}@stellar-guilds.local`, // Keep email unique but anonymized
        bio: null,
        avatarUrl: null,
        profileBio: null,
        profileUrl: null,
        discordHandle: null,
        twitterHandle: null,
        githubHandle: null,
        backgroundCid: null,
        isActive: false,
        deletedAt: new Date(),
        refreshToken: null, // Invalidate current session
      },
    });

    // 2. Remove all active API keys
    await this.prisma.apiKey.deleteMany({
      where: { userId },
    });

    return {
      message:
        'Your profile has been deleted and personal data has been scrubbed.',
    };
  }

  /**
   * Deactivate user account
   */
  async deactivateUser(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: { isActive: false },
    });

    return { message: 'User account deactivated successfully' };
  }

  /**
   * Reactivate user account
   */
  async reactivateUser(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: { isActive: true },
    });

    return { message: 'User account reactivated successfully' };
  }

  // Existing basic CRUD methods (kept for compatibility)
  async user(userWhereUniqueInput: any): Promise<any | null> {
    return this.prisma.user.findUnique({
      where: userWhereUniqueInput,
    });
  }

  async users(params: {
    skip?: number;
    take?: number;
    cursor?: any;
    where?: any;
    orderBy?: any;
  }): Promise<any[]> {
    const { skip, take, cursor, where, orderBy } = params;
    return this.prisma.user.findMany({
      skip,
      take,
      cursor,
      where,
      orderBy,
    });
  }

  async createUser(data: CreateUserDto): Promise<any> {
    return this.prisma.user.create({
      data,
    });
  }

  async updateUser(params: { where: any; data: any }): Promise<any> {
    const { where, data } = params;
    return this.prisma.user.update({
      data,
      where,
    });
  }

  async deleteUser(where: any): Promise<any> {
    return this.prisma.user.delete({
      where,
    });
  }

  /**
   * Update user notification preferences
   */
  async updateNotificationPreferences(
    userId: string,
    preferences: UpdateNotificationPreferencesDto,
  ) {
    // Get current user with notification settings
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { notificationSettings: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Parse existing settings or use defaults
    const currentSettings = (user.notificationSettings as any) || {
      emailOnBounty: true,
      emailOnMention: true,
      weeklyDigest: true,
    };

    // Merge with new preferences
    const updatedSettings = {
      ...currentSettings,
      ...preferences,
    };

    // Update user with new notification settings
    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: { notificationSettings: updatedSettings },
      select: {
        id: true,
        notificationSettings: true,
      },
    });

    this.logger.log(`User ${userId} updated notification preferences`);

    return {
      message: 'Notification preferences updated successfully',
      preferences: updatedSettings,
    };
  }

  /**
   * Get user notification preferences
   */
  async getNotificationPreferences(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { notificationSettings: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Return settings or defaults
    const settings = (user.notificationSettings as any) || {
      emailOnBounty: true,
      emailOnMention: true,
      weeklyDigest: true,
    };

    return { preferences: settings };
  }

  /**
   * Check if user wants to receive a specific type of email notification
   * This method is used by MailerService before sending emails
   */
  async shouldSendEmail(
    userId: string,
    notificationType: 'emailOnBounty' | 'emailOnMention' | 'weeklyDigest',
  ): Promise<boolean> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { notificationSettings: true },
      });

      if (!user || !user.notificationSettings) {
        // Default to true if no settings exist
        return true;
      }

      const settings = user.notificationSettings as any;
      return settings[notificationType] !== false;
    } catch (error) {
      this.logger.error(
        `Failed to check notification preferences for user ${userId}: ${error}`,
      );
      // Default to true on error to avoid blocking notifications
      return true;
    }
  }

  /**
   * Set default notification preferences for a new user
   */
  getDefaultNotificationSettings(): any {
    return {
      emailOnBounty: true,
      emailOnMention: true,
      weeklyDigest: true,
    };
  }
}
