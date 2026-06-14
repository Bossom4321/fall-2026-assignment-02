import { ExchangeRates } from '../models.js';

export class ExchangeRateService {
  /**
   * Simulates fetching latest currency conversion rates relative to USD.
   */
  public static async getExchangeRates(): Promise<ExchangeRates> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          base: 'USD',
          rates: {
            EUR: 0.92,
            GBP: 0.79,
            JPY: 155.4,
            CAD: 1.36,
          },
        });
      }, 50);
    });
  }
}
