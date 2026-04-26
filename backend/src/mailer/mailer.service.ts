import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MailerService {
  private transporter: nodemailer.Transporter | null = null;
  private readonly logger = new Logger(MailerService.name);

  constructor(private prisma: PrismaService) {
    const host = process.env.SMTP_HOST;
    const port = process.env.SMTP_PORT
      ? Number(process.env.SMTP_PORT)
      : undefined;
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;

    if (host && port) {
      this.transporter = nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: user && pass ? { user, pass } : undefined,
      });
    } else {
      this.logger.warn(
        'SMTP not configured — Mailer will log invites instead of sending',
      );
    }
  }

  /**
   * Check if user wants to receive a specific type of email notification
   */
  private async shouldSendEmail(
    userEmail: string,
    notificationType: 'emailOnBounty' | 'emailOnMention' | 'weeklyDigest',
  ): Promise<boolean> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { email: userEmail },
        select: { id: true, notificationSettings: true },
      });

      if (!user || !user.notificationSettings) {
        // Default to true if no settings exist
        return true;
      }

      const settings = user.notificationSettings;
      return settings[notificationType] !== false;
    } catch (error) {
      this.logger.error(
        `Failed to check notification preferences for ${userEmail}: ${error}`,
      );
      // Default to true on error to avoid blocking notifications
      return true;
    }
  }

  async sendInviteEmail(
    to: string,
    guildName: string,
    token: string,
    inviterEmail?: string,
  ) {
    const from =
      process.env.MAIL_FROM ||
      process.env.SMTP_USER ||
      'no-reply@stellar-guilds.local';
    const inviteUrl = `${process.env.FRONTEND_URL || 'https://app.stellar-guilds.local'}/invites/accept?token=${token}`;
    const subject = `You are invited to join ${guildName}`;
    const text = `You have been invited to join ${guildName}.
Click here to accept: ${inviteUrl}

If you weren't expecting this invite, ignore this message.`;

    if (this.transporter) {
      await this.transporter.sendMail({ from, to, subject, text });
      this.logger.log(`Invite email sent to ${to}`);
    } else {
      // Fallback: log the invite details for manual delivery
      this.logger.log(
        `Invite (not sent) -> to: ${to}, subject: ${subject}, token: ${token}`,
      );
    }
  }

  async sendRevokeEmail(to: string, guildName: string, inviterEmail?: string) {
    const from =
      process.env.MAIL_FROM ||
      process.env.SMTP_USER ||
      'no-reply@stellar-guilds.local';
    const subject = `Your invite to ${guildName} was revoked`;
    const text = `Your invite to ${guildName} has been revoked.`;
    if (this.transporter) {
      await this.transporter.sendMail({ from, to, subject, text });
      this.logger.log(`Revoke email sent to ${to}`);
    } else {
      this.logger.log(`Revoke (not sent) -> to: ${to}, subject: ${subject}`);
    }
  }

  /**
   * Send a reminder email for a bounty nearing expiration.
   * @param to - Recipient email address
   * @param bountyTitle - Title of the bounty
   * @param deadline - Expiration date/time of the bounty
   * @param bountyId - Unique identifier for the bounty
   */
  async sendBountyReminderEmail(
    to: string,
    bountyTitle: string,
    deadline: Date,
    bountyId: string,
  ): Promise<void> {
    // Check if user wants to receive bounty emails
    const shouldSend = await this.shouldSendEmail(to, 'emailOnBounty');
    if (!shouldSend) {
      this.logger.log(
        `Bounty reminder skipped for ${to} - user disabled emailOnBounty`,
      );
      return;
    }

    const from =
      process.env.MAIL_FROM ||
      process.env.SMTP_USER ||
      'no-reply@stellar-guilds.local';

    const formattedDeadline = deadline.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZoneName: 'short',
    });

    const subject = `Reminder: Bounty "${bountyTitle}" expires in 24 hours`;
    const text = `Hello,

This is a reminder that your bounty "${bountyTitle}" is set to expire on ${formattedDeadline}.

If you need to extend the deadline or review current submissions, please visit your guild dashboard before the bounty expires.

Bounty ID: ${bountyId}

Best regards,
Stellar Guilds Team`;

    if (this.transporter) {
      await this.transporter.sendMail({ from, to, subject, text });
      this.logger.log(`Bounty reminder sent to ${to} for bounty ${bountyId}`);
    } else {
      this.logger.log(
        `Bounty reminder (not sent) -> to: ${to}, bounty: "${bountyTitle}", deadline: ${formattedDeadline}`,
      );
    }
  }
}
