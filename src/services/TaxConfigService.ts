import { TaxConfig } from '../models.js';

export class TaxConfigService {
  /**
   * Simulates fetching current tax rates and deductible categories.
   */
  public static async getTaxConfig(): Promise<TaxConfig> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          standardTaxRate: 0.08, // 8% estimated VAT or standard sales tax
          deductibleCategories: ['Charity', 'Business', 'Medical'],
        });
      }, 50);
    });
  }
}
