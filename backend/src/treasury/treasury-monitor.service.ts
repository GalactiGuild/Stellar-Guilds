import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MailerService } from '../mailer/mailer.service';
import { DEFAULT_GUILD_SETTINGS, GuildSettings } from '../guild/guild.settings';

export interface TreasuryBalance {
  xlm: number;
  usdc: number;
}

export interface LowBalanceAlert {
  guildId: string;
  guildName: string;
  currentBalance: TreasuryBalance;
  threshold: number;
  detectedAt: Date;
}

@Injectable()
export class TreasuryMonitorService {
  private readonly logger = new Logger(TreasuryMonitorService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly mailer: MailerService,
  ) {}

  /**
   * Mock implementation of on-chain balance checking.
   * In production, this would call the Stellar Horizon API.
   */
  async getTreasuryBalance(treasuryAddress: string | null): Promise<TreasuryBalance> {
    // Mock: return a random balance for testing purposes
    // In production, this would query the Stellar network
    if (!treasuryAddress) {
      return { xlm: 0, usdc: 0 };
    }

    // Simulate varying balances for demonstration
    // Use a deterministic hash of the address to get consistent mock values
    const hash = this.simpleHash(treasuryAddress);
    const xlm = (hash % 500) + 10; // 10-519 XLM
    const usdc = (hash % 200) + 5; // 5-204 USDC

    this.logger.debug(
      `Mock balance for ${treasuryAddress}: ${xlm} XLM, ${usdc} USDC`,
    );

    return { xlm, usdc };
  }

  /**
   * Simple hash function for generating deterministic mock balances
   */
  private simpleHash(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }

  /**
   * Check all guilds for low treasury balance and trigger alerts
   */
  async checkAllGuilds(): Promise<LowBalanceAlert[]> {
    this.logger.log('Starting treasury balance check for all guilds...');
    const alerts: LowBalanceAlert[] = [];

    // Fetch all active guilds with their settings
    const guilds = await this.prisma.guild.findMany({
      where: { isActive: true, deletedAt: null },
      include: {
        owner: true,
        memberships: {
          where: {
            role: { in: ['ADMIN', 'OWNER'] },
            status: 'APPROVED',
          },
          include: { user: true },
        },
      },
    });

    this.logger.log(`Found ${guilds.length} active guilds to check`);

    for (const guild of guilds) {
      try {
        const settings = this.parseGuildSettings(guild.settings);
        const alert = await this.checkGuildBalance(guild.id, guild.name, settings, guild.owner);

        if (alert) {
          alerts.push(alert);
          await this.triggerAlert(guild, alert, settings);
        }
      } catch (error) {
        this.logger.error(
          `Error checking treasury for guild ${guild.id}: ${error instanceof Error ? error.message : String(error)}`,
        );
      }
    }

    this.logger.log(
      `Treasury check complete. ${alerts.length} low balance alerts triggered.`,
    );
    return alerts;
  }

  /**
   * Check a single guild's balance against its threshold
   */
  async checkGuildBalance(
    guildId: string,
    guildName: string,
    settings: GuildSettings,
    owner: { id: string; email: string; username: string },
  ): Promise<LowBalanceAlert | null> {
    // Skip if alerts are disabled
    if (settings.lowBalanceAlertEnabled === false) {
      this.logger.debug(`Low balance alerts disabled for guild ${guildId}`);
      return null;
    }

    // Get threshold (default if not set)
    const threshold =
      settings.lowBalanceThreshold ?? DEFAULT_GUILD_SETTINGS.lowBalanceThreshold;

    // Get balance (mocked)
    const balance = await this.getTreasuryBalance(settings.treasuryAddress ?? null);

    // Check if balance is below threshold
    const totalBalance = balance.xlm + balance.usdc * 0.1; // Simplified: treat 1 USDC as 0.1 XLM equivalent
    
    this.logger.debug(
      `Guild ${guildId}: balance=${totalBalance.toFixed(2)} XLM equivalent, threshold=${threshold}`,
    );

    if (totalBalance < threshold) {
      return {
        guildId,
        guildName,
        currentBalance: balance,
        threshold,
        detectedAt: new Date(),
      };
    }

    return null;
  }

  /**
   * Parse guild settings from JSON, applying defaults
   */
  private parseGuildSettings(settingsJson: any): GuildSettings {
    if (!settingsJson || typeof settingsJson !== 'object') {
      return { ...DEFAULT_GUILD_SETTINGS };
    }
    return {
      ...DEFAULT_GUILD_SETTINGS,
      ...settingsJson,
    };
  }

  /**
   * Trigger alert: send email notification and create in-app notification
   */
  private async triggerAlert(
    guild: {
      id: string;
      name: string;
      ownerId: string;
      owner: { id: string; email: string; username: string };
      memberships: Array<{
        userId: string;
        user: { id: string; email: string; username: string };
      }>;
    },
    alert: LowBalanceAlert,
    settings: GuildSettings,
  ): Promise<void> {
    this.logger.warn(
      `LOW BALANCE ALERT: Guild "${alert.guildName}" (${alert.guildId}) has ` +
        `${alert.currentBalance.xlm} XLM / ${alert.currentBalance.usdc} USDC ` +
        `(threshold: ${alert.threshold} XLM)`,
    );

    // Collect all admin/owner emails for notification
    const adminEmails: string[] = [];
    const adminUserIds: string[] = [];

    // Add owner
    adminEmails.push(guild.owner.email);
    adminUserIds.push(guild.owner.id);

    // Add other admins
    for (const membership of guild.memberships) {
      if (membership.userId !== guild.owner.id) {
        adminEmails.push(membership.user.email);
        adminUserIds.push(membership.userId);
      }
    }

    // Send email alerts
    const emailSubject = `[Stellar Guilds] Low Treasury Balance Alert - ${alert.guildName}`;
    const emailBody = this.formatAlertEmail(alert);

    for (const email of adminEmails) {
      try {
        await this.mailer.sendTreasuryAlertEmail(email, alert.guildName, alert);
      } catch (error) {
        this.logger.error(
          `Failed to send treasury alert email to ${email}: ${error instanceof Error ? error.message : String(error)}`,
        );
      }
    }

    // Create in-app notifications for all admins
    for (const userId of adminUserIds) {
      try {
        await this.prisma.notification.create({
          data: {
            userId,
            message: `Low treasury balance warning for guild "${alert.guildName}": ` +
              `${alert.currentBalance.xlm} XLM / ${alert.currentBalance.usdc} USDC remaining ` +
              `(threshold: ${alert.threshold} XLM)`,
            type: 'TREASURY_LOW_BALANCE',
            metadata: {
              guildId: alert.guildId,
              guildName: alert.guildName,
              xlmBalance: alert.currentBalance.xlm,
              usdcBalance: alert.currentBalance.usdc,
              threshold: alert.threshold,
              detectedAt: alert.detectedAt.toISOString(),
            },
          },
        });
      } catch (error) {
        this.logger.error(
          `Failed to create notification for user ${userId}: ${error instanceof Error ? error.message : String(error)}`,
        );
      }
    }
  }

  /**
   * Format alert email content
   */
  private formatAlertEmail(alert: LowBalanceAlert): string {
    return `
Low Treasury Balance Alert

Guild: ${alert.guildName}
Current Balance:
  - XLM: ${alert.currentBalance.xlm}
  - USDC: ${alert.currentBalance.usdc}
Threshold: ${alert.threshold} XLM equivalent
Detected at: ${alert.detectedAt.toISOString()}

Your guild's treasury balance has fallen below the configured threshold.
Please consider depositing funds to ensure bounties and other guild operations can continue.

This is an automated alert from Stellar Guilds.
    `.trim();
  }
}
