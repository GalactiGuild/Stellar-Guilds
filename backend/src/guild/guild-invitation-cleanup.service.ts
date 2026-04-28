import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class GuildInvitationCleanupService {
  private readonly logger = new Logger(GuildInvitationCleanupService.name);

  constructor(private prisma: PrismaService) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async cleanupExpiredInvitations(): Promise<void> {
    this.logger.log('Starting expired invitation cleanup job...');
    
    try {
      const now = new Date();
      
      // Find expired pending invitations
      const expiredInvitations = await this.prisma.guildMembership.findMany({
        where: {
          status: 'PENDING',
          invitationExpiresAt: {
            lt: now,
          },
          invitationToken: {
            not: null,
          },
        },
        select: {
          id: true,
          userId: true,
          guildId: true,
          invitationExpiresAt: true,
          user: {
            select: {
              id: true,
              username: true,
              email: true,
            },
          },
          guild: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      if (expiredInvitations.length === 0) {
        this.logger.log('No expired invitations found to clean up.');
        return;
      }

      // Delete expired invitations
      const deleteResult = await this.prisma.guildMembership.deleteMany({
        where: {
          id: {
            in: expiredInvitations.map((inv: any) => inv.id),
          },
        },
      });

      this.logger.log(
        `Successfully cleaned up ${deleteResult.count} expired guild invitations.`,
      );

      // Log details of cleaned invitations for audit purposes
      expiredInvitations.forEach((inv: any) => {
        this.logger.debug(
          `Deleted expired invitation for user ${inv.user?.username || inv.userId} to guild ${inv.guild?.name || inv.guildId} (expired: ${inv.invitationExpiresAt})`
        );
      });

    } catch (error) {
      this.logger.error(
        'Failed to cleanup expired invitations',
        error instanceof Error ? error.stack : String(error),
      );
    }
  }

  /**
   * Manual cleanup method for testing or immediate cleanup
   */
  async manualCleanup(): Promise<{ deletedCount: number }> {
    this.logger.log('Running manual expired invitation cleanup...');
    
    try {
      const now = new Date();
      
      const expiredInvitations = await this.prisma.guildMembership.findMany({
        where: {
          status: 'PENDING',
          invitationExpiresAt: {
            lt: now,
          },
          invitationToken: {
            not: null,
          },
        },
        select: { id: true },
      });

      if (expiredInvitations.length === 0) {
        return { deletedCount: 0 };
      }

      const deleteResult = await this.prisma.guildMembership.deleteMany({
        where: {
          id: {
            in: expiredInvitations.map((inv: any) => inv.id),
          },
        },
      });

      this.logger.log(
        `Manual cleanup completed: ${deleteResult.count} expired invitations removed.`,
      );

      return { deletedCount: deleteResult.count };
      
    } catch (error) {
      this.logger.error(
        'Manual cleanup failed',
        error instanceof Error ? error.stack : String(error),
      );
      throw error;
    }
  }
}
