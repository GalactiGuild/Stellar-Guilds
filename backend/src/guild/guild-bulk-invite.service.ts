import { Injectable, Logger } from '@nestjs/common';
import { parse } from 'csv-parse/sync';
import { PrismaService } from '../prisma/prisma.service';
import { randomUUID } from 'crypto';

export interface BulkInviteResult {
  invited: number;
  skipped: number;
  summary: string;
  details: {
    invited: string[];
    skipped: { address: string; reason: string }[];
  };
}

/**
 * Validates a Stellar wallet address.
 * Stellar addresses start with G and are 56 characters long.
 */
function isValidStellarAddress(address: string): boolean {
  return /^G[A-Z0-9]{55}$/.test(address.trim());
}

@Injectable()
export class GuildBulkInviteService {
  private readonly logger = new Logger(GuildBulkInviteService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Parse a CSV buffer and extract wallet addresses.
   * Accepts single-column CSVs or CSVs with a "address" or "wallet" header.
   */
  parseAddresses(csvBuffer: Buffer): string[] {
    const records = parse(csvBuffer, {
      skip_empty_lines: true,
      trim: true,
      relax_column_count: true,
    }) as string[][];

    const addresses: string[] = [];

    for (const row of records) {
      const value = row[0]?.trim();
      if (!value) continue;

      // Skip header row
      if (
        value.toLowerCase() === 'address' ||
        value.toLowerCase() === 'wallet' ||
        value.toLowerCase() === 'wallet_address'
      ) {
        continue;
      }

      addresses.push(value);
    }

    return addresses;
  }

  /**
   * Process bulk invitations for a guild from a CSV file.
   * Validates each address, skips duplicates and invalid entries,
   * creates GuildMembership records for valid addresses.
   */
  async processBulkInvite(
    guildId: string,
    invitedById: string,
    csvBuffer: Buffer,
  ): Promise<BulkInviteResult> {
    const addresses = this.parseAddresses(csvBuffer);

    const invited: string[] = [];
    const skipped: { address: string; reason: string }[] = [];

    const ttlDays = process.env.INVITE_TTL_DAYS
      ? Number(process.env.INVITE_TTL_DAYS)
      : 7;
    const expiresAt = new Date(Date.now() + ttlDays * 24 * 60 * 60 * 1000);

    for (const address of addresses) {
      // Validate address format first — before any DB operations
      if (!isValidStellarAddress(address)) {
        skipped.push({ address, reason: 'Invalid Stellar address format' });
        this.logger.warn(`Skipping invalid address: ${address}`);
        continue;
      }

      try {
        // Find user by wallet address
        const user = await this.prisma.user.findFirst({
          where: { walletAddress: address },
        });

        if (!user) {
          skipped.push({ address, reason: 'No user found with this wallet address' });
          continue;
        }

        // Check if already a member or invited
        const existing = await this.prisma.guildMembership.findUnique({
          where: {
            userId_guildId: { userId: user.id, guildId },
          },
        });

        if (existing) {
          skipped.push({ address, reason: 'Already a member or invited' });
          continue;
        }

        // Create the invitation record
        await this.prisma.guildMembership.create({
          data: {
            userId: user.id,
            guildId,
            role: 'MEMBER',
            status: 'PENDING',
            invitationToken: randomUUID(),
            invitedById,
            invitationExpiresAt: expiresAt,
          },
        });

        invited.push(address);
        this.logger.log(`Invited user with wallet: ${address}`);
      } catch (error) {
        skipped.push({ address, reason: 'Database error' });
        this.logger.error(`Failed to invite ${address}:`, error);
      }
    }

    const summary = `Invited ${invited.length} users, ${skipped.length} invalid addresses skipped`;

    return {
      invited: invited.length,
      skipped: skipped.length,
      summary,
      details: { invited, skipped },
    };
  }
}