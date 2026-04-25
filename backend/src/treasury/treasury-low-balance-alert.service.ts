import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface LowBalanceAlert {
  guildId: string;
  guildName: string;
  currentBalance: number;
  threshold: number;
  deficit: number;
}

@Injectable()
export class TreasuryLowBalanceAlertService {
  private readonly DEFAULT_THRESHOLD = 100;

  constructor(private readonly prisma: PrismaService) {}

  async checkGuildTreasury(guildId: string, threshold?: number): Promise<LowBalanceAlert | null> {
    const guild = await this.prisma.guild.findUnique({
      where: { id: guildId },
      select: { id: true, name: true, treasuryBalance: true, lowBalanceThreshold: true },
    });
    if (!guild) return null;

    const limit = threshold ?? guild.lowBalanceThreshold ?? this.DEFAULT_THRESHOLD;
    const balance = guild.treasuryBalance ?? 0;

    if (balance < limit) {
      return {
        guildId: guild.id,
        guildName: guild.name,
        currentBalance: balance,
        threshold: limit,
        deficit: limit - balance,
      };
    }
    return null;
  }

  async scanAllGuilds(): Promise<LowBalanceAlert[]> {
    const guilds = await this.prisma.guild.findMany({ select: { id: true } });
    const alerts = await Promise.all(guilds.map((g: { id: string }) => this.checkGuildTreasury(g.id)));
    return alerts.filter((a): a is LowBalanceAlert => a !== null);
  }
}
