import { HistoricalAverages } from '../models.js';

export class HistoricalDataService {
  /**
   * Simulates fetching historical monthly averages for transaction categories.
   */
  public static async getHistoricalAverages(): Promise<HistoricalAverages> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          Rent: 1200.0,
          Food: 180.0,
          Utilities: 95.0,
          Entertainment: 160.0,
          Transport: 45.0,
          Shopping: 400.0,
          Business: 400.0,
          Charity: 150.0,
          Medical: 100.0,
        });
      }, 50);
    });
  }
}
