import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

interface PayoutRecord {
  id: string;
  guildId: string;
  recipient: string;
  amount: number;
  asset: string;
  convertedAmount?: number;
  convertedAsset?: string;
  createdAt: Date;
}

@Injectable()
export class GuildPayoutHistoryService {
  constructor(private readonly prisma: PrismaService) {}

  private convertAsset(amount: number, fromAsset: string, toAsset: string): { amount: number; asset: string } {
    const rates: Record<string, number> = { XLM: 1, USDC: 8.5, BTC: 0.000015 };
    const inXlm = amount / (rates[fromAsset] ?? 1);
    const converted = inXlm * (rates[toAsset] ?? 1);
    return { amount: parseFloat(converted.toFixed(6)), asset: toAsset };
  }

  async getGuildPayoutHistory(guildId: string, convertTo?: string): Promise<PayoutRecord[]> {
    const payouts = await this.prisma.guildPayout.findMany({
      where: { guildId },
      orderBy: { createdAt: 'desc' },
    });

    return payouts.map(p => {
      const record: PayoutRecord = {
        id: p.id,
        guildId: p.guildId,
        recipient: p.recipientId,
        amount: p.amount,
        asset: p.asset,
        createdAt: p.createdAt,
      };
      if (convertTo && convertTo !== p.asset) {
        const converted = this.convertAsset(p.amount, p.asset, convertTo);
        record.convertedAmount = converted.amount;
        record.convertedAsset = converted.asset;
      }
      return record;
    });
  }
}
