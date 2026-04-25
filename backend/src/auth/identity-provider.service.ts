import { Injectable } from '@nestjs/common';

export interface StellarAuthSession {
  userId: string;
  account: string;
  token: string;
  expiresAt: Date;
}

export interface IdentityProviderConfig {
  sep10Endpoint: string;
  sep24Endpoint: string;
  networkPassphrase: string;
}

@Injectable()
export class IdentityProviderService {
  private readonly config: IdentityProviderConfig;

  constructor(config?: Partial<IdentityProviderConfig>) {
    this.config = {
      sep10Endpoint: config?.sep10Endpoint ?? '/auth',
      sep24Endpoint: config?.sep24Endpoint ?? '/transactions/deposit',
      networkPassphrase: config?.networkPassphrase ?? 'Test SDF Network ; September 2015',
    };
  }

  buildSep10ChallengeUrl(account: string): string {
    return `${this.config.sep10Endpoint}?account=${encodeURIComponent(account)}`;
  }

  buildSep24DepositUrl(account: string, assetCode: string): string {
    return `${this.config.sep24Endpoint}?account=${encodeURIComponent(account)}&asset_code=${assetCode}`;
  }

  parseAuthToken(token: string): { account: string; expiresAt: Date } | null {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return null;
      const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf8'));
      return {
        account: payload.sub as string,
        expiresAt: new Date((payload.exp as number) * 1000),
      };
    } catch {
      return null;
    }
  }

  isSessionValid(session: StellarAuthSession): boolean {
    return session.expiresAt > new Date();
  }
}
