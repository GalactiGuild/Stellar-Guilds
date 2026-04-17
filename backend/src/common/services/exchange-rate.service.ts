import { Injectable } from '@nestjs/common';

/**
 * Mock Exchange Rate Service
 * In a real application, this would fetch historical prices from an API.
 * For this decoupled task, we use fixed mock exchange rates.
 */
@Injectable()
export class ExchangeRateService {
  // Mock exchange rates (token -> USD)
  private readonly mockExchangeRates: Record<string, number> = {
    XLM: 0.12, // 1 XLM = $0.12
    STELLAR: 0.12,
    USDC: 1.0, // 1 USDC = $1.00
    USDT: 1.0, // 1 USDT = $1.00
    BTC: 45000.0, // 1 BTC = $45,000
    ETH: 3000.0, // 1 ETH = $3,000
  };

  /**
   * Get the mock exchange rate for a token to USD
   * @param token The token symbol (e.g., 'XLM', 'USDC')
   * @returns The exchange rate (1 token = X USD)
   */
  getExchangeRate(token: string): number {
    return this.mockExchangeRates[token.toUpperCase()] ?? 1.0;
  }

  /**
   * Convert an amount from one token to USD
   * @param amount The amount in the source token
   * @param token The token symbol
   * @returns The equivalent amount in USD
   */
  convertToUSD(amount: number, token: string): number {
    const rate = this.getExchangeRate(token);
    return amount * rate;
  }

  /**
   * Get all available mock exchange rates
   * @returns A record of token symbols to their USD exchange rates
   */
  getAllRates(): Record<string, number> {
    return { ...this.mockExchangeRates };
  }

  /**
   * Add or update a mock exchange rate
   * @param token The token symbol
   * @param rate The USD exchange rate
   */
  setMockRate(token: string, rate: number): void {
    this.mockExchangeRates[token.toUpperCase()] = rate;
  }
}
